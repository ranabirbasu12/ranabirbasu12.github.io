// Highlight active nav link based on scroll position
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-links a');

function updateActiveLink() {
  let current = '';
  const scrollPos = window.scrollY + window.innerHeight / 3;

  sections.forEach(section => {
    if (section.offsetTop <= scrollPos) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('active');
    }
  });
}

window.addEventListener('scroll', updateActiveLink);
window.addEventListener('load', updateActiveLink);

// Mobile menu
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebarOverlay');

function openMenu() {
  sidebar.classList.add('open');
  overlay.classList.add('open');
}

function closeMenu() {
  sidebar.classList.remove('open');
  overlay.classList.remove('open');
}

menuToggle.addEventListener('click', function () {
  if (sidebar.classList.contains('open')) {
    closeMenu();
  } else {
    openMenu();
  }
});

overlay.addEventListener('click', closeMenu);

navLinks.forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Infinite poster carousel
(function () {
  const track = document.getElementById('carouselTrack');
  if (!track) return;

  fetch('assets/posters/manifest.json')
    .then(function (res) { return res.json(); })
    .then(function (images) {
      if (!images.length) return;

      // Duplicate images for seamless infinite loop
      var allImages = images.concat(images);

      allImages.forEach(function (name) {
        var img = document.createElement('img');
        img.src = 'assets/posters/' + encodeURIComponent(name);
        img.alt = 'Design work';
        img.loading = 'lazy';
        track.appendChild(img);
      });

      // Adjust animation duration based on number of images
      var duration = images.length * 6;
      track.style.animationDuration = duration + 's';
    })
    .catch(function () {
      var msg = document.createElement('p');
      msg.style.color = '#999';
      msg.textContent = 'No posters loaded.';
      track.appendChild(msg);
    });
})();
