const THEME_STORAGE_KEY = 'lydiarx-theme';
const DEV_MODE_STORAGE_KEY = 'lydiarx-dev-mode';
const STORAGE_CONSENT_KEY = 'lydiarx-storage-consent';
const STORAGE_PROBE_KEY = '__lydiarx-storage-probe__';
const FUSION_THEME = 'fusion';
const INSPIRATION_THEME = 'inspiration';
const DEFAULT_THEME = 'default';
const DEFAULT_DEV_MODE = true;
const CONSENT_ACCEPTED = 'accepted';
const CONSENT_DECLINED = 'declined';
const REVIEW_THEMES = new Set([FUSION_THEME, INSPIRATION_THEME]);
const VALID_THEMES = new Set([DEFAULT_THEME, ...REVIEW_THEMES]);
const INSPIRATION_SCENE_NAME = 'helix';
const INSPIRATION_RUN_SALT = (() => {
  try {
    const value = new Uint32Array(1);
    window.crypto.getRandomValues(value);
    return value[0];
  } catch (error) {
    return Math.floor(Math.random() * 4294967295);
  }
})();
let storageSupport;
let transientDevMode = null;

function hasStorageSupport() {
  if (storageSupport !== undefined) {
    return storageSupport;
  }

  try {
    localStorage.setItem(STORAGE_PROBE_KEY, '1');
    localStorage.removeItem(STORAGE_PROBE_KEY);
    storageSupport = true;
  } catch (error) {
    storageSupport = false;
  }

  return storageSupport;
}

function readStorage(key) {
  if (!hasStorageSupport()) {
    return null;
  }

  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function writeStorage(key, value) {
  if (!hasStorageSupport()) {
    return false;
  }

  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    return false;
  }
}

function removeStorage(key) {
  if (!hasStorageSupport()) {
    return false;
  }

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    return false;
  }
}

function getCurrentTheme() {
  const theme = document.documentElement.dataset.theme;
  return VALID_THEMES.has(theme) ? theme : DEFAULT_THEME;
}

function syncBodyTheme() {
  if (document.body) {
    document.body.dataset.theme = getCurrentTheme();
  }
}

function hasDevMode() {
  if (typeof transientDevMode === 'boolean') {
    return transientDevMode;
  }

  const storedValue = readStorage(DEV_MODE_STORAGE_KEY);
  if (storedValue === 'true') {
    return true;
  }

  if (storedValue === 'false') {
    return false;
  }

  return DEFAULT_DEV_MODE;
}

function getStorageConsent() {
  const consent = readStorage(STORAGE_CONSENT_KEY);
  return consent === CONSENT_ACCEPTED || consent === CONSENT_DECLINED ? consent : null;
}

function applyTheme(theme, options = {}) {
  const { persist = false } = options;
  const resolvedTheme = VALID_THEMES.has(theme) ? theme : DEFAULT_THEME;
  document.documentElement.dataset.theme = resolvedTheme;
  window.__mermaidTheme = resolvedTheme === FUSION_THEME ? 'dark' : 'neutral';
  syncBodyTheme();

  if (persist) {
    if (resolvedTheme === DEFAULT_THEME) {
      removeStorage(THEME_STORAGE_KEY);
    } else {
      writeStorage(THEME_STORAGE_KEY, resolvedTheme);
    }
  }

  return resolvedTheme;
}

function updateFloatingUiOffset(hasBanner) {
  if (document.body) {
    document.body.classList.toggle('has-storage-banner', hasBanner);
  }
}

function renderThemeWidget() {
  const existingWidget = document.querySelector('[data-theme-widget]');
  if (!document.body || !hasDevMode()) {
    existingWidget?.remove();
    return;
  }

  const currentTheme = getCurrentTheme();
  const widget =
    existingWidget ||
    document.body.appendChild(document.createElement('aside'));

  widget.className = 'theme-widget';
  widget.dataset.themeWidget = 'true';
  widget.setAttribute('aria-label', 'Developer theme picker');
  widget.innerHTML = `
    <p class="theme-widget__label">Dev preview</p>
    <div class="theme-widget__options" role="group" aria-label="Theme choices">
      <button
        class="theme-widget__choice"
        type="button"
        data-theme-choice="${DEFAULT_THEME}"
        aria-pressed="${currentTheme === DEFAULT_THEME}"
      >
        Default
      </button>
      <button
        class="theme-widget__choice"
        type="button"
        data-theme-choice="${FUSION_THEME}"
        aria-pressed="${currentTheme === FUSION_THEME}"
      >
        Fusion
      </button>
      <button
        class="theme-widget__choice"
        type="button"
        data-theme-choice="${INSPIRATION_THEME}"
        aria-pressed="${currentTheme === INSPIRATION_THEME}"
      >
        Inspiration
      </button>
    </div>
    <button class="theme-widget__disable" type="button" data-disable-dev>
      Hide
    </button>
  `;

  for (const button of widget.querySelectorAll('[data-theme-choice]')) {
    button.addEventListener('click', () => {
      const selectedTheme = button.dataset.themeChoice;
      if (!selectedTheme || selectedTheme === getCurrentTheme()) {
        return;
      }
      applyTheme(selectedTheme, { persist: true });
      window.location.reload();
    });
  }

  widget.querySelector('[data-disable-dev]')?.addEventListener('click', () => {
    transientDevMode = false;
    writeStorage(DEV_MODE_STORAGE_KEY, 'false');
    removeStorage(THEME_STORAGE_KEY);
    applyTheme(DEFAULT_THEME);
    renderThemeWidget();
    window.location.reload();
  });
}

function renderStorageBanner() {
  const existingBanner = document.querySelector('[data-storage-banner]');
  const consent = getStorageConsent();
  if (!document.body || !hasStorageSupport() || consent) {
    existingBanner?.remove();
    updateFloatingUiOffset(false);
    return;
  }

  const banner =
    existingBanner ||
    document.body.appendChild(document.createElement('section'));

  banner.className = 'storage-banner';
  banner.dataset.storageBanner = 'true';
  banner.setAttribute('aria-label', 'Browser storage preference');
  banner.innerHTML = `
    <div class="storage-banner__content">
      <p>
        This site stores theme and preview preferences in your browser so the selected
        presentation can follow you across pages.
      </p>
      <div class="storage-banner__actions">
        <button class="storage-banner__button storage-banner__button--secondary" type="button" data-storage-decline>
          Decline
        </button>
        <button class="storage-banner__button storage-banner__button--primary" type="button" data-storage-accept>
          Accept
        </button>
      </div>
    </div>
  `;

  updateFloatingUiOffset(true);

  banner.querySelector('[data-storage-accept]')?.addEventListener('click', () => {
    writeStorage(STORAGE_CONSENT_KEY, CONSENT_ACCEPTED);
    renderStorageBanner();
  });

  banner.querySelector('[data-storage-decline]')?.addEventListener('click', () => {
    writeStorage(STORAGE_CONSENT_KEY, CONSENT_DECLINED);
    writeStorage(DEV_MODE_STORAGE_KEY, 'false');
    removeStorage(THEME_STORAGE_KEY);
    applyTheme(DEFAULT_THEME);
    renderThemeWidget();
    renderStorageBanner();
    window.location.reload();
  });
}

async function loadPartial(target) {
  const includePath = target.dataset.include;
  const response = await fetch(includePath);
  if (!response.ok) {
    throw new Error(`Failed to load partial ${includePath}: ${response.status}`);
  }

  target.outerHTML = await response.text();
}

function getGroupPages(group) {
  return (group.dataset.groupPages || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

function activateCurrentPage() {
  const currentPage = document.body.dataset.page;
  if (!currentPage) {
    return;
  }

  for (const link of document.querySelectorAll('[data-page-link]')) {
    if (link.dataset.pageLink === currentPage) {
      link.setAttribute('aria-current', 'page');
    }
  }

  for (const group of document.querySelectorAll('.nav-group[data-group-pages]')) {
    const isActive = getGroupPages(group).includes(currentPage);
    group.classList.toggle('is-active', isActive);
  }
}

function initializeNavigation() {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const navPanel = document.querySelector('[data-nav-panel]');
  if (!navToggle || !navPanel) {
    return;
  }

  const groups = [...document.querySelectorAll('.nav-group')];
  const isMobileViewport = () => window.matchMedia('(max-width: 980px)').matches;

  function closeNav() {
    navToggle.setAttribute('aria-expanded', 'false');
    navPanel.classList.remove('is-open');
  }

  function closeOtherGroups(currentGroup = null) {
    for (const group of groups) {
      if (group !== currentGroup) {
        group.removeAttribute('open');
      }
    }
  }

  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navPanel.classList.toggle('is-open', !expanded);
    if (expanded) {
      closeOtherGroups();
    }
  });

  for (const group of groups) {
    const summary = group.querySelector('summary');
    if (!summary) {
      continue;
    }

    summary.addEventListener('click', () => {
      if (!isMobileViewport()) {
        window.setTimeout(() => {
          if (group.hasAttribute('open')) {
            closeOtherGroups(group);
          }
        }, 0);
      }
    });
  }

  document.addEventListener('click', (event) => {
    if (!navPanel.contains(event.target) && !navToggle.contains(event.target)) {
      closeOtherGroups();
      closeNav();
    }
  });

  for (const link of navPanel.querySelectorAll('a')) {
    link.addEventListener('click', () => {
      closeOtherGroups();
      closeNav();
    });
  }

  window.addEventListener('resize', () => {
    if (!isMobileViewport()) {
      closeNav();
    }
  });
}

function initializeBreadcrumbs() {
  for (const breadcrumb of document.querySelectorAll('.page-shell > .breadcrumb')) {
    const nextFloor = breadcrumb.nextElementSibling;
    if (
      !nextFloor ||
      !(nextFloor.classList.contains('page-hero') || nextFloor.classList.contains('hero'))
    ) {
      continue;
    }

    nextFloor.prepend(breadcrumb);
  }
}

function initializeDialogs() {
  for (const trigger of document.querySelectorAll('[data-dialog-open]')) {
    const dialogId = trigger.getAttribute('data-dialog-open');
    const dialog = dialogId ? document.getElementById(dialogId) : null;
    if (!dialog || dialog.tagName !== 'DIALOG' || typeof dialog.showModal !== 'function') {
      continue;
    }

    trigger.addEventListener('click', () => {
      dialog.__triggerElement = trigger;
      dialog.showModal();
    });
  }

  for (const dialog of document.querySelectorAll('dialog[data-spotlight-dialog]')) {
    if (typeof dialog.showModal !== 'function') {
      continue;
    }

    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) {
        dialog.close();
      }
    });

    dialog.addEventListener('close', () => {
      if (dialog.__triggerElement instanceof HTMLElement) {
        dialog.__triggerElement.focus();
      }
      dialog.__triggerElement = null;
    });

    for (const button of dialog.querySelectorAll('[data-dialog-close]')) {
      button.addEventListener('click', () => {
        dialog.close();
      });
    }
  }
}

let inspirationBackgroundState = null;

const INSPIRATION_SCENE_LIBRARY = {
  helix: { build: buildHelixScene, draw: drawHelixScene }
};

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createSeededRandom(seed) {
  let value = seed % 2147483647;
  if (value <= 0) {
    value += 2147483646;
  }

  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function pickSceneColor(random, alphaBase = 0.58, alphaRange = 0.18) {
  const alpha = alphaBase + random() * alphaRange;
  const palette = [
    [29, 107, 108],
    [237, 147, 102],
    [106, 180, 164],
    [228, 96, 126],
    [214, 176, 101]
  ];
  const [red, green, blue] = palette[Math.floor(random() * palette.length) % palette.length];
  return `rgba(${red}, ${green}, ${blue}, ${alpha.toFixed(3)})`;
}

function getBodyPageId() {
  return document.body?.dataset.page || 'default';
}

function getCurrentPageKey() {
  const basename = window.location.pathname.split('/').pop() || '';
  if (basename) {
    return basename;
  }
  return getBodyPageId();
}

function getInspirationFloorTargets() {
  const pageId = getCurrentPageKey();
  const heroFloor = document.querySelector('.page-shell > .hero, .page-shell > .page-hero');
  const whiteFloors = [...document.querySelectorAll('.page-shell > .section:nth-of-type(4n + 3)')];
  const targets = [];

  if (heroFloor) {
    targets.push({
      element: heroFloor,
      role: 'hero',
      pageId,
      floorIndex: 0,
      sceneName: INSPIRATION_SCENE_NAME
    });
  }

  whiteFloors.forEach((element, whiteIndex) => {
    targets.push({
      element,
      role: 'white',
      pageId,
      floorIndex: whiteIndex + 1,
      sceneName: INSPIRATION_SCENE_NAME
    });
  });

  return targets;
}

function drawDot(ctx, x, y, size, color) {
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawGlow(ctx, x, y, radius, stops) {
  const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
  for (const [offset, color] of stops) {
    glow.addColorStop(offset, color);
  }
  ctx.fillStyle = glow;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

function drawConnections(ctx, points, maxDistance, baseOpacity, tint) {
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];

    for (let nextIndex = index + 1; nextIndex < points.length; nextIndex += 1) {
      const next = points[nextIndex];
      const distance = Math.hypot(current.x - next.x, current.y - next.y);
      if (distance > maxDistance) {
        continue;
      }

      const alpha = Math.max(0.018, baseOpacity * (1 - distance / maxDistance));
      ctx.beginPath();
      ctx.moveTo(current.x, current.y);
      ctx.lineTo(next.x, next.y);
      ctx.strokeStyle = `${tint}${alpha.toFixed(3)})`;
      ctx.lineWidth = 0.9;
      ctx.stroke();
    }
  }
}

function getSceneRegion(floor) {
  return {
    x: 0,
    y: 0,
    width: floor.canvasLogicalWidth,
    height: floor.canvasLogicalHeight,
    centerX: floor.visibleX + floor.visibleWidth * 0.58,
    centerY: floor.visibleY + floor.visibleHeight * 0.5
  };
}

function getSceneActivityBand(floor) {
  const startX = floor.visibleX + floor.visibleWidth * 0.08;
  const endX = floor.visibleX + floor.visibleWidth * 1.02;
  return {
    startX,
    endX,
    width: endX - startX,
    centerX: startX + (endX - startX) * 0.5
  };
}

function rotatePoint(x, y, angle) {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  return {
    x: x * cosine - y * sine,
    y: x * sine + y * cosine
  };
}

function wrapRange(value, minimum, maximum) {
  const span = maximum - minimum;
  if (span <= 0) {
    return minimum;
  }

  let wrapped = (value - minimum) % span;
  if (wrapped < 0) {
    wrapped += span;
  }
  return minimum + wrapped;
}

function pickSceneSpeed(random, center = 0.00013, spread = 0.000025) {
  return Math.max(0.00008, center + (random() - 0.5) * spread * 2);
}

function buildAmbientParticles(floor, random, count, options = {}) {
  const region = getSceneRegion(floor);
  const band = getSceneActivityBand(floor);
  const minX = band.startX + band.width * (options.minXRatio ?? 0);
  const maxX = band.startX + band.width * (options.maxXRatio ?? 1);
  const topRatio = options.topRatio ?? 0.1;
  const bottomRatio = options.bottomRatio ?? 0.9;
  const minDriftX = options.minDriftX ?? 16;
  const maxDriftX = options.maxDriftX ?? 42;
  const minDriftY = options.minDriftY ?? 12;
  const maxDriftY = options.maxDriftY ?? 30;
  const speedCenter = options.speedCenter ?? 0.00022;
  const speedSpread = options.speedSpread ?? 0.00005;
  const flowScaleX = options.flowScaleX ?? 1;
  const flowScaleY = options.flowScaleY ?? 1;
  const minSize = options.minSize ?? 1.1;
  const maxSize = options.maxSize ?? 3.2;
  const minY = region.y + region.height * topRatio;
  const maxY = region.y + region.height * bottomRatio;
  const rangeX = Math.max(1, maxX - minX);
  const rangeY = Math.max(1, maxY - minY);

  return Array.from({ length: count }, () => ({
    baseX: minX + random() * Math.max(1, maxX - minX),
    baseY: minY + random() * rangeY,
    driftX: minDriftX + random() * (maxDriftX - minDriftX),
    driftY: minDriftY + random() * (maxDriftY - minDriftY),
    speed: pickSceneSpeed(random, speedCenter, speedSpread),
    phase: random() * Math.PI * 2,
    size: minSize + random() * (maxSize - minSize),
    depth: 0.72 + random() * 0.64,
    flowX: (random() - 0.5) * rangeX * (0.04 + random() * 0.03) * flowScaleX,
    flowY: (random() - 0.5) * rangeY * (0.06 + random() * 0.04) * flowScaleY,
    minX,
    maxX,
    minY,
    maxY,
    color: pickSceneColor(random, 0.56, 0.16),
    trailColor: pickSceneColor(random, 0.16, 0.08)
  }));
}

function projectAmbientParticles(particles, time) {
  return particles.map((particle) => {
    const sway = time * particle.speed + particle.phase;
    const travel = sway / (Math.PI * 2);
    const x = wrapRange(
      particle.baseX +
        particle.flowX * travel +
        Math.sin(sway) * particle.driftX +
        Math.sin(sway * 2.2 + particle.phase * 0.7) * particle.driftX * 0.34,
      particle.minX - particle.driftX * 2.2,
      particle.maxX + particle.driftX * 2.2
    );
    const y = wrapRange(
      particle.baseY +
        particle.flowY * travel +
        Math.cos(sway * 1.34) * particle.driftY +
        Math.sin(sway * 1.78 + particle.phase) * particle.driftY * 0.26,
      particle.minY - particle.driftY * 2.8,
      particle.maxY + particle.driftY * 2.8
    );
    const vx =
      particle.flowX * particle.speed * 1.6 +
      Math.cos(sway) * particle.driftX * 0.42 +
      Math.cos(sway * 2.2 + particle.phase * 0.7) * particle.driftX * 0.14;
    const vy =
      particle.flowY * particle.speed * 1.6 +
      -Math.sin(sway * 1.34) * particle.driftY * 0.4 +
      Math.cos(sway * 1.78 + particle.phase) * particle.driftY * 0.14;
    const depth = particle.depth + Math.sin(sway * 0.7 + particle.phase) * 0.08;

    return {
      x,
      y,
      vx,
      vy,
      size: particle.size * (0.78 + depth * 0.34),
      depth,
      opacity: 0.38 + depth * 0.32,
      glowAlpha: 0.08 + depth * 0.06,
      color: particle.color,
      trailColor: particle.trailColor
    };
  });
}

function drawParticleSwarm(ctx, particles, options = {}) {
  const trailScale = options.trailScale ?? 0.16;
  const trailWidthFactor = options.trailWidthFactor ?? 0.58;
  const connectDistance = options.connectDistance ?? 0;
  const connectOpacity = options.connectOpacity ?? 0.06;
  const connectTint = options.connectTint ?? 'rgba(95, 131, 125, ';

  if (connectDistance > 0) {
    drawConnections(ctx, particles, connectDistance, connectOpacity, connectTint);
  }

  for (const particle of particles) {
    const opacity = clamp(particle.opacity ?? 0.7, 0.18, 1);
    const depth = clamp(particle.depth ?? 0.92, 0.4, 1.6);
    const glowAlpha = particle.glowAlpha ?? (0.08 + depth * 0.04);
    ctx.globalAlpha = glowAlpha;
    drawDot(ctx, particle.x, particle.y, particle.size * (1.8 + depth * 0.3), 'rgba(255, 255, 255, 0.16)');

    ctx.beginPath();
    ctx.moveTo(
      particle.x - particle.vx * trailScale,
      particle.y - particle.vy * trailScale
    );
    ctx.lineTo(particle.x, particle.y);
    ctx.strokeStyle = particle.trailColor;
    ctx.lineWidth = Math.max(0.8, particle.size * trailWidthFactor);
    ctx.globalAlpha = opacity * 0.76;
    ctx.stroke();
    ctx.globalAlpha = opacity;
    drawDot(ctx, particle.x, particle.y, particle.size, particle.color);
  }
  ctx.globalAlpha = 1;
}

function drawParticleBursts(ctx, particles, options = {}) {
  const threshold = options.threshold ?? 16;
  const burstRadius = options.burstRadius ?? 5;
  const maxBursts = options.maxBursts ?? 18;
  let bursts = 0;

  for (let index = 0; index < particles.length; index += 1) {
    const current = particles[index];

    for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
      const next = particles[nextIndex];
      const distance = Math.hypot(current.x - next.x, current.y - next.y);
      if (distance > threshold) {
        continue;
      }

      const alpha = 0.08 + (1 - distance / threshold) * 0.14;
      const x = (current.x + next.x) * 0.5;
      const y = (current.y + next.y) * 0.5;
      ctx.globalAlpha = alpha;
      drawDot(ctx, x, y, burstRadius * 2.2, 'rgba(255, 255, 255, 0.18)');
      ctx.globalAlpha = alpha * 1.1;
      drawDot(ctx, x, y, burstRadius, 'rgba(237, 147, 102, 0.22)');

      bursts += 1;
      if (bursts >= maxBursts) {
        ctx.globalAlpha = 1;
        return;
      }
    }
  }

  ctx.globalAlpha = 1;
}

function drawPolyline(ctx, points, strokeStyle, lineWidth = 1) {
  if (points.length < 2) {
    return;
  }

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let index = 1; index < points.length; index += 1) {
    ctx.lineTo(points[index].x, points[index].y);
  }
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

function resizeInspirationFloor(floor) {
  const width = Math.max(1, floor.element.clientWidth);
  const height = Math.max(1, floor.element.clientHeight);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const bleedX = Math.round(clamp(width * 0.34, 120, 360));
  const bleedY = Math.round(clamp(height * 0.24, 32, 112));

  floor.visibleWidth = width;
  floor.visibleHeight = height;
  floor.visibleX = bleedX;
  floor.visibleY = bleedY;
  floor.canvasLogicalWidth = width + bleedX * 2;
  floor.canvasLogicalHeight = height + bleedY * 2;

  floor.canvas.style.left = `${-bleedX}px`;
  floor.canvas.style.top = `${-bleedY}px`;
  floor.canvas.style.width = `${floor.canvasLogicalWidth}px`;
  floor.canvas.style.height = `${floor.canvasLogicalHeight}px`;

  floor.canvas.width = Math.round(floor.canvasLogicalWidth * dpr);
  floor.canvas.height = Math.round(floor.canvasLogicalHeight * dpr);
  floor.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  floor.scene.build(floor, createSeededRandom(floor.seed));
}

function projectGasCluster(cluster, time, bounds) {
  const drift = time * cluster.travelSpeed + cluster.phase;
  const travel = drift / (Math.PI * 2);

  return {
    centerX: wrapRange(
      cluster.anchorX +
        cluster.flowX * travel +
        Math.sin(drift) * cluster.orbitX +
        Math.cos(drift * 0.63 + cluster.phase) * cluster.crossDrift,
      bounds.minX,
      bounds.maxX
    ),
    centerY: wrapRange(
      cluster.anchorY +
        cluster.flowY * travel +
        Math.cos(drift * 0.82 + cluster.phase) * cluster.orbitY +
        Math.sin(drift * 0.48 + cluster.phase) * cluster.floatY,
      bounds.minY,
      bounds.maxY
    ),
    rotation: cluster.rotation + time * cluster.spin + Math.sin(drift * 0.72) * 0.22,
    depth: 0.84 + Math.cos(drift * 0.56 + cluster.phase) * 0.22,
    phase: cluster.phase + time * cluster.spin * 1.08
  };
}

function getHelixClusterState(cluster, time, floor) {
  const region = getSceneRegion(floor);
  const band = getSceneActivityBand(floor);
  const gas = projectGasCluster(cluster, time, {
    minX: band.startX - cluster.radius * 2.4,
    maxX: band.endX + cluster.radius * 2.6,
    minY: floor.visibleY + floor.visibleHeight * 0.38,
    maxY: floor.visibleY + floor.visibleHeight * 0.62
  });

  return {
    centerX: gas.centerX,
    centerY: gas.centerY,
    tilt: gas.rotation,
    radiusX: cluster.radius * gas.depth * (0.92 + Math.sin(gas.phase * 1.16 + cluster.phase) * 0.12),
    radiusY: cluster.radius * (1.46 - gas.depth * 0.34) * (0.72 + Math.cos(gas.phase * 0.94 + cluster.phase) * 0.16),
    phase: gas.phase
  };
}

function projectHelixPoint(cluster, state, progress, strandPhase, time, jitter = 0) {
  const twist = progress * cluster.turns * Math.PI * 2 + state.phase + strandPhase;
  const ridge = Math.sin(twist * 0.56 + jitter) * cluster.radius * 0.08;
  const local = rotatePoint(
    Math.cos(twist) * state.radiusX,
    (progress - 0.5) * cluster.span + ridge,
    state.tilt
  );

  return {
    x: state.centerX + local.x + Math.cos(time * cluster.spin + jitter) * cluster.radius * 0.05,
    y: state.centerY + local.y + Math.sin(twist * 0.72 + jitter) * state.radiusY * 0.3,
    twist
  };
}

function buildHelixScene(floor, random) {
  const region = getSceneRegion(floor);
  const band = getSceneActivityBand(floor);
  const clusterCount = clamp(Math.round(band.width / 78), 18, 28);
  const strandParticles = [];

  const clusters = Array.from({ length: clusterCount }, (_, index) => {
    const horizontalBias = Math.pow(random(), 0.42);
    const cluster = {
      anchorX: band.startX + band.width * (0.02 + horizontalBias * 0.98),
      anchorY: floor.visibleY + floor.visibleHeight * (0.46 + (random() - 0.5) * 0.12),
      flowX: (random() - 0.5) * band.width * 0.22,
      flowY: (random() - 0.5) * floor.visibleHeight * 0.12,
      radius: 20 + random() * 16,
      span: floor.visibleHeight * (1.44 + random() * 0.42),
      turns: 3 + random() * 1.4,
      rotation: -0.48 + random() * 0.96,
      orbitX: 22 + random() * 28,
      orbitY: 8 + random() * 14,
      floatY: 4 + random() * 8,
      crossDrift: 10 + random() * 16,
      travelSpeed: pickSceneSpeed(random, 0.00012, 0.000018),
      spin: pickSceneSpeed(random, 0.00009, 0.000014),
      phase: random() * Math.PI * 2
    };

    const particlesPerStrand = 10 + Math.floor(random() * 6);
    for (let strand = 0; strand < 2; strand += 1) {
      for (let particleIndex = 0; particleIndex < particlesPerStrand; particleIndex += 1) {
        strandParticles.push({
          clusterIndex: index,
          strandPhase: strand * Math.PI,
          progress: random(),
          speed: pickSceneSpeed(random, 0.00013, 0.000018),
          phase: random() * Math.PI * 2,
          size: 1.2 + random() * 1.8,
          color: pickSceneColor(random, 0.58, 0.16),
          trailColor: pickSceneColor(random, 0.16, 0.08)
        });
      }
    }

    return cluster;
  });

  floor.sceneData = {
    clusters,
    strandParticles,
    ambient: buildAmbientParticles(floor, random, 220, {
      minXRatio: 0,
      maxXRatio: 1,
      minDriftX: 16,
      maxDriftX: 36,
      minDriftY: 12,
      maxDriftY: 26,
      speedCenter: 0.0002,
      speedSpread: 0.00004,
      flowScaleX: 2.1,
      flowScaleY: 1.8,
      minSize: 0.9,
      maxSize: 2.8
    })
  };
}

function drawHelixScene(floor, time) {
  const { ctx, sceneData } = floor;
  const region = getSceneRegion(floor);
  const clusterStates = sceneData.clusters.map((cluster) => getHelixClusterState(cluster, time, floor));
  const ambientParticles = projectAmbientParticles(sceneData.ambient, time);

  drawGlow(ctx, getSceneActivityBand(floor).centerX, region.centerY, Math.min(region.width * 0.18, 190), [
    [0, 'rgba(237, 147, 102, 0.08)'],
    [0.45, 'rgba(29, 107, 108, 0.04)'],
    [1, 'rgba(255, 255, 255, 0)']
  ]);

  sceneData.clusters.forEach((cluster, clusterIndex) => {
    const state = clusterStates[clusterIndex];
    const front = [];
    const back = [];

    for (let index = 0; index <= 32; index += 1) {
      const progress = index / 32;
      const frontPoint = projectHelixPoint(cluster, state, progress, 0, time, cluster.phase);
      const backPoint = projectHelixPoint(cluster, state, progress, Math.PI, time, cluster.phase + 1.2);
      front.push(frontPoint);
      back.push(backPoint);

      if (index % 4 === 0 && index > 0 && index < 32) {
        ctx.beginPath();
        ctx.moveTo(frontPoint.x, frontPoint.y);
        ctx.lineTo(backPoint.x, backPoint.y);
        ctx.strokeStyle = 'rgba(237, 147, 102, 0.038)';
        ctx.lineWidth = 0.9;
        ctx.stroke();
      }
    }

    drawPolyline(ctx, back, 'rgba(95, 131, 125, 0.048)', 1);
    drawPolyline(ctx, front, 'rgba(29, 107, 108, 0.056)', 1.1);
  });

  const strandParticles = sceneData.strandParticles.map((particle) => {
    const cluster = sceneData.clusters[particle.clusterIndex];
    const state = clusterStates[particle.clusterIndex];
    const progress = (particle.progress + time * particle.speed) % 1;
    const point = projectHelixPoint(
      cluster,
      state,
      progress,
      particle.strandPhase,
      time,
      particle.phase
    );
    const x = point.x + Math.cos(point.twist * 1.6 + particle.phase) * 3;
    const y = point.y + Math.sin(time * particle.speed * 1.2 + particle.phase) * 4;
    const near = (Math.cos(point.twist) + 1) * 0.5;
    const depth = 0.72 + near * 0.92;

    return {
      x,
      y,
      vx: Math.sin(point.twist) * state.radiusX * 0.18,
      vy: Math.cos(point.twist) * state.radiusY * 0.14,
      size: particle.size * (0.88 + near * 0.42),
      depth,
      opacity: 0.42 + near * 0.48,
      glowAlpha: 0.1 + near * 0.08,
      color: particle.color,
      trailColor: particle.trailColor
    };
  });

  drawParticleSwarm(ctx, strandParticles, {
    connectDistance: 62,
    connectOpacity: 0.03,
    trailScale: 0.14
  });
  drawParticleBursts(ctx, ambientParticles, {
    threshold: 14,
    burstRadius: 4.6,
    maxBursts: 42
  });
  drawParticleSwarm(ctx, ambientParticles, {
    connectDistance: 0,
    trailScale: 0.14
  });
}

function buildLatticeScene(floor, random) {
  const region = getSceneRegion(floor);
  const band = getSceneActivityBand(floor);
  const columns = clamp(Math.round(band.width / 168), 5, 8);
  const rows = clamp(Math.round(region.height / 112), 5, 8);
  const nodes = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      nodes.push({
        row,
        column,
        baseX:
          band.startX +
          band.width * (column / Math.max(columns - 1, 1)) +
          (random() - 0.5) * 30,
        baseY:
          region.y +
          region.height * (0.12 + (row / Math.max(rows - 1, 1)) * 0.76) +
          (random() - 0.5) * 26,
        drift: 10 + random() * 18,
        speed: pickSceneSpeed(random, 0.0002, 0.00004),
        phase: random() * Math.PI * 2,
        size: 1.4 + random() * 2,
        color: pickSceneColor(random, 0.54, 0.16)
      });
    }
  }

  floor.sceneData = { rows, columns, nodes };
  floor.sceneData.ambient = buildAmbientParticles(floor, random, 64, {
    minXRatio: 0,
    maxXRatio: 1,
    minDriftX: 12,
    maxDriftX: 24,
    minDriftY: 10,
    maxDriftY: 16,
    speedCenter: 0.00012,
    speedSpread: 0.00002,
    minSize: 0.9,
    maxSize: 2.4
  });
}

function drawLatticeScene(floor, time) {
  const { ctx, sceneData } = floor;
  const region = getSceneRegion(floor);

  drawGlow(ctx, getSceneActivityBand(floor).centerX, region.centerY, Math.min(region.width * 0.16, 180), [
    [0, 'rgba(106, 180, 164, 0.08)'],
    [0.4, 'rgba(29, 107, 108, 0.04)'],
    [1, 'rgba(255, 255, 255, 0)']
  ]);

  const positions = sceneData.nodes.map((node) => ({
    ...node,
    x: node.baseX + Math.sin(time * node.speed + node.phase) * node.drift,
    y: node.baseY + Math.cos(time * node.speed * 1.2 + node.phase) * node.drift * 0.75
  }));

  const nodeAt = (row, column) => positions[row * sceneData.columns + column];
  for (let row = 0; row < sceneData.rows; row += 1) {
    for (let column = 0; column < sceneData.columns; column += 1) {
      const current = nodeAt(row, column);

      if (column < sceneData.columns - 1) {
        const next = nodeAt(row, column + 1);
        ctx.beginPath();
        ctx.moveTo(current.x, current.y);
        ctx.lineTo(next.x, next.y);
        ctx.strokeStyle = 'rgba(29, 107, 108, 0.085)';
        ctx.lineWidth = 0.9;
        ctx.stroke();
      }

      if (row < sceneData.rows - 1) {
        const next = nodeAt(row + 1, column);
        ctx.beginPath();
        ctx.moveTo(current.x, current.y);
        ctx.lineTo(next.x, next.y);
        ctx.strokeStyle = 'rgba(237, 147, 102, 0.072)';
        ctx.lineWidth = 0.85;
        ctx.stroke();
      }
    }
  }

  for (const node of positions) {
    drawDot(ctx, node.x, node.y, node.size, node.color);
  }
  drawParticleSwarm(ctx, projectAmbientParticles(sceneData.ambient, time), {
    trailScale: 0.1,
    connectDistance: 0
  });
}

function buildOrbitScene(floor, random) {
  const region = getSceneRegion(floor);
  const band = getSceneActivityBand(floor);
  const count = clamp(Math.round(band.width / 60), 26, 42);
  const ringBase = Math.min(region.width, region.height) * 0.16;
  floor.sceneData = {
    rings: [
      { x: ringBase * 0.72, y: ringBase * 0.42 },
      { x: ringBase * 1.18, y: ringBase * 0.76 },
      { x: ringBase * 1.66, y: ringBase * 1.04 }
    ],
    burstCenters: [
      band.startX + band.width * 0.34,
      band.startX + band.width * 0.68
    ],
    satellites: Array.from({ length: count }, () => ({
      ringIndex: Math.floor(random() * 3),
      phase: random() * Math.PI * 2,
      speed: pickSceneSpeed(random, 0.00013, 0.00002),
      size: 1.4 + random() * 2.2,
      wobble: 0.88 + random() * 0.36,
      burstIndex: Math.floor(random() * 2),
      color: pickSceneColor(random, 0.56, 0.16),
      trailColor: pickSceneColor(random, 0.16, 0.08)
    }))
  };
  floor.sceneData.ambient = buildAmbientParticles(floor, random, 60, {
    minXRatio: 0,
    maxXRatio: 1,
    minDriftX: 12,
    maxDriftX: 26,
    minDriftY: 10,
    maxDriftY: 18,
    speedCenter: 0.00012,
    speedSpread: 0.00002,
    minSize: 0.9,
    maxSize: 2.5
  });
}

function drawOrbitScene(floor, time) {
  const { ctx, sceneData } = floor;
  const region = getSceneRegion(floor);
  const centerX = getSceneActivityBand(floor).centerX;
  const centerY = region.centerY;

  drawGlow(ctx, centerX, centerY, Math.min(region.width * 0.18, 180), [
    [0, 'rgba(237, 147, 102, 0.08)'],
    [0.46, 'rgba(29, 107, 108, 0.04)'],
    [1, 'rgba(255, 255, 255, 0)']
  ]);

  for (const ring of sceneData.rings) {
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, ring.x, ring.y, -0.26, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(95, 131, 125, 0.085)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  const satellites = sceneData.satellites.map((satellite) => {
    const ring = sceneData.rings[satellite.ringIndex];
    const burstCenterX = sceneData.burstCenters[satellite.burstIndex];
    const angle = time * satellite.speed + satellite.phase;
    const radiusPulse = 0.74 + 0.34 * Math.sin(angle * 1.8 + satellite.phase);
    return {
      x: burstCenterX + Math.cos(angle) * ring.x * radiusPulse,
      y: centerY + Math.sin(angle) * ring.y * satellite.wobble * radiusPulse,
      vx: Math.cos(angle + Math.PI * 0.5) * ring.x * 0.2,
      vy: Math.sin(angle + Math.PI * 0.5) * ring.y * 0.2,
      size: satellite.size,
      color: satellite.color,
      trailColor: satellite.trailColor
    };
  });

  drawParticleSwarm(ctx, satellites, {
    connectDistance: 96,
    connectOpacity: 0.04,
    trailScale: 0.14
  });
  drawParticleSwarm(ctx, projectAmbientParticles(sceneData.ambient, time), {
    trailScale: 0.1
  });
}

function buildWorkflowScene(floor, random) {
  const region = getSceneRegion(floor);
  const band = getSceneActivityBand(floor);
  const ribbonCount = clamp(Math.round(region.height / 122), 4, 6);
  const pathParticles = [];
  const ribbons = Array.from({ length: ribbonCount }, (_, index) => {
    const ribbon = {
      startX: band.startX,
      endX: band.endX,
      centerY: region.height * (0.16 + (index / Math.max(ribbonCount - 1, 1)) * 0.68),
      slope: -0.18 + random() * 0.36,
      amplitude: 18 + random() * 24,
      frequency: 1.4 + random() * 1.8,
      speed: pickSceneSpeed(random, 0.00012, 0.000018),
      phase: random() * Math.PI * 2
    };

    const particleCount = 18 + Math.floor(random() * 12);
    for (let particleIndex = 0; particleIndex < particleCount; particleIndex += 1) {
      pathParticles.push({
        ribbonIndex: index,
        progress: random(),
        speed: pickSceneSpeed(random, 0.00013, 0.00002),
        bounce: 6 + random() * 10,
        phase: random() * Math.PI * 2,
        size: 1.3 + random() * 1.8,
        color: pickSceneColor(random, 0.58, 0.16),
        trailColor: pickSceneColor(random, 0.16, 0.08)
      });
    }

    return ribbon;
  });

  floor.sceneData = {
    ribbons,
    pathParticles,
    ambient: buildAmbientParticles(floor, random, 66, {
      minXRatio: 0,
      maxXRatio: 1,
      minDriftX: 12,
      maxDriftX: 24,
      minDriftY: 10,
      maxDriftY: 18,
      speedCenter: 0.00012,
      speedSpread: 0.00002,
      minSize: 0.9,
      maxSize: 2.4
    })
  };
}

function drawWorkflowScene(floor, time) {
  const { ctx, sceneData } = floor;
  const region = getSceneRegion(floor);

  drawGlow(ctx, getSceneActivityBand(floor).centerX, region.centerY, Math.min(region.width * 0.17, 180), [
    [0, 'rgba(106, 180, 164, 0.08)'],
    [0.4, 'rgba(29, 107, 108, 0.04)'],
    [1, 'rgba(255, 255, 255, 0)']
  ]);

  for (const ribbon of sceneData.ribbons) {
    const points = [];
    for (let step = 0; step <= 22; step += 1) {
      const ratio = step / 22;
      const x = ribbon.startX + ratio * (ribbon.endX - ribbon.startX);
      const y =
        ribbon.centerY +
        Math.sin(ratio * Math.PI * 2 * ribbon.frequency + ribbon.phase + time * ribbon.speed) *
          ribbon.amplitude +
        (ratio - 0.5) * ribbon.slope * region.height;
      points.push({ x, y });
    }
    drawPolyline(ctx, points, 'rgba(95, 131, 125, 0.05)', 1);
  }

  const particles = sceneData.pathParticles.map((particle) => {
    const ribbon = sceneData.ribbons[particle.ribbonIndex];
    const progress = (particle.progress + time * particle.speed) % 1;
    const x = ribbon.startX + progress * (ribbon.endX - ribbon.startX);
    const angle = progress * Math.PI * 2 * ribbon.frequency + ribbon.phase + time * ribbon.speed;
    const y =
      ribbon.centerY +
      Math.sin(angle) * ribbon.amplitude +
      (progress - 0.5) * ribbon.slope * region.height +
      Math.cos(angle * 1.5 + particle.phase) * particle.bounce;

    return {
      x,
      y,
      vx: Math.cos(angle) * ribbon.amplitude * 0.8 + (ribbon.endX - ribbon.startX) * 0.06,
      vy: Math.sin(angle * 1.4) * ribbon.amplitude * 0.5,
      size: particle.size,
      color: particle.color,
      trailColor: particle.trailColor
    };
  });

  drawParticleSwarm(ctx, particles, {
    connectDistance: 74,
    connectOpacity: 0.03,
    trailScale: 0.14
  });
  drawParticleSwarm(ctx, projectAmbientParticles(sceneData.ambient, time), {
    trailScale: 0.1
  });
}

function buildGateScene(floor, random) {
  const region = getSceneRegion(floor);
  const band = getSceneActivityBand(floor);
  const gateCount = clamp(Math.round(band.width / 240), 3, 5);
  const particleCount = clamp(Math.round(band.width / 36), 28, 44);
  floor.sceneData = {
    gates: Array.from({ length: gateCount }, (_, index) => ({
      x: band.startX + band.width * (0.08 + (index / Math.max(gateCount - 1, 1)) * 0.84),
      aperture: 22 + random() * 24,
      phase: random() * Math.PI * 2,
      bend: -0.16 + random() * 0.32
    })),
    particles: Array.from({ length: particleCount }, () => ({
      baseX: band.startX + band.width * random(),
      baseY: region.y + region.height * (0.16 + random() * 0.68),
      driftX: 24 + random() * 36,
      driftY: 14 + random() * 26,
      speed: pickSceneSpeed(random, 0.00013, 0.00002),
      phase: random() * Math.PI * 2,
      size: 1.2 + random() * 3.2,
      color: pickSceneColor(random, 0.58, 0.16),
      trailColor: pickSceneColor(random, 0.16, 0.08)
    }))
  };
}

function drawGateScene(floor, time) {
  const { ctx, sceneData } = floor;
  const region = getSceneRegion(floor);

  drawGlow(ctx, getSceneActivityBand(floor).centerX, region.centerY, Math.min(region.width * 0.18, 190), [
    [0, 'rgba(29, 107, 108, 0.08)'],
    [0.36, 'rgba(237, 147, 102, 0.05)'],
    [1, 'rgba(255, 255, 255, 0)']
  ]);

  for (const gate of sceneData.gates) {
    const gateX = gate.x;
    const apertureY = region.centerY + Math.sin(time * 0.00024 + gate.phase) * (region.height * 0.08);
    const controlOffset = gate.bend * region.height;

    ctx.beginPath();
    ctx.moveTo(gateX, region.y);
    ctx.quadraticCurveTo(gateX + controlOffset, region.centerY, gateX, apertureY - gate.aperture);
    ctx.moveTo(gateX, apertureY + gate.aperture);
    ctx.quadraticCurveTo(gateX - controlOffset, region.centerY, gateX, region.height);
    ctx.strokeStyle = 'rgba(29, 107, 108, 0.08)';
    ctx.lineWidth = 1.1;
    ctx.stroke();
  }

  const particles = sceneData.particles.map((particle) => {
    const angle = time * particle.speed + particle.phase;
    return {
      x: particle.baseX + Math.cos(angle) * particle.driftX,
      y: particle.baseY + Math.sin(angle * 1.4) * particle.driftY,
      vx: Math.cos(angle * 1.4) * particle.driftX * 0.5,
      vy: Math.sin(angle * 1.9) * particle.driftY * 0.7,
      size: Math.max(0.8, particle.size * (0.84 + 0.18 * Math.sin(angle * 2))),
      color: particle.color,
      trailColor: particle.trailColor
    };
  });

  drawParticleSwarm(ctx, particles, {
    connectDistance: 80,
    connectOpacity: 0.04,
    trailScale: 0.12
  });
}

function buildDoseScene(floor, random) {
  const region = getSceneRegion(floor);
  const band = getSceneActivityBand(floor);
  const pulseParticles = [];
  const curves = Array.from({ length: 4 }, (_, index) => {
    const curve = {
      startX: band.startX,
      endX: band.endX,
      baseY: region.height * (0.2 + index * 0.16),
      amplitude: 18 + random() * 20,
      rise: 0.12 + random() * 0.1,
      fall: 0.52 + random() * 0.16,
      tilt: -0.12 + random() * 0.24,
      speed: pickSceneSpeed(random, 0.00012, 0.000018),
      phase: random() * Math.PI * 2
    };

    const particleCount = 16 + Math.floor(random() * 10);
    for (let particleIndex = 0; particleIndex < particleCount; particleIndex += 1) {
      pulseParticles.push({
        curveIndex: index,
        progress: random(),
        speed: pickSceneSpeed(random, 0.00013, 0.00002),
        jitter: 5 + random() * 8,
        phase: random() * Math.PI * 2,
        size: 1.2 + random() * 1.8,
        color: pickSceneColor(random, 0.58, 0.16),
        trailColor: pickSceneColor(random, 0.16, 0.08)
      });
    }

    return curve;
  });

  floor.sceneData = {
    curves,
    pulseParticles,
    ambient: buildAmbientParticles(floor, random, 66, {
      minXRatio: 0,
      maxXRatio: 1,
      minDriftX: 12,
      maxDriftX: 24,
      minDriftY: 10,
      maxDriftY: 18,
      speedCenter: 0.00012,
      speedSpread: 0.00002,
      minSize: 0.9,
      maxSize: 2.4
    })
  };
}

function drawDoseScene(floor, time) {
  const { ctx, sceneData } = floor;
  const region = getSceneRegion(floor);
  const steps = 24;

  drawGlow(ctx, getSceneActivityBand(floor).centerX, region.centerY, Math.min(region.width * 0.16, 180), [
    [0, 'rgba(237, 147, 102, 0.08)'],
    [0.44, 'rgba(29, 107, 108, 0.04)'],
    [1, 'rgba(255, 255, 255, 0)']
  ]);

  for (const curve of sceneData.curves) {
    const points = [];
    for (let index = 0; index <= steps; index += 1) {
      const ratio = index / steps;
      const x = curve.startX + ratio * (curve.endX - curve.startX);
      const rise = 1 / (1 + Math.exp(-(ratio - curve.rise) * 18));
      const fall = 1 / (1 + Math.exp((ratio - curve.fall) * 18));
      const wave = Math.sin(time * curve.speed + ratio * Math.PI * 7 + curve.phase) * 6;
      const y =
        curve.baseY -
        (rise * fall) * curve.amplitude * 4.2 +
        wave +
        (ratio - 0.5) * curve.tilt * region.height;
      points.push({ x, y });
    }
    drawPolyline(ctx, points, 'rgba(95, 131, 125, 0.05)', 1);
  }

  const particles = sceneData.pulseParticles.map((particle) => {
    const curve = sceneData.curves[particle.curveIndex];
    const progress = (particle.progress + time * particle.speed) % 1;
    const x = curve.startX + progress * (curve.endX - curve.startX);
    const rise = 1 / (1 + Math.exp(-(progress - curve.rise) * 18));
    const fall = 1 / (1 + Math.exp((progress - curve.fall) * 18));
    const beat = Math.sin(time * curve.speed + progress * Math.PI * 7 + curve.phase);
    const y =
      curve.baseY -
      (rise * fall) * curve.amplitude * 4.2 +
      beat * 6 +
      (progress - 0.5) * curve.tilt * region.height +
      Math.cos(time * particle.speed * 1.5 + particle.phase) * particle.jitter;

    return {
      x,
      y,
      vx: (curve.endX - curve.startX) * 0.06,
      vy: Math.cos(time * particle.speed + particle.phase) * particle.jitter,
      size: particle.size + rise * 0.8,
      color: particle.color,
      trailColor: particle.trailColor
    };
  });

  drawParticleSwarm(ctx, particles, {
    connectDistance: 68,
    connectOpacity: 0.028,
    trailScale: 0.14
  });
  drawParticleSwarm(ctx, projectAmbientParticles(sceneData.ambient, time), {
    trailScale: 0.1
  });
}

function buildConstellationScene(floor, random) {
  const region = getSceneRegion(floor);
  const band = getSceneActivityBand(floor);
  const clusterCount = clamp(Math.round(band.width / 280), 3, 5);
  const burstParticles = [];
  floor.sceneData = {
    clusters: Array.from({ length: clusterCount }, (_, index) => ({
      anchorX: band.startX + band.width * (0.1 + random() * 0.8),
      anchorY: region.y + region.height * (0.18 + random() * 0.64),
      flowX: (random() - 0.5) * band.width * 0.14,
      flowY: (random() - 0.5) * region.height * 0.16,
      orbitX: 16 + random() * 22,
      orbitY: 10 + random() * 16,
      floatY: 6 + random() * 10,
      crossDrift: 8 + random() * 12,
      rotation: -0.42 + random() * 0.84,
      travelSpeed: pickSceneSpeed(random, 0.00011, 0.000016),
      spin: pickSceneSpeed(random, 0.00008, 0.000014),
      phase: random() * Math.PI * 2,
      color: pickSceneColor(random, 0.52, 0.16)
    })),
    ambient: buildAmbientParticles(floor, random, 72, {
      minXRatio: 0,
      maxXRatio: 1,
      minDriftX: 12,
      maxDriftX: 26,
      minDriftY: 10,
      maxDriftY: 20,
      speedCenter: 0.00012,
      speedSpread: 0.00002,
      minSize: 0.95,
      maxSize: 2.5
    })
  };

  for (let clusterIndex = 0; clusterIndex < floor.sceneData.clusters.length; clusterIndex += 1) {
    const count = 16 + Math.floor(random() * 8);
    for (let particleIndex = 0; particleIndex < count; particleIndex += 1) {
      burstParticles.push({
        clusterIndex,
        angle: random() * Math.PI * 2,
        radius: 14 + random() * 26,
        speed: pickSceneSpeed(random, 0.00013, 0.00002),
        phase: random() * Math.PI * 2,
        size: 1.4 + random() * 2,
        color: pickSceneColor(random, 0.58, 0.16),
        trailColor: pickSceneColor(random, 0.16, 0.08)
      });
    }
  }
  floor.sceneData.burstParticles = burstParticles;
}

function drawConstellationScene(floor, time) {
  const { ctx, sceneData } = floor;
  const region = getSceneRegion(floor);
  const stars = [];
  const band = getSceneActivityBand(floor);
  const clusterStates = sceneData.clusters.map((cluster) =>
    projectGasCluster(cluster, time, {
      minX: band.startX - 72,
      maxX: band.endX + 72,
      minY: region.y + region.height * 0.16,
      maxY: region.y + region.height * 0.84
    })
  );

  drawGlow(ctx, getSceneActivityBand(floor).centerX, region.centerY, Math.min(region.width * 0.16, 170), [
    [0, 'rgba(106, 180, 164, 0.08)'],
    [0.44, 'rgba(29, 107, 108, 0.04)'],
    [1, 'rgba(255, 255, 255, 0)']
  ]);

  sceneData.clusters.forEach((cluster, clusterIndex) => {
    const state = clusterStates[clusterIndex];
    stars.push({
      x: state.centerX,
      y: state.centerY,
      size: 2.4,
      depth: 1.08 + state.depth * 0.14,
      opacity: 0.82,
      glowAlpha: 0.14,
      color: cluster.color,
      trailColor: 'rgba(255,255,255,0.12)',
      vx: 0,
      vy: 0
    });
  });

  const bursts = sceneData.burstParticles.map((particle) => {
    const cluster = sceneData.clusters[particle.clusterIndex];
    const state = clusterStates[particle.clusterIndex];
    const angle = particle.angle + time * particle.speed + particle.phase + state.rotation;
    const radius = particle.radius * (0.74 + 0.22 * Math.sin(angle * 1.4));
    const depth = 0.76 + (Math.cos(angle) + 1) * 0.24;
    return {
      x: state.centerX + Math.cos(angle) * radius,
      y: state.centerY + Math.sin(angle) * radius * (0.72 + (1.2 - state.depth) * 0.1),
      vx: Math.cos(angle) * radius * 0.08,
      vy: Math.sin(angle) * radius * 0.06,
      size: particle.size * (0.9 + depth * 0.18),
      depth,
      opacity: 0.42 + depth * 0.28,
      glowAlpha: 0.08 + depth * 0.05,
      color: particle.color,
      trailColor: particle.trailColor
    };
  });

  drawParticleSwarm(ctx, bursts, {
    connectDistance: 82,
    connectOpacity: 0.03,
    trailScale: 0.14
  });
  drawParticleSwarm(ctx, projectAmbientParticles(sceneData.ambient, time), {
    trailScale: 0.1
  });
  drawParticleSwarm(ctx, stars, { trailScale: 0 });
}

function buildArchiveScene(floor, random) {
  const region = getSceneRegion(floor);
  const band = getSceneActivityBand(floor);
  const fanCount = clamp(Math.round(band.width / 260), 3, 5);
  const fanParticles = [];
  floor.sceneData = {
    fans: Array.from({ length: fanCount }, (_, index) => ({
      anchorX: band.startX + band.width * (0.1 + random() * 0.8),
      anchorY: region.y + region.height * (0.2 + random() * 0.6),
      flowX: (random() - 0.5) * band.width * 0.14,
      flowY: (random() - 0.5) * region.height * 0.14,
      orbitX: 16 + random() * 20,
      orbitY: 10 + random() * 14,
      floatY: 6 + random() * 8,
      crossDrift: 8 + random() * 12,
      radius: 24 + random() * 16,
      spread: 0.8 + random() * 0.7,
      rotation: -0.42 + random() * 0.84,
      travelSpeed: pickSceneSpeed(random, 0.00011, 0.000016),
      spin: pickSceneSpeed(random, 0.00008, 0.000014),
      phase: random() * Math.PI * 2,
      color: pickSceneColor(random, 0.5, 0.14)
    })),
    ambient: buildAmbientParticles(floor, random, 76, {
      minXRatio: 0,
      maxXRatio: 1,
      minDriftX: 12,
      maxDriftX: 26,
      minDriftY: 10,
      maxDriftY: 20,
      speedCenter: 0.00012,
      speedSpread: 0.00002,
      minSize: 1,
      maxSize: 2.6
    })
  };

  for (let fanIndex = 0; fanIndex < floor.sceneData.fans.length; fanIndex += 1) {
    const count = 18 + Math.floor(random() * 8);
    for (let particleIndex = 0; particleIndex < count; particleIndex += 1) {
      fanParticles.push({
        fanIndex,
        arm: -0.5 + random(),
        progress: random(),
        speed: pickSceneSpeed(random, 0.00013, 0.00002),
        phase: random() * Math.PI * 2,
        size: 1.2 + random() * 1.8,
        color: pickSceneColor(random, 0.56, 0.16),
        trailColor: pickSceneColor(random, 0.16, 0.08)
      });
    }
  }
  floor.sceneData.fanParticles = fanParticles;
}

function drawArchiveScene(floor, time) {
  const { ctx, sceneData } = floor;
  const region = getSceneRegion(floor);
  const band = getSceneActivityBand(floor);
  const fanStates = sceneData.fans.map((fan) =>
    projectGasCluster(fan, time, {
      minX: band.startX - 72,
      maxX: band.endX + 72,
      minY: region.y + region.height * 0.16,
      maxY: region.y + region.height * 0.84
    })
  );

  drawGlow(ctx, getSceneActivityBand(floor).centerX, region.centerY, Math.min(region.width * 0.15, 170), [
    [0, 'rgba(214, 176, 101, 0.06)'],
    [0.46, 'rgba(29, 107, 108, 0.04)'],
    [1, 'rgba(255, 255, 255, 0)']
  ]);

  sceneData.fans.forEach((fan, fanIndex) => {
    const state = fanStates[fanIndex];
    for (let leaf = -2; leaf <= 2; leaf += 1) {
      const points = [];
      for (let step = 0; step <= 16; step += 1) {
        const ratio = step / 16;
        const angle =
          state.rotation +
          leaf * 0.22 +
          (ratio - 0.5) * fan.spread +
          Math.sin(state.phase + ratio * Math.PI) * 0.06;
        points.push({
          x: state.centerX + Math.cos(angle) * fan.radius * ratio,
          y: state.centerY + Math.sin(angle) * fan.radius * ratio * 0.88
        });
      }
      drawPolyline(ctx, points, 'rgba(95, 131, 125, 0.05)', 1);
    }
  });

  const particles = sceneData.fanParticles.map((particle) => {
    const fan = sceneData.fans[particle.fanIndex];
    const state = fanStates[particle.fanIndex];
    const progress = (Math.sin(time * particle.speed + particle.phase + particle.progress * Math.PI * 2) + 1) * 0.5;
    const angle =
      state.rotation +
      particle.arm * fan.spread +
      Math.sin(state.phase + particle.phase) * 0.08 +
      Math.cos(time * particle.speed * 0.8 + particle.phase) * 0.06;
    const radius = fan.radius * (0.16 + progress * 0.84);
    const depth = 0.74 + progress * 0.52;
    return {
      x: state.centerX + Math.cos(angle) * radius,
      y: state.centerY + Math.sin(angle) * radius * 0.88,
      vx: Math.cos(angle) * radius * 0.08,
      vy: Math.sin(angle) * radius * 0.06,
      size: particle.size * (0.88 + depth * 0.18),
      depth,
      opacity: 0.4 + depth * 0.28,
      glowAlpha: 0.08 + depth * 0.05,
      color: particle.color,
      trailColor: particle.trailColor
    };
  });

  drawParticleSwarm(ctx, particles, {
    connectDistance: 78,
    connectOpacity: 0.028,
    trailScale: 0.14
  });
  drawParticleSwarm(ctx, projectAmbientParticles(sceneData.ambient, time), {
    trailScale: 0.1
  });
}

function destroyInspirationBackgrounds() {
  if (!inspirationBackgroundState) {
    return;
  }

  if (inspirationBackgroundState.frameId) {
    window.cancelAnimationFrame(inspirationBackgroundState.frameId);
  }

  if (inspirationBackgroundState.resizeObserver) {
    inspirationBackgroundState.resizeObserver.disconnect();
  }

  if (inspirationBackgroundState.handleResize) {
    window.removeEventListener('resize', inspirationBackgroundState.handleResize);
  }

  for (const floor of inspirationBackgroundState.floors) {
    floor.visual.remove();
    floor.element.classList.remove('has-inspiration-floor-visual');
  }

  inspirationBackgroundState = null;
}

function initializeInspirationBackgrounds() {
  destroyInspirationBackgrounds();

  if (getCurrentTheme() !== INSPIRATION_THEME) {
    return;
  }

  const floors = getInspirationFloorTargets()
    .map(({ element, role, pageId, floorIndex, sceneName }) => {
      const scene = INSPIRATION_SCENE_LIBRARY[sceneName] || INSPIRATION_SCENE_LIBRARY.helix;
      const visual = document.createElement('div');
      const base = document.createElement('div');
      const canvas = document.createElement('canvas');
      const veil = document.createElement('div');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return null;
      }

      visual.className = 'inspiration-floor-visual';
      visual.dataset.scene = sceneName;
      visual.dataset.role = role;
      base.className = 'inspiration-floor-visual__base';
      canvas.className = 'inspiration-floor-canvas';
      veil.className = 'inspiration-floor-visual__veil';
      visual.append(base, canvas, veil);
      element.prepend(visual);
      element.classList.add('has-inspiration-floor-visual');

      return {
        element,
        pageId,
        role,
        sceneName,
        scene,
        visual,
        base,
        canvas,
        veil,
        ctx,
        seed: hashString(`${pageId}:${role}:${floorIndex}:${sceneName}:${INSPIRATION_RUN_SALT}`)
      };
    })
    .filter(Boolean);

  if (!floors.length) {
    return;
  }

  for (const floor of floors) {
    resizeInspirationFloor(floor);
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderFrame = (now) => {
    for (const floor of floors) {
      floor.ctx.clearRect(0, 0, floor.canvasLogicalWidth, floor.canvasLogicalHeight);
      floor.scene.draw(floor, now);
    }

    if (!reduceMotion) {
      inspirationBackgroundState.frameId = window.requestAnimationFrame(renderFrame);
    }
  };

  let resizeObserver = null;
  let handleResize = null;

  if (typeof ResizeObserver === 'function') {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const floor = floors.find((item) => item.element === entry.target);
        if (floor) {
          resizeInspirationFloor(floor);
        }
      }
    });

    for (const floor of floors) {
      resizeObserver.observe(floor.element);
    }
  } else {
    handleResize = () => {
      for (const floor of floors) {
        resizeInspirationFloor(floor);
      }
    };
    window.addEventListener('resize', handleResize);
  }

  inspirationBackgroundState = {
    floors,
    frameId: null,
    resizeObserver,
    handleResize
  };

  renderFrame(window.performance.now());
}

async function bootstrapPartials() {
  syncBodyTheme();
  const partialTargets = [...document.querySelectorAll('[data-include]')];
  await Promise.all(partialTargets.map(loadPartial));
  activateCurrentPage();
  initializeNavigation();
}

window.addEventListener('DOMContentLoaded', () => {
  syncBodyTheme();
  renderThemeWidget();
  renderStorageBanner();
  initializeBreadcrumbs();
  initializeDialogs();
  initializeInspirationBackgrounds();
  bootstrapPartials().catch((error) => {
    console.error(error);
    document.body.insertAdjacentHTML(
      'afterbegin',
      `<div class="runtime-error">Failed to load shared page chrome: ${error.message}</div>`
    );
  });
});
