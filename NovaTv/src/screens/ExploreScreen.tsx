import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Dimensions
} from 'react-native';
import { movieService } from '../services/movieService';
import { MovieCard } from '../components/MovieCard';
import { Category, Movie } from '../types';

interface ExploreScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
}

export function ExploreScreen({ navigation }: ExploreScreenProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryMovies, setCategoryMovies] = useState<Movie[]>([]);
  
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States to keep track of element index highlights for TV controller
  const [hoveredCatId, setHoveredCatId] = useState<string | null>(null);
  const [isBackHovered, setIsBackHovered] = useState(false);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        setLoadingCats(true);
        setError(null);
        const list = await movieService.getCategories();
        setCategories(list);
      } catch (err: any) {
        console.error('Error fetching categories in explore:', err);
        setError('Error al cargar categorías');
      } finally {
        setLoadingCats(false);
      }
    };
    fetchCats();
  }, []);

  const handleCategorySelect = async (cat: Category) => {
    setSelectedCategory(cat);
    setLoadingMovies(true);
    try {
      const list = await movieService.getMoviesByCategory(cat.id);
      setCategoryMovies(list);
    } catch (err) {
      console.error('Error fetching movies for category:', cat.name, err);
    } finally {
      setLoadingMovies(false);
    }
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setCategoryMovies([]);
  };

  const handleMoviePress = (movie: Movie) => {
    navigation.navigate('Detail', { movie });
  };

  if (loadingCats) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E50914" />
          <Text style={styles.loadingText}>Cargando categorías...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        {!selectedCategory ? (
          <>
            <Text style={styles.headerTitle}>Explorar Géneros</Text>
            {error && <Text style={styles.errorText}>{error}</Text>}
            
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              numColumns={2}
              contentContainerStyle={styles.gridContent}
              renderItem={({ item }) => {
                const isFocused = hoveredCatId === item.id;
                return (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleCategorySelect(item)}
                    onFocus={() => setHoveredCatId(item.id)}
                    onBlur={() => setHoveredCatId(null)}
                    style={[
                      styles.categoryCard,
                      isFocused && styles.categoryCardFocused
                    ]}
                  >
                    <Text style={[
                      styles.categoryCardText,
                      isFocused && styles.categoryCardTextFocused
                    ]}>
                      {item.name}
                    </Text>
                    {isFocused && <View style={styles.focusIndicator} />}
                  </TouchableOpacity>
                );
              }}
            />
          </>
        ) : (
          <>
            <View style={styles.subHeader}>
              <TouchableOpacity
                onPress={handleBackToCategories}
                onFocus={() => setIsBackHovered(true)}
                onBlur={() => setIsBackHovered(false)}
                activeOpacity={0.8}
                style={[
                  styles.backBtn,
                  isBackHovered && styles.backBtnFocused
                ]}
              >
                <Text style={styles.backBtnText}>◀ Volver</Text>
              </TouchableOpacity>
              <Text style={styles.subHeaderTitle}>{selectedCategory.name}</Text>
            </View>

            {loadingMovies ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#E50914" />
                <Text style={styles.loadingText}>Buscando títulos...</Text>
              </View>
            ) : categoryMovies.length > 0 ? (
              <FlatList
                data={categoryMovies}
                keyExtractor={(item) => item.id}
                numColumns={Platform.isTV ? 4 : 3}
                key={Platform.isTV ? 'tv-grid' : 'phone-grid'} // Key change to force re-render on grid rebuild
                contentContainerStyle={styles.movieGridContent}
                renderItem={({ item }) => (
                  <View style={styles.movieCardWrapper}>
                    <MovieCard
                      movie={item}
                      onPress={handleMoviePress}
                    />
                  </View>
                )}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No hay títulos disponibles en esta categoría</Text>
              </View>
            )}
          </>
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
    fontSize: 22,
    fontWeight: '900',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#8c8c8c',
    marginTop: 12,
    fontSize: 14,
  },
  errorText: {
    color: '#E50914',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  gridContent: {
    paddingHorizontal: 10,
    paddingBottom: 40,
  },
  categoryCard: {
    flex: 1,
    height: 100,
    backgroundColor: '#141414',
    margin: 6,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222222',
  },
  categoryCardFocused: {
    backgroundColor: '#262626',
    borderColor: '#E50914',
    transform: [{ scale: 1.05 }],
  },
  categoryCardText: {
    color: '#e5e5e5',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  categoryCardTextFocused: {
    color: '#ffffff',
  },
  focusIndicator: {
    position: 'absolute',
    bottom: 6,
    width: 24,
    height: 3,
    backgroundColor: '#E50914',
    borderRadius: 1.5,
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
    marginBottom: 12,
  },
  backBtn: {
    backgroundColor: '#1c1c1c',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 16,
  },
  backBtnFocused: {
    backgroundColor: '#E50914',
  },
  backBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  subHeaderTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
  },
  movieGridContent: {
    paddingHorizontal: 10,
    paddingBottom: 40,
  },
  movieCardWrapper: {
    flex: 1,
    maxWidth: Platform.isTV ? '25%' : '33.3%',
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
