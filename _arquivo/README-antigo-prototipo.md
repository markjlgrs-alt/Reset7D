# Reset 7D - App de Emagrecimento

Um aplicativo web simples para emagrecimento com funcionalidades de login, registro e recuperação de senha.

## Funcionalidades

- **Login**: Autenticação de usuários existentes.
- **Registro**: Criação de novas contas.
- **Recuperação de Senha**: Envio de código de recuperação por email (simulado) e redefinição de senha.
- **Dashboard**: Área após login (placeholder para conteúdo do app).

## Como Usar

1. Abra o arquivo `index.html` em um navegador web.
2. Registre-se com nome, email e senha.
3. Faça login com suas credenciais.
4. Para testar recuperação de senha:
   - Clique em "Esqueceu a senha?".
   - Digite o email cadastrado.
   - Um código será "enviado" (alert no navegador).
   - Digite o código, nova senha e confirme.
   - A senha será redefinida.

## Tecnologias

- HTML5
- CSS3
- JavaScript (ES6+)
- localStorage para persistência de dados (simulação de banco de dados)

## Notas

- Este é um front-end básico sem back-end real. Os dados são armazenados localmente no navegador.
- Para um app real, integre com um servidor back-end para autenticação segura e envio de emails.
- O "envio de email" é simulado com um alert contendo o código.

## Desenvolvimento

Para expandir:
- Adicione conteúdo real ao dashboard (planos de dieta, exercícios, etc.).
- Implemente validação mais robusta.
- Use frameworks como React para melhor estrutura.
- Conecte a um back-end (Node.js, PHP, etc.) para funcionalidades reais.