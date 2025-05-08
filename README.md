# SmartWash Payment Integration

Sistema de integração de pagamento para SmartWash usando a biblioteca InterfaceAutomacao.

## Requisitos

- Java 11 ou superior
- Maven 3.6 ou superior
- InterfaceAutomacao.jar (fornecido pelo provedor de pagamento)

## Configuração

1. Clone o repositório:
```bash
git clone https://github.com/julioosinski/lava-pay-smart-wash.git
cd lava-pay-smart-wash
```

2. Configure as credenciais:
   - Acesse `http://localhost:8080`
   - Preencha o Merchant ID e POS ID fornecidos pelo seu provedor de pagamento

## Executando o Projeto

1. Compile o projeto:
```bash
mvn clean package
```

2. Execute a aplicação:
```bash
java -jar target/smart-wash-1.0.0.jar
```

3. Acesse a aplicação:
   - Interface web: `http://localhost:8080`
   - API REST: `http://localhost:8080/api/payments`

## Endpoints da API

- `POST /api/payments/process` - Processar pagamento
- `POST /api/payments/{transactionId}/cancel` - Cancelar transação
- `POST /api/payments/{transactionId}/refund` - Estornar transação
- `GET /api/payments/{transactionId}` - Consultar transação

## Deploy

### Heroku

1. Crie uma conta no [Heroku](https://heroku.com)
2. Instale o [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
3. Faça login:
```bash
heroku login
```

4. Crie um novo app:
```bash
heroku create seu-app-name
```

5. Configure as variáveis de ambiente:
```bash
heroku config:set PAYMENT_MERCHANT_ID=seu-merchant-id
heroku config:set PAYMENT_POS_ID=seu-pos-id
```

6. Faça o deploy:
```bash
git push heroku main
```

### Outras Plataformas

O projeto pode ser implantado em qualquer plataforma que suporte aplicações Java/Spring Boot, como:
- AWS Elastic Beanstalk
- Google Cloud Run
- DigitalOcean App Platform
- Azure App Service

## Segurança

- Todas as credenciais sensíveis devem ser configuradas como variáveis de ambiente
- Use HTTPS em produção
- Mantenha a biblioteca InterfaceAutomacao.jar atualizada

## Suporte

Para suporte, entre em contato com o provedor de pagamento ou abra uma issue neste repositório.
