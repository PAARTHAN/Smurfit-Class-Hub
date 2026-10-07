window.HUB_STANDALONE=true;
(function(){
/* ================= config ================= */
const TYPES={
  assignment:{label:"Assignments",one:"Assignment",kind:"deadline",subject:true,startLabel:"Released",endLabel:"Due",timeLabel:"Due time",tagLabel:"Submit via",verb:"Due",placeholder:"e.g. TLADS group report"},
  exam:{label:"Exams",one:"Exam",kind:"span",subject:true,startLabel:"Date",endLabel:"Last day (if several)",timeLabel:"Start time",tagLabel:"Room",verb:"",placeholder:"e.g. In-class quiz 1"},
  event:{label:"Events",one:"Event",kind:"span",startLabel:"Starts",endLabel:"Ends (if multi-day)",timeLabel:"Start time",tagLabel:"Venue",verb:"",placeholder:"e.g. Smurfit careers fair"},
  job:{label:"Jobs",one:"Job",kind:"deadline",startLabel:"Opens",endLabel:"Closes",timeLabel:"Closing time",tagLabel:"Company",verb:"Closes",placeholder:"e.g. Accenture Analytics Graduate Programme"},
  update:{label:"Class updates",one:"Update",kind:"none",subject:true,tagLabel:"Room",placeholder:"e.g. Thursday's lecture moved"}
};
const DATED=["assignment","exam","event","job"];
const DEFAULT_POLICY={assignment:"ambassadors",exam:"ambassadors",update:"ambassadors",event:"everyone",job:"everyone"};
const KNOWN_SUBJECTS=["MIS41150 Introduction to Business Analytics","MIS41110 Programming for Analytics"];
const CHANNELS=[["general","General"],["jobs","Jobs & careers"],["group-work","Group work"],["social","Social"]];
const MAXLANES=3;
const IC={
  home:'<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  hangouts:'<path d="M4 8h13v5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6z"/><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 3v2M12 3v2"/>',
  games:'<rect x="2" y="7" width="20" height="11" rx="5.5"/><path d="M7 10.5v4M5 12.5h4"/><circle cx="15.5" cy="11.5" r=".6"/><circle cx="18" cy="13.5" r=".6"/>',
  chat:'<path d="M4 5h16v11H10l-6 4z"/>',
  updates:'<path d="M3 10v4h3l7 4V6l-7 4z"/><path d="M17 8.5a5 5 0 0 1 0 7"/>',
  class:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14a6 6 0 0 1 3.5 6"/>',
  trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M9 17h6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  book:'<path d="M4 19V6a2 2 0 0 1 2-2h12v15H6a2 2 0 0 0-2 2"/><path d="M8 8h6"/>',
  exam:'<path d="M9 4h6l1 2h3v15H5V6h3z"/><path d="M9 12l2 2 4-4"/>',
  event:'<path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19l1-5.8L3.5 9.2l5.9-.9z"/>',
  job:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 12h18"/>',
  pin:'<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  poll:'<path d="M5 20V10M12 20V4M19 20v-7"/>',
  chatbub:'<path d="M4 5h16v11H10l-6 4z"/><path d="M8 9h8M8 12h5"/>',
  join:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M19 8v6M16 11h6"/>'
};
const MASCOT=`<svg class="mascot" viewBox="0 0 120 120" aria-hidden="true">
  <rect x="14" y="22" width="92" height="84" rx="20" fill="#fff" stroke="#1A1033" stroke-width="4"/>
  <path d="M14 46V42a20 20 0 0 1 20-20h52a20 20 0 0 1 20 20v4z" fill="#6C3CF0" stroke="#1A1033" stroke-width="4" stroke-linejoin="round"/>
  <rect x="34" y="10" width="10" height="22" rx="5" fill="#FF4D6D" stroke="#1A1033" stroke-width="4"/><rect x="76" y="10" width="10" height="22" rx="5" fill="#FF4D6D" stroke="#1A1033" stroke-width="4"/>
  <circle cx="44" cy="68" r="7" fill="#1A1033"/><circle cx="76" cy="68" r="7" fill="#1A1033"/><circle cx="46.5" cy="65.5" r="2.4" fill="#fff"/><circle cx="78.5" cy="65.5" r="2.4" fill="#fff"/>
  <ellipse cx="33" cy="80" rx="6" ry="4" fill="#FF8FB1"/><ellipse cx="87" cy="80" rx="6" ry="4" fill="#FF8FB1"/>
  <path d="M50 82q10 10 20 0" fill="none" stroke="#1A1033" stroke-width="4" stroke-linecap="round"/>
</svg>`;
const icon=(k,cls="i")=>`<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${IC[k]||""}</svg>`;
const NAV=[["home","Home"],["calendar","Calendar"],["updates","Updates"],["hangouts","Hangouts"],["games","Games"],["chat","Chat"]];
const NAV_DESK=[["class","Class & ranks"]];
const MAX_AMB=5;
const TITLES={home:["Class Hub","UCD Smurfit · MSc Business Analytics"],calendar:["Calendar","What's due, what's on"],hangouts:["Hangouts","Study buddies, plans and polls"],
  games:["Games","Ten ways to procrastinate together"],chat:["Chat","Be nice, it's a small class"],updates:["Class updates","Straight from the class"],class:["Class","Leaderboard, people and roles"]};

/* ================= state & helpers ================= */
const S={posts:[],msgs:[],members:[],roster:[],hang:[],games:[],db:null,user:null,me:null,canWrite:true,owner:false,profiles:{},config:null,
  screen:"home",prev:"home",cat:"all",mode:"calendar",month:null,sel:null,channel:"general",ptype:"assignment",editing:null,subj:"",
  hangTab:"plans",hfilter:{study:true,outing:true},hkind:"study",classTab:"leaders",lbPeriod:"week",gameOpen:null,loaded:false};
const HOOKS=[];
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pad=n=>String(n).padStart(2,"0");
const ymd=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const parse=s=>{const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)};
const addDays=(s,n)=>{const d=parse(s);d.setDate(d.getDate()+n);return ymd(d)};
const today=()=>ymd(new Date());
const nowHM=()=>{const d=new Date();return pad(d.getHours())+":"+pad(d.getMinutes())};
const MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
const daysUntil=s=>Math.round((parse(s)-parse(today()))/864e5);
const rel=s=>{const n=daysUntil(s);return n===0?"today":n===1?"tomorrow":n<0?(-n)+"d ago":"in "+n+"d"};
const fmt=s=>{const d=parse(s);return d.getDate()+" "+MON[d.getMonth()]};
const safeUrl=u=>/^https?:\/\//i.test(u||"")?u:"";
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const t0=new Date();S.month=new Date(t0.getFullYear(),t0.getMonth(),1);S.sel=today();
{const m=store.get("hub.mode");if(m==="list")S.mode="list";const c=store.get("hub.cat");if(c&&(c==="all"||TYPES[c]))S.cat=c;}
{const h=(location.hash||"").slice(1);if(TITLES[h])S.screen=h;else{const s=store.get("hub.screen");if(TITLES[s]&&s!=="class"&&s!=="updates")S.screen=s}}

const ambassadors=()=>(S.config&&S.config.ambassadors)||[];
const isAmb=uid=>!!uid&&ambassadors().includes(uid);
const isMod=()=>S.owner||isAmb(S.me);
const policy=k=>(S.config&&S.config.policy&&S.config.policy[k])||DEFAULT_POLICY[k]||"everyone";
const canPost=k=>!!S.db&&S.canWrite;
const canEditPost=p=>S.canWrite&&(isMod()||(S.me&&p.authorId===S.me));
S.bans=[];
const isBanned=uid=>!!uid&&S.bans.some(b=>b.id===uid);
const ownerIdOf=()=>S.config&&S.config.ownerId;
/* WhatsApp-style: the developer can remove anyone but themselves; ambassadors can remove regular members only */
const canRemove=uid=>!!uid&&S.canWrite&&uid!==S.me&&uid!==ownerIdOf()&&!isBanned(uid)&&(S.owner||(isAmb(S.me)&&!isAmb(uid)));
const HEART='<svg class="heart" viewBox="0 0 24 24" aria-label="love"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.1 0 3.6 1.1 5.2 3 1.6-1.9 3.1-3 5.2-3 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z"/></svg>';
const CREDIT=`<p class="credit">Developed with ${HEART} by Paarthan</p>`;
const roleBadge=uid=>uid&&S.config&&S.config.ownerId===uid?'<span class="role dev" title="Built this app"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 20.9l1.6-7L2 9.2l7.1-.6z"/></svg>Developer</span>':isAmb(uid)?'<span class="role">Ambassador</span>':"";
const subjShort=s=>{const m=/^([A-Z]{2,5}\s?\d{3,6})/.exec(s||"");return m?m[1]:(s||"")};
function subjects(){const set=new Set(KNOWN_SUBJECTS);S.posts.forEach(p=>p.subject&&set.add(p.subject));return [...set].sort()}

function norm(p){
  if(p.type==="deadline")p.type="assignment";
  if(p.date&&!p.start&&!p.end)p.start=p.date;
  const k=TYPES[p.type]&&TYPES[p.type].kind;
  if(k==="deadline"){p.end=p.end||p.start;p.start=p.start||p.end}else if(k==="span"){p.start=p.start||p.end;p.end=p.end||p.start}
  if(p.start&&p.end&&p.start>p.end){const t=p.start;p.start=p.end;p.end=t}
  return p;
}
const anchor=p=>TYPES[p.type].kind==="deadline"?p.end:p.start;
const isPast=p=>p.end&&p.end<today();

function toast(m){const t=$("toast");t.textContent=m;t.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(()=>t.hidden=true,2600)}
const APP_VERSION="1.1.0";
function member(uid){return S.members.find(x=>x.id===uid)||null}
function nameOf(uid){if(!uid)return "Class Hub";const m=member(uid);return (m&&m.displayName)||(S.profiles[uid]&&S.profiles[uid].name)||"Classmate"}
function emailOf(uid){const m=member(uid);return (m&&m.email)||(S.profiles[uid]&&S.profiles[uid].email)||""}
function personLink(uid,inner){return uid?`<span class="plink" role="button" tabindex="0" aria-label="Open ${nm(uid)}'s profile" data-person="${esc(uid)}">${inner||nm(uid)}</span>`:(inner||nm(uid))}
const mailHtml=e=>esc(e).replace(/@/g,"@<wbr>").replace(/\./g,".<wbr>");
const nm=uid=>esc(nameOf(uid));
function avHtml(uid){const a=S.profiles[uid]&&S.profiles[uid].avatarUrl;return a?`<img class="av" alt="" src="${esc(a)}">`:`<span class="av" aria-hidden="true"></span>`}
function stack(ids,max=6){return `<span class="stack">${ids.slice(0,max).map(avHtml).join("")}</span>`}
let resolving=false;
function resolveNames(){
  if(!S.user||resolving)return;const ids=new Set();
  S.posts.forEach(p=>p.authorId&&ids.add(p.authorId));S.msgs.forEach(m=>m.authorId&&ids.add(m.authorId));S.members.forEach(m=>ids.add(m.id));
  S.hang.forEach(h=>{h.authorId&&ids.add(h.authorId);Object.keys(h.going||{}).forEach(i=>ids.add(i))});
  S.games.forEach(g=>Object.keys(g.players||{}).forEach(i=>ids.add(i)));if(S.me)ids.add(S.me);
  if(![...ids].some(i=>!S.profiles[i]))return;resolving=true;
  S.user.profiles([...ids]).then(ps=>{S.profiles=ps||{};resolving=false;render()}).catch(()=>{resolving=false});
}
function writeErr(err){if(err&&err.code==="permission_denied")return "You don't have permission to do that. Ask a Class Ambassador.";if(err&&err.code==="invalid_argument"){S.canWrite=false;showNotice();return "You can read this hub but not post. Ask the owner to invite you as an Editor."}
  if(err&&err.code==="quota_exceeded")return "The hub is full. Delete some old posts or messages and try again.";
  return "Couldn't save just now. Check your connection and try again.";}
function armDelete(btn,label){if(btn.dataset.armed==="1")return true;btn.dataset.armed="1";const old=btn.textContent;btn.textContent=label||"Tap again to confirm";
  setTimeout(()=>{if(btn.isConnected){btn.dataset.armed="";btn.textContent=old}},3000);return false}

/* ================= calendar links ================= */
function calWindow(p){
  const k=TYPES[p.type].kind;const plusHour=(d,t)=>{const [h,m]=t.split(":").map(Number);const e=new Date(parse(d));e.setHours(h+1,m);return {e:ymd(e),et:pad(e.getHours())+":"+pad(e.getMinutes())}};
  if(k==="deadline"){if(p.time)return Object.assign({timed:true,s:p.end,st:p.time},plusHour(p.end,p.time));return {timed:false,s:p.end,e:addDays(p.end,1)}}
  if(p.time&&p.start===p.end)return Object.assign({timed:true,s:p.start,st:p.time},plusHour(p.start,p.time));
  return {timed:false,s:p.start,e:addDays(p.end,1)};
}
const calTitle=p=>{const t=TYPES[p.type];return (t.verb?t.verb+": ":"")+(p.subject?subjShort(p.subject)+" ":"")+p.title};
function calDetails(p){const t=TYPES[p.type];const l=[];if(p.subject)l.push("Subject: "+p.subject);
  if(t.kind==="deadline"&&p.start!==p.end)l.push(t.startLabel+": "+fmt(p.start));if(p.tag)l.push(t.tagLabel+": "+p.tag);if(p.body)l.push(p.body);if(safeUrl(p.link))l.push(p.link);l.push("From the Smurfit Class Hub");return l.join("\n")}
function gcalUrl(p){const w=calWindow(p);const c=s=>s.replace(/[-:]/g,"");
  return "https://calendar.google.com/calendar/render?"+new URLSearchParams({action:"TEMPLATE",text:calTitle(p),dates:w.timed?c(w.s)+"T"+c(w.st)+"00/"+c(w.e)+"T"+c(w.et)+"00":c(w.s)+"/"+c(w.e),
    details:calDetails(p),location:p.type==="event"||p.type==="exam"?(p.tag||""):"",ctz:"Europe/Dublin"})}
function outlookUrl(p){const w=calWindow(p);const q={path:"/calendar/action/compose",rru:"addevent",subject:calTitle(p),body:calDetails(p)};
  if(w.timed){q.startdt=w.s+"T"+w.st+":00";q.enddt=w.e+"T"+w.et+":00"}else{q.startdt=w.s;q.enddt=w.e;q.allday="true"}
  if(p.type==="event"||p.type==="exam")q.location=p.tag||"";return "https://outlook.office.com/calendar/0/deeplink/compose?"+new URLSearchParams(q)}
function addCal(p){return `<details class="addcal t-${p.type}"><summary>${icon("calendar")}Add to calendar</summary><div class="menu">
  <a href="${esc(gcalUrl(p))}" target="_blank" rel="noopener">Google Calendar ↗</a><a href="${esc(outlookUrl(p))}" target="_blank" rel="noopener">Outlook / UCD Microsoft 365 ↗</a></div></details>`}
document.addEventListener("click",e=>{document.querySelectorAll("details.addcal[open]").forEach(d=>{if(!d.contains(e.target))d.open=false})});

/* ================= navigation ================= */
function badgeFor(k){if(k==="games")return liveGames().length;if(k==="hangouts")return S.hang.filter(h=>h.kind!=="poll"&&hLive(h)).length;return 0}
function renderNav(){
  const item=([k,l],desk)=>{const b=badgeFor(k);return `<button type="button" data-go="${k}" class="nv-${k} ${desk?"desk":""}" ${S.screen===k?'aria-current="page"':""}><span class="pill">${icon(k)}${b&&!desk?`<span class="badge">${b}</span>`:""}</span><span>${l}</span>${b&&desk?"":""}</button>`};
  $("nav").innerHTML=`<div class="brand"><b>Class <span>Hub</span></b><span class="prog">MSc Business Analytics</span><small>UCD Smurfit · 2026–27</small></div>
    <button type="button" class="new-desk desk-only" data-new>${icon("plus")}<span>New</span></button>
    ${NAV.map(n=>item(n,false)).join("")}<div class="sep"></div>${NAV_DESK.map(n=>item(n,true)).join("")}
    <div class="foot">${CREDIT}</div>`;
  $("nav").querySelector(".new-desk").classList.add("btn");
}
function go(k){if(!TITLES[k])return;if(k!==S.screen){S.prev=S.screen==="class"?S.prev:S.screen;S.screen=k}
  if(k!=="games")S.gameOpen=S.gameOpen&&k==="games"?S.gameOpen:S.gameOpen;store.set("hub.screen",k);try{history.replaceState(null,"","#"+k)}catch(e){}
  $("scroller").scrollTop=0;render()}
function render(){
  renderNav();
  const sc=S.screen;document.querySelectorAll("[data-screen]").forEach(s=>s.hidden=s.dataset.screen!==sc);
  const [t,sub]=TITLES[sc];const gameTitle=sc==="games"&&S.gameOpen&&S.games.find(g=>g.id===S.gameOpen);
  $("bar-title").textContent=gameTitle&&GAMES[gameTitle.kind]?GAMES[gameTitle.kind].name:t;
  if(sc==="home"&&!gameTitle)$("bar-sub").innerHTML=`<span class="prog">MSc Business Analytics</span><span class="prog-sub">UCD Smurfit · 2026–27</span>`;else $("bar-sub").textContent=gameTitle?"Live game":sub;
  $("back").hidden=!(sc==="class"||gameTitle);
  $("scroller").classList.toggle("fill",sc==="chat");
  $("fab").hidden=sc==="chat"||sc==="class"||!!gameTitle||!S.db||!S.canWrite;
  $("me-btn").innerHTML=S.me?avHtml(S.me):'<span class="av" aria-hidden="true"></span>';
  if(sc==="home")renderHome();else if(sc==="calendar")renderCalendarScreen();else if(sc==="hangouts")renderHangouts();
  else if(sc==="games")renderGames();else if(sc==="chat")renderChat();else if(sc==="updates")renderFeed();else renderClass();
}
$("nav").addEventListener("click",e=>{const b=e.target.closest("[data-go]");if(b){if(b.dataset.go==="games")S.gameOpen=null;go(b.dataset.go);return}if(e.target.closest("[data-new]"))openActions()});
$("back").onclick=()=>{if(S.screen==="games"&&S.gameOpen){S.gameOpen=null;render();return}go(S.prev||"home")};
$("me-btn").onclick=()=>{S.classTab="leaders";go("class")};
$("fab").onclick=()=>openActions();
document.addEventListener("click",e=>{const g=e.target.closest("[data-goto]");if(!g)return;const [scr,arg]=g.dataset.goto.split(":");
  if(scr==="calendar"&&arg){S.cat=arg}if(scr==="class"&&arg)S.classTab=arg;if(scr==="hangouts"&&arg)S.hangTab=arg;if(scr==="games")S.gameOpen=arg||null;go(scr)});

/* ================= action sheet ================= */
function openActions(){
  if(!S.db||!S.canWrite){toast("Ask the hub owner to invite you as an Editor to post");return}
  const a=(cls,ic,label,act,ok=true)=>`<button type="button" class="${cls}" data-action="${act}" ${ok?"":"disabled"}><span class="q-ic">${icon(ic)}</span>${label}</button>`;
  $("new-actions").innerHTML=`<div class="act-group"><span class="flabel">Calendar</span><div class="act-grid">
      ${a("t-assignment","book","Assignment","post:assignment",canPost("assignment"))}${a("t-exam","exam","Exam","post:exam",canPost("exam"))}
      ${a("t-event","event","Event","post:event",canPost("event"))}${a("t-job","job","Job","post:job",canPost("job"))}</div></div>
    <div class="act-group"><span class="flabel">Class</span><div class="act-grid">
      ${a("t-update","updates","Update","post:update",canPost("update"))}${a("t-study","book","Studying now","hg:now")}${a("t-outing","pin","Plan","hg:plan")}${a("t-poll","poll","Poll","poll")}</div></div>
    <div class="act-group"><span class="flabel">Fun</span><div class="act-grid">${a("t-games","games","Start a game","games")}${a("t-chat","chatbub","Message","chat")}</div></div>
    ${["assignment","exam","update"].some(k=>!canPost(k))?`<span class="hint">Greyed-out items are posted by Class Ambassadors.</span>`:""}`;
  $("new-overlay").hidden=false;
}
$("new-actions").addEventListener("click",e=>{const b=e.target.closest("[data-action]");if(!b||b.disabled)return;$("new-overlay").hidden=true;const [k,arg]=b.dataset.action.split(":");
  if(k==="post"){S.ptype=arg;openComposer(null)}else if(k==="hg"){if(arg==="now")openNow();else openHangout(false)}else if(k==="poll")openPoll();else if(k==="games"){S.gameOpen=null;go("games")}else if(k==="chat")go("chat")});

/* ================= home ================= */
function liveGames(){const cut=Date.now()-3*864e5;return S.games.filter(g=>GAMES[g.kind]&&(g.updatedAt||0)>cut).sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0))}
function renderHome(){
  const myName=S.me?nameOf(S.me):"";const first=myName&&myName!=="Classmate"?myName.split(" ")[0]:"";
  const d=new Date();const hr=d.getHours();const greet=hr<12?"Good morning":hr<18?"Good afternoon":"Good evening";
  const next=S.posts.filter(p=>DATED.includes(p.type)&&daysUntil(anchor(p))>=0).sort((a,b)=>anchor(a).localeCompare(anchor(b))||(a.time||"").localeCompare(b.time||""))[0];
  const lg=liveGames();const lb=leaderboard(7).slice(0,5);const loading=!S.db;
  const nt=next&&TYPES[next.type];
  $("s-home").innerHTML=`
    <div class="hero"><div class="hero-top"><div class="hero-text"><span class="eyebrow">${greet} · ${d.toLocaleDateString("en-IE",{weekday:"long",day:"numeric",month:"short"})}</span>
      <h2>Hey${first?" "+esc(first):""}!</h2>
      ${next?`<button class="next-up t-${next.type}" type="button" data-id="${esc(next.id)}"><span class="nu-dot"></span><span class="nu-txt"><small>Next up · ${esc(nt.one)}${nt.verb?" "+esc(nt.verb.toLowerCase()):""} ${rel(anchor(next))}</small><b>${esc(next.title)}</b></span></button>`
        :`<p class="lead">${loading?"Loading…":"Nothing coming up. Enjoy the calm."}</p>`}
      </div>${MASCOT}</div></div>
    <div class="home-grid">
      <div class="block"><div class="h-sec" style="--c:var(--gold)"><h2><span class="dot"></span>This week's legends</h2><button class="btn btn-text" type="button" data-goto="class:leaders">Full board →</button></div>
        ${lb.length?`<div class="panel lb-mini">${lb.map((r,i)=>lbRow(r,i)).join("")}</div>`:`<div class="empty">${loading?"Loading…":"Nobody's on the board yet. Post a deadline or plan a study session to grab the top spot."}</div>`}</div>
      <div class="block"><div class="h-sec t-games"><h2><span class="dot"></span>Games right now</h2><button class="btn btn-text" type="button" data-goto="games">All games →</button></div>
        ${lg.length?`<div class="list">${lg.slice(0,4).map(liveRow).join("")}</div>`:`<div class="empty">${loading?"Loading…":"No games running. Be the hero who starts one."}${!loading&&S.canWrite?`<div style="margin-top:12px"><button class="btn btn-c t-games" type="button" data-goto="games">Start a game</button></div>`:""}</div>`}</div>
      <div class="block desk-only"><div class="h-sec t-assignment"><h2><span class="dot"></span>Coming up</h2><button class="btn btn-text" type="button" data-goto="calendar:all">Calendar →</button></div>
        ${(()=>{const up=S.posts.filter(p=>DATED.includes(p.type)&&daysUntil(anchor(p))>=0&&daysUntil(anchor(p))<=14).sort((x,y)=>anchor(x).localeCompare(anchor(y))).slice(0,5);
          return up.length?`<div class="list">${up.map(railItem).join("")}</div>`:`<div class="empty">${loading?"Loading…":"Nothing due in the next two weeks."}</div>`})()}</div>
    </div>
    ${CREDIT}`;
}
$("s-home").addEventListener("click",e=>{const it=e.target.closest("[data-id]");if(it){openItem(it.dataset.id);return}if(e.target.closest("[data-hgnow]"))openHangout(true)});

/* ================= calendar screen ================= */
function renderCalendarScreen(){
  const cats=[["all","All"],...DATED.map(k=>[k,TYPES[k].label])];
  $("cat-chips").innerHTML=cats.map(([k,l])=>`<button type="button" class="chip t-${k}" data-cat="${k}" aria-pressed="${S.cat===k}">${l}<span class="tag" style="padding:0 6px">${k==="all"?S.posts.filter(p=>DATED.includes(p.type)&&!isPast(p)).length:S.posts.filter(p=>p.type===k&&!isPast(p)).length}</span></button>`).join("");
  const k=S.cat;const sec=$("s-calendar");sec.className="screen t-"+k;
  document.querySelectorAll("#mode-seg button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.mode===S.mode));
  $("cal-mode").hidden=S.mode!=="calendar";$("list-mode").hidden=S.mode!=="list";
  $("sec-lock").hidden=!S.db||k==="all"||canPost(k);$("sec-lock").textContent="Ambassadors post here";
  let items=S.posts.filter(p=>k==="all"?DATED.includes(p.type):p.type===k);
  const subs=[...new Set(items.map(p=>p.subject).filter(Boolean))].sort();const sf=$("subj-filter");
  if(S.subj&&!subs.includes(S.subj))S.subj="";sf.hidden=subs.length<1;
  sf.innerHTML=`<option value="">All subjects</option>`+subs.map(s=>`<option value="${esc(s)}"${s===S.subj?" selected":""}>${esc(s)}</option>`).join("");
  if(S.subj)items=items.filter(p=>p.subject===S.subj);
  if(S.mode==="calendar")renderMonth(k,items);else renderList(k,items);
}
const PRIORITY=["exam","assignment","event","job"];
function renderMonth(k,items){
  S.monthItems=items;
  const m=S.month;$("month-label").textContent=MONTHS[m.getMonth()]+" "+m.getFullYear();
  const first=new Date(m);first.setDate(1-((m.getDay()+6)%7));const tdy=today();let html="";
  for(let w=0;w<6;w++){
    const days=[];for(let i=0;i<7;i++){const d=new Date(first);d.setDate(first.getDate()+w*7+i);days.push(d)}
    if(w>=4&&days[0].getMonth()!==m.getMonth())break;
    html+=`<div class="week"><div class="cells">${days.map(d=>{const key=ymd(d);
      const on=items.filter(p=>p.start<=key&&p.end>=key);const keys=on.filter(p=>anchor(p)===key||p.start===key);
      const types=[...new Set(on.map(p=>p.type))].sort((a,b)=>PRIORITY.indexOf(a)-PRIORITY.indexOf(b));
      const main=(keys.length?[...new Set(keys.map(p=>p.type))].sort((a,b)=>PRIORITY.indexOf(a)-PRIORITY.indexOf(b))[0]:types[0]);
      const cls=["cell",d.getMonth()!==m.getMonth()?"out":"",key===tdy?"today":"",(d.getDay()%6===0)?"weekend":"",on.length?"has":"",keys.length?"key":"",on.length&&on.every(isPast)?"past":""].join(" ");
      return `<button type="button" class="${cls}" ${main?`style="--c:var(--${main})"`:""} data-day="${key}" aria-label="${d.getDate()} ${MONTHS[d.getMonth()]}${on.length?", "+on.length+" item"+(on.length>1?"s":""):""}">
        <span class="dnum">${d.getDate()}</span><span class="dots">${types.slice(0,4).map(t=>`<i style="background:var(--${t})"></i>`).join("")}</span>${on.length>1?`<span class="cnt">${on.length}</span>`:""}</button>`}).join("")}</div></div>`;
  }
  $("weeks").innerHTML=html;
  const legendTypes=k==="all"?DATED:[k];
  $("cal-legend").innerHTML=legendTypes.map(x=>`<span><i class="lgd" style="background:var(--${x})"></i>${TYPES[x].label}</span>`).join("")
    +`<span><i class="lgd lgd-soft"></i>In progress</span>`;
  const t=TYPES[k];
  $("up-title").textContent=k==="all"?"Coming up":t.kind==="deadline"?(k==="job"?"Closing soon":"Due soon"):"Coming up";
  const up=items.filter(p=>{const n=daysUntil(anchor(p));return n>=0&&n<=30}).sort((a,b)=>anchor(a).localeCompare(anchor(b)));
  $("upcoming").innerHTML=railList(up,S.db?"Nothing in the next 30 days. Tap + to add the first one.":"Loading…");
}
function dayRole(p,day){const t=TYPES[p.type];
  if(t.kind==="deadline"){if(p.end===day)return t.endLabel;if(p.start===day)return t.startLabel;return "In progress"}
  if(p.start===p.end)return "On the day";if(p.start===day)return "Starts";if(p.end===day)return "Ends";return "Ongoing"}
function openDay(day){
  const items=(S.monthItems||[]).filter(p=>p.start<=day&&p.end>=day)
    .sort((a,b)=>((anchor(a)===day?0:1)-(anchor(b)===day?0:1))||PRIORITY.indexOf(a.type)-PRIORITY.indexOf(b.type));
  const d=parse(day);const m=$("item-modal");m.className="sheet t-all";
  m.innerHTML=`<div class="grab"></div><div class="row"><h3>${d.toLocaleDateString("en-IE",{weekday:"long",day:"numeric",month:"long"})}</h3><span class="due">${rel(day)}</span></div>
    ${items.length?`<div class="list">${items.map(p=>{const t=TYPES[p.type];const role=dayRole(p,day);const strong=anchor(p)===day||p.start===day;
      return `<button type="button" class="day-item t-${p.type} ${strong?"strong":""}" data-id="${esc(p.id)}"><span class="di-tag">${esc(t.one)} · ${esc(role)}</span>
        <b>${esc(p.title)}</b><span class="meta">${p.subject?`<span>${esc(subjShort(p.subject))}</span>`:""}${p.time?`<span>${esc(p.time)}</span>`:""}${p.tag?`<span>${esc(p.tag)}</span>`:""}</span></button>`}).join("")}</div>`
      :`<div class="empty">Nothing on this day.</div>`}
    <div class="actions">${S.db&&S.canWrite?`<button class="btn btn-yellow" type="button" data-addday="${day}">＋ Add something</button>`:""}<button class="btn btn-plain" type="button" data-closeov="item-overlay">Close</button></div>`;
  $("item-overlay").hidden=false;
}
$("item-modal").addEventListener("click",e=>{const it=e.target.closest(".day-item[data-id]");if(it){openItem(it.dataset.id);return}
  const a=e.target.closest("[data-addday]");if(a){S.ptype=S.cat==="all"?"assignment":S.cat;openComposer(a.dataset.addday)}});
function railItem(p){const t=TYPES[p.type];const a=anchor(p);const d=parse(a);const n=daysUntil(a);
  return `<button type="button" class="item t-${p.type}" data-id="${esc(p.id)}"><div class="date-block"><b>${d.getDate()}</b><span>${MON[d.getMonth()]}</span></div>
    <div style="min-width:0"><div class="item-title">${esc(p.title)}</div><div class="meta"><span>${esc(t.one)}</span>${p.subject?`<span>${esc(subjShort(p.subject))}</span>`:""}${p.time?`<span>${esc(p.time)}</span>`:""}
    <span class="due ${n>=0&&n<=3?"soon":""}">${t.verb?esc(t.verb)+" ":""}${rel(a)}</span></div></div></button>`}
function railList(ps,emptyMsg){return ps.length?ps.map(railItem).join(""):`<div class="empty">${esc(emptyMsg)}</div>`}
function spanText(p){const t=TYPES[p.type];
  if(t.kind==="deadline")return (p.start!==p.end?t.startLabel+" "+fmt(p.start)+" → ":"")+t.endLabel+" "+fmt(p.end)+(p.time?" · "+p.time:"");
  return fmt(p.start)+(p.end!==p.start?" → "+fmt(p.end):"")+(p.time?" · "+p.time:"");}
function roleWord(uid){return uid&&S.config&&S.config.ownerId===uid?"developer":isAmb(uid)?"ambassador":""}
function editedNote(o){if(!o.editedAt)return "";if(o.editedBy&&o.editedBy!==o.authorId){const r=roleWord(o.editedBy);return `<span class="edited">· edited by ${nm(o.editedBy)}${r?" ("+r+")":""}</span>`}return `<span>· edited</span>`}
function byline(p){return `<span class="byline">${personLink(p.authorId,avHtml(p.authorId))}${personLink(p.authorId)}${roleBadge(p.authorId)}${p.type==="update"&&p.createdAt?`<span>· ${new Date(p.createdAt).toLocaleDateString("en-IE",{day:"numeric",month:"short"})}</span>`:""}${editedNote(p)}</span>`}
function card(p){const t=TYPES[p.type];const link=safeUrl(p.link);const canE=canEditPost(p);const a=t.kind!=="none"?anchor(p):null;const n=a?daysUntil(a):null;
  return `<article class="card t-${p.type} ${p.pinned?"pinned":""}">${p.pinned?`<span class="pin-tag">Pinned</span>`:""}
    ${a?`<div class="row"><span class="span-line">${esc(spanText(p))}</span><span class="due ${n>=0&&n<=3?"soon":""}">${t.verb?esc(t.verb)+" ":""}${rel(a)}</span></div>`:""}
    ${p.subject?`<div><span class="subject">${esc(p.subject)}</span></div>`:""}<h3 class="ct">${esc(p.title)}</h3>
    ${p.tag?`<div class="meta">${esc(t.tagLabel)}: ${esc(p.tag)}</div>`:""}${p.body?`<p>${esc(p.body)}</p>`:""}
    ${link||a?`<div class="row">${a?addCal(p):"<span></span>"}${link?`<a class="lnk" href="${esc(link)}" target="_blank" rel="noopener">Open link ↗</a>`:""}</div>`:""}
    <div class="row">${byline(p)}<span>${p.type==="update"&&isMod()&&S.canWrite?`<button class="btn btn-text" data-pin="${esc(p.id)}" type="button">${p.pinned?"Unpin":"Pin"}</button>`:""}${canE?`<button class="btn btn-text" data-edit="${esc(p.id)}" type="button">Edit</button><button class="btn btn-danger" data-del="${esc(p.id)}" type="button">Delete</button>`:""}</span></div></article>`}
function renderList(k,items){
  const up=items.filter(p=>!isPast(p)).sort((a,b)=>anchor(a).localeCompare(anchor(b)));const past=items.filter(isPast).sort((a,b)=>anchor(b).localeCompare(anchor(a)));
  if(!items.length){$("list-mode").innerHTML=`<div class="empty">${S.db?"Nothing here yet. Tap + to add the first one.":"Loading…"}</div>`;return}
  $("list-mode").innerHTML=`<h2 class="group-label">Upcoming · ${up.length}</h2>${up.length?`<div class="grid-cards">${up.map(card).join("")}</div>`:`<div class="empty">Nothing upcoming.</div>`}
   ${past.length?`<details style="margin-top:12px"><summary class="group-label" style="cursor:pointer">Past · ${past.length}</summary><div class="grid-cards">${past.map(card).join("")}</div></details>`:""}`;
}
$("cat-chips").addEventListener("click",e=>{const b=e.target.closest("[data-cat]");if(!b)return;S.cat=b.dataset.cat;store.set("hub.cat",S.cat);renderCalendarScreen()});
$("mode-seg").addEventListener("click",e=>{const b=e.target.closest("[data-mode]");if(!b)return;S.mode=b.dataset.mode;store.set("hub.mode",S.mode);renderCalendarScreen()});
$("subj-filter").addEventListener("change",e=>{S.subj=e.target.value;renderCalendarScreen()});
$("prev").onclick=()=>{S.month=new Date(S.month.getFullYear(),S.month.getMonth()-1,1);renderCalendarScreen()};
$("next").onclick=()=>{S.month=new Date(S.month.getFullYear(),S.month.getMonth()+1,1);renderCalendarScreen()};
$("today-btn").onclick=()=>{const t=new Date();S.month=new Date(t.getFullYear(),t.getMonth(),1);S.sel=today();renderCalendarScreen()};
$("weeks").addEventListener("click",e=>{const c=e.target.closest("[data-day]");if(c)openDay(c.dataset.day)});
["upcoming","list-mode"].forEach(id=>$(id).addEventListener("click",e=>{const b=e.target.closest(".item[data-id]");if(b)openItem(b.dataset.id)}));
{let sx=null,sy=null;$("cal-panel").addEventListener("touchstart",e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
 $("cal-panel").addEventListener("touchend",e=>{if(sx===null)return;const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;sx=null;
   if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)(dx<0?$("next"):$("prev")).click()},{passive:true});}

/* ================= updates ================= */
function renderFeed(){
  const can=canPost("update");$("upd-add").hidden=!can;$("upd-lock").hidden=can||!S.db;$("upd-lock").textContent="Ambassadors post updates";
  const ps=S.posts.filter(p=>p.type==="update").sort((a,b)=>(b.pinned?1:0)-(a.pinned?1:0)||(b.createdAt||0)-(a.createdAt||0));
  $("feed").innerHTML=ps.length?ps.map(card).join(""):`<div class="empty">${S.db?"No updates yet. Room changes, lecture notes and reminders go here.":"Loading…"}</div>`;
}
$("upd-add").onclick=()=>{S.ptype="update";openComposer(null)};

/* ================= item detail ================= */
function openItem(id){const p=S.posts.find(x=>x.id===id);if(!p)return;const t=TYPES[p.type];const link=safeUrl(p.link);const canE=canEditPost(p);const a=anchor(p);const n=daysUntil(a);
  const m=$("item-modal");m.className="sheet t-"+p.type;
  m.innerHTML=`<div class="grab"></div><div class="row"><span class="chip t-${p.type}">${esc(t.one)}</span><span class="due ${n>=0&&n<=3?"soon":""}">${t.verb?esc(t.verb)+" ":""}${rel(a)}</span></div>
    ${p.subject?`<div><span class="subject">${esc(p.subject)}</span></div>`:""}<h3>${esc(p.title)}</h3><div class="span-line">${esc(spanText(p))}</div>
    ${p.tag?`<div class="meta">${esc(t.tagLabel)}: ${esc(p.tag)}</div>`:""}${p.body?`<p style="margin:0;white-space:pre-wrap;overflow-wrap:anywhere">${esc(p.body)}</p>`:""}
    <div class="row">${addCal(p)}${link?`<a class="lnk" href="${esc(link)}" target="_blank" rel="noopener">Open link ↗</a>`:""}</div>
    <div class="row">${byline(p)}<span>${canE?`<button class="btn btn-text" data-edit="${esc(p.id)}" type="button">Edit</button><button class="btn btn-danger" data-del="${esc(p.id)}" type="button">Delete</button>`:""}</span></div>
    <div class="actions"><button class="btn btn-plain" type="button" data-closeov="item-overlay">Close</button></div>`;
  $("item-overlay").hidden=false;
}

/* ================= composer ================= */
function openComposer(day,post){
  if(!S.db){toast("Loading…");return}
  if(!S.canWrite){toast("Ask the hub owner to invite you as an Editor to post");return}
  if(post&&!canEditPost(post)){toast("Only the author or a Class Ambassador can edit this");return}
  if(!post&&!canPost(S.ptype)){const alt=Object.keys(TYPES).find(canPost);if(!alt){toast("Only Class Ambassadors can post right now");return}S.ptype=alt}
  S.editing=post?post.id:null;$("post-form").reset();$("post-err").textContent="";
  $("subjects").innerHTML=subjects().map(s=>`<option value="${esc(s)}">`).join("");
  setPType(post?post.type:S.ptype);
  if(post){$("p-title").value=post.title||"";$("p-subject").value=post.subject||"";$("p-start").value=post.start||"";$("p-end").value=post.end||"";
    $("p-time").value=post.time||"";$("p-tag").value=post.tag||"";$("p-link").value=post.link||"";$("p-body").value=post.body||"";$("p-pin").checked=!!post.pinned;
    if(TYPES[post.type].kind==="deadline"&&post.start===post.end)$("p-start").value="";if(TYPES[post.type].kind==="span"&&post.start===post.end)$("p-end").value="";}
  else if(day){const k=TYPES[S.ptype].kind;if(k==="deadline")$("p-end").value=day;else if(k==="span")$("p-start").value=day}
  if(!post&&S.subj&&TYPES[S.ptype].subject)$("p-subject").value=S.subj;
  $("item-overlay").hidden=true;$("post-overlay").hidden=false;focusSoon(TYPES[S.ptype].subject&&!$("p-subject").value?$("p-subject"):$("p-title"),"post-overlay");
}
function setPType(k){S.ptype=k;const t=TYPES[k];
  $("post-form").className="sheet t-"+k;$("post-heading").textContent=(S.editing?"Edit ":"New ")+t.one.toLowerCase();$("post-save").textContent=S.editing?"Save changes":"Post";
  $("type-seg").innerHTML=Object.entries(TYPES).filter(([key])=>S.editing||canPost(key)).map(([key,v])=>`<button type="button" class="t-${key}" data-ptype="${key}" aria-pressed="${key===k}">${v.one}</button>`).join("");
  $("date-row").hidden=t.kind==="none";$("pin-row").hidden=k!=="update"||!isMod();$("subject-row").hidden=!t.subject;
  $("p-subject").required=!!t.subject&&k!=="update";$("subject-row").querySelector("label").textContent=k==="update"?"Subject (optional)":"Subject";
  if(t.kind!=="none"){$("l-start").textContent=t.startLabel+(t.kind==="deadline"?" (optional)":"");$("l-end").textContent=t.endLabel;$("l-time").textContent=t.timeLabel;
    $("p-start").required=t.kind==="span";$("p-end").required=t.kind==="deadline";}else{$("p-start").required=$("p-end").required=false}
  $("l-tag").textContent=t.tagLabel+" (optional)";$("p-tag").placeholder=k==="assignment"?"e.g. Brightspace":k==="exam"?"e.g. Q013, Quinn School":k==="event"?"e.g. Smurfit atrium":k==="job"?"e.g. Accenture":"";
  $("p-title").placeholder=t.placeholder;
}
$("type-seg").addEventListener("click",e=>{const b=e.target.closest("[data-ptype]");if(b)setPType(b.dataset.ptype)});
$("post-cancel").onclick=()=>{$("post-overlay").hidden=true;S.editing=null};
$("post-form").addEventListener("submit",async e=>{e.preventDefault();const t=TYPES[S.ptype];const orig=S.editing?S.posts.find(x=>x.id===S.editing):null;
  const p={type:S.ptype,title:$("p-title").value.trim(),subject:t.subject?$("p-subject").value.trim():"",start:null,end:null,time:null,tag:$("p-tag").value.trim(),link:$("p-link").value.trim(),
    body:$("p-body").value.trim(),authorId:orig?orig.authorId:S.me,createdAt:orig?orig.createdAt:Date.now()};
  if(orig){p.editedBy=S.me;p.editedAt=Date.now()}
  if(t.kind!=="none"){p.start=$("p-start").value||null;p.end=$("p-end").value||null;p.time=$("p-time").value||null}
  if(S.ptype==="update")p.pinned=isMod()?$("p-pin").checked:!!(orig&&orig.pinned);
  if(!orig&&!canPost(S.ptype))return $("post-err").textContent="Only Class Ambassadors can post in "+t.label+".";
  if(t.subject&&S.ptype!=="update"&&!p.subject)return $("post-err").textContent="Add the subject so classmates can filter by it.";
  if(!p.title)return $("post-err").textContent="Give it a title.";
  if(t.kind==="deadline"&&!p.end)return $("post-err").textContent=`Add the ${t.endLabel.toLowerCase()} date so it shows on the calendar.`;
  if(t.kind==="span"&&!p.start)return $("post-err").textContent=`Add the ${t.startLabel.toLowerCase()} date so it shows on the calendar.`;
  if(p.start&&p.end&&p.start>p.end)return $("post-err").textContent=`${t.startLabel} has to be on or before ${t.endLabel.toLowerCase()}.`;
  if(p.link&&!safeUrl(p.link))return $("post-err").textContent="Links need to start with https://";
  $("post-save").disabled=true;
  try{if(orig)await S.db.doc("posts/"+orig.id).set(p);else await S.db.collection("posts").add(p);
    $("post-overlay").hidden=true;toast(orig?"Changes saved":`Posted · +${S.ptype==="update"?4:5} points`);S.editing=null;
    if(t.kind!=="none"){const a=t.kind==="deadline"?p.end:p.start;S.sel=a;const d=parse(a);S.month=new Date(d.getFullYear(),d.getMonth(),1);S.cat=S.ptype;go("calendar")}else go("updates")}
  catch(err){$("post-err").textContent=writeErr(err)}finally{$("post-save").disabled=false}
});

/* ================= back button closes sheets (PWA) ================= */
{let skipPop=false;const anyOpen=()=>[...document.querySelectorAll(".overlay")].some(o=>!o.hidden);
 const mo=new MutationObserver(()=>{const open=anyOpen();
   if(open&&!(history.state&&history.state.sheet)){try{history.pushState({sheet:true},"")}catch(e){}}
   else if(!open&&history.state&&history.state.sheet){skipPop=true;try{history.back()}catch(e){skipPop=false}}});
 document.querySelectorAll(".overlay").forEach(o=>mo.observe(o,{attributes:true,attributeFilter:["hidden"]}));
 window.addEventListener("popstate",()=>{if(skipPop){skipPop=false;return}if(anyOpen()){document.querySelectorAll(".overlay").forEach(o=>o.hidden=true);S.editing=null}});}

/* ================= global clicks ================= */
document.addEventListener("click",async e=>{
  const c=e.target.closest("[data-closeov]");if(c){$(c.dataset.closeov).hidden=true;return}
  const del=e.target.closest("[data-del]");
  if(del){if(!armDelete(del,"Tap again to delete"))return;try{await S.db.doc("posts/"+del.dataset.del).delete();$("item-overlay").hidden=true;toast("Deleted")}catch(err){toast(writeErr(err))}return}
  const pin=e.target.closest("[data-pin]");
  if(pin){const p=S.posts.find(x=>x.id===pin.dataset.pin);if(p)try{await S.db.doc("posts/"+p.id).update({pinned:!p.pinned})}catch(err){toast(writeErr(err))}return}
  const ed=e.target.closest("[data-edit]");if(ed){const p=S.posts.find(x=>x.id===ed.dataset.edit);if(p)openComposer(null,p);return}
});
document.querySelectorAll(".overlay").forEach(o=>o.addEventListener("click",e=>{if(e.target===o){o.hidden=true;if(o.id==="post-overlay")S.editing=null}}));
document.addEventListener("keydown",e=>{if(e.key==="Escape"){document.querySelectorAll(".overlay").forEach(o=>o.hidden=true);S.editing=null}});

/* ================= chat ================= */
function chatDay(ts){const d=new Date(ts);const n=daysUntil(ymd(d));return n===0?"Today":n===-1?"Yesterday":d.toLocaleDateString("en-IE",{weekday:"short",day:"numeric",month:"short"})}
S.selMsg=null;S.editMsg=null;
function renderChat(){
  $("channels").innerHTML=CHANNELS.map(([k,l])=>`<button type="button" class="chip plain" data-ch="${k}" aria-pressed="${k===S.channel}"># ${l}</button>`).join("");
  $("chat-input").placeholder=S.editMsg?"Edit message":"Message #"+S.channel;
  const ms=S.msgs.filter(m=>(m.channel||"general")===S.channel).slice().sort((a,b)=>a.createdAt-b.createdAt);
  const box=$("msgs");const atBottom=box.scrollHeight-box.scrollTop-box.clientHeight<80;
  let html="",lastDay="",last=null;
  ms.forEach(m=>{const day=chatDay(m.createdAt);if(day!==lastDay){html+=`<div class="day-sep"><span>${day}</span></div>`;lastDay=day;last=null}
    const mine=m.authorId===S.me;const start=!last||last.authorId!==m.authorId||m.createdAt-last.createdAt>5*6e4;
    const nxt=ms[ms.indexOf(m)+1];const end=!nxt||nxt.authorId!==m.authorId||nxt.createdAt-m.createdAt>5*6e4||chatDay(nxt.createdAt)!==day;
    const d=new Date(m.createdAt);const can=S.canWrite&&(isMod()||mine);const sel=S.selMsg===m.id;
    html+=`<div class="m ${mine?"mine":""} ${start?"start":""} ${end?"end":""}" data-mid="${esc(m.id)}">
      ${mine?"":`<div class="av-slot" ${end?`data-person="${esc(m.authorId)}"`:""}>${end?avHtml(m.authorId):""}</div>`}
      <div class="m-col"><button type="button" class="bub" ${can?`data-sel="${esc(m.id)}"`:"tabindex=\"-1\""}>
        ${!mine&&start?`<span class="nm" data-person="${esc(m.authorId)}">${nm(m.authorId)} ${roleBadge(m.authorId)}</span>`:""}
        <span class="t">${esc(m.text)}</span>
        <span class="mt">${pad(d.getHours())}:${pad(d.getMinutes())}${m.editedAt?` · ${m.editedBy&&m.editedBy!==m.authorId?"edited by "+nm(m.editedBy)+(roleWord(m.editedBy)?" ("+roleWord(m.editedBy)+")":""):"edited"}`:""}</span></button>
        ${sel&&can?`<div class="m-acts"><button class="btn btn-sm" type="button" data-editmsg="${esc(m.id)}">Edit</button><button class="btn btn-sm btn-del" type="button" data-delmsg="${esc(m.id)}">Delete</button></div>`:""}
      </div></div>`;
    last=m;});
  box.innerHTML=ms.length?html:`<div class="chat-empty">${MASCOT}<b>#${esc(S.channel)} is quiet</b><span>Say hello to the class.</span></div>`;
  if(atBottom||!renderChat.done){box.scrollTop=box.scrollHeight;renderChat.done=true}
  $("edit-bar").hidden=!S.editMsg;
  if(S.editMsg){const em=S.msgs.find(x=>x.id===S.editMsg);$("edit-label").textContent=em&&em.authorId!==S.me?`Editing ${nameOf(em.authorId)}'s message`:"Editing your message"}
  const dis=!S.db||!S.canWrite;$("chat-input").disabled=dis;$("chat-send").disabled=dis;
}
function stopEdit(){S.editMsg=null;$("chat-input").value="";$("chat-input").style.height="";renderChat()}
$("channels").addEventListener("click",e=>{const b=e.target.closest("[data-ch]");if(!b)return;S.channel=b.dataset.ch;S.selMsg=null;if(S.editMsg)stopEdit();renderChat.done=false;renderChat()});
$("chat-input").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey&&!/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)){e.preventDefault();$("chat-form").requestSubmit()}if(e.key==="Escape"&&S.editMsg)stopEdit()});
$("chat-input").addEventListener("input",e=>{const t=e.target;t.style.height="auto";t.style.height=Math.min(t.scrollHeight,120)+"px"});
$("edit-cancel").onclick=stopEdit;
let lastSend=0;
$("chat-form").addEventListener("submit",async e=>{e.preventDefault();const text=$("chat-input").value.trim();if(!text||!S.db)return;
  if(!S.editMsg&&Date.now()-lastSend<1200){toast("Slow down a little");return}lastSend=Date.now();$("chat-send").disabled=true;
  try{if(S.editMsg){await S.db.doc("messages/"+S.editMsg).update({text:text.slice(0,2000),editedBy:S.me,editedAt:Date.now()});S.editMsg=null;S.selMsg=null;toast("Message updated")}
    else await S.db.collection("messages").add({channel:S.channel,text:text.slice(0,2000),authorId:S.me,createdAt:Date.now()});
    $("chat-input").value="";$("chat-input").style.height="";renderChat.done=false;renderChat()}
  catch(err){toast(writeErr(err))}finally{$("chat-send").disabled=!S.canWrite}});
$("msgs").addEventListener("click",async e=>{
  const del=e.target.closest("[data-delmsg]");if(del){if(!armDelete(del,"Sure?"))return;try{await S.db.doc("messages/"+del.dataset.delmsg).delete();S.selMsg=null}catch(err){toast(writeErr(err))}return}
  const ed=e.target.closest("[data-editmsg]");if(ed){const m=S.msgs.find(x=>x.id===ed.dataset.editmsg);if(!m)return;S.editMsg=m.id;S.selMsg=null;$("chat-input").value=m.text;renderChat();$("chat-input").focus();return}
  const b=e.target.closest("[data-sel]");S.selMsg=b&&S.selMsg!==b.dataset.sel?b.dataset.sel:null;renderChat()});

/* ================= leaderboard ================= */
const PTS={cal:5,upd:4,plans:3,polls:2,joins:1,chat:1};
const TITLE_DEFS=[["cal","Deadline keeper","Most calendar posts","book","var(--assignment)"],["upd","Town crier","Most class updates","updates","var(--update)"],
  ["plans","Study captain","Most sessions and outings","pin","var(--study)"],["polls","Pollster","Most polls","poll","var(--poll)"],
  ["joins","Always there","Joined the most plans","join","var(--outing)"],["chat","Chatterbox","Most chat messages","chatbub","var(--accent)"]];
function leaderboard(days){
  const since=days?Date.now()-days*864e5:0;const P={};
  const add=(u,k)=>{if(!u)return;P[u]=P[u]||{id:u,total:0,cal:0,upd:0,plans:0,polls:0,joins:0,chat:0};P[u][k]++;P[u].total+=PTS[k]};
  S.posts.forEach(p=>{if((p.createdAt||0)>=since)add(p.authorId,p.type==="update"?"upd":"cal")});
  S.hang.forEach(h=>{if((h.createdAt||0)>=since)add(h.authorId,h.kind==="poll"?"polls":"plans");
    if(h.kind!=="poll")Object.entries(h.going||{}).forEach(([u,v])=>{if(v&&u!==h.authorId&&(+v)>=since)add(u,"joins")})});
  const perDay={};S.msgs.forEach(m=>{if((m.createdAt||0)<since||!m.authorId)return;const k=m.authorId+new Date(m.createdAt).toDateString();perDay[k]=(perDay[k]||0)+1;if(perDay[k]<=5)add(m.authorId,"chat")});
  return Object.values(P).filter(r=>!isBanned(r.id)).sort((a,b)=>b.total-a.total);
}
function lbRow(r,i){const bits=[["cal","posts"],["upd","updates"],["plans","plans"],["polls","polls"],["joins","joins"],["chat","msgs"]].filter(([k])=>r[k]).map(([k,l])=>`<span>${r[k]} ${l}</span>`).join("");
  return `<div class="lb-row ${r.id===S.me?"me":""}" data-person="${esc(r.id)}" role="button" tabindex="0"><span class="rank">${i+1}</span>${avHtml(r.id)}<div style="min-width:0"><b>${nm(r.id)}</b>${r.id===S.me?' <span class="tag">you</span>':""} ${roleBadge(r.id)}<div class="mini-badges">${bits}</div></div><span class="pts">${r.total}</span></div>`}
function renderLeaders(){
  const rows=leaderboard(S.lbPeriod==="week"?7:0);
  const pod=(r,cls,place)=>r?`<div class="pod ${cls}"><div class="ring">${avHtml(r.id)}<i>${place}</i></div><span class="name">${nm(r.id)}</span><span class="pts">${r.total} pts</span><div class="step"></div></div>`:`<div class="pod ${cls}"><div class="step" style="opacity:.4"></div></div>`;
  const titles=TITLE_DEFS.map(([k,name,desc,ic,col])=>{const top=rows.filter(r=>r[k]>0).sort((a,b)=>b[k]-a[k])[0];
    return `<div class="title-card" style="--c:${col}"><span class="q-ic">${icon(ic)}</span><div style="min-width:0"><b>${name}</b><small>${top?`${nm(top.id)} · ${top[k]}`:desc}</small></div></div>`}).join("");
  const mine=rows.findIndex(r=>r.id===S.me);
  $("ct-leaders").innerHTML=`<div class="seg" id="lb-seg"><button type="button" data-lb="week" aria-pressed="${S.lbPeriod==="week"}">This week</button><button type="button" data-lb="all" aria-pressed="${S.lbPeriod==="all"}">All time</button></div>
    ${rows.length?`<div class="panel"><div class="podium">${pod(rows[1],"second",2)}${pod(rows[0],"first",1)}${pod(rows[2],"third",3)}</div></div>
      ${mine>=0?`<div class="hint" style="text-align:center">You're #${mine+1} with ${rows[mine].total} points</div>`:S.canWrite?`<div class="hint" style="text-align:center">Add something to get on the board.</div>`:""}
      <div class="panel" style="padding:4px 14px">${rows.map(lbRow).join("")}</div>`
      :`<div class="empty">${S.db?"No contributions yet this period. Add a deadline, plan a study session or start a poll.":"Loading…"}</div>`}
    <div class="h-sec"><h2>Class titles</h2></div><div class="titles">${titles}</div>
    <div class="h-sec"><h2>How points work</h2></div>
    <div class="rules"><span>Calendar post +5</span><span>Class update +4</span><span>Study session or outing +3</span><span>Poll +2</span><span>Joining someone's plan +1</span><span>Chat message +1 (up to 5 a day)</span></div>`;
}
$("ct-leaders").addEventListener("click",e=>{const b=e.target.closest("[data-lb]");if(b){S.lbPeriod=b.dataset.lb;renderLeaders()}});

/* ================= class screen ================= */
function renderClass(){
  document.querySelectorAll("#class-seg button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.ct===S.classTab));
  ["leaders","people","roles","invite","about"].forEach(k=>$("ct-"+k).hidden=k!==S.classTab);
  if(S.classTab==="leaders")renderLeaders();else renderPeople();
}
$("class-seg").addEventListener("click",e=>{const b=e.target.closest("[data-ct]");if(b){S.classTab=b.dataset.ct;renderClass()}});
function renderPeople(){
  const q=($("people-q").value||"").trim().toLowerCase();const ownerId=S.config&&S.config.ownerId;
  const all=S.members.filter(m=>!isBanned(m.id)).sort((a,b)=>(a.id===S.me?-1:b.id===S.me?1:0)||nameOf(a.id).localeCompare(nameOf(b.id)));
  const mem=q?all.filter(m=>nameOf(m.id).toLowerCase().includes(q)||emailOf(m.id).toLowerCase().includes(q)):all;
  $("joined-count").textContent=q?`${mem.length} of ${all.length}`:all.length;
  $("joined").innerHTML=mem.length?mem.map(m=>`<div class="person">${personLink(m.id,avHtml(m.id))}<div class="grow"><span class="pname">${personLink(m.id,`<b>${nm(m.id)}</b>`)}${m.id===S.me?' <span class="tag">you</span>':""} ${roleBadge(m.id)}</span>${emailOf(m.id)?`<span class="pmail">${mailHtml(emailOf(m.id))}</span>`:""}</div>
    ${S.owner&&m.id!==ownerId&&m.id!==S.me&&(isAmb(m.id)||ambassadors().length<MAX_AMB)?`<button class="btn btn-plain btn-sm" type="button" data-amb="${esc(m.id)}">${isAmb(m.id)?"Remove role":"Make ambassador"}</button>`:`<span class="tag">joined ${new Date(m.joinedAt||Date.now()).toLocaleDateString("en-IE",{day:"numeric",month:"short"})}</span>`}</div>`).join("")
    :`<div class="empty">${q?"Nobody matches that search.":"Classmates appear here once they sign in."}</div>`;
  const oc=ownerId&&emailOf(ownerId);$("owner-contact").textContent=oc?`Questions or a data request? Contact the hub owner, ${nameOf(ownerId)}, at ${oc}.`:"";
  renderStorage();
  $("app-version").innerHTML="Smurfit Class Hub · version "+APP_VERSION+CREDIT;$("leave-btn").disabled=!S.db||!S.me||!S.canWrite||S.owner;
  if(S.owner)$("leave-btn").title="The owner can't leave the hub.";
  const bans=S.bans.slice().sort((a,b)=>(b.at||0)-(a.at||0));$("bans-panel").hidden=!(isMod()&&bans.length);$("ban-count").textContent=bans.length;
  $("ban-list").innerHTML=bans.map(x=>`<div class="person">${avHtml(x.id)}<div class="grow"><b>${esc(x.name||nameOf(x.id))}</b><span class="pmail">${mailHtml(x.email||"")}</span>
    <span class="pmail">Removed by ${nm(x.by)} · ${new Date(x.at||Date.now()).toLocaleDateString("en-IE",{day:"numeric",month:"short"})}${x.reason?" · "+esc(x.reason):""}</span></div>
    ${S.canWrite&&isMod()?`<button class="btn btn-sm" type="button" data-unban="${esc(x.id)}">Restore</button>`:""}</div>`).join("");
  const ambs=ambassadors();$("amb-count").textContent=`${ambs.length} of ${MAX_AMB}`;
  $("amb-list").innerHTML=ambs.length?ambs.map(u=>`<div class="person">${personLink(u,avHtml(u))}<div class="grow"><span class="pname">${personLink(u,`<b>${nm(u)}</b>`)} ${roleBadge(u)}</span>${emailOf(u)?`<span class="pmail">${mailHtml(emailOf(u))}</span>`:""}</div>${S.owner?`<button class="btn btn-sm" type="button" data-amb="${esc(u)}">Remove</button>`:""}</div>`).join("")
    :`<div class="empty">${S.owner?"No ambassadors yet. Pick up to 5 classmates below.":"No ambassadors yet."}</div>`;
  const cands=S.members.filter(m=>!isAmb(m.id)&&m.id!==ownerId&&m.id!==S.me&&!isBanned(m.id)).sort((a,b)=>nameOf(a.id).localeCompare(nameOf(b.id)));
  $("amb-add-wrap").hidden=!S.owner;
  $("amb-pick").innerHTML=cands.length?`<option value="">Choose a classmate…</option>`+cands.map(m=>`<option value="${esc(m.id)}">${nm(m.id)}${emailOf(m.id)?" · "+esc(emailOf(m.id)):""}</option>`).join(""):`<option value="">No other classmates have joined yet</option>`;
  $("amb-pick").disabled=$("amb-add").disabled=ambs.length>=MAX_AMB||!cands.length;
  $("perm-who").textContent=S.owner?(ambs.length>=MAX_AMB?"All 5 spots are filled. Remove someone to add another.":"Ambassadors get their powers straight away. You can remove them any time."):"Only the hub owner chooses Class Ambassadors.";
  $("invite-count").textContent=S.roster.length;const mod=isMod();
  $("roster").innerHTML=S.roster.length?S.roster.slice().sort((a,b)=>a.email.localeCompare(b.email)).map(r=>`<div class="person"><div class="grow">${esc(r.email)}</div><span class="tag">invited</span>${mod?`<button class="btn btn-danger" data-unroster="${esc(r.id)}" type="button">Remove</button>`:""}</div>`).join("")
    :`<div class="empty">Add classmates' emails to keep track of who you've invited.</div>`;
  const dis=!S.db||!mod||!S.canWrite;$("roster-email").disabled=dis;$("roster-form").querySelector("button").disabled=dis;
  $("roster-err").textContent=S.db&&!mod?"Only the owner and Class Ambassadors can change the invite list.":"";
  $("invite-msg").value="Hi! I've set up a Class Hub for our MSc Business Analytics class: deadlines, exams, events, jobs, study sessions, polls, games and a class chat. Open "+location.origin+" on your phone, enter your UCD email and type the 6-digit code it sends you (check Junk the first time). Tip: add it to your home screen so it works like an app.";
  const ac=$("acct");if(ac){const h=window.hubAuth||{};ac.innerHTML=h.mode==="live"?`<span class="hint">Signed in as ${esc(h.email||"")}</span><button class="btn btn-plain btn-sm" type="button" data-signout>Sign out</button>`
    :`<span class="hint">Demo mode · data stays on this device</span><button class="btn btn-plain btn-sm" type="button" data-demo-reset>Reset demo data</button>`}
}
$("s-class").addEventListener("click",async e=>{
  const amb=e.target.closest("[data-amb]");if(amb&&S.owner){const id=amb.dataset.amb;if(!isAmb(id)&&ambassadors().length>=MAX_AMB)return toast("All 5 ambassador spots are filled");
    await saveConfig({ambassadors:isAmb(id)?ambassadors().filter(x=>x!==id):[...ambassadors(),id]});return}
  if(e.target.closest("#amb-add")&&S.owner){const id=$("amb-pick").value;if(!id)return toast("Choose a classmate first");if(ambassadors().length>=MAX_AMB)return toast("All 5 ambassador spots are filled");
    await saveConfig({ambassadors:[...ambassadors(),id]});return}
  const ur=e.target.closest("[data-unroster]");if(ur){try{await S.db.doc("roster/"+ur.dataset.unroster).delete()}catch(err){toast(writeErr(err))}}
});
document.addEventListener("change",async e=>{const s=e.target.closest("[data-policy]");if(!s||!S.owner)return;
  await saveConfig({policy:Object.assign({},DEFAULT_POLICY,(S.config&&S.config.policy)||{},{[s.dataset.policy]:s.value})})});
async function saveConfig(patch){const next=Object.assign({ambassadors:[],policy:Object.assign({},DEFAULT_POLICY)},S.config||{},patch,{ownerId:S.me,updatedAt:Date.now()});
  try{await S.db.doc("config/roles").set(next);toast("Saved")}catch(err){toast(err&&err.code==="invalid_argument"?"Only the hub owner can change roles.":writeErr(err))}}
$("roster-form").addEventListener("submit",async e=>{e.preventDefault();const em=$("roster-email").value.trim().toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em))return $("roster-err").textContent="That doesn't look like an email address.";
  if(S.roster.some(r=>r.email===em))return $("roster-err").textContent="Already on the list.";
  try{await S.db.doc("roster/"+em.replace(/[^a-z0-9._~@+-]/g,"_")).set({email:em,addedBy:S.me,addedAt:Date.now()});$("roster-email").value="";$("roster-err").textContent="";toast("Added. Now invite them from Share.")}
  catch(err){$("roster-err").textContent=err&&err.code==="invalid_argument"?"Only editors can change the invite list.":writeErr(err)}});
$("welcome-form").addEventListener("submit",e=>{e.preventDefault();store.set("hub.welcomed","1");$("welcome-overlay").hidden=true});
$("people-q").addEventListener("input",()=>renderPeople());

/* ---------- profile card ---------- */
function openPerson(uid){if(!uid)return;const m=member(uid);const lb=leaderboard(0).find(r=>r.id===uid);const em=emailOf(uid);
  const posts=S.posts.filter(p=>p.authorId===uid).length,plans=S.hang.filter(h=>h.authorId===uid).length;
  const sheet=$("item-modal");sheet.className="sheet t-all";
  sheet.innerHTML=`<div class="grab"></div><div class="person-card"><span class="pc-av">${avHtml(uid)}</span><div style="min-width:0"><h3>${nm(uid)}</h3>${roleBadge(uid)}${uid===S.me?' <span class="tag">you</span>':""}</div></div>
    ${em?`<div class="pc-email"><span>${mailHtml(em)}</span><button class="btn btn-sm" type="button" data-copy="${esc(em)}">Copy</button></div>`:""}
    <div class="pc-stats"><div><b>${lb?lb.total:0}</b><span>points</span></div><div><b>${posts}</b><span>posts</span></div><div><b>${plans}</b><span>plans & polls</span></div></div>
    ${m&&m.joinedAt?`<p class="hint" style="margin:0">Joined ${new Date(m.joinedAt).toLocaleDateString("en-IE",{day:"numeric",month:"long",year:"numeric"})}</p>`:""}
    ${canRemove(uid)?`<details class="mod-box"><summary>Remove from the hub</summary>
      <p class="hint" style="margin:6px 0 0">For misconduct only. ${esc(nameOf(uid).split(" ")[0])} won't be able to open the hub until an ambassador restores them.</p>
      <div class="field"><label for="ban-reason">Reason (shown to them)</label><input id="ban-reason" maxlength="140" placeholder="e.g. Repeated spam in chat"></div>
      <label class="check"><input type="checkbox" id="ban-wipe"> Also delete their posts and messages</label>
      <button class="btn btn-danger-solid" type="button" data-ban="${esc(uid)}">Remove ${esc(nameOf(uid).split(" ")[0])}</button></details>`
      :(uid!==S.me&&S.canWrite&&isMod()&&(isAmb(uid)||uid===ownerIdOf())?`<p class="hint" style="margin:0">${uid===ownerIdOf()?"The developer can't be removed.":"Ambassadors can't remove each other. Only the developer can."}</p>`:"")}
    <div class="actions"><button class="btn btn-plain" type="button" data-closeov="item-overlay">Close</button></div>`;
  $("item-overlay").hidden=false;}
document.addEventListener("click",async e=>{
  const c=e.target.closest("[data-copy]");if(c){const v=c.dataset.copy;try{await navigator.clipboard.writeText(v);toast("Email copied")}catch(err){toast(v)}return}
  const p=e.target.closest("[data-person]");if(p&&!e.target.closest("[data-amb]")){e.stopPropagation();openPerson(p.dataset.person)}},true);
document.addEventListener("keydown",e=>{if(e.key==="Enter"){const p=e.target.closest&&e.target.closest("[data-person]");if(p)openPerson(p.dataset.person)}});

/* ---------- storage meter (owner only, live mode) ---------- */
let storageAt=0,storageVal=null;
async function renderStorage(){const el=$("storage-meter");if(!S.owner||!window.hubAuth||!window.hubAuth.storage){el.hidden=true;return}
  if(Date.now()-storageAt>60000){storageAt=Date.now();try{storageVal=await window.hubAuth.storage()}catch(e){storageVal=null}}
  if(storageVal==null){el.hidden=true;return}
  const mb=storageVal/1048576,pct=Math.min(100,mb/500*100);el.hidden=false;
  $("storage-text").textContent=`${mb.toFixed(1)} MB of 500 MB`;$("storage-fill").style.width=pct+"%";$("storage-fill").className=pct>=70?"warn":"";
  $("storage-note").textContent=pct>=70?"Getting full. Old games and chat are cleaned up automatically, but you may want to tidy up.":"Plenty of room. Old games and chat are cleaned up automatically."}

/* ---------- removing someone (moderation) ---------- */
document.addEventListener("click",async e=>{
  const b=e.target.closest("[data-ban]");
  if(b){const uid=b.dataset.ban;if(!canRemove(uid))return toast("You can't remove this person");if(!armDelete(b,"Tap again to remove"))return;b.disabled=true;
    try{await S.db.doc("bans/"+uid).set({name:nameOf(uid),email:emailOf(uid),by:S.me,at:Date.now(),contact:emailOf(ownerIdOf())||"",contactName:nameOf(ownerIdOf()),reason:($("ban-reason").value||"").trim().slice(0,140)});
      if(isAmb(uid)&&S.owner)await saveConfig({ambassadors:ambassadors().filter(x=>x!==uid)});
      if($("ban-wipe").checked){for(const [col,f] of [["posts","authorId"],["hangouts","authorId"],["messages","authorId"]]){
        const snap=await S.db.collection(col).where(f,"==",uid).get();for(const d of snap.docs){try{await S.db.doc(col+"/"+d.id).delete()}catch(err){}}}}
      $("item-overlay").hidden=true;toast(nameOf(uid)+" has been removed")}catch(err){b.disabled=false;toast(writeErr(err))}return}
  const u=e.target.closest("[data-unban]");
  if(u){if(!isMod())return;try{await S.db.doc("bans/"+u.dataset.unban).delete();toast("Restored")}catch(err){toast(writeErr(err))}}});
function checkBanned(){const mine=S.bans.find(b=>b.id===S.me);$("banned").hidden=!mine;
  if(!mine){if(S.lockedByBan){S.lockedByBan=false;S.canWrite=true;showNotice();scheduleRender();toast("Welcome back. You can post again.")}return}
  S.lockedByBan=true;S.canWrite=false;$("banned-why").textContent=mine.reason?"Reason: "+mine.reason:"A Class Ambassador removed you from the hub.";
  const oc=mine.contact||(ownerIdOf()&&emailOf(ownerIdOf()));$("banned-contact").textContent=oc?`Think this is a mistake? Contact ${mine.contactName||"the hub's developer"} at ${oc}.`:"Think this is a mistake? Contact the hub's developer.";
  document.querySelectorAll(".overlay").forEach(o=>o.hidden=true)}

/* ---------- leave the hub ---------- */
$("leave-btn").onclick=async()=>{const b=$("leave-btn");if(!S.db||!S.me||S.owner)return;if(!armDelete(b,"Tap again to leave"))return;b.disabled=true;
  try{if($("leave-all").checked){for(const [col,f] of [["posts","authorId"],["hangouts","authorId"],["messages","authorId"],["games","createdBy"]]){
        const snap=await S.db.collection(col).where(f,"==",S.me).get();for(const d of snap.docs){try{await S.db.doc(col+"/"+d.id).delete()}catch(e){}}}}
    await S.db.doc("members/"+S.me).delete();store.set("hub.welcomed","");toast("You've left the hub");
    setTimeout(()=>{if(window.hubAuth&&window.hubAuth.signOut)window.hubAuth.signOut();else if(window.hubAuth&&window.hubAuth.reset)window.hubAuth.reset();else location.reload()},900)}
  catch(err){b.disabled=false;toast(writeErr(err))}};
$("invite-copy").onclick=async()=>{try{await navigator.clipboard.writeText($("invite-msg").value);toast("Message copied")}catch(e){$("invite-msg").select();toast("Press Ctrl/Cmd+C to copy")}};

let rq=0;function scheduleRender(){if(rq)return;rq=requestAnimationFrame(()=>{rq=0;render()})}
window.addEventListener("online",()=>{showNotice();toast("Back online")});window.addEventListener("offline",()=>showNotice());
let lastErr=0;function softError(){if(Date.now()-lastErr<15000)return;lastErr=Date.now();toast("Something went wrong. If it keeps happening, reload the app.")}
window.addEventListener("error",e=>{if(e&&e.message&&!/ResizeObserver|Script error/.test(e.message))softError()});
window.addEventListener("unhandledrejection",()=>softError());
function showNotice(){const n=$("notice");const w=$("notice-wrap");
  if(!navigator.onLine){w.hidden=false;n.innerHTML="<b>You're offline.</b> You can still browse. New posts and messages will send when you're back online.";return}
  if(!S.db){w.hidden=true;return}
  if(!S.canWrite){w.hidden=false;n.textContent="You can read everything here. To post, play or chat, ask the hub owner to invite you by email as an Editor.";return}
  w.hidden=true;}

/* ---------- study & hangouts ---------- */
HOOKS.push((db,docs)=>{
  db.collection("hangouts").limit(500).onSnapshot(s=>{S.hang=docs(s);if(S.screen==="hangouts"||S.screen==="home")scheduleRender();else renderNav();resolveNames()},()=>{});
  db.collection("games").limit(200).onSnapshot(s=>{S.games=docs(s);if(S.screen==="games"||S.screen==="home")scheduleRender();else renderNav();resolveNames()},()=>{});
});
const goingIds=h=>Object.entries(h.going||{}).filter(([,v])=>v).sort((a,b)=>(+a[1]||0)-(+b[1]||0)).map(([k])=>k);
const hPast=h=>h.date<today()||(h.date===today()&&h.until&&h.until<nowHM());
const hLive=h=>h.date===today()&&h.time&&h.time<=nowHM()&&(!h.until||h.until>=nowHM());
function hWhen(h){const n=daysUntil(h.date);const day=n===0?"Today":n===1?"Tomorrow":parse(h.date).toLocaleDateString("en-IE",{weekday:"short",day:"numeric",month:"short"});
  return day+(h.time?" · "+h.time:"")+(h.until?"–"+h.until:"")}
function hangCard(h){
  const ids=goingIds(h);const mine=!!(h.going&&h.going[S.me]);const full=h.cap&&ids.length>=h.cap&&!mine;
  const canDel=S.canWrite&&(isMod()||h.authorId===S.me);
  const cal={type:"event",title:h.title,start:h.date,end:h.date,time:h.time||null,tag:h.where||"",body:h.body||"",link:""};
  return `<article class="card t-${h.kind}">
    <div class="row"><span class="chip t-${h.kind}">${h.kind==="study"?"Study session":"Outing"}</span>${hLive(h)?`<span class="live">Happening now</span>`:`<span class="span-line">${esc(hWhen(h))}</span>`}</div>
    <h3 class="ct">${esc(h.title)}</h3>
    ${h.where?`<div class="meta">${esc(h.where)}${hLive(h)?" · until "+esc(h.until||"late"):""}</div>`:""}
    ${h.body?`<p>${esc(h.body)}</p>`:""}
    <div class="going">${ids.length?stack(ids):""}<span>${ids.length?ids.slice(0,2).map(i=>esc(nameOf(i))).join(", ")+(ids.length>2?` and ${ids.length-2} more`:"")+" going":"Nobody's joined yet"}${h.cap?` · ${Math.max(0,h.cap-ids.length)} of ${h.cap} spots left`:""}</span></div>
    <div class="row">
      ${S.canWrite&&!hPast(h)?`<button class="btn btn-join ${mine?"on":""}" type="button" data-join="${esc(h.id)}" ${full?"disabled":""}>${mine?"You're going · Leave":full?"Full":"Join"}</button>`:"<span></span>"}
      ${addCal(cal)}
    </div>
    <div class="row">${byline(h)}${canDel?`<button class="btn btn-danger" type="button" data-hdel="${esc(h.id)}">Delete</button>`:""}</div>
  </article>`;
}
function pollCard(h){
  const votes=Object.entries(h.votes||{}).filter(([,v])=>v!==null&&v!==undefined&&v>=0);const total=votes.length;
  const my=h.votes&&h.votes[S.me];const voted=my!==undefined&&my!==null&&my>=0;const show=voted||h.closed;
  const canMod=S.canWrite&&(isMod()||h.authorId===S.me);
  return `<article class="card t-poll">
    <div class="row"><span class="chip t-poll">Poll</span><span class="span-line">${h.closed?"Closed":total+" vote"+(total===1?"":"s")}</span></div>
    <h3 class="ct">${esc(h.title)}</h3>
    <div class="opt-list">${(h.options||[]).map((o,i)=>{const c=votes.filter(([,v])=>v===i).length;const pct=total?Math.round(c/total*100):0;
      return `<button type="button" class="opt ${my===i?"mine":""}" data-vote="${esc(h.id)}" data-i="${i}" ${h.closed||!S.canWrite?"disabled":""}>
        ${show?`<span class="fill" style="width:${pct}%"></span>`:""}<span>${esc(o)}</span>${show?`<span class="pct">${pct}% · ${c}</span>`:""}</button>`}).join("")}</div>
    <div class="hint">${h.closed?"Final results.":voted?"Tap another option to change your vote.":"Vote to see results."}</div>
    <div class="row">${byline(h)}<span>${canMod?`<button class="btn btn-danger" style="color:var(--accent)" type="button" data-pclose="${esc(h.id)}">${h.closed?"Reopen":"Close poll"}</button><button class="btn btn-danger" type="button" data-hdel="${esc(h.id)}">Delete</button>`:""}</span></div>
  </article>`;
}
function hangItem(h){const ids=goingIds(h);
  return `<button type="button" class="item t-${h.kind}" data-goto="hangouts:plans"><div class="date-block"><b>${h.time?esc(h.time):"—"}</b><span>${h.kind==="study"?"Study":"Outing"}</span></div>
    <div style="min-width:0"><div class="item-title">${esc(h.title)}</div><div class="meta">${h.where?`<span>${esc(h.where)}</span>`:""}<span>${ids.length} going</span>${hLive(h)?`<span class="due soon">now</span>`:""}</div></div></button>`}
function renderHangouts(){
  const dis=!S.db||!S.canWrite;["hg-now","hg-add","poll-add"].forEach(id=>$(id).disabled=dis);
  document.querySelectorAll("[data-ht]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.ht===S.hangTab));
  $("hg-col").classList.toggle("off",S.hangTab!=="plans");$("poll-col").classList.toggle("off",S.hangTab!=="polls");
  $("hg-filter").innerHTML=[["study","Study"],["outing","Outings"]].map(([k,l])=>`<button type="button" class="chip t-${k}" data-hf="${k}" aria-pressed="${!!S.hfilter[k]}">${l}</button>`).join("");
  const plans=S.hang.filter(h=>h.kind!=="poll"&&S.hfilter[h.kind]);
  const up=plans.filter(h=>!hPast(h)).sort((a,b)=>(a.date+(a.time||"")).localeCompare(b.date+(b.time||"")));
  const past=plans.filter(hPast).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,10);
  $("hg-list").innerHTML=(up.length?up.map(hangCard).join(""):`<div class="empty">${S.db?"No plans yet. Tap “I'm studying now” to let people know where you are, or plan an outing.":"Loading…"}</div>`)
    +(past.length?`<details><summary class="group-label" style="cursor:pointer">Past · ${past.length}</summary><div class="col">${past.map(hangCard).join("")}</div></details>`:"");
  const polls=S.hang.filter(h=>h.kind==="poll").sort((a,b)=>(a.closed?1:0)-(b.closed?1:0)||(b.createdAt||0)-(a.createdAt||0));
  $("poll-list").innerHTML=polls.length?polls.map(pollCard).join(""):`<div class="empty">${S.db?"No polls yet. Ask where to eat, when to meet, or which topic to revise.":"Loading…"}</div>`;
}
document.querySelector(".hang-seg").addEventListener("click",e=>{const b=e.target.closest("[data-ht]");if(b){S.hangTab=b.dataset.ht;renderHangouts()}});
function setHK(k){S.hkind=k;$("hg-form").className="sheet t-"+k;document.querySelectorAll("[data-hk]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.hk===k));
  $("h-title").placeholder=k==="study"?"e.g. Python lab revision before the quiz":"e.g. Pints at The Clubhouse after Friday's lecture";
  $("h-where").placeholder=k==="study"?"e.g. James Joyce Library, level 2":"e.g. Ranelagh";}
function openHangout(now){
  if(!S.db||!S.canWrite){toast("Ask the hub owner to invite you as an Editor to post");return}
  $("hg-form").reset();$("h-err").textContent="";setHK(S.hkind);$("h-date").value=addDays(today(),1);
  $("hg-heading").textContent="Plan for later";
  if(now){$("h-time").value=nowHM();$("h-title").value="Studying now, come join";const d=new Date();d.setHours(d.getHours()+2);$("h-until").value=pad(d.getHours())+":"+pad(d.getMinutes())}
  $("hg-overlay").hidden=false;focusSoon(now?$("h-where"):$("h-title"),"hg-overlay");
}
$("hg-now").onclick=()=>openNow();
const NOW_PLACES=["James Joyce Library","Smurfit building","Quinn School","Student Centre","Campus café","Somewhere else"];
const NOW_LONG=[["1 hour",60],["2 hours",120],["3 hours",180],["Till late",0]];
S.nowWhere=NOW_PLACES[0];S.nowLong=120;
function renderNowChips(){
  $("now-where").innerHTML=NOW_PLACES.map(p=>`<button type="button" class="t-study" data-nowwhere="${esc(p)}" aria-pressed="${p===S.nowWhere}">${esc(p)}</button>`).join("");
  $("now-long").innerHTML=NOW_LONG.map(([l,m])=>`<button type="button" class="t-study" data-nowlong="${m}" aria-pressed="${m===S.nowLong}">${l}</button>`).join("");
  $("now-other-row").hidden=S.nowWhere!=="Somewhere else";
}
function openNow(){if(!S.db||!S.canWrite){toast("Sign in to post");return}
  $("now-form").reset();$("now-err").textContent="";renderNowChips();$("now-overlay").hidden=false}
$("now-form").addEventListener("click",e=>{const w=e.target.closest("[data-nowwhere]");if(w){S.nowWhere=w.dataset.nowwhere;renderNowChips();if(S.nowWhere==="Somewhere else")$("now-other").focus();return}
  const l=e.target.closest("[data-nowlong]");if(l){S.nowLong=+l.dataset.nowlong;renderNowChips()}});
$("now-form").addEventListener("submit",async e=>{e.preventDefault();
  const where=S.nowWhere==="Somewhere else"?$("now-other").value.trim():S.nowWhere;if(!where)return $("now-err").textContent="Say where you are.";
  const start=nowHM();let until=null;if(S.nowLong){const d=new Date(Date.now()+S.nowLong*6e4);until=d.getDate()===new Date().getDate()?pad(d.getHours())+":"+pad(d.getMinutes()):"23:59"}
  const h={kind:"study",title:"Studying at "+where,where,date:today(),time:start,until,cap:null,body:$("now-note").value.trim(),going:S.me?{[S.me]:Date.now()}:{},authorId:S.me,createdAt:Date.now()};
  $("now-save").disabled=true;
  try{await S.db.collection("hangouts").add(h);$("now-overlay").hidden=true;toast("You're on the map · +3 points");S.hangTab="plans";go("hangouts")}catch(err){$("now-err").textContent=writeErr(err)}finally{$("now-save").disabled=false}});
$("hg-add").onclick=()=>openHangout(false);
$("hk-seg").addEventListener("click",e=>{const b=e.target.closest("[data-hk]");if(b)setHK(b.dataset.hk)});
$("hg-form").addEventListener("submit",async e=>{e.preventDefault();
  const h={kind:S.hkind,title:$("h-title").value.trim(),where:$("h-where").value.trim(),date:$("h-date").value,time:$("h-time").value||null,until:$("h-until").value||null,
    cap:+$("h-cap").value||null,body:$("h-body").value.trim(),going:S.me?{[S.me]:Date.now()}:{},authorId:S.me,createdAt:Date.now()};
  if(!h.title)return $("h-err").textContent="Say what it is.";
  if(!h.date)return $("h-err").textContent="Pick a date.";
  if(h.time&&h.until&&h.until<h.time)return $("h-err").textContent="The end time has to be after the start time.";
  $("h-save").disabled=true;
  try{await S.db.collection("hangouts").add(h);$("hg-overlay").hidden=true;toast("Posted · +3 points. You're down as going.");S.hangTab="plans";go("hangouts")}catch(err){$("h-err").textContent=writeErr(err)}finally{$("h-save").disabled=false}
});
function optInput(v){return `<input type="text" maxlength="60" value="${esc(v||"")}" placeholder="Option">`}
function openPoll(){if(!S.db||!S.canWrite)return;$("poll-form").reset();$("q-err").textContent="";$("q-opts").innerHTML=optInput()+optInput();$("poll-overlay").hidden=false;focusSoon($("q-text"),"poll-overlay")}
$("poll-add").onclick=openPoll;
$("q-more").onclick=()=>{const n=$("q-opts").children.length;if(n>=6)return toast("Six options is the most");$("q-opts").insertAdjacentHTML("beforeend",optInput());$("q-opts").lastElementChild.focus()};
$("poll-form").addEventListener("submit",async e=>{e.preventDefault();
  const opts=[...$("q-opts").querySelectorAll("input")].map(i=>i.value.trim()).filter(Boolean);const q=$("q-text").value.trim();
  if(!q)return $("q-err").textContent="Write the question.";
  if(opts.length<2)return $("q-err").textContent="Add at least two options.";
  $("q-save").disabled=true;
  try{await S.db.collection("hangouts").add({kind:"poll",title:q,options:opts,votes:{},closed:false,authorId:S.me,createdAt:Date.now()});$("poll-overlay").hidden=true;toast("Poll posted · +2 points");S.hangTab="polls";go("hangouts")}
  catch(err){$("q-err").textContent=writeErr(err)}finally{$("q-save").disabled=false}
});
document.addEventListener("click",async e=>{
  const f=e.target.closest("[data-hf]");if(f){S.hfilter[f.dataset.hf]=!S.hfilter[f.dataset.hf];renderHangouts();return}
  const j=e.target.closest("[data-join]");
  if(j){const h=S.hang.find(x=>x.id===j.dataset.join);if(!h||!S.me)return;const on=h.going&&h.going[S.me];
    try{await S.db.doc("hangouts/"+h.id).update({going:{[S.me]:on?false:Date.now()}});toast(on?"You've left":"You're going · +1 point")}catch(err){toast(writeErr(err))}return}
  const v=e.target.closest("[data-vote]");
  if(v){if(!S.me)return;try{await S.db.doc("hangouts/"+v.dataset.vote).update({votes:{[S.me]:+v.dataset.i}})}catch(err){toast(writeErr(err))}return}
  const c=e.target.closest("[data-pclose]");
  if(c){const h=S.hang.find(x=>x.id===c.dataset.pclose);if(h)try{await S.db.doc("hangouts/"+h.id).update({closed:!h.closed})}catch(err){toast(writeErr(err))}return}
  const d=e.target.closest("[data-hdel]");
  if(d){if(!armDelete(d,"Tap again to delete"))return;
    try{await S.db.doc("hangouts/"+d.dataset.hdel).delete();toast("Deleted")}catch(err){toast(writeErr(err))}}
});

/* ---------- games ---------- */
const WYR=[["Present a group project you've never seen","Write the whole report alone"],["Wi-Fi drops mid Brightspace submission","Laptop dies mid presentation"],
 ["Only Excel for the rest of the MSc","Only Python, no Stack Overflow"],["The 46A at rush hour every day","Walk to Smurfit in the rain every day"],
 ["A 9am lecture every day","A 6pm lecture every day"],["Ask a question at 4:59pm","Have your phone ring in the exam hall"],
 ["Free coffee for the year","Free printing for the year"],["Know every exam question","Know every interview question"],
 ["Spice bag every day for a week","Boojum every day for a week"],["Present your screen time to the class","Present your bank statement to your lecturer"],
 ["A group chat with 200 unread","An inbox with 200 unread"],["Every chart is a pie chart","Every table is in Comic Sans"],
 ["Answer every cold call in class","Lead every group meeting"],["Summer in Dublin","Summer back home"],
 ["Your code works but you don't know why","Your code fails and you know exactly why"],["Unlimited Uber rides","Unlimited takeaway"]];
const MLT=["fall asleep in a lecture","start the assignment two hours before the deadline","become a CEO","bring snacks for everyone","have 47 tabs open right now",
 "reply “per my last email”","get lost in the Quinn building","turn a coffee chat into a job offer","build a dashboard for their own life",
 "know the best pint in Dublin","send a meme during a serious discussion","be first into the library","make a pivot table to plan a dinner","win a hackathon","miss the last bus home"];
const FIB=["The real reason the group project is late: ___","My LinkedIn headline in ten years: ___","The worst thing to say in a case interview: ___",
 "Smurfit's newest module should be called ___","Dublin rent is so high that ___","The one dataset I never want leaked: ___","My lecturer's secret talent is ___",
 "The 46A was late because ___","A terrible name for an analytics startup: ___","If Excel had feelings it would say ___","My study playlist is just ___",
 "The R² of my life is low because ___","Our group chat is mostly ___"];
const TRIVIA=[["In a box plot, the line inside the box shows the…",["Mean","Median","Mode","Range"],1],["Which SQL clause filters groups after aggregation?",["WHERE","HAVING","GROUP BY","ORDER BY"],1],
 ["If p < 0.05, you usually…",["Accept the null","Reject the null","Delete the data","Add more columns"],1],["Python's go-to library for DataFrames?",["NumPy","pandas","Matplotlib","Flask"],1],
 ["KPI stands for…",["Key Performance Indicator","Known Profit Index","Key Planning Input","Kept Process Item"],0],["An R² of 1 means…",["No fit","A perfect fit","Negative correlation","Missing data"],1],
 ["Best chart for a trend over time?",["Pie","Line","Treemap","Radar"],1],["Dublin's name in Irish?",["Baile Átha Cliath","Corcaigh","Gaillimh","Port Láirge"],0],
 ["Which is a classification metric?",["RMSE","Precision","MAE","R²"],1],["ETL stands for…",["Extract, Transform, Load","Estimate, Test, Learn","Enter, Track, Log","Export, Table, List"],0],
 ["A Type I error is a…",["False positive","False negative","Sampling bias","Rounding error"],0],["Which join keeps every row from the left table?",["INNER","LEFT","RIGHT","CROSS"],1],
 ["The Pareto principle is also called the…",["80/20 rule","50/50 rule","Rule of 72","90/10 rule"],0],["Which Python type is immutable?",["list","dict","tuple","set"],2],
 ["CSV stands for…",["Comma-separated values","Column-sorted values","Coded string value","Common source view"],0],["Recall = TP / (TP + ?)",["FP","FN","TN","TP"],1],
 ["Standard deviation measures…",["Spread","Centre","Skew","Sample size"],0],["Excel function to look up a value down a column?",["VLOOKUP","SUMIF","CONCAT","TRIM"],0]];
const WORDS=["DASHBOARD","REGRESSION","DATAFRAME","PIVOT TABLE","SMURFIT","HYPOTHESIS","OUTLIER","VISUALISATION","CORRELATION","ALGORITHM","SPREADSHEET","LIFFEY","BLACKROCK","FORECAST","CLUSTERING","SPICE BAG"];
const CHAIN_START=["analytics","dublin","coffee","python","smurfit","dataset"];
const RPS={rock:"scissors",paper:"rock",scissors:"paper"};
const RPS_LABEL={rock:"Rock",paper:"Paper",scissors:"Scissors"};

const plist=g=>Object.entries(g.players||{}).filter(([,v])=>v).sort((a,b)=>a[1]-b[1]).map(([k])=>k);
const inGame=g=>!!(S.me&&g.players&&g.players[S.me]);
const R=g=>g.round||1;const rk=g=>"r"+R(g);
const at=(arr,g,r)=>arr[((g.seed||0)+(r||R(g))-1)%arr.length];
async function gupd(g,patch){if(!S.canWrite)return toast("Ask the hub owner to invite you as an Editor to play");
  try{await S.db.doc("games/"+g.id).update(Object.assign(patch,{updatedAt:Date.now()}))}catch(err){toast(writeErr(err))}}
const joinPatch=()=>S.me?{players:{[S.me]:Date.now()}}:{};
function scores(map,label){const rows=Object.entries(map).sort((a,b)=>b[1]-a[1]);if(!rows.length)return "";
  return `<div class="scores"><div class="group-label" style="margin:0">${esc(label||"Scores")}</div>${rows.map(([u,n])=>`<div class="score">${avHtml(u)}<span class="grow">${nm(u)}${u===S.me?" (you)":""}</span><b>${n}</b></div>`).join("")}</div>`}
function lineWin(b,w,h,n,empty){
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const c=b[y*w+x];if(c===empty)continue;
    for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){const cells=[];for(let k=0;k<n;k++){const xx=x+dx*k,yy=y+dy*k;if(xx<0||yy<0||xx>=w||yy>=h||b[yy*w+xx]!==c)break;cells.push(yy*w+xx)}
      if(cells.length===n)return {who:c,cells}}}
  return b.includes(empty)?null:{who:"draw",cells:[]};
}
function seatBar(g,seats,marks){
  return `<div class="seats">${seats.map(s=>{const u=g.seats&&g.seats[s];return `<div class="seat ${g.turn===s&&!g.winner?"turn":""}"><span class="mark" style="color:${marks[s]}">${s==="R"?"●":s==="Y"?"●":s}</span>
    ${u?`${avHtml(u)}<span>${nm(u)}${u===S.me?" (you)":""}</span>`:(mySeat(g)?`<span class="hint">Waiting for a player</span>`:`<button class="btn btn-primary btn-sm" type="button" data-act="sit" data-arg="${s}">Take this seat</button>`)}</div>`}).join("")}</div>`;
}
const mySeat=g=>Object.entries(g.seats||{}).find(([,u])=>u===S.me)?.[0]||null;
function boardGame(o){return {
  init:()=>({seats:{},board:o.empty.repeat(o.w*o.h),turn:o.first,winner:null,wins:{}}),
  view(g){const b=g.board||o.empty.repeat(o.w*o.h);const res=g.winner?lineWin(b,o.w,o.h,o.n,o.empty):null;const win=new Set(res?res.cells:[]);
    const both=g.seats&&g.seats[o.seats[0]]&&g.seats[o.seats[1]];const myTurn=both&&!g.winner&&g.seats[g.turn]===S.me;
    const status=g.winner?(g.winner==="draw"?"It's a draw":`${nm(g.seats[g.winner])} wins`):!both?"Waiting for two players":myTurn?"Your turn":`${nm(g.seats[g.turn])}'s turn`;
    const wins={};Object.entries(g.wins||{}).forEach(([u,n])=>wins[u]=n);
    return `${seatBar(g,o.seats,o.marks)}<div class="status">${status}</div>${o.board(b,myTurn,win)}
      ${g.winner&&mySeat(g)?`<button class="btn btn-primary" type="button" data-act="rematch">Rematch (swap sides)</button>`:""}${scores(wins,"Wins")}`},
  async act(g,a,arg){
    if(a==="sit"){if(mySeat(g)||(g.seats&&g.seats[arg]))return;return gupd(g,Object.assign({seats:{[arg]:S.me}},joinPatch()))}
    if(a==="move"){const b=g.board;if(g.winner||g.seats[g.turn]!==S.me)return;const idx=o.place(b,+arg);if(idx<0)return;
      const nb=b.slice(0,idx)+g.turn+b.slice(idx+1);const r=lineWin(nb,o.w,o.h,o.n,o.empty);
      const patch={board:nb,turn:g.turn===o.seats[0]?o.seats[1]:o.seats[0],winner:r?r.who:null};
      if(r&&r.who!=="draw")patch.wins={[S.me]:((g.wins||{})[S.me]||0)+1};return gupd(g,patch)}
    if(a==="rematch")return gupd(g,{board:o.empty.repeat(o.w*o.h),winner:null,turn:o.first,seats:{[o.seats[0]]:g.seats[o.seats[1]]||null,[o.seats[1]]:g.seats[o.seats[0]]||null}});
  }}}

const GAMES={
 ttt:Object.assign({name:"Tic-Tac-Toe",who:"2 players",blurb:"The classic. Swap sides on rematch, keep score all week.",c:"var(--event)"},
   boardGame({w:3,h:3,n:3,empty:" ",seats:["X","O"],first:"X",marks:{X:"var(--event)",O:"var(--study)"},place:(b,i)=>b[i]===" "?i:-1,
     board:(b,my,win)=>`<div class="ttt">${[...b].map((c,i)=>`<button type="button" class="${c==="X"?"x":c==="O"?"o":""} ${win.has(i)?"win":""}" data-act="move" data-arg="${i}" ${!my||c!==" "?"disabled":""} aria-label="Square ${i+1}">${c.trim()}</button>`).join("")}</div>`})),
 c4:Object.assign({name:"Connect Four",who:"2 players",blurb:"Drop discs, line up four. Harder than it looks after a 9am.",c:"var(--study)"},
   boardGame({w:7,h:6,n:4,empty:".",seats:["R","Y"],first:"R",marks:{R:"var(--event)",Y:"var(--accent-2)"},
     place:(b,col)=>{for(let r=5;r>=0;r--)if(b[r*7+col]===".")return r*7+col;return -1},
     board:(b,my,win)=>`<div class="c4">${[...b].map((c,i)=>`<button type="button" class="${c!=="."?c:""} ${win.has(i)?"win":""}" data-act="move" data-arg="${i%7}" ${!my?"disabled":""} aria-label="Column ${i%7+1}"></button>`).join("")}</div>`})),
 rps:{name:"Rock Paper Scissors",who:"2 players",blurb:"First to three. Settle who presents the group slides.",c:"var(--job)",
   init:()=>({seats:{},match:1,round:1,picks:{}}),
   key:g=>`m${g.match||1}r${R(g)}`,
   tally(g){const s={};const A=g.seats.A,B=g.seats.B;for(let r=1;r<=R(g);r++){const p=(g.picks||{})[`m${g.match||1}r${r}`]||{};if(!p[A]||!p[B])continue;
     if(RPS[p[A]]===p[B])s[A]=(s[A]||0)+1;else if(RPS[p[B]]===p[A])s[B]=(s[B]||0)+1}return s},
   view(g){const A=g.seats&&g.seats.A,B=g.seats&&g.seats.B;const seat=mySeat(g);
     let html=seatBar(g,["A","B"],{A:"var(--job)",B:"var(--games)"});if(!A||!B)return html+`<div class="status">Waiting for two players</div>`;
     const p=(g.picks||{})[this.key(g)]||{};const sc=this.tally(g);const champ=[A,B].find(u=>(sc[u]||0)>=3);
     if(champ)return html+`<div class="status">${nm(champ)} wins the match ${sc[champ]}–${sc[champ===A?B:A]||0}</div>${seat?`<button class="btn btn-primary" type="button" data-act="rematch">New match</button>`:""}`;
     html+=`<div class="hint">Round ${R(g)} · ${nm(A)} ${sc[A]||0} – ${sc[B]||0} ${nm(B)}</div>`;
     if(p[A]&&p[B]){const w=RPS[p[A]]===p[B]?A:RPS[p[B]]===p[A]?B:null;
       return html+`<div class="status">${nm(A)}: ${RPS_LABEL[p[A]]} · ${nm(B)}: ${RPS_LABEL[p[B]]}</div><div class="prompt">${w?nm(w)+" takes the round":"Draw"}</div>${seat?`<button class="btn btn-primary" type="button" data-act="next">Next round</button>`:""}`}
     if(!seat)return html+`<div class="status">Players are choosing…</div>`;
     if(p[S.me])return html+`<div class="status">You picked ${RPS_LABEL[p[S.me]]}. Waiting for your opponent…</div>`;
     return html+`<div class="status">Pick one</div><div class="choices">${Object.keys(RPS).map(k=>`<button class="choice" type="button" data-act="pick" data-arg="${k}">${RPS_LABEL[k]}</button>`).join("")}</div>`},
   act(g,a,arg){if(a==="sit"){if(mySeat(g)||(g.seats&&g.seats[arg]))return;return gupd(g,Object.assign({seats:{[arg]:S.me}},joinPatch()))}
     if(a==="pick"&&mySeat(g))return gupd(g,{picks:{[this.key(g)]:{[S.me]:arg}}});
     if(a==="next")return gupd(g,{round:R(g)+1});
     if(a==="rematch")return gupd(g,{match:(g.match||1)+1,round:1})}},
 wyr:{name:"Would You Rather",who:"Whole class",blurb:"Impossible student-life dilemmas. See how the class splits.",c:"var(--outing)",
   init:()=>({round:1}),
   view(g){const [a,b]=at(WYR,g);const v=(g.votes||{})[rk(g)]||{};const mine=v[S.me];const ids=Object.keys(v);const n=ids.length;
     const cnt=k=>ids.filter(i=>v[i]===k).length;const show=!!mine;
     const opt=(k,t)=>`<button class="choice ${mine===k?"mine":""}" type="button" data-act="vote" data-arg="${k}">${show?`<span class="fill" style="height:${n?Math.round(cnt(k)/n*100):0}%"></span>`:""}${esc(t)}
       ${show?`<small>${n?Math.round(cnt(k)/n*100):0}% · ${ids.filter(i=>v[i]===k).slice(0,4).map(i=>nm(i)).join(", ")}${cnt(k)>4?"…":""}</small>`:""}</button>`;
     return `<div class="hint">Question ${R(g)}</div><div class="prompt">Would you rather…</div><div class="choices">${opt("a",a)}${opt("b",b)}</div>
       <div class="hint">${n} answered${show?"":" · vote to see the split"}</div>${show?`<button class="btn btn-primary" type="button" data-act="next">Next question</button>`:""}`},
   act(g,a,arg){if(a==="vote")return gupd(g,Object.assign({votes:{[rk(g)]:{[S.me]:arg}}},joinPatch()));if(a==="next")return gupd(g,{round:R(g)+1})}},
 mlt:{name:"Most Likely To",who:"3+ players",blurb:"Vote for the classmate most likely to… Join first so you're on the ballot.",c:"var(--exam)",
   init:()=>({round:1}),
   view(g){const pl=plist(g);if(pl.length<2)return `<div class="status">Need at least two players. Everyone taps Join, then vote.</div>`;
     const v=(g.votes||{})[rk(g)]||{};const mine=v[S.me];const n=Object.keys(v).length;const cnt={};Object.values(v).forEach(t=>cnt[t]=(cnt[t]||0)+1);
     const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];
     return `<div class="hint">Round ${R(g)}</div><div class="prompt">Who's most likely to ${esc(at(MLT,g))}?</div>
       <div class="choices">${pl.map(u=>`<button class="choice ${mine===u?"mine":""}" type="button" data-act="vote" data-arg="${esc(u)}" ${inGame(g)?"":"disabled"}>
         ${mine?`<span class="fill" style="height:${n?Math.round((cnt[u]||0)/n*100):0}%"></span>`:""}${nm(u)}${mine?`<small>${cnt[u]||0} vote${cnt[u]===1?"":"s"}</small>`:""}</button>`).join("")}</div>
       <div class="hint">${n} of ${pl.length} voted${mine&&top?` · leading: ${nm(top[0])}`:""}</div>${mine?`<button class="btn btn-primary" type="button" data-act="next">Next prompt</button>`:""}`},
   act(g,a,arg){if(a==="vote"&&inGame(g))return gupd(g,{votes:{[rk(g)]:{[S.me]:arg}}});if(a==="next")return gupd(g,{round:R(g)+1})}},
 ttl:{name:"Two Truths & a Lie",who:"3+ players",blurb:"Take turns. Write two truths and one lie, everyone guesses the lie.",c:"var(--assignment)",
   init:()=>({round:1}),
   tally(g){const s={};const pl=plist(g);for(let r=1;r<=R(g);r++){const k="r"+r;const st=(g.stmts||{})[k];if(!st||!(g.revealed||{})[k])continue;
     Object.entries((g.guesses||{})[k]||{}).forEach(([u,i])=>{if(i===st.lie)s[u]=(s[u]||0)+1;else s[st.by]=(s[st.by]||0)+1})}return s},
   view(g){const pl=plist(g);if(pl.length<2)return `<div class="status">Need at least two players. Tap Join to play.</div>`;
     const teller=pl[(R(g)-1)%pl.length];const st=(g.stmts||{})[rk(g)];const gs=(g.guesses||{})[rk(g)]||{};const rev=(g.revealed||{})[rk(g)];
     let html=`<div class="hint">Round ${R(g)} · ${nm(teller)}'s turn</div>`;
     if(!st){if(teller!==S.me)return html+`<div class="status">Waiting for ${nm(teller)} to write their statements…</div>${scores(this.tally(g))}`;
       return html+`<div class="status">Write two truths and one lie, then mark the lie</div><div class="ttl-form">${[0,1,2].map(i=>`<label><input type="radio" name="ttl-lie" id="ttl-lie-${i}" value="${i}" aria-label="Statement ${i+1} is the lie"><input type="text" id="ttl-${i}" maxlength="120" placeholder="Statement ${i+1}"></label>`).join("")}
         <span class="hint">The dot marks your lie. Classmates who want to cheat could find it in the page code, so keep it friendly.</span><button class="btn btn-primary" type="button" data-act="submit">Share with the class</button></div>`}
     html+=`<div class="prompt">Which one is the lie?</div><div class="choices" style="flex-direction:column;align-items:center">${st.s.map((t,i)=>{const cls=rev?(i===st.lie?"right":"wrong"):gs[S.me]===i?"mine":"";
       const who=rev?Object.keys(gs).filter(u=>gs[u]===i).map(nm).join(", "):"";
       return `<button class="choice ${cls}" style="max-width:520px;width:100%" type="button" data-act="guess" data-arg="${i}" ${rev||teller===S.me||!inGame(g)?"disabled":""}>${esc(t)}${who?`<small>${who}</small>`:""}</button>`}).join("")}</div>`;
     html+=`<div class="hint">${Object.keys(gs).length} of ${pl.length-1} guessed</div>`;
     if(!rev&&teller===S.me)html+=`<button class="btn btn-primary" type="button" data-act="reveal">Reveal the lie</button>`;
     if(rev)html+=`<button class="btn btn-primary" type="button" data-act="next">Next player</button>`;
     return html+scores(this.tally(g))},
   act(g,a,arg){if(a==="submit"){const s=[0,1,2].map(i=>$("ttl-"+i).value.trim());const lie=[0,1,2].find(i=>$("ttl-lie-"+i).checked);
       if(s.some(x=>!x))return toast("Fill in all three statements");if(lie===undefined)return toast("Mark which one is the lie");
       return gupd(g,{stmts:{[rk(g)]:{s,lie,by:S.me}}})}
     if(a==="guess"&&inGame(g))return gupd(g,{guesses:{[rk(g)]:{[S.me]:+arg}}});
     if(a==="reveal")return gupd(g,{revealed:{[rk(g)]:true}});if(a==="next")return gupd(g,{round:R(g)+1})}},
 fib:{name:"Fill the Blank",who:"3+ players",blurb:"Everyone writes the funniest answer, then votes. Quiplash, Smurfit edition.",c:"var(--poll)",
   init:()=>({round:1}),
   tally(g){const s={};for(let r=1;r<=R(g);r++){const k="r"+r;if(!(g.revealed||{})[k])continue;Object.values((g.votes||{})[k]||{}).forEach(u=>s[u]=(s[u]||0)+1)}return s},
   view(g){const k=rk(g);const ans=(g.answers||{})[k]||{};const voting=(g.voting||{})[k];const rev=(g.revealed||{})[k];const v=(g.votes||{})[k]||{};
     const authors=Object.keys(ans).sort((a,b)=>(a+k).localeCompare(b+k));const cnt={};Object.values(v).forEach(u=>cnt[u]=(cnt[u]||0)+1);
     let html=`<div class="hint">Round ${R(g)}</div><div class="prompt">${esc(at(FIB,g))}</div>`;
     if(!voting){html+=`<div class="game-input"><input id="fib-ans" maxlength="90" placeholder="${ans[S.me]?"Change your answer":"Your answer"}" aria-label="Your answer"><button class="btn btn-primary" type="button" data-act="answer">${ans[S.me]?"Update":"Submit"}</button></div>
       <div class="hint">${authors.length} answer${authors.length===1?"":"s"} in${ans[S.me]?` · yours: “${esc(ans[S.me])}”`:""}</div>
       ${authors.length>=2?`<button class="btn btn-plain" type="button" data-act="vote-open">Everyone's in, start voting</button>`:""}`;return html+scores(this.tally(g))}
     html+=`<div class="choices" style="flex-direction:column;align-items:center">${authors.map(u=>`<button class="choice ${v[S.me]===u?"mine":""} ${rev&&cnt[u]===Math.max(...Object.values(cnt))?"right":""}" style="max-width:520px;width:100%" type="button" data-act="vote" data-arg="${esc(u)}" ${rev||u===S.me?"disabled":""}>
       ${esc(ans[u])}${rev?`<small>${nm(u)} · ${cnt[u]||0} vote${cnt[u]===1?"":"s"}</small>`:u===S.me?`<small>your answer</small>`:""}</button>`).join("")}</div>
       <div class="hint">${Object.keys(v).length} voted</div>${rev?`<button class="btn btn-primary" type="button" data-act="next">Next prompt</button>`:`<button class="btn btn-plain" type="button" data-act="reveal">Reveal who wrote what</button>`}`;
     return html+scores(this.tally(g))},
   act(g,a,arg){const k=rk(g);if(a==="answer"){const t=$("fib-ans").value.trim();if(!t)return;$("fib-ans").value="";return gupd(g,Object.assign({answers:{[k]:{[S.me]:t.slice(0,90)}}},joinPatch()))}
     if(a==="vote-open")return gupd(g,{voting:{[k]:true}});if(a==="vote")return gupd(g,Object.assign({votes:{[k]:{[S.me]:arg}}},joinPatch()));
     if(a==="reveal")return gupd(g,{revealed:{[k]:true}});if(a==="next")return gupd(g,{round:R(g)+1})}},
 trivia:{name:"Trivia Race",who:"Whole class",blurb:"Analytics and Dublin questions. Fastest correct answer gets a bonus point.",c:"var(--update)",
   init:()=>({round:1}),
   tally(g){const s={};for(let r=1;r<=R(g);r++){const k="r"+r;if(!(g.revealed||{})[k])continue;const q=at(TRIVIA,g,r);
     const right=Object.entries((g.answers||{})[k]||{}).filter(([,x])=>x.i===q[2]).sort((a,b)=>a[1].t-b[1].t);right.forEach(([u],j)=>s[u]=(s[u]||0)+(j===0?2:1))}return s},
   view(g){const k=rk(g);const [q,opts,ans]=at(TRIVIA,g);const a=(g.answers||{})[k]||{};const mine=a[S.me];const rev=(g.revealed||{})[k];
     const right=Object.entries(a).filter(([,x])=>x.i===ans).sort((x,y)=>x[1].t-y[1].t);
     return `<div class="hint">Question ${R(g)}</div><div class="prompt">${esc(q)}</div>
       <div class="choices">${opts.map((o,i)=>`<button class="choice ${rev?(i===ans?"right":"wrong"):mine&&mine.i===i?"mine":""}" type="button" data-act="answer" data-arg="${i}" ${mine||rev?"disabled":""}>${esc(o)}${rev?`<small>${Object.values(a).filter(x=>x.i===i).length} picked</small>`:""}</button>`).join("")}</div>
       <div class="hint">${Object.keys(a).length} answered${rev&&right.length?` · fastest: ${nm(right[0][0])} (+2)`:""}</div>
       ${rev?`<button class="btn btn-primary" type="button" data-act="next">Next question</button>`:mine?`<button class="btn btn-plain" type="button" data-act="reveal">Reveal the answer</button>`:""}${scores(this.tally(g),"Leaderboard")}`},
   act(g,a,arg){const k=rk(g);if(a==="answer"&&!((g.answers||{})[k]||{})[S.me])return gupd(g,Object.assign({answers:{[k]:{[S.me]:{i:+arg,t:Date.now()}}}},joinPatch()));
     if(a==="reveal")return gupd(g,{revealed:{[k]:true}});if(a==="next")return gupd(g,{round:R(g)+1})}},
 hang:{name:"Hangman",who:"Whole class",blurb:"Guess the analytics (or Dublin) word together before the drawing is done.",c:"var(--event)",
   init:()=>({round:1}),
   view(g){const w=at(WORDS,g);const gs=(g.guessed||{})[rk(g)]||{};const miss=Object.keys(gs).filter(l=>!w.includes(l));const MAX=6;
     const won=[...w].every(c=>c===" "||gs[c]);const lost=miss.length>=MAX;
     const parts=['<circle cx="70" cy="34" r="10"/>','<line x1="70" y1="44" x2="70" y2="74"/>','<line x1="70" y1="52" x2="56" y2="64"/>','<line x1="70" y1="52" x2="84" y2="64"/>','<line x1="70" y1="74" x2="58" y2="94"/>','<line x1="70" y1="74" x2="82" y2="94"/>'];
     const svg=`<svg viewBox="0 0 120 110" width="140" height="128" fill="none" stroke="var(--ink)" stroke-width="3" stroke-linecap="round" aria-label="${miss.length} of ${MAX} wrong guesses"><line x1="10" y1="104" x2="110" y2="104"/><line x1="30" y1="104" x2="30" y2="8"/><line x1="30" y1="8" x2="70" y2="8"/><line x1="70" y1="8" x2="70" y2="24"/>${parts.slice(0,miss.length).join("")}</svg>`;
     const sc={};Object.entries(gs).forEach(([l,u])=>{if(w.includes(l))sc[u]=(sc[u]||0)+1});
     return `<div class="hint">Word ${R(g)} · ${miss.length} of ${MAX} wrong</div>${svg}<div class="word">${[...w].map(c=>c===" "?"&nbsp;&nbsp;":(gs[c]||lost?c:"_")).join(" ")}</div>
       ${won?`<div class="status">Solved!</div>`:lost?`<div class="status">Out of guesses</div>`:""}
       ${won||lost?`<button class="btn btn-primary" type="button" data-act="next">New word</button>`:`<div class="kbd">${"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(l=>`<button type="button" class="${gs[l]?(w.includes(l)?"hit":"miss"):""}" data-act="guess" data-arg="${l}" ${gs[l]?"disabled":""}>${l}</button>`).join("")}</div>`}
       ${scores(sc,"Letters found this word")}`},
   act(g,a,arg){if(a==="guess")return gupd(g,Object.assign({guessed:{[rk(g)]:{[arg]:S.me}}},joinPatch()));if(a==="next")return gupd(g,{round:R(g)+1})}},
 chain:{name:"Word Chain",who:"Whole class",blurb:"Each word starts with the last letter of the one before. No repeats.",c:"var(--accent)",
   init:()=>({words:{t0:{w:CHAIN_START[Math.floor(Math.random()*CHAIN_START.length)],uid:null,t:0}}}),
   list:g=>Object.values(g.words||{}).sort((a,b)=>a.t-b.t),
   view(g){const ws=this.list(g);const last=ws[ws.length-1].w;const sc={};ws.forEach(x=>{if(x.uid)sc[x.uid]=(sc[x.uid]||0)+1});
     return `<div class="hint">${ws.length} words so far</div><div class="chain-list">${ws.slice(-40).map(x=>`<span title="${x.uid?nm(x.uid):"Start"}">${esc(x.w)}</span>`).join("")}</div>
       <div class="status">Next word starts with “${esc(last.slice(-1).toUpperCase())}”</div>
       <div class="game-input"><input id="chain-in" maxlength="24" placeholder="Type a word" aria-label="Your word" autocomplete="off"><button class="btn btn-primary" type="button" data-act="add">Add</button></div>${scores(sc,"Most words")}`},
   act(g,a){if(a!=="add")return;const w=$("chain-in").value.trim().toLowerCase();const ws=this.list(g);const last=ws[ws.length-1].w;
     if(!/^[a-z]{2,24}$/.test(w))return toast("Letters only, at least two");
     if(w[0]!==last.slice(-1))return toast(`It has to start with “${last.slice(-1).toUpperCase()}”`);
     if(ws.some(x=>x.w===w))return toast("Someone already used that one");
     $("chain-in").value="";const t=Date.now();return gupd(g,Object.assign({words:{["t"+t+"_"+Math.random().toString(36).slice(2,6)]:{w,uid:S.me,t}}},joinPatch()))}}
};
const SEATED={ttt:1,c4:1,rps:1};
function liveRow(x){const def=GAMES[x.kind];const pl=plist(x);
  return `<div class="live-row" style="--c:${def.c}"><div class="grow"><b>${esc(def.name)}</b><div class="going">${pl.length?stack(pl,5):""}<span>${pl.length} playing · by ${nm(x.createdBy)}</span></div></div>
    <button class="btn btn-c btn-sm" type="button" data-goto="games:${esc(x.id)}">${inGame(x)?"Back in":"Join"}</button></div>`}
const WIN={primed:{},seen:new Set()};
function renderGames(){
  const g=S.gameOpen&&S.games.find(x=>x.id===S.gameOpen);
  $("games-lobby").hidden=!!g;$("game-view").hidden=!g;
  if(g&&S.gamePending&&S.gamePending.id===g.id)S.gamePending=null;
  if(!g&&S.gamePending&&S.gamePending.id===S.gameOpen&&Date.now()-S.gamePending.at<8000){$("games-lobby").hidden=true;$("game-view").hidden=false;$("game-view").innerHTML=`<div class="empty">Starting the game…</div>`;setTimeout(()=>{if(S.screen==="games")renderGames()},400);return}
  if(!g){if(S.gameOpen&&S.loaded){S.gameOpen=null;S.gamePending=null;toast("That game has ended");render();return}
    const live=liveGames();
    $("live-games").innerHTML=live.length?`<div class="h-sec t-games"><h2><span class="dot"></span>Live now</h2><span class="tag">${live.length}</span></div><div class="list">${live.slice(0,8).map(liveRow).join("")}</div>`:"";
    $("tiles").innerHTML=Object.entries(GAMES).map(([k,d])=>`<div class="tile" style="--c:${d.c}"><span class="who-plays">${esc(d.who)}</span><h3 class="ct">${esc(d.name)}</h3><p>${esc(d.blurb)}</p>
      <button class="btn btn-sm" type="button" data-start="${k}" ${!S.db||!S.canWrite?"disabled":""}>Start</button></div>`).join("");
    return}
  const def=GAMES[g.kind];const v=$("game-view");
  const keep={};v.querySelectorAll("input[id],textarea[id]").forEach(el=>keep[el.id]=el.type==="radio"?el.checked:el.value);const foc=document.activeElement&&v.contains(document.activeElement)?document.activeElement.id:null;
  const pl=plist(g);const canEnd=S.canWrite&&(isMod()||g.createdBy===S.me);
  v.innerHTML=`<div class="game" style="--c:${def.c}">
    <div class="row"><div class="going">${pl.length?stack(pl,8):""}<span>${pl.length?pl.slice(0,4).map(nm).join(", ")+(pl.length>4?` +${pl.length-4}`:""):"No players yet"}</span></div>
      <span>${!inGame(g)&&!SEATED[g.kind]&&S.canWrite?`<button class="btn btn-c btn-sm" type="button" data-gjoin>Join</button>`:""}${canEnd?`<button class="btn btn-danger" type="button" data-gend>End game</button>`:""}</span></div>
    <div class="game-stage">${def.view(g)}</div>
    <div class="hint" style="text-align:center">${esc(def.blurb)}</div></div>`;
  Object.entries(keep).forEach(([id,val])=>{const el=$(id);if(!el)return;if(el.type==="radio")el.checked=val;else el.value=val});
  if(foc&&$(foc))$(foc).focus();
  const w=def.win?def.win(g):null;
  if(!WIN.primed[g.id]){WIN.primed[g.id]=true;if(w)WIN.seen.add(w.key)}
  else if(w&&!WIN.seen.has(w.key)){WIN.seen.add(w.key);celebrate(w)}
}
$("s-games").addEventListener("click",async e=>{
  const st=e.target.closest("[data-start]");
  if(st){if(!S.db||!S.canWrite)return;const k=st.dataset.start;st.disabled=true;
    try{const ref=await S.db.collection("games").add(Object.assign({kind:k,createdBy:S.me,createdAt:Date.now(),updatedAt:Date.now(),seed:Math.floor(Math.random()*1000),players:S.me?{[S.me]:Date.now()}:{}},GAMES[k].init()));
      S.gameOpen=ref.id;S.gamePending={id:ref.id,at:Date.now()};render();toast("Game started. Tell the class in chat!")}catch(err){toast(writeErr(err))}finally{st.disabled=false}return}
  const g=S.gameOpen&&S.games.find(x=>x.id===S.gameOpen);if(!g)return;
  if(e.target.closest("[data-gjoin]"))return gupd(g,joinPatch());
  const end=e.target.closest("[data-gend]");
  if(end){if(!armDelete(end,"Tap again to end"))return;try{await S.db.doc("games/"+g.id).delete();S.gameOpen=null;render();toast("Game ended")}catch(err){toast(writeErr(err))}return}
  const a=e.target.closest("[data-act]");if(a&&S.me)GAMES[g.kind].act(g,a.dataset.act,a.dataset.arg,a);
});
$("s-games").addEventListener("keydown",e=>{if(e.key!=="Enter")return;if(e.target.id==="fib-ans"||e.target.id==="chain-in"){e.preventDefault();e.target.nextElementSibling.click()}});

/* ---------- winner effects ---------- */
const boardWin=g=>{if(!g.winner)return null;if(g.winner==="draw")return {key:g.id+":"+g.board,title:"It's a draw",sub:"Rematch?",mine:false,quiet:true};
  const u=g.seats&&g.seats[g.winner];return {key:g.id+":"+g.board,title:u===S.me?"You win!":nameOf(u)+" wins!",sub:u===S.me?"Victory lap time.":"Rematch to get them back.",mine:u===S.me}};
GAMES.ttt.win=boardWin;GAMES.c4.win=boardWin;
GAMES.rps.win=function(g){if(!g.seats||!g.seats.A||!g.seats.B)return null;const sc=this.tally(g);const champ=[g.seats.A,g.seats.B].find(u=>(sc[u]||0)>=3);if(!champ)return null;
  return {key:g.id+":m"+(g.match||1),title:champ===S.me?"Match won!":nameOf(champ)+" wins the match",sub:"First to three",mine:champ===S.me}};
GAMES.trivia.win=function(g){const k=rk(g);if(!(g.revealed||{})[k])return null;const [,,ans]=at(TRIVIA,g);const a=(g.answers||{})[k]||{};
  const right=Object.entries(a).filter(([,x])=>x.i===ans).sort((x,y)=>x[1].t-y[1].t);if(!right.length)return {key:g.id+k,title:"Nobody got it",sub:"Next one's yours",mine:false,quiet:true};
  const f=right[0][0];const meRight=right.some(([u])=>u===S.me);return {key:g.id+k,title:f===S.me?"Fastest finger!":meRight?"Correct!":nameOf(f)+" was fastest",sub:f===S.me?"+2 points":meRight?"+1 point":"",mine:meRight}};
GAMES.fib.win=function(g){const k=rk(g);if(!(g.revealed||{})[k])return null;const cnt={};Object.values((g.votes||{})[k]||{}).forEach(u=>cnt[u]=(cnt[u]||0)+1);
  const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];if(!top)return null;return {key:g.id+k,title:top[0]===S.me?"The class loved yours!":nameOf(top[0])+" takes the round",sub:top[1]+" vote"+(top[1]===1?"":"s"),mine:top[0]===S.me}};
GAMES.hang.win=function(g){const w=at(WORDS,g);const gs=(g.guessed||{})[rk(g)]||{};if(![...w].every(c=>c===" "||gs[c]))return null;return {key:g.id+rk(g),title:"Solved!",sub:w,mine:true}};
GAMES.ttl.win=function(g){const k=rk(g);if(!(g.revealed||{})[k])return null;const st=(g.stmts||{})[k];const my=((g.guesses||{})[k]||{})[S.me];
  if(st&&st.by===S.me){const fooled=Object.values((g.guesses||{})[k]||{}).filter(i=>i!==st.lie).length;return {key:g.id+k,title:fooled?`You fooled ${fooled}!`:"They saw right through you",sub:"",mine:fooled>0,quiet:!fooled}}
  return my===undefined?null:{key:g.id+k,title:my===st.lie?"You spotted the lie!":"Fooled you",sub:"",mine:my===st.lie,quiet:my!==st.lie}};
GAMES.mlt.win=function(g){const v=(g.votes||{})[rk(g)]||{};const pl=plist(g);if(pl.length<2||Object.keys(v).length<pl.length)return null;const cnt={};Object.values(v).forEach(u=>cnt[u]=(cnt[u]||0)+1);
  const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];return {key:g.id+rk(g),title:top[0]===S.me?"The class chose you":nameOf(top[0])+" it is",sub:"Most likely to "+at(MLT,g),mine:top[0]===S.me}};
const reduceMotion=()=>window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
function celebrate(w){
  const b=$("win-banner");b.className="win-banner"+(w.mine?"":" them");$("win-title").textContent=w.title;$("win-sub").textContent=w.sub||"";b.hidden=false;
  clearTimeout(celebrate.t);celebrate.t=setTimeout(()=>b.hidden=true,2800);
  if(w.quiet||reduceMotion())return;confetti(w.mine?180:70);
}
function confetti(n){
  const cv=$("fx");cv.hidden=false;const dpr=Math.min(2,window.devicePixelRatio||1);const W=cv.width=innerWidth*dpr,H=cv.height=innerHeight*dpr;const ctx=cv.getContext("2d");
  const cs=getComputedStyle(document.documentElement);const cols=["--accent-2","--event","--study","--job","--games","--exam","--poll"].map(v=>cs.getPropertyValue(v).trim()||"#FFC53D");
  const ps=Array.from({length:n},(_,i)=>({x:W*(i%2?0.15:0.85)+(Math.random()-.5)*W*.2,y:H*0.62,vx:(i%2?1:-1)*(2+Math.random()*7)*dpr,vy:-(11+Math.random()*9)*dpr,
    w:(6+Math.random()*6)*dpr,h:(9+Math.random()*8)*dpr,r:Math.random()*6,vr:(Math.random()-.5)*.35,c:cols[i%cols.length]}));
  const start=performance.now();cancelAnimationFrame(confetti.raf);
  (function frame(t){ctx.clearRect(0,0,W,H);const age=t-start;
    ps.forEach(p=>{p.vy+=.38*dpr;p.vx*=.992;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.globalAlpha=Math.max(0,1-age/2600);ctx.fillStyle=p.c;ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h*Math.abs(Math.cos(p.r*2)));ctx.restore()});
    if(age<2600)confetti.raf=requestAnimationFrame(frame);else{ctx.clearRect(0,0,W,H);cv.hidden=true}})(start);
}


document.addEventListener("click",e=>{if(e.target.closest("[data-signout]")&&window.hubAuth&&window.hubAuth.signOut)window.hubAuth.signOut();
  const r=e.target.closest("[data-demo-reset]");if(r&&armDelete(r,"Tap again to reset")&&window.hubAuth&&window.hubAuth.reset)window.hubAuth.reset()});

/* ---------- sheet focus that never steals the cursor ---------- */
function focusSoon(el,ovId){setTimeout(()=>{const ov=$(ovId),a=document.activeElement;if(el&&ov&&!ov.hidden&&(!a||a===document.body||!ov.contains(a)))el.focus()},60)}
/* ---------- the + button slides away while scrolling down, back when scrolling up ---------- */
{let lastY=0;$("scroller").addEventListener("scroll",()=>{const y=$("scroller").scrollTop;if(Math.abs(y-lastY)<8)return;document.body.classList.toggle("fab-away",y>lastY&&y>80);lastY=y},{passive:true})}
/* ================= boot ================= */
$("dows").innerHTML=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=>`<div class="dow">${d.slice(0,window.innerWidth<640?1:3)}</div>`).join("");
render();
setInterval(()=>{if(document.hidden||document.querySelector("details[open]")||(document.activeElement&&/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)))return;
  if(S.screen==="home"||S.screen==="hangouts"||S.screen==="calendar")scheduleRender()},60000);
document.addEventListener("visibilitychange",()=>{if(!document.hidden)scheduleRender()});
(async()=>{
  const use=n=>window.HUB?window.HUB.use(n):(window.claude&&window.claude.use?window.claude.use(n):Promise.resolve(null));
  const [db,user]=await Promise.all([use("db"),use("user")]);S.db=db;S.user=user;
  if(user){S.me=await user.id();S.owner=await user.isOwner();S.canWrite=(await user.can("data.write"))!==false}
  showNotice();if(!db){render();return}
  const docs=snap=>snap.docs.map(d=>Object.assign({id:d.id},d.data()));
  const rerender=()=>scheduleRender();
  db.collection("posts").limit(1000).onSnapshot(s=>{S.posts=docs(s).map(norm).filter(p=>TYPES[p.type]&&(TYPES[p.type].kind==="none"||p.start));rerender();resolveNames()},()=>{});
  db.collection("messages").orderBy("createdAt","desc").limit(500).onSnapshot(s=>{S.msgs=docs(s);if(S.screen==="chat")renderChat();else if(S.screen==="class"||S.screen==="home")rerender();resolveNames()},()=>{});
  db.collection("members").onSnapshot(s=>{S.members=docs(s);rerender();resolveNames();maybeWelcome()},()=>{});
  db.collection("roster").onSnapshot(s=>{S.roster=docs(s);if(S.screen==="class")renderClass()},()=>{});
  db.doc("config/roles").onSnapshot(s=>{S.config=s.exists?s.data():null;rerender()},()=>{});
  db.collection("bans").onSnapshot(s=>{S.bans=docs(s);checkBanned();rerender()},()=>{});
  HOOKS.forEach(f=>f(db,docs));
  setTimeout(()=>{S.loaded=true},4000);
  if(S.owner){try{const g=await db.doc("config/roles").get();if(!g.exists)await db.doc("config/roles").set({ownerId:S.me,ambassadors:[],policy:DEFAULT_POLICY,updatedAt:Date.now()})}catch(e){}}
  if(S.me&&S.canWrite){try{const ref=db.doc("members/"+S.me);const g=await ref.get();if(!g.exists)await ref.set({joinedAt:Date.now()})}
    catch(err){if(err&&err.code==="invalid_argument"){S.canWrite=false;showNotice();render()}}}
})();
let welcomed=false;
function maybeWelcome(){if(welcomed||!S.me||store.get("hub.welcomed"))return;if(!member(S.me))return;
  welcomed=true;const first=nameOf(S.me).split(" ")[0];$("w-title").textContent=first&&first!=="Classmate"?`Welcome, ${first}!`:"Welcome to the Class Hub";
  $("w-email").textContent=emailOf(S.me)?"Signed in as "+emailOf(S.me):"";$("w-av").innerHTML=avHtml(S.me);$("welcome-overlay").hidden=false;}
})();

/* installable app: cache the app shell so it opens instantly and offline */
if(window.HUB_STANDALONE&&"serviceWorker" in navigator&&location.protocol==="https:"){window.addEventListener("load",()=>{navigator.serviceWorker.register("/sw.js").catch(()=>{})})}
