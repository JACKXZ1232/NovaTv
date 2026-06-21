import AsyncStorage from '@react-native-async-storage/async-storage';

export function useProgress() {
  const getProgressKey = (movieId: string) => `progress_${movieId}`;

  // Obtiene los segundos guardados para una película
  const getProgress = async (movieId: string): Promise<number> => {
    try {
      const val = await AsyncStorage.getItem(getProgressKey(movieId));
      return val ? Number(val) : 0;
    } catch (e) {
      console.error('Error fetching progress:', e);
      return 0;
    }
  };

  // Guarda la posición actual de manera asíncrona (se llama cada 5 segundos de forma automatizada)
  const saveProgress = async (movieId: string, seconds: number): Promise<void> => {
    try {
      if (seconds <= 0) return;
      await AsyncStorage.setItem(getProgressKey(movieId), String(Math.floor(seconds)));
    } catch (e) {
      console.error('Error saving progress:', e);
    }
  };

  // Borra la persistencia cuando la película termina de ser reproducida al 100%
  const clearProgress = async (movieId: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(getProgressKey(movieId));
    } catch (e) {
      console.error('Error clearing progress:', e);
    }
  };

  return {
    getProgress,
    saveProgress,
    clearProgress
  };
}
