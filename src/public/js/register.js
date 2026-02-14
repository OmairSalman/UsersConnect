document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('register-form');
  const errorDiv = document.getElementById('register-error');
  const submitBtn = document.getElementById('register-btn');

  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Hide previous errors
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';

    // Frontend validation
    if (!name || !email || !password || !confirmPassword) {
      errorDiv.textContent = 'Please fill in all fields';
      errorDiv.style.display = 'block';
      return;
    }

    if (password.length < 6) {
      errorDiv.textContent = 'Password must be at least 6 characters';
      errorDiv.style.display = 'block';
      return;
    }

    if (password !== confirmPassword) {
      errorDiv.textContent = 'Passwords do not match';
      errorDiv.style.display = 'block';
      return;
    }

    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Registering...';

    try {
      const res = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, confirmPassword })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Success! Redirect to feed
        window.location.href = '/feed?page=1';
      } else {
        // Show error message
        errorDiv.textContent = data.message || 'Registration failed';
        errorDiv.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Register';
      }
    } catch (error) {
      console.error('Registration error:', error);
      errorDiv.textContent = 'An error occurred. Please try again.';
      errorDiv.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Register';
    }
  });
});