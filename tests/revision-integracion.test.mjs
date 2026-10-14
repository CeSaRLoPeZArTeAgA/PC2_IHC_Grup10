import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';

const runtime=path.join(os.tmpdir(),'triagevoz-revision-'+crypto.randomUUID()+'.json');
process.env.STORAGE_FILE=runtime;
const {handler}=await import('../server.mjs');
const server=http.createServer(handler);
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
after(async()=>{await new Promise(resolve=>server.close(resolve));await fs.rm(runtime,{force:true})});
async function post(endpoint,data){
 const r=await fetch(base+endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data)});
 return {status:r.status,body:await r.json()};
}

test('Catálogo ficticio cargado y bandeja distingue demostración de tiempo real',async()=>{
 const {body:rooms}=await (async()=>{const r=await fetch(base+'/api/rooms');return {body:await r.json()}})();
 assert.ok(Array.isArray(rooms));
 assert.equal(rooms.length,6);
 for(const room of rooms){
  assert.equal(room.type,'caso-demo');
  assert.equal(room.realtime,false);
  assert.ok(room.code);
  assert.ok(room.alias);
 }
});

test('Concurrencia: 8 solicitudes persisten sin perder casos',async()=>{
 const requests=Array.from({length:8},(_,i)=>post('/api/cases',{alias:'Persona ficticia '+i,region:'Cabeza',answers:{motivo:'Molestia de prueba '+i,inicio:'Hoy',intensidad:'Leve',adicionales:'No'}}));
 const records=await Promise.all(requests);
 assert.ok(records.every(r=>r.status===201));
 const codes=records.map(r=>r.body.code);
 assert.equal(new Set(codes).size,8);
 const persisted=JSON.parse(await fs.readFile(runtime,'utf8'));
 assert.ok(codes.every(code=>persisted.some(r=>r.code===code)));
});

test('Acuse idempotente y reintento de respuesta sin duplicar',async()=>{
 const created=await post('/api/cases',{alias:'Paciente inventado',region:'Tórax',answers:{motivo:'Relato ficticio'}});
 assert.equal(created.status,201);
 const code=created.body.code;
 const ack1=await post('/api/cases/ack',{code:'SALA-'+code});
 const ack2=await post('/api/cases/ack',{code});
 assert.equal(ack1.status,200);assert.equal(ack2.status,200);
 assert.equal(ack2.body.status,'recibido');
 assert.equal(ack1.body.ackAt,ack2.body.ackAt);
 const first=await post('/api/cases/reply',{code,message:'Mensaje de prueba sin consejos médicos.'});
 const repeat=await post('/api/cases/reply',{code,message:'Mensaje de prueba sin consejos médicos.'});
 assert.equal(first.status,200);assert.equal(repeat.status,200);
 assert.equal(repeat.body.replies.length,1);
 const missing=await post('/api/cases/reply',{code,message:'   '});
 assert.equal(missing.status,422);
 const byCode=await fetch(base+'/api/cases/by-code?code=SALA-'+code);
 assert.equal(byCode.status,200);
 assert.equal((await byCode.json()).replies.length,1);
});

test('Validación de entradas y limitación del ámbito API',async()=>{
 const invalid=await fetch(base+'/api/cases',{method:'POST',headers:{'content-type':'application/json'},body:'{invalido'});
 assert.equal(invalid.status,400);
 const empty=await post('/api/cases',{});
 assert.equal(empty.status,422);
 const missing=await fetch(base+'/api/cases/by-code?code=NOEXISTE');
 assert.equal(missing.status,404);
 const unsupported=await fetch(base+'/api/desconocida');
 assert.equal(unsupported.status,404);
});

test('Interfaz conserva mejoras previas y describe con precisión el carácter no clínico',async()=>{
 const html=await fs.readFile(new URL('../public/index.html',import.meta.url),'utf8');
 const app=await fs.readFile(new URL('../public/app.js',import.meta.url),'utf8');
 const required=['frontView','backView','profileCard','roomList','replyHistory','replyHistorySection'];
 for(const id of required)assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(html,/Bandeja de casos simulados/);
 assert.match(html,/No hay videollamada, chat en tiempo real ni autenticación clínica/);
 assert.match(app,/triagevoz_ultimo_caso_demo/);
 assert.match(app,/button\.disabled=true/);
 assert.match(app,/r\.interimResults=false/);
 assert.match(app,/history\.append\(item\)/);
});
