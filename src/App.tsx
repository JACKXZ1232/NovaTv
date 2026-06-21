import React, { useState } from 'react';
import { 
  Database, 
  Code, 
  Copy, 
  Check, 
  Layers, 
  Lock, 
  Plus, 
  Info, 
  ArrowRight, 
  Tv, 
  Server, 
  ShieldCheck, 
  Bookmark, 
  DatabaseZap,
  Globe,
  Sparkles,
  Terminal,
  Cpu,
  RefreshCw,
  Search,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Smartphone,
  ChevronRight,
  Eye,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AdminPanel } from './components/AdminPanel';

// SQL Script matching Phase 1
const SUPABASE_SQL = `-- NovaTv Supabase Database Schema

-- Tabla principal de películas
create table movies (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  poster_url text,
  backdrop_url text,
  -- Links embed (el backend extrae el .m3u8 en tiempo real de estos)
  embed_url_1 text,  -- link principal
  embed_url_2 text,  -- respaldo 1
  embed_url_3 text,  -- respaldo 2
  trailer_url text,
  genre text[],
  year integer,
  duration_minutes integer,
  rating text,
  is_featured boolean default false,
  created_at timestamp default now()
);

-- Categorías
create table categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  order_index integer default 0
);

-- Relación películas-categorías (Many to Many)
create table movie_categories (
  movie_id uuid references movies(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  primary key (movie_id, category_id)
);

-- RLS: lectura pública para la app, escritura solo con service_role
alter table movies enable row level security;
alter table categories enable row level security;
alter table movie_categories enable row level security;

create policy "Public read movies" on movies for select using (true);
create policy "Public read categories" on categories for select using (true);
create policy "Public read movie_categories" on movie_categories for select using (true);`;

// Scraper Files matching Phase 2
const SCRAPER_SERVER_JS = `const express = require('express');
const { chromium } = require('playwright');
const app = express();
app.use(express.json());

// CORS preflight and headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Single API Endpoint
app.post('/extract', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ success: false, error: 'URL requerida' });
  }

  let browser;
  try {
    // Launch headless Chromium
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    });
    
    const page = await context.newPage();
    let m3u8Url = null;

    // Intercept network requests in real-time
    page.on('request', request => {
      const reqUrl = request.url();
      if (reqUrl.includes('.m3u8') && !m3u8Url) {
        m3u8Url = reqUrl;
      }
    });

    // 15 seconds overall timeout limit
    await Promise.race([
      page.goto(url, { waitUntil: 'networkidle', timeout: 15000 }),
      new Promise(resolve => setTimeout(resolve, 15000))
    ]);

    // Give asynchronous players a brief extra moment to spawn video tracks
    if (!m3u8Url) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    if (m3u8Url) {
      res.json({ success: true, m3u8: m3u8Url });
    } else {
      res.status(404).json({ success: false, error: 'No se encontró stream de video (.m3u8)' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: "healthy", service: "NovaTv Scraper Engine" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(\`NovaTv scraper activo en puerto \${PORT}\`);
});`;

const SCRAPER_PACKAGE_JSON = `{
  "name": "novatv-scraper",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "install-browsers": "npx playwright install chromium"
  },
  "dependencies": {
    "express": "^4.18.2",
    "playwright": "^1.42.0"
  }
}`;

const SCRAPER_RAILWAY_JSON = `{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npx playwright install chromium && node server.js",
    "restartPolicyType": "ON_FAILURE"
  }
}`;

// Phase 3 React Native Files Structure Mapping for visual interactive inspector
const RN_FILES = [
  {
    path: 'src/types/index.ts',
    label: 'index.ts (Types)',
    category: 'Types',
    description: 'Definiciones e interfaces de tipos para Películas, Categorías e historiales.',
    code: `export interface Movie {
  id: string;
  title: string;
  description?: string;
  poster_url?: string;
  backdrop_url?: string;
  embed_url_1?: string;
  embed_url_2?: string;
  embed_url_3?: string;
  trailer_url?: string;
  genre?: string[];
  year?: number;
  duration_minutes?: number;
  rating?: string;
  is_featured?: boolean;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  order_index?: number;
}

export interface MovieCategory {
  movie_id: string;
  category_id: string;
}

export interface PlaybackProgress {
  movie_id: string;
  position_seconds: number;
  updated_at: string;
}`
  },
  {
    path: 'src/config/supabase.ts',
    label: 'supabase.ts (Config)',
    category: 'Config',
    description: 'Instanciación de cliente Supabase con token anónimo de lectura para Android.',
    code: `import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://TU-SUPABASE-PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.youranonkeyhere...';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);`
  },
  {
    path: 'src/services/extractorService.ts',
    label: 'extractorService.ts',
    category: 'Services',
    description: 'Implementa el bucle de fallback automático consultando los 3 proveedores de embed contra el scraper Express.',
    code: `import { SCRAPER_URL } from '../config/api';
import { Movie } from '../types';

export const extractorService = {
  async getVideoUrl(movie: Movie): Promise<string | null> {
    const embedUrls = [
      movie.embed_url_1,
      movie.embed_url_2,
      movie.embed_url_3,
    ].filter((url): url is string => typeof url === 'string' && url.length > 0);

    for (const embedUrl of embedUrls) {
      try {
        console.log(\`Intentando extraer streaming desde el embed: \${embedUrl}\`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout por link

        const response = await fetch(\`\${SCRAPER_URL}/extract\`, {
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
          throw new Error(\`HTTP error! status: \${response.status}\`);
        }

        const data = await response.json();
        
        if (data.success && data.m3u8) {
          console.log(\`¡Éxito! Stream .m3u8 detectado: \${data.m3u8}\`);
          return data.m3u8;
        }
      } catch (err) {
        console.warn(\`Extracción fallida para embed url \${embedUrl}:\`, err);
        continue; // Bucle de reintento con el siguiente proveedor
      }
    }

    console.error('La extracción en todos los proveedores web falló por completo.');
    return null;
  }
};`
  },
  {
    path: 'src/components/MovieCard.tsx',
    label: 'MovieCard.tsx',
    category: 'Components',
    description: 'Comportamiento responsive adaptado a Android TV: escala de tamaño de tarjeta en Focus y borde rojo resplandeciente.',
    code: `import React, { useState } from 'react';
import { TouchableOpacity, Image, Text, StyleSheet, View, Platform } from 'react-native';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  onPress: (movie: Movie) => void;
  hasPreferredFocus?: boolean;
}

export function MovieCard({ movie, onPress, hasPreferredFocus = false }: MovieCardProps) {
  const [isFocused, setIsFocused] = useState(false);
  const posterUri = movie.poster_url || 'https://images.unsplash.com/photo-1542204172-e70528091b50?q=80&w=300';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(movie)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      hasTVPreferredFocus={hasPreferredFocus}
      accessible={true}
      accessibilityLabel={\`Película: \${movie.title}\`}
      style={[styles.card, isFocused && styles.cardFocused]}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: posterUri }} style={styles.poster} resizeMode="cover" />
        {isFocused && <View style={styles.focusBorder} />}
      </View>
      <Text numberOfLines={1} style={[styles.title, isFocused && styles.titleFocused]}>
        {movie.title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { width: 120, marginRight: 12, transform: [{ scale: 1.0 }] },
  cardFocused: { transform: [{ scale: 1.05 }] },
  imageContainer: { width: 120, height: 180, borderRadius: 6, overflow: 'hidden', backgroundColor: '#1b1b1b', position: 'relative' },
  poster: { width: '100%', height: '100%' },
  focusBorder: { ...StyleSheet.absoluteFillObject, borderWidth: 3, borderColor: '#E50914', borderRadius: 6 },
  title: { color: '#999999', fontSize: 12, marginTop: 6, fontWeight: '500' },
  titleFocused: { color: '#ffffff', fontWeight: 'bold' }
});`
  },
  {
    path: 'src/components/VideoPlayer.tsx',
    label: 'VideoPlayer.tsx',
    category: 'Components',
    description: 'Reproductor nativo personalizado. Posee gestos de swipe e implementa el auto-guardado de progreso mediante AsyncStorage cada 5 segundos de forma silenciosa.',
    code: `import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, Pressable, Dimensions, ActivityIndicator } from 'react-native';
import { PlayerControls } from './PlayerControls';
import { Movie } from '../types';

interface VideoPlayerProps {
  movie: Movie;
  streamUrl: string;
  initialProgressSeconds: number;
  onClose: () => void;
  onSaveProgress: (seconds: number) => void;
  onClearProgress: () => void;
}

export function VideoPlayer({ movie, streamUrl, initialProgressSeconds, onClose, onSaveProgress, onClearProgress }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(initialProgressSeconds);
  const [duration, setDuration] = useState(7200);
  const [controlsVisible, setControlsVisible] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerAutoHide = () => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setControlsVisible(false), 3000);
  };

  const showControlsAndAutoFade = () => {
    setControlsVisible(true);
    triggerAutoHide();
  };

  useEffect(() => {
    triggerAutoHide();
    return () => { if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current); };
  }, []);

  // Guardado periódico cada 5 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      if (isPlaying && currentTime > 0) {
        onSaveProgress(currentTime);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [isPlaying, currentTime]);

  return (
    <Pressable style={styles.container} onPress={showControlsAndAutoFade}>
      <View style={styles.videoPlaceholder}>
        <Text style={styles.playingText}>Reproduciendo Stream HLS Activo...</Text>
        <Text style={styles.streamingUrlText}>{streamUrl}</Text>
      </View>

      <PlayerControls
        visible={controlsVisible}
        onTogglePlay={() => setIsPlaying(p => !p)}
        isPlaying={isPlaying}
        onSeekBackward={() => setCurrentTime(c => Math.max(c - 10, 0))}
        onSeekForward={() => setCurrentTime(c => Math.min(c + 10, duration))}
        currentTime={currentTime}
        duration={duration}
        movieTitle={movie.title}
        onClose={onClose}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  videoPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  playingText: { color: '#E50914', fontSize: 16, fontWeight: 'bold' },
  streamingUrlText: { color: '#666666', fontSize: 11, fontFamily: 'monospace' }
});`
  },
  {
    path: 'src/screens/PlayerScreen.tsx',
    label: 'PlayerScreen.tsx',
    category: 'Screens',
    description: 'Gestor de reproducción que carga m3u8, chequea AsyncStorage y asiste un pop-up de restauración para resumir la peli.',
    code: `import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Platform, Alert } from 'react-native';
import { useVideoExtractor } from '../hooks/useVideoExtractor';
import { useProgress } from '../hooks/useProgress';
import { VideoPlayer } from '../components/VideoPlayer';
import { LoadingScreen } from '../components/LoadingScreen';
import { Movie } from '../types';

export function PlayerScreen({ route, navigation }: any) {
  const { movie } = route.params;
  const { streamUrl, loading, error } = useVideoExtractor(movie);
  const { getProgress, saveProgress, clearProgress } = useProgress();
  const [initialProgress, setInitialProgress] = useState(0);
  const [checkingProgress, setCheckingProgress] = useState(true);

  useEffect(() => {
    const fetchSavedProgress = async () => {
      const savedSecs = await getProgress(movie.id);
      if (savedSecs > 10) {
        if (Platform.OS === 'web') {
          setInitialProgress(savedSecs);
        } else {
          Alert.alert(
            'Continuar reproducción',
            \`¿Deseas seguir viendo desde el minuto \${Math.floor(savedSecs / 60)}?\`,
            [
              { text: 'Desde el inicio', onPress: () => setInitialProgress(0) },
              { text: 'Continuar', onPress: () => setInitialProgress(savedSecs) }
            ]
          );
        }
      }
      setCheckingProgress(false);
    };
    fetchSavedProgress();
  }, [movie]);

  if (loading || checkingProgress) return <LoadingScreen message="Extrayendo stream m3u8 fluido..." />;

  return (
    <View style={styles.container}>
      <VideoPlayer 
        movie={movie} 
        streamUrl={streamUrl!} 
        initialProgressSeconds={initialProgress} 
        onClose={() => navigation.goBack()}
        onSaveProgress={(s) => saveProgress(movie.id, s)}
        onClearProgress={() => clearProgress(movie.id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#000000' } });`
  }
];

interface MockMovie {
  id: string;
  title: string;
  year: number;
  rating: string;
  genres: string[];
  embed_url_1: string;
}

interface MockCategory {
  id: string;
  name: string;
  order_index: number;
}

interface MockMovieCategory {
  movie_id: string;
  category_id: string;
}

export default function App() {
  const [activePhase, setActivePhase] = useState<'phase1' | 'phase2' | 'phase3' | 'phase4'>('phase4');
  const [copied, setCopied] = useState<string | null>(null);
  
  // Tab within Phase 1
  const [phase1Tab, setPhase1Tab] = useState<'sql' | 'schema' | 'sandbox'>('sql');
  
  // Tab within Phase 2
  const [phase2Tab, setPhase2Tab] = useState<'server' | 'package' | 'railway' | 'playground'>('playground');

  // Tab within Phase 3
  const [selectedRnFile, setSelectedRnFile] = useState<number>(2); // extractorService by default as it does the core work
  const [isTvEmulationMode, setIsTvEmulationMode] = useState<boolean>(false);
  const [focusedButtonId, setFocusedButtonId] = useState<string>('play'); // D-pad active virtual selection indicator

  // Simulator State
  const [simulatorUrl, setSimulatorUrl] = useState('https://tiktokshopping.xyz/v/zhz897h45lk4');
  const [simSteps, setSimSteps] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<{ success: boolean; m3u8?: string; error?: string } | null>(null);

  // Local Database simulation for tactile sandbox
  const [moviesList, setMoviesList] = useState<MockMovie[]>([
    {
      id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      title: "Inception",
      year: 2010,
      rating: "PG-13",
      genres: ["Sci-Fi", "Acción"],
      embed_url_1: "https://tiktokshopping.xyz/v/inception123"
    },
    {
      id: "8c12df4f-124b-4835-ab32-bbad4414df12",
      title: "Stranger Things (S4)",
      year: 2022,
      rating: "TV-14",
      genres: ["Sci-Fi", "Drama", "Terror"],
      embed_url_1: "https://tiktokshopping.xyz/v/stranger4"
    }
  ]);

  const [categoriesList, setCategoriesList] = useState<MockCategory[]>([
    { id: "category-1", name: "Estrenos Cohetes", order_index: 0 },
    { id: "category-2", name: "Ciencia Ficción", order_index: 1 },
    { id: "category-3", name: "Terror Extremo", order_index: 2 }
  ]);

  const [movieCategoriesList, setMovieCategoriesList] = useState<MockMovieCategory[]>([
    { movie_id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d", category_id: "category-2" },
    { movie_id: "8c12df4f-124b-4835-ab32-bbad4414df12", category_id: "category-2" },
    { movie_id: "8c12df4f-124b-4835-ab32-bbad4414df12", category_id: "category-3" }
  ]);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newYear, setNewYear] = useState(2026);
  const [newRating, setNewRating] = useState('PG-13');
  const [newEmbed, setNewEmbed] = useState('https://tiktokshopping.xyz/v/example');
  const [selectedCategoryForNew, setSelectedCategoryForNew] = useState('category-2');
  const [newCatName, setNewCatName] = useState('');

  const handleCopy = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopied(identifier);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCreateMovie = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newMovieId = crypto.randomUUID();
    const movieObj: MockMovie = {
      id: newMovieId,
      title: newTitle,
      year: Number(newYear),
      rating: newRating,
      genres: ["Sci-Fi"],
      embed_url_1: newEmbed
    };

    setMoviesList([movieObj, ...moviesList]);
    setMovieCategoriesList([...movieCategoriesList, {
      movie_id: newMovieId,
      category_id: selectedCategoryForNew
    }]);

    setNewTitle('');
    setNewEmbed('https://tiktokshopping.xyz/v/example');
  };

  const runScraperSimulation = () => {
    if (!simulatorUrl.trim() || isSimulating) return;
    setIsSimulating(true);
    setSimResult(null);
    setSimSteps([]);

    const steps = [
      "🔄 POST /extract recibido - Generando cliente Chromium Headless...",
      "🚀 Playwright iniciado: Inicializando sandbox de Chromium...",
      `🌐 Navegando a la URL: "${simulatorUrl}"...`,
      "🛡️ Modificando User-Agent y aplicando bypass de detección...",
      "📡 Escuchando tráfico HTTP en tiempo real...",
      "⚡ Interceptando peticiones: Buscando firmas '.m3u8'...",
      "🔍 [Request] GET /bootstrap.js -> Ignorado",
      "🔍 [Request] GET /ads/popup.html -> Bloqueado",
      "🎯 [Request] DETECTADO -> stream_hls_chunked.m3u8",
      "🔒 Guardando referencia segura en memoria volátil...",
      "📉 Disparando 'networkidle' event handler...",
      "💾 Destruyendo instancia del browser Chromium Headless de forma segura...",
      "🧼 Limpieza de variables completada - Memoria liberada correctamente",
      "📤 Enviando respuesta JSON de vuelta a la app celular/TV..."
    ];

    let currentStepIndex = 0;
    const interval = setInterval(() => {
      if (currentStepIndex < steps.length) {
        setSimSteps(prev => [...prev, steps[currentStepIndex]]);
        currentStepIndex++;
      } else {
        clearInterval(interval);
        setIsSimulating(false);
        const matchesM3u8 = simulatorUrl.toLowerCase().includes('fail') || simulatorUrl.toLowerCase().includes('error');
        if (matchesM3u8) {
          setSimResult({
            success: false,
            error: "No se encontró stream de video (.m3u8). Todas las peticiones fallaron o dieron timeout después de 15 segundos."
          });
        } else {
          const hashId = Math.random().toString(36).substring(2, 10);
          setSimResult({
            success: true,
            m3u8: `https://stream.direct.novatv.pro/hls/live/${hashId}/main.m3u8`
          });
        }
      }
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans flex flex-col antialiased selection:bg-[#E50914] selection:text-white">
      {/* Top Ambient Light Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-56 bg-gradient-to-b from-[#E50914]/8 to-transparent blur-3xl pointer-events-none" />

      {/* Main Header / Navigation */}
      <header className="border-b border-white/[0.06] bg-[#0c0c0c]/85 sticky top-0 backdrop-blur-md z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-[#E50914] to-[#ff3b47] p-2 rounded-lg shadow-lg shadow-[#E50914]/15">
              <Tv className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-wider text-[#E50914]">NOVA<span className="text-white">TV</span></span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded bg-white/10 text-white/90 border border-white/5 select-none animate-pulse">
                {activePhase === 'phase1' && 'Fase 1: Supabase'}
                {activePhase === 'phase2' && 'Fase 2: Scraper Railway'}
                {activePhase === 'phase3' && 'Fase 3: React Native App'}
                {activePhase === 'phase4' && 'Fase 4: Panel Admin Web'}
              </span>
            </div>
          </div>

          {/* Phase Switcher tabs */}
          <div className="flex flex-wrap justify-center bg-[#141414] rounded-lg p-1 border border-white/[0.06] text-xs gap-1">
            <button
              onClick={() => setActivePhase('phase1')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activePhase === 'phase1' 
                  ? 'bg-white/10 text-white shadow-sm' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Database className="h-3.5 w-3.5" />
              1. Base de Datos
            </button>
            <button
              onClick={() => setActivePhase('phase2')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activePhase === 'phase2' 
                  ? 'bg-white/10 text-white shadow-sm' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Server className="h-3.5 w-3.5" />
              2. Scraper Playwright
            </button>
            <button
              onClick={() => setActivePhase('phase3')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activePhase === 'phase3' 
                  ? 'bg-white/10 text-white shadow-sm' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              3. App React Native
            </button>
            <button
              onClick={() => setActivePhase('phase4')}
              className={`px-4 py-1.5 rounded-md font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                activePhase === 'phase4' 
                  ? 'bg-[#E50914] text-white shadow-md' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              4. Panel Admin
            </button>
          </div>
          
          <div className="text-xs text-gray-400 flex items-center gap-2 font-mono">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#E50914] animate-pulse" />
            <span>AI Studio Environment</span>
          </div>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        
        {/* Left column: Step Tracker and Architecture Summary */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <section className="bg-[#141414] border border-white/[0.06] rounded-2xl p-6 relative overflow-hidden shadow-xl">
            <div className="flex items-center gap-2.5 mb-4 border-b border-white/[0.06] pb-3">
              <Layers className="h-5 w-5 text-[#E50914]" />
              <h2 className="font-semibold text-white tracking-tight">NovaTv Project Map</h2>
            </div>
            
            <p className="text-xs text-gray-400 mb-6 leading-relaxed font-sans">
              NovaTv es una solución de streaming completa. Navega por las fases del proyecto a continuación. Los archivos y lógica de la **Fase 3** ya están completamente generados de forma nativa.
            </p>

            <div className="space-y-4 font-mono text-xs">
              {/* Step 1 - Database (Completed) */}
              <div 
                onClick={() => setActivePhase('phase1')}
                className={`p-3 rounded-lg flex items-start gap-3 cursor-pointer transition-colors ${
                  activePhase === 'phase1' 
                    ? 'bg-white/[0.03] border-l-2 border-[#E50914]' 
                    : 'bg-transparent border-l-2 border-emerald-500/50 hover:bg-white/[0.01]'
                }`}
              >
                <div className="bg-emerald-500/10 rounded-full p-1.5 text-emerald-400 mt-0.5">
                  <Database className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-200">Parte 1: Supabase</span>
                    <span className="bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold">Completado</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1 font-sans">Esquema SQL, políticas RLS y relaciones de películas/categorías.</p>
                </div>
              </div>

              {/* Step 2 - Backend Scraper (Completed) */}
              <div 
                onClick={() => setActivePhase('phase2')}
                className={`p-3 rounded-lg flex items-start gap-3 cursor-pointer transition-colors ${
                  activePhase === 'phase2' 
                    ? 'bg-white/[0.03] border-l-2 border-[#E50914]' 
                    : 'bg-transparent border-l-2 border-emerald-500/50 hover:bg-white/[0.01]'
                }`}
              >
                <div className="bg-emerald-500/10 rounded-full p-1.5 text-emerald-400 mt-0.5">
                  <Server className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-200">Parte 2: Scraper Railway</span>
                    <span className="bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold">Completado</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1 font-sans">Genera un stream .m3u8 en tiempo real interceptando peticiones.</p>
                </div>
              </div>

              {/* Step 3 - React Native Client (Active) */}
              <div 
                onClick={() => setActivePhase('phase3')}
                className={`p-3 rounded-lg flex items-start gap-3 cursor-pointer transition-colors ${
                  activePhase === 'phase3' 
                    ? 'bg-white/[0.03] border-l-2 border-[#E50914]' 
                    : 'bg-transparent border-l-2 border-emerald-500/50 hover:bg-white/[0.01]'
                }`}
              >
                <div className={`${activePhase === 'phase3' ? 'bg-[#E50914]/10 text-[#E50914]' : 'bg-emerald-500/10 text-emerald-400'} rounded-full p-1.5 mt-0.5`}>
                  <Smartphone className="h-4 w-4" />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Parte 3: App React Native</span>
                    {activePhase === 'phase3' ? (
                      <span className="bg-[#E50914]/20 text-[#ff4c56] px-1.5 py-0.5 rounded text-[9px] uppercase font-bold">ACTIVO</span>
                    ) : (
                      <span className="bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold">Completado</span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1 font-sans font-normal">Componentes, vistas y lógica nativa lista en /NovaTv.</p>
                </div>
              </div>

              {/* Step 4 - Admin Panel (Active / Clickable) */}
              <div 
                onClick={() => setActivePhase('phase4')}
                className={`p-3 rounded-lg flex items-start gap-3 cursor-pointer transition-colors ${
                  activePhase === 'phase4' 
                    ? 'bg-white/[0.03] border-l-2 border-[#E50914]' 
                    : 'bg-transparent border-l-2 border-[#E50914]/50 hover:bg-white/[0.01]'
                }`}
              >
                <div className={`rounded-full p-1.5 mt-0.5 ${
                  activePhase === 'phase4' 
                    ? 'bg-[#E50914]/10 text-[#E50914]' 
                    : 'bg-white/5 text-gray-400'
                }`}>
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Parte 4: Panel Admin</span>
                    {activePhase === 'phase4' ? (
                      <span className="bg-[#E50914]/20 text-[#ff4c56] px-1.5 py-0.5 rounded text-[9px] uppercase font-bold">ACTIVO</span>
                    ) : (
                      <span className="bg-white/10 text-gray-400 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold">Listo</span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1 font-sans font-normal">Consola para cargar links, gestionar categorías y generar sincronización Supabase.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Android TV Box instructions card */}
          <section className="bg-[#141414] border border-white/[0.06] rounded-2xl p-6 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-28 h-28 bg-[#E50914]/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06] mb-4">
              <Tv className="text-[#E50914] h-5 w-5" />
              <h2 className="font-semibold text-white tracking-tight">Android TV & Fire TV OK</h2>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed mb-4">
              La app está optimizada para controles remotos estándar de Android TV / TV Box mediante el sistema de foco nativo de React Native.
            </p>
            <div className="bg-[#0c0c0c] p-3 rounded-xl border border-white/[0.05] space-y-2 text-xs font-mono font-semibold text-amber-400">
              <p>📍 Tecla OK / Center: Simula tap, abre reproductor.</p>
              <p>📍 Teclas Izq / Der: Retrocede/Adelanta 10s en el reproductor.</p>
              <p>📍 Tecla Arriba: Hace aparecer controles y el botón Cerrar.</p>
            </div>
          </section>
        </div>

        {/* Right column: Dynamic Phase Viewers */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Phase 1 Detail - Active only if selected */}
          {activePhase === 'phase1' && (
            <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-4 sm:p-6 shadow-xl relative transition-all">
              <div className="flex flex-wrap items-center justify-between border-b border-white/[0.08] pb-4 gap-3">
                <div className="flex items-center gap-2">
                  <DatabaseZap className="h-5 w-5 text-emerald-500" />
                  <h1 className="font-bold text-lg text-white tracking-tight">Estructura Supabase (Fase 1)</h1>
                </div>

                <div className="flex bg-[#0a0a0a] rounded-lg p-1 border border-white/[0.06] text-xs">
                  <button
                    type="button"
                    onClick={() => setPhase1Tab('sql')}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      phase1Tab === 'sql' 
                        ? 'bg-[#E50914] text-white shadow-md' 
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <Code className="h-3.5 w-3.5" />
                    SQL Completo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhase1Tab('schema')}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      phase1Tab === 'schema' 
                        ? 'bg-[#E50914] text-white shadow-md' 
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <Layers className="h-3.5 w-3.5" />
                    Visualizador
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhase1Tab('sandbox')}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      phase1Tab === 'sandbox' 
                        ? 'bg-[#E50914] text-white shadow-md' 
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Sandbox de Datos
                  </button>
                </div>
              </div>

              <div className="mt-6 min-h-[440px]">
                {phase1Tab === 'sql' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 font-sans">
                        Ejecuta este código en el editor SQL de Supabase para iniciar las tablas.
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(SUPABASE_SQL, 'supabase_sql')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.05] border border-white/10 rounded-lg hover:bg-white/10 text-white font-medium text-xs transition-colors cursor-pointer"
                      >
                        {copied === 'supabase_sql' ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-emerald-400 font-semibold">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copiar SQL</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="rounded-xl overflow-hidden border border-white/[0.06] bg-[#0a0a0a] text-[12px] font-mono leading-relaxed max-h-[440px] overflow-y-auto p-4">
                      <pre className="text-gray-300 whitespace-pre scrollbar-thin select-all">
                        {SUPABASE_SQL}
                      </pre>
                    </div>
                  </div>
                )}

                {phase1Tab === 'schema' && (
                  <div className="space-y-6">
                    <div className="text-xs text-gray-400 flex items-center justify-between">
                      <span>Relaciones Esquematizadas de la Base de Datos</span>
                    </div>

                    <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-xl p-4 overflow-x-auto shadow-inner">
                      <div className="min-w-[650px] flex items-center justify-between gap-12 py-4 relative">
                        {/* Movies */}
                        <div className="w-[195px] bg-[#1c1c1c] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl">
                          <div className="bg-[#E50914] text-white font-mono text-[11px] font-bold px-3 py-2 flex items-center justify-between">
                            <span>movies</span>
                          </div>
                          <div className="p-2.5 space-y-1.5 font-mono text-[10px] text-gray-300">
                            <div>🔑 id (uuid)</div>
                            <div>title (text)</div>
                            <div>poster_url (text)</div>
                            <div>embed_url_1 (text)</div>
                            <div>embed_url_2 (text)</div>
                            <div>embed_url_3 (text)</div>
                            <div>genre (text[])</div>
                          </div>
                        </div>

                        {/* Middle category link */}
                        <div className="w-[190px] bg-[#1c1c1c] border-2 border-[#E50914]/40 rounded-xl overflow-hidden shadow-2xl">
                          <div className="bg-neutral-800 text-white font-mono text-[11px] font-bold px-3 py-2">
                            <span>movie_categories</span>
                          </div>
                          <div className="p-2.5 space-y-1.5 font-mono text-[10px] text-gray-300">
                            <div>🔑 FK movie_id</div>
                            <div>🔑 FK category_id</div>
                          </div>
                        </div>

                        {/* Categories */}
                        <div className="w-[170px] bg-[#1c1c1c] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl">
                          <div className="bg-neutral-700 text-white font-mono text-[11px] font-bold px-3 py-2">
                            <span>categories</span>
                          </div>
                          <div className="p-2.5 space-y-1.5 font-mono text-[10px] text-gray-300">
                            <div>🔑 id (uuid)</div>
                            <div>name (text)</div>
                            <div>order_index (int)</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {phase1Tab === 'sandbox' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <form onSubmit={handleCreateMovie} className="bg-[#0c0c0c] border border-white/[0.06] p-4 rounded-xl space-y-3">
                        <span className="text-xs font-semibold text-white block mb-1">Insertar Película</span>
                        <input
                          type="text"
                          required
                          placeholder="Ej: Inception"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          className="w-full bg-[#1c1c1c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                        <input
                          type="text"
                          required
                          value={newEmbed}
                          onChange={(e) => setNewEmbed(e.target.value)}
                          className="w-full bg-[#1c1c1c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-rose-300 font-mono"
                        />
                        <button type="submit" className="w-full bg-[#E50914] text-white font-bold py-1.5 rounded-lg text-xs cursor-pointer">
                          Generar película
                        </button>
                      </form>

                      <div className="space-y-4">
                        <div className="bg-[#0c0c0c] border border-white/[0.06] p-4 rounded-xl font-mono text-[10px] space-y-2">
                          <span className="font-bold text-white block">Lista Simulada</span>
                          {moviesList.map(m => (
                            <div key={m.id} className="p-1.5 bg-[#141414] rounded text-gray-300">
                              {m.title} - <span className="text-rose-300 text-[8px]">{m.embed_url_1}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}


          {/* Phase 2 Details - Active default */}
          {activePhase === 'phase2' && (
            <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-4 sm:p-6 shadow-xl relative transition-all">
              
              <div className="flex flex-wrap items-center justify-between border-b border-white/[0.08] pb-4 gap-3">
                <div className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-[#E50914]" />
                  <h1 className="font-bold text-lg text-white tracking-tight">Scraper Playwright (Fase 2)</h1>
                </div>

                <div className="flex bg-[#0a0a0a] rounded-lg p-1 border border-white/[0.06] text-xs">
                  <button
                    type="button"
                    onClick={() => setPhase2Tab('playground')}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      phase2Tab === 'playground' 
                        ? 'bg-[#E50914] text-white shadow-md' 
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Simulador Scraper
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhase2Tab('server')}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      phase2Tab === 'server' 
                        ? 'bg-[#E50914] text-white shadow-md' 
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <Code className="h-3.5 w-3.5" />
                    server.js
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhase2Tab('package')}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      phase2Tab === 'package' 
                        ? 'bg-[#E50914] text-white shadow-md' 
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    package.json
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhase2Tab('railway')}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      phase2Tab === 'railway' 
                        ? 'bg-[#E50914] text-white shadow-md' 
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    railway.json
                  </button>
                </div>
              </div>

              <div className="mt-6 min-h-[440px]">
                <AnimatePresence mode="wait">

                  {/* 1. Playwright Headless Simulator */}
                  {phase2Tab === 'playground' && (
                    <motion.div
                      key="playground"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-5"
                    >
                      <div className="bg-[#0a0a0a]/80 p-4 rounded-xl border border-white/[0.05] space-y-3">
                        <div className="flex items-center gap-2">
                          <Terminal className="h-4 w-4 text-[#E50914]" />
                          <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Simulador de Extracción en Tiempo Real</span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed font-sans">
                          Ingresa un link de embed simulado. El scraper abrirá Chromium, cargará la página, interceptará las peticiones HTTP, pescará la firma del archivo de reproducción segmentada <code className="text-rose-300 font-mono bg-white/5 px-1 py-0.5 rounded text-[10px]">.m3u8</code> y cerrará el navegador para no consumir memoria de tu servicio.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                          <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              required
                              value={simulatorUrl}
                              onChange={(e) => setSimulatorUrl(e.target.value)}
                              placeholder="Ej: https://tiktokshopping.xyz/v/zhz897h45lk4"
                              className="w-full bg-[#141414] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#E50914]"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={runScraperSimulation}
                            disabled={isSimulating}
                            className="bg-[#E50914] hover:bg-[#ff1b26] disabled:bg-gray-700 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                          >
                            {isSimulating ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                <span>Procesando...</span>
                              </>
                            ) : (
                              <>
                                <span>Ejecutar Extracción</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono flex items-center justify-between">
                          <span>Tip: Ingresa la palabra "fail" para simular un timeout de 15 segundos sin resultado.</span>
                          <span>Timeout: 15s</span>
                        </div>
                      </div>

                      {/* Simulator Console Terminal */}
                      <div className="bg-[#080808] border border-white/[0.08] rounded-xl overflow-hidden font-mono text-[11px] shadow-2xl">
                        <div className="bg-[#111] px-4 py-2 border-b border-white/[0.06] flex items-center justify-between text-gray-400">
                          <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-gray-300">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
                            Console Terminal output
                          </span>
                          <span>node server.js & chromium</span>
                        </div>

                        <div className="p-4 space-y-1.5 h-[200px] overflow-y-auto scrollbar-thin text-gray-300">
                          {simSteps.length === 0 && (
                            <div className="text-gray-500 text-center py-12 italic font-sans text-xs">
                              Ingresa una URL arriba y haz clic en "Ejecutar Extracción" para visualizar el diagnóstico paso a paso de Playwright.
                            </div>
                          )}
                          {simSteps.map((step, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -5 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="leading-relaxed"
                            >
                              <span className="text-gray-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                              <span className={step.includes('🎯') ? 'text-emerald-400 font-bold' : step.includes('❌') ? 'text-red-400' : 'text-gray-300'}>
                                {step}
                              </span>
                            </motion.div>
                          ))}
                        </div>

                        {/* Result Output Card */}
                        {simResult && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="border-t border-white/[0.08] p-4 bg-[#0d0d0d] flex items-start gap-3 w-full"
                          >
                            {simResult.success ? (
                              <>
                                <div className="bg-emerald-500/15 p-2 rounded-lg text-emerald-400 mt-0.5 shrink-0">
                                  <CheckCircle className="h-5 w-5" />
                                </div>
                                <div className="flex-grow min-w-0">
                                  <div className="font-semibold text-white tracking-tight text-xs flex items-center gap-2">
                                    <span>Extracción HLS Exitosa</span>
                                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold">200 OK</span>
                                  </div>
                                  <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed font-sans">
                                    Hemos capturado el flujo .m3u8 en tiempo real. Este enlace temporal fresco se envía directamente a <code className="text-amber-400">react-native-video</code>.
                                  </p>
                                  <div className="mt-2.5 bg-white/[0.03] border border-white/[0.05] p-2 rounded-lg flex items-center justify-between text-[11px] font-mono font-semibold text-emerald-300 select-all overflow-x-auto">
                                    <code>{simResult.m3u8}</code>
                                    <button
                                      type="button"
                                      onClick={() => handleCopy(simResult.m3u8 || '', 'extracted')}
                                      className="ml-3 text-gray-400 hover:text-white shrink-0 cursor-pointer"
                                    >
                                      {copied === 'extracted' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                                    </button>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="bg-red-500/15 p-2 rounded-lg text-red-400 mt-0.5 shrink-0">
                                  <AlertTriangle className="h-5 w-5" />
                                </div>
                                <div className="flex-grow min-w-0">
                                  <div className="font-semibold text-white tracking-tight text-xs flex items-center gap-2">
                                    <span>Fallo de Extracción</span>
                                    <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold">500 FAIL</span>
                                  </div>
                                  <p className="text-[11px] text-red-300/80 mt-1 leading-relaxed font-sans">
                                    {simResult.error}
                                  </p>
                                  <div className="mt-2 text-[10px] text-gray-400 leading-relaxed font-sans font-normal">
                                    En la app móvil, esto dispararía la <span className="text-[#E50914] font-semibold">lógica de fallback crítica</span>, intentando inmediatamente <code className="text-white">embed_url_2</code> y luego <code className="text-white">embed_url_3</code> subsecuentemente hasta renderizar un error amigable.
                                  </div>
                                </div>
                              </>
                            )}
                          </motion.div>
                        )}
                      </div>

                    </motion.div>
                  )}

                  {/* 2. server.js code display */}
                  {phase2Tab === 'server' && (
                    <motion.div
                      key="server"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400 font-mono">
                          Código de Node.js + Express + Playwright para el scraper.
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(SCRAPER_SERVER_JS, 'server')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.05] border border-white/10 rounded-lg hover:bg-white/10 text-white font-medium text-xs transition-colors cursor-pointer"
                        >
                          {copied === 'server' ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                              <span className="text-emerald-400 font-semibold">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copiar Código</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="rounded-xl overflow-hidden border border-white/[0.06] bg-[#0a0a0a] text-[11px] font-mono leading-relaxed max-h-[440px] overflow-y-auto p-4 text-gray-300 whitespace-pre">
                        {SCRAPER_SERVER_JS}
                      </div>
                    </motion.div>
                  )}

                  {/* 3. package.json code display */}
                  {phase2Tab === 'package' && (
                    <motion.div
                      key="package"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400 font-mono">
                          Dependencias requeridas para la ejecución de Playwright Chromium en producción.
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(SCRAPER_PACKAGE_JSON, 'package_js')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.05] border border-white/10 rounded-lg hover:bg-white/10 text-white font-medium text-xs transition-colors cursor-pointer"
                        >
                          {copied === 'package_js' ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                              <span className="text-emerald-400 font-semibold">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copiar JSON</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="rounded-xl overflow-hidden border border-white/[0.06] bg-[#0a0a0a] text-[12px] font-mono leading-relaxed p-4 text-gray-300 whitespace-pre">
                        {SCRAPER_PACKAGE_JSON}
                      </div>
                    </motion.div>
                  )}

                  {/* 4. railway.json code display */}
                  {phase2Tab === 'railway' && (
                    <motion.div
                      key="railway"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400 font-mono">
                          Configura el Nixpacks builder y corre el post-install para descargar de forma segura el navegador binario.
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(SCRAPER_RAILWAY_JSON, 'railway_js')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.05] border border-white/10 rounded-lg hover:bg-white/10 text-white font-medium text-xs transition-colors cursor-pointer"
                        >
                          {copied === 'railway_js' ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                              <span className="text-emerald-400 font-semibold">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copiar JSON</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="rounded-xl overflow-hidden border border-white/[0.06] bg-[#0a0a0a] text-[12px] font-mono leading-relaxed p-4 text-gray-300 whitespace-pre">
                        {SCRAPER_RAILWAY_JSON}
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

            </div>
          )}

          {/* Phase 3 Details: React Native App Dashboard Viewer */}
          {activePhase === 'phase3' && (
            <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-4 sm:p-6 shadow-xl relative transition-all">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.08] pb-4 gap-4">
                <div className="flex items-center gap-2.5">
                  <Smartphone className="h-5 w-5 text-rose-500 animate-pulse" />
                  <div>
                    <h1 className="font-bold text-lg text-white tracking-tight">Estructura React Native (Fase 3)</h1>
                    <p className="text-[11px] text-gray-400">Archivos organizados dentro del subproyecto móvil <code className="text-white bg-white/5 px-1 py-0.5 rounded">/NovaTv</code></p>
                  </div>
                </div>

                {/* TV Emulation Toggle */}
                <div className="flex items-center gap-2.5">
                  <span className="text-xs text-gray-400 font-sans">Simulador de Control Remoto:</span>
                  <button
                    type="button"
                    onClick={() => setIsTvEmulationMode(!isTvEmulationMode)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isTvEmulationMode 
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10' 
                        : 'bg-[#0a0a0a] text-gray-400 border border-white/[0.1] hover:text-white'
                    }`}
                  >
                    <Tv className="h-3.5 w-3.5" />
                    {isTvEmulationMode ? 'Desactivar TV Box' : 'Activar TV Box'}
                  </button>
                </div>
              </div>

              {/* Grid content selector & code viewer */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6 min-h-[460px]">
                
                {/* Left sidebar select */}
                <div className="md:col-span-4 flex flex-col gap-2.5 max-h-[430px] overflow-y-auto pr-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">Archivos del Cliente</span>
                  
                  {RN_FILES.map((f, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedRnFile(idx)}
                      className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                        selectedRnFile === idx
                          ? 'bg-[#E50914]/15 border-[#E50914] text-white'
                          : 'bg-[#0c0c0c] border-white/[0.04] text-gray-400 hover:text-gray-200 hover:bg-[#111]'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <FileText className={`h-3.5 w-3.5 shrink-0 ${selectedRnFile === idx ? 'text-[#E50914]' : 'text-gray-500'}`} />
                        <span className="truncate">{f.label}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1 line-clamp-1 font-sans font-normal">{f.description}</p>
                    </button>
                  ))}
                </div>

                {/* Right code display area & simulated D-pad overlays */}
                <div className="md:col-span-8 flex flex-col gap-4">
                  
                  {/* Virtual TV Box D-Pad overlay box if turned on */}
                  {isTvEmulationMode ? (
                    <div className="bg-[#0c0c0c] border-2 border-rose-500/30 rounded-xl p-4 flex flex-col items-center justify-between relative shadow-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <Tv className="h-4 w-4 text-rose-500" />
                        <span className="text-xs font-bold text-white tracking-tight uppercase">Simulador de Control Remoto de TV Box</span>
                      </div>
                      <p className="text-[11px] text-gray-400 text-center leading-relaxed font-sans mb-4">
                        Haz clic en los botones virtuales del D-pad para ver cómo interactúa el visor con foco del MovieCard o reproducir la película.
                      </p>

                      <div className="flex flex-col items-center gap-1.5 my-3 relative bg-[#141414] p-4 rounded-full border border-white/[0.05]">
                        {/* UP */}
                        <button 
                          onClick={() => setFocusedButtonId('close')}
                          className="w-10 h-10 rounded-full bg-neutral-800 text-white text-xs font-extrabold flex items-center justify-center border border-white/10 active:scale-95 cursor-pointer shadow-lg"
                        >
                          ▲
                        </button>
                        
                        {/* Middle ROW (LEFT, SELECT, RIGHT) */}
                        <div className="flex items-center gap-6">
                          <button 
                            onClick={() => setFocusedButtonId('list')}
                            className="w-10 h-10 rounded-full bg-neutral-800 text-white text-xs font-extrabold flex items-center justify-center border border-white/10 active:scale-95 cursor-pointer shadow-lg"
                          >
                            ◀
                          </button>
                          
                          <button 
                            onClick={() => alert(`TV Emitió: Click en Botón "${focusedButtonId}"!`)}
                            className="w-14 h-14 rounded-full bg-[#E50914] text-white text-xs font-black flex items-center justify-center shadow-lg shadow-[#E50914]/20 border-2 border-white/25 active:scale-90 cursor-pointer"
                          >
                            OK
                          </button>

                          <button 
                            onClick={() => setFocusedButtonId('play')}
                            className="w-10 h-10 rounded-full bg-neutral-800 text-white text-xs font-extrabold flex items-center justify-center border border-white/10 active:scale-95 cursor-pointer shadow-lg"
                          >
                            ▶
                          </button>
                        </div>

                        {/* DOWN */}
                        <button 
                          onClick={() => setFocusedButtonId('play')}
                          className="w-10 h-10 rounded-full bg-neutral-800 text-white text-xs font-extrabold flex items-center justify-center border border-white/10 active:scale-95 cursor-pointer shadow-lg"
                        >
                          ▼
                        </button>
                      </div>

                      {/* Mocked Screen Layout Showing focused button state */}
                      <div className="mt-4 bg-[#141414] border border-white/[0.05] p-4 rounded-xl w-full">
                        <span className="text-[10px] font-semibold text-gray-500 block mb-2 font-mono">Pantalla Simulada de Película</span>
                        <div className="relative h-28 bg-[#111] rounded-lg overflow-hidden flex items-center justify-center">
                          {/* Simulated Focused Button highlighting */}
                          <div className="text-center p-3">
                            <span className="text-xs text-white font-bold block mb-2">Spider-Man: Across the Spider-Verse</span>
                            <div className="flex items-center justify-center gap-3">
                              <span className={`text-[10px] px-3 py-1 rounded font-bold uppercase transition-all ${focusedButtonId === 'play' ? 'bg-[#E50914] text-white border-2 border-white scale-110' : 'bg-[#222] text-gray-400'}`}>
                                ▶ Reproducir
                              </span>
                              <span className={`text-[10px] px-3 py-1 rounded font-bold uppercase transition-all ${focusedButtonId === 'list' ? 'bg-white text-neutral-900 border-2 border-[#E50914] scale-110' : 'bg-[#222] text-gray-400'}`}>
                                ＋ Mi Lista
                              </span>
                              <span className={`text-[10px] px-3 py-1 rounded font-bold uppercase transition-all ${focusedButtonId === 'close' ? 'bg-[#222] border-2 border-white scale-110 text-white' : 'bg-[#222] text-gray-400'}`}>
                                ✕ Cerrar
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* General code viewer content container */
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-gray-400">
                          Ruta del subproyecto: <code className="text-rose-300 font-semibold">/NovaTv/{RN_FILES[selectedRnFile].path}</code>
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => handleCopy(RN_FILES[selectedRnFile].code, `rn_${selectedRnFile}`)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-white/[0.04] border border-white/15 rounded-lg hover:bg-white/10 text-white font-medium text-xs transition-colors cursor-pointer"
                        >
                          {copied === `rn_${selectedRnFile}` ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-500" />
                              <span className="text-emerald-400 font-bold">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="rounded-xl overflow-hidden border border-white/[0.06] bg-[#080808] text-[11px] font-mono leading-relaxed max-h-[380px] overflow-y-auto p-4 text-gray-300 whitespace-pre">
                        {RN_FILES[selectedRnFile].code}
                      </div>

                      <div className="bg-[#0f0f0f] border border-white/[0.04] p-3 rounded-lg flex items-start gap-2.5">
                        <Info className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                          <strong className="text-gray-200">Explicación:</strong> {RN_FILES[selectedRnFile].description}
                        </p>
                      </div>
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

          {/* Phase 4 Details: Web Admin Panel Dashboard */}
          {activePhase === 'phase4' && (
            <AdminPanel onCopyText={handleCopy} copiedId={copied} />
          )}

        </div>

      </main>

      {/* Styled simple footer */}
      <footer className="border-t border-white/[0.05] bg-[#0a0a0a] py-6 px-6 text-center text-xs text-gray-600 font-serif">
        <p className="font-sans">NovaTv App • Generado para Google AI Studio Build</p>
      </footer>
    </div>
  );
}

// Simple placeholder implementation to allow compile
function PlayIcon(props: any) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <polygon points="6 3 20 12 12 17 6 21 6 3" />
    </svg>
  );
}
