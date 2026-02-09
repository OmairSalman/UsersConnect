// Custom confirm modal utility
function customConfirm(message) {
  return new Promise((resolve) => {
    const modal = document.getElementById('custom-confirm-modal');
    const msg = document.getElementById('custom-confirm-message');
    const yesBtn = document.getElementById('custom-confirm-yes');
    const noBtn = document.getElementById('custom-confirm-no');

    msg.textContent = message;
    modal.style.display = 'flex';

    function cleanup(result) {
      modal.style.display = 'none';
      yesBtn.removeEventListener('click', onYes);
      noBtn.removeEventListener('click', onNo);
      resolve(result);
    }
    function onYes() { cleanup(true); }
    function onNo() { cleanup(false); }

    yesBtn.addEventListener('click', onYes);
    noBtn.addEventListener('click', onNo);
  });
}

// Utility to show the like popup with a list of names
function showLikePopup(likes)
{
  const popup = document.getElementById('like-popup');
  const list = popup.querySelector('.like-popup-list');
  list.innerHTML = '';
  if (likes.length === 0) {
    list.innerHTML = '<li class="like-popup-user text-muted">No likes yet.</li>';
  } else {
    likes.forEach(like =>
    {
      const li = document.createElement('li');
      li.className = 'like-popup-user';
      li.innerHTML =
      `<li class="like-popup-user">
        <a href="/profile/${like._id}"><img src="${like.avatarURL}" alt="${like.name}'s avatar" class="rounded-circle me-2" width="20" height="20">${like.name}</a>
      </li>`;
      list.appendChild(li);
    });
  }
  popup.style.display = 'flex';
}

// Hide the popup
function hideLikePopup() {
  document.getElementById('like-popup').style.display = 'none';
}

// Utility to show the dislike popup with a list of names
function showDislikePopup(dislikes)
{
  const popup = document.getElementById('dislike-popup');
  const list = popup.querySelector('.like-popup-list');
  list.innerHTML = '';
  if (dislikes.length === 0) {
    list.innerHTML = '<li class="like-popup-user text-muted">No dislikes yet.</li>';
  } else {
    dislikes.forEach(dislike =>
    {
      const li = document.createElement('li');
      li.className = 'like-popup-user';
      li.innerHTML =
      `<li class="like-popup-user">
        <a href="/profile/${dislike._id}"><img src="${dislike.avatarURL}" alt="${dislike.name}'s avatar" class="rounded-circle me-2" width="20" height="20">${dislike.name}</a>
      </li>`;
      list.appendChild(li);
    });
  }
  popup.style.display = 'flex';
}

// Hide the dislike popup
function hideDislikePopup() {
  document.getElementById('dislike-popup').style.display = 'none';
}

(() => {
  async function handleLikeForm(form, button)
{
  try
  {
    const url = form.action;
    const method = button.dataset.liked === "true" ? "delete" : "post";

    const response = await fetch(url, {
      method: method.toUpperCase(),
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();

    // Get count elements
    let likeCount, dislikeCount;
    if(form.dataset.postId)
    {
      likeCount = document.getElementById(`like-count-${form.dataset.postId}`);
      dislikeCount = document.getElementById(`dislike-count-${form.dataset.postId}`);
    }
    else if(form.dataset.commentId)
    {
      likeCount = document.getElementById(`like-count-${form.dataset.commentId}`);
      dislikeCount = document.getElementById(`dislike-count-${form.dataset.commentId}`);
    }

    // Update like count and button
    if (likeCount && typeof data.likeCount !== 'undefined')
    {
      likeCount.textContent = `${data.likeCount}`;
      likeCount.dataset.likes = JSON.stringify(data.likes);
    }

    if (data.liked) {
      button.dataset.liked = "true";
      button.classList.add('liked');
    } else {
      button.dataset.liked = "false";
      button.classList.remove('liked');
    }

    // Update dislike count and button (if user switched from dislike)
    if (dislikeCount && typeof data.dislikeCount !== 'undefined')
    {
      dislikeCount.textContent = `${data.dislikeCount}`;
      dislikeCount.dataset.dislikes = JSON.stringify(data.dislikes);
    }

    // Find dislike button - check post-actions-rail first, then comment wrapper
    const container = form.closest('.post-actions-rail') || form.closest('.comment-wrapper');
    const dislikeButton = container ? container.querySelector('.dislike-btn') : null;
    if (dislikeButton)
    {
      dislikeButton.dataset.disliked = "false";
      dislikeButton.classList.remove('disliked');
    }
  }
  catch (err)
  {
    console.error("Error handling like:", err);
  }
  }

  async function handleDislikeForm(form, button)
  {
    try
    {
      const url = form.action;
      const method = button.dataset.disliked === "true" ? "delete" : "post";

      const response = await fetch(url, {
        method: method.toUpperCase(),
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      // Get count elements
      let likeCount, dislikeCount;
      if(form.dataset.postId)
      {
        likeCount = document.getElementById(`like-count-${form.dataset.postId}`);
        dislikeCount = document.getElementById(`dislike-count-${form.dataset.postId}`);
      }
      else if(form.dataset.commentId)
      {
        likeCount = document.getElementById(`like-count-${form.dataset.commentId}`);
        dislikeCount = document.getElementById(`dislike-count-${form.dataset.commentId}`);
      }

      // Update dislike count and button
      if (dislikeCount && typeof data.dislikeCount !== 'undefined')
      {
        dislikeCount.textContent = `${data.dislikeCount}`;
        dislikeCount.dataset.dislikes = JSON.stringify(data.dislikes);
      }

      if (data.disliked) {
        button.dataset.disliked = "true";
        button.classList.add('disliked');
      } else {
        button.dataset.disliked = "false";
        button.classList.remove('disliked');
      }

      // Update like count and button (if user switched from like)
      if (likeCount && typeof data.likeCount !== 'undefined')
      {
        likeCount.textContent = `${data.likeCount}`;
        likeCount.dataset.likes = JSON.stringify(data.likes);
      }

      // Find like button - check post-actions-rail first, then comment wrapper
      const container = form.closest('.post-actions-rail') || form.closest('.comment-wrapper');
      const likeButton = container ? container.querySelector('.like-btn') : null;
      if (likeButton)
      {
        likeButton.dataset.liked = "false";
        likeButton.classList.remove('liked');
      }
    }
    catch (err)
    {
      console.error("Error handling dislike:", err);
    }
  }

  async function handleAddComment(form)
  {
    const postId = form.dataset.postId;
    const textarea = form.querySelector('textarea[name="content"]');
    const content = textarea.value.trim();
    if (!content) return;

    try
    {
      const res = await fetch(`/comments/${postId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();

      if (res.ok) {
        // Insert the server-rendered HTML
        const commentsSection = document.getElementById(`comments-${postId}`);
        commentsSection.insertAdjacentHTML('afterbegin', data.html);

        // Clear input
        textarea.value = '';
      } else {
        alert('Failed to add comment.');
      }
      textarea.style.height = "auto"; // reset

    } catch (err) {
      console.error(err);
      alert('Something went wrong.');
    }
  }

  async function handleDeleteComment(button)
  {
    const commentId = button.dataset.commentId;
    const confirmed = await customConfirm('Are you sure you want to delete this comment? This action cannot be undone!');
    if (confirmed)
    {
      const res = await fetch(`/comments/${commentId}`, { method: 'DELETE' });
      if (res.ok)
      {
        button.closest('.comment-wrapper').remove();
      }
      else
      {
        alert('Failed to delete comment.');
      }
    }
  }

  async function handleDeletePost(button)
  {
    const postId = button.dataset.postId;
    const postCard = button.closest('.post-card');
    const hasImage = postCard.querySelector('.post-image') !== null;

    let message = 'Are you sure you want to delete this post?';
    if (hasImage) {
      message += ' The attached image will also be permanently deleted.';
    }
    message += ' This action cannot be undone!';

    const confirmed = await customConfirm(message);
    if (confirmed)
    {
      const res = await fetch(`/posts/${postId}`, { method: 'DELETE' });
      if (res.ok)
      {
        button.closest('.post-card').remove();
      }
      else
      {
        alert('Failed to delete post.');
      }
    }
  }

  async function handleEditPost(form)
  {
    const postId = form.dataset.postId;
    const title = form.querySelector('.edit-post-title').value.trim();
    const newContent = form.querySelector('.edit-post-textarea').value.trim();
    const imageInput = form.querySelector('.edit-post-image');
    const removeImageFlag = form.dataset.removeImage === 'true';

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', newContent);

    // If user selected a new image, add it
    if (imageInput && imageInput.files && imageInput.files[0]) {
      formData.append('image', imageInput.files[0]);
    } else if (removeImageFlag) {
      // If user removed the image, send a flag
      formData.append('removeImage', 'true');
    }

    const res = await fetch(`/posts/${postId}`, {
      method: 'PUT',
      body: formData
    });

    if (res.ok) {
      // Reload to show updated content and image
      window.location.reload();
    } else {
      alert('Failed to update post.');
    }
  }

  async function handleEditComment(form)
  {
    const commentCard = form.closest('.comment-wrapper');
    const commentId = commentCard.dataset.commentId;
    const newContent = form.querySelector('.edit-comment-textarea').value.trim();

    const res = await fetch(`/comments/${commentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newContent })
    });

    if (res.ok) {
      commentCard.querySelector('.comment-bubble').querySelector('.comment-content').textContent = newContent;
      form.style.display = 'none';
      commentCard.querySelector('.comment-bubble').style.display = '';
      commentCard.querySelector('.comment-actions').style.setProperty('display', 'inline-flex', 'important');
    } else {
      alert('Failed to update comment.');
    }
  }

    async function init() {
      // Auto-resize for comment input textareas
      document.querySelectorAll(".comment-form textarea").forEach(textarea => {
        textarea.addEventListener("input", () => {
          textarea.style.height = "auto"; // reset
          textarea.style.height = textarea.scrollHeight + "px"; // adjust
        });
      });

      // Auto-resize for edit textareas (posts and comments)
      document.body.addEventListener('input', (e) => {
        if (e.target.matches('.edit-post-textarea') || e.target.matches('.edit-comment-textarea')) {
          e.target.style.height = 'auto';
          e.target.style.height = e.target.scrollHeight + 'px';
        }
      });

      // Handle image preview for post editing
      document.body.addEventListener('change', (e) => {
        if (e.target.matches('.edit-post-image')) {
          const input = e.target;
          const form = input.closest('.edit-post-form');
          const previewContainer = form.querySelector('.new-image-preview-container');
          const previewImg = form.querySelector('.new-image-preview');

          if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function(event) {
              previewImg.src = event.target.result;
              previewContainer.style.display = 'block';
              // If showing new image, keep current image visible too (unless it was removed)
              // User can see both old and new
            };
            reader.readAsDataURL(input.files[0]);
          } else {
            previewContainer.style.display = 'none';
            previewImg.src = '';
          }
        }
      });

      // Make sure feed exists
      const feed = document.getElementById('feed-container');
      if (!feed) return;

      // ---- 1. Like buttons (posts + comments) ----
      document.body.addEventListener('click', async (e) => {
        if(e.target.closest('button.like-btn'))
        {
          const btn = e.target.closest('button.like-btn');
          if (!btn) return;

          const form = btn.closest('form[action$="/like"]');
          if (!form) return;
          e.preventDefault();
          await handleLikeForm(form, btn);
        }

        // ---- 2. Dislike buttons (posts + comments) ----
        if(e.target.closest('button.dislike-btn'))
        {
          const btn = e.target.closest('button.dislike-btn');
          if (!btn) return;

          const form = btn.closest('form[action$="/dislike"]');
          if (!form) return;
          e.preventDefault();
          await handleDislikeForm(form, btn);
        }

        if (e.target.closest('button.delete-comment-btn'))
        {
          e.preventDefault();
          const btn = e.target.closest('button.delete-comment-btn');
          await handleDeleteComment(btn);
        }

        if (e.target.closest('button.delete-post-btn'))
        {
          e.preventDefault();
          const btn = e.target.closest('button.delete-post-btn');
          await handleDeletePost(btn);
          document.location.reload();
        }

        // --- Edit Post ---
        if (e.target.closest('button.edit-post-btn'))
        {
          const btn = e.target.closest('.edit-post-btn');
          const postCard = btn.closest('.post-card');
          const form = postCard.querySelector('.edit-post-form');
          const textarea = form.querySelector('.edit-post-textarea');

          // Get content from the displayed post (which has the clean content)
          const postContentElement = postCard.querySelector('.post-content');
          const raw = postContentElement ? postContentElement.textContent : '';

          const normalized = raw
            .split('\n')
            .map(line => line.trimStart())
            .join('\n');

          textarea.value = normalized;

          // Show form FIRST so textarea has layout for scrollHeight calculation
          postCard.querySelector('.post-actions-rail').querySelector('.edit-post-btn').style.display = 'none';
          postCard.querySelector('.post-content-view').style.display = 'none';
          form.style.display = '';

          // NOW auto-resize textarea to fit content (after it's visible)
          textarea.style.height = 'auto';
          textarea.style.height = textarea.scrollHeight + 'px';

          textarea.focus();
        }
    

        // --- Cancel Edit Post ---
        if (e.target.closest('.cancel-edit-post-btn')) {
          const postCard = e.target.closest('.post-card');
          const form = postCard.querySelector('.edit-post-form');

          // Reset image editing state
          form.dataset.removeImage = 'false';
          const imageInput = form.querySelector('.edit-post-image');
          if (imageInput) imageInput.value = '';
          const newImagePreviewContainer = form.querySelector('.new-image-preview-container');
          if (newImagePreviewContainer) newImagePreviewContainer.style.display = 'none';
          const currentImageContainer = form.querySelector('.current-image-container');
          if (currentImageContainer) currentImageContainer.style.display = '';

          postCard.querySelector('.edit-post-form').style.display = 'none';
          postCard.querySelector('.post-actions-rail').querySelector('.edit-post-btn').style.display = '';
          postCard.querySelector('.post-content-view').style.display = '';
        }

        // --- Remove Current Image from Post ---
        if (e.target.closest('.remove-current-image-btn')) {
          const form = e.target.closest('.edit-post-form');
          form.dataset.removeImage = 'true';
          const currentImageContainer = form.querySelector('.current-image-container');
          if (currentImageContainer) currentImageContainer.style.display = 'none';
        }

        // --- Remove New Image Preview from Post ---
        if (e.target.closest('.remove-new-image-btn')) {
          const form = e.target.closest('.edit-post-form');
          const imageInput = form.querySelector('.edit-post-image');
          if (imageInput) imageInput.value = '';
          const newImagePreviewContainer = form.querySelector('.new-image-preview-container');
          if (newImagePreviewContainer) newImagePreviewContainer.style.display = 'none';
        }

        // --- Edit Comment ---
        if (e.target.closest('button.edit-comment-btn')) {
          const btn = e.target.closest('.edit-comment-btn');
          const commentCard = btn.closest('.comment-wrapper');
          const textarea = commentCard.querySelector('.edit-comment-textarea');

          const commentContentElement = commentCard.querySelector('.comment-content');
          const raw = commentContentElement ? commentContentElement.textContent : '';

          const normalized = raw
            .split('\n')
            .map(line => line.trimStart())
            .join('\n');

          textarea.value = normalized;

          // Show form FIRST so textarea has layout
          commentCard.querySelector('.comment-actions').style.setProperty('display', 'none', 'important');
          commentCard.querySelector('.comment-bubble').style.display = 'none';
          commentCard.querySelector('.edit-comment-form').style.display = '';

          // Auto-resize AFTER visible
          textarea.style.height = 'auto';
          textarea.style.height = textarea.scrollHeight + 'px';

          textarea.focus();
        }


        // --- Cancel Edit Comment ---
        if (e.target.closest('.cancel-edit-comment-btn')) {
          const commentCard = e.target.closest('.comment-wrapper');
          commentCard.querySelector('.comment-actions').style.setProperty('display', 'inline-flex', 'important');
          commentCard.querySelector('.edit-comment-form').style.display = 'none';
          commentCard.querySelector('.comment-bubble').style.display = '';
        }

        if(e.target.closest('.like-count'))
        {
          const likeCount = e.target.closest('.like-count');
          if (likeCount) {
            // Get the names from the data-likes attribute
            let names = [];
            try {
              names = JSON.parse(likeCount.dataset.likes || "[]");
            } catch (err) {
              names = [];
            }
            showLikePopup(names);
          }
        }

        // Hide popup when close button is clicked
        if (e.target.classList.contains('like-popup-close')) {
          hideLikePopup();
        }

        // Hide popup when clicking outside the popup content
        if (e.target.id === 'like-popup') {
          hideLikePopup();
        }

        // Show dislike popup when clicking dislike count
        if(e.target.closest('.dislike-count'))
        {
          const dislikeCount = e.target.closest('.dislike-count');
          if (dislikeCount) {
            let names = [];
            try {
              names = JSON.parse(dislikeCount.dataset.dislikes || "[]");
            } catch (err) {
              names = [];
            }
            showDislikePopup(names);
          }
        }

        // Hide dislike popup when close button is clicked
        if (e.target.classList.contains('dislike-popup-close')) {
          hideDislikePopup();
        }

        // Hide dislike popup when clicking outside the popup content
        if (e.target.id === 'dislike-popup') {
          hideDislikePopup();
        }
      });

      document.body.addEventListener('submit', async (e) => {
        if (e.target.classList.contains('edit-post-form'))
        {
          e.preventDefault();
          const form = e.target;
          await handleEditPost(form);
        }

        // --- Save Edited Comment ---
        if (e.target.classList.contains('edit-comment-form'))
        {
          e.preventDefault();
          const form = e.target;
          await handleEditComment(form);
        }

        if(e.target.closest('form.comment-form'))
        {
          const form = e.target.closest('form.comment-form');
          if (!form) return;

          e.preventDefault();
          handleAddComment(form);
        }
      });
    }

    // Run init after DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  })();