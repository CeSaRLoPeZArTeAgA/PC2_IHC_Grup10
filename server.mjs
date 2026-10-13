import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const pub=path.join(root,'public');
const storage=path.join(root,'data','runtime.json');
let cases=[];
try{const r=JSON.parse(await fs.readFile(storage,'utf8'));if(Array.isArray(r))cases=r;}catch{}
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.json':'application/json','.webmanifest':'application/manifest+json'};
const str=(s,n=700)=>String(s??'').trim().slice(0,n);
const send=(res,status,obj)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(JSON.stringify(obj));};
async function read(req){let s='';for await(const chunk of req){s+=chunk;if(s.length>120000)throw Error('too large');}try{return JSON.parse(s||'{}')}catch{throw Error('invalid JSON')}}
async function save(){await fs.mkdir(path.dirname(storage),{recursive:true});await fs.writeFile(storage+'.tmp',JSON.stringify(cases,null,2),{mode:0o600});await fs.rename(storage+'.tmp',storage);}
const clean=(x)=>{const a=x?.answers||{};return {alias:str(x?.alias,35)||'Paciente simulado',region:str(x?.region,90),answers:{motivo:str(a.motivo),inicio:str(a.inicio),intensidad:str(a.intensidad,80),adicionales:str(a.adicionales)},summary:str(x?.summary,1600),priority:'Pendiente de valoración del personal sanitario'};};
function localSummary(raw){const c=clean(raw);return {mode:'simulacion',summary:['Zona: '+(c.region||'no declarada'),'Motivo: '+(c.answers.motivo||'no declarado'),'Inicio: '+(c.answers.inicio||'no declarado'),'Intensidad: '+(c.answers.intensidad||'no declarada'),'Otros: '+(c.answers.adicionales||'no declarados')].join('. ')+'.',priority:'Pendiente de valoración del personal sanitario',disclaimer:'Solo resumen orientativo del relato ficticio; no constituye diagnóstico ni clasificación clínica.'};}
async function summarize(raw){const fallback=localSummary(raw);const key=process.env.GEMINI_API_KEY;if(!key)return fallback;
const model=process.env.GEMINI_MODEL||'gemini-2.5-flash';
const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),14000);
try{const prompt='Estructura SOLO el relato ficticio sin inventar datos, sin diagnóstico ni tratamiento. Devuelve JSON {"summary":"..."} de máximo 1200 caracteres. Datos: '+JSON.stringify(clean(raw));
const rsp=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(model)+':generateContent',{method:'POST',signal:ctl.signal,headers:{'content-type':'application/json','x-goog-api-key':key},body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{temperature:0.2,responseMimeType:'application/json'}})});
if(!rsp.ok)throw Error('LLM unavailable');const obj=await rsp.json();const s=obj.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('')||'{}';const parsed=JSON.parse(s);if(!parsed.summary||typeof parsed.summary!=='string')throw Error('LLM invalid');
return {...fallback,mode:'gemini',summary:parsed.summary.slice(0,1400),disclaimer:'Generado por IA sin validación médica.'};
}catch{return {...fallback,warning:'Servicio remoto no disponible; se utilizó resumen local simulado.'}}finally{clearTimeout(timer)}}
const byCode=c=>cases.find(x=>x.code===str(c,24).toUpperCase());
async function handler(req,res){const u=new URL(req.url||'/', 'http://localhost');try{
if(req.method==='GET'&&u.pathname==='/api/health')return send(res,200,{ok:true,cases:cases.length,model:process.env.GEMINI_API_KEY?'remoto-configurado':'simulacion'});
if(req.method==='POST'&&u.pathname==='/api/llm')return send(res,200,await summarize(await read(req)));
if(req.method==='POST'&&u.pathname==='/api/cases'){const obj=clean(await read(req));if(!obj.region&&!obj.answers.motivo)return send(res,422,{error:'Indique la región o motivo'});const rec={id:crypto.randomUUID(),code:crypto.randomBytes(6).toString('hex').toUpperCase(),...obj,status:'enviado',createdAt:new Date().toISOString(),ackAt:null,replies:[]};cases.push(rec);await save();return send(res,201,rec);}
if(req.method==='GET'&&u.pathname==='/api/cases/by-code'){const c=byCode(u.searchParams.get('code'));return c?send(res,200,c):send(res,404,{error:'Caso simulado no encontrado'});}
if(req.method==='POST'&&(u.pathname==='/api/cases/ack'||u.pathname==='/api/cases/reply')){const b=await read(req),c=byCode(b.code);if(!c)return send(res,404,{error:'Código no encontrado'});
if(u.pathname.endsWith('/ack')){c.status='recibido';c.ackAt=new Date().toISOString();}else{const m=str(b.message);if(!m)return send(res,422,{error:'Escriba respuesta'});c.replies.push({author:'Médico remoto (demo, no autenticado)',message:m,createdAt:new Date().toISOString()});}await save();return send(res,200,c);}
if(u.pathname.startsWith('/api/'))return send(res,404,{error:'API no encontrada'});
if(!['GET','HEAD'].includes(req.method))return send(res,405,{error:'Método no permitido'});
let p;try{p=decodeURIComponent(u.pathname)}catch{return send(res,400,{error:'URL no válida'})}
if(p.includes('\\')||p.includes('\0')||p.split('/').includes('..'))return send(res,403,{error:'Ruta prohibida'});
if(p==='/')p='/index.html';const file=path.resolve(pub,'.'+p);if(!file.startsWith(pub+path.sep))return send(res,403,{error:'Ruta prohibida'});
try{const b=await fs.readFile(file);res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream','x-content-type-options':'nosniff'});return res.end(req.method==='HEAD'?'':b)}catch{return send(res,404,{error:'Archivo no encontrado'})}
}catch(e){if(!res.headersSent)send(res,e.message==='invalid JSON'?400:500,{error:'Operación no completada'});}}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){http.createServer(handler).listen(Number(process.env.PORT||4173),'127.0.0.1',()=>console.log('TriageVoz Rural DEMO http://127.0.0.1:'+(process.env.PORT||4173)))}
export {handler,localSummary};