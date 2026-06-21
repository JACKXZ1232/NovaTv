import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ImageBackground, 
  StyleSheet, 
  TouchableOpacity,
  Dimensions,
  Platform
} from 'react-native';
import { Movie } from '../types';

interface HeroBannerProps {
  movie: Movie;
  onPlayPress: (movie: Movie) => void;
  onMyListPress: (movie: Movie) => void;
  isInMyList: boolean;
}

export function HeroBanner({ movie, onPlayPress, onMyListPress, isInMyList }: HeroBannerProps) {
  const [isPlayFocused, setIsPlayFocused] = useState(false);
  const [isListFocused, setIsListFocused] = useState(false);

  const backdropUri = movie.backdrop_url || movie.poster_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop';

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={{ uri: backdropUri }} 
        style={styles.backdrop}
        resizeMode="cover"
      >
        {/* Dark linear cover overlay */}
        <View style={styles.overlay}>
          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={2}>{movie.title}</Text>
            
            <View style={styles.metaRow}>
              {movie.year && <Text style={styles.metaText}>{movie.year}</Text>}
              {movie.rating && (
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>{movie.rating}</Text>
                </View>
              )}
            </View>

            {movie.description && (
              <Text style={styles.description} numberOfLines={3}>
                {movie.description}
              </Text>
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={() => onPlayPress(movie)}
                onFocus={() => setIsPlayFocused(true)}
                onBlur={() => setIsPlayFocused(false)}
                activeOpacity={0.8}
                style={[
                  styles.buttonPlay,
                  isPlayFocused && styles.buttonFocusedRed
                ]}
              >
                <Text style={styles.buttonPlayText}>▶ Reproducir</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onMyListPress(movie)}
                onFocus={() => setIsListFocused(true)}
                onBlur={() => setIsListFocused(false)}
                activeOpacity={0.8}
                style={[
                  styles.buttonList,
                  isListFocused && styles.buttonFocusedWhite,
                  isInMyList && styles.buttonActiveList
                ]}
              >
                <Text style={styles.buttonListText}>
                  {isInMyList ? '✓ Mi Lista' : '＋ Mi Lista'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 380,
    backgroundColor: '#0a0a0a',
    width: '100%',
  },
  backdrop: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 10, 0.4)',
    backgroundGradient: 'linear-gradient(to top, #0a0a0a 0%, rgba(10,10,10,0.6) 50%, transparent 100%)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  content: {
    marginBottom: 10,
    maxWidth: Platform.OS === 'web' ? 500 : '100%',
  },
  title: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  metaText: {
    color: '#b3b3b3',
    fontSize: 13,
    fontWeight: '500',
  },
  ratingBadge: {
    backgroundColor: '#333333',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  description: {
    color: '#cccccc',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonPlay: {
    backgroundColor: '#E50914',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPlayText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  buttonList: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonActiveList: {
    backgroundColor: 'rgba(229, 9, 20, 0.25)',
    borderWidth: 1,
    borderColor: '#E50914',
  },
  buttonListText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  buttonFocusedRed: {
    borderWidth: 2,
    borderColor: '#ffffff',
    transform: [{ scale: 1.05 }],
  },
  buttonFocusedWhite: {
    borderWidth: 2,
    borderColor: '#E50914',
    transform: [{ scale: 1.05 }],
  },
});
