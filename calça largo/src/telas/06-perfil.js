/* ═══════════════════════════════════════════════════════════
   PERFIL — quem você é dentro do método
   identidade · álbum privado · conquistas · compromissos · ajustes
═══════════════════════════════════════════════════════════ */
const LinhaOpcao = ({i, c, n, sub, valor, onClick, i2}) =>
  h('button',{onClick,className:'press',
    style:{width:'100%',textAlign:'left',display:'flex',alignItems:'center',gap:13,
      padding:'14px 15px',marginBottom:9,background:'var(--surf)',
      border:'1px solid var(--line)',borderRadius:'var(--r-md)',
      transition:'transform .3s cubic-bezier(.16,1,.3,1), border-color .3s ease'}},
    h('span',{style:{width:38,height:38,borderRadius:13,flexShrink:0,
      background:CORES_SOFT[c],display:'flex',alignItems:'center',justifyContent:'center'}},
      h(Icon,{n:i,s:17,c:CORES[c]})),
    h('span',{style:{flex:1,minWidth:0}},
      h('span',{style:{display:'block',fontSize:14,fontWeight:600,letterSpacing:'-.015em'}},n),
      sub && h('span',{style:{display:'block',fontSize:11.5,color:'var(--ink-3)',marginTop:2}},sub)),
    valor && h('span',{className:'mono',style:{fontSize:11,color:'var(--ink-3)'}},valor),
    h(Icon,{n:i2||'chevR',s:15,c:'var(--ink-4)'}));

const TelaPerfil = ({s, set, go, toast}) => {
  const nv = nivelDe(s.xp);
  const med = s.medidas, perda = med[0].cintura - med[med.length-1].cintura;
  const conquistadas = MEDALHAS.filter((_,i)=> i < Math.floor(s.diasFeitos.length*0.9)+1);
  const lidosTot = Object.values(s.lidos||{}).reduce((a,v)=>a+(v?v.length:0),0);

  return h('div',{className:'screen-anim'},
    h(PerfilHeader,{s,go}),

    h('div',{style:{padding:'0 18px 20px'}},

      /* ═══ RESUMO DO PROTOCOLO ═══ */
      h(SecHead,{t:'SEU PROTOCOLO EM NÚMEROS'}),
      h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}},
        [{i:'zap',   c:'gold',  v:s.xp.toLocaleString('pt-BR'), l:'XP acumulado'},
         {i:'book',  c:'violet',v:lidosTot,                      l:'blocos lidos'},
         {i:'trophy',c:'pink',  v:`${conquistadas.length}/${MEDALHAS.length}`, l:'medalhas'},
         {i:'ruler', c:'mint',  v:`${perda.toFixed(1).replace('.',',')} cm`,   l:'destravados'},
        ].map((x,i)=>
          h(Reveal,{key:i,tipo:'rv-s',delay:i*70},
            h('div',{className:'card lift',style:{padding:16}},
              h('span',{style:{width:34,height:34,borderRadius:12,display:'flex',
                alignItems:'center',justifyContent:'center',marginBottom:11,
                background:CORES_SOFT[x.c]}},h(Icon,{n:x.i,s:16,c:CORES[x.c]})),
              h('div',{style:{fontFamily:'var(--f-display)',fontSize:22,fontWeight:600,
                letterSpacing:'-.035em',lineHeight:1,color:CORES[x.c]}},x.v),
              h('div',{style:{fontSize:11.5,color:'var(--ink-3)',marginTop:5}},x.l))))),

      /* ═══ NÍVEL ═══ */
      h(SecHead,{t:'SEU NÍVEL'}),
      h(Reveal,{tipo:'rv-3d'},
        h('div',{className:'card',style:{padding:20,
          background:'linear-gradient(145deg, var(--gold-soft), transparent 62%), var(--surf)',
          borderColor:'var(--line-gold)'}},
          h('div',{style:{display:'flex',alignItems:'center',gap:14,marginBottom:15}},
            h(Anel,{v:nv.pct,size:58,sw:5,cor:'var(--gold)'},
              h('span',{style:{fontFamily:'var(--f-display)',fontSize:19,fontWeight:600,
                color:'var(--gold)'}},nv.n)),
            h('div',{style:{flex:1}},
              h('div',{className:'eyebrow eyebrow-gold',style:{marginBottom:4}},
                `NÍVEL ${nv.n} DE ${NIVEIS.length}`),
              h('div',{style:{fontFamily:'var(--f-display)',fontSize:20,fontWeight:600,
                letterSpacing:'-.03em'}},nv.nome),
              h('div',{style:{fontSize:11.5,color:'var(--ink-3)',marginTop:3}},
                nv.prox? `faltam ${nv.falta} XP para ${nv.prox.nome}` : 'patamar máximo do método'))),
          h(Bar,{v:nv.pct,cor:'gold'}))),

      /* ═══ ÁLBUM PRIVADO ═══ */
      h(SecHead,{t:'ÁLBUM PRIVADO'}),
      h(FeedFotos,{s,toast}),

      /* ═══ CONQUISTAS ═══ */
      h(SecHead,{t:'CONQUISTAS',acao:'Ver todas',onAcao:()=>go('evolucao')}),
      h(Reveal,{tipo:'rv-s'},
        h('div',{className:'card',style:{padding:18}},
          h('div',{style:{display:'flex',alignItems:'center',gap:13,marginBottom:15}},
            h(Icon,{n:'trophy',s:22,c:'var(--gold)'}),
            h('div',{style:{flex:1}},
              h('div',{style:{fontFamily:'var(--f-display)',fontSize:18,fontWeight:600,
                letterSpacing:'-.03em'}},`${conquistadas.length} medalhas conquistadas`),
              h('div',{style:{fontSize:11.5,color:'var(--ink-3)',marginTop:2}},
                `faltam ${MEDALHAS.length-conquistadas.length} para completar a coleção`))),
          h('div',{className:'hscroll',style:{margin:0,padding:'2px 0 4px',gap:9}},
            conquistadas.slice(-6).map((m,i)=>
              h('div',{key:m.id,style:{width:74,textAlign:'center'}},
                h(Medalha,{tipo:m.glifo,cor:m.cor,size:54,on:true}),
                h('div',{style:{fontSize:9.5,color:'var(--ink-3)',marginTop:7,
                  lineHeight:1.25}},m.nome)))))),

      /* ═══ COMPROMISSOS ═══ */
      h(SecHead,{t:'MEUS COMPROMISSOS'}),
      h(BlocoEditavel,{titulo:'Meus 3 Atos Vitalícios',
        sub:'Os hábitos que ficam para sempre · Dia 20',ico:'star',cor:'gold',
        itens:s.atos,placeholder:'Ato',s,
        onSave:v=>{set(p=>({...p,atos:v})); toast('Atos salvos','Eles reaparecem no seu Dia 21','star');}}),
      h(BlocoEditavel,{titulo:'Meus Planos B',
        sub:'5 frases se-então para dias ruins · Dia 19',ico:'shield',cor:'coral',
        itens:s.planoB,placeholder:'Se… então…',s,
        onSave:v=>{set(p=>({...p,planoB:v})); toast('Planos B salvos','Prontos para o dia difícil','shield');}}),
      h(BlocoEditavel,{titulo:'Minha Testemunha',
        sub:'A pessoa que acompanha você · Dia 16',ico:'users',cor:'mint',
        itens:[s.testemunha],placeholder:'Nome da',s,
        onSave:v=>set(p=>({...p,testemunha:v[0]}))}),

      /* ═══ AJUSTES ═══ */
      h(SecHead,{t:'AJUSTES'}),
      h(Reveal,{tipo:'rv-s'},
        h('div',null,
          h(LinhaOpcao,{i:s.tema==='claro'?'sun':'moon',c:'violet',
            n:'Aparência',sub:'tema claro ou escuro',
            valor:s.tema==='claro'?'Claro':'Escuro',
            onClick:()=>set(p=>({...p,tema:p.tema==='claro'?'escuro':'claro'}))}),
          h(LinhaOpcao,{i:'bell',c:'pink',n:'Lembretes',
            sub:'janela de ouro, água e sono',valor:'3 ativos',
            onClick:()=>toast('Lembretes','Disponível na versão publicada','bell')}),
          h(LinhaOpcao,{i:'ruler',c:'gold',n:'Minhas medidas',
            sub:`${s.medidas.length} registros`,
            onClick:()=>go('checkin')}),
          h(LinhaOpcao,{i:'book',c:'violet',n:'Biblioteca científica',
            sub:'todos os estudos do método',onClick:()=>go('ciencia')}),
          h(LinhaOpcao,{i:'users',c:'mint',n:'Comunidade',
            sub:'quem está com você',onClick:()=>go('comunidade')}),
          h(LinhaOpcao,{i:'shield',c:'coral',n:'Privacidade',
            sub:'suas fotos ficam só neste aparelho',
            onClick:()=>toast('Privacidade','Nada sai do seu celular','shield')}))),

      /* ═══ ZONA DE RISCO ═══ */
      h(Reveal,{tipo:'rv-s',delay:80},
        h('button',{className:'press',
          onClick:()=>{ if(confirm('Isso apaga todo o seu progresso neste aparelho. Tem certeza?')){
            localStorage.removeItem(KEY); location.reload(); } },
          style:{width:'100%',padding:'14px',marginTop:8,borderRadius:'var(--r-md)',
            border:'1px solid var(--line)',background:'transparent',
            fontSize:12.5,color:'var(--ink-4)'}},
          'Reiniciar meu protocolo')),

      h(Reveal,{delay:60},
        h('p',{style:{fontFamily:'var(--f-display)',fontStyle:'italic',textAlign:'center',
          fontSize:15,color:'var(--ink-3)',margin:'26px auto 0',maxWidth:'28ch',
          lineHeight:1.5}},
          '“A mulher do Dia 21 não é outra pessoa. É você, sem as travas.”'))));
};
