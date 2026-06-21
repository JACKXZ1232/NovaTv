import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform, Alert } from 'react-native';
import { useVideoExtractor } from '../hooks/useVideoExtractor';
import { useProgress } from '../hooks/useProgress';
import { VideoPlayer } from '../components/VideoPlayer';
import { LoadingScreen } from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';
import HiddenExtractor from '../components/HiddenExtractor';
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

  // Extraction logic utilizing the 3 potential embed links
  const { state, start, onSuccess, onError } = useVideoExtractor([
    movie.embed_url_1,
    movie.embed_url_2,
    movie.embed_url_3,
  ]);

  const { getProgress, saveProgress, clearProgress } = useProgress();
  const [initialProgress, setInitialProgress] = useState(0);
  const [checkingProgress, setCheckingProgress] = useState(true);

  // Auto-start extraction on mount
  useEffect(() => {
    start();
  }, [start]);

  // Check saved position progress
  useEffect(() => {
    const checkSavedProgress = async () => {
      try {
        const savedSecs = await getProgress(movie.id);
        if (savedSecs > 10) {
          if (Platform.OS === 'web') {
            // Auto restore on web mockup for fluidity
            setInitialProgress(savedSecs);
          } else {
            // Show Native Alert dialogue to resume
            Alert.alert(
              'Continuar Reproducción',
              `¿Deseas continuar viendo desde el minuto ${Math.floor(savedSecs / 60)}:${String(savedSecs % 60).padStart(2, '0')}?`,
              [
                {
                  text: 'Empezar desde el inicio',
                  onPress: () => setInitialProgress(0),
                  style: 'cancel',
                },
                {
                  text: 'Continuar',
                  onPress: () => setInitialProgress(savedSecs),
                },
              ],
              { cancelable: true }
            );
          }
        }
      } catch (err) {
        console.warn('Error fetching saved progress:', err);
      } finally {
        setCheckingProgress(false);
      }
    };

    checkSavedProgress();
  }, [movie.id, getProgress]);

  const handleSaveProgress = (secs: number) => {
    saveProgress(movie.id, secs);
  };

  const handleClearProgress = () => {
    clearProgress(movie.id);
  };

  return (
    <View style={styles.container}>
      {/* Hidden browser extraction engine active during "extracting" state */}
      {state.status === 'extracting' && (
        <HiddenExtractor
          embedUrl={state.embedUrl}
          onSuccess={onSuccess}
          onError={onError}
        />
      )}

      {/* Spinner layout while preparing stream URL */}
      {(state.status === 'idle' || state.status === 'extracting' || checkingProgress) && (
        <LoadingScreen message="Preparando reproducción..." />
      )}

      {/* Video player mounted when m3u8 stream was found */}
      {state.status === 'ready' && !checkingProgress && (
        <VideoPlayer
          movie={movie}
          streamUrl={state.m3u8Url}
          initialProgressSeconds={initialProgress}
          onClose={() => navigation.goBack()}
          onSaveProgress={handleSaveProgress}
          onClearProgress={handleClearProgress}
        />
      )}

      {/* Error layout with retry button when stream cannot be extracted */}
      {state.status === 'error' && (
        <ErrorScreen
          message="Película no disponible en este momento. Intente más tarde."
          onRetry={start}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
