
# Integração TEF Elgin - LavaPay

Esta documentação descreve a integração do sistema de pagamento TEF da Elgin com o aplicativo LavaPay.

## Visão geral

A integração com o TEF Elgin permite o processamento de pagamentos por cartão de crédito e débito diretamente através das maquininhas da Elgin. 
A integração funciona tanto em ambiente web (simulado) quanto em dispositivos Android.

## Requisitos

Para utilizar esta integração em produção, você precisará:

1. **Credenciais da Elgin**: 
   - Client ID
   - Client Secret
   - Estas credenciais são fornecidas pela Elgin após o cadastro e aprovação da sua empresa.

2. **SDK da Elgin**: 
   - Em uma implementação real, seria necessário incluir o SDK oficial da Elgin nas dependências do projeto Android.
   - Atualmente, estamos usando uma implementação simulada para fins de desenvolvimento.

## Configuração

1. **Configurações no Supabase**:
   - As credenciais da Elgin são armazenadas na tabela `payment_settings` do banco de dados.
   - Cada lavanderia pode ter suas próprias configurações de pagamento.

2. **Configuração no Android**:
   - O módulo nativo `ElginPaymentModule.java` gerencia a comunicação com o SDK da Elgin.
   - Em uma implementação real, seria necessário importar e inicializar o SDK oficial da Elgin.

## Fluxo de pagamento

1. O usuário seleciona uma lavanderia e uma máquina para usar.
2. Ao chegar na tela de pagamento, o usuário escolhe o método de pagamento (crédito, débito ou PIX).
3. Para pagamentos com cartão em dispositivos Android, o sistema usa o TEF da Elgin.
4. Para pagamentos online ou via PIX, o sistema continua utilizando o MercadoPago.
5. Após o processamento do pagamento, o status da transação é atualizado no banco de dados.
6. Se o pagamento for aprovado, a máquina é liberada para uso.

## Implementação técnica

### Módulos principais

1. **ElginPaymentModule.java**: Módulo nativo para Android que se comunica com o SDK da Elgin.

2. **elginPaymentService.ts**: Serviço JavaScript que gerencia o processo de pagamento e se comunica com o módulo nativo.

3. **usePaymentProcessing.tsx**: Hook React que expõe a funcionalidade de processamento de pagamentos para os componentes da UI.

### Simulação em ambiente web

Para desenvolvimento e testes em ambiente web, existe uma implementação simulada do módulo nativo em `src/utils/nativeModules.ts`.

## Considerações para produção

1. **SDK Oficial**: Substitua a implementação simulada pelo SDK oficial da Elgin.

2. **Credenciais reais**: Obtenha e configure credenciais reais da Elgin para ambiente de produção.

3. **Testes de integração**: Execute testes completos com dispositivos físicos e maquininhas reais.

4. **Logs e monitoramento**: Implemente logs detalhados e monitoramento para rastrear problemas de integração ou falhas de pagamento.
