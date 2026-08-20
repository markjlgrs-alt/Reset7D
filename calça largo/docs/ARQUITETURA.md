# Arquitetura do app

## Fluxo de telas

```
primeira abertura → 01-abertura (5 atos) ─┐
                                          ▼
  ┌───────────────────────── 02-inicio (Home) ─────────────────────────┐
  │  próximo passo · sala de leitura de hoje · onde você está ·        │
  │  destaque · atalhos · ferramentas                                  │
  └────────────────────────────────────────────────────────────────────┘
       │            │             │            │           │        │
   03-missoes  04-conteudo   08-assistente  05-jornada  06-perfil  09-comunidade
                    │                            │           │
              sala de leitura              gráficos 3D    álbum, conquistas,
              (carrossel lateral)              + antes/agora  compromissos, ajustes
                                           + minha meta
```

Barra de abas (na ordem): **Início · Missões · Conteúdo · [assistente] · Jornada · Perfil · Grupo**.
A aba ativa cresce (`flex:1.75`) e ganha leito rosa; as outras seguem legíveis.

## Estado

Um objeto só, em `core/ui.js`:

| campo | o que guarda |
|---|---|
| `tema` | `'escuro'` ou `'claro'` |
| `onboard` | se a carta de abertura já foi vista |
| `diaAtual`, `diasFeitos`, `streak`, `xp` | progresso do protocolo |
| `missoes` | `{ "8": ["k8","m_prot"] }` — missões cumpridas por dia |
| `lidos` | `{ "8": ["cena","trava"] }` — blocos de conteúdo lidos por dia |
| `videos` | `{ "8-0": true }` — vídeos assistidos |
| `medidas`, `checkins` | histórico de cintura/peso e de fome/energia/sono |
| `metaCm`, `sonho` | meta de centímetros e o porquê dela |
| `atos`, `planoB`, `testemunha` | compromissos escritos |
| `posts`, `favoritos`, `chat` | comunidade, dias favoritados, histórico do assistente |

Persistência: `localStorage['cl21d_v3']`. `carregar()` faz merge defensivo campo a campo — dá para adicionar campos novos sem quebrar quem já usa.

## Camada de movimento (core/ui.js)

- **`Reveal`** — IntersectionObserver único; revela ao entrar e reanima ao sair e voltar (`rep`).
- **`Acordeao`** — mede `scrollHeight` e anima a altura de verdade (nada de `max-height`).
- **`ledPerimetro`** — no `pointerdown`, monta um SVG posicionado por fora do elemento com dois traços que partem do meio do topo e correm até a base, apagando no fim.
- **`instalarRipple`** — a onda que nasce no ponto exato do toque.
- **`soltarConfete`** — 28 partículas em leque, usado ao concluir dia/missão.

## Gráficos (telas/05a-graficos-3d.js)

| gráfico | forma | interação |
|---|---|---|
| Equilíbrio | hexágono radar com anéis e profundidade | arrastar gira; tocar num vértice explica o pilar |
| Cintura × Peso | cilindros em perspectiva, dois planos | tocar numa coluna abre a leitura do dia |
| Meta de cintura | anel volumétrico (6 camadas empilhadas) | arrastar inclina o anel |
| Sono e energia | fita com área + barras | arrastar o dedo percorre as noites |

Todos leem direto do estado — nenhuma biblioteca externa.

---

## Revisão de 20/08 — o que mudou

**1. Carrossel lateral de aulas** (`src/telas/04-conteudo.js`)
A antiga roda vertical saiu. No lugar entrou `CarrosselDias`: os dias passam
de lado, como um feed. O dia escolhido fica no centro — maior, nítido, com
borda na cor da chave. O que passou recua à esquerda, o próximo espera à
direita, ambos girados em `rotateY` e afastados em `translateZ`.
Ajustes ficam em `LARG_CARD` (236), `GAP_CARD` (14) e `PASSO`.
A centralização é medida pelo `offsetLeft` real do cartão e repetida depois
do layout, para a fonte carregando não desalinhar o feed.

**2. Evolução dentro da Jornada** (`src/telas/05-jornada.js`)
A aba escondida de evolução virou um bloco (`BlocoEvolucao`, exportado de
`07-evolucao.js`). A Jornada agora lê nesta ordem:
sua jornada → fases → trilha da montanha → próximo marco →
**sua evolução** (números, medalhas, cintura, razão C/Q, check-in) →
leitura dos seus dados (gráficos) → antes e agora.
O cabeçalho de perfil (foto, nome, XP) saiu daqui — vive só na aba Perfil.

**3. Dois gráficos refeitos** (`src/telas/05a-graficos-3d.js`)
- `DuasReguas` substitui o antigo "Cintura x Peso": duas barras rotuladas,
  cada uma com "de → para" e a queda em porcentagem, mais uma leitura em
  português — *"A cintura vai na frente."* Entende-se numa batida de olho.
- `FitaMeta` substitui o anel de meta: é uma fita métrica de verdade, com
  marcações, a parte conquistada preenchida em verde-menta e um marcador
  flutuante com os centímetros perdidos. Contraste resolvido.

**4. Revelação por scroll em todas as abas** (`src/core/ui.js` + `src/index.html`)
`.rise` deixou de ser animação de montagem e virou revelação por scroll.
Um único `IntersectionObserver` global (`varrerRevelacao`) marca os blocos de
primeiro nível de qualquer `.screen-anim` e escalona a entrada entre irmãos,
para o conteúdo surgir conforme a mulher rola — em todas as abas, sem
precisar embrulhar componente por componente. Um `MutationObserver` reaplica
a varredura a cada render. `prefers-reduced-motion` desliga tudo.
