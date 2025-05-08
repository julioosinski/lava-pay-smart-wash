package com.lavapay.smartwash;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class SmartWashApplication {
    public static void main(String[] args) {
        SpringApplication.run(SmartWashApplication.class, args);
    }
} 