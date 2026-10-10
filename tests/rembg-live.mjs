// Executed only by GitHub Actions, copied into the pinned rembg runner's web/browser.
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {chromium} from 'playwright';

const site='https://lilyco-42.github.io/rembg/';
const evidence=fileURLToPath(new URL('../browser-results-live/',import.meta.url));
await mkdir(evidence,{recursive:true});
const info=JSON.parse(await readFile(new URL('../dist/BUILD_INFO.json',import.meta.url),'utf8'));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const fingerprints={};
for(const name of ['index.html','app.mjs','worker.mjs','region-editor.mjs','sw.js']){
 const expected=hash(await readFile(new URL('../dist/'+name,import.meta.url)));
 const response=await fetch(site+name+'?release='+info.source_commit);
 assert.ok(response.ok,`${name}: HTTP ${response.status}`);
 const actual=hash(Buffer.from(await response.arrayBuffer()));
 assert.equal(actual,expected,`${name} must match the validated release candidate`);
 fingerprints[name]=actual;
}
const photo=await readFile(new URL('../../test/778c75fc182f4ca939a220bd4954f4b8.webp',import.meta.url));
const browser=await chromium.launch();
const checks=[],errors=[];
let page;
try{
 for(const mobile of [false,true]){
  const context=await browser.newContext({serviceWorkers:'block',...(mobile?{viewport:{width:375,height:812},isMobile:true,hasTouch:true}:{})});
  page=await context.newPage();page.setDefaultTimeout(30000);
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(site+'?release='+info.source_commit);
  await page.waitForFunction(()=>!document.querySelector('#files').disabled);
  await page.locator('#files').setInputFiles({name:'sample.webp',mimeType:'image/webp',buffer:photo});
  await page.getByRole('button',{name:'局部抠图',exact:true}).click();
  const surface=await page.getByLabel('局部抠图画布').boundingBox();
  if(mobile){
   const cdp=await context.newCDPSession(page);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:surface.x+surface.width*.27,y:surface.y+surface.height*.12}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:surface.x+surface.width*.76,y:surface.y+surface.height*.6}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }else{
   await page.mouse.move(surface.x+surface.width*.27,surface.y+surface.height*.12);
   await page.mouse.down();await page.mouse.move(surface.x+surface.width*.76,surface.y+surface.height*.6);await page.mouse.up();
  }
  const box=await page.locator('[data-coordinate]').evaluateAll(fields=>Object.fromEntries(fields.map(field=>[field.dataset.coordinate,Number(field.value)])));
  assert.ok(box.w>=16&&box.h>=16);
  await page.getByRole('button',{name:'在框内抠图',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('#status').textContent.startsWith('局部抠图已应用')&&!document.querySelector('#files').disabled,{},{timeout:180000});
  const url=await page.getByRole('link',{name:'下载透明底稿',exact:true}).getAttribute('href');
  const pixels=await page.evaluate(async({url,box})=>{
   const bitmap=await createImageBitmap(await (await fetch(url)).blob());
   const canvas=new OffscreenCanvas(bitmap.width,bitmap.height),ctx=canvas.getContext('2d');ctx.drawImage(bitmap,0,0);
   const rgba=ctx.getImageData(0,0,bitmap.width,bitmap.height).data;
   let inside=0,outside=0;
   for(let y=0;y<bitmap.height;y++)for(let x=0;x<bitmap.width;x++){
    if(!rgba[(y*bitmap.width+x)*4+3])continue;
    if(x>=box.x&&x<box.x+box.w&&y>=box.y&&y<box.y+box.h)inside++;else outside++;
   }
   const result={width:bitmap.width,height:bitmap.height,inside,outside};bitmap.close();return result;
  },{url,box});
  assert.equal(pixels.width,850);assert.equal(pixels.height,1088);assert.equal(pixels.outside,0);assert.ok(pixels.inside>100);
  await page.getByRole('checkbox',{name:'确认图片 sample.webp'}).check();
  await page.waitForFunction(()=>document.querySelector('#saveStatus').textContent.startsWith('批次已保存'));
  const download=page.waitForEvent('download');await page.locator('#exportBatch').click();
  await (await download).saveAs(resolve(evidence,mobile?'mobile-delivery.zip':'desktop-delivery.zip'));
  await page.screenshot({path:resolve(evidence,mobile?'mobile-live.png':'desktop-live.png'),fullPage:true});
  await page.getByRole('button',{name:'删除图片 sample.webp',exact:true}).click();
  await page.waitForFunction(()=>!document.querySelector('#files').disabled&&document.querySelector('#status').textContent.startsWith('已删除'));
  await page.reload();
  await page.waitForFunction(()=>!document.querySelector('#files').disabled&&document.querySelector('#saveStatus').textContent.startsWith('已恢复'));
  assert.equal(await page.locator('.result-card').count(),0);
  assert.equal(await page.locator('#exportBatch').isDisabled(),true);
  const samples=Array.from({length:10},(_,i)=>({name:`history-${i}.webp`,mimeType:'image/webp',buffer:photo}));
  await page.locator('#files').setInputFiles(samples);
  await page.waitForFunction(()=>!document.querySelector('#files').disabled&&document.querySelector('#saveStatus').textContent.startsWith('批次已保存'));
  assert.equal(await page.locator('.result-body:visible').count(),1);
  assert.ok(await page.locator('#results').evaluate(el=>el.clientHeight<=innerHeight*.7+2&&el.scrollHeight>el.clientHeight));
  await page.locator('#collapseHistory').click();assert.equal(await page.locator('.result-body:visible').count(),0);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:resolve(evidence,mobile?'mobile-history-live.png':'desktop-history-live.png'),fullPage:true});
  await page.locator('#clearHistory').click();
  await page.waitForFunction(()=>!document.querySelector('#files').disabled&&document.querySelector('#saveStatus').textContent.startsWith('批次已保存'));
  await page.reload();await page.waitForFunction(()=>!document.querySelector('#files').disabled&&document.querySelector('#saveStatus').textContent.startsWith('已恢复'));
  assert.equal(await page.locator('.result-card').count(),0);
  checks.push({mobile,box,...pixels,confirmed_export:true,delete_persists:true,bounded_history:true,clear_persists:true});await context.close();
 }
 assert.deepEqual(errors,[]);
 await writeFile(resolve(evidence,'live.json'),JSON.stringify({passed:true,site,source:info,fingerprints,checks,limitations:['Mobile Chromium emulation, not physical Android','Existing repository technical fixture; no commercial image quality certification']},null,2));
 console.log('Published rembg site passed desktop and mobile real WASM acceptance.');
}catch(error){
 await page?.screenshot({path:resolve(evidence,'failure.png'),fullPage:true}).catch(()=>{});
 await writeFile(resolve(evidence,'live.json'),JSON.stringify({passed:false,site,source:info,fingerprints,checks,errors,error:error.stack},null,2));throw error;
}finally{await browser.close();}
