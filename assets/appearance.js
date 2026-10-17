// Store appearance only. Never store brief text, quiz answers, or visitor identifiers.
(()=>{
  const root=document.documentElement,controls=document.querySelector('.theme-controls');
  if(!controls)return;
  const toggle=document.querySelector('#theme-toggle'),auto=document.querySelector('#theme-auto'),status=document.querySelector('#theme-status');
  const media=window.matchMedia('(prefers-color-scheme: dark)');
  let preference=root.dataset.themePreference||'system';
  function apply(announce=false){
    const actual=preference==='system'?(media.matches?'dark':'light'):preference;
    root.dataset.theme=actual;root.dataset.themePreference=preference;
    toggle.setAttribute('aria-checked',String(actual==='dark'));
    toggle.title=actual==='dark'?'Switch to light mode':'Switch to dark mode';
    auto.setAttribute('aria-pressed',String(preference==='system'));
    if(announce)status.textContent=preference==='system'?`Following your device: ${actual} mode.`:`${actual==='dark'?'Dark':'Light'} mode selected. Choose Auto to follow your device.`;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',actual==='dark'?'#0d1a2a':'#17324d');
  }
  function save(){try{if(preference==='system')localStorage.removeItem('nos-theme');else localStorage.setItem('nos-theme',preference);}catch{}apply(true);}
  toggle.addEventListener('click',()=>{preference=root.dataset.theme==='dark'?'light':'dark';save();});
  auto.addEventListener('click',()=>{preference='system';save();});
  media.addEventListener('change',()=>{if(preference==='system')apply();});
  window.addEventListener('storage',event=>{if(event.key==='nos-theme'){preference=['light','dark'].includes(event.newValue)?event.newValue:'system';apply();}});
  controls.hidden=false;apply();
})();
const languageMenu=document.querySelector('.language-menu');
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&languageMenu?.open){languageMenu.open=false;languageMenu.querySelector('summary').focus();}});
document.addEventListener('click',event=>{if(languageMenu?.open&&!languageMenu.contains(event.target))languageMenu.open=false;});
