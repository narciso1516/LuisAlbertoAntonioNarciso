document.addEventListener('DOMContentLoaded', () => {
  const revealElements = document.querySelectorAll('.soft-reveal');
  const stories = document.querySelectorAll('.story-session');
  const overlay = document.querySelector('.page-transition-overlay');
  const navLinks = document.querySelectorAll('nav a[href^="#"], .actions a[href^="#"]');
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const transitionMap = {
    proposito: 'slide-left',
    nem: 'slide-up',
    ruta: 'scale',
    metodologia: 'rotate',
    evaluacion: 'depth',
    familias: 'fade'
  };
  const show = (el) => el.classList.add('soft-visible');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          show(entry.target);
          revealObserver.unobserve(entry.target);
        }
      });
    }, {threshold:.12, rootMargin:'0px 0px -4% 0px'});
    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach(show);
  }
  stories.forEach((story) => {
    story.classList.add('story-visible');
    setTimeout(() => story.classList.add('story-complete'), 900);
  });
  const updateCurrentNav = (id) => {
    document.querySelectorAll('nav a').forEach((link) => {
      link.classList.toggle('is-current', link.getAttribute('href') === '#' + id);
    });
  };
  let animating = false;
  const runTransition = (target) => {
    if (!target || animating) return;
    const reduced = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    const effect = transitionMap[target.id] || 'fade';
    document.querySelectorAll('.target-section').forEach(el => el.classList.remove('target-section'));
    target.classList.add('target-section');
    document.body.dataset.transition = effect;
    if (reduced) {
      target.scrollIntoView({behavior:'auto',block:'start'});
      updateCurrentNav(target.id);
      history.replaceState(null,'','#'+target.id);
      return;
    }
    animating = true;
    document.body.classList.remove('pt-in');
    document.body.classList.add('pt-out');
    if (overlay) {
      overlay.classList.remove('is-active');
      void overlay.offsetWidth;
      overlay.classList.add('is-active');
    }
    setTimeout(() => {
      target.scrollIntoView({behavior:'auto',block:'start'});
      document.body.classList.remove('pt-out');
      document.body.classList.add('pt-in');
      updateCurrentNav(target.id);
      history.replaceState(null,'','#'+target.id);
      setTimeout(() => {
        document.body.classList.remove('pt-in');
        if (overlay) overlay.classList.remove('is-active');
        animating = false;
      }, 520);
    }, 300);
  };
  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.getElementById(link.getAttribute('href').slice(1));
      if (!target) return;
      event.preventDefault();
      runTransition(target);
    });
  });
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter(e => e.isIntersecting)
        .sort((a,b) => b.intersectionRatio-a.intersectionRatio)[0];
      if (visible && !animating) updateCurrentNav(visible.target.id);
    }, {threshold:[.25,.45,.7],rootMargin:'-15% 0px -60% 0px'});
    sections.forEach(section => sectionObserver.observe(section));
  }
  const initial = location.hash ? document.querySelector(location.hash) : sections[0];
  if (initial) updateCurrentNav(initial.id);

  const creditStyles = document.createElement('style');
  creditStyles.textContent = `
    .author-credit{margin-top:24px;padding:18px 20px;border:1px solid rgba(66,133,244,.2);border-radius:20px;background:linear-gradient(135deg,rgba(232,240,254,.9),rgba(245,237,255,.82));display:grid;grid-template-columns:auto 1fr;gap:14px;align-items:center;max-width:760px}
    .author-credit__mark{width:46px;height:46px;border-radius:15px;display:grid;place-items:center;color:#fff;font-weight:900;background:linear-gradient(135deg,#4285f4,#7b61ff);box-shadow:0 8px 22px rgba(66,133,244,.22)}
    .author-credit__label{display:block;font-size:.72rem;text-transform:uppercase;letter-spacing:.12em;font-weight:850;color:#2858a7;margin-bottom:2px}
    .author-credit__name{display:block;font-size:1.05rem;font-weight:850;color:#172033;line-height:1.25}
    .author-credit__meta{display:block;font-size:.88rem;color:#5d687a;margin-top:3px}
    .footer-credit{margin-top:18px;padding-top:16px;border-top:1px solid #d8dee8;font-size:.88rem;line-height:1.6;color:#4f5b6d}
    .footer-credit strong{color:#172033}
    @media(max-width:620px){.author-credit{grid-template-columns:1fr}.author-credit__mark{width:40px;height:40px}}
  `;
  document.head.appendChild(creditStyles);

  const heroCard = document.querySelector('.hero-card');
  if (heroCard && !document.querySelector('.author-credit')) {
    const credit = document.createElement('div');
    credit.className = 'author-credit';
    credit.innerHTML = `
      <div class="author-credit__mark">LA</div>
      <div>
        <span class="author-credit__label">Diseño y desarrollo académico</span>
        <span class="author-credit__name">Ing. Luis Alberto Antonio Narciso</span>
        <span class="author-credit__meta">Curso de Verano 2026 para niñas y niños de Poblado Tres · Duración: 6 semanas, 18 sesiones, 3 encuentros por semana.</span>
      </div>`;
    const actions = heroCard.querySelector('.actions');
    heroCard.insertBefore(credit, actions || null);
  }

  const footerInner = document.querySelector('footer .inner');
  if (footerInner && !document.querySelector('.footer-credit')) {
    const footerCredit = document.createElement('div');
    footerCredit.className = 'footer-credit';
    footerCredit.innerHTML = `<strong>Diseño pedagógico, contenido y desarrollo web:</strong> © 2026 Ing. Luis Alberto Antonio Narciso. Proyecto elaborado para el Curso de Verano de niñas y niños de Poblado Tres, Tres Valles, Veracruz. <strong>Duración:</strong> seis semanas, con 18 sesiones distribuidas en tres encuentros por semana.`;
    footerInner.appendChild(footerCredit);
  }
});