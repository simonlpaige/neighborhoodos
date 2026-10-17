import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {load} from 'cheerio';
const checked=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const rows=[
['KC Digital Drive at LAMP','Digital help','Linwood','Digital skills, a computer lab, and community help at the Digital Services & Support Center.','https://www.kcdigitaldrive.org/project/dsslampcampus/'],
['KC Digital Drive events','Digital help','Kansas City','Find current classes and registration details on the organizer’s calendar.','https://www.kcdigitaldrive.org/events/'],
['Kansas City Public Library','Digital help','Kansas City','Library services and help finding technology resources.','https://kclibrary.org/'],
['PCs for People','Digital help','Kansas City','Learn about affordable computers and internet; check current eligibility with the provider.','https://www.pcsforpeople.org/'],
['Per Scholas Kansas City','Digital help','Kansas City','Technology training and career support.','https://perscholas.org/locations/kansas-city/'],
['Goodwill of Western Missouri & Eastern Kansas','Digital help','Kansas City','Employment, education, and community services.','https://www.mokangoodwill.org/'],
['Front Porch Alliance','Community services','Linwood','Community programs and family support.','https://frontporchalliance.org/'],
['reStart','Community services','Kansas City','Housing and services for people experiencing homelessness.','https://www.restartinc.org/'],
['ReDiscover','Community services','Kansas City','Find the organization’s current behavioral health services and access information.','https://www.rediscovermh.org/'],
['United Way 211','Community services','Kansas City','Find local services through the regional 211 resource directory.','https://www.uwgkc.org/211'],
['Reusefull','Community services','Kansas City','Connect useful donated goods with local nonprofit organizations.','https://www.reusefull.org/'],
['Habitat for Humanity of Kansas City','Housing','Kansas City','Check current homeownership and home repair programs and eligibility.','https://habitatkc.org/'],
['KCMO Healthy Homes','Housing','Kansas City','Official city information about rental housing inspections and concerns.','https://www.kcmo.gov/city-hall/departments/health/healthy-homes-rental-inspection-program'],
['KCMO Land Bank','Housing','Kansas City','Official information about Land Bank properties and programs.','https://www.kcmo.gov/city-hall/housing/landbank'],
['Legal Aid of Western Missouri','Housing','Kansas City','Check eligibility and intake for civil legal help.','https://lawmo.org/'],
['KC Tenants','Housing','Kansas City','Tenant organizing and published tenant resources.','https://kctenants.org/'],
['KC SourceLink','Small business','Kansas City','Find business assistance through an established local resource directory.','https://www.kcsourcelink.com/'],
['Missouri SBDC at UMKC','Small business','Kansas City','Business counseling and training; use the provider’s current booking information.','https://sbdc.umkc.edu/'],
['Helzberg Entrepreneurial Mentoring Program','Small business','Kansas City','Business-owner mentoring; confirm the application process with HEMP.','https://www.hempkc.org/'],
['UMKC Center for Neighborhoods','Neighborhood associations','Kansas City','Neighborhood profiles, leadership learning, and community information.','https://cfn.umkc.edu/'],
['Ivanhoe Neighborhood Council','Neighborhood associations','Linwood','Find current neighborhood programs and association information.','https://incthrives.org/'],
['Key Coalition Neighborhood Association','Neighborhood associations','Linwood','Use the Center for Neighborhoods profile to find association information; confirm current contacts.','https://cfn.umkc.edu/by-neighborhood/'],
['Boston Heights and Mount Hope','Neighborhood associations','Linwood','Neighborhood profile and association information.','https://cfn.umkc.edu/boston-heights-mount-hope/'],
['Santa Fe Area Council','Neighborhood associations','Linwood','Neighborhood profile and association information.','https://cfn.umkc.edu/santa-fe-area-council/'],
['Beacon Hill–McFeders','Neighborhood associations','Linwood','Neighborhood profile and association information.','https://cfn.umkc.edu/beacon-hill/'],
['Wendell Phillips','Neighborhood associations','Linwood','Neighborhood profile; confirm contact and meeting details with the association.','https://cfn.umkc.edu/wendell-phillips-neighborhood-association/'],
['Washington Wheatley','Neighborhood associations','Linwood','Neighborhood profile and association information.','https://cfn.umkc.edu/washington-wheatley/'],
['Squier Park Neighborhood Association','Neighborhood associations','Linwood','Association news and neighborhood information.','https://squierparkkc.org/'],
['Hyde Park Neighborhood Association','Neighborhood associations','Linwood','Association news, membership, and neighborhood information.','https://www.hydeparkkc.org/'],
['Paseo Heights','Neighborhood associations','Linwood','Find the association through UMKC’s neighborhood profile index.','https://cfn.umkc.edu/by-neighborhood/'],
['United Neighborhood Association','Neighborhood associations','Linwood','Find the association through UMKC’s neighborhood profile index.','https://cfn.umkc.edu/by-neighborhood/'],
['Oak Park','Neighborhood associations','Linwood','Find the association through UMKC’s neighborhood profile index.','https://cfn.umkc.edu/by-neighborhood/'],
['Palestine Neighborhood Development Corporation','Neighborhood associations','Linwood','Use the profile index to find current neighborhood information.','https://cfn.umkc.edu/by-neighborhood/'],
['Palestine Outreach Center','Neighborhood associations','Linwood','Use the profile index to find current neighborhood information.','https://cfn.umkc.edu/by-neighborhood/'],
['Center City','Neighborhood associations','Linwood','Use the profile index to find current neighborhood information.','https://cfn.umkc.edu/by-neighborhood/'],
['Longfellow Community Association','Neighborhood associations','Linwood','Use the profile index to find current neighborhood information.','https://cfn.umkc.edu/by-neighborhood/'],
['Freymons Addition','Neighborhood associations','Linwood','Use the profile index to find current neighborhood information.','https://cfn.umkc.edu/by-neighborhood/'],
['Lykins Neighborhood Association','Neighborhood associations','Lykins / Northeast','Association information and local neighborhood programs.','https://lykinsneighborhoodassociation.org/lykins-neighborhood'],
['Hickman Mills United Neighborhoods','Neighborhood associations','Hickman Mills','Neighborhood profile; confirm current meeting details with the organization.','https://cfn.umkc.edu/hickman-mills-united-neighborhoods/'],
['Hickman Mills Community Empowerment Center','Community services','Hickman Mills','Community programs and local event information.','https://www.hickmanmillscec.org/'],
['KCMO 311','Government','Kansas City','Report a city service issue or find a route to the right city department.','https://www.kcmo.gov/talk-to-us/mykcmo'],
['Kansas City Council','Government','Kansas City','Official legislation, agendas, and meeting records.','https://clerk.kcmo.gov/'],
['Jackson County Legislature','Government','Kansas City','Official county agendas, legislation, and meeting records.','https://jacksonco.legistar.com/'],
['Kansas City Documenters','Government','Kansas City','Human-reported public-meeting notes and information about becoming a Documenter.','https://kansascity.documenters.org/'],
['DataKC','Government','Kansas City','City open datasets, documentation, and public sources.','https://data.kcmo.org/']
];
const resources=[];
for(const [name,category,neighborhoods,description,url] of rows){
  let sourceStatus='Needs confirmation',pageTitle=null;
  try{const r=await fetch(url,{signal:AbortSignal.timeout(12000)});const html=await r.text();const $=load(html);pageTitle=$('title').text().trim();if(r.ok&&!/not found|404/i.test(pageTitle))sourceStatus='Source available';}catch{}
  resources.push({id:resources.length+1,name,category,neighborhoods,description,url,source:url,lastChecked:checked,sourceStatus,pageTitle,cost:'Confirm with provider',hours:'See provider’s current information',languages:'Ask provider',howToGetHelp:'Use the source link for current intake or contact details.',steward:'KCDD data steward role; assignment pending'});
}
await writeFile('data/resources.json',JSON.stringify(resources,null,2)+'\n');
console.log(`${resources.length} resources; ${resources.filter(r=>r.sourceStatus==='Source available').length} source pages available. Unconfirmed sources visibly labeled.`);
await import('./refresh-calendar.mjs');
// Fonts served from this domain; retain their open font licenses.
await mkdir('assets/fonts',{recursive:true});
for(const [family,file] of [['Barlow+Condensed:wght@600','barlow-condensed-600'],['Atkinson+Hyperlegible:wght@400','atkinson-400'],['Atkinson+Hyperlegible:wght@700','atkinson-700']]){
  const css=await (await fetch('https://fonts.googleapis.com/css2?family='+family+'&display=swap',{headers:{'User-Agent':'Mozilla/5.0'}})).text();
  const url=css.match(/url\((https:[^)]+)\)/)?.[1];if(!url)throw Error('Font URL missing');await writeFile(`assets/fonts/${file}.ttf`,Buffer.from(await (await fetch(url)).arrayBuffer()));
}
for(const [name,url] of [['Barlow-OFL.txt','https://raw.githubusercontent.com/google/fonts/main/ofl/barlowcondensed/OFL.txt'],['Atkinson-OFL.txt','https://raw.githubusercontent.com/google/fonts/main/ofl/atkinsonhyperlegible/OFL.txt']]){const r=await fetch(url);if(!r.ok)throw Error('Font license unavailable');await writeFile('assets/fonts/'+name,await r.text());}
