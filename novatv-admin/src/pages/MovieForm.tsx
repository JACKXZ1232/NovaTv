import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Movie, Category } from '../types';
import { ImagePreview } from '../components/ImagePreview';
import { ChevronLeft, Info, HelpCircle, Save, Loader2, PlaySquare } from 'lucide-react';

interface MovieFormProps {
  movieToEdit?: Movie | null;
  onCancel: () => void;
  onSaveSuccess: () => void;
}

export default function MovieForm({ movieToEdit, onCancel, onSaveSuccess }: MovieFormProps) {
  const isEdit = !!movieToEdit;
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [backdropUrl, setBackdropUrl] = useState('');
  const [embedUrl1, setEmbedUrl1] = useState('');
  const [embedUrl2, setEmbedUrl2] = useState('');
  const [embedUrl3, setEmbedUrl3] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [genreText, setGenreText] = useState(''); // comma-separated locally, split into text[] on submit
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [durationMinutes, setDurationMinutes] = useState<number>(120);
  const [rating, setRating] = useState('PG-13');
  const [isFeatured, setIsFeatured] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  useEffect(() => {
    const loadCatsAndSetup = async () => {
      try {
        setLoadingCats(true);
        // Load categories First
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('*')
          .order('order_index', { ascending: true });

        if (catError) throw catError;
        setCategories(catData || []);

        if (isEdit && movieToEdit) {
          setTitle(movieToEdit.title || '');
          setDescription(movieToEdit.description || '');
          setPosterUrl(movieToEdit.poster_url || '');
          setBackdropUrl(movieToEdit.backdrop_url || '');
          setEmbedUrl1(movieToEdit.embed_url_1 || '');
          setEmbedUrl2(movieToEdit.embed_url_2 || '');
          setEmbedUrl3(movieToEdit.embed_url_3 || '');
          setTrailerUrl(movieToEdit.trailer_url || '');
          setGenreText(movieToEdit.genre ? movieToEdit.genre.join(', ') : '');
          setYear(movieToEdit.year || 2026);
          setDurationMinutes(movieToEdit.duration_minutes || 120);
          setRating(movieToEdit.rating || 'PG-13');
          setIsFeatured(!!movieToEdit.is_featured);

          // Fetch prebound movie_categories
          const { data: boundCats, error: boundError } = await supabase
            .from('movie_categories')
            .select('category_id')
            .eq('movie_id', movieToEdit.id);

          if (!boundError && boundCats) {
            setSelectedCategoryIds(boundCats.map((bc) => bc.category_id));
          }
        }
      } catch (err: any) {
        console.error('Error on form setups', err);
        setErrorLocal('Error al disponer los catálogos.');
      } finally {
        setLoadingCats(false);
      }
    };

    loadCatsAndSetup();
  }, [isEdit, movieToEdit]);

  const toggleCategory = (catId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !embedUrl1.trim()) {
      setErrorLocal('El Título y el Enlace Embed Principal son requeridos.');
      return;
    }

    setSaving(true);
    setErrorLocal(null);

    // Filter, map, trim comma separated genres
    const genreArray = genreText
      .split(',')
      .map((g) => g.trim())
      .filter((g) => g.length > 0);

    const movieObj = {
      title: title.trim(),
      description: description.trim() || null,
      poster_url: posterUrl.trim() || null,
      backdrop_url: backdropUrl.trim() || null,
      embed_url_1: embedUrl1.trim(),
      embed_url_2: embedUrl2.trim() || null,
      embed_url_3: embedUrl3.trim() || null,
      trailer_url: trailerUrl.trim() || null,
      genre: genreArray,
      year: Number(year) || null,
      duration_minutes: Number(durationMinutes) || null,
      rating: rating.trim() || null,
      is_featured: isFeatured,
    };

    try {
      let savedMovieId = '';

      if (isEdit && movieToEdit) {
        savedMovieId = movieToEdit.id;
        const { error } = await supabase
          .from('movies')
          .update(movieObj)
          .eq('id', movieToEdit.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('movies')
          .insert([movieObj])
          .select();

        if (error) throw error;
        if (!data || data.length === 0) throw new Error('Insert returned no payload.');
        savedMovieId = data[0].id;
      }

      // Synchronize category relations
      // 1. Delete expired bounds
      const { error: deletionError } = await supabase
        .from('movie_categories')
        .delete()
        .eq('movie_id', savedMovieId);

      if (deletionError) throw deletionError;

      // 2. Insert refreshed bounds
      if (selectedCategoryIds.length > 0) {
        const relationPayloads = selectedCategoryIds.map((cId) => ({
          movie_id: savedMovieId,
          category_id: cId,
        }));

        const { error: relationError } = await supabase
          .from('movie_categories')
          .insert(relationPayloads);

        if (relationError) throw relationError;
      }

      // Return success
      onSaveSuccess();
    } catch (err: any) {
      console.error('Error saving records:', err);
      setErrorLocal(err.message || 'Error al guardar los campos.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 bg-surface p-4 rounded-xl border border-white/5">
        <button
          onClick={onCancel}
          className="bg-[#0a0a0a] hover:bg-white/5 text-gray-300 p-2 rounded-lg border border-white/5 transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">
            {isEdit ? `Editar Película: ${movieToEdit?.title}` : 'Agregar Nueva Película'}
          </h1>
          <p className="text-xs text-gray-400">
            {isEdit ? 'Modifica los metadatos y enlaces del título' : 'Registra un título en catálogo'}
          </p>
        </div>
      </div>

      {errorLocal && (
        <div className="bg-red-500/10 border border-red-500/15 text-red-400 p-4 rounded-xl text-xs flex items-center gap-2">
          <Info className="h-4 w-4 shrink-0" />
          <span>{errorLocal}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Metadata Section */}
          <div className="bg-surface p-6 rounded-xl border border-white/5 flex flex-col gap-4">
            <h2 className="text-sm font-extrabold tracking-wider text-gray-300 uppercase pb-2 border-b border-white/5 flex items-center gap-2">
              <PlaySquare className="h-4 w-4 text-primary" />
              Información Básica
            </h2>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400">Título de la Película *</label>
              <input
                type="text"
                placeholder="Ej: Star Wars: El despertar de la fuerza"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-[#0a0a0a] border border-white/5 text-white p-3 rounded-lg focus:outline-none focus:border-primary text-sm"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400">Sinopsis / Descripción</label>
              <textarea
                placeholder="Escribe un breve resumen de la trama..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="bg-[#0a0a0a] border border-white/5 text-white p-3 rounded-lg focus:outline-none focus:border-primary text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400">Año</label>
                <input
                  type="number"
                  min="1900"
                  max="2035"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="bg-[#0a0a0a] border border-white/5 text-white p-3 rounded-lg focus:outline-none focus:border-primary text-sm font-mono"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400">Duración (min)</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="bg-[#0a0a0a] border border-white/5 text-white p-3 rounded-lg focus:outline-none focus:border-primary text-sm font-mono"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400">Clasificación (Rating)</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="bg-[#0a0a0a] border border-white/5 text-white p-3 rounded-lg focus:outline-none focus:border-primary text-sm"
                >
                  <option value="G">G - General</option>
                  <option value="PG">PG - Guía paternal</option>
                  <option value="PG-13">PG-13 - Apto mayores 13</option>
                  <option value="R">R - Restringido</option>
                  <option value="NR">NR - Sin clasificar</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400">Destacada (Hero Banner)</label>
                <div className="flex items-center h-full">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#0a0a0a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    <span className="ml-3 text-xs font-medium text-gray-300">Mostrar arriba</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400">Géneros (Separados por coma)</label>
              <input
                type="text"
                placeholder="Ej: Acción, Aventura, Fantasía"
                value={genreText}
                onChange={(e) => setGenreText(e.target.value)}
                className="bg-[#0a0a0a] border border-white/5 text-white p-3 rounded-lg focus:outline-none focus:border-primary text-sm"
              />
            </div>
          </div>

          {/* Embed URLs Configuration */}
          <div className="bg-surface p-6 rounded-xl border border-white/5 flex flex-col gap-4">
            <h2 className="text-sm font-extrabold tracking-wider text-gray-300 uppercase pb-2 border-b border-white/5 flex items-center gap-2">
              🔌 Canales y Enlaces de Transmisión (Embeds)
            </h2>

            <div className="bg-blue-500/10 border border-blue-500/15 p-4 rounded-lg flex gap-3 text-xs text-blue-400">
              <HelpCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">¿Cómo funciona la extracción?</p>
                <p className="mt-1 text-gray-300 leading-relaxed">
                  Pega enlaces de reproductores (embeds) como Cuevana, Pelisplus, ok.ru, etc. 
                  Al presionar play la app del teléfono abrirá un navegador invisible en segundo plano, extraerá el link stream .m3u8 nativo y reproducirá sin publicidad al instante.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400">Enlace Embed Principal *</label>
              <input
                type="url"
                placeholder="https://tiktokshopping.xyz/v/zhz897h45lk4"
                value={embedUrl1}
                onChange={(e) => setEmbedUrl1(e.target.value)}
                className="bg-[#0a0a0a] border border-white/5 text-white p-3 rounded-lg focus:outline-none focus:border-primary text-sm font-mono"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400">Respaldo 1 (Opcional)</label>
                <input
                  type="url"
                  placeholder="Insertar canal de respaldo 1..."
                  value={embedUrl2}
                  onChange={(e) => setEmbedUrl2(e.target.value)}
                  className="bg-[#0a0a0a] border border-white/5 text-white p-3 rounded-lg focus:outline-none focus:border-primary text-sm font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400">Respaldo 2 (Opcional)</label>
                <input
                  type="url"
                  placeholder="Insertar canal de respaldo 2..."
                  value={embedUrl3}
                  onChange={(e) => setEmbedUrl3(e.target.value)}
                  className="bg-[#0a0a0a] border border-white/5 text-white p-3 rounded-lg focus:outline-none focus:border-primary text-sm font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400">URL del Trailer (Opcional)</label>
              <input
                type="url"
                placeholder="Ej. de Youtube: https://www.youtube.com/watch?v=..."
                value={trailerUrl}
                onChange={(e) => setTrailerUrl(e.target.value)}
                className="bg-[#0a0a0a] border border-white/5 text-white p-3 rounded-lg focus:outline-none focus:border-primary text-sm font-mono"
              />
            </div>
          </div>
        </div>

        {/* Media Assets Previews + Category Selections */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Cover Assets */}
          <div className="bg-surface p-6 rounded-xl border border-white/5 flex flex-col gap-4">
            <h2 className="text-sm font-extrabold tracking-wider text-gray-300 uppercase pb-2 border-b border-white/5">
              🖼️ Portadas de Imagen
            </h2>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400">URL del Póster (Relación 2:3)</label>
                <input
                  type="url"
                  placeholder="https://imagen.com/poster.jpg"
                  value={posterUrl}
                  onChange={(e) => setPosterUrl(e.target.value)}
                  className="bg-[#0a0a0a] border border-white/5 text-white p-3 rounded-lg focus:outline-none focus:border-primary text-xs font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400">URL de Fondo (Relación 16:9)</label>
                <input
                  type="url"
                  placeholder="https://imagen.com/background.jpg"
                  value={backdropUrl}
                  onChange={(e) => setBackdropUrl(e.target.value)}
                  className="bg-[#0a0a0a] border border-white/5 text-white p-3 rounded-lg focus:outline-none focus:border-primary text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex flex-row md:flex-col gap-4 mt-2">
              <ImagePreview url={posterUrl} aspectRatio="poster" label="Layout Póster (Móvil)" />
              <ImagePreview url={backdropUrl} aspectRatio="backdrop" label="Layout Banner (Hero)" />
            </div>
          </div>

          {/* Categorization Binding Checkboxes */}
          <div className="bg-surface p-6 rounded-xl border border-white/5 flex flex-col gap-4">
            <h2 className="text-sm font-extrabold tracking-wider text-gray-300 uppercase pb-2 border-b border-white/5">
              📂 Asignar Categorías
            </h2>

            {loadingCats ? (
              <div className="text-center py-4 text-xs text-gray-500">Cargando categorías...</div>
            ) : categories.length > 0 ? (
              <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
                {categories.map((cat) => {
                  const checked = selectedCategoryIds.includes(cat.id);
                  return (
                    <label
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs font-semibold cursor-pointer select-none transition-all ${
                        checked
                          ? 'bg-primary/10 border-primary text-white'
                          : 'bg-[#0a0a0a]/50 border-white/5 text-gray-400 hover:border-white/10'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        readOnly
                        className="rounded border-white/10 text-primary focus:ring-0 h-3.5 w-3.5 accent-primary bg-[#0a0a0a]"
                      />
                      <span>{cat.name}</span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-center text-gray-500">
                No hay categorías creadas. Ve al módulo "Categorías" primero.
              </div>
            )}
          </div>

          {/* Action button bar */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary hover:bg-red-700 disabled:opacity-40 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg select-none cursor-pointer transition-colors text-sm tracking-widest uppercase flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Registrando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar Película
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
