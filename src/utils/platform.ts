
/**
 * Web-compatible platform detection utility
 * This replaces the React Native Platform module functionality
 */

export const Platform = {
  OS: 'web',
  isWeb: true,
  isAndroid: false,
  isIOS: false,
  select: <T>(options: { android?: T; ios?: T; web?: T; default?: T }): T => {
    return (
      options.web || 
      options.default || 
      options.android || 
      options.ios || 
      ({} as T)
    );
  },
};

// Detect platform based on user agent
if (typeof navigator !== 'undefined' && typeof window !== 'undefined') {
  const userAgent = navigator.userAgent || '';
  if (/android/i.test(userAgent)) {
    Platform.OS = 'android';
    Platform.isAndroid = true;
  } else if (/iPad|iPhone|iPod/.test(userAgent)) {
    Platform.OS = 'ios';
    Platform.isIOS = true;
  }
}
