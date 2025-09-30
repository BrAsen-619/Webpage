// Set the initial placeholders
const userName = "Kartigya Shrestha";
const userEmail = "kartigyashrestha1234@gmail.com";

const namePlaceholderEl = document.getElementById('namePlaceholder');
if (namePlaceholderEl) namePlaceholderEl.textContent = userName;

const emailPlaceholderEl = document.getElementById('emailPlaceholder');
if (emailPlaceholderEl) emailPlaceholderEl.textContent = userEmail;

// Animate skill bars on page load
document.addEventListener('DOMContentLoaded', function() {
    const skillBars = document.querySelectorAll('.skill-progress');
    skillBars.forEach(bar => {
        const width = bar.getAttribute('data-width');
        bar.style.width = width;
    });
    
    // Initialize scroll animations
    initScrollAnimations();
    
    // Initialize navigation
    initNavigation();
    
    // Initialize theme toggle
    initThemeToggle();

    // Initialize contact form handler (added)
    initContactForm();
});

// Scroll animations
function initScrollAnimations() {
    const reveals = document.querySelectorAll('.reveal');
    
    function checkReveal() {
        reveals.forEach(element => {
            const windowHeight = window.innerHeight;
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < windowHeight - elementVisible) {
                element.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', checkReveal);
    checkReveal(); // Check on initial load
}

// Navigation
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const contentSections = document.querySelectorAll('.content-section');

    if (!navItems.length || !contentSections.length) return; // guard

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const target = this.getAttribute('data-target');

            // Update active nav item
            navItems.forEach(navItem => navItem.classList.remove('active'));
            this.classList.add('active');

            // Show corresponding section
            contentSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `${target}-section`) {
                    section.classList.add('active');

                    // Trigger scroll animations for the new section
                    setTimeout(() => {
                        initScrollAnimations();
                    }, 100);
                }
            });
        });
    });
}

// Theme toggle
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return; // guard
    const icon = themeToggle.querySelector('i');

    // Check for saved theme preference or respect OS preference
    if (localStorage.getItem('theme') === 'light' ||
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches && !localStorage.getItem('theme'))) {
        document.body.classList.add('light-theme');
        if (icon) { icon.classList.remove('fa-moon'); icon.classList.add('fa-sun'); }
    }

    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('light-theme');

        if (document.body.classList.contains('light-theme')) {
            localStorage.setItem('theme', 'light');
            if (icon) { icon.classList.remove('fa-moon'); icon.classList.add('fa-sun'); }
        } else {
            localStorage.setItem('theme', 'dark');
            if (icon) { icon.classList.remove('fa-sun'); icon.classList.add('fa-moon'); }
        }
    });
}

/* Add this function near the other init* functions */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return; // no form on this page

  // ensure small status element (optional)
  let statusEl = form.querySelector('.form-status');
  if (!statusEl) {
    statusEl = document.createElement('div');
    statusEl.className = 'form-status';
    statusEl.style.marginTop = '8px';
    form.appendChild(statusEl);
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const data = new FormData(form);

    // honeypot check
    if (data.get('honeypot')) return;

    // local-file check
    if (window.location.protocol === 'file:') {
      alert('Testing locally: start a local server (python -m http.server 8000) and try again.');
      return;
    }

    statusEl.textContent = 'Sending...';
    statusEl.style.color = '#444';

    try {
      const res = await fetch(form.action, {
        method: (form.method || 'POST').toUpperCase(),
        body: data,
        redirect: 'follow'
      });

      const text = await res.text();
      let json;
      try { json = JSON.parse(text); } catch { json = { raw: text }; }

      if (res.ok) {
        // main requested change: show thank-you alert
        alert('Thank you — your message has been sent. I will contact you soon.');
        statusEl.textContent = 'Message sent — thank you!';
        statusEl.style.color = 'green';
        form.reset();
      } else {
        const msg = (json && json.message) ? json.message : `Error ${res.status}`;
        alert('Submission error: ' + msg);
        statusEl.textContent = 'Submission error: ' + msg;
        statusEl.style.color = 'red';
      }
    } catch (err) {
      console.error('[contact] network error', err);
      alert('Network error: ' + (err.message || err.name));
      statusEl.textContent = 'Network error: ' + (err.message || err.name);
      statusEl.style.color = 'red';
    }    
  });
}
