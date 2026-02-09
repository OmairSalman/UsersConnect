document.addEventListener('DOMContentLoaded', function() {
  const verifyBtn = document.getElementById('verify-password-btn');
  const form = document.getElementById('edit-profile-form');

  // Password verification logic
  if (verifyBtn) {
    verifyBtn.addEventListener('click', async function() {
      const password = document.getElementById('current-password').value;
      const msg = document.getElementById('verify-password-msg');
      if(password.trim() === '') 
      {
        msg.textContent = 'Please enter your password.';
        return;
      }
      msg.textContent = 'Checking...';
      try {
        const res = await fetch('/auth/verify-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        });
        const data = await res.json();
        if (data.success) {
          document.getElementById('sensitive-fields').disabled = false;
          msg.textContent = 'Password verified! You can now edit your email and password.';
          msg.classList.remove('text-danger');
          msg.classList.add('text-success');
        } else {
            msg.classList.remove('text-success');
            msg.classList.add('text-danger');
            document.getElementById('sensitive-fields').disabled = true;
            msg.textContent = 'Incorrect password.';
        }
      } catch (e) {
        msg.textContent = 'Error verifying password.';
        msg.classList.remove('text-success');
        msg.classList.add('text-danger');
      }
    });
  }

  // Form submission logic (always active)
  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();

      const formData = new FormData(form);
      const data = {};
      formData.forEach((value, key) => { 
        data[key] = value; 
      });

      data.isEmailPublic = document.getElementById('isEmailPublic').checked;

      // Password match check
      const warning = document.getElementById('password-warning');
      if (warning) warning.textContent = ""; // Clear previous warning

      if (data.newPassword || data.confirmPassword)
      {
        if(data.newPassword.length < 6 || data.confirmPassword.length < 6)
        {
          if (warning) warning.textContent = 'Password must be at least 6 characters long.';
            return;
        }
        
        if (!data.newPassword || !data.confirmPassword) {
          if (warning) warning.textContent = 'Please fill out both password fields.';
          return;
        }
        if (data.newPassword !== data.confirmPassword) {
          if (warning) warning.textContent = 'New password and confirmation do not match.';
          return;
        }
      }

      const userId = form.dataset.userid;
      try {
        const res = await fetch(`/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const result = await res.json();

        if (result.success) {
          window.location.href = '/profile';
        } else
        {
          if(result.message === 'Email is already in use.')
          {
            const emailMsg = document.getElementById('email-msg');
            emailMsg.textContent = result.message;
            emailMsg.classList.remove('text-muted');
            emailMsg.classList.add('text-danger');
          }
          else alert(result.message || 'Failed to update profile.');
        }
      } catch (err) {
        alert('Error updating profile.');
      }
    });
  }
});