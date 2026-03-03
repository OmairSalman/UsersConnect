document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('setup-form');
  const messageDiv = document.getElementById('setupMessage');
  const submitBtn = document.getElementById('submit-btn');

  // Toggle S3 fields
  const enableS3 = document.getElementById('enableS3');
  const s3Fields = document.getElementById('s3Fields');
  const s3Warning = document.getElementById('s3Warning');

  enableS3.addEventListener('change', function () {
    if (this.checked) {
      s3Fields.style.display = 'block';
      s3Warning.style.display = 'none';
      document.getElementById('s3AccessKey').required = true;
      document.getElementById('s3SecretKey').required = true;
      document.getElementById('s3BucketName').required = true;
    } else {
      s3Fields.style.display = 'none';
      s3Warning.style.display = 'block';
      document.getElementById('s3AccessKey').required = false;
      document.getElementById('s3SecretKey').required = false;
      document.getElementById('s3BucketName').required = false;
    }
  });

  // Toggle SMTP fields
  const enableSMTP = document.getElementById('enableSMTP');
  const smtpFields = document.getElementById('smtpFields');
  const smtpWarning = document.getElementById('smtpWarning');

  enableSMTP.addEventListener('change', function () {
    if (this.checked) {
      smtpFields.style.display = 'block';
      smtpWarning.style.display = 'none';
      document.getElementById('smtpHost').required = true;
      document.getElementById('smtpUser').required = true;
      document.getElementById('smtpPassword').required = true;
    } else {
      smtpFields.style.display = 'none';
      smtpWarning.style.display = 'block';
      document.getElementById('smtpHost').required = false;
      document.getElementById('smtpUser').required = false;
      document.getElementById('smtpPassword').required = false;
    }
  });

  // Toggle CORS fields
  const enableCORS = document.getElementById('enableCORS');
  const corsFields = document.getElementById('corsFields');
  const corsInfo = document.getElementById('corsInfo');

  enableCORS.addEventListener('change', function () {
    if (this.checked) {
      corsFields.style.display = 'block';
      corsInfo.style.display = 'none';
      document.getElementById('corsAllowedOrigins').required = true;
    } else {
      corsFields.style.display = 'none';
      corsInfo.style.display = 'block';
      document.getElementById('corsAllowedOrigins').required = false;
    }
  });

  // Form submission
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.textContent = 'Setting up...';
    messageDiv.style.display = 'none';

    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    try {
      const response = await fetch('/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        messageDiv.className = 'alert alert-success';
        messageDiv.textContent = result.message;
        messageDiv.style.display = 'block';

        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        messageDiv.className = 'alert alert-danger';
        messageDiv.textContent = result.message || 'Setup failed. Please try again.';
        messageDiv.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Complete Setup';
      }
    } catch {
      messageDiv.className = 'alert alert-danger';
      messageDiv.textContent = 'Network error. Please try again.';
      messageDiv.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Complete Setup';
    }
  });
});
