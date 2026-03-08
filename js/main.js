document.documentElement.classList.remove('no-js');
gsap.registerPlugin(ScrollTrigger);

// ---- Hero ----

function initHero() {
  const chars = document.querySelectorAll('.hero__name .char');
  const scrollIndicator = document.querySelector('.hero__scroll-indicator');
  const title = document.querySelector('.hero__title');
  const subtitle = document.querySelector('.hero__subtitle');

  gsap.to(chars, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    stagger: 0.05,
    ease: 'power3.out',
    delay: 0.3,
    onComplete: () => {
      gsap.to(title, { opacity: 1, duration: 0.8, ease: 'power2.out' });
      gsap.to(subtitle, { opacity: 0.6, duration: 0.8, delay: 0.3, ease: 'power2.out' });
      gsap.to(scrollIndicator, { opacity: 1, duration: 1, delay: 1 });
    }
  });

  gsap.to('.hero__content', {
    y: -100,
    opacity: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });
}

// ---- About ----

function initAbout() {
  gsap.fromTo('.about__inner',
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.about',
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    }
  );
}

// ---- Experience ----

function initExperience() {
  document.querySelectorAll('.timeline__item').forEach((item, i) => {
    gsap.fromTo(item,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        delay: i * 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  });
}

// ---- Education ----

function initEducation() {
  gsap.fromTo('.education__card',
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 0.7,
      stagger: 0.15,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.education__grid',
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    }
  );
}

// ---- Highlights ----

function initHighlights() {
  gsap.fromTo('.highlight-card',
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      duration: 0.7,
      stagger: 0.15,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.highlights__grid',
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    }
  );
}

// ---- Contact ----

function initContact() {
  gsap.fromTo('.contact',
    { opacity: 0 },
    {
      opacity: 1,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.contact',
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    }
  );
}

// ---- Initialize ----

document.addEventListener('DOMContentLoaded', () => {
  initHero();
  initAbout();
  initExperience();
  initEducation();
  initHighlights();
  initContact();
});
