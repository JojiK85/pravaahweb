/*******************************
 *  PRAVAAH 2026 — FINAL SCRIPT.JS
 *  (Clean version — NO form cache)
 *******************************/

const scriptURL =
  "https://script.google.com/macros/s/AKfycby4F5rBxS_-KLmP05Yqm-R7PmjIx9_7dMsa28D1xds3X2jWSMKini-AJ-1wgGR6EmvDlg/exec";

/* =======================================
      EVENTS & PRICES
======================================= */
const EVENTS = {
  day0: [],
  day1: ["Event 1", "Event 2", "Event 3"],
  day2: ["Event 1", "Event 2", "Event 3"],
  day3: ["Event 1", "Event 2", "Event 3"]
};

const PRICES = {
  dayPass: { day0: 300, day1: 800, day2: 800, day3_normal: 800, day3_star: 1100 },
  visitor: { day0: 400, day1: 500, day2: 500, day3_normal: 500, day3_star: 800 },
  fest: { normal: 2000, star: 2500 },
  starnite: 300
};

/* =======================================
      FIREBASE INIT
======================================= */
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

let auth = window.auth;
if (!auth) {
  const firebaseConfig = {
    apiKey: "AIzaSyCbXKleOw4F46gFDXz2Wynl3YzPuHsVwh8",
    authDomain: "pravaah-55b1d.firebaseapp.com",
    projectId: "pravaah-55b1d",
    storageBucket: "pravaah-55b1d.appspot.com",
    messagingSenderId: "287687647267",
    appId: "1:287687647267:web:7aecd603ee202779b89196"
  };

  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  auth = getAuth(app);
  window.auth = auth;
}

/* =======================================
      PROFILE CACHE (ONLY PROFILE)
======================================= */
function getCachedProfile() {
  try {
    return JSON.parse(localStorage.getItem("profileData") || "{}");
  } catch {
    return {};
  }
}

function saveProfileCache(obj) {
  localStorage.setItem("profileData", JSON.stringify(obj));
}

async function refreshProfileFromSheets(email) {
  if (!email) return;
  const r = await fetch(`${scriptURL}?email=${encodeURIComponent(email)}&type=profile`);
  const d = await r.json();
  if (d?.email) {
    saveProfileCache(d);
  }
}

if (auth?.onAuthStateChanged) {
  auth.onAuthStateChanged((u) => {
    if (u?.email) refreshProfileFromSheets(u.email);
  });
}

/* =======================================
      DOM ELEMENTS
======================================= */
const passCards = document.querySelectorAll(".pass-card");
const selectionArea = document.getElementById("selectionArea");
const selectedPassTxt = document.getElementById("selectedPass");
const participantForm = document.getElementById("participantForm");

const numInput = document.getElementById("numParticipants");
const decBtn = document.getElementById("decPart");
const incBtn = document.getElementById("incPart");

const totalAmountEl = document.getElementById("totalAmount");
const payBtn = document.getElementById("payBtn");
payBtn.type = "button";

/* =======================================
      STATE
======================================= */
let currentPassType = null;
let currentDay = null;
let currentVisitorDays = [];
let includeStarNite = false;
let participantsCount = 0;
let currentTotal = 0;
let paying = false;

const RULEBOOK_URL = "rulebooks/sample.pdf";

/* =======================================
      EVENT ROW
======================================= */
function renderEventRow(name, opt = {}) {
  const id = "ev_" + name.replace(/\s+/g, "");
  return `
    <div class="event-row">
      <div class="event-left">
        ${opt.selectable ? `<input type="checkbox" class="event-checkbox" data-day="${opt.dayKey}" value="${name}" id="${id}">` : ""}
        <label for="${id}">${name}</label>
      </div>
      <a href="${RULEBOOK_URL}" target="_blank">
        <i class="fa-regular fa-file-pdf"></i>
      </a>
    </div>`;
}

/* =======================================
      PASS SELECTION
======================================= */
passCards.forEach((c) => {
  c.onclick = () => {
    passCards.forEach((x) => x.classList.remove("selected"));
    c.classList.add("selected");

    const t = c.dataset.type.toLowerCase();
    currentPassType =
      t.includes("day") ? "Day Pass" :
      t.includes("visitor") ? "Visitor Pass" :
      t.includes("fest") ? "Fest Pass" :
      "Starnite Pass";

    currentDay = null;
    currentVisitorDays = [];
    includeStarNite = false;
    numInput.value = 0;
    participantsCount = 0;

    renderSelectionArea();
  };
});

/* =======================================
      STAR TOGGLE
======================================= */
const starToggle = (id) => `
<div class="starnite-toggle-row">
  <label><input type="checkbox" id="${id}"> Include Star Nite</label>
</div>`;

/* =======================================
      RENDER SELECTION AREA
======================================= */
function renderSelectionArea() {
  selectionArea.classList.remove("hidden");
  selectedPassTxt.textContent = `Selected: ${currentPassType}`;
  participantForm.innerHTML = "";

  if (currentPassType === "Day Pass") {
    participantForm.innerHTML = `
      <div class="participant-card">
        <button class="day-card" data-day="day0">DAY 0</button>
        <button class="day-card" data-day="day1">DAY 1</button>
        <button class="day-card" data-day="day2">DAY 2</button>
        <button class="day-card" data-day="day3">DAY 3</button>
      </div>
      <div id="dayEventsContainer"></div>
      <div id="participantsContainerPlaceholder"></div>`;

    document.querySelectorAll(".day-card").forEach((b) => {
      b.onclick = () => {
        document.querySelectorAll(".day-card").forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        currentDay = b.dataset.day;
        includeStarNite = false;
        renderDayEvents(currentDay);
        calculateTotal();
      };
    });
  }

  if (currentPassType === "Visitor Pass") {
    participantForm.innerHTML = `
      <div class="participant-card">
        <button class="visitor-day-card" data-day="day0">DAY 0</button>
        <button class="visitor-day-card" data-day="day1">DAY 1</button>
        <button class="visitor-day-card" data-day="day2">DAY 2</button>
        <button class="visitor-day-card" data-day="day3">DAY 3</button>
      </div>
      <div id="visitorEventsContainer"></div>
      <div id="visitorStarContainer"></div>
      <div id="participantsContainerPlaceholder"></div>`;

    document.querySelectorAll(".visitor-day-card").forEach((b) => {
      b.onclick = () => {
        const d = b.dataset.day;
        b.classList.toggle("active");
        currentVisitorDays.includes(d)
          ? currentVisitorDays = currentVisitorDays.filter(x => x !== d)
          : currentVisitorDays.push(d);

        renderVisitorEvents(currentVisitorDays);
        renderVisitorStarToggleIfNeeded();
        calculateTotal();
      };
    });
  }

  if (currentPassType === "Fest Pass") {
    participantForm.innerHTML = `
      <div id="festEventsContainer"></div>
      <div id="participantsContainerPlaceholder"></div>`;
    renderFestEvents();
  }

  if (currentPassType === "Starnite Pass") {
    participantForm.innerHTML = `<div id="participantsContainerPlaceholder"></div>`;
  }

  calculateTotal();
}

/* =======================================
      EVENTS RENDERERS
======================================= */
function renderDayEvents(day) {
  document.getElementById("dayEventsContainer").innerHTML = `
    <div class="participant-card">
      ${EVENTS[day].map(e => renderEventRow(e, { dayKey: day, selectable: true })).join("")}
      ${day === "day3" ? starToggle("dayStar") : ""}
    </div>`;

  document.getElementById("dayStar")?.addEventListener("change", e => {
    includeStarNite = e.target.checked;
    calculateTotal();
  });
}

function renderVisitorEvents(days) {
  document.getElementById("visitorEventsContainer").innerHTML = days.map(d => `
    <div class="participant-card">
      ${EVENTS[d].map(e => renderEventRow(e, { dayKey: d, selectable: false })).join("")}
    </div>`).join("");
}


function renderVisitorStarToggleIfNeeded() {
  const c = document.getElementById("visitorStarContainer");
  if (!currentVisitorDays.includes("day3")) {
    c.innerHTML = "";
    includeStarNite = false;
    return;
  }
  c.innerHTML = starToggle("visitorStar");
  document.getElementById("visitorStar").onchange = e => {
    includeStarNite = e.target.checked;
    calculateTotal();
  };
}

function renderFestEvents() {
  document.getElementById("festEventsContainer").innerHTML =
    ["day0", "day1", "day2", "day3"].map(d => `
      <div class="participant-card">
        ${EVENTS[d].map(e => renderEventRow(e, { dayKey: d, selectable: true })).join("")}
        ${d === "day3" ? starToggle("festStar") : ""}
      </div>`).join("");

  document.getElementById("festStar")?.addEventListener("change", e => {
    includeStarNite = e.target.checked;
    calculateTotal();
  });
}

/* =======================================
      PARTICIPANTS
======================================= */
function buildParticipantForms(count) {
  participantsCount = count;
  const c = document.getElementById("participantsContainerPlaceholder");
  c.innerHTML = "";
  if (!count) return calculateTotal();

  const profile = getCachedProfile();

  for (let i = 1; i <= count; i++) {
    const div = document.createElement("div");
    div.className = "participant-card";
    div.innerHTML = `
      <h4>Participant ${i}</h4>
      <input class="pname" placeholder="Full name">
      <input class="pemail" placeholder="Email">
      <input class="pphone" placeholder="Phone">
      <input class="pcollege" placeholder="College">`;

    const [n, e, p, c1] = div.querySelectorAll("input");

    n.oninput = () => {
      if (profile.name && n.value.trim().toLowerCase() === profile.name.toLowerCase()) {
        e.value = profile.email || "";
        p.value = profile.phone || "";
        c1.value = profile.college || "";
      } else if (!n.value.trim()) {
        e.value = p.value = c1.value = "";
      }
    };

    c.appendChild(div);
  }
  calculateTotal();
}

/* =======================================
      COUNTER
======================================= */
incBtn.onclick = () => buildParticipantForms(Math.min(10, ++numInput.value));
decBtn.onclick = () => buildParticipantForms(Math.max(0, --numInput.value));
numInput.oninput = () => buildParticipantForms(Math.min(10, Math.max(0, +numInput.value)));

/* =======================================
      PRICE
======================================= */
function calculateTotal() {
  let base = 0;
  if (currentPassType === "Day Pass" && currentDay) {
    base = currentDay !== "day3"
      ? PRICES.dayPass[currentDay]
      : includeStarNite ? PRICES.dayPass.day3_star : PRICES.dayPass.day3_normal;
  }
  if (currentPassType === "Visitor Pass") {
    currentVisitorDays.forEach(d => {
      base += d !== "day3"
        ? PRICES.visitor[d]
        : includeStarNite ? PRICES.visitor.day3_star : PRICES.visitor.day3_normal;
    });
  }
  if (currentPassType === "Fest Pass") {
    base = includeStarNite ? PRICES.fest.star : PRICES.fest.normal;
  }
  if (currentPassType === "Starnite Pass") base = PRICES.starnite;

  currentTotal = base * participantsCount;
  totalAmountEl.textContent = `Total: ₹${currentTotal}`;
  payBtn.style.display = currentTotal ? "inline-block" : "none";
}

/* =======================================
      PAYMENT
======================================= */
payBtn.onclick = async () => {
  if (paying || !currentTotal) return;
  paying = true;

  const participants = [...document.querySelectorAll(".participant-card")]
    .map(c => ({
      name: c.querySelector(".pname")?.value,
      email: c.querySelector(".pemail")?.value,
      phone: c.querySelector(".pphone")?.value,
      college: c.querySelector(".pcollege")?.value
    }));

  if (participants.some(p => !p.name || !p.email || !p.phone || !p.college)) {
    alert("Fill all participant fields");
    paying = false;
    return;
  }

  const rzp = new Razorpay({
    key: "rzp_test_Re1mOkmIGroT2c",
    amount: currentTotal * 100,
    currency: "INR",
    name: "PRAVAAH 2026",
    handler: async (res) => {
      await fetch(scriptURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: res.razorpay_payment_id,
          passType: currentPassType,
          totalAmount: currentTotal,
          participants,
          daySelected: currentDay,
          visitorDays: currentVisitorDays,
          starnite: includeStarNite
        })
      });
      location.href = "payment_success.html";
    }
  });

  rzp.open();

rzp.on("payment.failed", () => {
  paying = false;
  location.href = "payment_failure.html";
});

};

/* =======================================
      INIT
======================================= */
setTimeout(() => {
  refreshProfileFromSheets(auth?.currentUser?.email);
}, 150);
