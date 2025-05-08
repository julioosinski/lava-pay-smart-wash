package com.lavapay.smartwash.service;

import br.com.setis.interfaceautomacao.*;
import br.com.setis.interfaceautomacao.espec.TransactionInput;
import br.com.setis.interfaceautomacao.espec.TransactionOutput;
import com.lavapay.smartwash.dto.PaymentResultDTO;
import com.lavapay.smartwash.exception.PaymentErrorCode;
import com.lavapay.smartwash.exception.PaymentException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class PaymentService {
    private final Transacoes transacoes;
    private final DadosAutomacao dadosAutomacao;
    private final Map<String, SaidaTransacao> transactionCache;

    public PaymentService(
            @Value("${payment.merchant.id}") String merchantId,
            @Value("${payment.pos.id}") String posId) {
        this.dadosAutomacao = new DadosAutomacao(
            merchantId,
            posId,
            "SmartWash",  // Nome da Automação
            true,         // Suporta troco
            true,         // Suporta desconto
            true,         // Suporta múltiplos cartões
            false         // NFC habilitado
        );
        this.transacoes = Transacoes.obtemInstancia(dadosAutomacao, null);
        this.transactionCache = new ConcurrentHashMap<>();
    }

    public PaymentResultDTO processPayment(double amount, String paymentMode) {
        validatePayment(amount, paymentMode);
        String transactionId = generateTransactionId();
        
        try {
            log.info("Iniciando transação: {} - Valor: {} - Modo: {}", 
                    transactionId, amount, paymentMode);
            
            EntradaTransacao entrada = new EntradaTransacao(Operacoes.VENDA, transactionId);
            entrada.informaValorTotal(String.valueOf(amount));
            entrada.informaModalidadePagamento(ModalidadesPagamento.valueOf(paymentMode));
            
            SaidaTransacao saida = transacoes.realizaTransacao(entrada);
            transactionCache.put(transactionId, saida);
            
            if (saida.obtemInformacaoConfirmacao()) {
                confirmTransaction(saida);
            }
            
            log.info("Transação concluída: {} - Status: {}", 
                    transactionId, saida.obtemResultadoTransacao());
            
            return PaymentResultDTO.fromTransactionOutput(saida);
        } catch (Exception e) {
            log.error("Erro na transação {}: {}", transactionId, e.getMessage());
            throw new PaymentException(PaymentErrorCode.TRANSACTION_FAILED, 
                    "Falha ao processar pagamento", transactionId);
        }
    }

    public PaymentResultDTO cancelTransaction(String transactionId) {
        try {
            SaidaTransacao originalTransaction = getTransaction(transactionId);
            
            EntradaTransacao entrada = new EntradaTransacao(
                    Operacoes.CANCELAMENTO, 
                    generateTransactionId()
            );
            entrada.informaValorTotal(originalTransaction.obtemValorTotal());
            entrada.informaModalidadePagamento(originalTransaction.obtemModalidadePagamento());
            entrada.informaNsuTransacaoOriginal(transactionId);
            
            SaidaTransacao saida = transacoes.realizaTransacao(entrada);
            
            log.info("Cancelamento realizado: {} - Status: {}", 
                    transactionId, saida.obtemResultadoTransacao());
            
            return PaymentResultDTO.fromTransactionOutput(saida);
        } catch (Exception e) {
            log.error("Erro no cancelamento {}: {}", transactionId, e.getMessage());
            throw new PaymentException(PaymentErrorCode.CANCELLATION_FAILED, 
                    "Falha ao cancelar transação", transactionId);
        }
    }

    public PaymentResultDTO refundTransaction(String transactionId, double amount) {
        try {
            SaidaTransacao originalTransaction = getTransaction(transactionId);
            
            EntradaTransacao entrada = new EntradaTransacao(
                    Operacoes.CANCELAMENTO,  // Usando CANCELAMENTO em vez de ESTORNO
                    generateTransactionId()
            );
            entrada.informaValorTotal(String.valueOf(amount));
            entrada.informaModalidadePagamento(originalTransaction.obtemModalidadePagamento());
            entrada.informaNsuTransacaoOriginal(transactionId);
            
            SaidaTransacao saida = transacoes.realizaTransacao(entrada);
            
            log.info("Estorno realizado: {} - Valor: {} - Status: {}", 
                    transactionId, amount, saida.obtemResultadoTransacao());
            
            return PaymentResultDTO.fromTransactionOutput(saida);
        } catch (Exception e) {
            log.error("Erro no estorno {}: {}", transactionId, e.getMessage());
            throw new PaymentException(PaymentErrorCode.REFUND_FAILED, 
                    "Falha ao realizar estorno", transactionId);
        }
    }

    @Cacheable(value = "transactions", key = "#transactionId")
    public SaidaTransacao getTransaction(String transactionId) {
        SaidaTransacao transaction = transactionCache.get(transactionId);
        if (transaction == null) {
            throw new PaymentException(PaymentErrorCode.SYSTEM_ERROR, 
                    "Transação não encontrada", transactionId);
        }
        return transaction;
    }

    private void validatePayment(double amount, String paymentMode) {
        if (amount <= 0) {
            throw new PaymentException(PaymentErrorCode.INVALID_AMOUNT, 
                    "Valor deve ser maior que zero", null);
        }
        
        try {
            ModalidadesPagamento.valueOf(paymentMode);
        } catch (IllegalArgumentException e) {
            throw new PaymentException(PaymentErrorCode.INVALID_PAYMENT_MODE, 
                    "Modalidade de pagamento inválida", null);
        }
    }

    private void confirmTransaction(SaidaTransacao saida) {
        try {
            Confirmacoes confirmacao = new Confirmacoes();
            confirmacao.informaStatusTransacao(StatusTransacao.CONFIRMADO_AUTOMATICO);
            confirmacao.informaIdentificadorConfirmacaoTransacao(
                    saida.obtemIdentificadorConfirmacaoTransacao()
            );
            transacoes.confirmaTransacao(confirmacao);
            log.info("Transação confirmada: {}", 
                    saida.obtemIdentificadorConfirmacaoTransacao());
        } catch (Exception e) {
            log.error("Erro na confirmação: {}", e.getMessage());
            throw new PaymentException(PaymentErrorCode.CONFIRMATION_FAILED, 
                    "Falha ao confirmar transação", 
                    saida.obtemIdentificadorConfirmacaoTransacao());
        }
    }

    private String generateTransactionId() {
        return "TRX_" + System.currentTimeMillis();
    }
} 