const K='sasp-panel-v1';
const GR=['Commander','Captain','Vice Captain','Lieutenant','Sergent-Chef','Sergent II','Sergent I','Senior Officer','Police Officer III','Police Officer II','Police Officer I','Rookie'];
const UN=[['swat','S.W.A.T'],['k9','Section K9'],['gang','Gang Unit'],['doa','DOA'],['henry','Henry'],['mary','Mary'],['sahp','SAHP (Highway Patrol)']];
const UG=['Directeur','Directeur Adjoint','Superviseur','Enquêteur Senior','Enquêteur Intermédiaire','Enquêteur Stagiaire'];
const SEED=[['1.1','Conduite sans permis',2000,10,10,1],['1.2','Conduite en état d’ivresse / sous l’influence de stup.',1200,0,0,0],['1.3','Conduite dangereuse',3500,0,0,0],['1.4','Conduite hors voie de circulation',4000,0,0,0],['1.5','Circulation à contre-sens',5500,0,0,0],['1.6','Délit de fuite',7500,5,7,1],['1.7','Non respect d’un feu rouge',350,0,0,0],['1.8','Stationnement gênant',1500,0,0,0],['1.9','Stationnement interdit',2500,0,0,0],['1.10','Utilisation abusif du klaxon',1750,0,0,0],['1.13','Excès de vitesse 50-100 km/h',3000,0,0,0],['1.14','Excès de vitesse 101-150 km/h',4000,0,0,0],['1.15','Excès de vitesse 151-200 km/h',7000,0,0,0],['2.1','Attentat à la pudeur',8000,10,0,1],['2.2','Atteinte à la vie privée',9500,15,0,1],['2.3','Dissimulation de visage',5250,0,0,0]].map(x=>({a:x[0],i:x[1],f:x[2],d:x[3],t:x[4],c:x[5]}));
const FREQ=[['13','Opérations'],['20','SASP'],['23','Interrogatoire']];
const PAT=[['Lincoln','1 officier dans le véhicule'],['Adam','2 officiers dans le véhicule'],['Tango','3 officiers dans le véhicule'],['X-Ray','4 officiers dans le véhicule'],['Mary','Patrouille motorisée'],['Henry','Patrouille héliportée'],['David','Patrouille SWAT'],['Sierra','Patrouille rapide'],['Roméo','Patrouille banalisée'],['Victor','Patrouille vélo'],['William','Véhicule GIU / SCU'],['Hubert','Patrouille nautique']];
const ALPHA='Alpha Bravo Charlie Delta Echo Foxtrot Golf Hotel India Juliet Kilo Lima Mike November Oscar Papa Quebec Romeo Sierra Tango Uniform Victor Whiskey X-Ray Yankee Zulu'.split(' ');
const CODES=[['10-4','Affirmatif / message reçu'],['10-5','Négatif'],['10-6','Pause de service'],['10-8','Prise de service'],['10-10','Fin de service'],['10-17','En route vers une intervention'],['10-20','Position actuelle'],['10-23','Arrivé sur les lieux'],['10-50','Accident de la route'],['10-70','Braquage en cours'],['10-71','Fusillade / tirs en cours'],['10-80','Prise d’otage en cours'],['10-81','Silence radio']];
const ATT=[['Très coopératif',2.5],['Coopératif',1.5],['Neutre',1],['Hostile',0.7]];
const CV=[['Code vert',1],['Code orange',1.5],['Code rouge',2]];
let S;try{S=JSON.parse(localStorage.getItem(K))}catch(e){}
S=S||{ag:[],me:null,penal:SEED,units:{},msgs:{},hist:[],code:0};
S.req=S.req||[];S.ppa=S.ppa||[];S.rec=S.rec||[];S.fl=S.fl||[];S.me=null;
const sv=()=>{try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}};
const e=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const me=()=>S.ag.find(a=>a.id===S.me);
const adm=()=>me()&&me().admin;
const $=s=>document.querySelector(s);
let edit=false,calc={chefs:[],att:0,money:0,name:''};
const money=n=>Math.round(n).toLocaleString('fr-FR')+' $';

function login(inv){
 const first=!S.ag.length;
 let a=inv&&S.ag.find(x=>x.inv===inv&&!x.u);
 if(inv&&!a)return $('#root').innerHTML=`<div class="login"><h2>Lien invalide</h2><p class="sub">Ce lien est déjà utilisé ou n’existe pas.</p><button onclick="location.hash=''">Retour</button></div>`;
 const act=first||a;
 $('#root').innerHTML=`<div class="login"><div class="logo big-logo">★</div><h2>${first?'Créer le compte administrateur':a?'Bienvenue '+e(a.name):'SASP Panel'}</h2>
 <p class="sub">${act?'Choisis ton identifiant et ton mot de passe.':'San Andreas State Police — connexion'}</p>
 ${first?'<label>Nom RP</label><input id="n" placeholder="Prénom Nom">':''}
 <label>Identifiant</label><input id="u" value="${a?e(a.name.toLowerCase().replace(/\s/g,'')):''}">
 <label>Mot de passe</label><input id="p" type="password"><small class="sub">8 caractères minimum, avec au moins une lettre et un chiffre.</small>
 ${act?'<label>Confirme le mot de passe</label><input id="p2" type="password">':''}
 <p id="er" style="color:var(--r)"></p><button class="pri" style="width:100%" onclick="doLogin('${inv||''}')">${act?'Activer mon compte':'Se connecter'}</button>${act?'':'<p class="sub" style="margin-top:14px">Pas encore de compte ? <a href="#/inscription" style="color:#8fb0ff">Créer un compte policier</a></p>'}</div>`;
}
function doLogin(inv){
 const u=$('#u').value.trim().toLowerCase(),p=$('#p').value,er=t=>$('#er').textContent=t;
 const first=!S.ag.length,a=inv&&S.ag.find(x=>x.inv===inv&&!x.u);
 if(first||a){
  if(!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(p))return er('Mot de passe trop faible.');
  if(p!==$('#p2').value)return er('Les mots de passe diffèrent.');
  if(S.ag.some(x=>x.u===u))return er('Identifiant déjà pris.');
  if(first){const n=$('#n').value.trim();if(!n)return er('Nom requis.');S.ag.push({id:'a1',name:n,mat:'01',g:GR[0],u,p,admin:true});S.me='a1'}
  else{a.u=u;a.p=p;a.inv=null;S.me=a.id}
  sv();location.hash='#/dash';return render();
 }
 const x=S.ag.find(x=>x.u===u&&x.p===p);
 if(!x){if(S.req.some(r=>r.u===u&&r.p===p))return er('Ton compte est en attente de validation par un administrateur.');return er('Identifiant ou mot de passe incorrect.')}
 S.me=x.id;sv();location.hash='#/dash';render();
}
function out(){S.me=null;sv();location.hash='';render()}

function render(){
 const h=location.hash.replace(/^#\/?/,'');
 if(h=='inscription')return reg();
 if(h.startsWith('invitation/'))return login(h.split('/')[1]);
 if(!me())return login();
 const [r,x]=h.split('/');const route=r||'dash';
 const nav=(k,l)=>`<a href="#/${k}" class="${(x?r+'/'+x:route)===k?'on':''}"><span class="ic">${IC[k]||'📄'}</span>${l}</a>`;
 const v={dash,calc:calcV,hist,penal,effectif,mat,ann:()=>board('ann','Annonces SASP','Salon d’annonces — publié par les grades habilités.',adm()),unit,page}[route]||dash;
 $('#root').innerHTML=`<div id="app"><nav><div class="nav-head"><div class="logo">★</div><div><b style="font-size:15px">SASP Panel</b><br><small style="margin:0">San Andreas State Police</small></div></div><div class="stat"><i style="background:${['var(--g)','var(--o)','var(--r)'][S.code]};color:${['var(--g)','var(--o)','var(--r)'][S.code]}"></i><div><b>${CV[S.code][0]}</b><br><small>Code en vigueur</small></div></div>
 ${nav('dash','Tableau de bord')}${nav('ann','Annonces SASP')}${nav('calc','Mon calculateur')}${nav('hist','Historique des amendes')}${nav('penal','Code pénal')}
 <h4>Entretien</h4>${nav('page/ppa','PPA')}${nav('page/recrutement','Recrutement')}${nav('page/firstlincoln','First Lincoln')}<h4>Unités</h4>${UN.map(u=>nav('unit/'+u[0],u[1])).join('')}
 <h4>Effectif</h4>${nav('effectif','Effectif')}${nav('mat','Matricules')}<h4>Rookie</h4>${Object.keys(PG).slice(3).map(k=>nav('page/'+k,PG[k])).join('')}
 <div style="margin-top:18px;padding:8px"><b>${e(me().name)}</b><br><span class="tag">${me().admin?'Admin · ':''}${e(me().g)}</span><br><br><button onclick="out()">Déconnexion</button></div></nav>
 <main>${v(x)}</main></div>`;
}
let _last=null;const _render=render;render=function(){const ch=location.hash!==_last,sy=window.scrollY;_last=location.hash;_render();const a=document.getElementById('app')||document.querySelector('.login');if(a&&ch)a.classList.add('anim');if(!ch)window.scrollTo(0,sy);else window.scrollTo(0,0)};
window.onhashchange=render;

function dash(){
 const cv=CV[S.code];
 return `<h2>Bonjour ${e(me().name)}</h2><p class="sub">${e(me().g)}, matricule ${e(me().mat)}. Bon service !</p>
 <div class="card"><h3>Code en vigueur : ${cv[0]}</h3>${adm()?CV.map((c,i)=>`<button class="${i==S.code?'pri':''}" onclick="S.code=${i};sv();render()">${c[0]}</button> `).join(''):''}</div>
 ${adm()&&S.req.length?`<div class="card" style="border-color:var(--o)"><b>${S.req.length} demande(s) de compte en attente</b> <a href="#/effectif" style="color:#8fb0ff">Les examiner →</a></div>`:''}<div class="grid"><div class="card"><h3>Fréquences radio</h3>${FREQ.map(f=>`<div class="row"><b>${f[0]}</b><span>${f[1]}</span></div>`).join('')}</div>
 <div class="card"><h3>Droits Miranda</h3><label>Nom du suspect</label><input id="mn" placeholder="Nom Prénom"><label>Genre</label><select id="mg"><option>Monsieur</option><option>Madame</option></select><br><br><button class="pri" onclick="mir()">Générer</button><p id="mo" class="sub" style="margin-top:10px;white-space:pre-wrap"></p></div></div>
 <div class="grid"><div class="card"><h3>Codes patrouille</h3>${PAT.map(f=>`<div class="row"><b>${f[0]}</b><span>${f[1]}</span></div>`).join('')}</div>
 <div class="card"><h3>Codes radio</h3>${CODES.map(f=>`<div class="row"><b>${f[0]}</b><span>${f[1]}</span></div>`).join('')}</div>
 <div class="card"><h3>Alphabet radio</h3>${ALPHA.map(w=>`<div class="row"><b>${w[0]}</b><span>${w}</span></div>`).join('')}</div></div>`;
}
function mir(){const n=$('#mn').value||'…',g=$('#mg').value;$('#mo').textContent=`${g} ${n}, vous êtes en état d’arrestation.\nVous avez le droit de garder le silence. Tout ce que vous direz pourra être utilisé contre vous devant un tribunal.\nVous avez le droit à un avocat. Si vous n’en avez pas les moyens, un avocat vous sera commis d’office.\nAvez-vous compris vos droits ?`}

function calcV(){
 const att=ATT[calc.att][1],cv=CV[S.code][1];
 let am=0,d=0,t=0;calc.chefs.forEach(i=>{const p=S.penal[i];if(p){am+=+p.f;d+=+p.d;t+=+p.t}});
 const fin=(am+calc.money/2)*cv,dd=Math.round(d*att),tt=Math.round(t*att);
 const rap=calc.chefs.length?`Suspect : ${calc.name||'—'}\nChefs : ${calc.chefs.map(i=>'Art '+S.penal[i].a+' '+S.penal[i].i).join(' ; ')}\nAmende : ${money(fin)} | Détention : ${dd} min | T.I.G : ${tt}`:'Le rapport se remplit avec les chefs d’inculpation.';
 window._rap=rap;window._fin=[fin,dd,tt];
 return `<h2>Mon calculateur</h2><p class="sub">Calculateur personnel de ${e(me().name)} · saisie conservée.</p><div class="grid">
 <div class="card"><label>Suspect</label><input value="${e(calc.name)}" oninput="calc.name=this.value" placeholder="Nom Prénom">
 <label>Attitude (divise détention et T.I.G)</label><select onchange="calc.att=+this.value;render()">${ATT.map((a,i)=>`<option value="${i}" ${i==calc.att?'selected':''}>${a[0]} (÷ ${a[1]})</option>`).join('')}</select>
 <label>Ajouter un chef d’inculpation</label><select onchange="if(this.value!==''){calc.chefs.push(+this.value);render()}"><option value="">Choisis dans la liste…</option>${S.penal.map((p,i)=>`<option value="${i}">Art ${e(p.a)} — ${e(p.i)}</option>`).join('')}</select>
 ${calc.chefs.map((i,k)=>`<div class="row"><span>Art ${e(S.penal[i]?.a)} ${e(S.penal[i]?.i)}</span><button class="del" onclick="calc.chefs.splice(${k},1);render()">✕</button></div>`).join('')}
 <label>Argent non traçable saisi ($) — la moitié s’ajoute à l’amende</label><input type="number" value="${calc.money}" onchange="calc.money=+this.value||0;render()"></div>
 <div><div class="card" style="text-align:center"><div class="sub">Amende finale</div><div class="big">${money(fin)}</div><div class="sub">${CV[S.code][0]} (× ${cv})</div>
 <div class="grid" style="grid-template-columns:repeat(2,1fr)"><div><b class="big" style="font-size:22px">${dd}</b><br>Détention (min)</div><div><b class="big" style="font-size:22px">${tt}</b><br>T.I.G</div></div></div>
 <div class="card"><h3>Rapport <button onclick="navigator.clipboard&&navigator.clipboard.writeText(window._rap)">Copier</button></h3><pre style="white-space:pre-wrap;margin:0;font-size:12px">${e(rap)}</pre></div>
 <button class="pri" style="width:100%" ${calc.chefs.length?'':'disabled'} onclick="S.hist.unshift({d:new Date().toLocaleString('fr-FR'),n:calc.name,c:calc.chefs.map(i=>S.penal[i].i).join(', '),f:window._fin[0],det:window._fin[1],t:window._fin[2],by:me().id});calc={chefs:[],att:0,money:0,name:''};sv();location.hash='#/hist'">Enregistrer dans mon historique</button></div></div>`;
}
function hist(){
 const L=S.hist.filter(h=>h.by===S.me);
 return `<h2>Historique des amendes</h2><p class="sub">Les amendes que tu as enregistrées.</p><div class="card tw"><table><tr><th>Date</th><th>Suspect</th><th>Chefs</th><th>Amende</th><th>Détention</th><th>T.I.G</th></tr>
 ${L.length?L.map(h=>`<tr><td>${e(h.d)}</td><td>${e(h.n)}</td><td>${e(h.c)}</td><td>${money(h.f)}</td><td>${h.det} min</td><td>${h.t}</td></tr>`).join(''):'<tr><td colspan="6" class="sub">Aucune amende enregistrée.</td></tr>'}</table></div>`;
}

function penal(){
 const a=adm(),ed=a&&edit;
 const f=(i,k,t)=>ed?`<input style="width:${k=='i'?'100%':'80px'}" ${t?'type="number"':''} value="${e(S.penal[i][k])}" onchange="S.penal[${i}].${k}=${t?'+this.value||0':'this.value'};sv()">`:(k=='f'?money(S.penal[i][k]):e(S.penal[i][k]));
 return `<h2>Code pénal</h2><p class="sub">${S.penal.length} articles. ${a?'Tu es admin : tu peux modifier le code pénal.':'Lecture seule — seul un administrateur du site peut le modifier.'}</p>
 ${a?`<p><button class="${edit?'pri':''}" onclick="edit=!edit;render()">${edit?'Terminer la modification':'Modifier le code pénal'}</button> ${edit?'<button onclick="S.penal.push({a:\'0.0\',i:\'Nouvelle infraction\',f:0,d:0,t:0,c:0});sv();render()">+ Article</button>':''}</p>`:''}
 <input placeholder="Rechercher une infraction ou un article" oninput="q(this.value)" style="margin-bottom:12px"><div class="card tw"><table id="pt"><tr><th>Article</th><th>Infraction</th><th>Amende</th><th>Détention (min)</th><th>T.I.G</th><th>Casier</th>${ed?'<th></th>':''}</tr>
 ${S.penal.map((p,i)=>`<tr><td><b>${f(i,'a')}</b></td><td>${f(i,'i')}</td><td>${f(i,'f',1)}</td><td>${f(i,'d',1)}</td><td>${f(i,'t',1)}</td><td>${ed?`<input type="checkbox" style="width:auto" ${p.c?'checked':''} onchange="S.penal[${i}].c=this.checked?1:0;sv()">`:p.c?'<span class="tag">OUI</span>':'NON'}</td>${ed?`<td><button class="del" onclick="S.penal.splice(${i},1);sv();render()">✕</button></td>`:''}</tr>`).join('')}</table></div>`;
}
function q(v){v=v.toLowerCase();document.querySelectorAll('#pt tr').forEach((r,i)=>{if(i)r.style.display=r.textContent.toLowerCase().includes(v)||[...r.querySelectorAll('input')].some(x=>x.value.toLowerCase().includes(v))?'':'none'})}

function agents(list,groups,grField,remove){
 return `<div class="grid">${groups.map(g=>{const m=list.filter(x=>x[grField]===g);return `<div class="card"><h3>${g} <span class="tag">${m.length}</span></h3>${m.length?m.map(x=>`<span class="ag"><b>${e(x.mat)}</b> ${e(x.name)}${x.admin?' <span title="Admin">★</span>':''} ${adm()&&list===S.ag?`<label class="ck" style="display:inline-flex;margin:0" title="Admin"><input type="checkbox" ${x.admin?'checked':''} onchange="setAdmin('${x.id}',this.checked)"></label>`:''}${adm()?`<a href="#" style="color:var(--r);text-decoration:none" onclick="${remove(x)};return false">✕</a>`:''}</span>`).join(''):'<span class="sub">Personne pour l’instant.</span>'}</div>`}).join('')}</div>`;
}
function effectif(){
 const a=adm();
 return `<h2>Effectif</h2><p class="sub">${S.ag.length} agents · ${S.ag.filter(x=>x.u).length} comptes activés.</p>
 ${a&&S.req.length?reqCard():''}${a?`<div class="card"><h3>Ajouter un agent (génère son lien d’invitation)</h3><div class="grid"><div><label>Nom RP</label><input id="an"></div><div><label>Matricule</label><input id="am" maxlength="2"></div><div><label>Grade</label><select id="ag">${GR.map(g=>`<option ${g=='Rookie'?'selected':''}>${g}</option>`).join('')}</select></div><div><label>&nbsp;</label><label class="ck"><input type="checkbox" id="aadm"> Administrateur</label></div></div><br><button class="pri" onclick="addAg()">Créer l’agent</button><div id="lk"></div></div>`:''}
 ${agents(S.ag,GR,'g',x=>`rmAg('${x.id}')`)}
 ${a?`<div class="card tw"><h3>Liens d’invitation en attente</h3>${S.ag.filter(x=>x.inv).map(x=>`<div class="row"><span>${e(x.name)}</span><code>${location.href.split('#')[0]}#/invitation/${x.inv}</code></div>`).join('')||'<span class="sub">Aucun.</span>'}</div>`:''}`;
}
function addAg(){
 const n=$('#an').value.trim(),m=$('#am').value.trim().padStart(2,'0');
 if(!n||!/^\d{2}$/.test(m))return alert('Nom et matricule à 2 chiffres requis.');
 if(S.ag.some(x=>x.mat===m))return alert('Matricule déjà pris.');
 const inv=Math.random().toString(36).slice(2,12)+Math.random().toString(36).slice(2,8);
 S.ag.push({id:'a'+Date.now(),name:n,mat:m,g:$('#ag').value,inv,admin:$('#aadm').checked});sv();render();
}
function reg(){$('#root').innerHTML=`<div class="login"><div class="logo big-logo">★</div><h2>Créer un compte policier</h2><p class="sub">Un administrateur doit valider ta demande avant que tu puisses te connecter.</p><label>Nom RP</label><input id="n" placeholder="Prénom Nom"><label>Identifiant</label><input id="u"><label>Mot de passe</label><input id="p" type="password"><small class="sub">8 caractères minimum, avec au moins une lettre et un chiffre.</small><label>Confirme le mot de passe</label><input id="p2" type="password"><p id="er" style="color:var(--r)"></p><button class="pri" style="width:100%" onclick="doReg()">Envoyer ma demande</button><p class="sub" style="margin-top:14px"><a href="#" style="color:#8fb0ff" onclick="location.hash='';return false">Retour à la connexion</a></p></div>`}
function doReg(){const n=$('#n').value.trim(),u=$('#u').value.trim().toLowerCase(),p=$('#p').value,er=t=>$('#er').textContent=t;
 if(!n||!u)return er('Nom et identifiant requis.');
 if(!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(p))return er('Mot de passe trop faible.');
 if(p!==$('#p2').value)return er('Les mots de passe diffèrent.');
 if(S.ag.some(x=>x.u===u)||S.req.some(x=>x.u===u))return er('Identifiant déjà pris.');
 if(!S.ag.length)return er('Aucun administrateur : crée d’abord le compte admin.');
 S.req.push({id:'r'+Date.now(),name:n,u,p,d:new Date().toLocaleString('fr-FR')});sv();
 $('#root').innerHTML=`<div class="login"><div class="logo big-logo">★</div><h2>Demande envoyée</h2><p class="sub">Un administrateur va examiner ton compte. Reviens te connecter une fois validé.</p><button class="pri" onclick="location.hash=''">Retour à la connexion</button></div>`}
function freeMat(){for(let i=1;i<100;i++){const k=String(i).padStart(2,'0');if(!S.ag.some(x=>x.mat===k))return k}return ''}
function reqCard(){return `<div class="card" style="border-color:var(--o)"><h3>Demandes de comptes <span class="tag">${S.req.length}</span></h3>${S.req.map(r=>`<div class="row" style="flex-wrap:wrap;align-items:center"><span><b style="min-width:0">${e(r.name)}</b> <small class="sub">@${e(r.u)} · ${e(r.d)}</small></span><span style="display:flex;gap:6px;flex-wrap:wrap"><select id="rg${r.id}" style="width:auto">${GR.map(g=>`<option ${g=='Rookie'?'selected':''}>${g}</option>`).join('')}</select><input id="rm${r.id}" style="width:70px" maxlength="2" value="${freeMat()}"><label class="ck"><input type="checkbox" id="ra${r.id}"> Admin</label><button class="pri" onclick="okReq('${r.id}')">Accepter</button><button class="del" onclick="noReq('${r.id}')">Refuser</button></span></div>`).join('')}</div>`}
function okReq(id){const r=S.req.find(x=>x.id===id);if(!r||!adm())return;const m=$('#rm'+id).value.trim().padStart(2,'0');
 if(!/^\d{2}$/.test(m))return alert('Matricule à 2 chiffres requis.');
 if(S.ag.some(x=>x.mat===m))return alert('Matricule déjà pris.');
 S.ag.push({id:'a'+Date.now(),name:r.name,mat:m,g:$('#rg'+id).value,u:r.u,p:r.p,admin:$('#ra'+id).checked});S.req=S.req.filter(x=>x.id!==id);sv();render()}
function noReq(id){if(!adm()||!confirm('Refuser cette demande ?'))return;S.req=S.req.filter(x=>x.id!==id);sv();render()}
function setAdmin(id,v){const a=S.ag.find(x=>x.id===id);if(!a||!adm())return;if(!v&&S.ag.filter(x=>x.admin).length<=1){alert('Il doit rester au moins un administrateur.');return render()}a.admin=v;sv();render()}
function rmAg(id){if(id==S.me||!confirm('Retirer cet agent ?'))return;S.ag=S.ag.filter(x=>x.id!==id);sv();render()}
function mat(){
 let s='';for(let i=1;i<100;i++){const k=String(i).padStart(2,'0'),a=S.ag.find(x=>x.mat===k);s+=`<div class="card" style="margin:0;padding:8px;${a?'border-color:var(--a)':''}"><b>${k}</b><br><small class="sub">${a?e(a.name):'<span style="color:var(--g)">Libre</span>'}</small></div>`}
 return `<h2>Matricules</h2><p class="sub">${S.ag.length} pris, ${99-S.ag.length} libres.</p><div style="display:grid;gap:8px;grid-template-columns:repeat(auto-fill,minmax(100px,1fr))">${s}</div>`;
}

let utab='Effectif';
function unit(k){
 const u=UN.find(x=>x[0]===k)||UN[0];k=u[0];const L=S.units[k]=S.units[k]||[];
 return `<div class="card"><small class="sub">Unité spécialisée</small><h2>${u[1]}</h2><span class="sub">${L.length} agents · ${UG.length} grades</span></div>
 <div class="tabs">${['Effectif','Annonces','Discussion','Direction'].map(t=>`<button class="${t==utab?'on':''}" onclick="utab='${t}';render()">${t}</button>`).join('')}</div>
 ${utab=='Effectif'?`${adm()?`<div class="card"><h3>Ajouter un agent à l’unité</h3><div class="grid"><div><label>Agent</label><select id="ua">${S.ag.map(a=>`<option value="${a.id}">${a.mat} ${e(a.name)}</option>`).join('')}</select></div><div><label>Grade dans l’unité</label><select id="ug">${UG.map(g=>`<option>${g}</option>`).join('')}</select></div></div><br><button class="pri" onclick="addU('${k}')">Ajouter</button></div>`:''}
 ${agents(L,UG,'g',x=>`rmU('${k}','${x.id}')`)}`:utab=='Direction'?agents(L.filter(x=>/^Directeur/.test(x.g)),UG.slice(0,2),'g',x=>`rmU('${k}','${x.id}')`):board(k+(utab=='Annonces'?'-ann':'-chat'),utab,'',utab=='Discussion'||adm())}`;
}
function addU(k){const a=S.ag.find(x=>x.id==$('#ua').value);if(!a||S.units[k].some(x=>x.id==a.id))return;S.units[k].push({id:a.id,name:a.name,mat:a.mat,g:$('#ug').value});sv();render()}
function rmU(k,id){S.units[k]=S.units[k].filter(x=>x.id!==id);sv();render()}

function board(key,title,sub,canPost){
 const L=S.msgs[key]||[];
 return `${sub!==''||key=='ann'?`<h2>${title}</h2><p class="sub">${sub}</p>`:''}<div class="card">
 ${L.length?L.map((m,i)=>`<div class="msg"><b>${e(m.n)}</b> <small class="sub">${e(m.d)}</small>${adm()?` <a href="#" style="color:var(--r)" onclick="delM('${key}',${i});return false">suppr.</a>`:''}<div style="white-space:pre-wrap">${e(m.t)}</div></div>`).join(''):'<span class="sub">Aucun message.</span>'}
 ${canPost?`<label>Nouveau message</label><textarea id="bm" rows="3"></textarea><br><br><button class="pri" onclick="post('${key}')">Publier</button>`:'<p class="sub">Seuls les grades habilités publient ici.</p>'}</div>`;
}
function post(k){const t=$('#bm').value.trim();if(!t)return;(S.msgs[k]=S.msgs[k]||[]).push({n:me().name,d:new Date().toLocaleString('fr-FR'),t});sv();render()}
function delM(k,i){S.msgs[k].splice(i,1);sv();render()}
const IC={dash:'▦',ann:'📢',calc:'🧮',hist:'🕘',penal:'📕','page/ppa':'🎯','page/recrutement':'👤','page/firstlincoln':'✅','unit/swat':'🎯','unit/k9':'🐕','unit/gang':'⚖️','unit/doa':'🚁','unit/henry':'🚔','unit/mary':'🏍️','unit/sahp':'🛣️',effectif:'👥',mat:'#','page/carnet':'📖'};
const PG={ppa:'PPA',recrutement:'Recrutement',firstlincoln:'First Lincoln',carnet:'Carnet du Rookie',mdt:'MDT',menu:'Menu (F7)',perimetre:'Périmètre de sécurité (10-75)',procedure:'Une procédure',autorisations:'Les autorisations',hierarchie:'La hiérarchie / Tenue',miranda:'Les droits Miranda',radio:'Les codes radio',patrouille:'Une patrouille',calculateur:'Le calculateur d’amendes',vices:'Les vices de procédure',unites:'Les unités',formations:'Les formations'};
const nP=()=>({c:{},qs:[],ans:{},pts:'',bul:16,n:'',notes:'',cib:null,tab:0});
const nR=()=>({c:{},n:'',did:'',tel:'',mat:freeMat(),sec:'',qn:'',sit:[],sat:{},t:'',miss:0,lieu:'Dock',pv:0,notes:'',tab:0,rc:true,fail:false});
const nF=()=>({c:{},ag:'',obs:{},g:'',imp:'',tab:0});
const F={ppa:nP(),rec:nR(),fl:nF()};
const ckb=(ns,k,l,cl)=>`<label class="ck ${cl||''}"><input type="checkbox" ${F[ns].c[k]?'checked':''} onchange="F.${ns}.c['${k}']=this.checked;render()"><span>${l}</span></label>`;
const inp=(ns,k,ph,t,re)=>`<input ${t?'type="'+t+'"':''} placeholder="${ph||''}" value="${e(F[ns][k])}" ${re?`onchange="F.${ns}['${k}']=this.value;render()"`:`oninput="F.${ns}['${k}']=this.value"`}>`;
const sec=(n,t,b,h)=>`<div class="card"><h3><span><span class="num">${n}</span>${t}</span>${h||''}</h3>${b}</div>`;
const tabs=(ns,l)=>`<div class="tabs">${l.map((t,i)=>`<button class="${F[ns].tab==i?'on':''}" onclick="F.${ns}.tab=${i};render()">${t}</button>`).join('')}</div>`;
const pill=(t,c)=>`<span class="tag" style="${c?'background:'+c+';border-color:'+c:''}">${t}</span>`;
const OK='#14532d',KO='#7f1d1d';
const htab=(rows,heads)=>`<div class="card tw"><table><tr>${heads.map(h=>`<th>${h}</th>`).join('')}</tr>${rows.length?rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${heads.length}" class="sub">Aucun enregistrement.</td></tr>`}</table></div>`;
const now=()=>new Date().toLocaleString('fr-FR');
const pick=(a,n)=>[...a.keys()].sort(()=>Math.random()-.5).slice(0,n);

/* ---------- PPA ---------- */
const PC=['Pièce d’identité originale contrôlée (CNI)','Âge : 21 ans révolus','Casier : aucune condamnation pour crime ou délit grave depuis 5 ans','Fouille effectuée','Certificat médical de moins de 3 mois','Frais de visite médicale payés'];
const QB=[['Combien de règles de sécurité fondamentales faut-il respecter ?',['2','4','6'],1],['Une arme doit toujours être considérée comme…',['Déchargée','Chargée','Inoffensive'],1],['Où pointe le canon en dehors du tir ?',['Dans une direction sûre','Vers soi','Vers un tiers'],0],['Le doigt se place sur la détente…',['En permanence','Seulement quand on est prêt à tirer','Dès que l’on dégaine'],1],['Avant de tirer, il faut identifier…',['Sa cible et ce qu’il y a derrière','Seulement sa cible','Le bruit'],0],['Peut-on sortir l’arme sans l’autorisation de l’examinateur ?',['Oui','Non, jamais','Seulement face à la cible'],1],['Le téléphone est-il autorisé pendant l’épreuve ?',['Oui','Non','Pour filmer'],1],['Un tir sur une cible non dangereuse fait perdre…',['1 point','0 point','Le permis'],0]];
function ppa(){
 const f=F.ppa;if(f.tab==1)return `<h2>Permis de port d’armes</h2><p class="sub">Entretien PPA : passage de l’examen et historique.</p>${tabs('ppa',['Faire passer le PPA','Historique'])}${htab(S.ppa.map(h=>[h.d,e(h.n),h.q+'/5',h.p+' pts',pill(h.ok?'Admis':'Refusé',h.ok?OK:KO),e(h.by)]),['Date','Candidat','QCM','Épreuve','Résultat','Examinateur'])}`;
 const miss=PC.filter((_,i)=>!f.c[i]).length,ans=f.qs.filter(i=>f.ans[i]!==undefined).length,sc=f.qs.filter(i=>f.ans[i]===QB[i][2]).length;
 const min=Math.ceil((+f.bul||16)*10/16),pts=f.pts===''?null:+f.pts,ok=!miss&&f.qs.length==5&&ans==5&&sc>=3&&pts!==null&&pts>=min&&f.n;
 return `<h2>Permis de port d’armes</h2><p class="sub">Entretien PPA : passage de l’examen, historique. Document interne, réservé aux agents habilités.</p>${tabs('ppa',['Faire passer le PPA','Historique'])}
 ${sec(1,'Accueil du candidat',`<label>Nom du candidat</label>${inp('ppa','n','Nom Prénom')}<div class="grid" style="margin-top:8px">${PC.map((t,i)=>ckb('ppa',i,t)).join('')}</div><small class="sub">Si un point manque, le candidat ne peut pas être admis.</small>`)}
 ${sec(2,'Briefing (5 min)',`<span class="sub">Présente les règles au candidat : déroulement de l’épreuve, interdiction de tout document ou téléphone, l’arme ne se sort jamais sans ton autorisation.</span>`)}
 ${sec(3,'QCM : 5 questions (10 min)',f.qs.length?f.qs.map((q,n)=>`<div class="row" style="display:block"><b style="color:var(--t)">${n+1}. ${QB[q][0]}</b><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">${QB[q][1].map((o,j)=>`<button class="${f.ans[q]===j?'pri':''}" onclick="F.ppa.ans[${q}]=${j};render()">${o}</button>`).join('')}</div></div>`).join(''):`<p class="sub" style="text-align:center">Tire les questions au hasard.</p>`,`<button onclick="F.ppa.qs=pick(QB,5);F.ppa.ans={};render()">↻ Tirer 5 questions au hasard</button>`)}
 ${sec(4,'Épreuve pratique (10 min)',`<div class="grid"><div><label>Balles dans le chargeur</label>${inp('ppa','bul','','number',1)}</div><div><label>Points obtenus</label>${inp('ppa','pts','','number',1)}</div><div><label>Minimum requis</label><b class="big" style="font-size:22px">${min} / ${+f.bul||16}</b></div></div><div class="card" style="margin:12px 0 0;border-style:dashed"><h3>Aide pour l’examinateur <button onclick="F.ppa.cib=[...Array(7)].map(()=>Math.random()<.5);render()">Tirer au sort les cibles</button></h3>${f.cib?f.cib.map((d,i)=>`${pill('Cible '+(i+1)+' : '+(d?'dangereuse':'neutre'),d?KO:OK)} `).join(''):'<span class="sub">Annonce chaque cible (1 à 7, de gauche à droite).</span>'}</div>`)}
 ${sec(5,'Résultat',`<label>Notes (comportement, temps de réaction, respect des consignes…)</label><textarea rows="4" oninput="F.ppa.notes=this.value">${e(f.notes)}</textarea><div class="row"><span>Dossier et vérifications</span>${pill(miss?miss+' points manquants':'Complet',miss?KO:OK)}</div><div class="row"><span>QCM</span>${pill(ans<5?'En cours':sc+'/5',ans<5?'':sc>=3?OK:KO)}</div><div class="row"><span>Épreuve pratique</span>${pill(pts===null?'En attente':pts+'/'+(+f.bul||16),pts===null?'':pts>=min?OK:KO)}</div><p style="text-align:right"><button class="pri" onclick="savePpa(${!!ok},${sc},${pts||0})">Enregistrer le passage</button></p>`)}`;
}
function savePpa(ok,q,p){const f=F.ppa;if(!f.n.trim())return alert('Nom du candidat requis.');S.ppa.unshift({d:now(),n:f.n,ok,q,p,by:me().name,notes:f.notes});sv();F.ppa=nP();alert(ok?'Candidat admis.':'Candidat refusé.');render()}

/* ---------- Recrutement ---------- */
const RQ=[['Expérience professionnelle','Quelles sont vos expériences professionnelles passées ? (forces de l’ordre, sécurité, militaire…)'],['Motivation','Pourquoi souhaitez-vous rejoindre les forces de l’ordre, et la SASP en particulier ?'],['Vision du métier','Que représente pour vous le métier de policier ? Quelle est, selon vous, sa fonction principale ?'],['Connaissance de base','Quelle est la première arme d’un agent de police ? (réponse attendue : le dialogue, la communication)'],['Hiérarchie','Comment définissez-vous vos limites en matière de respect hiérarchique ?'],['Valeur ajoutée','Pourquoi vous et pas un autre candidat ? Que pouvez-vous apporter à nos rangs ?'],['Introspection','Donnez 3 qualités et 3 défauts vous caractérisant.'],['Ambitions','Quelles sont vos ambitions au sein de la SASP ? Où vous voyez-vous dans 6 mois ?'],['Unités spécialisées','Connaissance des unités. Au passage Police Officer II, laquelle vous intéresserait le plus ?']];
const SB=['Un suspect armé prend la fuite à pied : que faites-vous ?','Contrôle routier : le conducteur refuse de descendre.','Braquage avec otages : quelles sont vos premières actions ?','Un citoyen vous insulte pendant un contrôle.','Un collègue enfreint les règles devant vous.','Course-poursuite : un civil traverse la route.','Un suspect est blessé lors de l’arrestation.','Vous arrivez seul sur une fusillade.'];
const RP=[['dossier','Dossier soumis et approuvé'],['conv','Convocation envoyée'],['tenue','Tenues de recruteur portées']],RH=[['fouille','Fouille corporelle complète'],['cni','Carte d’identité'],['permis','Permis de conduire'],['port','Permis de port d’armes'],['sport','Candidat en tenue de sport']];
function recScore(){const f=F.rec,t=f.t===''?null:+f.t,ph=t===null?null:t<=45?10:t>90?0:Math.max(0,10-Math.ceil((t-45)/3)),tir=Math.max(0,10-(+f.miss||0)-(f.c.taser?1:0)-(f.c.arme?1:0)),co=Math.max(0,10-(+f.pv||0)),si=f.sit.filter(i=>f.sat[i]).length,qn=Math.min(5,Math.max(0,+f.qn||0));
 const miss=[...RP,...RH].filter(([k])=>!f.c[k]).length+(f.n.trim()?0:1)+(f.sec?0:1),elim=f.c.casier||f.c.mandat,tot=qn+(ph||0)+tir+co+si;
 return {ph,tir,co,si,qn,miss,elim,tot,ok:!elim&&!miss&&ph!==null&&f.sit.length==5&&tot>=28};}
function recrutement(){
 const f=F.rec;if(f.tab==1)return `<h2>Recrutement</h2><p class="sub">Bureau des recrutements : historique.</p>${tabs('rec',['Faire un recrutement','Historique'])}${htab(S.rec.map(h=>[h.d,e(h.n),h.mat,h.tot+'/40',pill(h.ok?'Recruté':'Refusé',h.ok?OK:KO),e(h.by)]),['Date','Candidat','Matricule','Note','Résultat','Recruteur'])}`;
 const r=recScore(),libres=[...Array(99)].map((_,i)=>String(i+1).padStart(2,'0')).filter(m=>!S.ag.some(a=>a.mat===m));
 return `<h2>Recrutement</h2><p class="sub">Bureau des recrutements : dossier de recrutement noté sur 40, historique. Usage interne.</p>${tabs('rec',['Faire un recrutement','Historique'])}
 ${sec(1,'Pré-requis',`<div class="grid"><div><label>Nom RP</label>${inp('rec','n','Prénom Nom')}</div><div><label>ID Discord</label>${inp('rec','did','Ex. 712345678901234567')}</div><div><label>Téléphone RP</label>${inp('rec','tel','Facultatif')}</div><div><label>Matricule attribué</label><select onchange="F.rec.mat=this.value">${libres.map(m=>`<option ${m==f.mat?'selected':''}>${m}</option>`).join('')}</select></div></div><label>Second recruteur (2 agents habilités obligatoires)</label><select onchange="F.rec.sec=this.value;render()"><option value="">Choisir…</option>${S.ag.filter(a=>a.id!==S.me).map(a=>`<option value="${a.id}" ${f.sec==a.id?'selected':''}>${a.mat} ${e(a.name)}</option>`).join('')}</select><div class="grid" style="margin-top:8px">${RP.map(([k,l])=>ckb('rec',k,l)).join('')}</div>`)}
 ${sec(2,'Phase préliminaire',`<div class="grid">${RH.map(([k,l])=>ckb('rec',k,l)).join('')}</div><div class="card" style="margin:10px 0 0;border-color:#7f1d1d"><b>Antécédents judiciaires</b>${ckb('rec','casier','Le candidat a un casier judiciaire (éliminatoire)')}${ckb('rec','mandat','Mandat d’arrêt en cours : procède à son arrestation (éliminatoire)')}</div>`)}
 ${sec(3,'Questions préliminaires (/5)',`<ol style="padding-left:20px;margin:0">${RQ.map(q=>`<li><b>${q[0]}</b><br><span class="sub">${q[1]}</span></li>`).join('')}</ol><label>Note donnée au candidat (0 à 5)</label>${inp('rec','qn','0','number',1)}`)}
 ${sec(4,'Épreuves pratiques',`<div class="grid"><div class="card"><h3>🏃 Test physique</h3><small class="sub">45 s ou moins = 10/10, −1 point toutes les 3 s, au-delà de 1 min 30 = 0.</small><label>Temps (secondes)</label>${inp('rec','t','Ex. 52','number',1)}<p>Note : <b>${r.ph===null?'–':r.ph}</b> / 10</p></div>
 <div class="card"><h3>🔫 Test de tir</h3><small class="sub">−1 point par cible manquée, −1 si atteint par le taser.</small><label>Cibles manquées</label>${inp('rec','miss','0','number',1)}${ckb('rec','taser','Atteint par le taser')}${ckb('rec','arme','Arme prêtée récupérée')}<p>Note : <b>${r.tir}</b> / 10</p></div>
 <div class="card"><h3>🚔 Test de conduite</h3><small class="sub">5 min de course-poursuite, −1 point par perte de vue.</small><label>Lieu</label><select onchange="F.rec.lieu=this.value"><option>Dock</option><option ${f.lieu=='Aéroport'?'selected':''}>Aéroport</option></select><label>Pertes de vue</label>${inp('rec','pv','0','number',1)}${ckb('rec','bloque','Suspect bloqué')}<p>Note : <b>${r.co}</b> / 10</p></div></div>`)}
 ${sec(5,'Mise en situation (/5)',f.sit.length?f.sit.map(i=>`<div class="row"><span>${SB[i]}</span>${ckb('rec','s'+i,'Satisfaisant (+1)').replace(`F.rec.c['s${i}']=this.checked`,`F.rec.c['s${i}']=this.checked;F.rec.sat[${i}]=this.checked`)}</div>`).join(''):'<p class="sub" style="text-align:center">Tire les situations au hasard.</p>',`<button onclick="F.rec.sit=pick(SB,5);F.rec.sat={};render()">↻ Tirer 5 situations au hasard</button>`)}
 ${sec(6,'Décision finale',`<div class="row"><span>Étapes et vérifications</span>${pill(r.miss?r.miss+' points manquants':'Complet',r.miss?KO:OK)}</div><div class="row"><span>Test physique</span>${pill(r.ph===null?'En attente':r.ph+'/10')}</div><div class="row"><span>Test de tir</span>${pill(r.tir+'/10',OK)}</div><div class="row"><span>Test de conduite</span>${pill(r.co+'/10',OK)}</div><div class="row"><span>Entretien et mises en situation</span>${pill(f.sit.length==5?(r.qn+r.si)+'/10':'En cours')}</div><div class="row"><b>Total</b><b>${r.tot} / 40 ${pill(r.ok?'Recrutable':'Non recrutable',r.ok?OK:KO)}</b></div><small class="sub">Seuil appliqué : 28/40, sans point éliminatoire ni vérification manquante.</small><label>Notes et commentaires (transmis à la direction)</label><textarea rows="3" oninput="F.rec.notes=this.value">${e(f.notes)}</textarea><p style="text-align:right"><button class="pri" onclick="saveRec()">Enregistrer le dossier</button></p>`)}`;
}
function saveRec(){const f=F.rec,r=recScore();if(!f.n.trim())return alert('Nom du candidat requis.');
 let inv=null;if(r.ok){if(S.ag.some(a=>a.mat===f.mat))return alert('Matricule déjà pris.');inv=Math.random().toString(36).slice(2,12)+Math.random().toString(36).slice(2,8);S.ag.push({id:'a'+Date.now(),name:f.n.trim(),mat:f.mat,g:'Rookie',inv})}
 S.rec.unshift({d:now(),n:f.n,mat:f.mat,tot:r.tot,ok:r.ok,by:me().name,notes:f.notes});sv();F.rec=nR();
 if(inv)prompt('Candidat recruté ! Envoie-lui ce lien de connexion :',location.href.split('#')[0]+'#/invitation/'+inv);else alert('Dossier enregistré : candidat non recruté.');render()}

/* ---------- First Lincoln ---------- */
const FS=[['📢 Radio et communication',['L’agent connaît-il les codes radios (10-codes, signaux) ?','L’agent communique-t-il clairement et avec le bon vocabulaire radio ?','L’agent utilise-t-il les termes corrects lors des interventions ?','L’agent sait-il demander des renforts ou des informations supplémentaires ?','L’agent confirme-t-il la réception des ordres via radio (« 10-4 », « reçu ») ?']],['🚔 Code de la route et conduite',['L’agent sait-il activer et utiliser les feux et sirènes de manière appropriée ?','L’agent effectue-t-il correctement une course-poursuite (positionnement) ?']],['🔒 Arrestations et procédures',['L’agent connaît-il les étapes d’une arrestation (verbal, menottage, Miranda) ?','L’agent sait-il sécuriser une scène de tir ou un braquage ?','L’agent sait-il gérer un suspect ?','L’agent respecte-t-il la hiérarchie de la force (usage proportionnel de la force) ?','L’agent procède-t-il correctement à la mise en cellule d’un suspect ?']],['🛠️ Équipements et outils',['L’agent utilise-t-il les bons équipements (taser, menottes, armes, herses) ?','L’agent sait-il utiliser le calculateur d’amendes ?','L’agent sait-il rédiger un casier et/ou un rapport d’incident ?','L’agent connaît-il l’utilisation de la MDT (casier, plaintes, recherches de profil) ?']],['🤝 Comportement et professionnalisme',['L’agent reste-t-il professionnel face à des situations stressantes ou conflictuelles ?','L’agent respecte-t-il les citoyens et leur dignité ?','L’agent fait-il preuve d’initiative dans des situations sans consigne directe ?','L’agent évite-t-il les comportements négatifs ou les abus de pouvoir (est-il fair-play) ?']],['⚔️ Pratique terrain (en situation)',['L’agent a-t-il géré au moins une interception de véhicule sans erreur majeure ?','L’agent a-t-il réalisé une arrestation complète et correcte ?','L’agent a-t-il su réagir face à un suspect armé ou en fuite ?','L’agent a-t-il su travailler en binôme ou en équipe lors d’une intervention (avec d’autres que l’agent superviseur) ?','L’agent a-t-il géré correctement une infraction routière (contravention ou avertissement) ?']]];
function firstlincoln(){
 const f=F.fl;if(f.tab==1)return `<h2>First Lincoln</h2><p class="sub">Fiches d’évaluation enregistrées.</p>${tabs('fl',['Évaluer un Rookie','Fiches'])}${htab(S.fl.map(h=>[h.d,e(h.n),h.s+'/25',pill(h.s>=19?'Validé':'À reconvoquer',h.s>=19?OK:KO),e(h.by)]),['Date','Agent','Score','Résultat','Évaluateur'])}`;
 let n=0;const sc=Object.values(f.c).filter(v=>v===true).length,rep=Object.values(f.c).filter(v=>v!==undefined).length;
 const yn=i=>`<div style="display:flex;gap:6px;align-items:center"><button class="${f.c[i]===true?'pri':''}" onclick="F.fl.c[${i}]=true;render()">✓ Oui</button><button class="${f.c[i]===false?'del':''}" style="${f.c[i]===false?'border-color:var(--r)':''}" onclick="F.fl.c[${i}]=false;render()">✗ Non</button><input style="width:180px" placeholder="Observation (facultatif)" value="${e(f.obs[i])}" oninput="F.fl.obs[${i}]=this.value"></div>`;
 return `<h2>First Lincoln</h2><p class="sub">Fiche d’évaluation pour la promotion Rookie → Police Officer I. Document interne confidentiel.</p>${tabs('fl',['Évaluer un Rookie','Fiches'])}
 <div class="card"><div class="grid"><div><label>Agent évalué</label><select onchange="F.fl.ag=this.value">${'<option value="">Choisir…</option>'+S.ag.filter(a=>a.g=='Rookie').map(a=>`<option value="${a.id}" ${f.ag==a.id?'selected':''}>${a.mat} ${e(a.name)}</option>`).join('')}</select></div><div><label>Évaluateur</label><b>${me().mat} ${e(me().name)} · ${e(me().g)}</b></div><div><label>Date</label><b>${new Date().toLocaleDateString('fr-FR')}</b></div></div></div>
 ${FS.map(([t,qs])=>`<div class="card"><h3>${t}</h3>${qs.map(q=>{n++;return `<div class="row" style="align-items:center;flex-wrap:wrap"><span style="flex:1;min-width:220px"><b>${n}</b> &nbsp;${q}</span>${yn(n-1)}</div>`}).join('')}</div>`).join('')}
 <div class="card"><div class="grid"><div><label>Score</label><b class="big">${sc} / 25</b></div><div><label>Seuil requis (75 %)</label><b class="big">19 / 25</b></div><div><label>&nbsp;</label>${25-rep} critères sans réponse</div></div><div class="grid"><div><label>Observations générales de l’évaluateur</label><textarea rows="3" oninput="F.fl.g=this.value">${e(f.g)}</textarea></div><div><label>Points à améliorer avant reconvocation</label><textarea rows="3" oninput="F.fl.imp=this.value">${e(f.imp)}</textarea></div></div><p style="text-align:right"><button class="pri" onclick="saveFl(${sc},${rep})">Enregistrer la fiche</button></p></div>`;
}
function saveFl(s,rep){const f=F.fl,a=S.ag.find(x=>x.id==f.ag);if(!a)return alert('Choisis l’agent évalué.');if(rep<25&&!confirm('Des critères n’ont pas de réponse. Enregistrer quand même ?'))return;S.fl.unshift({d:now(),n:a.name,s,by:me().name,g:f.g,imp:f.imp});sv();F.fl=nF();alert('Fiche enregistrée.');render()}

function page(k){if(k=='ppa')return ppa();if(k=='recrutement')return recrutement();if(k=='firstlincoln')return firstlincoln();const t=PG[k]||'Page';S.pages=S.pages||{};const c=S.pages[k]||'';return `<h2>${t}</h2><p class="sub">${adm()?'Tu es admin : tu peux rédiger cette page.':'Contenu rédigé par l’administration.'}</p><div class="card">${adm()?`<textarea id="pg" rows="16" placeholder="Écris le contenu…">${e(c)}</textarea><br><br><button class="pri" onclick="S.pages['${k}']=$('#pg').value;sv();alert('Enregistré')">Enregistrer</button>`:c?`<div style="white-space:pre-wrap">${e(c)}</div>`:'<span class="sub">Page vide pour l’instant.</span>'}</div>`}
render();

/* ================= OUTILS ADMIN (console du navigateur, F12) =================
   createAdmin('Prénom Nom','identifiant','MotDePasse1')  -> crée un compte admin
   resetAll()                                              -> remet le site à zéro (efface TOUTES les données de ce navigateur)
   Si tu ne veux pas ces outils en production, supprime ce bloc. */
function createAdmin(name,u,p){
  if(!name||!u||!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(p||''))return console.error('Nom, identifiant et mot de passe (8 car. min, 1 lettre + 1 chiffre) requis.');
  u=u.toLowerCase();
  if(S.ag.some(x=>x.u===u))return console.error('Identifiant déjà pris.');
  S.ag.push({id:'a'+Date.now(),name,mat:freeMat(),g:GR[0],u,p,admin:true});
  sv();console.log('Admin créé :',u);render();
}
function resetAll(){
  if(!confirm('Tout effacer et remettre le site à zéro ?'))return;
  try{localStorage.removeItem(K)}catch(e){}
  location.hash='';location.reload();
}

