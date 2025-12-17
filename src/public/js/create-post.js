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

  function init() {
    const form = document.querySelector(".create-post-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      handleCreatePost(form);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();