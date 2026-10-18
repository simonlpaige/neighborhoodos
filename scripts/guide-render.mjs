import MarkdownIt from 'markdown-it';
import {load} from 'cheerio';
import path from 'node:path';
const md=new MarkdownIt({html:false,linkify:true});
export const manuals={
 'Level-1-Safe-AI-User.md':'manual-safe-ai',
 'Level-2-Problem-Framer.md':'manual-problem-framing',
 'Level-3-Tool-Builder.md':'manual-tool-building',
 'Civic-Data-Ingest-Guide.md':'manual-public-data'
};
export function guideSummary(markdown){const $=load(md.render(markdown));return $('p').first().text().replace(/\s+/g,' ').trim();}
export function renderGuide(markdown,{titles,source='wiki'}={}){
 const $=load(md.render(markdown),null,false);
 const used=new Map();
 $('h2,h3,h4').each((_,e)=>{const base=$(e).text().toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu,'').trim().replace(/\s+/g,'-');const n=used.get(base)||0;used.set(base,n+1);$(e).attr('id',base+(n?'-'+n:''));});
 $('a[href]').each((_,e)=>{
  const href=$(e).attr('href');if(/^(https?:|mailto:|tel:|#|\/)/.test(href))return;
  const [file,hash]=href.split('#');const name=path.posix.basename(file);
  if(file.endsWith('.md')){
   const route=manuals[name]||((titles||{})[name]?name.replace(/\.md$/,'').toLowerCase():null);
   $(e).attr('href',route?'/guide/'+route+'/'+(hash?'#'+hash:''):'https://github.com/simonlpaige/neighborhoodos/blob/main/'+path.posix.normalize(source+'/'+file)+(hash?'#'+hash:''));
  }else if(file==='../LICENSE')$(e).attr('href','https://github.com/simonlpaige/neighborhoodos/blob/main/LICENSE');
 });
 $('table').wrap('<div class="table-wrap"></div>');
 return $.html();
}
