/* ═══════════════════════════════════════════════════════════
   JORNADA + PERFIL — unificados
   Cabeçalho com foto/nível/XP · trilha na montanha · gráficos ·
   atos vitalícios · planos B · feed de fotos
═══════════════════════════════════════════════════════════ */

/* ─── CABEÇALHO DE PERFIL ─── */
const PerfilHeader = ({s, go}) => {
  const nv=nivelDe(s.xp);
  const meds=s.medidas, atual=meds[meds.length-1]||{cintura:0}, ini=meds[0]||atual;
  const perda=(ini.cintura-atual.cintura);
  return h('div',{className:'on-photo',style:{position:'relative',overflow:'hidden',
    borderRadius:'0 0 30px 30px',marginBottom:20}},
    h(FotoCena,{cena:'identidade',h:'auto',zoom:.7,
      style:{position:'absolute',inset:0,height:'100%'}}),
    h('div',{style:{position:'absolute',inset:0,
      background:'linear-gradient(180deg, rgba(11,5,8,.55) 0%, rgba(11,5,8,.78) 58%, rgba(11,5,8,.93) 90%, var(--bg) 100%)'}}),

    h('div',{style:{position:'relative',padding:'18px 18px 22px',textAlign:'center'}},
      /* avatar central com anel de nível */
      h('div',{className:'rise',style:{position:'relative',width:112,height:112,
        margin:'0 auto 14px'}},
        h(Anel,{v:nv.pct,size:112,sw:4,cor:'var(--gold)'},null),
        h('div',{style:{position:'absolute',inset:11}},
          h(Avatar,{size:90,ring:'transparent',style:{border:'none'}})),
        h('div',{style:{position:'absolute',bottom:-3,left:'50%',transform:'translateX(-50%)',
          padding:'4px 13px',borderRadius:'var(--r-full)',
          background:'linear-gradient(135deg,var(--gold),var(--gold-2))',
          fontFamily:'var(--f-mono)',fontSize:9,fontWeight:700,color:'var(--on-gold, #1a1004)',
          letterSpacing:'.08em',whiteSpace:'nowrap',
          boxShadow:'0 4px 14px var(--gold-glow)'}},`NÍVEL ${nv.n}`)),

      h('div',{className:'rise d1'},
        h('div',{className:'h-display',style:{fontSize:27,marginBottom:3}},s.nome),
        h('div',{className:'mono',style:{fontSize:10,color:'var(--gold)',
          letterSpacing:'.12em',marginBottom:4}},nv.nome.toUpperCase()),
        h('div',{style:{display:'inline-flex',alignItems:'center',gap:6,
          padding:'6px 13px',borderRadius:'var(--r-full)',
          background:'rgba(245,201,123,.14)',border:'1px solid var(--line-gold)',
          marginBottom:18}},
          h(Icon,{n:'zap',s:12,c:'var(--gold)',fill:'var(--gold)',w:0}),
          h('span',{className:'mono',style:{fontSize:12,fontWeight:700,color:'var(--gold)'}},
            s.xp.toLocaleString('pt-BR'),' XP'),
          nv.prox && h('span',{className:'mono',style:{fontSize:9,color:'var(--ink-3)'}},
            `· faltam ${nv.falta}`))),

      /* 3 stats */
      h('div',{className:'rise d2',style:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',
        gap:9}},
        [{i:'ruler',v:perda.toFixed(1),u:'cm',l:'DESTRAVADOS',c:'pink'},
         {i:'flame',v:s.streak,u:'',l:'DIAS SEGUIDOS',c:'coral'},
         {i:'check',v:s.diasFeitos.length,u:'/21',l:'CONCLUÍDOS',c:'mint'}].map((x,i)=>
          h('div',{key:i,style:{background:'var(--ov-1)',
            backdropFilter:'blur(12px)',border:'1px solid var(--ov-2)',
            borderRadius:'var(--r-md)',padding:'13px 8px'}},
            h(Icon,{n:x.i,s:15,c:CORES[x.c],style:{margin:'0 auto 8px'}}),
            h('div',{style:{fontFamily:'var(--f-display)',fontSize:22,fontWeight:600,
              letterSpacing:'-.04em',color:CORES[x.c],lineHeight:1}},
              x.v,h('span',{style:{fontSize:11,opacity:.6}},x.u)),
            h('div',{className:'mono',style:{fontSize:7.5,color:'var(--ink-3)',marginTop:5,
              letterSpacing:'.09em'}},x.l))))));
};

/* ─── TRILHA NA MONTANHA ─── */
const TrilhaMontanha = ({s, set, go, fase}) => {
  const f=FASES.find(x=>x.id===fase);
  const rg = fase===1?[1,7] : fase===2?[8,14] : [15,21];
  const dias=Array.from({length:7},(_,i)=>rg[0]+i);

  const W=320, H=690;
  /* pontos do trilho subindo a montanha — de baixo para cima */
  const pts=[
    {x:52,  y:622}, {x:132, y:578}, {x:78,  y:500},
    {x:176, y:432}, {x:98,  y:352}, {x:206, y:280}, {x:160, y:176},
  ];

  let path=`M${pts[0].x},${pts[0].y}`;
  for(let i=0;i<pts.length-1;i++){
    const a=pts[i],b=pts[i+1],mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
    path+=` Q${a.x},${my} ${mx},${my} T${b.x},${b.y}`;
  }
  const idx=dias.indexOf(s.diaAtual);
  let done='';
  if(idx>0){ done=`M${pts[0].x},${pts[0].y}`;
    for(let i=0;i<idx;i++){ const a=pts[i],b=pts[i+1],mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
      done+=` Q${a.x},${my} ${mx},${my} T${b.x},${b.y}`; } }

  return h('div',{style:{position:'relative',width:'100%',maxWidth:W,margin:'0 auto',
    height:H,borderRadius:'var(--r-lg)',overflow:'hidden',
    border:'1px solid var(--line)'}},

    /* ═══ CENÁRIO DE MONTANHA ═══ */
    h('svg',{viewBox:`0 0 ${W} ${H}`,preserveAspectRatio:'none',
      style:{position:'absolute',inset:0,width:'100%',height:'100%'}},
      h('defs',null,
        h('linearGradient',{id:'ceu',x1:'0',y1:'0',x2:'0',y2:'1'},
          h('stop',{offset:'0',stopColor:'#2a0d24'}),
          h('stop',{offset:'.34',stopColor:'#48153a'}),
          h('stop',{offset:'.62',stopColor:'#2a0d1c'}),
          h('stop',{offset:'1',stopColor:'#0e0510'})),
        h('linearGradient',{id:'m1',x1:'0',y1:'0',x2:'0',y2:'1'},
          h('stop',{offset:'0',stopColor:'#4a1f3e'}),
          h('stop',{offset:'1',stopColor:'#1c0a18'})),
        h('linearGradient',{id:'m2',x1:'0',y1:'0',x2:'0',y2:'1'},
          h('stop',{offset:'0',stopColor:'#341527'}),
          h('stop',{offset:'1',stopColor:'#150710'})),
        h('linearGradient',{id:'m3',x1:'0',y1:'0',x2:'0',y2:'1'},
          h('stop',{offset:'0',stopColor:'#200d18'}),
          h('stop',{offset:'1',stopColor:'#0d0409'})),
        h('linearGradient',{id:'trilha',x1:'0',y1:'1',x2:'0',y2:'0'},
          h('stop',{offset:'0',stopColor:'#4ADE9B'}),
          h('stop',{offset:'.5',stopColor:f.cor}),
          h('stop',{offset:'1',stopColor:'#FF2E7E'})),
        h('radialGradient',{id:'sol'},
          h('stop',{offset:'0',stopColor:'#FFD9A0',stopOpacity:'.95'}),
          h('stop',{offset:'.4',stopColor:'#FF8FB8',stopOpacity:'.5'}),
          h('stop',{offset:'1',stopColor:'#FF2E7E',stopOpacity:'0'}))),

      /* céu */
      h('rect',{width:W,height:H,fill:'url(#ceu)'}),
      /* sol/luz no topo — o objetivo */
      h('circle',{cx:160,cy:120,r:130,fill:'url(#sol)'}),
      h('circle',{cx:160,cy:126,r:26,fill:'#FFE0B8',opacity:.85,
        style:{filter:'blur(2px)'}}),
      /* estrelas */
      [[38,64],[92,38],[248,52],[288,104],[62,148],[268,168],[24,210],[300,232],
       [128,72],[212,96]].map(([cx,cy],i)=>
        h('circle',{key:i,cx,cy,r:i%3===0?1.5:1,fill:'#fff',
          opacity:.14+(i%4)*.09})),

      /* montanha distante */
      h('path',{d:`M0,${H} L0,318 L40,272 L84,306 L128,236 L172,286 L216,222
        L262,268 L306,236 L${W},272 L${W},${H} Z`,fill:'url(#m3)'}),
      /* montanha média */
      h('path',{d:`M0,${H} L0,412 L46,352 L96,398 L146,314 L196,376 L246,306
        L296,362 L${W},330 L${W},${H} Z`,fill:'url(#m2)'}),
      /* montanha principal — o pico é o Dia 21 */
      h('path',{d:`M0,${H} L0,520 L44,470 L92,506 L140,404 L160,166 L184,398
        L232,466 L280,428 L${W},486 L${W},${H} Z`,fill:'url(#m1)'}),
      /* neve no pico */
      h('path',{d:'M160,166 L142,300 L152,286 L162,308 L172,282 L182,296 Z',
        fill:'var(--ov-4)'}),
      /* base próxima */
      h('path',{d:`M0,${H} L0,612 L60,584 L124,616 L188,578 L252,608 L${W},580
        L${W},${H} Z`,fill:'url(#m3)'}),
      /* névoa em camadas */
      h('ellipse',{cx:160,cy:400,rx:210,ry:34,fill:'#FF6BA3',opacity:.07,
        style:{filter:'blur(18px)'}}),
      h('ellipse',{cx:110,cy:540,rx:190,ry:28,fill:'#fff',opacity:.045,
        style:{filter:'blur(16px)'}}),

      /* ═══ TRILHO ═══ */
      h('path',{d:path,fill:'none',stroke:'var(--ov-3)',strokeWidth:8,
        strokeLinecap:'round'}),
      h('path',{d:path,fill:'none',stroke:'rgba(0,0,0,.34)',strokeWidth:5,
        strokeLinecap:'round',strokeDasharray:'1 12'}),
      done && h('path',{d:done,fill:'none',stroke:'url(#trilha)',strokeWidth:5,
        strokeLinecap:'round',style:{filter:`drop-shadow(0 0 9px ${f.cor}cc)`}}),

      /* bandeira no topo (Dia 21) */
      fase===3 && h('g',null,
        h('path',{d:'M162,150 L162,178',stroke:'#fff',strokeWidth:2,strokeLinecap:'round'}),
        h('path',{d:'M163,151 L188,159 L163,167 Z',fill:'#FF2E7E'}))),

    /* ═══ NÓS DOS DIAS ═══ */
    pts.map((p,i)=>{
      const d=dias[i]; if(!d||d>21) return null;
      const done=s.diasFeitos.includes(d), atual=d===s.diaAtual, bloq=d>s.diaAtual;
      const dd=DIAS[d], ch=CHAVES.find(c=>c.id===dd.chave);
      const marco=[7,14,21].includes(d);
      /* largura útil de cada lado (container ≈ 330px) para a etiqueta nunca sair da tela */
      const CW=330, off=atual?64:52;
      const espDir = CW*(1-p.x/W)-off-8, espEsq = CW*(p.x/W)-off-8;
      const paraDir = espDir >= espEsq;          /* etiqueta cabe melhor à direita? */
      const dir = paraDir ? 'left' : 'right';    /* chave CSS: left = etiqueta à direita */
      const lblW = Math.max(70, Math.min(124, Math.round(paraDir?espDir:espEsq)));
      return h('div',{key:d,className:'rise',
        style:{position:'absolute',left:`${p.x/W*100}%`,top:p.y,
          transform:'translate(-50%,-50%)',animationDelay:`${i*.08}s`,zIndex:atual?6:2}},
        h('button',{onClick:()=>{ if(!bloq){ set(pv=>({...pv,diaAtual:d})); go('conteudo'); } },
          style:{position:'relative',width:atual?58:marco?52:44,height:atual?58:marco?52:44,
            borderRadius:'50%',
            background: atual? `linear-gradient(135deg, var(--pink), ${ch.cor})`
              : done? 'rgba(74,222,155,.2)' : 'rgba(20,10,16,.78)',
            border: atual? '2px solid var(--ink-3)'
              : done? '2px solid rgba(74,222,155,.6)'
              : marco? '2px dashed rgba(245,201,123,.5)' : '1.5px solid var(--ov-3)',
            backdropFilter:'blur(8px)',
            display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
            boxShadow: atual? `0 6px 26px ${ch.cor}88, 0 0 0 7px rgba(255,46,126,.13)`
              : done? '0 3px 14px rgba(74,222,155,.32)' : '0 3px 12px rgba(0,0,0,.5)',
            opacity:bloq?.75:1,
            transition:'all .35s cubic-bezier(.34,1.56,.64,1)'}},
          atual && h('span',{style:{position:'absolute',inset:-7,borderRadius:'50%',
            border:`1.5px solid ${ch.cor}`,opacity:.45,animation:'aiPulse 2.4s infinite'}}),
          marco && !bloq && h('span',{style:{position:'absolute',top:-9,right:-7,fontSize:13}},'🏁'),
          bloq? h(Icon,{n:'lock',s:15,c:'var(--ink-3)'})
            : done? h(Icon,{n:'check',s:atual?21:18,c:atual?'#fff':'var(--mint)',w:3})
            : h('span',{style:{fontFamily:'var(--f-display)',fontWeight:700,
                fontSize:atual?20:16,color:'#fff'}},d),
          atual && h('span',{className:'mono',style:{fontSize:7,color:'var(--ink)',
            letterSpacing:'.08em'}},'HOJE')),

        /* etiqueta */
        h('div',{style:{position:'absolute',top:'50%',transform:'translateY(-50%)',
          [dir]:off,width:lblW,textAlign:dir==='left'?'right':'left',
          pointerEvents:'none'}},
          h('div',{style:{display:'inline-block',padding:'5px 9px',borderRadius:8,
            background:'rgba(10,4,8,.72)',backdropFilter:'blur(10px)',
            border:`1px solid ${atual?ch.cor+'66':'var(--ov-2)'}`}},
            h('div',{className:'mono',style:{fontSize:7.5,letterSpacing:'.1em',
              color:atual?ch.cor:'var(--ink-3)',fontWeight:700,marginBottom:2}},
              marco?`MARCO · D${d}`:`DIA ${String(d).padStart(2,'0')}`),
            h('div',{style:{fontSize:10.5,fontWeight:600,letterSpacing:'-.01em',
              lineHeight:1.22,color:bloq?'var(--ink-3)':'#fff'}},dd.titulo))));
    }),

    /* legenda topo */
    h('div',{style:{position:'absolute',top:14,left:0,right:0,textAlign:'center',
      pointerEvents:'none'}},
      h('div',{className:'mono',style:{fontSize:8.5,letterSpacing:'.16em',
        color:'var(--ink-3)'}},'O CUME'),
      h('div',{style:{fontFamily:'var(--f-display)',fontSize:14,fontWeight:600,
        color:'#fff',marginTop:2,textShadow:'0 2px 12px rgba(0,0,0,.7)'}},
        fase===3?'Dia 21 · A Nova Vida':`Fase ${fase} de 3`)));
};

/* ─── Gráficos de evolução ─── */
const GraficosEvolucao = ({s}) => {
  const [met,setMet]=useState('cintura');
  const M=[{id:'cintura',n:'Cintura',u:'cm',c:'var(--pink)'},
    {id:'peso',n:'Peso',u:'kg',c:'var(--gold)'},
    {id:'energia',n:'Energia',u:'/5',c:'var(--mint)'},
    {id:'sono',n:'Sono',u:'h',c:'var(--violet)'}];
  const m=M.find(x=>x.id===met);
  const src = (met==='cintura'||met==='peso')? s.medidas : s.checkins;
  const pts=src.map(x=>x[met]||0), lbl=src.map(x=>`D${x.dia}`);
  const delta = pts.length>=2? pts[pts.length-1]-pts[0] : 0;
  const bom = (met==='cintura'||met==='peso')? delta<0 : delta>0;

  return h('div',{className:'card',style:{marginBottom:12}},
    h('div',{style:{display:'flex',alignItems:'flex-start',justifyContent:'space-between',
      marginBottom:15}},
      h('div',null,
        h('div',{className:'eyebrow',style:{marginBottom:4}},'SUA EVOLUÇÃO'),
        h('div',{style:{fontSize:12,color:'var(--ink-3)'}},'Acompanhe suas conquistas')),
      h('div',{style:{textAlign:'right'}},
        h('div',{style:{fontFamily:'var(--f-display)',fontSize:29,fontWeight:600,
          letterSpacing:'-.04em',lineHeight:1,color:bom?'var(--mint)':m.c}},
          delta>0?'+':'',delta.toFixed(1),
          h('span',{style:{fontSize:13,opacity:.7}},' ',m.u)),
        h('div',{className:'mono',style:{fontSize:8.5,color:'var(--ink-4)',
          letterSpacing:'.08em',marginTop:2}},'DESDE O DIA 1'))),
    h('div',{style:{display:'flex',gap:6,marginBottom:16}},
      M.map(x=>h('button',{key:x.id,onClick:()=>setMet(x.id),
        style:{flex:1,padding:'7px 4px',borderRadius:'var(--r-full)',
          background:met===x.id?'var(--ov-2)':'transparent',
          border:`1px solid ${met===x.id?'var(--line-2)':'transparent'}`,
          fontSize:10.5,fontWeight:met===x.id?700:500,
          color:met===x.id?x.c:'var(--ink-3)',transition:'all .25s'}},x.n))),
    pts.length>=2
      ? h('div',null,
          h(Linha,{pts,cor:m.c,dots:true,hgt:92,id:'jev'}),
          h('div',{style:{display:'flex',justifyContent:'space-between',marginTop:7}},
            lbl.map((l,i)=>h('span',{key:i,className:'mono',
              style:{fontSize:8.5,color:'var(--ink-4)'}},l))))
      : h('div',{style:{padding:'28px 0',textAlign:'center',color:'var(--ink-4)',
          fontSize:12}},'Registre 2 medições para ver a curva'));
};

/* ─── Feed de fotos do protocolo ─── */
const FeedFotos = ({s, toast}) => {
  const marcos=[1,7,14,21].filter(d=>d<=s.diaAtual);
  return h('div',{style:{marginBottom:14}},
    h('div',{className:'sec-head',style:{marginTop:0}},
      h('span',{className:'sec-title'},'ÁLBUM DO PROTOCOLO'),
      h('span',{className:'mono',style:{fontSize:9.5,color:'var(--ink-4)'}},
        `${marcos.length} de 4 registros`)),
    h('div',{style:{fontSize:11.5,color:'var(--ink-3)',marginBottom:13,lineHeight:1.45}},
      'Suas fotos ficam só no seu aparelho. Ninguém mais vê — nem nós.'),
    h('div',{className:'hscroll',style:{margin:'0 -18px',padding:'0 18px 4px'}},
      [1,7,14,21].map((d,i)=>{
        const tem=d<=s.diaAtual;
        return h('div',{key:d,className:'rise',style:{animationDelay:`${i*.06}s`,
          width:132,flexShrink:0}},
          h('div',{style:{aspectRatio:'3/4',borderRadius:'var(--r-md)',position:'relative',
            overflow:'hidden',border:`1px solid ${tem?'var(--line-pink)':'var(--line)'}`}},
            tem
              ? h(FotoCena,{cena:d===1?'medida':d===7?'insulina':d===14?'transverso':'identidade',
                  h:'100%',zoom:1.05,style:{position:'absolute',inset:0}})
              : h('div',{style:{position:'absolute',inset:0,background:'var(--ov-1)',
                  display:'flex',alignItems:'center',justifyContent:'center'}},
                  h(Icon,{n:'lock',s:22,c:'var(--ink-4)'})),
            h('span',{style:{position:'absolute',top:8,left:8,padding:'3px 8px',
              borderRadius:'var(--r-full)',
              background:tem?'var(--pink)':'rgba(0,0,0,.6)',
              fontFamily:'var(--f-mono)',fontSize:8,fontWeight:700,letterSpacing:'.06em',
              color:tem?'#fff':'var(--ink-4)'}},`DIA ${String(d).padStart(2,'0')}`),
            tem && h('div',{style:{position:'absolute',left:0,right:0,bottom:0,padding:9,
              background:'linear-gradient(180deg,transparent,rgba(0,0,0,.8))'}},
              h('div',{className:'mono',style:{fontSize:8.5,color:'var(--ink)'}},
                s.medidas.find(m=>m.dia===d)? `${s.medidas.find(m=>m.dia===d).cintura} cm`:'—'))),
          h('div',{style:{fontSize:10.5,color:'var(--ink-3)',marginTop:7,textAlign:'center'}},
            d===1?'Ponto zero':d===7?'1ª prova':d===14?'A metade':'Final'));
      })),
    h('button',{onClick:()=>toast('Câmera','Disponível no app instalado','camera'),
      style:{width:'100%',marginTop:12,padding:13,borderRadius:'var(--r-md)',
        background:'var(--pink-soft)',border:'1px dashed var(--line-pink)',
        display:'flex',alignItems:'center',justifyContent:'center',gap:8,
        fontSize:12.5,fontWeight:600,color:'var(--pink)'}},
      h(Icon,{n:'camera',s:16}),'Adicionar foto de hoje'));
};

/* ─── Blocos editáveis: atos, planos B, testemunha ─── */
const BlocoEditavel = ({titulo, sub, ico, cor, itens, placeholder, onSave, s}) => {
  const [edit,setEdit]=useState(false);
  const [vals,setVals]=useState(itens);
  const preenchidos=vals.filter(v=>v&&v.trim()).length;
  return h('div',{className:'card',style:{marginBottom:11}},
    h('div',{style:{display:'flex',alignItems:'center',gap:12,marginBottom:edit||preenchidos?14:0}},
      h('div',{style:{width:38,height:38,borderRadius:12,flexShrink:0,
        background:CORES_SOFT[cor],display:'flex',alignItems:'center',justifyContent:'center'}},
        h(Icon,{n:ico,s:18,c:CORES[cor]})),
      h('div',{style:{flex:1,minWidth:0}},
        h('div',{style:{fontSize:13.5,fontWeight:700,letterSpacing:'-.015em'}},titulo),
        h('div',{style:{fontSize:11,color:'var(--ink-3)',marginTop:1}},
          preenchidos? `${preenchidos} de ${itens.length} definidos` : sub)),
      h('button',{onClick:()=>{ if(edit) onSave(vals); setEdit(!edit); },
        style:{padding:'7px 13px',borderRadius:'var(--r-full)',
          background:edit?CORES[cor]:'var(--ov-1)',
          border:`1px solid ${edit?'transparent':'var(--line-2)'}`,
          fontSize:11,fontWeight:700,color:edit?'#0B0508':'var(--ink-2)'}},
        edit?'Salvar':preenchidos?'Editar':'Definir')),
    (edit||preenchidos>0) && h('div',null,
      vals.map((v,i)=>
        edit
          ? h('input',{key:i,value:v,placeholder:`${placeholder} ${i+1}`,
              onChange:e=>{ const n=[...vals]; n[i]=e.target.value; setVals(n); },
              style:{width:'100%',padding:'11px 13px',marginBottom:8,
                borderRadius:'var(--r-sm)',background:'var(--ov-1)',
                border:'1px solid var(--line-2)',fontSize:12.5,outline:'none'}})
          : v&&v.trim()? h('div',{key:i,style:{display:'flex',gap:10,alignItems:'flex-start',
              padding:'9px 0',borderBottom:i<vals.length-1?'1px solid var(--line)':'none'}},
              h('span',{className:'mono',style:{fontSize:10,color:CORES[cor],fontWeight:700,
                flexShrink:0,marginTop:2}},`0${i+1}`),
              h('span',{style:{fontSize:12.5,lineHeight:1.45,color:'var(--ink-2)'}},v))
            : null)));
};

/* ═══ TELA JORNADA + PERFIL ═══ */
const TelaJornada = ({s, set, go, toast}) => {
  const [fase,setFase]=useState(()=>{
    const f=FASES.find(x=>{ const r=x.id===1?[1,7]:x.id===2?[8,14]:[15,21];
      return s.diaAtual>=r[0]&&s.diaAtual<=r[1]; }); return f?f.id:1;
  });
  const f=FASES.find(x=>x.id===fase);
  const rg=fase===1?[1,7]:fase===2?[8,14]:[15,21];
  const feitosFase=s.diasFeitos.filter(d=>d>=rg[0]&&d<=rg[1]).length;
  const marcos=[7,14,21], prox=marcos.find(m=>m>=s.diaAtual)||21;
  const nomesMarco={7:'Primeira medição oficial',14:'A metade do caminho',21:'A medida definitiva'};

  return h('div',{className:'screen-anim'},
    h('div',{style:{padding:'8px 18px 0'}},
      /* ═══ JORNADA ═══ */
      h('div',{className:'rise d3',style:{marginBottom:16}},
        h('div',{className:'eyebrow eyebrow-pink',style:{marginBottom:5}},
          '21 DIAS DE TRANSFORMAÇÃO'),
        h('div',{className:'h-display',style:{fontSize:27}},'Sua jornada'),
        h('div',{style:{fontSize:12.5,color:'var(--ink-3)',marginTop:5,lineHeight:1.45}},
          'Cada nó é um desafio vencido. O cume é o Dia 21.')),

      /* tabs de fase */
      h('div',{className:'rise d4',style:{display:'flex',gap:7,marginBottom:16}},
        FASES.map(x=>
          h('button',{key:x.id,onClick:()=>setFase(x.id),
            style:{flex:1,padding:'10px 5px',borderRadius:'var(--r-md)',
              background:fase===x.id?`${x.cor}1e`:'var(--surf)',
              border:`1px solid ${fase===x.id?x.cor+'55':'var(--line)'}`,
              transition:'all .3s cubic-bezier(.34,1.56,.64,1)'}},
            h('div',{style:{fontSize:12,fontWeight:700,letterSpacing:'-.015em',
              color:fase===x.id?x.cor:'var(--ink-3)'}},x.nome),
            h('div',{className:'mono',style:{fontSize:8,marginTop:2,
              color:fase===x.id?x.cor:'var(--ink-4)',opacity:.8}},x.range)))),

      /* resumo da fase */
      h('div',{className:'rise d5 card',style:{marginBottom:14,
        background:`linear-gradient(135deg, ${f.cor}12, transparent)`,
        borderColor:`${f.cor}33`,padding:15}},
        h('div',{style:{fontSize:13,lineHeight:1.45,color:'var(--ink-2)',marginBottom:12}},
          f.desc),
        h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center'}},
          h('div',null,
            h('div',{className:'mono',style:{fontSize:8,color:'var(--ink-4)',
              letterSpacing:'.1em',marginBottom:3}},'CHAVES DESTA FASE'),
            h('div',{style:{fontSize:12,fontWeight:700,color:f.cor}},
              f.chaves.map(c=>CHAVES.find(k=>k.id===c).nome).join(' · '))),
          h('div',{style:{textAlign:'right'}},
            h('div',{className:'mono',style:{fontSize:8,color:'var(--ink-4)',
              letterSpacing:'.1em',marginBottom:3}},'PERDA TÍPICA'),
            h('div',{style:{fontSize:12,fontWeight:700,color:f.cor}},f.perda)))),

      /* progresso */
      h('div',{className:'rise d6',style:{marginBottom:18}},
        h('div',{style:{display:'flex',justifyContent:'space-between',marginBottom:7}},
          h('span',{className:'mono',style:{fontSize:9,color:'var(--ink-3)',
            letterSpacing:'.1em'}},'PROGRESSO DA FASE'),
          h('span',{className:'mono',style:{fontSize:9,color:f.cor,fontWeight:700}},
            `${feitosFase}/7 DIAS`)),
        h(Bar,{v:feitosFase/7,cor:fase===2?'gold':fase===3?'':'mint'}))),

    /* MONTANHA */
    h('div',{style:{padding:'0 18px',marginBottom:20}},
      h(TrilhaMontanha,{s,set,go,fase})),

    h('div',{style:{padding:'0 18px'}},
      /* próximo marco */
      h('div',{className:'card',style:{marginBottom:16,
        background:'linear-gradient(135deg, var(--gold-soft), transparent)',
        borderColor:'var(--line-gold)'}},
        h('div',{style:{display:'flex',alignItems:'center',gap:12}},
          h('div',{style:{width:42,height:42,borderRadius:14,flexShrink:0,
            background:'var(--gold-soft)',border:'1px solid var(--line-gold)',
            display:'flex',alignItems:'center',justifyContent:'center'}},
            h(Icon,{n:'trophy',s:19,c:'var(--gold)'})),
          h('div',{style:{flex:1,minWidth:0}},
            h('div',{className:'eyebrow eyebrow-gold',style:{marginBottom:3}},'PRÓXIMO MARCO'),
            h('div',{style:{fontSize:13.5,fontWeight:700,letterSpacing:'-.015em'}},
              `Dia ${prox} · ${nomesMarco[prox]}`),
            h('div',{style:{fontSize:11,color:'var(--ink-3)',marginTop:2}},
              prox-s.diaAtual===0? 'É hoje. Refaça as medidas ao acordar.'
                : `Faltam ${prox-s.diaAtual} ${prox-s.diaAtual===1?'dia':'dias'}`)))),

      /* ═══ EVOLUÇÃO (antes uma aba escondida) ═══ */
      h(SecHead,{t:'SUA EVOLUÇÃO'}),
      h(BlocoEvolucao,{s,set,go}),

      /* ═══ GRÁFICOS DA JORNADA ═══ */
      h(SecHead,{t:'LEITURA DOS SEUS DADOS'}),
      h(PainelGraficos3D,{s}),

      /* ═══ ANTES E AGORA ═══ */
      h(SecHead,{t:'ANTES E AGORA'}),
      h(AntesDepois,{s}),

      /* ═══ MINHA META ═══ */
      h(SecHead,{t:'MINHA META'}),
      h(MetaJornada,{s,set,toast}),

      /* ═══ O QUE JÁ MUDOU ═══ */
      h(SecHead,{t:'O QUE JÁ MUDOU EM VOCÊ'}),
      h(Reveal,{tipo:'rv-s'},
        h('div',{className:'card',style:{padding:18}},
          [{i:'ruler', c:'pink',  t:'A cintura respondeu',
            d:`${(s.medidas[0].cintura-s.medidas[s.medidas.length-1].cintura).toFixed(1).replace('.',',')} cm a menos desde o Dia 1 — dentro da faixa esperada para esta fase.`},
           {i:'flame', c:'coral', t:'A corrente não quebrou',
            d:`${s.streak} dias seguidos. A partir do sétimo, o cérebro começa a automatizar o gesto.`},
           {i:'book',  c:'violet',t:'Você entendeu o porquê',
            d:`${Object.values(s.lidos||{}).reduce((a,v)=>a+(v?v.length:0),0)} blocos de conteúdo lidos. Quem entende o mecanismo abandona menos.`},
           {i:'check', c:'mint',  t:'Dias fechados',
            d:`${s.diasFeitos.length} de 21 concluídos — ${Math.round(s.diasFeitos.length/21*100)}% do caminho até o cume.`},
          ].map((x,i)=>
            h('div',{key:i,style:{display:'flex',gap:13,marginBottom:i<3?16:0}},
              h('span',{style:{width:34,height:34,borderRadius:12,flexShrink:0,
                background:CORES_SOFT[x.c],display:'flex',alignItems:'center',
                justifyContent:'center'}},h(Icon,{n:x.i,s:16,c:CORES[x.c]})),
              h('div',{style:{flex:1}},
                h('div',{style:{fontSize:14,fontWeight:600,letterSpacing:'-.015em',
                  marginBottom:3}},x.t),
                h('div',{style:{fontSize:12.5,lineHeight:1.55,color:'var(--ink-3)'}},x.d)))))),

      h(Reveal,{delay:60},
        h('p',{style:{fontFamily:'var(--f-display)',fontStyle:'italic',textAlign:'center',
          fontSize:15.5,color:'var(--ink-3)',margin:'30px auto 6px',maxWidth:'26ch',
          lineHeight:1.5}},
          '“O cume não é o Dia 21. É o dia em que parar deixa de ser opção.”')),

      /* — daqui para baixo mudou-se para o Perfil — */
      null && h('div',null,
      h('div',{className:'sec-head'},
        h('span',{className:'sec-title'},'MEUS COMPROMISSOS')),
      h(BlocoEditavel,{titulo:'Meus 3 Atos Vitalícios',
        sub:'Os hábitos que ficam para sempre · Dia 20',ico:'star',cor:'gold',
        itens:s.atos,placeholder:'Ato',s,
        onSave:v=>set(p=>({...p,atos:v}))}),
      h(BlocoEditavel,{titulo:'Meus Planos B',
        sub:'5 frases se-então para dias ruins · Dia 19',ico:'shield',cor:'coral',
        itens:s.planoB,placeholder:'Se… então…',s,
        onSave:v=>set(p=>({...p,planoB:v}))}),
      h(BlocoEditavel,{titulo:'Minha Testemunha',
        sub:'A pessoa que acompanha você · Dia 16',ico:'users',cor:'mint',
        itens:[s.testemunha],placeholder:'Nome da',s,
        onSave:v=>set(p=>({...p,testemunha:v[0]}))}),

      /* ajustes */
      h('div',{className:'sec-head'},h('span',{className:'sec-title'},'CONTA')),
      [{i:'settings',n:'Ajustes e notificações',c:'pink'},
       {i:'book',n:'Biblioteca científica',c:'violet'},
       {i:'users',n:'Comunidade',c:'mint'}].map((o,i)=>
        h('button',{key:i,onClick:()=>o.n==='Comunidade'?go('comunidade')
            :o.n.includes('Biblioteca')?go('ciencia')
            :toast(o.n,'Disponível na versão completa','info'),
          style:{width:'100%',textAlign:'left',display:'flex',alignItems:'center',gap:12,
            padding:'13px 14px',marginBottom:8,background:'var(--surf)',
            border:'1px solid var(--line)',borderRadius:'var(--r-md)'}},
          h('div',{style:{width:36,height:36,borderRadius:12,flexShrink:0,
            background:CORES_SOFT[o.c],display:'flex',alignItems:'center',
            justifyContent:'center'}},h(Icon,{n:o.i,s:17,c:CORES[o.c]})),
          h('span',{style:{flex:1,fontSize:13,fontWeight:600}},o.n),
          h(Icon,{n:'chevR',s:16,c:'var(--ink-4)'}))),

      h('button',{onClick:()=>{ if(confirm('Reiniciar todo o progresso?')){
          localStorage.removeItem(KEY); location.reload(); } },
        style:{width:'100%',padding:13,borderRadius:'var(--r-md)',
          background:'rgba(255,122,92,.07)',border:'1px solid rgba(255,122,92,.2)',
          fontSize:12,color:'var(--coral)',fontWeight:600,marginBottom:16}},
        'Reiniciar jornada'),
      h('div',{style:{textAlign:'center',paddingBottom:20}},
        h('div',{className:'mono',style:{fontSize:8.5,color:'var(--ink-4)',
          letterSpacing:'.14em'}},'CALÇA LARGA 21D · MÉTODO 7 CHAVES'),
        h('div',{className:'mono',style:{fontSize:8,color:'var(--ink-4)',marginTop:4,
          letterSpacing:'.1em',opacity:.6}},'v2.0 · 40+ ESTUDOS CIENTÍFICOS')))));
};
