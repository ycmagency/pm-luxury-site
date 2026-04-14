(function () {
  /* ── Only on desktop ── */
  if (window.matchMedia('(max-width: 768px)').matches || window.matchMedia('(hover: none)').matches) return;

  /* ── Inject CSS ── */
  const style = document.createElement('style');
  style.textContent = `
    html, body, * { cursor: none !important; }
    @media (max-width: 768px) { html, body, * { cursor: auto !important; } }

    #pmCursor, #pmCursorRing {
      position: fixed;
      border-radius: 50%;
      pointer-events: none;
      z-index: 99999;
      will-change: transform;
      top: 0; left: 0;
    }

    /* Main dot — bright white with glow */
    #pmCursor {
      width: 10px; height: 10px;
      background: #fff;
      box-shadow: 0 0 8px rgba(255,255,255,0.9),
                  0 0 18px rgba(107,170,232,0.7);
      transform: translate(-50%, -50%);
      transition: transform 0.12s cubic-bezier(0.16,1,0.3,1),
                  background 0.2s, box-shadow 0.2s, width 0.2s, height 0.2s;
    }

    /* Outer ring — follows with lag */
    #pmCursorRing {
      width: 38px; height: 38px;
      border: 2px solid rgba(255,255,255,0.65);
      box-shadow: 0 0 14px rgba(107,170,232,0.35),
                  inset 0 0 8px rgba(74,111,165,0.08);
      transform: translate(-50%, -50%);
      transition: width 0.35s cubic-bezier(0.16,1,0.3,1),
                  height 0.35s cubic-bezier(0.16,1,0.3,1),
                  border-color 0.35s, box-shadow 0.35s,
                  background 0.35s, opacity 0.3s;
      background: transparent;
    }

    /* Hover state */
    body.pm-cursor-hover #pmCursor {
      width: 14px; height: 14px;
      background: #6BAAE8;
      box-shadow: 0 0 12px rgba(107,170,232,1),
                  0 0 28px rgba(74,111,165,0.6);
    }
    body.pm-cursor-hover #pmCursorRing {
      width: 58px; height: 58px;
      border-color: rgba(107,170,232,0.85);
      background: rgba(74,111,165,0.06);
      box-shadow: 0 0 22px rgba(107,170,232,0.4),
                  inset 0 0 14px rgba(74,111,165,0.1);
    }

    /* Click burst */
    body.pm-cursor-click #pmCursor {
      transform: translate(-50%, -50%) scale(0.6);
      background: #fff;
      box-shadow: 0 0 20px rgba(255,255,255,1), 0 0 36px rgba(107,170,232,0.9);
    }
    body.pm-cursor-click #pmCursorRing {
      width: 68px; height: 68px;
      opacity: 0.3;
      border-color: rgba(255,255,255,0.9);
    }

    /* Text cursor state */
    body.pm-cursor-text #pmCursor {
      width: 3px; height: 22px;
      border-radius: 2px;
      background: rgba(255,255,255,0.85);
      box-shadow: 0 0 8px rgba(255,255,255,0.5);
    }
    body.pm-cursor-text #pmCursorRing {
      opacity: 0;
    }
  `;
  document.head.appendChild(style);

  /* ── Create elements ── */
  const dot  = document.createElement('div'); dot.id  = 'pmCursor';
  const ring = document.createElement('div'); ring.id = 'pmCursorRing';
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  /* ── Track mouse ── */
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;
  let hidden = false;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
    if (hidden) {
      dot.style.opacity = '1';
      ring.style.opacity = '';
      hidden = false;
    }
  });

  /* Ring follows with smooth lag */
  (function animRing() {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  })();

  /* Hide when leaving window */
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
    hidden = true;
  });

  /* Click burst */
  document.addEventListener('mousedown', () => {
    document.body.classList.add('pm-cursor-click');
    setTimeout(() => document.body.classList.remove('pm-cursor-click'), 180);
  });

  /* Hover on interactive elements */
  function bindHover() {
    document.querySelectorAll(
      'a, button, [onclick], .service-card, .story-trigger, .exp-clip, .exp-featured-inner, .cal-day:not(.disabled):not(.empty), .time-slot, .cs-option, .cal-nav, .calendar-back'
    ).forEach(el => {
      if (el.dataset.cursorBound) return;
      el.dataset.cursorBound = '1';
      el.addEventListener('mouseenter', () => document.body.classList.add('pm-cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('pm-cursor-hover'));
    });

    document.querySelectorAll('input, textarea').forEach(el => {
      if (el.dataset.cursorTextBound) return;
      el.dataset.cursorTextBound = '1';
      el.addEventListener('mouseenter', () => document.body.classList.add('pm-cursor-text'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('pm-cursor-text'));
    });
  }

  bindHover();

  /* Re-bind after dynamic content (calendar days etc.) */
  const observer = new MutationObserver(bindHover);
  observer.observe(document.body, { childList: true, subtree: true });
})();
