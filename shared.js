// Nav behaviour only.
//
// The nav, footer and JSON-LD used to be injected here at runtime. They are now
// inlined at build time from src/_nav.html, src/_foot.html and src/_jsonld.html
// (see build.js), so they exist in the shipped HTML for crawlers that do not
// run JavaScript. window.AT_PAGE / window.AT_NAV_DARK are still declared on each
// page — build.js reads them to theme the nav and mark the active link.
(function () {
  function init() {
    // Mega menu hover
    const links = document.querySelectorAll('.nav-link[data-menu]');
    const menus = {
      solutions: document.getElementById('mm-solutions'),
    };
    let openKey = null;
    function open(key) {
      if (openKey === key) return;
      Object.values(menus).forEach(m => m && (m.hidden = true));
      if (menus[key]) {
        menus[key].hidden = false;
        openKey = key;
      } else {
        openKey = null;
      }
    }
    function close() {
      Object.values(menus).forEach(m => m && (m.hidden = true));
      openKey = null;
    }
    links.forEach(l => {
      l.addEventListener('mouseenter', () => open(l.dataset.menu));
    });
    Object.values(menus).forEach(m => {
      if (!m) return;
      m.addEventListener('mouseleave', close);
    });
    document.querySelector('.topbar')?.addEventListener('mouseleave', close);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
