(function(){
  "use strict";

  /* ---------- Toast ---------- */
  var toast = document.getElementById("toast");
  var toastText = document.getElementById("toastText");
  function showToast(msg){
    toastText.textContent = msg;
    toast.classList.add("show");
    setTimeout(function(){ toast.classList.remove("show"); }, 3200);
  }
  window.showToast = showToast;

  /* ---------- Mobile nav ---------- */
  var hamburgerBtn = document.getElementById("hamburgerBtn");
  var mobilePanel = document.getElementById("mobilePanel");
  function closeMobilePanel(){
    mobilePanel.classList.remove("open");
    hamburgerBtn.setAttribute("aria-expanded","false");
  }
  hamburgerBtn.addEventListener("click", function(){
    var open = mobilePanel.classList.toggle("open");
    hamburgerBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });

  /* ---------- Highlight current nav link ---------- */
  var currentFile = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  var routeMap = {
    "index.html": "tutorial",
    "": "tutorial",
    "exercise.html": "exercises",
    "research.html": "research",
    "contact.html": "contact",
    "dashboard.html": "dashboard",
    "profile.html": "profile"
  };
  var currentRoute = routeMap[currentFile] || "tutorial";
  document.querySelectorAll('.links a, .mobile-panel a[data-route]').forEach(function(a){
    a.classList.toggle("active", a.getAttribute("data-route") === currentRoute);
  });

  /* ---------- Auth (localStorage-based) ---------- */
  var USERS_KEY = "cplw_users";
  var SESSION_KEY = "cplw_session";

  function getUsers(){
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch(e){ return []; }
  }
  function saveUsers(list){
    try { localStorage.setItem(USERS_KEY, JSON.stringify(list)); } catch(e){}
  }
  function currentUser(){
    try {
      var email = localStorage.getItem(SESSION_KEY);
      if (!email) return null;
      return getUsers().find(function(u){ return u.email === email; }) || null;
    } catch(e){ return null; }
  }
  function setSession(email){
    try { localStorage.setItem(SESSION_KEY, email); } catch(e){}
  }
  function clearSession(){
    try { localStorage.removeItem(SESSION_KEY); } catch(e){}
  }
  function simpleHash(str){
    var h = 0;
    for (var i=0; i<str.length; i++){ h = (Math.imul(31,h) + str.charCodeAt(i)) | 0; }
    return String(h);
  }
  window.currentUser = currentUser;

  /* ---------- Guard pages that require login ---------- */
  if (document.body.dataset.authRequired === "true" && !currentUser()){
    window.location.href = "index.html";
    return;
  }

  /* ---------- Auth modal ---------- */
  var authOverlay = document.getElementById("authOverlay");
  var tabLogin = document.getElementById("tabLogin");
  var tabRegister = document.getElementById("tabRegister");
  var formLogin = document.getElementById("formLogin");
  var formRegister = document.getElementById("formRegister");

  function openAuth(which){
    authOverlay.classList.add("open");
    switchTab(which || "login");
  }
  function closeAuth(){
    authOverlay.classList.remove("open");
    document.getElementById("loginMsg").className = "modal-msg";
    document.getElementById("registerMsg").className = "modal-msg";
  }
  function switchTab(which){
    var isLogin = which === "login";
    tabLogin.classList.toggle("active", isLogin);
    tabRegister.classList.toggle("active", !isLogin);
    formLogin.classList.toggle("active", isLogin);
    formRegister.classList.toggle("active", !isLogin);
  }
  tabLogin.addEventListener("click", function(){ switchTab("login"); });
  tabRegister.addEventListener("click", function(){ switchTab("register"); });
  document.getElementById("modalClose").addEventListener("click", closeAuth);
  authOverlay.addEventListener("click", function(ev){ if (ev.target === authOverlay) closeAuth(); });

  document.getElementById("authLink").addEventListener("click", function(ev){
    ev.preventDefault();
    openAuth("login");
  });
  document.getElementById("authLinkMobile").addEventListener("click", function(ev){
    ev.preventDefault();
    if (currentUser()){ window.location.href = "profile.html"; }
    else openAuth("login");
  });

  /* Links that need a logged-in user (Dashboard / Profile) */
  document.querySelectorAll('a[data-auth]').forEach(function(a){
    a.addEventListener("click", function(ev){
      if (!currentUser()){
        ev.preventDefault();
        openAuth("login");
      }
    });
  });

  document.getElementById("loginForm").addEventListener("submit", function(ev){
    ev.preventDefault();
    var email = document.getElementById("liEmail").value.trim().toLowerCase();
    var pass = document.getElementById("liPass").value;
    var msg = document.getElementById("loginMsg");
    var user = getUsers().find(function(u){ return u.email === email; });
    if (!user || user.pass !== simpleHash(pass)){
      msg.textContent = "Incorrect email or password.";
      msg.className = "modal-msg error";
      return;
    }
    setSession(email);
    window.location.href = "dashboard.html";
  });

  document.getElementById("registerForm").addEventListener("submit", function(ev){
    ev.preventDefault();
    var name = document.getElementById("riName").value.trim();
    var email = document.getElementById("riEmail").value.trim().toLowerCase();
    var pass = document.getElementById("riPass").value;
    var msg = document.getElementById("registerMsg");
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || pass.length < 4){
      msg.textContent = "Please enter a name, a valid email, and a password of at least 4 characters.";
      msg.className = "modal-msg error";
      return;
    }
    var users = getUsers();
    if (users.some(function(u){ return u.email === email; })){
      msg.textContent = "An account with this email already exists — try logging in instead.";
      msg.className = "modal-msg error";
      return;
    }
    users.push({name:name, email:email, pass:simpleHash(pass)});
    saveUsers(users);
    setSession(email);
    window.location.href = "dashboard.html";
  });

  /* ---------- Profile menu (nav dropdown) ---------- */
  var profileMenu = document.getElementById("profileMenu");
  var profileBtn = document.getElementById("profileBtn");
  var profileDropdown = document.getElementById("profileDropdown");
  function closeProfileMenu(){
    profileDropdown.classList.remove("open");
    profileBtn.setAttribute("aria-expanded", "false");
  }
  profileBtn.addEventListener("click", function(){
    var isOpen = profileDropdown.classList.toggle("open");
    profileBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
  document.addEventListener("click", function(ev){
    if (!profileMenu.contains(ev.target)) closeProfileMenu();
  });
  document.getElementById("logoutMenuBtn").addEventListener("click", function(){
    clearSession();
    window.location.href = "index.html";
  });

  var logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn){
    logoutBtn.addEventListener("click", function(){
      clearSession();
      window.location.href = "index.html";
    });
  }

  /* ---------- Avatar helper ---------- */
  function setAvatarImage(id, image){
    var avatar = document.getElementById(id);
    if (!avatar) return;
    avatar.style.backgroundImage = image ? "url('" + image + "')" : "none";
    avatar.style.backgroundSize = image ? "cover" : "auto";
    avatar.style.backgroundPosition = image ? "center" : "initial";
    avatar.textContent = image ? "" : avatar.dataset.initial || "U";
  }

  /* ---------- Reflect logged-in user across the page ---------- */
  var pendingProfileImage;
  function refreshAuthUI(){
    var user = currentUser();
    var authLink = document.getElementById("authLink");
    var authLinkMobile = document.getElementById("authLinkMobile");
    if (user){
      authLink.style.display = "none";
      profileMenu.hidden = false;
      document.getElementById("profileName").textContent = user.name.split(" ")[0];
      document.getElementById("profileAvatar").dataset.initial = user.name.trim().charAt(0).toUpperCase();
      setAvatarImage("profileAvatar", user.image);

      var dashWelcome = document.getElementById("dashWelcome");
      if (dashWelcome){
        dashWelcome.textContent = "Welcome back, " + user.name.split(" ")[0];
        document.getElementById("dashEmail").textContent = user.email;
        document.getElementById("dashAvatar").dataset.initial = user.name.trim().charAt(0).toUpperCase();
        setAvatarImage("dashAvatar", user.image);
      }

      var profilePageName = document.getElementById("profilePageName");
      if (profilePageName){
        profilePageName.textContent = user.name;
        document.getElementById("profilePageEmail").textContent = user.email;
        document.getElementById("profilePageAvatar").dataset.initial = user.name.trim().charAt(0).toUpperCase();
        setAvatarImage("profilePageAvatar", user.image);
        document.getElementById("profileNameInput").value = user.name;
        document.getElementById("profileEmailInput").value = user.email;
      }
      pendingProfileImage = undefined;
    } else {
      authLink.textContent = "Log in";
      authLink.style.display = "inline-flex";
      profileMenu.hidden = true;
    }
  }
  refreshAuthUI();

  /* ---------- Profile page: edit form + image upload ---------- */
  var profileImageInput = document.getElementById("profileImageInput");
  if (profileImageInput){
    profileImageInput.addEventListener("change", function(){
      var file = profileImageInput.files[0];
      var msg = document.getElementById("profileMsg");
      if (!file) return;
      if (file.size > 2 * 1024 * 1024){
        profileImageInput.value = "";
        msg.textContent = "Please choose an image smaller than 2 MB.";
        msg.className = "modal-msg error";
        return;
      }
      var reader = new FileReader();
      reader.onload = function(){
        pendingProfileImage = reader.result;
        setAvatarImage("profilePageAvatar", pendingProfileImage);
      };
      reader.readAsDataURL(file);
    });

    document.getElementById("profileForm").addEventListener("submit", function(ev){
      ev.preventDefault();
      var user = currentUser();
      var name = document.getElementById("profileNameInput").value.trim();
      var email = document.getElementById("profileEmailInput").value.trim().toLowerCase();
      var msg = document.getElementById("profileMsg");
      if (!user) return;
      if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
        msg.textContent = "Please enter a name and a valid email address.";
        msg.className = "modal-msg error";
        return;
      }
      var users = getUsers();
      if (email !== user.email && users.some(function(existing){ return existing.email === email; })){
        msg.textContent = "This email address is already in use.";
        msg.className = "modal-msg error";
        return;
      }
      users = users.map(function(existing){
        if (existing.email !== user.email) return existing;
        return {name:name, email:email, pass:existing.pass, image:pendingProfileImage === undefined ? existing.image : pendingProfileImage};
      });
      saveUsers(users);
      setSession(email);
      refreshAuthUI();
      msg.textContent = "Profile updated successfully.";
      msg.className = "modal-msg ok";
    });
  }

})();
