/* ═══════════════════════════════════════════════════════════
   FOTOGRAFIA SINTÉTICA — silhuetas femininas + atmosfera
   Cada cena é composta: luz volumétrica + silhueta + grão + profundidade
   Substituível por foto real: basta trocar `bg` por url(...)
═══════════════════════════════════════════════════════════ */

/* Silhuetas femininas em pose — paths desenhados à mão */
const POSES = {
  /* Todas as silhuetas são corpos preenchidos — nunca bonecos de palito */
  despertar:'M41.8 13.2a8.2 9.2 0 1 1 16.4 0 8.2 9.2 0 1 1-16.4 0zM50 21.4c-7 0-11 3.6-12 8.6-1 5 3 9 4.5 14 1.5 5-4.5 10-5.5 16-1 6 .4 12 1 18l1.6 23c.2 2.6 2 4 4.2 4s3.8-1.4 4-4l1.2-29h2l1.2 29c.2 2.6 1.8 4 4 4s4-1.4 4.2-4l1.6-23c.6-6 2-12 1-18-1-6-7-11-5.5-16 1.5-5 5.5-9 4.5-14-1-5-5-8.6-12-8.6zM39 27c-6.6-.6-14-4-21-8.6-2.2-1.4-4.4.8-2.8 2.8 4.6 5.6 14 11 23 12.6zM61 27c6.6-.6 14-4 21-8.6 2.2-1.4 4.4.8 2.8 2.8-4.6 5.6-14 11-23 12.6z',
  forca:'M41.8 13.2a8.2 9.2 0 1 1 16.4 0 8.2 9.2 0 1 1-16.4 0zM50 21.4c-7 0-11 3.6-12 8.6-1 5 3 9 4.5 14 1.5 5-4.5 10-5.5 16-1 6 .4 12 1 18l1.6 23c.2 2.6 2 4 4.2 4s3.8-1.4 4-4l1.2-29h2l1.2 29c.2 2.6 1.8 4 4 4s4-1.4 4.2-4l1.6-23c.6-6 2-12 1-18-1-6-7-11-5.5-16 1.5-5 5.5-9 4.5-14-1-5-5-8.6-12-8.6zM39.2 26.6c-5 3-7.2 11-8.2 19.2-.6 5-1 10-.4 14 .2 2 2.8 2 3 0 .6-5 1.4-10 2.4-15 1-5 2.6-12 4.6-16zM60.8 26.6c5 3 7.2 11 8.2 19.2.6 5 1 10 .4 14-.2 2-2.8 2-3 0-.6-5-1.4-10-2.4-15-1-5-2.6-12-4.6-16z',
  caminhada:'M41.8 13.2a8.2 9.2 0 1 1 16.4 0 8.2 9.2 0 1 1-16.4 0zM50 21.4c-7 0-11 3.6-12 8.6-1 5 3 9 4.5 14 1.5 5-4.5 10-5.5 16-1 6 1 11 2 17l4 22c.6 2.6 2.4 3.8 4.6 3.4 2.2-.4 3.4-2 3-4.6l-3.4-27 5-14 3 15 6 24c.8 2.6 2.6 3.6 4.6 3 2-.6 3-2.4 2.4-5l-6.4-25c-1-6 .6-11 .6-17 0-6-6-11-4.5-16 1.5-5 5.5-9 4.5-14-1-5-5-8.6-12-8.6zM39.2 26.6c-5 3-7.2 11-8.2 19.2-.6 5-1 10-.4 14 .2 2 2.8 2 3 0 .6-5 1.4-10 2.4-15 1-5 2.6-12 4.6-16zM60.8 26.6c5 3 7.2 11 8.2 19.2.6 5 1 10 .4 14-.2 2-2.8 2-3 0-.6-5-1.4-10-2.4-15-1-5-2.6-12-4.6-16z',
  calma:'M41.8 18a8.2 9.2 0 1 1 16.4 0 8.2 9.2 0 1 1-16.4 0zM50 26c-7 0-11 3.6-12 8.6-1 5 3 9 4.5 14 1.4 4.6-2.6 8.6-4.4 12.4h23.8c-1.8-3.8-5.8-7.8-4.4-12.4 1.5-5 5.5-9 4.5-14-1-5-5-8.6-12-8.6zM26 63c6.6-4.4 16-6 24-6s17.4 1.6 24 6c4.6 3 4 9.4-2 11.4-9 3-37 3-46 0-6-2-6.6-8.4 0-11.4zM38.6 31.6c-5.6 3.6-8.6 12.6-9.6 21.6-.4 3.2 3.4 3.8 4 .6 1.6-8.4 3.6-15.6 7.6-19.6zM61.4 31.6c5.6 3.6 8.6 12.6 9.6 21.6.4 3.2-3.4 3.8-4 .6-1.6-8.4-3.6-15.6-7.6-19.6z',
  vitoria:'M41.8 13.2a8.2 9.2 0 1 1 16.4 0 8.2 9.2 0 1 1-16.4 0zM50 21.4c-7 0-11 3.6-12 8.6-1 5 3 9 4.5 14 1.5 5-4.5 10-5.5 16-1 6 .4 12 1 18l1.6 23c.2 2.6 2 4 4.2 4s3.8-1.4 4-4l1.2-29h2l1.2 29c.2 2.6 1.8 4 4 4s4-1.4 4.2-4l1.6-23c.6-6 2-12 1-18-1-6-7-11-5.5-16 1.5-5 5.5-9 4.5-14-1-5-5-8.6-12-8.6zM40.4 25.6c-6-2-12-10-15-18.4-1-2.6 1.2-4.2 3-3 3.2 2.2 8.2 10 13.8 16zM59.6 25.6c6-2 12-10 15-18.4 1-2.6-1.2-4.2-3-3-3.2 2.2-8.2 10-13.8 16z',
  sono:'M18.4 63.4a9.6 9.6 0 1 1 19.2 0 9.6 9.6 0 1 1-19.2 0zM20.6 58.4c0-6.6 3.6-10.6 8.4-10.6 4.6 0 7.6 3.2 8.4 8-2.6-2.4-5.4-3-8.6-2.4-3 .6-6.4 2.6-8.2 5zM37 60c8-3.6 20-4.6 32-4 10 .6 18 3.4 18 8.4 0 5.4-8 8.6-19 9-12 .4-24-.6-31-4.4zM56 71.6c6 2.6 12 6.4 15.4 11.4 1.6 2.4-1.4 4.6-3.4 2.6-4-4-9-7.4-14.4-9.6z',
};

/* Cenas: gradiente + pose + acentos. Uma por chave/tema. */
const CENAS = {
  linfa:     { pose:'calma',     g1:'#122b2f', g2:'#1f6455', g3:'#0d0710', ac:'#4ADE9B', luz:'22% 28%' },
  insulina:  { pose:'caminhada', g1:'#33102a', g2:'#8a2154', g3:'#120610', ac:'#FF2E7E', luz:'70% 24%' },
  cortisol:  { pose:'sono',      g1:'#1e1240', g2:'#4a2483', g3:'#0c0718', ac:'#A855F7', luz:'50% 18%' },
  transverso:{ pose:'forca',     g1:'#2f1730', g2:'#7a4260', g3:'#120610', ac:'#F5C97B', luz:'30% 22%' },
  lipase:    { pose:'forca',     g1:'#361325', g2:'#8a3446', g3:'#130711', ac:'#FF7A5C', luz:'72% 26%' },
  leptina:   { pose:'sono',      g1:'#101f3c', g2:'#265a86', g3:'#0a0a16', ac:'#38BDF8', luz:'40% 20%' },
  identidade:{ pose:'vitoria',   g1:'#340a34', g2:'#7c2472', g3:'#130718', ac:'#E879F9', luz:'50% 16%' },
  medida:    { pose:'despertar', g1:'#42103a', g2:'#8f2069', g3:'#160818', ac:'#FF6BA3', luz:'50% 20%' },
};

/* ─── Componente de cena fotográfica ─── */
const FotoCena = ({ cena='linfa', h:alt=340, children, zoom=1, pose:poseOverride, style,
  silX='50%', silOp=1, tint }) => {
  const c = CENAS[cena] || CENAS.linfa;
  const poseD = POSES[poseOverride || c.pose];
  return h('div',{style:{position:'relative',height:alt,overflow:'hidden',...style}},
    /* base */
    h('div',{style:{position:'absolute',inset:0,
      background:`linear-gradient(168deg, ${c.g1} 0%, ${c.g2} 46%, ${c.g3} 100%)`}}),
    /* luz volumétrica principal */
    h('div',{style:{position:'absolute',inset:0,
      background:`radial-gradient(ellipse 76% 58% at ${c.luz}, ${c.ac}55, transparent 64%)`}}),
    /* luz secundária fria (contra-luz) */
    h('div',{style:{position:'absolute',inset:0,
      background:'radial-gradient(ellipse 60% 44% at 82% 74%, rgba(255,255,255,.13), transparent 62%)'}}),
    /* raios de luz em diagonal */
    h('div',{style:{position:'absolute',inset:0,opacity:.5,
      background:`linear-gradient(102deg, transparent 24%, ${c.ac}22 38%, transparent 46%,
        transparent 58%, rgba(255,255,255,.07) 68%, transparent 76%)`}}),

    /* SILHUETA FEMININA */
    h('svg',{viewBox:'0 0 100 105',preserveAspectRatio:'xMidYMax meet',
      style:{position:'absolute',left:silX,bottom:'-2%',height:`${72*zoom}%`,
        transform:'translateX(-50%)',overflow:'visible',opacity:silOp}},
      h('defs',null,
        h('linearGradient',{id:'silG-'+cena,x1:'0',y1:'0',x2:'0',y2:'1'},
          h('stop',{offset:'0',stopColor:'rgba(0,0,0,.68)'}),
          h('stop',{offset:'1',stopColor:'rgba(0,0,0,.94)'})),
        h('filter',{id:'silRim-'+cena,x:'-40%',y:'-40%',width:'180%',height:'180%'},
          h('feDropShadow',{dx:0,dy:0,stdDeviation:'1.6',floodColor:c.ac,floodOpacity:'.85'}))),
      /* halo atrás da silhueta */
      h('ellipse',{cx:50,cy:52,rx:34,ry:46,fill:c.ac,opacity:.16,
        style:{filter:'blur(14px)'}}),
      /* corpo */
      h('path',{d:poseD,fill:`url(#silG-${cena})`,filter:`url(#silRim-${cena})`})),

    /* neblina baixa */
    h('div',{style:{position:'absolute',left:0,right:0,bottom:0,height:'34%',
      background:`linear-gradient(180deg, transparent, ${c.g3}dd 62%, ${c.g3} 100%)`}}),
    /* grão */
    h('div',{style:{position:'absolute',inset:0,opacity:.09,mixBlendMode:'overlay',
      backgroundImage:"url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3'/></filter><rect width='180' height='180' filter='url(%23f)'/></svg>\")"}}),
    /* tint opcional — harmoniza a cena com a identidade do app */
    tint && h('div',{style:{position:'absolute',inset:0,background:tint}}),
    /* vinheta */
    h('div',{style:{position:'absolute',inset:0,
      background:'radial-gradient(ellipse 100% 80% at 50% 45%, transparent 42%, rgba(0,0,0,.5) 100%)'}}),
    children);
};

/* ─── Retrato de avatar (foto de perfil sintética) ─── */
const Avatar = ({ size=44, ring, onClick, style }) =>
  h('button',{onClick,style:{width:size,height:size,borderRadius:'50%',flexShrink:0,
    position:'relative',overflow:'hidden',padding:0,
    border:ring?`2px solid ${ring}`:'2px solid rgba(255,255,255,.22)',
    boxShadow:ring?`0 0 14px ${ring}66`:'none',...style}},
    h('div',{style:{position:'absolute',inset:0,
      background:'linear-gradient(160deg,#F9A8C9 0%,#E0709F 40%,#7C3AC4 100%)'}}),
    h('svg',{viewBox:'0 0 40 40',style:{position:'absolute',inset:0,width:'100%',height:'100%'}},
      /* cabelo atrás */
      h('path',{d:'M8 22c0-9 5-15 12-15s12 6 12 15c0 4-1 7-2 9H10c-1-2-2-5-2-9z',
        fill:'rgba(40,12,26,.85)'}),
      /* rosto */
      h('ellipse',{cx:20,cy:19,rx:7.4,ry:8.8,fill:'#F6D2BE'}),
      /* cabelo frente */
      h('path',{d:'M12.4 16c0-6 3.4-9.6 7.6-9.6s7.6 3.6 7.6 9.6c0-3-2.6-4.6-7.6-4.6s-7.6 1.6-7.6 4.6z',
        fill:'rgba(40,12,26,.95)'}),
      h('path',{d:'M12.6 15c-1 5-1.6 10-1 14-2-2-3-6-3-10s1.6-8 4-4zM27.4 15c1 5 1.6 10 1 14 2-2 3-6 3-10s-1.6-8-4-4z',
        fill:'rgba(40,12,26,.9)'}),
      /* traços do rosto */
      h('ellipse',{cx:17.2,cy:19.2,rx:.85,ry:1.05,fill:'rgba(40,12,26,.85)'}),
      h('ellipse',{cx:22.8,cy:19.2,rx:.85,ry:1.05,fill:'rgba(40,12,26,.85)'}),
      h('path',{d:'M15.6 16.6c.9-.7 2-.7 2.9-.2M21.5 16.4c.9-.5 2-.5 2.9.2',
        stroke:'rgba(40,12,26,.7)',strokeWidth:.7,fill:'none',strokeLinecap:'round'}),
      h('path',{d:'M18.4 23.6c1 .7 2.2.7 3.2 0',stroke:'#C4577A',strokeWidth:1.1,
        fill:'none',strokeLinecap:'round'}),
      h('ellipse',{cx:14.8,cy:21.4,rx:1.5,ry:1,fill:'rgba(233,120,150,.35)'}),
      h('ellipse',{cx:25.2,cy:21.4,rx:1.5,ry:1,fill:'rgba(233,120,150,.35)'}),
      /* pescoço + ombros */
      h('path',{d:'M17.4 26.5h5.2v3.2h-5.2z',fill:'#E7BCA6'}),
      h('path',{d:'M6 40c0-7 6-11 14-11s14 4 14 11z',fill:'rgba(30,8,20,.75)'})),
    h('div',{style:{position:'absolute',inset:0,
      background:'radial-gradient(ellipse at 32% 26%, rgba(255,255,255,.28), transparent 56%)'}}));

/* ─── Ilustração de medalha (conquistas) ─── */
const Medalha = ({ tipo='star', cor='#F5C97B', size=54, on=true }) => {
  const glifos = {
    star:'M27 12l4.2 8.6 9.4 1.4-6.8 6.6 1.6 9.4L27 33.6l-8.4 4.4 1.6-9.4L13.4 22l9.4-1.4z',
    ruler:'M38 18 20 36l-6-6L32 12z M28 16l2 2M24 20l2 2M20 24l2 2',
    flame:'M27 10s7 8 7 15a7 7 0 1 1-14 0c0-7 7-15 7-15z',
    key:'M32 16a6 6 0 1 0-4 10l-2 2-3-3-3 3-3-3-3 3-3-3 10-10a6 6 0 0 1 11-1z',
    crown:'M13 34h28l3-16-9 6-8-12-8 12-9-6z',
    heart:'M40 20a7 7 0 0 0-13-4 7 7 0 0 0-13 4c0 8 13 16 13 16s13-8 13-16z',
    mountain:'M8 38 20 18l7 11 5-7 12 16z',
    shield:'M27 8 13 13v11c0 9 14 16 14 16s14-7 14-16V13z',
    bolt:'M30 8 16 30h9l-2 14 15-22h-9z',
    moon:'M36 30a13 13 0 1 1-14-20 10 10 0 0 0 14 20z',
  };
  return h('svg',{width:size,height:size,viewBox:'0 0 54 54',
    style:{filter:on?`drop-shadow(0 3px 10px ${cor}66)`:'none',flexShrink:0}},
    h('defs',null,
      h('linearGradient',{id:'md'+tipo+cor,x1:'0',y1:'0',x2:'1',y2:'1'},
        h('stop',{offset:'0',stopColor:on?cor:'#3a2c34'}),
        h('stop',{offset:'.5',stopColor:on?'#fff':'#4a3a44',stopOpacity:on?'.55':'1'}),
        h('stop',{offset:'1',stopColor:on?cor:'#2e2229'})),
      h('radialGradient',{id:'mdg'+tipo+cor},
        h('stop',{offset:'0',stopColor:'#fff',stopOpacity:on?'.4':'.06'}),
        h('stop',{offset:'1',stopColor:'#fff',stopOpacity:'0'}))),
    /* raios atrás */
    on && Array.from({length:12},(_,i)=>
      h('rect',{key:i,x:26.2,y:1,width:1.6,height:7,rx:.8,fill:cor,opacity:.32,
        transform:`rotate(${i*30} 27 27)`})),
    /* disco */
    h('circle',{cx:27,cy:27,r:19,fill:`url(#md${tipo}${cor})`}),
    h('circle',{cx:27,cy:27,r:19,fill:`url(#mdg${tipo}${cor})`}),
    h('circle',{cx:27,cy:27,r:19,fill:'none',stroke:on?'rgba(255,255,255,.55)':'rgba(255,255,255,.1)',
      strokeWidth:1.2}),
    h('circle',{cx:27,cy:27,r:15.4,fill:'none',stroke:on?'rgba(0,0,0,.22)':'rgba(0,0,0,.3)',
      strokeWidth:.9}),
    /* glifo */
    h('path',{d:glifos[tipo]||glifos.star,
      fill:on?'rgba(20,8,14,.82)':'rgba(255,255,255,.16)',
      stroke:on?'rgba(255,255,255,.3)':'none',strokeWidth:.5,
      strokeLinejoin:'round'}));
};
