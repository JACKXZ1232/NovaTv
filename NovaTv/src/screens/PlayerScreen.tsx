import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform, Alert } from 'react-native';
import { useVideoExtractor } from '../hooks/useVideoExtractor';
import { useProgress } from '../hooks/useProgress';
import { VideoPlayer } from '../components/VideoPlayer';
import { LoadingScreen } from '../components/LoadingScreen';
import { Movie } from '../types';

interface PlayerScreenProps {
  route: {
    params: {
      movie: Movie;
    };
  };
  navigation: {
    goBack: () => void;
  };
}

export function PlayerScreen({ route, navigation }: PlayerScreenProps) {
  const { movie } = route.params;
  const { streamUrl, loading, error, retry } = useVideoExtractor(movie);
  const { getProgress, saveProgress, clearProgress } = useProgress();

  const [initialProgress, setInitialProgress] = useState(0);
  const [checkingProgress, setCheckingProgress] = useState(true);

  // Check if there is saved playback progress for this title
  useEffect(() => {
    const fetchSavedProgress = async () => {
      try {
        const savedSecs = await getProgress(movie.id);
        if (savedSecs > 10) {
          // On mobile, ask via Alert. On Web/standalone, restore automatically or ask
          if (Platform.OS === 'web') {
            console.log(`Restaurado automáticamente pos: ${savedSecs}s en web setup.`);
            setInitialProgress(savedSecs);
          } else {
            // Mobile alert prompt
            Alert.alert(
              'Continuar Reproducción',
              `¿Deseas continuar viendo desde el minuto ${Math.floor(savedSecs / 60)}?`,
              [
                { text: 'Desde el inicio', onPress: () => setInitialProgress(0), style: 'cancel' },
                { text: 'Continuar', onPress: () => setInitialProgress(savedSecs) }
              ],
              { cancelable: true }
            );
          }
        }
      } catch (e) {
        console.warn('Error fetching saved progress from AsyncStorage:', e);
      } finally {
        setCheckingProgress(false);
      }
    };

    fetchSavedProgress();
  }, [movie]);

  const handleSaveProgress = (secs: number) => {
    saveProgress(movie.id, secs);
  };

  const handleClearProgress = () => {
    clearProgress(movie.id);
  };

  if (loading || checkingProgress) {
    return <LoadingScreen message={`Generando link seguro m3u8 para "${movie.title}"...`} />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        
        <View style={styles.buttonsBlock}>
          <TouchableOpacity style={styles.retryButton} onPress={retry}>
            <Text style={styles.retryButtonText}>Reintentar Extracción</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Volver al Catálogo</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {streamUrl ? (
        <VideoPlayer
          movie={movie}
          streamUrl={streamUrl}
          initialProgressSeconds={initialProgress}
          onClose={() => navigation.goBack()}
          onSaveProgress={handleSaveProgress}
          onClearProgress={handleClearProgress}
        />
      ) : (
        <Text style={styles.unsupportedText}>Enlace de reproducción m3u8 no definido.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorMessage: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
    opacity: 0.8,
  },
  buttonsBlock: {
    width: '100%',
    maxWidth: 300,
    gap: 12,
  },
  retryButton: {
    backgroundColor: '#E50914',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#1c1c1c',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  unsupportedText: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.6,
  },
});
