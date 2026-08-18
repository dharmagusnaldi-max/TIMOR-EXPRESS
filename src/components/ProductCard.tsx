import React from 'react';
import { 
  MapPin, 
  Clock, 
  ShieldCheck, 
  MessageSquareQuote, 
  Plus, 
  TrendingUp, 
  Scale
} from 'lucide-react';
import { Product, Language, Currency } from '../types';
import { getTranslation } from '../utils/i18n';

interface ProductCardProps {
  product: Product;
  language: Language;
  currency: Currency;
  onSelect: (product: Product) => void;
  onStartChat: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  language,
  currency,
  onSelect,
  onStartChat,
  onAddToCart,
}) => {
  const isAtambua = product.seller.city.toLowerCase().includes('atambua');
  const isKupang = product.seller.city.toLowerCase().includes('kupang');

  const originBadgeStyle = isAtambua
    ? 'bg-[#2D4F3C] text-white border-transparent'
    : isKupang
    ? 'bg-[#F0EDE7] text-[#2D4F3C] border-[#E5E1D8]'
    : 'bg-[#F9F7F2] text-[#4A4A4A] border-[#E5E1D8]';

  return (
    <div 
      id={`product-card-${product.id}`}
      className="bg-white border border-[#E5E1D8] hover:border-[#D4A373] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col group"
    >
      {/* Top Image area with origin & delivery badges */}
      <div className="relative aspect-[4/3] bg-[#EAE7DF] overflow-hidden cursor-pointer" onClick={() => onSelect(product)}>
        <img
          src={product.images[0]}
          alt={product.title[language]}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        
        {/* Origin Badge */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border shadow-xs backdrop-blur-md flex items-center gap-1 ${originBadgeStyle}`}>
            <MapPin className="w-3 h-3" />
            <span>{product.seller.city}, {product.seller.province === 'East Java' ? 'Jawa' : 'NTT'}</span>
          </span>
        </div>

        {/* Transit Speed Badge */}
        <div className="absolute top-2.5 right-2.5">
          <span className="text-[10px] font-bold bg-white/95 text-[#B45309] border border-[#E5E1D8] px-2 py-0.5 rounded-full shadow-xs backdrop-blur-md flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#D4A373]" />
            <span>{product.estimatedDaysToDili}</span>
          </span>
        </div>

        {/* Weight & Customs Code Overlay */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-[#4A4A4A] bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md border border-[#E5E1D8]">
          <span className="flex items-center gap-1 font-medium">
            <Scale className="w-3 h-3 text-[#D4A373]" />
            {product.weightKg} kg
          </span>
          <span className="text-[#2D4F3C] font-mono font-semibold">
            {product.customsCategoryCode.split(' ')[0]}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Seller Verified bar */}
          <div className="flex items-center justify-between text-[11px] text-[#4A4A4A] mb-1.5">
            <span className="truncate flex items-center gap-1 font-medium text-[#2D4F3C]" title={product.seller.name}>
              {product.seller.verified && <ShieldCheck className="w-3.5 h-3.5 text-[#2D4F3C] shrink-0" />}
              <span className="truncate">{product.seller.name}</span>
            </span>
            <span className="text-[#D4A373] font-mono text-[10px] font-bold shrink-0">
              ★ {product.seller.rating} ({product.seller.reviewCount})
            </span>
          </div>

          {/* Product Title */}
          <h3 
            onClick={() => onSelect(product)}
            className="text-sm font-bold text-[#2D4F3C] group-hover:text-[#D4A373] transition-colors line-clamp-2 cursor-pointer leading-snug mb-2"
          >
            {product.title[language]}
          </h3>

          {/* Popular in Timor Tag */}
          <p className="text-[11px] text-[#4A4A4A] line-clamp-1 mb-3 italic flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-[#D4A373] shrink-0" />
            <span>{product.popularInTimor}</span>
          </p>
        </div>

        {/* Pricing & Actions */}
        <div className="pt-2 border-t border-[#E5E1D8]">
          {/* Dual Currency Price Display */}
          <div className="mb-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-[#2D4F3C] font-mono">
                {currency === 'USD' 
                  ? `$${product.priceUSD.toFixed(2)}` 
                  : `Rp ${product.priceIDR.toLocaleString('id-ID')}`
                }
              </span>
              <span className="text-[11px] text-[#4A4A4A] font-mono">
                {currency === 'USD' 
                  ? `(Rp ${product.priceIDR.toLocaleString('id-ID')})` 
                  : `($${product.priceUSD.toFixed(2)} USD)`
                }
              </span>
            </div>
            <div className="text-[10px] text-[#2D4F3C] font-semibold flex items-center gap-1">
              <span>+ Est. CIF & Alfándega Dili</span>
            </div>
          </div>

          {/* Action Button Row */}
          <div className="grid grid-cols-2 gap-2">
            <button
              id={`btn-chat-seller-${product.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onStartChat(product);
              }}
              className="flex items-center justify-center gap-1.5 bg-[#F0EDE7] hover:bg-[#E5E1D8] text-[#2D4F3C] text-xs font-bold py-2 px-2.5 rounded-xl border border-[#E5E1D8] transition"
              title="Chat directly with Indonesian seller with AI auto-translation"
            >
              <MessageSquareQuote className="w-3.5 h-3.5 text-[#D4A373]" />
              <span className="truncate">{getTranslation(language, 'directChat')}</span>
            </button>

            <button
              id={`btn-add-cart-${product.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="flex items-center justify-center gap-1 bg-[#2D4F3C] hover:bg-[#1E3628] text-white text-xs font-bold py-2 px-2.5 rounded-xl transition shadow-xs"
              title="Add to cart & calculate border landed cost"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="truncate">{getTranslation(language, 'addToCart')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
