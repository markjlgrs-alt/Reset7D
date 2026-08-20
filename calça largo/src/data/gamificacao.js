/* ═══════════════════════════════════════════════════════════
   CAMADA DE GAMIFICAÇÃO — missões, medalhas, objetivos
═══════════════════════════════════════════════════════════ */

/* Mapa chave → cena fotográfica */
const CENA_POR_CHAVE = {1:'linfa',2:'insulina',3:'cortisol',4:'transverso',
  5:'lipase',6:'leptina',7:'identidade'};

/* ─── OBJETIVOS DO DIA (4 tópicos concretos) + INTRODUÇÃO ─── */
const OBJETIVOS = {
1:{ intro:'Hoje não tem exercício, não tem dieta, não tem sacrifício. Hoje tem uma coisa só: a verdade. Você vai pegar uma fita métrica e descobrir o número real da sua cintura — não o que a balança inventa, não o que o espelho distorce. Esse número vai ser seu ponto zero. E daqui a vinte dias ele vai ser a prova de que o seu corpo sempre soube responder.',
  objs:[
    {i:'ruler',t:'Descobrir seu número real',d:'cintura, quadril e razão C/Q',c:'pink'},
    {i:'camera',t:'Vencer o medo do espelho',d:'2 fotos que viram orgulho no Dia 21',c:'violet'},
    {i:'protein',t:'40g de proteína no café',d:'ativa a Lipase Feminina por 12h',c:'gold'},
    {i:'shirt',t:'Escolher a calça-teste',d:'seu termômetro dos próximos 21 dias',c:'mint'}]},
2:{ intro:'Existe um peso no seu corpo que não é gordura. É líquido preso no mesentério — a membrana que sustenta seu intestino, bem no centro da sua cintura. Ele responde em 72 horas. Hoje você aprende as três ferramentas que o colocam para andar: respirar de um jeito que a maioria das mulheres esqueceu, beber água que realmente hidrata, e mover o abdômen por fora.',
  objs:[
    {i:'lungs',t:'Drenar 1 a 2 cm de inchaço',d:'respiração diafragmática de 10 min',c:'mint'},
    {i:'water',t:'2 litros de Água Viva',d:'com eletrólitos — não água pura',c:'mint'},
    {i:'hand',t:'5 min de massagem visceral',d:'círculos horários no abdômen',c:'gold'},
    {i:'moon',t:'Sono mais profundo hoje',d:'o parassimpático ativado à noite',c:'violet'}]},
3:{ intro:'Aquele sono depois do almoço não é preguiça. Aquela vontade de doce às 15h não é fraqueza. É insulina. Ela sobe como foguete e desce como pedra — e cada pico manda energia direto para a sua cintura, porque a gordura visceral tem quatro vezes mais receptores de insulina que a gordura da coxa. Hoje você muda a curva sem cortar um único alimento.',
  objs:[
    {i:'plate',t:'Cortar 73% do pico glicêmico',d:'vegetais → proteína → carboidrato',c:'pink'},
    {i:'walk',t:'10 min de caminhada · 350 passos',d:'−17% de glicose pós-refeição',c:'gold'},
    {i:'zap',t:'Zero sono depois do almoço',d:'energia estável a tarde toda',c:'coral'},
    {i:'shield',t:'Vencer a vontade de doce das 15h',d:'não é força de vontade — é bioquímica',c:'violet'}]},
4:{ intro:'Você conhece alguém que come as mesmas coisas que você e não engorda. A diferença pode ser mais simples do que genética: ela come cedo. Cada tecido do seu corpo tem um relógio próprio, e a sensibilidade à insulina é até 30% maior de manhã. As mesmas 500 calorias às 8h e às 21h produzem respostas hormonais diferentes. Hoje você abre a sua Janela de Ouro.',
  objs:[
    {i:'clock',t:'Abrir a Janela de Ouro',d:'10h de alimentação alinhada ao relógio',c:'gold'},
    {i:'zap',t:'+30% de sensibilidade à insulina',d:'a mesma comida, outra resposta',c:'pink'},
    {i:'moon',t:'Acabar com a fome noturna',d:'o corpo se ajusta em 3-4 dias',c:'violet'},
    {i:'protein',t:'Refeição Espelho no jantar',d:'proteína densa, carbo mínimo',c:'mint'}]},
5:{ intro:'Três da manhã, coração acelerado, olhando o teto. Não foi o café, não foi o dia. Foi cortisol invertido — baixo quando devia estar alto, alto quando devia estar baixo. E cortisol alto à noite ativa uma enzima que converte hormônio em gordura bem ali, na sua cintura. Hoje você reprograma esse relógio com luz, respiração e horário.',
  objs:[
    {i:'sun',t:'5-10 min de sol ao acordar',d:'ancora o pico matinal de cortisol',c:'gold'},
    {i:'lungs',t:'Respiração 4-7-8 antes do jantar',d:'ativa o parassimpático',c:'violet'},
    {i:'clock',t:'Fechar a janela às 19h',d:'insulina volta ao basal antes do sono',c:'pink'},
    {i:'moon',t:'Telas fora às 21h',d:'melatonina sobe quando cortisol cai',c:'mint'}]},
6:{ intro:'As 8 horas erradas valem menos que as 6 horas certas. Existe uma janela específica — as primeiras quatro horas depois que você adormece — onde acontece 70% da liberação do hormônio do crescimento, o reparo muscular e a restauração da leptina. É o Bloco de Ouro. Deitar à meia-noite não é dormir menos: é perder a parte que importa.',
  objs:[
    {i:'moon',t:'Dormir antes das 22h30',d:'protege 70% do GH da noite',c:'violet'},
    {i:'zap',t:'Restaurar a leptina',d:'a fome do dia seguinte cai sozinha',c:'mint'},
    {i:'heart',t:'Ritual noturno de 5 min',d:'banho morno + chá + 4-7-8',c:'pink'},
    {i:'protein',t:'Caseína noturna',d:'síntese proteica por 6-8h dormindo',c:'gold'}]},
7:{ intro:'Sete dias. Você se lembra de como se sentia no domingo passado vestindo essa calça? Hoje você veste de novo — e vai levar sete segundos para descobrir que alguma coisa mudou. Não é sensação. É a fita, é a foto, é o tecido. Três dados objetivos dizendo a mesma coisa: o seu corpo respondeu. Ele sempre respondeu quando alguém falou a língua dele.',
  objs:[
    {i:'ruler',t:'1,5 a 3 cm de cintura',d:'a primeira prova concreta',c:'pink'},
    {i:'camera',t:'Foto lado a lado com o Dia 1',d:'o que o espelho diário esconde',c:'violet'},
    {i:'shirt',t:'A calça-teste diferente',d:'prova sensorial, não numérica',c:'gold'},
    {i:'pen',t:'5 min de reflexão escrita',d:'o que quero manter para sempre',c:'mint'}]},
8:{ intro:'Você já pagou personal para "fazer abdominal". Crunch, prancha, bike — tudo isso trabalha o reto abdominal, a faixa vertical do meio da barriga. Nenhum desses músculos puxa a cintura para dentro. Existe um que puxa: o transverso do abdômen, que envolve seu tronco como um corpete natural. Ele está aí. Só está dormindo há anos.',
  objs:[
    {i:'core',t:'Acordar o Cinturão Interno',d:'3 min de vacuum · 5 séries de 15s',c:'gold'},
    {i:'ruler',t:'1 a 2 cm sem perder gordura',d:'recomposição pura por reeducação',c:'pink'},
    {i:'user',t:'Postura visivelmente mais alta',d:'o transverso sustenta a lombar',c:'mint'},
    {i:'shield',t:'Menos dor lombar',d:'evidência de revisão sistemática 2024',c:'violet'}]},
9:{ intro:'Personal te vendeu 40 minutos, 4 vezes por semana. Você aguentou três semanas e culpou a si mesma. O problema não foi você — foi o design. Existe um formato que preserva massa magra em mulher acima dos 40 com 10 a 15 minutos, três vezes por semana, sem equipamento, na sua sala. E a meta-análise que sustenta isso é de 2023.',
  objs:[
    {i:'dumbbell',t:'Queimar ~180 kcal em 15 min',d:'8 movimentos, corpo inteiro',c:'coral'},
    {i:'zap',t:'Reverter 1% de perda muscular/ano',d:'sarcopenia começa aos 35',c:'pink'},
    {i:'heart',t:'Sair energizada, não acabada',d:'endorfina que dura o dia',c:'gold'},
    {i:'protein',t:'Janela anabólica de 30 min',d:'whey pós-treino otimiza tudo',c:'mint'}]},
10:{ intro:'Você conhece mulher que faz spinning cinco vezes por semana, come folha e não perde a cintura. Não é castigo. É que existe uma enzima — a lipase hormônio-sensível — que precisa LIBERAR a gordura da célula antes que ela possa ser queimada. Se ela está desligada, você pode correr maratona: a gordura fica lá. Hoje você aprende a zona exata que a liga.',
  objs:[
    {i:'heart',t:'Zone 2 · 30-45 min',d:'60-70% da FC máxima · ritmo de conversa',c:'coral'},
    {i:'flame',t:'Queimar ~280 kcal de gordura',d:'a zona onde a gordura é combustível',c:'pink'},
    {i:'snow',t:'30s de água fria',d:'ativa o tecido adiposo marrom',c:'mint'},
    {i:'zap',t:'Clareza mental por horas',d:'oxigenação e biogênese mitocondrial',c:'violet'}]},
11:{ intro:'Você já jantou macarrão às 21h, tomou vinho, deitou às 23h e ficou acordada até 1h sem entender por quê. Aquele jantar não era comida — era combustível para uma insulina alta que impedia a leptina de sinalizar, que impedia a melatonina de subir. A última refeição do dia decide a mulher que você é ao acordar amanhã.',
  objs:[
    {i:'plate',t:'Refeição Espelho até 19h',d:'espelha o café: proteína densa',c:'violet'},
    {i:'moon',t:'Sono profundo de verdade',d:'3-4h antes de deitar, insulina no basal',c:'pink'},
    {i:'protein',t:'Massa magra nos ombros e coxas',d:'síntese proteica noturna real',c:'gold'},
    {i:'zap',t:'Acordar com fome real',d:'sinal de metabolismo funcionando',c:'mint'}]},
12:{ intro:'Você já emagreceu quatro quilos em três semanas e depois travou. Cortou mais, treinou mais, comeu menos — e o corpo trancou tudo. Isso tem nome: termogênese adaptativa. Seu corpo baixou o metabolismo para se defender do que interpretou como fome. A única intervenção validada para prevenir isso é contraintuitiva: hoje você come mais carboidrato. De propósito.',
  objs:[
    {i:'flame',t:'Restaurar a leptina',d:'carbo de qualidade +50-80%',c:'gold'},
    {i:'shield',t:'Prevenir a queda metabólica',d:'evidência do MATADOR trial',c:'pink'},
    {i:'zap',t:'Energia para a semana toda',d:'glicogênio muscular reposto',c:'coral'},
    {i:'heart',t:'Provar que não é castigo',d:'o método é sustentável por design',c:'mint'}]},
13:{ intro:'Noventa por cento do que se fala sobre banho gelado no Instagram é exagero. Mas trinta segundos de água fria no fim do banho ativam uma via metabólica que quase nada mais ativa: o tecido adiposo marrom — uma gordura que queima gordura para gerar calor. O custo são trinta segundos de coragem. E a coragem, você vai descobrir, transfere para outras áreas.',
  objs:[
    {i:'snow',t:'30s de água fria',d:'ativa o BAT via proteína UCP1',c:'mint'},
    {i:'flame',t:'Termogênese por 4-6h',d:'catecolaminas elevadas',c:'coral'},
    {i:'shield',t:'Treinar tolerância ao desconforto',d:'eu escolho e sobrevivo',c:'violet'},
    {i:'heart',t:'Humor melhor de forma consistente',d:'dopamina e noradrenalina',c:'pink'}]},
14:{ intro:'Duas semanas atrás você era uma mulher que queria mudar. Hoje você é uma mulher que está mudando — e a diferença entre essas duas frases é tudo. A primeira semana desinchou. A segunda começou a recompor. Por isso a prova de hoje vai ser maior que a do Dia 7, e é aqui que a foto começa a te surpreender de verdade.',
  objs:[
    {i:'ruler',t:'3 a 5 cm cumulativos',d:'linfa + visceral + tônus somados',c:'pink'},
    {i:'camera',t:'Foto que surpreende',d:'a recomposição fica visível agora',c:'violet'},
    {i:'trophy',t:'Metade do caminho vencida',d:'o marco onde a maioria desiste',c:'gold'},
    {i:'pen',t:'15 min de reflexão',d:'5 perguntas da metade',c:'mint'}]},
15:{ intro:'Noventa e cinco por cento das mulheres que emagrecem ganham tudo de volta em doze meses. Não é falta de disciplina — é biologia. A leptina, hormônio que diz ao cérebro "está satisfeito", se torna resistente depois de anos de dieta, sono ruim e estresse. O cérebro deixa de ouvir. E a partir de hoje a gente começa a curar esse termostato.',
  objs:[
    {i:'moon',t:'Bloco de Ouro absoluto',d:'22h30 · todos os 7 dias da semana',c:'violet'},
    {i:'protein',t:'30g de proteína × 3 refeições',d:'o principal driver da leptina',c:'pink'},
    {i:'shield',t:'Blindar contra o efeito sanfona',d:'o mecanismo real da recaída',c:'gold'},
    {i:'heart',t:'Fome que se organiza sozinha',d:'saciedade real volta a funcionar',c:'mint'}]},
16:{ intro:'As mulheres que mantêm resultado por anos não são as mais fortes. Não têm mais disciplina, mais tempo ou mais informação. Elas têm uma pessoa. Alguém que sabe, que pergunta, que se importa. A neurociência do comportamento é categórica: compromisso público — mesmo que com uma só pessoa — triplica a chance de manutenção.',
  objs:[
    {i:'users',t:'Escolher sua Testemunha',d:'uma pessoa que quer o seu bem',c:'pink'},
    {i:'send',t:'Enviar uma mensagem hoje',d:'não amanhã — hoje',c:'mint'},
    {i:'calendar',t:'Combinar check-in semanal',d:'dia e horário fixos',c:'gold'},
    {i:'shield',t:'3× mais chance de manter',d:'meta-análise Nature 2024',c:'violet'}]},
17:{ intro:'Rigidez alimentar é a maior falha de design das dietas comuns. Ela produz o ciclo restrição → compulsão → culpa → nova restrição, o mesmo que arruinou trinta anos das suas escolhas. A ciência do comportamento tem uma resposta clara: flexibilidade estruturada. Uma refeição por semana, planejada, aproveitada, sem compensação nenhuma no dia seguinte.',
  objs:[
    {i:'calendar',t:'Planejar 1 refeição social',d:'agendada, não improvisada',c:'gold'},
    {i:'heart',t:'Resgatar o prazer de comer',d:'comida deixa de ser teste',c:'pink'},
    {i:'shield',t:'Quebrar o ciclo restrição-compulsão',d:'proibir amplifica o desejo',c:'violet'},
    {i:'zap',t:'Zero compensação no dia seguinte',d:'sem detox, sem pular refeição',c:'mint'}]},
18:{ intro:'O erro mais comum de quem termina um protocolo é não decidir o que vem depois. Termina no domingo, na segunda está comemorando, na quinta já não sabe se treina, no mês seguinte perdeu tudo. Você não vai ser essa mulher. Hoje, no auge da sua clareza, você escreve o plano das próximas cinquenta e duas semanas.',
  objs:[
    {i:'calendar',t:'3 dias fixos de treino',d:'dia, horário e local escritos',c:'pink'},
    {i:'clock',t:'Alarmes programados hoje',d:'ativação, não sugestão',c:'gold'},
    {i:'pen',t:'Frase se-então do treino',d:'memória procedural instalada',c:'violet'},
    {i:'shield',t:'52 decisões eliminadas',d:'uma decisão hoje vale o ano',c:'mint'}]},
19:{ intro:'Você vai ter dia ruim — é certeza matemática. E nesses dias sua força de vontade não vai estar disponível, porque o córtex pré-frontal desliga quando o cortisol dispara. A diferença entre quem mantém e quem desiste não é força. É ter uma resposta escrita antes do dia ruim chegar.',
  objs:[
    {i:'pen',t:'5 frases se-então pessoais',d:'para os SEUS gatilhos reais',c:'coral'},
    {i:'box',t:'Kit Dia Ruim na geladeira',d:'Pote-Salva-Noite pronto',c:'gold'},
    {i:'shield',t:'Zero culpa antecipada',d:'você sabe o que fazer se der errado',c:'violet'},
    {i:'zap',t:'Domínio sobre os gatilhos',d:'resposta automática, não decisão',c:'pink'}]},
20:{ intro:'Existem centenas de coisas que você pode fazer para se manter saudável. Você não vai fazer todas. Vai fazer três — para sempre. Se escolher essas três com precisão cirúrgica, elas sustentam o resto por consequência. É o princípio de Pareto aplicado ao seu corpo: vinte por cento das intervenções sustentam oitenta por cento do resultado.',
  objs:[
    {i:'star',t:'Escolher apenas 3 atos',d:'não 5, não 4 — três',c:'gold'},
    {i:'pen',t:'Escrever no presente',d:'"eu faço", não "eu vou fazer"',c:'pink'},
    {i:'users',t:'Dizer em voz alta 3 vezes',d:'e enviar para a Testemunha',c:'mint'},
    {i:'shield',t:'Identidade formada',d:'hábitos-âncora que puxam o resto',c:'violet'}]},
21:{ intro:'Vinte e um dias atrás você era uma mulher que queria mudar. Hoje você é uma mulher que mudou. A diferença mora nas evidências que você vai coletar em alguns minutos: a fita, a foto, a calça. Todas as três dizendo a mesma coisa — o seu corpo respondeu. Sempre respondeu. Só precisou de alguém que finalmente falasse a linguagem dele.',
  objs:[
    {i:'ruler',t:'4 a 7 cm de cintura',d:'a medida definitiva das 7 chaves',c:'pink'},
    {i:'trophy',t:'As 7 chaves destravadas',d:'nenhuma trava ficou de fora',c:'gold'},
    {i:'camera',t:'Foto final ao lado da primeira',d:'a prova visual completa',c:'violet'},
    {i:'pen',t:'Carta para a mulher do Dia 1',d:'20 min, papel e caneta',c:'mint'}]},
};

/* ─── MISSÕES GAMIFICADAS ─── */
/* tipo: 'chave' (a principal do dia) | 'diaria' (repete) | 'bonus' (opcional) */
const MISSOES_DIARIAS = [
  {id:'m_prot', ico:'protein', tipo:'diaria', nome:'Refeição 1 · 40g de proteína',
   det:'Abre a Janela de Ouro e liga a Lipase Feminina', xp:35, cor:'pink', tempo:'10 min'},
  {id:'m_agua', ico:'water', tipo:'diaria', nome:'4 doses de Água Viva',
   det:'2 L com eletrólitos ao longo do dia', xp:25, cor:'mint', tempo:'o dia', meta:4},
  {id:'m_ordem', ico:'plate', tipo:'diaria', nome:'Ordem alimentar nas refeições',
   det:'Vegetais → proteína → carboidrato', xp:30, cor:'gold', tempo:'2× hoje'},
  {id:'m_sono', ico:'moon', tipo:'diaria', nome:'Bloco de Ouro protegido',
   det:'Telas fora 21h · dormir antes das 22h30', xp:40, cor:'violet', tempo:'noite'},
];

const MISSOES_BONUS = [
  {id:'b_check', ico:'pen', tipo:'bonus', nome:'Check-in noturno',
   det:'4 perguntas · alimenta seus gráficos', xp:20, cor:'violet', tempo:'20 seg'},
  {id:'b_foto', ico:'camera', tipo:'bonus', nome:'Foto do dia no álbum',
   det:'Registro visual da sua evolução', xp:15, cor:'pink', tempo:'1 min'},
  {id:'b_amiga', ico:'users', tipo:'bonus', nome:'Compartilhar com a Testemunha',
   det:'Fazer junto aumenta 40% a aderência', xp:25, cor:'mint', tempo:'2 min'},
  {id:'b_frio', ico:'snow', tipo:'bonus', nome:'Choque térmico no banho',
   det:'30s de água fria · ativa o BAT', xp:20, cor:'coral', tempo:'30 seg'},
];

/* Missão-chave de cada dia (a que vale mais XP) */
const MISSAO_CHAVE = {
  1:{id:'k1',ico:'ruler',nome:'Medir cintura, quadril e tirar as fotos',det:'O dado que ancora os 21 dias',xp:120,cor:'pink',tempo:'15 min'},
  2:{id:'k2',ico:'lungs',nome:'Respiração 10 min + Água Viva + massagem',det:'As 3 ferramentas que movem a linfa',xp:110,cor:'mint',tempo:'15 min'},
  3:{id:'k3',ico:'walk',nome:'Ordem alimentar + 10 min de caminhada',det:'−73% no pico glicêmico do dia',xp:100,cor:'pink',tempo:'10 min'},
  4:{id:'k4',ico:'clock',nome:'Abrir e fechar a Janela de Ouro',det:'10h exatas alinhadas ao seu relógio',xp:110,cor:'gold',tempo:'o dia'},
  5:{id:'k5',ico:'sun',nome:'Sol matinal + jantar 19h + telas 21h',det:'Reprograma o cortisol invertido',xp:120,cor:'gold',tempo:'15 min'},
  6:{id:'k6',ico:'moon',nome:'Ritual noturno completo antes das 22h30',det:'Protege 70% do GH da noite',xp:115,cor:'violet',tempo:'30 min'},
  7:{id:'k7',ico:'trophy',nome:'1ª medição oficial + foto + calça-teste',det:'A primeira prova concreta',xp:150,cor:'pink',tempo:'20 min'},
  8:{id:'k8',ico:'core',nome:'Vacuum abdominal · 5 séries de 15s',det:'Acorda o Cinturão Interno',xp:130,cor:'gold',tempo:'3 min'},
  9:{id:'k9',ico:'dumbbell',nome:'Treino de força · 8 movimentos',det:'Reverte a sarcopenia em 8 semanas',xp:140,cor:'coral',tempo:'15 min'},
  10:{id:'k10',ico:'heart',nome:'Zone 2 cardio · 30-45 min',det:'A zona onde a Lipase Feminina trabalha',xp:145,cor:'coral',tempo:'40 min'},
  11:{id:'k11',ico:'plate',nome:'Refeição Espelho encerrada até 19h',det:'Decide como você acorda amanhã',xp:120,cor:'violet',tempo:'20 min'},
  12:{id:'k12',ico:'flame',nome:'Refeeding programado · carbo +50%',det:'Restaura leptina, previne o platô',xp:125,cor:'gold',tempo:'o dia'},
  13:{id:'k13',ico:'snow',nome:'Choque térmico progressivo · 30-60s',det:'Ativa o tecido adiposo marrom',xp:110,cor:'mint',tempo:'1 min'},
  14:{id:'k14',ico:'trophy',nome:'2ª medição + foto + reflexão de 15 min',det:'A metade do caminho vencida',xp:160,cor:'pink',tempo:'25 min'},
  15:{id:'k15',ico:'moon',nome:'Bloco de Ouro absoluto + caseína',det:'Cura o termostato da fome',xp:130,cor:'violet',tempo:'30 min'},
  16:{id:'k16',ico:'users',nome:'Escolher e avisar sua Testemunha',det:'Triplica a chance de manutenção',xp:135,cor:'pink',tempo:'5 min'},
  17:{id:'k17',ico:'calendar',nome:'Planejar a refeição social da semana',det:'Flexibilidade que impede a sanfona',xp:115,cor:'gold',tempo:'5 min'},
  18:{id:'k18',ico:'calendar',nome:'Escrever o plano das 52 semanas',det:'Elimina 52 decisões futuras',xp:150,cor:'pink',tempo:'20 min'},
  19:{id:'k19',ico:'shield',nome:'Escrever os 5 planos se-então',det:'Sua resposta para os dias ruins',xp:140,cor:'coral',tempo:'15 min'},
  20:{id:'k20',ico:'star',nome:'Definir os 3 Atos Vitalícios',det:'Os hábitos que ficam para sempre',xp:155,cor:'gold',tempo:'15 min'},
  21:{id:'k21',ico:'trophy',nome:'Medida final + foto + carta',det:'A prova definitiva das 7 chaves',xp:200,cor:'pink',tempo:'40 min'},
};

/* ─── MEDALHAS (conquistas com peso) ─── */
const MEDALHAS = [
  {id:'origem',   glifo:'ruler',    cor:'#FF2E7E', nome:'A Origem',
   sub:'Você encarou o número real',
   det:'Mediu a cintura no Dia 1 — o gesto que a maioria adia por anos.',
   raro:'COMUM',   cond:s=>s.medidas.length>=1},
  {id:'linfa',    glifo:'moon',     cor:'#4ADE9B', nome:'Esgoto Aberto',
   sub:'Chave 01 destravada',
   det:'Você moveu a linfa que estava parada e perdeu o peso fantasma.',
   raro:'COMUM',   cond:s=>s.diaAtual>2},
  {id:'tres',     glifo:'flame',    cor:'#FF7A5C', nome:'Três Seguidos',
   sub:'A curva do hábito começou',
   det:'Três dias consecutivos. É aqui que o cérebro começa a automatizar.',
   raro:'COMUM',   cond:s=>s.streak>=3},
  {id:'insulina', glifo:'bolt',     cor:'#FF2E7E', nome:'Curva Domada',
   sub:'Chave 02 destravada',
   det:'Você mudou a resposta da insulina sem cortar um único alimento.',
   raro:'INCOMUM', cond:s=>s.diaAtual>4},
  {id:'relogio',  glifo:'moon',     cor:'#A855F7', nome:'Relógio Corrigido',
   sub:'Chave 03 destravada',
   det:'O cortisol voltou a subir de manhã e cair à noite — como deveria.',
   raro:'INCOMUM', cond:s=>s.diaAtual>7},
  {id:'despertar',glifo:'mountain', cor:'#4ADE9B', nome:'Fase Despertar',
   sub:'Os 7 primeiros dias completos',
   det:'A base fisiológica está construída. O corpo já respondeu.',
   raro:'RARO',    cond:s=>s.diasFeitos.filter(d=>d<=7).length>=7},
  {id:'cinturao', glifo:'shield',   cor:'#F5C97B', nome:'Cinturão Acordado',
   sub:'Chave 04 destravada',
   det:'O transverso voltou a trabalhar. Cintura menor sem perder gordura.',
   raro:'INCOMUM', cond:s=>s.diaAtual>9},
  {id:'sete',     glifo:'flame',    cor:'#FF7A5C', nome:'Sete Seguidos',
   sub:'Uma semana inteira sem falhar',
   det:'Sete dias de constância. Você provou que consegue.',
   raro:'INCOMUM', cond:s=>s.streak>=7},
  {id:'cm3',      glifo:'ruler',    cor:'#FF2E7E', nome:'Três Centímetros',
   sub:'A calça já sente a diferença',
   det:'3 cm de cintura destravados. Isso é gordura visceral saindo.',
   raro:'RARO',    cond:s=>s.perdaCintura>=3},
  {id:'lipase',   glifo:'bolt',     cor:'#FF7A5C', nome:'Lipase Ativa',
   sub:'Chave 05 destravada',
   det:'A enzima que libera gordura para queima voltou a funcionar.',
   raro:'RARO',    cond:s=>s.diaAtual>14},
  {id:'metade',   glifo:'mountain', cor:'#F5C97B', nome:'A Metade',
   sub:'Dia 14 · o marco onde a maioria para',
   det:'Duas semanas. Você passou do ponto onde 70% das mulheres desistem.',
   raro:'RARO',    cond:s=>s.diaAtual>=14},
  {id:'leptina',  glifo:'heart',    cor:'#38BDF8', nome:'Termostato Curado',
   sub:'Chave 06 destravada',
   det:'A leptina voltou a falar com o cérebro. Fim do modo economia.',
   raro:'ÉPICO',   cond:s=>s.diaAtual>15},
  {id:'catorze',  glifo:'flame',    cor:'#FF7A5C', nome:'Catorze Seguidos',
   sub:'Duas semanas sem quebrar',
   det:'Constância de 14 dias. O hábito já está instalado.',
   raro:'ÉPICO',   cond:s=>s.streak>=14},
  {id:'cm5',      glifo:'star',     cor:'#E879F9', nome:'Cinco Centímetros',
   sub:'A roupa que não fechava, fecha',
   det:'5 cm de cintura. Isso muda numeração de calça.',
   raro:'ÉPICO',   cond:s=>s.perdaCintura>=5},
  {id:'atos',     glifo:'key',      cor:'#F5C97B', nome:'Os Três Atos',
   sub:'Chave 07 destravada',
   det:'Você definiu os hábitos vitalícios. A identidade se instalou.',
   raro:'ÉPICO',   cond:s=>s.diaAtual>20},
  {id:'nova',     glifo:'crown',    cor:'#FF2E7E', nome:'A Nova Vida',
   sub:'21 dias · 7 chaves · uma mulher diferente',
   det:'Você completou o Método 7 Chaves inteiro. Isso é raro. Isso é seu.',
   raro:'LENDÁRIO',cond:s=>s.diasFeitos.length>=21},
];

const RARIDADE = {
  'COMUM':   {c:'#8A6E7C', bg:'rgba(138,110,124,.14)'},
  'INCOMUM': {c:'#4ADE9B', bg:'rgba(74,222,155,.14)'},
  'RARO':    {c:'#38BDF8', bg:'rgba(56,189,248,.14)'},
  'ÉPICO':   {c:'#A855F7', bg:'rgba(168,85,247,.16)'},
  'LENDÁRIO':{c:'#F5C97B', bg:'rgba(245,201,123,.18)'},
};

/* ─── NÍVEIS ─── */
const NIVEIS = [
  {n:1, xp:0,    nome:'Desperta'},
  {n:2, xp:400,  nome:'Consciente'},
  {n:3, xp:900,  nome:'Constante'},
  {n:4, xp:1500, nome:'Determinada'},
  {n:5, xp:2200, nome:'Transformada'},
  {n:6, xp:3000, nome:'Inabalável'},
  {n:7, xp:4000, nome:'Referência'},
];
const nivelDe = xp => {
  let a=NIVEIS[0];
  for(const n of NIVEIS) if(xp>=n.xp) a=n;
  const prox=NIVEIS.find(n=>n.xp>xp);
  return {...a, prox, pct: prox? (xp-a.xp)/(prox.xp-a.xp) : 1, falta: prox? prox.xp-xp : 0};
};

/* ─── PERGUNTAS DO COACH (variadas) ─── */
const PERGUNTAS_COACH = [
  'Por que minha cintura variou?','Estou com muita fome hoje','Não consegui fazer o treino',
  'Como está minha evolução?','Posso beber vinho hoje?','Dormi mal, e agora?',
  'Estou na TPM, o que faço?','A balança não desceu','Posso pular a Janela de Ouro?',
  'O que como fora de casa?','Senti dor no treino','Estou desanimada',
  'Quantos cm ainda vou perder?','Vacuum está certo assim?','Comi demais ontem',
  'Posso treinar em jejum?','Estou viajando essa semana','Meu sono não melhora',
  'Isso funciona na menopausa?','Qual proteína comprar?',
];
