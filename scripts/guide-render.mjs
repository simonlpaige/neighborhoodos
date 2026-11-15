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

export const guideBuckets=[
 ['Start here','What the program is, who it is for, and how the pieces fit.',['Start-Here-for-Partners.md','What-NeighborhoodOS-Is.md','Program-Design.md','Principles.md','Partners.md','Home.md','FAQ.md','Glossary.md']],
 ['Teach it','Workshop manuals, session plans, and what a facilitator needs in the room.',['Level-1-Safe-AI-User.md','Level-2-Problem-Framer.md','Level-3-Tool-Builder.md','Session-Plans.md','Facilitator-Guide.md','Roles-and-Staffing.md','Recruitment-and-Outreach.md','Launching-a-New-Neighborhood.md','Building-a-Tool.md']],
 ['Data','Where the public numbers come from and how the technical parts work.',['Civic-Data-Ingest-Guide.md','Data-Sources.md','Technical-Architecture.md','Developer-Setup.md','Community-AI-Hub-Guide.md','Later-If-Residents-Want-It.md']],
 ['Safety and privacy','The rules that protect residents, and language access.',['Safety-Doctrine.md','Threat-Model.md','Language-Access.md']],
 ['Funding and handoff','Budgets, grants, measurement, agreements, and reuse.',['Grant-Kit.md','Funding-Research.md','Budget-and-Hardware.md','Evaluation-and-Metrics.md','Partner-MOU.md','Handoff-and-Licensing.md','Known-Gaps-and-Roadmap.md']]
];
