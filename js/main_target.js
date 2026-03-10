document.documentElement.classList.remove('no-js');
gsap.registerPlugin(ScrollTrigger);

// ---- Hero ----
function initHero() {
  const chars = document.querySelectorAll('.hero__name .char');
  const pre = document.querySelector('.hero__pre');
  const info = document.querySelector('.hero__info');
  const scroll = document.querySelector('.hero__scroll');

  const tl = gsap.timeline({ delay: 0.5 });

  tl.to(pre, { opacity: 1, duration: 0.6, ease: 'power2.out' })
    .to(chars, { opacity: 1, y: 0, duration: 0.5, stagger: 0.04, ease: 'power3.out' }, '-=0.2')
    .to(info, { opacity: 1, duration: 0.8, ease: 'power2.out' }, '-=0.2')
    .to(scroll, { opacity: 1, duration: 0.8 }, '-=0.4');

  gsap.to('.hero__content', {
    y: -80,
    opacity: 0,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });

  gsap.to('.hero__bg-img', {
    scale: 1.1,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });
}

// ---- Labels ----
function initLabels() {
  document.querySelectorAll('.about__label, .experience__label, .education__label, .highlights__label').forEach(label => {
    gsap.fromTo(label, { opacity: 0, y: 20 }, {
      opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
      scrollTrigger: { trigger: label, start: 'top 92%', toggleActions: 'play none none none' }
    });
  });
}

// ---- About ----
function initAbout() {
  gsap.fromTo('.about__grid', { opacity: 0, y: 40 }, {
    opacity: 1, y: 0, duration: 1, ease: 'power2.out',
    scrollTrigger: { trigger: '.about__grid', start: 'top 88%', toggleActions: 'play none none none' }
  });
}

// ---- Experience ----
function initExperience() {
  document.querySelectorAll('.exp-card').forEach((card, i) => {
    gsap.fromTo(card, { opacity: 0, y: 30 }, {
      opacity: 1, y: 0, duration: 0.6, delay: i * 0.08, ease: 'power2.out',
      scrollTrigger: { trigger: card, start: 'top 92%', toggleActions: 'play none none none' }
    });
  });
}

// ---- Education ----
function initEducation() {
  gsap.fromTo('.edu-card', { opacity: 0, y: 30 }, {
    opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: 'power2.out',
    scrollTrigger: { trigger: '.education__grid', start: 'top 88%', toggleActions: 'play none none none' }
  });
}

// ---- Highlights ----
function initHighlights() {
  gsap.fromTo('.hl-card', { opacity: 0, y: 30 }, {
    opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
    scrollTrigger: { trigger: '.highlights__grid', start: 'top 88%', toggleActions: 'play none none none' }
  });
}

// ---- Contact ----
function initContact() {
  gsap.fromTo('.contact__content', { opacity: 0, y: 30 }, {
    opacity: 1, y: 0, duration: 1, ease: 'power2.out',
    scrollTrigger: { trigger: '.contact', start: 'top 80%', toggleActions: 'play none none none' }
  });
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  initHero();
  initLabels();
  initAbout();
  initExperience();
  initEducation();
  initHighlights();
  initContact();
});
