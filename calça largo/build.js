/**
 * CALÇA LARGA 21D — empacotador
 * ---------------------------------------------------------------
 * Junta o shell (src/index.html), o React (vendor/) e todos os
 * módulos de src/ em um único arquivo dist/CALCA_LARGA_21D.html.
 *
 *   node build.js            → gera o dist
 *   node build.js --watch    → regera a cada alteração em src/
 *
 * Não há bundler, transpilador nem dependência de rede: o app é
 * React 18 puro via React.createElement (apelidado de `h`).
 */
const fs = require('fs');
const path = require('path');

const RAIZ   = __dirname;
const SRC    = path.join(RAIZ, 'src');
const VENDOR = path.join(RAIZ, 'vendor');
const DIST   = path.join(RAIZ, 'dist');
const SAIDA  = path.join(DIST, 'CALCA_LARGA_21D.html');

/* A ORDEM IMPORTA: cada arquivo depende dos anteriores.
   dados → núcleo → telas → raiz do app                        */
const MODULOS = [
  'data/protocolo.js',        // os 21 dias, as 7 chaves, as 3 fases
  'data/gamificacao.js',      // XP, níveis, missões, medalhas, objetivos
  'data/videos.js',           // videoteca em espanhol por dia
  'data/alternativas.js',     // plano B de material ("não tenho fita métrica")

  'core/ui.js',               // ícones, estado, Reveal, Acordeão, LED, confete
  'core/cenas.js',            // fotografia sintética (silhuetas + atmosfera)

  'telas/01-abertura.js',     // carta de boas-vindas em 5 atos
  'telas/09-comunidade.js',   // feed e salas de conversa
  'telas/02-inicio.js',       // Home
  'telas/03-missoes.js',      // missões do dia + celebração
  'telas/04-conteudo.js',     // biblioteca (carrossel lateral) + sala de leitura
  'telas/05-jornada.js',      // trilha da montanha + gráficos + antes/agora
  'telas/05a-graficos-3d.js', // hexágono, colunas, anel, fita, meta
  'telas/05b-graficos-linha.js',
  'telas/06-perfil.js',       // identidade, álbum, conquistas, ajustes
  'telas/07-evolucao.js',     // números e medalhas
  'telas/08-assistente.js',   // chat + ferramentas (vacuum, zona 2, check-in)
  'telas/10-app.js',          // navegação, temas, raiz React
];

function empacotar() {
  const shell = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');
  const react = fs.readFileSync(path.join(VENDOR, 'react.production.min.js'), 'utf8');
  const rdom  = fs.readFileSync(path.join(VENDOR, 'react-dom.production.min.js'), 'utf8');

  const js = MODULOS
    .map(m => `/* ══════ ${m} ══════ */\n` + fs.readFileSync(path.join(SRC, m), 'utf8'))
    .join('\n\n');

  const bloco =
    '<div id="root"></div>\n' +
    '<script>' + react + '</script>\n' +
    '<script>' + rdom  + '</script>\n' +
    '<script>\n' + js + '\n</script>';

  /* função no replace evita que $& e $\' do React minificado sejam interpretados */
  const html = shell.replace('<div id="root"></div>', () => bloco);

  fs.mkdirSync(DIST, { recursive: true });
  fs.writeFileSync(SAIDA, html);
  console.log(`✓ dist/CALCA_LARGA_21D.html — ${(html.length / 1024).toFixed(1)} KB`);
}

function checarSintaxe() {
  let ok = true;
  for (const m of MODULOS) {
    try { new Function(fs.readFileSync(path.join(SRC, m), 'utf8')); }
    catch (e) { ok = false; console.error(`✗ ${m}: ${e.message}`); }
  }
  return ok;
}

if (!checarSintaxe()) process.exit(1);
empacotar();

if (process.argv.includes('--watch')) {
  console.log('… observando src/ (Ctrl+C para sair)');
  let t = null;
  fs.watch(SRC, { recursive: true }, () => {
    clearTimeout(t);
    t = setTimeout(() => { if (checarSintaxe()) empacotar(); }, 120);
  });
}
