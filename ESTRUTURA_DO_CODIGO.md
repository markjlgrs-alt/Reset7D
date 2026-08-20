# Estrutura interna do index.html

## Ordem das seções dentro do <script type="text/babel">

```
1. CONSTANTES DE IMAGEM
   const CASE1_IMG = "data:image/jpeg;base64,..."
   const DIA6_IMG  = "data:image/jpeg;base64,..."

2. TEMAS
   const THEMES = { dark:{...}, light:{...} }
   const T = THEMES.dark

3. CSS DINÂMICO
   const makeCSS = (th) => `...`
   → Injeta estilos dependentes do tema (glass, animações, etc)

4. STRINGS / TRADUÇÕES
   const STRINGS = { pt:{...}, en:{...}, es:{...} }
   const S = (lang, key) => STRINGS[lang]?.[key] ?? STRINGS.pt[key] ?? key

5. PROTOCOLO (PC)
   const PC = {
     1: { emoji, color, bg, title, keystone, modoMinimo, intro,
          sections: [ {title, sci, content} ],
          recipes: [ {name, ingredients:[{item, qty, subs:[]}], steps} ],
          videos: [...],
          refs: [...] },
     2..7: { ... }
   }
   const getPC = (lang) => { ... }  // mescla PC com traduções

6. BANCO DE DADOS LOCAL
   const DB = {
     user: (email) => ...,
     xp: (email) => ...,
     missions: (email) => ...,
     currentDay: (email) => ...,
     checkin: (email, day) => ...,
   }

7. CALÇA LARGA 21D
   const CL_THEMES = { dark:{...}, light:{...} }
   const CL_PC = { 1..21: {...} }

8. COMPONENTES UTILITÁRIOS
   function Av({name, size, color})           ← Avatar circular
   function Spinner()                          ← Loading
   function XPBadge({xp, th, lang})           ← Badge de XP
   function AnimNum({value, duration})         ← Número animado
   function useScrollReveal(ref, options)      ← Hook IntersectionObserver
   function InteractiveBackground({th})        ← Canvas animado

9. TELAS DE AUTENTICAÇÃO
   function LoginScreen({...})
   function RegisterScreen({...})
   function QuizScreen({...})
   function ForgotScreen({...})

10. ABAS DO DASHBOARD (RESET 7D)
    function HomeTab({user, xp, currentDay, completedMissions, ...})
    function MissionTab({...})
    function ContentTab({...})
    function EvolutionTab({...})
    function ProfileTab({...})
    function CommunityTab({...})

11. DASHBOARD PRINCIPAL
    function Dashboard({user, onLogout, darkMode, setDarkMode, lang, ...})
    → Header com RESET 7D + XP + Dia
    → Tab bar com 5 abas
    → Renderiza a aba ativa

12. COMPONENTES DO CALÇA LARGA
    function CLHomeTab, CLMissionTab, etc.
    function CLDashboard({...})

13. APP ROOT
    function App()
    → Gerencia: screen (login/register/quiz/app)
    → Gerencia: darkMode, lang, user, xp, currentDay
    → Injeta CSS via useEffect
    → Renderiza LoginScreen ou Dashboard

14. ReactDOM.render(<App/>, document.getElementById('root'))
```

## Convenções importantes

- **Cores**: sempre `th.primary`, `th.card`, `th.text`, etc. Nunca hex fixo
- **Textos**: sempre `S(lang, "chave")` ou `S(lang, "chave") || "fallback"`
- **Persistência**: sempre `DB.algo(email)` para ler, `localStorage.setItem(...)` para escrever
- **Animações**: classes CSS definidas no `makeCSS`: `card-lift`, `slide-up`, `anim-orb1`, etc.
- **Validação**: após qualquer edição, confirmar que Babel compila sem erro

## Chaves de tradução mais usadas

| Chave | PT | EN | ES |
|-------|----|----|-----|
| home_hello | Olá, {name}! 💜 | Hello, {name}! 💜 | ¡Hola, {name}! 💜 |
| home_guest | Convidada | Guest | Invitada |
| tab_home | Início | Home | Inicio |
| tab_mission | Missões | Missions | Misiones |
| tab_content | Conteúdo | Content | Contenido |
| tab_evolution | Evolução | Progress | Progreso |
| tab_profile | Perfil | Profile | Perfil |
| xp_day | Dia | Day | Día |
| comm_post | Publicar | Post | Publicar |
