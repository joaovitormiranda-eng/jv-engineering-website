---
title: "Privacidade e medição de visitas"
description: "Como a JV Engineering trata a medição opcional de visitas, suas escolhas de privacidade e os cliques de contato."
---

## Responsável e contato

O conteúdo e os serviços apresentados neste site são de responsabilidade de João Vitor Miranda Sousa. Para dúvidas sobre dados ou sobre suas preferências, utilize o [e-mail de contato já divulgado no site](mailto:joaovitormonica87@gmail.com).

## Medição opcional

{{< analytics-status >}}

Quando ativado e autorizado por você, o Google Analytics 4 pode ajudar a entender visitas, páginas consultadas, origem do tráfego, tipo de dispositivo e cliques nos botões de WhatsApp. Esses dados servem para avaliar a utilidade das páginas e os caminhos de contato. Não são usados aqui para publicidade ou criação de públicos publicitários.

Recusar a medição não impede a leitura, a navegação ou o contato. O Google não recebe requisições de Analytics por este site antes da autorização. Bloqueadores também podem impedir a medição; não tentamos contorná-los.

## O que é enviado

A configuração utiliza o endereço canônico da página, sem parâmetros de consulta ou fragmentos, e o título publicado. Esses valores são definidos antes da inicialização da tag e também nos eventos enviados pelo site. A origem de referência é reduzida ao domínio, sem o caminho nem os parâmetros da página anterior. Não enviamos campanhas ou termos livres extraídos da URL; isso limita a atribuição por UTMs e identificadores de campanhas.

A conexão com o provedor também envolve informações técnicas da comunicação, como endereço IP e características do navegador. Por isso, esta medição não é apresentada como uma navegação anônima.

O evento `contact_click` registra apenas o método WhatsApp, a posição do botão, o tipo de página e o serviço associado, com categorias fixas. Não enviamos o número do contato, a mensagem pré-preenchida, nomes, e-mails, dados fornecidos em projetos ou conteúdo de formulários.

**Clicar em um botão não comprova que uma conversa começou, que houve contratação ou que o atendimento foi concluído.** Um bloqueador ou uma saída rápida da página pode impedir o registro do clique.

## Cookies e escolha local

Somente após aceitar, o Analytics pode criar cookies próprios com prefixo `jveng`, restritos ao caminho deste site. Eles contêm identificadores pseudônimos de navegador, não sendo dados garantidamente anônimos. A configuração limita sua duração a 180 dias, sem renovação automática a cada visita. O navegador pode removê-los antes.

A preferência de aceitar ou recusar é guardada no armazenamento local deste navegador, por até 180 dias. Ela contém somente a escolha, a versão da preferência e sua validade; não inclui um identificador pessoal. Não compartilhamos essa preferência com o Google. Sem armazenamento disponível, a medição permanece desativada.

Quando a medição estiver habilitada, o controle **Preferências de privacidade**, no rodapé, permite rever a escolha. Ao desativar uma medição já carregada, o site bloqueia novos eventos, atualiza o consentimento, remove os cookies que consegue identificar como pertencentes à implementação e recarrega a página para encerrar o script. Isso não desfaz dados já enviados nem uma requisição que já estava em trânsito. A escolha vale para este navegador e não para outros dispositivos.

A limpeza inclui os nomes com prefixo `jveng` e o cookie legado específico deste fluxo de Analytics, nos caminhos conhecidos do projeto e nos escopos acessíveis ao navegador. Um cookie antigo genérico `_ga` no caminho raiz pode ser compartilhado com outros projetos no mesmo host; ele não é apagado automaticamente sem identificação exclusiva de sua origem. Cookies `HttpOnly`, caminhos antigos desconhecidos ou outros escopos inacessíveis podem exigir remoção nas configurações do navegador. A implementação atual não utiliza esse cookie genérico para sua medição.

## Retenção, Google e configurações

{{< analytics-retention >}}

O Google processa os dados da ferramenta conforme suas condições e configurações. Consulte [como o Google usa dados de sites que utilizam seus serviços](https://policies.google.com/technologies/partner-sites?hl=pt-BR). A ativação exige revisão humana da configuração do fluxo, da retenção e destas informações; a presença deste texto e do controle de consentimento não representa uma declaração de conformidade jurídica integral.

## Contato e serviços externos

O WhatsApp, o GitHub e o LinkedIn são serviços externos, sujeitos às próprias políticas. Ao abrir um contato no WhatsApp, o tratamento da conversa ocorre nesse serviço; seu conteúdo não é coletado por esta instrumentação de Analytics.

O provedor de hospedagem também pode tratar registros técnicos de acesso conforme sua própria política. Esta página descreve a instrumentação sob controle do site, sem afirmar ausência de registros na infraestrutura de terceiros.
