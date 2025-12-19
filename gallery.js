// 🌌 PRAVAAH — Gallery JavaScript (FINAL, GRID + ADVANCED LIGHTBOX)

document.addEventListener("DOMContentLoaded", () => {

  /* ===========================================================
     📸 GALLERY DATA (FROM GRID)
  =========================================================== */

  const galleryItems = document.querySelectorAll(".gallery-item");
  const galleryImages = Array.from(galleryItems).map((item, index) => {
    const img = item.querySelector("img");
    return {
      src: img.src,
      title: `PRAVAAH Moment ${index + 1}`,
      desc: "Experience the Chronicles of Time — PRAVAAH 2K25."
    };
  });

  let currentIndex = 0;

  /* ===========================================================
     🔍 LIGHTBOX ELEMENTS
  =========================================================== */

  const lightbox = document.getElementById("lightbox");

  // Inject advanced lightbox structure (same as Home)
  lightbox.innerHTML = `
    <div class="lightbox-top">
      <span class="close-lightbox"><i class="fa-solid fa-xmark"></i></span>
      <a id="downloadIcon" class="download-icon" download>
        <i class="fa-solid fa-download"></i>
      </a>
    </div>

    <div class="lb-arrow left"><i class="fa-solid fa-chevron-left"></i></div>

    <img id="lightboxImg" />

    <div class="lb-arrow right"><i class="fa-solid fa-chevron-right"></i></div>

    <div class="lightbox-info">
      <h3 id="lightboxTitle"></h3>
      <p id="lightboxDesc"></p>
    </div>
  `;

  const lbImg = document.getElementById("lightboxImg");
  const lbTitle = document.getElementById("lightboxTitle");
  const lbDesc = document.getElementById("lightboxDesc");
  const downloadIcon = document.getElementById("downloadIcon");

  const closeBtn = document.querySelector(".close-lightbox");
  const leftArrow = document.querySelector(".lb-arrow.left");
  const rightArrow = document.querySelector(".lb-arrow.right");

  /* ===========================================================
     🔄 FUNCTIONS
  =========================================================== */

  function showImage(index) {
    lbImg.style.opacity = 0;

    setTimeout(() => {
      const item = galleryImages[index];
      lbImg.src = item.src;
      lbTitle.textContent = item.title;
      lbDesc.textContent = item.desc;

      downloadIcon.href = item.src;
      downloadIcon.setAttribute(
        "download",
        item.title.replace(/\s+/g, "_") + ".jpg"
      );

      lbImg.style.opacity = 1;
    }, 200);
  }

  function openLightbox(index) {
    currentIndex = index;
    showImage(index);
    lightbox.classList.remove("hidden");
  }

  function closeLightbox() {
    lightbox.classList.add("hidden");
  }

  /* ===========================================================
     🖱️ CLICK EVENTS (GRID + MAGNIFY ICON)
  =========================================================== */

  galleryItems.forEach((item, index) => {
    item.addEventListener("click", () => openLightbox(index));
  });

  closeBtn.addEventListener("click", closeLightbox);

  leftArrow.addEventListener("click", () => {
    currentIndex =
      (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    showImage(currentIndex);
  });

  rightArrow.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % galleryImages.length;
    showImage(currentIndex);
  });

  // Close when clicking background
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  /* ===========================================================
     📱 SWIPE SUPPORT (MOBILE)
  =========================================================== */

  let startX = 0;

  lightbox.addEventListener("touchstart", (e) => {
    startX = e.changedTouches[0].clientX;
  });

  lightbox.addEventListener("touchend", (e) => {
    const endX = e.changedTouches[0].clientX;
    if (startX - endX > 60) rightArrow.click();
    if (endX - startX > 60) leftArrow.click();
  });

  /* ===========================================================
     📱 NAVBAR TOGGLE (UNCHANGED, SAFE)
  =========================================================== */

  /* ===========================================================
   📱 NAVBAR TOGGLE (FIXED)
=========================================================== */

const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("menu");

if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    navMenu.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
      navMenu.classList.remove("open");
    }
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("open");
    });
  });
}

});

