// Typewriter animation data
const typewriterTexts = [
    "Kartigya Shrestha",
    "A Web Developer",
    "UI/UX Designer",
    "Frontend Developer",
    "Creative Coder"
];

let currentTextIndex = 0;
let currentCharIndex = 0;
let isDeleting = false;

// Set the initial placeholders
const userEmail = "kartigyashrestha1234@gmail.com";

function setEmailPlaceholder() {
    const emailPlaceholderEl = document.getElementById('emailPlaceholder');
    if (emailPlaceholderEl) emailPlaceholderEl.textContent = userEmail;
}

// Typewriter function
function typeWriter() {
    const typewriterElement = document.querySelector('.typewriter');
    if (!typewriterElement) return;

    const currentText = typewriterTexts[currentTextIndex];

    if (!isDeleting) {
        // Typing
        if (currentCharIndex < currentText.length) {
            typewriterElement.textContent += currentText.charAt(currentCharIndex);
            currentCharIndex++;
            setTimeout(typeWriter, 100);
        } else {
            // Pause at end of text
            isDeleting = true;
            setTimeout(typeWriter, 2000);
        }
    } else {
        // Deleting
        if (currentCharIndex > 0) {
            typewriterElement.textContent = currentText.substring(0, currentCharIndex - 1);
            currentCharIndex--;
            setTimeout(typeWriter, 50);
        } else {
            // Move to next text
            isDeleting = false;
            currentTextIndex = (currentTextIndex + 1) % typewriterTexts.length;
            setTimeout(typeWriter, 500);
        }
    }
}

// Start typewriter animation when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    typeWriter();
    setEmailPlaceholder();

    // Animate skill bars on page load
    const skillBars = document.querySelectorAll('.skill-progress');
    skillBars.forEach(bar => {
        const width = bar.getAttribute('data-width');
        bar.style.width = width;
    });

    // Initialize observers and features
    initScrollAnimations();
    initThemeToggle();
    initContactForm();
    initPageTransitions();
    initPerformanceObserver();
    if (location.hostname !== 'localhost' && location.hostname !== '') {
        registerServiceWorker();
    }
});

// Use IntersectionObserver for reveal animations
function initScrollAnimations() {
    const reveals = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
        // Fallback to original behavior
        reveals.forEach(el => el.classList.add('active'));
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                obs.unobserve(entry.target);
            }
        });
    }, { root: null, rootMargin: '0px', threshold: 0.15 });

    reveals.forEach(el => observer.observe(el));
}

// Theme toggle with persistence
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    const icon = themeToggle.querySelector('i');

    const saved = localStorage.getItem('theme');
    if (saved === 'light' || (!saved && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches)) {
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

// Contact form: Fetch submission, plus input persistence
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  // restore saved values
  ['name','email','message'].forEach(key => {
    try {
      const el = form.querySelector(`[name="${key}"]`);
      const saved = localStorage.getItem(`contact_${key}`);
      if (el && saved) el.value = saved;
      if (el) el.addEventListener('input', () => localStorage.setItem(`contact_${key}`, el.value));
    } catch (e) { /* ignore */ }
  });

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
    if (data.get('honeypot')) return;

    if (window.location.protocol === 'file:') {
      alert('Testing locally: run a local server (python -m http.server 8000) and try again.');
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
        alert('Thank you — your message has been sent. I will contact you soon.');
        statusEl.textContent = 'Message sent — thank you!';
        statusEl.style.color = 'green';
        form.reset();
        // clear saved inputs
        ['name','email','message'].forEach(k => localStorage.removeItem(`contact_${k}`));
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

// Smooth page transitions (intercept internal link clicks)
function initPageTransitions() {
    // Inject simple transition CSS
    const style = document.createElement('style');
    style.textContent = `
    .page-fade { transition: opacity .35s ease; opacity: 1; }
    .page-fade.fade-out { opacity: 0; }
    `;
    document.head.appendChild(style);

    document.documentElement.classList.add('page-fade');

    document.addEventListener('click', (e) => {
        const a = e.target.closest('a');
        if (!a) return;
        const href = a.getAttribute('href');
        const target = a.getAttribute('target');
        if (!href || href.startsWith('http') || href.startsWith('#') || target === '_blank') return;
        if (href.endsWith('.html')) {
            e.preventDefault();
            document.documentElement.classList.add('fade-out');
            setTimeout(() => { window.location.href = href; }, 350);
        }
    });
}

// PerformanceObserver for basic CWV logging
function initPerformanceObserver() {
    if (!('PerformanceObserver' in window)) return;
    try {
        const po = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                console.log('[perf]', entry.entryType, entry);
            }
        });
        po.observe({ type: 'largest-contentful-paint', buffered: true });
        po.observe({ type: 'first-input', buffered: true });
        po.observe({ type: 'layout-shift', buffered: true });
    } catch (e) { /* certain entry types may not be supported */ }
}

// Service worker registration (best-effort)
function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    try {
        navigator.serviceWorker.register('/sw.js').then(reg => {
            console.log('Service Worker registered:', reg.scope);
        }).catch(err => {
            console.warn('Service Worker registration failed:', err);
        });
    } catch (e) {
        console.warn('Service Worker not registered:', e);
    }
}
