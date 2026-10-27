import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getItem(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export async function setItem(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // almacenamiento no disponible; la app sigue funcionando en memoria para esta sesión
  }
}
