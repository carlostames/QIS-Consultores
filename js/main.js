/* ============================================
   QIS CONSULTORES — Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // ---- Preloader ----
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('hidden');
      setTimeout(() => preloader.remove(), 500);
    }, 600);
  });

  // ---- Navbar Scroll Behavior ----
  const navbar = document.getElementById('navbar');
  const heroSection = document.getElementById('hero');

  const handleNavScroll = () => {
    const scrollY = window.scrollY;
    if (scrollY > 80) {
      navbar.classList.remove('navbar--transparent');
      navbar.classList.add('navbar--scrolled');
    } else {
      navbar.classList.add('navbar--transparent');
      navbar.classList.remove('navbar--scrolled');
    }
  };

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  // ---- Mobile Menu Toggle ----
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
  });

  // Close mobile menu when clicking a link
  navLinks.querySelectorAll('.navbar__link, .navbar__cta').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navLinks.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // ---- Smooth Scroll for Anchor Links ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        const offsetTop = target.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  // ---- Intersection Observer for Reveal Animations ----
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-stagger');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ---- Counter Animation ----
  const counters = document.querySelectorAll('.counter');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => counterObserver.observe(counter));

  function animateCounter(element) {
    const target = parseInt(element.dataset.target);
    if (isNaN(target)) return;

    const prefix = element.dataset.prefix || '';
    const suffix = element.dataset.suffix || '';
    const duration = 2000;
    const start = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);

      element.textContent = prefix + current.toLocaleString() + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = prefix + target.toLocaleString() + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  // ---- Timeline Item Hover Effects ----
  const timelineItems = document.querySelectorAll('.timeline__item');
  timelineItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      timelineItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });

  // ---- Active Nav Link on Scroll ----
  const sections = document.querySelectorAll('section[id]');
  const navLinksAll = document.querySelectorAll('.navbar__link');

  const highlightNav = () => {
    const scrollY = window.scrollY + 100;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinksAll.forEach(link => {
          link.style.color = '';
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.style.color = 'var(--white)';
          }
        });
      }
    });
  };

  window.addEventListener('scroll', highlightNav, { passive: true });

  // ---- Download Form → PDF Generation ----
  const downloadForm = document.getElementById('download-form');
  const downloadBtn = document.getElementById('download-submit');

  if (downloadForm && downloadBtn) {
    // Detect mobile/tablet
    const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
      || (navigator.maxTouchPoints > 1 && window.innerWidth < 1024);

    downloadForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Get form data
      const formData = new FormData(downloadForm);
      const data = Object.fromEntries(formData);

      // Visual feedback — show generating state
      const originalHTML = downloadBtn.innerHTML;
      downloadBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="animation: spin 1s linear infinite;">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
        ${isMobile ? 'Opening One-Pager...' : 'Generating PDF...'}
      `;
      downloadBtn.disabled = true;

      // Log lead data (replace with actual CRM/webhook integration)
      console.log('Download lead captured:', data);

      if (isMobile) {
        // ===== MOBILE: Open print-ready one-pager in new tab =====
        // On iOS/Android, window.print() triggers the native Share Sheet
        // where users can "Save as PDF" or "Print"
        try {
          const printWindow = window.open('one-pager.html', '_blank');
          
          if (printWindow) {
            // Wait for the page to load, then trigger print
            printWindow.addEventListener('load', () => {
              setTimeout(() => {
                printWindow.print();
              }, 1500);
            });
            
            // Success feedback
            downloadBtn.innerHTML = `
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              Opened! Use Share → Save as PDF
            `;
            downloadBtn.style.background = 'var(--green-500)';
          } else {
            // Popup blocked — open directly
            window.location.href = 'one-pager.html';
          }
        } catch (err) {
          console.error('Mobile PDF error:', err);
          window.open('one-pager.html', '_blank');
        }

        setTimeout(() => {
          downloadBtn.innerHTML = originalHTML;
          downloadBtn.style.background = '';
          downloadBtn.disabled = false;
        }, 4000);
        return;
      }

      // ===== DESKTOP: Use html2pdf.js for direct PDF download =====
      try {
        // Fetch the one-pager HTML
        const response = await fetch('one-pager.html');
        const htmlText = await response.text();

        // Parse the HTML to extract the content
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');
        const onePagerContent = doc.getElementById('one-pager-content');

        if (!onePagerContent) {
          throw new Error('One-pager content not found');
        }

        // Also fetch the CSS
        const cssResponse = await fetch('css/one-pager.css');
        const cssText = await cssResponse.text();

        // Create a hidden container with the one-pager content and its styles
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.style.zIndex = '-1';

        const styleTag = document.createElement('style');
        styleTag.textContent = cssText;
        container.appendChild(styleTag);
        container.appendChild(onePagerContent);

        document.body.appendChild(container);

        // Wait for fonts and images to load
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Configure html2pdf options for high-quality letter-size output
        const opt = {
          margin: 0,
          filename: 'QIS_Consultores_OnePager.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            width: 816,
            height: 1056,
            logging: false,
          },
          jsPDF: {
            unit: 'in',
            format: 'letter',
            orientation: 'portrait',
          }
        };

        // Generate PDF with timeout safety net
        const pdfPromise = html2pdf().set(opt).from(onePagerContent).save();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('PDF generation timed out')), 15000)
        );

        await Promise.race([pdfPromise, timeoutPromise]);

        // Success feedback
        downloadBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          Downloaded!
        `;
        downloadBtn.style.background = 'var(--green-500)';

        // Clean up
        container.remove();

        // Reset after 3 seconds
        setTimeout(() => {
          downloadBtn.innerHTML = originalHTML;
          downloadBtn.style.background = '';
          downloadBtn.disabled = false;
        }, 3000);

      } catch (err) {
        console.error('PDF generation error:', err);

        // Clean up any leftover container
        const leftover = document.querySelector('[style*="-9999px"]');
        if (leftover) leftover.remove();

        // Fallback: open the one-pager page in a new tab with print dialog
        downloadBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          Opening One-Pager...
        `;
        
        // Open one-pager and trigger print
        const fallbackWin = window.open('one-pager.html', '_blank');
        if (fallbackWin) {
          fallbackWin.addEventListener('load', () => {
            setTimeout(() => fallbackWin.print(), 1500);
          });
        }

        setTimeout(() => {
          downloadBtn.innerHTML = originalHTML;
          downloadBtn.style.background = '';
          downloadBtn.disabled = false;
        }, 3000);
      }
    });
  }

  // ---- Parallax Effect on Hero ----
  const heroBg = document.querySelector('.hero__bg img');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY < window.innerHeight) {
        heroBg.style.transform = `translateY(${scrollY * 0.3}px) scale(1.1)`;
      }
    }, { passive: true });
  }

  // ---- Add spin animation for loading state ----
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  // ---- Service card image error handling ----
  document.querySelectorAll('.service-card__image img, .hero__bg img, .problem__bg img, .methodology__image img').forEach(img => {
    img.addEventListener('error', function() {
      this.style.display = 'none';
    });
  });
});
