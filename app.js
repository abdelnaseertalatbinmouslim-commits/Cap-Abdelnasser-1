const theme=document.getElementById("theme");
if(localStorage.getItem("theme")==="light")document.body.classList.add("light");
theme?.addEventListener("click",()=>{document.body.classList.toggle("light");localStorage.setItem("theme",document.body.classList.contains("light")?"light":"dark")});
const glow=document.querySelector(".cursor-glow");document.addEventListener("pointermove",e=>{if(glow){glow.style.left=e.clientX+"px";glow.style.top=e.clientY+"px"}});
const videos=[...document.querySelectorAll(".sport-media")];
if("IntersectionObserver" in window){const io=new IntersectionObserver(entries=>entries.forEach(entry=>{const v=entry.target;if(entry.isIntersecting){v.play().catch(()=>{});}else{v.pause();}}),{threshold:.25});videos.forEach(v=>io.observe(v));}else{videos.forEach(v=>v.play().catch(()=>{}));}
