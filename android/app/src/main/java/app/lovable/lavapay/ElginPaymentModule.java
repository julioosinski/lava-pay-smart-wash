
package app.lovable.lavapay;

import android.app.Activity;
import android.content.Intent;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

import java.math.BigDecimal;
import java.util.UUID;

// Este módulo se conecta com o SDK do TEF da Elgin
public class ElginPaymentModule extends ReactContextBaseJavaModule implements ActivityEventListener {
    private static final int ELGIN_PAYMENT_REQUEST = 1002;
    private Promise paymentPromise;
    private final ReactApplicationContext reactContext;

    private final ActivityEventListener activityEventListener = new BaseActivityEventListener() {
        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
            if (requestCode == ELGIN_PAYMENT_REQUEST) {
                if (paymentPromise != null) {
                    if (resultCode == Activity.RESULT_OK) {
                        String transactionId = data.getStringExtra("transactionId");
                        String receiptCode = data.getStringExtra("receiptCode");
                        
                        WritableMap result = Arguments.createMap();
                        result.putString("transactionId", transactionId);
                        result.putString("receiptCode", receiptCode);
                        result.putString("status", "approved");
                        
                        paymentPromise.resolve(result);
                    } else {
                        String errorMessage = data != null ? 
                            data.getStringExtra("errorMessage") : "Pagamento cancelado";
                        paymentPromise.reject("PAYMENT_ERROR", errorMessage);
                    }
                    paymentPromise = null;
                }
            }
        }
    };

    public ElginPaymentModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.reactContext.addActivityEventListener(activityEventListener);
    }

    @Override
    public String getName() {
        return "ElginPayment";
    }

    @ReactMethod
    public void initialize(String clientId, String clientSecret, Promise promise) {
        try {
            // Em uma implementação real, seria inicializado o SDK da Elgin aqui
            // Por exemplo: ElginTEF.initialize(clientId, clientSecret);
            
            // Simulação de inicialização bem-sucedida
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("ELGIN_INIT_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void processPayment(ReadableMap options, Promise promise) {
        try {
            double amount = options.getDouble("amount");
            String description = options.getString("description");
            String paymentMethod = options.getString("paymentMethod");
            
            // Em uma implementação real, aqui seria iniciada a chamada do TEF Elgin
            // Por exemplo:
            /*
            ElginTEF.startPayment()
                .setAmount(amount)
                .setDescription(description)
                .setPaymentType(paymentMethod.equals("credit") ? 
                    ElginTEF.CREDIT : ElginTEF.DEBIT)
                .startTransaction(getCurrentActivity());
            */
            
            // Armazena a promessa para uso no callback de resultado
            paymentPromise = promise;
            
            // Simulação para testes - normalmente seria iniciado um Intent para o App da Elgin
            // Simularemos uma resposta após 2 segundos
            new android.os.Handler().postDelayed(() -> {
                WritableMap result = Arguments.createMap();
                result.putString("transactionId", UUID.randomUUID().toString());
                result.putString("receiptCode", "ELGIN_" + Math.floor(Math.random() * 100000));
                result.putString("status", "approved");
                
                promise.resolve(result);
                paymentPromise = null;
            }, 2000);
            
        } catch (Exception e) {
            promise.reject("PAYMENT_ERROR", e.getMessage());
            paymentPromise = null;
        }
    }
}
