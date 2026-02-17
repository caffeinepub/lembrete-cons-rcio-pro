# Specification

## Summary
**Goal:** Adicionar um módulo de CRM offline-first para controle de leads com lembretes de follow-up, integrado à navegação existente.

**Planned changes:**
- Criar um módulo de Leads (CRM) com persistência local no dispositivo (armazenamento do navegador), separado dos itens existentes de clientes/boletos.
- Definir e implementar o modelo de lead com: nome, telefone, observações, status e próxima data/hora de follow-up.
- Adicionar telas/fluxos de criar, editar e excluir leads, com validação de campos obrigatórios (mínimo: nome e status).
- Implementar lista de leads com busca rápida (nome/telefone) e filtros/agrupamentos por follow-up: Atrasados, Vence hoje, Próximos e Sem follow-up.
- Implementar lembretes de follow-up em tela cheia quando o app estiver aberto (incluindo atrasados), com ações para concluir e para adiar/reagendar (intervalos curtos e +1 dia), persistindo as alterações localmente.
- Adicionar ação direta de WhatsApp por lead via deep link, consistente com o comportamento já existente para clientes.
- Integrar o CRM de Leads à navegação existente mantendo no máximo três telas principais (ex.: aba/segmento dentro de uma tela já existente), garantindo boa usabilidade em layouts de Android.

**User-visible outcome:** O usuário consegue cadastrar e gerenciar leads offline, filtrar rapidamente quem precisa de retorno, receber alertas de follow-up dentro do app (quando aberto) com opções de concluir/adiar, e abrir conversa no WhatsApp direto pelo lead, tudo sem adicionar uma quarta tela principal.
