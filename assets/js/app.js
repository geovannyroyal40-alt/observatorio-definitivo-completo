const M=[
{n:"Pasto",pm:12.8,po:28.4,de:6.5,va:7800,ic:5.85,ed:7.8},
{n:"Tumaco",pm:28.5,po:48.7,de:9.8,va:2450,ic:3.42,ed:4.2},
{n:"Ipiales",pm:15.2,po:32.1,de:7.2,va:1720,ic:5.10,ed:6.9},
{n:"Túquerres",pm:18.7,po:36.5,de:6.8,va:980,ic:4.55,ed:6.1},
{n:"Sandoná",pm:16.4,po:34.2,de:7.0,va:620,ic:4.70,ed:6.4},
{n:"La Unión",pm:19.8,po:38.9,de:6.9,va:710,ic:4.35,ed:5.9},
{n:"Samaniego",pm:21.3,po:41.2,de:8.1,va:580,ic:4.15,ed:5.5},
{n:"Barbacoas",pm:31.2,po:52.3,de:11.4,va:390,ic:3.10,ed:3.8},
{n:"Guachucal",pm:22.1,po:43.1,de:7.5,va:410,ic:4.05,ed:5.3},
{n:"Pupiales",pm:17.9,po:35.8,de:6.7,va:480,ic:4.60,ed:6.2},
{n:"Buesaco",pm:20.5,po:40.1,de:7.3,va:520,ic:4.25,ed:5.7},
{n:"Cumbal",pm:24.6,po:45.6,de:8.4,va:450,ic:3.90,ed:4.9},
{n:"Consacá",pm:18.9,po:37.4,de:7.1,va:380,ic:4.40,ed:6.0},
{n:"Yacuanquer",pm:17.2,po:34.9,de:6.6,va:340,ic:4.50,ed:6.3},
{n:"La Cruz",pm:21.8,po:42.0,de:7.8,va:460,ic:4.20,ed:5.6}
];
const key={Pobreza_Multidimensional:"pm",Pobreza_Monetaria:"po",Tasa_Desempleo:"de",Valor_Agregado:"va",Indice_Competitividad:"ic",Proxy_Educacion:"ed"};
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
const std=a=>{const m=mean(a);return Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/a.length)||1;};
const corr=(x,y)=>{const mx=mean(x),my=mean(y);let n=0,dx=0,dy=0;for(let i=0;i<x.length;i++){n+=(x[i]-mx)*(y[i]-my);dx+=(x[i]-mx)**2;dy+=(y[i]-my)**2;}return n/Math.sqrt(dx*dy);};

/* ========== MAPA ========== */
function loadChoropleth(variable="pobreza_multi"){
  fetch("assets/data/colombia_deptos.json")
    .then(r=>r.json())
    .then(geo=>{
      const z=[],locations=[],texts=[];
      geo.features.forEach(f=>{
        const p=f.properties;
        const name=p.name||p.DPTO_CNMBR||"N/A";
        locations.push(name); z.push(p[variable]||0); texts.push(name);
      });
      const isPov=variable.includes("pobreza")||variable==="desempleo";
      Plotly.newPlot("choropleth",[{
        type:"choropleth", geojson:geo, locations:locations, featureidkey:"properties.name",
        z:z, text:texts,
        colorscale:isPov?[[0,"#1a9641"],[0.25,"#a6d96a"],[0.5,"#ffffbf"],[0.75,"#fdae61"],[1,"#d7191c"]]:[[0,"#d7191c"],[0.25,"#fdae61"],[0.5,"#ffffbf"],[0.75,"#a6d96a"],[1,"#1a9641"]],
        colorbar:{title:{text:variable.replace(/_/g," "),font:{size:11}},thickness:14,len:0.7},
        marker:{line:{color:"#0b0c0f",width:0.5}},
        hovertemplate:"<b>%{text}</b><br>Valor: %{z:.1f}<extra></extra>"
      }],{
        paper_bgcolor:"#12141a", plot_bgcolor:"#12141a", font:{color:"#9ca3af",size:11},
        margin:{t:8,b:8,l:8,r:8},
        geo:{bgcolor:"#0b0c0f",showland:true,landcolor:"#1a1a1e",showocean:true,oceancolor:"#0b0c0f",
          showlakes:false,showrivers:false,showframe:false,showcoastlines:false,
          projection:{type:"mercator"},center:{lon:-74.5,lat:4.2},
          lataxis:{range:[-4.8,13.2]},lonaxis:{range:[-82.2,-66.5]}}
      },{responsive:true,displayModeBar:false});
    })
    .catch(e=>{console.error(e);document.getElementById("choropleth").innerHTML="<div style='height:520px;display:flex;align-items:center;justify-content:center;color:#9ca3af'>Error cargando mapa</div>";});
}

/* ========== 3D + STATS ========== */
function build3d(){
  const s=[...M].sort((a,b)=>b.ic-a.ic);
  Plotly.newPlot("plot3d",[{type:"bar",x:s.map(m=>m.n),y:s.map(m=>m.ic),
    marker:{color:s.map(m=>m.ic),colorscale:[[0,"#ef4444"],[0.5,"#eab308"],[1,"#22c55e"]],showscale:true,colorbar:{title:"IC",thickness:12}}
  }],{paper_bgcolor:"#12141a",plot_bgcolor:"#12141a",font:{color:"#9ca3af",size:11},margin:{t:20,b:90,l:40,r:20},
    yaxis:{title:"Índice de Competitividad",gridcolor:"#23262f",color:"#9ca3af"},xaxis:{tickangle:-45,gridcolor:"#23262f",color:"#9ca3af"}
  },{responsive:true,displayModeBar:false});
}

function buildDesc(){
  const vars=["pm","po","de","va","ic","ed"],names=["Pobreza Multidimensional","Pobreza Monetaria","Desempleo","Valor Agregado","Competitividad","Educación"];
  let h=`<thead class="text-[10px] uppercase text-[var(--soft)] bg-[var(--ink)]/50"><tr><th class="text-left px-3 py-2">Variable</th><th class="text-right px-3 py-2">Media</th><th class="text-right px-3 py-2">Desv.</th><th class="text-right px-3 py-2">Mín</th><th class="text-right px-3 py-2">Máx</th></tr></thead><tbody>`;
  vars.forEach((v,i)=>{const a=M.map(m=>m[v]);h+=`<tr class="border-t border-[var(--line)]"><td class="px-3 py-2 text-gray-300">${names[i]}</td><td class="px-3 py-2 text-right">${mean(a).toFixed(1)}</td><td class="px-3 py-2 text-right">${std(a).toFixed(1)}</td><td class="px-3 py-2 text-right">${Math.min(...a).toFixed(1)}</td><td class="px-3 py-2 text-right">${Math.max(...a).toFixed(1)}</td></tr>`;});
  document.getElementById("tblDesc").innerHTML=h+"</tbody>";
}

let barCh;
function updateBar(v="Pobreza_Multidimensional"){
  const k=key[v];
  const s=[...M].sort((a,b)=>(v.includes("Pobreza")||v==="Tasa_Desempleo")?b[k]-a[k]:a[k]-b[k]);
  if(barCh)barCh.destroy();
  barCh=new Chart(document.getElementById("barChart"),{type:"bar",data:{labels:s.map(m=>m.n),datasets:[{data:s.map(m=>m[k]),backgroundColor:s.map(m=>{const x=m[k];if(v.includes("Pobreza")||v==="Tasa_Desempleo"){if(x>25)return"#ef4444";if(x>20)return"#f59e0b";if(x>15)return"#eab308";return"#22c55e";}if(x>5.5)return"#22c55e";if(x>4.5)return"#84cc16";return"#ef4444";}),borderWidth:0,borderRadius:3}]},options:{indexAxis:"y",plugins:{legend:{display:false}},scales:{x:{grid:{color:"#23262f"},ticks:{color:"#9ca3af",font:{size:10}}},y:{grid:{display:false},ticks:{color:"#d1d5db",font:{size:10}}}}}});
}

function buildPie(){
  const low=M.filter(m=>m.pm<18).length,mid=M.filter(m=>m.pm>=18&&m.pm<25).length,high=M.filter(m=>m.pm>=25).length;
  new Chart(document.getElementById("pieChart"),{type:"doughnut",data:{labels:["Baja (<18%)","Media (18-25%)","Alta (≥25%)"],datasets:[{data:[low,mid,high],backgroundColor:["#22c55e","#eab308","#ef4444"],borderWidth:0}]},options:{plugins:{legend:{position:"bottom",labels:{color:"#9ca3af",boxWidth:11,font:{size:11}}}},cutout:"55%"}});
}

function buildRadar(){
  const avg={p:10-(mean(M.map(m=>m.pm))/40*10),d:10-(mean(M.map(m=>m.de))/15*10),e:mean(M.map(m=>m.ed)),c:mean(M.map(m=>m.ic)),v:Math.min(10,mean(M.map(m=>m.va))/1000)};
  new Chart(document.getElementById("radarChart"),{type:"radar",data:{labels:["Baja Pobreza","Bajo Desempleo","Educación","Competitividad","Valor Agregado"],datasets:[{data:[avg.p,avg.d,avg.e,avg.c,avg.v],borderColor:"#c9a227",backgroundColor:"rgba(201,162,39,.15)",pointBackgroundColor:"#c9a227"}]},options:{scales:{r:{min:0,max:10,ticks:{display:false},grid:{color:"#23262f"},pointLabels:{color:"#9ca3af",font:{size:10}}}},plugins:{legend:{display:false}}}});
}

function buildCorr(){
  const ks=["ic","ed","pm","de","va"],sh={ic:"Compet.",ed:"Educ.",pm:"Pob.Mult.",de:"Desemp.",va:"Val.Agr."};
  let h="<thead><tr><th class='px-2 py-1.5 text-left text-[var(--soft)]'></th>";
  ks.forEach(k=>h+=`<th class="px-2 py-1.5 text-center text-[var(--soft)]">${sh[k]}</th>`);
  h+="</tr></thead><tbody>";
  ks.forEach(k1=>{h+=`<tr><td class="px-2 py-1.5 text-[var(--soft)]">${sh[k1]}</td>`;ks.forEach(k2=>{const c=corr(M.map(m=>m[k1]),M.map(m=>m[k2]));const col=k1===k2?"text-gray-500":(c>0.5?"text-emerald-400":(c<-0.5?"text-red-400":"text-gray-300"));h+=`<td class="px-2 py-1.5 text-center ${col}">${c.toFixed(2)}</td>`;});h+="</tr>";});
  document.getElementById("tblCorr").innerHTML=h+"</tbody>";
}

function buildOLS(){
  const n=M.length,y=M.map(m=>m.ic),X=M.map(m=>[1,m.ed,m.pm,m.de,Math.log(m.va)]),k=5;
  const XtX=Array(k).fill(0).map(()=>Array(k).fill(0)),Xty=Array(k).fill(0);
  for(let i=0;i<n;i++)for(let a=0;a<k;a++){Xty[a]+=X[i][a]*y[i];for(let b=0;b<k;b++)XtX[a][b]+=X[i][a]*X[i][b];}
  const A=XtX.map((r,i)=>[...r,Xty[i]]);
  for(let c=0;c<k;c++){let p=c;for(let r=c+1;r<k;r++)if(Math.abs(A[r][c])>Math.abs(A[p][c]))p=r;[A[c],A[p]]=[A[p],A[c]];const d=A[c][c]||1e-9;for(let j=c;j<=k;j++)A[c][j]/=d;for(let r=0;r<k;r++){if(r===c)continue;const f=A[r][c];for(let j=c;j<=k;j++)A[r][j]-=f*A[c][j];}}
  const b=A.map(r=>r[k]);
  const yhat=X.map(r=>r.reduce((s,x,i)=>s+x*b[i],0));
  const ym=mean(y),ssT=y.reduce((s,yi)=>s+(yi-ym)**2,0),ssR=y.reduce((s,yi,i)=>s+(yi-yhat[i])**2,0);
  document.getElementById("olsBox").innerHTML=`<div class="flex justify-between"><span class="text-[var(--soft)]">Constante</span><span>${b[0].toFixed(3)}</span></div><div class="flex justify-between"><span class="text-[var(--soft)]">Educación</span><span class="text-emerald-400">${b[1].toFixed(3)}</span></div><div class="flex justify-between"><span class="text-[var(--soft)]">Pobreza Mult.</span><span class="text-red-400">${b[2].toFixed(3)}</span></div><div class="flex justify-between"><span class="text-[var(--soft)]">Desempleo</span><span>${b[3].toFixed(3)}</span></div><div class="flex justify-between"><span class="text-[var(--soft)]">log(Valor Agregado)</span><span>${b[4].toFixed(3)}</span></div><div class="border-t border-[var(--line)] mt-2 pt-2 flex justify-between"><span class="text-[var(--soft)]">R²</span><span class="gold">${(1-ssR/ssT).toFixed(3)}</span></div>`;
}

/* ========== VAR + IRF ========== */
function normalize(arr){const m=mean(arr),s=std(arr);return arr.map(x=>(x-m)/s);}
function estimateVAR1(series){
  const keys=["ed","pm","de","ic"]; const n=series.ed.length; const A={};
  keys.forEach(k=>{
    const y=series[k].slice(1); const X=keys.map(kk=>series[kk].slice(0,-1));
    const kdim=keys.length; const XtX=Array(kdim).fill(0).map(()=>Array(kdim).fill(0)); const Xty=Array(kdim).fill(0);
    for(let i=0;i<n-1;i++){for(let a=0;a<kdim;a++){Xty[a]+=X[a][i]*y[i];for(let b=0;b<kdim;b++)XtX[a][b]+=X[a][i]*X[b][i];}}
    const Mat=XtX.map((r,i)=>[...r,Xty[i]]);
    for(let c=0;c<kdim;c++){let p=c;for(let r=c+1;r<kdim;r++)if(Math.abs(Mat[r][c])>Math.abs(Mat[p][c]))p=r;[Mat[c],Mat[p]]=[Mat[p],Mat[c]];const d=Mat[c][c]||1e-9;for(let j=c;j<=kdim;j++)Mat[c][j]/=d;for(let r=0;r<kdim;r++){if(r===c)continue;const f=Mat[r][c];for(let j=c;j<=kdim;j++)Mat[r][j]-=f*Mat[c][j];}}
    A[k]=Mat.map(r=>r[kdim]);
  });
  return {A,keys};
}
function computeIRF(shockVar,horizon=8){
  const series={ed:normalize(M.map(m=>m.ed)),pm:normalize(M.map(m=>m.pm)),de:normalize(M.map(m=>m.de)),ic:normalize(M.map(m=>m.ic))};
  const {A,keys}=estimateVAR1(series);
  let state={ed:0,pm:0,de:0,ic:0}; state[shockVar]=1;
  const paths={ed:[],pm:[],de:[],ic:[]};
  for(let h=0;h<=horizon;h++){
    keys.forEach(k=>paths[k].push(state[k]));
    const next={}; keys.forEach(k=>{next[k]=0;keys.forEach((kk,i)=>{next[k]+=A[k][i]*state[kk];});});
    state=next;
  }
  return paths;
}
let irfChart;
function runIRF(){
  const shock=document.getElementById("varShock")?.value||"ed";
  const H=+(document.getElementById("varH")?.value||8);
  const paths=computeIRF(shock,H);
  const labels=Array.from({length:H+1},(_,i)=>"t+"+i);
  const colors={ed:"#c9a227",pm:"#ef4444",de:"#3b82f6",ic:"#22c55e"};
  const names={ed:"Educación",pm:"Pobreza Mult.",de:"Desempleo",ic:"Competitividad"};
  if(irfChart)irfChart.destroy();
  irfChart=new Chart(document.getElementById("irfChart"),{
    type:"line",
    data:{labels,datasets:Object.keys(paths).map(k=>({label:names[k],data:paths[k],borderColor:colors[k],backgroundColor:colors[k]+"22",tension:0.3,fill:false,pointRadius:3}))},
    options:{responsive:true,interaction:{mode:"index",intersect:false},
      plugins:{legend:{labels:{color:"#9ca3af",boxWidth:11,font:{size:11}}}},
      scales:{x:{grid:{color:"#23262f"},ticks:{color:"#9ca3af"},title:{display:true,text:"Horizonte",color:"#9ca3af"}},
             y:{grid:{color:"#23262f"},ticks:{color:"#9ca3af"},title:{display:true,text:"Respuesta (DE)",color:"#9ca3af"}}}}
  });
}

/* ========== ML ========== */
let simCh;
function runSim(){
  const edu=+(document.getElementById("sEdu")?.value||5.8),povR=+(document.getElementById("sPov")?.value||2),vaG=+(document.getElementById("sVa")?.value||3.5)/100;
  const yrs=[2025,2026,2027,2028,2029,2030],comp=[],pov=[];
  let c=4.47,p=19.7,va=1155;
  yrs.forEach((_,i)=>{if(i>0){va*=(1+vaG);p=Math.max(8,p-povR/5);c=1.15+0.52*edu-0.07*p+0.12*Math.log(va);c=Math.min(7.5,Math.max(3,c));}comp.push(+c.toFixed(2));pov.push(+p.toFixed(1));});
  document.getElementById("rComp").textContent=comp[5].toFixed(2);
  document.getElementById("rPov").textContent=pov[5].toFixed(1)+"%";
  if(simCh)simCh.destroy();
  simCh=new Chart(document.getElementById("simChart"),{type:"line",data:{labels:yrs,datasets:[{label:"Competitividad",data:comp,borderColor:"#c9a227",backgroundColor:"rgba(201,162,39,.1)",tension:.35,fill:true,pointBackgroundColor:"#c9a227"},{label:"Pobreza Mult. (%)",data:pov,borderColor:"#ef4444",backgroundColor:"rgba(239,68,68,.08)",tension:.35,fill:true,yAxisID:"y1",pointBackgroundColor:"#ef4444"}]},options:{responsive:true,interaction:{mode:"index",intersect:false},plugins:{legend:{labels:{color:"#9ca3af",boxWidth:11,font:{size:11}}}},scales:{x:{grid:{color:"#23262f"},ticks:{color:"#9ca3af"}},y:{grid:{color:"#23262f"},ticks:{color:"#c9a227"},title:{display:true,text:"Competitividad",color:"#c9a227"}},y1:{position:"right",grid:{drawOnChartArea:false},ticks:{color:"#ef4444"},title:{display:true,text:"Pobreza %",color:"#ef4444"}}}}});
}

/* ========== CHATBOT MEJORADO ========== */
const KB=[
  {k:["hola","buenos dias","buenas","saludos","hey"],a:"¡Hola! Soy el asistente del Observatorio Regional de Nariño. Puedo responder sobre pobreza, competitividad, el mapa, el modelo VAR, las IRF, el OLS, las proyecciones o los autores. ¿Qué quieres saber?"},
  {k:["pobreza multidimensional","ipm","pobreza multi"],a:"La pobreza multidimensional de Nariño se ubicó en 18.1% (DANE 2024), frente a 11.5% nacional. Los municipios del Pacífico (Tumaco, Barbacoas) concentran los valores más altos de la muestra."},
  {k:["pobreza monetaria","pobreza por ingresos"],a:"Pobreza monetaria de Nariño: 39.2% (2024). Nacional: 31.8%. Mide insuficiencia de ingresos para una canasta básica."},
  {k:["competitividad","idc","indice de competitividad"],a:"Nariño se ubica alrededor del puesto 20-21 en el Índice Departamental de Competitividad (IDC). Su mayor fortaleza es Educación Básica y Media. Los principales retos son Innovación y Sistema Financiero."},
  {k:["educacion","educación"],a:"La educación (proxy) muestra la correlación positiva más fuerte con el índice de competitividad municipal. Mejorar el desempeño educativo es un canal clave para elevar la competitividad."},
  {k:["desempleo","tasa de desempleo"],a:"La tasa de desempleo de Nariño se ubicó en 6.0% en 2025, una de las más bajas del país (nacional ≈ 8.9%)."},
  {k:["ols","regresion","regresión","modelo lineal","coeficiente"],a:"El modelo OLS estima: Competitividad = β0 + β1·Educación + β2·Pobreza Mult. + β3·Desempleo + β4·log(VA). El coeficiente de educación es positivo; el de pobreza multidimensional es negativo."},
  {k:["var","vector autoregresivo","modelo var"],a:"El modelo VAR (Vector Autoregressive) captura la dinámica conjunta entre Educación, Pobreza Multidimensional, Desempleo y Competitividad. Se estima un VAR(1) sobre las series normalizadas de la muestra municipal."},
  {k:["irf","impulso","respuesta","impulso-respuesta","shock"],a:"Las Funciones de Impulso-Respuesta (IRF) muestran cómo responde cada variable a un shock de 1 desviación estándar en otra variable a lo largo del horizonte elegido. Usa el selector de la sección VAR/IRF."},
  {k:["mapa","coropletico","coroplético","cartografia","cartografía"],a:"El mapa coroplético muestra las divisiones reales de los departamentos de Colombia (geometría DANE MGN 2018). Puedes cambiar la variable (pobreza, desempleo, competitividad) con el selector."},
  {k:["3d","tres dimensiones","visualizacion 3d"],a:"La vista 3D muestra barras de competitividad de los 15 municipios de Nariño ordenados de mayor a menor índice."},
  {k:["proyeccion","proyección","simulacion","simulación","2030","modelo predictivo"],a:"En la sección Modelos Predictivos puedes ajustar educación, reducción de pobreza y crecimiento del valor agregado para proyectar competitividad y pobreza multidimensional a 2030."},
  {k:["autores","camila","geovanny","quien hizo","quién hizo"],a:"El Observatorio fue desarrollado por Camila Guerrero (análisis de datos e interfaz) y Geovanny Betancourt (econometría, VAR y modelos predictivos)."},
  {k:["nariño","narino","departamento"],a:"El Observatorio se centra en el departamento de Nariño. Analiza 15 municipios clave y los compara con el promedio nacional y el resto de departamentos de Colombia."},
  {k:["datos","fuente","dane","fuentes"],a:"Las fuentes principales son el DANE (pobreza, desempleo) y el Consejo Privado de Competitividad – Universidad del Rosario (Índice Departamental de Competitividad)."},
  {k:["que es","qué es","para que sirve","para qué sirve"],a:"Este Observatorio permite explorar indicadores económicos de Nariño, visualizar mapas, estimar relaciones econométricas, simular escenarios y analizar dinámicas con un modelo VAR e IRF."}
];

function findA(q){
  const n=q.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  // buscar coincidencias
  for(const item of KB){
    for(const w of item.k){
      if(n.includes(w.normalize("NFD").replace(/[\u0300-\u036f]/g,""))) return item.a;
    }
  }
  // respuestas por palabras sueltas más amplias
  if(n.includes("gracias")||n.includes("thank")) return "¡Con gusto! Si tienes otra pregunta sobre pobreza, competitividad, VAR, IRF o proyecciones, aquí estoy.";
  if(n.includes("ayuda")||n.includes("help")||n.includes("opciones")) return "Puedes preguntarme por: pobreza multidimensional, pobreza monetaria, competitividad, educación, desempleo, OLS, VAR, IRF, mapa, proyecciones a 2030 o los autores.";
  return "No tengo una respuesta exacta para eso. Prueba con: pobreza, competitividad, VAR, IRF, mapa, OLS, proyecciones o autores. Estoy pensado para preguntas básicas del Observatorio.";
}

function addM(t,u=false){
  const c=document.getElementById("chatBox");
  if(!c)return;
  const d=document.createElement("div");
  d.className="flex gap-2 "+(u?"justify-end":"");
  d.innerHTML=u
    ?`<div class="bg-[var(--gold)] text-[var(--ink)] rounded-2xl rounded-tr-sm px-3 py-2 text-sm max-w-[85%]">${t}</div>`
    :`<div class="w-6 h-6 rounded-full bg-[var(--gold)] flex items-center justify-center text-[var(--ink)] text-[9px] font-bold shrink-0">IA</div><div class="bg-[var(--panel)] border border-[var(--line)] rounded-2xl rounded-tl-sm px-3 py-2 text-sm text-gray-300 max-w-[85%]">${t}</div>`;
  c.appendChild(d);
  c.scrollTop=c.scrollHeight;
}

function send(){
  const i=document.getElementById("chatIn");
  if(!i)return;
  const t=i.value.trim();
  if(!t)return;
  addM(t,true);
  i.value="";
  setTimeout(()=>addM(findA(t)),320);
}

/* ========== INIT ========== */
document.addEventListener("DOMContentLoaded",()=>{
  loadChoropleth("pobreza_multi");
  build3d(); buildDesc(); updateBar(); buildPie(); buildRadar(); buildCorr(); buildOLS();
  runSim();
  // VAR
  const h=document.getElementById("varH");
  if(h){
    h.addEventListener("input",()=>{const el=document.getElementById("varHVal");if(el)el.textContent=h.value;});
    document.getElementById("btnVar")?.addEventListener("click",runIRF);
    setTimeout(runIRF,600);
  }
  // eventos generales
  document.getElementById("mapVar")?.addEventListener("change",e=>loadChoropleth(e.target.value));
  document.getElementById("selRank")?.addEventListener("change",e=>updateBar(e.target.value));
  document.getElementById("sEdu")?.addEventListener("input",e=>document.getElementById("vEdu").textContent=e.target.value);
  document.getElementById("sPov")?.addEventListener("input",e=>document.getElementById("vPov").textContent=parseFloat(e.target.value).toFixed(1));
  document.getElementById("sVa")?.addEventListener("input",e=>document.getElementById("vVa").textContent=parseFloat(e.target.value).toFixed(1)+"%");
  document.getElementById("btnSim")?.addEventListener("click",runSim);
  // chatbot
  addM("¡Hola! Soy el asistente del Observatorio. Puedo responder sobre pobreza, competitividad, mapa, VAR, IRF, OLS, proyecciones y autores. Escribe tu pregunta.");
  document.getElementById("chatBtn")?.addEventListener("click",send);
  document.getElementById("chatIn")?.addEventListener("keypress",e=>{if(e.key==="Enter")send();});
});
