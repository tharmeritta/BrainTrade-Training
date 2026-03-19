(()=>{var a={};a.id=4463,a.ids=[4463],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},7879:a=>{"use strict";a.exports=import("firebase-admin/firestore")},9801:a=>{"use strict";a.exports=import("firebase-admin/app")},9847:(a,b,c)=>{"use strict";c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{POST:()=>i});var e=c(10641),f=c(32155),g=c(57503),h=a([g]);g=(h.then?(await h)():h)[0];let j=`คุณคือ "ครูฝึกเทเลเซลล์มืออาชีพ" ที่มีประสบการณ์ฝึกพนักงานขายทางโทรศัพท์มากกว่า 15 ปี โดยเชี่ยวชาญพฤติกรรมลูกค้าคนไทย

หน้าที่ของคุณคือจำลองสถานการณ์ฝึกอบรม (Roleplay Simulation) เพื่อทดสอบและพัฒนาทักษะการรับมือข้อโต้แย้งของลูกค้าไทยสำหรับพนักงานเทเลเซลล์

รูปแบบการฝึกมีทั้งหมด 4 ระดับ โดยความยากจะเพิ่มขึ้นตามลำดับ

Level 1 – ลูกค้าปฏิเสธทั่วไป
ตัวอย่าง:
- ไม่สนใจ
- ยังไม่ว่าง
- ขอคิดดูก่อน
- มีใช้อยู่แล้ว

Level 2 – ลูกค้าสงสัยสินค้า
ตัวอย่าง:
- มันดีจริงไหม
- มีหลักฐานอะไร
- กลัวไม่คุ้ม
- กลัวโดนหลอก

Level 3 – ลูกค้าต่อรอง/เปรียบเทียบ
ตัวอย่าง:
- แพงไป
- ที่อื่นถูกกว่า
- ขอส่วนลดได้ไหม
- ถ้าไม่ลดก็ไม่เอา

Level 4 – ทดสอบภาวะกดดัน
ตัวอย่าง:
- ไม่ไว้ใจเทเลเซลล์
- โดนหลอกมาก่อน
- ถามรายละเอียดลึก
- ทดสอบความรู้ของเซลล์
- พยายามกดดันเซลล์

กติกาการฝึก:

1. คุณจะสวมบทบาทเป็น "ลูกค้า"
2. ผู้ฝึก (ผู้ใช้) ต้องตอบโต้เหมือนกำลังขายจริง
3. เมื่อบทสนทนาในแต่ละรอบจบ คุณจะประเมินผล

เกณฑ์การประเมิน (ให้คะแนน 1-10)
- การสร้างความสัมพันธ์
- การรับมือข้อโต้แย้ง
- ความน่าเชื่อถือ
- การปิดการขาย
- ความเป็นธรรมชาติแบบคนไทย

ถ้าคะแนนรวมต่ำกว่า 7 ถือว่า "ไม่ผ่าน"

ถ้าไม่ผ่าน:
- อธิบายข้อผิดพลาด
- แนะนำวิธีตอบที่ดีกว่า
- ให้ลองใหม่

ถ้าผ่าน:
- เลื่อนไปยัง Level ถัดไป

เมื่อผ่านครบ Level 1 ถึง Level 4 ให้ประกาศว่า

"คุณผ่านการทดสอบเทเลเซลล์ระดับมืออาชีพแล้ว"

รูปแบบการแสดงผลในแต่ละรอบต้องเป็นดังนี้:

สถานการณ์:
(อธิบายบริบทสั้น ๆ)

ลูกค้า:
(บทพูดของลูกค้า)

จากนั้นรอให้ผู้ใช้ตอบก่อนจึงดำเนินบทสนทนาต่อ

เมื่อบทสนทนาจบรอบ ให้แสดง

ผลการประเมิน
คะแนน:
จุดแข็ง:
จุดที่ต้องปรับปรุง:
ตัวอย่างคำตอบที่ดีกว่า:

จากนั้นจึงแจ้งว่า
ผ่าน / ไม่ผ่าน`;async function i(a){try{let{level:b,messages:c,agentId:d,agentName:h}=await a.json();if(![1,2,3,4].includes(b))return e.NextResponse.json({error:"Invalid level"},{status:400});let i=(0,f.N)(),k=`

ในการฝึกครั้งนี้ให้เริ่มต้นที่ Level ${b} ทันที`,l=c.slice(-10),m=(await i.chat.completions.create({model:"gpt-4o",messages:[{role:"system",content:j+k},...l.map(a=>({role:a.role,content:a.content}))],max_tokens:800,temperature:.85})).choices[0].message.content??"",n=!1;try{let a=await i.chat.completions.create({model:"gpt-4o-mini",messages:[{role:"system",content:'You are a classifier. Read the Thai text and determine if the trainer explicitly declared the trainee has PASSED (ผ่าน) this round — meaning a positive verdict with score >= 7. Return only valid JSON. If the text says "ไม่ผ่าน" or shows a negative verdict, return false.'},{role:"user",content:`Text: "${m}"

Respond with: {"passed": true} or {"passed": false}`}],max_tokens:20,temperature:0,response_format:{type:"json_object"}}),b=JSON.parse(a.choices[0].message.content??'{"passed":false}');n=!0===b.passed}catch{n=!1}return n&&d&&h&&await (0,g.N4)("ai_eval_logs",{agentId:d,agentName:h,level:b,passed:!0}),e.NextResponse.json({reply:m,passed:n})}catch(a){return console.error("AI eval chat error:",a),e.NextResponse.json({error:"Server error"},{status:500})}}d()}catch(a){d(a)}})},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},11997:a=>{"use strict";a.exports=require("punycode")},19121:a=>{"use strict";a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},27910:a=>{"use strict";a.exports=require("stream")},28354:a=>{"use strict";a.exports=require("util")},29021:a=>{"use strict";a.exports=require("fs")},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},32155:(a,b,c)=>{"use strict";c.d(b,{N:()=>f});var d=c(76874);let e=null;function f(){if(!process.env.OPENAI_API_KEY)throw Error("OPENAI_API_KEY is not set");return e||(e=new d.Ay({apiKey:process.env.OPENAI_API_KEY})),e}},33873:a=>{"use strict";a.exports=require("path")},37830:a=>{"use strict";a.exports=require("node:stream/web")},44870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55591:a=>{"use strict";a.exports=require("https")},57075:a=>{"use strict";a.exports=require("node:stream")},57503:(a,b,c)=>{"use strict";c.a(a,async(a,d)=>{try{c.d(b,{N4:()=>g,ZG:()=>h,mH:()=>l,r$:()=>k,v:()=>j,yX:()=>i});var e=c(69758),f=a([e]);async function g(a,b){let c=(0,e.i)(),d=crypto.randomUUID(),f=new Date().toISOString(),g={id:d,timestamp:f,...b};return await c.collection(a).doc(d).set(g),g}async function h(a){try{let b=(0,e.i)();return(await b.collection(a).get()).docs.map(a=>a.data())}catch{return[]}}async function i(a,b){try{let c=(0,e.i)(),d=await c.collection(a).doc(b).get();return d.exists?d.data():null}catch{return null}}async function j(a,b,c){let d=(0,e.i)();await d.collection(a).doc(b).update(c)}async function k(a,b){try{let c=(0,e.i)();await c.collection(a).doc(b).delete()}catch{}}async function l(a,b,c){let d=(0,e.i)(),f=new Date().toISOString(),g={...c,updatedAt:f};return await d.collection(a).doc(b).set(g),g}e=(f.then?(await f)():f)[0],d()}catch(a){d(a)}})},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},69758:(a,b,c)=>{"use strict";c.a(a,async(a,d)=>{try{c.d(b,{i:()=>h});var e=c(9801),f=c(7879),g=a([e,f]);[e,f]=g.then?(await g)():g;let h=()=>(0,f.getFirestore)((0,e.getApps)().length>0?(0,e.getApps)()[0]:(0,e.initializeApp)({credential:(0,e.cert)({projectId:process.env.FIREBASE_PROJECT_ID,clientEmail:process.env.FIREBASE_CLIENT_EMAIL,privateKey:process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g,"\n")})}));d()}catch(a){d(a)}})},73024:a=>{"use strict";a.exports=require("node:fs")},73566:a=>{"use strict";a.exports=require("worker_threads")},74075:a=>{"use strict";a.exports=require("zlib")},78335:()=>{},79551:a=>{"use strict";a.exports=require("url")},81630:a=>{"use strict";a.exports=require("http")},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},93981:(a,b,c)=>{"use strict";c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{handler:()=>x,patchFetch:()=>w,routeModule:()=>y,serverHooks:()=>B,workAsyncStorage:()=>z,workUnitAsyncStorage:()=>A});var e=c(95736),f=c(9117),g=c(4044),h=c(39326),i=c(32324),j=c(261),k=c(54290),l=c(85328),m=c(38928),n=c(46595),o=c(3421),p=c(17679),q=c(41681),r=c(63446),s=c(86439),t=c(51356),u=c(9847),v=a([u]);u=(v.then?(await v)():v)[0];let y=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/ai-eval/route",pathname:"/api/ai-eval",filename:"route",bundlePath:"app/api/ai-eval/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"C:\\Users\\Admin\\OneDrive - Tiebreak Solutions\\Documents\\Antigravity Workspace\\Antigravity Github Repo\\BrainTrade Training\\app\\api\\ai-eval\\route.ts",nextConfigOutput:"standalone",userland:u}),{workAsyncStorage:z,workUnitAsyncStorage:A,serverHooks:B}=y;function w(){return(0,g.patchFetch)({workAsyncStorage:z,workUnitAsyncStorage:A})}async function x(a,b,c){var d;let e="/api/ai-eval/route";"/index"===e&&(e="/");let g=await y.prepare(a,b,{srcPage:e,multiZoneDraftMode:!1});if(!g)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:u,params:v,nextConfig:w,isDraftMode:x,prerenderManifest:z,routerServerContext:A,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,resolvedPathname:D}=g,E=(0,j.normalizeAppPath)(e),F=!!(z.dynamicRoutes[E]||z.routes[D]);if(F&&!x){let a=!!z.routes[D],b=z.dynamicRoutes[E];if(b&&!1===b.fallback&&!a)throw new s.NoFallbackError}let G=null;!F||y.isDev||x||(G=D,G="/index"===G?"/":G);let H=!0===y.isDev||!F,I=F&&!H,J=a.method||"GET",K=(0,i.getTracer)(),L=K.getActiveScopeSpan(),M={params:v,prerenderManifest:z,renderOpts:{experimental:{cacheComponents:!!w.experimental.cacheComponents,authInterrupts:!!w.experimental.authInterrupts},supportsDynamicResponse:H,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:null==(d=w.experimental)?void 0:d.cacheLife,isRevalidate:I,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>y.onRequestError(a,b,d,A)},sharedContext:{buildId:u}},N=new k.NodeNextRequest(a),O=new k.NodeNextResponse(b),P=l.NextRequestAdapter.fromNodeNextRequest(N,(0,l.signalFromNodeResponse)(b));try{let d=async c=>y.handle(P,M).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let d=K.getRootSpanAttributes();if(!d)return;if(d.get("next.span_type")!==m.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${d.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=d.get("next.route");if(e){let a=`${J} ${e}`;c.setAttributes({"next.route":e,"http.route":e,"next.span_name":a}),c.updateName(a)}else c.updateName(`${J} ${a.url}`)}),g=async g=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!(0,h.getRequestMeta)(a,"minimalMode")&&B&&C&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let e=await d(g);a.fetchMetrics=M.renderOpts.fetchMetrics;let i=M.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=M.renderOpts.collectedTags;if(!F)return await (0,o.I)(N,O,e,M.renderOpts.pendingWaitUntil),null;{let a=await e.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(e.headers);j&&(b[r.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,d=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=r.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:e.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:d}}}}catch(b){throw(null==f?void 0:f.isStale)&&await y.onRequestError(a,b,{routerKind:"App Router",routePath:e,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})},A),b}},l=await y.handleResponse({req:a,nextConfig:w,cacheKey:G,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:z,isRoutePPREnabled:!1,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,responseGenerator:k,waitUntil:c.waitUntil});if(!F)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,h.getRequestMeta)(a,"minimalMode")||b.setHeader("x-nextjs-cache",B?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),x&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,p.fromNodeOutgoingHttpHeaders)(l.value.headers);return(0,h.getRequestMeta)(a,"minimalMode")&&F||m.delete(r.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,q.getCacheControlHeader)(l.cacheControl)),await (0,o.I)(N,O,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};L?await g(L):await K.withPropagatedContext(a.headers,()=>K.trace(m.BaseServerSpan.handleRequest,{spanName:`${J} ${a.url}`,kind:i.SpanKind.SERVER,attributes:{"http.method":J,"http.target":a.url}},g))}catch(b){if(b instanceof s.NoFallbackError||await y.onRequestError(a,b,{routerKind:"App Router",routePath:E,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})}),F)throw b;return await (0,o.I)(N,O,new Response(null,{status:500})),null}}d()}catch(a){d(a)}})},96487:()=>{}};var b=require("../../../webpack-runtime.js");b.C(a);var c=b.X(0,[5873,1692,6874],()=>b(b.s=93981));module.exports=c})();