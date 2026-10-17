// Language priorities: KCMO Language Access Office presentation, Ordinance 240165.
// Collective language categories are not represented as individual-language ranks.
export const translationLanguages=[
  {code:'es',name:'Español',english:'Spanish'},
  {code:'zh-CN',name:'中文（简体）',english:'Chinese (Simplified)'},
  {code:'vi',name:'Tiếng Việt',english:'Vietnamese'},
  {code:'ar',name:'العربية',english:'Arabic',dir:'rtl'},
  {code:'fr',name:'Français',english:'French'}
];
export function readingRoute(route){
  const redirects={'/local/':'/neighborhoods/linwood/','/pilot/':'/guide/','/launch.html':'/guide/','/404.html':'/','/learn/es/':'/learn/'};
  return '/reading'+(redirects[route]||route);
}
export function translationUrl(route,code){
  if(!translationLanguages.some(l=>l.code===code))throw Error('Unsupported translation language');
  const u=new URL('https://translate.google.com/translate');
  u.searchParams.set('sl','en');u.searchParams.set('tl',code);
  u.searchParams.set('u','https://neighborhoodos.org'+readingRoute(route));
  return u.href;
}
export function siteTools(route){
  return `<div class="site-tools"><details class="language-menu"><summary><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-5 5-5 13 0 18 5-5 5-13 0-18Z"/></svg><span>Translate</span></summary><div class="language-options"><p class="language-heading">Read this page in</p><ul>${translationLanguages.map(l=>`<li><a href="${translationUrl(route,l.code).replaceAll('&','&amp;')}" target="_blank" rel="noopener noreferrer" lang="${l.code==='zh-CN'?'zh-Hans':l.code}"${l.dir?' dir="rtl"':''} aria-label="${l.name} ${l.english}: automatic translation, opens in a new tab">${l.name} <span lang="en" dir="ltr">${l.english}</span></a></li>`).join('')}</ul><p class="language-note">Automatic translation opens in Google Translate. Private forms stay in your original tab.</p><a class="language-help" href="/language-help/">About translation & language choices</a></div></details><div class="theme-controls" aria-label="Color appearance" hidden><button type="button" id="theme-toggle" class="theme-toggle" role="switch" aria-checked="false" aria-label="Dark mode" title="Switch between light and dark"><span class="theme-track" aria-hidden="true"><svg class="theme-sun" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/></svg><svg class="theme-moon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z"/></svg><span class="theme-thumb"></span></span></button><button type="button" id="theme-auto" class="theme-auto" aria-pressed="true" title="Follow your device’s light or dark appearance">Auto</button><span class="visually-hidden" id="theme-status" role="status" aria-live="polite"></span></div></div>`;
}
// Run before styles paint. Storage is optional; privacy-mode failures are harmless.
export const themeInit=`(function(){var preference='system';try{var saved=localStorage.getItem('nos-theme');if(saved==='light'||saved==='dark')preference=saved;}catch(e){}var dark=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.dataset.theme=preference==='system'?(dark?'dark':'light'):preference;document.documentElement.dataset.themePreference=preference;})();`;
