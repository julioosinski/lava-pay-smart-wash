package android.os;

public class HandlerThread extends Thread {
    private Looper looper;

    public HandlerThread(String name) {
        super(name);
        this.looper = new Looper();
    }

    public void quit() {
        // Mock implementation
    }

    public boolean quitSafely() {
        // Mock implementation
        return true;
    }

    public int getThreadId() {
        // Mock implementation
        return (int) Thread.currentThread().getId();
    }

    public Looper getLooper() {
        return looper;
    }
}

class Looper {
    // Mock implementation
} 