// All resident input is local. No analytics, outbound forms, or background trackers.
const search=document.querySelector('#resource-search');
if(search){const category=document.querySelector('#resource-category'),area=document.querySelector('#resource-area'),items=[...document.querySelectorAll('.resource')],result=document.querySelector('#resource-count');
  const filter=()=>{let count=0;const term=search.value.trim().toLowerCase();for(const el of items){const show=(!term||el.textContent.toLowerCase().includes(term))&&(!category.value||el.dataset.category===category.value)&&(!area.value||el.dataset.area===area.value||el.dataset.area==='Kansas City');el.hidden=!show;if(show)count++;}result.textContent=`${count} resource${count===1?'':'s'} shown.`;document.querySelector('#resource-empty').hidden=count!==0;};
  for(const el of [search,category,area])el.addEventListener('input',filter);
}
for(const button of document.querySelectorAll('[data-window-print]'))button.addEventListener('click',()=>window.print());
window.addEventListener('afterprint',()=>document.body.classList.remove('print-brief'));
for(const el of document.querySelectorAll('[data-snapshot-date]')){const days=(Date.now()-new Date(el.dataset.snapshotDate+'T23:59:59Z'))/86400000;if(days>7){el.textContent='City source data is more than seven days behind. Check the official source for current information.';el.classList.add('warning');}}
const chicagoToday=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
for(const el of document.querySelectorAll('[data-event-date]'))if(el.dataset.eventDate.slice(0,10)<chicagoToday)el.hidden=true;
const spanishQuiz=document.querySelector('#spanish-quiz');
if(spanishQuiz)spanishQuiz.addEventListener('submit',event=>{event.preventDefault();let correct=0,answered=0;for(const field of spanishQuiz.querySelectorAll('fieldset')){const choice=field.querySelector('input:checked');const feedback=field.querySelector('[data-feedback]');if(choice)answered++;if(choice?.value==='correct')correct++;feedback.textContent=!choice?'Elige una respuesta.':choice.value==='correct'?'Correcto. Comprueba la información y protege tus datos.':'Vuelve a leer el consejo. No te apresures ni compartas datos privados.';}document.querySelector('#spanish-score').textContent=answered<3?'Contesta las tres preguntas.':`${correct} de 3 respuestas correctas. Revisa los consejos y vuelve a intentarlo.`;});

/* Connect public starting points without putting resident answers in URLs or storage. */
const programMenu=document.querySelector('.program-menu');
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&programMenu?.open){programMenu.open=false;programMenu.querySelector('summary').focus();}});
document.addEventListener('click',event=>{if(programMenu?.open&&!programMenu.contains(event.target))programMenu.open=false;});
const guideSearch=document.querySelector('#guide-search');
if(guideSearch){const entries=[...document.querySelectorAll('#guide-entries .guide-entry')];const filter=()=>{let count=0;for(const item of entries){item.hidden=!item.textContent.toLowerCase().includes(guideSearch.value.trim().toLowerCase());if(!item.hidden)count++;}document.querySelector('#guide-count').textContent=count?count+' guide pages shown.':'No matching guide pages. Try a broader term or clear the search.';};guideSearch.addEventListener('input',filter);filter();}
if(search){const params=new URLSearchParams(location.hash.slice(1)),category=document.querySelector('#resource-category');const requested=params.get('category');if([...category.options].some(o=>o.value===requested)){category.value=requested;category.dispatchEvent(new Event('input'));}}
const startingPoint=document.querySelector('#brief-start');
if(startingPoint){
 const fields=['what','who','evidence','next'].map(k=>document.querySelector('#b-'+k));
 const notice=document.querySelector('#brief-context-status'),help=document.querySelector('#brief-help');
 const apply=()=>{const o=startingPoint.selectedOptions[0];if(!o?.dataset.evidence){notice.textContent='Choose a public pattern, or write your own question below.';return;}
 if(fields.some(f=>f.value.trim())){notice.textContent='Your current answers are still here. Copy or print them, then use Clear before loading another starting point.';return;}
 fields[0].value='A question about '+o.dataset.topic.toLowerCase()+' in '+o.dataset.area+'. Add the specific public issue you want to understand.';
 fields[1].value='The city (311, public works, codes)';
 fields[2].value=o.dataset.evidence;
 fields[3].value='Confirm the responsible office and check the current record. Choose who will contact the office and a date to check back.';
 fields.forEach(f=>f.dispatchEvent(new Event('input')));
 help.href='/resources/#category='+encodeURIComponent(o.dataset.category);
 notice.textContent='Public starting point added. Edit it to fit your question; the area totals do not establish any individual case.';
 };
 document.querySelector('#brief-use-context').addEventListener('click',apply);
 const requested=new URLSearchParams(location.hash.slice(1)).get('context');
 if(requested&&[...startingPoint.options].some(o=>o.value===requested)){startingPoint.value=requested;apply();}
 document.querySelector('#b-clear').addEventListener('click',()=>{help.href='/resources/';notice.textContent='Answers cleared. Choose another starting point or write your own.';});
}
