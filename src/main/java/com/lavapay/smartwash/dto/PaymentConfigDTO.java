package com.lavapay.smartwash.dto;

import lombok.Data;

@Data
public class PaymentConfigDTO {
    private String merchantId;
    private String posId;
    private String apiUrl;
} 