/* ═══════════════════════════════════════════════════════════
   INÍCIO — header com foto/nome/XP + 3 missões principais
═══════════════════════════════════════════════════════════ */

const HomeHeader = ({s, set, go}) => {
  const dia = DIAS[s.diaAtual] || DIAS[1];
  const fase = FASES.find(f=>f.id===dia.fase);
  const ch = CHAVES.find(c=>c.id===dia.chave);
  const feitos = s.missoes[s.diaAtual]||[];
  const totalM = 1 + MISSOES_DIARIAS.length;
  const pct = feitos.length/totalM;
  const nv = nivelDe(s.xp);

  const hr=new Date().getHours();
  const saud = hr<12?'Bom dia' : hr<18?'Boa tarde' : 'Boa noite';

  const ini=Math.max(1,Math.min(s.diaAtual-3,15));
  const semana=Array.from({length:7},(_,i)=>ini+i).filter(d=>d<=21);

  return h('div',{className:'on-photo',style:{position:'relative',overflow:'hidden',
    borderRadius:'0 0 32px 32px'}},

    /* CENA FOTOGRÁFICA COM MULHER — muda a cada dia */
    h(FotoCena,{cena:CENA_POR_CHAVE[dia.chave]||'medida',h:'auto',zoom:.52,
      silX:'82%', silOp:.5,
      tint:'linear-gradient(150deg, rgba(124,26,96,.42) 0%, rgba(60,14,58,.30) 48%, rgba(11,5,8,.55) 100%)',
      style:{position:'absolute',inset:0,height:'100%'}}),
    /* escurecimento para leitura */
    h('div',{style:{position:'absolute',inset:0,
      background:'linear-gradient(180deg, rgba(11,5,8,.72) 0%, rgba(11,5,8,.44) 26%, rgba(11,5,8,.78) 72%, rgba(11,5,8,.93) 93%, var(--bg) 100%)'}}),
    /* halo rosa atrás do anel de progresso */
    h('div',{style:{position:'absolute',left:'50%',top:'52%',width:300,height:300,
      transform:'translate(-50%,-50%)',pointerEvents:'none',
      background:'radial-gradient(circle, rgba(255,46,126,.20) 0%, transparent 62%)'}}),

    h('div',{style:{position:'relative',padding:'4px 18px 22px'}},

      /* ── LINHA 1: avatar + saudação/nome + XP + sino ── */
      h('div',{className:'rise',style:{display:'flex',alignItems:'center',gap:11,marginBottom:20}},
        h('button',{onClick:()=>go('perfil'),
          style:{width:40,height:40,borderRadius:'50%',flexShrink:0,
            border:'1.5px solid var(--line-pink)',background:'rgba(255,46,126,.1)',
            display:'flex',alignItems:'center',justifyContent:'center',
            backdropFilter:'blur(10px)'}},
          h(Icon,{n:'menu',s:17,c:'var(--pink)'})),

        h('div',{onClick:()=>go('perfil'),
          style:{flex:1,minWidth:0,display:'flex',alignItems:'center',gap:10,cursor:'pointer'}},
          h(Avatar,{size:42,ring:'var(--pink)'}),
          h('div',{style:{minWidth:0}},
            h('div',{style:{fontSize:11.5,color:'var(--ink-2)',fontWeight:500}},`${saud},`),
            h('div',{style:{fontFamily:'var(--f-display)',fontSize:20,fontWeight:600,
              letterSpacing:'-.03em',lineHeight:1.08,whiteSpace:'nowrap'}},
              s.nome,' ',h('span',{style:{fontSize:16}},'👋')))),

        /* PÍLULA DE XP */
        h('div',{style:{display:'flex',alignItems:'center',gap:6,flexShrink:0,
          padding:'7px 12px 7px 8px',borderRadius:'var(--r-full)',
          background:'rgba(245,201,123,.15)',border:'1px solid var(--line-gold)',
          backdropFilter:'blur(12px)'}},
          h('div',{style:{width:20,height:20,borderRadius:'50%',
            background:'linear-gradient(135deg,var(--gold),var(--gold-2))',
            display:'flex',alignItems:'center',justifyContent:'center'}},
            h(Icon,{n:'zap',s:11,c:'var(--on-gold, #1a1004)',fill:'var(--on-gold, #1a1004)',w:0})),
          h('div',{style:{lineHeight:1}},
            h('div',{className:'mono',style:{fontSize:13,fontWeight:700,color:'var(--gold)'}},
              s.xp.toLocaleString('pt-BR')),
            h('div',{className:'mono',style:{fontSize:7,color:'rgba(245,201,123,.65)',
              letterSpacing:'.1em',marginTop:1}},'XP'))),

        h('button',{style:{width:36,height:36,borderRadius:'50%',flexShrink:0,
          background:'var(--ov-2)',backdropFilter:'blur(10px)',
          border:'1px solid var(--ov-2)',
          display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}},
          h(Icon,{n:'bell',s:16,c:'#fff'}),
          h('span',{style:{position:'absolute',top:7,right:8,width:7,height:7,borderRadius:'50%',
            background:'var(--pink)',border:'1.5px solid #1a0812'}}))),

      /* ── Badge dia/fase ── */
      h('div',{className:'rise d1',style:{display:'flex',justifyContent:'center',marginBottom:11}},
        h('div',{style:{display:'inline-flex',alignItems:'center',gap:7,
          padding:'6px 13px',borderRadius:'var(--r-full)',
          background:'rgba(0,0,0,.4)',backdropFilter:'blur(14px)',
          border:'1px solid var(--ov-3)'}},
          h('span',{style:{width:6,height:6,borderRadius:'50%',background:fase.cor,
            boxShadow:`0 0 8px ${fase.cor}`}}),
          h('span',{className:'mono',style:{fontSize:9.5,fontWeight:600,letterSpacing:'.11em',
            textTransform:'uppercase',color:'var(--ink)'}},
            `Dia ${s.diaAtual} · ${fase.nome}`))),

      /* ── Título emocional ── */
      h('div',{className:'rise d2',style:{textAlign:'center',marginBottom:18}},
        h('div',{style:{fontFamily:'var(--f-display)',fontSize:33,fontWeight:600,
          letterSpacing:'-.04em',lineHeight:1.02,textShadow:'0 2px 24px rgba(0,0,0,.6)'}},
          pct>=1?'Dia completo!' : pct>=.5?'Você está evoluindo!' : 'Sua chave de hoje',
          ' ',h('span',{style:{fontSize:25}}, pct>=1?'👑':'✨')),
        h('div',{style:{fontSize:12.5,color:'var(--ink-2)',marginTop:6,
          fontStyle:'italic',fontFamily:'var(--f-display)'}}, dia.titulo)),

      /* ── Anel ── */
      h('div',{className:'rise d3',style:{display:'flex',justifyContent:'center',marginBottom:20}},
        h(Anel,{v:pct,size:152,sw:10,cor:'var(--pink)'},
          h('div',{style:{fontFamily:'var(--f-display)',fontSize:42,fontWeight:600,
            letterSpacing:'-.045em',lineHeight:1}}, Math.round(pct*100),
            h('span',{style:{fontSize:19,opacity:.75}},'%')),
          h('div',{className:'mono',style:{fontSize:8.5,letterSpacing:'.1em',
            textTransform:'uppercase',color:'var(--ink-3)',marginTop:3}},
            'da meta diária'),
          h('div',{style:{fontSize:10.5,color:'var(--pink-2)',marginTop:4,fontWeight:600}},
            `${feitos.length} de ${totalM} missões`))),

      /* ── Semana ── */
      h('div',{className:'rise d4',style:{display:'flex',justifyContent:'space-between',gap:4}},
        semana.map(d=>{
          const done=s.diasFeitos.includes(d), atual=d===s.diaAtual, fut=d>s.diaAtual;
          return h('button',{key:d,onClick:()=>!fut&&set(p=>({...p,diaAtual:d})),
            style:{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:6,
              opacity:fut?.36:1}},
            h('span',{className:'mono',style:{fontSize:8.5,letterSpacing:'.05em',
              color:atual?'var(--pink)':'var(--ink-3)',fontWeight:atual?700:500}},
              DIAS_SEM[(d+1)%7]),
            h('div',{style:{position:'relative',width:33,height:33,display:'flex',
              alignItems:'center',justifyContent:'center'}},
              done && h('svg',{width:33,height:33,style:{position:'absolute',inset:0,
                transform:'rotate(-90deg)'}},
                h('circle',{cx:16.5,cy:16.5,r:15,fill:'none',stroke:'var(--mint)',strokeWidth:2,
                  strokeLinecap:'round',style:{filter:'drop-shadow(0 0 4px rgba(74,222,155,.6))'}})),
              h('div',{style:{width:atual?33:29,height:atual?33:29,borderRadius:'50%',
                background:atual?'var(--pink)':done?'rgba(74,222,155,.12)':'var(--ov-1)',
                border:atual||done?'none':'1px solid var(--ov-2)',
                display:'flex',alignItems:'center',justifyContent:'center',
                fontFamily:'var(--f-display)',fontWeight:700,fontSize:12.5,
                color:atual?'#fff':done?'var(--mint)':'var(--ink-3)',
                boxShadow:atual?'0 4px 16px var(--pink-glow)':'none',
                transition:'all .3s cubic-bezier(.34,1.56,.64,1)'}}, d)));
        }))));
};

/* ─── Widget: Janela de Ouro ─── */
const JanelaOuro = ({s, set, toast}) => {
  const [now,setNow]=useState(new Date());
  useEffect(()=>{ const t=setInterval(()=>setNow(new Date()),30000); return()=>clearInterval(t); },[]);
  const j=s.janela, mAgora=now.getHours()*60+now.getMinutes();

  if(!j.abriu) return h('div',{className:'rise d5',style:{padding:'0 18px',marginTop:16}},
    h('div',{className:'card',style:{display:'flex',alignItems:'center',gap:13,
      background:'linear-gradient(135deg, var(--gold-soft), rgba(245,201,123,.02))',
      borderColor:'var(--line-gold)'}},
      h('div',{style:{width:44,height:44,borderRadius:14,flexShrink:0,
        background:'var(--gold-soft)',border:'1px solid var(--line-gold)',
        display:'flex',alignItems:'center',justifyContent:'center'}},
        h(Icon,{n:'clock',s:20,c:'var(--gold)'})),
      h('div',{style:{flex:1,minWidth:0}},
        h('div',{className:'eyebrow eyebrow-gold',style:{marginBottom:3}},'JANELA DE OURO'),
        h('div',{style:{fontSize:13,fontWeight:600,letterSpacing:'-.01em'}},'Ainda não abriu'),
        h('div',{style:{fontSize:11,color:'var(--ink-3)',marginTop:1}},
          'Abre com a Refeição 1 · fecha 10h depois')),
      h('button',{className:'btn btn-gold btn-sm',
        onClick:()=>{ set(p=>({...p,janela:{...p.janela,abriu:mAgora}}));
          toast('Janela de Ouro aberta',`Fecha às ${fmtHora((mAgora+600)%1440)}`,'clock'); }},
        'Abrir')));

  const fecha=(j.abriu+j.dur*60)%1440;
  const dec=(mAgora-j.abriu+1440)%1440, pct=clamp(dec/(j.dur*60),0,1);
  const rest=j.dur*60-dec, fechada=rest<=0;

  return h('div',{className:'rise d5',style:{padding:'0 18px',marginTop:16}},
    h('div',{className:'card',style:{
      background:fechada?'linear-gradient(135deg, rgba(74,222,155,.09), transparent)'
        :'linear-gradient(135deg, var(--gold-soft), transparent)',
      borderColor:fechada?'rgba(74,222,155,.24)':'var(--line-gold)'}},
      h('div',{style:{display:'flex',alignItems:'center',gap:13,marginBottom:12}},
        h(Anel,{v:pct,size:50,sw:5,cor:fechada?'var(--mint)':'var(--gold)'},
          h(Icon,{n:fechada?'check':'clock',s:17,c:fechada?'var(--mint)':'var(--gold)'})),
        h('div',{style:{flex:1,minWidth:0}},
          h('div',{className:'eyebrow',style:{color:fechada?'var(--mint)':'var(--gold)',marginBottom:3}},
            fechada?'JANELA FECHADA · JEJUM ATIVO':'JANELA DE OURO ABERTA'),
          h('div',{style:{fontFamily:'var(--f-display)',fontSize:20,fontWeight:600,
            letterSpacing:'-.03em',lineHeight:1}},
            fechada? 'Jejum ativo' : `${Math.floor(rest/60)}h ${rest%60}min restantes`),
          h('div',{style:{fontSize:11,color:'var(--ink-3)',marginTop:3}},
            fechada? 'Só água, chá e café puro até amanhã' : `${fmtHora(j.abriu)} → ${fmtHora(fecha)}`)),
        h('button',{onClick:()=>set(p=>({...p,janela:{...p.janela,abriu:null}})),
          style:{fontSize:10.5,color:'var(--ink-4)',padding:6}},'Reiniciar')),
      h(Bar,{v:pct,cor:fechada?'mint':'gold',h:5})));
};

/* ─── 3 MISSÕES PRINCIPAIS DE HOJE ─── */
const MissoesPrincipais = ({s, set, go, toast}) => {
  const chave = MISSAO_CHAVE[s.diaAtual];
  const principais = [chave, ...MISSOES_DIARIAS.slice(0,2)];
  const feitos = s.missoes[s.diaAtual]||[];

  const toggle=(m)=>{
    const on=feitos.includes(m.id);
    set(p=>({...p, missoes:{...p.missoes,[p.diaAtual]: on? feitos.filter(x=>x!==m.id):[...feitos,m.id]},
      xp:Math.max(0,p.xp+(on?-m.xp:m.xp))}));
    if(!on) toast(m.tipo==='diaria'?'Missão cumprida':'Chave destravada!',
      `+${m.xp} XP · ${m.nome}`, m.tipo==='diaria'?'check':'key');
  };

  return h('div',{style:{padding:'0 18px'}},
    h('div',{className:'sec-head'},
      h('span',{className:'sec-title'},'AS 3 PRINCIPAIS DE HOJE'),
      h('button',{className:'sec-action',onClick:()=>go('missoes')},
        'Ver todas',h(Icon,{n:'chevR',s:13}))),
    principais.map((m,i)=>{
      const on=feitos.includes(m.id), isKey=i===0;
      return h('button',{key:m.id,onClick:()=>toggle(m),className:'rise',
        style:{width:'100%',textAlign:'left',marginBottom:9,animationDelay:`${.3+i*.06}s`,
          background:on?'rgba(74,222,155,.055)'
            :isKey?'linear-gradient(135deg, rgba(245,201,123,.11), transparent)':'var(--surf)',
          border:`1px solid ${on?'rgba(74,222,155,.22)':isKey?'var(--line-gold)':'var(--line)'}`,
          borderRadius:'var(--r-md)',padding:'14px 15px',
          display:'flex',alignItems:'center',gap:13,position:'relative',overflow:'hidden',
          transition:'all .3s cubic-bezier(.34,1.56,.64,1)'}},
        isKey && h('div',{style:{position:'absolute',left:0,top:0,bottom:0,width:3,
          background:'linear-gradient(180deg,var(--gold),var(--gold-2))'}}),
        h('div',{style:{width:42,height:42,borderRadius:14,flexShrink:0,
          background:on?'var(--mint-soft)':CORES_SOFT[m.cor],
          display:'flex',alignItems:'center',justifyContent:'center'}},
          h(Icon,{n:m.ico,s:20,c:on?'var(--mint)':CORES[m.cor]})),
        h('div',{style:{flex:1,minWidth:0}},
          isKey && h('div',{className:'eyebrow eyebrow-gold',style:{marginBottom:3,fontSize:8}},
            '◆ MISSÃO-CHAVE'),
          h('div',{style:{fontSize:13.5,fontWeight:600,letterSpacing:'-.012em',lineHeight:1.25,
            color:on?'var(--ink-2)':'var(--ink)',
            textDecoration:on?'line-through':'none',
            textDecorationColor:'rgba(74,222,155,.5)'}}, m.nome),
          h('div',{style:{display:'flex',alignItems:'center',gap:7,marginTop:3}},
            h('span',{style:{fontSize:10.5,color:'var(--ink-3)'}},m.det))),
        h('div',{style:{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:5}},
          h('div',{className:`tick ${isKey?'gold':''} ${on?'on':''}`},
            h(Icon,{n:'check',s:14,c:'currentColor'})),
          h('span',{className:'mono',style:{fontSize:9,fontWeight:700,
            color:on?'var(--mint)':isKey?'var(--gold)':'var(--ink-4)'}},`+${m.xp}`)));
    }));
};

/* ─── Água Viva compacta ─── */
const AguaViva = ({s, set, toast}) =>
  h('div',{className:'rise d6',style:{padding:'0 18px',marginTop:6}},
    h('div',{className:'card',style:{padding:15}},
      h('div',{style:{display:'flex',alignItems:'center',gap:11,marginBottom:12}},
        h('div',{style:{width:32,height:32,borderRadius:11,background:'var(--mint-soft)',
          display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}},
          h(Icon,{n:'water',s:16,c:'var(--mint)'})),
        h('div',{style:{flex:1}},
          h('div',{style:{fontSize:13,fontWeight:700,letterSpacing:'-.01em'}},'Água Viva'),
          h('div',{style:{fontSize:10.5,color:'var(--ink-3)'}},'500 mL com eletrólitos por dose')),
        h('div',{className:'mono',style:{fontSize:14,fontWeight:700,
          color:s.agua>=4?'var(--mint)':'var(--ink-2)'}},
          s.agua,h('span',{style:{fontSize:10,color:'var(--ink-4)'}},'/4'))),
      h('div',{style:{display:'flex',gap:7}},
        Array.from({length:4},(_,i)=>{
          const on=i<s.agua;
          return h('button',{key:i,
            onClick:()=>{ const n=on&&i===s.agua-1?s.agua-1:i+1; set(p=>({...p,agua:n}));
              if(n===4) toast('Hidratação completa','2L de Água Viva hoje','water'); },
            style:{flex:1,height:42,borderRadius:12,position:'relative',overflow:'hidden',
              background:on?'var(--mint-soft)':'var(--ov-1)',
              border:`1px solid ${on?'rgba(74,222,155,.3)':'var(--line)'}`,
              display:'flex',alignItems:'flex-end',justifyContent:'center',paddingBottom:5,
              transition:'all .35s cubic-bezier(.34,1.56,.64,1)'}},
            on && h('div',{style:{position:'absolute',left:0,right:0,bottom:0,height:'60%',
              background:'linear-gradient(180deg, rgba(74,222,155,.35), rgba(74,222,155,.1))',
              animation:'rise .5s cubic-bezier(.16,1,.3,1) both'}}),
            h(Icon,{n:'water',s:15,c:on?'var(--mint)':'var(--ink-4)',
              fill:on?'var(--mint)':'none',style:{position:'relative',opacity:on?1:.5}}));
        }))));

/* ─── Card do conteúdo do dia ─── */
const ConteudoDoDia = ({s, go}) => {
  const dia=DIAS[s.diaAtual]||DIAS[1];
  const ch=CHAVES.find(c=>c.id===dia.chave);
  const ob=OBJETIVOS[s.diaAtual]||OBJETIVOS[1];
  return h('div',{style:{padding:'0 18px'}},
    h('div',{className:'sec-head'},
      h('span',{className:'sec-title'},'O CONTEÚDO DE HOJE'),
      h('span',{className:'chip chip-violet'},h(Icon,{n:'sparkle',s:10}),'IA ADAPTOU')),
    h('button',{className:'rise d7',onClick:()=>go('conteudo'),
      style:{width:'100%',textAlign:'left',borderRadius:'var(--r-lg)',overflow:'hidden',
        border:'1px solid var(--line-2)',boxShadow:'0 12px 36px rgba(0,0,0,.42)',padding:0}},
      h(FotoCena,{cena:CENA_POR_CHAVE[dia.chave],h:172,zoom:.82},
        h('div',{style:{position:'absolute',inset:0,padding:16,display:'flex',
          flexDirection:'column',justifyContent:'space-between'}},
          h('span',{className:'chip',style:{alignSelf:'flex-start',background:'rgba(0,0,0,.45)',
            color:ch.cor,borderColor:`${ch.cor}55`,backdropFilter:'blur(10px)'}},
            h(Icon,{n:'key',s:10}),`CHAVE ${String(ch.id).padStart(2,'0')} · ${ch.nome}`),
          h('div',null,
            h('div',{style:{fontFamily:'var(--f-display)',fontSize:25,fontWeight:600,
              letterSpacing:'-.035em',lineHeight:1.02,marginBottom:5,
              textShadow:'0 2px 14px rgba(0,0,0,.6)'}}, dia.titulo),
            h('div',{style:{fontSize:11.5,color:'var(--ink-2)',lineHeight:1.35}},
              dia.sub)))),
      h('div',{style:{padding:'13px 15px',background:'var(--surf)',
        display:'flex',alignItems:'center',gap:10}},
        h('div',{style:{flex:1,display:'flex',flexWrap:'wrap',gap:5}},
          ob.objs.slice(0,2).map((o,i)=>
            h('span',{key:i,style:{display:'inline-flex',alignItems:'center',gap:4,
              padding:'4px 8px',borderRadius:'var(--r-full)',background:CORES_SOFT[o.c],
              fontSize:10,color:CORES[o.c],fontWeight:600}},
              h(Icon,{n:o.i,s:10}),o.t))),
        h('div',{className:'btn btn-pink btn-sm',style:{padding:'9px 14px',flexShrink:0}},
          'Ler',h(Icon,{n:'chevR',s:13})))));
};

/* ─── SOS + Ferramentas ─── */
const SOSCard = ({onOpen}) =>
  h('div',{style:{padding:'0 18px',marginTop:16}},
    h('button',{onClick:onOpen,style:{width:'100%',textAlign:'left',
      background:'linear-gradient(135deg, rgba(255,122,92,.13), transparent)',
      border:'1px solid rgba(255,122,92,.26)',borderRadius:'var(--r-md)',
      padding:15,display:'flex',alignItems:'center',gap:12}},
      h('div',{style:{width:40,height:40,borderRadius:13,flexShrink:0,
        background:'var(--coral-soft)',display:'flex',alignItems:'center',justifyContent:'center'}},
        h(Icon,{n:'shield',s:19,c:'var(--coral)'})),
      h('div',{style:{flex:1}},
        h('div',{style:{fontSize:13,fontWeight:700,letterSpacing:'-.01em'}},'SOS Dia Difícil'),
        h('div',{style:{fontSize:11,color:'var(--ink-3)',marginTop:1}},
          'O mínimo que mantém seu streak vivo')),
      h(Icon,{n:'chevR',s:16,c:'var(--coral)'})));

const Ferramentas = ({s, go}) => {
  const mods=[
    {ico:'core',nome:'Vacuum Guide',det:'Timer 5×15s',cor:'gold',tela:'vacuum',
     tag:s.diaAtual>=8?null:'Dia 8'},
    {ico:'dumbbell',nome:'Treino de Força',det:'8 movimentos',cor:'coral',tela:'treino',
     tag:s.diaAtual>=9?null:'Dia 9'},
    {ico:'heart',nome:'Zone 2 Cardio',det:'Calculadora de FC',cor:'pink',tela:'zone2',
     tag:s.diaAtual>=10?null:'Dia 10'},
    {ico:'plate',nome:'Receitas',det:'21 do método',cor:'mint',tela:'receitas'},
    {ico:'book',nome:'Biblioteca',det:'40+ estudos',cor:'violet',tela:'ciencia'},
    {ico:'users',nome:'Comunidade',det:'Mulheres reais',cor:'pink',tela:'comunidade'},
  ];
  return h('div',{style:{padding:'0 18px'}},
    h('div',{className:'sec-head'},h('span',{className:'sec-title'},'FERRAMENTAS DO MÉTODO')),
    h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9}},
      mods.map((m,i)=>
        h('button',{key:m.nome,onClick:()=>go(m.tela),className:'rise',
          style:{animationDelay:`${.35+i*.05}s`,textAlign:'left',position:'relative',
            background:'var(--surf)',border:'1px solid var(--line)',
            borderRadius:'var(--r-md)',padding:14,minHeight:100,
            display:'flex',flexDirection:'column',justifyContent:'space-between',
            opacity:m.tag?.6:1}},
          m.tag && h('span',{style:{position:'absolute',top:10,right:10,
            padding:'2px 7px',borderRadius:'var(--r-full)',background:'var(--ov-1)',
            fontFamily:'var(--f-mono)',fontSize:8,color:'var(--ink-4)',letterSpacing:'.05em'}},
            m.tag),
          h('div',{style:{width:36,height:36,borderRadius:12,
            background:CORES_SOFT[m.cor],display:'flex',alignItems:'center',
            justifyContent:'center',marginBottom:12}},
            h(Icon,{n:m.ico,s:17,c:CORES[m.cor]})),
          h('div',null,
            h('div',{style:{fontSize:12.5,fontWeight:700,letterSpacing:'-.01em'}},m.nome),
            h('div',{style:{fontSize:10.5,color:'var(--ink-3)',marginTop:2}},m.det))))));
};

/* ─── Frase-âncora ─── */
const FraseFinal = ({s}) => {
  const fr=['Sua cintura não está gorda. Está travada. E você está destravando.',
    'Você não precisa ser perfeita. Só precisa continuar.',
    'O corpo responde. Sempre respondeu. Só faltava a linguagem certa.',
    'Nunca duas vezes seguidas. Essa é a única regra que importa.',
    'Vinte e um dias não mudam só o corpo. Mudam quem decide por ele.'];
  return h('div',{style:{padding:'24px 18px 0'}},
    h('div',{style:{padding:'24px 20px',borderRadius:'var(--r-lg)',
      background:'linear-gradient(135deg, rgba(255,46,126,.09), rgba(168,85,247,.05))',
      border:'1px solid var(--line-pink)',textAlign:'center',position:'relative',
      overflow:'hidden'}},
      h('div',{style:{position:'absolute',top:-30,left:'50%',transform:'translateX(-50%)',
        width:200,height:100,borderRadius:'50%',
        background:'radial-gradient(ellipse, var(--pink-mid), transparent 70%)',
        filter:'blur(30px)'}}),
      h('div',{style:{position:'relative',fontFamily:'var(--f-display)',fontStyle:'italic',
        fontSize:16.5,lineHeight:1.35,letterSpacing:'-.02em'}},
        `"${fr[s.diaAtual%fr.length]}"`),
      h('div',{className:'eyebrow eyebrow-pink',style:{marginTop:11}},'MÉTODO 7 CHAVES')));
};

/* ═══ TELA INÍCIO ═══ */
const TelaHome = ({s, set, go, toast, setSheet}) =>
  h('div',{className:'screen-anim'},
    h(HomeHeader,{s,set,go}),
    h(JanelaOuro,{s,set,toast}),
    h(AguaViva,{s,set,toast}),
    h('div',{style:{marginTop:18}},h(MissoesPrincipais,{s,set,go,toast})),
    h('div',{style:{marginTop:6}},h(ConteudoDoDia,{s,go})),
    h(FaseAtual,{s,go}),
    h(DestaqueDoDia,{s}),
    h(SOSCard,{onOpen:()=>setSheet('sos')}),
    h(Atalhos,{go}),
    h(Ferramentas,{s,go}),
    h(FraseFinal,{s}),
    h('div',{style:{height:18}}));

/* ═══════════════════════════════════════════════════════════
   ACRÉSCIMOS DA HOME — informação pertinente ao método
═══════════════════════════════════════════════════════════ */
const DESTAQUES = [
  {t:'A cintura responde antes da balança.', s:'Meça em jejum, sempre no mesmo ponto. A fita conta a verdade que o peso esconde.'},
  {t:'Proteína primeiro. Sempre.', s:'Comece toda refeição principal pela proteína — a saciedade chega antes da vontade de repetir.'},
  {t:'Nunca duas vezes seguidas.', s:'Falhar um dia é ruído. Falhar dois vira curva. O Modo Mínimo existe exatamente para isso.'},
  {t:'O vacuum não é abdominal.', s:'É reeducação. Você não queima gordura — encurta o cinto que já existe em você.'},
  {t:'Dormir é protocolo, não pausa.', s:'Abaixo de 6h de sono o corpo devolve gordura visceral mesmo com tudo o resto certo.'},
  {t:'Água com eletrólitos, não água pura.', s:'Sem sódio, potássio e magnésio, a água atravessa você sem hidratar a célula.'},
  {t:'Andar depois de comer vale mais que academia em jejum.', s:'Dez minutos de caminhada leve derrubam o pico de glicose em até 30%.'},
];

const DestaqueDoDia = ({s}) =>
  h('div',{style:{padding:'0 18px'}},
    h(SecHead,{t:'DESTAQUE DE HOJE'}),
    h(Reveal,{tipo:'rv-3d'},
      h('div',{className:'card lift',style:{padding:22,position:'relative',overflow:'hidden',
        borderColor:'var(--line-gold)',
        background:'linear-gradient(145deg, var(--gold-soft), transparent 62%), var(--surf)'}},
        h(Icon,{n:'quote',s:34,c:'var(--gold)',w:1.4,
          style:{position:'absolute',top:15,right:16,opacity:.2}}),
        h('div',{style:{fontFamily:'var(--f-display)',fontSize:21,fontWeight:600,
          letterSpacing:'-.03em',lineHeight:1.2,marginBottom:9,maxWidth:'22ch'}},
          DESTAQUES[(s.diaAtual-1)%DESTAQUES.length].t),
        h('p',{style:{fontSize:13.5,lineHeight:1.6,color:'var(--ink-2)',maxWidth:'40ch'}},
          DESTAQUES[(s.diaAtual-1)%DESTAQUES.length].s))));

const FaseAtual = ({s, go}) => {
  const dia = DIAS[s.diaAtual]||DIAS[1];
  const f = FASES.find(x=>x.id===dia.fase);
  const rg = f.id===1?[1,7]:f.id===2?[8,14]:[15,21];
  const feitosNaFase = s.diasFeitos.filter(d=>d>=rg[0]&&d<=rg[1]).length;
  const marco = [7,14,21].find(m=>m>=s.diaAtual) || 21;
  return h('div',{style:{padding:'0 18px'}},
    h(SecHead,{t:'ONDE VOCÊ ESTÁ'}),
    h(Reveal,{tipo:'rv-s'},
      h('div',{className:'card',style:{padding:20}},
        h('div',{style:{display:'flex',alignItems:'center',gap:14,marginBottom:16}},
          h('span',{style:{width:42,height:42,borderRadius:14,flexShrink:0,
            background:'var(--pink-soft)',border:'1px solid var(--line-pink)',
            display:'flex',alignItems:'center',justifyContent:'center'}},
            h(Icon,{n:'compass',s:19,c:'var(--pink)'})),
          h('div',{style:{flex:1,minWidth:0}},
            h('div',{className:'mono',style:{fontSize:8.5,letterSpacing:'.12em',
              color:'var(--ink-4)',marginBottom:4}},`FASE 0${f.id} · ${f.range.toUpperCase()}`),
            h('div',{style:{fontFamily:'var(--f-display)',fontSize:19,fontWeight:600,
              letterSpacing:'-.03em'}},f.nome)),
          h('div',{style:{textAlign:'right'}},
            h('div',{className:'mono',style:{fontSize:14,fontWeight:700,color:'var(--pink)'}},
              `${feitosNaFase}/7`),
            h('div',{className:'mono',style:{fontSize:8,color:'var(--ink-4)',
              letterSpacing:'.1em'}},'DIAS'))),
        h('div',{className:'bar',style:{marginBottom:14}},
          h('div',{className:'bar-fill',style:{width:`${feitosNaFase/7*100}%`}})),
        h('div',{style:{display:'flex',alignItems:'center',gap:11,padding:'13px 14px',
          borderRadius:'var(--r-sm)',background:'var(--gold-soft)',
          border:'1px solid var(--line-gold)'}},
          h(Icon,{n:'flag',s:16,c:'var(--gold)'}),
          h('div',{style:{flex:1}},
            h('div',{className:'mono',style:{fontSize:8,letterSpacing:'.11em',
              color:'var(--gold)',marginBottom:3}},'PRÓXIMO MARCO'),
            h('div',{style:{fontSize:13,fontWeight:600}},
              marco===7?'Dia 07 · Primeira medição real'
              :marco===14?'Dia 14 · A metade do caminho'
              :'Dia 21 · A virada')),
          h('span',{className:'mono',style:{fontSize:11,color:'var(--ink-3)'}},
            `${Math.max(0,marco-s.diaAtual)}d`)))));
};

const Atalhos = ({go}) => {
  const A=[
    {i:'book',  c:'pink',  t:'Biblioteca', s:'os 21 dias de conteúdo', a:'conteudo'},
    {i:'users', c:'violet',t:'Comunidade', s:'quem está com você',     a:'comunidade'},
    {i:'chart', c:'mint',  t:'Evolução',   s:'números e medalhas',     a:'evolucao'},
    {i:'target',c:'gold',  t:'Missões',    s:'a prática de hoje',      a:'missoes'},
  ];
  return h('div',{style:{padding:'0 18px'}},
    h(SecHead,{t:'IR DIRETO PARA'}),
    h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}},
      A.map((x,i)=>
        h(Reveal,{key:i,tipo:'rv-s',delay:i*70},
          h('button',{onClick:()=>go(x.a),className:'card lift',
            style:{width:'100%',padding:16,textAlign:'left'}},
            h('span',{style:{width:38,height:38,borderRadius:13,display:'flex',
              alignItems:'center',justifyContent:'center',marginBottom:11,
              background:CORES_SOFT[x.c]}},
              h(Icon,{n:x.i,s:17,c:CORES[x.c]})),
            h('span',{style:{display:'block',fontSize:14,fontWeight:600,
              letterSpacing:'-.015em'}},x.t),
            h('span',{style:{display:'block',fontSize:11.5,color:'var(--ink-3)',marginTop:2}},
              x.s))))));
};
