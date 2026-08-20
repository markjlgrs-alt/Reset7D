/* ═══════════════════════════════════════════════════════════
   GRÁFICOS INTERATIVOS EM 3D — cada um com uma forma própria
   1. Hexágono de equilíbrio (radar) que gira ao arrastar
   2. Cilindros em perspectiva (peso × cintura) com toque
   3. Anel volumétrico de progresso, arrastável
   4. Fita de sono/energia com scrubber
═══════════════════════════════════════════════════════════ */

/* ─── util: arraste horizontal devolvendo -1..1 ─── */
const useArraste = (inicial=0, limite=34) => {
  const [v,setV] = useState(inicial);
  const est = useRef({on:false,x0:0,v0:0});
  const inicio = e => { const x=(e.touches?e.touches[0].clientX:e.clientX);
    est.current={on:true,x0:x,v0:v}; };
  const move = e => { if(!est.current.on) return;
    const x=(e.touches?e.touches[0].clientX:e.clientX);
    setV(Math.max(-limite,Math.min(limite, est.current.v0 + (x-est.current.x0)*0.35))); };
  const fim = () => { est.current.on=false; };
  return [v, {onMouseDown:inicio,onMouseMove:move,onMouseUp:fim,onMouseLeave:fim,
              onTouchStart:inicio,onTouchMove:move,onTouchEnd:fim}, setV];
};

const CardG = ({titulo, sub, ico, cor, valor, un, delta, children, rodape, i=0}) =>
  h(Reveal,{tipo:'rv-3d',delay:i*90},
    h('div',{className:'card g-card',style:{padding:18,marginBottom:12,overflow:'hidden',
      position:'relative'}},
      h('div',{style:{position:'absolute',top:-50,right:-40,width:170,height:170,
        borderRadius:'50%',pointerEvents:'none',opacity:.4,
        background:`radial-gradient(circle, ${HEX[cor]}33, transparent 68%)`}}),
      h('div',{style:{display:'flex',alignItems:'flex-start',gap:12,marginBottom:14,
        position:'relative'}},
        h('span',{style:{width:36,height:36,borderRadius:12,flexShrink:0,
          background:CORES_SOFT[cor],display:'flex',alignItems:'center',
          justifyContent:'center'}},h(Icon,{n:ico,s:17,c:CORES[cor]})),
        h('div',{style:{flex:1,minWidth:0}},
          h('div',{style:{fontFamily:'var(--f-display)',fontSize:17,fontWeight:600,
            letterSpacing:'-.025em'}},titulo),
          h('div',{style:{fontSize:11.5,color:'var(--ink-3)',marginTop:2}},sub)),
        valor!=null && h('div',{style:{textAlign:'right'}},
          h('div',{style:{fontFamily:'var(--f-display)',fontSize:24,fontWeight:600,
            letterSpacing:'-.04em',lineHeight:1,color:CORES[cor]}},valor,
            h('span',{style:{fontSize:11,opacity:.7}},' '+un)),
          delta && h('div',{className:'mono',style:{fontSize:8,letterSpacing:'.1em',
            color:'var(--ink-4)',marginTop:3}},delta))),
      children,
      rodape && h('p',{style:{fontSize:12,lineHeight:1.55,color:'var(--ink-2)',marginTop:13,
        paddingTop:12,borderTop:'1px dashed var(--line-2)'}},rodape)));

/* ═══ 1. HEXÁGONO DE EQUILÍBRIO — radar 3D que gira no arraste ═══ */
const HexEquilibrio = ({s, i}) => {
  const [rot, bind] = useArraste(-14);
  const [sel,setSel] = useState(null);
  const chk = s.checkins[s.checkins.length-1] || {energia:3,sono:7,fome:3};
  const med = s.medidas, perda = med[0].cintura - med[med.length-1].cintura;

  const EIXOS = [
    {n:'Constância', v:Math.min(1, s.streak/21),                 d:`${s.streak} dias seguidos`,      c:'coral'},
    {n:'Cintura',    v:Math.min(1, perda/8),                     d:`${perda.toFixed(1).replace('.',',')} de 8 cm`, c:'pink'},
    {n:'Sono',       v:Math.min(1, (chk.sono||7)/9),             d:`${String(chk.sono).replace('.',',')}h por noite`, c:'violet'},
    {n:'Energia',    v:(chk.energia||3)/5,                        d:`${chk.energia} de 5`,            c:'mint'},
    {n:'Leitura',    v:Math.min(1, Object.values(s.lidos||{}).reduce((a,v)=>a+(v?v.length:0),0)/189), d:'do conteúdo lido', c:'gold'},
    {n:'Missões',    v:Math.min(1, s.diasFeitos.length/21),      d:`${s.diasFeitos.length} de 21 dias`, c:'pink'},
  ];
  const R = 78, cx = 110, cy = 104;
  const pt = (k, escala) => {
    const ang = (Math.PI*2*k)/6 - Math.PI/2;
    return [cx + Math.cos(ang)*R*escala, cy + Math.sin(ang)*R*escala*0.86];
  };
  const anel = e => EIXOS.map((_,k)=>pt(k,e).join(',')).join(' ');
  const forma = EIXOS.map((x,k)=>pt(k, Math.max(.08,x.v)).join(',')).join(' ');
  const media = EIXOS.reduce((a,x)=>a+x.v,0)/EIXOS.length;

  return h(CardG,{i,titulo:'Equilíbrio',sub:'seus seis pilares, lado a lado',ico:'layers',
    cor:'violet',valor:Math.round(media*100),un:'%',delta:'ARRASTE PARA GIRAR',
    rodape: sel!=null
      ? `${EIXOS[sel].n}: ${EIXOS[sel].d}. ${EIXOS[sel].v>=.7?'Este pilar já sustenta os outros.':'É aqui que ainda há espaço para ganhar.'}`
      : 'Toque em um vértice para ler o pilar. Arraste o hexágono para girar.'},

    h('div',{...bind,style:{perspective:'800px',cursor:'grab',touchAction:'pan-y',
      display:'flex',justifyContent:'center'}},
      h('svg',{viewBox:'0 0 220 208',style:{width:'100%',maxWidth:260,
        transform:`rotateY(${rot}deg) rotateX(${8-Math.abs(rot)*0.12}deg)`,
        transformStyle:'preserve-3d',
        transition:'transform .12s linear',
        filter:`drop-shadow(0 18px 26px rgba(0,0,0,.42))`}},
        h('defs',null,
          h('linearGradient',{id:'hexF',x1:'0',y1:'0',x2:'0',y2:'1'},
            h('stop',{offset:'0',stopColor:HEX.violet,stopOpacity:'.62'}),
            h('stop',{offset:'1',stopColor:HEX.pink,stopOpacity:'.30'}))),
        /* sombra projetada (dá volume) */
        h('polygon',{points:anel(1),fill:'none',stroke:'var(--line-2)',strokeWidth:1,
          transform:'translate(0,10)',opacity:.35}),
        /* anéis */
        [1,.75,.5,.25].map((e,k)=>
          h('polygon',{key:k,points:anel(e),fill:'none',stroke:'var(--line)',strokeWidth:1})),
        /* raios */
        EIXOS.map((_,k)=>{const [x,y]=pt(k,1);
          return h('line',{key:k,x1:cx,y1:cy,x2:x,y2:y,stroke:'var(--line)',strokeWidth:1});}),
        /* área preenchida */
        h('polygon',{points:forma,fill:'url(#hexF)',stroke:HEX.violet,strokeWidth:2,
          strokeLinejoin:'round',
          style:{filter:`drop-shadow(0 0 10px ${HEX.violet}88)`}}),
        /* vértices tocáveis */
        EIXOS.map((x,k)=>{
          const [px,py]=pt(k, Math.max(.08,x.v));
          const [lx,ly]=pt(k,1.24);
          return h('g',{key:k,onClick:()=>setSel(sel===k?null:k),style:{cursor:'pointer'}},
            h('circle',{cx:px,cy:py,r:sel===k?6.5:4.5,fill:HEX[x.c],
              stroke:'var(--bg)',strokeWidth:2,
              style:{filter:`drop-shadow(0 0 8px ${HEX[x.c]})`,
                transition:'r .3s cubic-bezier(.34,1.56,.64,1)'}}),
            h('text',{x:lx,y:ly,textAnchor:'middle',dominantBaseline:'middle',
              fontSize:'8.5',fontFamily:'var(--f-mono)',letterSpacing:'.06em',
              fill: sel===k? HEX[x.c] : 'var(--ink-3)'}, x.n.toUpperCase()));
        }))));
};

/* ═══ 2. DUAS RÉGUAS — cintura e peso lado a lado, sem mistério ═══ */
const DuasReguas = ({s, i}) => {
  const med = s.medidas;
  const ini = med[0], fim = med[med.length-1];
  const dCin = ini.cintura - fim.cintura;
  const dPes = ini.peso - fim.peso;
  const pCin = (dCin/ini.cintura)*100;
  const pPes = (dPes/ini.peso)*100;
  const maxP = Math.max(pCin, pPes, 1);

  const Linha = ({rot, cor, de, para, un, queda, pct, nota}) =>
    h('div',{style:{marginBottom:20}},
      h('div',{style:{display:'flex',alignItems:'baseline',gap:8,marginBottom:9}},
        h('span',{style:{width:9,height:9,borderRadius:3,background:CORES[cor],
          boxShadow:`0 0 8px ${HEX[cor]}88`}}),
        h('span',{style:{fontSize:13.5,fontWeight:700,letterSpacing:'-.015em'}},rot),
        h('span',{style:{marginLeft:'auto',fontFamily:'var(--f-display)',fontSize:19,
          fontWeight:600,color:CORES[cor],letterSpacing:'-.03em'}},
          '−',String(queda).replace('.',','),
          h('span',{style:{fontSize:11,opacity:.7}},' '+un))),
      /* trilho com o antes e o depois marcados */
      h('div',{style:{position:'relative',height:34}},
        h('div',{style:{position:'absolute',left:0,right:0,top:13,height:8,borderRadius:8,
          background:'var(--ov-2)'}}),
        h('div',{style:{position:'absolute',left:0,top:13,height:8,borderRadius:8,
          width:`${(pct/maxP)*100}%`,
          background:`linear-gradient(90deg, ${HEX[cor]}, ${HEX2[cor]})`,
          boxShadow:`0 0 14px ${HEX[cor]}66`,
          transition:'width 1.1s cubic-bezier(.16,1,.3,1)'}}),
        h('span',{className:'mono',style:{position:'absolute',left:0,top:-2,fontSize:9,
          color:'var(--ink-4)'}},`${String(de).replace('.',',')} ${un}`),
        h('span',{className:'mono',style:{position:'absolute',right:0,top:-2,fontSize:9,
          color:CORES[cor],fontWeight:700}},`${String(para).replace('.',',')} ${un} hoje`)),
      h('div',{style:{fontSize:11.5,color:'var(--ink-3)',lineHeight:1.45}},nota));

  return h(CardG,{i,titulo:'Cintura x Peso',
    sub:'quanto cada um caiu, em porcentagem',ico:'scale',cor:'pink',
    valor:pCin.toFixed(1).replace('.',','),un:'%',delta:'DE CINTURA',
    rodape: pCin > pPes
      ? `A sua cintura caiu ${(pCin/Math.max(.1,pPes)).toFixed(1).replace('.',',')} vezes mais rápido que o seu peso. Isso tem nome: recomposição. Você está perdendo gordura visceral e mantendo músculo — a balança nunca conta essa parte.`
      : 'Por enquanto peso e cintura caem juntos. A partir da Chave 04 a cintura costuma disparar na frente.'},

    h(Linha,{rot:'Cintura',cor:'pink',de:ini.cintura,para:fim.cintura,un:'cm',
      queda:dCin.toFixed(1),pct:pCin,
      nota:`Caiu ${pCin.toFixed(1).replace('.',',')}% do tamanho inicial em ${fim.dia-ini.dia} dias.`}),
    h(Linha,{rot:'Peso',cor:'gold',de:ini.peso,para:fim.peso,un:'kg',
      queda:dPes.toFixed(1),pct:pPes,
      nota:`Caiu ${pPes.toFixed(1).replace('.',',')}% — bem menos, e isso é o esperado.`}),

    /* leitura visual: quem venceu a corrida */
    h('div',{style:{display:'flex',alignItems:'center',gap:12,padding:'13px 14px',
      borderRadius:'var(--r-sm)',background:'var(--mint-soft)',
      border:'1px solid rgba(74,222,155,.24)'}},
      h(Icon,{n:'check',s:17,c:'var(--mint)',w:2.6}),
      h('span',{style:{flex:1,fontSize:12.5,lineHeight:1.45,color:'var(--ink-2)'}},
        h('b',{style:{color:'var(--ink)'}},'A cintura vai na frente. '),
        'É o sinal de que a gordura está saindo do lugar certo.')));
};

/* ═══ 3. FITA MÉTRICA — o quanto falta para a meta ═══ */
const FitaMeta = ({s, i}) => {
  const med = s.medidas;
  const ini = med[0], fim = med[med.length-1];
  const meta = s.metaCm || 8;
  const perda = ini.cintura - fim.cintura;
  const pct = Math.max(0, Math.min(1, perda/meta));
  const alvo = ini.cintura - meta;
  const porSemana = perda / Math.max(1,(s.diaAtual-1)) * 7;

  /* a fita vai do valor inicial até o alvo */
  const marcas = Array.from({length:Math.round(meta)+1},(_,k)=>k);

  return h(CardG,{i,titulo:'Meta de cintura',sub:`de ${String(ini.cintura).replace('.',',')} cm para ${alvo.toFixed(1).replace('.',',')} cm`,
    ico:'target',cor:'mint',valor:Math.round(pct*100),un:'%',delta:'DA META',
    rodape:`Faltam ${(meta-perda).toFixed(1).replace('.',',')} cm. No seu ritmo (${porSemana.toFixed(1).replace('.',',')} cm por semana), a meta chega por volta do Dia ${Math.min(21, Math.max(s.diaAtual, Math.round(s.diaAtual + ((meta-perda)/Math.max(.1,porSemana))*7)))}.`},

    /* fita métrica horizontal, com régua de verdade */
    h('div',{style:{position:'relative',padding:'26px 0 8px'}},

      /* corpo da fita */
      h('div',{style:{position:'relative',height:52,borderRadius:10,overflow:'hidden',
        background:'linear-gradient(180deg, var(--surf-3), var(--surf-2))',
        border:'1px solid var(--line-2)'}},
        /* trecho já conquistado */
        h('div',{style:{position:'absolute',left:0,top:0,bottom:0,width:`${pct*100}%`,
          background:`linear-gradient(90deg, ${HEX.mint}dd, ${HEX2.mint})`,
          boxShadow:`0 0 22px ${HEX.mint}55`,
          transition:'width 1.2s cubic-bezier(.16,1,.3,1)'}}),
        /* marcas da régua */
        h('div',{style:{position:'absolute',inset:0,display:'flex',
          alignItems:'flex-end',justifyContent:'space-between',padding:'0 2px'}},
          marcas.map(k=>{
            const grande = k%5===0;
            const passou = (k/meta) <= pct;
            return h('span',{key:k,style:{flex:1,display:'flex',flexDirection:'column',
              alignItems:'center',gap:3,paddingBottom:5}},
              h('span',{style:{width:1.5,height:grande?18:10,borderRadius:1,
                background: passou ? 'rgba(4,20,15,.5)' : 'var(--ink-4)',
                opacity: passou?.85:.5}}),
              grande && h('span',{className:'mono',style:{fontSize:8,
                color: passou ? 'rgba(4,20,15,.75)' : 'var(--ink-4)'}},k));
          }))),

      /* ponteiro de onde ela está */
      h('div',{style:{position:'absolute',top:0,left:`calc(${pct*100}% - 30px)`,width:60,
        textAlign:'center',transition:'left 1.2s cubic-bezier(.16,1,.3,1)'}},
        h('div',{style:{display:'inline-flex',alignItems:'center',gap:5,
          padding:'4px 9px',borderRadius:'var(--r-full)',
          background:'var(--mint)',color:'#04140f',
          fontFamily:'var(--f-mono)',fontSize:9.5,fontWeight:700,
          boxShadow:`0 4px 14px ${HEX.mint}66`}},
          `−${perda.toFixed(1).replace('.',',')}`),
        h('div',{style:{width:2,height:8,margin:'0 auto',background:'var(--mint)'}})),

      /* extremos */
      h('div',{style:{display:'flex',justifyContent:'space-between',marginTop:10}},
        h('div',null,
          h('div',{className:'mono',style:{fontSize:8.5,letterSpacing:'.1em',
            color:'var(--ink-4)'}},'ONDE COMEÇOU'),
          h('div',{style:{fontFamily:'var(--f-display)',fontSize:17,fontWeight:600,
            letterSpacing:'-.03em',color:'var(--ink-2)'}},
            String(ini.cintura).replace('.',','),' cm')),
        h('div',{style:{textAlign:'right'}},
          h('div',{className:'mono',style:{fontSize:8.5,letterSpacing:'.1em',
            color:'var(--gold)'}},'ONDE QUER CHEGAR'),
          h('div',{style:{fontFamily:'var(--f-display)',fontSize:17,fontWeight:600,
            letterSpacing:'-.03em',color:'var(--gold)'}},
            alvo.toFixed(1).replace('.',','),' cm')))));
};

/* ═══ 4. FITA DE SONO E ENERGIA — arraste para ler cada noite ═══ */
const FitaSono = ({s, i}) => {
  const chk = s.checkins;
  const [idx,setIdx] = useState(chk.length-1);
  const W=300, H=110, P=16;
  const sono = chk.map(c=>c.sono), ene = chk.map(c=>c.energia);
  const mn=Math.min(...sono)-1, mx=Math.max(...sono)+1;
  const px = k => P + (k/Math.max(1,chk.length-1))*(W-P*2);
  const py = v => H-P - ((v-mn)/(mx-mn))*(H-P*2);
  const linha = chk.map((c,k)=>`${k?'L':'M'}${px(k)},${py(c.sono)}`).join(' ');
  const area  = `${linha} L${px(chk.length-1)},${H} L${px(0)},${H} Z`;

  const mover = e => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.touches?e.touches[0].clientX:e.clientX) - r.left;
    const k = Math.round((x/r.width)*(chk.length-1));
    setIdx(Math.max(0,Math.min(chk.length-1,k)));
  };
  const c = chk[idx] || chk[chk.length-1];

  return h(CardG,{i,titulo:'Sono e energia',sub:'a noite explica o dia seguinte',ico:'moon',
    cor:'violet',valor:String(c.sono).replace('.',','),un:'h',delta:`DIA ${c.dia}`,
    rodape:`Naquela noite você dormiu ${String(c.sono).replace('.',',')}h e acordou com energia ${c.energia} de 5${c.inchaco?' — e a cintura amanheceu inchada':' — sem inchaço pela manhã'}. Abaixo de 7h o corpo pede cerca de 385 kcal a mais no dia seguinte.`},

    h('div',{onMouseMove:mover,onTouchMove:mover,onClick:mover,
      style:{position:'relative',cursor:'ew-resize',touchAction:'pan-y'}},
      h('svg',{viewBox:`0 0 ${W} ${H}`,style:{width:'100%',height:H}},
        h('defs',null,
          h('linearGradient',{id:'fitaG',x1:'0',y1:'0',x2:'0',y2:'1'},
            h('stop',{offset:'0',stopColor:HEX.violet,stopOpacity:'.42'}),
            h('stop',{offset:'1',stopColor:HEX.violet,stopOpacity:'0'}))),
        h('path',{d:area,fill:'url(#fitaG)'}),
        h('path',{d:linha,fill:'none',stroke:HEX.violet,strokeWidth:2.6,
          strokeLinecap:'round',strokeLinejoin:'round',
          style:{filter:`drop-shadow(0 4px 10px ${HEX.violet}77)`}}),
        /* barras de energia por baixo */
        chk.map((x,k)=>h('rect',{key:k,x:px(k)-7,y:H-8-x.energia*3.4,width:14,
          height:x.energia*3.4,rx:3,fill:HEX.mint,opacity:idx===k?.9:.35})),
        /* scrubber */
        h('line',{x1:px(idx),y1:8,x2:px(idx),y2:H-6,stroke:'var(--ink-4)',
          strokeWidth:1,strokeDasharray:'2 4'}),
        h('circle',{cx:px(idx),cy:py(c.sono),r:6,fill:'var(--bg)',
          stroke:HEX.violet,strokeWidth:3,
          style:{filter:`drop-shadow(0 0 10px ${HEX.violet})`}})),
      h('div',{style:{display:'flex',justifyContent:'space-between',marginTop:4}},
        chk.map((x,k)=>h('span',{key:k,className:'mono',
          style:{fontSize:8.5,color:idx===k?'var(--violet)':'var(--ink-4)'}},`D${x.dia}`)))));
};

/* ═══ Painel completo da Jornada ═══ */
const PainelGraficos3D = ({s}) =>
  h('div',null,
    h(HexEquilibrio,{s,i:0}),
    h(DuasReguas,{s,i:1}),
    h(FitaMeta,{s,i:2}),
    h(FitaSono,{s,i:3}));

/* ═══════════════════════════════════════════════════════════
   MINHA META — o número que ela persegue e o motivo dela
═══════════════════════════════════════════════════════════ */
const MetaJornada = ({s, set, toast}) => {
  const med = s.medidas;
  const perda = med[0].cintura - med[med.length-1].cintura;
  const meta = s.metaCm || 8;
  const sonho = s.sonho || '';
  const [ed,setEd] = useState(false);
  const [m,setM] = useState(meta);
  const [txt,setTxt] = useState(sonho);
  const pct = Math.max(0, Math.min(1, perda/m));
  const falta = Math.max(0, m - perda);
  const porSemana = perda / Math.max(1,(s.diaAtual-1)) * 7;
  const diaPrevisto = porSemana>0 ? Math.min(21, Math.round(s.diaAtual + (falta/porSemana)*7)) : 21;

  const salvar = () => {
    set(p=>({...p, metaCm:Number(m)||8, sonho:txt}));
    setEd(false);
    toast('Meta salva', `${m} cm — o app já recalculou a sua rota`, 'target');
  };

  return h(Reveal,{tipo:'rv-3d'},
    h('div',{className:'card',style:{padding:20,marginBottom:12,position:'relative',
      overflow:'hidden',borderColor:'var(--line-pink)',
      background:'linear-gradient(150deg, var(--pink-soft), transparent 60%), var(--surf)'}},
      h('div',{style:{position:'absolute',top:-60,right:-40,width:190,height:190,
        borderRadius:'50%',pointerEvents:'none',opacity:.35,
        background:`radial-gradient(circle, ${HEX.pink}44, transparent 70%)`}}),

      h('div',{style:{display:'flex',alignItems:'center',gap:12,marginBottom:16,
        position:'relative'}},
        h('span',{style:{width:40,height:40,borderRadius:14,flexShrink:0,
          background:'var(--pink-soft)',border:'1px solid var(--line-pink)',
          display:'flex',alignItems:'center',justifyContent:'center'}},
          h(Icon,{n:'target',s:18,c:'var(--pink)'})),
        h('div',{style:{flex:1}},
          h('div',{className:'mono',style:{fontSize:8.5,letterSpacing:'.13em',
            color:'var(--pink)',marginBottom:3}},'ONDE VOCÊ QUER CHEGAR'),
          h('div',{style:{fontFamily:'var(--f-display)',fontSize:19,fontWeight:600,
            letterSpacing:'-.03em'}},'Minha meta de cintura')),
        h('button',{className:'press',onClick:()=>ed?salvar():setEd(true),
          style:{padding:'7px 13px',borderRadius:'var(--r-full)',fontSize:11.5,
            fontWeight:600,border:'1px solid var(--line-pink)',color:'var(--pink)',
            background:'var(--pink-soft)','--led':HEX.pink}}, ed?'Salvar':'Editar')),

      ed
        ? h('div',null,
            h('div',{className:'mono',style:{fontSize:9,letterSpacing:'.12em',
              color:'var(--ink-4)',marginBottom:9}},'QUANTOS CENTÍMETROS VOCÊ QUER TIRAR'),
            h('div',{style:{display:'flex',alignItems:'center',gap:14,marginBottom:18}},
              h('input',{type:'range',min:3,max:15,step:.5,value:m,
                onChange:e=>setM(e.target.value),
                style:{flex:1,accentColor:'var(--pink)'}}),
              h('span',{style:{fontFamily:'var(--f-display)',fontSize:30,fontWeight:600,
                color:'var(--pink)',letterSpacing:'-.04em',minWidth:64,textAlign:'right'}},
                String(m).replace('.',','),
                h('span',{style:{fontSize:13,opacity:.7}},' cm'))),
            h('div',{className:'mono',style:{fontSize:9,letterSpacing:'.12em',
              color:'var(--ink-4)',marginBottom:9}},'POR QUE ESSE NÚMERO IMPORTA PARA VOCÊ'),
            h('textarea',{value:txt,onChange:e=>setTxt(e.target.value),rows:3,
              placeholder:'A calça que eu quero fechar, a foto que eu quero tirar, o dia em que…',
              style:{width:'100%',padding:'13px 14px',borderRadius:'var(--r-md)',
                background:'var(--surf-2)',border:'1px solid var(--line)',resize:'none',
                fontSize:13.5,lineHeight:1.5,color:'var(--ink)',outline:'none'}}))

        : h('div',null,
            /* barra de meta com marcadores */
            h('div',{style:{position:'relative',height:44,marginBottom:16}},
              h('div',{style:{position:'absolute',left:0,right:0,top:18,height:9,
                borderRadius:9,background:'var(--ov-2)',overflow:'hidden'}},
                h('div',{style:{height:'100%',width:`${pct*100}%`,borderRadius:9,
                  background:'linear-gradient(90deg, var(--pink), var(--pink-2))',
                  boxShadow:'0 0 16px var(--pink-glow)',
                  transition:'width 1.1s cubic-bezier(.16,1,.3,1)'}})),
              h('div',{style:{position:'absolute',left:`calc(${pct*100}% - 14px)`,top:8,
                width:28,height:28,borderRadius:'50%',background:'var(--pink)',
                border:'3px solid var(--bg)',boxShadow:'0 4px 16px var(--pink-glow)',
                display:'flex',alignItems:'center',justifyContent:'center',
                transition:'left 1.1s cubic-bezier(.16,1,.3,1)'}},
                h(Icon,{n:'flag',s:12,c:'#fff',w:2.4})),
              h('span',{className:'mono',style:{position:'absolute',right:0,top:0,
                fontSize:8.5,color:'var(--ink-4)'}},`META ${String(m).replace('.',',')} CM`),
              h('span',{className:'mono',style:{position:'absolute',left:0,top:0,
                fontSize:8.5,color:'var(--ink-4)'}},'DIA 01')),

            h('div',{style:{display:'flex',gap:14,marginBottom:sonho?16:0}},
              [[perda.toFixed(1).replace('.',','),'CM JÁ FEITOS','pink'],
               [falta.toFixed(1).replace('.',','),'CM QUE FALTAM','gold'],
               [`Dia ${diaPrevisto}`,'PREVISÃO DE CHEGADA','mint']].map(([v,l,c],i)=>
                h('div',{key:i,style:{flex:1}},
                  h('div',{style:{fontFamily:'var(--f-display)',fontSize:21,fontWeight:600,
                    letterSpacing:'-.04em',color:CORES[c],lineHeight:1}},v),
                  h('div',{className:'mono',style:{fontSize:7.5,letterSpacing:'.09em',
                    color:'var(--ink-4)',marginTop:5}},l)))),

            sonho
              ? h('div',{style:{paddingTop:14,borderTop:'1px dashed var(--line-2)'}},
                  h('div',{className:'mono',style:{fontSize:8,letterSpacing:'.12em',
                    color:'var(--ink-4)',marginBottom:7}},'O MEU PORQUÊ'),
                  h('p',{style:{fontFamily:'var(--f-display)',fontStyle:'italic',
                    fontSize:15.5,lineHeight:1.5,color:'var(--ink)'}},`“${sonho}”`))
              : h('button',{className:'press',onClick:()=>setEd(true),
                  style:{width:'100%',marginTop:14,padding:'13px',borderRadius:'var(--r-md)',
                    border:'1px dashed var(--line-2)',color:'var(--ink-3)',fontSize:12.5,
                    '--led':HEX.pink}},
                  'Escrever o motivo por trás desse número'))));
};
