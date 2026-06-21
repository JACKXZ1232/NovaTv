import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Text, RefreshControl, SafeAreaView } from 'react-native';
import { useMovies } from '../hooks/useMovies';
import { useFavorites } from '../hooks/useFavorites';
import { HeroBanner } from '../components/HeroBanner';
import { MovieRow } from '../components/MovieRow';
import { LoadingScreen } from '../components/LoadingScreen';
import { Movie } from '../types';

interface HomeScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
}

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { movies, featuredMovie, categories, categorizedMovies, loading, error, refresh } = useMovies();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleMovieSelect = (movie: Movie) => {
    navigation.navigate('Detail', { movie });
  };

  const handlePlaySelect = (movie: Movie) => {
    navigation.navigate('Player', { movie });
  };

  if (loading) {
    return <LoadingScreen message="Cargando catálogo premium de NovaTv..." />;
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#E50914" />
        }
      >
        {/* Hero banner for the active featured movie */}
        {featuredMovie && (
          <HeroBanner
            movie={featuredMovie}
            onPlayPress={handlePlaySelect}
            onMyListPress={toggleFavorite}
            isInMyList={isFavorite(featuredMovie.id)}
          />
        )}

        {/* Error alert indicator bar */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* horizontal shelf arrays */}
        <View style={styles.rowsContainer}>
          {/* Favorites custom local shelf row */}
          {favorites.length > 0 && (
            <MovieRow
              title="Mi Lista Principal"
              movies={favorites}
              onMoviePress={handleMovieSelect}
            />
          )}

          {/* Database categorized shelves */}
          {categories.map((category) => {
            const list = categorizedMovies[category.id] || [];
            return (
              <MovieRow
                key={category.id}
                title={category.name}
                movies={list}
                onMoviePress={handleMovieSelect}
              />
            );
          })}
        </View>
        <View style={styles.spacingFooter} />
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
  errorBanner: {
    backgroundColor: '#E50914',
    padding: 10,
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rowsContainer: {
    marginTop: 10,
    paddingBottom: 24,
  },
  spacingFooter: {
    height: 60,
  },
});
