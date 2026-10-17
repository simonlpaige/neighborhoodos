import {load} from 'cheerio';
// Translation providers receive a public reading copy, never a resident's form state.
export function readingCopy(html,route){
  const $=load(html);
  $('script,iframe,object,embed,.site-tools,.directory-controls,#resource-count,#resource-empty,.brief-out,.brief-builder-form').remove();
  $('form').each((_,el)=>$(el).replaceWith($(el).html()));
  $('button,input,select,textarea').remove();
  $('label').each((_,el)=>$(el).replaceWith(`<p>${$(el).html()}</p>`));
  $('[onclick],[onsubmit],[contenteditable]').removeAttr('onclick').removeAttr('onsubmit').removeAttr('contenteditable');
  $('meta[name=robots]').remove();$('head').append('<meta name="robots" content="noindex,follow">');
  $('main').prepend('<div class="container translation-reading-notice"><p><strong>Public reading copy.</strong> Automatic translation is for reading. To use private tools, return to your original NeighborhoodOS tab. No personal answers are included in this copy.</p></div>');
  if(route==='/'||route==='/brief/')$('#brief .brief-grid').replaceWith('<p class="notice">To make a private problem brief, return to your original NeighborhoodOS tab. Write down the problem, who can fix it, the public evidence, and the next step.</p>');
  $('a[href]').each((_,el)=>{const ref=$(el).attr('href');if(!ref||/^(mailto:|tel:|#)/i.test(ref))return;
    const u=new URL(ref,'https://neighborhoodos.org'+route);
    if(u.origin!=='https://neighborhoodos.org'||!u.pathname.endsWith('/')||u.pathname.startsWith('/reading/'))return;
    $(el).attr('href','/reading'+(u.pathname==='/learn/es/'?'/learn/':u.pathname)+u.hash);
  });
  return $.html().replace(/[ \t]+\n/g,'\n')+'\n';
}
