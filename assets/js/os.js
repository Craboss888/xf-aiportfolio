(function(){
'use strict';
var $=function(s,c){return (c||document).querySelector(s)};
var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
var os=$('#os'),boot=$('#boot'),desktop=$('#desktop');
var isCoarse=matchMedia('(pointer:coarse)').matches;
var isMobile=function(){return matchMedia('(max-width:768px)').matches};

/* ---------- sound ---------- */
var actx=null;
function ac(){if(!actx){try{actx=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}return actx}
function tone(freq,t0,dur,type,vol){var a=ac();if(!a)return;var o=a.createOscillator(),g=a.createGain();o.type=type||'sine';o.frequency.value=freq;g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(vol||.12,t0+.02);g.gain.exponentialRampToValueAtTime(.0001,t0+dur);o.connect(g);g.connect(a.destination);o.start(t0);o.stop(t0+dur+.05)}
function chime(){var a=ac();if(!a)return;var t=a.currentTime+.05;[523.25,659.25,783.99,1046.5].forEach(function(f,i){tone(f,t+i*.11,.5,'sine',.11)});tone(261.63,t,.9,'sine',.05)}
function beep(){var a=ac();if(!a)return;var t=a.currentTime;tone(880,t,.12,'square',.06);tone(660,t+.16,.2,'square',.06)}

/* ---------- boot ---------- */
var BOOT_LINES=[
'XF·OS 98 [Version 4.0.2026]',
'(C) 2026 Xie Feng Portfolio Systems',
'',
'Checking RAM ............... 24576 KB |OK|',
'Detecting AI agents ........ 8 found |OK|',
'Loading projects ........... 8 loaded |OK|',
'Mounting curiosity ......... ∞ |OK|',
'',
'Starting XF·OS 98 ...'
];
function runBoot(){
  var log=$('#bootLog'),i=0;
  (function next(){
    if(i>=BOOT_LINES.length){setTimeout(showLogo,320);return}
    var line=BOOT_LINES[i++];
    log.innerHTML+=line.replace(/\|OK\|/,'<span class="ok">OK</span>')+'\n';
    setTimeout(next,line===''?70:(60+Math.random()*110));
  })();
}
function showLogo(){$('#bootLogo').hidden=false;boot.addEventListener('click',powerOn,{once:true})}
function powerOn(){
  chime();
  boot.classList.add('off');
  sessionStorage.setItem('xfos-booted','1');
  setTimeout(function(){boot.hidden=true;enterDesktop(true)},460);
}
function enterDesktop(fresh){
  os.hidden=false;
  startWall();tick();
  if(fresh&&!localStorage.getItem('xfos-nowelcome'))setTimeout(function(){openWin('w-welcome')},350);
}

/* ---------- wallpaper ---------- */
/* 首位 null=经典 Win98 桌面（#desktop 本底 --teal 即出厂色，壁纸层全淡出）；点击右下角标签手动切换，无自动轮播 */
var WALLS=[null].concat(['sample4.jpg','sample5.jpeg','sample2.jpg','sample3.jpg','sample6.jpeg','sample1.jpg'].map(function(f){return 'assets/img/wallpaper/'+f}));
var wIdx=0,wFront=0,layers=[$('#wallA'),$('#wallB')];
function setWall(i){
  wIdx=(i+WALLS.length)%WALLS.length;
  var back=1-wFront;
  if(WALLS[wIdx]){
    layers[back].style.backgroundImage='url("'+WALLS[wIdx].replace(/"/g,'%22')+'")';
    layers[back].classList.add('on');layers[wFront].classList.remove('on');
    wFront=back;
  }else{
    layers[0].classList.remove('on');layers[1].classList.remove('on');
  }
  $('#wallBrand').textContent=WALLS[wIdx]?'HotYume 出品':'经典 Win98';
  $('#wallNo').textContent=WALLS[wIdx]?'№'+wIdx:'';
}
function startWall(){
  WALLS.forEach(function(u){if(u){var im=new Image();im.src=u}});
  setWall(0);
}
$('#wallTag').addEventListener('click',function(){setWall(wIdx+1)});

/* ---------- window manager ---------- */
var zTop=10,openSeq=0,taskBtns={};
function winEls(){return $$('.win')}
function openWin(id){
  var w=$('#'+id);if(!w)return;
  if(!w.hidden){restoreWin(w);focusWin(w);return}
  w.hidden=false;
  if(!w.dataset.placed&&!isMobile()){
    var n=openSeq++%7;
    var dw=desktop.clientWidth,dh=desktop.clientHeight;
    var ww=w.offsetWidth,wh=w.offsetHeight;
    var x=Math.max(8,(dw-ww)/2+(n-2)*30+(id==='w-welcome'?0:(n%2?40:-30)));
    var y=Math.max(6,(dh-wh)/2+(n-2)*22-12);
    w.style.left=Math.min(x,Math.max(8,dw-ww-8))+'px';
    w.style.top=Math.min(y,Math.max(6,dh-120))+'px';
    w.dataset.placed='1';
  }
  w.classList.add('opening');
  w.addEventListener('animationend',function h(){w.classList.remove('opening');w.removeEventListener('animationend',h)});
  if(id!=='w-welcome')addTaskBtn(w);
  focusWin(w);
}
function focusWin(w){
  w.style.zIndex=++zTop;
  winEls().forEach(function(x){x.classList.toggle('active',x===w)});
  Object.keys(taskBtns).forEach(function(k){taskBtns[k].classList.toggle('on',k===w.id)});
}
function closeWin(w){
  if(w.id==='w-welcome'&&$('.dlg-check',w)&&$('.dlg-check',w).classList.contains('on'))localStorage.setItem('xfos-nowelcome','1');
  w.classList.add('closing');
  setTimeout(function(){
    w.classList.remove('closing');w.hidden=true;rmTaskBtn(w);
    var vis=winEls().filter(function(x){return !x.hidden&&!x.dataset.min});
    if(vis.length)focusWin(vis.sort(function(a,b){return (+b.style.zIndex||0)-(+a.style.zIndex||0)})[0]);
  },120);
}
function minWin(w){
  w.hidden=true;w.dataset.min='1';
  if(taskBtns[w.id])taskBtns[w.id].classList.remove('on');
}
function restoreWin(w){
  if(w.dataset.min){delete w.dataset.min;w.hidden=false}
}
function maxWin(w){
  if(w.dataset.maxed){
    w.style.left=w.dataset.px;w.style.top=w.dataset.py;w.style.width=w.dataset.pw;w.style.height=w.dataset.ph;
    delete w.dataset.maxed;
  }else{
    w.dataset.px=w.style.left;w.dataset.py=w.style.top;w.dataset.pw=w.style.width;w.dataset.ph=w.style.height;
    w.style.left='2px';w.style.top='2px';
    w.style.width='calc(100vw - 4px)';w.style.height=(desktop.clientHeight-4)+'px';
    w.dataset.maxed='1';
  }
}
function addTaskBtn(w){
  if(taskBtns[w.id])return;
  var b=document.createElement('button');b.className='task-btn';
  b.innerHTML='<svg aria-hidden="true"><use href="#'+w.dataset.icon+'"/></svg><span>'+w.dataset.name+'</span>';
  b.addEventListener('click',function(){
    if(w.dataset.min){restoreWin(w);focusWin(w)}
    else if(w.classList.contains('active'))minWin(w);
    else focusWin(w);
  });
  $('#taskBtns').appendChild(b);taskBtns[w.id]=b;
}
function rmTaskBtn(w){
  if(taskBtns[w.id]){taskBtns[w.id].remove();delete taskBtns[w.id]}
  delete w.dataset.min;
}
winEls().forEach(function(w){
  var tbar=$('.tbar',w);
  tbar.addEventListener('pointerdown',function(e){
    if(e.target.closest('.tb'))return;
    focusWin(w);
    if(isMobile()||w.dataset.maxed)return;
    var sx=e.clientX-w.offsetLeft,sy=e.clientY-w.offsetTop;
    tbar.setPointerCapture(e.pointerId);
    function mv(ev){
      var dw=desktop.clientWidth;
      w.style.left=Math.min(Math.max(ev.clientX-sx,-w.offsetWidth+120),dw-90)+'px';
      w.style.top=Math.max(ev.clientY-sy,0)+'px';
    }
    function up(){tbar.removeEventListener('pointermove',mv);tbar.removeEventListener('pointerup',up);tbar.removeEventListener('pointercancel',up)}
    tbar.addEventListener('pointermove',mv);
    tbar.addEventListener('pointerup',up);
    tbar.addEventListener('pointercancel',up);
  });
  tbar.addEventListener('dblclick',function(e){if(!e.target.closest('.tb')&&!isMobile())maxWin(w)});
  w.addEventListener('pointerdown',function(){if(!w.classList.contains('active'))focusWin(w)});
  $$('.tb',w).forEach(function(b){
    b.addEventListener('click',function(e){
      e.stopPropagation();
      var act=b.dataset.act;
      if(act==='close')closeWin(w);
      else if(act==='min')minWin(w);
      else if(act==='max')maxWin(w);
    });
  });
});
$$('.btn98[data-act="close"]').forEach(function(b){b.addEventListener('click',function(){closeWin(b.closest('.win'))})});
$$('.dlg-check').forEach(function(c){c.addEventListener('click',function(){c.classList.toggle('on')})});

/* ---------- desktop icons ---------- */
var selIcon=null;
$$('.dicon').forEach(function(ic){
  ic.addEventListener('click',function(e){
    var kb=e.detail===0;
    if(selIcon&&selIcon!==ic)selIcon.classList.remove('sel');
    ic.classList.add('sel');selIcon=ic;
    if(isCoarse||isMobile()||kb)launch(ic);
  });
  ic.addEventListener('dblclick',function(){launch(ic)});
});
function launch(ic){
  var t=ic.dataset.win;
  if(t==='bsod'){showBsod();return}
  openWin(t);
}
desktop.addEventListener('click',function(e){
  if(!e.target.closest('.dicon')&&selIcon){selIcon.classList.remove('sel');selIcon=null}
});

/* ---------- taskbar / start menu ---------- */
function tick(){
  var d=new Date();
  $('#clock').textContent=('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);
}
setInterval(tick,20000);
var sm=$('#startMenu'),sb=$('#startBtn');
function toggleSM(force){
  var show=force!==undefined?force:sm.hidden;
  sm.hidden=!show;sb.classList.toggle('on',show);
}
sb.addEventListener('click',function(e){e.stopPropagation();toggleSM()});
document.addEventListener('click',function(e){
  if(!sm.hidden&&!e.target.closest('#startMenu'))toggleSM(false);
});
$$('.sm-item[data-open]').forEach(function(it){
  it.addEventListener('click',function(){toggleSM(false);openWin(it.dataset.open)});
});
$('#shutdownBtn').addEventListener('click',function(){toggleSM(false);$('#shutdownScr').hidden=false});
$('#shutdownScr').addEventListener('click',function(e){
  if(e.target.closest('a'))return;
  $('#shutdownScr').hidden=true;
});

/* ---------- bsod ---------- */
var bsod=$('#bsod');
function showBsod(){bsod.hidden=false;beep();
  setTimeout(function(){
    function back(){bsod.hidden=true;document.removeEventListener('keydown',back)}
    bsod.addEventListener('click',back,{once:true});
    document.addEventListener('keydown',back,{once:true});
  },250);
}

/* ---------- lightbox ---------- */
var lb=$('#lightbox');
document.addEventListener('click',function(e){
  var z=e.target.closest('.zoomable');
  if(z){
    $('#lbImg').src=z.dataset.full||z.src;
    $('#lbTitle').textContent=(z.alt||'图像')+' — 图像预览';
    lb.hidden=false;
  }
});
function closeLb(){lb.hidden=true;$('#lbImg').src=''}
$('#lbClose').addEventListener('click',closeLb);
lb.addEventListener('click',function(e){if(!e.target.closest('.lb-win'))closeLb()});
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){
    if(!lb.hidden)closeLb();
    else if(!sm.hidden)toggleSM(false);
  }
});

/* ---------- init ---------- */
if(sessionStorage.getItem('xfos-booted')){
  boot.hidden=true;enterDesktop(false);
}else{
  runBoot();
}
})();
