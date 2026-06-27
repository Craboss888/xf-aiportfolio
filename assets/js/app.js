/* 谢峰 · 作品集 — 路由 + 灯箱 */
const VIEWS = ['home','wallpaper','autobio','hkid','harmony','livehouse','resume'];

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

window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', () => {
  render();
  const lb = document.getElementById('lb'), lbimg = document.getElementById('lbimg');
  document.addEventListener('click', e => {
    const z = e.target.closest('.zoomable');
    if(z){ lbimg.src = z.dataset.full || z.src; lb.classList.add('on'); }
  });
  document.addEventListener('keydown', e => { if(e.key === 'Escape') lb.classList.remove('on'); });
});
