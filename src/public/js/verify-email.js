document.addEventListener('DOMContentLoaded', function() {
  let verifyEmailModalInstance = null;
  let pleaseVerifyModalInstance = null;

  // Create verification modal HTML
  function createVerifyEmailModal() {
    const modalHTML = `
      <div class="modal fade" id="verifyEmailModal" tabindex="-1" aria-labelledby="verifyEmailModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="verifyEmailModalLabel">Verify Your Email</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <!-- Initial State -->
              <div id="verify-email-input-state">
                <p id="verify-email-status-message">Sending verification code to your email...</p>
                <div class="mb-3">
                  <label for="email-verification-code" class="form-label">Verification Code</label>
                  <input type="text" class="form-control" id="email-verification-code" placeholder="Enter 6-digit code" maxlength="6">
                </div>
                <small class="text-muted">Check your spam folder if you don't see the email.</small>
                <div id="verify-email-error" class="text-danger small mt-2" style="display: none;"></div>
              </div>

              <!-- Success State -->
              <div id="verify-email-success-state" style="display: none;">
                <div class="text-center">
                  <i class="fa-solid fa-circle-check text-success" style="font-size: 64px;"></i>
                  <h4 class="mt-3">Email Verified!</h4>
                  <p class="text-muted">Your email has been successfully verified. You can now create posts, comment, and interact with content.</p>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <!-- Initial State Buttons -->
              <div id="verify-email-input-buttons">
                <button type="button" class="btn btn-secondary" id="resend-verification-btn">
                  <i class="fa-solid fa-rotate"></i> Resend Code
                </button>
                <button type="button" class="btn btn-primary" id="verify-email-btn">Verify</button>
              </div>

              <!-- Success State Buttons -->
              <div id="verify-email-success-buttons" style="display: none;">
                <button type="button" class="btn btn-secondary" id="verify-email-close-btn">Close</button>
                <a href="/feed" class="btn btn-primary">Go to Feed</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    setupVerifyEmailHandlers();
  }

  // Create "please verify" modal HTML
  function createPleaseVerifyModal() {
    const modalHTML = `
      <div class="modal fade" id="pleaseVerifyModal" tabindex="-1" aria-labelledby="pleaseVerifyModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="pleaseVerifyModalLabel">Email Verification Required</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="text-center py-3">
                <i class="fa-solid fa-envelope-circle-check text-warning" style="font-size: 64px;"></i>
                <h5 class="mt-3">Please Verify Your Email</h5>
                <p class="text-muted">You need to verify your email address before you can create posts, comment, or interact with content.</p>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Later</button>
              <button type="button" class="btn btn-primary" id="verify-now-btn">Verify Now</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    setupPleaseVerifyHandlers();
  }

  // Show input state (reset modal)
  function showInputState() {
    const inputState = document.getElementById('verify-email-input-state');
    const successState = document.getElementById('verify-email-success-state');
    const inputButtons = document.getElementById('verify-email-input-buttons');
    const successButtons = document.getElementById('verify-email-success-buttons');
    const codeInput = document.getElementById('email-verification-code');
    const errorDiv = document.getElementById('verify-email-error');
    const statusMessage = document.getElementById('verify-email-status-message');

    if (inputState) inputState.style.display = 'block';
    if (successState) successState.style.display = 'none';
    if (inputButtons) inputButtons.style.display = 'block';
    if (successButtons) successButtons.style.display = 'none';
    if (codeInput) codeInput.value = '';
    if (errorDiv) errorDiv.style.display = 'none';
    if (statusMessage) statusMessage.textContent = 'Sending verification code to your email...';
  }

  // Show success state
  function showSuccessState() {
    const inputState = document.getElementById('verify-email-input-state');
    const successState = document.getElementById('verify-email-success-state');
    const inputButtons = document.getElementById('verify-email-input-buttons');
    const successButtons = document.getElementById('verify-email-success-buttons');

    if (inputState) inputState.style.display = 'none';
    if (successState) successState.style.display = 'block';
    if (inputButtons) inputButtons.style.display = 'none';
    if (successButtons) successButtons.style.display = 'block';
  }

  // Request verification code
  async function requestVerificationCode() {
    try {
      const res = await fetch('/auth/email-verification/request', {
        method: 'POST'
      });

      const data = await res.json();

      const statusMessage = document.getElementById('verify-email-status-message');
      const errorDiv = document.getElementById('verify-email-error');

      if (!res.ok || !data.success) {
        if (statusMessage) statusMessage.textContent = 'We\'ve sent a verification code to your email address.';
        if (errorDiv) {
          errorDiv.textContent = data.message || 'Failed to send verification code';
          errorDiv.style.display = 'block';
        }
        return false;
      }

      if (statusMessage) statusMessage.textContent = 'We\'ve sent a verification code to your email address.';
      return true;
    } catch (error) {
      console.error('Error requesting verification code:', error);
      const statusMessage = document.getElementById('verify-email-status-message');
      const errorDiv = document.getElementById('verify-email-error');
      if (statusMessage) statusMessage.textContent = 'We\'ve sent a verification code to your email address.';
      if (errorDiv) {
        errorDiv.textContent = 'Error sending verification code';
        errorDiv.style.display = 'block';
      }
      return false;
    }
  }

  // Setup handlers for verify email modal
  function setupVerifyEmailHandlers() {
    const verifyBtn = document.getElementById('verify-email-btn');
    const resendBtn = document.getElementById('resend-verification-btn');
    const closeBtn = document.getElementById('verify-email-close-btn');
    const codeInput = document.getElementById('email-verification-code');
    const errorDiv = document.getElementById('verify-email-error');

    // Verify code
    if (verifyBtn) {
      verifyBtn.addEventListener('click', async function() {
        const code = codeInput.value.trim();

        if (!code || code.length !== 6) {
          errorDiv.textContent = 'Please enter a 6-digit code';
          errorDiv.style.display = 'block';
          return;
        }

        verifyBtn.disabled = true;
        verifyBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying...';
        errorDiv.style.display = 'none';

        try {
          const res = await fetch('/auth/email-verification/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
          });

          const data = await res.json();

          if (res.ok && data.success) {
            showSuccessState();
          } else {
            errorDiv.textContent = data.message || 'Invalid code';
            errorDiv.style.display = 'block';
          }
        } catch (error) {
          console.error('Error verifying code:', error);
          errorDiv.textContent = 'Error verifying code';
          errorDiv.style.display = 'block';
        } finally {
          verifyBtn.disabled = false;
          verifyBtn.innerHTML = 'Verify';
        }
      });
    }

    // Resend code
    if (resendBtn) {
      resendBtn.addEventListener('click', async function() {
        resendBtn.disabled = true;
        resendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
        errorDiv.style.display = 'none';

        const success = await requestVerificationCode();

        if (success) {
          errorDiv.textContent = 'Code sent! Check your email.';
          errorDiv.className = 'text-success small mt-2';
          errorDiv.style.display = 'block';
          
          setTimeout(() => {
            errorDiv.style.display = 'none';
            errorDiv.className = 'text-danger small mt-2';
          }, 3000);
        }

        resendBtn.disabled = false;
        resendBtn.innerHTML = '<i class="fa-solid fa-rotate"></i> Resend Code';
      });
    }

    // Close button on success state - reload page
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        window.location.reload();
      });
    }

    // Reset modal when closed
    const modalEl = document.getElementById('verifyEmailModal');
    if (modalEl) {
      modalEl.addEventListener('hidden.bs.modal', function() {
        showInputState();
      });
    }
  }

  // Setup handlers for please verify modal
  function setupPleaseVerifyHandlers() {
    const verifyNowBtn = document.getElementById('verify-now-btn');

    if (verifyNowBtn) {
      verifyNowBtn.addEventListener('click', async function() {
        if (pleaseVerifyModalInstance) {
          pleaseVerifyModalInstance.hide();
        }
        
        // Open verify email modal
        await window.openVerifyEmailModal();
      });
    }
  }

  // Expose function globally for edit profile page and profile page
  window.openVerifyEmailModal = async function() {
    // Create modal if it doesn't exist
    if (!document.getElementById('verifyEmailModal')) {
      createVerifyEmailModal();
    }

    showInputState();
    
    // Show modal IMMEDIATELY
    if (typeof bootstrap !== 'undefined') {
      const modalEl = document.getElementById('verifyEmailModal');
      verifyEmailModalInstance = new bootstrap.Modal(modalEl);
      verifyEmailModalInstance.show();
    }

    // Send code in background
    await requestVerificationCode();
  };

  // Expose function globally for feed.js to trigger
  window.showPleaseVerifyModal = function() {
    // Create modal if it doesn't exist
    if (!document.getElementById('pleaseVerifyModal')) {
      createPleaseVerifyModal();
    }

    if (typeof bootstrap !== 'undefined') {
      const modalEl = document.getElementById('pleaseVerifyModal');
      pleaseVerifyModalInstance = new bootstrap.Modal(modalEl);
      pleaseVerifyModalInstance.show();
    }
  };
});