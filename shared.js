// Shared nav + footer injector. Set window.AT_PAGE = 'home' | 'solutions' | etc. before loading.
(function () {
  const page = window.AT_PAGE || '';
  const onDark = !!window.AT_NAV_DARK;

  const navHTML = `
    <header class="topbar${onDark ? ' on-dark' : ''}">
      <nav class="nav" aria-label="Primary">
        <a href="index.html" class="logo" aria-label="Agree Technologies">
          <img src="assets/${onDark ? 'logo-white' : 'logo-black'}.png" alt="Agree Technologies" class="logo-img" />
        </a>
        <div class="nav-links">
          <div class="nav-link" data-menu="solutions">Solutions
            <svg class="chev" viewBox="0 0 12 12"><path d="M3 4.5L6 7.5L9 4.5"/></svg>
          </div>
          <a class="nav-link" href="platform.html">Platform</a>
          <a class="nav-link" href="implementation.html">Implementation</a>
          <a class="nav-link" href="about.html">About us</a>
        </div>
        <div class="nav-spacer"></div>
        <div class="nav-cta">
          <a class="btn ${onDark ? 'btn-outline-dark' : 'btn-ghost'}" href="contact.html">Talk to an expert</a>
          <a class="btn ${onDark ? 'btn-cyan' : 'btn-primary'}" href="contact.html">Book a demo</a>
        </div>
      </nav>
      <div class="megamenu" id="mm-solutions" hidden>
        <div class="mm-inner">
          <a class="mm-item" href="cpq.html">
            <div class="mm-ico" style="background:#DBEAFE;color:#2563EB">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7h18M3 12h18M3 17h12"/></svg>
            </div>
            <div><div class="mm-title">CPQ</div><div class="mm-sub">Configure, price, and quote with precision.</div></div>
          </a>
          <a class="mm-item" href="subscription.html">
            <div class="mm-ico" style="background:#DCFCE7;color:#16A34A">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5"/></svg>
            </div>
            <div><div class="mm-title">Subscription Management</div><div class="mm-sub">Lifecycle, renewals, and usage analytics.</div></div>
          </a>
          <a class="mm-item" href="billing.html">
            <div class="mm-ico" style="background:#E2E8F0;color:#101A3A">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></svg>
            </div>
            <div><div class="mm-title">Billing Automation</div><div class="mm-sub">Flexible monetization for B2B SaaS.</div></div>
          </a>
          <a class="mm-item" href="process.html">
            <div class="mm-ico" style="background:#CFFAFE;color:#0891B2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8 6h6a4 4 0 0 1 4 4v6"/></svg>
            </div>
            <div><div class="mm-title">Process Optimisation</div><div class="mm-sub">Event-driven workflow automation.</div></div>
          </a>
          <a class="mm-item" href="sales.html">
            <div class="mm-ico" style="background:#EDE9FE;color:#7C3AED">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>
            </div>
            <div><div class="mm-title">Sales</div><div class="mm-sub">Pipeline, playbooks, and approvals.</div></div>
          </a>
        </div>
      </div>
    </header>
  `;

  const footHTML = `
    <footer class="site-foot">
      <div class="container">
        <div class="foot-grid">
          <div class="foot-brand">
            <a href="index.html" class="logo">
              <img src="assets/logo-white.png" alt="Agree Technologies" class="logo-img" />
            </a>
            <p class="foot-tag">A European revenue platform for B2B SaaS &amp; telecom — CPQ, billing, subscription, and process automation in one suite.</p>
          </div>
          <div>
            <h4>Platform</h4>
            <a href="platform.html">Introduction</a>
            <a href="platform.html#integration">Integration</a>
            <a href="platform.html#data-model">Extensible model</a>
            <a href="platform.html#process">Process engine</a>
            <a href="platform.html#analytics">Analytics</a>
            <a href="platform.html#deployment">Secure &amp; reliable</a>
          </div>
          <div>
            <h4>Solutions</h4>
            <a href="sales.html">Sales</a>
            <a href="cpq.html">CPQ</a>
            <a href="billing.html">Billing</a>
            <a href="subscription.html">Subscription</a>
            <a href="process.html">Process Optimisation</a>
          </div>
          <div>
            <h4>Company</h4>
            <a href="about.html">About</a>
            <a href="implementation.html">Implementation</a>
            <a href="contact.html">Contact</a>
          </div>
        </div>
        <div class="foot-bottom">
          <div>© 2026 Agree Technologies ApS · Copenhagen, Denmark</div>
        </div>
      </div>
    </footer>
  `;

  function inject() {
    const navMount = document.getElementById('site-nav');
    if (navMount) navMount.outerHTML = navHTML;
    const footMount = document.getElementById('site-foot');
    if (footMount) footMount.outerHTML = footHTML;

    // Structured data (Organization + WebSite) — injected once per page
    if (!document.getElementById('at-jsonld')) {
      const ld = document.createElement('script');
      ld.type = 'application/ld+json';
      ld.id = 'at-jsonld';
      ld.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': 'https://www.agree-tech.com/#organization',
            name: 'Agree Technologies',
            legalName: 'Agree Technologies ApS',
            url: 'https://www.agree-tech.com/',
            logo: 'https://www.agree-tech.com/assets/logo-black.png',
            description: 'A European revenue platform for B2B SaaS and telecom — CPQ, billing, subscription, and process automation in one suite.',
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Copenhagen',
              addressCountry: 'DK'
            }
          },
          {
            '@type': 'WebSite',
            '@id': 'https://www.agree-tech.com/#website',
            url: 'https://www.agree-tech.com/',
            name: 'Agree Technologies',
            publisher: { '@id': 'https://www.agree-tech.com/#organization' }
          }
        ]
      });
      document.head.appendChild(ld);
    }

    // Active page highlight
    document.querySelectorAll('.nav-link').forEach(el => {
      const href = el.getAttribute('href');
      if (href && location.pathname.endsWith(href)) {
        el.style.color = 'var(--navy)';
        el.style.background = 'var(--cloud)';
      }
    });

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
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
