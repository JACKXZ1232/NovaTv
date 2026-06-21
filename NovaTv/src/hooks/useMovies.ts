import { useState, useEffect } from 'react';
import { movieService } from '../services/movieService';
import { Movie, Category } from '../types';

export function useMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categorizedMovies, setCategorizedMovies] = useState<Record<string, Movie[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch general list, featured list, and category lists
      const [allMovies, featured, categoriesList] = await Promise.all([
        movieService.getMovies(),
        movieService.getFeaturedMovie(),
        movieService.getCategories()
      ]);

      setMovies(allMovies);
      setFeaturedMovie(featured || (allMovies.length > 0 ? allMovies[0] : null));
      setCategories(categoriesList);

      // Fetch movies for all retrieved categories
      const categorized: Record<string, Movie[]> = {};
      await Promise.all(
        categoriesList.map(async (cat) => {
          try {
            const list = await movieService.getMoviesByCategory(cat.id);
            categorized[cat.id] = list;
          } catch (e) {
            categorized[cat.id] = [];
          }
        })
      );

      setCategorizedMovies(categorized);
    } catch (e: any) {
      setError(e?.message || 'Error al conectar con la base de datos de NovaTv');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return {
    movies,
    featuredMovie,
    categories,
    categorizedMovies,
    loading,
    error,
    refresh: fetchAllData
  };
}
