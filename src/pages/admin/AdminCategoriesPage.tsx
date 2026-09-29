import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Tag, Upload, AlertCircle } from 'lucide-react';
import { fetchCategories, saveCategory, deleteCategory, fetchAllAdminProducts, uploadProductImage } from '../../services/storeService';
import { Category, Product } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { showToast } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    const [cats, prods] = await Promise.all([
      fetchCategories(),
      fetchAllAdminProducts(),
    ]);

    // Attach product count to each category
    const withCount = cats.map(c => ({
      ...c,
      product_count: prods.filter(p => p.category_id === c.id).length
    }));

    setCategories(withCount);
    setProducts(prods);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingCategory({
      name: '',
      slug: '',
      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80',
      description: '',
      active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory({ ...category });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadProductImage(file);
      setEditingCategory(prev => prev ? { ...prev, image: url } : null);
      showToast('Image Uploaded', 'Category image attached.', 'success');
    } catch (err: any) {
      showToast('Upload Failed', err.message || 'Image upload failed', 'error');
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name) {
      showToast('Validation Error', 'Category name is required.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await saveCategory(editingCategory);
      showToast('Category Saved', `"${editingCategory.name}" saved.`, 'success');
      setIsModalOpen(false);
      setEditingCategory(null);
      await loadData();
    } catch (err: any) {
      showToast('Save Error', err.message || 'Failed to save category.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    const dependentCount = products.filter(p => p.category_id === category.id).length;
    if (dependentCount > 0) {
      showToast(
        'Cannot Delete Category',
        `This category has ${dependentCount} active products depending on it. Reassign products first.`,
        'error'
      );
      return;
    }

    if (window.confirm(`Are you sure you want to delete category "${category.name}"?`)) {
      try {
        await deleteCategory(category.id);
        showToast('Category Deleted', `"${category.name}" removed.`, 'info');
        await loadData();
      } catch (err: any) {
        showToast('Delete Error', err.message || 'Failed to delete category.', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-dark-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Category Management</h1>
          <p className="text-xs text-dark-400 mt-1">Organize products into intuitive store sections.</p>
        </div>
        <Button
          variant="gold"
          size="md"
          onClick={openAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
          className="font-extrabold shadow-md"
        >
          Add New Category
        </Button>
      </div>

      {/* Category Table */}
      <div className="bg-dark-900 border border-dark-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-dark-950 text-dark-400 uppercase tracking-wider border-b border-dark-800">
                <th className="p-4 font-bold">Category</th>
                <th className="p-4 font-bold">Description</th>
                <th className="p-4 font-bold">Products Linked</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800/60 text-dark-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-dark-400">Loading categories...</td>
                </tr>
              ) : categories.map(cat => (
                <tr key={cat.id} className="hover:bg-dark-800/40">
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-12 h-12 object-cover rounded-xl border border-dark-700 shrink-0"
                    />
                    <div>
                      <p className="font-bold text-white text-xs">{cat.name}</p>
                      <p className="text-[10px] text-dark-400 font-mono">slug: {cat.slug}</p>
                    </div>
                  </td>

                  <td className="p-4 max-w-xs truncate text-dark-300">
                    {cat.description || 'No description'}
                  </td>

                  <td className="p-4 font-bold text-white">
                    <span className="bg-dark-800 border border-dark-700 px-2.5 py-1 rounded-full">
                      {cat.product_count} Products
                    </span>
                  </td>

                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      cat.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-dark-800 text-dark-500'
                    }`}>
                      {cat.active ? 'Active' : 'Hidden'}
                    </span>
                  </td>

                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-1.5 text-dark-400 hover:text-white bg-dark-800 rounded-lg transition-colors"
                      title="Edit Category"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      className="p-1.5 text-dark-400 hover:text-rose-400 bg-dark-800 rounded-lg transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory?.id ? 'Edit Category' : 'Add New Category'}
      >
        {editingCategory && (
          <form onSubmit={handleSaveCategory} className="space-y-4 text-dark-900">
            <Input
              label="Category Name"
              value={editingCategory.name || ''}
              onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
              required
            />

            <Input
              label="URL Slug"
              value={editingCategory.slug || ''}
              onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
            />

            <div>
              <label className="text-xs font-bold text-dark-800 uppercase">Category Image URL or File</label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={editingCategory.image || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, image: e.target.value })}
                />
                <label className="cursor-pointer bg-dark-900 text-white font-bold text-xs px-3 py-2 rounded-xl shrink-0 flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-dark-800 uppercase">Description</label>
              <textarea
                rows={2}
                value={editingCategory.description || ''}
                onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                className="w-full bg-white border border-dark-200 rounded-xl p-3 text-sm text-dark-900 focus:outline-none mt-1"
              />
            </div>

            <div className="pt-4 border-t border-dark-100 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="gold" isLoading={isSaving} className="font-extrabold">Save Category</Button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};
