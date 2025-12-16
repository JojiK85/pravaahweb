/* ============================================================
   PRAVAAH — ADMIN DASHBOARD LOGIC (FINAL)
   Firebase Auth + Apps Script Backend
============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

/* ================= FIREBASE ================= */
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

/* ================= BACKEND ================= */
const API =
  "https://script.google.com/macros/s/AKfycbxTtdt1HmTIP0i5WOeXMLRWLKA1k4RpD153EmgU-Ow6CPRGOISzjOVLplKFDm-gUaggmg/exec";

/* ================= DOM ================= */
const adminEmailEl = document.getElementById("adminEmail");
const adminRoleEl  = document.getElementById("adminRole");

const statReg  = document.getElementById("statReg");
const statAcc  = document.getElementById("statAcc");
const statScan = document.getElementById("statScan");

const roleSection = document.getElementById("roleSection");
const roleEmail   = document.getElementById("roleEmail");
const roleSelect  = document.getElementById("roleSelect");
const roleSaveBtn = document.getElementById("saveRoleBtn");

const offlineCountEl = document.getElementById("offlineCount");

/* ================= AUTH + ROLE ================= */
let CURRENT_ROLE = "";
let IS_PRIMARY = false;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch(
      `${API}?type=role&email=${encodeURIComponent(user.email)}`
    );
    const roleObj = await res.json();

    if (!["Admin", "SuperAdmin", "SuperAccount", "PrimarySuperAccount"]
        .includes(roleObj.role)) {
      alert("Access denied");
      window.location.href = "home.html";
      return;
    }

    CURRENT_ROLE = roleObj.role;
    IS_PRIMARY   = roleObj.isPrimary === true;

    adminEmailEl.textContent = user.email;
    adminRoleEl.textContent  = roleObj.role;

    configureRoleUI();
    loadDashboardStats();
    updateOfflineCount();

  } catch (err) {
    console.error(err);
    alert("Role verification failed");
    window.location.href = "home.html";
  }
});

/* ================= DASHBOARD STATS ================= */
async function loadDashboardStats() {
  try {
    const res = await fetch(`${API}?type=dashboardStats`);
    const data = await res.json();

    statReg.textContent  = data.registrations ?? "--";
    statAcc.textContent  = data.accommodation ?? "--";
    statScan.textContent = data.scansToday ?? "--";

  } catch {
    statReg.textContent  = "--";
    statAcc.textContent  = "--";
    statScan.textContent = "--";
  }
}

/* ================= ROLE MANAGEMENT ================= */
function configureRoleUI() {
  // Admins never see role management
  if (CURRENT_ROLE === "Admin") {
    roleSection.classList.add("hidden");
    return;
  }

  roleSection.classList.remove("hidden");

  // Allowed promotions based on hierarchy
  roleSelect.innerHTML = "";

  if (CURRENT_ROLE === "SuperAdmin") {
    roleSelect.add(new Option("Admin", "Admin"));
  }

  if (CURRENT_ROLE === "SuperAccount") {
    roleSelect.add(new Option("Admin", "Admin"));
    roleSelect.add(new Option("SuperAdmin", "SuperAdmin"));
  }

  if (CURRENT_ROLE === "PrimarySuperAccount") {
    roleSelect.add(new Option("Admin", "Admin"));
    roleSelect.add(new Option("SuperAdmin", "SuperAdmin"));
    roleSelect.add(new Option("SuperAccount", "SuperAccount"));
    roleSelect.add(new Option("Transfer Primary", "TRANSFER_PRIMARY"));
  }
}

/* ----- SAVE ROLE ----- */
roleSaveBtn?.addEventListener("click", async () => {
  const email = roleEmail.value.trim().toLowerCase();
  const newRole = roleSelect.value;

  if (!email || !newRole) {
    alert("Enter email and role");
    return;
  }

  const payload = {
    type: "setRole",
    targetEmail: email,
    newRole,
    performedByRole: CURRENT_ROLE,
    isPrimaryTransfer: newRole === "TRANSFER_PRIMARY"
  };

  try {
    const res = await fetch(API, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    const result = await res.json();

    alert(result.message || "Role updated");

    // Primary transfer rule
    if (newRole === "TRANSFER_PRIMARY") {
      alert("You are now SuperAccount only.");
      location.reload();
    }

  } catch (err) {
    alert("Role update failed");
  }
});

/* ================= SCAN LAUNCHER ================= */
/* Goes to Apps Script scan.html */
window.goScan = function () {
  window.location.href = `${API}?mode=admin&page=scan&scanner=dashboard`;
};

/* ================= OFFLINE SCAN QUEUE ================= */
function updateOfflineCount() {
  const queue = JSON.parse(localStorage.getItem("offlineScans") || "[]");
  offlineCountEl.textContent = queue.length;
}

/* ================= LOGOUT ================= */
document.getElementById("logoutDesktop")?.addEventListener("click", logout);
document.getElementById("logoutMobile")?.addEventListener("click", logout);

async function logout() {
  await signOut(auth);
  window.location.href = "login.html";
}
