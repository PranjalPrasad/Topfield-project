/* ════════════════════════════════════════════
   TOPFIELD — ourwork.js
   Gallery page functionality
   ════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─────────────────────────────────────────
     1. LOAD HEADER & FOOTER
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
      .catch(function () {});
  }

  loadPartial('../header/header.html', 'header-placeholder', '../header/header.js');
  loadPartial('../footer/footer.html', 'footer-placeholder', '../footer/footer.js');

  /* ─────────────────────────────────────────
     2. SCROLL REVEAL
  ───────────────────────────────────────────*/
  var revealEls = document.querySelectorAll('.reveal');

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
     3. FILTER TABS
  ───────────────────────────────────────────*/
  var filterBtns = document.querySelectorAll('.ow-filter-btn');
  var sections   = document.querySelectorAll('.ow-section');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var filter = this.dataset.filter;

      // Update active button
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      this.classList.add('active');

      // Show / hide sections
      sections.forEach(function (sec) {
        var cat = sec.dataset.category;
        if (filter === 'all' || filter === cat) {
          sec.classList.remove('ow-hidden');
          // Re-trigger reveal on newly shown cards
          sec.querySelectorAll('.reveal:not(.visible)').forEach(function (el) {
            var rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight - 60) {
              el.classList.add('visible');
            } else {
              revealObserver.observe(el);
            }
          });
        } else {
          sec.classList.add('ow-hidden');
        }
      });

      // Smooth scroll to first visible section
      if (filter !== 'all') {
        var target = document.querySelector('.ow-section[data-category="' + filter + '"]');
        if (target) {
          setTimeout(function () {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 80);
        }
      } else {
        var main = document.querySelector('.ow-main');
        if (main) {
          setTimeout(function () {
            main.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 80);
        }
      }
    });
  });

  /* ─────────────────────────────────────────
     4. LIGHTBOX
  ───────────────────────────────────────────*/
  var lightbox  = document.getElementById('owLightbox');
  var lbImg     = document.getElementById('owLbImg');
  var lbCaption = document.getElementById('owLbCaption');
  var lbClose   = document.getElementById('owLbClose');
  var lbPrev    = document.getElementById('owLbPrev');
  var lbNext    = document.getElementById('owLbNext');

  var allImages    = [];  // [{src, caption}]
  var currentIndex = 0;

  function buildImageList() {
    allImages = [];
    document.querySelectorAll('.ow-section:not(.ow-hidden) .ow-card').forEach(function (card) {
      var img     = card.querySelector('.ow-card-img');
      var caption = card.querySelector('.ow-card-body h3');
      if (img) {
        allImages.push({
          src     : img.src,
          caption : caption ? caption.textContent : ''
        });
      }
    });
  }

  function openLightbox(index) {
    buildImageList();
    if (!allImages.length) return;
    currentIndex = Math.max(0, Math.min(index, allImages.length - 1));
    showLbImage(currentIndex);
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function showLbImage(index) {
    var item = allImages[index];
    if (!item) return;
    lbImg.style.opacity = '0';
    lbImg.style.transform = 'scale(0.95)';
    setTimeout(function () {
      lbImg.src = item.src;
      lbImg.alt = item.caption;
      lbCaption.textContent = item.caption;
      lbImg.style.transition = 'opacity 0.28s ease, transform 0.28s ease';
      lbImg.style.opacity = '1';
      lbImg.style.transform = 'scale(1)';
    }, 120);
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + allImages.length) % allImages.length;
    showLbImage(currentIndex);
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % allImages.length;
    showLbImage(currentIndex);
  }

  // Bind zoom buttons — use delegation for dynamically revealed cards
  document.addEventListener('click', function (e) {
    var zoomBtn = e.target.closest('.ow-zoom-btn');
    if (zoomBtn) {
      e.stopPropagation();
      buildImageList();
      var card = zoomBtn.closest('.ow-card');
      var img  = card ? card.querySelector('.ow-card-img') : null;
      if (img) {
        var idx = allImages.findIndex(function (item) { return item.src === img.src; });
        openLightbox(idx >= 0 ? idx : 0);
      }
    }

    // Click on card image area also opens lightbox
    var cardImg = e.target.closest('.ow-card-img-wrap');
    if (cardImg && !e.target.closest('.ow-zoom-btn')) {
      buildImageList();
      var imgEl = cardImg.querySelector('.ow-card-img');
      if (imgEl) {
        var idx = allImages.findIndex(function (item) { return item.src === imgEl.src; });
        openLightbox(idx >= 0 ? idx : 0);
      }
    }
  });

  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbPrev)  lbPrev.addEventListener('click',  prevImage);
  if (lbNext)  lbNext.addEventListener('click',  nextImage);

  // Click backdrop to close
  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', function (e) {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   prevImage();
    if (e.key === 'ArrowRight')  nextImage();
  });

  /* ─────────────────────────────────────────
     5. SCROLL TO TOP BUTTON
  ───────────────────────────────────────────*/
  var scrollBtn = document.getElementById('scrollTop');
  if (scrollBtn) {
    window.addEventListener('scroll', function () {
      scrollBtn.classList.toggle('show', window.scrollY > 500);
    }, { passive: true });
  }

})();