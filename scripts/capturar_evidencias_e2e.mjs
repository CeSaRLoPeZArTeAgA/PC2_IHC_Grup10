import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const output='assets/evidencias-integracion';
await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1366,height:940},locale:'es-PE'});
const shot=async file=>page.screenshot({path:output+'/'+file,fullPage:true});
const content=async selector=>page.locator(selector).innerText();
try{
 await page.goto('http://127.0.0.1:4173/');
 await page.locator('#begin').click();
 await page.locator('#frontView .body-part[data-zone="Cabeza"]').click();
 await page.locator('#zoneNext').click();
 await page.locator('#regionOk').click();
 for(const answer of ['Dolor ficticio de cabeza','Hace dos dias','Moderado','No']){
  await page.locator('#answer').fill(answer);
  await page.locator('#qNext').click();
 }
 await page.locator('#summarize').click();
 await page.locator('#summaryText').waitFor({state:'visible'});
 await page.locator('#send').click();
 await page.locator('#p5').waitFor({state:'visible'});
 const code=await content('#code');
 assert.match(code,/SALA-[0-9A-F]{12}/);
 await shot('01-caso-enviado.png');
 await page.locator('#doctorTab').click();
 await page.locator('#roomList .room-card').first().waitFor({state:'visible'});
 assert.ok((await content('#roomList')).includes(code.trim()));
 await shot('02-bandeja-casos.png');
 await page.locator('#roomList .room-card').first().click();
 await page.locator('#caseView').waitFor({state:'visible'});
 await page.locator('#ack').click();
 await page.waitForFunction(() => document.querySelector('#caseState')?.textContent.includes('recibido'));
 assert.match(await content('#caseState'),/recibido/);
 const response='Caso ficticio recibido para demostracion; pendiente de revision por personal de salud.';
 await page.locator('#message').fill(response);
 await page.locator('#reply').click();
 await page.locator('#replyHistory li').first().waitFor({state:'visible'});
 assert.ok((await content('#replyHistory')).includes(response));
 assert.equal(await page.locator('#message').inputValue(),response);
 await shot('03-confirmacion-historial.png');
 await page.locator('#patientTab').click();
 await page.locator('#refresh').click();
 await page.waitForFunction(() => document.querySelector('#receipt')?.textContent.includes('recibido'));
 assert.match(await content('#receipt'),/recibido/);
 assert.ok((await content('#doctorResponse')).includes(response));
 await shot('04-respuesta-paciente.png');
 await page.reload();
 await page.locator('#p5').waitFor({state:'visible',timeout:12000});
 await page.locator('#refresh').click();
 await page.waitForFunction(expected => document.querySelector('#doctorResponse')?.textContent.includes(expected),response);
 assert.ok((await content('#doctorResponse')).includes(response));
 await shot('05-recarga-caso.png');
 console.log('E2E correcto; caso:',code.trim());
}finally{await browser.close()}
