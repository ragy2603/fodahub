/* FodaSocial — núcleo JS compartilhado (NÃO apagar: as 7 páginas usam este arquivo) */
const $=id=>document.getElementById(id);
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function toast(m){const t=$('toast');if(!t)return;t.textContent=m;t.classList.add('show');clearTimeout(t._x);t._x=setTimeout(()=>t.classList.remove('show'),2400);}
function ago(ts){const s=(Date.now()-ts)/1000;if(s<60)return'agora';if(s<3600)return((s/60)|0)+'min';if(s<86400)return((s/3600)|0)+'h';return((s/86400)|0)+'d';}
function uid(p){return (p||'id')+'-'+Math.random().toString(36).slice(2,9);}

/* ---------- base oficial (vale pra todo mundo) ---------- */
const FS_URL='https://qqaphntpyqfnwkhzubrr.supabase.co',FS_KEY='sb_publishable_ZssQp8Rw_-BzT29tIpeDaQ_c2C5gUT_';
let SUPA=null;
function supaCfg(){let c={};try{c=JSON.parse(localStorage.getItem('fodsoc_cfg')||'{}');}catch(e){}return{url:c.url||FS_URL,key:c.key||FS_KEY};}
function supaInit(){
  try{
    const c=supaCfg();
    if(!c.url||!c.key||!window.supabase){SUPA=null;netUI();return false;}
    SUPA=window.supabase.createClient(c.url,c.key);
    netUI();return true;
  }catch(e){SUPA=null;netUI();return false;}
}
function netUI(){
  const d=$('netdot'),l=$('netlabel');if(!d||!l)return;
  if(SUPA){d.className='dot cloud';l.textContent='nuvem';}
  else{d.className='dot';l.textContent='…';}
}

/* ---------- sessão (espelho da sessão Auth) ---------- */
function me(){try{return JSON.parse(localStorage.getItem('fodsoc_me')||'null');}catch(e){return null;}}
function setMe(m){try{if(m)localStorage.setItem('fodsoc_me',JSON.stringify(m));else localStorage.removeItem('fodsoc_me');}catch(e){}meUI();}
function meUI(){const m=me(),b=$('me');if(b)b.textContent=(m&&m.ava)||'👤';}
function sessToMe(sess){const u=sess.user;setMe({nick:(u.user_metadata&&u.user_metadata.nick)||u.email.split('@')[0],ava:'😎',via:'nuvem',uid:u.id,ts:Date.now()});}
function needMe(){const m=me();if(!m){toast('⚠️ Entra primeiro');try{logout();}catch(e){}return null;}return m;}

/* ---------- Auth ---------- */
async function registerCloud(mail,pass,nick){
  supaInit();
  nick=(nick||'').trim().slice(0,20);
  if(nick.replace(/[^a-z0-9_.]/gi,'').length<3)return 'Nick com 3+ letras/números';
  mail=(mail||'').trim();
  if(!mail.includes('@'))return 'Digita teu email de verdade';
  if((pass||'').length<6)return 'Senha com 6+';
  const {data,error}=await SUPA.auth.signUp({email:mail,password:pass,options:{data:{nick}}});
  if(error)return error.message;
  setMe({nick,ava:'😎',via:'nuvem',uid:data.user&&data.user.id,ts:Date.now()});return null;
}
async function loginCloud(mail,pass){
  supaInit();
  mail=(mail||'').trim();if(!mail.includes('@'))return 'Digita teu email';
  const {data,error}=await SUPA.auth.signInWithPassword({email:mail,password:pass||''});
  if(error)return error.message;
  const nick=(data.user.user_metadata&&data.user.user_metadata.nick)||mail.split('@')[0];
  setMe({nick,ava:'😎',via:'nuvem',uid:data.user.id,ts:Date.now()});return null;
}
async function logout(){
  try{if(SUPA)await SUPA.auth.signOut();}catch(e){}
  try{localStorage.removeItem('fodsoc_me');}catch(e){}
  location.reload();
}

/* ---------- tela de login + portão ---------- */
let loginMode='login';
function loginTab(w){loginMode=w;try{$('lt-login').classList.toggle('active',w==='login');$('lt-reg').classList.toggle('active',w==='reg');}catch(e){}loginFields();}
function loginFields(){
  $('login-mode').textContent='só gente real • zero bots';
  let h='';
  if(loginMode==='reg')h+='<input type="text" id="l-nick" maxlength="20" placeholder="nick">';
  h+='<input type="email" id="l-mail" placeholder="email">';
  h+='<input type="password" id="l-pass" placeholder="senha">';
  h+=`<button class="mbtn" style="width:100%" onclick="doLogin()">${loginMode==='reg'?'Criar conta':'Entrar'}</button>`;
  $('login-fields').innerHTML=h;$('login-err').textContent='';
}
async function doLogin(){
  const gv=id=>{const e=$(id);return e?(e.value||''):'';};
  $('login-err').textContent='⏳ ...';
  let err;
  try{
    if(loginMode==='reg')err=await registerCloud(gv('l-mail'),gv('l-pass'),gv('l-nick'));
    else err=await loginCloud(gv('l-mail'),gv('l-pass'));
  }catch(e){err='Falha de rede. Tenta de novo.';}
  if(err){$('login-err').textContent='⚠️ '+err;return;}
  toast('👋 Bem-vindo ao FodaSocial!');
  enterApp();
}
function enterApp(){
  $('login-screen').classList.add('hide');
  try{document.body.classList.remove('locked');}catch(e){}
  meUI();
  try{musSetSong((document.body.dataset&&document.body.dataset.song)||'feed');}catch(e){}
  try{if(musOn)musStart();}catch(e){}
  try{if(typeof ensurePeer==='function')ensurePeer();}catch(e){}
  try{if(typeof window.pageReady==='function')window.pageReady();}catch(e){console.warn(e);}
}
function injectChrome(){
  if(!$('login-screen'))document.body.insertAdjacentHTML('beforeend',
   `<div id="login-screen"><div id="login-card"><div style="font-size:42px">🔥</div><h1>FODASOCIAL</h1><p class="sub">só gente real • zero bots</p><div class="login-tabs"><button id="lt-login" class="active" onclick="loginTab('login')">Entrar</button><button id="lt-reg" onclick="loginTab('reg')">Criar conta</button></div><div id="login-fields"></div><div id="login-err"></div><p class="sub" id="login-mode"></p></div></div>`);
  if(!$('profmodal'))document.body.insertAdjacentHTML('beforeend',
   `<div id="profmodal" onclick="if(event.target===this)profClose()"></div>`);
  if(!$('callbox'))document.body.insertAdjacentHTML('beforeend',
   `<div id="callbox"><div id="callcard"><p id="call-status" class="mut">chamada</p><video id="call-remote" autoplay playsinline style="display:none"></video><video id="call-local" autoplay playsinline muted style="display:none"></video><div class="row" id="call-ans" style="display:none;justify-content:center"><button class="mbtn small" id="call-ans-audio">🎤 Voz</button><button class="mbtn small" id="call-ans-video">🎥 Vídeo</button><button class="mbtn ghost small" id="call-no">Recusar</button></div><div class="row" id="call-media" style="justify-content:center"><button class="mbtn ghost small" id="btn-mic" onclick="toggleMic()" title="mic">🎤</button><button class="mbtn ghost small" id="btn-cam" onclick="toggleCam()" title="câmera">🎥</button><button class="mbtn ghost small" id="btn-share" onclick="shareScreen()" title="compartilhar tela">🖥️</button></div><div class="row" style="justify-content:center"><button class="mbtn ghost small" id="call-end">⏹ Encerrar</button></div></div></div>`);
  if(!$('stars'))document.body.insertAdjacentHTML('afterbegin',
   `<canvas id="stars"></canvas><div id="vapor"><div id="v-sun"></div><div id="v-grid"></div></div>`);
}
async function bootGate(){
  injectChrome();supaInit();
  if(SUPA){
    try{
      const {data}=await SUPA.auth.getSession();
      if(data&&data.session){sessToMe(data.session);enterApp();return;}
    }catch(e){}
    try{SUPA.auth.onAuthStateChange((ev,s)=>{if(s&&s.session){sessToMe(s.session);if(document.body.classList.contains('locked'))enterApp();}});}catch(e){}
  }
  loginTab('login');
}

/* ---------- cotas justas do storage (1 GB p/ todo mundo) ---------- */
const FS_MAX_VIDEO_MB=50, FS_MAX_USER_MB=200, FS_MAX_PHOTO_MB=6, FS_MAX_VIDEOS=15;
function fmtMB(b){return (b/1048576).toFixed(1)+' MB';}
async function stoUsage(nick){
  try{
    const {data,error}=await SUPA.storage.from('midia').list(nick,{limit:1000});
    if(error||!data)return{bytes:0,count:0};
    let b=0;data.forEach(f=>{b+=(f.metadata&&f.metadata.size)||0;});
    return{bytes:b,count:data.length};
  }catch(e){return{bytes:0,count:0};}
}
function shrinkPhoto(file){
  return new Promise(res=>{
    const img=new Image(),url=URL.createObjectURL(file);
    img.onload=()=>{
      URL.revokeObjectURL(url);
      const MAX=1280;let w=img.width,h=img.height;
      const sc=Math.min(1,MAX/Math.max(w,h));w=Math.max(1,Math.round(w*sc));h=Math.max(1,Math.round(h*sc));
      const cv=document.createElement('canvas');cv.width=w;cv.height=h;
      cv.getContext('2d').drawImage(img,0,0,w,h);
      cv.toBlob(b=>res(b||file),'image/jpeg',.82);
    };
    img.onerror=()=>res(file);
    img.src=url;
  });
}

/* ---------- amigos / perfil público (compartilhado) ---------- */
async function myFriends(){const m=me();if(!m)return[];const {data}=await SUPA.from('friends').select('friend').eq('owner',m.nick);return (data||[]).map(f=>f.friend);}
async function amToggle(nick){
  const m=needMe();if(!m)return;
  const fr=await myFriends();
  if(fr.includes(nick))await SUPA.from('friends').delete().eq('owner',m.nick).eq('friend',nick);
  else await SUPA.from('friends').insert({owner:m.nick,friend:nick,ts:Date.now()});
  try{if(typeof amigosRender==='function')amigosRender();}catch(e){}
}
async function viewPerfil(nick){
  const {data}=await SUPA.from('profiles').select('*').eq('nick',nick).single();
  const p=data||{ava:'🙂',bio:'',color:'#fff',banner:'#333',status:''};
  const m=me(),fr=m?(await myFriends()).includes(nick):false;
  $('profmodal').innerHTML=`<div id="profcard"><div id="profbanner" style="background:${esc(p.banner||'#333')}"></div><div style="padding:14px;text-align:center"><span style="font-size:46px">${esc(p.ava||'🙂')}</span><br><b style="font-size:18px;color:${esc(p.color||'#fff')}">${esc(nick)}</b><p class="mut">${esc(p.status||'')}</p><p style="font-size:13px">${esc(p.bio||'')}</p><div class="row" style="justify-content:center;margin-top:8px">${m&&nick!==m.nick?`<button class="mbtn small" onclick="profClose();dmOpen('${esc(nick)}')">💬 Conversar</button><button class="mbtn ghost small" onclick="profClose();amToggle('${esc(nick)}')">${fr?'✔ Amigos':'➕ Adicionar'}</button>`:''}<button class="mbtn ghost small" onclick="profClose()">Fechar</button></div></div></div>`;
  $('profmodal').classList.add('open');
}
function profClose(){$('profmodal').classList.remove('open');}
function dmOpen(n){
  try{sessionStorage.setItem('fod_dm',n);}catch(e){}
  if(location.pathname.endsWith('foda-chat.html')){try{dmWith=n;dmBox();}catch(e){}}
  else location.href='./foda-chat.html';
}
async function vidLike(id){
  const m=needMe();if(!m)return;
  const {data}=await SUPA.from('videos').select('likes').eq('id',isNaN(+id)?id:+id).single();
  let l=(data&&data.likes)||[];
  l=l.includes(m.nick)?l.filter(x=>x!==m.nick):l.concat([m.nick]);
  await SUPA.from('videos').update({likes:l}).eq('id',isNaN(+id)?id:+id);
  try{if(typeof vidList==='function')vidList();}catch(e){}
  try{if(typeof shortRender==='function'&&$('tab-shorts'))shortRender();}catch(e){}
}
async function fsVideos(){
  const {data,error}=await SUPA.from('videos').select('*').order('ts',{ascending:false}).limit(60);
  if(error){toast('❌ '+error.message);return [];}
  return (data||[]).map(v=>({id:String(v.id),title:v.title,desc:v.desc||'',url:v.url,nick:v.nick,ava:v.ava||'🎬',ts:v.ts,likes:v.likes||[],short:!!v.short}));
}

/* ---------- P2P: presença + calls voz/vídeo/tela ---------- */
let PEER=null,PEERID=null,CALL=null,LOC_STREAM=null,SHARING=null;
function peerLib(cb){if(window.Peer)return cb();const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/peerjs@1/dist/peerjs.min.js';s.onload=()=>cb();s.onerror=()=>toast('❌ Sem internet p/ calls');document.head.appendChild(s);}
function myPeerId(){const m=me();return 'fod-'+m.nick.toLowerCase().replace(/[^a-z0-9]/g,'');}
function ensurePeer(){
  peerLib(()=>{
    if(PEER&&PEER.open)return;
    try{PEER=new Peer(myPeerId(),{debug:0});}catch(e){return;}
    PEER.on('open',id=>{PEERID=id;peerRegister(id);});
    PEER.on('call',onIncoming);
    PEER.on('error',e=>{if(e&&e.type==='unavailable-id'){try{PEER.destroy();}catch(_){}PEER=null;try{PEER=new Peer(myPeerId()+'-'+Math.random().toString(36).slice(2,6),{debug:0});PEER.on('open',i=>{PEERID=i;peerRegister(i);});PEER.on('call',onIncoming);}catch(_){}}});
  });
}
async function peerRegister(pid){try{const m=me();if(!m)return;await SUPA.from('profiles').upsert({nick:m.nick,peer:pid,updated:Date.now()},{onConflict:'nick'});}catch(e){}}
async function callStart(nick,video){
  const m=needMe();if(!m)return;
  const {data}=await SUPA.from('profiles').select('peer').eq('nick',nick).single();
  const pid=data&&data.peer;
  if(!pid)return toast('⚠️ Amigo nunca entrou (sem sinal)');
  let stream=null;
  try{stream=await navigator.mediaDevices.getUserMedia({audio:true,video:video?{width:640}:false});}
  catch(e){return toast('❌ Mic/câmera bloqueados (precisa HTTPS)');}
  const P=await new Promise(res=>peerLib(()=>{if(PEER&&PEER.open)return res(PEER);ensurePeer();setTimeout(()=>res(PEER&&PEER.open?PEER:null),3000);}));
  if(!P)return toast('❌ P2P falhou');
  toast('📞 Chamando '+nick+'...');
  let call;try{call=P.call(pid,stream);}catch(e){return toast('❌ Falha ao chamar');}
  callUI(call,stream,nick,video);
}
function onIncoming(call){
  $('callbox').classList.add('open');
  $('call-status').textContent='📞 '+call.peer+' te ligando...';
  $('call-local').style.display='none';$('call-remote').style.display='none';
  $('call-ans').style.display='flex';
  $('call-ans-audio').onclick=()=>answerCall(call,false);
  $('call-ans-video').onclick=()=>answerCall(call,true);
  $('call-no').onclick=()=>{try{call.close();}catch(e){}$('callbox').classList.remove('open');};
  $('call-end').onclick=()=>endCall();
}
async function answerCall(call,video){
  let stream=null;
  try{stream=await navigator.mediaDevices.getUserMedia({audio:true,video:video?{width:640}:false});}
  catch(e){return toast('❌ Mic/câmera bloqueados');}
  $('call-ans').style.display='none';
  call.answer(stream);callUI(call,stream,call.peer,video);
}
function callUI(call,stream,nick,video){
  CALL=call;LOC_STREAM=stream;SHARING=null;
  $('callbox').classList.add('open');
  $('call-ans').style.display='none';
  $('call-status').textContent='📞 com '+nick;
  const mb=$('btn-mic'),cb=$('btn-cam'),sb=$('btn-share');
  if(mb)mb.textContent='🎤';if(cb)cb.textContent='🎥';if(sb)sb.textContent='🖥️';
  const lv=$('call-local'),rv=$('call-remote');
  lv.style.display='block';try{lv.srcObject=stream;lv.muted=true;}catch(e){}
  rv.style.display='none';
  call.on('stream',s=>{rv.style.display='block';try{rv.srcObject=s;}catch(e){}});
  call.on('close',()=>endCall(true));
  call.on('error',()=>{toast('❌ Chamada caiu');endCall(true);});
  $('call-end').onclick=()=>endCall();
}
function endCall(silent){
  if(SHARING){try{SHARING.getTracks().forEach(t=>t.stop());}catch(e){}SHARING=null;}
  try{if(CALL)CALL.close();}catch(e){}CALL=null;
  ['call-local','call-remote'].forEach(id=>{const v=$(id);if(!v)return;try{if(v.srcObject)v.srcObject.getTracks().forEach(t=>t.stop());v.srcObject=null;}catch(e){}});
  try{if(LOC_STREAM)LOC_STREAM.getTracks().forEach(t=>t.stop());}catch(e){}LOC_STREAM=null;
  $('callbox').classList.remove('open');
  if(!silent)toast('👋 Chamada encerrada');
}
function toggleMic(){
  if(!LOC_STREAM)return toast('⚠️ Sem chamada');
  const t=LOC_STREAM.getAudioTracks()[0];if(!t)return toast('⚠️ Sem mic');
  t.enabled=!t.enabled;
  const b=$('btn-mic');if(b)b.textContent=t.enabled?'🎤':'🔇';
}
function toggleCam(){
  if(!LOC_STREAM)return toast('⚠️ Sem chamada');
  const t=LOC_STREAM.getVideoTracks()[0];if(!t)return toast('⚠️ Câmera desligada (chamada só de voz)');
  t.enabled=!t.enabled;
  const b=$('btn-cam');if(b)b.textContent=t.enabled?'🎥':'📷';
}
async function shareScreen(){
  if(!CALL||!LOC_STREAM)return toast('⚠️ Sem chamada');
  if(SHARING){stopShare();return;}
  if(!LOC_STREAM.getVideoTracks().length)return toast('⚠️ Chamada só de voz — desliga e liga com vídeo 🎥');
  let ds=null;
  try{ds=await navigator.mediaDevices.getDisplayMedia({video:true,audio:false});}
  catch(e){return;}
  const vt=ds.getVideoTracks()[0];if(!vt)return;
  try{
    const pc=CALL.peerConnection;
    const sender=pc&&pc.getSenders?pc.getSenders().find(s=>s.track&&s.track.kind==='video'):null;
    if(!sender){ds.getTracks().forEach(t=>t.stop());return toast('⚠️ Sem canal de vídeo');}
    await sender.replaceTrack(vt);
  }catch(e){ds.getTracks().forEach(t=>t.stop());return toast('❌ Falha ao compartilhar');}
  SHARING=ds;
  try{$('call-local').srcObject=ds;}catch(e){}
  vt.onended=()=>stopShare();
  const b=$('btn-share');if(b)b.textContent='⏹️';
  toast('🖥️ Compartilhando tela');
}
async function stopShare(){
  if(!SHARING)return;const ds=SHARING;SHARING=null;
  try{ds.getTracks().forEach(t=>t.stop());}catch(e){}
  try{
    const cam=LOC_STREAM&&LOC_STREAM.getVideoTracks()[0];
    const pc=CALL&&CALL.peerConnection;
    const sender=pc&&pc.getSenders?pc.getSenders().find(s=>s.track&&s.track.kind==='video'):null;
    if(sender&&cam)await sender.replaceTrack(cam);
    if(LOC_STREAM){try{$('call-local').srcObject=LOC_STREAM;}catch(e){}}
  }catch(e){}
  const b=$('btn-share');if(b)b.textContent='🖥️';
}

/* ---------- trilhas originais (WebAudio 16-bit, uma por aba) ---------- */
const F_BPM=96,F_SPB=60/96/4;
const F_CH=[[42,49,52,56],[50,57,61,68],[45,52,57,61],[49,53,59,62]];
const F_RT=[30,38,33,37];
const F_MA=[[0,78,4],[4,81,4],[8,85,8],[16,86,8],[24,85,4],[28,81,4],[32,76,8],[40,85,4],[44,83,4],[48,77,4],[52,80,4],[56,77,8]];
const F_MB=[[0,81,8],[8,85,4],[12,86,4],[16,88,8],[24,86,4],[28,85,4],[32,85,8],[40,83,4],[44,81,4],[48,80,4],[52,81,4],[56,80,8]];
const F_MAPA={},F_MAPB={};F_MA.forEach(n=>F_MAPA[n[0]]=n);F_MB.forEach(n=>F_MAPB[n[0]]=n);
const F_SP={0:78,24:81,40:85};
const W_BPM=100;
const W_CH=[[43,50,53,58],[39,46,50,55],[46,50,53,57],[41,48,51,57]];
const W_RT=[31,39,34,29];
const W_MA=[[0,74,4],[4,77,4],[8,79,8],[16,82,8],[24,81,4],[28,79,4],[32,74,8],[40,77,4],[44,79,4],[48,81,4],[52,79,4],[56,77,8]];
const W_MB=[[0,79,8],[8,82,4],[12,81,4],[16,86,8],[24,84,4],[28,82,4],[32,79,8],[40,81,4],[44,82,4],[48,81,4],[52,79,4],[56,77,8]];
const W_MAPA={},W_MAPB={};W_MA.forEach(n=>W_MAPA[n[0]]=n);W_MB.forEach(n=>W_MAPB[n[0]]=n);
const W_SP={0:79,24:82,40:86};
const R_BPM=128;
const R_CH=[[40,47,52,55],[48,52,55,60],[43,50,55,59],[38,45,50,54]];
const R_RT=[28,36,31,38];
const R_MA=[[0,76,2],[2,79,2],[4,83,2],[6,86,2],[8,83,4],[12,81,4],[16,79,2],[18,76,2],[20,84,2],[22,83,2],[24,81,4],[28,79,4],[32,74,2],[34,78,2],[36,81,2],[38,86,2],[40,83,4],[44,81,4],[48,78,2],[50,81,2],[52,83,2],[54,81,2],[56,79,4],[60,78,4]];
const R_MB=[[0,83,2],[2,86,2],[4,88,2],[6,86,2],[8,83,4],[12,81,4],[16,84,2],[18,83,2],[20,81,2],[22,79,2],[24,81,4],[28,79,4],[32,86,2],[34,84,2],[36,83,2],[38,81,2],[40,83,4],[44,81,4],[48,86,2],[50,84,2],[52,83,2],[54,81,2],[56,83,4],[60,81,4]];
const R_MAPA={},R_MAPB={};R_MA.forEach(n=>R_MAPA[n[0]]=n);R_MB.forEach(n=>R_MAPB[n[0]]=n);
const R_SP={4:88,20:84,36:86,52:83};
const C_BPM=88;
const C_CH=[[48,55,59,62],[45,52,55,59],[41,48,52,55],[43,47,52,55]];
const C_RT=[36,33,29,31];
const C_MA=[[0,76,4],[4,79,4],[8,84,8],[16,83,8],[24,81,4],[28,79,4],[32,81,8],[40,79,4],[44,77,4],[48,79,8],[52,83,4],[56,86,8]];
const C_MB=[[0,79,8],[8,84,4],[12,86,4],[16,84,8],[24,83,4],[28,81,4],[32,84,8],[40,81,4],[44,79,4],[48,83,8],[52,86,4],[56,79,8]];
const C_MAPA={},C_MAPB={};C_MA.forEach(n=>C_MAPA[n[0]]=n);C_MB.forEach(n=>C_MAPB[n[0]]=n);
const C_SP={0:84,24:83,40:86};
const A_BPM=92;
const A_CH=[[45,52,57,61],[42,49,52,57],[50,54,57,62],[40,44,47,52]];
const A_RT=[33,30,38,28];
const A_MA=[[0,73,4],[4,76,4],[8,81,8],[16,81,8],[24,80,4],[28,78,4],[32,78,8],[40,76,4],[44,74,4],[48,76,8],[52,80,4],[56,83,8]];
const A_MB=[[0,76,8],[8,81,4],[12,85,4],[16,85,8],[24,83,4],[28,81,4],[32,83,8],[40,81,4],[44,78,4],[48,80,8],[52,83,4],[56,81,8]];
const A_MAPA={},A_MAPB={};A_MA.forEach(n=>A_MAPA[n[0]]=n);A_MB.forEach(n=>A_MAPB[n[0]]=n);
const A_SP={0:81,24:85,40:83};
const P_BPM=80;
const P_CH=[[47,54,57,61],[43,47,54,55],[50,54,57,62],[45,52,57,61]];
const P_RT=[35,31,38,33];
const P_MA=[[0,74,4],[4,78,4],[8,83,8],[16,83,8],[24,81,4],[28,79,4],[32,81,8],[40,78,4],[44,76,4],[48,76,8],[52,73,4],[56,71,8]];
const P_MB=[[0,78,8],[8,83,4],[12,86,4],[16,86,8],[24,83,4],[28,81,4],[32,79,8],[40,78,4],[44,76,4],[48,73,8],[52,76,4],[56,81,8]];
const P_MAPA={},P_MAPB={};P_MA.forEach(n=>P_MAPA[n[0]]=n);P_MB.forEach(n=>P_MAPB[n[0]]=n);
const P_SP={0:83,24:86,40:81};
const J_BPM=140;
const J_CH=[[40,47,52,55],[48,52,55,60],[50,54,57,62],[47,51,54,57]];
const J_RT=[28,36,38,35];
const J_MA=[[0,76,2],[2,79,2],[4,83,2],[6,86,2],[8,83,4],[12,81,4],[16,79,2],[18,76,2],[20,84,2],[22,83,2],[24,81,4],[28,79,4],[32,74,2],[34,78,2],[36,81,2],[38,86,2],[40,83,4],[44,81,4],[48,83,2],[50,78,2],[52,81,2],[54,79,2],[56,78,4],[60,83,4]];
const J_MB=[[0,83,2],[2,86,2],[4,88,2],[6,86,2],[8,83,4],[12,81,4],[16,84,2],[18,83,2],[20,81,2],[22,79,2],[24,81,4],[28,79,4],[32,86,2],[34,84,2],[36,83,2],[38,81,2],[40,83,4],[44,81,4],[48,81,2],[50,79,2],[52,78,2],[54,81,2],[56,83,4],[60,81,4]];
const J_MAPA={},J_MAPB={};J_MA.forEach(n=>J_MAPA[n[0]]=n);J_MB.forEach(n=>J_MAPB[n[0]]=n);
const J_SP={4:88,20:84,36:86,52:83};
let M_BPM=F_BPM,M_SPB=F_SPB,M_CH=F_CH,M_RT=F_RT,M_MA=F_MAPA,M_MB=F_MAPB,M_SP=F_SP,M_SOFT=true,M_NAME='FodaFeed';
function musSetSong(k){
  const S={feed:[F_BPM,F_CH,F_RT,F_MAPA,F_MAPB,F_SP,true,'FodaFeed'],
    watch:[W_BPM,W_CH,W_RT,W_MAPA,W_MAPB,W_SP,true,'FodaWatch'],
    scroll:[R_BPM,R_CH,R_RT,R_MAPA,R_MAPB,R_SP,false,'FodaScroll'],
    chat:[C_BPM,C_CH,C_RT,C_MAPA,C_MAPB,C_SP,true,'FodaChat'],
    amigos:[A_BPM,A_CH,A_RT,A_MAPA,A_MAPB,A_SP,true,'Amigos'],
    perfil:[P_BPM,P_CH,P_RT,P_MAPA,P_MAPB,P_SP,true,'Perfil'],
    jogos:[J_BPM,J_CH,J_RT,J_MAPA,J_MAPB,J_SP,false,'Jogos']}[k];
  if(!S)return;
  M_BPM=S[0];M_SPB=60/S[0]/4;M_CH=S[1];M_RT=S[2];M_MA=S[3];M_MB=S[4];M_SP=S[5];M_SOFT=S[6];M_NAME=S[7];
  if(musDelay)musDelay.delayTime.value=60/M_BPM/2;
}
let musAC=null,musMaster=null,musDelay=null,musNoise=null,musSt=0,musNext=0,musLoops=0,musTimer=null;
let musOn=true;try{if(localStorage.getItem('fodsoc_mus')==='off')musOn=false;}catch(e){}
function musMtof(m){return 440*Math.pow(2,(m-69)/12);}
function musInit(){
  if(musAC)return;
  try{musAC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return;}
  const comp=musAC.createDynamicsCompressor();comp.connect(musAC.destination);
  musMaster=musAC.createGain();musMaster.gain.value=.6;musMaster.connect(comp);
  musDelay=musAC.createDelay(1);musDelay.delayTime.value=60/M_BPM/2;
  const fb=musAC.createGain();fb.gain.value=.32;
  const wet=musAC.createGain();wet.gain.value=.28;
  musDelay.connect(fb);fb.connect(musDelay);musDelay.connect(wet);wet.connect(musMaster);
  musNoise=musAC.createBuffer(1,musAC.sampleRate,musAC.sampleRate);
  const d=musNoise.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  musNext=musAC.currentTime+.1;
}
function musEnv(t,a,peak,dur){const g=musAC.createGain();g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+dur);g.connect(musMaster);return g;}
function musLead(f,t,dur,vol){const g=musEnv(t,.008,vol,dur);const o=musAC.createOscillator();o.type='square';o.frequency.value=f;const l=musAC.createOscillator();l.frequency.value=5.5;const lg=musAC.createGain();lg.gain.value=f*.006;l.connect(lg);lg.connect(o.frequency);o.connect(g);o.start(t);o.stop(t+dur+.05);l.start(t);l.stop(t+dur+.05);const s=musAC.createGain();s.gain.value=.7;g.connect(s);s.connect(musDelay);}
function musHarm(f,t,dur){const g=musEnv(t,.008,.09,dur);const o=musAC.createOscillator();o.type='square';o.frequency.value=f;o.connect(g);o.start(t);o.stop(t+dur+.05);const s=musAC.createGain();s.gain.value=.4;g.connect(s);s.connect(musDelay);}
function musBass(f,t){const g=musEnv(t,.008,.4,.22);const o1=musAC.createOscillator();o1.type='triangle';o1.frequency.value=f;const o2=musAC.createOscillator();o2.type='sine';o2.frequency.value=f;const g2=musAC.createGain();g2.gain.value=.5;o1.connect(g);o2.connect(g2);g2.connect(g);o1.start(t);o2.start(t);o1.stop(t+.3);o2.stop(t+.3);}
function musPad(fs,t,dur){fs.forEach(n=>{const g=musAC.createGain();g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.04,t+.05);g.gain.exponentialRampToValueAtTime(.0001,t+dur);const o=musAC.createOscillator();o.type='sawtooth';o.frequency.value=musMtof(n);o.connect(g);g.connect(musMaster);o.start(t);o.stop(t+dur+.05);});}
function musArp(f,t){const g=musEnv(t,.004,.12,.12);const o=musAC.createOscillator();o.type='square';o.frequency.value=f;o.connect(g);o.start(t);o.stop(t+.15);}
function musKick(t){const o=musAC.createOscillator();o.type='sine';o.frequency.setValueAtTime(120,t);o.frequency.exponentialRampToValueAtTime(40,t+.1);const g=musAC.createGain();g.gain.setValueAtTime(.5,t);g.gain.exponentialRampToValueAtTime(.0001,t+.15);o.connect(g);g.connect(musMaster);o.start(t);o.stop(t+.2);}
function musDrumNoise(t,dur,vol,ff,type){const n=musAC.createBufferSource();n.buffer=musNoise;const f=musAC.createBiquadFilter();f.type=type||'highpass';f.frequency.value=ff;const g=musAC.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);n.connect(f);f.connect(g);g.connect(musMaster);n.start(t);n.stop(t+dur+.05);}
function musSnare(t,v){musDrumNoise(t,.12,v||.2,1800);}
function musHat(t,open){musDrumNoise(t,open?.3:.05,.09,7000);}
function musTom(f,t){const o=musAC.createOscillator();o.type='sine';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f/2,t+.2);const g=musEnv(t,.004,.25,.25);o.connect(g);o.start(t);o.stop(t+.3);}
function musBell(f,t){const g=musEnv(t,.004,.18,1.0);const o1=musAC.createOscillator();o1.type='sine';o1.frequency.value=f;const o2=musAC.createOscillator();o2.type='sine';o2.frequency.value=f*2;const g2=musAC.createGain();g2.gain.value=.25;o1.connect(g);o2.connect(g2);g2.connect(g);o1.start(t);o2.start(t);o1.stop(t+1.1);o2.stop(t+1.1);const s=musAC.createGain();s.gain.value=.9;g.connect(s);s.connect(musDelay);}
function musStep(s,t){
  const sect=(musLoops%6>=4)?'B':'A',bar=(s/16)|0,st=s%16,CH=M_CH[bar],R=M_RT[bar];
  if(!M_SOFT){if(st===0||st===8)musPad(CH,t,.45);}
  else if(st===0)musPad(CH,t,16*M_SPB);
  if(!M_SOFT){if(st%4===0)musKick(t);if(st===4||st===12)musSnare(t);}
  else{if(st===0||st===8)musKick(t);if(st===8)musSnare(t,.35);}
  if(!M_SOFT){if(st%2===0)musHat(t,false);if(st===14)musHat(t,true);}
  else if(st%4===2)musHat(t,false);
  if(!M_SOFT){const bp=[0,0,12,0,0,7,12,10];if(st%2===0)musBass(musMtof(R+bp[st/2]),t);}
  else{if(st===0||st===8)musBass(musMtof(R),t);if(st===12)musBass(musMtof(R+7),t);}
  const arp=[CH[0],CH[1],CH[2],CH[3],CH[2],CH[1]];
  if(!M_SOFT)musArp(musMtof(arp[s%6]+12),t);
  else if(st%4===0)musArp(musMtof(arp[st/4]+12),t);
  const MEL=(sect==='B'?M_MB:M_MA)[s];
  if(MEL){musLead(musMtof(MEL[1]),t,MEL[2]*M_SPB*1.4,.2);musHarm(musMtof(MEL[1]-4),t,MEL[2]*M_SPB*1.2);}
  if(s in M_SP)musBell(musMtof(M_SP[s]+(sect==='B'?12:0)),t);
  if(s>=60&&s<64)musTom(musMtof(45+(63-s)*2),t);
}
function musSched(){
  if(!musAC)return;
  if(musAC.state==='suspended')musAC.resume();
  if(musNext<musAC.currentTime-.25)musNext=musAC.currentTime+.05;
  if(!musOn)return;
  while(musNext<musAC.currentTime+.15){musStep(musSt,musNext);musSt=(musSt+1)%64;if(musSt===0)musLoops++;musNext+=M_SPB;}
}
function musStart(){try{localStorage.setItem('fodsoc_mus','on');}catch(e){}musOn=true;musInit();if(!musAC)return;if(musAC.state==='suspended')musAC.resume();if(!musTimer){musNext=musAC.currentTime+.1;musTimer=setInterval(musSched,25);}musBtn();}
function musStop(){musOn=false;try{localStorage.setItem('fodsoc_mus','off');}catch(e){}musBtn();}
function musToggle(){musOn?musStop():(musStart(),toast('🎵 Trilha '+M_NAME+' ligada!'));}
function musBtn(){const b=$('musbtn');if(b)b.textContent=musOn?'🎵':'🔇';}
function musUnlock(){if(!musOn)return;try{musStart();}catch(e){}}
(function(){let u=false;function g(){if(u)return;u=true;try{musUnlock();}catch(e){}try{starBoot();}catch(e){}}
try{document.addEventListener('pointerdown',g);document.addEventListener('keydown',g);}catch(e){}})();
function starBoot(){
  const c=$('stars');if(!c||c._on)return;c._on=true;
  const x=c.getContext('2d');let W,H,S=[],E=[];
  const EC=['#ff9a3c','#ff2bd6','#ffe600','#ff5500'];
  function rs(){W=c.width=innerWidth;H=c.height=innerHeight;S=Array.from({length:110},()=>({x:Math.random()*W,y:Math.random()*H,s:Math.random()*1.8+.4,v:Math.random()*.5+.15,c:['#00fff7','#ff2bd6','#ffe600','#fff'][Math.random()*4|0]}));E=Array.from({length:42},()=>newEmb(true));}
  function newEmb(any){return{x:Math.random()*W,y:any?Math.random()*H:H+10,s:Math.random()*2.6+1.2,v:Math.random()*1.4+.7,ph:Math.random()*6.28,c:EC[Math.random()*EC.length|0]};}
  rs();try{addEventListener('resize',rs);}catch(e){}
  (function loop(){x.clearRect(0,0,W,H);for(const p of S){p.y+=p.v;if(p.y>H)p.y=0;x.globalAlpha=.8;x.fillStyle=p.c;x.fillRect(p.x,p.y,p.s,p.s);}for(let i=0;i<E.length;i++){const e=E[i];e.y-=e.v;e.ph+=.08;e.x+=Math.sin(e.ph)*.6;if(e.y<-12)E[i]=newEmb(false);x.globalAlpha=.55+.4*Math.abs(Math.sin(e.ph*2));x.fillStyle=e.c;const s=e.s*(0.7+0.5*Math.abs(Math.sin(e.ph)));x.fillRect(e.x,e.y,s,s);}x.globalAlpha=1;requestAnimationFrame(loop);})();
}
