export interface Movie {
  id: string;
  title: string;
  description: string | null;
  poster_url: string | null;
  backdrop_url: string | null;
  embed_url_1: string;
  embed_url_2: string | null;
  embed_url_3: string | null;
  trailer_url: string | null;
  genre: string[];
  year: number | null;
  duration_minutes: number | null;
  rating: string | null;
  is_featured: boolean;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  order_index: number;
}

export interface MovieCategory {
  movie_id: string;
  category_id: string;
}
