
# Integração PayGo - LavaPay

Este documento descreve a integração entre o sistema LavaPay e a solução de pagamento PayGo.

## Visão Geral

A integração PayGo permite o processamento de pagamentos por cartão de crédito, débito e PIX diretamente através das soluções de pagamento da PayGo. A integração funciona exclusivamente em dispositivos Android.

## Requisitos

Para utilizar esta integração em produção, você precisará:

1. **Credenciais da PayGo**: 
   - Client ID
   - Client Secret
   - Merchant ID
   - Terminal ID
   - Estas credenciais são fornecidas pela PayGo após o processo de homologação.

2. **Homologação com PayGo**:
   - Abrir um chamado no Jira PayGo: https://dev.proj.setis.com.br/servicedesk/customer/portal/16
   - Realizar os testes conforme o roteiro fornecido
   - Enviar os logs e resultados para certificação

3. **Documentação Oficial**:
   - Manuais disponíveis em: https://paygodev.readme.io/docs
   - Códigos de exemplo: https://github.com/adminti2

## Arquitetura da Integração

A integração entre LavaPay e PayGo é composta por:

1. **Módulo Nativo Android** (`PaygoTefModule.java`):
   - Implementa a comunicação com o SDK da PayGo
   - Gerencia o ciclo de vida das transações

2. **Serviço JavaScript** (`paygoPaymentService.ts`):
   - Fornece uma interface para o App React Native
   - Gerencia credenciais e configurações

3. **Hook React** (`usePaygoPayment.tsx`):
   - Fornece métodos para processamento de pagamentos
   - Gerencia estado de transações e feedback ao usuário

## Funcionalidades Implementadas

- Processamento de pagamentos (crédito, débito, PIX)
- Cancelamento de transações
- Verificação de status do dispositivo
- Impressão de comprovantes
- Armazenamento de recibos no banco de dados

## Processo de Homologação

1. Implementar a integração seguindo os padrões da PayGo.
2. Abrir um chamado no Jira da PayGo para solicitar o processo de homologação.
3. Executar os testes conforme o roteiro fornecido pela PayGo.
4. Enviar os logs e resultados para análise.
5. Após aprovação, receber o certificado de homologação.

## Configuração no LavaPay

1. No painel de administração, acesse a seção "Configurações de Pagamento".
2. Selecione "PayGo TEF" como provedor.
3. Insira as credenciais fornecidas pela PayGo.
4. Salve as configurações.

## Fluxo de Pagamento

1. O usuário seleciona uma máquina e escolhe o método de pagamento.
2. O sistema comunica-se com o módulo nativo do PayGo.
3. O PayGo processa a transação com a operadora financeira.
4. O resultado da transação é retornado para o aplicativo.
5. Se aprovado, a máquina é liberada para uso.

## Troubleshooting

- **Módulo não encontrado**: Verifique se o dispositivo é Android e se o pacote `PaygoTefPackage` está registrado corretamente.
- **Erro de comunicação**: Verifique a conexão do dispositivo e as configurações do PayGo.
- **Credenciais inválidas**: Verifique se as credenciais estão configuradas corretamente nas configurações da lavanderia.
