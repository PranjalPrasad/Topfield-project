// header.js - Water Solutions Theme
(function() {
  'use strict';

  class WaterHeader {
    constructor() {
      this.header = document.querySelector('.tf-header');
      this.mobileTrigger = document.querySelector('.tf-mobile-trigger');
      this.nav = document.querySelector('.tf-nav');
      this.dropdowns = document.querySelectorAll('.tf-dropdown');
      this.floatingDrops = document.querySelector('.tf-floating-drops');
      
      this.init();
    }
    
    init() {
      this.setActiveLink();
      this.setupEventListeners();
      this.createWaterRipple();
      this.setupSmoothScrolling();
    }
    
    setupEventListeners() {
      // Mobile menu toggle
      if (this.mobileTrigger && this.nav) {
        this.mobileTrigger.addEventListener('click', (e) => this.toggleMobileMenu(e));
      }
      
      // Dropdown handling for all devices
      this.setupDropdowns();
      
      // Window resize
      window.addEventListener('resize', () => this.handleResize());
      
      // Click outside to close menu
      document.addEventListener('click', (e) => this.handleClickOutside(e));
      
      // Scroll effect
      window.addEventListener('scroll', () => this.handleScroll());
    }
    
    toggleMobileMenu(e) {
      e.stopPropagation();
      this.mobileTrigger.classList.toggle('active');
      this.nav.classList.toggle('active');
      document.body.classList.toggle('menu-open');
      
      // Animate hamburger
      const spans = this.mobileTrigger.querySelectorAll('span');
      if (this.mobileTrigger.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    }
    
    setupDropdowns() {
      this.dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('.tf-nav-link');
        
        // Remove any existing click listeners
        link.removeEventListener('click', this.dropdownClickHandler);
        
        // Add click handler
        link.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          // For mobile (<= 992px) - toggle dropdown
          if (window.innerWidth <= 992) {
            // Close other dropdowns first
            this.dropdowns.forEach(d => {
              if (d !== dropdown && d.classList.contains('active')) {
                d.classList.remove('active');
              }
            });
            
            // Toggle current dropdown
            dropdown.classList.toggle('active');
          }
        });

        // Handle mouseenter for desktop
        dropdown.addEventListener('mouseenter', () => {
          if (window.innerWidth > 992) {
            dropdown.classList.add('active');
          }
        });

        dropdown.addEventListener('mouseleave', () => {
          if (window.innerWidth > 992) {
            dropdown.classList.remove('active');
          }
        });
      });
    }
    
    setActiveLink() {
      const currentPath = window.location.pathname;
      const navLinks = document.querySelectorAll('.tf-nav-link');
      
      navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        
        if (href === '#home' && (currentPath === '/' || currentPath === '')) {
          link.classList.add('active');
        }
      });
    }
    
    createWaterRipple() {
      // Add dynamic water ripple effect on header hover
      if (this.header) {
        this.header.addEventListener('mousemove', (e) => {
          const ripple = document.createElement('div');
          ripple.className = 'dynamic-ripple';
          ripple.style.left = e.clientX + 'px';
          ripple.style.top = e.clientY + 'px';
          ripple.style.position = 'fixed';
          ripple.style.width = '10px';
          ripple.style.height = '10px';
          ripple.style.background = 'radial-gradient(circle, rgba(79,195,247,0.2) 0%, transparent 70%)';
          ripple.style.borderRadius = '50%';
          ripple.style.pointerEvents = 'none';
          ripple.style.zIndex = '9999';
          ripple.style.transform = 'translate(-50%, -50%)';
          ripple.style.animation = 'rippleExpand 1s ease-out';
          
          document.body.appendChild(ripple);
          
          setTimeout(() => {
            ripple.remove();
          }, 1000);
        });
      }
    }
    
    setupSmoothScrolling() {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
          const href = anchor.getAttribute('href');
          if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
              target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
              });
              
              // Close mobile menu if open
              if (this.nav && this.nav.classList.contains('active')) {
                this.toggleMobileMenu(e);
              }
            }
          }
        });
      });
    }
    
    handleClickOutside(e) {
      if (window.innerWidth <= 992) {
        // Close mobile menu if clicking outside
        if (this.nav && this.nav.classList.contains('active')) {
          if (!this.nav.contains(e.target) && !this.mobileTrigger.contains(e.target)) {
            this.toggleMobileMenu(e);
          }
        }
        
        // Close dropdowns when clicking outside
        let clickedInsideDropdown = false;
        this.dropdowns.forEach(dropdown => {
          if (dropdown.contains(e.target)) {
            clickedInsideDropdown = true;
          }
        });
        
        if (!clickedInsideDropdown) {
          this.dropdowns.forEach(dropdown => {
            dropdown.classList.remove('active');
          });
        }
      }
    }
    
    handleResize() {
      if (window.innerWidth > 992) {
        // Reset mobile states
        if (this.nav) this.nav.classList.remove('active');
        if (this.mobileTrigger) {
          this.mobileTrigger.classList.remove('active');
          const spans = this.mobileTrigger.querySelectorAll('span');
          spans[0].style.transform = 'none';
          spans[1].style.opacity = '1';
          spans[2].style.transform = 'none';
        }
        
        // Reset dropdowns but keep hover functionality
        this.dropdowns.forEach(dropdown => {
          dropdown.classList.remove('active');
        });
      }
      
      // Reinitialize dropdowns for new screen size
      this.setupDropdowns();
    }
    
    handleScroll() {
      // Add shadow on scroll
      if (window.scrollY > 10) {
        this.header.style.boxShadow = '0 8px 30px rgba(0,100,150,0.15)';
      } else {
        this.header.style.boxShadow = '0 8px 30px rgba(0,100,150,0.1)';
      }
    }
  }
  
  // Add keyframe animation for ripple
  const style = document.createElement('style');
  style.textContent = `
    @keyframes rippleExpand {
      0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
      100% { transform: translate(-50%, -50%) scale(20); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new WaterHeader();
    });
  } else {
    new WaterHeader();
  }
})();