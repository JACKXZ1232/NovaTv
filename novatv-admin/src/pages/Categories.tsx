import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Category } from '../types';
import { ArrowUp, ArrowDown, Plus, Trash2, LayoutGrid, RotateCcw, AlertCircle } from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setErrorLocal(null);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setErrorLocal('No se pudieron cargar las categorías de Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setSaving(true);
    setErrorLocal(null);
    try {
      // Find highest index
      const maxIndex = categories.reduce((max, c) => (c.order_index > max ? c.order_index : max), 0);

      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: newCatName.trim(), order_index: maxIndex + 1 }])
        .select();

      if (error) throw error;
      setNewCatName('');
      await fetchCategories();
    } catch (err: any) {
      console.error('Error saving category:', err);
      setErrorLocal('Error al registrar la categoría.');
    } finally {
      setSaving(false);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === categories.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const currentCat = categories[index];
    const swapCat = categories[targetIndex];

    try {
      // Optimistic locally
      const listCopy = [...categories];
      const currentOrder = currentCat.order_index;
      currentCat.order_index = swapCat.order_index;
      swapCat.order_index = currentOrder;

      listCopy[index] = swapCat;
      listCopy[targetIndex] = currentCat;
      setCategories(listCopy);

      // Save database adjustments
      const { error: err1 } = await supabase
        .from('categories')
        .update({ order_index: currentCat.order_index })
        .eq('id', currentCat.id);

      const { error: err2 } = await supabase
        .from('categories')
        .update({ order_index: swapCat.order_index })
        .eq('id', swapCat.id);

      if (err1 || err2) throw new Error('Query error');
    } catch (e) {
      console.error('Error shifting index:', e);
      // rollback recalculating
      fetchCategories();
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${name}"? Esta acción no se puede deshacer.`)) return;

    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      await fetchCategories();
    } catch (err) {
      console.error('Error deleting:', err);
      setErrorLocal('No se puede eliminar porque tiene relaciones persistentes.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center bg-surface p-4 rounded-xl border border-white/5">
        <div className="flex items-center gap-3">
          <div className="bg-[#E50914]/15 p-2 rounded text-primary">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Gestión de Categorías</h1>
            <p className="text-xs text-gray-400">Organiza las categorías en las filas de la app móvil</p>
          </div>
        </div>
        <button
          onClick={fetchCategories}
          className="bg-white/5 hover:bg-white/10 text-gray-300 p-2 rounded-lg transition-all cursor-pointer"
          title="Recargar"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {errorLocal && (
        <div className="bg-red-500/10 border border-red-500/15 text-red-400 p-4 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{errorLocal}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-surface p-6 rounded-xl border border-white/5 h-fit">
          <h2 className="text-sm font-extrabold tracking-wider text-gray-300 uppercase mb-4">Nueva Categoría</h2>
          <form onSubmit={handleAddCategory} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-bold">Nombre del Género (Categoría)</label>
              <input
                type="text"
                placeholder="Ej: Acción Extrema, Estrenos 2026..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="bg-[#0a0a0a] text-white p-3 rounded-lg border border-white/5 focus:outline-none focus:border-primary text-sm"
                required
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-primary hover:bg-red-700 disabled:opacity-45 text-white font-bold py-2.5 rounded-lg text-sm transition-colors cursor-pointer flex justify-center items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Guardar Categoría
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-surface p-6 rounded-xl border border-white/5">
          <h2 className="text-sm font-extrabold tracking-wider text-gray-300 uppercase mb-4">Filas y Ordenación Activas</h2>

          {loading ? (
            <div className="py-20 text-center text-gray-500 text-xs">Cargando categorías...</div>
          ) : categories.length > 0 ? (
            <div className="flex flex-col gap-2">
              {categories.map((item, index) => {
                const isFirst = index === 0;
                const isLast = index === categories.length - 1;

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3.5 bg-[#0a0a0a] border border-white/5 rounded-lg hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-gray-500">#{index + 1}</span>
                      <span className="font-bold text-white text-sm">{item.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleMove(index, 'up')}
                        disabled={isFirst}
                        className={`p-1.5 rounded transition-all ${
                          isFirst
                            ? 'text-gray-700 cursor-not-allowed'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white cursor-pointer'
                        }`}
                        title="Subir fila"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleMove(index, 'down')}
                        disabled={isLast}
                        className={`p-1.5 rounded transition-all ${
                          isLast
                            ? 'text-gray-700 cursor-not-allowed'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white cursor-pointer'
                        }`}
                        title="Bajar fila"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <span className="h-4 w-[1px] bg-white/10 mx-1"></span>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="p-1.5 rounded text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Borrar categoría"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center text-gray-500 text-xs">No hay categorías registradas aún.</div>
          )}
        </div>
      </div>
    </div>
  );
}
