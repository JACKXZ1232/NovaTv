import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  SafeAreaView, 
  ActivityIndicator 
} from 'react-native';
import { SearchBar } from '../components/SearchBar';
import { MovieCard } from '../components/MovieCard';
import { movieService } from '../services/movieService';
import { Movie } from '../types';

interface SearchScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
}

export function SearchScreen({ navigation }: SearchScreenProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const searchRes = await movieService.searchMovies(query);
        setResults(searchRes);
      } catch (e) {
        console.error('Error during search:', e);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleMoviePress = (movie: Movie) => {
    navigation.navigate('Detail', { movie });
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Buscador NovaTv</Text>
        
        <SearchBar 
          value={query}
          onChangeText={setQuery}
          placeholder="Busca por título..."
        />

        {loading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color="#E50914" />
          </View>
        )}

        {results.length > 0 ? (
          <FlatList
            data={results}
            numColumns={3}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.cardWrapper}>
                <MovieCard 
                  movie={item} 
                  onPress={handleMoviePress}
                />
              </View>
            )}
            contentContainerStyle={styles.gridContent}
          />
        ) : (
          !loading && query.trim().length > 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No se encontraron series o películas.</Text>
            </View>
          )
        )}
      </View>
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
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 4,
  },
  loaderContainer: {
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContent: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 40,
  },
  cardWrapper: {
    flex: 1/3,
    padding: 6,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
  },
});
