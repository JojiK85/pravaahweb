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

/* ---------- ROLE CHECK ---------- */
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  try {
    const res = await fetch(
      `/api/pravaah?type=role&email=${encodeURIComponent(user.email)}`
    );
    const roleObj = await res.json();

    if (["Admin", "SuperAdmin", "SuperAccount"].includes(roleObj.role)) {
      document.getElementById("dashboardNav")?.classList.remove("hidden");
    }
  } catch (e) {
    console.error("Role check failed", e);
  }
});

/* ---------- LOGOUT (GLOBAL) ---------- */
const logout = async () => {
  await signOut(auth);
  window.location.href = "login.html";
};
window.PRAVAAH_AUTH = {
  auth,
  onAuthStateChanged
};

document.getElementById("logoutDesktop")?.addEventListener("click", logout);
document.getElementById("logoutMobile")?.addEventListener("click", logout);

export { auth };
