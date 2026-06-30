export default function handler(req, res) {
  res.writeHead(200, {"Content-Type": "text/html"});
  res.end(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>ALGN Hormone Assessment</title>
<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0A0A0A;color:#F9F6F0;font-family:Georgia,serif}@keyframes spin{to{transform:rotate(360deg)}}</style>
</head>
<body>
<div id="root"></div>
<script type="text/babel">
const {useState,useRef,useEffect}=React;
const GOLD="#B8952A",OBSIDIAN="#0A0A0A",CREAM="#F9F6F0",MID="#6B6B6B";
const API="https://algn-api.vercel.app/api/assess";
const JANE="https://algn-wellness.janeapp.com";
const SECTIONS=[
  {id:"energy",label:"Energy & Fatigue",icon:"⚡",q:["Exhausted after 7+ hours sleep","Afternoon energy crash","Rely on caffeine","Exercise depletes me","Wake up unrefreshed"]},
  {id:"menstrual",label:"Menstrual Health",icon:"🌙",q:["Irregular cycle","Heavy or light periods","Significant PMS","Painful cramping"]},
  {id:"mood",label:"Mood & Cognition",icon:"🧠",q:["Brain fog","Anxiety without reason","Mood swings","Irritability","Low mood"]},
  {id:"sleep",label:"Sleep Quality",icon:"💤",q:["Trouble falling asleep","Wake 2-4am","Unrefreshed on waking"]},
  {id:"weight",label:"Weight & Metabolism",icon:"🔥",q:["Weight changed 10+ lbs","Belly fat accumulation","Sugar cravings","Slow metabolism"]},
  {id:"pain",label:"Body Pain",icon:"💫",q:["Joint pain","Cycle headaches","Breast tenderness"]},
  {id:"gut",label:"Gut & Digestion",icon:"🌿",q:["Bloating","IBS symptoms","Food sensitivities"]},
];
const AVS=[
  {id:"achiever",label:"The Achiever",age:"35-42",desc:"PCOS / hormone imbalance / weight changes"},
  {id:"transitional",label:"The Transitional",age:"43-52",desc:"Perimenopause / brain fog / sleep changes"},
  {id:"optimized",label:"The Optimized",age:"30-38",desc:"Feel awful despite normal labs"},
];
const SCALE=["Never","Rarely","Sometimes","Often","Always"];

function App(){
  const [step,setStep]=useState(0);
  const [name,setName]=useState("");
  const [av,setAv]=useState(null);
  const [sc,setSc]=useState({});
  const [txt,setTxt]=useState("");
  const [email,setEmail]=useState("");
  const [ok,setOk]=useState(false);
  const [loading,setLoading]=useState(false);
  const [report,setReport]=useState(null);
  const ref=useRef(null);
  const ES=2+SECTIONS.length+1;
  const isN=step===0,isA=step===1,isSec=step>=2&&step<2+SECTIONS.length,isTxt=step===2+SECTIONS.length,isE=step===ES;
  const si=step-2;
  const pct=Math.round((step/ES)*100);

  function canGo(){
    if(isN) return name.trim().length>=2;
    if(isA) return av!==null;
    if(isSec) return SECTIONS[si].q.every((_,i)=>sc[SECTIONS[si].id+"-"+i]!==undefined);
    return true;
  }
  function next(){setStep(s=>s+1);window.scrollTo({top:0,behavior:"smooth"});}

  async function submit(){
    setLoading(true);
    try{
      const r=await fetch(API,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({firstName:name,avatar:av,scores:sc,openText:txt,email})});
      const d=await r.json();
      setReport(d.report||"Error generating report.");
    }catch(e){setReport("Error generating report. Please try again.");}
    setLoading(false);
    setTimeout(()=>ref.current?.scrollIntoView({behavior:"smooth"}),100);
  }

  const BT=(dis,fn,label)=>(
    <button disabled={dis} onClick={fn} style={{width:"100%",padding:15,background:dis?"#222":GOLD,color:dis?"#555":OBSIDIAN,border:"none",borderRadius:4,fontSize:11,fontFamily:"Arial,sans-serif",fontWeight:700,letterSpacing:3,textTransform:"uppercase",cursor:dis?"not-allowed":"pointer",marginTop:28}}>
      {label}
    </button>
  );

  return (
    <div style={{minHeight:"100vh",background:OBSIDIAN,display:"flex",flexDirection:"column",alignItems:"center"}}>
      <div style={{width:"100%",maxWidth:640,padding:"0 20px 80px"}}>
        <div style={{padding:"40px 0 28px",textAlign:"center",borderBottom:"1px solid #B8952A30",marginBottom:36}}>
          <p style={{fontSize:11,letterSpacing:6,color:GOLD,fontFamily:"Arial,sans-serif",fontWeight:700,marginBottom:10}}>ALGN WELLNESS</p>
          <h1 style={{fontSize:26,fontWeight:400,color:CREAM,lineHeight:1.35,margin:"0 0 6px"}}>Women's Hormone Assessment</h1>
          <p style={{fontSize:14,color:MID,fontFamily:"Arial,sans-serif",fontStyle:"italic",margin:0}}>Your biology, decoded in 5 minutes</p>
        </div>

        {!report&&!loading&&<div>
          {!isE&&<div style={{marginBottom:28}}>
            <p style={{fontSize:10,letterSpacing:3,color:GOLD,fontFamily:"Arial,sans-serif",textTransform:"uppercase",marginBottom:6}}>{isN?"Get Started":isA?"Your Profile":isSec?"Step "+(si+1)+" of "+SECTIONS.length+" — "+SECTIONS[si].label:"Almost Done"}</p>
            <div style={{height:2,background:"#B8952A25",borderRadius:2}}><div style={{height:"100%",width:pct+"%",background:GOLD,borderRadius:2,transition:"width 0.4s"}}/></div>
          </div>}
          {step>0&&!isE&&<button style={{background:"transparent",border:"none",color:MID,fontSize:12,fontFamily:"Arial,sans-serif",cursor:"pointer",padding:"10px 0",letterSpacing:1}} onClick={()=>setStep(s=>s-1)}>← Back</button>}

          {isN&&<div>
            <h2 style={{fontSize:21,fontWeight:400,color:CREAM,marginBottom:6}}>Let's start with your name</h2>
            <p style={{fontSize:13,color:MID,fontFamily:"Arial,sans-serif",marginBottom:28}}>We'll personalize your report just for you.</p>
            <input autoFocus style={{width:"100%",background:"#111",border:"1px solid #3A3A3A",borderRadius:4,color:CREAM,fontSize:16,fontFamily:"Arial,sans-serif",padding:"13px 16px",boxSizing:"border-box",outline:"none"}} type="text" placeholder="First name" value={name} onChange={e=>setName(e.target.value)}/>
          </div>}

          {isA&&<div>
            <h2 style={{fontSize:21,fontWeight:400,color:CREAM,marginBottom:6}}>Which best describes you?</h2>
            <p style={{fontSize:13,color:MID,fontFamily:"Arial,sans-serif",marginBottom:28}}>Choose the profile that feels most familiar.</p>
            {AVS.map(a=><div key={a.id} style={{padding:"18px 22px",border:"1px solid "+(av===a.id?GOLD:"#333"),borderRadius:6,marginBottom:10,cursor:"pointer",background:av===a.id?"#B8952A14":"transparent"}} onClick={()=>setAv(a.id)}>
              <p style={{fontSize:10,letterSpacing:3,color:GOLD,fontFamily:"Arial,sans-serif",marginBottom:3}}>{a.age}</p>
              <p style={{fontSize:15,color:av===a.id?GOLD:CREAM,marginBottom:2}}>{a.label}</p>
              <p style={{fontSize:12,color:MID,fontFamily:"Arial,sans-serif"}}>{a.desc}</p>
            </div>)}
          </div>}

          {isSec&&<div>
            <div style={{fontSize:28,marginBottom:8}}>{SECTIONS[si].icon}</div>
            <h2 style={{fontSize:21,fontWeight:400,color:CREAM,marginBottom:6}}>{SECTIONS[si].label}</h2>
            <p style={{fontSize:13,color:MID,fontFamily:"Arial,sans-serif",marginBottom:28}}>Rate how often each applies to you.</p>
            {SECTIONS[si].q.map((q,qi)=>{
              const k=SECTIONS[si].id+"-"+qi;
              return <div key={qi} style={{marginBottom:26}}>
                <p style={{fontSize:14,color:CREAM,lineHeight:1.55,marginBottom:10,fontFamily:"Arial,sans-serif"}}>{q}</p>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {SCALE.map((l,v)=><button key={v} style={{flex:1,minWidth:56,padding:"9px 4px",background:sc[k]===v?GOLD:"transparent",border:"1px solid "+(sc[k]===v?GOLD:"#3a3a3a"),borderRadius:3,color:sc[k]===v?OBSIDIAN:MID,fontSize:10,fontFamily:"Arial,sans-serif",fontWeight:sc[k]===v?700:400,cursor:"pointer",textAlign:"center"}} onClick={()=>setSc(p=>({...p,[k]:v}))}>{l}</button>)}
                </div>
              </div>;
            })}
          </div>}

          {isTxt&&<div>
            <h2 style={{fontSize:21,fontWeight:400,color:CREAM,marginBottom:6}}>In your own words</h2>
            <p style={{fontSize:13,color:MID,fontFamily:"Arial,sans-serif",marginBottom:28}}>What's bothering you most? Optional.</p>
            <textarea style={{width:"100%",background:"#111",border:"1px solid #3A3A3A",borderRadius:4,color:CREAM,fontSize:14,fontFamily:"Arial,sans-serif",padding:"13px 16px",resize:"vertical",minHeight:90,boxSizing:"border-box",outline:"none"}} placeholder="Tell Dr. Alejandra what's going on..." value={txt} onChange={e=>setTxt(e.target.value)} rows={5}/>
          </div>}

          {isE&&<div style={{background:"#0f0f0f",border:"1px solid #B8952A30",borderRadius:8,padding:"36px 32px",textAlign:"center"}}>
            <div style={{fontSize:36,marginBottom:14}}>✨</div>
            <h2 style={{fontSize:20,color:CREAM,fontWeight:400,marginBottom:8}}>Your report is ready, {name}</h2>
            <p style={{fontSize:13,color:MID,fontFamily:"Arial,sans-serif",lineHeight:1.6,marginBottom:28}}>Enter your email to receive your personalized hormone report instantly.</p>
            <input autoFocus style={{width:"100%",background:"#111",border:"1px solid #3A3A3A",borderRadius:4,color:CREAM,fontSize:16,fontFamily:"Arial,sans-serif",padding:"13px 16px",boxSizing:"border-box",outline:"none",marginBottom:14}} type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)}/>
            <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:10,cursor:"pointer",textAlign:"left"}} onClick={()=>setOk(c=>!c)}>
              <div style={{width:18,height:18,borderRadius:2,border:"1px solid "+(ok?GOLD:"#555"),background:ok?GOLD:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",marginTop:1}}>
                {ok&&<span style={{color:OBSIDIAN,fontSize:11,fontWeight:700}}>✓</span>}
              </div>
              <span style={{fontSize:12,color:MID,fontFamily:"Arial,sans-serif",lineHeight:1.5}}>I agree to receive my report and wellness insights from ALGN Wellness. Unsubscribe anytime.</span>
            </div>
            {BT(!(email.includes("@")&&ok),submit,"Send My Report →")}
          </div>}

          {!isE&&BT(!canGo(),next,isTxt?"Continue to Your Report →":"Continue →")}
        </div>}

        {loading&&<div style={{textAlign:"center",padding:"60px 0"}}>
          <p style={{fontSize:17,color:GOLD,marginBottom:8}}>Generating your report</p>
          <p style={{fontSize:13,color:MID,fontFamily:"Arial,sans-serif"}}>Dr. Alejandra's AI is analyzing your assessment...</p>
          <div style={{width:36,height:36,border:"2px solid #2a2a2a",borderTop:"2px solid "+GOLD,borderRadius:"50%",margin:"28px auto",animation:"spin 0.9s linear infinite"}}/>
        </div>}

        {report&&<div ref={ref}>
          <div style={{textAlign:"center",marginBottom:44,paddingBottom:28,borderBottom:"1px solid #B8952A25"}}>
            <p style={{fontSize:11,letterSpacing:6,color:GOLD,fontFamily:"Arial,sans-serif",fontWeight:700,marginBottom:8}}>ALGN WELLNESS</p>
            <h2 style={{fontSize:22,fontWeight:400,color:CREAM,margin:"0 0 4px"}}>{name}'s Hormone Assessment Report</h2>
            <p style={{fontSize:12,color:MID,fontFamily:"Arial,sans-serif",margin:0}}>Prepared by Dr. Alejandra, DC · Educational purposes only</p>
          </div>
          <div style={{fontSize:14,color:CREAM,lineHeight:1.85,fontFamily:"Arial,sans-serif",whiteSpace:"pre-wrap"}}>{report}</div>
          <div style={{background:"#B8952A12",border:"1px solid #B8952A35",borderRadius:8,padding:"28px 24px",marginTop:32,textAlign:"center"}}>
            <h3 style={{fontSize:18,color:GOLD,fontWeight:400,marginBottom:10}}>Ready to take the next step?</h3>
            <button style={{padding:"13px 30px",background:GOLD,color:OBSIDIAN,fontFamily:"Arial,sans-serif",fontWeight:700,fontSize:11,letterSpacing:3,textTransform:"uppercase",border:"none",borderRadius:4,cursor:"pointer"}} onClick={()=>window.open(JANE,"_blank")}>Book Your Hormone Clarity Session →</button>
          </div>
          <button style={{width:"100%",padding:14,background:"transparent",color:GOLD,border:"1px solid #B8952A44",borderRadius:4,fontSize:11,fontFamily:"Arial,sans-serif",fontWeight:700,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",marginTop:16}} onClick={()=>{setStep(0);setReport(null);setSc({});setAv(null);setName("");setTxt("");setEmail("");window.scrollTo({top:0});}}>Start a New Assessment</button>
        </div>}
      </div>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
</script>
</body>
</html>`);
}
