async function hashString(str) {
    const enc = new TextEncoder();
    const buf = await crypto.subtle.digest('SHA-256', enc.encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

//local storage
function loadAccounts() {
    return JSON.parse(localStorage.getItem('accounts') || '{}');
}
function saveAccounts(obj) {
    localStorage.setItem('accounts', JSON.stringify(obj));
}

//popup
function showMessage(text, timeout = 3000) {
    const n = document.createElement('div');
    n.className = 'alert';
    n.textContent = text;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), timeout);
}

//login and register
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;

    if (!username) return alert('Enter a username');

    const accounts = loadAccounts();

    if (accounts[username]) return alert('Username already exists');

    const hash = await hashString(password);
    accounts[username] = { hash };
    saveAccounts(accounts);
    localStorage.setItem('currentUser', username);
    const menuContainer = document.querySelector('.top-menu-user');
    const loginLinkBtn = document.getElementById('loginLinkBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (menuContainer) menuContainer.innerHTML = `Signed in as <strong id="topMenuUser">${username}</strong>`;

    const userBar = document.querySelector('.user-bar');

    if (userBar) userBar.innerHTML = `Signed in as <strong id="currentUserName">${username}</strong>`;

    if (loginLinkBtn) loginLinkBtn.style.display = 'none';

    if (logoutBtn) logoutBtn.style.display = '';

    showMessage('Account created and signed in');
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const accounts = loadAccounts();

    if (!accounts[username]) return alert('No such user');

    const hash = await hashString(password);

    if (hash !== accounts[username].hash) return alert('Invalid password');

    localStorage.setItem('currentUser', username);
    const menuContainer2 = document.querySelector('.top-menu-user');
    const loginLinkBtn2 = document.getElementById('loginLinkBtn');
    const logoutBtn2 = document.getElementById('logoutBtn');

    if (menuContainer2) menuContainer2.innerHTML = `Signed in as <strong id="topMenuUser">${username}</strong>`;

    const userBar2 = document.querySelector('.user-bar');

    if (userBar2) userBar2.innerHTML = `Signed in as <strong id="currentUserName">${username}</strong>`;

    if (loginLinkBtn2) loginLinkBtn2.style.display = 'none';

    if (logoutBtn2) logoutBtn2.style.display = '';

    showMessage('Logged in');
});

//login page and hamburger menu
(function () {
    const currentUser = localStorage.getItem('currentUser');
    const topMenuUserEl = document.getElementById('topMenuUser');
    const loginLinkBtn = document.getElementById('loginLinkBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const menuToggle = document.getElementById('menuToggle');
    const topMenu = document.getElementById('topMenu');
    const topMenuUserContainer = topMenu ? topMenu.querySelector('.top-menu-user') : null;

    function updateSignedState(user) {
      if (user) {
        if (topMenuUserContainer) topMenuUserContainer.innerHTML = `Signed in as <strong id="topMenuUser">${user}</strong>`;
        if (loginLinkBtn) loginLinkBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = '';

    } else {
        if (topMenuUserContainer) topMenuUserContainer.textContent = 'Not signed in';
        if (loginLinkBtn) loginLinkBtn.style.display = '';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
  }

    updateSignedState(currentUser);
  //popup
  function showMessage(text, timeout = 3000) {
      const n = document.createElement('div');
      n.className = 'alert';
      n.textContent = text;
      document.body.appendChild(n);
      setTimeout(() => n.remove(), timeout);
  }

  if (currentUser) {
      if (loginLinkBtn) loginLinkBtn.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = '';

  } else {
      if (loginLinkBtn) loginLinkBtn.style.display = '';
      if (logoutBtn) logoutBtn.style.display = 'none';
  }

  if (logoutBtn) logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('currentUser');
      updateSignedState(null);

      if (topMenu) { topMenu.classList.remove('open'); }

      if (menuToggle) { menuToggle.setAttribute('aria-expanded', 'false'); }

      showMessage('Logged out');
  });

  if (menuToggle && topMenu) {
      topMenu.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.addEventListener('click', (e) => {
          const opened = topMenu.classList.toggle('open');
          menuToggle.setAttribute('aria-expanded', String(opened));
          e.stopPropagation();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && topMenu.classList.contains('open')) {
            topMenu.classList.remove('open');
            menuToggle.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('click', (e) => {
      if (!topMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            topMenu.classList.remove('open');
            menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
})();