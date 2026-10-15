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

// New three images stay only in Featured Projects.
const featuredProjectImages={
  'C++ Console Toolkit':'Gemini_Generated_Image_wnnxk0wnnxk0wnnx (2).jpg',
  'Python Security Utilities':'Gemini_Generated_Image_wnnxk0wnnxk0wnnx (1).jpg',
  'Onel1t Portfolio':'Gemini_Generated_Image_wnnxk0wnnxk0wnnx.jpg'
};

// Projects uses the exact five images from the first set the user supplied.
// A version query is intentional so browsers cannot reuse the previously cached wrong pictures.
const projectsSectionImages={
  'C++ Console Toolkit':'Gemini_Generated_Image_217vl4217vl4217v (5).jpg?v=original-projects-2244',
  'Python Security Utilities':'Gemini_Generated_Image_217vl4217vl4217v (3).jpg?v=original-projects-2244',
  'Onel1t Portfolio':'Gemini_Generated_Image_217vl4217vl4217v (4).jpg?v=original-projects-2244',
  'Secure Network Lab':'Gemini_Generated_Image_217vl4217vl4217v (2).jpg?v=original-projects-2244',
  'Arduino Radar':'Gemini_Generated_Image_217vl4217vl4217v.jpg?v=original-projects-2244'
};

document.querySelectorAll('#projects-preview .pc img[alt]').forEach(img=>{
  const next=featuredProjectImages[img.alt];
  if(next) img.src=next;
});

document.querySelectorAll('#projects .pc img[alt]').forEach(img=>{
  const next=projectsSectionImages[img.alt];
  if(next) img.src=next;
});
