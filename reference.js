(() => {
 const root=document.getElementById('glossary-list');
 if(!root||typeof GLOSSARY==='undefined')return;
 for(const [term,definition] of GLOSSARY){
   const d=document.createElement('div');d.className='glossary-item';
   const strong=document.createElement('strong');strong.textContent=term;
   const text=document.createElement('p');text.textContent=definition;
   d.append(strong,text);root.append(d);
 }
})();