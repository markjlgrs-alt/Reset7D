/* ═══════════════════════════════════════════════════════════
   PAINEL DE GRÁFICOS DA JORNADA + COMPARATIVO ANTES/DEPOIS
═══════════════════════════════════════════════════════════ */

/* Cartão de gráfico com sparkline, delta e leitura em uma frase */
const GraficoCard = ({titulo, sub, un, cor, pts, lbls, invertido=true, leitura, i=0}) => {
  const ok = pts.length>=2;
  const delta = ok ? pts[pts.length-1]-pts[0] : 0;
  const bom = invertido ? delta<0 : delta>0;
  return h(Reveal,{tipo:'rv-3d',delay:i*80},
    h('div',{className:'card lift',style:{padding:18,marginBottom:11}},
      h('div',{style:{display:'flex',alignItems:'flex-start',gap:12,marginBottom:14}},
        h('span',{style:{width:36,height:36,borderRadius:12,flexShrink:0,
          background:CORES_SOFT[cor],display:'flex',alignItems:'center',
          justifyContent:'center'}},
          h(Icon,{n:titulo==='Cintura'?'ruler':titulo==='Peso'?'scale':
            titulo==='Sono'?'moon':titulo==='Energia'?'zap':'chart',s:17,c:CORES[cor]})),
        h('div',{style:{flex:1,minWidth:0}},
          h('div',{style:{fontFamily:'var(--f-display)',fontSize:17,fontWeight:600,
            letterSpacing:'-.025em'}},titulo),
          h('div',{style:{fontSize:11.5,color:'var(--ink-3)',marginTop:2}},sub)),
        h('div',{style:{textAlign:'right'}},
          h('div',{style:{fontFamily:'var(--f-display)',fontSize:24,fontWeight:600,
            letterSpacing:'-.04em',lineHeight:1,
            color: ok ? (bom?'var(--mint)':CORES[cor]) : 'var(--ink-4)'}},
            ok? (delta>0?'+':'')+delta.toFixed(1).replace('.',',') : '—',
            h('span',{style:{fontSize:11,opacity:.7}},' '+un)),
          h('div',{className:'mono',style:{fontSize:7.5,color:'var(--ink-4)',
            letterSpacing:'.1em',marginTop:3}},'DESDE O DIA 1'))),
      ok
        ? h('div',null,
            h(Linha,{pts,cor:CORES[cor],dots:true,hgt:78,id:'g'+titulo}),
            h('div',{style:{display:'flex',justifyContent:'space-between',marginTop:7}},
              lbls.map((l,k)=>h('span',{key:k,className:'mono',
                style:{fontSize:8.5,color:'var(--ink-4)'}},l))))
        : h('div',{style:{padding:'22px 0',textAlign:'center',color:'var(--ink-4)',
            fontSize:12}},'Registre 2 medições para ver a curva'),
      leitura && h('p',{style:{fontSize:12,lineHeight:1.55,color:'var(--ink-2)',
        marginTop:13,paddingTop:12,borderTop:'1px dashed var(--line-2)'}},leitura)));
};

/* Painel com os quatro gráficos da jornada */
const PainelGraficos = ({s}) => {
  const med = s.medidas, chk = s.checkins;
  const lblM = med.map(x=>`D${x.dia}`), lblC = chk.map(x=>`D${x.dia}`);
  const perda = med.length>=2 ? med[0].cintura-med[med.length-1].cintura : 0;
  const semana = Array.from({length:7},(_,i)=>{
    const d = Math.max(1, s.diaAtual-6+i);
    return {d, feito:s.diasFeitos.includes(d), qtd:(s.missoes[d]||[]).length};
  });

  return h('div',null,
    h(GraficoCard,{i:0,titulo:'Cintura',sub:'a única medida que decide',un:'cm',cor:'pink',
      pts:med.map(x=>x.cintura),lbls:lblM,invertido:true,
      leitura: perda>0
        ? `Você já tirou ${perda.toFixed(1).replace('.',',')} cm da cintura — isso é gordura visceral e retenção saindo, não água perdida.`
        : 'Meça em jejum, no mesmo ponto, todo dia. A curva começa a aparecer a partir do terceiro registro.'}),
    h(GraficoCard,{i:1,titulo:'Peso',sub:'o número que menos importa',un:'kg',cor:'gold',
      pts:med.map(x=>x.peso),lbls:lblM,invertido:true,
      leitura:'O peso trava enquanto você troca gordura por massa magra. Se a cintura desce e o peso não, o método está funcionando.'}),
    h(GraficoCard,{i:2,titulo:'Sono',sub:'onde a recomposição acontece',un:'h',cor:'violet',
      pts:chk.map(x=>x.sono),lbls:lblC,invertido:false,
      leitura:'Abaixo de 7 horas o cortisol noturno sobe e o corpo segura líquido no abdômen. Sono é protocolo, não pausa.'}),
    h(GraficoCard,{i:3,titulo:'Energia',sub:'como você está se sentindo',un:'/5',cor:'mint',
      pts:chk.map(x=>x.energia),lbls:lblC,invertido:false,
      leitura:'Energia subindo com a cintura descendo é o sinal de que você está perdendo gordura — e não músculo.'}),

    /* barras de constância da semana */
    h(Reveal,{tipo:'rv-3d',delay:320},
      h('div',{className:'card',style:{padding:18,marginBottom:11}},
        h('div',{style:{display:'flex',alignItems:'center',gap:12,marginBottom:16}},
          h('span',{style:{width:36,height:36,borderRadius:12,flexShrink:0,
            background:'var(--coral-soft)',display:'flex',alignItems:'center',
            justifyContent:'center'}},h(Icon,{n:'flame',s:17,c:'var(--coral)'})),
          h('div',{style:{flex:1}},
            h('div',{style:{fontFamily:'var(--f-display)',fontSize:17,fontWeight:600,
              letterSpacing:'-.025em'}},'Constância'),
            h('div',{style:{fontSize:11.5,color:'var(--ink-3)',marginTop:2}},
              'missões cumpridas nos últimos 7 dias')),
          h('div',{style:{fontFamily:'var(--f-display)',fontSize:24,fontWeight:600,
            color:'var(--coral)',letterSpacing:'-.04em'}},s.streak,
            h('span',{style:{fontSize:11,opacity:.7}},' dias'))),
        h('div',{style:{display:'flex',alignItems:'flex-end',gap:7,height:92}},
          semana.map((x,i)=>{
            const alt = Math.max(8, (x.feito?5:x.qtd)/5*88);
            return h('div',{key:i,style:{flex:1,display:'flex',flexDirection:'column',
              alignItems:'center',gap:6}},
              h('div',{style:{width:'100%',height:alt,borderRadius:'7px 7px 3px 3px',
                background: x.feito
                  ? 'linear-gradient(180deg, var(--mint), color-mix(in srgb, var(--mint) 55%, transparent))'
                  : x.d===s.diaAtual
                    ? 'linear-gradient(180deg, var(--pink), var(--pink-2))'
                    : 'var(--ov-2)',
                boxShadow: x.feito?'0 4px 14px rgba(74,222,155,.28)':'none',
                transition:'height .9s cubic-bezier(.16,1,.3,1)'}}),
              h('span',{className:'mono',style:{fontSize:8.5,
                color:x.d===s.diaAtual?'var(--pink)':'var(--ink-4)'}},`D${x.d}`));
          })))));
};

/* Comparativo antes/depois — uma foto do início contra a de agora */
const AntesDepois = ({s}) => {
  const med = s.medidas;
  const ini = med[0], fim = med[med.length-1];
  const dias = [ini.dia, fim.dia];
  const perda = (ini.cintura - fim.cintura);
  const pesoD = (ini.peso - fim.peso);
  const Card = ({rot, dia, cintura, peso, cena, destaque}) =>
    h('div',{className:'on-photo',style:{flex:1,position:'relative',overflow:'hidden',
      borderRadius:'var(--r-md)',aspectRatio:'3/4',
      border:`1px solid ${destaque?'var(--line-pink)':'var(--line)'}`,
      boxShadow: destaque?'0 10px 30px var(--pink-glow)':'none'}},
      h(FotoCena,{cena,h:'100%',zoom:.92,silX:'50%',silOp:.72,
        style:{position:'absolute',inset:0}}),
      h('div',{style:{position:'absolute',inset:0,
        background:'linear-gradient(180deg, rgba(6,3,6,.32) 0%, rgba(6,3,6,.15) 40%, rgba(6,3,6,.88) 100%)'}}),
      h('div',{style:{position:'relative',zIndex:3,height:'100%',padding:12,
        display:'flex',flexDirection:'column'}},
        h('span',{className:'chip',style:{alignSelf:'flex-start',padding:'3px 9px',
          fontSize:7.5,background: destaque?'var(--pink)':'rgba(0,0,0,.5)',
          color:'#fff',borderColor:'transparent',backdropFilter:'blur(8px)'}},rot),
        h('div',{style:{marginTop:'auto'}},
          h('div',{className:'mono',style:{fontSize:8,letterSpacing:'.13em',
            color:'rgba(255,255,255,.6)',marginBottom:4}},`DIA ${String(dia).padStart(2,'0')}`),
          h('div',{style:{fontFamily:'var(--f-display)',fontSize:23,fontWeight:600,
            letterSpacing:'-.04em',lineHeight:1,color:'#fff'}},
            String(cintura).replace('.',','),
            h('span',{style:{fontSize:11,opacity:.7}},' cm')),
          h('div',{style:{fontSize:10.5,color:'rgba(255,255,255,.62)',marginTop:3}},
            `${String(peso).replace('.',',')} kg`))));

  return h('div',null,
    h(Reveal,{tipo:'rv-s'},
      h('div',{style:{display:'flex',gap:11,marginBottom:13}},
        h(Card,{rot:'ANTES',dia:dias[0],cintura:ini.cintura,peso:ini.peso,cena:'medida'}),
        h(Card,{rot:'AGORA',dia:dias[1],cintura:fim.cintura,peso:fim.peso,
          cena:'transverso',destaque:true}))),
    h(Reveal,{tipo:'rv-s',delay:90},
      h('div',{className:'card',style:{padding:18,
        background:'linear-gradient(140deg, var(--mint-soft), transparent 60%), var(--surf)',
        borderColor:'rgba(74,222,155,.24)'}},
        h('div',{style:{display:'flex',gap:14}},
          [[`−${perda.toFixed(1).replace('.',',')}`,'CM DE CINTURA','mint'],
           [`−${Math.abs(pesoD).toFixed(1).replace('.',',')}`,'KG NA BALANÇA','gold'],
           [`${dias[1]-dias[0]}`,'DIAS ENTRE ELAS','pink']].map(([v,l,c],i)=>
            h('div',{key:i,style:{flex:1}},
              h('div',{style:{fontFamily:'var(--f-display)',fontSize:23,fontWeight:600,
                letterSpacing:'-.04em',color:CORES[c],lineHeight:1}},v),
              h('div',{className:'mono',style:{fontSize:7.5,letterSpacing:'.09em',
                color:'var(--ink-4)',marginTop:5}},l)))),
        h('p',{style:{fontSize:12.5,lineHeight:1.6,color:'var(--ink-2)',marginTop:14,
          paddingTop:13,borderTop:'1px dashed var(--line-2)'}},
          perda >= 2
            ? 'Repare: a balança mal se mexeu e a cintura desceu. É exatamente isso que recomposição significa — o espelho muda antes do número.'
            : 'A primeira semana é de desinchaço. A queda firme de centímetros começa quando a Chave 04 entra.'))));
};
