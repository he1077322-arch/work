document.addEventListener("DOMContentLoaded",()=>{

// Theme
const themeSelect=document.getElementById("themeSelect");
const savedTheme=localStorage.getItem("theme")||"light";
document.body.classList.toggle("dark",savedTheme==="dark");
if(themeSelect) themeSelect.value=savedTheme;
themeSelect?.addEventListener("change",(e)=>{
    const val=e.target.value;
    document.body.classList.toggle("dark",val==="dark");
    localStorage.setItem("theme",val);
});

// Login
document.getElementById("loginBtn")?.addEventListener("click",()=>{
    const name=document.getElementById("username").value;
    const email=document.getElementById("email").value;
    const type=document.getElementById("userType").value;
    if(!name||!email||!type){alert("املأ كل الحقول"); return;}
    localStorage.setItem("name",name);
    localStorage.setItem("email",email);
    localStorage.setItem("type",type);
    if(!localStorage.getItem("chats")) localStorage.setItem("chats",JSON.stringify({}));
    if(!localStorage.getItem("jobs")) localStorage.setItem("jobs",JSON.stringify([]));
    if(!localStorage.getItem("ratings")) localStorage.setItem("ratings",JSON.stringify({}));
    window.location.href="./dashboard.html";
});

// Load user info
let name=localStorage.getItem("name");
let email=localStorage.getItem("email");
let type=localStorage.getItem("type");
document.getElementById("userName")?.textContent=name;
document.getElementById("p_name")?.textContent=name;
document.getElementById("p_email")?.textContent=email;
document.getElementById("p_skills")?.textContent="لا توجد مهارات";
if(type==="owner") document.getElementById("jobPostSection")?.classList.remove("hidden");

// Popups
const profilePopup=document.getElementById("profilePopup");
const chatPopup=document.getElementById("chatPopup");
const logoutPopup=document.getElementById("logoutPopup");
const notifPopup=document.getElementById("notifPopup");
function togglePopup(popup){
    if(!popup) return;
    popup.style.display=(popup.style.display==="block")?"none":"block";
    [profilePopup,chatPopup,logoutPopup,notifPopup].forEach(p=>{if(p!==popup&&p)p.style.display="none";});
}
document.getElementById("profileBtn").onclick=()=>togglePopup(profilePopup);
document.getElementById("chatBtn").onclick=()=>togglePopup(chatPopup);
document.getElementById("settingsBtn").onclick=()=>togglePopup(logoutPopup);
document.getElementById("notifBtn").onclick=()=>togglePopup(notifPopup);
document.getElementById("logoutBtn")?.addEventListener("click",()=>{localStorage.clear(); window.location.href="./index.html";});

// Profile picture
const profilePic=document.getElementById("profilePic");
const uploadPic=document.getElementById("uploadPic");
if(profilePic && uploadPic){
    let storedPic=localStorage.getItem("profilePic");
    if(storedPic) profilePic.src=storedPic;
    uploadPic.addEventListener("change",(e)=>{
        const file=e.target.files[0];
        if(file){
            const reader=new FileReader();
            reader.onload=function(event){ profilePic.src=event.target.result; localStorage.setItem("profilePic",event.target.result); };
            reader.readAsDataURL(file);
        }
    });
}

// Jobs
function getJobs(){ return JSON.parse(localStorage.getItem("jobs")||"[]"); }
function saveJobs(jobs){ localStorage.setItem("jobs",JSON.stringify(jobs)); }

function renderJobs(filter={}){
    const container=document.getElementById("jobsContainer");
    if(!container) return;
    container.innerHTML="";
    let jobs=getJobs();
    let ratings=JSON.parse(localStorage.getItem("ratings")||"{}");
    jobs.forEach((j,i)=>{
        if((filter.type && j.type!==filter.type) ||
           (filter.location && !j.location.includes(filter.location)) ||
           (filter.time && !j.time.includes(filter.time)) ||
           (filter.salary && !j.salary.includes(filter.salary))) return;
        let ratingDisplay=ratings[j.owner]?ratings[j.owner]+"⭐":"لا يوجد تقييم";
        let div=document.createElement("div");
        div.className="job-card";
        div.innerHTML=`
            <h4>${j.title}</h4>
            <p><strong>الوصف:</strong> ${j.desc}</p>
            <p><strong>نوع العمل:</strong> ${j.type}</p>
            <p><strong>المكان:</strong> ${j.location}</p>
            <p><strong>الساعات:</strong> ${j.time}</p>
            <p><strong>الراتب:</strong> ${j.salary}</p>
            <p><strong>صاحب العمل:</strong> ${j.owner} | التقييم: ${ratingDisplay}</p>
            <button onclick="applyJob(${i})">تقديم</button>
            <button onclick="rateUser('${j.owner}')">تقييم المستخدم</button>
        `;
        container.appendChild(div);
    });
}

// Post job
document.getElementById("postJobBtn")?.addEventListener("click",()=>{
    let jobs=getJobs();
    let job={
        owner:name,
        title:document.getElementById("jobTitle").value,
        type:document.getElementById("jobType").value,
        location:document.getElementById("jobLocation").value,
        time:document.getElementById("jobTime").value,
        salary:document.getElementById("jobSalary").value,
        desc:document.getElementById("jobDesc").value
    };
    if(!job.title||!job.type||!job.location||!job.time||!job.salary||!job.desc){alert("املأ كل الحقول");return;}
    jobs.push(job);
    saveJobs(jobs);
    renderJobs();
});

// Filter jobs
document.getElementById("filterBtn")?.addEventListener("click",()=>{
    const type=document.getElementById("filterType").value;
    const location=document.getElementById("filterLocation").value.trim();
    const time=document.getElementById("filterTime").value.trim();
    const salary=document.getElementById("filterSalary").value.trim();
    renderJobs({type,location,time,salary});
});

// Chat
window.applyJob=function(i){
    let jobs=getJobs();
    let chatList=document.getElementById("chatList");
    if(!chatList) return;
    let chats=JSON.parse(localStorage.getItem("chats")||"{}");
    if(!chats[name]) chats[name]={};
    let owner=jobs[i].owner;
    if(!chats[name][owner]) chats[name][owner]=[];
    chats[name][owner].push("بدأت محادثة مع: "+owner+" ("+new Date().toLocaleTimeString()+")");
    localStorage.setItem("chats",JSON.stringify(chats));
    renderChats();
    chatPopup.style.display="block";
}

function renderChats(){
    const chatList=document.getElementById("chatList");
    if(!chatList) return;
    let chats=JSON.parse(localStorage.getItem("chats")||"{}");
    chatList.innerHTML="";
    if(chats[name]){
        for(let person in chats[name]){
            chats[name][person].forEach(msg=>{ chatList.innerHTML+=`<p>${msg}</p>`; });
        }
    } else chatList.innerHTML="لا توجد رسائل حالياً";
}

renderJobs(); renderChats();

// Rate user
window.rateUser=function(userName){
    let rating=prompt(`(قم بتقييم المستخدم
};