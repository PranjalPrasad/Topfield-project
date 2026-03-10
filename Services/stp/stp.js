// Header & Footer fetch
fetch('../../header/header.html').then(r=>r.text()).then(html=>{document.getElementById('header-placeholder').innerHTML=html;const s=document.createElement('script');s.src='../../header/header.js';document.head.appendChild(s);}).catch(()=>{});
fetch('../../footer/footer.html').then(r=>r.text()).then(html=>{document.getElementById('footer-placeholder').innerHTML=html;const s=document.createElement('script');s.src='../../footer/footer.js';document.head.appendChild(s);}).catch(()=>{});

gsap.registerPlugin(ScrollTrigger);

// Hero Three.js
(function initHeroThree(){
  const canvas = document.getElementById('three-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setClearColor(0x050c1c,1);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth/canvas.clientHeight, 0.1, 200);
  camera.position.set(0,8,20);
  camera.lookAt(0,0,0);
  function resizeHero(){ const w=canvas.parentElement.clientWidth, h=canvas.parentElement.clientHeight; renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); }
  resizeHero(); window.addEventListener('resize', resizeHero);
  scene.add(new THREE.AmbientLight(0x0a2342,4));
  const dirLight = new THREE.DirectionalLight(0x00c6d4,3); dirLight.position.set(5,10,8); scene.add(dirLight);
  const pLight1 = new THREE.PointLight(0x00c6d4,4,40); pLight1.position.set(-8,3,0); scene.add(pLight1);
  const pLight2 = new THREE.PointLight(0x1565a8,3,40); pLight2.position.set(8,3,0); scene.add(pLight2);
  const starGeo = new THREE.BufferGeometry(); const starCount = 800; const starPos = new Float32Array(starCount*3); for(let i=0;i<starCount*3;i++) starPos[i]=(Math.random()-0.5)*120; starGeo.setAttribute('position',new THREE.BufferAttribute(starPos,3)); const starMat = new THREE.PointsMaterial({ color:0x3b9fd4, size:0.12, transparent:true, opacity:0.5 }); scene.add(new THREE.Points(starGeo,starMat));
  const waterGeo = new THREE.PlaneGeometry(50,50,64,64); const waterMat = new THREE.MeshStandardMaterial({ color:0x0a4f8a, metalness:0.2, roughness:0.3, transparent:true, opacity:0.85, wireframe:false }); const water = new THREE.Mesh(waterGeo,waterMat); water.rotation.x = -Math.PI/2.2; water.position.y = -3; scene.add(water);
  const wPos = waterGeo.attributes.position; const wCount = wPos.count; const origY = new Float32Array(wCount); for(let i=0;i<wCount;i++) origY[i]=wPos.getY(i);
  const bubbles = []; const bubbleMat = new THREE.MeshStandardMaterial({ color:0x00c6d4, transparent:true, opacity:0.55, metalness:0.5, roughness:0.2 }); for(let i=0;i<28;i++){ const r = 0.1+Math.random()*0.35; const geo = new THREE.SphereGeometry(r,12,12); const m = new THREE.Mesh(geo,bubbleMat.clone()); m.material.opacity = 0.2+Math.random()*0.5; m.position.set((Math.random()-0.5)*22, -2+Math.random()*8, (Math.random()-0.5)*14); m.userData = { speed:0.3+Math.random()*0.6, amp:0.4+Math.random()*0.8, offset:Math.random()*Math.PI*2, xDrift:(Math.random()-0.5)*0.008, startY:m.position.y }; scene.add(m); bubbles.push(m); }
  const ringMat = new THREE.MeshStandardMaterial({ color:0x00c6d4, transparent:true, opacity:0.18, wireframe:true }); for(let i=0;i<4;i++){ const geo = new THREE.TorusGeometry(3+i*1.5,0.04,8,60); const mesh = new THREE.Mesh(geo,ringMat.clone()); mesh.rotation.x = Math.PI/2+(i*0.15); mesh.position.y = -1+i*0.5; mesh.userData.rotSpeed = 0.002+i*0.001; scene.add(mesh); bubbles.push(mesh); }
  const flowGeo = new THREE.BufferGeometry(); const flowCount = 400; const flowPos = new Float32Array(flowCount*3); const flowVel = []; for(let i=0;i<flowCount;i++){ flowPos[i*3]=(Math.random()-0.5)*30; flowPos[i*3+1]=(Math.random()-0.5)*12; flowPos[i*3+2]=(Math.random()-0.5)*20; flowVel.push({ vx:(Math.random()-0.5)*0.02, vy:(Math.random()-0.5)*0.01, vz:(Math.random()-0.5)*0.02 }); } flowGeo.setAttribute('position',new THREE.BufferAttribute(flowPos,3)); const flowMat = new THREE.PointsMaterial({ color:0x7eeeff, size:0.08, transparent:true, opacity:0.6 }); const flowPoints = new THREE.Points(flowGeo,flowMat); scene.add(flowPoints);
  let t=0; function animate(){ requestAnimationFrame(animate); t+=0.012; for(let i=0;i<wCount;i++){ const x=wPos.getX(i), z=wPos.getZ(i); wPos.setY(i, origY[i] + Math.sin(x*0.4+t)*0.3 + Math.cos(z*0.35+t*0.9)*0.25 + Math.sin((x+z)*0.2+t*1.2)*0.15); } wPos.needsUpdate=true; waterGeo.computeVertexNormals(); for(let i=0;i<bubbles.length;i++){ const b=bubbles[i], ud=b.userData; if(ud.speed!==undefined && ud.startY!==undefined){ b.position.y = ud.startY + Math.sin(t*ud.speed+ud.offset)*ud.amp; b.position.x += ud.xDrift; if(b.position.x>11) b.position.x=-11; if(b.position.x<-11) b.position.x=11; b.rotation.x += 0.01; b.rotation.z += 0.008; } else if(ud.rotSpeed){ b.rotation.z += ud.rotSpeed; b.rotation.y += ud.rotSpeed*0.5; } } const fp=flowGeo.attributes.position; for(let i=0;i<flowCount;i++){ let x=fp.getX(i)+flowVel[i].vx; let y=fp.getY(i)+flowVel[i].vy; let z=fp.getZ(i)+flowVel[i].vz; if(x>15) x=-15; if(x<-15) x=15; if(y>6) y=-6; if(y<-6) y=6; if(z>10) z=-10; if(z<-10) z=10; fp.setXYZ(i,x,y,z); } fp.needsUpdate=true; camera.position.x = Math.sin(t*0.06)*1.5; camera.position.y = 8 + Math.sin(t*0.04)*0.5; camera.lookAt(0,0,0); pLight1.intensity = 3 + Math.sin(t*1.2)*1.5; pLight2.intensity = 2.5 + Math.cos(t*0.9)*1.2; renderer.render(scene,camera); } animate();
})();

// GSAP animations
gsap.set(['#heroBadge','#heroTitle','#heroSub','#heroCtas','#heroStats'],{y:-30,opacity:0});
gsap.timeline({ defaults:{ ease:'power3.out' } }).to('#heroBadge',{opacity:1,y:0,duration:0.8,delay:0.5}).to('#heroTitle',{opacity:1,y:0,duration:1},'-=0.4').to('#heroSub',{opacity:1,y:0,duration:0.8},'-=0.5').to('#heroCtas',{opacity:1,y:0,duration:0.7},'-=0.4').to('#heroStats',{opacity:1,y:0,duration:0.7},'-=0.3');
gsap.from('#whatLeft',{opacity:0,x:-60,duration:1,scrollTrigger:{trigger:'#what',start:'top 80%'}});
gsap.from('#stpDiagram',{opacity:0,x:60,duration:1,scrollTrigger:{trigger:'#what',start:'top 80%'}});
ScrollTrigger.create({ trigger:'#diagStages', start:'top 75%', onEnter:()=>{ gsap.to('.diag-stage',{opacity:1,y:0,duration:0.5,stagger:0.12}); document.getElementById('flowFill').style.width='100%'; } });
gsap.from('#typesHeader',{opacity:0,y:40,duration:0.8,scrollTrigger:{trigger:'#types',start:'top 80%'}});
gsap.to('.type-card',{opacity:1,y:0,duration:0.7,stagger:0.1,scrollTrigger:{trigger:'.types-grid',start:'top 80%'}});
gsap.from('#proc3dHeader',{opacity:0,y:40,duration:0.8,scrollTrigger:{trigger:'#process-3d',start:'top 80%'}});
gsap.from('#appsHeader',{opacity:0,y:40,duration:0.8,scrollTrigger:{trigger:'#applications',start:'top 80%'}});
ScrollTrigger.create({ trigger:'.apps-grid', start:'top 80%', onEnter:()=> gsap.to('.app-card',{opacity:1,scale:1,duration:0.6,stagger:0.07,ease:'back.out(1.3)'}) });
gsap.set('.app-card',{opacity:0,scale:0.88});
gsap.from('#specsHeader',{opacity:0,y:40,duration:0.8,scrollTrigger:{trigger:'#specs',start:'top 80%'}});
ScrollTrigger.create({ trigger:'#specTable', start:'top 80%', onEnter:()=> gsap.to('#specTable tr',{opacity:1,x:0,duration:0.5,stagger:0.08}) });
gsap.to('.comp-badge',{opacity:1,x:0,duration:0.6,stagger:0.1,scrollTrigger:{trigger:'.compliance-badges',start:'top 80%'}});
gsap.from('#ctaContent',{opacity:0,y:50,duration:1,scrollTrigger:{trigger:'#cta-section',start:'top 80%'}});
gsap.to('.cta-ring',{scale:1.15,duration:4,repeat:-1,yoyo:true,ease:'sine.inOut',stagger:1});

// Scroll top button
const scrollBtn=document.getElementById('scrollTop');
window.addEventListener('scroll',()=> scrollBtn.classList.toggle('show', window.scrollY>500));

// Water drops
function spawnWaterDrops(containerId, count=10){ const el=document.getElementById(containerId); if(!el) return; for(let i=0;i<count;i++){ const d=document.createElement('div'); d.className='w-drop'; const size=6+Math.random()*16; d.style.cssText=`width:${size}px;height:${size*1.35}px;left:${Math.random()*95}%;bottom:${-size}px;animation-duration:${5+Math.random()*8}s;animation-delay:${Math.random()*6}s;opacity:${0.3+Math.random()*0.5};`; el.appendChild(d); } }
spawnWaterDrops('whatDrops',10); spawnWaterDrops('typesDrops',8); spawnWaterDrops('appsDrops',12);

document.querySelectorAll('.ripple-ring').forEach((ring,i)=>{ ring.style.animation='none'; gsap.fromTo(ring,{scale:0.2,opacity:0.7},{scale:3,opacity:0,duration:4+i*0.8,repeat:-1,delay:i*1.2,ease:'power1.out'}); });
document.querySelectorAll('.float-hex-el').forEach((hex,i)=>{ gsap.to(hex,{ y:i%2===0?-30:25, rotation:i%2===0?20:-18, duration:7+i*1.5, repeat:-1, yoyo:true, ease:'sine.inOut', delay:i*0.8 }); });
document.querySelectorAll('.mol-float').forEach((mol,i)=>{ mol.style.animation='none'; gsap.to(mol,{ opacity:0.25, y:-25, rotation:15, duration:5+i*1.2, repeat:-1, yoyo:true, ease:'sine.inOut', delay:i*1.5 }); });
document.querySelectorAll('.bubble-rise').forEach((b,i)=>{ b.style.animation='none'; gsap.to(b,{ y:-(70+Math.random()*70), opacity:0, scale:1.4, x:(Math.random()-0.5)*30, duration:2.5+Math.random()*2.5, repeat:-1, delay:Math.random()*3, ease:'power1.out' }); });
ScrollTrigger.create({ trigger:'#what', start:'top 75%', onEnter:()=>{ document.querySelectorAll('.pipe-flow-inner').forEach(p=>{ gsap.to(p,{ width:'100%', duration:2, ease:'power2.out', delay:0.3 }); }); } });
ScrollTrigger.create({ trigger:'#types', start:'top 70%', onEnter:()=>{ document.querySelectorAll('.water-level').forEach((wl,i)=>{ gsap.to(wl,{ height:'30%', duration:1.2, ease:'power2.out', delay:0.3+i*0.1 }); gsap.to(wl,{ height:'0%', duration:1, ease:'power2.in', delay:2.5+i*0.1 }); }); } });
ScrollTrigger.create({ trigger:'#process-3d', start:'top 75%', onEnter:()=>{ gsap.from('.proc-bubble',{ scale:0.5, opacity:0, duration:0.8, stagger:0.15, ease:'back.out(1.5)', delay:0.2 }); } });
document.querySelectorAll('.app-card').forEach(card=>{ const water = card.querySelector('.app-water'); card.addEventListener('mouseenter',()=>{ gsap.to(water,{ height:'45%', duration:0.5, ease:'power2.out' }); }); card.addEventListener('mouseleave',()=>{ gsap.to(water,{ height:'0%', duration:0.4, ease:'power2.in' }); }); });
document.querySelectorAll('.type-card').forEach(card=>{ const water = card.querySelector('.water-level'); card.addEventListener('mouseenter',()=>{ gsap.to(water,{ height:'30%', duration:0.5, ease:'power2.out' }); }); card.addEventListener('mouseleave',()=>{ gsap.to(water,{ height:'0%', duration:0.4, ease:'power2.in' }); }); });
document.querySelectorAll('.comp-badge').forEach((b,i)=>{ b.addEventListener('mouseenter',()=>{ gsap.to(b,{ x:8, duration:0.25, ease:'power2.out' }); gsap.to(b,{ x:0, duration:0.25, ease:'power2.in', delay:0.25 }); }); });

// CTA canvas
(function initCtaCanvas(){ const canvas = document.getElementById('ctaCanvas'); if(!canvas) return; const ctx = canvas.getContext('2d'); let W,H; function resize(){ W=canvas.width=canvas.offsetWidth; H=canvas.height=canvas.offsetHeight; } resize(); window.addEventListener('resize',resize); const particles=[]; for(let i=0;i<50;i++){ particles.push({ x:Math.random()*1200, y:Math.random()*300, r:1+Math.random()*2, vx:(Math.random()-0.5)*0.5, vy:(Math.random()-0.5)*0.3, life:Math.random(), speed:0.004+Math.random()*0.004 }); } function drawCta(){ ctx.clearRect(0,0,W,H); particles.forEach(p=>{ p.life+=p.speed; if(p.life>1){ p.life=0; p.x=Math.random()*W; p.y=Math.random()*H; } const a = Math.sin(p.life*Math.PI); p.x+=p.vx; p.y+=p.vy; if(p.x<0) p.x=W; if(p.x>W) p.x=0; if(p.y<0) p.y=H; if(p.y>H) p.y=0; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle=`rgba(0,198,212,${a*0.6})`; ctx.shadowBlur=5; ctx.shadowColor='rgba(0,198,212,0.8)'; ctx.fill(); }); requestAnimationFrame(drawCta); } drawCta(); })();

document.getElementById('hero').addEventListener('click',function(e){ const rect = this.getBoundingClientRect(); const x = e.clientX - rect.left; const y = e.clientY - rect.top; for(let i=0;i<3;i++){ const ring = document.createElement('div'); ring.style.cssText=`position:absolute;left:${x}px;top:${y}px;width:10px;height:10px;border-radius:50%;border:2px solid rgba(0,198,212,0.8);transform:translate(-50%,-50%);pointer-events:none;z-index:7;`; this.appendChild(ring); gsap.to(ring,{ scale:18+i*6, opacity:0, duration:1.5+i*0.3, ease:'power2.out', delay:i*0.15, onComplete:()=>ring.remove() }); } });
ScrollTrigger.create({ trigger:'#hero', start:'top top', onEnter:()=>{ document.querySelectorAll('.hero-stat .num').forEach(s=>{ gsap.from(s,{ opacity:0, y:20, duration:0.8, ease:'back.out(1.5)', delay:1.2 }); }); } });
document.querySelectorAll('.proc-bubble').forEach((b,i)=>{ gsap.to(b,{ boxShadow:`0 0 0 ${10+i*2}px rgba(0,198,212,0.06), 0 0 0 ${5+i}px rgba(0,198,212,0.1)`, duration:1.8+i*0.3, repeat:-1, yoyo:true, ease:'sine.inOut', delay:i*0.4 }); });
ScrollTrigger.create({ trigger:'#diagStages', start:'top 75%', onEnter:()=>{ gsap.to('.diag-stage',{ borderColor:'rgba(0,198,212,0.35)', duration:0.6, stagger:0.12, yoyo:true, repeat:1, ease:'sine.inOut', delay:0.8 }); } });

// AOS init
AOS.init();