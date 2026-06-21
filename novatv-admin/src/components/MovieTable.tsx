import React, { useState, useEffect } from 'react';
import { Movie, Category } from '../types';
import { Search, Edit, Trash2, CheckCircle2, AlertCircle, Plus, Eye } from 'lucide-react';

interface MovieTableProps {
  movies: Movie[];
  categories: Category[];
  onEdit: (movie: Movie) => void;
  onDelete: (id: string) => void;
  onAddClick: () => void;
}

export const MovieTable: React.FC<MovieTableProps> = ({
  movies,
  categories,
  onEdit,
  onDelete,
  onAddClick,
}) => {
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState<Movie[]>(movies);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(movies);
    } else {
      const q = search.toLowerCase();
      setFiltered(
        movies.filter(
          (m) =>
            m.title.toLowerCase().includes(q) ||
            (m.genre && m.genre.some((g) => g.toLowerCase().includes(q)))
        )
      );
    }
  }, [search, movies]);

  const confirmDelete = (movie: Movie) => {
    if (window.confirm(`¿Estás seguro de eliminar "${movie.title}"?`)) {
      onDelete(movie.id);
    }
  };

  return (
    <div className="bg-surface rounded-xl border border-white/5 overflow-hidden">
      <div className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between border-b border-white/5">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por título o género..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0a0a0a] text-white pl-9 pr-4 py-2 rounded-lg border border-white/5 focus:outline-none focus:border-primary text-sm transition-all"
          />
        </div>
        <button
          onClick={onAddClick}
          className="w-full md:w-auto bg-primary hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <Plus className="h-4 w-4" />
          Agregar Película
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01] text-xs font-semibold text-gray-400">
              <th className="p-4 w-20">Póster</th>
              <th className="p-4">Título</th>
              <th className="p-4 w-24">Año</th>
              <th className="p-4">Género(s)</th>
              <th className="p-4 w-36">Enlaces de Vídeo</th>
              <th className="p-4 w-24 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.length > 0 ? (
              filtered.map((item) => {
                const badgeStyle = 'text-[10px] font-bold px-1.5 py-0.5 rounded';
                const hasBackup1 = !!item.embed_url_2;
                const hasBackup2 = !!item.embed_url_3;

                return (
                  <tr key={item.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-4">
                      {item.poster_url ? (
                        <img
                          src={item.poster_url}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="h-14 w-10 object-cover rounded bg-white/5"
                        />
                      ) : (
                        <div className="h-14 w-10 bg-[#1c1c1c] border border-white/5 rounded flex items-center justify-center text-xs text-gray-500">
                          🎬
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{item.title}</span>
                          {item.is_featured && (
                            <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                              Destacada
                            </span>
                          )}
                        </div>
                        {item.rating && (
                          <span className="text-[10px] font-semibold text-gray-400 mt-0.5 uppercase">
                            Rating: {item.rating} • {item.duration_minutes || '?'} min
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-gray-300 font-mono text-xs">{item.year || 'N/A'}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {item.genre && item.genre.length > 0 ? (
                          item.genre.map((g) => (
                            <span
                              key={g}
                              className="bg-white/5 text-gray-300 border border-white/5 text-[10px] px-1.5 py-0.5 rounded"
                            >
                              {g}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500">-</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                          <span className="font-medium truncate max-w-[124px]">Principal</span>
                        </div>
                        <div className="flex gap-2 text-[10px]">
                          <span className={hasBackup1 ? 'text-emerald-400 font-bold' : 'text-gray-500'}>
                            R1: {hasBackup1 ? '✓' : '✗'}
                          </span>
                          <span className={hasBackup2 ? 'text-emerald-400 font-bold' : 'text-gray-500'}>
                            R2: {hasBackup2 ? '✓' : '✗'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEdit(item)}
                          className="bg-white/5 hover:bg-white/10 text-gray-300 p-2 rounded transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => confirmDelete(item)}
                          className="bg-red-500/10 hover:bg-primary text-red-500 hover:text-white p-2 rounded transition-colors cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="text-center p-12 text-gray-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                  No se encontraron películas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
