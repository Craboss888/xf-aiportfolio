'use strict';
const products={
 day:{label:'每天的自传',title:'多模态记录，汇入同一天的自传。',description:'按时间回看当天的影像与文字，补充细节，保留值得记住的片段。',image:'product-day-private.webp',alt:'日记详情真实界面，左侧照片，右侧当天文字'},
 month:{label:'每月总结',title:'从日常记录，形成月度生活画像。',description:'回顾睡眠、饮食、运动、情绪与习惯，整理下个月的打算。',image:'product-monthly.webp',alt:'月度总结真实界面，展示评分与睡眠、饮食、运动、情绪概况'},
 habits:{label:'习惯打卡',title:'让长期目标，落实为可追踪的日常。',description:'用打卡和备注记录每天的习惯，对照月度目标回看进展。',image:'product-habits.webp',alt:'习惯追踪真实界面，按日期展示打卡记录与目标'},
 materials:{label:'素材与专题',title:'从日常里，整理出一段完整的故事。',description:'跨日期选取素材，按章节整理，再导出带来源清单的素材包。',image:null,alt:'专题选集真实界面，影像按章节排列'}
};
const tabs=[...document.querySelectorAll('[data-product]')];
const screen=document.getElementById('screen-wrap');
const screenButton=document.getElementById('screen-button');
const productImage=document.getElementById('product-image');
const state=document.getElementById('screen-state');
const retry=document.getElementById('screen-retry');
let selected='day',generation=0,ready=true;
function imageState(status){
 ready=status==='ready';screen.classList.toggle('is-loading',status==='loading');screen.classList.toggle('is-error',status==='error');
 screen.setAttribute('aria-busy',String(status==='loading'));screenButton.disabled=!ready;
 state.hidden=ready;retry.hidden=status!=='error';document.getElementById('screen-message').textContent=status==='error'?'界面加载失败':'正在加载界面…';
}
function chooseProduct(key,focus=false){
 selected=key;screen.dataset.product=key;const p=products[key],ticket=++generation;
 tabs.forEach(t=>{const active=t.dataset.product===key;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;if(active&&focus)t.focus({preventScroll:true})});
 document.getElementById('product-panel').setAttribute('aria-labelledby','tab-'+key);
 document.getElementById('feature-title').textContent=p.title;document.getElementById('feature-description').textContent=p.description;
 screenButton.setAttribute('aria-label','放大查看'+p.label+'界面');imageState('loading');
 document.getElementById('memory-collections').hidden=key!=='materials';screen.hidden=key==='materials';document.getElementById('screen-caption').textContent=key==='materials'?'专题回忆展示示意，使用生成素材。':'真实产品界面；照片已模糊，正文与统计为演示内容。';if(key==='materials')return;
 const next=new Image();next.onload=()=>{if(ticket!==generation)return;productImage.src=next.src;productImage.alt=p.alt;imageState('ready')};
 next.onerror=()=>{if(ticket===generation)imageState('error')};next.src='assets/'+p.image;
}
retry.addEventListener('click',()=>chooseProduct(selected));
productImage.addEventListener('error',()=>imageState('error'));
tabs.forEach((t,i)=>{t.addEventListener('click',()=>chooseProduct(t.dataset.product));t.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%tabs.length;if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;if(e.key==='Home')n=0;if(e.key==='End')n=tabs.length-1;if(n!==undefined){e.preventDefault();chooseProduct(tabs[n].dataset.product,true)}})});
const dialog=document.getElementById('image-dialog'),expanded=document.getElementById('expanded-image');
let previousOverflow='',opener=screenButton;
function openPreview(source,title,alt,story=''){opener=document.activeElement;document.getElementById('dialog-title').textContent=title;document.getElementById('dialog-error').hidden=true;expanded.hidden=false;expanded.src=source;expanded.alt=alt;const body=document.querySelector('.dialog-body');body.classList.toggle('memory-view',Boolean(story));const detail=document.getElementById('memory-story');detail.hidden=!story;detail.innerHTML=story;previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.showModal();body.scrollTo(0,0);document.getElementById('dialog-close').focus();}
const memories={travel:{title:'一段旅行的回忆',story:'<small>专题展示示意</small><h3>把沿途的片段，连成一次出发。</h3><p>行前的期待、路上的影像、抵达后的感受，按旅程组织成章节。</p><h4>01 出发 · 02 沿途 · 03 抵达</h4><p>每个片段保留日期与来源，既能回到当天，也能组合成完整的旅行回忆。</p>'},birthday:{title:'一次生日的回忆',story:'<small>专题展示示意</small><h3>记下一个日子，也记下彼此。</h3><p>聚会的照片、朋友的祝福、那天写下的话，成为同一段回忆的不同侧面。</p><h4>01 相聚 · 02 祝福 · 03 留念</h4><p>从日常档案中选取素材，整理为可回看、可导出的主题作品。</p>'}};
document.querySelectorAll('[data-memory]').forEach(b=>b.addEventListener('click',()=>{const key=b.dataset.memory,m=memories[key];openPreview('assets/botanical-set/'+key+'-memory.webp',m.title,m.title+'生成插画',m.story)}));
screenButton.addEventListener('click',()=>{if(ready)openPreview(productImage.src,products[selected].label,productImage.alt)});
expanded.addEventListener('error',()=>{expanded.hidden=true;document.getElementById('dialog-error').hidden=false});
document.getElementById('dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
dialog.addEventListener('close',()=>{document.body.style.overflow=previousOverflow;opener?.focus({preventScroll:true})});

chooseProduct('day');
