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

// The first and last feature artworks have different built-in framing.
// Normalize them so all four cards share the same visual inset and height.
const featureAlignmentStyle=document.createElement('style');
featureAlignmentStyle.textContent=`
.feats .feature-card.dev-card,
.feats .feature-card.problem-card{
  position:relative;
  overflow:hidden;
}
.feats .feature-card.dev-card{
  background-size:108% 120% !important;
  background-position:right bottom !important;
}
.feats .feature-card.problem-card{
  background-size:100% 100% !important;
  background-position:center center !important;
}
.feats .feature-card.dev-card::before,
.feats .feature-card.problem-card::before{
  content:"";
  position:absolute;
  inset:8px;
  border:1px solid rgba(255,255,255,.24);
  border-radius:4px;
  pointer-events:none;
  z-index:1;
}
.feats .feature-card.dev-card .feature-copy,
.feats .feature-card.problem-card .feature-copy{
  position:relative;
  z-index:2;
}
`;
document.head.appendChild(featureAlignmentStyle);
