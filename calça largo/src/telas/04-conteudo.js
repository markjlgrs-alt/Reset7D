/* ═══════════════════════════════════════════════════════════
   ÁREA EXCLUSIVA DE CONTEÚDO — ambiente próprio, gamificado
   Biblioteca (21 dias) → Sala de leitura do dia
   Hierarquia: Tópicos › Desenvolvimento › Dicas › Material de apoio
═══════════════════════════════════════════════════════════ */

const BLOCOS_DIA = ['cena','trava','mec','ferr','vids','regras','sentir','rec','cien'];
const XP_BLOCO = 15, XP_VIDEO = 20, XP_DIA_LEITURA = 90;

/* texto com **negrito** */
const Rico = ({t, style}) => h('p',{style:{fontSize:14.5,lineHeight:1.72,color:'var(--ink-2)',
  marginBottom:13,...style}},
  String(t).split(/\*\*(.+?)\*\*/g).map((p,i)=> i%2
    ? h('strong',{key:i,style:{color:'var(--ink)',fontWeight:600}},p)
    : h(React.Fragment,{key:i},p)));

/* ─── OBJETIVO: sobre o fade da imagem, texto em baixa opacidade + ícone fino ─── */
const CorObj = c => ({pink:'pink',mint:'mint',violet:'violet',coral:'coral',gold:'gold'}[c]||'pink');
const ObjetivoFade = ({o, i, cena}) =>
  h(Reveal,{tipo:'rv-s',delay:i*80},
    h('div',{style:{position:'relative',overflow:'hidden',borderRadius:'var(--r-md)',
      height:126,display:'flex',flexDirection:'column',justifyContent:'flex-end',padding:15}},
      h(FotoCena,{cena,h:'100%',zoom:.34,silX:'84%',silOp:.24,
        style:{position:'absolute',inset:0}}),
      h('div',{style:{position:'absolute',inset:0,
        background:'linear-gradient(180deg, transparent 6%, color-mix(in srgb, var(--bg) 72%, transparent) 58%, var(--bg) 100%)'}}),
      h('div',{style:{position:'relative',zIndex:2}},
        h(Icon,{n:o.i,s:16,c:CORES[CorObj(o.c)],w:1.5,style:{opacity:.62,marginBottom:9}}),
        h('div',{style:{fontSize:13.5,fontWeight:600,lineHeight:1.28,letterSpacing:'-.015em',
          opacity:.85}}, o.t),
        h('div',{style:{fontSize:11.5,lineHeight:1.4,marginTop:3,opacity:.5}}, o.d))));

/* ─── Cartão de vídeo (espanhol nativo, sem legendas) ─── */
const VideoCard = ({v, visto, onVer}) =>
  h('a',{href:v.u,target:'_blank',rel:'noopener',onClick:onVer,className:'card lift',
    style:{display:'flex',gap:13,alignItems:'center',padding:13,marginBottom:9}},
    h('span',{style:{width:54,height:54,borderRadius:'var(--r-sm)',flexShrink:0,
      background:'linear-gradient(145deg, var(--pink-soft), var(--violet-soft))',
      border:'1px solid var(--line)',display:'flex',alignItems:'center',justifyContent:'center'}},
      h(Icon,{n:'play',s:17,c:'var(--pink)',fill:'var(--pink)',w:0})),
    h('span',{style:{flex:1,minWidth:0}},
      h('span',{style:{display:'block',fontSize:13.5,fontWeight:600,lineHeight:1.3,
        letterSpacing:'-.015em',marginBottom:3}}, v.t),
      h('span',{style:{display:'block',fontSize:11.5,color:'var(--ink-3)',lineHeight:1.38}}, v.a),
      h('span',{style:{display:'flex',gap:6,marginTop:8}},
        h('span',{className:'chip',style:{padding:'3px 7px',fontSize:7.5}},'ES · SEM LEGENDA'),
        h('span',{className:'chip',style:{padding:'3px 7px',fontSize:7.5}}, v.d))),
    h(Icon,{n:visto?'check':'arrowUR',s:15,c:visto?'var(--mint)':'var(--ink-4)'}));


/* ═══════════════════════════════════════════════════════════
   CARROSSEL DE AULAS — passa de lado, como um feed
   O dia escolhido fica no centro, maior e nítido. O dia que
   passou recua à esquerda; o próximo espera à direita.
═══════════════════════════════════════════════════════════ */
const LARG_CARD = 236;
const GAP_CARD  = 14;
const PASSO     = LARG_CARD + GAP_CARD;

const CarrosselDias = ({dias, s, go}) => {
  const ref = useRef(null);
  const [x,setX] = useState(0);
  const [foco,setFoco] = useState(0);
  const raf = useRef(0);

  /* abre já no dia atual — mede o cartão de verdade e repete
     depois do layout, para a fonte carregando não desalinhar */
  useEffect(()=>{
    const el = ref.current; if(!el) return;
    const i = Math.max(0, dias.indexOf(s.diaAtual));
    const centralizar = () => {
      const c = el.children[i]; if(!c) return;
      const alvo = c.offsetLeft - (el.clientWidth - c.offsetWidth)/2;
      el.scrollLeft = alvo; setX(alvo); setFoco(i);
    };
    centralizar();
    const r = requestAnimationFrame(centralizar);
    const t = setTimeout(centralizar, 320);
    return () => { cancelAnimationFrame(r); clearTimeout(t); };
  },[dias.join(','), s.diaAtual]);

  const aoRolar = () => {
    const el = ref.current; if(!el) return;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(()=>{
      setX(el.scrollLeft);
      setFoco(Math.round(el.scrollLeft/PASSO));
    });
  };
  const irPara = i => {
    const el = ref.current; if(!el) return;
    const c = el.children[i];
    const alvo = c ? c.offsetLeft - (el.clientWidth - c.offsetWidth)/2 : i*PASSO;
    el.scrollTo({left:alvo, behavior:'smooth'});
  };

  return h('div',{style:{position:'relative'}},

    h('div',{ref,onScroll:aoRolar,className:'carrossel',
      style:{display:'flex',gap:GAP_CARD,overflowX:'auto',
        scrollSnapType:'x mandatory',
        scrollPaddingInline:`calc(50% - ${LARG_CARD/2}px)`,
        padding:`10px calc(50% - ${LARG_CARD/2}px) 18px`,
        perspective:'1100px'}},

      dias.map((d,i)=>{
        const dia=DIAS[d], ch=CHAVES.find(c=>c.id===dia.chave);
        const cena=CENA_POR_CHAVE[dia.chave]||'medida';
        const cor=['pink','mint','violet','gold','coral','mint','pink'][ch.id-1];
        const feito=s.diasFeitos.includes(d), bloq=d>s.diaAtual, ehHoje=d===s.diaAtual;
        const lidos=(s.lidos[d]||[]).length, pct=lidos/BLOCOS_DIA.length;

        /* -1 = já passou (esquerda) · 0 = escolhido (centro) · +1 = futuro (direita) */
        const dist = (i*PASSO - x)/PASSO;
        const ad   = Math.min(Math.abs(dist), 2.2);
        const rotY = Math.max(-32, Math.min(32, dist*-21));
        const esc  = 1 - ad*0.13;
        const z    = -ad*130;
        const opac = 1 - ad*0.44;
        const centro = ad < .4;

        return h('div',{key:d,
          style:{flex:'0 0 auto',width:LARG_CARD,scrollSnapAlign:'center',
            transformStyle:'preserve-3d',
            transform:`translateZ(${z}px) rotateY(${rotY}deg) scale(${esc})`,
            opacity:Math.max(.22,opac),
            transition:'transform .16s linear, opacity .16s linear',
            willChange:'transform'}},

          h('button',{onClick:()=> bloq ? null : (centro ? go('dia',d) : irPara(i)),
            className:bloq?'card':'card lift press',
            style:{width:'100%',padding:0,overflow:'hidden',textAlign:'left',
              display:'block',cursor:bloq?'default':'pointer',
              borderColor: centro && !bloq ? CORES[cor] : 'var(--line)',
              boxShadow: centro && !bloq ? `0 18px 46px ${HEX[cor]}3d` : 'var(--sh-sm)',
              '--led': HEX[cor]}},

            /* capa */
            h('span',{className:'on-photo',style:{display:'block',position:'relative',
              height: centro?178:156,
              transition:'height .34s cubic-bezier(.16,1,.3,1)'}},
              h(FotoCena,{cena,h:'100%',zoom:.56,silX:'66%',silOp:.62,
                style:{position:'absolute',inset:0}}),
              h('span',{style:{position:'absolute',inset:0,
                background:'linear-gradient(180deg, rgba(6,3,6,.22), rgba(6,3,6,.82))'}}),
              h('span',{style:{position:'absolute',inset:0,zIndex:3,padding:14,
                display:'flex',flexDirection:'column'}},
                h('span',{style:{display:'flex',alignItems:'center',gap:6}},
                  h('span',{className:'chip',style:{padding:'3px 8px',fontSize:7.5,
                    background:'rgba(0,0,0,.5)',backdropFilter:'blur(10px)',
                    color:CORES[cor],borderColor:'rgba(255,255,255,.18)'}},
                    `CHAVE ${String(ch.id).padStart(2,'0')}`),
                  ehHoje && h('span',{className:'chip pulse-chip',style:{padding:'3px 8px',
                    fontSize:7.5,background:CORES[cor],color:'#fff',
                    borderColor:'transparent'}},'HOJE')),
                h('span',{style:{marginTop:'auto',display:'flex',alignItems:'flex-end',gap:9}},
                  h('span',{style:{fontFamily:'var(--f-display)',
                    fontSize: centro?46:38,fontWeight:600,
                    letterSpacing:'-.05em',lineHeight:.88,color:'#fff',
                    transition:'font-size .34s cubic-bezier(.16,1,.3,1)'}},
                    String(d).padStart(2,'0')),
                  h('span',{className:'mono',style:{fontSize:8,letterSpacing:'.13em',
                    color:'rgba(255,255,255,.6)',paddingBottom:6}},'DIA'),
                  h('span',{style:{marginLeft:'auto',width:38,height:38,borderRadius:'50%',
                    display:'flex',alignItems:'center',justifyContent:'center',
                    background: bloq?'rgba(0,0,0,.5)':feito?'var(--mint)':CORES[cor],
                    boxShadow: bloq?'none':`0 6px 18px ${HEX[cor]}66`}},
                    h(Icon,{n:bloq?'lock':feito?'check':'play',s:16,
                      c:bloq?'rgba(255,255,255,.6)':'#fff',
                      fill:(!bloq&&!feito)?'#fff':'none',w:feito?3:1.8}))))),

            /* corpo */
            h('span',{style:{display:'block',padding:'14px 15px 16px'}},
              h('span',{style:{display:'block',fontFamily:'var(--f-display)',
                fontSize: centro?18:16,fontWeight:600,letterSpacing:'-.028em',
                lineHeight:1.16,marginBottom:6,minHeight:42,
                transition:'font-size .34s cubic-bezier(.16,1,.3,1)'}},dia.titulo),
              centro && h('span',{style:{display:'block',fontSize:11.5,color:'var(--ink-3)',
                lineHeight:1.4,marginBottom:10,overflow:'hidden',
                textOverflow:'ellipsis',whiteSpace:'nowrap'}},dia.sub),
              h('span',{style:{display:'flex',alignItems:'center',gap:9}},
                h('span',{className:'bar',style:{flex:1,height:4}},
                  h('span',{className:`bar-fill ${pct>=1?'mint':'gold'}`,
                    style:{width:`${pct*100}%`,display:'block'}})),
                h('span',{className:'mono',style:{fontSize:9,color:'var(--ink-4)'}},
                  `${lidos}/${BLOCOS_DIA.length}`)))));
      })),

    /* setas e marcadores */
    h('div',{style:{display:'flex',alignItems:'center',justifyContent:'center',gap:14}},
      h('button',{className:'press',onClick:()=>irPara(Math.max(0,foco-1)),
        style:{width:34,height:34,borderRadius:'50%',border:'1px solid var(--line-2)',
          display:'flex',alignItems:'center',justifyContent:'center',
          opacity:foco===0?.3:1,background:'var(--surf)'}},
        h(Icon,{n:'chevL',s:15,c:'var(--ink-2)'})),
      h('div',{style:{display:'flex',gap:6,alignItems:'center'}},
        dias.map((d,i)=>h('button',{key:d,onClick:()=>irPara(i),
          style:{width:i===foco?20:6,height:6,borderRadius:6,padding:0,
            background:i===foco?'var(--pink)':'var(--ink-4)',
            opacity:i===foco?1:.42,
            transition:'all .38s cubic-bezier(.34,1.56,.64,1)'}}))),
      h('button',{className:'press',onClick:()=>irPara(Math.min(dias.length-1,foco+1)),
        style:{width:34,height:34,borderRadius:'50%',border:'1px solid var(--line-2)',
          display:'flex',alignItems:'center',justifyContent:'center',
          opacity:foco===dias.length-1?.3:1,background:'var(--surf)'}},
        h(Icon,{n:'chevR',s:15,c:'var(--ink-2)'}))));
};

/* ═══════════════════════════════════════════════════════════
   BIBLIOTECA — hero da fase + a roda de aulas
═══════════════════════════════════════════════════════════ */
const TelaBiblioteca = ({s, set, go}) => {
  const dAtual = DIAS[s.diaAtual]||DIAS[1];
  const [fase,setFase] = useState(dAtual.fase);
  const rg = fase===1?[1,7]:fase===2?[8,14]:[15,21];
  const dias = Array.from({length:7},(_,i)=>rg[0]+i);
  const f = FASES.find(x=>x.id===fase);
  const lidosTot = Object.values(s.lidos||{}).reduce((a,v)=>a+(v?v.length:0),0);
  const totalBlocos = 21*BLOCOS_DIA.length;
  const cenaFase = ['medida','transverso','identidade'][fase-1];
  const corFase = ['pink','gold','violet'][fase-1];
  const feitosFase = s.diasFeitos.filter(d=>d>=rg[0]&&d<=rg[1]).length;

  return h('div',{className:'screen-anim',style:{paddingBottom:20}},

    /* ═══ HERO DA FASE ═══ */
    h('div',{style:{padding:'2px 18px 0'}},
      h(Reveal,{tipo:'rv-s'},
        h('div',{className:'on-photo lift',style:{position:'relative',overflow:'hidden',
          borderRadius:'var(--r-lg)',minHeight:250,display:'flex',flexDirection:'column',
          justifyContent:'flex-end',boxShadow:'var(--sh-md)'}},
          h(FotoCena,{key:cenaFase,cena:cenaFase,h:250,zoom:.6,silX:'80%',silOp:.6,
            style:{position:'absolute',inset:0}}),
          h('div',{style:{position:'absolute',inset:0,
            background:'linear-gradient(180deg, rgba(6,3,6,.35) 0%, rgba(6,3,6,.20) 34%, rgba(6,3,6,.82) 78%, rgba(6,3,6,.94) 100%)'}}),
          h('div',{style:{position:'relative',zIndex:3,padding:20}},
            h('span',{className:'chip',style:{background:'rgba(0,0,0,.45)',
              backdropFilter:'blur(12px)',color:CORES[corFase],
              borderColor:'rgba(255,255,255,.2)',marginBottom:12,display:'inline-flex'}},
              `FASE 0${f.id} · ${f.range.toUpperCase()}`),
            h('h1',{style:{fontFamily:'var(--f-display)',fontSize:31,fontWeight:600,
              letterSpacing:'-.04em',lineHeight:1.04,marginBottom:8,color:'#fff'}},f.nome),
            h('p',{style:{fontSize:13,lineHeight:1.5,color:'rgba(255,255,255,.74)',
              maxWidth:'34ch',marginBottom:15}},f.desc),
            h('div',{style:{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}},
              [[`${feitosFase}/7`,'DIAS FEITOS'],[f.perda,'PERDA TÍPICA'],
               [`${f.chaves.length} chaves`,'NESTA FASE']].map(([v,l],i)=>
                h('div',{key:i},
                  h('div',{style:{fontFamily:'var(--f-display)',fontSize:16,fontWeight:600,
                    color:'#fff',letterSpacing:'-.02em'}},v),
                  h('div',{className:'mono',style:{fontSize:7.5,letterSpacing:'.12em',
                    color:'rgba(255,255,255,.55)',marginTop:2}},l))),
              h('button',{className:'fab-go',onClick:()=>go('dia',s.diaAtual),
                style:{marginLeft:'auto'}},
                h(Icon,{n:'arrowUR',s:19,c:'#06120b',w:2.4}))))))),

    /* ═══ PROGRESSO DE LEITURA ═══ */
    h('div',{style:{padding:'0 18px'}},
      h(SecHead,{t:'CONHECIMENTO DESTRAVADO'}),
      h(Reveal,{tipo:'rv-s'},
        h('div',{className:'card',style:{padding:'16px 18px',display:'flex',
          alignItems:'center',gap:15}},
          h(Anel,{v:lidosTot/totalBlocos,size:56,sw:5,cor:'var(--gold)'},
            h('div',{className:'mono',style:{fontSize:12,fontWeight:700,color:'var(--gold)'}},
              Math.round(lidosTot/totalBlocos*100),'%')),
          h('div',{style:{flex:1,minWidth:0}},
            h('div',{style:{fontFamily:'var(--f-display)',fontSize:17,fontWeight:600,
              letterSpacing:'-.025em',marginBottom:4}},`${lidosTot} de ${totalBlocos} blocos lidos`),
            h('div',{style:{fontSize:11.5,color:'var(--ink-3)'}},
              `${s.diasFeitos.length} dias concluídos · +${XP_BLOCO} XP por bloco`))))),

    /* ═══ SELETOR DE FASE ═══ */
    h('div',{style:{padding:'0 18px'}},
      h(SecHead,{t:'ESCOLHA A FASE'}),
      h('div',{style:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:9}},
        FASES.map((x,i)=>
          h(Reveal,{key:x.id,tipo:'rv-s',delay:i*70},
            h('button',{onClick:()=>setFase(x.id),className:'card lift press',
              style:{width:'100%',padding:'13px 9px',textAlign:'center',
                borderColor: fase===x.id?CORES[['pink','gold','violet'][i]]:'var(--line)',
                background: fase===x.id?CORES_SOFT[['pink','gold','violet'][i]]:'var(--surf)'}},
              h('div',{className:'mono',style:{fontSize:8.5,letterSpacing:'.11em',
                color:fase===x.id?CORES[['pink','gold','violet'][i]]:'var(--ink-4)',
                marginBottom:5}},`FASE 0${x.id}`),
              h('div',{style:{fontFamily:'var(--f-display)',fontSize:14,fontWeight:600,
                letterSpacing:'-.02em',lineHeight:1.1}},x.nome)))))),

    /* ═══ OS DIAS — CARROSSEL HORIZONTAL ═══ */
    h('div',{style:{padding:'0 18px'}},
      h(SecHead,{t:'OS 7 DIAS DESTA FASE',acao:'Ver hoje',onAcao:()=>go('dia',s.diaAtual)})),
    h(CarrosselDias,{dias:dias.filter(d=>d<=21), s, go}),

    /* frase da fase */
    h('div',{style:{padding:'8px 18px 0'}},
      h(Reveal,{delay:60},
        h('p',{style:{fontFamily:'var(--f-display)',fontStyle:'italic',fontSize:15.5,
          color:'var(--ink-2)',lineHeight:1.5,textAlign:'center',
          padding:'20px 10px'}},`“${f.desc}”`))));
};

/* ═══════════════════════════════════════════════════════════
   SALA DE LEITURA DO DIA — sanfona real por tópico
═══════════════════════════════════════════════════════════ */
const Passo = ({n, children, cor}) =>
  h('div',{style:{display:'flex',gap:13,marginBottom:13}},
    h('span',{style:{width:26,height:26,borderRadius:'50%',flexShrink:0,
      background:CORES_SOFT[cor],border:`1px solid color-mix(in srgb, ${CORES[cor]} 30%, transparent)`,
      display:'flex',alignItems:'center',justifyContent:'center',
      fontFamily:'var(--f-mono)',fontSize:11,fontWeight:700,color:CORES[cor]}},n),
    h('p',{style:{flex:1,fontSize:14,lineHeight:1.62,color:'var(--ink-2)'}},children));

const SubBloco = ({t, sub, cor, lido, onLer, children}) =>
  h('div',{style:{marginBottom:20}},
    h('div',{style:{display:'flex',alignItems:'center',gap:9,marginBottom:11}},
      h('span',{style:{width:5,height:5,borderRadius:'50%',background:CORES[cor]}}),
      h('span',{style:{fontFamily:'var(--f-display)',fontSize:16.5,fontWeight:600,
        letterSpacing:'-.025em'}},t),
      lido && h('span',{style:{width:17,height:17,borderRadius:'50%',background:'var(--mint)',
        display:'flex',alignItems:'center',justifyContent:'center',marginLeft:'auto'}},
        h(Icon,{n:'check',s:10,c:'#04140f',w:3.4}))),
    sub && h('p',{style:{fontSize:11.5,color:'var(--ink-4)',marginBottom:10,
      marginLeft:14}},sub),
    h('div',{style:{marginLeft:14,paddingLeft:12,
      borderLeft:`1px solid color-mix(in srgb, ${CORES[cor]} 22%, transparent)`}},children));

const TelaDia = ({s, set, go, toast}) => {
  const d = s.diaAtual, dia = DIAS[d]||DIAS[1];
  const ch = CHAVES.find(c=>c.id===dia.chave);
  const cor = ['pink','mint','violet','gold','coral','mint','pink'][ch.id-1];
  const cena = CENA_POR_CHAVE[dia.chave]||'medida';
  const fase = FASES.find(f=>f.id===dia.fase);
  const ob = OBJETIVOS[d] || OBJETIVOS[1];
  const vids = videosDoDia(d);
  const alt = alternativaDoDia(d, ch.id);
  const lidos = s.lidos[d] || [];
  const feito = s.diasFeitos.includes(d);
  const [selo,setSelo] = useState(false);
  const [aberto,setAberto] = useState('desenv');

  const ler = id => {
    if(lidos.includes(id)) return;
    const novos=[...lidos,id];
    set(p=>({...p, xp:p.xp+XP_BLOCO, lidos:{...p.lidos,[d]:novos}}));
    if(novos.length===BLOCOS_DIA.length){
      soltarConfete();
      toast('Leitura completa','Todos os blocos deste dia conquistados','book');
    }
  };
  const verVideo = i => { if(s.videos[`${d}-${i}`]) return;
    set(p=>({...p, xp:p.xp+XP_VIDEO, videos:{...p.videos,[`${d}-${i}`]:true}})); };

  const concluir = () => {
    if(feito) return;
    soltarConfete(); setSelo(true);
    set(p=>({...p, xp:p.xp+XP_DIA_LEITURA,
      diasFeitos:[...p.diasFeitos,d].sort((a,b)=>a-b),
      streak:p.streak+1, diaAtual:Math.min(21,d+1)}));
    toast('Dia conquistado',`+${XP_DIA_LEITURA} XP · a curva continua`,'trophy');
    setTimeout(()=>setSelo(false),2800);
  };

  const prog = lidos.length/BLOCOS_DIA.length;

  /* ─── os 4 tópicos em sanfona ─── */
  const TOPICOS = [
    {id:'desenv', n:1, t:'Desenvolvimento', s:'a cena, a trava e o mecanismo',
     ico:'book', c:cor, blocos:['cena','trava','mec'],
     corpo:()=>h('div',null,
       h(SubBloco,{t:'A cena',sub:'onde isso começa na sua vida real',cor,
         lido:lidos.includes('cena'),onLer:()=>ler('cena')},
         h(Rico,{t:dia.cena})),
       h(SubBloco,{t:'A trava',sub:'o que está segurando a sua cintura',cor,
         lido:lidos.includes('trava')},
         h('div',{style:{padding:'13px 14px',borderRadius:'var(--r-sm)',marginBottom:12,
           background:CORES_SOFT[cor],
           border:`1px solid color-mix(in srgb, ${CORES[cor]} 26%, transparent)`}},
           h('div',{style:{fontFamily:'var(--f-display)',fontSize:15,fontWeight:600,
             letterSpacing:'-.02em',lineHeight:1.3}},dia.trava)),
         h(Rico,{t:dia.travaSub})),
       h(SubBloco,{t:'O mecanismo',sub:'a fisiologia por trás, explicada',cor,
         lido:lidos.includes('mec')},
         dia.mecanismo.split('\n\n').map((p,i)=>h(Rico,{key:i,t:p}))))},

    {id:'prat', n:2, t:'A prática', s:'a chave do dia e como executar',
     ico:'target', c:'gold', blocos:['ferr','vids'],
     corpo:()=>h('div',null,
       h('div',{className:'card sweep',style:{padding:20,marginBottom:20,position:'relative',
         overflow:'hidden',borderColor:'var(--line-gold)',
         background:'linear-gradient(150deg, var(--gold-soft), transparent 62%), var(--surf-2)'}},
         h('div',{className:'eyebrow eyebrow-gold',style:{marginBottom:9}},
           '◆ A CHAVE DO DIA · A AÇÃO QUE DESTRAVA'),
         h('div',{style:{fontFamily:'var(--f-display)',fontSize:21,fontWeight:600,
           letterSpacing:'-.03em',lineHeight:1.16,marginBottom:8}},dia.chaveDia),
         h('p',{style:{fontSize:13,lineHeight:1.6,color:'var(--ink-2)'}},dia.chaveSub)),
       h(SubBloco,{t:'Como executar',sub:`${dia.ferramenta.length} passos, na ordem`,cor:'gold',
         lido:lidos.includes('ferr')},
         dia.ferramenta.map((x,i)=>h(Passo,{key:i,n:i+1,cor:'gold'},x))),
       /* PLANO B DE MATERIAL */
       h('div',{className:'card',style:{padding:18,marginBottom:20,
         borderColor:'var(--line-2)',background:'var(--surf-2)'}},
         h('div',{style:{display:'flex',alignItems:'center',gap:10,marginBottom:12}},
           h('span',{style:{width:34,height:34,borderRadius:12,flexShrink:0,
             background:'var(--coral-soft)',display:'flex',alignItems:'center',
             justifyContent:'center'}},h(Icon,{n:alt.ico,s:16,c:'var(--coral)'})),
           h('div',null,
             h('div',{className:'mono',style:{fontSize:8,letterSpacing:'.12em',
               color:'var(--coral)',marginBottom:3}},'SEM DESCULPA · PLANO B'),
             h('div',{style:{fontFamily:'var(--f-display)',fontSize:16,fontWeight:600,
               letterSpacing:'-.02em'}},alt.t))),
         alt.opts.map((o,i)=>
           h('div',{key:i,style:{display:'flex',gap:11,marginBottom:12}},
             h('span',{className:'mono',style:{fontSize:10,fontWeight:700,
               color:'var(--coral)',minWidth:18,paddingTop:2}},`0${i+1}`),
             h('div',{style:{flex:1}},
               h('div',{style:{fontSize:13.5,fontWeight:600,marginBottom:3,
                 letterSpacing:'-.01em'}},o.a),
               h('div',{style:{fontSize:12.5,lineHeight:1.55,color:'var(--ink-3)'}},o.d)))),
         h('p',{style:{fontSize:12,lineHeight:1.55,color:'var(--ink-2)',marginTop:6,
           paddingTop:12,borderTop:'1px dashed var(--line-2)',fontStyle:'italic'}},alt.obs)),
       h(SubBloco,{t:'Vídeos-referência',sub:`${vids.length} em espanhol, sem legendas`,
         cor:'violet',lido:lidos.includes('vids')},
         h('p',{style:{fontSize:12.5,lineHeight:1.6,color:'var(--ink-3)',marginBottom:13}},
           'Demonstrações visuais gravadas por profissionais nativos. Nenhuma legenda cobre o movimento — é olhar e repetir.'),
         vids.map((v,i)=>h(VideoCard,{key:i,v,visto:!!s.videos[`${d}-${i}`],
           onVer:()=>verVideo(i)}))))},

    {id:'dicas', n:3, t:'Dicas', s:'regras e sinais de que funciona',
     ico:'bulb', c:'coral', blocos:['regras','sentir'],
     corpo:()=>h('div',null,
       h(SubBloco,{t:'Regras de hoje',sub:'o que não pode faltar',cor:'coral',
         lido:lidos.includes('regras')},
         dia.regras.map((x,i)=>
           h('div',{key:i,style:{display:'flex',gap:11,marginBottom:11,alignItems:'flex-start'}},
             h('span',{style:{marginTop:7,width:5,height:5,borderRadius:'50%',flexShrink:0,
               background:'var(--coral)'}}),
             h('p',{style:{flex:1,fontSize:14,lineHeight:1.6,color:'var(--ink-2)'}},x)))),
       h(SubBloco,{t:'O que você vai sentir',sub:'sinais de que está funcionando',cor:'mint',
         lido:lidos.includes('sentir')},
         dia.sentir.map((x,i)=>
           h('div',{key:i,style:{display:'flex',gap:11,marginBottom:11,alignItems:'flex-start'}},
             h(Icon,{n:'check',s:14,c:'var(--mint)',w:2.4,style:{marginTop:4,flexShrink:0}}),
             h('p',{style:{flex:1,fontSize:14,lineHeight:1.6,color:'var(--ink-2)'}},x)))))},

    {id:'apoio', n:4, t:'Material de apoio', s:'receita e ciência do dia',
     ico:'film', c:'violet', blocos:['rec','cien'],
     corpo:()=>h('div',null,
       h(SubBloco,{t:'Receita do dia',sub:dia.receita.nome,cor:'mint',
         lido:lidos.includes('rec')},
         h('p',{style:{fontFamily:'var(--f-display)',fontStyle:'italic',fontSize:14,
           color:'var(--ink-2)',marginBottom:14,lineHeight:1.5}},dia.receita.prop),
         h('div',{className:'eyebrow',style:{marginBottom:9}},'INGREDIENTES'),
         h('div',{style:{display:'flex',flexWrap:'wrap',gap:7,marginBottom:15}},
           dia.receita.ing.map((x,i)=>h('span',{key:i,className:'chip',
             style:{textTransform:'none',fontFamily:'var(--f-ui)',fontSize:11.5,
               letterSpacing:0,fontWeight:500}},x))),
         h('div',{className:'eyebrow',style:{marginBottom:9}},'MODO DE FAZER'),
         (dia.receita.modo||[]).map((x,i)=>h(Passo,{key:i,n:i+1,cor:'mint'},x))),
       h(SubBloco,{t:'Ciência deste dia',sub:`${dia.ciencia.length} estudos verificáveis`,
         cor:'violet',lido:lidos.includes('cien')},
         dia.ciencia.map((c,i)=>
           h('a',{key:i,href:c.u,target:'_blank',rel:'noopener',className:'card lift press',
             style:{display:'block',padding:14,marginBottom:9}},
             h('div',{style:{display:'flex',alignItems:'center',gap:7,marginBottom:7}},
               h('span',{className:'chip',style:{padding:'3px 8px',fontSize:7.5,
                 background:c.n==='A'?'var(--mint-soft)':'var(--gold-soft)',
                 color:c.n==='A'?'var(--mint)':'var(--gold)',borderColor:'transparent'}},
                 `NÍVEL ${c.n}`),
               h(Icon,{n:'arrowUR',s:13,c:'var(--ink-4)',style:{marginLeft:'auto'}})),
             h('div',{style:{fontSize:13,fontWeight:600,lineHeight:1.38,marginBottom:5,
               letterSpacing:'-.015em'}},c.t),
             h('div',{className:'mono',style:{fontSize:10,color:'var(--ink-4)'}},c.r)))))},
  ];

  const alternar = id => {
    const abrindo = aberto!==id;
    setAberto(abrindo? id : null);
    if(abrindo){
      const t = TOPICOS.find(x=>x.id===id);
      t && t.blocos.forEach(b=>ler(b));
    }
  };

  return h('div',{className:'screen-anim'},

    /* ═══ CAPA ═══ */
    h('div',{className:'on-photo',style:{position:'relative',minHeight:296}},
      h(FotoCena,{cena,h:296,zoom:.62,silX:'78%',silOp:.62,
        style:{position:'absolute',inset:0}}),
      h('div',{style:{position:'absolute',inset:0,
        background:'linear-gradient(180deg, rgba(6,3,6,.52) 0%, rgba(6,3,6,.18) 32%, rgba(6,3,6,.72) 70%, rgba(6,3,6,.93) 100%)'}}),
      h('div',{style:{position:'relative',zIndex:3,padding:'16px 20px 30px',minHeight:296,
        display:'flex',flexDirection:'column'}},
        h('div',{style:{display:'flex',alignItems:'center',gap:10}},
          h('button',{className:'ibtn press',onClick:()=>go('conteudo'),
            style:{background:'rgba(0,0,0,.4)',backdropFilter:'blur(10px)',
              borderColor:'rgba(255,255,255,.18)'}},
            h(Icon,{n:'chevL',s:17,c:'#fff'})),
          h('span',{className:'mono',style:{flex:1,textAlign:'center',fontSize:9,
            letterSpacing:'.15em',color:'rgba(255,255,255,.68)'}},
            `${fase.nome.toUpperCase()} · DIA ${String(d).padStart(2,'0')} DE 21`),
          h('button',{className:'ibtn press',style:{background:'rgba(0,0,0,.4)',
            backdropFilter:'blur(10px)',borderColor:'rgba(255,255,255,.18)'},
            onClick:()=>set(p=>({...p,favoritos:(p.favoritos||[]).includes(d)
              ? p.favoritos.filter(x=>x!==d) : [...(p.favoritos||[]),d]}))},
            h(Icon,{n:'heart',s:16,c:'#fff',
              fill:(s.favoritos||[]).includes(d)?'#fff':'none'}))),
        h('div',{style:{marginTop:'auto'}},
          h('div',{className:'rise',style:{marginBottom:12}},
            h('span',{className:'chip',style:{background:'rgba(0,0,0,.45)',
              backdropFilter:'blur(12px)',color:CORES[cor],
              borderColor:'rgba(255,255,255,.2)'}},
              h(Icon,{n:'key',s:10}),`CHAVE ${String(ch.id).padStart(2,'0')} · ${ch.nome}`)),
          h('h1',{className:'rise d1',style:{fontFamily:'var(--f-display)',fontSize:33,
            fontWeight:600,letterSpacing:'-.04em',lineHeight:1.04,marginBottom:9,
            color:'#fff',textShadow:'0 2px 20px rgba(0,0,0,.55)'}},dia.titulo),
          h('p',{className:'rise d2',style:{fontFamily:'var(--f-display)',fontStyle:'italic',
            fontSize:15,lineHeight:1.45,color:'rgba(255,255,255,.78)',maxWidth:'36ch'}},
            dia.sub)))),

    /* corpo sobe sobre a capa */
    h('div',{style:{position:'relative',zIndex:4,marginTop:-20,
      borderRadius:'26px 26px 0 0',background:'var(--bg)',
      padding:'22px 18px 40px'}},

      /* progresso */
      h(Reveal,{tipo:'rv-s'},
        h('div',{className:'card',style:{padding:'14px 16px',display:'flex',
          alignItems:'center',gap:13}},
          h('span',{style:{width:34,height:34,borderRadius:12,flexShrink:0,
            background:CORES_SOFT[cor],display:'flex',alignItems:'center',
            justifyContent:'center'}},h(Icon,{n:'book',s:16,c:CORES[cor]})),
          h('span',{style:{flex:1}},
            h('span',{className:'mono',style:{display:'block',fontSize:9,letterSpacing:'.1em',
              color:'var(--ink-4)',marginBottom:6}},'PROGRESSO DE LEITURA'),
            h('span',{className:'bar',style:{display:'block',height:5}},
              h('span',{className:`bar-fill ${prog>=1?'mint':''}`,
                style:{width:`${prog*100}%`,display:'block'}}))),
          h('span',{className:'mono',style:{fontSize:12,fontWeight:700,
            color:prog>=1?'var(--mint)':'var(--ink-2)'}},
            `${lidos.length}/${BLOCOS_DIA.length}`))),

      /* ═══ 1. O QUE SE ESPERA ═══ */
      h(SecHead,{t:'O QUE SE ESPERA DE VOCÊ HOJE'}),
      h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}},
        ob.objs.map((o,i)=>h(ObjetivoFade,{key:i,o,i,cena}))),

      /* ═══ 2. INTRODUÇÃO ═══ */
      h(SecHead,{t:'INTRODUÇÃO'}),
      h(Reveal,{delay:40},
        h('div',{style:{paddingLeft:16,borderLeft:`2px solid ${CORES[cor]}`}},
          h('p',{style:{fontFamily:'var(--f-display)',fontStyle:'italic',fontSize:17,
            lineHeight:1.62,color:'var(--ink)'}}, ob.intro))),

      /* ═══ 3. TÓPICOS DO DIA — SANFONA ═══ */
      h(SecHead,{t:'TÓPICOS DO DIA'}),
      TOPICOS.map((t,i)=>{
        const on = aberto===t.id;
        const lidosT = t.blocos.filter(b=>lidos.includes(b)).length;
        return h(Reveal,{key:t.id,tipo:'rv-3d',delay:i*70},
          h('div',{className:`card ${on?'acc-open':''}`,
            style:{padding:0,marginBottom:12,overflow:'hidden',
              borderColor: on? `color-mix(in srgb, ${CORES[t.c]} 40%, transparent)` : 'var(--line)',
              background: on
                ? `linear-gradient(180deg, ${CORES_SOFT[t.c]}, transparent 30%), var(--surf)`
                : 'var(--surf)',
              boxShadow: on? `0 10px 34px ${HEX[t.c]}22` : 'none'}},
            h('button',{onClick:()=>alternar(t.id),className:'press',
              style:{width:'100%',display:'flex',alignItems:'center',gap:14,
                padding:'18px 18px',textAlign:'left'}},
              h('span',{style:{width:44,height:44,borderRadius:15,flexShrink:0,
                background:CORES_SOFT[t.c],display:'flex',alignItems:'center',
                justifyContent:'center',
                border:`1px solid color-mix(in srgb, ${CORES[t.c]} 26%, transparent)`,
                transition:'transform .45s cubic-bezier(.34,1.56,.64,1)',
                transform: on?'scale(1.06) rotate(-4deg)':'none'}},
                h(Icon,{n:t.ico,s:19,c:CORES[t.c]})),
              h('span',{style:{flex:1,minWidth:0}},
                h('span',{style:{display:'flex',alignItems:'center',gap:8,marginBottom:3}},
                  h('span',{className:'mono',style:{fontSize:9.5,fontWeight:700,
                    color:CORES[t.c],letterSpacing:'.1em'}},
                    `TÓPICO 0${t.n}`),
                  lidosT>0 && h('span',{className:'mono',style:{fontSize:8.5,
                    color:'var(--ink-4)'}},`${lidosT}/${t.blocos.length} lidos`)),
                h('span',{style:{display:'block',fontFamily:'var(--f-display)',fontSize:19,
                  fontWeight:600,letterSpacing:'-.028em',lineHeight:1.14}},t.t),
                h('span',{style:{display:'block',fontSize:12,color:'var(--ink-3)',
                  marginTop:3}},t.s)),
              h('span',{className:'acc-chev',style:{color:CORES[t.c],display:'flex',
                width:30,height:30,borderRadius:'50%',alignItems:'center',
                justifyContent:'center',background:CORES_SOFT[t.c]}},
                h(Icon,{n:'chevD',s:17}))),
            h('div',{className:'acc-body',
              style:{height: on?'auto':0, opacity: on?1:0}},
              on && h('div',{className:'acc-in',style:{padding:'4px 18px 22px'}}, t.corpo()))));
      }),

      /* ═══ CONCLUIR ═══ */
      h(Reveal,{tipo:'rv-s'},
        h('div',{style:{marginTop:32,textAlign:'center'}},
          selo && h('div',{className:'selo',style:{margin:'0 auto 18px',width:98,height:98,
            borderRadius:'50%',background:'var(--gold-soft)',border:'2px solid var(--gold)',
            display:'flex',alignItems:'center',justifyContent:'center',
            boxShadow:'0 0 46px var(--gold-glow)'}},
            h(Icon,{n:'trophy',s:38,c:'var(--gold)',w:1.6})),
          feito
            ? h('div',{className:'card',style:{padding:22,borderColor:'var(--mint-soft)',
                background:'var(--mint-soft)'}},
                h(Icon,{n:'check',s:26,c:'var(--mint)',w:2.6,style:{margin:'0 auto 11px'}}),
                h('div',{style:{fontFamily:'var(--f-display)',fontSize:19,fontWeight:600,
                  marginBottom:5}},'Dia concluído'),
                h('p',{style:{fontSize:12.5,color:'var(--ink-3)'}},
                  'Esta chave já está no seu chaveiro.'))
            : h('div',null,
                h('p',{style:{fontFamily:'var(--f-display)',fontStyle:'italic',fontSize:16,
                  color:'var(--ink-2)',marginBottom:18,lineHeight:1.5}},
                  '“Você não precisa ser perfeita. Só precisa continuar.”'),
                h('button',{className:'btn btn-pink press',style:{width:'100%'},
                  onClick:concluir},
                  h(Icon,{n:'check',s:17,w:2.4}),
                  `Concluir o Dia ${String(d).padStart(2,'0')} · +${XP_DIA_LEITURA} XP`)),
          h('button',{className:'btn btn-ghost press',style:{width:'100%',marginTop:10},
            onClick:()=>go('missoes')},
            'Ver as missões de hoje',h(Icon,{n:'chevR',s:15}))))));
};
