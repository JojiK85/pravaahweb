/* ==========================================================
   PRAVAAH — Profile Management System (Firebase + Apps Script)
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

/* ---------- Firebase ---------- */
const firebaseConfig = {
  apiKey: "AIzaSyCbXKleOw4F46gFDXz2Wynl3YzPuHsVwh8",
  authDomain: "pravaah-55b1d.firebaseapp.com",
  projectId: "pravaah-55b1d",
  storageBucket: "pravaah-55b1d.appspot.com",
  messagingSenderId: "287687647267",
  appId: "1:287687647267:web:7aecd603ee202779b89196"
};
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const storage = getStorage(app);

/* ---------- Backend Script URL ---------- */
const scriptURL =
  "https://script.google.com/macros/s/AKfycbyc72D1uOGyAaHruVkkdsQpFZJBJ80KvLRpFhWZ0-2VduaaxPWkqt0M0dtYvhDFB_c2jg/exec";

/* ---------- Toast ---------- */
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 50);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

/* ---------- State ---------- */
let isEditing = false;

/* ---------- Save profile to Sheets ---------- */
async function saveProfileToSheet(profile) {
  const payload = JSON.stringify(profile);

  try {
    await fetch(scriptURL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: payload
    });
  } catch (err) {
    console.error("Save failed:", err);
  }
}

/* ---------- MAIN ---------- */
onAuthStateChanged(auth, async (user) => {

  if (!user) return (window.location.href = "index.html");

  /* ELEMENTS */
  const container = document.querySelector(".profile-container");
  const userPhoto = document.getElementById("userPhoto");
  const uploadPhotoInput = document.getElementById("uploadPhoto");
  const uploadOptions = document.getElementById("uploadOptions");
  const driveUploadBtn = document.getElementById("driveUploadBtn");
  const deviceUploadBtn = document.getElementById("deviceUploadBtn");

  const userNameEl = document.getElementById("userName");
  const userEmailEl = document.getElementById("userEmail");
  const userPhoneInput = document.getElementById("userPhone");
  const userCollegeInput = document.getElementById("userCollege");

  const editPen = document.getElementById("editPen");
  const editActions = document.getElementById("editActions");
  const saveBtn = document.getElementById("saveProfileBtn");
  const cancelBtn = document.getElementById("cancelEditBtn");

  /* PREFILL */
  userNameEl.textContent = user.displayName || "PRAVAAH User";
  userEmailEl.textContent = user.email;

  /* Load from Firebase photoURL */
  let firebasePhoto = user.photoURL;
  if (firebasePhoto) userPhoto.src = firebasePhoto;
  else userPhoto.src = "default-avatar.png";

  /* Load profile from Sheet */
  let profileData = {};
  try {
    const res = await fetch(`${scriptURL}?type=profile&email=${encodeURIComponent(user.email)}`);
    profileData = await res.json();

    userPhoneInput.value = profileData.phone || "";
    userCollegeInput.value = profileData.college || "";

    if (profileData.photo) userPhoto.src = profileData.photo;

  } catch (err) {
    console.error("Profile load error:", err);
  }

  /* ---------- Edit Mode ---------- */
  editPen.addEventListener("click", () => {
    isEditing = !isEditing;

    uploadOptions.style.display = isEditing ? "flex" : "none";
    editActions.style.display = isEditing ? "flex" : "none";

    userPhoto.style.outline = isEditing ? "2px dashed cyan" : "none";
  });

  /* ---------- Save ---------- */
  saveBtn.addEventListener("click", async () => {
    await saveProfileToSheet({
      name: user.displayName,
      email: user.email,
      phone: userPhoneInput.value.trim(),
      college: userCollegeInput.value.trim(),
      photo: userPhoto.src
    });

    showToast("Profile updated!", "success");
    isEditing = false;
    uploadOptions.style.display = "none";
    editActions.style.display = "none";
  });

  /* ---------- Upload From Device ---------- */
  deviceUploadBtn.addEventListener("click", () => {
    if (!isEditing) return showToast("Tap ✏️ to edit!", "info");
    uploadPhotoInput.click();
  });

  uploadPhotoInput.addEventListener("change", async (e) => {

    if (!e.target.files?.length) return;

    const file = e.target.files[0];

    const reader = new FileReader();
    reader.onload = (ev) => (userPhoto.src = ev.target.result);
    reader.readAsDataURL(file);

    try {
      const storageRef = ref(storage, `profilePhotos/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await updateProfile(user, { photoURL: url });
      userPhoto.src = url;

      await saveProfileToSheet({
        name: user.displayName,
        email: user.email,
        phone: userPhoneInput.value,
        college: userCollegeInput.value,
        photo: url
      });

    } catch (err) {
      showToast("Upload failed!", "error");
    }
  });

  /* ---------- Upload From Drive ---------- */
  driveUploadBtn.addEventListener("click", async () => {
    if (!isEditing) return showToast("Tap ✏️ to edit!", "info");

    const link = prompt("Paste Google Drive image link:");
    if (!link?.includes("drive.google.com")) return showToast("Invalid link!", "error");

    const id = link.match(/[-\w]{25,}/)?.[0];
    if (!id) return showToast("Bad Drive URL!", "error");

    const directURL = `https://drive.google.com/uc?export=view&id=${id}`;

    userPhoto.src = directURL;

    await updateProfile(user, { photoURL: directURL });

    await saveProfileToSheet({
      name: user.displayName,
      email: user.email,
      phone: userPhoneInput.value,
      college: userCollegeInput.value,
      photo: directURL
    });

    showToast("Photo updated!", "success");
  });

  /* ---------- Logout ---------- */
  const logout = async () => {
    await signOut(auth);
    window.location.href = "index.html";
  };
  document.getElementById("logoutDesktop").onclick = logout;
  document.getElementById("logoutMobile").onclick = logout;

});

/* ---------- Toast CSS ---------- */
const style = document.createElement("style");
style.innerHTML = `
.toast { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.85); padding: 12px 25px; color: cyan; border: 1px solid cyan; border-radius: 25px; opacity: 0; transition: .4s; }
.toast.show { opacity: 1; transform: translateX(-50%) translateY(-10px); }
`;
document.head.appendChild(style);

});
