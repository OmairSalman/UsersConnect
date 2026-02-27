document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('verify-code-form');
  const errorDiv = document.getElementById('error-message');
  const submitBtn = document.getElementById('submit-btn');
  const resendBtn = document.getElementById('resend-btn');
  const codeInput = document.getElementById('code');

  if (!form) return;

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
        // Backend will read email from resetEmail cookie
        const res = await fetch('/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'resend' }) // Dummy - backend reads from cookie
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
          // Cookie might have expired
          if (data.message?.includes('session') || data.message?.includes('expired')) {
            alert('Your session has expired. Please start over.');
            window.location.href = '/forgot-password';
          } else {
            errorDiv.textContent = data.message || 'Failed to resend code';
            errorDiv.style.display = 'block';
          }
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
      // Only send code - backend reads email from resetEmail cookie
      const res = await fetch('/auth/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      const data = await res.json();

      if (res.ok) {
        // Success! Backend set resetSessionToken cookie and cleared resetEmail cookie
        window.location.href = '/reset-password/confirm';
      } else {
        // Check for session/cookie expiration
        if (data.message?.includes('Email and code are required') || 
            data.message?.includes('session') || 
            data.message?.includes('expired')) {
          alert('Your session has expired. Please start over.');
          window.location.href = '/forgot-password';
        } else {
          errorDiv.textContent = data.message || 'Invalid or expired code';
          errorDiv.style.display = 'block';
        }
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
