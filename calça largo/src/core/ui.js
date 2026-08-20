/* ═══════════════════════════════════════════════════════════
   NÚCLEO — Ícones, estado, helpers
═══════════════════════════════════════════════════════════ */
const { useState, useEffect, useRef, useMemo, useCallback } = React;
const h = React.createElement;

/* ─── Ícones (line, strokeWidth 1.8 — nunca emoji na navegação) ─── */
const ICO = {
  home:'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  path:'M4 20c0-3 3-4 6-4s6-1 6-4 3-4 6-4M4 20h.01M20 8h.01',
  spark:'M12 3l1.9 5.6L19.5 10l-5.6 1.4L12 17l-1.9-5.6L4.5 10l5.6-1.4z',
  chart:'M4 20V10M10 20V4M16 20v-7M22 20H2',
  user:'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  bell:'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',
  menu:'M3 12h18M3 6h18M3 18h18',
  search:'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
  mic:'M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v3',
  check:'M20 6 9 17l-5-5',
  chevR:'m9 18 6-6-6-6',
  chevL:'m15 18-6-6 6-6',
  chevD:'m6 9 6 6 6-6',
  chevU:'m18 15-6-6-6 6',
  plus:'M12 5v14M5 12h14',
  minus:'M5 12h14',
  play:'M6 3.5v17l14-8.5z',
  lock:'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM8 11V7a4 4 0 0 1 8 0v4',
  flame:'M12 2s4.5 5 4.5 9.5A4.5 4.5 0 0 1 12 16a4.5 4.5 0 0 1-4.5-4.5C7.5 7 12 2 12 2zM12 16c0 3 2 4 2 6H10c0-2 2-3 2-6z',
  ruler:'M21.3 8.7 8.7 21.3a1 1 0 0 1-1.4 0l-4.6-4.6a1 1 0 0 1 0-1.4L15.3 2.7a1 1 0 0 1 1.4 0l4.6 4.6a1 1 0 0 1 0 1.4zM14.5 5.5l2 2M11.5 8.5l2 2M8.5 11.5l2 2M5.5 14.5l2 2',
  camera:'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  water:'M12 2.7s6 6.3 6 10.3a6 6 0 0 1-12 0c0-4 6-10.3 6-10.3z',
  moon:'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
  sun:'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
  clock:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  heart:'M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z',
  walk:'M13 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 22l3-8 3 3v5M11 14l-1-5 4-2 2 3 3 1',
  dumbbell:'M6.5 6.5 17.5 17.5M3 8v8M6 5v14M18 5v14M21 8v8',
  core:'M8 2c0 4.5 8 4.5 8 10s-8 5.5-8 10M16 2c0 4.5-8 4.5-8 10s8 5.5 8 10',
  lungs:'M12 3v11M8 14c0 4-2 6-4 6s-2-3-2-6 1-6 3-6 3 2 3 6zM16 14c0 4 2 6 4 6s2-3 2-6-1-6-3-6-3 2-3 6z',
  hand:'M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v7M10 10.5V6a2 2 0 0 0-4 0v9M18 8a2 2 0 0 1 4 0v6a8 8 0 0 1-8 8h-2a8 8 0 0 1-8-8v-1a2 2 0 0 1 4 0',
  protein:'M12 2.5c4 0 7.5 5 7.5 9.6A7.5 7.5 0 0 1 12 21.5a7.5 7.5 0 0 1-7.5-9.4C4.5 7.5 8 2.5 12 2.5zM9.6 16.4a4.4 4.4 0 0 0 5 -1.6',
  plate:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z',
  snow:'M12 2v20M4.2 7l15.6 10M19.8 7 4.2 17M12 6l-2.5-2.5M12 6l2.5-2.5M12 18l-2.5 2.5M12 18l2.5 2.5',
  shirt:'M20.4 4.5 16 3l-4 3-4-3-4.4 1.5A2 2 0 0 0 2.2 7l1.5 3.5 2.3-.8V21h12V9.7l2.3.8L21.8 7a2 2 0 0 0-1.4-2.5z',
  pen:'M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z',
  users:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  calendar:'M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18',
  shield:'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  box:'M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.3 7 12 12l8.7-5M12 22V12',
  star:'M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.3-6.2 3.3L7 14.2l-5-4.9 6.9-1z',
  trophy:'M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.7V17a2 2 0 0 1-2 2M14 14.7V17a2 2 0 0 0 2 2M18 2H6v7a6 6 0 0 0 12 0z',
  sparkle:'M12 3l1.9 5.6L19.5 10l-5.6 1.4L12 17l-1.9-5.6L4.5 10l5.6-1.4zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z',
  key:'M15.5 7.5a4 4 0 1 1-2.7 6.9L11 16.2 9.2 14.4 7.4 16.2 5.6 14.4 3.8 16.2 2 14.4l6.6-6.6a4 4 0 0 1 6.9-.3z',
  send:'M22 2 11 13M22 2l-7 20-4-9-9-4z',
  settings:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.8 1.2V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 7 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.8H1a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 2.6 7a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H7a1.7 1.7 0 0 0 1-1.5V1a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V7a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
  book:'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z',
  arrowUR:'M7 17 17 7M7 7h10v10',
  arrowD:'M12 5v14M19 12l-7 7-7-7',
  arrowU:'M12 19V5M5 12l7-7 7 7',
  x:'M18 6 6 18M6 6l12 12',
  info:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01',
  film:'M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM7 3v18M17 3v18M3 12h18M3 7.5h4M3 16.5h4M17 7.5h4M17 16.5h4',
  target:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  scale:'M12 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM12 7v3M4 21h16M6 21V13a6 6 0 0 1 12 0v8M9 10h6',
  zap:'M13 2 3 14h8l-1 8 10-12h-8z',
  quote:'M9 11H5a1 1 0 0 1-1-1V7a3 3 0 0 1 3-3M9 11v3a5 5 0 0 1-5 5M20 11h-4a1 1 0 0 1-1-1V7a3 3 0 0 1 3-3M20 11v3a5 5 0 0 1-5 5',
  bulb:'M9.5 18h5M10 21h4M12 2a6.5 6.5 0 0 1 4 11.6c-.6.5-1 1.2-1 2v.4H9v-.4c0-.8-.4-1.5-1-2A6.5 6.5 0 0 1 12 2z',
  crown:'M3 8l4 4 5-7 5 7 4-4v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  message:'M21 11.5a8.4 8.4 0 0 1-9 8.4 8.9 8.9 0 0 1-4-.9L3 21l1.9-4.9A8.4 8.4 0 0 1 4 11.5 8.4 8.4 0 0 1 12.5 3 8.4 8.4 0 0 1 21 11.5z',
  layers:'M12 2 2 8l10 6 10-6zM2 14l10 6 10-6M2 11l10 6 10-6',
  compass:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM15.6 8.4l-2 5.2-5.2 2 2-5.2z',
  flag:'M4 22V3M4 4h13l-2 4 2 4H4',
};

const Icon = ({n, s=20, c='currentColor', w=1.8, fill='none', style}) =>
  h('svg',{width:s,height:s,viewBox:'0 0 24 24',fill:fill,stroke:c,strokeWidth:w,
    strokeLinecap:'round',strokeLinejoin:'round',style},
    h('path',{d:ICO[n]||ICO.info}));

/* ─── Helpers ─── */
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const hoje=()=>new Date().toISOString().slice(0,10);
const DIAS_SEM=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const fmtHora=m=>`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
const parseHora=s=>{const[a,b]=s.split(':').map(Number);return a*60+(b||0);};

const CORES = { pink:'var(--pink)', gold:'var(--gold)', mint:'var(--mint)',
                violet:'var(--violet)', coral:'var(--coral)' };
const CORES_SOFT = { pink:'var(--pink-soft)', gold:'var(--gold-soft)', mint:'var(--mint-soft)',
                     violet:'var(--violet-soft)', coral:'var(--coral-soft)' };
/* Hex reais — necessários para gradientes e opacidade concatenada */
const HEX = { pink:'#FF2E7E', gold:'#F5C97B', mint:'#4ADE9B',
              violet:'#A855F7', coral:'#FF7A5C' };
const HEX2 = { pink:'#C41E5E', gold:'#C99A45', mint:'#2FA877',
               violet:'#7C3AC4', coral:'#C9542F' };
/* Resolve 'var(--pink)' → '#FF2E7E' para poder concatenar alpha em filtros */
const VAR2HEX = {'var(--pink)':'#FF2E7E','var(--pink-2)':'#FF6BA3','var(--gold)':'#F5C97B',
  'var(--mint)':'#4ADE9B','var(--violet)':'#A855F7','var(--coral)':'#FF7A5C',
  'var(--ink-3)':'#8A6E7C'};
const toHex = c => VAR2HEX[c] || (String(c).startsWith('#') ? c : '#FF2E7E');

/* ─── Estado persistente ─── */
const KEY='cl21d_v3';
const ESTADO_INICIAL = {
  tema:'escuro', onboard:false, lidos:{}, videos:{}, posts:[], favoritos:[],
  nome:'Ana', avatar:'A',
  diaAtual:8,
  diasFeitos:[1,2,3,4,5,6,7],
  streak:8,
  xp:1240,
  missoes:{},                 // { "8": ["k8","m_prot"] }
  medidas:[                   // histórico
    {dia:1,  data:'2026-08-01', cintura:79.0, quadril:99.7, peso:72.4},
    {dia:7,  data:'2026-08-07', cintura:76.8, quadril:99.1, peso:71.6},
  ],
  checkins:[                  // check-in noturno
    {dia:5, fome:3, energia:3, sono:6.2, inchaco:true},
    {dia:6, fome:2, energia:4, sono:7.1, inchaco:false},
    {dia:7, fome:2, energia:4, sono:7.4, inchaco:false},
  ],
  agua:0,                     // doses de Água Viva hoje (0-4)
  janela:{ abriu:null, dur:10 },
  testemunha:'',
  atos:['','',''],
  planoB:['','','','',''],
  onboard:false,
  chat:[],
};

const carregar=()=>{ try{ const r=localStorage.getItem(KEY);
  if(!r) return ESTADO_INICIAL;
  const p=JSON.parse(r);
  return {...ESTADO_INICIAL, ...p,
    missoes: p.missoes||{}, medidas: p.medidas||ESTADO_INICIAL.medidas,
    lidos: p.lidos||{}, videos: p.videos||{}, posts: p.posts||[], favoritos: p.favoritos||[],
    checkins: p.checkins||ESTADO_INICIAL.checkins, chat: p.chat||[],
    atos: p.atos||['','',''], planoB: p.planoB||['','','','',''],
    janela: p.janela||{abriu:null,dur:10}};
  }catch{ return ESTADO_INICIAL; } };
const salvar=s=>{ try{ localStorage.setItem(KEY,JSON.stringify(s)); }catch{} };

/* ─── Componentes primitivos reutilizáveis ─── */

/* Anel de progresso */
const Anel = ({v=0, size=110, sw=9, cor='var(--pink)', track, children, glow=true}) => {
  const r=(size-sw)/2, c=2*Math.PI*r;
  const [on,setOn]=useState(false);
  useEffect(()=>{ const t=setTimeout(()=>setOn(true),120); return()=>clearTimeout(t); },[]);
  return h('div',{style:{position:'relative',width:size,height:size,flexShrink:0}},
    h('svg',{width:size,height:size,className:'ring-svg',
      style:glow?{filter:`drop-shadow(0 0 10px ${toHex(cor)}55)`}:undefined},
      h('circle',{cx:size/2,cy:size/2,r,className:'ring-track',strokeWidth:sw,
        stroke:track||'var(--ov-2)'}),
      h('circle',{cx:size/2,cy:size/2,r,className:'ring-prog',strokeWidth:sw,stroke:cor,
        strokeDasharray:c, strokeDashoffset: on? c*(1-clamp(v,0,1)) : c })),
    h('div',{style:{position:'absolute',inset:0,display:'flex',flexDirection:'column',
      alignItems:'center',justifyContent:'center',textAlign:'center'}}, children));
};

/* Sparkline / gráfico de linha suave */
const Linha = ({pts=[], w=280, hgt=70, cor='var(--pink)', fill=true, dots=false, id='g1'}) => {
  if(pts.length<2) return null;
  const mn=Math.min(...pts), mx=Math.max(...pts), rg=(mx-mn)||1;
  const X=i=>(i/(pts.length-1))*w;
  const Y=v=>hgt-8-((v-mn)/rg)*(hgt-18);
  // curva suave (catmull-rom → bezier)
  let d=`M${X(0)},${Y(pts[0])}`;
  for(let i=0;i<pts.length-1;i++){
    const x0=X(i),y0=Y(pts[i]),x1=X(i+1),y1=Y(pts[i+1]);
    const cx=(x0+x1)/2;
    d+=` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }
  return h('svg',{width:'100%',height:hgt,viewBox:`0 0 ${w} ${hgt}`,preserveAspectRatio:'none',
    style:{overflow:'visible'}},
    h('defs',null,
      h('linearGradient',{id,x1:'0',x2:'0',y1:'0',y2:'1'},
        h('stop',{offset:'0',stopColor:cor,stopOpacity:'.32'}),
        h('stop',{offset:'1',stopColor:cor,stopOpacity:'0'}))),
    fill && h('path',{d:`${d} L${w},${hgt} L0,${hgt} Z`,fill:`url(#${id})`}),
    h('path',{d,fill:'none',stroke:cor,strokeWidth:'2.4',strokeLinecap:'round',
      style:{filter:`drop-shadow(0 0 6px ${toHex(cor)}66)`}}),
    dots && pts.map((p,i)=>h('circle',{key:i,cx:X(i),cy:Y(p),r:i===pts.length-1?4.5:2.5,
      fill:i===pts.length-1?cor:'var(--ink-3)',
      style:i===pts.length-1?{filter:`drop-shadow(0 0 6px ${cor})`}:undefined})));
};

/* Card com borda lateral colorida */
const CardBorda = ({cor='pink', children, style, onClick}) =>
  h('div',{onClick,style:{position:'relative',background:'var(--surf)',
    border:'1px solid var(--line)',borderRadius:'var(--r-md)',overflow:'hidden',...style}},
    h('div',{style:{position:'absolute',left:0,top:0,bottom:0,width:3,background:CORES[cor]}}),
    h('div',{style:{padding:'16px 16px 16px 19px'}}, children));

/* Toast */
const Toast = ({txt, sub, ico='check', onClose}) => {
  useEffect(()=>{ const t=setTimeout(onClose,2600); return()=>clearTimeout(t); },[]);
  return h('div',{className:'toast'},
    h('div',{className:'toast-icon'}, h(Icon,{n:ico,s:17})),
    h('div',{style:{flex:1,minWidth:0}},
      h('div',{style:{fontWeight:700,fontSize:13.5,letterSpacing:'-.01em'}},txt),
      sub&&h('div',{style:{fontSize:11.5,color:'var(--ink-3)',marginTop:1}},sub)));
};

/* Bottom sheet */
const Sheet = ({onClose, children, titulo}) =>
  h(React.Fragment,null,
    h('div',{className:'sheet-backdrop',onClick:onClose}),
    h('div',{className:'sheet'},
      h('div',{className:'sheet-grab'}),
      titulo && h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18}},
        h('div',{className:'h-display',style:{fontSize:22}},titulo),
        h('button',{onClick:onClose,style:{width:32,height:32,borderRadius:'50%',
          background:'var(--ov-1)',display:'flex',alignItems:'center',justifyContent:'center'}},
          h(Icon,{n:'x',s:16}))),
      children));

/* Barra de progresso */
const Bar = ({v=0, cor='', h:alt=6}) =>
  h('div',{className:'bar',style:{height:alt}},
    h('div',{className:'bar-fill '+cor,style:{width:`${clamp(v,0,1)*100}%`}}));

/* Status bar do iPhone */
const StatusBar = ({hora='9:41'}) =>
  h('div',{className:'statusbar'},
    h('span',null,hora),
    h('div',{className:'sb-icons'},
      h('svg',{width:17,height:11,viewBox:'0 0 17 11',fill:'#fff'},
        h('rect',{x:0,y:7,width:3,height:4,rx:1}),h('rect',{x:4.6,y:5,width:3,height:6,rx:1}),
        h('rect',{x:9.2,y:2.5,width:3,height:8.5,rx:1}),h('rect',{x:13.8,y:0,width:3,height:11,rx:1})),
      h('svg',{width:16,height:11,viewBox:'0 0 16 11',fill:'#fff'},
        h('path',{d:'M8 9.6a1.4 1.4 0 1 0 0-2.8 1.4 1.4 0 0 0 0 2.8zM8 5.2c1.9 0 3.6.7 4.9 1.9l1.4-1.4C12.6 4 10.4 3.1 8 3.1S3.4 4 1.7 5.7l1.4 1.4C4.4 5.9 6.1 5.2 8 5.2zM8 1.1c3 0 5.7 1.2 7.7 3.1L16 3.4C13.9 1.3 11.1 0 8 0S2.1 1.3 0 3.4l.3.8C2.3 2.3 5 1.1 8 1.1z'})),
      h('svg',{width:25,height:12,viewBox:'0 0 25 12',fill:'none'},
        h('rect',{x:.6,y:.6,width:21,height:10.8,rx:3,stroke:'#fff',strokeOpacity:.45}),
        h('rect',{x:2.2,y:2.2,width:16,height:7.6,rx:1.8,fill:'#fff'}),
        h('path',{d:'M23.2 4.2v3.6a2 2 0 0 0 0-3.6z',fill:'#fff',fillOpacity:.5}))));


/* ═══════════════════════════════════════════════════════════
   MOVIMENTO — revelação por scroll e acordeão medido
═══════════════════════════════════════════════════════════ */
let _obs = null;
const observador = raiz => {
  if(_obs) return _obs;
  _obs = new IntersectionObserver(es => es.forEach(e => {
    if(e.isIntersecting) e.target.classList.add('in');
    else if(e.target.dataset.rep === '1') e.target.classList.remove('in');
  }), {root: raiz || null, rootMargin:'0px 0px -6% 0px', threshold:.05});
  return _obs;
};

/* ═══ FITA DE LED + ONDA — resposta física a qualquer toque ═══ */
/* Dois filetes nascem no meio da borda de cima e correm por FORA do quadro
   até as pontas, apagando aos poucos — como um DRL de carro.               */
const ledPerimetro = (el, cor) => {
  const r = el.getBoundingClientRect();
  if(r.width < 26 || r.height < 18) return;
  const cs = getComputedStyle(el);
  const m = 3;                                   /* distância da borda */
  const w = r.width + m*2, hh = r.height + m*2;
  let rad = parseFloat(cs.borderRadius) || 0;
  if(cs.borderRadius.includes('%')) rad = Math.min(w,hh)/2;
  rad = Math.min(rad + m, Math.min(w,hh)/2);
  const cx = w/2;

  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('class','led-fita');
  svg.style.left = (r.left - m)+'px';
  svg.style.top  = (r.top  - m)+'px';
  svg.setAttribute('width', w); svg.setAttribute('height', hh);
  svg.setAttribute('viewBox', `0 0 ${w} ${hh}`);

  /* metade direita e metade esquerda do perímetro, ambas partindo do meio do topo */
  const dir = `M${cx},0 H${w-rad} A${rad},${rad} 0 0 1 ${w},${rad} V${hh-rad}
               A${rad},${rad} 0 0 1 ${w-rad},${hh} H${cx}`;
  const esq = `M${cx},0 H${rad} A${rad},${rad} 0 0 0 0,${rad} V${hh-rad}
               A${rad},${rad} 0 0 0 ${rad},${hh} H${cx}`;

  [dir,esq].forEach(d => {
    const p = document.createElementNS('http://www.w3.org/2000/svg','path');
    p.setAttribute('d', d);
    p.setAttribute('stroke', cor);
    p.setAttribute('stroke-width', '2.4');
    p.style.filter = `drop-shadow(0 0 9px ${cor}) drop-shadow(0 0 3px ${cor})`;
    svg.appendChild(p);
  });
  document.body.appendChild(svg);

  svg.querySelectorAll('path').forEach(p => {
    const L = p.getTotalLength();
    p.style.strokeDasharray = `${L}`;
    p.style.strokeDashoffset = `${L}`;
    p.animate(
      [{ strokeDashoffset:L, opacity:1 },
       { strokeDashoffset:L*0.25, opacity:1, offset:.55 },
       { strokeDashoffset:0, opacity:0 }],
      { duration:820, easing:'cubic-bezier(.2,.7,.3,1)', fill:'forwards' });
  });
  setTimeout(()=>svg.remove(), 880);
};

const instalarRipple = () => {
  if(window.__ripple) return; window.__ripple = true;
  document.addEventListener('pointerdown', ev => {
    const b = ev.target.closest('button, a.card, .press');
    if(!b) return;

    /* cor do LED: a cor de destaque do próprio elemento, com rosa como padrão */
    const cs = getComputedStyle(b);
    let cor = cs.getPropertyValue('--led') || '';
    if(!cor.trim()){
      const bc = cs.borderColor;
      cor = (bc && bc !== 'rgba(0, 0, 0, 0)' && !/rgba\(\d+, \d+, \d+, 0\.0?\d?\)/.test(bc))
        ? bc : cs.getPropertyValue('--pink') || '#FF2E7E';
    }
    ledPerimetro(b, cor.trim());

    /* onda interna, no ponto exato do toque */
    const r = b.getBoundingClientRect();
    if(getComputedStyle(b).position === 'static') b.style.position = 'relative';
    if(!b.style.overflow) b.style.overflow = 'hidden';
    const el = document.createElement('span');
    el.className = 'ripple';
    const tam = Math.max(r.width, r.height) * 2.1;
    el.style.width = el.style.height = tam + 'px';
    el.style.left = (ev.clientX - r.left) + 'px';
    el.style.top  = (ev.clientY - r.top) + 'px';
    b.appendChild(el);
    setTimeout(()=>el.remove(), 660);
  }, {passive:true});
};

/* Reveal — revela ao entrar na tela e reanima ao sair e voltar */
const Reveal = ({children, delay=0, tipo='rv', rep=true, as='div', style, className, ...rest}) => {
  const ref = useRef(null);
  useEffect(()=>{
    const el = ref.current; if(!el) return;
    el.style.transitionDelay = delay+'ms';
    el.dataset.rep = rep ? '1' : '0';
    const raiz = el.closest('.screen');
    const io = observador(raiz);
    io.observe(el);
    /* já visível ao montar? revela na hora */
    requestAnimationFrame(()=>{
      const r = el.getBoundingClientRect();
      const lim = raiz ? raiz.getBoundingClientRect().bottom : window.innerHeight;
      if(r.top < lim + 40) el.classList.add('in');
    });
    return ()=>{ try{ io.unobserve(el); }catch(e){} };
  },[delay,rep]);
  return h(as,{ref,className:[tipo,className].filter(Boolean).join(' '),style,...rest}, children);
};

/* Acordeão com slide-down real (mede a altura do conteúdo) */
const Acordeao = ({titulo, sub, num, cor='pink', ico, aberto:ini=false, xp, lido, onLer, children}) => {
  const [on,setOn]=useState(ini);
  const [alt,setAlt]=useState(ini?'auto':0);
  const box=useRef(null);
  const alvo=()=>box.current?box.current.scrollHeight:0;
  const alternar=()=>{
    if(on){ setAlt(alvo()); requestAnimationFrame(()=>requestAnimationFrame(()=>setAlt(0))); setOn(false); }
    else { setOn(true); setAlt(alvo()); setTimeout(()=>setAlt('auto'),600); onLer&&onLer(); }
  };
  return h('div',{className:`card lift ${on?'acc-open':''}`,
    style:{padding:0,marginBottom:11,overflow:'hidden',
      borderColor: on? `color-mix(in srgb, ${CORES[cor]} 34%, transparent)` : 'var(--line)',
      background: on? `linear-gradient(180deg, ${CORES_SOFT[cor]}, transparent 42%), var(--surf)` : 'var(--surf)'}},
    h('button',{onClick:alternar,
      style:{width:'100%',display:'flex',alignItems:'center',gap:13,padding:'17px 18px',textAlign:'left'}},
      num!=null && h('span',{className:'mono',
        style:{fontSize:11,fontWeight:700,color:CORES[cor],minWidth:21}},String(num).padStart(2,'0')),
      ico && h('span',{style:{width:34,height:34,borderRadius:12,flexShrink:0,
        background:CORES_SOFT[cor],display:'flex',alignItems:'center',justifyContent:'center'}},
        h(Icon,{n:ico,s:16,c:CORES[cor]})),
      h('span',{style:{flex:1,minWidth:0}},
        h('span',{style:{display:'block',fontFamily:'var(--f-display)',fontSize:17.5,
          fontWeight:600,letterSpacing:'-.025em',lineHeight:1.2}},titulo),
        sub && h('span',{style:{display:'block',fontSize:12,color:'var(--ink-3)',marginTop:3}},sub)),
      lido && h('span',{style:{width:20,height:20,borderRadius:'50%',flexShrink:0,
        background:'var(--mint)',display:'flex',alignItems:'center',justifyContent:'center'}},
        h(Icon,{n:'check',s:11,c:'#04140f',w:3.4})),
      h('span',{className:'acc-chev',style:{color:'var(--ink-3)',display:'flex'}},
        h(Icon,{n:'chevD',s:18}))),
    h('div',{className:'acc-body',style:{height:alt==='auto'?'auto':alt+'px',opacity:on?1:0}},
      h('div',{ref:box,style:{padding:'2px 18px 20px'}},
        children,
        xp && h('div',{style:{display:'flex',alignItems:'center',gap:7,marginTop:16,
          paddingTop:13,borderTop:'1px dashed var(--line-2)'}},
          h(Icon,{n:'zap',s:13,c:'var(--gold)'}),
          h('span',{className:'mono',style:{fontSize:9.5,color:'var(--gold)',letterSpacing:'.1em'}},
            `+${xp} XP POR ESTA LEITURA`)))));
};

/* Confete sutil de celebração */
const soltarConfete = () => {
  const cores=['var(--pink)','var(--gold)','var(--mint)','var(--violet)'];
  for(let i=0;i<28;i++){
    const el=document.createElement('i');
    el.className='conf';
    const ang=(Math.PI*2*i)/28 + Math.random()*.35;
    const dist=110+Math.random()*160;
    el.style.setProperty('--cx',`${Math.cos(ang)*dist}px`);
    el.style.setProperty('--cy',`${Math.sin(ang)*dist+80}px`);
    el.style.setProperty('--cr',`${Math.random()*720-360}deg`);
    el.style.background=cores[i%4];
    el.style.animationDelay=(Math.random()*150)+'ms';
    document.body.appendChild(el);
    setTimeout(()=>el.remove(),1800);
  }
};

/* Cabeçalho de seção editorial */
const SecHead = ({t, acao, onAcao, cor}) =>
  h('div',{style:{display:'flex',alignItems:'center',gap:12,margin:'30px 0 14px'}},
    h('span',{className:'mono',style:{fontSize:9.5,fontWeight:700,letterSpacing:'.17em',
      textTransform:'uppercase',color:cor?CORES[cor]:'var(--ink-3)'}},t),
    h('span',{style:{flex:1,height:1,background:'var(--line-2)'}}),
    acao && h('button',{onClick:onAcao,style:{display:'flex',alignItems:'center',gap:4,
      fontSize:12,fontWeight:600,color:'var(--pink)'}},acao,h(Icon,{n:'chevR',s:13})));

/* ═══════════════════════════════════════════════════════════
   MOTOR GLOBAL DE REVELAÇÃO POR SCROLL
   Vale para TODAS as abas. Qualquer bloco de primeiro nível de
   uma tela — e qualquer elemento marcado como .rise — surge ao
   entrar no campo de visão, com um leve escalonamento entre
   irmãos para o feed não subir de uma vez só.
═══════════════════════════════════════════════════════════ */
const SEM_REVELAR = 'rv rv-l rv-s rv-3d rv-r cel-veu chat-base chat-wrap ob-veu led-fita ripple'.split(' ');

const OBS_SCROLL = typeof IntersectionObserver !== 'undefined'
  ? new IntersectionObserver(entradas => {
      entradas.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('in');
        else if (e.boundingClientRect.top > 0) e.target.classList.remove('in');
      });
    }, {rootMargin: '0px 0px -6% 0px', threshold: 0.03})
  : null;

const podeRevelar = el => {
  if (el.nodeType !== 1) return false;
  if (el.dataset.rvAuto) return false;
  if (el.classList.contains('rise')) return true;
  for (const c of SEM_REVELAR) if (el.classList.contains(c)) return false;
  const pos = getComputedStyle(el).position;
  if (pos === 'fixed' || pos === 'sticky') return false;
  const r = el.getBoundingClientRect();
  return r.height > 12;                    /* ignora espaçadores */
};

const varrerRevelacao = () => {
  if (!OBS_SCROLL) return;
  const raiz = document.getElementById('root');
  if (!raiz) return;
  raiz.querySelectorAll('.screen-anim').forEach(tela => {
    let n = 0;
    Array.from(tela.children).forEach(el => {
      if (!podeRevelar(el)) return;
      el.dataset.rvAuto = '1';
      if (!el.classList.contains('rise')) el.classList.add('rv-auto');
      if (!el.style.transitionDelay) el.style.transitionDelay = Math.min(n, 5) * 0.055 + 's';
      n++;
      OBS_SCROLL.observe(el);
    });
  });
  /* blocos internos que já vinham marcados como .rise */
  raiz.querySelectorAll('.rise:not([data-rv-auto])').forEach(el => {
    el.dataset.rvAuto = '1';
    OBS_SCROLL.observe(el);
  });
};

let _agendado = 0;
const agendarVarredura = () => {
  cancelAnimationFrame(_agendado);
  _agendado = requestAnimationFrame(() => requestAnimationFrame(varrerRevelacao));
};

if (typeof MutationObserver !== 'undefined') {
  new MutationObserver(agendarVarredura)
    .observe(document.documentElement, {childList: true, subtree: true});
}
