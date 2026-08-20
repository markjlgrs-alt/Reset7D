/* ═══════════════════════════════════════════════════════════
   ABERTURA CINEMATOGRÁFICA — a primeira vez que ela abre o app
   Cinco atos, cada um com seu próprio movimento.
═══════════════════════════════════════════════════════════ */

/* contador que sobe sozinho */
const Contador = ({de=0, ate, dur=1200, suf='', dec=0}) => {
  const [v,setV] = useState(de);
  useEffect(()=>{
    let raf, t0;
    const passo = t => {
      if(!t0) t0 = t;
      const p = Math.min(1,(t-t0)/dur);
      const e = 1-Math.pow(1-p,3);
      setV(de + (ate-de)*e);
      if(p<1) raf = requestAnimationFrame(passo);
    };
    raf = requestAnimationFrame(passo);
    return ()=>cancelAnimationFrame(raf);
  },[ate,dur]);
  return h('span',null, v.toFixed(dec).replace('.',','), suf);
};

const ATOS = [
  /* ── 01 · IMPACTO ────────────────────────────────────── */
  { id:'impacto', cor:'pink', cena:'medida',
    render:()=>h('div',null,
      h('div',{className:'ob-eyebrow up'},'MÉTODO 7 CHAVES'),
      h('h1',{className:'ob-h1 up d1'},'Você já tentou.'),
      h('h1',{className:'ob-h1 up d2',style:{opacity:.55}},'Muitas vezes.'),
      h('div',{className:'ob-linha up d3'}),
      h('p',{className:'ob-p up d4'},
        'Dieta. Contagem de caloria. Aquele sábado inteiro com fome enquanto todo mundo comia.'),
      h('p',{className:'ob-p up d5',style:{color:'#fff',fontWeight:600}},
        'E a calça continuou marcando no mesmo lugar.')),
    cta:'Por que isso aconteceu' },

  /* ── 02 · A VIRADA DE CHAVE ──────────────────────────── */
  { id:'tese', cor:'pink', cena:'insulina',
    render:()=>h('div',null,
      h('div',{className:'ob-eyebrow up'},'A TESE DO MÉTODO'),
      h('h1',{className:'ob-h1 up d1'},'Sua cintura'),
      h('h1',{className:'ob-h1 up d2'},'não está gorda.'),
      h('h1',{className:'ob-h1-it up d3'},'Está travada.'),
      h('div',{className:'ob-linha up d4'}),
      h('p',{className:'ob-p up d5'},
        'Não foi falta de esforço. Foi endereço errado — você atacou o peso quando o problema era a trava.')),
    cta:'Que travas são essas?' },

  /* ── 03 · AS SETE CHAVES ─────────────────────────────── */
  { id:'chaves', cor:'gold', cena:'transverso',
    render:()=>h('div',null,
      h('div',{className:'ob-eyebrow up'},'SETE SISTEMAS, SETE CHAVES'),
      h('h1',{className:'ob-h1 up d1',style:{fontSize:34}},'A cintura tem dono.'),
      h('p',{className:'ob-p up d2',style:{marginBottom:18}},
        'Ela não obedece à balança. Obedece a sete sistemas — e basta um travado para o espelho não mudar.'),
      h('div',{style:{display:'flex',flexWrap:'wrap',gap:7}},
        CHAVES.map((c,i)=>
          h('span',{key:c.id,className:'ob-chave',
            style:{animationDelay:`${.22+i*.09}s`,borderColor:c.cor+'55',color:c.cor}},
            h('i',{className:'ob-chave-n'},String(c.id).padStart(2,'0')), c.nome)))),
    cta:'E o que eu faço com isso?' },

  /* ── 04 · O CONTRATO HONESTO ─────────────────────────── */
  { id:'numero', cor:'mint', cena:'linfa',
    render:()=>h('div',null,
      h('div',{className:'ob-eyebrow up'},'SEM PROMESSA FALSA'),
      h('div',{className:'ob-num up d1'},
        h(Contador,{de:0,ate:3,dur:900}),
        h('span',{style:{opacity:.4,margin:'0 6px'}},'a'),
        h(Contador,{de:0,ate:8,dur:1500}),
        h('span',{className:'ob-num-un'},'cm')),
      h('h1',{className:'ob-h1 up d2',style:{fontSize:30}},'de cintura em 21 dias.'),
      h('div',{className:'ob-linha up d3'}),
      h('p',{className:'ob-p up d4'},
        'É a faixa que a literatura sustenta para quem cumpre o protocolo com constância. Algumas fazem mais. Algumas fazem menos.'),
      h('p',{className:'ob-p up d5',style:{color:'#fff',fontWeight:600}},
        'Ninguém aqui vai te prometer corpo perfeito nem dez quilos numa semana. Isso não existe — e você já sabe.')),
    cta:'Combinado. E agora?' },

  /* ── 05 · O PACTO ────────────────────────────────────── */
  { id:'pacto', cor:'pink', cena:'identidade',
    render:()=>h('div',null,
      h('div',{className:'ob-eyebrow up'},'SEU PRIMEIRO ATO'),
      h('h1',{className:'ob-h1 up d1',style:{fontSize:36}},'Comece'),
      h('h1',{className:'ob-h1-it up d2',style:{fontSize:36}},'pela verdade.'),
      h('div',{className:'ob-linha up d3'}),
      h('p',{className:'ob-p up d4'},
        'Fita métrica — ou barbante, cadarço, a trena da casa. Em jejum, na altura do umbigo, sem prender a barriga.'),
      h('p',{className:'ob-p up d5',style:{color:'#fff',fontWeight:600}},
        'Anote o número mesmo que ele doa. Ele não é julgamento: é o ponto de partida da única curva que importa daqui pra frente.'),
      h('div',{className:'ob-selo up d6'},
        h(Icon,{n:'key',s:18,c:'var(--pink)'}),
        h('span',null,'21 dias · 7 chaves · uma mulher'))),
    cta:'Abrir o meu Dia 01' },
];

const Onboarding = ({onFim}) => {
  const [i,setI] = useState(0);
  const [saindo,setSaindo] = useState(false);
  const a = ATOS[i], ultimo = i===ATOS.length-1;

  useEffect(()=>{ instalarRipple && instalarRipple(); },[]);

  const avancar = () => {
    if(ultimo){ soltarConfete(); setSaindo(true); setTimeout(onFim,700); return; }
    setI(i+1);
  };

  return h('div',{className:'stage'},
    h('div',{className:'device'},
      h('div',{className:'viewport on-photo ob-view',
        style:{opacity:saindo?0:1,transform:saindo?'scale(1.04)':'none',
          transition:'opacity .68s cubic-bezier(.4,0,.2,1), transform .68s cubic-bezier(.4,0,.2,1)'}},

        /* cenário que troca a cada ato */
        h(FotoCena,{key:a.cena,cena:a.cena,h:'100%',zoom:.78,silX:'74%',silOp:.55,
          style:{position:'absolute',inset:0}}),
        h('div',{className:'ob-veu'}),
        h('div',{className:'ob-orb',style:{background:`radial-gradient(circle, ${CORES[a.cor]}, transparent 70%)`}}),

        h('div',{className:'ob-wrap'},

          /* trilho de progresso */
          h('div',{className:'ob-trilho'},
            ATOS.map((_,k)=>h('span',{key:k,className:'ob-passo',
              style:{background: k<=i ? CORES[a.cor] : 'rgba(255,255,255,.16)',
                boxShadow: k===i ? `0 0 12px ${CORES[a.cor]}` : 'none',
                flex: k===i ? 2.2 : 1}}))),

          /* conteúdo do ato */
          h('div',{key:a.id,className:'ob-corpo'}, a.render()),

          /* ação */
          h('div',{className:'ob-acao'},
            h('button',{className:'ob-btn press',onClick:avancar,
              style:{background:`linear-gradient(120deg, ${CORES[a.cor]}, color-mix(in srgb, ${CORES[a.cor]} 62%, #000))`,
                boxShadow:`0 10px 34px ${CORES[a.cor]}55`}},
              h('span',null,a.cta),
              h('span',{className:'ob-btn-ico'},h(Icon,{n:ultimo?'key':'chevR',s:16,c:'#fff',w:2.3}))),
            !ultimo && h('button',{onClick:onFim,className:'ob-pular press'},
              'Já conheço o método · pular'))))));
};
