/* ============================================================
   PRAVAAH — ADMIN DASHBOARD LOGIC (FINAL)
   Role Matrix + Day/Event Filters
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

/* Cards */
const cardTotalReg   = document.getElementById("cardTotalReg");
const cardInCampus   = document.getElementById("cardInCampus");
const cardMoney      = document.getElementById("cardMoney");

/* Stats */
const statTotalReg     = document.getElementById("statTotalReg");
const statEventReg     = document.getElementById("statEventReg");
const statAccommodation= document.getElementById("statAccommodation");
const statInCampus     = document.getElementById("statInCampus");
const statMoney        = document.getElementById("statMoney");

/* Filters */
const dayFilterEl   = document.getElementById("dayFilter");
const eventFilterEl = document.getElementById("eventDropdown");

/* Role */
const roleSection = document.getElementById("roleSection");
const roleEmail   = document.getElementById("roleEmail");
const roleSelect  = document.getElementById("roleSelect");
const roleSaveBtn = document.getElementById("saveRoleBtn");

/* Offline */
const offlineCountEl = document.getElementById("offlineCount");

/* ================= STATE ================= */
let CURRENT_ROLE = "";
let IS_PRIMARY   = false;
let CURRENT_DAY  = "";
let CURRENT_EVENT= "";

/* ================= AUTH ================= */
onAuthStateChanged(auth, async (user) => {
  if (!user) return location.href = "login.html";

  try {
    const res = await fetch(
      `${API}?type=role&email=${encodeURIComponent(user.email)}`
    );
    const roleObj = await res.json();

    CURRENT_ROLE = roleObj.role;
    IS_PRIMARY   = roleObj.isPrimary === true;

    if (!["Admin","SuperAdmin","SuperAccount","PrimarySuperAccount"]
      .includes(CURRENT_ROLE)) {
      alert("Access denied");
      return location.href = "home.html";
    }

    adminEmailEl.textContent = user.email;
    adminRoleEl.textContent  = CURRENT_ROLE;

    enforceRoleVisibility();
    configureRoleUI();
    loadDayFilter();
    loadEventFilter();
    loadDashboardStats();
    updateOfflineCount();

  } catch (err) {
    console.error(err);
    alert("Role verification failed");
    location.href = "home.html";
  }
});

/* ================= ROLE VISIBILITY ================= */
function enforceRoleVisibility() {

  /* ADMIN */
  if (CURRENT_ROLE === "Admin") {
    cardTotalReg?.classList.add("hidden");
    cardInCampus?.classList.add("hidden");
    cardMoney?.classList.add("hidden");
    dayFilterEl?.classList.add("hidden");
  }

  /* SUPERADMIN */
  if (CURRENT_ROLE === "SuperAdmin") {
    cardMoney?.classList.add("hidden");
  }
}

/* ================= DAY FILTER ================= */
function loadDayFilter() {
  if (!dayFilterEl || CURRENT_ROLE === "Admin") return;

  dayFilterEl.innerHTML = `
    <option value="">All Days</option>
    <option value="day0">Day 0</option>
    <option value="day1">Day 1</option>
    <option value="day2">Day 2</option>
    <option value="day3">Day 3</option>
  `;

  dayFilterEl.addEventListener("change", () => {
    CURRENT_DAY = dayFilterEl.value;
    loadDashboardStats();
  });
}

/* ================= EVENT FILTER ================= */
async function loadEventFilter() {
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
    const qs = new URLSearchParams({
      type: "dashboardStats",
      day: CURRENT_DAY,
      event: CURRENT_EVENT,
      role: CURRENT_ROLE
    });

    const res = await fetch(`${API}?${qs.toString()}`);
    const data = await res.json();

    statTotalReg.textContent      = data.totalRegistrations ?? "--";
    statEventReg.textContent      = data.eventRegistrations ?? "--";
    statAccommodation.textContent = data.accommodation ?? "--";
    statInCampus.textContent      = data.inCampus ?? "--";

    if (statMoney)
      statMoney.textContent = data.totalAmount ?? "--";

  } catch (err) {
    console.error(err);
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

/* SAVE ROLE */
roleSaveBtn?.addEventListener("click", async () => {
  if (!roleEmail.value || !roleSelect.value) return alert("Missing fields");

  const payload = {
    type: "setRole",
    targetEmail: roleEmail.value.trim().toLowerCase(),
    newRole: roleSelect.value,
    isPrimaryTransfer: roleSelect.value === "TRANSFER_PRIMARY"
  };

  const res = await fetch(API, {
    method: "POST",
    body: JSON.stringify(payload)
  });

  const r = await res.json();
  alert(r.message || "Role updated");

  if (payload.isPrimaryTransfer) location.reload();
});

/* ================= SCAN ================= */
window.openScanner = () => {
  window.location.href =
    `${API}?mode=admin&page=scan&scanner=dashboard`;
};

/* ================= OFFLINE ================= */
function updateOfflineCount() {
  const q = JSON.parse(localStorage.getItem("offlineScans") || "[]");
  offlineCountEl.textContent = q.length;
}

/* ================= LOGOUT ================= */
document.getElementById("logoutDesktop")?.addEventListener("click", logout);
document.getElementById("logoutMobile")?.addEventListener("click", logout);

async function logout() {
  await signOut(auth);
  location.href = "login.html";
}
