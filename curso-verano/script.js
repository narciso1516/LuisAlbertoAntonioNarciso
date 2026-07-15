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
});