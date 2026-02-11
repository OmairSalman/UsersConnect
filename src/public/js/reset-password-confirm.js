document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('reset-password-form');
  const errorDiv = document.getElementById('error-message');
  const submitBtn = document.getElementById('submit-btn');

  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    errorDiv.style.display = 'none';

    if (!newPassword || !confirmPassword) {
      errorDiv.textContent = 'Please fill in both password fields';
      errorDiv.style.display = 'block';
      return;
    }

    if (newPassword.length < 6) {
      errorDiv.textContent = 'Password must be at least 6 characters';
      errorDiv.style.display = 'block';
      return;
    }

    if (newPassword !== confirmPassword) {
      errorDiv.textContent = 'Passwords do not match';
      errorDiv.style.display = 'block';
      return;
    }

    // Disable button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Resetting...';

    try {
      const res = await fetch('/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword, confirmPassword })
      });

      const data = await res.json();

      if (res.ok) {
        // Success! Redirect to login
        alert('Password reset successfully! Please log in with your new password.');
        window.location.href = '/login';
      } else {
        if (data.message === 'Session expired or invalid') {
          alert('Your session has expired. Please request a new reset code.');
          window.location.href = '/forgot-password';
        } else {
          errorDiv.textContent = data.message || 'An error occurred';
          errorDiv.style.display = 'block';
        }
      }
    } catch (error) {
      console.error('Error:', error);
      errorDiv.textContent = 'An error occurred. Please try again.';
      errorDiv.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Reset Password';
    }
  });
});