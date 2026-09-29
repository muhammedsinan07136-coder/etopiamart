import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Zap, ShieldCheck, Truck, RotateCcw, Check, Star, ChevronRight, Share2 } from 'lucide-react';
import { fetchProductBySlugOrId, fetchProducts } from '../services/storeService';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProductCard } from '../components/product/ProductCard';
import { ProductDetailSkeleton } from '../components/ui/Skeleton';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'shipping' | 'returns'>('description');
  const [isLoading, setIsLoading] = useState(true);

  const { addToCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadProduct = async () => {
      if (!slug) return;
      setIsLoading(true);
      setSelectedImageIndex(0);
      setQuantity(1);

      const found = await fetchProductBySlugOrId(slug);
      if (found) {
        setProduct(found);
        // Load related products from same category
        const related = await fetchProducts({ categoryId: found.category_id });
        setRelatedProducts(related.filter(p => p.id !== found.id).slice(0, 4));
      }
      setIsLoading(false);
    };

    loadProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductDetailSkeleton />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <h2 className="text-2xl font-extrabold text-dark-900">Product Not Found</h2>
        <p className="text-xs text-dark-500">The requested product could not be located or may have been removed.</p>
        <Button variant="primary" onClick={() => navigate('/shop')}>Back to Shop</Button>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const currentImage = product.images[selectedImageIndex] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80';

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link Copied', 'Product link copied to clipboard.', 'info');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-dark-500">
        <Link to="/" className="hover:text-dark-900">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-dark-400" />
        <Link to="/shop" className="hover:text-dark-900">Shop</Link>
        <ChevronRight className="w-3.5 h-3.5 text-dark-400" />
        <span className="text-dark-900 font-bold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Column: Image Gallery & Thumbnails */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Visual */}
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-dark-100 shadow-card group">
            <img
              src={currentImage}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            
            {/* Top Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
              {product.discount_percentage > 0 && (
                <Badge variant="discount" className="text-xs px-3 py-1">
                  SAVE {product.discount_percentage}%
                </Badge>
              )}
              {product.bestseller && (
                <Badge variant="bestseller" className="text-xs px-3 py-1">
                  🔥 Best Seller
                </Badge>
              )}
            </div>

            <button
              onClick={handleShare}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/90 hover:bg-white text-dark-700 hover:text-dark-950 shadow-md backdrop-blur-xs transition-transform active:scale-95"
              title="Share Product"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Multiple Image Thumbnails */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-3">
              {product.images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 bg-white transition-all ${
                    selectedImageIndex === idx
                      ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-md scale-105'
                      : 'border-dark-100 hover:border-dark-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Pricing, Specs & Buy Action */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              {product.category_name || 'Useful Everyday Product'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-950 mt-1 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Ratings Summary Placeholder */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-dark-900">4.9</span>
              <span className="text-xs text-dark-400">(128 Verified Ratings)</span>
            </div>
          </div>

          {/* Price Block */}
          <div className="bg-dark-50 p-4 rounded-2xl border border-dark-100 space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-dark-950">₹{product.price}</span>
              {product.original_price > product.price && (
                <span className="text-sm font-semibold text-dark-400 line-through">₹{product.original_price}</span>
              )}
              {product.discount_percentage > 0 && (
                <span className="text-xs font-extrabold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                  You Save ₹{product.original_price - product.price}
                </span>
              )}
            </div>
            <p className="text-[11px] font-semibold text-dark-500">
              Inclusive of all taxes • <strong className="text-emerald-700">Cash on Delivery (COD) Available</strong>
            </p>
          </div>

          {/* Short Description */}
          <p className="text-xs sm:text-sm text-dark-600 leading-relaxed">
            {product.short_description || product.description}
          </p>

          {/* Stock Availability Indicator */}
          <div className="flex items-center gap-2">
            {isOutOfStock ? (
              <Badge variant="outOfStock" className="px-3 py-1 text-xs">Currently Out of Stock</Badge>
            ) : product.stock <= 5 ? (
              <span className="text-xs font-extrabold text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                ⚡ Only {product.stock} units left in stock!
              </span>
            ) : (
              <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> In Stock & Ready for Dispatch
              </span>
            )}
          </div>

          {/* Quantity Stepper & Action CTAs */}
          {!isOutOfStock && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-dark-800 uppercase">Quantity:</span>
                <div className="flex items-center border-2 border-dark-200 rounded-xl bg-white overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3 py-1.5 hover:bg-dark-100 font-bold text-dark-700"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 font-bold text-sm text-dark-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="px-3 py-1.5 hover:bg-dark-100 font-bold text-dark-700"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleAddToCart}
                  leftIcon={<ShoppingBag className="w-5 h-5" />}
                  className="w-full text-sm font-bold"
                >
                  Add to Cart
                </Button>

                <Button
                  variant="gold"
                  size="lg"
                  onClick={handleBuyNow}
                  leftIcon={<Zap className="w-5 h-5" />}
                  className="w-full text-sm font-extrabold shadow-md"
                >
                  Buy Now (COD)
                </Button>
              </div>
            </div>
          )}

          {/* Guarantees Box */}
          <div className="border-t border-dark-100 pt-5 space-y-3 text-xs text-dark-700 font-medium">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-dark-900">All India Doorstep Shipping</p>
                <p className="text-[11px] text-dark-500">Delivered within 3–6 business days across all states</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 text-amber-700 rounded-lg shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-dark-900">Cash on Delivery Guaranteed</p>
                <p className="text-[11px] text-dark-500">Inspect parcel and pay cash upon delivery</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-dark-900">7-Day Replacement Policy</p>
                <p className="text-[11px] text-dark-500">Easy replacement if item arrives damaged or defective</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Tabs Section: Description, Shipping & Returns */}
      <div className="bg-white rounded-3xl border border-dark-100 p-6 sm:p-8 shadow-subtle space-y-6">
        <div className="flex items-center gap-4 border-b border-dark-100 overflow-x-auto">
          <button
            onClick={() => setActiveTab('description')}
            className={`pb-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'description'
                ? 'border-brand-500 text-dark-950 font-extrabold'
                : 'border-transparent text-dark-500 hover:text-dark-900'
            }`}
          >
            Product Description & Features
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`pb-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'shipping'
                ? 'border-brand-500 text-dark-950 font-extrabold'
                : 'border-transparent text-dark-500 hover:text-dark-900'
            }`}
          >
            Shipping & COD Details
          </button>
          <button
            onClick={() => setActiveTab('returns')}
            className={`pb-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'returns'
                ? 'border-brand-500 text-dark-950 font-extrabold'
                : 'border-transparent text-dark-500 hover:text-dark-900'
            }`}
          >
            Return & Guarantee Policy
          </button>
        </div>

        {/* Tab Contents */}
        <div className="text-xs sm:text-sm text-dark-700 leading-relaxed">
          {activeTab === 'description' && (
            <div className="space-y-4">
              <p className="whitespace-pre-line">{product.description}</p>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-3">
              <h4 className="font-bold text-dark-900">All India Cash on Delivery Shipping</h4>
              <p>We deliver to all valid 6-digit pin codes across India including metros, Tier 2, Tier 3 cities, and rural locations.</p>
              <ul className="list-disc pl-5 space-y-1 text-dark-600">
                <li>Dispatch Time: Orders placed before 3:00 PM are processed the same business day.</li>
                <li>Estimated Delivery: 3 to 6 working days based on your location.</li>
                <li>Payment: Give exact cash to the courier delivery executive upon arrival.</li>
              </ul>
            </div>
          )}

          {activeTab === 'returns' && (
            <div className="space-y-3">
              <h4 className="font-bold text-dark-900">7-Day Replacement Guarantee</h4>
              <p>If your product arrives damaged, defective, or incorrect, contact our customer support team within 7 days of receiving the package for a hassle-free replacement.</p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-extrabold text-dark-950 tracking-tight">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(rel => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
