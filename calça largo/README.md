# Calça Larga 21D — Método 7 Chaves

Aplicativo do protocolo de 21 dias. **Um único arquivo HTML no final**, com React 18 embutido, sem build tooling, sem dependência de internet para funcionar.

---

## Como rodar

```bash
node build.js          # gera dist/CALCA_LARGA_21D.html
node build.js --watch  # regera automaticamente ao salvar qualquer arquivo de src/
```

Depois é só abrir `dist/CALCA_LARGA_21D.html` no navegador (ou arrastar para o Chrome).
No VS Code, `Ctrl+Shift+B` já roda o build; a task **Watch** deixa observando.

> Não precisa de `npm install`. O React já está em `vendor/`.

---

## Estrutura

```
calca-larga-21d/
├── build.js                  ← empacotador (ordem dos módulos vive aqui)
├── package.json
├── dist/
│   └── CALCA_LARGA_21D.html  ← o app pronto para publicar
├── vendor/
│   ├── react.production.min.js
│   └── react-dom.production.min.js
└── src/
    ├── index.html            ← shell + TODO o design system (CSS)
    ├── data/
    │   ├── protocolo.js      ← os 21 dias, 7 chaves, 3 fases, ciência
    │   ├── gamificacao.js    ← XP, níveis, missões, medalhas, objetivos do dia
    │   ├── videos.js         ← videoteca em espanhol, mapeada por dia
    │   └── alternativas.js   ← plano B de material ("não tenho fita métrica")
    ├── core/
    │   ├── ui.js             ← ícones, estado, Reveal, Acordeão, LED, confete
    │   └── cenas.js          ← fotografia sintética (silhuetas + atmosfera)
    └── telas/
        ├── 01-abertura.js       ← carta de boas-vindas em 5 atos
        ├── 02-inicio.js         ← Home
        ├── 03-missoes.js        ← missões do dia + celebração
        ├── 04-conteudo.js       ← biblioteca (carrossel lateral) + sala de leitura
        ├── 05-jornada.js        ← trilha da montanha + antes/agora
        ├── 05a-graficos-3d.js   ← hexágono, colunas, anel, fita, meta
        ├── 05b-graficos-linha.js
        ├── 06-perfil.js         ← identidade, álbum, conquistas, ajustes
        ├── 07-evolucao.js       ← números e medalhas
        ├── 08-assistente.js     ← chat + vacuum, zona 2, check-in, S.O.S
        ├── 09-comunidade.js     ← feed e salas
        └── 10-app.js            ← navegação, temas, raiz React
```

**A ordem de carregamento está em `build.js` → `MODULOS`.** Se criar um arquivo novo em `src/`, adicione-o nessa lista na posição certa (dados antes do núcleo, núcleo antes das telas).

---

## Convenções do código

| Item | Regra |
|---|---|
| React | Sem JSX. `const h = React.createElement` — todo componente usa `h('div', {...}, filhos)` |
| Estado | Um único objeto em `core/ui.js` (`ESTADO_INICIAL`), salvo em `localStorage` na chave `cl21d_v3` |
| Cores | Sempre por variável CSS (`var(--pink)`), nunca hex solto. Hex só em gradiente/filtro, via mapa `HEX` |
| Tema | `data-tema="claro"` no `<html>`; tudo que muda de cor está em `src/index.html` |
| Sobre foto | Blocos com fundo escuro recebem `className:'on-photo'` para manter texto claro nos dois temas |
| Movimento | Curva única `cubic-bezier(.4,0,.2,1)`; durações 180 / 380 / 620 ms |
| Revelação | Envolver o bloco em `h(Reveal,{tipo:'rv'|'rv-l'|'rv-s'|'rv-3d', delay}, ...)` |
| Clique | `className:'press'` liga a fita de LED externa + a onda; `--led` define a cor |

---

## Onde mexer para cada coisa

| Quero mudar… | Arquivo |
|---|---|
| Texto de um dia (cena, trava, mecanismo, receita, ciência) | `src/data/protocolo.js` |
| Objetivos "o que se espera de você hoje" | `src/data/gamificacao.js` → `OBJETIVOS` |
| Quantos XP vale cada coisa | `src/telas/04-conteudo.js` (leitura) e `src/data/gamificacao.js` (missões) |
| Nomes dos níveis e medalhas | `src/data/gamificacao.js` → `NIVEIS`, `MEDALHAS` |
| Vídeos de um exercício | `src/data/videos.js` → `VIDEOTECA` e `VIDEOS_DIA` |
| Plano B de material | `src/data/alternativas.js` |
| Cores, tipografia, sombras, animações | `src/index.html` (bloco `:root` e `[data-tema="claro"]`) |
| Ordem das abas | `src/telas/10-app.js` → `TABS` |
| Perguntas do assistente | `src/telas/08-assistente.js` → `CHIPS_GRUPOS` e `responder()` |
| Carrossel lateral de dias (largura, giro, profundidade) | `src/telas/04-conteudo.js` → `CarrosselDias`, `LARG_CARD`, `PASSO` |
| Bloco de evolução dentro da Jornada | `src/telas/07-evolucao.js` → `BlocoEvolucao` |
| Gráfico "Cintura x Peso" | `src/telas/05a-graficos-3d.js` → `DuasReguas` |
| Gráfico "Meta de cintura" (fita métrica) | `src/telas/05a-graficos-3d.js` → `FitaMeta` |
| Velocidade e estilo da revelação por scroll | `src/index.html` (`.rise`, `.rv-auto`) e `src/core/ui.js` → `varrerRevelacao` |

---

## Publicar

O `dist/CALCA_LARGA_21D.html` é autossuficiente. Basta subir esse arquivo:

- **Vercel / Netlify**: arraste a pasta `dist/` (renomeie o arquivo para `index.html` se quiser domínio limpo)
- **Hotmart / área de membros**: suba como arquivo e libere o link
- **Celular**: abrir no navegador e "Adicionar à tela de início" já funciona como app

As fontes (Fraunces, Plus Jakarta Sans, JetBrains Mono) vêm do Google Fonts; sem internet o app cai para as fontes do sistema e continua funcionando.

---

## Transformar o assistente em IA de verdade

Hoje ele responde por regras, lendo os dados reais dela (dia, ofensiva, medidas, sono). Para ligar num modelo:

1. Crie **uma função serverless** (Vercel/Netlify) que chama `POST https://api.anthropic.com/v1/messages`.
2. Guarde a chave como variável de ambiente — **nunca** dentro do HTML.
3. Mande no *system prompt* o PDF do Método 7 Chaves + o estado dela (dia, streak, medidas).
4. Guarda-corpos: não prometer resultado garantido, não diagnosticar, encaminhar ao médico em sinal de alerta.
5. Mantenha o modo por regras como reserva para quando a API falhar ou faltar internet.

O ponto de troca é a função `responder()` em `src/telas/08-assistente.js`.
