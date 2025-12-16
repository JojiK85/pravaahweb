/* ============================================================
   PRAVAAH — ADMIN DASHBOARD LOGIC (FINAL + ROLE MATRIX)
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

const statReg   = document.getElementById("statReg");    // total registrations
const statAcc   = document.getElementById("statAcc");    // accommodation
const statScan  = document.getElementById("statScan");   // in-campus count

const roleSection = document.getElementById("roleManagement");
const roleEmail   = document.getElementById("roleEmail");
const roleSelect  = document.getElementById("roleSelect");
const roleSaveBtn = document.getElementById("assignRoleBtn");

const offlineCountEl = document.getElementById("offlineCount");
const eventFilterEl  = document.getElementById("eventFilter");

/* ================= STATE ================= */
let CURRENT_ROLE = "";
let IS_PRIMARY   = false;
let CURRENT_EVENT = "";

/* ================= AUTH + ROLE CHECK ================= */
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

    if (
      !["Admin", "SuperAdmin", "SuperAccount", "PrimarySuperAccount"]
        .includes(roleObj.role)
    ) {
      alert("Access denied");
      window.location.href = "home.html";
      return;
    }

    CURRENT_ROLE = roleObj.role;
    IS_PRIMARY   = roleObj.isPrimary === true;

    adminEmailEl.textContent = user.email;
    adminRoleEl.textContent  = roleObj.role;

    enforceRoleVisibility();
    configureRoleUI();
    loadEventList();
    loadDashboardStats();
    updateOfflineCount();

  } catch (err) {
    console.error(err);
    alert("Role verification failed");
    window.location.href = "home.html";
  }
});

/* ================= ROLE VISIBILITY ================= */
function enforceRoleVisibility() {
  // Admins must NOT see total registrations & in-campus count
  if (CURRENT_ROLE === "Admin") {
    statReg.closest(".dash-card")?.classList.add("hidden");
    statScan.closest(".dash-card")?.classList.add("hidden");
  }
}

/* ================= EVENT FILTER ================= */
async function loadEventList() {
  try {
    const res = await fetch(`${API}?type=eventList`);
    const events = await res.json();

    eventFilterEl.innerHTML = `<option value="">All Events</option>`;
    events.forEach(ev => {
      eventFilterEl.add(new Option(ev, ev));
    });

    eventFilterEl.addEventListener("change", () => {
      CURRENT_EVENT = eventFilterEl.value;
      loadDashboardStats();
    });

  } catch {
    eventFilterEl.innerHTML =
      `<option value="">Events unavailable</option>`;
  }
}

/* ================= DASHBOARD STATS ================= */
async function loadDashboardStats() {
  try {
    const url =
      `${API}?type=dashboardStats&event=${encodeURIComponent(CURRENT_EVENT || "")}`;

    const res = await fetch(url);
    const data = await res.json();

    // Event-based registration (visible to all admins)
    statReg.textContent = data.eventRegistrations ?? "--";

    // Accommodation count (all admins)
    statAcc.textContent = data.accommodation ?? "--";

    // In-campus count (only SuperAdmin+)
    if (CURRENT_ROLE !== "Admin") {
      statScan.textContent = data.inCampus ?? "--";
    }

  } catch {
    statReg.textContent  = "--";
    statAcc.textContent  = "--";
    statScan.textContent = "--";
  }
}

/* ================= ROLE MANAGEMENT ================= */
function configureRoleUI() {
  if (CURRENT_ROLE === "Admin") {
    roleSection.classList.add("hidden");
    return;
  }

  roleSection.classList.remove("hidden");
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
    alert("Enter email and select role");
    return;
  }

  try {
    const res = await fetch(API, {
      method: "POST",
      body: JSON.stringify({
        type: "setRole",
        targetEmail: email,
        newRole,
        isPrimaryTransfer: newRole === "TRANSFER_PRIMARY"
      })
    });

    const result = await res.json();
    alert(result.message || "Role updated");

    if (newRole === "TRANSFER_PRIMARY") location.reload();

  } catch {
    alert("Role update failed");
  }
});

/* ================= SINGLE SCAN ================= */
window.openScanner = function () {
  window.location.href =
    `${API}?mode=admin&page=scan&scanner=dashboard`;
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
