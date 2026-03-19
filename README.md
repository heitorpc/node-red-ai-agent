# @devtor/node-red-ai-agent

Nodeset open source para construir agentes de IA no Node-RED.

## Visão geral

O objetivo deste projeto é entregar um pacote npm para Node-RED com uma base sólida para agentes de IA, seguindo convenções nativas do ecossistema e uma arquitetura modular preparada para evolução.

Na fase inicial, o foco é garantir:

- estrutura de repositório limpa e colaborativa;
- build com TypeScript;
- lint e validação básica;
- um node mínimo visível na palette;
- base pronta para crescer como projeto open source.

## Status

Projeto em fase inicial de bootstrap.

Escopo atual da Fase 1:

- repositório e packaging do módulo;
- configuração de build;
- configuração de lint;
- primeiro node mínimo;
- documentação e arquivos de colaboração.

## Nome do pacote

```bash
@devtor/node-red-ai-agent
```

## Objetivo do projeto

Entregar um nodeset para Node-RED com foco em agentes de IA, com evolução planejada para:

- config nodes para provedores de LLM;
- agent node principal;
- tools reutilizáveis;
- memória de sessão;
- templates de prompt;
- observabilidade e testes.

## Estrutura inicial do projeto

```text
.
├─ .github/
│  ├─ ISSUE_TEMPLATE/
│  │  ├─ bug_report.yml
│  │  └─ feature_request.yml
│  ├─ workflows/
│  │  └─ ci.yml
│  └─ PULL_REQUEST_TEMPLATE.md
├─ examples/
├─ scripts/
├─ src/
│  └─ nodes/
│     └─ ai-agent/
│        ├─ ai-agent.ts
│        └─ ai-agent.html
├─ .gitignore
├─ CODE_OF_CONDUCT.md
├─ CONTRIBUTING.md
├─ LICENSE
├─ README.md
├─ SECURITY.md
├─ eslint.config.mjs
├─ package.json
└─ tsconfig.json
```

## Requisitos

- Node.js 20+
- npm 10+
- Node-RED 3.x ou superior

## Instalação para desenvolvimento

Clone o repositório:

```bash
git clone https://github.com/devtor/node-red-ai-agent.git
cd node-red-ai-agent
npm install
```

## Scripts

```bash
npm run lint
npm run typecheck
npm run build
```

## Teste local no Node-RED

Após gerar o build:

```bash
npm run build
cd ~/.node-red
npm install /caminho/absoluto/para/node-red-ai-agent
node-red
```

Depois, no editor do Node-RED:

1. localize a categoria do node;
2. arraste o node para o flow;
3. conecte com `inject` e `debug`;
4. faça deploy;
5. valide que a mensagem entra e sai corretamente.

## Roadmap resumido

### Fase 1
Bootstrap do pacote:
- repo;
- package.json;
- seção `node-red`;
- lint;
- tsconfig;
- build;
- node mínimo visível na palette.

### Fase 2
Infra de domínio:
- contratos de provider;
- contratos de tool;
- memória;
- normalização de mensagens.

### Fase 3
MVP funcional:
- config node;
- agent node;
- HTTP tool;
- memória de sessão.

### Fase 4
DX e qualidade:
- help text;
- examples;
- CI;
- testes com `node-red-node-test-helper`.

### Fase 5
Publicação:
- npm;
- documentação final;
- submissão à Flow Library.

## Contribuição

Leia [`CONTRIBUTING.md`](./CONTRIBUTING.md) antes de abrir PRs.

## Segurança

Leia [`SECURITY.md`](./SECURITY.md) para reportar vulnerabilidades.

## Código de conduta

Este projeto adota um código de conduta descrito em [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).

## Licença

Apache-2.0. Veja [`LICENSE`](./LICENSE).
