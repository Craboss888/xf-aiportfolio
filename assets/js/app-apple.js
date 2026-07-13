/* 谢峰 · 作品集 — 路由 + 滚动渐入 + 灯箱 */
const VIEWS = ['home','laoban','wallpaper','autobio','hkid','harmony','livehouse','resume'];
const PROJECTS = [
  {id:'laoban',    t:'laoban.ai · AI 虚拟董事会', k:'大项目'},
  {id:'wallpaper', t:'AI 壁纸店铺 · HotYume', k:'大项目'},
  {id:'autobio',   t:'AI 数字自传',           k:'大项目'},
  {id:'hkid',      t:'HKID 预约监测',         k:'工具'},
  {id:'harmony',   t:'和声工作台',            k:'工具'},
  {id:'livehouse', t:'Livehouse 点歌系统',    k:'工具'},
  {id:'resume',    t:'AI 改简历',             k:'工具'},
];

function go(view){
  if(!VIEWS.includes(view)) view = 'home';
  location.hash = (view === 'home') ? '' : view;
  if((location.hash.replace('#','')||'home') === view) render();
}
function goSection(id){
  const cur = location.hash.replace('#','') || 'home';
  if(cur !== 'home'){ location.hash=''; render(); setTimeout(()=>jump(id), 80); }
  else jump(id);
}
function jump(id){ const el=document.getElementById(id); if(el) el.scrollIntoView({behavior:'smooth',block:'start'}); }

function render(){
  let v = location.hash.replace('#','') || 'home';
  if(!VIEWS.includes(v)) v = 'home';
  document.querySelectorAll('.view').forEach(s => s.classList.toggle('active', s.id === v));
  document.body.classList.toggle('detail', v !== 'home');
  window.scrollTo(0,0);
}

/* ---- 滚动渐入 ---- */
function setupReveals(){
  const targets = document.querySelectorAll(
    '.section-head, .big-card, .tool-card, .detail-hero, .flow, ' +
    '.block .b-media, .block .b-text, .stat, .gallery .phone, ' +
    '.brand-row .bcol, .dm, .note, .pn, .footer'
  );
  // 同一容器内的兄弟元素做级联延迟
  const groups = new Map();
  targets.forEach(el => {
    el.classList.add('rv');
    const p = el.parentElement;
    const i = groups.get(p) || 0;
    groups.set(p, i + 1);
    el.style.setProperty('--d', Math.min(i * 0.07, 0.42) + 's');
  });
  if(!('IntersectionObserver' in window)){ targets.forEach(el => el.classList.add('in')); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, {threshold:.1, rootMargin:'0px 0px -36px'});
  targets.forEach(el => io.observe(el));
}

/* ---- 详情页底部「下一个项目」 ---- */
function setupNextLinks(){
  PROJECTS.forEach((p, i) => {
    const next = PROJECTS[(i + 1) % PROJECTS.length];
    const sec = document.getElementById(p.id);
    if(!sec) return;
    const wrap = document.createElement('div');
    wrap.className = 'proj-next';
    wrap.innerHTML = `<div class="pn" onclick="go('${next.id}')">
      <div><div class="lbl">下一个项目 · ${next.k}</div><div class="tt">${next.t}</div></div>
      <div class="arr">→</div></div>`;
    sec.appendChild(wrap);
  });
}

window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', () => {
  render();
  setupNextLinks();
  setupReveals();

  // 导航栏滚动态
  const nav = document.querySelector('.nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  // 详情页图片延迟加载
  document.querySelectorAll('.view.detail img').forEach(img => img.loading = 'lazy');

  // 灯箱
  const lb = document.getElementById('lb'), lbimg = document.getElementById('lbimg');
  document.addEventListener('click', e => {
    const z = e.target.closest('.zoomable');
    if(z){ lbimg.src = z.dataset.full || z.src; lb.classList.add('on'); }
  });
  document.addEventListener('keydown', e => { if(e.key === 'Escape') lb.classList.remove('on'); });
});
