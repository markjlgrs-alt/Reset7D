/* ═══════════════════════════════════════════════════════════
   BIBLIOTECA DE VÍDEOS — espanhol nativo, sem legendas
   Cada prática/exercício do método tem referência em vídeo.
═══════════════════════════════════════════════════════════ */
const ytv = id => 'https://www.youtube.com/watch?v=' + id;

const VIDEOTECA = {
  vacuum:[
    {t:'Vacuum abdominal — técnica correcta paso a paso', a:'Aprende a sostener el vacío sin perder la postura', d:'7 min', u:ytv('sLku4kTmHyk')},
    {t:'Tutorial de hipopresivos y stomach vacuum',        a:'La secuencia respiratoria antes de succionar',    d:'6 min', u:ytv('orjrVvK_4OE')},
  ],
  hipopresivos:[
    {t:'Rutina de hipopresivos para principiantes',        a:'Postura, apnea y succión — versión guiada',        d:'12 min', u:ytv('tw7KAoBkMFc')},
    {t:'Rutina completa de hipopresivos',                  a:'Serie larga para cuando ya domines la base',       d:'15 min', u:ytv('JC695DxsT74')},
    {t:'Gimnasia hipopresiva — ejercicios',                a:'Variaciones de pie, sentada y en cuadrupedia',     d:'10 min', u:ytv('I9DhVk4buzc')},
  ],
  linfatico:[
    {t:'Automasaje reductor de abdomen y drenaje linfático',a:'4 movimientos para mover la linfa mesentérica',   d:'9 min', u:ytv('80t8dv2NHAA')},
    {t:'Automasaje matutino — drenaje linfático',           a:'Rutina de la mañana, antes del desayuno',         d:'8 min', u:ytv('U3rnfKwgERA')},
    {t:'Masaje linfodrenante para el abdomen',              a:'Presión, dirección y ritmo correctos',            d:'11 min', u:ytv('4Co859QIKEA')},
  ],
  transverso:[
    {t:'Transverso abdominal — ejercicios de activación',   a:'Cómo despertar el corsé natural del abdomen',     d:'12 min', u:ytv('3WpZs-2--U4')},
  ],
  fuerza:[
    {t:'Rutina de fuerza full body para mujeres +40',       a:'Sentadilla, bisagra y empuje sin material',       d:'22 min', u:ytv('YZejcW2ZEA8')},
    {t:'Full body para mujeres de más de 40',              a:'Progresión suave con foco en masa magra',          d:'18 min', u:ytv('HUKYIYKrUWo')},
  ],
  respiracion:[
    {t:'Respiración guiada 4-7-8 para el estrés',           a:'La técnica que corta el impulso en 90 segundos',  d:'6 min', u:ytv('doZeCiT5Rh8')},
    {t:'Respiración relajante 4-7-8',                       a:'Versión corta para usar antes de comer',          d:'4 min', u:ytv('a4LxzATy-4Y')},
  ],
  zona2:[
    {t:'Cardio para perder grasa — Zona 2',                 a:'Cómo saber si estás en la zona correcta',         d:'13 min', u:ytv('AeYnpLJ3tuI')},
  ],
  estiramiento:[
    {t:'Los 5 mejores estiramientos antes de dormir',       a:'Baja el cortisol y prepara el sueño profundo',    d:'10 min', u:ytv('YpmFpmz9Jr0')},
    {t:'Estiramientos para dormir — rutina nocturna',       a:'Secuencia lenta, luz baja, respiración larga',    d:'12 min', u:ytv('HNQb13WqfW8')},
    {t:'Relaja tu cuerpo y alivia tensiones en 10 minutos', a:'Para los días en que el cuerpo pide pausa',       d:'10 min', u:ytv('KrgcBtBe5KI')},
  ],
  despertar:[
    {t:'10 min de estiramientos por la mañana',             a:'Activa el cuerpo antes del primer café',          d:'10 min', u:ytv('ZUa-FT1SQrg')},
  ],
};

/* Quais vídeos aparecem em cada dia (por chave fisiológica) */
const VIDEOS_DIA = {
  1:['linfatico','despertar'], 2:['linfatico'],        3:['linfatico','respiracion'],
  4:['respiracion'],           5:['respiracion'],      6:['linfatico','estiramiento'],
  7:['despertar'],             8:['vacuum','transverso'], 9:['fuerza'],
  10:['vacuum','hipopresivos'],11:['fuerza'],          12:['zona2'],
  13:['zona2','fuerza'],       14:['hipopresivos'],    15:['vacuum','hipopresivos'],
  16:['estiramiento'],         17:['fuerza','zona2'],  18:['respiracion','estiramiento'],
  19:['hipopresivos'],         20:['estiramiento'],    21:['despertar','fuerza'],
};

const videosDoDia = d => (VIDEOS_DIA[d]||['despertar'])
  .flatMap(k => (VIDEOTECA[k]||[]).map(v => ({...v, cat:k})));
