/* hash 路由：#home / #rtg / #ses / #dash / #mexc */
const VIEWS = ["home", "rtg", "ses", "dash", "mexc"];

function go(view) {
  if (!VIEWS.includes(view)) view = "home";
  location.hash = view === "home" ? "" : view;
  render();
}

function render() {
  const h = location.hash.replace("#", "");
  const view = VIEWS.includes(h) ? h : "home";
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  const el = document.getElementById("v-" + view);
  if (el) el.classList.add("active");
  document.body.classList.toggle("detail", view !== "home");
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", render);

const nav = document.getElementById("nav");
window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 8);
}, { passive: true });

render();
