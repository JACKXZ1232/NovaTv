import React from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  SafeAreaView 
} from 'react-native';
import { useFavorites } from '../hooks/useFavorites';
import { MovieCard } from '../components/MovieCard';
import { Movie } from '../types';

interface FavoritesScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
}

export function FavoritesScreen({ navigation }: FavoritesScreenProps) {
  const { favorites } = useFavorites();

  const handleMoviePress = (movie: Movie) => {
    navigation.navigate('Detail', { movie });
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Mi Lista Guardada</Text>
        
        {favorites.length > 0 ? (
          <FlatList
            data={favorites}
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
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📂</Text>
            <Text style={styles.emptyText}>Aún no has guardado ninguna película.</Text>
            <Text style={styles.subtext}>Presiona "+ Mi Lista" en tus películas favoritas para guardarlas aquí.</Text>
          </View>
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
    marginBottom: 16,
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
  emptyIcon: {
    fontSize: 48,
    marginBottom: 14,
  },
  emptyText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtext: {
    color: '#666666',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});
