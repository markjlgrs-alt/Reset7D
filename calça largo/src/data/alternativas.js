/* ═══════════════════════════════════════════════════════════
   PLANO B DE MATERIAL — "não tenho isso em casa, e agora?"
   Cada dia tem substituições reais, testadas e sem desculpa.
═══════════════════════════════════════════════════════════ */
const ALTERNATIVAS = {
  1:{ t:'Não tenho fita métrica', ico:'ruler',
    opts:[
      {a:'Barbante + régua', d:'Dá uma volta na cintura com barbante, marca com caneta onde encontra, estica na régua ou na mesa e mede. Precisão idêntica à da fita.'},
      {a:'Cadarço, fita de presente ou carregador', d:'Serve qualquer coisa que não estique. Marque com nó ou com um pedacinho de fita crepe.'},
      {a:'A trena da casa', d:'Sim, aquela do seu marido, do seu pai, do vizinho ou da caixa de ferramentas. Ela mede a parede — mede você também. Só puxe sem apertar.'},
      {a:'A calça-teste', d:'Se nada disso existir hoje: escolha uma calça que fecha com esforço. Ela vira sua fita. Anote como está fechando hoje: “só deitada”, “apertando”, “folgada”.'},
    ],
    obs:'Meça sempre em jejum, de pé, na altura do umbigo, sem prender a barriga e sem apertar a fita. Mesma hora, todos os dias.' },

  2:{ t:'Não tenho escova de drenagem', ico:'hand',
    opts:[
      {a:'Suas próprias mãos', d:'Mão espalmada, pressão de carinho — não de massagem forte. A linfa corre logo abaixo da pele, não no músculo.'},
      {a:'Luva de banho ou toalha seca', d:'Movimentos curtos, sempre em direção às virilhas e às axilas.'},
      {a:'Óleo de cozinha ou hidratante', d:'Qualquer coisa que reduza o atrito. Coco, girassol, creme comum. Não precisa ser óleo caro.'},
    ],
    obs:'Se ficou vermelho, você apertou demais. Drenagem é leve — quem trabalha é o vaso linfático, não a sua força.' },

  4:{ t:'Não consigo fazer o vacuum de quatro', ico:'core',
    opts:[
      {a:'Em pé, mãos nos joelhos', d:'Joelhos semiflexionados, tronco inclinado. Versão mais fácil, ótima para começar.'},
      {a:'Deitada, joelhos dobrados', d:'A mais confortável se você tem dor lombar ou está no pós-parto.'},
      {a:'Sentada na cadeira do trabalho', d:'Coluna longa, pés no chão. Ninguém percebe — dá para fazer no escritório.'},
    ],
    obs:'Gestante, pós-operatório recente ou hérnia abdominal: fale com seu médico antes. Existem outras chaves para trabalhar enquanto isso.' },

  5:{ t:'Não tenho halteres nem academia', ico:'dumbbell',
    opts:[
      {a:'Garrafas de água ou de areia', d:'1 litro = 1 kg. Duas garrafas de 2 L já dão um treino honesto de membro superior.'},
      {a:'Mochila com livros', d:'Vira agachamento com carga, afundo e remada. Ajuste o peso pelo número de livros.'},
      {a:'Sacola de compras', d:'Arroz, feijão e leite fazem o trabalho de qualquer anilha.'},
      {a:'Só o peso do corpo', d:'Agachamento na cadeira, flexão na parede, ponte de glúteo. Progrida no número de repetições.'},
    ],
    obs:'O músculo não sabe o preço do equipamento. Ele só entende tensão, repetição e descanso.' },

  9:{ t:'Não tenho relógio de frequência cardíaca', ico:'heart',
    opts:[
      {a:'Teste da fala', d:'Zona 2 é o ritmo em que você consegue falar uma frase inteira, mas não consegue cantar. Simples e confiável.'},
      {a:'Dedos no pulso, 15 segundos', d:'Conte as batidas em 15s e multiplique por 4. Compare com a sua faixa.'},
      {a:'Qualquer app de passos do celular', d:'Ritmo constante por 30 a 40 minutos vale mais que a precisão do número.'},
    ],
    obs:'Se você terminou ofegante demais para conversar, passou da zona — e queimou menos gordura, não mais.' },

  12:{ t:'Não tenho banheira nem chuveiro frio', ico:'snow',
    opts:[
      {a:'Últimos 30 segundos do banho', d:'Termine no mais frio que o seu chuveiro conseguir. Só isso já ativa a gordura marrom.'},
      {a:'Bacia com água e gelo nos pés', d:'Dois minutos. O choque térmico local também sinaliza para o sistema.'},
      {a:'Toalha gelada na nuca', d:'Versão mais suave, boa para quem tem pressão baixa.'},
    ],
    obs:'Pressão descontrolada, doença cardíaca ou gravidez: pule o frio e fique com as outras chaves do dia.' },
};

/* fallback por chave, quando o dia não tem plano B específico */
const ALT_POR_CHAVE = {
  1:{ t:'Não tenho tempo para a drenagem', ico:'clock',
    opts:[
      {a:'Faça na cama, antes de levantar', d:'Cinco minutos deitada, antes do primeiro pé no chão.'},
      {a:'Faça no banho', d:'Com o corpo ensaboado desliza melhor e você não gasta tempo extra.'},
    ], obs:'O que não pode é pular dois dias seguidos.' },
  2:{ t:'Não tenho os ingredientes da receita', ico:'plate',
    opts:[
      {a:'Troque a proteína, não o valor', d:'Ovo, frango, atum, iogurte grego, whey — o que importa é chegar aos 30-40 g.'},
      {a:'Congelado serve', d:'Legume e fruta congelados têm o mesmo perfil de fibra do fresco. E são mais baratos.'},
    ], obs:'Regra única: proteína primeiro, sempre.' },
  3:{ t:'Não consigo um lugar silencioso', ico:'lungs',
    opts:[
      {a:'Banheiro, carro ou escada', d:'A respiração 4-7-8 dura 90 segundos. Qualquer canto serve.'},
      {a:'Fone com ruído branco', d:'Se a casa é cheia, o fone cria o silêncio que o ambiente não dá.'},
    ], obs:'Você não precisa de paz para respirar. Precisa respirar para ter paz.' },
  4:{ t:'Sinto dor ao fazer o exercício', ico:'shield',
    opts:[
      {a:'Reduza a amplitude pela metade', d:'Metade do movimento, mesma ativação. Amplitude vem com o tempo.'},
      {a:'Troque a posição', d:'Deitada e sentada tiram carga da lombar.'},
    ], obs:'Desconforto muscular é normal. Dor aguda, ardida ou irradiando não é — pare e procure orientação.' },
  5:{ t:'Não tenho onde caminhar', ico:'walk',
    opts:[
      {a:'Escada do prédio', d:'Dez minutos de escada em ritmo confortável equivalem à caminhada.'},
      {a:'Marcha no lugar, na sala', d:'Com um vídeo tocando. Vale igual.'},
    ], obs:'Movimento é movimento. O cenário é detalhe.' },
  6:{ t:'Durmo com barulho ou luz', ico:'moon',
    opts:[
      {a:'Máscara de dormir ou camiseta escura', d:'Escuro total vale mais que horas extras de sono ruim.'},
      {a:'Protetor auricular ou ruído branco', d:'Ventilador ligado já resolve na maioria das casas.'},
    ], obs:'Cada 30 minutos a mais de sono profundo muda a fome do dia seguinte.' },
  7:{ t:'Não tenho com quem dividir o método', ico:'users',
    opts:[
      {a:'Use a comunidade do app', d:'Conte o seu dia lá. Testemunha não precisa morar com você.'},
      {a:'Mande uma foto do seu registro para alguém', d:'Uma pessoa só. Todo dia. Isso basta.'},
    ], obs:'Quem conta em voz alta desiste menos. É comportamento, não motivação.' },
};

const alternativaDoDia = (d, chave) => ALTERNATIVAS[d] || ALT_POR_CHAVE[chave] || ALT_POR_CHAVE[1];
