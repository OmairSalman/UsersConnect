// Insecure-context guard for authentication pages.
//
// Auth cookies are set with Secure + SameSite=None, which browsers only accept
// in a secure context (https://, http://localhost, http://127.0.0.1). On a plain
// HTTP origin (e.g. a LAN IP) the cookies are silently dropped, so sign-in,
// registration, and password reset fail with no visible reason. Rather than let
// that happen silently, this guard disables submission and explains why.
//
// Detection is client-side ONLY: the app always runs HTTP behind a TLS-
// terminating proxy, so server-side req.secure / req.protocol are false even in
// production and a server check would flag every request — including HTTPS users
// — as insecure.
document.addEventListener('DOMContentLoaded', function() {
  // window.isSecureContext is true on https:// and on http://localhost /
  // 127.0.0.1; false on plain-http LAN IPs and other insecure origins.
  if (window.isSecureContext) return;

  const LEARN_MORE_URL = 'https://github.com/OmairSalman/UsersConnect#why-https-is-required';

  // Build the warning banner, reusing the app's Bootstrap alert convention
  // (alert alert-danger + role="alert") so it matches form-validation errors.
  function buildBanner() {
    const banner = document.createElement('div');
    banner.className = 'alert alert-danger';
    banner.setAttribute('role', 'alert');
    banner.id = 'insecure-context-warning';

    const message = document.createElement('span');
    message.textContent =
      'This site must be accessed over HTTPS; secure login cookies are ' +
      "rejected over an insecure connection, so sign-in won't work here. ";
    banner.appendChild(message);

    const link = document.createElement('a');
    link.href = LEARN_MORE_URL;
    link.className = 'alert-link';
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = 'Learn why ';

    const icon = document.createElement('i');
    icon.className = 'fas fa-external-link-alt';
    link.appendChild(icon);

    banner.appendChild(link);

    return banner;
  }

  const forms = document.querySelectorAll('form');

  forms.forEach(function(form) {
    // Block submission in the capture phase so the Enter key (which submits the
    // form directly, bypassing the disabled button) can't slip through.
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      e.stopPropagation();
    }, true);

    // Disable the primary submit action(s).
    form.querySelectorAll('button[type="submit"], input[type="submit"]').forEach(function(btn) {
      btn.disabled = true;
    });
  });

  // Inject a single banner at the top of the first form (guard against duplicates).
  const firstForm = forms[0];
  if (firstForm && !document.getElementById('insecure-context-warning')) {
    firstForm.insertBefore(buildBanner(), firstForm.firstChild);
  }
});
