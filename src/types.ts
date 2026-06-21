export interface Movie {
  id: string;
  title: string;
  description: string;
  poster_url: string;
  backdrop_url: string;
  embed_url_1: string;
  embed_url_2?: string;
  embed_url_3?: string;
  trailer_url?: string;
  genre: string[];
  year: number;
  duration_minutes: number;
  rating: string;
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
