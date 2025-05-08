package com.lavapay.smartwash.controller;

import br.com.setis.interfaceautomacao.SaidaTransacao;
import com.lavapay.smartwash.dto.PaymentResultDTO;
import com.lavapay.smartwash.exception.PaymentErrorCode;
import com.lavapay.smartwash.exception.PaymentException;
import com.lavapay.smartwash.service.PaymentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    @Autowired
    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/process")
    public ResponseEntity<?> processPayment(
            @RequestParam double amount,
            @RequestParam String paymentMode) {
        try {
            PaymentResultDTO result = paymentService.processPayment(amount, paymentMode);
            return ResponseEntity.ok(result);
        } catch (PaymentException e) {
            log.error("Erro no processamento do pagamento: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(e));
        }
    }

    @PostMapping("/{transactionId}/cancel")
    public ResponseEntity<?> cancelTransaction(
            @PathVariable String transactionId) {
        try {
            PaymentResultDTO result = paymentService.cancelTransaction(transactionId);
            return ResponseEntity.ok(result);
        } catch (PaymentException e) {
            log.error("Erro no cancelamento da transação: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(e));
        }
    }

    @PostMapping("/{transactionId}/refund")
    public ResponseEntity<?> refundTransaction(
            @PathVariable String transactionId,
            @RequestParam double amount) {
        try {
            PaymentResultDTO result = paymentService.refundTransaction(transactionId, amount);
            return ResponseEntity.ok(result);
        } catch (PaymentException e) {
            log.error("Erro no estorno da transação: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(e));
        }
    }

    @GetMapping("/{transactionId}")
    public ResponseEntity<?> getTransaction(
            @PathVariable String transactionId) {
        try {
            SaidaTransacao transaction = paymentService.getTransaction(transactionId);
            return ResponseEntity.ok(PaymentResultDTO.fromTransactionOutput(transaction));
        } catch (PaymentException e) {
            log.error("Erro ao buscar transação: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse(e));
        }
    }

    private Map<String, Object> createErrorResponse(PaymentException e) {
        Map<String, Object> response = new HashMap<>();
        response.put("errorCode", e.getErrorCode().name());
        response.put("message", e.getMessage());
        response.put("transactionId", e.getTransactionId());
        return response;
    }
} 