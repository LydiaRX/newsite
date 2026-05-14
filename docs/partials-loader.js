const THEME_STORAGE_KEY = 'lydiarx-theme';
const FUSION_THEME = 'fusion';
const DEFAULT_THEME = 'default';

function resolveTheme() {
  let theme = document.documentElement.dataset.theme || DEFAULT_THEME;

  try {
    const params = new URLSearchParams(window.location.search);
    const requestedTheme = params.get('theme');

    if (requestedTheme === FUSION_THEME) {
      localStorage.setItem(THEME_STORAGE_KEY, FUSION_THEME);
      theme = FUSION_THEME;
    } else if (requestedTheme === DEFAULT_THEME) {
      localStorage.removeItem(THEME_STORAGE_KEY);
      theme = DEFAULT_THEME;
    } else if (localStorage.getItem(THEME_STORAGE_KEY) === FUSION_THEME) {
      theme = FUSION_THEME;
    }
  } catch (error) {
    theme = theme === FUSION_THEME ? FUSION_THEME : DEFAULT_THEME;
  }

  document.documentElement.dataset.theme = theme;
  window.__mermaidTheme = theme === FUSION_THEME ? 'dark' : 'neutral';
  return theme;
}

function syncBodyTheme() {
  if (document.body) {
    document.body.dataset.theme = document.documentElement.dataset.theme || DEFAULT_THEME;
  }
}

resolveTheme();

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

async function bootstrapPartials() {
  syncBodyTheme();
  const partialTargets = [...document.querySelectorAll('[data-include]')];
  await Promise.all(partialTargets.map(loadPartial));
  activateCurrentPage();
  initializeNavigation();
}

window.addEventListener('DOMContentLoaded', () => {
  bootstrapPartials().catch((error) => {
    console.error(error);
    document.body.insertAdjacentHTML(
      'afterbegin',
      `<div class="runtime-error">Failed to load shared page chrome: ${error.message}</div>`
    );
  });
});
