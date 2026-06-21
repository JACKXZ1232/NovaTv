import { useState, useEffect, useCallback } from 'react';
import { extractorService } from '../services/extractorService';
import { Movie } from '../types';

export function useVideoExtractor(movie: Movie) {
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const startExtraction = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setStreamUrl(null);

      console.log(`Iniciando extracción para película: ${movie.title}`);
      const m3u8 = await extractorService.getVideoUrl(movie);

      if (m3u8) {
        setStreamUrl(m3u8);
      } else {
        setError('Película no disponible en este momento. Intenta más tarde.');
      }
    } catch (e: any) {
      setError(e?.message || 'Error de conexión con el agente extractor.');
    } finally {
      setLoading(false);
    }
  }, [movie]);

  useEffect(() => {
    startExtraction();
  }, [startExtraction]);

  return {
    streamUrl,
    loading,
    error,
    retry: startExtraction
  };
}
