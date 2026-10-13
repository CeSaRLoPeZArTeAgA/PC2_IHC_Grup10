const $=id=>document.getElementById(id);
const keys=['motivo','inicio','intensidad','adicionales'];
const questions=[
['¿Qué molestia sientes?','Cuéntanos qué sientes, con tus propias palabras.'],
['¿Cuándo comenzó la molestia?','¿Hace cuánto tiempo empezó?'],
['¿Qué intensidad tiene la molestia?','¿Es leve, moderada o muy fuerte? Es una percepción personal.'],
['¿Notas alguna otra molestia?','¿Hay algo más que quieras contar? Si no, escribe "no".']];
let session={alias:'Paciente de prueba',region:'',answers:{motivo:'',inicio:'',intensidad:'',adicionales:''},summary:'',priority:''},question=0,step=0,sent=null;
const zones=['Cabeza','Tórax','Abdomen','Espalda','Brazo izquierdo','Brazo derecho','Pierna izquierda','Pierna derecha','Otra zona'];
function savePrefs(){localStorage.setItem('triagevoz_prefs_demo',JSON.stringify({language:$('language').value,contrast:$('contrast').checked,large:$('large').checked,speak:$('speak').checked}));document.body.classList.toggle('high',$('contrast').checked);document.body.classList.toggle('large',$('large').checked)}
try{const x=JSON.parse(localStorage.getItem('triagevoz_prefs_demo')||'{}');$('language').value=x.language||'es';$('contrast').checked=!!x.contrast;$('large').checked=!!x.large;$('speak').checked=!!x.speak}catch{}savePrefs();
['language','contrast','large','speak'].forEach(k=>$(k).addEventListener('change',savePrefs));
function msg(s){if($('speak').checked&&'speechSynthesis'in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(s);u.lang='es-PE';speechSynthesis.speak(u)}}
function show(n){step=n;for(let i=0;i<6;i++)$('p'+i).hidden=i!==n;$('stage').textContent=n===5?'Estado de envío':('Paso '+(Math.min(n+1,5))+' de 5');if(n===3)renderQuestion();if(n===4)renderReview()}
function patientTab(active){$('patient').hidden=!active;$('doctor').hidden=active;$('patientTab').classList.toggle('active',active);$('doctorTab').classList.toggle('active',!active);}
$('patientTab').onclick=()=>patientTab(true);$('doctorTab').onclick=()=>patientTab(false);
zones.forEach(z=>{const b=document.createElement('button');b.type='button';b.textContent=z;b.onclick=()=>{$('region').value=z;session.region=z;paintZone()};$('zones').append(b)});
function paintZone(){const region=$('region').value.trim();$('zoneHint').textContent=region?'Región declarada: '+region:'Falta seleccionar una región.';Array.from($('zones').children).forEach(b=>b.classList.toggle('selected',b.textContent===region));}
$('region').oninput=paintZone;
function dictate(target){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){alert('Este navegador no dispone de dictado. Puedes escribir sin perder información.');return;}let r=new SR();r.lang='es-PE';r.interimResults=false;r.onresult=e=>{target.value=(target.value?target.value+' ':'')+e.results[0][0].transcript;target.dispatchEvent(new Event('input'))};r.onerror=()=>alert('El dictado no fue reconocido. Puedes continuar por escrito.');try{r.start()}catch{alert('No fue posible iniciar el micrófono. Usa el teclado.')}}
document.querySelectorAll('[data-saytarget]').forEach(b=>b.onclick=()=>dictate($(b.dataset.saytarget)));
$('begin').onclick=()=>{session.alias=$('alias').value.trim().slice(0,35)||'Paciente de prueba';show(1);msg('Puedes tocar o escribir dónde sientes la molestia.')};
$('zoneNext').onclick=()=>{session.region=$('region').value.trim().slice(0,90);if(!session.region){$('zoneHint').textContent='Indica una zona antes de continuar.';return;}$('confirmRegion').textContent=session.region;show(2);msg('Has señalado '+session.region+'. ¿Es correcto?')};
$('regionOk').onclick=()=>{question=0;show(3)};
document.querySelectorAll('[data-back]').forEach(b=>b.onclick=()=>show(Number(b.dataset.back)));
function renderQuestion(){$('questionCount').textContent='Pregunta '+(question+1)+' de '+questions.length;$('questionLabel').textContent=questions[question][0];$('answer').value=session.answers[keys[question]]||'';$('answerError').textContent='';msg(questions[question][0])}
function record(){const t=$('answer').value.trim();if(!t){$('answerError').textContent='Por favor, responde o escribe "no".';return false;}session.answers[keys[question]]=t.slice(0,700);return true;}
$('qNext').onclick=()=>{if(!record())return;if(question<3){question++;renderQuestion()}else show(4)};
$('qBack').onclick=()=>{if($('answer').value.trim())session.answers[keys[question]]=$('answer').value.trim();if(question>0){question--;renderQuestion()}else show(2)};
$('dictate').onclick=()=>dictate($('answer'));$('repeat').onclick=()=>msg(questions[question][0]);$('simplify').onclick=()=>{$('questionLabel').textContent=questions[question][1];msg(questions[question][1])};
function details(root,entries){root.replaceChildren();for(const [key,value] of entries){let dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=key;dd.textContent=value||'Sin dato';root.append(dt,dd)}}
function renderReview(){details($('review'),[['Paciente',session.alias],['Zona confirmada',session.region],['Molestia',session.answers.motivo],['Inicio',session.answers.inicio],['Intensidad declarada',session.answers.intensidad],['Síntomas adicionales',session.answers.adicionales]])}
async function api(url,options){const r=await fetch(url,options);let d=await r.json();if(!r.ok)throw Error(d.error||'No fue posible completar la acción');return d}
const jsonPost=(url,data)=>api(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data)});
$('summarize').onclick=async()=>{const b=$('summarize');b.disabled=true;try{const d=await jsonPost('/api/llm',session);session.summary=d.summary;session.priority=d.priority;$('summaryText').textContent=d.summary;$('summaryMode').textContent='Procedencia: '+(d.mode==='gemini'?'LLM remoto':'simulación local')+'. '+(d.warning||d.disclaimer||'');$('result').hidden=false;msg('Ya está disponible el resumen del relato ficticio.')}catch(e){alert(e.message)}finally{b.disabled=false}};
$('edit').onclick=()=>{question=0;$('result').hidden=true;show(3)};
$('send').onclick=async()=>{if(!session.summary)return;try{sent=await jsonPost('/api/cases',session);$('code').textContent=sent.code;$('delivery').textContent='Caso ficticio enviado al servidor de esta demostración.';$('receipt').textContent='Estado: enviado (aún NO confirmado como recibido).';$('result').hidden=true;show(5)}catch(e){$('delivery').textContent='Pendiente de envío: '+e.message;localStorage.setItem('triagevoz_borrador_ficticio',JSON.stringify(session));alert('No hay conexión. Se conserva el borrador de demostración en este navegador; no se marcará como recibido.')}};
async function refresh(){if(!sent)return;try{sent=await api('/api/cases/by-code?code='+encodeURIComponent(sent.code));$('receipt').textContent='Estado verificado: '+sent.status;$('doctorResponse').replaceChildren();for(const r of sent.replies){const p=document.createElement('p');p.textContent=r.author+': '+r.message;$('doctorResponse').append(p)}}catch(e){$('receipt').textContent='No es posible comprobar recepción: '+e.message}}
$('refresh').onclick=refresh;$('restart').onclick=()=>{session={alias:'Paciente de prueba',region:'',answers:{motivo:'',inicio:'',intensidad:'',adicionales:''},summary:'',priority:''};sent=null;$('region').value='';$('result').hidden=true;show(0)};
let doctorCase=null;function docRender(c){doctorCase=c;$('caseView').hidden=false;$('caseTitle').textContent='Caso '+c.code+' · '+c.alias;details($('caseDetails'),[['Zona',c.region],['Relato',c.answers.motivo],['Inicio',c.answers.inicio],['Intensidad',c.answers.intensidad],['Adicionales',c.answers.adicionales],['Resumen generado',c.summary]]);$('caseState').textContent='Estado confirmado por servidor: '+c.status;$('ack').disabled=c.status==='recibido';$('replyState').textContent='Respuestas registradas: '+c.replies.length;}
$('lookup').onclick=async()=>{try{const c=await api('/api/cases/by-code?code='+encodeURIComponent($('lookupCode').value));$('doctorErr').textContent='';docRender(c)}catch(e){$('caseView').hidden=true;$('doctorErr').textContent=e.message}};
$('ack').onclick=async()=>{if(!doctorCase)return;try{docRender(await jsonPost('/api/cases/ack',{code:doctorCase.code}))}catch(e){$('doctorErr').textContent=e.message}};
$('reply').onclick=async()=>{if(!doctorCase)return;try{docRender(await jsonPost('/api/cases/reply',{code:doctorCase.code,message:$('message').value}));$('message').value='';$('replyState').textContent='Respuesta del rol simulado registrada.'}catch(e){$('doctorErr').textContent=e.message}};
if('serviceWorker'in navigator){navigator.serviceWorker.register('/sw.js').catch(()=>{})}
