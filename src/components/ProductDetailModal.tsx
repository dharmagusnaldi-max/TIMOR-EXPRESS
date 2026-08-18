import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  MessageSquareQuote, 
  ShoppingCart, 
  Scale, 
  Truck, 
  Calculator,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { Product, Language, Currency } from '../types';
import { getTranslation } from '../utils/i18n';
import { calculateBorderBreakdown } from '../utils/currency';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  currency: Currency;
  onStartChat: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onDirectCheckout: (product: Product, quantity: number, municipality: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  language,
  currency,
  onStartChat,
  onAddToCart,
  onDirectCheckout,
}) => {
  if (!isOpen || !product) return null;

  const [quantity, setQuantity] = useState<number>(1);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('Dili');

  const municipalities = [
    { id: 'Dili', name: 'Dili (Central Hub Audian/Comoro)', transitDays: '3-4 days' },
    { id: 'Baucau', name: 'Baucau (Second Hub)', transitDays: '4-5 days' },
    { id: 'Maliana', name: 'Bobonaro / Maliana (Near Border)', transitDays: '2-3 days' },
    { id: 'Ermera', name: 'Ermera (Gleno Highlands)', transitDays: '3-4 days' },
    { id: 'Suai', name: 'Covalima / Suai', transitDays: '3-4 days' },
    { id: 'Oecusse', name: 'RAEOA / Oecusse Enclave (Ferry/Land)', transitDays: '4-6 days' },
  ];

  const breakdown = calculateBorderBreakdown(
    product.priceUSD * quantity,
    product.weightKg * quantity,
    product.seller.city,
    selectedMunicipality
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1E3628]/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="modal-product-detail"
        className="bg-[#FDFCF9] border border-[#E5E1D8] rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col text-[#2D4F3C]"
      >
        {/* Modal Top Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-[#E5E1D8] px-4 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#F0EDE7] text-[#2D4F3C] border border-[#E5E1D8] px-2.5 py-0.5 rounded-full font-mono font-bold">
              {product.customsCategoryCode}
            </span>
            <span className="text-xs text-[#4A4A4A] font-medium">Cross-Border Verified</span>
          </div>
          <button
            id="btn-close-product-detail"
            onClick={onClose}
            className="p-1 rounded-lg bg-[#F0EDE7] hover:bg-[#E5E1D8] text-[#4A4A4A] hover:text-[#2D4F3C] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Main Hero Media & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl overflow-hidden aspect-[4/3] bg-[#EAE7DF] relative border border-[#E5E1D8]">
              <img
                src={product.images[0]}
                alt={product.title[language]}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs text-[#2D4F3C] bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-[#E5E1D8]">
                <span className="flex items-center gap-1 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-[#D4A373]" />
                  {product.seller.city}, {product.seller.province}
                </span>
                <span className="font-mono text-[#2D4F3C] font-bold">{product.weightKg} kg</span>
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <div>
                {/* Seller info pill */}
                <div className="flex items-center justify-between text-xs text-[#4A4A4A] mb-2">
                  <span className="flex items-center gap-1 font-bold text-[#2D4F3C]">
                    <ShieldCheck className="w-4 h-4 text-[#2D4F3C]" />
                    {product.seller.name}
                  </span>
                  <span className="text-[#D4A373] font-mono font-bold">★ {product.seller.rating}</span>
                </div>

                <h2 className="text-base sm:text-lg font-black text-[#2D4F3C] leading-snug mb-2">
                  {product.title[language]}
                </h2>

                <p className="text-xs text-[#4A4A4A] leading-relaxed mb-3">
                  {product.description[language]}
                </p>

                {/* Features bullet list */}
                <div className="space-y-1 mb-3">
                  {product.features[language]?.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs text-[#4A4A4A]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2D4F3C] shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price block */}
              <div className="bg-[#F9F7F2] p-3 rounded-xl border border-[#E5E1D8]">
                <div className="text-xs text-[#4A4A4A] mb-0.5 font-medium">Base Supplier Price:</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-[#2D4F3C] font-mono">
                    ${product.priceUSD.toFixed(2)} USD
                  </span>
                  <span className="text-xs text-[#4A4A4A] font-mono">
                    (Rp {product.priceIDR.toLocaleString('id-ID')} IDR)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Landed Cost Calculator Box in Natural Tones */}
          <div className="bg-[#F9F7F2] border border-[#E5E1D8] rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3 border-b border-[#E5E1D8] pb-2.5">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#2D4F3C]" />
                <h4 className="text-xs sm:text-sm font-bold text-[#2D4F3C] uppercase tracking-wider">
                  {getTranslation(language, 'costBreakdown')}
                </h4>
              </div>
              <span className="text-[11px] text-[#2D4F3C] font-mono font-semibold">
                Mota'ain Port Corridor
              </span>
            </div>

            {/* Controls: Quantity & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-[11px] text-[#4A4A4A] block mb-1 font-medium">
                  {getTranslation(language, 'calculateShippingTo')}:
                </label>
                <select
                  id="select-detail-municipality"
                  value={selectedMunicipality}
                  onChange={(e) => setSelectedMunicipality(e.target.value)}
                  className="w-full bg-white border border-[#E5E1D8] rounded-lg text-xs text-[#2D4F3C] font-medium p-2 focus:ring-1 focus:ring-[#2D4F3C] focus:outline-none"
                >
                  {municipalities.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.transitDays})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-[#4A4A4A] block mb-1 font-medium">
                  Quantity (Unidade):
                </label>
                <div className="flex items-center bg-white border border-[#E5E1D8] rounded-lg p-1">
                  <button
                    id="btn-qty-minus"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-6 rounded bg-[#F0EDE7] hover:bg-[#E5E1D8] text-[#2D4F3C] text-xs font-bold transition flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center text-xs font-mono font-bold text-[#2D4F3C]">
                    {quantity}
                  </span>
                  <button
                    id="btn-qty-plus"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 h-6 rounded bg-[#F0EDE7] hover:bg-[#E5E1D8] text-[#2D4F3C] text-xs font-bold transition flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* 5-Step Transparent Cost Breakdown */}
            <div className="space-y-2 text-xs border-t border-[#E5E1D8] pt-3">
              <div className="flex items-center justify-between text-[#4A4A4A]">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#E5E1D8] text-[10px] flex items-center justify-center text-[#2D4F3C] font-bold">1</span>
                  <span>{getTranslation(language, 'itemPrice')} ({quantity}x)</span>
                </span>
                <span className="font-mono text-[#2D4F3C] font-semibold">${breakdown.basePriceUSD.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-[#4A4A4A]">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#E5E1D8] text-[10px] flex items-center justify-center text-[#2D4F3C] font-bold">2</span>
                  <span>{getTranslation(language, 'freightID')} ({product.seller.city} ➔ Atambua)</span>
                </span>
                <span className="font-mono text-[#2D4F3C] font-semibold">${breakdown.domesticFreightUSD.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-[#4A4A4A]">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#E5E1D8] text-[10px] flex items-center justify-center text-[#2D4F3C] font-bold">3</span>
                  <span>{getTranslation(language, 'borderHubFee')}</span>
                </span>
                <span className="font-mono text-[#2D4F3C] font-semibold">${breakdown.borderHubUSD.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-[#4A4A4A]">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#E5E1D8] text-[10px] flex items-center justify-center text-[#2D4F3C] font-bold">4</span>
                  <span>{getTranslation(language, 'customsFee')} (2.5% Duty + 2.5% Sales Tax)</span>
                </span>
                <span className="font-mono text-[#B45309] font-bold">${breakdown.customsTaxUSD.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-[#4A4A4A]">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#E5E1D8] text-[10px] flex items-center justify-center text-[#2D4F3C] font-bold">5</span>
                  <span>{getTranslation(language, 'lastMileFee')} (Batugade ➔ {selectedMunicipality})</span>
                </span>
                <span className="font-mono text-[#2D4F3C] font-semibold">${breakdown.lastMileUSD.toFixed(2)}</span>
              </div>

              {/* Total Landed Summary Bar */}
              <div className="mt-3 pt-2.5 border-t border-[#E5E1D8] flex items-center justify-between bg-white p-3 rounded-xl border border-[#E5E1D8] shadow-xs">
                <div>
                  <div className="text-[11px] font-bold text-[#2D4F3C] uppercase">
                    {getTranslation(language, 'estimatedTotalLanding')}:
                  </div>
                  <div className="text-[10px] text-[#4A4A4A]">
                    Includes all border customs & doorstep transport
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-[#2D4F3C] font-mono">
                    ${breakdown.totalUSD.toFixed(2)} USD
                  </div>
                  <div className="text-[10px] text-[#4A4A4A] font-mono">
                    ≈ Rp {breakdown.totalIDR.toLocaleString('id-ID')} IDR
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="sticky bottom-0 bg-white border-t border-[#E5E1D8] p-4 flex flex-wrap items-center justify-between gap-3">
          <button
            id="btn-modal-chat-seller"
            onClick={() => {
              onClose();
              onStartChat(product);
            }}
            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-[#F0EDE7] hover:bg-[#E5E1D8] text-[#2D4F3C] text-xs font-bold py-2.5 px-3 rounded-xl border border-[#E5E1D8] transition"
          >
            <MessageSquareQuote className="w-4 h-4 text-[#D4A373]" />
            <span>{getTranslation(language, 'directChat')}</span>
          </button>

          <button
            id="btn-modal-add-cart"
            onClick={() => {
              onAddToCart(product, quantity);
              onClose();
            }}
            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-white hover:bg-[#F9F7F2] text-[#2D4F3C] text-xs font-bold py-2.5 px-3 rounded-xl border border-[#E5E1D8] transition shadow-xs"
          >
            <ShoppingCart className="w-4 h-4 text-[#D4A373]" />
            <span>{getTranslation(language, 'addToCart')}</span>
          </button>

          <button
            id="btn-modal-buy-now"
            onClick={() => {
              onClose();
              onDirectCheckout(product, quantity, selectedMunicipality);
            }}
            className="w-full sm:w-auto flex-1 min-w-[180px] flex items-center justify-center gap-2 bg-[#2D4F3C] hover:bg-[#1E3628] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition shadow-xs"
          >
            <span>{getTranslation(language, 'buyNow')} (${breakdown.totalUSD.toFixed(2)})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
