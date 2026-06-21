import { SCRAPER_URL } from '../config/api';
import { Movie } from '../types';

export const extractorService = {
  /**
   * Ejecuta la lógica de fallback intentando extraer un link de reproducción directo
   * utilizando los tres links de embed disponibles en orden secuencial.
   */
  async getVideoUrl(movie: Movie): Promise<string | null> {
    const embedUrls = [
      movie.embed_url_1,
      movie.embed_url_2,
      movie.embed_url_3,
    ].filter((url): url is string => typeof url === 'string' && url.length > 0);

    for (const embedUrl of embedUrls) {
      try {
        console.log(`Intentando extraer streaming desde el embed: ${embedUrl}`);
        
        // Timeout controlado por controlador de abortos de 20 segundos por intento
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        const response = await fetch(`${SCRAPER_URL}/extract`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ url: embedUrl }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success && data.m3u8) {
          console.log(`¡Éxito! Stream .m3u8 detectado: ${data.m3u8}`);
          return data.m3u8;
        }
      } catch (err) {
        console.warn(`Extracción fallida para embed url ${embedUrl}:`, err);
        // Continua al siguiente URL de respaldo de la lista
        continue;
      }
    }

    console.error('La extracción en todos los proveedores web falló por completo.');
    return null;
  }
};
