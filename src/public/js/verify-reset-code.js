document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('verify-code-form');
  const errorDiv = document.getElementById('error-message');
  const submitBtn = document.getElementById('submit-btn');
  const resendBtn = document.getElementById('resend-btn');
  const codeInput = document.getElementById('code');
  const emailInput = document.getElementById('email');

  if (!form) return;

  // Helper function to get cookie value
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
    return null;
  }

  // Helper function to delete cookie
  function deleteCookie(name) {
    document.cookie = `${name}=; path=/; max-age=0`;
  }

  // Get email from cookie
  const email = getCookie('resetEmail');
  
  if (!email) {
    // No email found - redirect back to forgot password
    alert('Please start from the forgot password page.');
    window.location.href = '/forgot-password';
    return;
  }

  // Set email in hidden field
  emailInput.value = email;

  // Auto-format code input (numbers only)
  codeInput.addEventListener('input', function(e) {
    this.value = this.value.replace(/[^0-9]/g, '');
  });

  // Handle resend button
  if (resendBtn) {
    resendBtn.addEventListener('click', async function() {
      resendBtn.disabled = true;
      resendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
      errorDiv.style.display = 'none';

      try {
        const res = await fetch('/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        const data = await res.json();

        if (res.ok) {
          errorDiv.textContent = 'Code sent! Check your email.';
          errorDiv.className = 'text-center text-success mb-3';
          errorDiv.style.display = 'block';
          
          setTimeout(() => {
            errorDiv.style.display = 'none';
            errorDiv.className = 'text-center text-danger mb-3';
          }, 3000);
        } else {
          errorDiv.textContent = data.message || 'Failed to resend code';
          errorDiv.style.display = 'block';
        }
      } catch (error) {
        console.error('Error resending code:', error);
        errorDiv.textContent = 'Error sending code';
        errorDiv.style.display = 'block';
      } finally {
        resendBtn.disabled = false;
        resendBtn.innerHTML = '<i class="fa-solid fa-rotate"></i> Resend Code';
      }
    });
  }

  // Handle form submission
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const code = codeInput.value.trim();
    
    if (!code) {
      errorDiv.textContent = 'Please enter the code';
      errorDiv.style.display = 'block';
      return;
    }

    if (code.length !== 6) {
      errorDiv.textContent = 'Code must be 6 digits';
      errorDiv.style.display = 'block';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Verifying...';
    errorDiv.style.display = 'none';

    try {
      const res = await fetch('/auth/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });

      const data = await res.json();

      if (res.ok) {
        // Clear email cookie
        deleteCookie('resetEmail');
        
        // Code verified! Redirect to password reset page
        window.location.href = '/reset-password/confirm';
      } else {
        errorDiv.textContent = data.message || 'Invalid or expired code';
        errorDiv.style.display = 'block';
      }
    } catch (error) {
      console.error('Error:', error);
      errorDiv.textContent = 'An error occurred. Please try again.';
      errorDiv.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Verify Code';
    }
  });
});