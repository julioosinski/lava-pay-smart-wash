
# ESP32 Implementation Guide

This document outlines the required functionality for the ESP32 microcontroller to work with our laundry management system.

## 1. Hardware Requirements

- ESP32 microcontroller
- Relay module for controlling machines
- Optional: Status LEDs
- Optional: RFID reader for local authentication

## 2. Core Functionality

### WiFi Connection
```cpp
// Configure WiFi with credentials from server
void setupWiFi(const char* ssid, const char* password) {
  WiFi.begin(ssid, password);
  
  // Wait for connection with timeout
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    attempts++;
  }
  
  // Report WiFi signal strength periodically
  if (WiFi.status() == WL_CONNECTED) {
    int rssi = WiFi.RSSI();
    reportWiFiSignal(rssi);
  }
}
```

### MQTT Communication
```cpp
// Connect to MQTT broker with credentials from server
void setupMQTT(const char* broker, const char* username, const char* password, const char* machineId) {
  mqttClient.setServer(broker, 1883);
  mqttClient.setCallback(mqttCallback);
  
  String clientId = "esp32-" + String(machineId);
  
  if (mqttClient.connect(clientId.c_str(), username, password)) {
    // Subscribe to command topics
    mqttClient.subscribe(("machine/" + String(machineId) + "/command").c_str());
  }
}

// Handle incoming MQTT messages
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  // Parse command JSON
  DynamicJsonDocument doc(256);
  deserializeJson(doc, payload, length);
  
  String command = doc["command"];
  
  if (command == "start") {
    int duration = doc["duration"];
    startMachine(duration);
  } else if (command == "stop") {
    stopMachine();
  } else if (command == "status") {
    reportStatus();
  } else if (command == "config") {
    // Handle configuration updates
    updateConfiguration(doc);
  }
}
```

### Machine Control
```cpp
// Start the machine for a specific duration
void startMachine(int durationMinutes) {
  // Activate relay to start machine
  digitalWrite(RELAY_PIN, HIGH);
  
  machineRunning = true;
  sessionStartTime = millis();
  sessionDuration = durationMinutes * 60 * 1000;
  
  // Report status change
  reportStatus();
}

// Stop the machine
void stopMachine() {
  // Deactivate relay
  digitalWrite(RELAY_PIN, LOW);
  
  machineRunning = false;
  sessionStartTime = 0;
  
  // Report status change
  reportStatus();
}
```

### Status Reporting
```cpp
// Report machine status via MQTT
void reportStatus() {
  DynamicJsonDocument doc(256);
  
  doc["machine_id"] = machineId;
  doc["is_running"] = machineRunning;
  
  if (machineRunning) {
    unsigned long elapsedTime = millis() - sessionStartTime;
    if (elapsedTime < sessionDuration) {
      doc["remaining_seconds"] = (sessionDuration - elapsedTime) / 1000;
    } else {
      // Session should be over
      stopMachine();
      doc["remaining_seconds"] = 0;
    }
  }
  
  // Add error code if any
  if (errorCode) {
    doc["error_code"] = errorCode;
  }
  
  String status;
  serializeJson(doc, status);
  
  mqttClient.publish(("machine/" + String(machineId) + "/status").c_str(), status.c_str());
}

// Report WiFi signal strength via Supabase Realtime
void reportWiFiSignal(int rssi) {
  DynamicJsonDocument doc(128);
  doc["machine_id"] = machineId;
  doc["signal"] = rssi;
  
  String signalData;
  serializeJson(doc, signalData);
  
  // Use HTTP POST to send to our backend API
  HTTPClient http;
  http.begin("https://your-api-endpoint/report-signal");
  http.addHeader("Content-Type", "application/json");
  http.POST(signalData);
  http.end();
}
```

## 3. Configuration Management

### Fetch Configuration
```cpp
// Get configuration from server on boot
void fetchConfiguration() {
  HTTPClient http;
  http.begin("https://your-api-endpoint/machine-config?id=" + String(machineId));
  
  int httpCode = http.GET();
  if (httpCode == HTTP_CODE_OK) {
    String payload = http.getString();
    
    DynamicJsonDocument doc(512);
    deserializeJson(doc, payload);
    
    // Extract WiFi credentials
    const char* ssid = doc["wifi_ssid"];
    const char* wifiPassword = doc["wifi_password"];
    
    // Extract MQTT configuration
    const char* mqttBroker = doc["mqtt_broker"];
    const char* mqttUsername = doc["mqtt_username"];
    const char* mqttPassword = doc["mqtt_password"];
    
    // Save configuration to flash memory
    saveConfiguration(ssid, wifiPassword, mqttBroker, mqttUsername, mqttPassword);
    
    // Apply configuration
    setupWiFi(ssid, wifiPassword);
    setupMQTT(mqttBroker, mqttUsername, mqttPassword, machineId);
  }
  
  http.end();
}

// Save configuration to flash memory
void saveConfiguration(const char* ssid, const char* wifiPassword, 
                      const char* mqttBroker, const char* mqttUsername, const char* mqttPassword) {
  // Use ESP32 Preferences or SPIFFS to save configuration
  preferences.begin("machine-config", false);
  preferences.putString("ssid", ssid);
  preferences.putString("wifi_pass", wifiPassword);
  preferences.putString("mqtt_broker", mqttBroker);
  preferences.putString("mqtt_user", mqttUsername);
  preferences.putString("mqtt_pass", mqttPassword);
  preferences.end();
}
```

## 4. Main Program Loop

```cpp
void setup() {
  Serial.begin(115200);
  
  // Setup pins
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);
  
  // Load stored configuration
  loadStoredConfiguration();
  
  // Connect to WiFi and MQTT with stored configuration
  setupWiFi(storedSSID, storedWiFiPassword);
  setupMQTT(storedMQTTBroker, storedMQTTUsername, storedMQTTPassword, machineId);
  
  // Fetch latest configuration from server
  fetchConfiguration();
}

void loop() {
  // Handle WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    reconnectWiFi();
  } else {
    // Report WiFi signal strength every minute
    static unsigned long lastSignalReport = 0;
    if (millis() - lastSignalReport > 60000) {
      reportWiFiSignal(WiFi.RSSI());
      lastSignalReport = millis();
    }
  }
  
  // Handle MQTT connection
  if (!mqttClient.connected()) {
    reconnectMQTT();
  } else {
    mqttClient.loop();
  }
  
  // Check machine status and remaining time
  if (machineRunning) {
    unsigned long elapsedTime = millis() - sessionStartTime;
    if (elapsedTime >= sessionDuration) {
      // Stop machine when time is up
      stopMachine();
    } else {
      // Report status every 10 seconds while running
      static unsigned long lastStatusReport = 0;
      if (millis() - lastStatusReport > 10000) {
        reportStatus();
        lastStatusReport = millis();
      }
    }
  }
  
  // Handle other tasks...
  delay(100);
}
```

## 5. Dependencies

This implementation requires the following libraries:
- WiFi.h (ESP32 Core)
- PubSubClient (for MQTT)
- ArduinoJson (for JSON parsing)
- HTTPClient (for HTTP requests)
- Preferences (for saving configuration)

## 6. Integration with Web Application

The ESP32 should communicate with the web application through:

1. **HTTP API Endpoints**:
   - `/api/machine-config` - GET endpoint to retrieve configuration
   - `/api/report-signal` - POST endpoint to report WiFi signal strength

2. **MQTT Topics**:
   - `machine/{machineId}/command` - Receive commands from the server
   - `machine/{machineId}/status` - Publish status updates

3. **Supabase Realtime**:
   - For real-time status updates and WiFi signal reporting
   - Example payload format for WiFi signal:
     ```json
     {
       "machine_id": "123e4567-e89b-12d3-a456-426614174000",
       "signal": -65
     }
     ```

4. **Error Handling**:
   - Report error codes in status updates
   - Implement automatic recovery mechanisms
   - Log errors to serial and potentially to a server endpoint

## 7. Security Considerations

- Store sensitive credentials securely using ESP32's flash encryption
- Implement secure boot if available
- Use TLS for MQTT connections
- Implement authentication for API requests
- Consider implementing local authentication via RFID for manual machine operation
