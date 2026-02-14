document.addEventListener('DOMContentLoaded', function() {
  // Get userId and email from the hidden form
  const form = document.getElementById('edit-profile-form');
  if (!form) {
    console.error('Edit profile form not found');
    return;
  }
  const userId = form.dataset.userid;
  const userEmail = form.dataset.useremail;

  // Profile picture elements
  const profilePictureInput = document.getElementById('profile-picture-input');
  const previewSection = document.getElementById('profile-picture-preview');
  const previewAvatar = document.getElementById('preview-avatar');
  const currentAvatar = document.getElementById('current-avatar');
  const saveBtn = document.getElementById('save-profile-picture-btn');
  const cancelBtn = document.getElementById('cancel-profile-picture-btn');
  const removeCustomBtn = document.getElementById('remove-custom-picture-btn');

  // Check if using custom avatar on page load
  if (currentAvatar && removeCustomBtn) {
    const currentAvatarURL = currentAvatar.src;
    if (!currentAvatarURL.includes('gravatar.com')) {
      removeCustomBtn.style.display = 'inline-block';
    }
  }

  // Handle file selection
  if (profilePictureInput) {
    profilePictureInput.addEventListener('change', function() {
      const file = this.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          alert('File size must be less than 5MB');
          this.value = '';
          return;
        }

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
          currentAvatar.src = data.user.avatarURL;
          previewSection.style.display = 'none';
          profilePictureInput.value = '';

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
          currentAvatar.src = data.user.avatarURL;
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

  // ============ NAME UPDATE ============
  const nameInput = document.getElementById('edit-name');
  const updateNameBtn = document.getElementById('update-name-btn');

  if (nameInput && updateNameBtn) {
    nameInput.addEventListener('input', function() {
      const original = this.dataset.original;
      const current = this.value.trim();
      updateNameBtn.disabled = (current === original || current === '');
    });

    updateNameBtn.addEventListener('click', async function() {
      const newName = nameInput.value.trim();
      if (!newName) return;

      updateNameBtn.disabled = true;
      updateNameBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Updating...';

      try {
        const res = await fetch(`/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: newName,
            email: userEmail,
            isEmailPublic: document.getElementById('isEmailPublic').checked
          })
        });

        const data = await res.json();

        if (res.ok && data.success) {
          nameInput.dataset.original = newName;
          updateNameBtn.disabled = true;
          alert('Name updated successfully!');
          window.location.reload();
        } else {
          alert(data.message || 'Failed to update name');
        }
      } catch (error) {
        console.error('Error updating name:', error);
        alert('Error updating name');
      } finally {
        updateNameBtn.innerHTML = '<i class="fa-solid fa-check"></i> Update Name';
      }
    });
  }

  // ============ EMAIL PRIVACY UPDATE ============
  const emailPrivacyCheckbox = document.getElementById('isEmailPublic');
  const updateEmailPrivacyBtn = document.getElementById('update-email-privacy-btn');

  if (emailPrivacyCheckbox && updateEmailPrivacyBtn) {
    emailPrivacyCheckbox.addEventListener('change', function() {
      const original = this.dataset.original === 'true';
      const current = this.checked;
      updateEmailPrivacyBtn.style.display = (current !== original) ? 'inline-block' : 'none';
    });

    updateEmailPrivacyBtn.addEventListener('click', async function() {
      const isPublic = emailPrivacyCheckbox.checked;

      updateEmailPrivacyBtn.disabled = true;
      updateEmailPrivacyBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

      try {
        const res = await fetch(`/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: nameInput.value,
            email: userEmail,
            isEmailPublic: isPublic
          })
        });

        const data = await res.json();

        if (res.ok && data.success) {
          emailPrivacyCheckbox.dataset.original = isPublic;
          updateEmailPrivacyBtn.style.display = 'none';
          alert('Email privacy updated successfully!');
        } else {
          alert(data.message || 'Failed to update email privacy');
        }
      } catch (error) {
        console.error('Error updating email privacy:', error);
        alert('Error updating email privacy');
      } finally {
        updateEmailPrivacyBtn.disabled = false;
        updateEmailPrivacyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Save';
      }
    });
  }

  // ============ PASSWORD UPDATE ============
  const currentPasswordInput = document.getElementById('current-password');
  const newPasswordInput = document.getElementById('new-password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  const updatePasswordBtn = document.getElementById('update-password-btn');
  const passwordError = document.getElementById('password-error');

  if (updatePasswordBtn) {
    updatePasswordBtn.addEventListener('click', async function() {
      const currentPassword = currentPasswordInput.value;
      const newPassword = newPasswordInput.value;
      const confirmPassword = confirmPasswordInput.value;

      passwordError.style.display = 'none';
      passwordError.textContent = '';

      // Validation
      if (!currentPassword || !newPassword || !confirmPassword) {
        passwordError.textContent = 'Please fill in all password fields';
        passwordError.style.display = 'block';
        return;
      }

      if (newPassword.length < 6) {
        passwordError.textContent = 'New password must be at least 6 characters';
        passwordError.style.display = 'block';
        return;
      }

      if (newPassword !== confirmPassword) {
        passwordError.textContent = 'New passwords do not match';
        passwordError.style.display = 'block';
        return;
      }

      updatePasswordBtn.disabled = true;
      updatePasswordBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Updating...';

      try {
        const res = await fetch(`/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: nameInput.value,
            email: userEmail,
            isEmailPublic: emailPrivacyCheckbox.checked,
            currentPassword: currentPassword, 
            newPassword: newPassword,
            confirmPassword: confirmPassword
          })
        });

        const data = await res.json();

        if (res.ok && data.success) {
          currentPasswordInput.value = '';
          newPasswordInput.value = '';
          confirmPasswordInput.value = '';
          
          alert('Password updated successfully!');
        } else {
          passwordError.textContent = data.message || 'Failed to update password';
          passwordError.style.display = 'block';
        }
      } catch (error) {
        console.error('Error updating password:', error);
        passwordError.textContent = 'Error updating password';
        passwordError.style.display = 'block';
      } finally {
        updatePasswordBtn.disabled = false;
        updatePasswordBtn.innerHTML = '<i class="fa-solid fa-key"></i> Update Password';
      }
    });
  }

  // ============ EMAIL CHANGE MODAL ============
  const changeEmailBtn = document.getElementById('change-email-btn');

  if (changeEmailBtn) {
    let currentStep = 1;
    let modalInstance = null;
    let currentNewEmail = ''; // Store new email for resend

    function createModalHTML() {
    const modalHTML = `
      <div class="modal fade" id="changeEmailModal" tabindex="-1" aria-labelledby="changeEmailModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="changeEmailModalLabel">Change Email</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <!-- Step 1: Verify Current Email -->
              <div id="step-verify-current" class="email-change-step">
                <p id="step1-message">Sending verification code to <strong>${userEmail}</strong>...</p>
                <div class="mb-3">
                  <label for="current-email-code" class="form-label">Verification Code</label>
                  <input type="text" class="form-control" id="current-email-code" placeholder="Enter 6-digit code" maxlength="6">
                </div>
                <small class="text-muted">Check your spam folder if you don't see the email.</small>
                <div id="verify-current-error" class="text-danger small mt-2" style="display: none;"></div>
              </div>

              <!-- Step 2: Enter New Email -->
              <div id="step-enter-new" class="email-change-step" style="display: none;">
                <p>Enter your new email address</p>
                <div class="mb-3">
                  <label for="new-email-input" class="form-label">New Email</label>
                  <input type="email" class="form-control" id="new-email-input" placeholder="your.new@email.com">
                </div>
                <div id="new-email-error" class="text-danger small mt-2" style="display: none;"></div>
              </div>

              <!-- Step 3: Verify New Email -->
              <div id="step-verify-new" class="email-change-step" style="display: none;">
                <p id="step3-message">Sending verification code to <strong id="new-email-display"></strong>...</p>
                <div class="mb-3">
                  <label for="new-email-code" class="form-label">Verification Code</label>
                  <input type="text" class="form-control" id="new-email-code" placeholder="Enter 6-digit code" maxlength="6">
                </div>
                <small class="text-muted">Check your spam folder if you don't see the email.</small>
                <div id="verify-new-error" class="text-danger small mt-2" style="display: none;"></div>
              </div>
            </div>
            <div class="modal-footer">
              <!-- Resend buttons (shown for steps 1 and 3) -->
              <button type="button" class="btn btn-secondary" id="resend-current-email-btn" style="display: none;">
                <i class="fa-solid fa-rotate"></i> Resend Code
              </button>
              <button type="button" class="btn btn-secondary" id="resend-new-email-btn" style="display: none;">
                <i class="fa-solid fa-rotate"></i> Resend Code
              </button>
              
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary" id="email-change-action-btn">Verify Current Email</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    setupResendButtons();
  }

    function showStep(stepNumber) {
      const steps = {
        1: document.getElementById('step-verify-current'),
        2: document.getElementById('step-enter-new'),
        3: document.getElementById('step-verify-new')
      };

      Object.values(steps).forEach(step => {
        if (step) step.style.display = 'none';
      });
      
      if (steps[stepNumber]) {
        steps[stepNumber].style.display = 'block';
      }
      
      currentStep = stepNumber;
      
      // Update main action button
      const actionBtn = document.getElementById('email-change-action-btn');
      if (actionBtn) {
        if (stepNumber === 1) {
          actionBtn.textContent = 'Verify Current Email';
        } else if (stepNumber === 2) {
          actionBtn.textContent = 'Send Verification Code';
        } else if (stepNumber === 3) {
          actionBtn.textContent = 'Verify & Save';
        }
      }

      // Show/hide resend buttons
      const resendCurrentBtn = document.getElementById('resend-current-email-btn');
      const resendNewBtn = document.getElementById('resend-new-email-btn');
      
      if (resendCurrentBtn) resendCurrentBtn.style.display = (stepNumber === 1) ? 'inline-block' : 'none';
      if (resendNewBtn) resendNewBtn.style.display = (stepNumber === 3) ? 'inline-block' : 'none';
    }

    function setupResendButtons() {
      // Resend code for current email (step 1)
      const resendCurrentBtn = document.getElementById('resend-current-email-btn');
      if (resendCurrentBtn) {
        resendCurrentBtn.addEventListener('click', async function() {
          resendCurrentBtn.disabled = true;
          resendCurrentBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
          
          const errorDiv = document.getElementById('verify-current-error');
          errorDiv.style.display = 'none';

          try {
            const res = await fetch('/auth/email-change/request', {
              method: 'POST'
            });

            const data = await res.json();
            const step1Message = document.getElementById('step1-message');

            if (res.ok && data.success) {
              step1Message.innerHTML = `Verification code sent to <strong>${userEmail}</strong>`;
              errorDiv.textContent = 'Code sent! Check your email.';
              errorDiv.className = 'text-success small mt-2';
              errorDiv.style.display = 'block';
              
              setTimeout(() => {
                errorDiv.style.display = 'none';
                errorDiv.className = 'text-danger small mt-2';
              }, 3000);
            } else {
              step1Message.innerHTML = `<span class="text-danger">Failed to send code.</span>`;
            }
          } catch (error) {
            console.error('Error resending code:', error);
            const step1Message = document.getElementById('step1-message');
            step1Message.innerHTML = `<span class="text-danger">Error sending code.</span>`;
          } finally {
            resendCurrentBtn.disabled = false;
            resendCurrentBtn.innerHTML = '<i class="fa-solid fa-rotate"></i> Resend Code';
          }
        });
      }

      // Resend code for new email (step 3)
      const resendNewBtn = document.getElementById('resend-new-email-btn');
      if (resendNewBtn) {
        resendNewBtn.addEventListener('click', async function() {
          resendNewBtn.disabled = true;
          resendNewBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
          
          const errorDiv = document.getElementById('verify-new-error');
          errorDiv.style.display = 'none';

          try {
            const res = await fetch('/auth/email-change/request-new', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ newEmail: currentNewEmail })
            });

            const data = await res.json();
            const step3Message = document.getElementById('step3-message');

            if (res.ok && data.success) {
              step3Message.innerHTML = `Verification code sent to <strong>${currentNewEmail}</strong>`;
              errorDiv.textContent = 'Code sent! Check your email.';
              errorDiv.className = 'text-success small mt-2';
              errorDiv.style.display = 'block';
              
              setTimeout(() => {
                errorDiv.style.display = 'none';
                errorDiv.className = 'text-danger small mt-2';
              }, 3000);
            } else {
              step3Message.innerHTML = `<span class="text-danger">Failed to send code.</span>`;
            }
          } catch (error) {
            console.error('Error resending code:', error);
            const step3Message = document.getElementById('step3-message');
            step3Message.innerHTML = `<span class="text-danger">Error sending code.</span>`;
          } finally {
            resendNewBtn.disabled = false;
            resendNewBtn.innerHTML = '<i class="fa-solid fa-rotate"></i> Resend Code';
          }
        });
      }
    }

    changeEmailBtn.addEventListener('click', async function() {
      // Prevent multiple clicks
      changeEmailBtn.disabled = true;

      // Create modal if it doesn't exist
      if (!document.getElementById('changeEmailModal')) {
        createModalHTML();
        
        // Set up event listener for action button
        const actionBtn = document.getElementById('email-change-action-btn');
        if (actionBtn) {
          actionBtn.addEventListener('click', handleActionClick);
        }
      }

      // Reset modal state
      currentStep = 1;
      currentNewEmail = '';
      showStep(1);
      
      const currentCodeInput = document.getElementById('current-email-code');
      const newEmailInput = document.getElementById('new-email-input');
      const newCodeInput = document.getElementById('new-email-code');
      
      if (currentCodeInput) currentCodeInput.value = '';
      if (newEmailInput) newEmailInput.value = '';
      if (newCodeInput) newCodeInput.value = '';
      
      document.getElementById('verify-current-error').style.display = 'none';
      document.getElementById('new-email-error').style.display = 'none';
      document.getElementById('verify-new-error').style.display = 'none';

      // Show modal IMMEDIATELY
      if (typeof bootstrap !== 'undefined') {
        const modalEl = document.getElementById('changeEmailModal');
        modalInstance = new bootstrap.Modal(modalEl);
        modalInstance.show();
      }

      // NOW send the email in the background
      try {
        const res = await fetch('/auth/email-change/request', {
          method: 'POST'
        });

        const data = await res.json();

        const step1Message = document.getElementById('step1-message');
        
        if (res.ok && data.success) {
          step1Message.innerHTML = `Verification code sent to <strong>${userEmail}</strong>`;
        } else {
          step1Message.innerHTML = `<span class="text-danger">Failed to send code. Please close and try again.</span>`;
        }
      } catch (error) {
        console.error('Error sending email:', error);
        const step1Message = document.getElementById('step1-message');
        step1Message.innerHTML = `<span class="text-danger">Error sending code. Please close and try again.</span>`;
      } finally {
        // Re-enable button
        changeEmailBtn.disabled = false;
      }
    });

    async function handleActionClick() {
      const actionBtn = document.getElementById('email-change-action-btn');
      
      if (currentStep === 1) {
        const codeInput = document.getElementById('current-email-code');
        const errorDiv = document.getElementById('verify-current-error');
        
        if (!codeInput || !errorDiv) return;

        const code = codeInput.value.trim();

        if (!code || code.length !== 6) {
          errorDiv.textContent = 'Please enter a 6-digit code';
          errorDiv.style.display = 'block';
          return;
        }

        actionBtn.disabled = true;
        actionBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying...';

        try {
          const res = await fetch('/auth/email-change/verify-current', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
          });

          const data = await res.json();

          if (res.ok && data.success) {
            errorDiv.style.display = 'none';
            showStep(2);
          } else {
            errorDiv.textContent = data.message || 'Invalid code';
            errorDiv.style.display = 'block';
          }
        } catch (error) {
          console.error('Error verifying current email:', error);
          errorDiv.textContent = 'Error verifying code';
          errorDiv.style.display = 'block';
        } finally {
          actionBtn.disabled = false;
          actionBtn.textContent = 'Send Verification Code';
        }
      } else if (currentStep === 2) {
        const emailInput = document.getElementById('new-email-input');
        const errorDiv = document.getElementById('new-email-error');
        
        if (!emailInput || !errorDiv) return;

        const newEmail = emailInput.value.trim();

        if (!newEmail) {
          errorDiv.textContent = 'Please enter a new email address';
          errorDiv.style.display = 'block';
          return;
        }

        if (newEmail === userEmail) {
          errorDiv.textContent = 'New email must be different from current email';
          errorDiv.style.display = 'block';
          return;
        }

        // Store new email for resend functionality
        currentNewEmail = newEmail;

        actionBtn.disabled = true;
        actionBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

        // Update display and show step 3 immediately
        const displaySpan = document.getElementById('new-email-display');
        if (displaySpan) displaySpan.textContent = newEmail;
        showStep(3);

        // Send email in background
        try {
          const res = await fetch('/auth/email-change/request-new', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newEmail })
          });

          const data = await res.json();

          const step3Message = document.getElementById('step3-message');

          if (res.ok && data.success) {
            errorDiv.style.display = 'none';
            step3Message.innerHTML = `Verification code sent to <strong>${newEmail}</strong>`;
          } else {
            // Go back to step 2 on error
            showStep(2);
            errorDiv.textContent = data.message || 'Failed to send verification code';
            errorDiv.style.display = 'block';
          }
        } catch (error) {
          console.error('Error sending new email verification:', error);
          showStep(2);
          errorDiv.textContent = 'Error sending verification code';
          errorDiv.style.display = 'block';
        } finally {
          actionBtn.disabled = false;
          actionBtn.textContent = 'Verify & Save';
        }
      } else if (currentStep === 3) {
        const codeInput = document.getElementById('new-email-code');
        const errorDiv = document.getElementById('verify-new-error');
        
        if (!codeInput || !errorDiv) return;

        const code = codeInput.value.trim();

        if (!code || code.length !== 6) {
          errorDiv.textContent = 'Please enter a 6-digit code';
          errorDiv.style.display = 'block';
          return;
        }

        actionBtn.disabled = true;
        actionBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

        try {
          const res = await fetch('/auth/email-change/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
          });

          const data = await res.json();

          if (res.ok && data.success) {
            alert('Email changed successfully!');
            if (modalInstance) {
              modalInstance.hide();
            }
            window.location.reload();
          } else {
            errorDiv.textContent = data.message || 'Invalid code';
            errorDiv.style.display = 'block';
          }
        } catch (error) {
          console.error('Error confirming email change:', error);
          errorDiv.textContent = 'Error verifying code';
          errorDiv.style.display = 'block';
        } finally {
          actionBtn.disabled = false;
          actionBtn.textContent = 'Verify & Save';
        }
      }
    }
  }
});