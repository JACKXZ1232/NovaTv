import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { MovieCard } from './MovieCard';
import { Movie } from '../types';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  onMoviePress: (movie: Movie) => void;
}

export function MovieRow({ title, movies, onMoviePress }: MovieRowProps) {
  if (!movies || movies.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        data={movies}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <MovieCard 
            movie={item} 
            onPress={onMoviePress}
            hasPreferredFocus={false}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
  },
  title: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingHorizontal: 16,
    letterSpacing: 0.3,
  },
  listContent: {
    paddingHorizontal: 16,
  },
});
