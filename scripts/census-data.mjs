// Pure helpers for the census snapshot. Only area-wide totals leave this module.
function inRing(x,y,ring){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const [xi,yi]=ring[i],[xj,yj]=ring[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;}return inside;}
const inPolygon=(x,y,polygon)=>inRing(x,y,polygon[0])&&!polygon.slice(1).some(hole=>inRing(x,y,hole));
const polygonsOf=g=>g.type==='Polygon'?[g.coordinates]:g.coordinates;
// Share of a tract that falls inside the area, estimated on an even grid of sample points.
export function tractShare(geometry,areaPolygons,steps=60){
  const tract=polygonsOf(geometry),points=tract.flatMap(p=>p[0]);
  const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
  let total=0,inside=0;
  for(let i=0;i<steps;i++)for(let j=0;j<steps;j++){const x=x0+(i+.5)*(x1-x0)/steps,y=y0+(j+.5)*(y1-y0)/steps;if(!tract.some(p=>inPolygon(x,y,p)))continue;total++;if(areaPolygons.some(p=>inPolygon(x,y,p)))inside++;}
  return {inside:total?inside/total:0};
}
const languages=[['C16001003','Spanish'],['C16001006','French, Haitian, or Cajun'],['C16001009','German or other West Germanic'],['C16001012','Russian, Polish, or other Slavic'],['C16001015','Other Indo-European'],['C16001018','Korean'],['C16001021','Chinese'],['C16001024','Vietnamese'],['C16001027','Tagalog'],['C16001030','Other Asian and Pacific Island'],['C16001033','Arabic'],['C16001036','Other and unspecified']];
const pad=n=>String(n).padStart(3,'0');
const cols=(table,numbers)=>numbers.map(n=>table+pad(n));
// rows: one API result per tract; weights: the share of each tract inside the area (0 to 1).
export function combine(rows,weights=rows.map(()=>1)){
  const sum=(table,ids)=>{let estimate=0,variance=0;rows.forEach((row,i)=>{for(const id of ids){estimate+=weights[i]*(row[table].estimate[id]||0);variance+=(weights[i]*(row[table].error[id]||0))**2;}});return {estimate:Math.round(estimate),margin:Math.round(Math.sqrt(variance))};};
  const population=sum('B01003',['B01003001']);
  const under18=sum('B01001',cols('B01001',[3,4,5,6,27,28,29,30])),over65=sum('B01001',cols('B01001',[20,21,22,23,24,25,44,45,46,47,48,49]));
  const households=sum('B11001',['B11001001']),owners=sum('B25003',['B25003002']),renters=sum('B25003',['B25003003']);
  const speakers=sum('C16001',['C16001001']),englishOnly=sum('C16001',['C16001002']);
  const internetHouseholds=sum('B28002',['B28002001']),noInternet=sum('B28002',['B28002013']);
  return {population,age:{under18,adults:{estimate:population.estimate-under18.estimate-over65.estimate},over65},households,housing:{owners,renters},
    languages:{base:speakers,englishOnly,other:languages.map(([id,name])=>({name,...sum('C16001',[id]),limitedEnglish:sum('C16001',['C16001'+pad(Number(id.slice(-3))+2)]).estimate})).filter(l=>l.estimate>0).sort((a,b)=>b.estimate-a.estimate)},
    internet:{households:internetHouseholds,none:noInternet}};
}
