import React, { useState } from 'react';
import { 
  TouchableOpacity, 
  Image, 
  Text, 
  StyleSheet, 
  View,
  Platform 
} from 'react-native';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  onPress: (movie: Movie) => void;
  hasPreferredFocus?: boolean;
}

export function MovieCard({ movie, onPress, hasPreferredFocus = false }: MovieCardProps) {
  const [isFocused, setIsFocused] = useState(false);

  // Fallback default poster if poster_url is undefined or invalid
  const posterUri = movie.poster_url || 'https://images.unsplash.com/photo-1542204172-e70528091b50?q=80&w=300&auto=format&fit=crop';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(movie)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      hasTVPreferredFocus={hasPreferredFocus}
      accessible={true}
      accessibilityLabel={`Película: ${movie.title}`}
      style={[
        styles.card,
        isFocused && styles.cardFocused
      ]}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: posterUri }} 
          style={styles.poster}
          resizeMode="cover"
        />
        {isFocused && ( Platform.isTV || true ) && (
          <View style={styles.focusBorder} />
        )}
      </View>
      <Text 
        numberOfLines={1} 
        style={[
          styles.title,
          isFocused && styles.titleFocused
        ]}
      >
        {movie.title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 120,
    marginRight: 12,
    transform: [{ scale: 1.0 }],
  },
  cardFocused: {
    transform: [{ scale: 1.05 }],
  },
  imageContainer: {
    width: '120px' as any,
    height: 180,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#1b1b1b',
    position: 'relative',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  focusBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    borderColor: '#E50914',
    borderRadius: 6,
  },
  title: {
    color: '#999999',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
    paddingHorizontal: 2,
  },
  titleFocused: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
