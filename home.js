(() => {
const root=document.getElementById('home-catalog');
if(!root||typeof COURSE==='undefined')return;
root.innerHTML=COURSE.map((m,i)=>`<a class="catalog-item" href="learn.html?m=${i}"><span class="catalog-number">${String(i+1).padStart(2,'0')}</span><span><strong>${m.title}</strong><small>${m.tag} · ${m.lessons.length} lessons</small></span><span class="catalog-arrow" aria-hidden="true">→</span></a>`).join('');
})();