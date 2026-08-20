/* ═══════════════════════════════════════════════════════════
   APP ROOT — Início · Missões · [IA] · Conteúdo · Jornada
   (Evolução e Comunidade acessíveis pelos cards e pelo perfil)
═══════════════════════════════════════════════════════════ */

const TABS=[
  {id:'home',       ico:'home',    lbl:'Início'},
  {id:'missoes',    ico:'target',  lbl:'Missões'},
  {id:'conteudo',   ico:'book',    lbl:'Conteúdo'},
  {id:'coach',      ico:'spark',   lbl:'',        ai:true},
  {id:'jornada',    ico:'compass', lbl:'Jornada'},
  {id:'perfil',     ico:'user',    lbl:'Perfil'},
  {id:'comunidade', ico:'users',   lbl:'Grupo'},
];

const App = () => {
  const [s,setS]=useState(carregar);
  const [tela,setTela]=useState('home');
  const [sheet,setSheet]=useState(null);
  const [toastD,setToastD]=useState(null);
  const scrollRef=useRef(null);

  useEffect(()=>{ salvar(s); },[s]);
  useEffect(()=>{ document.documentElement.dataset.tema = s.tema||'escuro';
    const m=document.querySelector('meta[name=theme-color]');
    m && m.setAttribute('content', s.tema==='claro' ? '#FBF9FA' : '#0B0508'); },[s.tema]);
  useEffect(()=>{ scrollRef.current&&(scrollRef.current.scrollTop=0); },[tela]);
  useEffect(()=>{ instalarRipple(); },[]);

  const toast=useCallback((t,sub,ico='check')=>setToastD({t,sub,ico}),[]);
  const go=useCallback((t,dia)=>{ if(dia) setS(p=>({...p,diaAtual:dia})); setTela(t); },[]);
  const hora=useMemo(()=>{ const d=new Date();
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`; },[]);

  const P={s,set:setS,go,toast,setSheet};

  const telas={
    home:      ()=>h(TelaHome,P),
    missoes:   ()=>h(TelaMissoes,P),
    conteudo:  ()=>h(TelaBiblioteca,P),
    dia:       ()=>h(TelaDia,P),
    jornada:   ()=>h(TelaJornada,P),
    perfil:    ()=>h(TelaPerfil,P),
    evolucao:  ()=>h(TelaEvolucao,P),
    coach:     ()=>h(TelaCoach,P),
    comunidade:()=>h(TelaComunidade,P),
    checkin:   ()=>h(TelaCheckin,P),
    vacuum:    ()=>h(TelaVacuum,P),
    zone2:     ()=>h(TelaZone2,P),
    treino:    ()=>h(TelaLista,{titulo:'Treino de Força',sub:'8 movimentos · 10-15 min',go,
      itens:DIAS[9].ferramenta,
      render:(x,i)=>h('div',{key:i,className:'rise',style:{animationDelay:`${i*.05}s`,
        display:'flex',gap:13,alignItems:'flex-start',padding:14,marginBottom:9,
        background:'var(--surf)',border:'1px solid var(--line)',borderRadius:'var(--r-md)'}},
        h('div',{style:{width:31,height:31,borderRadius:11,flexShrink:0,
          background:'var(--coral-soft)',display:'flex',alignItems:'center',
          justifyContent:'center',fontFamily:'var(--f-mono)',fontSize:12,fontWeight:700,
          color:'var(--coral)'}},i+1),
        h('div',{style:{fontSize:13,lineHeight:1.5,color:'var(--ink-2)'}},x))}),
    receitas:  ()=>h(TelaLista,{titulo:'Receitas do Método',sub:'21 receitas-ferramenta',go,
      itens:Object.entries(DIAS),
      render:([n,d],i)=>h('button',{key:n,onClick:()=>go('conteudo',Number(n)),
        className:'rise',style:{animationDelay:`${i*.03}s`,width:'100%',textAlign:'left',
          display:'flex',gap:12,alignItems:'center',padding:13,marginBottom:9,
          background:'var(--surf)',border:'1px solid var(--line)',borderRadius:'var(--r-md)'}},
        h('div',{style:{width:38,height:38,borderRadius:13,flexShrink:0,
          background:'var(--mint-soft)',display:'flex',alignItems:'center',
          justifyContent:'center'}},h(Icon,{n:'plate',s:18,c:'var(--mint)'})),
        h('div',{style:{flex:1,minWidth:0}},
          h('div',{className:'mono',style:{fontSize:8,color:'var(--ink-4)',
            letterSpacing:'.1em',marginBottom:3}},`DIA ${String(n).padStart(2,'0')}`),
          h('div',{style:{fontSize:12.5,fontWeight:600,letterSpacing:'-.01em',
            lineHeight:1.25}},d.receita.nome)),
        h(Icon,{n:'chevR',s:15,c:'var(--ink-4)'}))}),
    ciencia:   ()=>h(TelaLista,{titulo:'Biblioteca Científica',sub:'40+ estudos verificáveis',go,
      itens:Object.values(DIAS).flatMap(d=>d.ciencia)
        .filter((v,i,a)=>a.findIndex(x=>x.t===v.t)===i),
      render:(c,i)=>h('a',{key:i,href:c.u,target:'_blank',rel:'noopener',className:'rise',
        style:{animationDelay:`${Math.min(i*.03,.4)}s`,display:'block',padding:13,marginBottom:9,
          background:'var(--surf)',border:'1px solid var(--line)',borderRadius:'var(--r-md)'}},
        h('div',{style:{display:'flex',alignItems:'center',gap:7,marginBottom:6}},
          h('span',{className:'chip',style:{fontSize:7.5,padding:'2px 7px',
            background:c.n==='A'?'var(--mint-soft)':'var(--gold-soft)',
            color:c.n==='A'?'var(--mint)':'var(--gold)',
            borderColor:c.n==='A'?'rgba(74,222,155,.28)':'var(--line-gold)'}},`NÍVEL ${c.n}`),
          h(Icon,{n:'arrowUR',s:12,c:'var(--ink-4)',style:{marginLeft:'auto'}})),
        h('div',{style:{fontSize:12.5,fontWeight:600,lineHeight:1.35,marginBottom:5,
          letterSpacing:'-.01em'}},c.t),
        h('div',{className:'mono',style:{fontSize:9.5,color:'var(--ink-4)'}},c.r))}),
  };

  const semTab=['vacuum','checkin','zone2'].includes(tela);
  const semBar=['dia'].includes(tela);
  const alternarTema=()=>setS(p=>({...p,tema:p.tema==='claro'?'escuro':'claro'}));

  if(!s.onboard) return h(Onboarding,{onFim:()=>setS(p=>({...p,onboard:true}))});

  return h('div',{className:'stage'},
    h('div',{className:'device'},
      h('div',{className:'viewport'},
        !semBar && h('header',{className:'appbar'},
          h('button',{className:'brand',onClick:()=>setTela('home')},
            h('span',{className:'brand-n'},'Calça Larga'),
            h('span',{className:'brand-21'},'21D')),
          h('div',{style:{marginLeft:'auto',display:'flex',alignItems:'center',gap:9}},
            h('button',{className:'ibtn',onClick:()=>setSheet('busca'),title:'Buscar'},
              h(Icon,{n:'search',s:16})),
            h('button',{className:'tema-sw',onClick:alternarTema,title:'Alternar tema'},
              h('span',{className:'tema-knob'},
                h(Icon,{n:s.tema==='claro'?'sun':'moon',s:12,
                  c:s.tema==='claro'?'var(--gold)':'var(--violet)'}))))),
        h('div',{ref:scrollRef,className:'screen',
          style: tela==='dia' ? {padding:0}
            : tela==='coach' ? {padding:0,overflow:'hidden'}
            : undefined},
          (telas[tela]||telas.home)()),

        !semTab && h('div',{className:'tabbar'},
          TABS.map(t=> t.ai
            ? h('button',{key:t.id,className:'tab-ai',onClick:()=>setTela('coach')},
                h(Icon,{n:'spark',s:23,c:'#fff',fill:tela==='coach'?'#fff':'none'}))
            : h('button',{key:t.id,className:`tab ${tela===t.id||(t.id==='conteudo'&&tela==='dia')?'on':''}`,
                onClick:()=>setTela(t.id)},
                h(Icon,{n:t.ico,s:20,fill:'none',
                  c:'currentColor',w:tela===t.id?2.4:1.8}),
                h('span',{className:'tab-lbl',
                  style:{fontSize:8.5,letterSpacing:'-.01em'}},t.lbl)))),

        sheet==='sos'   && h(SheetSOS,{s,onClose:()=>setSheet(null)}),
        sheet==='busca' && h(SheetBusca,{s,go,onClose:()=>setSheet(null)}),
        toastD && h(Toast,{txt:toastD.t,sub:toastD.sub,ico:toastD.ico,
          onClose:()=>setToastD(null)}))));
};

ReactDOM.createRoot(document.getElementById('root')).render(h(App));
