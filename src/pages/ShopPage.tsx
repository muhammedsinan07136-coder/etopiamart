import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search, X, RotateCcw } from 'lucide-react';
import { fetchCategories, fetchProducts } from '../services/storeService';
import { Category, Product, FilterState } from '../types';
import { ProductGrid } from '../components/product/ProductGrid';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: searchParams.get('search') || '',
    categoryId: searchParams.get('category') || '',
    minPrice: 0,
    maxPrice: 10000,
    inStockOnly: false,
    sortBy: 'newest',
  });

  useEffect(() => {
    const loadCatalog = async () => {
      setIsLoading(true);
      const [cats, products] = await Promise.all([
        fetchCategories(),
        fetchProducts(),
      ]);
      setCategories(cats);
      setAllProducts(products);
      setIsLoading(false);
    };

    loadCatalog();
  }, []);

  // Sync URL searchParams to internal state
  useEffect(() => {
    const categoryParam = searchParams.get('category') || '';
    const searchParam = searchParams.get('search') || '';
    
    // Find category ID by slug if slug passed in URL
    let categoryId = categoryParam;
    if (categoryParam && categories.length > 0) {
      const match = categories.find(c => c.slug === categoryParam || c.id === categoryParam);
      if (match) categoryId = match.id;
    }

    setFilters(prev => ({
      ...prev,
      categoryId,
      searchQuery: searchParam
    }));
  }, [searchParams, categories]);

  // Handle category selection
  const handleCategorySelect = (catId: string) => {
    const selectedCat = categories.find(c => c.id === catId);
    setFilters(prev => ({ ...prev, categoryId: catId }));
    
    if (catId) {
      setSearchParams(prev => {
        if (selectedCat) prev.set('category', selectedCat.slug);
        else prev.set('category', catId);
        return prev;
      });
    } else {
      setSearchParams(prev => {
        prev.delete('category');
        return prev;
      });
    }
  };

  const handleSearchChange = (val: string) => {
    setFilters(prev => ({ ...prev, searchQuery: val }));
    setSearchParams(prev => {
      if (val) prev.set('search', val);
      else prev.delete('search');
      return prev;
    });
  };

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      categoryId: '',
      minPrice: 0,
      maxPrice: 10000,
      inStockOnly: false,
      sortBy: 'newest',
    });
    setSearchParams({});
  };

  // Filter & Sort Calculation
  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      // 1. Search Query Filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesDesc = product.description.toLowerCase().includes(query);
        const matchesCat = (product.category_name || '').toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }

      // 2. Category Filter
      if (filters.categoryId && product.category_id !== filters.categoryId) {
        return false;
      }

      // 3. Price Filter
      if (product.price < filters.minPrice || product.price > filters.maxPrice) {
        return false;
      }

      // 4. In Stock Only
      if (filters.inStockOnly && product.stock <= 0) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price-asc') return a.price - b.price;
      if (filters.sortBy === 'price-desc') return b.price - a.price;
      if (filters.sortBy === 'popular') return (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0);
      // default: newest
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [allProducts, filters]);

  const activeCategory = categories.find(c => c.id === filters.categoryId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-dark-100 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-100 px-3 py-1 rounded-full">
            All India COD Catalog
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-dark-950 mt-2 tracking-tight">
            {activeCategory ? activeCategory.name : 'Explore All Products'}
          </h1>
          <p className="text-xs sm:text-sm text-dark-500 mt-1">
            {activeCategory ? activeCategory.description : 'Discover our full range of everyday gadgets, home items, and useful lifestyle products.'}
          </p>
        </div>

        {/* Live Search Input */}
        <div className="w-full md:w-80 shrink-0">
          <Input
            placeholder="Search catalog..."
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-dark-400" />}
            rightIcon={
              filters.searchQuery ? (
                <button onClick={() => handleSearchChange('')} className="p-1 text-dark-400 hover:text-dark-900">
                  <X className="w-4 h-4" />
                </button>
              ) : undefined
            }
          />
        </div>
      </div>

      {/* Filter Toolbar & Category Pills */}
      <div className="space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => handleCategorySelect('')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
              !filters.categoryId
                ? 'bg-dark-900 text-white shadow-sm'
                : 'bg-white border border-dark-200 text-dark-700 hover:bg-dark-100'
            }`}
          >
            All Products ({allProducts.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                filters.categoryId === cat.id
                  ? 'bg-dark-900 text-white shadow-sm'
                  : 'bg-white border border-dark-200 text-dark-700 hover:bg-dark-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Secondary Controls: Sort & Stock Toggle */}
        <div className="bg-white rounded-2xl p-4 border border-dark-100 shadow-subtle flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-dark-800">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-dark-500" />
              <span className="font-bold text-dark-900">Filter:</span>
            </div>

            {/* In Stock Only Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-dark-700 hover:text-dark-950">
              <input
                type="checkbox"
                checked={filters.inStockOnly}
                onChange={(e) => setFilters(prev => ({ ...prev, inStockOnly: e.target.checked }))}
                className="w-4 h-4 rounded text-dark-900 focus:ring-dark-900 border-dark-300"
              />
              <span>In Stock Only</span>
            </label>

            {/* Price Max Slider */}
            <div className="flex items-center gap-2 border-l border-dark-200 pl-4">
              <span className="text-dark-600">Max Price: ₹{filters.maxPrice}</span>
              <input
                type="range"
                min="500"
                max="10000"
                step="500"
                value={filters.maxPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                className="w-24 accent-brand-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-dark-500 font-bold">Sort By:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="bg-dark-50 border border-dark-200 rounded-xl px-3 py-1.5 text-xs font-bold text-dark-900 focus:outline-none focus:border-dark-900"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="popular">Popularity & Bestsellers</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips */}
        {(filters.categoryId || filters.searchQuery || filters.inStockOnly || filters.maxPrice < 10000) && (
          <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
            <span className="text-dark-400 font-bold">Active Filters:</span>
            {activeCategory && (
              <span className="bg-brand-100 text-brand-900 font-bold px-3 py-1 rounded-full flex items-center gap-1">
                Category: {activeCategory.name}
                <button onClick={() => handleCategorySelect('')} className="p-0.5 hover:text-black">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.searchQuery && (
              <span className="bg-dark-100 text-dark-900 font-bold px-3 py-1 rounded-full flex items-center gap-1">
                Search: "{filters.searchQuery}"
                <button onClick={() => handleSearchChange('')} className="p-0.5 hover:text-black">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.inStockOnly && (
              <span className="bg-emerald-100 text-emerald-900 font-bold px-3 py-1 rounded-full flex items-center gap-1">
                In Stock Only
                <button onClick={() => setFilters(prev => ({ ...prev, inStockOnly: false }))} className="p-0.5 hover:text-black">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.maxPrice < 10000 && (
              <span className="bg-dark-100 text-dark-900 font-bold px-3 py-1 rounded-full flex items-center gap-1">
                Under ₹{filters.maxPrice}
                <button onClick={() => setFilters(prev => ({ ...prev, maxPrice: 10000 }))} className="p-0.5 hover:text-black">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={resetFilters}
              className="text-dark-500 hover:text-dark-900 underline font-semibold flex items-center gap-1 ml-2"
            >
              <RotateCcw className="w-3 h-3" />
              Reset All
            </button>
          </div>
        )}
      </div>

      {/* Product Results Header */}
      <div className="flex items-center justify-between text-xs text-dark-500 font-semibold border-b border-dark-100 pb-3">
        <span>Showing {filteredProducts.length} of {allProducts.length} products</span>
        <span>Cash on Delivery Available</span>
      </div>

      {/* Main Product Grid */}
      <ProductGrid
        products={filteredProducts}
        isLoading={isLoading}
        emptyTitle="No products match your criteria"
        emptyDescription="Try broadening your search or clearing specific filters."
      />

    </div>
  );
};
