/*************************************************
 * PRAVAAH — Frontend API Layer
 * GitHub / Vercel compatible
 * Apps Script = API only
 *************************************************/

/* ================= CONFIG ================= */

// 🔴 REPLACE WITH YOUR REAL DEPLOYED EXEC URL
const API_BASE =
  "https://script.google.com/macros/s/XXXXXXXXXXXXXXXXXXXX/exec";

/* ================= UTIL ================= */

function apiGet(params = {}) {
  const url = new URL(API_BASE);
  Object.keys(params).forEach(k => {
    if (params[k] !== undefined && params[k] !== null) {
      url.searchParams.append(k, params[k]);
    }
  });

  return fetch(url.toString(), {
    method: "GET",
    credentials: "omit"
  }).then(handleResponse);
}

function apiPost(payload = {}) {
  return fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "omit"
  }).then(handleResponse);
}

function handleResponse(res) {
  if (!res.ok) {
    throw new Error("Network error");
  }
  return res.json();
}

/* ================= AUTH / ROLE ================= */

function getUserRole(email) {
  return apiGet({
    type: "role",
    email
  });
}

/* ================= PASS / PROFILE ================= */

function getProfileByEmail(email) {
  return apiGet({
    type: "profile",
    email
  });
}

function getPassesByEmail(email) {
  return apiGet({
    type: "passes",
    email
  });
}

function searchPass(query) {
  return apiGet({
    type: "searchPass",
    query
  });
}

function getParticipantsByPaymentId(paymentId) {
  return searchPass(paymentId);
}

/* ================= GATE ================= */

function gateEntry(payload) {
  return apiPost({
    logType: "GATE_ENTRY",
    ...payload
  });
}

function gateExit(payload) {
  return apiPost({
    logType: "GATE_EXIT",
    ...payload
  });
}

function getGateLogs(paymentId) {
  return apiGet({
    type: "gatelogs",
    paymentId
  });
}

/* ================= EVENT ================= */

function eventScan({ eventName, scanner, participants }) {
  return apiPost({
    type: "EVENT_SCAN",
    eventName,
    scanner,
    participants
  });
}

function getEventList() {
  return apiGet({
    type: "eventList"
  });
}

/* ================= DASHBOARD ================= */

function getDashboardStats({ day, event, role }) {
  return apiGet({
    type: "dashboardStats",
    day,
    event,
    role
  });
}

/* ================= PUBLIC HELPERS ================= */

function getQueryParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

function requireParams(...keys) {
  for (const k of keys) {
    if (!getQueryParam(k)) {
      alert("Invalid or missing QR");
      throw new Error("Missing param: " + k);
    }
  }
}

/* ================= EXPORT (OPTIONAL) ================= */
/* If later you switch to modules */
window.PRAVAAH_API = {
  apiGet,
  apiPost,

  getUserRole,

  getProfileByEmail,
  getPassesByEmail,
  searchPass,
  getParticipantsByPaymentId,

  gateEntry,
  gateExit,
  getGateLogs,

  eventScan,
  getEventList,

  getDashboardStats,

  getQueryParam,
  requireParams
};

