// Environment, mission systems and input for the Eden campaign.
const TAU = Math.PI * 2;
let seed = 80521;
function randomField() {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
}
const stone = new THREE.MeshStandardMaterial({color:0x425558,roughness:.64,metalness:.35,flatShading:true});
const bone = new THREE.MeshStandardMaterial({color:0xb4ad83,roughness:.57,metalness:.28,flatShading:true});
const signal = new THREE.MeshBasicMaterial({color:0xe1ff99});
const dark = new THREE.MeshStandardMaterial({color:0x172f31,roughness:.7,metalness:.3});
function piece(parent,geo,mat,x,y,z) {
    const mesh = new THREE.Mesh(geo,mat);
    mesh.position.set(x,y,z); mesh.castShadow = !mat.isMeshBasicMaterial;
    mesh.receiveShadow=true; parent.add(mesh); return mesh;
}
// Segmented, cantilevered gate surrounding a luminous atmospheric aperture.
const arch = new THREE.Group();
arch.position.set(0,0,-34); scene.add(arch);
const keystone = new THREE.BoxGeometry(1,1,1);
for(let i=0;i<48;i++){
    if(i===9||i===10||i===29) continue;
    const a=i*TAU/48, r=10;
    const slab=piece(arch,keystone,i%5===0?bone:stone,r*Math.cos(a),12+r*Math.sin(a),0);
    slab.scale.set(i%3===0?2.1:1.45,1.15,2.0+randomField());slab.rotation.z=a;
    const seam=piece(arch,keystone,signal,9.1*Math.cos(a),12+9.1*Math.sin(a),1.05);
    seam.scale.set(.13,.97,.1);seam.rotation.z=a;
}
const halo=piece(arch,new THREE.TorusGeometry(8.75,.065,5,96),signal,0,12,0);
const veilMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{t:{value:0}},
vertexShader:'varying vec2 v; void main(){v=uv*2.-1.;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
fragmentShader:'varying vec2 v;uniform float t;void main(){float r=length(v);float a=atan(v.y,v.x);float w=sin(31.*r+3.*sin(a*5.+t*.6)-t*1.7);float edge=pow(r,3.);gl_FragColor=vec4(mix(vec3(.13,.45,.35),vec3(.76,.94,.54),edge),(.075+.22*edge+.10*max(w,0.))*smoothstep(1.,.95,r));}'.replace('smoothstep(1.,.95,r)','(1.-smoothstep(.95,1.,r))')});
piece(arch,new THREE.CircleGeometry(8.7,96),veilMat,0,12,0);
for(const x of [-8,8]){
    const support=piece(arch,new THREE.CylinderGeometry(1,2.6,12,5),stone,x,5,0);
    support.rotation.z=x>0?-.18:.18;
}
for(let i=0;i<82;i++){
    const a=randomField()*TAU,r=96+randomField()*30,h=8+randomField()*28;
    const ridge=piece(scene,new THREE.ConeGeometry(1,1,5),stone,Math.cos(a)*r,h*.42,Math.sin(a)*r);
    ridge.scale.set(8+randomField()*15,h,11+randomField()*11);ridge.rotation.z=(randomField()-.5)*.5;ridge.castShadow=false;
}
// A single instanced draw per species for the ground-cover field.
function scatterInstances(geometry, material,count,place){
    const batch=new THREE.InstancedMesh(geometry,material,count);
    const o=new THREE.Object3D();
    for(let i=0;i<count;i++){place(o,i);o.updateMatrix();batch.setMatrixAt(i,o.matrix);}
    batch.receiveShadow=true;scene.add(batch);return batch;
}
scatterInstances(new THREE.ConeGeometry(.13,1,3),new THREE.MeshStandardMaterial({color:0x719478,flatShading:true}),6800,(o,i)=>{
    if(i%8===0){o.userData.x=(randomField()-.5)*185;o.userData.z=(randomField()-.5)*185;}
    o.position.set(o.userData.x+(randomField()-.5)*1.7,.32,o.userData.z+(randomField()-.5)*1.7);
    o.rotation.set((randomField()-.5)*.6,randomField()*6,(randomField()-.5)*.9);
    o.scale.set(1.8,.4+randomField()*1.4,1);
});
scatterInstances(new THREE.DodecahedronGeometry(1,0),stone,480,(o)=>{
    o.position.set((randomField()-.5)*195,.05,(randomField()-.5)*195);
    o.scale.set(.3+randomField(),.1+randomField()*.45,.4+randomField());o.rotation.set(.1,randomField()*6,.12);
});
const tex=document.createElement('canvas'); tex.width=tex.height=512;
const ctx=tex.getContext('2d');ctx.fillStyle='#afbbac';ctx.fillRect(0,0,512,512);
for(let i=0;i<23000;i++){
    const n=Math.floor(60+randomField()*135);
    ctx.fillStyle='rgba('+n+','+n+','+n+',.32)';ctx.fillRect(randomField()*512,randomField()*512,1+randomField()*9,1+randomField()*3);
}
const turf=new THREE.CanvasTexture(tex);turf.wrapS=turf.wrapT=THREE.RepeatWrapping;turf.repeat.set(18,18);
ground.material.map=turf;grid.visible=false;
const weatherGeo=new THREE.BufferGeometry(), coords=new Float32Array(1200*3);
for(let i=0;i<coords.length;i++)coords[i]=randomField();
weatherGeo.setAttribute('position',new THREE.BufferAttribute(coords,3));
const weatherMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
uniforms:{t:{value:0},mode:{value:0},tint:{value:new THREE.Color(0xdff8a3)},anchor:{value:new THREE.Vector2()}},
vertexShader:`uniform float t,mode;uniform vec2 anchor;varying float strength;
void main(){vec3 p=position;float rain=step(.5,mode)*(1.-step(1.5,mode));p.x=mod(p.x*60.+t*.52-anchor.x,60.)-30.+anchor.x;
p.z=mod(p.z*60.+sin(t*.42+position.x*22.)-anchor.y,60.)-30.+anchor.y;
p.y=mod(p.y*14.+t*mix(.38,-9.,rain),14.);vec4 eye=modelViewMatrix*vec4(p,1.);
strength=.45+.5*sin(position.z*90.+t)*sin(position.z*90.+t);
gl_PointSize=clamp((rain>.5?95.:58.)/max(1.,-eye.z),1.2,7.);gl_Position=projectionMatrix*eye;}`,
fragmentShader:`uniform vec3 tint;uniform float mode;varying float strength;void main(){vec2 q=gl_PointCoord-.5;if(mode>.5&&mode<1.5)q.x*=3.;float b=max(0.,1.-2.*length(q));gl_FragColor=vec4(tint,b*b*strength);}`});
const weather=new THREE.Points(weatherGeo,weatherMat);weather.frustumCulled=false;scene.add(weather);
const nodes=[];
for(let i=0;i<3;i++){
    const g=new THREE.Group(),a=i*TAU/3;
    g.position.set(Math.sin(a)*16,0,Math.cos(a)*16); scene.add(g);
    piece(g,new THREE.CylinderGeometry(2.4,2.9,.55,6),dark,0,.28,0);
    const ring=piece(g,new THREE.TorusGeometry(3.2,.08,5,48),signal,0,.1,0);ring.rotation.x=-Math.PI/2;
    const crystal=piece(g,new THREE.OctahedronGeometry(1.25),bone,0,2.3,0);crystal.scale.y=1.5;
    const orbit=piece(g,new THREE.TorusGeometry(1.65,.065,5,32),signal,0,2.3,0);
    nodes.push({g,crystal,orbit,charge:0});g.visible=false;
}
let elapsed=0,paused=false,touchFire=false,footfall=0, audioCtx;
const navHint=document.querySelector('#navHint');
const climates=[
    [0xffdda3,0xb6ecbf,0xd8ee86,.012,0x54705f],
    [0xa8c5ff,0x65ccd0,0x7ecbf6,.023,0x334c59],
    [0xffb392,0xdf7192,0xff9458,.019,0x563e47]
];
function enterBiome(level){
    shockwaves.forEach(w=>w.mesh.visible=false);
    warning.visible=false;strikeDelay=4;castTime=0;
    const [sun,sky,particles,density]=climates[level-1];
    dirLight.color.setHex(sun);hemiLight.color.setHex(sky);signal.color.setHex(particles);
    weatherMat.uniforms.tint.value.setHex(particles);weatherMat.uniforms.mode.value=level-1;
    scene.fog.density=density;
    nodes.forEach(n=>{n.charge=0;n.g.visible=level===2;});
    document.querySelector('#metric').textContent=level===2?'Relays bound':'Hostiles';
    navHint.textContent='';player.position.set(0,0,0);player.velocity.set(0,0,0);
    projPool.items.forEach(p=>{p.active=false;p.mesh.visible=false;});
    LEVELS[level-1].groundColor=climates[level-1][4];
    if(level===1) enemies[0].attackCooldown=1;
}
function worldUpdate(dt){
    advanceWaves(dt);
    elapsed+=dt; veilMat.uniforms.t.value=weatherMat.uniforms.t.value=elapsed;
    weatherMat.uniforms.anchor.value.set(player.position.x,player.position.z);
    sovereignStrike(dt);
    if(currentLevel!==2)return;
    let closest=null, distance=Infinity;
    for(const n of nodes){
        if(n.charge>=1)continue;
        n.crystal.rotation.y+=dt;n.orbit.rotation.set(elapsed,.6,elapsed*.35);
        n.crystal.position.y=2.4+Math.sin(elapsed*2)*.25;
        const d=Math.hypot(player.position.x-n.g.position.x,player.position.z-n.g.position.z);
        if(d<distance){distance=d;closest=n;}
    }
    if(!closest)return;
    if(distance>3.5){
        const dx=closest.g.position.x-player.position.x,dz=closest.g.position.z-player.position.z;
        const arrows=['↑','↗','→','↘','↓','↙','←','↖'];
        navHint.textContent=arrows[(Math.round(Math.atan2(dx,-dz)/(Math.PI/4))+8)%8]+'  Relay  ·  '+Math.ceil(distance)+' m';return;
    }
    closest.charge=Math.min(1,closest.charge+dt/2.4);
    navHint.textContent='Binding relay  '+Math.floor(100*closest.charge)+'%';
    if(closest.charge===1){
        emitParticles(closest.crystal.getWorldPosition(new THREE.Vector3()),0x8cefff,45,12);
        tone(330,780,.35,.08);closest.g.visible=false;levelKills++;score+=300;
        scoreDisplay.textContent=String(score).padStart(4,'0');updateMissionUI();checkLevelProgress();
    }
}
function suitDetail(p){
    if(!p.armL)return;
    const plate=new THREE.IcosahedronGeometry(1,0);
    for(const side of [-1,1]){
        const arm=side<0?p.armL:p.armR;
        const shoulder=piece(arm,plate,bone,0,1.15,.02);shoulder.scale.set(.86,.69,.84);
        const fist=piece(arm,plate,stone,0,-1.25,.3);fist.scale.set(.72,.78,.68);
        const leg=piece(p.group,new THREE.CylinderGeometry(.49,.37,1.45,6),stone,side*.6,.78,0);
        piece(leg,keystone,dark,0,-.48,.25).scale.set(.75,.45,1.1);
        (p.legs??=[]).push(leg);
    }
    piece(p.torso,plate,stone,0,.25,.65).scale.set(1.22,1.1,.48);
    piece(p.torso,new THREE.OctahedronGeometry(.3),signal,0,.58,1.13);
}
function animateFrame(dt){
    if(player.armL && !player.legs)suitDetail(player);
    const moving=Math.min(1,Math.hypot(player.velocity.x,player.velocity.z)/12);
    footfall+=dt*(moving?11:2);
    if(player.legs){
        const swing=Math.sin(footfall)*moving;
        player.armL.rotation.x=swing*.68-.14;player.armR.rotation.x=-swing*.68-.14;
        player.legs[0].rotation.x=-swing*.65;player.legs[1].rotation.x=swing*.65;
        player.torso.position.y=2.5+Math.abs(swing)*.16+Math.sin(elapsed*2)*.035;
        player.torso.rotation.z=swing*.065;
    }
    if(player.isDashing)emitParticles(player.position,0xc7fc97,3,4);
    for(const e of enemies)if(e.active){
        e.core.scale.setScalar(1.1+.4*Math.sin(elapsed*5+e.id));
        if(!e.crown){
            e.crown=piece(e.group,new THREE.TorusGeometry(1.3,.09,5,6),bone,0,1.3,0);
            for(let i=0;i<3;i++){const a=i*TAU/3;piece(e.crown,new THREE.ConeGeometry(.28,1.2,4),stone,1.45*Math.cos(a),1.45*Math.sin(a),0).rotation.z=a-Math.PI/2;}
        }
        e.crown.rotation.set(elapsed*.8,e.id+elapsed,elapsed*.35);
        e.core.position.y=1.15;
    }
}
function menuVista(t){
    veilMat.uniforms.t.value=weatherMat.uniforms.t.value=t*8;
    weatherMat.uniforms.anchor.value.set(0,-23);
    const wide=innerWidth/innerHeight>1.2;
    camera.position.set(16+Math.sin(t)*2,7+Math.sin(t*.4),0);
    camera.lookAt(wide?-10:-2,10,-34);
}
function unlockAudio(){
    try{audioCtx??=new(window.AudioContext||window.webkitAudioContext)();audioCtx.resume().catch(()=>{});}catch{}
}
function tone(start,end,length,volume){
    if(!audioCtx||audioCtx.state!=='running')return;
    const o=audioCtx.createOscillator(),g=audioCtx.createGain(),now=audioCtx.currentTime;
    o.type='triangle';o.frequency.setValueAtTime(start,now);o.frequency.exponentialRampToValueAtTime(end,now+length);
    g.gain.setValueAtTime(volume,now);g.gain.exponentialRampToValueAtTime(.0001,now+length);
    o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(now+length);
}
function resetInput(){Object.keys(keys).forEach(k=>keys[k]=false);touchFire=isShooting=false;stick.firstElementChild.style.transform='';}
function togglePause(){
    if(currentState!==GAME_STATE.PLAYING)return;
    paused=!paused;resetInput();document.querySelector('#pauseSheet').classList.toggle('hidden',!paused);
}
document.querySelector('#pauseBtn').onclick=togglePause;
document.querySelector('#resume').onclick=togglePause;
addEventListener('keydown',e=>{if(e.code==='Escape'&&!e.repeat)togglePause();});
addEventListener('blur',()=>{resetInput();if(!paused&&currentState===GAME_STATE.PLAYING)togglePause();});
const stick=document.querySelector('#stick');
function steer(e){
    const r=stick.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)/36,y=(e.clientY-r.top-r.height/2)/36;
    const len=Math.max(1,Math.hypot(x,y));stick.firstElementChild.style.transform='translate('+x/len*23+'px,'+y/len*23+'px)';
    keys.a=x<-.25;keys.d=x>.25;keys.w=y<-.25;keys.s=y>.25;
}
stick.onpointerdown=e=>{stick.setPointerCapture(e.pointerId);steer(e);};
stick.onpointermove=e=>{if(stick.hasPointerCapture(e.pointerId))steer(e);};
stick.onlostpointercapture=()=>{keys.a=keys.d=keys.w=keys.s=false;stick.firstElementChild.style.transform='';};
document.querySelectorAll('[data-act]').forEach(b=>{
    const set=val=>{if(b.dataset.act==='fire')touchFire=val;else keys[b.dataset.act]=val;};
    b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);set(true);};b.onlostpointercapture=()=>set(false);
});
// The Sovereign marks a patch of ground before a radial discharge.
// Jumping the strike or slipping outside its perimeter avoids damage.
const warningMat=new THREE.MeshBasicMaterial({color:0xff634f,transparent:true,opacity:.85,depthWrite:false,side:THREE.DoubleSide});
const warning=piece(scene,new THREE.RingGeometry(4.8,5,64),warningMat,0,.08,0);
warning.rotation.x=-Math.PI/2;warning.visible=false;
const chargeDisc=piece(warning,new THREE.CircleGeometry(1,48),new THREE.MeshBasicMaterial({color:0xff7548,transparent:true,opacity:.2,depthWrite:false,side:THREE.DoubleSide}),0,0,.015);
let strikeDelay=4, castTime=0;
function sovereignStrike(dt){
    if(currentLevel!==3||!enemies[0].active)return;
    if(castTime>0){
        castTime=Math.max(0,castTime-dt);
        chargeDisc.scale.setScalar(5*(1-castTime/1.6));
        warningMat.opacity=.55+.4*Math.abs(Math.sin(castTime*10));
        if(castTime===0){
            const impact=warning.position;shockwave(impact,5,0xff804f);
            emitParticles(impact,0xff8a50,55,14);tone(100,32,.35,.12);addShake(.18,.17);
            if(Math.hypot(player.position.x-impact.x,player.position.z-impact.z)<5 && player.position.y<1.5)player.takeDamage(26);
            warning.visible=false;navHint.textContent='';
        }
    }else if((strikeDelay-=dt)<=0){
        castTime=1.6;strikeDelay=enemies[0].health<250?2.5:4.4;
        warning.position.set(player.position.x,.08,player.position.z);warning.visible=true;chargeDisc.scale.setScalar(.01);
        navHint.textContent='Ground surge  ·  Jump or dash clear';tone(250,510,.35,.065);
    }
}
// Consolidate stationary polygons into regional material batches. Keep animated
// meshes, skinned characters and interactive relay assemblies independent.
function batchScenery(){
    const buckets=new Map();
    const roots=[arch,...scene.children.filter(x=>x.userData.trunkRadius || (x.type==='Group'&&x.children.length&&x.children.every(c=>c.isMesh&&c.material.color&&SHRUB_COLORS.includes(c.material.color.getHex()))) || (x.isMesh&&x.geometry.type==='ConeGeometry'&&x.material===stone))];
    for(const root of roots){
        root.updateWorldMatrix(true,true);
        root.traverse(m=>{
            if(!m.isMesh||m.material===veilMat||m===halo)return;
            const mat=m.material,id=[mat.type,mat.color.getHex(),Math.floor(m.matrixWorld.elements[12]/35),Math.floor(m.matrixWorld.elements[14]/35)].join('/');
            if(!buckets.has(id))buckets.set(id,{mat,meshes:[]});
            buckets.get(id).meshes.push(m);
        });
    }
    for(const {mat,meshes} of buckets.values()){
        if(meshes.length<2)continue;
        const pos=[],norm=[];
        for(const m of meshes){
            const geom=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();geom.applyMatrix4(m.matrixWorld);
            pos.push(...geom.attributes.position.array);norm.push(...geom.attributes.normal.array);geom.dispose();m.parent.remove(m);
        }
        const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(norm,3));
        piece(scene,geo,mat,0,0,0);
    }
}
batchScenery();
// Folded leaves have a raised midrib and alternate warm and cool faces.
function fernGeometry(){
    const vertices=[], colors=[];
    for(let leaf=0;leaf<8;leaf++){
        const a=leaf*2.39996,l=1+randomField()*.8;
        const p=(along,height,side)=>[Math.cos(a)*along*l-Math.sin(a)*side,height*l,Math.sin(a)*along*l+Math.cos(a)*side];
        const root=p(0,0,0),mid=p(.48,.55,0),tip=p(1,.64,0);
        for(const side of [-1,1]){
            const edge=p(.54,.44,side*.14);
            vertices.push(...root,...edge,...mid,...mid,...edge,...tip);
            const c=new THREE.Color(side<0?0x3c9073:0x99b976);
            for(let k=0;k<6;k++)colors.push(c.r,c.g,c.b);
        }
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();return g;
}
scatterInstances(fernGeometry(),new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:.68}),620,o=>{
    o.position.set((randomField()-.5)*170,.02,(randomField()-.5)*170);
    o.scale.setScalar(.4+randomField()*.85);o.rotation.set(0,randomField()*TAU,0);
});
const shockwaves=Array.from({length:12},()=>{
    const mat=new THREE.MeshBasicMaterial({color:0xecf6a5,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide});
    const mesh=piece(scene,new THREE.RingGeometry(.9,1,48),mat,0,.12,0);mesh.rotation.x=-Math.PI/2;mesh.visible=false;
    return {mesh,age:1,radius:1};
});
function shockwave(position,radius,color){
    const wave=shockwaves.find(w=>!w.mesh.visible);if(!wave)return;
    wave.age=0;wave.radius=radius;wave.mesh.position.set(position.x,.12,position.z);wave.mesh.material.color.setHex(color);wave.mesh.scale.setScalar(.04);wave.mesh.visible=true;
}
function advanceWaves(dt){
    for(const w of shockwaves)if(w.mesh.visible){
        w.age=Math.min(1,w.age+dt*2);w.mesh.scale.setScalar(.03+w.radius*(1-(1-w.age)**2));
        w.mesh.material.opacity=.7*(1-w.age);w.mesh.visible=w.age<1;
    }
}
