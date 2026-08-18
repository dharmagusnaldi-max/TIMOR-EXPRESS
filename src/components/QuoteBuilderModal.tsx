import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Send
} from 'lucide-react';
import { CustomQuote, Language, Currency, Product } from '../types';
import { getTranslation } from '../utils/i18n';
import { calculateBorderBreakdown } from '../utils/currency';

interface QuoteBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  language: Language;
  currency: Currency;
  onQuoteCreated: (quote: CustomQuote) => void;
}

export const QuoteBuilderModal: React.FC<QuoteBuilderModalProps> = ({
  isOpen,
  onClose,
  products,
  language,
  currency,
  onQuoteCreated,
}) => {
  if (!isOpen) return null;

  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(5);
  const [customDiscountUSD, setCustomDiscountUSD] = useState<number>(0);
  const [destination, setDestination] = useState<string>('Dili Audian Hub');
  const [notes, setNotes] = useState<string>('Includes official Asycuda customs declaration and Batugade cross-docking.');

  const product = products.find((p) => p.id === selectedProductId) || products[0];

  const rawBaseUSD = (product?.priceUSD || 20) * quantity - customDiscountUSD;
  const baseUSD = Math.max(1, rawBaseUSD);
  const weightTotalKg = (product?.weightKg || 1) * quantity;

  const breakdown = calculateBorderBreakdown(
    baseUSD,
    weightTotalKg,
    product?.seller.city || 'Kupang',
    destination
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    const newQuote: CustomQuote = {
      id: `quote-${Date.now()}`,
      quoteNumber: `TE-QUOTE-2026-${Math.floor(100 + Math.random() * 900)}`,
      sellerId: product.seller.id,
      sellerName: product.seller.name,
      sellerOrigin: `${product.seller.city}, ${product.seller.province}`,
      buyerName: 'Valued Timor Buyer',
      destination: `${destination}, Timor-Leste`,
      items: [
        {
          productId: product.id,
          productTitle: product.title[language],
          quantity,
          unitPriceUSD: product.priceUSD,
          unitPriceIDR: product.priceIDR,
          weightKg: product.weightKg,
        },
      ],
      basePriceUSD: breakdown.basePriceUSD,
      domesticFreightUSD: breakdown.domesticFreightUSD,
      borderHubHandlingUSD: breakdown.borderHubUSD,
      customsDutyTaxUSD: breakdown.customsTaxUSD,
      lastMileDeliveryUSD: breakdown.lastMileUSD,
      totalUSD: breakdown.totalUSD,
      totalIDR: breakdown.totalIDR,
      status: 'pending',
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      validUntil: new Date(Date.now() + 7 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      notes,
      routeSummary: `${product.seller.city} ➔ Atambua Border Hub ➔ Mota'ain PLBN ➔ ${destination}`,
    };

    onQuoteCreated(newQuote);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1E3628]/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="modal-quote-builder"
        className="bg-[#FDFCF9] border border-[#E5E1D8] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col text-[#2D4F3C]"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-[#E5E1D8] px-4 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#D4A373]" />
            <h3 className="font-bold text-sm text-[#2D4F3C]">
              {getTranslation(language, 'quoteBuilderTitle')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-[#F0EDE7] hover:bg-[#E5E1D8] text-[#4A4A4A] hover:text-[#2D4F3C] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs">
          {/* Select Product */}
          <div>
            <label className="block text-[#4A4A4A] font-bold mb-1">
              Select Item / Product:
            </label>
            <select
              id="select-quote-product"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-white border border-[#E5E1D8] rounded-xl p-2.5 text-[#2D4F3C] font-semibold focus:outline-none focus:ring-1 focus:ring-[#2D4F3C]"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title[language]} (${p.priceUSD.toFixed(2)} - from {p.seller.city})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity & Discount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#4A4A4A] font-bold mb-1">
                Wholesale Quantity:
              </label>
              <input
                id="input-quote-qty"
                type="number"
                min="1"
                max="500"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-white border border-[#E5E1D8] rounded-xl p-2.5 text-[#2D4F3C] font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[#4A4A4A] font-bold mb-1">
                Wholesale Discount ($ USD):
              </label>
              <input
                id="input-quote-discount"
                type="number"
                min="0"
                step="0.5"
                value={customDiscountUSD}
                onChange={(e) => setCustomDiscountUSD(Number(e.target.value))}
                className="w-full bg-white border border-[#E5E1D8] rounded-xl p-2.5 text-[#2D4F3C] font-mono font-bold"
              />
            </div>
          </div>

          {/* Destination */}
          <div>
            <label className="block text-[#4A4A4A] font-bold mb-1">
              Destination Hub in Timor-Leste:
            </label>
            <select
              id="select-quote-dest"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-white border border-[#E5E1D8] rounded-xl p-2.5 text-[#2D4F3C] font-medium"
            >
              <option value="Dili Audian Hub">Dili Central Hub (Audian / Comoro)</option>
              <option value="Baucau Hub">Baucau Second Hub</option>
              <option value="Maliana Border Hub">Maliana / Bobonaro District</option>
              <option value="Ermera Hub">Ermera Gleno Highlands</option>
              <option value="Oecusse Enclave">RAEOA / Oecusse Enclave</option>
            </select>
          </div>

          {/* Live Calculated Transparent Breakdown */}
          <div className="bg-[#F0EDE7] border border-[#E5E1D8] rounded-xl p-3.5 space-y-2">
            <div className="font-bold text-[#2D4F3C] uppercase tracking-wider text-[11px] flex items-center justify-between">
              <span>Transparent Proforma Itemization:</span>
              <span className="font-mono">{weightTotalKg.toFixed(1)} kg total</span>
            </div>

            <div className="space-y-1.5 text-[#4A4A4A] font-mono text-[11px]">
              <div className="flex justify-between">
                <span>1. Base Item Price ({quantity}x):</span>
                <span className="text-[#2D4F3C] font-semibold">${breakdown.basePriceUSD.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>2. Domestic Freight to Atambua:</span>
                <span className="text-[#2D4F3C] font-semibold">${breakdown.domesticFreightUSD.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>3. Border Hub Handling & PEB:</span>
                <span className="text-[#2D4F3C] font-semibold">${breakdown.borderHubUSD.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>4. Timor-Leste Customs (2.5%+2.5%):</span>
                <span className="text-[#B45309] font-bold">${breakdown.customsTaxUSD.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>5. Last-Mile to {destination}:</span>
                <span className="text-[#2D4F3C] font-semibold">${breakdown.lastMileUSD.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-[#E5E1D8] flex justify-between font-black text-[#2D4F3C] text-xs">
                <span>Total Formal Quote (USD):</span>
                <span>${breakdown.totalUSD.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] text-[#4A4A4A]">
                <span>Equivalent in Indonesian Rupiah:</span>
                <span>Rp {breakdown.totalIDR.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              id="btn-submit-create-quote"
              type="submit"
              className="w-full bg-[#2D4F3C] hover:bg-[#1E3628] text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>{getTranslation(language, 'sendQuoteToBuyer')} (${breakdown.totalUSD.toFixed(2)})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
