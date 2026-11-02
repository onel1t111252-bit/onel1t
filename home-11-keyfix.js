(()=>{
'use strict';

// Make Ctrl/Cmd + physical K work regardless of the active keyboard layout.
// home-11.js checks e.key === 'k', which fails on layouts where KeyK produces
// another character (for example Ukrainian or Czech layouts).
const isCommandShortcut=e=>(e.ctrlKey||e.metaKey)&&!e.altKey&&(e.code==='KeyK'||String(e.key).toLowerCase()==='k');

window.addEventListener('keydown',e=>{
  if(!isCommandShortcut(e)) return;

  const button=document.querySelector('.quick-command');
  if(!button) return;

  e.preventDefault();
  e.stopImmediatePropagation();
  button.click();
},{capture:true});
})();
