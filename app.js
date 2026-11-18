const DEFAULT_CONFIG = {
  general:{title:"Молодо не зелено!",tagline:"Время твоих историй",city:"Уфа",address:"ул. Гагарина, 59 · Актовый зал ЦО 159"},
  dates:{eventLocal:"2026-12-11T17:00",application:"2026-12-05",submission:"2026-12-07"},
  buttons:{
    apply:{label:"Подать заявку",url:"#apply",enabled:true},
    submit:{label:"Отправить работу",url:"#apply",enabled:true}
  }
};
let config=structuredClone(DEFAULT_CONFIG);
const $=s=>document.querySelector(s);
const getPath=(obj,path)=>path.split(".").reduce((v,k)=>v?.[k],obj);
const setPath=(obj,path,value)=>{const p=path.split(".");const last=p.pop();const target=p.reduce((v,k)=>v[k],obj);target[last]=value;};
function toast(message){const t=$("#toast");t.textContent=message;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2400)}
function parseUfaDate(value){
  // datetime-local in config is always interpreted as Ufa time (UTC+05:00),
  // regardless of the visitor's device timezone.
  const m=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value||"");
  if(!m)return NaN;
  return Date.UTC(+m[1],+m[2]-1,+m[3],+m[4]-5,+m[5]);
}
function formatDateRu(value){
  const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(value||"");
  if(!m)return value||"";
  const months=["ЯНВАРЯ","ФЕВРАЛЯ","МАРТА","АПРЕЛЯ","МАЯ","ИЮНЯ","ИЮЛЯ","АВГУСТА","СЕНТЯБРЯ","ОКТЯБРЯ","НОЯБРЯ","ДЕКАБРЯ"];
  return `${m[3]} ${months[+m[2]-1]} ${m[1]}`;
}
function applyConfig(){
  const links=[["#navApply","apply"],["#heroApply","apply"],["#mainApply","apply"],["#worksApply","submit"]];
  links.forEach(([selector,key])=>{const el=$(selector),b=config.buttons[key];el.textContent=b.label+" ↗";el.href=b.enabled?b.url:"#";el.classList.toggle("disabled",!b.enabled);el.style.opacity=b.enabled?"1":".45";el.style.pointerEvents=b.enabled?"auto":"none";el.setAttribute("aria-disabled",String(!b.enabled));});
  $("#applicationDay").textContent=(config.dates.application||"2026-12-05").slice(8,10);
  $("#submissionDay").textContent=(config.dates.submission||"2026-12-07").slice(8,10);
  $("#eventDateLabel").textContent=formatDateRu(config.dates.eventLocal).replace("T"," ");
  const time=(config.dates.eventLocal||"2026-12-11T17:00").slice(11,16);
  $("#eventTimeLabel").textContent=time;
  document.title=config.general.title+" — XV школьный медиафестиваль";
  $(".hero-sub").innerHTML=config.general.tagline+'<span class="gold-dot">.</span>';
  const venueText=$(".venue-copy>p:not(.lead)");
  if(venueText)venueText.innerHTML=`г. ${config.general.city}<br>${config.general.address}`;
}
function renderInputs(){
  document.querySelectorAll("[data-path]").forEach(el=>{const value=getPath(config,el.dataset.path);if(el.type==="checkbox")el.checked=!!value;else el.value=value??"";});
}
function readInputs(){document.querySelectorAll("[data-path]").forEach(el=>setPath(config,el.dataset.path,el.type==="checkbox"?el.checked:el.value));}
async function loadConfig(){try{const r=await fetch("config.json",{cache:"no-store"});if(r.ok){const remote=await r.json();config={...structuredClone(DEFAULT_CONFIG),...remote,general:{...DEFAULT_CONFIG.general,...remote.general},dates:{...DEFAULT_CONFIG.dates,...remote.dates},buttons:{...DEFAULT_CONFIG.buttons,...remote.buttons,apply:{...DEFAULT_CONFIG.buttons.apply,...remote.buttons?.apply},submit:{...DEFAULT_CONFIG.buttons.submit,...remote.buttons?.submit}}};}}catch(e){}try{const local=localStorage.getItem("molodo-config");if(local)config=JSON.parse(local);}catch(e){}renderInputs();applyConfig();}
function setDigit(id,value,animate=true){const el=document.getElementById(id);if(!el)return;const next=String(value).padStart(2,"0");if(el.textContent!==next){el.textContent=next;if(animate){el.classList.remove("flip");void el.offsetWidth;el.classList.add("flip");}}}
function countdown(){const target=parseUfaDate(config.dates.eventLocal);let diff=target-Date.now();if(!Number.isFinite(diff)||diff<=0)diff=0;const d=Math.floor(diff/86400000);diff%=86400000;const h=Math.floor(diff/3600000);diff%=3600000;const m=Math.floor(diff/60000);const s=Math.floor(diff%60000/1000);[["days",d],["hours",h],["minutes",m],["seconds",s],["heroDays",d],["heroHours",h],["heroMinutes",m],["heroSeconds",s]].forEach(([id,val])=>setDigit(id,val,id.toLowerCase().includes("second")));}
$("#adminOpen").addEventListener("click",()=>{$("#adminBackdrop").classList.add("open");document.body.style.overflow="hidden";renderInputs()});
function closeAdmin(){$("#adminBackdrop").classList.remove("open");document.body.style.overflow=""}
$("#adminClose").addEventListener("click",closeAdmin);$("#adminBackdrop").addEventListener("click",e=>{if(e.target===$("#adminBackdrop"))closeAdmin()});
document.querySelectorAll(".tab").forEach(tab=>tab.addEventListener("click",()=>{document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t===tab));document.querySelectorAll(".admin-content").forEach(c=>c.classList.add("hidden"));$("#tab-"+tab.dataset.tab).classList.remove("hidden")}));
$("#saveLocal").addEventListener("click",()=>{readInputs();localStorage.setItem("molodo-config",JSON.stringify(config));applyConfig();countdown();toast("Настройки сохранены в этом браузере")});
$("#downloadConfig").addEventListener("click",()=>{readInputs();const blob=new Blob([JSON.stringify(config,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="config.json";a.click();URL.revokeObjectURL(a.href);toast("config.json готов к загрузке на GitHub")});
$("#importConfig").addEventListener("change",async e=>{const f=e.target.files[0];if(!f)return;try{const data=JSON.parse(await f.text());config={...structuredClone(DEFAULT_CONFIG),...data,general:{...DEFAULT_CONFIG.general,...data.general},dates:{...DEFAULT_CONFIG.dates,...data.dates},buttons:{...DEFAULT_CONFIG.buttons,...data.buttons,apply:{...DEFAULT_CONFIG.buttons.apply,...data.buttons?.apply},submit:{...DEFAULT_CONFIG.buttons.submit,...data.buttons?.submit}}};renderInputs();applyConfig();localStorage.setItem("molodo-config",JSON.stringify(config));countdown();toast("Настройки импортированы");}catch(err){toast("Не удалось прочитать JSON-файл")}e.target.value=""});
$("#resetConfig").addEventListener("click",()=>{if(!confirm("Сбросить все настройки к исходным?"))return;config=structuredClone(DEFAULT_CONFIG);localStorage.removeItem("molodo-config");renderInputs();applyConfig();countdown();toast("Настройки сброшены")});
document.querySelector(".menu-toggle").addEventListener("click",()=>$(".nav").classList.toggle("open"));
document.querySelectorAll(".nav a").forEach(a=>a.addEventListener("click",()=>$(".nav").classList.remove("open")));
let clockClicks=0;$("#magicClock").addEventListener("click",()=>{clockClicks++;if(clockClicks===1)toast("Отсчёт уже пошёл. Успеешь снять свою историю?");if(clockClicks===3){document.body.classList.toggle("time-warp");toast("Секретный протокол XV активирован ✦");clockClicks=0}});
let typed="";document.addEventListener("keydown",e=>{if(e.key.length===1){typed=(typed+e.key.toLowerCase()).slice(-8);if(typed.endsWith("film")){document.body.classList.toggle("film-mode");toast("🎬 Режим режиссёра активирован!");}}if(e.key==="Escape")closeAdmin()});
$("#countdown").addEventListener("click",()=>toast("Каждая секунда — ещё один шанс снять свою историю."));
loadConfig();countdown();setInterval(countdown,1000);
