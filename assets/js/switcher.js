/* UI 方案切换器 — 6 套设计方案对比（自带样式，index.html 与 theme-apple.html 共用） */
(function(){
  var THEMES = [
    {id:'apple',     tag:'A', name:'苹果明亮',  sw:['#f5f5f7','#0071e3','#1d1d1f']},
    {id:'editorial', tag:'B', name:'编辑部',    sw:['#f6f4ef','#2b3fe8','#141410']},
    {id:'swiss',     tag:'C', name:'瑞士国际',  sw:['#ffffff','#e30613','#000000']},
    {id:'brutal',    tag:'D', name:'新粗野',    sw:['#fff8e7','#ffd43a','#ff90e8']},
    {id:'terminal',  tag:'E', name:'终端深色',  sw:['#0e1013','#3adb84','#15181d']},
    {id:'gallery',   tag:'F', name:'画廊暖调',  sw:['#f5efe6','#a4502f','#2a2520']}
  ];
  var onApplePage = /theme-apple\.html$/.test(location.pathname);
  var current = onApplePage ? 'apple'
    : (document.documentElement.getAttribute('data-theme') || 'editorial');

  function apply(id){
    if(id === current) return;
    try{ localStorage.setItem('xf-theme-choice', id); }catch(e){}
    if(id === 'apple'){ location.href = 'theme-apple.html'; return; }
    if(onApplePage){ location.href = 'index.html?theme=' + id; return; }
    var link = document.getElementById('theme-css');
    link.href = 'assets/css/themes/' + id + '.css';
    document.documentElement.setAttribute('data-theme', id);
    // 清掉 URL 里残留的 ?theme=，避免刷新时旧参数盖过新选择
    if(location.search){ try{ history.replaceState(null, '', location.pathname + location.hash); }catch(e){} }
    current = id;
    refresh();
  }

  var css = [
    '#uisw{position:fixed;right:18px;bottom:18px;z-index:200;font-family:-apple-system,"PingFang SC",sans-serif}',
    '#uisw *{box-sizing:border-box}',
    '#uisw .sw-btn{display:flex;align-items:center;gap:8px;background:#141414;color:#fff;border:1px solid rgba(255,255,255,.28);',
    '  border-radius:980px;padding:10px 18px;font-size:13px;cursor:pointer;box-shadow:0 8px 28px rgba(0,0,0,.28);',
    '  transition:transform .25s cubic-bezier(.22,.61,.21,1)}',
    '#uisw .sw-btn:hover{transform:translateY(-2px)}',
    '#uisw .sw-btn b{font-weight:600}',
    '#uisw .sw-btn .dot{width:8px;height:8px;border-radius:50%;background:#5ce38f}',
    '#uisw .sw-panel{position:absolute;right:0;bottom:52px;width:212px;background:#fff;color:#161616;',
    '  border:1px solid rgba(0,0,0,.12);border-radius:14px;padding:8px;box-shadow:0 24px 64px rgba(0,0,0,.24);',
    '  opacity:0;pointer-events:none;transform:translateY(8px) scale(.98);transform-origin:100% 100%;',
    '  transition:opacity .22s ease,transform .22s cubic-bezier(.22,.61,.21,1)}',
    '#uisw.open .sw-panel{opacity:1;pointer-events:auto;transform:none}',
    '#uisw .sw-hd{font-size:10.5px;letter-spacing:.14em;color:#9a9a9a;padding:8px 10px 6px;text-transform:uppercase}',
    '#uisw .sw-it{display:flex;align-items:center;gap:10px;width:100%;background:none;border:0;text-align:left;',
    '  padding:9px 10px;border-radius:9px;font-size:13.5px;color:#161616;cursor:pointer;transition:background .15s}',
    '#uisw .sw-it:hover{background:rgba(0,0,0,.06)}',
    '#uisw .sw-it .tg{font-family:ui-monospace,Menlo,monospace;font-size:11px;color:#8a8a8a;width:12px}',
    '#uisw .sw-it .nm{flex:1}',
    '#uisw .sw-it .sws{display:flex;gap:3px}',
    '#uisw .sw-it .sws i{width:10px;height:10px;border-radius:50%;border:1px solid rgba(0,0,0,.15)}',
    '#uisw .sw-it.on{background:rgba(0,0,0,.08);font-weight:600}',
    '#uisw .sw-it.on .tg{color:#161616}',
    '@media(max-width:640px){#uisw{right:12px;bottom:12px}}'
  ].join('\n');

  function refresh(){
    var cur = THEMES.filter(function(t){return t.id===current;})[0];
    document.querySelector('#uisw .sw-cur').textContent = cur.tag + ' · ' + cur.name;
    document.querySelectorAll('#uisw .sw-it').forEach(function(el){
      el.classList.toggle('on', el.getAttribute('data-id') === current);
    });
  }

  function build(){
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var box = document.createElement('div'); box.id = 'uisw';
    box.innerHTML =
      '<div class="sw-panel"><div class="sw-hd">UI 方案 · 6 选 1</div>' +
      THEMES.map(function(t){
        return '<button class="sw-it" data-id="' + t.id + '"><span class="tg">' + t.tag + '</span>' +
          '<span class="nm">' + t.name + '</span>' +
          '<span class="sws">' + t.sw.map(function(c){return '<i style="background:' + c + '"></i>';}).join('') + '</span></button>';
      }).join('') +
      '</div><button class="sw-btn"><span class="dot"></span>UI 方案 <b class="sw-cur"></b></button>';
    document.body.appendChild(box);
    box.querySelector('.sw-btn').addEventListener('click', function(e){
      e.stopPropagation(); box.classList.toggle('open');
    });
    box.querySelectorAll('.sw-it').forEach(function(el){
      el.addEventListener('click', function(){ apply(el.getAttribute('data-id')); box.classList.remove('open'); });
    });
    document.addEventListener('click', function(e){
      if(!box.contains(e.target)) box.classList.remove('open');
    });
    refresh();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
