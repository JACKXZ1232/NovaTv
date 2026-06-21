import { supabase } from '../config/supabase';
import { Movie, Category } from '../types';

export const movieService = {
  // Obtener todas las películas
  async getMovies(): Promise<Movie[]> {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching movies:', error);
      throw error;
    }
    return data || [];
  },

  // Obtener la película destacada para el Banner hero
  async getFeaturedMovie(): Promise<Movie | null> {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .eq('is_featured', true)
      .limit(1);

    if (error) {
      console.error('Error fetching featured movie:', error);
      return null;
    }
    return data && data.length > 0 ? data[0] : null;
  },

  // Obtener categorías ordenadas
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
    return data || [];
  },

  // Obtener películas filtradas por una categoría específica
  async getMoviesByCategory(categoryId: string): Promise<Movie[]> {
    const { data, error } = await supabase
      .from('movie_categories')
      .select('movie_id, movies(*)')
      .eq('category_id', categoryId);

    if (error) {
      console.error('Error fetching movies by category:', error);
      throw error;
    }

    // Mapear la respuesta para extraer el objeto movie anidado
    if (data) {
      return data
        .map((item: any) => item.movies)
        .filter((movie: any) => movie !== null) as Movie[];
    }
    return [];
  },

  // Buscador en base de datos con debounce o por texto
  async searchMovies(query: string): Promise<Movie[]> {
    if (!query || query.trim() === '') return [];
    
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .ilike('title', `%${query}%`)
      .limit(30);

    if (error) {
      console.error('Error searching movies:', error);
      return [];
    }
    return data || [];
  },

  // Obtener películas recomendadas/relacionadas por género
  async getRelatedMovies(movieId: string, genres: string[]): Promise<Movie[]> {
    if (!genres || genres.length === 0) return [];
    
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .neq('id', movieId) // Excluir la película actual
      .overlaps('genre', genres) // Buscar coincidencia en array de géneros
      .limit(10);

    if (error) {
      console.error('Error fetching related movies:', error);
      return [];
    }
    return data || [];
  }
};
