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
