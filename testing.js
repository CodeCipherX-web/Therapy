// Interactive Before/After Slider for Testing Results Page

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all comparison sliders
  const sliders = document.querySelectorAll('.comparison-slider');
  
  sliders.forEach(slider => {
    const container = slider.closest('.before-after-image');
    const beforeImage = container.querySelector('.image-before');
    const handle = container.querySelector('.slider-handle');
    
    if (!container || !beforeImage || !handle) return;
    
    // Set initial position
    const updateSlider = (value) => {
      const percentageStr = value + '%';
      beforeImage.style.width = percentageStr;
      handle.style.left = percentageStr;
      
      // Update slider value
      slider.value = value;
    };
    
    // Initialize at 50%
    updateSlider(50);
    
    // Handle slider input
    slider.addEventListener('input', (e) => {
      updateSlider(e.target.value);
    });
    
    // Handle mouse drag on the handle
    let isDragging = false;
    
    handle.addEventListener('mousedown', (e) => {
      isDragging = true;
      e.preventDefault();
    });
    
    container.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      updateSlider(percentage);
    });
    
    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
    
    // Handle touch events for mobile
    handle.addEventListener('touchstart', (e) => {
      isDragging = true;
      e.preventDefault();
    });
    
    container.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      
      const rect = container.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      updateSlider(percentage);
      e.preventDefault();
    });
    
    document.addEventListener('touchend', () => {
      isDragging = false;
    });
    
    // Handle click on container to jump to position
    container.addEventListener('click', (e) => {
      if (e.target === slider) return; // Don't interfere with slider input
      
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      updateSlider(percentage);
    });
  });
});

