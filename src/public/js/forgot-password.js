document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('forgot-password-form');
  const messageDiv = document.getElementById('message');
  const submitBtn = document.getElementById('submit-btn');

  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    
    if (!email) {
      messageDiv.textContent = 'Please enter your email address';
      messageDiv.className = 'text-center text-danger mb-3';
      messageDiv.style.display = 'block';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    messageDiv.style.display = 'none';

    try {
      const res = await fetch('/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        // Store email in cookie for 15 minutes (same as reset code TTL)
        document.cookie = `resetEmail=${encodeURIComponent(email)}; path=/; max-age=900; SameSite=Lax`;
        
        // Redirect immediately to code entry page
        window.location.href = '/reset-password';
      } else {
        messageDiv.textContent = data.message || 'An error occurred';
        messageDiv.className = 'text-center text-danger mb-3';
        messageDiv.style.display = 'block';
      }
    } catch (error) {
      console.error('Error:', error);
      messageDiv.textContent = 'An error occurred. Please try again.';
      messageDiv.className = 'text-center text-danger mb-3';
      messageDiv.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Reset Code';
    }
  });
});