package com.lavapay.smartwash.exception;

public enum PaymentErrorCode {
    INVALID_AMOUNT("Valor inválido"),
    INVALID_PAYMENT_MODE("Modalidade de pagamento inválida"),
    TRANSACTION_FAILED("Falha na transação"),
    CONFIRMATION_FAILED("Falha na confirmação"),
    CANCELLATION_FAILED("Falha no cancelamento"),
    REFUND_FAILED("Falha no estorno"),
    SYSTEM_ERROR("Erro interno do sistema");

    private final String message;

    PaymentErrorCode(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }
} 