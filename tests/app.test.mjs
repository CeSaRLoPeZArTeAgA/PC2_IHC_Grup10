import test from 'node:test';import assert from 'node:assert/strict';import {localSummary,handler} from '../server.mjs';import http from 'node:http';
test('Resumen de demostración no es diagnóstico',()=>{const r=localSummary({region:'Cabeza',answers:{motivo:'Molestia de prueba'}});assert.equal(r.mode,'simulacion');assert.match(r.disclaimer,/diagnóstico/);assert.match(r.summary,/Cabeza/)});
test('API local crea, consulta, acusa recepción y responde con datos ficticios',async()=>{const s=http.createServer(handler);await new Promise(ok=>s.listen(0,'127.0.0.1',ok));const url='http://127.0.0.1:'+s.address().port;
try{const h=await(await fetch(url+'/api/health')).json();assert.equal(h.ok,true);
const invalid=await fetch(url+'/api/cases',{method:'POST',headers:{'content-type':'application/json'},body:'{}'});assert.equal(invalid.status,422);
const created=await(await fetch(url+'/api/cases',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({alias:'Persona ficticia',region:'Brazo izquierdo',answers:{motivo:'Molestia articular en codo tras esfuerzo',inicio:'Hace 2 horas',intensidad:'Moderada',adicionales:'Sensación de pesadez local'},summary:'Zona: Brazo izquierdo. Motivo: Molestia articular en codo. Inicio: Hace 2 horas. Intensidad: Moderada.'})})).json();assert.equal(created.status,'enviado');assert.ok(created.code);
const ack=await(await fetch(url+'/api/cases/ack',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({code:created.code})})).json();assert.equal(ack.status,'recibido');
const rep=await(await fetch(url+'/api/cases/reply',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({code:created.code,message:'Respuesta simulada'})})).json();assert.equal(rep.replies.length,1);
const find=await(await fetch(url+'/api/cases/by-code?code='+created.code)).json();assert.equal(find.code,created.code);
}finally{await new Promise(ok=>s.close(ok))}});
test('Interfaz principal sin banner ni pie académico y con límites de IA visibles en el resumen',async()=>{
 const fs=await import('node:fs/promises');
 for(const name of ['index.html','prototipos/alternativa-a.html','prototipos/alternativa-b.html','prototipos/alternativa-c.html']){
  const page=await fs.readFile(new URL('../public/'+name,import.meta.url),'utf8');
  assert.doesNotMatch(page,/PROTOTIPO ACADÉMICO|CASOS FICTICIOS\.|LEC06\s*\+\s*LEC07|PWA educativa|<section class="warning"|<footer\b/i,name);
 }
 const main=await fs.readFile(new URL('../public/index.html',import.meta.url),'utf8');
 assert.match(main,/La IA no emite un diagnóstico/);
 assert.match(main,/No existe clasificación clínica validada/);
});
test('Personalización continua: perfil adaptativo con ritmo y manejo de errores',async()=>{
 const fs=await import('node:fs/promises');
 const html=await fs.readFile(new URL('../public/index.html',import.meta.url),'utf8');
 assert.match(html,/id="profileCard"/);
 assert.match(html,/id="profRhythm"/);
 assert.match(html,/id="profErrors"/);
 assert.match(html,/id="adaptiveBanner"/);
 assert.match(html,/id="rhythmHint"/);
 const js=await fs.readFile(new URL('../public/app.js',import.meta.url),'utf8');
 assert.match(js,/userProfile/);
 assert.match(js,/recordCorrection/);
 assert.match(js,/questionTimer/);
});

test('Integración de silueta anterior/posterior con ayudas adaptativas',async()=>{
 const fs=await import('node:fs/promises');
 const html=await fs.readFile(new URL('../public/index.html',import.meta.url),'utf8');
 const js=await fs.readFile(new URL('../public/app.js',import.meta.url),'utf8');
 for(const id of ['frontView','backView','tabFront','tabBack','profileCard','profRhythm','profErrors','adaptiveBanner','rhythmHint','btnCorrectRegion'])assert.ok(html.includes('id="'+id+'"'),id);
 for(const key of ['switchView','recordCorrection','userProfile','questionTimer','dataset.zone'])assert.ok(js.includes(key),key);
 assert.doesNotMatch(html,/PROTOTIPO ACADÉMICO|LEC06\s*\+\s*LEC07|PWA educativa/);
});

test('El médico puede revisar el historial y el texto enviado permanece visible',async()=>{
 const fs=await import('node:fs/promises');
 const html=await fs.readFile(new URL('../public/index.html',import.meta.url),'utf8');
 const js=await fs.readFile(new URL('../public/app.js',import.meta.url),'utf8');
 assert.match(html,/id="replyHistorySection"/);
 assert.match(html,/id="replyHistory"/);
 assert.match(js,/history\.replaceChildren\(\)/);
 assert.match(js,/history\.append\(item\)/);
 assert.match(js,/message\.textContent=response\.message/);
 assert.match(js,/Esta respuesta ya está registrada/);
 const sendHandler=js.slice(js.indexOf("$('reply').onclick="));
 assert.ok(sendHandler.includes('const response='));
 assert.ok(!sendHandler.includes("$('message').value=''"));
});

test('Multiusuario: salas de teleconsulta colaborativas y bandeja de salas activas',async()=>{
 const fs=await import('node:fs/promises');
 const html=await fs.readFile(new URL('../public/index.html',import.meta.url),'utf8');
 const js=await fs.readFile(new URL('../public/app.js',import.meta.url),'utf8');
 assert.match(html,/id="roomList"/);
 assert.match(html,/id="refreshRooms"/);
 assert.match(html,/Salas de teleconsulta rural/);
 assert.match(js,/async function loadRooms/);
 assert.match(js,/\/api\/rooms/);
 assert.match(js,/SALA-/);
 const s=http.createServer(handler);
 await new Promise(ok=>s.listen(0,'127.0.0.1',ok));
 const url='http://127.0.0.1:'+s.address().port;
 try{
  const rooms=await(await fetch(url+'/api/rooms')).json();
  assert.ok(Array.isArray(rooms));
  assert.ok(rooms.length>0);
  assert.ok(rooms[0].code);
 }finally{
  await new Promise(ok=>s.close(ok));
 }
});

