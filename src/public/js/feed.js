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

(() => {
  async function handleLikeForm(form, button)
  {
    try
    {
      // 1. Build the request
      const url = form.action; // e.g. /posts/123/like
      const method = button.dataset.liked === "true" ? "delete" : "post";

      // 2. Send the AJAX request
      const response = await fetch(url, {
        method: method.toUpperCase(),
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      // 3. Handle errors
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      // 4. Parse JSON response
      const data = await response.json();

      // 5. Update the DOM based on server response
      let likeCount;
      if(form.dataset.postId)
        likeCount = document.getElementById(`like-count-${form.dataset.postId}`);
      else if(form.dataset.commentId)
        likeCount = document.getElementById(`like-count-${form.dataset.commentId}`);

      if (likeCount && typeof data.likeCount !== 'undefined')
      {
        likeCount.textContent = `${data.likeCount}`;
      }

      if (data.liked) {
        button.dataset.liked = "true";
        button.classList.add('liked');
        likeCount.dataset.likes = JSON.stringify(data.likes);
      } else {
        button.dataset.liked = "false";
        button.classList.remove('liked');
        likeCount.dataset.likes = JSON.stringify(data.likes);
      }

    }
    catch (err)
    {
      console.error("Error handling like:", err);
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
  const confirmed = await customConfirm('Are you sure you want to delete this post? This action cannot be undone!');
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
  const postCard = form.closest('.post-card');
  const postId = postCard.querySelector('.edit-post-btn').dataset.postId;
  const title = form.querySelector('.edit-post-title').value.trim();
  const newContent = form.querySelector('.edit-post-textarea').value.trim();

  const res = await fetch(`/posts/${postId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: title, content: newContent })
  });

  if (res.ok) {
    postCard.querySelector('.post-content-view').querySelector('.post-title').textContent = title;
    postCard.querySelector('.post-content-view').querySelector('.post-content').textContent = newContent;
    form.style.display = 'none';
    postCard.querySelector('.post-actions-rail').querySelector('.edit-post-btn').style.display = '';
    postCard.querySelector('.post-content-view').style.display = '';
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
    document.querySelectorAll(".comment-form textarea").forEach(textarea => {
      textarea.addEventListener("input", () => {
        textarea.style.height = "auto"; // reset
        textarea.style.height = textarea.scrollHeight + "px"; // adjust
      });
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
      // --- Edit Post ---
      if (e.target.closest('button.edit-post-btn'))
      {
        const btn = e.target.closest('.edit-post-btn');
        const postCard = btn.closest('.post-card');
        const textarea = postCard.querySelector('.edit-post-textarea');
        const postContentElement = postCard.querySelector('.post-content');
      
        // Read displayed content and normalize indentation
        const raw = postContentElement ? postContentElement.textContent : '';
        const normalized = raw
          .split('\n')
          .map(line => line.trimStart())
          .join('\n');
      
        textarea.value = normalized;
      
        postCard.querySelector('.post-actions-rail').querySelector('.edit-post-btn').style.display = 'none';
        postCard.querySelector('.post-content-view').style.display = 'none';
        postCard.querySelector('.edit-post-form').style.display = '';
        textarea.focus();
      }
  

      // --- Cancel Edit Post ---
      if (e.target.closest('.cancel-edit-post-btn')) {
        const postCard = e.target.closest('.post-card');
        postCard.querySelector('.edit-post-form').style.display = 'none';
        postCard.querySelector('.post-actions-rail').querySelector('.edit-post-btn').style.display = '';
        postCard.querySelector('.post-content-view').style.display = '';
      }

      // --- Edit Comment ---
      if (e.target.closest('button.edit-comment-btn')) {
        const btn = e.target.closest('.edit-comment-btn');
        const commentCard = btn.closest('.comment-wrapper');
        commentCard.querySelector('.comment-actions').style.setProperty('display', 'none', 'important');
        commentCard.querySelector('.comment-bubble').style.display = 'none';
        commentCard.querySelector('.edit-comment-form').style.display = '';
        commentCard.querySelector('.edit-comment-textarea').focus();
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