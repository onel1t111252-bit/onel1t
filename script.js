const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
toggle?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
  toggle.textContent = open ? "×" : "☰";
});
nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  nav.classList.remove("open");
  toggle?.setAttribute("aria-expanded", "false");
  if (toggle) toggle.textContent = "☰";
}));

const isUkrainian = document.documentElement.lang === "uk";
const roles = isUkrainian
  ? ["IT-ентузіаст", "Вивчаю кібербезпеку", "Розв’язую проблеми"]
  : ["IT enthusiast", "Cybersecurity learner", "Problem solver"];
const roleTarget = document.getElementById("typed-role");
let roleIndex = 0;
if (roleTarget && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  setInterval(() => {
    roleIndex = (roleIndex + 1) % roles.length;
    roleTarget.animate([{ opacity: 0, transform: "translateY(5px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 280 });
    roleTarget.textContent = roles[roleIndex];
  }, 2600);
}

const glow = document.querySelector(".cursor-glow");
if (glow && window.matchMedia("(pointer:fine)").matches) {
  window.addEventListener("pointermove", (event) => {
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
  });
}

document.getElementById("year").textContent = new Date().getFullYear();
document.getElementById("copy-handle")?.addEventListener("click", async () => {
  const status = document.getElementById("copy-status");
  try {
    await navigator.clipboard.writeText("@onel1t");
    status.textContent = isUkrainian ? "Нікнейм @onel1t скопійовано." : "Username @onel1t copied to clipboard.";
  } catch {
    status.textContent = isUkrainian ? "Твій нікнейм: @onel1t" : "Your username: @onel1t";
  }
});
