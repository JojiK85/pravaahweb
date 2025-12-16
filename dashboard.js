/* ============================================================
   PRAVAAH — ADMIN DASHBOARD LOGIC
   Uses Firebase Auth + Apps Script Backend
============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

/* ---------------- FIREBASE CONFIG ---------------- */
const firebaseConfig = {
  apiKey: "AIzaSyCbXKleOw4F46gFDXz2Wynl3YzPuHsVwh8",
  authDomain: "pravaah-55b1d.firebaseapp.com",
  projectId: "pravaah-55b1d",
  storageBucket: "pravaah-55b1d.appspot.com",
  messagingSenderId: "287687647267",
  appId: "1:287687647267:web:7aecd603ee202779b89196"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/* ---------------- BACKEND API ---------------- */
const API =
  "https://script.google.com/macros/s/AKfycbxTtdt1HmTIP0i5WOeXMLRWLKA1k4RpD153EmgU-Ow6CPRGOISzjOVLplKFDm-gUaggmg/exec";

/* ---------------- DOM ---------------- */
const totalUsersEl   = document.getElementById("totalUsers");
const totalPassesEl  = document.getElementById("totalPasses");
const totalScansEl   = document.getElementById("totalScans");

const btnGate   = document.getElementById("goGate");
const btnEvent  = document.getElementById("goEvent");
const btnRoles  = document.getElementById("goRoles");

/* ---------------- AUTH + ROLE CHECK ---------------- */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  try {
    const roleRes = await fetch(
      `${API}?type=role&email=${encodeURIComponent(user.email)}`
    );
    const roleObj = await roleRes.json();

    if (!["Admin", "SuperAdmin", "SuperAccount"].includes(roleObj.role)) {
      alert("Access denied");
      window.location.href = "home.html";
      return;
    }

    // 🔐 Only Primary sees role management
    if (!roleObj.isPrimary && btnRoles) {
      btnRoles.style.display = "none";
    }

    loadDashboardStats();

  } catch (err) {
    console.error("Role verification failed", err);
    alert("Unable to verify admin role");
    window.location.href = "home.html";
  }
});

/* ---------------- LOAD STATS ---------------- */
async function loadDashboardStats() {
  try {
    const res = await fetch(`${API}?type=dashboardStats`);
    const data = await res.json();

    totalUsersEl.textContent  = data.users  ?? "--";
    totalPassesEl.textContent = data.passes ?? "--";
    totalScansEl.textContent  = data.scans  ?? "--";

  } catch (err) {
    console.error("Dashboard stats error", err);
    totalUsersEl.textContent  = "--";
    totalPassesEl.textContent = "--";
    totalScansEl.textContent  = "--";
  }
}

/* ---------------- NAV ACTIONS ---------------- */
btnGate?.addEventListener("click", () => {
  window.location.href = "gate.html";
});

btnEvent?.addEventListener("click", () => {
  window.location.href = "event.html";
});

btnRoles?.addEventListener("click", () => {
  window.location.href = "roles.html";
});

/* ---------------- LOGOUT ---------------- */
document.getElementById("logoutDesktop")?.addEventListener("click", logout);
document.getElementById("logoutMobile")?.addEventListener("click", logout);

async function logout() {
  try {
    await signOut(auth);
    window.location.href = "login.html";
  } catch (err) {
    alert("Logout failed");
  }
}
