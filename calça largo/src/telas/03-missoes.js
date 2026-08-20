/* ═══════════════════════════════════════════════════════════
   MISSÕES — aba gamificada completa
   Missão-chave + diárias + bônus + streak + XP + modo mínimo
═══════════════════════════════════════════════════════════ */

/* ─── Cabeçalho de XP e nível ─── */
const XPHeader = ({s}) => {
  const nv=nivelDe(s.xp);
  const feitos=s.missoes[s.diaAtual]||[];
  const todas=[MISSAO_CHAVE[s.diaAtual],...MISSOES_DIARIAS,...MISSOES_BONUS];
  const xpHoje=todas.filter(m=>feitos.includes(m.id)).reduce((a,m)=>a+m.xp,0);
  const xpPossivel=todas.reduce((a,m)=>a+m.xp,0);

  return h('div',{className:'rise',style:{position:'relative',overflow:'hidden',
    borderRadius:'var(--r-lg)',marginBottom:16,
    background:'linear-gradient(140deg, var(--pink-soft) 0%, var(--surf-2) 55%, var(--surf) 100%)',
    border:'1px solid var(--line-pink)'}},
    h('div',{style:{position:'absolute',top:-50,right:-40,width:190,height:190,
      borderRadius:'50%',background:'radial-gradient(circle, var(--pink-mid), transparent 68%)',
      filter:'blur(34px)'}}),
    h('div',{style:{position:'relative',padding:18}},
      /* nível */
      h('div',{style:{display:'flex',alignItems:'center',gap:13,marginBottom:16}},
        h('div',{style:{position:'relative',width:56,height:56,flexShrink:0}},
          h(Anel,{v:nv.pct,size:56,sw:4,cor:'var(--gold)'},
            h('span',{style:{fontFamily:'var(--f-display)',fontSize:21,fontWeight:700,
              color:'var(--gold)',letterSpacing:'-.03em'}},nv.n))),
        h('div',{style:{flex:1,minWidth:0}},
          h('div',{className:'eyebrow eyebrow-gold',style:{marginBottom:3}},
            `NÍVEL ${nv.n} · ${nv.nome.toUpperCase()}`),
          h('div',{style:{display:'flex',alignItems:'baseline',gap:5}},
            h('span',{style:{fontFamily:'var(--f-display)',fontSize:26,fontWeight:600,
              letterSpacing:'-.04em',lineHeight:1}},s.xp.toLocaleString('pt-BR')),
            h('span',{className:'mono',style:{fontSize:11,color:'var(--ink-3)'}},'XP')),
          nv.prox && h('div',{style:{fontSize:10.5,color:'var(--ink-3)',marginTop:3}},
            `Faltam ${nv.falta} XP para ${nv.prox.nome}`)),
        h('div',{style:{textAlign:'right',flexShrink:0}},
          h('div',{style:{display:'inline-flex',alignItems:'center',gap:5,
            padding:'6px 11px',borderRadius:'var(--r-full)',
            background:'rgba(255,122,92,.16)',border:'1px solid rgba(255,122,92,.3)'}},
            h(Icon,{n:'flame',s:13,c:'var(--coral)',fill:'var(--coral)',w:0}),
            h('span',{className:'mono',style:{fontSize:13,fontWeight:700,color:'var(--coral)'}},
              s.streak)),
          h('div',{className:'mono',style:{fontSize:8,color:'var(--ink-4)',marginTop:4,
            letterSpacing:'.09em'}},'DIAS SEGUIDOS'))),
      /* barra de nível */
      h(Bar,{v:nv.pct,cor:'gold',h:6}),
      /* XP de hoje */
      h('div',{style:{display:'flex',justifyContent:'space-between',marginTop:14,
        paddingTop:14,borderTop:'1px solid var(--ov-1)'}},
        h('div',null,
          h('div',{className:'mono',style:{fontSize:8.5,color:'var(--ink-4)',
            letterSpacing:'.1em',marginBottom:3}},'XP CONQUISTADO HOJE'),
          h('div',{style:{fontFamily:'var(--f-display)',fontSize:19,fontWeight:600,
            color:'var(--pink)',letterSpacing:'-.03em'}},
            `+${xpHoje}`,h('span',{style:{fontSize:12,color:'var(--ink-4)'}},` / ${xpPossivel}`))),
        h('div',{style:{textAlign:'right'}},
          h('div',{className:'mono',style:{fontSize:8.5,color:'var(--ink-4)',
            letterSpacing:'.1em',marginBottom:3}},'MISSÕES'),
          h('div',{style:{fontFamily:'var(--f-display)',fontSize:19,fontWeight:600,
            color:'var(--mint)',letterSpacing:'-.03em'}},
            feitos.length,h('span',{style:{fontSize:12,color:'var(--ink-4)'}},
              ` / ${todas.length}`))))));
};

/* ─── Card de missão ─── */
const MissaoCard = ({m, on, onToggle, destaque, i=0, prog}) =>
  h('button',{onClick:onToggle,className:'rise',
    style:{width:'100%',textAlign:'left',marginBottom:10,animationDelay:`${.1+i*.05}s`,
      position:'relative',overflow:'hidden',borderRadius:'var(--r-md)',
      background: on? 'rgba(74,222,155,.06)'
        : destaque? 'linear-gradient(135deg, rgba(245,201,123,.13), rgba(245,201,123,.02))'
        : 'var(--surf)',
      border:`1px solid ${on?'rgba(74,222,155,.26)':destaque?'var(--line-gold)':'var(--line)'}`,
      padding: destaque? '17px 16px' : '14px 15px',
      transition:'all .32s cubic-bezier(.34,1.56,.64,1)'}},

    destaque && h('div',{style:{position:'absolute',left:0,top:0,bottom:0,width:3,
      background:'linear-gradient(180deg,var(--gold),var(--gold-2))'}}),
    destaque && !on && h('div',{style:{position:'absolute',top:-30,right:-24,width:120,height:120,
      borderRadius:'50%',background:'radial-gradient(circle, var(--gold-soft), transparent 70%)',
      filter:'blur(22px)'}}),

    h('div',{style:{position:'relative',display:'flex',alignItems:'center',gap:13}},
      h('div',{style:{width:destaque?48:40,height:destaque?48:40,borderRadius:destaque?15:13,
        flexShrink:0,background:on?'var(--mint-soft)':CORES_SOFT[m.cor],
        border:destaque&&!on?'1px solid var(--line-gold)':'none',
        display:'flex',alignItems:'center',justifyContent:'center'}},
        h(Icon,{n:m.ico,s:destaque?23:19,c:on?'var(--mint)':CORES[m.cor]})),

      h('div',{style:{flex:1,minWidth:0}},
        destaque && h('div',{className:'eyebrow eyebrow-gold',style:{marginBottom:4,fontSize:8}},
          '◆ MISSÃO-CHAVE · A QUE DESTRAVA O DIA'),
        h('div',{style:{fontSize:destaque?15:13.5,fontWeight:destaque?700:600,
          letterSpacing:'-.015em',lineHeight:1.22,
          color:on?'var(--ink-2)':'var(--ink)',
          textDecoration:on?'line-through':'none',
          textDecorationColor:'rgba(74,222,155,.5)'}}, m.nome),
        h('div',{style:{fontSize:11,color:'var(--ink-3)',marginTop:3,lineHeight:1.35}}, m.det),
        h('div',{style:{display:'flex',alignItems:'center',gap:8,marginTop:7}},
          m.tempo && h('span',{style:{display:'inline-flex',alignItems:'center',gap:4,
            fontFamily:'var(--f-mono)',fontSize:9,color:'var(--ink-4)',letterSpacing:'.05em'}},
            h(Icon,{n:'clock',s:10}),m.tempo),
          prog!=null && h('span',{className:'mono',style:{fontSize:9,color:CORES[m.cor],
            fontWeight:600}},`${prog}/${m.meta}`))),

      h('div',{style:{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6}},
        h('div',{className:`tick ${destaque?'gold':''} ${on?'on':''}`,
          style:destaque?{width:30,height:30}:undefined},
          h(Icon,{n:'check',s:destaque?16:14,c:'currentColor'})),
        h('span',{className:'mono',style:{fontSize:destaque?11:9.5,fontWeight:700,
          color:on?'var(--mint)':destaque?'var(--gold)':'var(--ink-4)'}},`+${m.xp}`))));

/* ─── Modo mínimo (dia impossível) ─── */
const ModoMinimo = ({s, set, toast}) => {
  const feitos=s.missoes[s.diaAtual]||[];
  const min=[
    {id:'min1',ico:'protein',nome:'20g de proteína na próxima refeição',xp:15,cor:'pink'},
    {id:'min2',ico:'water',nome:'500 mL de Água Viva agora',xp:10,cor:'mint'},
  ];
  return h('div',{style:{marginTop:22}},
    h('div',{className:'sec-head',style:{marginTop:0}},
      h('span',{className:'sec-title'},'MODO MÍNIMO'),
      h('span',{className:'chip chip-coral'},'DIA IMPOSSÍVEL')),
    h('div',{className:'card',style:{
      background:'linear-gradient(135deg, rgba(255,122,92,.08), transparent)',
      borderColor:'rgba(255,122,92,.24)',padding:16}},
      h('p',{style:{fontSize:12,color:'var(--ink-2)',lineHeight:1.5,marginBottom:14}},
        'Se hoje foi impossível, faça só estas duas. ',
        h('strong',{style:{color:'var(--coral)'}},'Seu streak continua vivo'),
        ' — e a regra do método é uma só: nunca duas vezes seguidas.'),
      h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9}},
        min.map(m=>{
          const on=feitos.includes(m.id);
          return h('button',{key:m.id,
            onClick:()=>{ set(p=>({...p,missoes:{...p.missoes,
              [p.diaAtual]: on? feitos.filter(x=>x!==m.id):[...feitos,m.id]},
              xp:Math.max(0,p.xp+(on?-m.xp:m.xp))}));
              if(!on) toast('Modo mínimo','Streak protegido','shield'); },
            style:{padding:13,borderRadius:'var(--r-sm)',textAlign:'left',
              background:on?'var(--mint-soft)':'var(--ov-1)',
              border:`1px solid ${on?'rgba(74,222,155,.3)':'var(--line)'}`,
              transition:'all .3s cubic-bezier(.34,1.56,.64,1)'}},
            h(Icon,{n:on?'check':m.ico,s:17,c:on?'var(--mint)':CORES[m.cor]}),
            h('div',{style:{fontSize:11,fontWeight:600,marginTop:8,lineHeight:1.3,
              color:on?'var(--mint)':'var(--ink-2)'}},m.nome));
        }))));
};

/* ─── Streak visual de 21 dias ─── */
const StreakBar = ({s}) =>
  h('div',{className:'rise d1',style:{marginBottom:18}},
    h('div',{style:{display:'flex',justifyContent:'space-between',marginBottom:9}},
      h('span',{className:'sec-title'},'SUA CONSTÂNCIA'),
      h('span',{className:'mono',style:{fontSize:10,color:'var(--mint)',fontWeight:700}},
        `${s.diasFeitos.length}/21 DIAS`)),
    h('div',{style:{display:'flex',gap:3}},
      Array.from({length:21},(_,i)=>{
        const d=i+1, done=s.diasFeitos.includes(d), atual=d===s.diaAtual;
        return h('div',{key:d,title:`Dia ${d}`,
          style:{flex:1,height:26,borderRadius:4,position:'relative',
            background: atual? 'var(--pink)'
              : done? 'linear-gradient(180deg, rgba(74,222,155,.5), rgba(74,222,155,.25))'
              : 'var(--ov-1)',
            boxShadow: atual? '0 0 10px var(--pink-glow)' : 'none',
            animation:`scaleIn .4s ${i*.018}s cubic-bezier(.34,1.56,.64,1) both`}},
          [7,14,21].includes(d) && h('span',{style:{position:'absolute',bottom:-1,left:'50%',
            transform:'translateX(-50%)',width:3,height:3,borderRadius:'50%',
            background:done||atual?'#fff':'var(--gold)',opacity:.9}}));
      })),
    h('div',{style:{display:'flex',justifyContent:'space-between',marginTop:6}},
      ['Dia 1','Dia 7','Dia 14','Dia 21'].map((l,i)=>
        h('span',{key:i,className:'mono',style:{fontSize:8,color:'var(--ink-4)',
          letterSpacing:'.05em'}},l))));

/* ═══ TELA MISSÕES ═══ */
const TelaMissoes = ({s, set, go, toast}) => {
  const [aba,setAba]=useState('hoje');
  const dia=DIAS[s.diaAtual]||DIAS[1];
  const ch=CHAVES.find(c=>c.id===dia.chave);
  const chave=MISSAO_CHAVE[s.diaAtual];
  const feitos=s.missoes[s.diaAtual]||[];
  const todas=[chave,...MISSOES_DIARIAS,...MISSOES_BONUS];
  const completo=feitos.includes(chave.id) &&
    MISSOES_DIARIAS.every(m=>feitos.includes(m.id));

  const [celebra,setCelebra]=useState(null);

  const toggle=(m)=>{
    const on=feitos.includes(m.id);
    set(p=>({...p,missoes:{...p.missoes,
      [p.diaAtual]: on? feitos.filter(x=>x!==m.id) : [...feitos,m.id]},
      xp:Math.max(0,p.xp+(on?-m.xp:m.xp))}));
    if(!on){
      soltarConfete();
      setCelebra({nome:m.nome, xp:m.xp, chave:m===chave});
      setTimeout(()=>setCelebra(null), 2100);
      toast(m===chave?'Chave destravada!':m.tipo==='bonus'?'Bônus conquistado':'Missão cumprida',
        `+${m.xp} XP · ${m.nome}`, m===chave?'key':m.tipo==='bonus'?'star':'check');
    }
  };

  const concluirDia=()=>{
    set(p=>{
      const df=p.diasFeitos.includes(p.diaAtual)?p.diasFeitos:[...p.diasFeitos,p.diaAtual];
      const novo=!p.diasFeitos.includes(p.diaAtual);
      return {...p,diasFeitos:df, streak:novo?p.streak+1:p.streak,
        xp:p.xp+(novo?50:0),
        diaAtual:Math.min(21,p.diaAtual+(novo?1:0)),
        agua:novo?0:p.agua, janela:novo?{...p.janela,abriu:null}:p.janela};
    });
    toast('Dia concluído! +50 XP bônus',`Chave ${String(ch.id).padStart(2,'0')} · ${ch.nome}`,'trophy');
  };

  return h('div',{className:'screen-anim',style:{padding:'6px 18px 0'}},

    /* ═══ CELEBRAÇÃO DE MISSÃO CUMPRIDA ═══ */
    celebra && ReactDOM.createPortal(h('div',{className:'cel-veu'},
      h('div',{className:'cel-caixa'},
        h('div',{className:'cel-anel'},
          h('div',{className:'cel-disco',
            style:{background:celebra.chave
              ? 'linear-gradient(140deg, var(--gold), var(--gold-2))'
              : 'linear-gradient(140deg, var(--mint), #2FA877)'}},
            h(Icon,{n:celebra.chave?'key':'check',s:38,
              c:celebra.chave?'#241505':'#04140f',w:3}))),
        h('div',{className:'cel-xp'},`+${celebra.xp} XP`),
        h('div',{className:'cel-t'},celebra.chave?'Chave destravada':'Missão cumprida'),
        h('div',{className:'cel-s'},celebra.nome))), document.body),

    /* título */
    h('div',{className:'rise',style:{marginBottom:16}},
      h('div',{className:'eyebrow eyebrow-pink',style:{marginBottom:5}},
        `DIA ${s.diaAtual} · CHAVE ${String(ch.id).padStart(2,'0')} · ${ch.nome}`),
      h('div',{className:'h-display',style:{fontSize:30}},'Missões'),
      h('div',{style:{fontSize:12.5,color:'var(--ink-3)',marginTop:5,lineHeight:1.45}},
        'Cada missão cumprida destrava uma parte da chave de hoje.')),

    h(XPHeader,{s}),
    h(StreakBar,{s}),

    /* abas internas */
    h('div',{className:'rise d2',style:{display:'flex',gap:7,marginBottom:18}},
      [{id:'hoje',l:'Hoje',n:todas.length},
       {id:'diarias',l:'Diárias',n:MISSOES_DIARIAS.length},
       {id:'bonus',l:'Bônus',n:MISSOES_BONUS.length}].map(t=>
        h('button',{key:t.id,onClick:()=>setAba(t.id),
          style:{flex:1,padding:'10px 6px',borderRadius:'var(--r-md)',
            background:aba===t.id?'var(--pink-soft)':'var(--surf)',
            border:`1px solid ${aba===t.id?'var(--line-pink)':'var(--line)'}`,
            transition:'all .28s cubic-bezier(.34,1.56,.64,1)'}},
          h('div',{style:{fontSize:12.5,fontWeight:700,letterSpacing:'-.01em',
            color:aba===t.id?'var(--pink)':'var(--ink-3)'}},t.l),
          h('div',{className:'mono',style:{fontSize:8.5,marginTop:2,
            color:aba===t.id?'var(--pink-2)':'var(--ink-4)'}},`${t.n} MISSÕES`)))),

    /* lista */
    aba==='hoje' && h(React.Fragment,null,
      h(MissaoCard,{m:chave,on:feitos.includes(chave.id),destaque:true,i:0,
        onToggle:()=>toggle(chave)}),
      h('div',{className:'sec-head'},h('span',{className:'sec-title'},'MISSÕES DIÁRIAS')),
      MISSOES_DIARIAS.map((m,i)=>h(MissaoCard,{key:m.id,m,on:feitos.includes(m.id),i:i+1,
        prog:m.meta?Math.min(s.agua,m.meta):null,onToggle:()=>toggle(m)})),
      h('div',{className:'sec-head'},
        h('span',{className:'sec-title'},'BÔNUS OPCIONAIS'),
        h('span',{className:'chip chip-gold'},'XP EXTRA')),
      MISSOES_BONUS.map((m,i)=>h(MissaoCard,{key:m.id,m,on:feitos.includes(m.id),i:i+5,
        onToggle:()=>toggle(m)}))),

    aba==='diarias' && h(React.Fragment,null,
      h('p',{style:{fontSize:12.5,color:'var(--ink-3)',lineHeight:1.5,marginBottom:16}},
        'Estas quatro se repetem todos os dias. São os hábitos-âncora do método — '+
        'os que vão continuar depois do Dia 21.'),
      MISSOES_DIARIAS.map((m,i)=>h(MissaoCard,{key:m.id,m,on:feitos.includes(m.id),i,
        prog:m.meta?Math.min(s.agua,m.meta):null,onToggle:()=>toggle(m)}))),

    aba==='bonus' && h(React.Fragment,null,
      h('p',{style:{fontSize:12.5,color:'var(--ink-3)',lineHeight:1.5,marginBottom:16}},
        'Opcionais. Não contam para fechar o dia, mas aceleram seu nível '+
        'e reforçam o resultado.'),
      MISSOES_BONUS.map((m,i)=>h(MissaoCard,{key:m.id,m,on:feitos.includes(m.id),i,
        onToggle:()=>toggle(m)}))),

    aba==='hoje' && h(ModoMinimo,{s,set,toast}),

    /* CTA concluir dia */
    h('div',{style:{marginTop:24,marginBottom:8}},
      h('div',{style:{display:'flex',justifyContent:'space-between',marginBottom:9}},
        h('span',{className:'mono',style:{fontSize:9,color:'var(--ink-3)',letterSpacing:'.1em'}},
          'MISSÃO-CHAVE + 4 DIÁRIAS PARA FECHAR'),
        h('span',{className:'mono',style:{fontSize:9,color:'var(--pink)',fontWeight:700}},
          `${feitos.filter(f=>[chave.id,...MISSOES_DIARIAS.map(m=>m.id)].includes(f)).length}/5`)),
      h(Bar,{v:feitos.filter(f=>[chave.id,...MISSOES_DIARIAS.map(m=>m.id)].includes(f)).length/5,h:7}),
      h('button',{onClick:concluirDia,disabled:!completo,
        style:{width:'100%',marginTop:16,padding:17,borderRadius:'var(--r-full)',
          background:completo?'linear-gradient(135deg,var(--pink),var(--violet))':'var(--ov-1)',
          border:completo?'none':'1px solid var(--line)',
          color:completo?'#fff':'var(--ink-4)',
          fontFamily:'var(--f-display)',fontWeight:700,fontSize:15,letterSpacing:'-.02em',
          boxShadow:completo?'0 10px 32px var(--pink-glow)':'none',
          display:'flex',alignItems:'center',justifyContent:'center',gap:9}},
        completo? h(React.Fragment,null,h(Icon,{n:'trophy',s:18,c:'#fff'}),
          'Concluir Dia '+s.diaAtual+' · +50 XP')
        : 'Complete as 5 principais para fechar o dia')),
    h('div',{style:{height:16}}));
};
