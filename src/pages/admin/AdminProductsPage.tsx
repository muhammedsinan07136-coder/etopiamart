import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit3, Trash2, Image as ImageIcon, Check, X, Upload, Star, Zap } from 'lucide-react';
import { fetchAllAdminProducts, fetchCategories, saveProduct, deleteProduct, uploadProductImage } from '../../services/storeService';
import { Product, Category } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { showToast } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    const [prods, cats] = await Promise.all([
      fetchAllAdminProducts(),
      fetchCategories(),
    ]);
    setProducts(prods);
    setCategories(cats);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingProduct({
      name: '',
      slug: '',
      short_description: '',
      description: '',
      category_id: categories[0]?.id || '',
      price: 999,
      original_price: 1999,
      stock: 25,
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80'
      ],
      featured: true,
      bestseller: false,
      active: true,
    });
    setIsFormOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct({ ...product });
    setIsFormOpen(true);
  };

  const openDeleteModal = (id: string) => {
    setDeletingProductId(id);
    setIsDeleteOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadProductImage(files[i]);
        uploadedUrls.push(url);
      }

      setEditingProduct(prev => prev ? {
        ...prev,
        images: [...(prev.images || []), ...uploadedUrls]
      } : null);

      showToast('Image Uploaded', `${uploadedUrls.length} image(s) attached.`, 'success');
    } catch (err: any) {
      showToast('Upload Failed', err.message || 'Image upload error', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setEditingProduct(prev => prev ? {
      ...prev,
      images: (prev.images || []).filter((_, idx) => idx !== indexToRemove)
    } : null);
  };

  const setPrimaryImage = (indexToPrimary: number) => {
    setEditingProduct(prev => {
      if (!prev || !prev.images) return prev;
      const imgs = [...prev.images];
      const selected = imgs.splice(indexToPrimary, 1)[0];
      return {
        ...prev,
        images: [selected, ...imgs]
      };
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct.price) {
      showToast('Validation Error', 'Product name and price are required.', 'error');
      return;
    }

    if (!editingProduct.images || editingProduct.images.length === 0) {
      showToast('Validation Error', 'Please attach at least one product image.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await saveProduct(editingProduct);
      showToast('Product Saved', `"${editingProduct.name}" updated successfully.`, 'success');
      setIsFormOpen(false);
      setEditingProduct(null);
      await loadData();
    } catch (err: any) {
      showToast('Save Error', err.message || 'Failed to save product.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProductId) return;
    try {
      await deleteProduct(deletingProductId);
      showToast('Product Deleted', 'Product removed from catalog.', 'info');
      setIsDeleteOpen(false);
      setDeletingProductId(null);
      await loadData();
    } catch (err: any) {
      showToast('Delete Error', err.message || 'Failed to delete product.', 'error');
    }
  };

  // Toggle active / featured inline
  const handleToggle = async (product: Product, field: 'active' | 'featured' | 'bestseller') => {
    const updated = { ...product, [field]: !product[field] };
    await saveProduct(updated);
    setProducts(prev => prev.map(p => p.id === product.id ? updated : p));
    showToast('Updated', `${product.name} ${field} state toggled.`, 'info');
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory ? p.category_id === selectedCategory : true;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-dark-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Product Management</h1>
          <p className="text-xs text-dark-400 mt-1">Add, edit, manage images, stock levels, and pricing.</p>
        </div>
        <Button
          variant="gold"
          size="md"
          onClick={openAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
          className="font-extrabold shadow-md"
        >
          Add New Product
        </Button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Input
            placeholder="Search product title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-dark-400" />}
            className="bg-dark-950 border-dark-800 text-white"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-dark-950 border border-dark-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none w-full sm:w-auto"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Data Table */}
      <div className="bg-dark-900 border border-dark-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-dark-950 text-dark-400 uppercase tracking-wider border-b border-dark-800">
                <th className="p-4 font-bold">Product</th>
                <th className="p-4 font-bold">Category</th>
                <th className="p-4 font-bold">Price</th>
                <th className="p-4 font-bold">Stock</th>
                <th className="p-4 font-bold">Toggles</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800/60 text-dark-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-dark-400">Loading catalog...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-dark-400">No products match your criteria.</td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-dark-800/40">
                    {/* Image & Title */}
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80'}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-xl border border-dark-700 bg-dark-950 shrink-0"
                      />
                      <div className="min-w-0 max-w-xs">
                        <p className="font-bold text-white text-xs line-clamp-1">{product.name}</p>
                        <p className="text-[10px] text-dark-400 font-mono">slug: {product.slug}</p>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4 font-semibold text-dark-300">
                      {product.category_name || 'Everyday'}
                    </td>

                    {/* Price & Discount */}
                    <td className="p-4">
                      <p className="font-extrabold text-white">₹{product.price}</p>
                      {product.original_price > product.price && (
                        <p className="text-[10px] text-dark-400 line-through">₹{product.original_price} ({product.discount_percentage}% OFF)</p>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="p-4">
                      {product.stock <= 0 ? (
                        <Badge variant="outOfStock">Out of Stock (0)</Badge>
                      ) : product.stock <= 5 ? (
                        <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full text-[10px]">
                          Low Stock ({product.stock})
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full text-[10px]">
                          In Stock ({product.stock})
                        </span>
                      )}
                    </td>

                    {/* Featured / Bestseller / Active Toggles */}
                    <td className="p-4 space-x-1">
                      <button
                        onClick={() => handleToggle(product, 'active')}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          product.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-dark-800 text-dark-500'
                        }`}
                      >
                        {product.active ? 'Active' : 'Inactive'}
                      </button>

                      <button
                        onClick={() => handleToggle(product, 'featured')}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          product.featured ? 'bg-brand-500/20 text-brand-400' : 'bg-dark-800 text-dark-500'
                        }`}
                      >
                        Featured
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-1.5 text-dark-400 hover:text-white bg-dark-800 rounded-lg transition-colors"
                        title="Edit Product"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(product.id)}
                        className="p-1.5 text-dark-400 hover:text-rose-400 bg-dark-800 rounded-lg transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal Form */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingProduct?.id ? 'Edit Product' : 'Add New Product'}
        maxWidth="2xl"
      >
        {editingProduct && (
          <form onSubmit={handleSaveProduct} className="space-y-5 text-dark-900">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Product Name"
                value={editingProduct.name || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                required
              />

              <Input
                label="URL Slug (auto-generated if empty)"
                value={editingProduct.slug || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, slug: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-dark-800 uppercase">Category</label>
                <select
                  value={editingProduct.category_id || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category_id: e.target.value })}
                  className="w-full bg-white border border-dark-200 rounded-xl px-3 py-2.5 text-sm text-dark-900 focus:outline-none mt-1"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <Input
                label="Price (₹)"
                type="number"
                value={editingProduct.price || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                required
              />

              <Input
                label="Original Price (₹)"
                type="number"
                value={editingProduct.original_price || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, original_price: Number(e.target.value) })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Stock Quantity"
                type="number"
                value={editingProduct.stock !== undefined ? editingProduct.stock : 0}
                onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                required
              />

              <Input
                label="Short Highlight Description"
                value={editingProduct.short_description || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, short_description: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-dark-800 uppercase">Full Product Description</label>
              <textarea
                rows={3}
                value={editingProduct.description || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                className="w-full bg-white border border-dark-200 rounded-xl p-3 text-sm text-dark-900 focus:outline-none mt-1"
              />
            </div>

            {/* Product Image Management */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-dark-800 uppercase">Product Images (Multiple Supported)</label>
                <label className="cursor-pointer bg-dark-900 hover:bg-black text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Uploading...' : 'Upload Image File'}</span>
                  <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" disabled={isUploading} />
                </label>
              </div>

              {/* Image Previews Grid */}
              <div className="grid grid-cols-4 gap-3 bg-dark-50 p-3 rounded-2xl border border-dark-200">
                {(editingProduct.images || []).map((imgUrl, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-dark-200 group bg-white">
                    <img src={imgUrl} alt={`Prod Image ${idx}`} className="w-full h-full object-cover" />
                    
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 bg-brand-500 text-dark-950 font-extrabold text-[9px] px-1.5 py-0.5 rounded-md">
                        Primary
                      </span>
                    )}

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(idx)}
                          className="p-1 bg-brand-500 text-dark-950 rounded-md text-[10px] font-bold"
                          title="Make Primary"
                        >
                          Primary
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="p-1 bg-rose-600 text-white rounded-md"
                        title="Remove Image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Checkbox Toggles */}
            <div className="flex items-center gap-6 pt-2 text-xs font-bold text-dark-800">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingProduct.active !== false}
                  onChange={(e) => setEditingProduct({ ...editingProduct, active: e.target.checked })}
                  className="w-4 h-4 rounded text-dark-900"
                />
                <span>Active in Store</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(editingProduct.featured)}
                  onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                  className="w-4 h-4 rounded text-dark-900"
                />
                <span>Featured Homepage Item</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(editingProduct.bestseller)}
                  onChange={(e) => setEditingProduct({ ...editingProduct, bestseller: e.target.checked })}
                  className="w-4 h-4 rounded text-dark-900"
                />
                <span>Bestseller Tag</span>
              </label>
            </div>

            <div className="pt-4 border-t border-dark-100 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button type="submit" variant="gold" isLoading={isSaving} className="font-extrabold">Save Product</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Confirm Product Deletion">
        <div className="space-y-4 text-dark-900">
          <p className="text-sm">Are you sure you want to delete this product? This action cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleConfirmDelete}>Delete Product</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
