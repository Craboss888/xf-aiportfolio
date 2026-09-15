"use strict";
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const dialog = document.getElementById("image-dialog");
const largeImage = document.getElementById("large-image");
const imageStatus = document.getElementById("image-status");
let imageTrigger = null;
function closeImage() {
  dialog.close();
}
document.getElementById("close-image").addEventListener("click", closeImage);
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom
    )
      closeImage();
  }
});
dialog.addEventListener("close", () => {
  document.body.style.overflow = "";
  imageTrigger?.focus({ preventScroll: true });
});
document.querySelectorAll(".image-open").forEach((button) =>
  button.addEventListener("click", () => {
    const source = button.querySelector("img");
    imageTrigger = button;
    document.getElementById("image-title").textContent =
      button.dataset.title || source.alt;
    imageStatus.textContent = "正在加载大图…";
    largeImage.hidden = true;
    largeImage.onload = () => {
      largeImage.hidden = false;
      imageStatus.textContent =
        innerWidth <= 720
          ? "可横向滑动查看细节；按关闭返回原阅读位置。"
          : "真实产品界面 · 虚构示例数据";
    };
    largeImage.onerror = () => {
      largeImage.hidden = true;
      imageStatus.textContent = "图片暂时无法加载，请关闭后重新打开。";
    };
    largeImage.alt = source.alt;
    largeImage.src = source.currentSrc || source.src;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    const area = dialog.querySelector(".image-dialog-body");
    area.scrollTop = 0;
    area.scrollLeft = 0;
  }),
);
const story = {
  problem: [
    "当时，什么事情没有做好？",
    "新用户完成注册后，不知道如何开始第一次团队协作。林舟想先弄清楚：用户是没有需求，还是被操作流程挡住了？",
  ],
  role: [
    "这件事里，你具体负责什么？",
    "林舟负责从用户问题到产品方案的推进：梳理路径、安排访谈、明确优先级，并协调设计与工程团队一起落地。",
  ],
  action: [
    "你做了什么，为什么这样做？",
    "先用行为数据找到流失点，再通过访谈理解原因。团队据此设计了示例空间与分步引导，让新用户可以从一个具体场景开始。",
  ],
  result: [
    "结果是什么，还有哪些未验证？",
    "试点版本已经上线，用户反馈操作更清楚。长期激活指标仍在跟踪；先如实记录已知结果，后续再补充经过验证的数据。",
  ],
};
const questionTabs = [...document.querySelectorAll(".question-tab")];
function chooseQuestion(tab, focus = false) {
  questionTabs.forEach((t) => {
    t.setAttribute("aria-selected", String(t === tab));
    t.tabIndex = t === tab ? 0 : -1;
  });
  const [title, text] = story[tab.dataset.question];
  document.getElementById("story-label").textContent = title;
  document.getElementById("story-text").textContent = text;
  document
    .getElementById("story-panel")
    .setAttribute("aria-labelledby", tab.id);
  if (focus) tab.focus();
}
questionTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => chooseQuestion(tab));
  tab.addEventListener("keydown", (event) => {
    let next;
    if (event.key === "ArrowRight" || event.key === "ArrowDown")
      next = (index + 1) % questionTabs.length;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp")
      next = (index + questionTabs.length - 1) % questionTabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = questionTabs.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      chooseQuestion(questionTabs[next], true);
    }
  });
});
document.querySelectorAll("[data-resume-view]").forEach((button) =>
  button.addEventListener("click", () => {
    const image = document.getElementById("resume-image");
    image.loading = "eager";
    const views = {
      input: {file:'resume-input', label:'准备材料', alt:'简历工作台四步输入：岗位描述、当前简历、补充材料、开始优化'},
      analysis: {file:'resume',label:'岗位分析',alt:'根据岗位要求核对林舟经历的简历分析界面'},
      document: {file:'resume-document',label:'润色简历',alt:'林舟针对远帆协作岗位润色后的简历正文'}
    };
    const view = views[button.dataset.resumeView];
    document.querySelectorAll('[data-resume-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    image.closest('picture').querySelector('source').srcset = `assets/${view.file}-mobile.png`;
    image.src = `assets/${view.file}.png`;
    image.alt = view.alt;
    const opener = image.closest('button');
    opener.dataset.title = `简历润色 · ${view.label}`;
    opener.setAttribute('aria-label',`放大查看${view.label}界面`);
  }),
);
if ("IntersectionObserver" in window) {
  const links = [...document.querySelectorAll(".journey-nav a")];
  const chapters = links
    .map((a) => document.querySelector(a.hash))
    .filter(Boolean);
  function updateActive() {
    const marker = innerHeight * 0.4;
    let active = null;
    for (const section of chapters) {
      if (section.getBoundingClientRect().top <= marker) active = section;
    }
    if (document.getElementById("today")?.getBoundingClientRect().top <= marker)
      active = null;
    links.forEach((link) => {
      if (active && link.hash === "#" + active.id)
        link.setAttribute("aria-current", "step");
      else link.removeAttribute("aria-current");
    });
  }
  let scheduled = false;
  addEventListener(
    "scroll",
    () => {
      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(() => {
          updateActive();
          scheduled = false;
        });
      }
    },
    { passive: true },
  );
  updateActive();
  if (!reducedMotion.matches) {
    document.documentElement.classList.add("js-motion");
    const reveal = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            reveal.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    document
      .querySelectorAll(".reveal")
      .forEach((element) => reveal.observe(element));
  }
}
document.querySelectorAll("img").forEach((img) => {
  if (img.id === "large-image") return;
  const host = img.closest(".image-open") || img.closest("picture") || img;
  let box = null,
    retry = null,
    message = null;
  function recover() {
    if (!img.naturalWidth) return;
    img.hidden = false;
    host.hidden = false;
    delete img.dataset.failed;
    box?.remove();
    box = null;
  }
  img.addEventListener("load", recover);
  img.addEventListener("error", () => {
    img.dataset.failed = "true";
    img.hidden = true;
    host.hidden = true;
    if (!box) {
      box = document.createElement("div");
      box.className = "image-error";
      message = document.createElement("p");
      message.setAttribute("role", "status");
      retry = document.createElement("button");
      retry.type = "button";
      box.append(message, retry);
      host.after(box);
      retry.addEventListener("click", () => {
        message.textContent = "正在重新加载图片…";
        retry.disabled = true;
        retry.textContent = "加载中…";
        img.loading = "eager";
        const source = img.src;
        img.removeAttribute("src");
        img.src = source;
      });
    }
    message.textContent = "图片暂未加载，正文仍可继续阅读。";
    retry.disabled = false;
    retry.textContent = "重新加载图片";
  });
  if (img.complete && img.naturalWidth) recover();
  else if (img.complete && img.getAttribute("src"))
    img.dispatchEvent(new Event("error"));
});
