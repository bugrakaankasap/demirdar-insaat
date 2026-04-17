/* ═══════════════════════════════════════════════════════
   DEMIRDAR İNŞAAT — Scroll-Driven Video + Interactions
   GSAP ScrollTrigger + Video Scrub + Parallax + Reveals
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    setTimeout(initApp, 500);
    return;
  }
  initApp();
});

function initApp() {
  gsap.registerPlugin(ScrollTrigger);

  initVideoScrub();
  initNavigation();
  initScrollProgress();
  initParallax();
  initRevealAnimations();
  initCounterAnimations();
  initHeroAnimations();
}

/* ══════════════════════════════════════════════════════════
   SCROLL-DRIVEN VIDEO
   ══════════════════════════════════════════════════════════ */
function initVideoScrub() {
  const video = document.getElementById('scroll-video');
  const scrollZone = document.getElementById('video-scroll-zone');
  const overlay = document.getElementById('video-overlay');
  const videoContainer = document.getElementById('video-container');

  if (!video || !scrollZone) return;

  // Force the video to load
  video.load();

  function onReady() {
    const duration = video.duration;
    if (!duration || isNaN(duration)) return;

    console.log('Video ready! Duration:', duration, 'seconds');

    // Set initial frame
    video.currentTime = 0;
    video.pause();

    // Main scroll → video scrub
    ScrollTrigger.create({
      trigger: scrollZone,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.5, // Added inertia (slower, smoother)
      onUpdate: (self) => {
        const targetTime = self.progress * duration;
        // requestVideoFrameCallback for smoother scrub where supported
        if (Math.abs(video.currentTime - targetTime) > 0.01) {
          video.currentTime = targetTime;
        }
      }
    });

    // Overlay darkening as user scrolls
    ScrollTrigger.create({
      trigger: scrollZone,
      start: 'top top',
      end: '75% top', // Changed from 60% since the container is much taller now
      scrub: 1,
      onUpdate: (self) => {
        const p = self.progress;
        const alpha1 = 0.15 + p * 0.35; // 0.15 -> 0.50
        const alpha2 = 0.25 + p * 0.35; // 0.25 -> 0.60
        const alpha3 = 0.40 + p * 0.20; // 0.40 -> 0.60
        overlay.style.background = `linear-gradient(180deg, rgba(10,10,18,${alpha1}) 0%, rgba(10,10,18,${alpha2}) 40%, rgba(10,10,18,${alpha3}) 100%)`;
      }
    });

    // Hide fixed video when past the scroll zone
    ScrollTrigger.create({
      trigger: scrollZone,
      start: 'bottom bottom',
      end: 'bottom top', 
      onLeave: () => {
        gsap.to(videoContainer, { opacity: 0, duration: 0.3 });
      },
      onEnterBack: () => {
        gsap.to(videoContainer, { opacity: 1, duration: 0.3 });
      }
    });

    console.log('ScrollTrigger video scrub initialized');
  }

  // Try multiple approaches to detect video readiness
  if (video.readyState >= 2) {
    // Already loaded enough data
    onReady();
  } else {
    video.addEventListener('canplay', function handler() {
      video.removeEventListener('canplay', handler);
      onReady();
    });
    // Fallback timeout
    setTimeout(() => {
      if (video.readyState >= 1 && video.duration) {
        onReady();
      }
    }, 2000);
  }
}

/* ── NAVIGATION ───────────────────────────────────────── */
function initNavigation() {
  const nav = document.getElementById('main-nav');

  ScrollTrigger.create({
    start: 'top -80',
    onUpdate: (self) => {
      if (self.direction === 1 && self.scroll() > 80) {
        nav.classList.add('nav--scrolled');
      } else if (self.scroll() <= 80) {
        nav.classList.remove('nav--scrolled');
      }
    }
  });

  document.querySelectorAll('.nav__links a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        gsap.to(window, {
          duration: 1.2,
          scrollTo: { y: target, offsetY: 80 },
          ease: 'power3.inOut'
        });
      }
    });
  });
}

/* ── SCROLL PROGRESS BAR ─────────────────────────────── */
function initScrollProgress() {
  const progressBar = document.getElementById('scroll-progress');

  ScrollTrigger.create({
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      progressBar.style.width = (self.progress * 100) + '%';
    }
  });
}

/* ── PARALLAX BACKGROUNDS ─────────────────────────────── */
function initParallax() {
  document.querySelectorAll('[data-speed]').forEach(el => {
    const speed = parseFloat(el.dataset.speed);
    const parent = el.closest('.section');

    gsap.to(el, {
      y: () => window.innerHeight * speed * 0.8,
      ease: 'none',
      scrollTrigger: {
        trigger: parent,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5,
        invalidateOnRefresh: true
      }
    });
  });
}

/* ── REVEAL ANIMATIONS ────────────────────────────────── */
function initRevealAnimations() {
  document.querySelectorAll('.reveal-up, .reveal-scale').forEach(el => {
    const delayAttr = el.style.getPropertyValue('--delay');
    const delay = delayAttr ? parseFloat(delayAttr) : 0;

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        setTimeout(() => el.classList.add('revealed'), delay * 1000);
      }
    });
  });
}

/* ── COUNTER ANIMATIONS ───────────────────────────────── */
function initCounterAnimations() {
  document.querySelectorAll('.stat__number[data-count]').forEach(counter => {
    const target = parseInt(counter.dataset.count);

    ScrollTrigger.create({
      trigger: counter,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to(counter, {
          duration: 2,
          ease: 'power2.out',
          innerText: target,
          snap: { innerText: 1 },
          onUpdate() {
            const val = Math.round(gsap.getProperty(counter, 'innerText'));
            counter.textContent = val + '+';
          },
          onComplete() {
            counter.textContent = target + '+';
          }
        });
      }
    });
  });
}

/* ── HERO ENTRANCE ANIMATIONS ─────────────────────────── */
function initHeroAnimations() {
  const tl = gsap.timeline({ delay: 0.3 });

  tl.from('.hero__badge', {
    y: 30, opacity: 0, duration: 0.8, ease: 'power3.out'
  })
  .from('.hero__title-line', {
    y: 80, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.15
  }, '-=0.4')
  .from('.hero__subtitle', {
    y: 30, opacity: 0, duration: 0.8, ease: 'power3.out'
  }, '-=0.5')
  .from('.hero__scroll-indicator', {
    y: 20, opacity: 0, duration: 0.6, ease: 'power3.out'
  }, '-=0.3');

  gsap.to('.hero__content', {
    y: -100,
    opacity: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: '.section--hero',
      start: 'top top',
      end: '60% top',
      scrub: 1
    }
  });
}
