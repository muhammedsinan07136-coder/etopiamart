import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Zap, Eye, Check } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  const primaryImage = product.images[currentImageIndex] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';
  const secondaryImage = product.images[1] || primaryImage;

  const isOutOfStock = product.stock <= 0;

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
    navigate('/checkout');
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
  };

  return (
    <div
      className="group bg-white rounded-2xl border border-dark-100/80 shadow-subtle hover:shadow-elevated transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
      onMouseEnter={() => product.images.length > 1 && setCurrentImageIndex(1)}
      onMouseLeave={() => setCurrentImageIndex(0)}
    >
      {/* Top Badges */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex flex-col gap-1">
          {product.discount_percentage > 0 && (
            <Badge variant="discount">
              {product.discount_percentage}% OFF
            </Badge>
          )}
          {product.bestseller && (
            <Badge variant="bestseller">
              Bestseller
            </Badge>
          )}
        </div>

        {isOutOfStock ? (
          <Badge variant="outOfStock">Out of Stock</Badge>
        ) : product.stock <= 5 ? (
          <Badge variant="stock" className="bg-amber-100 text-amber-900 border-amber-300">
            Only {product.stock} left
          </Badge>
        ) : null}
      </div>

      {/* Product Image Container */}
      <Link to={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden bg-dark-50">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Quick View Hover Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="bg-white text-dark-900 text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <Eye className="w-3.5 h-3.5" />
            Quick View
          </span>
        </div>
      </Link>

      {/* Product Details Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category Tag */}
          <span className="text-[10px] font-bold uppercase tracking-wider text-dark-400">
            {product.category_name || 'Everyday Useful'}
          </span>

          {/* Product Name */}
          <Link to={`/product/${product.slug}`}>
            <h3 className="font-bold text-sm text-dark-900 group-hover:text-brand-600 transition-colors line-clamp-2 mt-0.5 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Short description */}
          {product.short_description && (
            <p className="text-xs text-dark-500 line-clamp-1 mt-1 font-normal">
              {product.short_description}
            </p>
          )}
        </div>

        {/* Price & Action Buttons */}
        <div className="mt-4 pt-3 border-t border-dark-100">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-lg font-extrabold text-dark-950">₹{product.price}</span>
              {product.original_price > product.price && (
                <span className="text-xs text-dark-400 line-through ml-2">₹{product.original_price}</span>
              )}
            </div>
            <span className="text-[11px] font-semibold text-emerald-600">COD Available</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Add to Cart
            </Button>

            <Button
              variant="gold"
              size="sm"
              disabled={isOutOfStock}
              onClick={handleBuyNow}
              leftIcon={<Zap className="w-3.5 h-3.5" />}
              className="text-xs font-bold"
            >
              Buy Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
