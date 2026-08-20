/* ═══════════════════════════════════════════════════════════
   COMUNIDADE — o grupo que atravessa os 21 dias junto
   (sem ranking — aqui ninguém compete, todas caminham)
═══════════════════════════════════════════════════════════ */
const POSTS_BASE = [
  {id:'p1',autor:'Juliana R.',cor:'gold',dia:15,h:'2h',curtidas:34,coment:12,cm:5.4,
   txt:'O vacuum mudou a minha postura antes de mudar a cintura. Semana 2 e a calça do trabalho já fecha sem prender a barriga.'},
  {id:'p2',autor:'Patrícia L.',cor:'mint',dia:13,h:'5h',curtidas:28,coment:9,cm:4.8,
   txt:'Dica pra quem trabalha fora: faço a drenagem linfática ainda na cama, antes de levantar. Cinco minutos que eu não perco mais.'},
  {id:'p3',autor:'Carla M.',cor:'violet',dia:12,h:'8h',curtidas:51,coment:18,cm:4.1,
   txt:'Quase desisti no dia 9. Usei o Modo Mínimo, não quebrei a ofensiva, e no dia seguinte voltei inteira. Funciona mesmo esse negócio de não falhar duas vezes.'},
  {id:'p4',autor:'Renata S.',cor:'coral',dia:10,h:'12h',curtidas:19,coment:14,cm:3.6,
   txt:'Alguém mais sentiu a fome sumir depois da Janela de Ouro? Passei a vida achando que era ansiedade e era só desordem de horário.'},
  {id:'p5',autor:'Fernanda A.',cor:'pink',dia:9,h:'1d',curtidas:63,coment:21,cm:3.0,
   txt:'Primeira semana fechada. −3,0 cm. Nunca uma dieta me deu esse número em sete dias sem eu passar fome.'},
];

const SALAS = [
  {i:'flame', c:'coral', n:'Dias difíceis',    d:'quando o dia desanda',      on:214},
  {i:'plate', c:'mint',  n:'Cozinha do método',d:'receitas que deram certo',  on:389},
  {i:'core',  c:'gold',  n:'Vacuum & postura', d:'dúvidas de execução',       on:156},
  {i:'moon',  c:'violet',n:'Sono e cortisol',  d:'o turno da noite',          on:97},
];

const PostCard = ({p, curtido, onCurtir, i}) =>
  h(Reveal,{tipo:'rv',delay:Math.min(i*70,280)},
    h('div',{className:'card lift',style:{padding:18,marginBottom:11}},
      h('div',{style:{display:'flex',alignItems:'center',gap:11,marginBottom:13}},
        h('div',{style:{width:40,height:40,borderRadius:'50%',flexShrink:0,
          background:CORES_SOFT[p.cor],border:`1px solid color-mix(in srgb, ${CORES[p.cor]} 30%, transparent)`,
          display:'flex',alignItems:'center',justifyContent:'center',
          fontFamily:'var(--f-display)',fontSize:16,fontWeight:600,color:CORES[p.cor]}},
          p.autor[0]),
        h('div',{style:{flex:1,minWidth:0}},
          h('div',{style:{fontSize:14,fontWeight:600,letterSpacing:'-.01em'}},p.autor),
          h('div',{style:{display:'flex',gap:6,alignItems:'center',marginTop:4}},
            h('span',{className:'chip',style:{padding:'2px 7px',fontSize:7.5}},
              `DIA ${String(p.dia).padStart(2,'0')}`),
            p.cm>0 && h('span',{className:'chip',style:{padding:'2px 7px',fontSize:7.5,
              background:'var(--mint-soft)',color:'var(--mint)',borderColor:'transparent'}},
              `−${String(p.cm).replace('.',',')} CM`),
            h('span',{className:'mono',style:{fontSize:9.5,color:'var(--ink-4)'}},p.h)))),
      h('p',{style:{fontSize:14.2,lineHeight:1.62,color:'var(--ink-2)',marginBottom:14}},p.txt),
      h('div',{style:{display:'flex',gap:20,paddingTop:13,borderTop:'1px solid var(--line)'}},
        h('button',{onClick:onCurtir,style:{display:'flex',alignItems:'center',gap:7,
          color:curtido?'var(--pink)':'var(--ink-3)',transition:'color .25s ease'}},
          h(Icon,{n:'heart',s:16,fill:curtido?'var(--pink)':'none'}),
          h('span',{className:'mono',style:{fontSize:11}},p.curtidas+(curtido?1:0))),
        h('button',{style:{display:'flex',alignItems:'center',gap:7,color:'var(--ink-3)'}},
          h(Icon,{n:'message',s:16}),
          h('span',{className:'mono',style:{fontSize:11}},p.coment)),
        h('button',{style:{display:'flex',alignItems:'center',gap:6,marginLeft:'auto',
          color:'var(--gold)'}},
          h(Icon,{n:'zap',s:14}),
          h('span',{className:'mono',style:{fontSize:10}},'APOIAR')))));

const TelaComunidade = ({s, set, go, toast}) => {
  const [txt,setTxt] = useState('');
  const [curtidas,setCurtidas] = useState({});
  const posts = [...(s.posts||[]), ...POSTS_BASE];
  const perda = (s.medidas[0].cintura - s.medidas[s.medidas.length-1].cintura);

  const publicar = () => {
    if(!txt.trim()) return;
    const p = {id:'u'+Date.now(),autor:s.nome,cor:'pink',dia:s.diaAtual,h:'agora',
      curtidas:0,coment:0,cm:+perda.toFixed(1),txt:txt.trim()};
    set(v=>({...v, posts:[p,...(v.posts||[])], xp:v.xp+25}));
    setTxt(''); toast('Publicado na comunidade','+25 XP por dividir a sua semana','users');
  };

  return h('div',{className:'screen-anim',style:{padding:'6px 20px 20px'}},

    h(Reveal,null,
      h('div',{className:'eyebrow eyebrow-pink',style:{marginBottom:9}},'VOCÊ NÃO ESTÁ SOZINHA'),
      h('h1',{style:{fontFamily:'var(--f-display)',fontSize:36,fontWeight:600,
        letterSpacing:'-.04em',lineHeight:1.02,marginBottom:10}},'Comunidade'),
      h('p',{style:{fontSize:14.5,lineHeight:1.6,color:'var(--ink-2)',maxWidth:'38ch'}},
        'Aqui ninguém compete. Cada uma conta o que funcionou, o que travou e o que fez no dia em que quase parou.')),

    /* salas temáticas */
    h(SecHead,{t:'SALAS DE CONVERSA'}),
    h('div',{className:'hscroll'},
      SALAS.map((x,i)=>
        h(Reveal,{key:i,tipo:'rv-s',delay:i*70},
          h('button',{className:'card lift',style:{width:172,padding:16,textAlign:'left'}},
            h('span',{style:{width:36,height:36,borderRadius:13,display:'flex',
              alignItems:'center',justifyContent:'center',marginBottom:12,
              background:CORES_SOFT[x.c]}},
              h(Icon,{n:x.i,s:17,c:CORES[x.c]})),
            h('span',{style:{display:'block',fontSize:14,fontWeight:600,
              letterSpacing:'-.015em',marginBottom:3}},x.n),
            h('span',{style:{display:'block',fontSize:11.5,color:'var(--ink-3)',
              lineHeight:1.35,marginBottom:10}},x.d),
            h('span',{style:{display:'flex',alignItems:'center',gap:6}},
              h('span',{style:{width:6,height:6,borderRadius:'50%',background:'var(--mint)'}}),
              h('span',{className:'mono',style:{fontSize:9.5,color:'var(--ink-4)'}},
                `${x.on} ONLINE`)))))),

    /* compositor */
    h(SecHead,{t:'CONTE O SEU DIA'}),
    h(Reveal,{tipo:'rv-3d'},
      h('div',{className:'card',style:{padding:16,marginBottom:18}},
        h('div',{style:{display:'flex',gap:12}},
          h('div',{style:{width:38,height:38,borderRadius:'50%',flexShrink:0,
            background:'var(--pink-soft)',border:'1px solid var(--line-pink)',
            display:'flex',alignItems:'center',justifyContent:'center',
            fontFamily:'var(--f-display)',fontSize:16,fontWeight:600,color:'var(--pink)'}},
            s.nome[0]),
          h('textarea',{value:txt,onChange:e=>setTxt(e.target.value),
            placeholder:'O que funcionou hoje?',rows:txt?3:1,
            style:{flex:1,resize:'none',background:'none',border:'none',outline:'none',
              fontSize:14,lineHeight:1.55,color:'var(--ink)',paddingTop:9}})),
        txt.trim() && h('div',{style:{display:'flex',alignItems:'center',gap:10,marginTop:14,
          paddingTop:13,borderTop:'1px solid var(--line)'}},
          h('span',{className:'chip',style:{padding:'4px 9px',fontSize:8}},
            `DIA ${String(s.diaAtual).padStart(2,'0')}`),
          h('span',{className:'chip',style:{padding:'4px 9px',fontSize:8,
            background:'var(--mint-soft)',color:'var(--mint)',borderColor:'transparent'}},
            `−${perda.toFixed(1).replace('.',',')} CM`),
          h('button',{className:'btn btn-pink btn-sm',style:{marginLeft:'auto'},
            onClick:publicar},'Publicar',h(Icon,{n:'send',s:14}))))),

    /* feed */
    h(SecHead,{t:'O QUE ESTÃO DIZENDO'}),
    posts.map((p,i)=>h(PostCard,{key:p.id,p,i,curtido:!!curtidas[p.id],
      onCurtir:()=>setCurtidas(c=>({...c,[p.id]:!c[p.id]}))})),

    h(Reveal,{delay:60},
      h('p',{style:{fontFamily:'var(--f-display)',fontStyle:'italic',textAlign:'center',
        fontSize:15.5,color:'var(--ink-3)',margin:'30px auto 0',maxWidth:'28ch',lineHeight:1.5}},
        '“Ninguém atravessa 21 dias sozinha. Nem precisa.”')));
};
