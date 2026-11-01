// Keep status updates concise and avoid announcing every intermediate search key.
export function createAnnouncer(region,{delay=250,schedule=setTimeout,cancel=clearTimeout}={}){
 let timer;
 const announce=text=>{
  cancel(timer);region.textContent='';
  timer=schedule(()=>{region.textContent=String(text);},delay);
 };
 announce.clear=()=>{cancel(timer);region.textContent='';};
 return announce;
}
export function setTextIfChanged(element,text){
 if(element.textContent!==text)element.textContent=text;
}
export function focusElement(element,{preventScroll=false}={}){
 if(!element?.isConnected)return false;
 if(!element.matches('a[href],button,input,select,textarea,summary,[tabindex]'))element.tabIndex=-1;
 element.focus({preventScroll});return true;
}

export function contentLanguage(code){return code==='sci'?'la':code==='code'?'en':code;}

// A queued render focus must not override a user's intervening Tab/click.
export function queueFocus(element,{document:doc=document,frame=requestAnimationFrame,preventScroll=true}={}){
 const previous=doc.activeElement;
 return frame(()=>{
  if(doc.activeElement!==previous&&doc.activeElement!==doc.body)return;
  focusElement(element,{preventScroll});
 });
}

// Hash routes point to real view containers, even before JavaScript starts.
// Keep inactive containers as navigation targets, but clear stale forms/IDs.
export function activateView(main,id){
 const views=[...main.querySelectorAll('.app-view')];
 const active=views.find(view=>view.id===id);
 if(!active)throw Error('Unknown application view: '+id);
 for(const view of views){
  view.hidden=view!==active;
  if(view!==active)view.replaceChildren();
 }
 return active;
}
