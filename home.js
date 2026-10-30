(() => {
  'use strict';
  const root = document.getElementById('home-catalog');
  if (!root || !Array.isArray(COURSE)) return;
  root.replaceChildren();
  COURSE.forEach((module, index) => {
    const a = document.createElement('a');
    a.href = `learn.html?m=${index}`;
    a.className = 'module-card';
    const eyebrow = document.createElement('span');
    eyebrow.className = 'module-number';
    eyebrow.textContent = `MODULE ${String(index+1).padStart(2,'0')}`;
    const title = document.createElement('strong');
    title.textContent = module.title;
    const desc = document.createElement('span');
    desc.className = 'module-desc';
    desc.textContent = module.tag;
    const info = document.createElement('span');
    info.className = 'module-link';
    info.textContent = `${module.lessons.length} discussion topics · Quiz →`;
    a.append(eyebrow,title,desc,info);
    root.append(a);
  });
  const counter = document.getElementById('module-counter');
  if (counter) counter.textContent = `${COURSE.length} modules`;
})();