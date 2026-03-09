/* ============================================================
   AI Minute Note — Main JS (Premium Interactions)
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     UTILITIES
     ============================================================ */
  function lerp(a, b, t) { return a + (b - a) * t; }

  function hexToRgb(hex) {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!r) return '255,255,255';
    return `${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}`;
  }

  const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  if (!isTouchDevice) {
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });
  }

  /* ============================================================
     1. GLOBAL CURSOR GLOW
     ============================================================ */
  if (!isTouchDevice) {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);

    let glowX = mouseX, glowY = mouseY;

    function updateGlow() {
      glowX = lerp(glowX, mouseX, 0.15);
      glowY = lerp(glowY, mouseY, 0.15);
      glow.style.transform = `translate(${glowX - 200}px, ${glowY - 200}px)`;
      requestAnimationFrame(updateGlow);
    }
    requestAnimationFrame(updateGlow);
  }

  /* ============================================================
     2. SCROLL PROGRESS BAR (top of page)
     ============================================================ */
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress-bar';
  document.body.appendChild(progressBar);

  /* ============================================================
     3. NAVBAR
     ============================================================ */
  const nav = document.getElementById('nav');

  let lastScrollY = 0;
  let ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        const sy = window.scrollY;

        // Nav background
        nav.classList.toggle('scrolled', sy > 40);

        // Scroll progress
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight > 0) {
          progressBar.style.transform = `scaleX(${sy / docHeight})`;
        }

        lastScrollY = sy;
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Mobile hamburger ---- */
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
      const bars = hamburger.querySelectorAll('span');
      if (isOpen) {
        bars[0].style.transform = 'translateY(7px) rotate(45deg)';
        bars[1].style.opacity   = '0';
        bars[2].style.transform = 'translateY(-7px) rotate(-45deg)';
      } else {
        bars[0].style.transform = '';
        bars[1].style.opacity   = '';
        bars[2].style.transform = '';
      }
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        const bars = hamburger.querySelectorAll('span');
        bars.forEach(b => { b.style.transform = ''; b.style.opacity = ''; });
      });
    });
  }

  const qrTrigger = document.getElementById('qrTrigger');
  const qrPopup = document.getElementById('qrPopup');

  if (qrTrigger && qrPopup) {
    qrTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      qrPopup.classList.toggle('open');
    });

    document.addEventListener('click', () => {
      qrPopup.classList.remove('open');
    });

    qrPopup.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  /* ---- Active nav link highlighting ---- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const sectionObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => sectionObs.observe(s));

  const navStyle = document.createElement('style');
  navStyle.textContent = `
    .nav-links a { position: relative; }
    .nav-links a::after {
      content: '';
      position: absolute;
      bottom: 0; left: 50%; right: 50%;
      height: 2px;
      background: linear-gradient(90deg, var(--purple), var(--cyan, #0891B2));
      border-radius: 1px;
      transition: left 0.3s cubic-bezier(0.4,0,0.2,1), right 0.3s cubic-bezier(0.4,0,0.2,1);
    }
    .nav-links a:hover::after,
    .nav-links a.active::after {
      left: 14px; right: 14px;
    }
    .nav-links a.active { color: var(--text-1); }
  `;
  document.head.appendChild(navStyle);

  /* ============================================================
     4. SCROLL REVEAL (IntersectionObserver)
     ============================================================ */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el => revealObs.observe(el));

  /* ============================================================
     5. HERO PARALLAX — enhanced mouse tracking
     ============================================================ */
  const heroSection = document.getElementById('hero');
  const heroOrbs    = document.querySelectorAll('.hero-bg .orb');
  const phoneScene  = document.querySelector('.phone-scene');
  const floatCards  = document.querySelectorAll('.float-card');

  if (!isTouchDevice && heroSection) {
    let heroMX = 0, heroMY = 0;
    let heroTargX = 0, heroTargY = 0;

    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      heroTargX = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
      heroTargY = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
    }, { passive: true });

    heroSection.addEventListener('mouseleave', () => {
      heroTargX = 0;
      heroTargY = 0;
    }, { passive: true });

    function animateHero() {
      heroMX = lerp(heroMX, heroTargX, 0.08);
      heroMY = lerp(heroMY, heroTargY, 0.08);

      heroOrbs.forEach((orb, i) => {
        const f = (i + 1) * 15;
        orb.style.transform = `translate(${heroMX * f}px, ${heroMY * f}px)`;
      });

      if (phoneScene) {
        phoneScene.style.transform = `rotateY(${heroMX * 5}deg) rotateX(${-heroMY * 3}deg)`;
      }

      floatCards.forEach((card, i) => {
        const f = (i + 1) * 8;
        const baseTransform = card.dataset.baseTransform || '';
        card.style.transform = `${baseTransform} translate(${heroMX * f}px, ${heroMY * f}px)`;
      });

      requestAnimationFrame(animateHero);
    }
    requestAnimationFrame(animateHero);
  }

  /* ---- Floating card entrance ---- */
  floatCards.forEach((card, i) => {
    card.style.opacity = '0';
    setTimeout(() => {
      card.style.transition = 'opacity 0.6s ease';
      card.style.opacity = '1';
    }, 800 + i * 200);
  });

  /* ============================================================
     6. UNIVERSAL 3D TILT for cards
     ============================================================ */
  function applyTilt(selector, intensity, glowColor) {
    if (isTouchDevice) return;
    document.querySelectorAll(selector).forEach(card => {
      card.style.willChange = 'transform';

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);

        card.style.transform = `perspective(800px) rotateX(${-dy * intensity}deg) rotateY(${dx * intensity}deg) translateY(-4px) scale(1.01)`;

        if (glowColor) {
          const px = ((e.clientX - rect.left) / rect.width) * 100;
          const py = ((e.clientY - rect.top)  / rect.height) * 100;
          card.style.setProperty('--glow-x', px + '%');
          card.style.setProperty('--glow-y', py + '%');
        }
      });

      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1)';
        card.style.transform = '';
        setTimeout(() => { card.style.transition = ''; }, 500);
      });

      card.addEventListener('mouseenter', () => {
        card.style.transition = 'transform 0.15s ease-out';
        setTimeout(() => { card.style.transition = ''; }, 150);
      });
    });
  }

  applyTilt('.use-card', 4, true);
  applyTilt('.bento-card', 3, true);
  applyTilt('.testi-card', 4, false);
  applyTilt('.blog-card', 3, true);
  applyTilt('.sec-cert-card', 5, false);

  /* ============================================================
     7. CARD SPOTLIGHT GLOW (mouse-following radial gradient)
     ============================================================ */
  if (!isTouchDevice) {
    document.querySelectorAll('.bento-card, .use-card, .blog-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width)  * 100;
        const y = ((e.clientY - rect.top)  / rect.height) * 100;
        const accent = card.dataset.accent || '#8B5CF6';
        card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(${hexToRgb(accent)},0.09) 0%, rgba(255,255,255,0.02) 60%)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.background = '';
      });
    });
  }

  /* ============================================================
     8. CARD BORDER GLOW (animated border following cursor)
     ============================================================ */
  if (!isTouchDevice) {
    const borderGlowStyle = document.createElement('style');
    borderGlowStyle.textContent = `
      .card-border-glow {
        position: absolute;
        inset: -1px;
        border-radius: inherit;
        pointer-events: none;
        z-index: 0;
        opacity: 0;
        transition: opacity 0.3s ease;
        background: radial-gradient(
          300px circle at var(--border-glow-x, 50%) var(--border-glow-y, 50%),
          rgba(139,92,246,0.2) 0%,
          transparent 70%
        );
        mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        mask-composite: exclude;
        -webkit-mask-composite: xor;
        padding: 1px;
      }
    `;
    document.head.appendChild(borderGlowStyle);

    document.querySelectorAll('.bento-card, .use-card, .encrypt-flow, .sec-certifications').forEach(card => {
      card.style.position = 'relative';
      const glowEl = document.createElement('div');
      glowEl.className = 'card-border-glow';
      card.insertBefore(glowEl, card.firstChild);

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        glowEl.style.setProperty('--border-glow-x', (e.clientX - rect.left) + 'px');
        glowEl.style.setProperty('--border-glow-y', (e.clientY - rect.top) + 'px');
        glowEl.style.opacity = '1';
      });
      card.addEventListener('mouseleave', () => {
        glowEl.style.opacity = '0';
      });
    });
  }

  /* ============================================================
     9. MAGNETIC BUTTONS
     ============================================================ */
  if (!isTouchDevice) {
    document.querySelectorAll('.btn-primary, .app-store-btn, .feedback-cta-btn').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top  + rect.height / 2;
        const dx = (e.clientX - cx) * 0.2;
        const dy = (e.clientY - cy) * 0.2;
        btn.style.transform = `translate(${dx}px, ${dy}px) scale(1.03)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transition = 'transform 0.4s cubic-bezier(0.4,0,0.2,1)';
        btn.style.transform = '';
        setTimeout(() => { btn.style.transition = ''; }, 400);
      });
    });
  }

  /* ---- Button click ripple ---- */
  document.querySelectorAll('.btn-primary, .app-store-btn, .feedback-cta-btn').forEach(btn => {
    btn.style.overflow = 'hidden';
    btn.style.position = 'relative';

    btn.addEventListener('click', (e) => {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'btn-ripple';
      ripple.style.left = (e.clientX - rect.left) + 'px';
      ripple.style.top  = (e.clientY - rect.top) + 'px';
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  /* ============================================================
     10. STAT COUNTER ANIMATION
     ============================================================ */
  function animateCounter(el, target, suffix) {
    const duration = 1600;
    const start = performance.now();
    const isDecimal = String(target).includes('.');

    function update(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = isDecimal
        ? (eased * target).toFixed(1)
        : Math.round(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const statsObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const raw = el.dataset.count;
        const suffix = el.dataset.suffix || '';
        if (raw) animateCounter(el, parseFloat(raw), suffix);
        statsObs.unobserve(el);
      }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(el => statsObs.observe(el));

  /* ============================================================
     11. SMOOTH SCROLL for anchor links
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ============================================================
     12. SECTION BACKGROUND MOUSE GRADIENT
     ============================================================ */
  if (!isTouchDevice) {
    document.querySelectorAll('.features, .security, .testimonials, .use-cases').forEach(section => {
      section.addEventListener('mousemove', (e) => {
        const rect = section.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        section.style.setProperty('--mouse-x', x + '%');
        section.style.setProperty('--mouse-y', y + '%');
      });
    });
  }

  /* ============================================================
     13. WAVEFORM ANIMATION
     ============================================================ */
  const waveform = document.querySelector('.waveform');
  if (waveform) {
    waveform.querySelectorAll('.wave-bar').forEach((bar, i) => {
      bar.style.setProperty('--i', String(i));
    });
  }

  /* ============================================================
     14. IPHONE APP UI 3-SCREEN CYCLER
     ============================================================ */
  (function () {
    const screens = [
      document.getElementById('uiS1'),
      document.getElementById('uiS2'),
      document.getElementById('uiS3')
    ];
    if (!screens[0]) return;

    const videos = [
      document.getElementById('uiV1'),
      document.getElementById('uiV2'),
      document.getElementById('uiV3')
    ];

    const INTERVAL = 5000;

    const cardData = [
      { left: ['Recording','00:23'],  right: ['Languages','99+'],     bottom: ['Live Transcribe','On'] },
      { left: ['Transcribing','AI...'], right: ['Speakers','3 found'],  bottom: ['Processing','85%'] },
      { left: ['Summary','Ready ✓'],  right: ['Accuracy','99.2%'],    bottom: ['Action Items','3 tasks'] }
    ];

    const els = {
      ll: document.getElementById('fcLeftLabel'),
      lv: document.getElementById('fcLeftVal'),
      rl: document.getElementById('fcRightLabel'),
      rv: document.getElementById('fcRightVal'),
      bl: document.getElementById('fcBottomLabel'),
      bv: document.getElementById('fcBottomVal'),
    };

    let current = 0;
    let timer = null;

    function showScreen(idx) {
      screens.forEach((s, i) => {
        if (s) s.classList.toggle('ui-active', i === idx);
      });
      videos.forEach((v, i) => {
        if (!v) return;
        if (i === idx) { v.currentTime = 0; v.play().catch(function(){}); }
        else { v.pause(); }
      });
      const d = cardData[idx];
      if (els.ll) {
        els.ll.textContent = d.left[0];  els.lv.textContent = d.left[1];
        els.rl.textContent = d.right[0]; els.rv.textContent = d.right[1];
        els.bl.textContent = d.bottom[0]; els.bv.textContent = d.bottom[1];
      }
    }

    function scheduleFromVideo() {
      var v = videos[current];
      if (v && v.duration && isFinite(v.duration) && v.duration > 0.5) {
        timer = setTimeout(next, v.duration * 1000);
      } else {
        timer = setTimeout(next, INTERVAL);
      }
    }

    function next() {
      current = (current + 1) % 3;
      showScreen(current);
      scheduleFromVideo();
    }

    videos.forEach(function(v) {
      if (v) {
        v.addEventListener('loadedmetadata', function() {
          if (videos.indexOf(v) === 0 && current === 0 && !timer) {
            clearTimeout(timer);
            scheduleFromVideo();
          }
        });
      }
    });

    showScreen(0);
    timer = setTimeout(next, INTERVAL);
  })();

  /* ============================================================
     15. CUSTOM VIDEO PLAYER
     ============================================================ */
  const demoVideo     = document.getElementById('demoVideo');
  const videoOverlay  = document.getElementById('videoOverlay');
  const videoFrame    = document.getElementById('videoFrame');
  const playBtn       = document.getElementById('playBtn');
  const vcPlayPause   = document.getElementById('vcPlayPause');
  const vcFill        = document.getElementById('vcFill');
  const vcThumb       = document.getElementById('vcThumb');
  const vcTime        = document.getElementById('vcTime');
  const vcMute        = document.getElementById('vcMute');
  const vcFullscreen  = document.getElementById('vcFullscreen');
  const vcProgressWrap = document.getElementById('vcProgressWrap');

  if (demoVideo) {
    function formatTime(s) {
      const m = Math.floor(s / 60);
      const sec = Math.floor(s % 60);
      return `${m}:${sec.toString().padStart(2, '0')}`;
    }

    function updateProgress() {
      if (!demoVideo.duration) return;
      const pct = (demoVideo.currentTime / demoVideo.duration) * 100;
      vcFill.style.width = pct + '%';
      vcThumb.style.left = pct + '%';
      vcTime.textContent = `${formatTime(demoVideo.currentTime)} / ${formatTime(demoVideo.duration)}`;
    }

    function startPlay() {
      demoVideo.play();
      videoOverlay.classList.add('hidden');
      videoFrame.classList.add('playing');
      vcPlayPause.querySelector('.icon-play').style.display  = 'none';
      vcPlayPause.querySelector('.icon-pause').style.display = 'block';
    }

    function pausePlay() {
      demoVideo.pause();
      videoFrame.classList.remove('playing');
      vcPlayPause.querySelector('.icon-play').style.display  = 'block';
      vcPlayPause.querySelector('.icon-pause').style.display = 'none';
    }

    playBtn.addEventListener('click', (e) => { e.stopPropagation(); startPlay(); });

    videoFrame.addEventListener('click', (e) => {
      if (e.target.closest('.video-controls') || e.target.closest('#playBtn')) return;
      if (demoVideo.paused) startPlay(); else pausePlay();
    });

    vcPlayPause.addEventListener('click', (e) => {
      e.stopPropagation();
      if (demoVideo.paused) startPlay(); else pausePlay();
    });

    demoVideo.addEventListener('timeupdate', updateProgress);
    demoVideo.addEventListener('loadedmetadata', updateProgress);

    vcProgressWrap.addEventListener('click', (e) => {
      e.stopPropagation();
      const rect = vcProgressWrap.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      demoVideo.currentTime = pct * demoVideo.duration;
    });

    vcMute.addEventListener('click', (e) => {
      e.stopPropagation();
      demoVideo.muted = !demoVideo.muted;
      vcMute.querySelector('.icon-vol').style.display   = demoVideo.muted ? 'none'  : 'block';
      vcMute.querySelector('.icon-muted').style.display = demoVideo.muted ? 'block' : 'none';
    });

    vcFullscreen.addEventListener('click', (e) => {
      e.stopPropagation();
      if (videoFrame.requestFullscreen) videoFrame.requestFullscreen();
      else if (videoFrame.webkitRequestFullscreen) videoFrame.webkitRequestFullscreen();
    });

    demoVideo.addEventListener('ended', () => {
      pausePlay();
      videoOverlay.classList.remove('hidden');
      demoVideo.currentTime = 0;
    });
  }

  /* ============================================================
     16. BLOG READING PROGRESS + SCROLL-TO-TOP
     ============================================================ */
  const blogArticleBody = document.querySelector('.blog-article-body');
  if (blogArticleBody) {
    const readingBar = document.createElement('div');
    readingBar.className = 'reading-progress';
    document.body.appendChild(readingBar);

    function updateReadingProgress() {
      const rect = blogArticleBody.getBoundingClientRect();
      const articleTop = rect.top + window.scrollY - 200;
      const articleHeight = rect.height;
      const scrolled = window.scrollY - articleTop;
      const pct = Math.max(0, Math.min(100, (scrolled / articleHeight) * 100));
      readingBar.style.width = pct + '%';
    }
    window.addEventListener('scroll', updateReadingProgress, { passive: true });
    updateReadingProgress();
  }

  if (document.querySelector('.blog-page')) {
    const scrollBtn = document.createElement('button');
    scrollBtn.className = 'scroll-top-btn';
    scrollBtn.setAttribute('aria-label', 'Scroll to top');
    scrollBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>';
    document.body.appendChild(scrollBtn);

    window.addEventListener('scroll', () => {
      scrollBtn.classList.toggle('visible', window.scrollY > 600);
    }, { passive: true });

    scrollBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============================================================
     17. CERTIFICATION CARDS STAGGER ENTRANCE
     ============================================================ */
  const certCards = document.querySelectorAll('.sec-cert-card');
  const certObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        certCards.forEach((b, i) => {
          setTimeout(() => {
            b.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            b.style.opacity = '1';
            b.style.transform = 'translateY(0)';
          }, i * 120);
        });
        certObs.disconnect();
      }
    });
  }, { threshold: 0.3 });

  if (certCards.length) {
    certCards.forEach(b => { b.style.opacity = '0'; b.style.transform = 'translateY(12px)'; });
    certObs.observe(certCards[0].closest('.sec-certifications') || certCards[0]);
  }

  /* ============================================================
     18. STAGGER REVEAL for grid children
     ============================================================ */
  function staggerReveal(containerSel, childSel, delayMs) {
    document.querySelectorAll(containerSel).forEach(container => {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            container.querySelectorAll(childSel).forEach((child, i) => {
              child.style.opacity = '0';
              child.style.transform = 'translateY(16px)';
              setTimeout(() => {
                child.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                child.style.opacity = '1';
                child.style.transform = 'translateY(0)';
              }, i * delayMs);
            });
            obs.disconnect();
          }
        });
      }, { threshold: 0.15 });
      obs.observe(container);
    });
  }

  staggerReveal('.encrypt-flow', '.encrypt-data-line', 100);

  /* ============================================================
     19. FEEDBACK FORM
     ============================================================ */
  const feedbackForm = document.getElementById('feedbackForm');
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', function (e) {
      const btn = document.getElementById('submitBtn');
      let valid = true;

      feedbackForm.querySelectorAll('.form-input.error, .form-textarea.error').forEach(el => el.classList.remove('error'));
      feedbackForm.querySelectorAll('.form-error-msg.show').forEach(el => el.classList.remove('show'));

      const name    = document.getElementById('userName');
      const email   = document.getElementById('userEmail');
      const message = document.getElementById('userMessage');

      if (!name.value.trim()) { name.classList.add('error'); valid = false; }
      if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { email.classList.add('error'); valid = false; }
      if (!message.value.trim()) { message.classList.add('error'); valid = false; }

      if (!valid) { 
        return; 
      }

      e.preventDefault();
      
      btn.classList.add('sending');
      btn.disabled = true;
      btn.innerHTML = '<span class="btn-spinner"></span> Sending...';

      const formData = new FormData(feedbackForm);
      
      fetch(feedbackForm.action, {
        method: 'POST',
        body: formData,
        mode: 'no-cors'
      })
      .then(() => {
        feedbackForm.style.display = 'none';
        const successEl = document.getElementById('feedbackSuccess');
        if (successEl) successEl.style.display = 'block';
      })
      .catch(() => {
        btn.classList.remove('sending');
        btn.disabled = false;
        btn.innerHTML = 'Send Feedback';
      });
    });
  }

  /* ============================================================
     20. TEXT HEADING GRADIENT ON HOVER
     ============================================================ */
  if (!isTouchDevice) {
    document.querySelectorAll('.section-title').forEach(title => {
      title.addEventListener('mouseenter', () => {
        title.style.transition = 'background-size 0.4s ease';
        title.style.backgroundImage = 'linear-gradient(135deg, var(--text-1) 0%, #7C3AED 50%, #0891B2 100%)';
        title.style.backgroundSize = '200% 100%';
        title.style.backgroundClip = 'text';
        title.style.webkitBackgroundClip = 'text';
        title.style.webkitTextFillColor = 'transparent';
        title.style.backgroundPosition = 'right center';
      });
      title.addEventListener('mouseleave', () => {
        title.style.transition = 'all 0.5s ease';
        title.style.backgroundImage = '';
        title.style.backgroundSize = '';
        title.style.backgroundClip = '';
        title.style.webkitBackgroundClip = '';
        title.style.webkitTextFillColor = '';
        title.style.backgroundPosition = '';
      });
    });
  }

})();
