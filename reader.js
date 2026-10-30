(() => {
'use strict';
const $=sel=>document.querySelector(sel);
const nav=$('#module-navigation');
const article=$('#lesson-content');
const search=$('#lesson-search');
const total=COURSE.reduce((n,m)=>n+m.lessons.length,0);
const params=new URLSearchParams(location.search);
let moduleIndex=Math.max(0,Math.min(COURSE.length-1,Number(params.get('m'))||0));
let lessonIndex=0;
const done=new Set();
function esc(value){return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;')}
function key(m,l){return `${m}:${l}`}
function renderNav(term=''){
 const query=term.trim().toLowerCase();
 const html=[];
 COURSE.forEach((m,mi)=>{
  const hits=m.lessons.map((l,li)=>({li,l})).filter(({l})=>!query||[m.title,m.tag,...l.slice(0,5)].some(x=>String(x).toLowerCase().includes(query)));
  if(!hits.length)return;
  html.push(`<div class="module-group"><div class="module-group-title">${String(mi+1).padStart(2,'0')} · ${esc(m.title)}</div>`);
  hits.forEach(({li,l})=>html.push(`<button type="button" class="lesson-link ${mi===moduleIndex&&li===lessonIndex?'selected':''}" data-module="${mi}" data-lesson="${li}" ${mi===moduleIndex&&li===lessonIndex?'aria-current="page"':''}><span>${esc(l[0])}</span><span class="done-mark" aria-label="${done.has(key(mi,li))?'Read':'Not marked read'}">${done.has(key(mi,li))?'✓':''}</span></button>`));
  html.push('</div>');
 });
 nav.innerHTML=html.join('')||'<p class="no-results">No lessons match your search.</p>';
 nav.querySelectorAll('button[data-module]').forEach(btn=>btn.addEventListener('click',()=>go(Number(btn.dataset.module),Number(btn.dataset.lesson))));
}
function ordinal(){let n=0;for(let i=0;i<moduleIndex;i++)n+=COURSE[i].lessons.length;return n+lessonIndex+1}
function renderLesson(){
 const m=COURSE[moduleIndex],l=m.lessons[lessonIndex];
 const [title,intro,explanation,example,takeaway,question,options,correct,feedback]=l;
 $('#breadcrumb').textContent=`Module ${moduleIndex+1} / ${m.title}`;
 $('#lesson-count').textContent=`Lesson ${ordinal()} of ${total}`;
 article.innerHTML=`<span class="eyebrow">${esc(m.tag)} / LESSON ${lessonIndex+1} OF ${m.lessons.length}</span><h1>${esc(title)}</h1>
 <div class="lesson-lead">${esc(intro)}</div><h2>Learn the idea</h2><p>${esc(explanation)}</p>
 <div class="worked-example"><span class="example-label">WORKED EXAMPLE</span><p>${esc(example)}</p></div>
 <div class="takeaway"><strong>Remember</strong><span>${esc(takeaway)}</span></div>
 <div class="knowledge-check"><span class="eyebrow">CHECK YOUR UNDERSTANDING</span><h2>${esc(question)}</h2><div class="answer-list">${options.map((opt,i)=>`<button type="button" class="answer" data-answer="${i}"><span class="answer-circle">${String.fromCharCode(65+i)}</span>${esc(opt)}</button>`).join('')}</div><div id="answer-feedback" class="answer-feedback" aria-live="polite"></div></div>
 <div class="lesson-end"><button type="button" class="button ${done.has(key(moduleIndex,lessonIndex))?'secondary':'primary'}" id="mark-read">${done.has(key(moduleIndex,lessonIndex))?'✓ Marked as read':'✓ Mark lesson as read'}</button><span>Continue when you are ready. No scores are collected.</span></div>`;
 article.querySelectorAll('.answer').forEach(btn=>btn.addEventListener('click',()=>{
   const choice=Number(btn.dataset.answer),right=choice===correct;
   article.querySelectorAll('.answer').forEach(b=>{b.classList.toggle('is-right',Number(b.dataset.answer)===correct);b.classList.toggle('is-wrong',Number(b.dataset.answer)===choice&&!right);b.disabled=true});
   const f=$('#answer-feedback'); f.textContent=(right?'Correct. ':'Not quite. ')+feedback;f.className='answer-feedback '+(right?'correct':'incorrect');
 }));
 $('#mark-read').addEventListener('click',()=>{done.add(key(moduleIndex,lessonIndex));renderNav(search.value);$('#mark-read').textContent='✓ Marked as read';$('#mark-read').classList.replace('primary','secondary')});
 const first=moduleIndex===0&&lessonIndex===0;const last=moduleIndex===COURSE.length-1&&lessonIndex===m.lessons.length-1;
 $('#lesson-prev').disabled=first;$('#lesson-next').disabled=last;
 $('#lesson-next').textContent=last?'You reached the last lesson':'Next lesson →';
 document.title=`${title} | Think Like a Technician`;
}
function go(mi,li){moduleIndex=mi;lessonIndex=li;renderNav(search.value);renderLesson();history.replaceState(null,'',`learn.html?m=${moduleIndex}&l=${lessonIndex}`);window.scrollTo({top:0,behavior:'instant'})}
function move(direction){let m=moduleIndex,l=lessonIndex+direction;if(l<0){m--;if(m<0)return;l=COURSE[m].lessons.length-1}else if(l>=COURSE[m].lessons.length){m++;if(m>=COURSE.length)return;l=0}go(m,l)}
$('#lesson-prev').addEventListener('click',()=>move(-1));$('#lesson-next').addEventListener('click',()=>move(1));
search.addEventListener('input',()=>renderNav(search.value));
lessonIndex=Math.max(0,Math.min(COURSE[moduleIndex].lessons.length-1,Number(params.get('l'))||0));
renderNav();renderLesson();
})();