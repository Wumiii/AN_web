/* ============================================================
   AI Minute Note — Main JS
   ============================================================ */

(function () {
  'use strict';

  /* ---- Navbar scroll effect ---- */
  const nav = document.getElementById('nav');

  function onScroll() {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Mobile hamburger menu ---- */
  const hamburger   = document.getElementById('hamburger');
  const mobileMenu  = document.getElementById('mobileMenu');

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));

    // Animate bars
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

  // Close mobile menu when a link is clicked
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      const bars = hamburger.querySelectorAll('span');
      bars[0].style.transform = '';
      bars[1].style.opacity   = '';
      bars[2].style.transform = '';
    });
  });

  /* ---- QR Code popup toggle ---- */
  const qrTrigger = document.getElementById('qrTrigger');
  const qrPopup   = document.getElementById('qrPopup');

  qrTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    qrPopup.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!qrPopup.contains(e.target) && !qrTrigger.contains(e.target)) {
      qrPopup.classList.remove('open');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') qrPopup.classList.remove('open');
  });

  /* ---- Scroll Reveal (IntersectionObserver) ---- */
  const revealEls = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );

  revealEls.forEach(el => observer.observe(el));

  /* ---- Smooth active nav link highlighting ---- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach(s => sectionObserver.observe(s));

  /* ---- Animate stats counter in hero ---- */
  function animateCounter(el, target, suffix) {
    const duration = 1600;
    const start    = performance.now();
    const isDecimal = String(target).includes('.');

    function update(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = isDecimal
        ? (eased * target).toFixed(1)
        : Math.round(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const raw = el.dataset.count;
          const suffix = el.dataset.suffix || '';
          if (raw) animateCounter(el, parseFloat(raw), suffix);
          statsObserver.unobserve(el);
        }
      });
    },
    { threshold: 0.6 }
  );

  document.querySelectorAll('[data-count]').forEach(el => statsObserver.observe(el));

  /* ---- Parallax effect on hero orbs ---- */
  const heroOrbs = document.querySelectorAll('.hero-bg .orb');

  window.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;

    heroOrbs.forEach((orb, i) => {
      const factor = (i + 1) * 10;
      orb.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
    });
  }, { passive: true });

  /* ---- Live transcript typewriter simulation ---- */
  const transcriptLines = document.querySelectorAll('.transcript-line');

  function cycleTranscript() {
    let current = 0;
    transcriptLines.forEach(l => l.classList.remove('active-line'));

    setInterval(() => {
      transcriptLines.forEach(l => l.classList.remove('active-line'));
      current = (current + 1) % transcriptLines.length;
      transcriptLines[current].classList.add('active-line');
    }, 2800);
  }

  if (transcriptLines.length) cycleTranscript();

  /* ---- Bento card hover glow ---- */
  document.querySelectorAll('.bento-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const x      = ((e.clientX - rect.left) / rect.width)  * 100;
      const y      = ((e.clientY - rect.top)  / rect.height) * 100;
      const accent = card.dataset.accent || '#8B5CF6';
      card.style.setProperty('--gx', `${x}%`);
      card.style.setProperty('--gy', `${y}%`);
      card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(${hexToRgb(accent)},0.1) 0%, rgba(255,255,255,0.04) 60%)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.background = '';
    });
  });

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '255,255,255';
    return `${parseInt(result[1],16)},${parseInt(result[2],16)},${parseInt(result[3],16)}`;
  }

  /* ---- Use card hover glow ---- */
  document.querySelectorAll('.use-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x    = ((e.clientX - rect.left) / rect.width)  * 100;
      const y    = ((e.clientY - rect.top)  / rect.height) * 100;
      card.style.setProperty('--mx', `${x}%`);
      card.style.setProperty('--my', `${y}%`);
    });
  });

  /* ---- Smooth scroll for anchor links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80; // nav height
        const top    = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ---- Waveform animation stagger reset on visibility ---- */
  const waveform = document.querySelector('.waveform');
  if (waveform) {
    // Add index CSS var for staggered animation
    waveform.querySelectorAll('.wave-bar').forEach((bar, i) => {
      bar.style.setProperty('--i', String(i));
    });
  }

  /* ---- App Store button click feedback ---- */
  document.querySelectorAll('.app-store-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.style.transform = 'scale(0.97)';
      setTimeout(() => { btn.style.transform = ''; }, 150);
    });
  });

  /* ---- Floating card entrance animation ---- */
  const floatCards = document.querySelectorAll('.float-card');
  floatCards.forEach((card, i) => {
    card.style.opacity  = '0';
    card.style.transform = card.style.transform + ' translateY(20px)';
    setTimeout(() => {
      card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      card.style.opacity    = '1';
      card.style.transform  = '';
    }, 800 + i * 200);
  });

  /* ---- Nav active link style ---- */
  const style = document.createElement('style');
  style.textContent = `.nav-links a.active { color: var(--text-1); background: var(--bg-card); }`;
  document.head.appendChild(style);

  /* ---- Step cards hover glow ---- */
  document.querySelectorAll('.step-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x    = ((e.clientX - rect.left) / rect.width)  * 100;
      const y    = ((e.clientY - rect.top)  / rect.height) * 100;
      card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(139,92,246,0.08) 0%, rgba(255,255,255,0.04) 70%)`;
    });
    card.addEventListener('mouseleave', () => { card.style.background = ''; });
  });

  /* ---- Testimonial cards hover tilt ---- */
  document.querySelectorAll('.testi-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `translateY(-3px) rotateX(${-dy * 3}deg) rotateY(${dx * 3}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.4s ease';
      setTimeout(() => { card.style.transition = ''; }, 400);
    });
  });

  /* ---- Step number animated gradient reveal ---- */
  document.querySelectorAll('.step-card').forEach((card, i) => {
    const numEl = card.querySelector('.step-num');
    if (!numEl) return;
    const colors = ['#8B5CF6', '#06B6D4', '#10B981'];
    const stepObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          numEl.style.background = `linear-gradient(135deg, ${colors[i % 3]}44, ${colors[(i+1) % 3]}22)`;
          numEl.style.webkitBackgroundClip = 'text';
          numEl.style.webkitTextFillColor = 'transparent';
          numEl.style.backgroundClip = 'text';
          stepObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    stepObs.observe(card);
  });

  /* ---- iPhone App UI 3-Screen Cycler ---- */
  (function () {
    const screens = [
      document.getElementById('uiS1'),
      document.getElementById('uiS2'),
      document.getElementById('uiS3')
    ];
    if (!screens[0]) return;

    const TIMINGS = [3800, 3500, 4000]; // ms each screen stays visible

    const cardData = [
      { left: ['Recording','00:23'],  right: ['Languages','99+'],     bottom: ['Live Transcribe','On'] },
      { left: ['Processing','55%'],   right: ['Speakers','3 found'],  bottom: ['Taking Notes','AI...'] },
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

    function showScreen(idx) {
      screens.forEach((s, i) => {
        if (!s) return;
        s.classList.toggle('ui-active', i === idx);
      });

      // Update floating cards
      const d = cardData[idx];
      if (els.ll) {
        els.ll.textContent = d.left[0];  els.lv.textContent = d.left[1];
        els.rl.textContent = d.right[0]; els.rv.textContent = d.right[1];
        els.bl.textContent = d.bottom[0]; els.bv.textContent = d.bottom[1];
      }
    }

    function next() {
      current = (current + 1) % 3;
      showScreen(current);
      setTimeout(next, TIMINGS[current]);
    }

    showScreen(0);
    setTimeout(next, TIMINGS[0]);
  })();

  /* ---- Custom Video Player ---- */
  const demoVideo    = document.getElementById('demoVideo');
  const videoOverlay = document.getElementById('videoOverlay');
  const videoFrame   = document.getElementById('videoFrame');
  const playBtn      = document.getElementById('playBtn');
  const vcPlayPause  = document.getElementById('vcPlayPause');
  const vcFill       = document.getElementById('vcFill');
  const vcThumb      = document.getElementById('vcThumb');
  const vcTime       = document.getElementById('vcTime');
  const vcMute       = document.getElementById('vcMute');
  const vcFullscreen = document.getElementById('vcFullscreen');
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
      vcFill.style.width  = pct + '%';
      vcThumb.style.left  = pct + '%';
      vcTime.textContent  = `${formatTime(demoVideo.currentTime)} / ${formatTime(demoVideo.duration)}`;
    }

    function startPlay() {
      demoVideo.play();
      videoOverlay.classList.add('hidden');
      videoFrame.classList.add('playing');
      // toggle icons
      vcPlayPause.querySelector('.icon-play').style.display  = 'none';
      vcPlayPause.querySelector('.icon-pause').style.display = 'block';
    }

    function pausePlay() {
      demoVideo.pause();
      videoFrame.classList.remove('playing');
      vcPlayPause.querySelector('.icon-play').style.display  = 'block';
      vcPlayPause.querySelector('.icon-pause').style.display = 'none';
    }

    // Big play button click
    playBtn.addEventListener('click', (e) => { e.stopPropagation(); startPlay(); });

    // Click on video frame (not controls) toggles play/pause
    videoFrame.addEventListener('click', (e) => {
      if (e.target.closest('.video-controls') || e.target.closest('#playBtn')) return;
      if (demoVideo.paused) startPlay(); else pausePlay();
    });

    // Control bar play/pause
    vcPlayPause.addEventListener('click', (e) => {
      e.stopPropagation();
      if (demoVideo.paused) startPlay(); else pausePlay();
    });

    // Progress update
    demoVideo.addEventListener('timeupdate', updateProgress);
    demoVideo.addEventListener('loadedmetadata', updateProgress);

    // Seek on click
    vcProgressWrap.addEventListener('click', (e) => {
      e.stopPropagation();
      const rect = vcProgressWrap.getBoundingClientRect();
      const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      demoVideo.currentTime = pct * demoVideo.duration;
    });

    // Mute toggle
    vcMute.addEventListener('click', (e) => {
      e.stopPropagation();
      demoVideo.muted = !demoVideo.muted;
      vcMute.querySelector('.icon-vol').style.display   = demoVideo.muted ? 'none'  : 'block';
      vcMute.querySelector('.icon-muted').style.display = demoVideo.muted ? 'block' : 'none';
    });

    // Fullscreen
    vcFullscreen.addEventListener('click', (e) => {
      e.stopPropagation();
      if (videoFrame.requestFullscreen) videoFrame.requestFullscreen();
      else if (videoFrame.webkitRequestFullscreen) videoFrame.webkitRequestFullscreen();
    });

    // Show overlay again when ended
    demoVideo.addEventListener('ended', () => {
      pausePlay();
      videoOverlay.classList.remove('hidden');
      demoVideo.currentTime = 0;
    });
  }

  /* ---- Compliance badges stagger ---- */
  const compBadges = document.querySelectorAll('.comp-badge');
  const compObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        compBadges.forEach((b, i) => {
          setTimeout(() => {
            b.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            b.style.opacity    = '1';
            b.style.transform  = 'translateY(0)';
          }, i * 80);
        });
        compObs.disconnect();
      }
    });
  }, { threshold: 0.3 });

  if (compBadges.length) {
    compBadges.forEach(b => { b.style.opacity = '0'; b.style.transform = 'translateY(8px)'; });
    compObs.observe(compBadges[0].closest('section') || compBadges[0]);
  }

})();
