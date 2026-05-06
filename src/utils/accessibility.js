import { Platform } from 'react-native';

export function blurActiveElementOnWeb() {
  if (Platform.OS !== 'web') return;
  if (typeof document === 'undefined') return;

  const activeElement = document.activeElement;
  if (activeElement && typeof activeElement.blur === 'function') {
    activeElement.blur();
  }
}
