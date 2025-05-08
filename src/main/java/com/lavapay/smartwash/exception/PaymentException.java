package com.lavapay.smartwash.exception;

public class PaymentException extends RuntimeException {
    private final PaymentErrorCode errorCode;
    private final String transactionId;

    public PaymentException(PaymentErrorCode errorCode, String message, String transactionId) {
        super(message);
        this.errorCode = errorCode;
        this.transactionId = transactionId;
    }

    public PaymentErrorCode getErrorCode() {
        return errorCode;
    }

    public String getTransactionId() {
        return transactionId;
    }
} 