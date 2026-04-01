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
        Generating PDF...
      `;
      downloadBtn.disabled = true;

      // Log lead data (replace with actual CRM/webhook integration)
      console.log('Download lead captured:', data);

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

        // Generate PDF
        await html2pdf().set(opt).from(onePagerContent).save();

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
        downloadBtn.innerHTML = originalHTML;
        downloadBtn.disabled = false;
        alert('PDF generation failed. Please try again.');
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
