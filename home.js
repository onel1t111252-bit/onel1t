const nav=document.getElementById('nav');
const menu=document.getElementById('menu');
const links=[...document.querySelectorAll('.nav a,.rail nav a')];

menu.onclick=()=>nav.classList.toggle('open');

document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
  const selector=a.getAttribute('href');
  const target=document.querySelector(selector);
  if(!target) return;
  e.preventDefault();
  nav.classList.remove('open');
  target.scrollIntoView({behavior:'smooth',block:'start'});
  history.replaceState(null,'',selector);
}));

const sections=['home','about','skills','projects','experience','contact']
  .map(id=>document.getElementById(id)).filter(Boolean);

const observer=new IntersectionObserver(entries=>{
  const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
  if(!visible) return;
  const id=visible.target.id;
  links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+id));
},{rootMargin:'-18% 0px -68% 0px',threshold:[0,.1,.25,.5]});

sections.forEach(section=>observer.observe(section));

const featuredProjectImages={
  'C++ Console Toolkit':'Gemini_Generated_Image_wnnxk0wnnxk0wnnx (2).jpg',
  'Python Security Utilities':'Gemini_Generated_Image_wnnxk0wnnxk0wnnx (1).jpg',
  'Onel1t Portfolio':'Gemini_Generated_Image_wnnxk0wnnxk0wnnx.jpg'
};

document.querySelectorAll('#projects-preview .pc img[alt]').forEach(img=>{
  const next=featuredProjectImages[img.alt];
  if(next) img.src=next;
});
