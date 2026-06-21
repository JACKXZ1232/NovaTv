import React, { useEffect, useState } from 'react';
import { 
  ScrollView, 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { useFavorites } from '../hooks/useFavorites';
import { movieService } from '../services/movieService';
import { MovieRow } from '../components/MovieRow';
import { Movie } from '../types';

interface DetailScreenProps {
  route: {
    params: {
      movie: Movie;
    };
  };
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

export function DetailScreen({ route, navigation }: DetailScreenProps) {
  const { movie } = route.params;
  const { isFavorite, toggleFavorite } = useFavorites();
  const [related, setRelated] = useState<Movie[]>([]);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const list = await movieService.getRelatedMovies(movie.id, movie.genre || []);
        setRelated(list);
      } catch (e) {
        console.error('Error fetching related movies:', e);
      }
    };
    fetchRelated();
  }, [movie]);

  const handlePlayPress = () => {
    navigation.navigate('Player', { movie });
  };

  const posterUri = movie.poster_url || 'https://images.unsplash.com/photo-1542204172-e70528091b50?q=80&w=300&auto=format&fit=crop';

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView style={styles.container}>
        
        {/* Backdrop visual container with dark linear gradients */}
        <View style={styles.headerContainer}>
          <Image 
            source={{ uri: movie.backdrop_url || posterUri }} 
            style={styles.backdrop}
            resizeMode="cover"
          />
          <View style={styles.gradientOverlay} />
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>🛈 Atrás</Text>
          </TouchableOpacity>
        </View>

        {/* Info Layout Grid */}
        <View style={styles.detailsContent}>
          <Text style={styles.title}>{movie.title}</Text>

          {/* Chips indicators row */}
          <View style={styles.chipsRow}>
            {movie.year && (
              <View style={styles.chip}>
                <Text style={styles.chipText}>{movie.year}</Text>
              </View>
            )}
            {movie.rating && (
              <View style={[styles.chip, styles.ratingChip]}>
                <Text style={styles.chipText}>{movie.rating}</Text>
              </View>
            )}
            {movie.duration_minutes && (
              <View style={styles.chip}>
                <Text style={styles.chipText}>{movie.duration_minutes} min</Text>
              </View>
            )}
          </View>

          {/* Action Row buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity 
              style={styles.playButton}
              onPress={handlePlayPress}
            >
              <Text style={styles.playButtonText}>▶ Reproducir</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.listButton,
                isFavorite(movie.id) && styles.listButtonActive
              ]}
              onPress={() => toggleFavorite(movie)}
            >
              <Text style={styles.listButtonText}>
                {isFavorite(movie.id) ? '✓ En mi Lista' : '＋ Mi Lista'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Description Block lines */}
          {movie.description ? (
            <Text style={styles.description}>{movie.description}</Text>
          ) : (
            <Text style={styles.noDescription}>Sin descripción disponible para este título.</Text>
          )}

          {/* Genres Badge Tags list */}
          {movie.genre && movie.genre.length > 0 && (
            <View style={styles.genresRow}>
              <Text style={styles.genresLabel}>Géneros: </Text>
              <Text style={styles.genresText}>{movie.genre.join(', ')}</Text>
            </View>
          )}

        </View>

        {/* Related Shelf Horizontal Row */}
        {related.length > 0 && (
          <View style={styles.relatedSpacing}>
            <MovieRow
              title="Títulos Relacionados"
              movies={related}
              onMoviePress={(m) => navigation.navigate('Detail', { movie: m })}
            />
          </View>
        )}

        <View style={styles.bottomFooterSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    height: 240,
    position: 'relative',
    backgroundColor: '#000000',
  },
  backdrop: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 10, 0.4)',
    backgroundGradient: 'linear-gradient(to top, #0a0a0a 0%, transparent 100%)',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(10, 10, 10, 0.75)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  detailsContent: {
    padding: 16,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  chip: {
    backgroundColor: '#1b1b1b',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#2e2e2e',
  },
  ratingChip: {
    borderColor: '#E50914',
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
  },
  chipText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  playButton: {
    flex: 1,
    backgroundColor: '#E50914',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  listButton: {
    flex: 1,
    backgroundColor: '#1c1c1c',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2d2d2d',
  },
  listButtonActive: {
    backgroundColor: 'rgba(229, 9, 20, 0.15)',
    borderColor: '#E50914',
  },
  listButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  description: {
    color: '#b3b3b3',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  noDescription: {
    color: '#444444',
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 20,
  },
  genresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: '#1b1b1b',
    paddingTop: 16,
  },
  genresLabel: {
    color: '#666666',
    fontSize: 13,
    fontWeight: '600',
  },
  genresText: {
    color: '#ffffff',
    fontSize: 13,
  },
  relatedSpacing: {
    marginTop: 10,
  },
  bottomFooterSpacer: {
    height: 60,
  },
});
