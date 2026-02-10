document.addEventListener('DOMContentLoaded', function() {
  const verifyBtn = document.getElementById('verify-password-btn');
  const form = document.getElementById('edit-profile-form');
  const userId = form.dataset.userid;

  // Profile picture elements
  const profilePictureInput = document.getElementById('profile-picture-input');
  const previewSection = document.getElementById('profile-picture-preview');
  const previewAvatar = document.getElementById('preview-avatar');
  const currentAvatar = document.getElementById('current-avatar');
  const saveBtn = document.getElementById('save-profile-picture-btn');
  const cancelBtn = document.getElementById('cancel-profile-picture-btn');
  const removeCustomBtn = document.getElementById('remove-custom-picture-btn');

  // Check if using custom avatar on page load
  const currentAvatarURL = currentAvatar.src;
  if (removeCustomBtn && !currentAvatarURL.includes('gravatar.com')) {
    removeCustomBtn.style.display = 'inline-block';
  }

  // Handle file selection
  if (profilePictureInput) {
    profilePictureInput.addEventListener('change', function() {
      const file = this.files[0];
      if (file) {
        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('File size must be less than 5MB');
          this.value = '';
          return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onload = function(e) {
          previewAvatar.src = e.target.result;
          previewSection.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Handle save profile picture
  if (saveBtn) {
    saveBtn.addEventListener('click', async function() {
      const file = profilePictureInput.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('profilePicture', file);

      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading...';

      try {
        const res = await fetch(`/users/${userId}/profile-picture`, {
          method: 'POST',
          body: formData
        });

        const data = await res.json();

        if (res.ok && data.success) {
          // Update current avatar
          currentAvatar.src = data.user.avatarURL;
          
          // Hide preview
          previewSection.style.display = 'none';
          profilePictureInput.value = '';

          // Show remove button if it exists
          if (removeCustomBtn) {
            removeCustomBtn.style.display = 'inline-block';
          }

          alert('Profile picture updated successfully!');
          window.location.reload();
        } else {
          alert(data.message || 'Failed to upload profile picture');
        }
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        alert('Error uploading profile picture');
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Save Picture';
      }
    });
  }

  // Handle cancel
  if (cancelBtn) {
    cancelBtn.addEventListener('click', function() {
      previewSection.style.display = 'none';
      profilePictureInput.value = '';
    });
  }

  // Handle remove custom picture
  if (removeCustomBtn) {
    removeCustomBtn.addEventListener('click', async function() {
      if (!confirm('Are you sure you want to remove your custom profile picture? Your avatar will revert to Gravatar.')) {
        return;
      }

      removeCustomBtn.disabled = true;
      removeCustomBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Removing...';

      try {
        const res = await fetch(`/users/${userId}/profile-picture`, {
          method: 'DELETE'
        });

        const data = await res.json();

        if (res.ok && data.success) {
          // Update current avatar to Gravatar
          currentAvatar.src = data.user.avatarURL;
          
          // Hide remove button
          removeCustomBtn.style.display = 'none';

          alert('Profile picture removed. Now using Gravatar.');
          window.location.reload();
        } else {
          alert(data.message || 'Failed to remove profile picture');
        }
      } catch (error) {
        console.error('Error removing profile picture:', error);
        alert('Error removing profile picture');
      } finally {
        removeCustomBtn.disabled = false;
        removeCustomBtn.innerHTML = '<i class="fa-solid fa-times"></i> Remove Custom Picture';
      }
    });
  }

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

      data.avatarURL = currentAvatar.src;

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