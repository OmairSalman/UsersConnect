(() => {
  async function handleCreatePost(form) {
    const title = form.querySelector('input[name="title"]').value.trim();
    const content = form.querySelector('textarea[name="content"]').value.trim();
    const imageInput = form.querySelector('input[name="image"]');
    const submitBtn = form.querySelector('button[type="submit"]');

    if (!title || !content) {
      alert("Please fill in both the title and content.");
      return;
    }

    // Disable button and show loading state
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Posting...";

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      
      if (imageInput && imageInput.files && imageInput.files[0]) {
        formData.append('image', imageInput.files[0]);
      }

      const res = await fetch(form.action, {
        method: form.method.toUpperCase(),
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Redirect to feed after success
        window.location.reload();
      } else {
        alert(data.error || "Failed to create post.");
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong while creating the post.");
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }

  function handleImagePreview(input) {
    const preview = document.getElementById('image-preview');
    const container = document.getElementById('image-preview-container');

    if (input.files && input.files[0]) {
      const reader = new FileReader();

      reader.onload = function(e) {
        preview.src = e.target.result;
        container.style.display = 'block';
      };

      reader.readAsDataURL(input.files[0]);
    } else {
      // No file selected, hide preview
      container.style.display = 'none';
      preview.src = '';
    }
  }

  function removeImage() {
    const imageInput = document.getElementById('image');
    const preview = document.getElementById('image-preview');
    const container = document.getElementById('image-preview-container');

    // Clear the file input
    imageInput.value = '';

    // Hide preview
    container.style.display = 'none';
    preview.src = '';
  }

  function init() {
    const form = document.querySelector(".create-post-form");
    if (!form) {
      return;
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      handleCreatePost(form);
    });

    // Image preview handler
    const imageInput = document.getElementById('image');
    if (imageInput) {
      imageInput.addEventListener('change', function() {
        handleImagePreview(this);
      });
    }

    // Remove image button handler
    const removeBtn = document.getElementById('remove-image-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', removeImage);
    }

    const preview = document.getElementById('image-preview');
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();