// Reviews and Suggestions Management
// Reviews are stored in localStorage, suggestions still use Supabase

const STORAGE_KEY = 'tranquilmind_reviews';

// Load and display reviews from localStorage
function loadReviews() {
  const container = document.getElementById('reviewsContainer');
  const loading = document.getElementById('reviewsLoading');
  const empty = document.getElementById('reviewsEmpty');
  
  if (!container) {
    console.error('Reviews container not found');
    return;
  }

  try {
    // Hide loading indicator
    if (loading) loading.style.display = 'none';

    // Get reviews from localStorage
    const reviewsJson = localStorage.getItem(STORAGE_KEY);
    let reviews = [];

    if (reviewsJson) {
      try {
        reviews = JSON.parse(reviewsJson);
      } catch (parseError) {
        console.error('Error parsing reviews from localStorage:', parseError);
        reviews = [];
      }
    }

    // Sort by most recent first
    reviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Limit to 20 most recent
    reviews = reviews.slice(0, 20);

    if (reviews.length === 0) {
      if (empty) empty.style.display = 'block';
      return;
    }

    if (empty) empty.style.display = 'none';

    // Clear container
    container.innerHTML = '';

    // Display reviews
    reviews.forEach(review => {
      const reviewCard = createReviewCard(review);
      container.appendChild(reviewCard);
    });
  } catch (error) {
    console.error('Error in loadReviews:', error);
    if (loading) loading.style.display = 'none';
    if (empty) {
      empty.innerHTML = '<i class="fas fa-exclamation-triangle"></i><p>Error loading reviews. Please try again later.</p>';
      empty.style.display = 'block';
    }
  }
}

// Create a review card element
function createReviewCard(review) {
  const card = document.createElement('div');
  card.className = 'card feedback-card';

  const date = new Date(review.created_at);
  const formattedDate = date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });

  const name = review.user_name || 'Anonymous';
  const avatarGradients = [
    'linear-gradient(135deg, #a855f7, #ec4899)',
    'linear-gradient(135deg, #10b981, #3b82f6)',
    'linear-gradient(135deg, #f59e0b, #ec4899)',
    'linear-gradient(135deg, #8b5cf6, #3b82f6)',
    'linear-gradient(135deg, #ec4899, #f59e0b)',
    'linear-gradient(135deg, #3b82f6, #06b6d4)'
  ];
  const gradient = avatarGradients[Math.abs(review.id.charCodeAt(0)) % avatarGradients.length];

  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled = i < review.rating;
    return `<i class="fas ${filled ? 'fa-star' : 'far fa-star'}"></i>`;
  }).join('');

  card.innerHTML = `
    <div class="feedback-header">
      <div class="feedback-avatar" style="background: ${gradient};">
        <i class="fas fa-user"></i>
      </div>
      <div class="feedback-meta">
        <div class="feedback-name">${escapeHtml(name)}</div>
        <div class="feedback-date">${formattedDate}</div>
      </div>
      <div class="feedback-rating">
        ${stars}
      </div>
    </div>
    <p class="feedback-text">"${escapeHtml(review.review_text)}"</p>
  `;

  return card;
}

// Handle review form submission
function handleReviewSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const rating = form.querySelector('input[name="rating"]:checked')?.value;
  const reviewText = document.getElementById('reviewText').value.trim();
  const reviewerName = document.getElementById('reviewerName').value.trim();

  if (!rating || !reviewText) {
    showMessage('reviewMessage', 'Please fill in all required fields.', 'error');
    return;
  }

  try {
    // Get existing reviews from localStorage
    const reviewsJson = localStorage.getItem(STORAGE_KEY);
    let reviews = [];

    if (reviewsJson) {
      try {
        reviews = JSON.parse(reviewsJson);
      } catch (parseError) {
        console.error('Error parsing existing reviews:', parseError);
        reviews = [];
      }
    }

    // Create new review object
    const newReview = {
      id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      rating: parseInt(rating),
      review_text: reviewText,
      user_name: reviewerName || null,
      created_at: new Date().toISOString()
    };

    // Add new review to array
    reviews.push(newReview);

    // Save back to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    } catch (storageError) {
      // Handle quota exceeded error
      if (storageError.name === 'QuotaExceededError') {
        // Keep only the 50 most recent reviews
        reviews = reviews.slice(-50);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
        showMessage('reviewMessage', 'Review saved! (Note: Some older reviews were removed due to storage limits)', 'success');
      } else {
        throw storageError;
      }
    }

    // Success
    showMessage('reviewMessage', 'Thank you for your review!', 'success');
    form.reset();
    
    // Reload reviews immediately
    loadReviews();
  } catch (error) {
    console.error('Error in handleReviewSubmit:', error);
    showMessage('reviewMessage', 'Error submitting review. Please try again.', 'error');
  }
}

// Handle suggestion form submission - using mailto
function handleSuggestionSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const category = document.getElementById('suggestionCategory').value;
  const suggestionText = document.getElementById('suggestionText').value.trim();
  const suggesterName = document.getElementById('suggesterName').value.trim();

  if (!category || !suggestionText) {
    showMessage('suggestionMessage', 'Please fill in all required fields.', 'error');
    return;
  }

  try {
    // Prepare email content
    const emailSubject = encodeURIComponent(`Platform Suggestion: ${category}`);
    
    const emailBody = encodeURIComponent(
      `Hello,\n\n` +
      `I would like to submit the following suggestion for platform improvements:\n\n` +
      `Category: ${category}\n` +
      `Name: ${suggesterName || 'Anonymous'}\n` +
      `Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\n\n` +
      `Suggestion:\n${suggestionText}\n\n` +
      `---\n` +
      `This suggestion was submitted through the TranquilMind platform.`
    );

    // Create mailto link
    // IMPORTANT: Replace 'your-email@example.com' with your actual email address
    const emailAddress = 'your-email@example.com'; // ⚠️ CHANGE THIS TO YOUR EMAIL ADDRESS
    
    // Check if email is still placeholder
    if (emailAddress === 'your-email@example.com') {
      showMessage('suggestionMessage', '⚠️ Please configure your email address in reviews.js (line 201). Replace "your-email@example.com" with your actual email.', 'error');
      return;
    }
    
    const mailtoLink = `mailto:${emailAddress}?subject=${emailSubject}&body=${emailBody}`;

    // Open email client
    window.location.href = mailtoLink;

    // Show success message
    showMessage('suggestionMessage', '✓ Opening your email client... Please review and send the email to submit your suggestion.', 'success');
    
    // Reset form after a short delay
    setTimeout(() => {
      form.reset();
    }, 2000);
  } catch (error) {
    console.error('Error in handleSuggestionSubmit:', error);
    showMessage('suggestionMessage', 'Error preparing email. Please try again.', 'error');
  }
}

// Show message to user
function showMessage(elementId, message, type) {
  const messageEl = document.getElementById(elementId);
  if (!messageEl) return;

  messageEl.textContent = message;
  messageEl.className = `form-message ${type}`;
  messageEl.style.display = 'block';

  // Auto-hide after 5 seconds
  setTimeout(() => {
    messageEl.style.display = 'none';
  }, 5000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeReviews();
  });
} else {
  initializeReviews();
}

function initializeReviews() {
  // Set up review form (no Supabase needed for reviews)
  const reviewForm = document.getElementById('reviewForm');
  if (reviewForm) {
    reviewForm.addEventListener('submit', handleReviewSubmit);
  }

  // Set up suggestion form (uses mailto)
  const suggestionForm = document.getElementById('suggestionForm');
  if (suggestionForm) {
    suggestionForm.addEventListener('submit', handleSuggestionSubmit);
  }

  // Load reviews immediately (from localStorage)
  loadReviews();
}

