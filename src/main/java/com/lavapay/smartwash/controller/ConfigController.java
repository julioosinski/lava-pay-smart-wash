package com.lavapay.smartwash.controller;

import com.lavapay.smartwash.dto.PaymentConfigDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/config")
public class ConfigController {

    @Value("${payment.merchant.id}")
    private String merchantId;

    @Value("${payment.pos.id}")
    private String posId;

    @GetMapping
    public ResponseEntity<Map<String, String>> getConfig() {
        Map<String, String> config = new HashMap<>();
        config.put("merchantId", merchantId);
        config.put("posId", posId);
        config.put("apiUrl", "http://localhost:8080");
        return ResponseEntity.ok(config);
    }

    @PostMapping
    public ResponseEntity<?> updateConfig(@RequestBody PaymentConfigDTO config) {
        // Aqui você pode implementar a lógica para atualizar as configurações
        // Por exemplo, atualizar o arquivo application.properties
        return ResponseEntity.ok().build();
    }
} 