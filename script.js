document.addEventListener("DOMContentLoaded", () => {

  const monthYear = document.getElementById("monthYear");
  const calendar = document.getElementById("calendar");
  const prevMonth = document.getElementById("prevMonth");
  const nextMonth = document.getElementById("nextMonth");
  const feedList = document.getElementById("feedList");

  let currentDate = new Date();

  const feedsByDate = {
    "2025-12-11": [
      { img: "DSC09133.JPG", name: "Pravaah", text: "2nd Edition", time: "11:59" },
       { img: "DSC09133.JPG", name: "Pravaah", text: "2nd Edition", time: "11:59" },
       { img: "DSC09133.JPG", name: "Pravaah", text: "2nd Edition", time: "11:59" },
       { img: "DSC09133.JPG", name: "Pravaah", text: "2nd Edition", time: "11:59" },
       { img: "DSC09133.JPG", name: "Pravaah", text: "2nd Edition", time: "11:59" },
       { img: "DSC09133.JPG", name: "Pravaah", text: "2nd Edition", time: "11:59" },
       { img: "DSC09133.JPG", name: "Pravaah", text: "2nd Edition", time: "11:59" },
       { img: "DSC09133.JPG", name: "Pravaah", text: "2nd Edition", time: "11:59" },
       { img: "DSC09133.JPG", name: "Pravaah", text: "2nd Edition", time: "11:59" },
       { img: "DSC09133.JPG", name: "Pravaah", text: "2nd Edition", time: "11:59" },
      { img: "DSC09133.JPG", name: "Pravaah", text: "2nd Edition", time: "11:59" }
    ]
  };

  const defaultFeed = [
    { img: "DSC09133.JPG", name: "Pravaah", text: "2nd Edition", time: "11:59" }
  ];



  /* ---------------------- FEED RENDER ---------------------- */
  function renderFeed(dateKey) {
    if (!feedList) return;

    feedList.classList.add("fade-out");

    setTimeout(() => {
      feedList.innerHTML = "";
      const data = feedsByDate[dateKey] || defaultFeed;

      data.forEach(feed => {
        const item = document.createElement("div");
        item.className = "feed-item";

        item.innerHTML = `
          <img src="${feed.img}" alt="${feed.name}">
          <div class="feed-details">
            <h4>${feed.name}</h4>
            <p>${feed.text}</p>
          </div>
          <div class="feed-time">${feed.time}</div>
        `;

        feedList.appendChild(item);
      });

      feedList.classList.remove("fade-out");
      feedList.classList.add("fade-in");

      setTimeout(() => feedList.classList.remove("fade-in"), 450);
    }, 250);
  }



  /* ---------------------- CALENDAR RENDER ---------------------- */

  function renderCalendar(date, transition = false) {
    if (!calendar) return;

    const year = date.getFullYear();
    const month = date.getMonth();

    if (transition) calendar.classList.add("fade-out");

    setTimeout(() => {
      monthYear.textContent =
        `${date.toLocaleString("default", { month: "long" })} ${year}`;

      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      calendar.innerHTML = "";

      for (let i = 0; i < firstDay; i++) {
        calendar.appendChild(document.createElement("div"));
      }

      for (let i = 1; i <= daysInMonth; i++) {
        const day = document.createElement("div");
        day.classList.add("day");
        day.textContent = i;

        const today = new Date();
        if (
          i === today.getDate() &&
          month === today.getMonth() &&
          year === today.getFullYear()
        ) {
          day.classList.add("today");
        }

        day.addEventListener("click", () => {
          document.querySelectorAll(".day").forEach(d => d.classList.remove("selected"));
          day.classList.add("selected");

          const key =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
          renderFeed(key);
        });

        calendar.appendChild(day);
      }

      if (transition) {
        calendar.classList.remove("fade-out");
        calendar.classList.add("fade-in");
        setTimeout(() => calendar.classList.remove("fade-in"), 450);
      }
    }, transition ? 250 : 0);
  }


  prevMonth?.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate, true);
  });

  nextMonth?.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate, true);
  });

  renderCalendar(currentDate);

  renderFeed(
    `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`
  );



  /* ---------------------- VIDEO SWITCH ---------------------- */

  const mainVideo = document.getElementById("mainVideo");
  const aftermovieBtn = document.getElementById("aftermovieBtn");
  const themeBtn = document.getElementById("themeBtn");

  aftermovieBtn?.addEventListener("click", () => {
    mainVideo.src = "aftermovie.mp4";
    aftermovieBtn.classList.add("active");
    themeBtn.classList.remove("active");
  });

  themeBtn?.addEventListener("click", () => {
    mainVideo.src = "themevideo.mp4";
    themeBtn.classList.add("active");
    aftermovieBtn.classList.remove("active");
  });



  /* ---------------------- MOBILE NAV MENU ---------------------- */

  const menuToggle = document.getElementById("menuToggle");
  const menu = document.getElementById("menu");

  if (menuToggle && menu) {
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.toggle("active");
    });

    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target) && !menuToggle.contains(e.target)) {
        menu.classList.remove("active");
      }
    });

    menu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => menu.classList.remove("active"));
    });
  }



 /* ===========================================================
   🔵 LIGHTBOX SYSTEM — FINAL & WORKING
=========================================================== */

const track = document.querySelector(".slider-track");
if (!track) return;

/* ---------- STEP 1: MARK ORIGINAL SLIDES ---------- */
const originals = Array.from(track.children);
originals.forEach(slide => slide.setAttribute("data-original", "true"));

/* ---------- STEP 2: BUILD GALLERY ---------- */
const slides = document.querySelectorAll('.slide[data-original="true"]');

const galleryImages = Array.from(slides).map((slide, index) => {
  const img = slide.querySelector("img");
  return {
    src: img.src,
    title: slide.getAttribute("data-title") || "PRAVAAH",
    desc: "Experience the Chronicles of Time — PRAVAAH 2K25.",
    index
  };
});

let currentIndex = 0;

/* ---------- STEP 3: LIGHTBOX ELEMENTS ---------- */
const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lightboxImg");
const lbTitle = document.getElementById("lightboxTitle");
const lbDesc = document.getElementById("lightboxDesc");
const downloadIcon = document.getElementById("downloadIcon");
const closeBtn = document.querySelector(".close-lightbox");
const leftArrow = document.querySelector(".lb-arrow.left");
const rightArrow = document.querySelector(".lb-arrow.right");

/* ---------- STEP 4: FUNCTIONS ---------- */
function showSlide(index) {
  const item = galleryImages[index];
  if (!item) return;

  lbImg.style.opacity = 0;

  setTimeout(() => {
    lbImg.src = item.src;
    lbTitle.textContent = item.title;
    lbDesc.textContent = item.desc;

    downloadIcon.href = item.src;
    downloadIcon.setAttribute("download", item.title.replace(/\s+/g, "_"));

    lbImg.style.opacity = 1;
  }, 200);
}

function openLightbox(index) {
  currentIndex = index;
  showSlide(index);
  lightbox.classList.remove("hidden");
}

/* ---------- STEP 5: CLICK HANDLERS ---------- */
slides.forEach((slide, index) => {
  const zoom = slide.querySelector(".zoom-icon");
  if (!zoom) return;

  zoom.addEventListener("click", (e) => {
    e.stopPropagation();
    openLightbox(index);
  });
});

closeBtn.addEventListener("click", () => lightbox.classList.add("hidden"));

leftArrow.addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
  showSlide(currentIndex);
});

rightArrow.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % galleryImages.length;
  showSlide(currentIndex);
});

lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) lightbox.classList.add("hidden");
});

/* ---------- STEP 6: INFINITE MARQUEE ---------- */
originals.forEach(slide => {
  track.appendChild(slide.cloneNode(true));
});

requestAnimationFrame(() => {
  const gap = 30;
  const slideWidth = originals[0].offsetWidth;
  const totalWidth = originals.length * (slideWidth + gap);

  track.style.setProperty("--distance", `-${totalWidth}px`);
  track.style.setProperty("--duration", `${totalWidth / 60}s`);
});

/* ---------- STEP 7: SWIPE SUPPORT ---------- */
let startX = 0;
lightbox.addEventListener("touchstart", e => {
  startX = e.changedTouches[0].clientX;
});
lightbox.addEventListener("touchend", e => {
  const endX = e.changedTouches[0].clientX;
  if (startX - endX > 60) rightArrow.click();
  if (endX - startX > 60) leftArrow.click();
});
