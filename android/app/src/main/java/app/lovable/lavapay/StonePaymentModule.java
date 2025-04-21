
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

import stone.application.StoneStart;
import stone.providers.TransactionProvider;
import stone.utils.Stone;
import stone.database.transaction.TransactionObject;

public class StonePaymentModule extends ReactContextBaseJavaModule implements ActivityEventListener {
    private static final int STONE_PAYMENT_REQUEST = 1001;
    private Promise paymentPromise;
    private final ReactApplicationContext reactContext;

    private final ActivityEventListener activityEventListener = new BaseActivityEventListener() {
        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
            if (requestCode == STONE_PAYMENT_REQUEST) {
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

    public StonePaymentModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.reactContext.addActivityEventListener(activityEventListener);
    }

    @Override
    public String getName() {
        return "StonePayment";
    }

    @ReactMethod
    public void initialize(String stoneCode, Promise promise) {
        try {
            Stone.setAppName("LavaPaySmartWash");
            Stone.setEnvironment(Stone.Environment.PRODUCTION);
            
            StoneStart.init(reactContext);
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("STONE_INIT_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void activateStone(String stoneCode, Promise promise) {
        try {
            // Este é um exemplo simplificado. Na implementação real,
            // você precisaria lidar com a ativação da Stone usando o SDK
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("STONE_ACTIVATION_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void processPayment(ReadableMap options, Promise promise) {
        try {
            double amount = options.getDouble("amount");
            String description = options.getString("description");
            String paymentMethod = options.getString("paymentMethod");
            
            // Converte para centavos como a Stone espera
            BigDecimal amountInCents = new BigDecimal(amount * 100);
            
            TransactionObject transaction = new TransactionObject();
            transaction.setAmount(amountInCents);
            transaction.setInitiatorTransactionKey(UUID.randomUUID().toString());
            
            if (paymentMethod.equals("credit")) {
                transaction.setTypeOfTransaction(TransactionObject.CREDIT);
                int installments = options.hasKey("installments") ? 
                    options.getInt("installments") : 1;
                transaction.setInstallmentCount(installments);
            } else {
                transaction.setTypeOfTransaction(TransactionObject.DEBIT);
            }
            
            // Armazena a promessa para uso no callback de resultado
            paymentPromise = promise;
            
            // Inicia o processo de pagamento
            TransactionProvider provider = new TransactionProvider();
            provider.useDefaultUI(true);
            provider.execute(transaction, getCurrentActivity());
            
        } catch (Exception e) {
            promise.reject("PAYMENT_ERROR", e.getMessage());
            paymentPromise = null;
        }
    }
}
