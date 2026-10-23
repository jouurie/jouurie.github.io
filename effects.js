/* Adapted from the incumbent RIE skin: click audio + cursor hearts. */
(() => {
'use strict';
  // One reusable player for every skin menu/control. Source has 140 ms of leading silence.
  const clickSound=document.querySelector('#menu-click-sound');
  let soundStopTimer,navigationTimer,soundWarningShown=false;
  if(clickSound){
    clickSound.volume=.45;
    const warnSound=error=>{if(error.name==='AbortError'||soundWarningShown)return;soundWarningShown=true;console.warn('메뉴 클릭음을 재생하지 못했습니다:',error.name);};
    document.addEventListener('click',event=>{
      if(event.button!==0||!(event.target instanceof Element))return;
      const control=event.target.closest('a[href],button,input[type="button"],input[type="submit"],summary,[role="button"]');
      if(!control||!control.closest('.system-bar,.desktop')||control.matches(':disabled,[aria-disabled="true"]'))return;
      clearTimeout(soundStopTimer);clickSound.pause();clickSound.currentTime=.12;
      const playing=clickSound.play();if(playing)playing.catch(warnSound);
      soundStopTimer=setTimeout(()=>clickSound.pause(),220);
      // Let the 130 ms click finish before a same-tab navigation; preserve modifiers/new tabs/hash links.
      if(!event.defaultPrevented&&control.tagName==='A'&&!control.hasAttribute('onclick')&&!control.hasAttribute('download')&&(!control.target||control.target==='_self')&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey){
        const url=new URL(control.href,location.href);
        if(url.origin===location.origin&&/^https?:$/.test(url.protocol)&&!(url.pathname===location.pathname&&url.search===location.search&&url.hash)){
          event.preventDefault();clearTimeout(navigationTimer);navigationTimer=setTimeout(()=>location.assign(url.href),180);
        }
      }
    });
    addEventListener('pagehide',()=>{clearTimeout(soundStopTimer);clearTimeout(navigationTimer);clickSound.pause();});
  }

})();
/* Cursor hearts use the reference's mouse events and a basic timer for browser compatibility. */
(() => {
  'use strict';
  const palette=['--pink','--accent','--lemon','--page','--paper','--blush'];
  const reducedMotion=matchMedia('(prefers-reduced-motion:reduce)');
  reducedMotion.addEventListener('change',event=>{if(event.matches)clear();});
  const hearts=[];let timer=null,lastSpawn=0,lastTouch=0;
  function spawn(x,y,count=1){
    if(reducedMotion.matches)return;
    const colors=getComputedStyle(document.documentElement);
    for(let i=0;i<count;i++){
      if(hearts.length>=8)hearts.shift().node.remove();
      const node=document.createElement('span'),color=colors.getPropertyValue(palette[Math.floor(Math.random()*palette.length)]).trim();
      node.className='cursor-heart';node.textContent='♥';node.setAttribute('aria-hidden','true');
      Object.assign(node.style,{position:'fixed',pointerEvents:'none',zIndex:'2147483646',left:x+'px',top:y+'px',color,fontSize:(16+Math.floor(Math.random()*5))+'px',fontFamily:'Arial, sans-serif',lineHeight:'1',opacity:'1',userSelect:'none'});
      (document.querySelector('dialog[open]')||document.body).append(node);hearts.push({node,x,y,age:0,drift:(Math.random()-.5)*.6});
    }
    if(timer===null)timer=setInterval(tick,40);
  }
  function tick(){
    for(let i=hearts.length-1;i>=0;i--){const heart=hearts[i];heart.age+=40;heart.y-=1.7;heart.x+=heart.drift;
      if(heart.age>=1500||heart.y< -24){heart.node.remove();hearts.splice(i,1);continue;}
      heart.node.style.left=heart.x+'px';heart.node.style.top=heart.y+'px';heart.node.style.opacity=String(heart.age<900?1:Math.max(0,(1500-heart.age)/600));
    }
    if(!hearts.length){clearInterval(timer);timer=null;}
  }
  document.addEventListener('mousemove',event=>{const now=Date.now();if(now-lastSpawn<220||now-lastTouch<700)return;lastSpawn=now;spawn(event.clientX,event.clientY);},{passive:true,capture:true});
  document.addEventListener('mousedown',event=>{if(event.button!==0||Date.now()-lastTouch<700)return;spawn(event.clientX,event.clientY);},{passive:true,capture:true});
  document.addEventListener('touchstart',event=>{const touch=event.touches[0];if(touch){lastTouch=Date.now();spawn(touch.clientX,touch.clientY);}},{passive:true,capture:true});
  function clear(){clearInterval(timer);timer=null;hearts.splice(0).forEach(heart=>heart.node.remove());}
  addEventListener('blur',clear);addEventListener('pagehide',clear);document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});
})();
