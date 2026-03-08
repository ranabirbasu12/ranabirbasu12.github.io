gsap.registerPlugin(ScrollTrigger);

// ---- Hero: staggered letter reveal ----

function initHero() {
  const chars = document.querySelectorAll('.hero__name .char');
  const scrollIndicator = document.querySelector('.hero__scroll-indicator');

  gsap.to(chars, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    stagger: 0.05,
    ease: 'power3.out',
    delay: 0.3,
    onComplete: () => {
      typeTagline();
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

// ---- Hero: typewriter effect ----

function typeTagline() {
  const el = document.querySelector('.hero__tagline');
  const text = 'From a monastery school to private credit \u2014 a story of curiosity.';
  let i = 0;

  function type() {
    if (i < text.length) {
      el.textContent += text.charAt(i);
      i++;
      setTimeout(type, 30);
    }
  }

  type();
}

// ---- Arc: chapter reveals ----

function initArc() {
  gsap.fromTo('.arc__timeline-line',
    { scaleY: 0 },
    {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: '.arc',
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: true
      }
    }
  );

  document.querySelectorAll('.arc__chapter').forEach((chapter) => {
    const isLeft = chapter.classList.contains('arc__chapter--left');

    gsap.fromTo(chapter,
      { opacity: 0, x: isLeft ? -60 : 60, y: 40 },
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: chapter,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  const photo = document.querySelector('.arc__photo');
  if (photo) {
    gsap.fromTo(photo,
      { opacity: 0, x: -40 },
      {
        opacity: 1,
        x: 0,
        duration: 1.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: photo,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  }
}

// ---- Highlights: staggered card reveal ----

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

// ---- Bits: paragraph fade-ins ----

function initBits() {
  gsap.fromTo('.bits__heading',
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.bits__heading',
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    }
  );

  document.querySelectorAll('.bits__content p').forEach((p) => {
    gsap.fromTo(p,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: p,
          start: 'top 88%',
          toggleActions: 'play none none none'
        }
      }
    );
  });
}

// ---- Contact: fade in ----

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
  initArc();
  initHighlights();
  initBits();
  initContact();
});
