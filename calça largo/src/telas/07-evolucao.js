/* ═══════════════════════════════════════════════════════════
   EVOLUÇÃO — relatório + MEDALHAS retangulares impactantes
═══════════════════════════════════════════════════════════ */

const StatBox = ({ico, label, valor, un, delta, cor='pink', destaque, i=0}) =>
  h('div',{className:'rise',style:{animationDelay:`${.08+i*.06}s`,
    background: destaque? `linear-gradient(150deg, ${HEX[cor]}, ${HEX2[cor]})` : 'var(--surf)',
    border:`1px solid ${destaque?'transparent':'var(--line)'}`,
    borderRadius:'var(--r-md)',padding:14,position:'relative',overflow:'hidden',
    boxShadow: destaque? `0 8px 26px ${HEX[cor]}55` : 'none'}},
    destaque && h('div',{style:{position:'absolute',top:-20,right:-20,width:80,height:80,
      borderRadius:'50%',background:'var(--ov-3)',filter:'blur(18px)'}}),
    h('div',{style:{position:'relative'}},
      h('div',{style:{display:'flex',alignItems:'center',gap:6,marginBottom:10}},
        h(Icon,{n:ico,s:14,c:destaque?'var(--ink)':CORES[cor]}),
        h('span',{className:'mono',style:{fontSize:8,letterSpacing:'.11em',
          textTransform:'uppercase',
          color:destaque?'var(--ink)':'var(--ink-4)'}},label)),
      h('div',{style:{display:'flex',alignItems:'baseline',gap:3}},
        h('span',{style:{fontFamily:'var(--f-display)',fontSize:25,fontWeight:600,
          letterSpacing:'-.04em',lineHeight:1,color:destaque?'#fff':'var(--ink)'}},valor),
        un&&h('span',{className:'mono',style:{fontSize:10,
          color:destaque?'var(--ink-2)':'var(--ink-3)'}},un)),
      delta&&h('div',{className:'mono',style:{fontSize:9,marginTop:5,fontWeight:600,
        color:destaque?'var(--ink)':CORES[cor]}},delta)));

const HistoryStrip = ({s, set}) => {
  const ini=Math.max(1,Math.min(s.diaAtual-3,15));
  const dias=Array.from({length:7},(_,i)=>ini+i).filter(d=>d<=21);
  return h('div',{className:'rise d1',style:{marginBottom:16}},
    h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',
      marginBottom:12}},
      h('div',{style:{fontSize:13.5,fontWeight:700,letterSpacing:'-.015em'}},'Histórico'),
      h('div',{style:{display:'flex',alignItems:'center',gap:10}},
        h('button',{onClick:()=>set(p=>({...p,diaAtual:Math.max(1,p.diaAtual-7)})),
          style:{width:25,height:25,borderRadius:'50%',background:'var(--ov-1)',
            display:'flex',alignItems:'center',justifyContent:'center'}},
          h(Icon,{n:'chevL',s:13,c:'var(--ink-2)'})),
        h('span',{className:'mono',style:{fontSize:10.5,color:'var(--ink-2)',fontWeight:600,
          minWidth:62,textAlign:'center'}},`Semana ${Math.ceil(s.diaAtual/7)}`),
        h('button',{onClick:()=>set(p=>({...p,diaAtual:Math.min(21,p.diaAtual+7)})),
          style:{width:25,height:25,borderRadius:'50%',background:'var(--ov-1)',
            display:'flex',alignItems:'center',justifyContent:'center'}},
          h(Icon,{n:'chevR',s:13,c:'var(--ink-2)'})))),
    h('div',{style:{display:'flex',justifyContent:'space-between',gap:5}},
      dias.map(d=>{
        const done=s.diasFeitos.includes(d), atual=d===s.diaAtual;
        return h('button',{key:d,onClick:()=>set(p=>({...p,diaAtual:d})),
          style:{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:6}},
          h('span',{className:'mono',style:{fontSize:8.5,
            color:atual?'var(--pink)':'var(--ink-4)',fontWeight:atual?700:500}},
            DIAS_SEM[(d+1)%7]),
          h('div',{style:{width:31,height:31,borderRadius:'50%',
            background:atual?'#fff':done?'var(--mint-soft)':'var(--ov-1)',
            border:done&&!atual?'1px solid rgba(74,222,155,.35)':'1px solid transparent',
            display:'flex',alignItems:'center',justifyContent:'center',
            fontFamily:'var(--f-display)',fontWeight:700,fontSize:12,
            color:atual?'#0B0508':done?'var(--mint)':'var(--ink-4)',
            transition:'all .3s cubic-bezier(.34,1.56,.64,1)'}},d));
      })));
};

const GraficoCintura = ({s}) => {
  const meds=s.medidas, pts=meds.map(m=>m.cintura);
  const atual=pts[pts.length-1]||0, ini=pts[0]||0, delta=atual-ini;
  const W=300,H=118;
  const mn=Math.min(...pts)-.6, mx=Math.max(...pts)+.6, rgg=(mx-mn)||1;
  const X=i=>28+(i/Math.max(1,pts.length-1))*(W-40);
  const Y=v=>14+(1-(v-mn)/rgg)*(H-40);
  let d=`M${X(0)},${Y(pts[0])}`;
  for(let i=0;i<pts.length-1;i++){ const x0=X(i),y0=Y(pts[i]),x1=X(i+1),y1=Y(pts[i+1]),cx=(x0+x1)/2;
    d+=` C${cx},${y0} ${cx},${y1} ${x1},${y1}`; }
  return h('div',{className:'rise d3 card',style:{marginBottom:12}},
    h('div',{style:{display:'flex',alignItems:'flex-start',justifyContent:'space-between',
      marginBottom:16}},
      h('div',null,
        h('div',{className:'eyebrow',style:{marginBottom:5}},'CIRCUNFERÊNCIA DA CINTURA'),
        h('div',{style:{display:'flex',alignItems:'baseline',gap:5}},
          h('span',{style:{fontFamily:'var(--f-display)',fontSize:38,fontWeight:600,
            letterSpacing:'-.045em',lineHeight:1}},atual.toFixed(1)),
          h('span',{className:'mono',style:{fontSize:13,color:'var(--ink-3)'}},'cm')),
        h('div',{style:{display:'inline-flex',alignItems:'center',gap:4,marginTop:7,
          padding:'4px 10px',borderRadius:'var(--r-full)',
          background:delta<0?'var(--mint-soft)':'var(--coral-soft)',
          color:delta<0?'var(--mint)':'var(--coral)'}},
          h(Icon,{n:delta<0?'arrowD':'arrowU',s:11,w:3}),
          h('span',{className:'mono',style:{fontSize:9.5,fontWeight:700}},
            `${Math.abs(delta).toFixed(1)} cm desde o Dia 1`))),
      h('button',{style:{display:'flex',alignItems:'center',gap:5,padding:'6px 11px',
        borderRadius:'var(--r-full)',background:'var(--ov-1)',
        border:'1px solid var(--line)'}},
        h('span',{style:{fontSize:10.5,fontWeight:600,color:'var(--ink-2)'}},'Registrar'),
        h(Icon,{n:'plus',s:12,c:'var(--pink)'}))),
    h('svg',{width:'100%',height:H,viewBox:`0 0 ${W} ${H}`,style:{overflow:'visible'}},
      h('defs',null,h('linearGradient',{id:'gc',x1:'0',y1:'0',x2:'0',y2:'1'},
        h('stop',{offset:'0',stopColor:'var(--pink)',stopOpacity:'.35'}),
        h('stop',{offset:'1',stopColor:'var(--pink)',stopOpacity:'0'}))),
      [0,.33,.66,1].map((ff,i)=>{ const y=14+ff*(H-40), v=mx-ff*rgg;
        return h('g',{key:i},
          h('line',{x1:26,y1:y,x2:W-8,y2:y,stroke:'var(--ov-1)',strokeWidth:1,
            strokeDasharray:'3 5'}),
          h('text',{x:0,y:y+3.5,fill:'var(--ink-4)',fontSize:8.5,
            fontFamily:'var(--f-mono)'},v.toFixed(1))); }),
      h('path',{d:`${d} L${X(pts.length-1)},${H-22} L${X(0)},${H-22} Z`,fill:'url(#gc)'}),
      h('path',{d,fill:'none',stroke:'var(--pink)',strokeWidth:2.6,strokeLinecap:'round',
        style:{filter:'drop-shadow(0 0 8px var(--pink-glow))'}}),
      pts.map((p,i)=>h('g',{key:i},
        i===pts.length-1&&h('circle',{cx:X(i),cy:Y(p),r:9,fill:'var(--pink)',opacity:.18}),
        h('circle',{cx:X(i),cy:Y(p),r:i===pts.length-1?5:3.4,
          fill:i===pts.length-1?'var(--pink)':'#fff',
          stroke:i===pts.length-1?'#fff':'var(--pink)',strokeWidth:i===pts.length-1?2:1.6,
          style:i===pts.length-1?{filter:'drop-shadow(0 0 8px var(--pink))'}:undefined}))),
      meds.map((m,i)=>h('text',{key:i,x:X(i),y:H-6,fill:'var(--ink-4)',fontSize:8.5,
        textAnchor:'middle',fontFamily:'var(--f-mono)'},`D${m.dia}`))));
};

/* ═══ MEDALHA — card retangular horizontal impactante ═══ */
const MedalhaCard = ({m, on, i}) => {
  const r=RARIDADE[m.raro];
  return h('div',{className:'rise',style:{animationDelay:`${.06+i*.05}s`,
    position:'relative',overflow:'hidden',marginBottom:11,
    borderRadius:'var(--r-lg)',
    background: on
      ? `linear-gradient(112deg, ${m.cor}22 0%, var(--surf-2) 46%, var(--surf) 100%)`
      : 'var(--ov-1)',
    border:`1px solid ${on? m.cor+'44' : 'var(--line)'}`,
    boxShadow: on? `0 6px 26px ${m.cor}22, inset 0 1px 0 var(--ov-1)` : 'none'}},

    /* brilho difuso atrás da medalha */
    on && h('div',{style:{position:'absolute',left:-24,top:-24,width:150,height:150,
      borderRadius:'50%',background:`radial-gradient(circle, ${m.cor}3a, transparent 68%)`,
      filter:'blur(26px)',pointerEvents:'none'}}),
    /* faixa diagonal de luz */
    on && h('div',{style:{position:'absolute',inset:0,pointerEvents:'none',
      background:`linear-gradient(104deg, transparent 34%, ${m.cor}12 46%, transparent 56%)`}}),

    h('div',{style:{position:'relative',display:'flex',alignItems:'center',gap:15,
      padding:'15px 16px'}},

      /* MEDALHA */
      h('div',{style:{position:'relative',flexShrink:0}},
        h(Medalha,{tipo:m.glifo,cor:m.cor,size:60,on}),
        on && m.raro==='LENDÁRIO' && h('div',{style:{position:'absolute',inset:-6,
          borderRadius:'50%',border:`1.5px solid ${m.cor}`,opacity:.4,
          animation:'aiPulse 2.6s infinite'}})),

      /* TEXTO */
      h('div',{style:{flex:1,minWidth:0}},
        h('div',{style:{display:'flex',alignItems:'center',gap:7,marginBottom:5}},
          h('span',{style:{padding:'2.5px 8px',borderRadius:'var(--r-full)',
            background:on?r.bg:'var(--ov-1)',
            border:`1px solid ${on?r.c+'44':'var(--line)'}`,
            fontFamily:'var(--f-mono)',fontSize:7.5,fontWeight:700,letterSpacing:'.13em',
            color:on?r.c:'var(--ink-4)'}}, m.raro),
          !on && h(Icon,{n:'lock',s:11,c:'var(--ink-4)'})),
        h('div',{style:{fontFamily:'var(--f-display)',fontSize:17,fontWeight:600,
          letterSpacing:'-.028em',lineHeight:1.08,marginBottom:3,
          color:on?'var(--ink)':'var(--ink-4)'}}, m.nome),
        h('div',{style:{fontSize:11,fontWeight:600,marginBottom:5,
          color:on?m.cor:'var(--ink-4)'}}, m.sub),
        h('div',{style:{fontSize:10.5,lineHeight:1.42,
          color:on?'var(--ink-3)':'rgba(138,110,124,.5)'}}, on? m.det : 'Ainda bloqueada')),

      /* selo de conquistada */
      on && h('div',{style:{flexShrink:0,width:26,height:26,borderRadius:'50%',
        background:m.cor,display:'flex',alignItems:'center',justifyContent:'center',
        boxShadow:`0 3px 12px ${m.cor}88`}},
        h(Icon,{n:'check',s:14,c:'#140810',w:3.4}))));
};

const Medalhas = ({s}) => {
  const ctx={...s, perdaCintura: s.medidas.length>=2
    ? s.medidas[0].cintura-s.medidas[s.medidas.length-1].cintura : 0};
  const desb=MEDALHAS.filter(m=>m.cond(ctx));
  const [ver,setVer]=useState('todas');
  const lista = ver==='todas'? MEDALHAS
    : ver==='conquistadas'? desb : MEDALHAS.filter(m=>!desb.includes(m));

  return h('div',{style:{marginTop:8}},
    /* banner de conquistas */
    h('div',{className:'rise',style:{position:'relative',overflow:'hidden',
      borderRadius:'var(--r-lg)',marginBottom:16,padding:18,
      background:'linear-gradient(135deg, rgba(245,201,123,.16), rgba(255,46,126,.07) 50%, transparent)',
      border:'1px solid var(--line-gold)'}},
      h('div',{style:{position:'absolute',top:-40,right:-30,width:170,height:170,
        borderRadius:'50%',background:'radial-gradient(circle, var(--gold-glow), transparent 68%)',
        filter:'blur(32px)'}}),
      h('div',{style:{position:'relative',display:'flex',alignItems:'center',gap:15}},
        h(Medalha,{tipo:'crown',cor:'#F5C97B',size:62,on:desb.length>0}),
        h('div',{style:{flex:1}},
          h('div',{className:'eyebrow eyebrow-gold',style:{marginBottom:5}},'SUAS CONQUISTAS'),
          h('div',{style:{display:'flex',alignItems:'baseline',gap:6,marginBottom:8}},
            h('span',{style:{fontFamily:'var(--f-display)',fontSize:32,fontWeight:600,
              letterSpacing:'-.045em',lineHeight:1,color:'var(--gold)'}},desb.length),
            h('span',{className:'mono',style:{fontSize:13,color:'var(--ink-3)'}},
              `de ${MEDALHAS.length} medalhas`)),
          h(Bar,{v:desb.length/MEDALHAS.length,cor:'gold',h:5})))),

    /* filtros */
    h('div',{style:{display:'flex',gap:7,marginBottom:16}},
      [{id:'todas',l:'Todas',n:MEDALHAS.length},
       {id:'conquistadas',l:'Conquistadas',n:desb.length},
       {id:'bloqueadas',l:'Bloqueadas',n:MEDALHAS.length-desb.length}].map(t=>
        h('button',{key:t.id,onClick:()=>setVer(t.id),
          style:{flex:1,padding:'9px 5px',borderRadius:'var(--r-md)',
            background:ver===t.id?'var(--gold-soft)':'var(--surf)',
            border:`1px solid ${ver===t.id?'var(--line-gold)':'var(--line)'}`,
            transition:'all .28s'}},
          h('div',{style:{fontSize:11.5,fontWeight:700,
            color:ver===t.id?'var(--gold)':'var(--ink-3)'}},t.l),
          h('div',{className:'mono',style:{fontSize:8.5,marginTop:2,
            color:ver===t.id?'var(--gold)':'var(--ink-4)',opacity:.75}},t.n)))),

    lista.map((m,i)=>h(MedalhaCard,{key:m.id,m,on:desb.includes(m),i})),
    lista.length===0 && h('div',{style:{padding:'40px 20px',textAlign:'center'}},
      h(Icon,{n:'trophy',s:34,c:'var(--ink-4)',style:{margin:'0 auto 12px'}}),
      h('div',{style:{fontSize:13,color:'var(--ink-3)'}},'Nenhuma medalha nesta categoria')));
};

/* ═══ TELA EVOLUÇÃO ═══ */
/* ═══════════════════════════════════════════════════════════
   BLOCO DE EVOLUÇÃO — vive dentro da aba Jornada
═══════════════════════════════════════════════════════════ */
const BlocoEvolucao = ({s, set, go}) => {
  const [aba,setAba]=useState('numeros');
  const meds=s.medidas, atual=meds[meds.length-1]||{cintura:0,quadril:1,peso:0};
  const ini=meds[0]||atual;
  const dC=atual.cintura-ini.cintura, cq=atual.cintura/atual.quadril;
  const feitos=s.diasFeitos.length;
  const cons=Math.round((feitos/Math.max(1,s.diaAtual-1))*100);

  return h('div',null,
    /* abas números / medalhas */
    h(Reveal,{tipo:'rv-s'},
      h('div',{style:{display:'flex',gap:7,marginBottom:16}},
        [{id:'numeros',l:'Números',i:'chart'},{id:'medalhas',l:'Medalhas',i:'trophy'}].map(t=>
          h('button',{key:t.id,onClick:()=>setAba(t.id),className:'press',
            style:{flex:1,padding:'11px 6px',borderRadius:'var(--r-md)',
              display:'flex',alignItems:'center',justifyContent:'center',gap:7,
              background:aba===t.id?'var(--pink-soft)':'var(--surf)',
              border:`1px solid ${aba===t.id?'var(--line-pink)':'var(--line)'}`,
              transition:'all .28s cubic-bezier(.34,1.56,.64,1)'}},
            h(Icon,{n:t.i,s:15,c:aba===t.id?'var(--pink)':'var(--ink-3)'}),
            h('span',{style:{fontSize:12.5,fontWeight:700,
              color:aba===t.id?'var(--pink)':'var(--ink-3)'}},t.l))))),

    aba==='numeros' && h(React.Fragment,null,
      h(Reveal,{tipo:'rv'}, h(HistoryStrip,{s,set})),
      h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:14}},
        h(StatBox,{ico:'ruler',label:'CINTURA',valor:atual.cintura.toFixed(1),un:'cm',
          delta:`${dC<0?'−':'+'}${Math.abs(dC).toFixed(1)} cm`,cor:'pink',destaque:true,i:0}),
        h(StatBox,{ico:'scale',label:'PESO',valor:atual.peso.toFixed(1),un:'kg',
          delta:`${(atual.peso-ini.peso).toFixed(1)} kg`,cor:'gold',i:1}),
        h(StatBox,{ico:'clock',label:'TEMPO INVESTIDO',valor:Math.floor(feitos*22/60),un:'h',
          delta:`${feitos} dias de método`,cor:'violet',i:2}),
        h(StatBox,{ico:'flame',label:'CONSTÂNCIA',valor:cons,un:'%',
          delta:`streak de ${s.streak} dias`,cor:'mint',i:3})),
      h(Reveal,{tipo:'rv'}, h(GraficoCintura,{s})),
      h(Reveal,{tipo:'rv-s'},
        h('div',{className:'card',style:{marginBottom:12}},
          h('div',{style:{display:'flex',alignItems:'center',gap:13}},
            h(Anel,{v:clamp((.95-cq)/.2,0,1),size:62,sw:6,
              cor:cq<=.85?'var(--mint)':'var(--coral)'},
              h('span',{style:{fontFamily:'var(--f-display)',fontSize:16,fontWeight:600,
                letterSpacing:'-.03em'}},cq.toFixed(2))),
            h('div',{style:{flex:1}},
              h('div',{className:'eyebrow',style:{marginBottom:4}},'RAZÃO CINTURA / QUADRIL'),
              h('div',{style:{fontSize:13,fontWeight:700,letterSpacing:'-.015em',
                color:cq<=.85?'var(--mint)':'var(--ink)'}},
                cq<=.85?'Dentro do alvo saudável':'Acima do alvo — continue'),
              h('div',{style:{fontSize:11,color:'var(--ink-3)',marginTop:2,lineHeight:1.4}},
                'Alvo para mulheres: abaixo de 0,85. É o marcador clínico mais confiável de gordura visceral.'))))),
      h(Reveal,{tipo:'rv-s'},
        h('button',{onClick:()=>go('checkin'),className:'press lift',
          style:{width:'100%',textAlign:'left',marginBottom:14,
            background:'linear-gradient(135deg, rgba(168,85,247,.13), transparent)',
            border:'1px solid rgba(168,85,247,.28)',borderRadius:'var(--r-md)',
            padding:15,display:'flex',alignItems:'center',gap:12,'--led':HEX.violet}},
          h('div',{style:{width:40,height:40,borderRadius:13,flexShrink:0,
            background:'var(--violet-soft)',display:'flex',alignItems:'center',
            justifyContent:'center'}},h(Icon,{n:'moon',s:19,c:'var(--violet)'})),
          h('div',{style:{flex:1}},
            h('div',{style:{fontSize:13,fontWeight:700,letterSpacing:'-.015em'}},
              'Check-in noturno'),
            h('div',{style:{fontSize:11,color:'var(--ink-3)',marginTop:1}},
              '4 perguntas · 20 segundos')),
          h(Icon,{n:'chevR',s:16,c:'var(--violet)'})))),

    aba==='medalhas' && h(Medalhas,{s}));
};

/* Tela própria mantida para quem chega pelos atalhos */
const TelaEvolucao = ({s, set, go}) =>
  h('div',{className:'screen-anim',style:{padding:'6px 18px 0'}},
    h(Reveal,{tipo:'rv'},
      h('div',{style:{textAlign:'center',marginBottom:18}},
        h('div',{className:'h-display',style:{fontSize:27}},'Evolução'),
        h('div',{style:{fontSize:12,color:'var(--ink-3)',marginTop:4}},
          'O que a balança nunca conseguiu te contar'))),
    h(BlocoEvolucao,{s,set,go}),
    h('div',{style:{height:16}}));

/* ═══ CHECK-IN ═══ */
const TelaCheckin = ({s, set, go, toast}) => {
  const [fome,setFome]=useState(3),[energia,setEnergia]=useState(3);
  const [sono,setSono]=useState(7),[inchaco,setInchaco]=useState(false);
  const Escala=({label,v,set:sv,cor,baixo,alto})=>
    h('div',{style:{marginBottom:22}},
      h('div',{style:{display:'flex',justifyContent:'space-between',marginBottom:10}},
        h('span',{style:{fontSize:13.5,fontWeight:600,letterSpacing:'-.01em'}},label),
        h('span',{className:'mono',style:{fontSize:13.5,fontWeight:700,color:CORES[cor]}},v)),
      h('div',{style:{display:'flex',gap:7}},
        [1,2,3,4,5].map(n=>h('button',{key:n,onClick:()=>sv(n),
          style:{flex:1,height:42,borderRadius:12,
            background:v>=n?CORES_SOFT[cor]:'var(--ov-1)',
            border:`1px solid ${v>=n?HEX[cor]+'55':'var(--line)'}`,
            fontFamily:'var(--f-display)',fontWeight:700,fontSize:14,
            color:v>=n?CORES[cor]:'var(--ink-4)',
            transition:'all .25s cubic-bezier(.34,1.56,.64,1)'}},n))),
      h('div',{style:{display:'flex',justifyContent:'space-between',marginTop:6}},
        h('span',{style:{fontSize:10,color:'var(--ink-4)'}},baixo),
        h('span',{style:{fontSize:10,color:'var(--ink-4)'}},alto)));

  return h('div',{className:'screen-anim',style:{padding:'6px 18px 0'}},
    h('div',{style:{display:'flex',alignItems:'center',gap:12,marginBottom:22}},
      h('button',{onClick:()=>go('evolucao'),style:{width:38,height:38,borderRadius:'50%',
        background:'var(--ov-1)',display:'flex',alignItems:'center',
        justifyContent:'center'}},h(Icon,{n:'chevL',s:18})),
      h('div',null,
        h('div',{className:'h-display',style:{fontSize:22}},'Check-in noturno'),
        h('div',{style:{fontSize:11,color:'var(--ink-3)'}},`Dia ${s.diaAtual} · 20 segundos`))),
    h(Escala,{label:'Como esteve sua fome hoje?',v:fome,set:setFome,cor:'pink',
      baixo:'Controlada',alto:'Descontrolada'}),
    h(Escala,{label:'E sua energia?',v:energia,set:setEnergia,cor:'mint',
      baixo:'Exausta',alto:'Ótima'}),
    h('div',{style:{marginBottom:22}},
      h('div',{style:{display:'flex',justifyContent:'space-between',marginBottom:10}},
        h('span',{style:{fontSize:13.5,fontWeight:600}},'Quantas horas dormiu?'),
        h('span',{className:'mono',style:{fontSize:13.5,fontWeight:700,color:'var(--violet)'}},
          sono.toFixed(1),'h')),
      h('div',{style:{display:'flex',alignItems:'center',gap:13}},
        h('button',{onClick:()=>setSono(Math.max(3,sono-.5)),
          style:{width:42,height:42,borderRadius:'50%',background:'var(--ov-1)',
            border:'1px solid var(--line)',display:'flex',alignItems:'center',
            justifyContent:'center'}},h(Icon,{n:'minus',s:17})),
        h('div',{style:{flex:1}},h(Bar,{v:(sono-3)/7,h:8})),
        h('button',{onClick:()=>setSono(Math.min(10,sono+.5)),
          style:{width:42,height:42,borderRadius:'50%',background:'var(--violet-soft)',
            border:'1px solid rgba(168,85,247,.3)',display:'flex',alignItems:'center',
            justifyContent:'center'}},h(Icon,{n:'plus',s:17,c:'var(--violet)'})))),
    h('div',{style:{marginBottom:28}},
      h('div',{style:{fontSize:13.5,fontWeight:600,marginBottom:10}},
        'Sentiu a cintura inchada hoje?'),
      h('div',{style:{display:'flex',gap:9}},
        [{v:false,l:'Não, estava lisa'},{v:true,l:'Sim, inchada'}].map(o=>
          h('button',{key:String(o.v),onClick:()=>setInchaco(o.v),
            style:{flex:1,padding:'13px 10px',borderRadius:'var(--r-md)',
              background:inchaco===o.v?'var(--pink-soft)':'var(--ov-1)',
              border:`1px solid ${inchaco===o.v?'var(--line-pink)':'var(--line)'}`,
              fontSize:12.5,fontWeight:600,
              color:inchaco===o.v?'var(--pink)':'var(--ink-3)'}},o.l)))),
    h('button',{onClick:()=>{ set(p=>({...p,checkins:[...p.checkins.filter(c=>c.dia!==p.diaAtual),
        {dia:p.diaAtual,fome,energia,sono,inchaco}],xp:p.xp+20}));
        toast('Check-in registrado','+20 XP · gráficos atualizados','check'); go('evolucao'); },
      className:'btn btn-pink',style:{width:'100%',padding:17,fontSize:15}},
      h(Icon,{n:'check',s:18}),'Registrar check-in · +20 XP'),
    h('div',{style:{height:18}}));
};
