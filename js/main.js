document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  
  if (mobileMenuToggle && mainNav) {
    mobileMenuToggle.addEventListener('click', function() {
      mainNav.classList.toggle('active');
    });
  }
  
  // Close mobile menu when clicking outside
  document.addEventListener('click', function(event) {
    if (!event.target.closest('.mobile-menu-toggle') && !event.target.closest('.main-nav')) {
      if (mainNav && mainNav.classList.contains('active')) {
        mainNav.classList.remove('active');
      }
    }
  });
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href').substring(1);
      if (!targetId) return;
      
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Add active class to code blocks
  document.querySelectorAll('pre code').forEach((block) => {
    block.classList.add('language-' + (block.className || 'plaintext'));
  });
  
  // Form validation
  const contactForm = document.querySelector('form[name="contact"]');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      const nameField = contactForm.querySelector('#name');
      const emailField = contactForm.querySelector('#email');
      const messageField = contactForm.querySelector('#message');
      
      let isValid = true;
      
      if (!nameField.value.trim()) {
        isValid = false;
        nameField.classList.add('error');
      } else {
        nameField.classList.remove('error');
      }
      
      if (!emailField.value.trim() || !isValidEmail(emailField.value)) {
        isValid = false;
        emailField.classList.add('error');
      } else {
        emailField.classList.remove('error');
      }
      
      if (!messageField.value.trim()) {
        isValid = false;
        messageField.classList.add('error');
      } else {
        messageField.classList.remove('error');
      }
      
      if (!isValid) {
        e.preventDefault();
      }
    });
  }
  
  function isValidEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
});
