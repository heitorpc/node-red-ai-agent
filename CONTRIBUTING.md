# Contribuindo para @devtor/node-red-ai-agent

Obrigado por contribuir.

Este projeto quer manter uma base simples, previsível e fácil de revisar. Antes de abrir um PR, leia este documento.

## Objetivo desta fase do projeto

No estágio atual, o foco é construir uma fundação sólida para um nodeset open source no ecossistema Node-RED:

- packaging correto;
- build confiável;
- estrutura extensível;
- documentação clara;
- colaboração previsível.

## Como começar

1. Faça um fork do repositório.
2. Crie uma branch descritiva a partir de `main`.
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Rode as validações locais:
   ```bash
   npm run lint
   npm run typecheck
   npm run build
   ```

## Padrões esperados

### Estrutura
- evite misturar lógica de domínio com lógica específica do editor do Node-RED;
- mantenha os nodes em `src/nodes`;
- mantenha utilitários e lógica de domínio em módulos próprios quando o projeto crescer.

### Código
- prefira mudanças pequenas e focadas;
- não introduza dependências novas sem necessidade clara;
- preserve compatibilidade com a estrutura do pacote Node-RED;
- não coloque segredos, tokens ou credenciais em código, fixtures ou exemplos.

### Commits
Recomendamos Conventional Commits:

- `feat:`
- `fix:`
- `docs:`
- `test:`
- `refactor:`
- `chore:`
- `ci:`

Exemplos:

```text
feat: add minimal ai-agent node
docs: improve local installation steps
chore: configure eslint and tsconfig
```

## Pull requests

Abra PRs com escopo objetivo.

Um bom PR deve:

- explicar o problema;
- explicar a solução;
- listar impactos;
- citar limitações ou próximos passos;
- incluir instruções de validação quando necessário.

## Checklist antes do PR

- [ ] o código compila;
- [ ] o lint passa;
- [ ] a mudança está documentada;
- [ ] não há credenciais ou dados sensíveis no diff;
- [ ] os arquivos alterados seguem a estrutura do projeto;
- [ ] a descrição do PR explica claramente a mudança.

## Issues

Use as issues para:

- bugs;
- propostas de melhoria;
- discussão de arquitetura;
- documentação;
- tarefas iniciais para novos contribuidores.

## Discussões de arquitetura

Para mudanças estruturais, descreva:

- problema atual;
- proposta;
- trade-offs;
- impacto em compatibilidade;
- impacto no roadmap.

## Segurança

Vulnerabilidades não devem ser abertas em issue pública. Use o processo descrito em `SECURITY.md`.

## Código de conduta

Ao participar deste projeto, siga `CODE_OF_CONDUCT.md`.
