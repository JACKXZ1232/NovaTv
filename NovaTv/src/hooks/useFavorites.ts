import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Movie } from '../types';

const FAVORITES_KEY = 'novatv_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = async () => {
    try {
      const dataStr = await AsyncStorage.getItem(FAVORITES_KEY);
      if (dataStr) {
        setFavorites(JSON.parse(dataStr));
      }
    } catch (e) {
      console.error('Error loading favorites from AsyncStorage:', e);
    } finally {
      setLoading(false);
    }
  };

  const isFavorite = (movieId: string) => {
    return favorites.some(fav => fav.id === movieId);
  };

  const addFavorite = async (movie: Movie) => {
    try {
      if (isFavorite(movie.id)) return;
      const updated = [...favorites, movie];
      setFavorites(updated);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error adding favorite:', e);
    }
  };

  const removeFavorite = async (movieId: string) => {
    try {
      const updated = favorites.filter(fav => fav.id !== movieId);
      setFavorites(updated);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error removing favorite:', e);
    }
  };

  const toggleFavorite = async (movie: Movie) => {
    if (isFavorite(movie.id)) {
      await removeFavorite(movie.id);
    } else {
      await addFavorite(movie);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  return {
    favorites,
    loading,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    reload: loadFavorites
  };
}
