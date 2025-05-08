package com.lavapay.smartwash.dto;

import br.com.setis.interfaceautomacao.SaidaTransacao;
import br.com.setis.interfaceautomacao.ModalidadesPagamento;
import lombok.Data;

import java.util.Date;

@Data
public class PaymentResultDTO {
    private String transactionId;
    private String amount;
    private String paymentMode;
    private String status;
    private String authorizationCode;
    private Date transactionDate;
    private String maskedCardNumber;
    private String merchantReceipt;
    private String cardholderReceipt;

    public static PaymentResultDTO fromTransactionOutput(SaidaTransacao output) {
        PaymentResultDTO dto = new PaymentResultDTO();
        dto.setTransactionId(output.obtemIdentificadorTransacaoAutomacao());
        dto.setAmount(output.obtemValorTotal());
        dto.setPaymentMode(output.obtemModalidadePagamento().name());
        dto.setStatus(output.obtemResultadoTransacao() == 1 ? "SUCCESS" : "FAILED");
        dto.setAuthorizationCode(output.obtemCodigoAutorizacao());
        dto.setTransactionDate(output.obtemDataHoraTransacao());
        dto.setMaskedCardNumber(output.obtemPanMascarado());
        dto.setMerchantReceipt(String.join("\n", output.obtemComprovanteCompleto()));
        dto.setCardholderReceipt(String.join("\n", output.obtemComprovanteReduzidoPortador()));
        return dto;
    }
} 