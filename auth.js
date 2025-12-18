import { initializeApp, getApps } from
  "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from
  "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

/* ---------- FIREBASE CONFIG ---------- */
const firebaseConfig = {
  apiKey: "AIzaSyCbXKleOw4F46gFDXz2Wynl3YzPuHsVwh8",
  authDomain: "pravaah-55b1d.firebaseapp.com",
  projectId: "pravaah-55b1d",
  storageBucket: "pravaah-55b1d.appspot.com",
  messagingSenderId: "287687647267",
  appId: "1:287687647267:web:7aecd603ee202779b89196"
};

/* ---------- SINGLE APP INSTANCE ---------- */
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0];

const auth = getAuth(app);

/* ---------- GLOBAL AUTH OBJECT ---------- */
window.PRAVAAH_AUTH = {
  auth,
  onAuthStateChanged,
  email: null,
  role: null,
  isPrimary: false
};

/* ---------- UTIL ---------- */
const ADMIN_ROLES = ["Admin", "SuperAdmin", "SuperAccount"];

/* ---------- LOAD ROLE FROM CACHE (INSTANT UI) ---------- */
const cached = sessionStorage.getItem("pravaah_role");
if (cached) {
  try {
    const r = JSON.parse(cached);
    window.PRAVAAH_AUTH.email = r.email;
    window.PRAVAAH_AUTH.role = r.role;
    window.PRAVAAH_AUTH.isPrimary = r.isPrimary;

    document.addEventListener("DOMContentLoaded", () => {
      if (ADMIN_ROLES.includes(r.role)) {
        document.getElementById("dashboardNav")?.classList.remove("hidden");
      }
    });
  } catch {}
}

/* ---------- ROLE FETCH FUNCTION ---------- */
async function fetchAndApplyRole(user, { hardReload = false } = {}) {
  const res = await fetch(
    `/api/pravaah?type=role&email=${encodeURIComponent(user.email)}`
  );
  const roleObj = await res.json();

  const oldRole = window.PRAVAAH_AUTH.role;
  const newRole = roleObj.role;

  // update global
  window.PRAVAAH_AUTH.email = user.email;
  window.PRAVAAH_AUTH.role = newRole;
  window.PRAVAAH_AUTH.isPrimary = roleObj.isPrimary === true;

  // cache role
  sessionStorage.setItem(
    "pravaah_role",
    JSON.stringify({
      email: user.email,
      role: newRole,
      isPrimary: roleObj.isPrimary === true,
      ts: Date.now()
    })
  );

  document.addEventListener("DOMContentLoaded", () => {
    const dash = document.getElementById("dashboardNav");

    // LOST admin access
    if (ADMIN_ROLES.includes(oldRole) && !ADMIN_ROLES.includes(newRole)) {
      dash?.classList.add("hidden");

      if (location.pathname.includes("dashboard")) {
        alert("Your admin access has been revoked.");
        location.href = "home.html";
      }
    }

    // GAINED admin access
    if (!ADMIN_ROLES.includes(oldRole) && ADMIN_ROLES.includes(newRole)) {
      dash?.classList.remove("hidden");
    }
  });

  // hard reload if requested (safest correction)
  if (hardReload && oldRole && oldRole !== newRole) {
    location.reload();
  }
}

/* ---------- AUTH STATE ---------- */
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  window.PRAVAAH_AUTH.email = user.email;

  try {
    await fetchAndApplyRole(user);
  } catch (e) {
    console.error("Initial role check failed", e);
  }
});

/* ---------- PERIODIC ROLE RECHECK (EVERY 60s) ---------- */
setInterval(async () => {
  if (!auth.currentUser) return;

  try {
    await fetchAndApplyRole(auth.currentUser, { hardReload: true });
  } catch (e) {
    console.error("Periodic role refresh failed", e);
  }
}, 60000); // ⏱️ 60 seconds

/* ---------- LOGOUT (GLOBAL) ---------- */
const logout = async () => {
  await signOut(auth);
  sessionStorage.clear();
  window.location.href = "index.html";
};

document.getElementById("logoutDesktop")?.addEventListener("click", logout);
document.getElementById("logoutMobile")?.addEventListener("click", logout);

/* ---------- EXPORT (OPTIONAL) ---------- */
export { auth };
