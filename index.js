/* ════════════════════════════════════════════
   TOPFIELD — index.js
   All interactive functionality for index.html
   ════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─────────────────────────────────────────
     1. LOAD HEADER & FOOTER via fetch
  ───────────────────────────────────────────*/
  function loadPartial(url, placeholderId, scriptSrc) {
    fetch(url)
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var el = document.getElementById(placeholderId);
        if (el) {
          el.innerHTML = html;
          if (scriptSrc) {
            var s = document.createElement('script');
            s.src = scriptSrc;
            document.head.appendChild(s);
          }
        }
      })
      .catch(function () { /* silently ignore if partials not found */ });
  }

  loadPartial('../header/header.html', 'header-placeholder', '../header/header.js');
  loadPartial('../footer/footer.html', 'footer-placeholder', '../footer/footer.js');

  /* ─────────────────────────────────────────
     2. PROJECTS MARQUEE
  ───────────────────────────────────────────*/
  var projects = [
    'Marvel Zypher, Kharadi', 'Marvel Friya, Wagholi', 'The Orchard, Handewadi',
    'Grand Bay, Pune', 'Rohan Lehar, Baner', 'Vijay Vihar AWHO, Wagholi',
    'Nyati Envision, Tingare Nagar', 'Kalpataru Serenity, Manjari', 'Guru Vista, Kharadi',
    'Vishwaraj Hospital, Loni', 'Chesterfield Society, Dhanori', 'Shriram Paradise, Wagholi',
    'Konark Meadows, Wagholi', 'Genesis Society, Dighi', 'BA Vermont, Wagholi',
    'Wildwoods Society, Wagholi', 'Rahul East View, Handewadi', 'BA Iris Society, Wagholi',
    'Swaraj Capital, Moshi', 'Marvel Enigma, Kharadi', 'Anjani Amores, Undari',
    'One North Condominium, Magarpatta'
  ];

  var m1 = document.getElementById('marquee1');
  var m2 = document.getElementById('marquee2');

  if (m1 && m2) {
    var allP = projects.concat(projects);
    allP.forEach(function (p, i) {
      m1.innerHTML += '<div class="project-pill">📍 ' + p + '</div>';
      if (i % 2 === 0) {
        m2.innerHTML += '<div class="project-pill">🏗️ ' + p + '</div>';
      }
    });
  }

  /* ─────────────────────────────────────────
     3. COUNTER ANIMATION
  ───────────────────────────────────────────*/
  function animateCounters() {
    document.querySelectorAll('[data-target]').forEach(function (el) {
      var target = Number(el.getAttribute('data-target'));
      var current = 0;
      var step = target / 60;
      var timer = setInterval(function () {
        current = Math.min(current + step, target);
        el.textContent = Math.floor(current) + (current >= target ? '+' : '');
        if (current >= target) clearInterval(timer);
      }, 30);
    });
  }
  setTimeout(animateCounters, 1200);

  /* ─────────────────────────────────────────
     4. SCROLL REVEAL (IntersectionObserver)
  ───────────────────────────────────────────*/
  var revealEls = document.querySelectorAll(
    '.reveal, .reveal-left, .reveal-right, .service-card, .why-step'
  );

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var delay = parseFloat(entry.target.style.transitionDelay || '0') * 1000;
        setTimeout(function () {
          entry.target.classList.add('visible');
        }, delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  revealEls.forEach(function (el) { revealObserver.observe(el); });

  /* ─────────────────────────────────────────
     5. SCROLL TO TOP BUTTON
  ───────────────────────────────────────────*/
  var scrollBtn = document.getElementById('scrollTop');
  if (scrollBtn) {
    window.addEventListener('scroll', function () {
      scrollBtn.classList.toggle('show', window.scrollY > 500);
    }, { passive: true });
  }

  /* ─────────────────────────────────────────
     6. WHY SECTION — DRAW SVG WAVE PATH
  ───────────────────────────────────────────*/
  function drawWhyWave() {
    var svg   = document.getElementById('whyWaveSvg');
    var path  = document.getElementById('whyWavePath');
    var track = document.querySelector('.why-track');
    var steps = document.querySelectorAll('.why-step');

    if (!steps.length || !track || window.innerWidth <= 900) {
      if (path) path.setAttribute('d', '');
      return;
    }

    var tRect  = track.getBoundingClientRect();
    var points = [];

    steps.forEach(function (step) {
      var numEl = step.querySelector('.why-step-num');
      if (!numEl) return;
      var r  = numEl.getBoundingClientRect();
      var cx = r.left + r.width  / 2 - tRect.left;
      var cy = r.top  + r.height / 2 - tRect.top;
      points.push({ x: cx, y: cy });
    });

    if (points.length < 2) return;

    var d = 'M ' + points[0].x.toFixed(1) + ' ' + points[0].y.toFixed(1);
    for (var i = 0; i < points.length - 1; i++) {
      var p0   = points[i];
      var p1   = points[i + 1];
      var midX = ((p0.x + p1.x) / 2).toFixed(1);
      d += ' C ' + midX + ' ' + p0.y.toFixed(1) +
           ', '  + midX + ' ' + p1.y.toFixed(1) +
           ', '  + p1.x.toFixed(1) + ' ' + p1.y.toFixed(1);
    }
    path.setAttribute('d', d);
  }

  window.addEventListener('load',   function () { setTimeout(drawWhyWave, 300); });
  window.addEventListener('resize', function () { setTimeout(drawWhyWave, 100); });

  /* ─────────────────────────────────────────
     7. REALISTIC WATER PHYSICS SIMULATION
        Canvas is commented-out in HTML by default.
        Uncomment <canvas id="waterCanvas"> to enable.
  ───────────────────────────────────────────*/
  (function initWater() {
    var canvas  = document.getElementById('waterCanvas');
    var section = document.getElementById('banner');
    if (!canvas || !section) return;

    var ctx = canvas.getContext('2d');
    var W, H;
    var cur, prv;
    var animId;

    function resize() {
      W = section.offsetWidth;
      H = section.offsetHeight;
      canvas.width  = W;
      canvas.height = H;
      cur = new Float32Array(W * H);
      prv = new Float32Array(W * H);
    }

    function addDrop(cx, cy, radius, amplitude) {
      var r  = Math.round(radius);
      var x0 = Math.max(1, Math.round(cx) - r);
      var x1 = Math.min(W - 2, Math.round(cx) + r);
      var y0 = Math.max(1, Math.round(cy) - r);
      var y1 = Math.min(H - 2, Math.round(cy) + r);
      var r2 = r * r;
      for (var y = y0; y <= y1; y++) {
        for (var x = x0; x <= x1; x++) {
          var dx = x - cx, dy = y - cy;
          var d2 = dx * dx + dy * dy;
          if (d2 <= r2) {
            var f = 1 - Math.sqrt(d2) / r;
            cur[y * W + x] += amplitude * f * f;
          }
        }
      }
    }

    function step() {
      var damp = 0.986;
      for (var y = 1; y < H - 1; y++) {
        for (var x = 1; x < W - 1; x++) {
          var i  = y * W + x;
          var nw = (cur[i - 1] + cur[i + 1] + cur[i - W] + cur[i + W]) * 0.5 - prv[i];
          prv[i] = nw * damp;
        }
      }
      var tmp = cur; cur = prv; prv = tmp;
    }

    function render() {
      var grd = ctx.createLinearGradient(0, 0, W, H);
      grd.addColorStop(0,    '#bfe8ff');
      grd.addColorStop(0.35, '#d0f0ff');
      grd.addColorStop(0.65, '#aaddf8');
      grd.addColorStop(1,    '#96d2f4');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      var img  = ctx.getImageData(0, 0, W, H);
      var data = img.data;

      var LX = 0.55, LY = -0.7, LZ = 0.45;
      var REFRACT_SCALE = 5.5;
      var SPEC_POWER    = 55;
      var SPEC_BRIGHT   = 220;

      for (var y = 2; y < H - 2; y++) {
        for (var x = 2; x < W - 2; x++) {
          var i = y * W + x;
          var h = cur[i];
          if (Math.abs(h) < 0.08) continue;

          var gx = cur[i - 1] - cur[i + 1];
          var gy = cur[i - W] - cur[i + W];

          var sx = Math.max(2, Math.min(W - 3, (x + gx * REFRACT_SCALE) | 0));
          var sy = Math.max(2, Math.min(H - 3, (y + gy * REFRACT_SCALE) | 0));
          var si = (sy * W + sx) * 4;

          var r = data[si]     || 180;
          var g = data[si + 1] || 220;
          var b = data[si + 2] || 255;

          var nx   = gx * 4, ny = gy * 4, nz = 8.0;
          var nLen = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
          var dot  = Math.max(0, (nx * LX + ny * LY + nz * LZ) / nLen);
          var spec = Math.pow(dot, SPEC_POWER) * SPEC_BRIGHT;
          var caus = 1 + h * 0.018;

          r = Math.min(255, r * caus + spec);
          g = Math.min(255, g * caus + spec * 0.96);
          b = Math.min(255, b * caus + spec * 0.88);

          var pi = (y * W + x) * 4;
          data[pi]     = r;
          data[pi + 1] = g;
          data[pi + 2] = b;
          data[pi + 3] = 255;
        }
      }

      ctx.putImageData(img, 0, 0);

      var vign = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.85);
      vign.addColorStop(0, 'rgba(200,240,255,0)');
      vign.addColorStop(1, 'rgba(160,210,240,0.18)');
      ctx.fillStyle = vign;
      ctx.fillRect(0, 0, W, H);
    }

    var lastAutoTime = 0;
    function ambient(t) {
      if (t - lastAutoTime > 1400) {
        lastAutoTime = t;
        addDrop(
          80 + Math.random() * (W - 160),
          40 + Math.random() * (H - 80),
          5 + Math.random() * 4,
          130 + Math.random() * 90
        );
      }
      if (Math.random() < 0.003) {
        addDrop(
          Math.random() * W,
          Math.random() * H,
          2 + Math.random() * 3,
          55 + Math.random() * 55
        );
      }
    }

    function loop(t) {
      ambient(t);
      step();
      render();
      animId = requestAnimationFrame(loop);
    }

    var lastPX = -999, lastPY = -999;

    function onMove(e) {
      if (e.preventDefault) e.preventDefault();
      var rect = canvas.getBoundingClientRect();
      var sx   = canvas.width  / rect.width;
      var sy   = canvas.height / rect.height;
      var cl   = e.touches ? e.touches[0] : e;
      var px   = (cl.clientX - rect.left) * sx;
      var py   = (cl.clientY - rect.top)  * sy;
      var ddx  = px - lastPX, ddy = py - lastPY;
      if (ddx * ddx + ddy * ddy > 9) {
        addDrop(px, py, 7, 160 + Math.random() * 40);
        lastPX = px; lastPY = py;
      }
    }

    function onClick(e) {
      var rect = canvas.getBoundingClientRect();
      var sx   = canvas.width  / rect.width;
      var sy   = canvas.height / rect.height;
      var px   = (e.clientX - rect.left) * sx;
      var py   = (e.clientY - rect.top)  * sy;
      addDrop(px, py, 20, 450);
      var offsets = [[12,0],[-12,0],[0,12],[0,-12],[9,9],[-9,9],[9,-9],[-9,-9]];
      offsets.forEach(function (o, i) {
        setTimeout(function () { addDrop(px + o[0], py + o[1], 10, 220); }, 60 + i * 25);
      });
    }

    canvas.addEventListener('mousemove',  onMove, { passive: true });
    canvas.addEventListener('touchmove',  onMove, { passive: false });
    canvas.addEventListener('click',      onClick);
    canvas.addEventListener('touchstart', function (e) {
      var rect = canvas.getBoundingClientRect();
      var sx   = canvas.width  / rect.width;
      var sy   = canvas.height / rect.height;
      var px   = (e.touches[0].clientX - rect.left) * sx;
      var py   = (e.touches[0].clientY - rect.top)  * sy;
      addDrop(px, py, 20, 450);
    }, { passive: true });

    window.addEventListener('resize', function () {
      cancelAnimationFrame(animId);
      resize();
      loop(0);
    });

    resize();

    var seedDrops = [
      [0.2, 0.3, 6, 180], [0.5, 0.6, 8, 220], [0.75, 0.25, 5, 160],
      [0.35, 0.7, 7, 200], [0.8, 0.55, 5, 140], [0.15, 0.5, 6, 170]
    ];
    seedDrops.forEach(function (d, i) {
      setTimeout(function () {
        if (W && H) addDrop(d[0] * W, d[1] * H, d[2], d[3]);
      }, 150 + i * 220);
    });

    loop(0);
  })();

})();