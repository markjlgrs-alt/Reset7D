/* ═══════════════════════════════════════════════════════════
   COACH IA · COMUNIDADE · TELAS AUXILIARES
═══════════════════════════════════════════════════════════ */

/* ═══ PERGUNTAS EM CHIPS — agrupadas por intenção ═══ */
const CHIPS_GRUPOS = [
  {g:'Meu corpo hoje', i:'heart', c:'pink', qs:[
    'Por que minha cintura variou?','Estou com muita fome hoje','Dormi mal, e agora?',
    'Estou na TPM, o que faço?','Minha barriga está estufada','Estou com dor lombar',
    'Estou inchada só à noite','Sinto tontura no jejum']},
  {g:'O protocolo', i:'key', c:'gold', qs:[
    'Posso pular a Janela de Ouro?','Como faço o vacuum certo?','Quanto tempo de Zona 2?',
    'O que é Refeição Espelho?','Preciso treinar todo dia?','Posso trocar a receita?',
    'Quanto de proteína por refeição?','Para que serve a Água Viva?']},
  {g:'Vida real', i:'users', c:'mint', qs:[
    'Vou comer fora hoje','Posso beber vinho hoje?','Não consegui fazer o treino',
    'Comi demais ontem','Viagem de trabalho, e agora?','Fim de semana conta?',
    'Não tenho tempo hoje','Como faço em dia de festa?']},
  {g:'Resultado', i:'chart', c:'violet', qs:[
    'Como está minha evolução?','A balança não desceu','Quantos cm eu perco por semana?',
    'Quando vejo diferença na calça?','Isso serve na menopausa?','E depois dos 21 dias?',
    'Vou recuperar o que perdi?','Quando tirar a próxima foto?']},
];

const TelaCoach = ({s, set, go}) => {
  const insights=useMemo(()=>gerarInsights({...s,
    perdaCintura:s.medidas.length>=2?s.medidas[0].cintura-s.medidas[s.medidas.length-1].cintura:0
  }),[s.diaAtual,s.streak,s.checkins.length,s.medidas.length]);
  const [msgs,setMsgs]=useState(s.chat.length?s.chat:[
    {de:'ia',t:`Oi, ${s.nome}. Analisei seus últimos dias — sua constância está em ${s.streak} dias e a cintura já respondeu. Pode me perguntar qualquer coisa sobre o protocolo, seu corpo ou um dia difícil.`}]);
  const [txt,setTxt]=useState('');
  const [digitando,setDigitando]=useState(false);
  const fim=useRef(null);
  useEffect(()=>{ fim.current?.scrollIntoView({behavior:'smooth'}); },[msgs,digitando]);

  /* sugestões rotativas — 20 perguntas, 4 por vez */
  const [bloco,setBloco]=useState(0);
  const [grupo,setGrupo]=useState(0);
  const sug=PERGUNTAS_COACH.slice(bloco*4,bloco*4+4);

  const responder=(p)=>{
    const d=DIAS[s.diaAtual], ch=CHAVES.find(c=>c.id===d.chave);
    const l=p.toLowerCase();
    const ultimoSono=s.checkins.slice(-1)[0]?.sono||7;
    const perda=s.medidas.length>=2?s.medidas[0].cintura-s.medidas[s.medidas.length-1].cintura:0;

    if(/cintura variou|variou|oscil/.test(l)) return {
      t:`Variação de 0,5 a 1,5 cm entre dias é retenção, não gordura. A linfa mesentérica responde a três coisas: sódio, sono e horário do jantar. Seu último check-in registrou ${ultimoSono}h de sono — abaixo de 7h o cortisol noturno sobe e retém líquido no abdômen.`,
      card:{l:'AJUSTE SUGERIDO',t:'Antecipe o jantar em 30 min',v:'−0,8 cm',d:'esperado em 48h'}};

    if(/fome|comer demais|ansiedade de comer/.test(l)) return {
      t:'Fome descontrolada tem três causas nessa ordem: sono curto (grelina +15%), proteína insuficiente no café (menos de 30g), ou janela aberta cedo demais. Faça o teste: beba 500ml de Água Viva e espere 20 minutos. Se a fome sumir, era sede ou tédio — não fome real.',
      card:{l:'PROTOCOLO IMEDIATO',t:'500ml de Água Viva + 20g de proteína',v:'20 min',d:'a fome real cede nesse tempo'}};

    if(/treino|não consegui|nao consegui|pulei|faltei/.test(l)) return {
      t:'Regra do método: nunca duas vezes seguidas. Um dia perdido é pausa; dois seguidos viram rotina nova. Hoje ainda dá: 20 agachamentos + 10 flexões na parede antes do banho. Três minutos e seu dia não zera.',
      card:{l:'MODO MÍNIMO',t:'20 agachamentos + 10 flexões',v:'3 min',d:'mantém o streak vivo'}};

    if(/evolu|progress|como estou|resultado/.test(l)) return {
      t:`Você está no Dia ${s.diaAtual}, com ${s.streak} dias de streak e ${perda.toFixed(1)} cm destravados. Isso está dentro da faixa esperada para esta fase (${FASES.find(x=>x.id===d.fase).perda} até o fim dela). A curva está correta — o que você precisa agora é só não interromper.`,
      card:{l:'SUA POSIÇÃO',t:`${perda.toFixed(1)} cm em ${s.diaAtual} dias`,
        v:`${Math.round(s.diasFeitos.length/21*100)}%`,d:'da jornada completa'}};

    if(/vinho|álcool|alcool|cerveja|beber/.test(l)) return {
      t:'Álcool destrói o sono profundo — justamente onde acontece a recomposição. Uma taça de vinho seco em dois ou três dias da semana cabe. Todo dia, não. E nunca depois das 20h, porque atrapalha o Bloco de Ouro. Se for beber hoje: uma taça, com a refeição, e um copo de água entre cada.',
      card:{l:'LIMITE SEGURO',t:'1 taça · até 2-3x por semana',v:'−40%',d:'de sono profundo por dose extra'}};

    if(/dormi mal|sono ruim|insônia|insonia|não durmo/.test(l)) return {
      t:`Dormiu mal? Hoje o corpo vai pedir 385 kcal a mais sem você perceber — é grelina alta e leptina baixa. A resposta não é resistir, é compensar: reforce proteína no café (45g em vez de 40), mantenha a Água Viva e adicione 20 min de Zone 2. E hoje à noite, deite uma hora mais cedo.`,
      card:{l:'PROTOCOLO PÓS-NOITE RUIM',t:'45g proteína + 20 min extras de Zone 2',
        v:'385 kcal',d:'é o que o sono ruim adiciona'}};

    if(/tpm|menstrua|ciclo|cólica|colica/.test(l)) return {
      t:'Na fase lútea a retenção sobe e a cintura pode marcar 1 a 2 cm a mais — não é gordura, é água e progesterona. Não meça hoje. Aumente magnésio (castanhas, folhas escuras), mantenha a proteína e use o Plano B do chocolate 70%. A cintura volta ao normal em 3 a 4 dias.',
      card:{l:'ESPERADO NA TPM',t:'+1 a 2 cm de retenção temporária',v:'3-4 dias',d:'para normalizar'}};

    if(/balança|balanca|peso não|peso nao|não perdi peso/.test(l)) return {
      t:'A balança é o instrumento errado para o que você está fazendo. Você está trocando gordura por massa magra — músculo pesa mais e ocupa menos espaço. Por isso o peso trava enquanto a cintura desce. Olhe a fita e a calça, não o número. Você já perdeu '+perda.toFixed(1)+' cm.',
      card:{l:'O QUE OLHAR',t:'Cintura, foto e calça-teste',v:perda.toFixed(1)+' cm',
        d:'seu progresso real'}};

    if(/janela|jejum|pular/.test(l)) return {
      t:'A Janela de Ouro não é jejum de sofrimento — é concentrar as refeições no bloco do dia em que seu corpo processa comida melhor. Se hoje for impossível, faça 11h ou 12h em vez de 10h. Melhor uma janela imperfeita todos os dias do que uma perfeita três vezes por semana.',
      card:{l:'FLEXIBILIDADE',t:'11h ou 12h em dia difícil',v:'10h',d:'o alvo ideal'}};

    if(/fora de casa|restaurante|viagem|viajando|trabalho/.test(l)) return {
      t:'Fora de casa a regra vira uma só: comece pela salada, depois a proteína, o carboidrato por último. Isso funciona em qualquer restaurante do mundo. Peça proteína grelhada, legumes, e deixe o arroz ou o pão para o final. Se tiver bebida, água entre cada uma.',
      card:{l:'REGRA UNIVERSAL',t:'Salada → proteína → carboidrato',v:'−73%',d:'no pico glicêmico'}};

    if(/dor|lesão|lesao|machuc/.test(l)) return {
      t:'Dor aguda ou pontual: pare e não force. Desconforto muscular difuso um ou dois dias depois é normal e passa. Se a dor for na lombar durante o vacuum, você provavelmente está prendendo a respiração errado — expire TODO o ar antes de sugar. Dor persistente, procure um profissional.',
      card:{l:'REGRA DE SEGURANÇA',t:'Dor aguda = parar. Desconforto = seguir',
        v:'48h',d:'para dor muscular normal'}};

    if(/desanima|desisti|difícil|dificil|cansada|sem vontade/.test(l)) return {
      t:`${s.nome}, você está no Dia ${s.diaAtual} com ${s.streak} dias seguidos. A maioria para no Dia 14 — e você já passou ou está chegando lá. Hoje não precisa ser perfeito. Faça só as duas do Modo Mínimo: 20g de proteína e 500ml de Água Viva. O streak continua. Amanhã é outro dia.`,
      card:{l:'MODO MÍNIMO ATIVADO',t:'Proteína + Água Viva. Só isso hoje.',
        v:s.streak+' dias',d:'que você não vai jogar fora'}};

    if(/quantos cm|quanto vou|expectativa/.test(l)) return {
      t:`A faixa esperada para os 21 dias completos é 4 a 7 cm em mulheres com sobrepeso moderado. Você está em ${perda.toFixed(1)} cm no Dia ${s.diaAtual}. A Semana 1 desincha, a Semana 2 recompõe, a Semana 3 consolida. A maior parte da mudança visível acontece entre os Dias 10 e 18.`,
      card:{l:'PROJEÇÃO',t:'4 a 7 cm ao completar os 21 dias',v:perda.toFixed(1)+' cm',
        d:'seu número hoje'}};

    if(/vacuum|hipopress/.test(l)) return {
      t:'Sinal de que está certo: você sente o abdômen "cavando" para dentro e para cima, não endurecendo para fora. Expire TODO o ar primeiro — forçando um pouco no final. Depois sugue sem inspirar. Se sentir tonteira, pare e retome mais devagar. De quatro é a posição mais eficaz.',
      card:{l:'CHECAGEM',t:'Cava para dentro, não endurece para fora',v:'5×15s',
        d:'em jejum, pela manhã'}};

    if(/comi demais|exagerei|saí da linha|sai da linha/.test(l)) return {
      t:'Uma refeição não muda nada. Sequência de refeições muda tudo. Volte na PRÓXIMA refeição — não amanhã, não segunda. Não pule refeição para compensar, isso ativa o ciclo de compulsão. Só siga o protocolo normal e faça 20 min de caminhada extra hoje.',
      card:{l:'PROTOCOLO DE VOLTA',t:'Próxima refeição normal + 20 min a pé',
        v:'0',d:'dias perdidos, se voltar agora'}};

    if(/jejum treino|treinar em jejum|jejum.*trein/.test(l)) return {
      t:'Sim, e é até melhor para o Zone 2 — com insulina baixa a lipase feminina trabalha mais. Para treino de força, se sentir fraqueza ou tontura, coma 15g de proteína antes. Beba a Água Viva sempre antes de sair, principalmente em jejum, para não cair a pressão.',
      card:{l:'RECOMENDADO',t:'Zone 2 em jejum · força com proteína antes',
        v:'+20%',d:'de oxidação de gordura em jejum'}};

    if(/menopausa|climat[eé]rio|hormon/.test(l)) return {
      t:'Este método foi desenhado exatamente para isso. A queda de estrogênio aumenta a gordura visceral e acelera a perda de massa magra — que é o que o treino de força e a proteína densa combatem diretamente. As Chaves 4 e 6 são especialmente relevantes para você.',
      card:{l:'FOCO NA MENOPAUSA',t:'Força + proteína densa + sono',v:'Chaves 4 e 6',
        d:'as mais importantes nessa fase'}};

    if(/proteína comprar|proteina comprar|whey|suplement/.test(l)) return {
      t:'Whey isolado se você tem sensibilidade a lactose, concentrado se não tem — a diferença prática é pequena. Caseína só para a noite. Creatina 3g/dia tem evidência forte para mulheres 40+. O resto (queimadores, chás, diuréticos) não é necessário e boa parte não tem evidência.',
      card:{l:'VALE A PENA',t:'Whey · caseína noturna · creatina 3g',v:'3',
        d:'suplementos com evidência real'}};

    return {t:`Hoje trabalhamos a Chave ${String(ch.id).padStart(2,'0')} — ${ch.nome}. ${ch.mecanismo.slice(0,180)}… A ação central de hoje é: ${d.chaveDia.toLowerCase()}.`,
      card:{l:`CHAVE ${String(ch.id).padStart(2,'0')}`,t:d.chaveDia,
        v:(OBJETIVOS[s.diaAtual]||OBJETIVOS[1]).objs[0].t,d:'o foco de hoje'}};
  };

  const enviar=(p)=>{
    const q=(p||txt).trim(); if(!q) return;
    setMsgs(m=>[...m,{de:'eu',t:q}]); setTxt(''); setDigitando(true);
    setTimeout(()=>{ setDigitando(false);
      setMsgs(m=>{ const n=[...m,{de:'ia',...responder(q)}];
        set(pv=>({...pv,chat:n.slice(-24)})); return n; });
      setBloco(b=>(b+1)%Math.ceil(PERGUNTAS_COACH.length/4));
    }, 900);
  };

  return h('div',{className:'screen-anim chat-wrap'},
    h('div',{style:{padding:'6px 18px 14px',borderBottom:'1px solid var(--line)',
      display:'flex',alignItems:'center',gap:12,flexShrink:0}},
      h('div',{style:{width:44,height:44,borderRadius:14,flexShrink:0,position:'relative',
        background:'linear-gradient(135deg, var(--pink), var(--violet))',
        display:'flex',alignItems:'center',justifyContent:'center'}},
        h(Icon,{n:'sparkle',s:21,c:'#fff'}),
        h('span',{style:{position:'absolute',inset:-4,borderRadius:16,
          background:'linear-gradient(135deg, var(--pink), var(--violet))',
          opacity:.3,filter:'blur(9px)',zIndex:-1,animation:'aiPulse 3s infinite'}})),
      h('div',{style:{flex:1}},
        h('div',{style:{fontFamily:'var(--f-display)',fontSize:17,fontWeight:600,
          letterSpacing:'-.025em'}},'Coach 7 Chaves'),
        h('div',{style:{display:'flex',alignItems:'center',gap:5,marginTop:2}},
          h('span',{style:{width:5,height:5,borderRadius:'50%',background:'var(--mint)',
            boxShadow:'0 0 6px var(--mint)'}}),
          h('span',{className:'mono',style:{fontSize:8.5,letterSpacing:'.1em',
            color:'var(--mint)',textTransform:'uppercase'}},
            digitando?'digitando…':'analisando seus dados'))),
      h('button',{onClick:()=>go('home'),style:{width:33,height:33,borderRadius:'50%',
        background:'var(--ov-1)',display:'flex',alignItems:'center',
        justifyContent:'center'}},h(Icon,{n:'x',s:15}))),

    h('div',{className:'chat-scroll'},
    h('div',{style:{padding:'14px 18px 0'}},
      h('div',{className:'sec-title',style:{marginBottom:11}},'INSIGHTS DE HOJE'),
      h('div',{className:'hscroll',style:{marginBottom:6,margin:'0 -18px 6px',
        padding:'0 18px 4px'}},
        insights.map((ins,i)=>
          h('div',{key:i,className:'rise',style:{animationDelay:`${i*.08}s`,
            width:246,padding:15,borderRadius:'var(--r-md)',
            background:`linear-gradient(140deg, ${CORES_SOFT[ins.cor]}, transparent)`,
            border:`1px solid ${HEX[ins.cor]}33`}},
            h('div',{style:{width:29,height:29,borderRadius:10,marginBottom:9,
              background:CORES_SOFT[ins.cor],display:'flex',alignItems:'center',
              justifyContent:'center'}},h(Icon,{n:ins.ico,s:14,c:CORES[ins.cor]})),
            h('div',{style:{fontSize:13,fontWeight:700,letterSpacing:'-.015em',
              lineHeight:1.25,marginBottom:6}},ins.t),
            h('div',{style:{fontSize:11,color:'var(--ink-3)',lineHeight:1.48,
              display:'-webkit-box',WebkitLineClamp:5,WebkitBoxOrient:'vertical',
              overflow:'hidden'}},ins.d))))),

    h('div',{style:{flex:1,padding:'6px 18px 0',display:'flex',flexDirection:'column',
      justifyContent:'flex-end'}},
      msgs.map((m,i)=>
        h('div',{key:i,className:'rise',style:{animationDelay:`${Math.min(i*.04,.28)}s`,
          alignSelf:m.de==='eu'?'flex-end':'flex-start',maxWidth:'87%',marginBottom:12}},
          h('div',{style:{padding:'12px 15px',borderRadius:'var(--r-md)',fontSize:12.8,
            lineHeight:1.52,
            background:m.de==='eu'?'linear-gradient(135deg,var(--pink),var(--pink-2))':'var(--surf-2)',
            border:m.de==='eu'?'none':'1px solid var(--line)',
            borderTopRightRadius:m.de==='eu'?5:'var(--r-md)',
            borderTopLeftRadius:m.de==='ia'?5:'var(--r-md)',
            color:m.de==='eu'?'#fff':'var(--ink)',
            fontWeight:m.de==='eu'?500:400}}, m.t,
            m.card && h('div',{style:{marginTop:11,padding:12,borderRadius:'var(--r-sm)',
              background:'linear-gradient(135deg, var(--pink-soft), transparent)',
              border:'1px solid var(--line-pink)'}},
              h('div',{className:'eyebrow eyebrow-pink',style:{fontSize:7.5,marginBottom:6}},
                m.card.l),
              h('div',{style:{fontSize:12.5,fontWeight:700,letterSpacing:'-.015em',
                marginBottom:6,lineHeight:1.25}},m.card.t),
              h('div',{style:{display:'flex',alignItems:'baseline',gap:6}},
                h('span',{style:{fontFamily:'var(--f-display)',fontSize:21,fontWeight:600,
                  color:'var(--pink)',letterSpacing:'-.03em'}},m.card.v),
                h('span',{style:{fontSize:10,color:'var(--ink-3)'}},m.card.d)))),
          h('div',{className:'mono',style:{fontSize:8,color:'var(--ink-4)',marginTop:4,
            padding:'0 4px',textAlign:m.de==='eu'?'right':'left',letterSpacing:'.06em'}},
            m.de==='eu'?'VOCÊ':'COACH IA'))),
      digitando && h('div',{style:{alignSelf:'flex-start',padding:'13px 17px',
        background:'var(--surf-2)',border:'1px solid var(--line)',
        borderRadius:'var(--r-md)',borderTopLeftRadius:5,display:'flex',gap:5}},
        [0,1,2].map(i=>h('span',{key:i,style:{width:6,height:6,borderRadius:'50%',
          background:'var(--pink)',animation:`aiPulse 1.1s ${i*.16}s infinite`}}))),
      h('div',{ref:fim}))),

    h('div',{className:'chat-base'},
      h('div',{className:'hscroll',style:{marginBottom:8,margin:'0 0 8px',
        padding:'0 18px 2px',overflowX:'auto'}},
        CHIPS_GRUPOS.map((g,i)=>
          h('button',{key:g.g,onClick:()=>setGrupo(i),
            style:{padding:'8px 13px',borderRadius:'var(--r-full)',whiteSpace:'nowrap',
              display:'flex',alignItems:'center',gap:6,fontSize:11.5,fontWeight:600,
              background: grupo===i? CORES_SOFT[g.c] : 'var(--surf)',
              border:`1px solid ${grupo===i? CORES[g.c] : 'var(--line-2)'}`,
              color: grupo===i? CORES[g.c] : 'var(--ink-3)',
              transition:'all .3s cubic-bezier(.4,0,.2,1)'}},
            h(Icon,{n:g.i,s:13}), g.g))),
      h('div',{style:{display:'flex',flexWrap:'wrap',gap:7,padding:'0 18px 10px',
        maxHeight:118,overflowY:'auto'}},
        CHIPS_GRUPOS[grupo].qs.map((sg,i)=>
          h('button',{key:sg,onClick:()=>enviar(sg),className:'rise lift',
            style:{animationDelay:`${i*.04}s`,padding:'9px 14px',
              borderRadius:'var(--r-full)',background:'var(--surf)',
              border:'1px solid var(--line-2)',fontSize:11.5,color:'var(--ink-2)',
              fontWeight:500,textAlign:'left',lineHeight:1.3}},sg))),
      h('div',{style:{padding:'0 18px 10px',display:'flex',gap:9,alignItems:'center'}},
        h('input',{value:txt,onChange:e=>setTxt(e.target.value),
          onKeyDown:e=>e.key==='Enter'&&enviar(),
          placeholder:'Pergunte ao seu Coach…',
          style:{flex:1,padding:'14px 17px',borderRadius:'var(--r-full)',
            background:'var(--surf)',border:'1px solid var(--line-2)',
            fontSize:13,outline:'none'}}),
        h('button',{onClick:()=>enviar(),
          style:{width:46,height:46,borderRadius:'50%',flexShrink:0,
            background:'linear-gradient(135deg,var(--pink),var(--violet))',
            display:'flex',alignItems:'center',justifyContent:'center',
            boxShadow:'0 6px 20px var(--pink-glow)'}},
          h(Icon,{n:'send',s:17,c:'#fff'})))));
};

/* ═══ COMUNIDADE ═══ */
const SheetSOS = ({s, onClose}) =>
  h(Sheet,{onClose,titulo:'SOS Dia Difícil'},
    h('p',{style:{fontSize:13,color:'var(--ink-2)',lineHeight:1.55,marginBottom:20}},
      'Dia impossível acontece. A regra do método é uma só: ',
      h('strong',{style:{color:'var(--coral)'}},'nunca duas vezes seguidas'),
      '. Faça só o essencial abaixo — seu streak continua vivo.'),
    [{ico:'protein',t:'20g de proteína na próxima refeição',d:'Ovo, iogurte grego ou whey. 2 minutos.',c:'pink'},
     {ico:'water',t:'500 mL de Água Viva',d:'Água + pitada de sal + limão. Agora.',c:'mint'},
     {ico:'walk',t:'10 minutos de caminhada',d:'Pode ser pelo corredor. Vale igual.',c:'gold'},
     {ico:'moon',t:'Deitar 30 min mais cedo',d:'Protege o Bloco de Ouro de amanhã.',c:'violet'}
    ].map((x,i)=>
      h('div',{key:i,className:'rise',style:{animationDelay:`${i*.07}s`,
        display:'flex',gap:13,alignItems:'center',padding:14,marginBottom:10,
        background:CORES_SOFT[x.c],border:`1px solid ${HEX[x.c]}33`,
        borderRadius:'var(--r-md)'}},
        h('div',{style:{width:38,height:38,borderRadius:13,flexShrink:0,
          background:'rgba(0,0,0,.25)',display:'flex',alignItems:'center',
          justifyContent:'center'}},h(Icon,{n:x.ico,s:18,c:CORES[x.c]})),
        h('div',null,
          h('div',{style:{fontSize:13,fontWeight:700,letterSpacing:'-.015em'}},x.t),
          h('div',{style:{fontSize:11,color:'var(--ink-3)',marginTop:2}},x.d)))),
    h('div',{style:{padding:15,marginTop:8,borderRadius:'var(--r-md)',
      background:'var(--ov-1)',border:'1px solid var(--line)'}},
      h('div',{className:'eyebrow',style:{marginBottom:8}},'LEMBRE-SE'),
      h('p',{style:{fontFamily:'var(--f-display)',fontStyle:'italic',fontSize:14.5,
        lineHeight:1.4,color:'var(--ink)'}},
        '"Um dia ruim é uma pausa. Dois dias seguidos é uma nova rotina. Amanhã já é hoje."')));

const SheetBusca = ({s, go, onClose}) => {
  const [q,setQ]=useState('');
  const itens=[
    ...Object.entries(DIAS).map(([n,d])=>({t:d.titulo,s:`Dia ${n} · ${d.sub.slice(0,40)}…`,
      tipo:'dia',n:Number(n)})),
    ...CHAVES.map(c=>({t:`Chave ${String(c.id).padStart(2,'0')} · ${c.nome}`,s:c.slogan,
      tipo:'chave'})),
    ...Object.entries(DIAS).map(([n,d])=>({t:d.receita.nome,
      s:d.receita.prop.slice(0,48)+'…',tipo:'receita',n:Number(n)})),
  ];
  const res=q.length<2? itens.slice(0,7)
    : itens.filter(i=>(i.t+i.s).toLowerCase().includes(q.toLowerCase())).slice(0,10);
  return h(Sheet,{onClose,titulo:'Buscar'},
    h('input',{autoFocus:true,value:q,onChange:e=>setQ(e.target.value),
      placeholder:'Chaves, dias, receitas, rituais…',
      style:{width:'100%',padding:'14px 18px',borderRadius:'var(--r-full)',
        background:'var(--surf)',border:'1px solid var(--line-2)',fontSize:13.5,
        outline:'none',marginBottom:16}}),
    res.map((r,i)=>
      h('button',{key:i,onClick:()=>{ if(r.n) go('conteudo',r.n); onClose(); },
        style:{width:'100%',textAlign:'left',display:'flex',alignItems:'center',gap:12,
          padding:'12px 4px',borderBottom:'1px solid var(--line)'}},
        h('div',{style:{width:33,height:33,borderRadius:11,flexShrink:0,
          background:r.tipo==='chave'?'var(--gold-soft)':r.tipo==='receita'?'var(--mint-soft)'
            :'var(--pink-soft)',display:'flex',alignItems:'center',justifyContent:'center'}},
          h(Icon,{n:r.tipo==='chave'?'key':r.tipo==='receita'?'plate':'book',s:15,
            c:r.tipo==='chave'?'var(--gold)':r.tipo==='receita'?'var(--mint)':'var(--pink)'})),
        h('div',{style:{flex:1,minWidth:0}},
          h('div',{style:{fontSize:12.5,fontWeight:600,letterSpacing:'-.01em'}},r.t),
          h('div',{style:{fontSize:10.5,color:'var(--ink-3)',marginTop:1,
            whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},r.s)),
        h(Icon,{n:'chevR',s:14,c:'var(--ink-4)'}))));
};

/* ═══ FERRAMENTAS ═══ */
const TelaVacuum = ({s, go, toast}) => {
  const [serie,setSerie]=useState(0),[seg,setSeg]=useState(0);
  const [rod,setRod]=useState(false),[fase,setFase]=useState('pronta');
  const META=15,SERIES=5,DESC=20;
  useEffect(()=>{ if(!rod) return;
    const t=setInterval(()=>setSeg(x=>x+1),1000); return()=>clearInterval(t); },[rod]);
  useEffect(()=>{
    if(fase==='segurar'&&seg>=META){
      if(serie+1>=SERIES){ setRod(false); setFase('pronta'); setSerie(0); setSeg(0);
        toast('Vacuum completo!','5 séries · o Cinturão Interno acordou','key'); }
      else { setSerie(serie+1); setFase('descanso'); setSeg(0); } }
    if(fase==='descanso'&&seg>=DESC){ setFase('segurar'); setSeg(0); }
  },[seg,fase,serie]);
  const alvo=fase==='descanso'?DESC:META;
  return h('div',{className:'screen-anim',style:{padding:'6px 18px 0',minHeight:'100%',
    display:'flex',flexDirection:'column'}},
    h('div',{style:{display:'flex',alignItems:'center',gap:12,marginBottom:8}},
      h('button',{onClick:()=>go('home'),style:{width:38,height:38,borderRadius:'50%',
        background:'var(--ov-1)',display:'flex',alignItems:'center',
        justifyContent:'center'}},h(Icon,{n:'chevL',s:18})),
      h('div',null,
        h('div',{className:'h-display',style:{fontSize:21}},'Vacuum Abdominal'),
        h('div',{style:{fontSize:11,color:'var(--ink-3)'}},'Chave 04 · Transverso'))),
    h('div',{style:{flex:1,display:'flex',flexDirection:'column',alignItems:'center',
      justifyContent:'center',gap:24,paddingBottom:40}},
      h(Anel,{v:seg/alvo,size:222,sw:12,cor:fase==='descanso'?'var(--mint)':'var(--gold)'},
        h('div',{className:'mono',style:{fontSize:9.5,letterSpacing:'.14em',
          color:'var(--ink-3)',marginBottom:5}},
          fase==='descanso'?'DESCANSE':fase==='segurar'?'SEGURE':'PRONTA?'),
        h('div',{style:{fontFamily:'var(--f-display)',fontSize:62,fontWeight:600,
          letterSpacing:'-.05em',lineHeight:1}},
          fase==='pronta'?META:Math.max(0,alvo-seg)),
        h('div',{className:'mono',style:{fontSize:10.5,color:'var(--ink-3)',marginTop:5}},
          `SÉRIE ${serie+1} DE ${SERIES}`)),
      h('div',{style:{textAlign:'center',padding:'0 18px'}},
        h('p',{style:{fontSize:13,color:'var(--ink-2)',lineHeight:1.5}},
          fase==='descanso'?'Respire normalmente. A próxima série começa sozinha.'
          :fase==='segurar'?'Barriga para dentro e para cima. Não é contrair — é sugar.'
          :'Expire TODO o ar. Depois puxe a barriga para dentro, como se o umbigo encostasse na coluna.')),
      h('button',{onClick:()=>{ if(rod){ setRod(false); setFase('pronta'); setSeg(0); setSerie(0); }
          else { setRod(true); setFase('segurar'); setSeg(0); } },
        className:`btn ${rod?'btn-ghost':'btn-gold'}`,style:{width:'80%',padding:16,fontSize:14.5}},
        h(Icon,{n:rod?'x':'play',s:17}),rod?'Parar':'Começar as 5 séries')));
};

const TelaZone2 = ({s, go}) => {
  const [idade,setIdade]=useState(42);
  const fcm=220-idade, lo=Math.round(fcm*.6), hi=Math.round(fcm*.7);
  return h('div',{className:'screen-anim',style:{padding:'6px 18px 0'}},
    h('div',{style:{display:'flex',alignItems:'center',gap:12,marginBottom:22}},
      h('button',{onClick:()=>go('home'),style:{width:38,height:38,borderRadius:'50%',
        background:'var(--ov-1)',display:'flex',alignItems:'center',
        justifyContent:'center'}},h(Icon,{n:'chevL',s:18})),
      h('div',null,
        h('div',{className:'h-display',style:{fontSize:21}},'Zone 2 Cardio'),
        h('div',{style:{fontSize:11,color:'var(--ink-3)'}},'Chave 05 · Lipase Feminina'))),
    h('div',{className:'card',style:{marginBottom:16,textAlign:'center',padding:24}},
      h('div',{className:'eyebrow',style:{marginBottom:14}},'SUA ZONA 2'),
      h('div',{style:{display:'flex',alignItems:'baseline',justifyContent:'center',gap:8,
        marginBottom:8}},
        h('span',{style:{fontFamily:'var(--f-display)',fontSize:52,fontWeight:600,
          letterSpacing:'-.05em',color:'var(--coral)',lineHeight:1}},lo),
        h('span',{style:{fontSize:22,color:'var(--ink-3)'}},'—'),
        h('span',{style:{fontFamily:'var(--f-display)',fontSize:52,fontWeight:600,
          letterSpacing:'-.05em',color:'var(--coral)',lineHeight:1}},hi)),
      h('div',{className:'mono',style:{fontSize:11,color:'var(--ink-3)',
        letterSpacing:'.1em'}},'BATIMENTOS POR MINUTO'),
      h('div',{style:{marginTop:20,paddingTop:18,borderTop:'1px solid var(--line)'}},
        h('div',{style:{fontSize:12,color:'var(--ink-3)',marginBottom:12}},'Sua idade'),
        h('div',{style:{display:'flex',alignItems:'center',gap:14,justifyContent:'center'}},
          h('button',{onClick:()=>setIdade(Math.max(25,idade-1)),
            style:{width:40,height:40,borderRadius:'50%',background:'var(--ov-1)',
              border:'1px solid var(--line)'}},h(Icon,{n:'minus',s:16,style:{margin:'0 auto'}})),
          h('span',{style:{fontFamily:'var(--f-display)',fontSize:30,fontWeight:600,
            minWidth:56}},idade),
          h('button',{onClick:()=>setIdade(Math.min(75,idade+1)),
            style:{width:40,height:40,borderRadius:'50%',background:'var(--coral-soft)',
              border:'1px solid rgba(255,122,92,.3)'}},
            h(Icon,{n:'plus',s:16,c:'var(--coral)',style:{margin:'0 auto'}}))))),
    h('div',{className:'card',style:{marginBottom:12}},
      h('div',{className:'eyebrow',style:{marginBottom:12}},'TESTE DA CONVERSA'),
      h('p',{style:{fontSize:13,lineHeight:1.55,color:'var(--ink-2)',marginBottom:14}},
        'Sem monitor cardíaco? Use este teste — ele é tão confiável quanto:'),
      [{c:'mint',t:'Consegue falar frases completas',d:'✓ está na zona certa'},
       {c:'coral',t:'Consegue cantar uma música',d:'✗ acelere o passo'},
       {c:'coral',t:'Não consegue falar',d:'✗ diminua o ritmo'}].map((x,i)=>
        h('div',{key:i,style:{display:'flex',gap:11,padding:'11px 0',
          borderBottom:i<2?'1px solid var(--line)':'none'}},
          h('span',{style:{width:6,height:6,borderRadius:'50%',background:CORES[x.c],
            marginTop:6,flexShrink:0}}),
          h('div',null,
            h('div',{style:{fontSize:12.5,fontWeight:600}},x.t),
            h('div',{style:{fontSize:11,color:CORES[x.c],marginTop:2}},x.d))))),
    h('div',{className:'card',style:{background:'linear-gradient(135deg, var(--coral-soft), transparent)',
      borderColor:'rgba(255,122,92,.24)'}},
      h('div',{className:'eyebrow',style:{color:'var(--coral)',marginBottom:10}},'O PROTOCOLO'),
      ['30 a 45 minutos contínuos, 2-3× por semana',
       'Caminhada rápida ao ar livre é o ideal',
       'Em jejum matinal otimiza o uso de gordura',
       'Alterne com os dias de treino de força'].map((x,i)=>
        h('div',{key:i,style:{display:'flex',gap:10,marginBottom:8,alignItems:'flex-start'}},
          h('span',{style:{width:5,height:5,borderRadius:'50%',background:'var(--coral)',
            marginTop:7,flexShrink:0}}),
          h('span',{style:{fontSize:12.5,lineHeight:1.45,color:'var(--ink-2)'}},x)))),
    h('div',{style:{height:18}}));
};

const TelaLista = ({titulo, sub, itens, go, render}) =>
  h('div',{className:'screen-anim',style:{padding:'6px 18px 0'}},
    h('div',{style:{display:'flex',alignItems:'center',gap:12,marginBottom:20}},
      h('button',{onClick:()=>go('home'),style:{width:38,height:38,borderRadius:'50%',
        background:'var(--ov-1)',display:'flex',alignItems:'center',
        justifyContent:'center'}},h(Icon,{n:'chevL',s:18})),
      h('div',null,
        h('div',{className:'h-display',style:{fontSize:22}},titulo),
        h('div',{style:{fontSize:11,color:'var(--ink-3)'}},sub))),
    itens.map(render),
    h('div',{style:{height:18}}));
