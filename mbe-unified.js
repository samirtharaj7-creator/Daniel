(() => {
  const tool = "daniel";
  const headerMarkup = "<header class=\"mbe-global-shell\" data-tool=\"daniel\" data-embedded=\"true\">\n      <div class=\"mbe-shell-wrap\">\n        <div class=\"mbe-ribbon-left\">\n          <a class=\"mbe-ribbon-brand\" href=\"https://mybibleexplorer.com\" aria-label=\"My Bible Explorer home\"><img class=\"mbe-ribbon-logo\" src=\"/assets/my-bible-explorer-logo.png\" alt=\"My Bible Explorer\"></a>\n          <a class=\"mbe-ribbon-back\" href=\"https://mybibleexplorer.com/#journeys\">Back to Library</a>\n        </div>\n        <nav class=\"mbe-global-nav\" aria-label=\"My Bible Explorer\">\n          <details class=\"mbe-library-menu\">\n            <summary class=\"mbe-library-toggle\">Library</summary>\n            <div class=\"mbe-library-panel\">\n              <div class=\"mbe-library-grid\">\n            <a class=\"mbe-library-item\" href=\"https://hermeneutics.mybibleexplorer.com\"><span class=\"mbe-library-name\">Hermeneutics</span><span class=\"mbe-library-desc\">Learn to read Scripture faithfully</span></a>\n            <a class=\"mbe-library-item\" href=\"https://psalms.mybibleexplorer.com\"><span class=\"mbe-library-name\">Psalms</span><span class=\"mbe-library-desc\">Worship, lament, praise, and prayer</span></a>\n            <a class=\"mbe-library-item\" href=\"https://daniel.mybibleexplorer.com\" aria-current=\"page\"><span class=\"mbe-library-name\">Daniel</span><span class=\"mbe-library-desc\">Prophecy and providence</span></a>\n            <a class=\"mbe-library-item\" href=\"https://revelation.mybibleexplorer.com/\"><span class=\"mbe-library-name\">Revelation</span><span class=\"mbe-library-desc\">Symbols, judgment, and final hope</span></a>\n            <a class=\"mbe-library-item\" href=\"https://sanctuary.mybibleexplorer.com/#structure\"><span class=\"mbe-library-name\">Sanctuary</span><span class=\"mbe-library-desc\">A blueprint of salvation</span></a>\n            <a class=\"mbe-library-item\" href=\"https://lastdayevents.mybibleexplorer.com/index.html\"><span class=\"mbe-library-name\">Last Day Events</span><span class=\"mbe-library-desc\">Earth's final chapter</span></a>\n              </div>\n            </div>\n          </details>\n          <a class=\"mbe-ribbon-give\" href=\"https://mybibleexplorer.com/#donate\">Support</a>\n        </nav>\n      </div>\n    </header>\n";
  const footerMarkup = "<footer class=\"mbe-global-footer\" data-tool=\"daniel\">\n      <div class=\"mbe-shell-wrap mbe-footer-wrap\">\n        <a class=\"mbe-footer-brand\" href=\"https://mybibleexplorer.com\" aria-label=\"My Bible Explorer home\"><img class=\"mbe-footer-logo\" src=\"/assets/my-bible-explorer-logo.png\" alt=\"My Bible Explorer\"></a>\n        <span>Know the Word. Live the Word.</span>\n        <span>To contact, email <a class=\"mbe-footer-link\" href=\"mailto:admin@mybibleexplorer.com\">admin@mybibleexplorer.com</a></span>\n        <a class=\"mbe-footer-link\" href=\"https://mybibleexplorer.com/#donate\">Support</a>\n        <span>&copy; <span data-mbe-year></span> My Bible Explorer</span>\n      </div>\n    </footer>\n    ";

  function updateYear() {
    document.querySelectorAll('[data-mbe-year]').forEach((node) => {
      node.textContent = new Date().getFullYear();
    });
  }

  function ensureDarkTheme() {
    document.documentElement.classList.add('dark');
    try {
      window.localStorage.setItem('theme', 'dark');
    } catch (error) {
      // Some browsers block localStorage in restricted contexts.
    }
    document.querySelectorAll('button[aria-label="Toggle color theme"]').forEach((button) => {
      button.setAttribute('hidden', '');
      button.setAttribute('aria-hidden', 'true');
      button.style.display = 'none';
    });
  }

  function ensureIllustratedAssets() {
    if (!document.head) return;
    const href = '/daniel-illustrated.css?v=dvx-26';
    const existing = document.querySelector('link[data-dvx="css"]');
    if (existing) {
      const expected = new URL(href, window.location.origin).href;
      if (existing.href !== expected) existing.href = href;
      return;
    }
    if (!existing) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.setAttribute('data-dvx', 'css');
      document.head.appendChild(link);
    }
  }

  function ensureDanielArtworkMeta() {
    if (!document.body) return;
    const path = ((window.location.pathname || '/').replace(/\/+$/, '') || '/').replace(/\/index\.html$/, '') || '/';

    document.body.removeAttribute('data-daniel-route');
    document.body.removeAttribute('data-daniel-chapter');
    document.body.removeAttribute('data-daniel-chart');
    document.body.style.removeProperty('--daniel-titleplate-image');

    if (path === '/') {
      document.body.setAttribute('data-daniel-route', 'home');
      return;
    }

    if (path === '/background') {
      document.body.setAttribute('data-daniel-route', 'introduction');
      return;
    }

    const chartMatch = path.match(/^\/charts\/([^/]+)$/);
    if (path === '/charts' || chartMatch) {
      document.body.setAttribute('data-daniel-route', 'charts');
      if (chartMatch) document.body.setAttribute('data-daniel-chart', chartMatch[1]);
      return;
    }

    const chapterMatch = path.match(/^\/chapters\/(\d+)$/);
    if (!chapterMatch) return;

    const chapter = Number(chapterMatch[1]);
    if (chapter < 1 || chapter > 12) return;

    document.body.setAttribute('data-daniel-chapter', String(chapter));
  }

  // Swap the header brand emblem for the "Open Scripture" engraving.
  const SCRIPTURE_EMBLEM =
    '<g>' +
    '<line x1="50" y1="30" x2="50" y2="20"></line>' +
    '<line x1="42" y1="31.5" x2="38.5" y2="22.5"></line>' +
    '<line x1="58" y1="31.5" x2="61.5" y2="22.5"></line>' +
    '<line x1="35" y1="35" x2="28.5" y2="28.5"></line>' +
    '<line x1="65" y1="35" x2="71.5" y2="28.5"></line>' +
    '</g>' +
    '<path d="M50 47 q-13 -6 -24 -3 v27 q11 -3 24 3"></path>' +
    '<path d="M50 47 q13 -6 24 -3 v27 q-11 -3 -24 3"></path>' +
    '<line x1="50" y1="47" x2="50" y2="77"></line>' +
    '<path d="M32 55 q8 -2 15 1 M32 61 q8 -2 15 1 M53 56 q8 -3 15 0 M53 62 q8 -3 15 0"></path>';

  function ensureLogo() {
    const wm = document.querySelector('.tracking-\\[0\\.3em\\]');
    if (!wm) return;
    const brand = wm.closest('a');
    if (!brand) return;
    const svg = brand.querySelector('svg');
    if (!svg || svg.getAttribute('data-dvx-logo') === 'scripture') return;
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('stroke-width', '5');
    svg.setAttribute('data-dvx-logo', 'scripture');
    svg.innerHTML = SCRIPTURE_EMBLEM;
  }

  function ensureShell() {
    if (!document.body) return;
    ensureDarkTheme();
    ensureIllustratedAssets();
    ensureDanielArtworkMeta();
    ensureLogo();
    document.body.classList.add('mbe-shell-managed');
    document.querySelectorAll('.mbe-global-shell').forEach((node, index) => {
      if (index > 0 || node.getAttribute('data-tool') !== tool || !node.hasAttribute('data-embedded')) node.remove();
    });
    if (!document.querySelector('.mbe-global-shell[data-tool="' + tool + '"][data-embedded="true"]')) {
      document.body.insertAdjacentHTML('afterbegin', headerMarkup);
    }
    const existingFooters = Array.from(document.querySelectorAll('.mbe-global-footer'));
    let footer = existingFooters.find((node) => node.getAttribute('data-tool') === tool) || null;
    existingFooters.forEach((node) => {
      if (node !== footer) node.remove();
    });
    if (!footer) {
      document.body.insertAdjacentHTML('beforeend', footerMarkup);
      footer = document.querySelector('.mbe-global-footer[data-tool="' + tool + '"]');
    }
    if (footer && footer.parentElement === document.body && footer !== document.body.lastElementChild) {
      document.body.appendChild(footer);
    }
    updateYear();
  }

  function installRouteWatcher() {
    if (window.__danielArtworkRouteWatcher) return;
    window.__danielArtworkRouteWatcher = true;

    const queueRefresh = () => {
      window.setTimeout(ensureShell, 0);
      window.setTimeout(ensureShell, 120);
    };

    ['pushState', 'replaceState'].forEach((method) => {
      const original = window.history[method];
      if (typeof original !== 'function') return;
      window.history[method] = function () {
        const result = original.apply(this, arguments);
        queueRefresh();
        return result;
      };
    });

    window.addEventListener('popstate', queueRefresh);
  }

  ensureDarkTheme();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureShell, { once: true });
  } else {
    ensureShell();
  }
  installRouteWatcher();
  window.addEventListener('load', () => {
    ensureShell();
    window.setTimeout(ensureShell, 300);
    window.setTimeout(ensureShell, 1000);
  });

  // Keep the emblem swapped through React hydration, then watch the header
  // (scoped) so it also survives later re-renders such as the theme toggle.
  let logoTicks = 0;
  const logoTimer = window.setInterval(() => {
    ensureLogo();
    if (++logoTicks >= 10) {
      window.clearInterval(logoTimer);
      const wm = document.querySelector('.tracking-\\[0\\.3em\\]');
      const header = wm && wm.closest('header');
      if (header) new MutationObserver(ensureLogo).observe(header, { childList: true, subtree: true });
    }
  }, 500);
})();
