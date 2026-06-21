import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Code, 
  Copy, 
  Check, 
  Layers, 
  Lock, 
  Plus, 
  Info, 
  Tv, 
  Server, 
  ShieldCheck, 
  Sparkles, 
  Terminal, 
  RefreshCw, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  FileText,
  Trash2,
  Edit,
  Sliders,
  ExternalLink,
  Eye,
  EyeOff,
  Video,
  ListPlus,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Movie, Category } from '../types';

interface AdminPanelProps {
  onCopyText: (text: string, identifier: string) => void;
  copiedId: string | null;
}

export function AdminPanel({ onCopyText, copiedId }: AdminPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'movies' | 'categories' | 'sync'>('movies');

  // Initial rich state for admin database
  const [movies, setMovies] = useState<Movie[]>([
    {
      id: 'm1-inception',
      title: 'Inception',
      description: 'Un ladrón que roba secretos corporativos a través del uso de la tecnología para compartir sueños, recibe la tarea inversa de plantar una idea en la mente de un CEO.',
      poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=400',
      backdrop_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200',
      embed_url_1: 'https://player.vimeo.com/video/example1',
      embed_url_2: 'https://youtube.com/embed/exampleRespaldo',
      genre: ['Ciencia Ficción', 'Acción', 'Suspenso'],
      year: 2010,
      duration_minutes: 148,
      rating: 'PG-13',
      is_featured: true,
    },
    {
      id: 'm2-spider',
      title: 'Spider-Man: Across the Spider-Verse',
      description: 'Miles Morales viaja a través del multiverso, donde se encuentra con un equipo de Spider-People encargado de proteger su existencia misma.',
      poster_url: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=400',
      backdrop_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200',
      embed_url_1: 'https://player.vimeo.com/video/exampleSpidey',
      embed_url_3: 'https://youtube.com/embed/exampleSpidey3',
      genre: ['Animación', 'Aventura', 'Acción'],
      year: 2023,
      duration_minutes: 140,
      rating: 'PG',
      is_featured: true,
    },
    {
      id: 'm3-interstellar',
      title: 'Interstellar',
      description: 'Un equipo de exploradores viaja a través de un agujero de gusano en el espacio en un intento por asegurar la supervivencia de la humanidad.',
      poster_url: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=400',
      backdrop_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200',
      embed_url_1: 'https://player.vimeo.com/video/exampleInterstellar',
      genre: ['Ciencia Ficción', 'Aventura', 'Drama'],
      year: 2014,
      duration_minutes: 169,
      rating: 'PG-13',
      is_featured: false,
    }
  ]);

  const [categories, setCategories] = useState<Category[]>([
    { id: 'cat-1', name: 'Tendencias Hoy', order_index: 0 },
    { id: 'cat-2', name: 'Ciencia Ficción', order_index: 1 },
    { id: 'cat-3', name: 'Acción y Suspenso', order_index: 2 },
    { id: 'cat-4', name: 'Joyas Animadas', order_index: 3 },
  ]);

  // Many-to-Many simulated relationships state
  const [movieCategories, setMovieCategories] = useState<Array<{ movie_id: string; category_id: string }>>([
    { movie_id: 'm1-inception', category_id: 'cat-1' },
    { movie_id: 'm1-inception', category_id: 'cat-2' },
    { movie_id: 'm1-inception', category_id: 'cat-3' },
    { movie_id: 'm2-spider', category_id: 'cat-1' },
    { movie_id: 'm2-spider', category_id: 'cat-4' },
    { movie_id: 'm3-interstellar', category_id: 'cat-2' },
  ]);

  // Filters & Queries
  const [movieSearch, setMovieSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');

  // Movie Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMovieId, setEditingMovieId] = useState<string | null>(null);

  // Individual Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPosterUrl, setFormPosterUrl] = useState('');
  const [formBackdropUrl, setFormBackdropUrl] = useState('');
  const [formEmbedUrl1, setFormEmbedUrl1] = useState('');
  const [formEmbedUrl2, setFormEmbedUrl2] = useState('');
  const [formEmbedUrl3, setFormEmbedUrl3] = useState('');
  const [formTrailerUrl, setFormTrailerUrl] = useState('');
  const [formGenre, setFormGenre] = useState('');
  const [formYear, setFormYear] = useState<number>(2026);
  const [formDuration, setFormDuration] = useState<number>(120);
  const [formRating, setFormRating] = useState('PG-13');
  const [formIsFeatured, setFormIsFeatured] = useState(false);

  // Scraper Embed Tester Integration inside form
  const [isScrapingInForm, setIsScrapingInForm] = useState(false);
  const [scrapedEmbedInput, setScrapedEmbedInput] = useState('');
  const [scraperLogs, setScraperLogs] = useState<string[]>([]);
  const [scrapedResultStream, setScrapedResultStream] = useState<string | null>(null);
  const [showScraperTester, setShowScraperTester] = useState(false);

  // Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatOrder, setNewCatOrder] = useState<number>(0);
  const [selectedCatForMapping, setSelectedCatForMapping] = useState<string>('cat-1');

  // Preview Player Modal
  const [previewMovie, setPreviewMovie] = useState<Movie | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [activePreviewEmbed, setActivePreviewEmbed] = useState<string>('');

  // Search filter computes
  const filteredMovies = movies.filter(m => 
    m.title.toLowerCase().includes(movieSearch.toLowerCase()) ||
    m.genre.some(g => g.toLowerCase().includes(movieSearch.toLowerCase()))
  );

  // RESET FORM
  const resetMovieForm = () => {
    setEditingMovieId(null);
    setFormTitle('');
    setFormDescription('');
    setFormPosterUrl('');
    setFormBackdropUrl('');
    setFormEmbedUrl1('');
    setFormEmbedUrl2('');
    setFormEmbedUrl3('');
    setFormTrailerUrl('');
    setFormGenre('');
    setFormYear(2026);
    setFormDuration(120);
    setFormRating('PG-13');
    setFormIsFeatured(false);
    
    // Clear Scraper
    setScrapedEmbedInput('');
    setScrapedResultStream(null);
    setScraperLogs([]);
    setShowScraperTester(false);
  };

  // OPEN CREATE
  const handleOpenCreate = () => {
    resetMovieForm();
    setIsFormOpen(true);
  };

  // OPEN EDIT
  const handleOpenEdit = (movie: Movie) => {
    setEditingMovieId(movie.id);
    setFormTitle(movie.title);
    setFormDescription(movie.description || '');
    setFormPosterUrl(movie.poster_url || '');
    setFormBackdropUrl(movie.backdrop_url || '');
    setFormEmbedUrl1(movie.embed_url_1 || '');
    setFormEmbedUrl2(movie.embed_url_2 || '');
    setFormEmbedUrl3(movie.embed_url_3 || '');
    setFormTrailerUrl(movie.trailer_url || '');
    setFormGenre(movie.genre.join(', '));
    setFormYear(movie.year || 2026);
    setFormDuration(movie.duration_minutes || 120);
    setFormRating(movie.rating || 'PG-13');
    setFormIsFeatured(movie.is_featured || false);
    setIsFormOpen(true);
  };

  // SAVE MOVIE
  const handleSaveMovie = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const genreList = formGenre
      .split(',')
      .map(g => g.trim())
      .filter(g => g.length > 0);

    const moviePayload: Movie = {
      id: editingMovieId || `movie-${Date.now()}`,
      title: formTitle,
      description: formDescription,
      poster_url: formPosterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=300',
      backdrop_url: formBackdropUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200',
      embed_url_1: formEmbedUrl1,
      embed_url_2: formEmbedUrl2 || undefined,
      embed_url_3: formEmbedUrl3 || undefined,
      trailer_url: formTrailerUrl || undefined,
      genre: genreList.length ? genreList : ['Película'],
      year: Number(formYear),
      duration_minutes: Number(formDuration),
      rating: formRating,
      is_featured: formIsFeatured
    };

    if (editingMovieId) {
      // Edit mode
      setMovies(prev => prev.map(m => m.id === editingMovieId ? moviePayload : m));
    } else {
      // Create mode
      setMovies(prev => [moviePayload, ...prev]);
    }

    setIsFormOpen(false);
    resetMovieForm();
  };

  // DELETE MOVIE
  const handleDeleteMovie = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta película? Se desvinculará de todas las categorías.')) {
      setMovies(prev => prev.filter(m => m.id !== id));
      setMovieCategories(prev => prev.filter(mc => mc.movie_id !== id));
    }
  };

  // PLAY MOVIE PREVIEW
  const handlePreviewMovie = (movie: Movie) => {
    setPreviewMovie(movie);
    setActivePreviewEmbed(movie.embed_url_1);
    setIsPreviewPlaying(false);
  };

  // RUN BRUTAL SCRAPE SIMULATOR INSIDE THE MODAL/FORM FORM
  const runScrapeEmbedTesterInForm = () => {
    if (!scrapedEmbedInput.trim() || isScrapingInForm) return;
    setIsScrapingInForm(true);
    setScrapedResultStream(null);
    setScraperLogs([]);

    const logSteps = [
      "🔄 Solicitud enviada a /extract",
      "🚀 Lanzando instancia Chromium headless segura...",
      "🌐 Cargando URL en el Sandbox de navegación...",
      "📡 Monitoreando flujos de requests de red...",
      "🔍 [Request] GET /player.js -> Ignorado",
      "🔍 [Request] GET /ads.html -> Bloqueado por seguridad",
      "🎯 [Request] Stream m3u8 detectado en tiempo real!",
      "💾 Verificando integridad del stream .m3u8...",
      "🧼 Destruyendo Sandbox en memoria volátil de forma segura...",
      "📤 Extracción procesada con éxito!"
    ];

    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < logSteps.length) {
        setScraperLogs(prev => [...prev, logSteps[currentIdx]]);
        currentIdx++;
      } else {
        clearInterval(interval);
        setIsScrapingInForm(false);
        const randHash = Math.random().toString(36).substring(2, 9);
        setScrapedResultStream(`https://live.direct.novatv.pro/hls/${randHash}/index.m3u8`);
      }
    }, 400);
  };

  const applyExtractedStream = () => {
    if (scrapedResultStream) {
      setFormEmbedUrl1(scrapedResultStream);
      setShowScraperTester(false);
      setScrapedResultStream(null);
      setScraperLogs([]);
    }
  };

  // CREATE CATEGORY
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newId = `cat-${Date.now()}`;
    const newCatObj: Category = {
      id: newId,
      name: newCatName.trim(),
      order_index: Number(newCatOrder)
    };

    setCategories(prev => [...prev, newCatObj].sort((a,b)=>a.order_index - b.order_index));
    setNewCatName('');
    setNewCatOrder(prev => prev + 1);
  };

  // DELETE CATEGORY
  const handleDeleteCategory = (catId: string) => {
    if (confirm('¿Eliminar esta categoría? Se removerán todas las vinculaciones de películas.')) {
      setCategories(prev => prev.filter(c => c.id !== catId));
      setMovieCategories(prev => prev.filter(mc => mc.category_id !== catId));
    }
  };

  // TOGGLE MOVIE CATEGORY RELATION
  const toggleMovieCategoryRelation = (movieId: string, categoryId: string) => {
    const exists = movieCategories.some(mc => mc.movie_id === movieId && mc.category_id === categoryId);
    if (exists) {
      setMovieCategories(prev => prev.filter(mc => !(mc.movie_id === movieId && mc.category_id === categoryId)));
    } else {
      setMovieCategories(prev => [...prev, { movie_id: movieId, category_id: categoryId }]);
    }
  };

  // GENERATE COMPREHENSIVE SUPABASE SQL SCRIPT WITH ACCENT STYLING
  const generateSupabaseSqlScript = (): string => {
    let script = `-- =========================================================================\n`;
    script += `-- SCRIPT COMPLETO DE MIGRACIÓN & INSERCIÓN DE DATOS - NOVATV\n`;
    script += `-- Generado dinámicamente mediante el Panel Admin Web en tiempo real\n`;
    script += `-- Fecha: ${new Date().toLocaleDateString()} - Entorno AI Studio\n`;
    script += `-- =========================================================================\n\n`;

    script += `BEGIN;\n\n`;
    script += `-- 1. Limpieza preventiva selectiva (opcional, comentar si se requiere preservar datos antiguos)\n`;
    script += `-- TRUNCATE TABLE movie_categories, movies, categories CASCADE;\n\n`;

    script += `-- 2. Inserción de Categorías\n`;
    categories.forEach(cat => {
      script += `INSERT INTO categories (id, name, order_index) \n`;
      script += `VALUES ('${cat.id}', '${cat.name.replace(/'/g, "''")}', ${cat.order_index}) \n`;
      script += `ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, order_index = EXCLUDED.order_index;\n`;
    });

    script += `\n-- 3. Inserción de Películas\n`;
    movies.forEach(m => {
      const genresArray = `ARRAY[${m.genre.map(g => `'${g.replace(/'/g, "''")}'`).join(', ')}]`;
      const desc = m.description ? `'${m.description.replace(/'/g, "''")}'` : 'NULL';
      const poster = m.poster_url ? `'${m.poster_url}'` : 'NULL';
      const backdrop = m.backdrop_url ? `'${m.backdrop_url}'` : 'NULL';
      const embed2 = m.embed_url_2 ? `'${m.embed_url_2}'` : 'NULL';
      const embed3 = m.embed_url_3 ? `'${m.embed_url_3}'` : 'NULL';
      const trailer = m.trailer_url ? `'${m.trailer_url}'` : 'NULL';

      script += `INSERT INTO movies (id, title, description, poster_url, backdrop_url, embed_url_1, embed_url_2, embed_url_3, trailer_url, genre, year, duration_minutes, rating, is_featured)\n`;
      script += `VALUES (\n`;
      script += `  '${m.id}',\n`;
      script += `  '${m.title.replace(/'/g, "''")}',\n`;
      script += `  ${desc},\n`;
      script += `  ${poster},\n`;
      script += `  ${backdrop},\n`;
      script += `  '${m.embed_url_1}',\n`;
      script += `  ${embed2},\n`;
      script += `  ${embed3},\n`;
      script += `  ${trailer},\n`;
      script += `  ${genresArray},\n`;
      script += `  ${m.year},\n`;
      script += `  ${m.duration_minutes},\n`;
      script += `  '${m.rating}',\n`;
      script += `  ${m.is_featured}\n`;
      script += `) ON CONFLICT (id) DO UPDATE SET \n`;
      script += `  title = EXCLUDED.title, description = EXCLUDED.description, poster_url = EXCLUDED.poster_url, \n`;
      script += `  backdrop_url = EXCLUDED.backdrop_url, embed_url_1 = EXCLUDED.embed_url_1, embed_url_2 = EXCLUDED.embed_url_2, \n`;
      script += `  embed_url_3 = EXCLUDED.embed_url_3, trailer_url = EXCLUDED.trailer_url, genre = EXCLUDED.genre,\n`;
      script += `  year = EXCLUDED.year, duration_minutes = EXCLUDED.duration_minutes, rating = EXCLUDED.rating, is_featured = EXCLUDED.is_featured;\n\n`;
    });

    script += `-- 4. Vinculación de Relaciones Mucho a Mucho (movie_categories)\n`;
    movieCategories.forEach(mc => {
      script += `INSERT INTO movie_categories (movie_id, category_id) \n`;
      script += `VALUES ('${mc.movie_id}', '${mc.category_id}') \n`;
      script += `ON CONFLICT DO NOTHING;\n`;
    });

    script += `\nCOMMIT;`;
    return script;
  };

  return (
    <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-4 sm:p-6 shadow-xl relative transition-all w-full">
      
      {/* Top Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/[0.08] pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-rose-500 to-[#E50914] p-2 rounded-xl text-white shadow-md shadow-rose-950/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-tight flex items-center gap-2">
              Panel de Administración Completo
              <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold tracking-wider uppercase">Fase 4</span>
            </h1>
            <p className="text-[11px] text-gray-400">Control maestro de catálogo, scraper activo y generador de sincronización de datos.</p>
          </div>
        </div>

        {/* Console Sub-toggles */}
        <div className="flex bg-[#0a0a0a] rounded-lg p-1 border border-white/[0.06] text-xs shrink-0 self-start md:self-center">
          <button
            type="button"
            onClick={() => setActiveSubTab('movies')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'movies' 
                ? 'bg-[#E50914] text-white shadow-md' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Video className="h-3.5 w-3.5" />
            Películas ({movies.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('categories')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'categories' 
                ? 'bg-[#E50914] text-white shadow-md' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <ListPlus className="h-3.5 w-3.5" />
            Categorías ({categories.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('sync')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'sync' 
                ? 'bg-[#E50914] text-white shadow-md' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            Sync Supabase (SQL)
          </button>
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="mt-6">
        
        {/* SUBTAB 1: MOVIES MANAGEMENT */}
        {activeSubTab === 'movies' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar por título o género..."
                  value={movieSearch}
                  onChange={(e) => setMovieSearch(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>

              {/* Add movie button */}
              <button
                type="button"
                onClick={handleOpenCreate}
                className="w-full sm:w-auto bg-[#E50914] hover:bg-[#ff1b26] text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-rose-950/10"
              >
                <Plus className="h-4 w-4" />
                Nueva Película
              </button>
            </div>

            {/* Movie List Card Rows */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMovies.map(movie => {
                const associatedCats = movieCategories
                  .filter(mc => mc.movie_id === movie.id)
                  .map(mc => categories.find(c => c.id === mc.category_id)?.name)
                  .filter((name): name is string => typeof name === 'string');

                return (
                  <div key={movie.id} className="bg-[#0c0c0c] border border-white/[0.05] rounded-xl p-4 flex gap-4 hover:border-white/10 transition-colors relative group">
                    <img
                      src={movie.poster_url}
                      alt={movie.title}
                      referrerPolicy="no-referrer"
                      className="w-20 h-28 object-cover rounded-lg bg-[#141414] border border-white/5 shadow-md self-center shrink-0"
                    />
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-white text-sm truncate font-sans">{movie.title}</h3>
                          <span className="bg-white/5 border border-white/10 text-gray-300 font-bold px-1.5 py-0.5 rounded text-[9px] uppercase font-mono shrink-0">
                            {movie.rating}
                          </span>
                        </div>
                        
                        <p className="text-[10px] text-gray-400 font-normal line-clamp-2 mt-1 leading-relaxed">
                          {movie.description || 'Sin descripción detallada registrada.'}
                        </p>
                        
                        {/* Specs */}
                        <div className="flex items-center gap-3 text-[9.5px] font-mono text-gray-500 mt-2">
                          <span>📅 {movie.year}</span>
                          <span>⏱️ {movie.duration_minutes} min</span>
                          {movie.is_featured && (
                            <span className="text-[#E50914] font-semibold flex items-center gap-0.5">
                              ★ Destacada
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Display Associated Categories & Links Indicators */}
                      <div className="mt-3 pt-2.5 border-t border-white/[0.04]">
                        <div className="flex flex-wrap items-center gap-1 mb-2">
                          <span className="text-[8px] text-gray-500 uppercase font-mono mr-1">Secciones:</span>
                          {associatedCats.length > 0 ? (
                            associatedCats.map((cat, i) => (
                              <span key={i} className="bg-rose-500/10 border border-rose-500/15 text-rose-300 px-1.5 py-0.5 rounded text-[8.5px] font-sans">
                                {cat}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500 text-[8.5px] italic">Sin sección</span>
                          )}
                        </div>

                        {/* Embed indicators */}
                        <div className="flex items-center gap-2.5">
                          <span className="text-[8px] text-gray-500 uppercase font-mono">Stream:</span>
                          <div className="flex items-center gap-2 text-[9px] font-mono">
                            <span className="flex items-center gap-0.5">
                              <span className={`w-2 h-2 rounded-full ${movie.embed_url_1 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                              <span className="text-gray-400">Link 1</span>
                            </span>
                            <span className="flex items-center gap-0.5">
                              <span className={`w-2 h-2 rounded-full ${movie.embed_url_2 ? 'bg-amber-400' : 'bg-white/10'}`} />
                              <span className="text-gray-500">Link 2</span>
                            </span>
                            <span className="flex items-center gap-0.5">
                              <span className={`w-2 h-2 rounded-full ${movie.embed_url_3 ? 'bg-amber-400' : 'bg-white/10'}`} />
                              <span className="text-gray-500">Link 3</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons drawer overlay */}
                    <div className="absolute top-2.5 right-2 px-1 py-0.5 rounded bg-black/80 backdrop-blur-sm border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shadow-md">
                      <button
                        type="button"
                        onClick={() => handlePreviewMovie(movie)}
                        title="Vista Previa Reproductor"
                        className="p-1 text-gray-400 hover:text-white hover:bg-white/5 rounded cursor-pointer"
                      >
                        <Play className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(movie)}
                        title="Editar Película"
                        className="p-1 text-gray-400 hover:text-emerald-400 hover:bg-white/5 rounded cursor-pointer"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMovie(movie.id)}
                        title="Eliminar Película"
                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-white/5 rounded cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredMovies.length === 0 && (
                <div className="col-span-full bg-[#0c0c0c] border border-white/[0.04] p-12 text-center rounded-xl">
                  <Video className="h-8 w-8 text-gray-600 mx-auto mb-2.5" />
                  <p className="text-xs text-gray-400">No se encontraron películas con tu búsqueda.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUBTAB 2: CATEGORY & MAPPING MANAGEMENT */}
        {activeSubTab === 'categories' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Category creation & list column */}
              <div className="lg:col-span-5 space-y-4">
                <form onSubmit={handleCreateCategory} className="bg-[#0c0c0c] border border-white/[0.05] p-4 rounded-xl space-y-3 shadow-inner">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Crear Nueva Categoría</h3>
                  
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[10px] text-gray-400 font-mono block mb-1">Nombre de la Sección</label>
                      <input
                        type="text"
                        required
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder="Ej: Joyas de Acción, Suspenso Coreano..."
                        className="w-full bg-[#141414] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white uppercase focus:outline-none focus:border-[#E50914]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 font-mono block mb-1">Índice de Ordenación (order_index)</label>
                      <input
                        type="number"
                        required
                        value={newCatOrder}
                        onChange={(e) => setNewCatOrder(Number(e.target.value))}
                        className="w-full bg-[#141414] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#E50914]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#E50914] text-white font-bold py-1.5 rounded-lg text-xs cursor-pointer hover:bg-rose-600 transition-colors"
                  >
                    Guardar Sección
                  </button>
                </form>

                {/* Categories Scrollable List */}
                <div className="bg-[#0c0c0c] border border-white/[0.05] p-4 rounded-xl space-y-2 max-h-[300px] overflow-y-auto">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono block mb-1">Secciones Activas</span>
                  {categories.map(cat => (
                    <div 
                      key={cat.id} 
                      onClick={() => setSelectedCatForMapping(cat.id)}
                      className={`p-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                        selectedCatForMapping === cat.id 
                          ? 'bg-rose-500/10 border border-rose-500/30 text-white' 
                          : 'bg-[#141414]/90 border border-transparent text-gray-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-sans bg-white/5 border border-white/10 text-rose-300 px-1.5 py-0.5 rounded font-bold font-mono">
                          #{cat.order_index}
                        </span>
                        <span className="text-xs font-bold leading-none">{cat.name}</span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(cat.id);
                        }}
                        className="p-1 text-gray-500 hover:text-red-500 hover:bg-white/5 rounded cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Many-to-Many Visual Association Matrix Column */}
              <div className="lg:col-span-7">
                <div className="bg-[#0c0c0c] border border-white/[0.05] p-5 rounded-xl h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Sliders className="h-4 w-4 text-rose-500" />
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Gestión de Vinculaciones</h3>
                    </div>
                    
                    <p className="text-[11px] text-gray-400 leading-relaxed mb-4 font-sans">
                      Selecciona una sección a la izquierda y edita qué películas pertenecen a ella en tiempo real usando el panel táctil debajo.
                    </p>

                    <div className="bg-[#141414]/60 rounded-xl border border-white/[0.03] overflow-hidden max-h-[310px] overflow-y-auto">
                      <div className="bg-[#1a1a1a]/80 px-4 py-2 border-b border-white/[0.04] flex items-center justify-between text-[10px] font-mono font-bold text-gray-400 uppercase">
                        <span>Pelicula</span>
                        <span>Pertenece a: {categories.find(c => c.id === selectedCatForMapping)?.name}</span>
                      </div>

                      <div className="p-2 space-y-1">
                        {movies.map(movie => {
                          const isAssoc = movieCategories.some(mc => mc.movie_id === movie.id && mc.category_id === selectedCatForMapping);
                          return (
                            <div 
                              key={movie.id}
                              onClick={() => toggleMovieCategoryRelation(movie.id, selectedCatForMapping)}
                              className={`p-2 rounded-lg flex items-center justify-between transition-colors border cursor-pointer ${
                                isAssoc 
                                  ? 'bg-rose-500/5 border-rose-500/20 text-white' 
                                  : 'bg-transparent border-transparent text-gray-400 hover:bg-white/[0.01]'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 truncate">
                                <img src={movie.poster_url} className="w-6 h-8 rounded object-cover shrink-0 select-none pointer-events-none" referrerPolicy="no-referrer" />
                                <span className="text-xs font-semibold truncate">{movie.title}</span>
                              </div>

                              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                isAssoc 
                                  ? 'border-[#E50914] bg-[#E50914] text-white' 
                                  : 'border-white/20'
                              }`}>
                                {isAssoc && <Check className="h-3 w-3 stroke-[3]" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.03] text-[10px] text-gray-500 font-mono flex items-center gap-2 leading-relaxed">
                    <Info className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                    <span>Estas relaciones simulan la tabla pivot <code className="text-rose-400">movie_categories</code> de Supabase para alimentar las filas de la app móvil.</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SUBTAB 3: SQL SUPABASE AUTOMATOR MIGRATOR */}
        {activeSubTab === 'sync' && (
          <div className="space-y-4">
            <div className="bg-[#0c0c0c] border border-white/[0.05] p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2 mb-2">
                <Terminal className="h-4 w-4 text-[#E50914]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Consola de Autogeneración de Migraciones Supabase</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                ¿Agregaste películas nuevas, editaste categorías o modificaste relaciones? Esta consola compila automáticamente todo tu estado local en un script SQL altamente optimizado y seguro, listo para ser ejecutado directamente en la consola de Supabase.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Detección activa: {categories.length} categorías, {movies.length} películas, {movieCategories.length} relaciones.
              </span>

              <button
                type="button"
                onClick={() => onCopyText(generateSupabaseSqlScript(), 'direct_sync')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.05] border border-white/10 rounded-lg hover:bg-white/10 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                {copiedId === 'direct_sync' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-400 font-bold">¡SQL Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copiar código SQL</span>
                  </>
                )}
              </button>
            </div>

            {/* SQL Dump block */}
            <div className="rounded-xl overflow-hidden border border-white/[0.06] bg-[#0a0a0a] text-[11px] font-mono leading-relaxed max-h-[380px] overflow-y-auto p-4 relative">
              <pre className="text-gray-300 whitespace-pre font-mono leading-relaxed select-all">
                {generateSupabaseSqlScript()}
              </pre>
            </div>

            {/* Steps guidelines for Supabase pasting */}
            <div className="bg-[#0d0d0d] p-4 rounded-xl border border-white/[0.03] space-y-2">
              <span className="text-xs font-bold text-white block">💡 Cómo sincronizar tu servidor Supabase real en 3 pasos:</span>
              <ol className="text-[10px] text-gray-400 font-mono space-y-1 list-decimal list-inside leading-snug">
                <li>Haz clic arriba para copiar el script de migración SQL autogenerado.</li>
                <li>Ve al Dashboard de tu proyecto <strong className="text-gray-200">Supabase</strong> y abre una nueva pestaña en el <strong className="text-gray-200">"SQL Editor"</strong>.</li>
                <li>Pega el código completo y haz clic en <strong className="text-amber-500 uppercase">"Run"</strong> para ver cómo tus datos se actualizan automáticamente en segundos.</li>
              </ol>
            </div>
          </div>
        )}

      </div>

      {/* MODAL / BOTTOM SHEET: CREATE & EDIT FORM FOR MOVIE */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#141414] border border-white/[0.08] rounded-2xl w-full max-w-2xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              {/* Modal Head */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-[#E50914]" />
                  <h2 className="font-bold text-base text-white font-sans">
                    {editingMovieId ? 'Editar Detalles de la Película' : 'Agregar Nueva Película al Catálogo'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={resetMovieForm}
                  className="text-gray-400 hover:text-white text-xs cursor-pointer"
                >
                  ✕ Cerrar
                </button>
              </div>

              {/* Form Scroll Container */}
              <form onSubmit={handleSaveMovie} className="space-y-4 flex-grow overflow-y-auto pr-1">
                
                {/* 1. Title, Year, Rating, Duration */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <label className="text-[10px] text-gray-400 font-mono block mb-1">Título Oficial</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Inception, Spider-Man..."
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-mono block mb-1">Año de Lanzamiento</label>
                    <input
                      type="number"
                      required
                      value={formYear}
                      onChange={(e) => setFormYear(Number(e.target.value))}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-mono block mb-1">Clasificación (Rating)</label>
                    <select
                      value={formRating}
                      onChange={(e) => setFormRating(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
                    >
                      <option value="G">G - Todos</option>
                      <option value="PG">PG - Guía</option>
                      <option value="PG-13">PG-13 - Adolescentes</option>
                      <option value="R">R - Restringido</option>
                      <option value="TV-MA">TV-MA - Maduros</option>
                    </select>
                  </div>
                </div>

                {/* 2. Description */}
                <div>
                  <label className="text-[10px] text-gray-400 font-mono block mb-1">Sinopsis / Descripción</label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Agrega una breve sinopsis para describir el argumento..."
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white resize-none"
                  />
                </div>

                {/* 3. Genres List / Comma Separated */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-400 font-mono block mb-1">Géneros (Separados por Comas)</label>
                    <input
                      type="text"
                      placeholder="Ej: Acción, Ciencia Ficción, Suspenso"
                      value={formGenre}
                      onChange={(e) => setFormGenre(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-mono block mb-1">Duración (en minutos)</label>
                    <input
                      type="number"
                      required
                      value={formDuration}
                      onChange={(e) => setFormDuration(Number(e.target.value))}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                {/* 4. Poster and Backdrop Image URLs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-400 font-mono block mb-1">URL Póster (Vertical)</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={formPosterUrl}
                      onChange={(e) => setFormPosterUrl(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-mono block mb-1">URL Backdrop (Fondo Horizontal)</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={formBackdropUrl}
                      onChange={(e) => setFormBackdropUrl(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                {/* 5. Embed Links */}
                <div className="space-y-2 border-t border-white/[0.04] pt-3">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono block">Enlaces de Streaming (Iframe Embeds / .m3u8 auto-extract)</span>
                  
                  <div className="space-y-2">
                    {/* Link 1 with scraper helper button */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] text-gray-400 font-mono">Enlace Embed 1 (Canal Principal)</label>
                        <button
                          type="button"
                          onClick={() => {
                            setScrapedEmbedInput(formEmbedUrl1 || 'https://tiktokshopping.xyz/v/embed-novatv');
                            setShowScraperTester(!showScraperTester);
                          }}
                          className="bg-rose-500/10 border border-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded text-[8.5px] uppercase font-mono cursor-pointer flex items-center gap-1"
                        >
                          <Server className="h-2.5 w-2.5 animate-pulse" />
                          {showScraperTester ? 'Ocultar Scraper Helper' : 'Autodetectar con Scraper Playwright'}
                        </button>
                      </div>

                      {/* Scraper Inside Form Drawer */}
                      {showScraperTester && (
                        <div className="bg-[#0b0b0b] border border-[#E50914]/25 p-3.5 rounded-lg mb-3 mt-1 space-y-2">
                          <span className="text-[9.5px] font-bold uppercase tracking-wider font-mono text-[#E50914] block">Playwright Scraper Live Helper</span>
                          <p className="text-[10.5px] text-gray-400 font-normal leading-normal">
                            Ingresa el link de tu iframe/embed de película externa y el bot de raspado simulará un bot headless Chromium en Railway para pescar el .m3u8.
                          </p>
                          <div className="flex gap-2 text-xs">
                            <input
                              type="text"
                              value={scrapedEmbedInput}
                              onChange={(e) => setScrapedEmbedInput(e.target.value)}
                              placeholder="Ej: https://tiktokshopping.xyz/v/zhz897h45lk4"
                              className="bg-[#141414] flex-1 px-3 py-1 border border-white/10 rounded text-xs text-white"
                            />
                            <button
                              type="button"
                              onClick={runScrapeEmbedTesterInForm}
                              disabled={isScrapingInForm}
                              className="bg-[#E50914] text-white px-3 py-1 rounded text-xs font-bold"
                            >
                              {isScrapingInForm ? 'Mapeando...' : 'Testeo Scraper'}
                            </button>
                          </div>

                          {/* Scraper progress code block inside */}
                          {scraperLogs.length > 0 && (
                            <div className="bg-black/95 text-gray-300 text-[10px] font-mono p-3 rounded border border-white/5 max-h-[140px] overflow-y-auto space-y-1">
                              {scraperLogs.map((log, i) => (
                                <div key={i}><span className="text-gray-500">▶</span> {log}</div>
                              ))}
                            </div>
                          )}

                          {scrapedResultStream && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg flex items-center justify-between text-[11px] font-mono">
                              <div className="truncate pr-4 text-emerald-300">
                                🚀 Stream capturado: {scrapedResultStream}
                              </div>
                              <button
                                type="button"
                                onClick={applyExtractedStream}
                                className="bg-emerald-500 text-white font-bold px-2 py-1 rounded text-[10px]"
                              >
                                Aplicar URL
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <input
                        type="url"
                        required
                        placeholder="https://player.vimeo.com/video/..."
                        value={formEmbedUrl1}
                        onChange={(e) => setFormEmbedUrl1(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-rose-300 font-mono"
                      />
                    </div>

                    {/* Links 2 and 3 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-gray-400 font-mono block mb-1">Enlace Embed 2 (Opcional - Respaldo 1)</label>
                        <input
                          type="url"
                          placeholder="https://server2.xyz/embed/..."
                          value={formEmbedUrl2}
                          onChange={(e) => setFormEmbedUrl2(e.target.value)}
                          className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 font-mono block mb-1">Enlace Embed 3 (Opcional - Respaldo 2)</label>
                        <input
                          type="url"
                          placeholder="https://server3.xyz/embed/..."
                          value={formEmbedUrl3}
                          onChange={(e) => setFormEmbedUrl3(e.target.value)}
                          className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. Settings (Featured movie) */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    className="rounded border-white/10 bg-[#0a0a0a] text-[#E50914] focus:ring-0 focus:ring-offset-0"
                  />
                  <label htmlFor="is_featured" className="text-xs text-gray-300 font-sans cursor-pointer">
                    Marcar como <strong className="text-rose-400">Película Destacada</strong> (Slide de entrada de la aplicación)
                  </label>
                </div>

                {/* Submit button inside form modal */}
                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3 mt-4 shrink-0">
                  <button
                    type="button"
                    onClick={resetMovieForm}
                    className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium px-4 py-2 rounded-lg text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-[#E50914] hover:bg-[#ff1b26] text-white font-bold px-4 py-2 rounded-lg text-xs cursor-pointer shadow-lg shadow-rose-950/20"
                  >
                    {editingMovieId ? 'Guardar Cambios' : 'Registrar Película'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: DIRECT PREVIEW PLAYER */}
      <AnimatePresence>
        {previewMovie && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#141414] border border-white/[0.08] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl"
            >
              <div className="bg-[#111] px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Tv className="h-4 w-4 text-[#E50914]" />
                  Vista Previa del Reproductor Integrado
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewMovie(null)}
                  className="text-gray-400 hover:text-white text-xs cursor-pointer"
                >
                  ✕ Cerrar
                </button>
              </div>

              {/* TV Screen Sandbox area */}
              <div className="bg-[#000] aspect-video w-full relative flex items-center justify-center border-b border-white/[0.05]">
                {isPreviewPlaying ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-2 bg-[#000]">
                    <div className="w-12 h-12 rounded-full border-4 border-t-[#E50914] border-r-[#E50914] border-neutral-800 animate-spin" />
                    <p className="text-xs text-rose-400 font-bold uppercase tracking-wider">Cargando video stream .m3u8 extractor...</p>
                    <code className="text-[10px] text-gray-500 font-mono truncate max-w-full italic">{activePreviewEmbed}</code>
                    
                    <button
                      type="button"
                      onClick={() => setIsPreviewPlaying(false)}
                      className="mt-4 bg-white/10 text-white font-bold px-3 py-1 rounded text-[10px] border border-white/10 hover:bg-white/15"
                    >
                      Pausar Stream
                    </button>
                  </div>
                ) : (
                  <div className="relative w-full h-full">
                    {/* Backdrop */}
                    <img 
                      src={previewMovie.backdrop_url || previewMovie.poster_url} 
                      alt={previewMovie.title} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover opacity-35" 
                    />
                    {/* Centered Play button */}
                    <div className="absolute inset-x-0 inset-y-0 flex flex-col items-center justify-center p-4">
                      <button
                        type="button"
                        onClick={() => setIsPreviewPlaying(true)}
                        className="w-16 h-16 rounded-full bg-[#E50914] text-white flex items-center justify-center border-4 border-white/10 hover:scale-105 transition-all shadow-xl shadow-rose-950/60 active:scale-95 cursor-pointer"
                      >
                        <Play className="h-6 w-6 stroke-[3] ml-1" />
                      </button>
                      <h3 className="font-extrabold text-white text-lg tracking-tight mt-3 text-center">{previewMovie.title}</h3>
                      <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wider mt-0.5">Stream: {previewMovie.embed_url_1}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Specs & description */}
              <div className="p-4 bg-[#0c0c0c] flex items-start gap-4">
                <img src={previewMovie.poster_url} className="w-14 h-20 object-cover rounded-lg border border-white/5 block shrink-0" referrerPolicy="no-referrer" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-bold">{previewMovie.year}</span>
                    <span className="text-[10px] bg-white/5 border border-white/10 text-gray-400 px-1 py-0.2 rounded font-mono uppercase">{previewMovie.rating}</span>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed font-normal mt-1 block line-clamp-3">
                    {previewMovie.description || 'Sin descripción detallada registrada.'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
