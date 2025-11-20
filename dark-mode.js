// Dark Mode Toggle Functionality
(function() {
  'use strict';
  
  // Initialize dark mode on load
  function initDarkMode() {
    const html = document.documentElement;
    const darkModeToggle = document.getElementById('darkModeToggle');
    const darkModeIcon = document.getElementById('darkModeIcon');
    
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
      html.setAttribute('data-theme', 'dark');
      if (darkModeIcon) {
        darkModeIcon.className = 'fas fa-sun';
      }
    }
    
    // Set up toggle button
    if (darkModeToggle && darkModeIcon) {
      darkModeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        if (currentTheme === 'dark') {
          html.setAttribute('data-theme', 'light');
          darkModeIcon.className = 'fas fa-moon';
          localStorage.setItem('theme', 'light');
        } else {
          html.setAttribute('data-theme', 'dark');
          darkModeIcon.className = 'fas fa-sun';
          localStorage.setItem('theme', 'dark');
        }
      });
    }
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDarkMode);
  } else {
    initDarkMode();
  }
})();

