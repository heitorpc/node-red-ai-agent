# Política de Segurança

## Reportando vulnerabilidades

Se você identificar uma vulnerabilidade de segurança, não abra uma issue pública.

Envie o reporte de forma privada para o mantenedor do projeto por um canal privado apropriado definido pelo repositório ou pelo perfil do mantenedor.

Até que exista um endereço dedicado, o fluxo recomendado é:

- usar contato privado do mantenedor;
- descrever o problema com contexto suficiente para reprodução;
- informar impacto, escopo e possíveis mitigadores.

## O que incluir no reporte

Inclua, sempre que possível:

- descrição do problema;
- componente afetado;
- cenário de exploração;
- impacto esperado;
- passos para reprodução;
- versão afetada;
- sugestão de correção ou mitigação, se houver.

## O que esperar

O objetivo é:

- confirmar o recebimento do reporte;
- validar a vulnerabilidade;
- preparar correção;
- divulgar publicamente de forma responsável quando apropriado.

## Escopo inicial

Este projeto deve tratar com atenção especial vulnerabilidades relacionadas a:

- uso de credenciais;
- exposição de tokens em logs;
- execução de tools com escopo excessivo;
- timeouts ausentes;
- SSRF, chamadas HTTP inseguras e allowlists/denylists;
- execução de código local sem contenção adequada;
- vazamento de dados sensíveis em mensagens do flow.

## Boas práticas para contribuidores

Ao contribuir:

- nunca commite segredos;
- não inclua `.env` reais;
- não registre credenciais em exemplos;
- evite payloads sensíveis em logs e fixtures;
- reporte falhas de segurança em privado.