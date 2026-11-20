// Companion data pages follow the same saved appearance as the main app.
const systemTheme=matchMedia('(prefers-color-scheme:dark)');
function applyAppearance(){
 let theme='system';
 try{const saved=localStorage.getItem('birdnames-theme');if(['system','light','dark'].includes(saved))theme=saved;}catch{}
 document.body.classList.toggle('dark',theme==='dark'||(theme==='system'&&systemTheme.matches));
}
applyAppearance();
systemTheme.addEventListener('change',applyAppearance);
window.addEventListener('storage',event=>{if(event.key===null||event.key==='birdnames-theme')applyAppearance();});
