// Reads one KC Digital Drive event page's text. KCDD uses two layouts:
// "Event Date: December 1st, 2026 Time: ... Location: ... Admission: ..." and
// "When: Wednesday, December 9th @ 3:00-5:00 p.m. Where: ... Parking directions: ...".
// Returns {startDate, location}, or null when no date can be read, so one odd page never stops the refresh.
const MONTHS=['january','february','march','april','may','june','july','august','september','october','november','december'];
const iso=(y,m,d)=>`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
export function parseEventDetail(text,checked){
  const raw=text.match(/(?:Event Date|When):\s*(.+?)(?=Time:|Where:|Location:|Admission:|Parking|$)/i)?.[1];
  const m=raw?.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:st|nd|rd|th)?\b(?:,?\s*(\d{4}))?/i);
  if(!m)return null;
  const month=MONTHS.indexOf(m[1].toLowerCase()),day=Number(m[2]);
  let year=m[3]?Number(m[3]):null;
  if(!year){ // No year printed: take the year that puts the date nearest the check date.
    const base=Number(checked.slice(0,4)),now=Date.parse(checked);
    year=[base-1,base,base+1].reduce((a,b)=>Math.abs(Date.UTC(b,month,day)-now)<Math.abs(Date.UTC(a,month,day)-now)?b:a);
  }
  const d=new Date(Date.UTC(year,month,day));
  if(d.getUTCMonth()!==month||d.getUTCDate()!==day)return null;
  const location=text.match(/(?:Location|Where):\s*(.+?)(?=Admission:|Parking|Time:|When:|$)/i)?.[1]?.trim()||'Check organizer’s listing';
  return {startDate:iso(year,month,day),location};
}
