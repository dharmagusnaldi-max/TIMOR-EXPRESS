import React, { useState } from 'react';
import { 
  CreditCard, 
  MapPin, 
  Truck, 
  FileCheck2, 
  DollarSign, 
  CheckCircle2, 
  Info,
  Building,
  Smartphone,
  Landmark,
  ArrowLeft
} from 'lucide-react';
import { CartItem, CustomQuote, Language, Currency, ShipmentOrder } from '../types';
import { getTranslation } from '../utils/i18n';
import { EXCHANGE_RATE_USD_TO_IDR, calculateBorderBreakdown } from '../utils/currency';

interface SmartCheckoutProps {
  cartItems: CartItem[];
  appliedQuote?: CustomQuote | null;
  language: Language;
  currency: Currency;
  onBackToShopping: () => void;
  onOrderSuccess: (order: ShipmentOrder) => void;
}

export const SmartCheckout: React.FC<SmartCheckoutProps> = ({
  cartItems,
  appliedQuote,
  language,
  currency,
  onBackToShopping,
  onOrderSuccess,
}) => {
  // Recipient form state
  const [recipientName, setRecipientName] = useState('Alexandre Da Silva');
  const [recipientPhone, setRecipientPhone] = useState('+670 7723 8891');
  const [municipality, setMunicipality] = useState('Dili');
  const [addressLine, setAddressLine] = useState('Rua de Audian No. 14, Suku Santa Cruz, Dili');
  const [shippingRoute, setShippingRoute] = useState<'overland' | 'airland' | 'pickup'>('overland');
  const [paymentMethod, setPaymentMethod] = useState('BNCTL Bank Transfer');
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate items summary
  let baseItemsUSD = 0;
  let totalWeightKg = 0;
  let primaryOrigin = 'Kupang';

  if (appliedQuote) {
    baseItemsUSD = appliedQuote.basePriceUSD;
    totalWeightKg = appliedQuote.items.reduce((acc, it) => acc + (it.weightKg * it.quantity), 0);
    primaryOrigin = appliedQuote.sellerOrigin;
  } else {
    baseItemsUSD = cartItems.reduce((acc, item) => acc + (item.product.priceUSD * item.quantity), 0);
    totalWeightKg = cartItems.reduce((acc, item) => acc + (item.product.weightKg * item.quantity), 0);
    if (cartItems.length > 0) {
      primaryOrigin = cartItems[0].product.seller.city;
    }
  }

  // Calculate landed breakdown
  const breakdown = appliedQuote
    ? {
        basePriceUSD: appliedQuote.basePriceUSD,
        domesticFreightUSD: appliedQuote.domesticFreightUSD,
        borderHubUSD: appliedQuote.borderHubHandlingUSD,
        customsTaxUSD: appliedQuote.customsDutyTaxUSD,
        lastMileUSD: shippingRoute === 'pickup' ? 0 : appliedQuote.lastMileDeliveryUSD,
        totalUSD: shippingRoute === 'pickup' 
          ? appliedQuote.totalUSD - appliedQuote.lastMileDeliveryUSD 
          : appliedQuote.totalUSD,
        totalIDR: appliedQuote.totalIDR,
      }
    : calculateBorderBreakdown(
        baseItemsUSD,
        Math.max(1, totalWeightKg),
        primaryOrigin,
        municipality
      );

  // Adjust for route speed
  let adjustedDomesticFreight = breakdown.domesticFreightUSD;
  let adjustedLastMile = shippingRoute === 'pickup' ? 0 : breakdown.lastMileUSD;
  if (shippingRoute === 'airland') {
    adjustedDomesticFreight += 8.00;
  }

  const finalTotalUSD = Number((breakdown.basePriceUSD + adjustedDomesticFreight + breakdown.borderHubUSD + breakdown.customsTaxUSD + adjustedLastMile).toFixed(2));
  const finalTotalIDR = Math.round(finalTotalUSD * EXCHANGE_RATE_USD_TO_IDR);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const newOrder: ShipmentOrder = {
        id: `ord-${Date.now().toString().slice(-4)}`,
        orderNumber: `TEX-TL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        items: appliedQuote
          ? appliedQuote.items.map((it) => ({
              product: cartItems.find((c) => c.product.id === it.productId)?.product || cartItems[0]?.product,
              quantity: it.quantity,
            }))
          : cartItems,
        totalUSD: finalTotalUSD,
        totalIDR: finalTotalIDR,
        breakdown: {
          basePriceUSD: breakdown.basePriceUSD,
          domesticFreightUSD: adjustedDomesticFreight,
          borderHubUSD: breakdown.borderHubUSD,
          customsTaxUSD: breakdown.customsTaxUSD,
          lastMileUSD: adjustedLastMile,
        },
        destination: {
          fullName: recipientName,
          phone: recipientPhone,
          municipality,
          addressLine,
          deliveryMethod: shippingRoute === 'pickup' ? 'hub-pickup' : 'doorstep',
        },
        paymentMethod,
        paymentStatus: paymentMethod.includes('COD') ? 'cod' : 'paid',
        createdAt: new Date().toISOString(),
        estimatedDeliveryDate: new Date(Date.now() + (shippingRoute === 'airland' ? 2 : 4) * 86400000).toISOString(),
        currentStageIndex: 1,
        customsDeclarationCode: `ASYCUDA-TL-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        stages: [
          {
            id: 'stg-1',
            title: {
              tet: 'Vendedor Haruka ona',
              id: 'Pesanan Diserahkan Penjual',
              en: 'Seller Dispatched',
            },
            subtitle: {
              tet: 'Pakote sai husi Armazém Indonézia',
              id: 'Paket diambil dari gudang supplier di Indonesia',
              en: 'Package dispatched from Indonesian supplier warehouse',
            },
            location: `${primaryOrigin} Hub ➔ Trans-Timor Line`,
            status: 'completed',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            checkpointDetails: {
              tet: 'Sasán verifikadu ona no tama iha kamiaun konsolidasaun.',
              id: 'Barang terverifikasi dan masuk truk konsolidasi jalur perbatasan.',
              en: 'Item verified and loaded into cross-border logistics convoy.',
            },
          },
          {
            id: 'stg-2',
            title: {
              tet: 'Iha Dalan ba Hub Atambua',
              id: 'Dalam Perjalanan ke Hub Atambua',
              en: 'In Transit to Atambua Hub',
            },
            subtitle: {
              tet: 'Kamiaun atravesa Estrada Trans-Timor Raya',
              id: 'Truk logistik melintasi jalur Trans-Timor',
              en: 'Truck in transit along Trans-Timor Highway',
            },
            location: 'Atambua Border Consolidation Hub (Belu, NTT)',
            status: 'in-progress',
            checkpointDetails: {
              tet: 'Preparasaun dokumentu PEB esportasaun iha hub Atambua.',
              id: 'Persiapan dokumen PEB ekspor di hub Atambua.',
              en: 'Preparing export PEB manifest at Atambua Border Hub.',
            },
          },
          {
            id: 'stg-3',
            title: {
              tet: 'Pasa Alfándega Fronteira Mota\'ain',
              id: 'Bea Cukai Perbatasan Mota\'ain Lolos',
              en: 'Mota\'ain Border Customs Cleared',
            },
            subtitle: {
              tet: 'Inspesaun Karantina & Alfándega TL (Batugade PLBN)',
              id: 'Pemeriksaan Karantina & Bea Cukai Timor-Leste di PLBN Mota\'ain',
              en: 'Customs & Quarantine clearance at PLBN Mota\'ain / Batugade',
            },
            location: 'PLBN Mota\'ain - Batugade Border Crossing',
            status: 'pending',
            checkpointDetails: {
              tet: 'Prosesu deklarasaun Asycuda World iha alfándega Batugade.',
              id: 'Proses verifikasi Asycuda World di pos pabean Batugade.',
              en: 'Asycuda World validation at Batugade Customs checkpost.',
            },
          },
          {
            id: 'stg-4',
            title: {
              tet: 'To\'o ona Sentru Distribusaun Dili',
              id: 'Tiba di Hub Distribusi Dili',
              en: 'Arrived at Dili Hub',
            },
            subtitle: {
              tet: 'Konsolidasaun iha Timor Express Hub Audian/Comoro',
              id: 'Sortir lokal di Timor Express Hub Audian/Comoro Dili',
              en: 'Local sort at Timor Express Central Hub Audian/Comoro',
            },
            location: 'Timor Express Dili Hub, Rua de Audian',
            status: 'pending',
            checkpointDetails: {
              tet: 'Pakote prontu ba distribuisaun ikus.',
              id: 'Paket siap dijadwalkan kurir lokal.',
              en: 'Package staged for final local courier dispatch.',
            },
          },
          {
            id: 'stg-5',
            title: {
              tet: 'Sai ba Entrega Final',
              id: 'Kurir Mengantar ke Alamat',
              en: 'Out for Delivery',
            },
            subtitle: {
              tet: 'Kuriér Timor Express lori ba Ita-Boot nia fatin',
              id: 'Kurir membawa paket langsung ke alamat penerima',
              en: 'Courier en route to your doorstep in Timor-Leste',
            },
            location: `${addressLine}, ${municipality}`,
            status: 'pending',
            checkpointDetails: {
              tet: 'Kuriér sei kontaktu liuhusi telefone molok to\'o.',
              id: 'Kurir akan menelepon sebelum tiba di lokasi.',
              en: 'Courier will phone recipient upon doorstep arrival.',
            },
          },
        ],
        trackingHistory: [
          {
            time: 'Just now',
            title: 'Order Confirmed & Payment Received',
            description: `Payment via ${paymentMethod} verified. Direct corridor dispatch initiated.`,
            location: `${primaryOrigin} Export Hub`,
          },
        ],
      };

      onOrderSuccess(newOrder);
    }, 1200);
  };

  if (cartItems.length === 0 && !appliedQuote) {
    return (
      <div className="bg-white border border-[#E5E1D8] rounded-2xl p-8 text-center text-[#4A4A4A] shadow-xs">
        <Truck className="w-12 h-12 text-[#D4A373] mx-auto mb-3" />
        <h3 className="text-base font-bold text-[#2D4F3C] mb-1">Your Cross-Border Cart is Empty</h3>
        <p className="text-xs text-[#4A4A4A] mb-4">
          Browse products from Kupang, Atambua, and Surabaya suppliers or negotiate in chat.
        </p>
        <button
          onClick={onBackToShopping}
          className="bg-[#2D4F3C] hover:bg-[#1E3628] text-white font-bold text-xs py-2.5 px-4 rounded-xl transition shadow-xs"
        >
          Explore Indonesian Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* Checkout Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToShopping}
          className="flex items-center gap-1.5 text-xs text-[#4A4A4A] hover:text-[#2D4F3C] font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4 text-[#D4A373]" />
          <span>Back to Catalog</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-[#F0EDE7] text-[#2D4F3C] border border-[#E5E1D8] px-2.5 py-0.5 rounded-full font-bold">
            🛡️ Escrow Protected Trade
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Delivery Form & Payment Selection (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Applied Proforma Quote Badge if applicable */}
          {appliedQuote && (
            <div className="bg-[#F0EDE7] border border-[#D4A373] rounded-xl p-3 text-xs text-[#2D4F3C] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[#D4A373]" />
                <div>
                  <span className="font-bold text-[#2D4F3C]">Applying Negotiated Quote: </span>
                  <span className="font-mono">{appliedQuote.quoteNumber}</span>
                </div>
              </div>
              <span className="text-[#2D4F3C] font-bold font-mono">
                ${appliedQuote.totalUSD.toFixed(2)} USD
              </span>
            </div>
          )}

          {/* 1. Destination Address in Timor-Leste */}
          <div className="bg-white border border-[#E5E1D8] rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-[#E5E1D8] pb-2.5">
              <MapPin className="w-4 h-4 text-[#D4A373]" />
              <h3 className="font-bold text-sm text-[#2D4F3C] uppercase tracking-wider">
                {getTranslation(language, 'shippingAddress')}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#4A4A4A] mb-1 font-bold">
                  {getTranslation(language, 'recipientName')}
                </label>
                <input
                  id="input-recipient-name"
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full bg-[#F9F7F2] border border-[#E5E1D8] rounded-xl p-2.5 text-[#2D4F3C] font-semibold focus:outline-none focus:ring-1 focus:ring-[#2D4F3C]"
                />
              </div>

              <div>
                <label className="block text-[#4A4A4A] mb-1 font-bold">
                  {getTranslation(language, 'recipientPhone')}
                </label>
                <input
                  id="input-recipient-phone"
                  type="text"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full bg-[#F9F7F2] border border-[#E5E1D8] rounded-xl p-2.5 text-[#2D4F3C] font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-[#2D4F3C]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#4A4A4A] mb-1 font-bold">
                  {getTranslation(language, 'municipality')}
                </label>
                <select
                  id="select-checkout-municipality"
                  value={municipality}
                  onChange={(e) => setMunicipality(e.target.value)}
                  className="w-full bg-[#F9F7F2] border border-[#E5E1D8] rounded-xl p-2.5 text-[#2D4F3C] font-semibold focus:outline-none focus:ring-1 focus:ring-[#2D4F3C]"
                >
                  <option value="Dili">Dili (Capital Central Hub)</option>
                  <option value="Baucau">Baucau</option>
                  <option value="Maliana">Bobonaro / Maliana (Near Border)</option>
                  <option value="Ermera">Ermera (Gleno Highlands)</option>
                  <option value="Suai">Covalima / Suai</option>
                  <option value="Oecusse">RAEOA / Oecusse Enclave</option>
                  <option value="Manatuto">Manatuto</option>
                  <option value="Liquica">Liquiçá</option>
                </select>
              </div>

              <div>
                <label className="block text-[#4A4A4A] mb-1 font-bold">
                  {getTranslation(language, 'detailAddress')}
                </label>
                <input
                  id="input-detail-address"
                  type="text"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  className="w-full bg-[#F9F7F2] border border-[#E5E1D8] rounded-xl p-2.5 text-[#2D4F3C] font-semibold focus:outline-none focus:ring-1 focus:ring-[#2D4F3C]"
                />
              </div>
            </div>
          </div>

          {/* 2. Cross-Border Shipping Corridor Speed */}
          <div className="bg-white border border-[#E5E1D8] rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 border-b border-[#E5E1D8] pb-2.5">
              <Truck className="w-4 h-4 text-[#D4A373]" />
              <h3 className="font-bold text-sm text-[#2D4F3C] uppercase tracking-wider">
                {getTranslation(language, 'shippingSpeed')}
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <label
                onClick={() => setShippingRoute('overland')}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  shippingRoute === 'overland'
                    ? 'bg-[#F0EDE7] border-[#2D4F3C] text-[#2D4F3C]'
                    : 'bg-[#F9F7F2] border-[#E5E1D8] text-[#4A4A4A] hover:border-[#D4A373]'
                }`}
              >
                <input
                  type="radio"
                  name="shippingRoute"
                  checked={shippingRoute === 'overland'}
                  onChange={() => setShippingRoute('overland')}
                  className="mt-0.5 accent-[#2D4F3C]"
                />
                <div className="flex-1">
                  <div className="font-bold text-[#2D4F3C] flex items-center justify-between">
                    <span>{getTranslation(language, 'speedOverland')}</span>
                    <span className="font-mono text-[#2D4F3C]">Included</span>
                  </div>
                  <p className="text-[11px] text-[#4A4A4A] mt-0.5">
                    Transported across Trans-Timor Highway via PLBN Mota'ain border checkpoint.
                  </p>
                </div>
              </label>

              <label
                onClick={() => setShippingRoute('airland')}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  shippingRoute === 'airland'
                    ? 'bg-[#F0EDE7] border-[#2D4F3C] text-[#2D4F3C]'
                    : 'bg-[#F9F7F2] border-[#E5E1D8] text-[#4A4A4A] hover:border-[#D4A373]'
                }`}
              >
                <input
                  type="radio"
                  name="shippingRoute"
                  checked={shippingRoute === 'airland'}
                  onChange={() => setShippingRoute('airland')}
                  className="mt-0.5 accent-[#2D4F3C]"
                />
                <div className="flex-1">
                  <div className="font-bold text-[#2D4F3C] flex items-center justify-between">
                    <span>{getTranslation(language, 'speedAirLand')}</span>
                    <span className="font-mono text-[#D4A373]">+$8.00 USD</span>
                  </div>
                  <p className="text-[11px] text-[#4A4A4A] mt-0.5">
                    Air freight from Surabaya/Jakarta to Kupang, followed by express convoy to Dili.
                  </p>
                </div>
              </label>

              <label
                onClick={() => setShippingRoute('pickup')}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  shippingRoute === 'pickup'
                    ? 'bg-[#F0EDE7] border-[#2D4F3C] text-[#2D4F3C]'
                    : 'bg-[#F9F7F2] border-[#E5E1D8] text-[#4A4A4A] hover:border-[#D4A373]'
                }`}
              >
                <input
                  type="radio"
                  name="shippingRoute"
                  checked={shippingRoute === 'pickup'}
                  onChange={() => setShippingRoute('pickup')}
                  className="mt-0.5 accent-[#2D4F3C]"
                />
                <div className="flex-1">
                  <div className="font-bold text-[#2D4F3C] flex items-center justify-between">
                    <span>{getTranslation(language, 'speedPickup')}</span>
                    <span className="font-mono text-[#2D4F3C]">Save ${breakdown.lastMileUSD.toFixed(2)}</span>
                  </div>
                  <p className="text-[11px] text-[#4A4A4A] mt-0.5">
                    Self pickup at Timor Express Batugade Border Post consolidation depot.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* 3. Cross-Border Payment Methods */}
          <div className="bg-white border border-[#E5E1D8] rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 border-b border-[#E5E1D8] pb-2.5">
              <CreditCard className="w-4 h-4 text-[#D4A373]" />
              <h3 className="font-bold text-sm text-[#2D4F3C] uppercase tracking-wider">
                {getTranslation(language, 'paymentMethod')}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {[
                { id: 'BNCTL Bank Transfer', label: getTranslation(language, 'payBNCTL'), icon: Landmark },
                { id: 'BNU Timor Online', label: getTranslation(language, 'payBNU'), icon: Building },
                { id: 'Mosan Mobile Wallet', label: getTranslation(language, 'payMosan'), icon: Smartphone },
                { id: 'E-Mola Wallet', label: getTranslation(language, 'payEmola'), icon: Smartphone },
                { id: 'Indonesian Bank VA', label: getTranslation(language, 'payIndoVA'), icon: Landmark },
                { id: 'USD Cash COD in Dili', label: getTranslation(language, 'payCOD'), icon: DollarSign },
              ].map((p) => {
                const Icon = p.icon;
                const isSelected = paymentMethod === p.id;
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setPaymentMethod(p.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition ${
                      isSelected
                        ? 'bg-[#F0EDE7] border-[#2D4F3C] text-[#2D4F3C] shadow-xs font-bold'
                        : 'bg-[#F9F7F2] border-[#E5E1D8] text-[#4A4A4A] hover:text-[#2D4F3C] hover:border-[#D4A373]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-[#2D4F3C]' : 'text-[#D4A373]'}`} />
                    <span className="text-[11px] font-semibold leading-snug">{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Transparent 5-Part Cost Breakdown Box & Place Order (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#FDFCF9] border-2 border-[#D4A373]/60 rounded-2xl p-4 sm:p-5 shadow-md space-y-4 sticky top-24">
            <div className="flex items-center justify-between border-b border-[#E5E1D8] pb-2.5">
              <h3 className="font-bold text-sm text-[#2D4F3C] uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-[#D4A373]" />
                <span>{getTranslation(language, 'costBreakdown')}</span>
              </h3>
              <span className="text-[10px] bg-[#F0EDE7] text-[#2D4F3C] border border-[#E5E1D8] px-2 py-0.5 rounded font-mono font-bold">
                USD Primary
              </span>
            </div>

            {/* Items Summary in Cart */}
            <div className="space-y-2 border-b border-[#E5E1D8] pb-3 max-h-36 overflow-y-auto pr-1">
              {appliedQuote ? (
                appliedQuote.items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-[#4A4A4A] font-medium truncate mr-2">
                      {it.quantity}x {it.productTitle}
                    </span>
                    <span className="font-mono text-[#2D4F3C] font-bold shrink-0">
                      ${(it.unitPriceUSD * it.quantity).toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                cartItems.map((c, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-[#4A4A4A] font-medium truncate mr-2">
                      {c.quantity}x {c.product.title[language]}
                    </span>
                    <span className="font-mono text-[#2D4F3C] font-bold shrink-0">
                      ${(c.product.priceUSD * c.quantity).toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Transparent 5-Item Cross-Border Cost Itemization */}
            <div className="space-y-2.5 text-xs text-[#4A4A4A] font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[#4A4A4A]">{getTranslation(language, 'itemPrice')}:</span>
                <span className="text-[#2D4F3C] font-bold">${breakdown.basePriceUSD.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#4A4A4A]">{getTranslation(language, 'freightID')}:</span>
                <span className="text-[#2D4F3C] font-bold">${adjustedDomesticFreight.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#4A4A4A]">{getTranslation(language, 'borderHubFee')}:</span>
                <span className="text-[#2D4F3C] font-bold">${breakdown.borderHubUSD.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#4A4A4A]">{getTranslation(language, 'customsFee')} (2.5%+2.5%):</span>
                <span className="text-[#B45309] font-bold">${breakdown.customsTaxUSD.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#4A4A4A]">{getTranslation(language, 'lastMileFee')}:</span>
                <span className="text-[#2D4F3C] font-bold">${adjustedLastMile.toFixed(2)}</span>
              </div>

              {/* Grand Total Box */}
              <div className="mt-4 pt-3 border-t border-[#E5E1D8] bg-[#F0EDE7] p-3 rounded-xl border border-[#E5E1D8]">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-xs font-bold text-[#2D4F3C] uppercase">
                    {getTranslation(language, 'grandTotalUSD')}:
                  </span>
                  <span className="text-2xl font-black text-[#2D4F3C] font-mono">
                    ${finalTotalUSD.toFixed(2)} USD
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-[#4A4A4A]">
                  <span>{getTranslation(language, 'grandTotalIDR')}:</span>
                  <span className="font-mono font-bold">Rp {finalTotalIDR.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* Guarantee Note */}
            <div className="text-[11px] text-[#4A4A4A] bg-white p-2.5 rounded-lg border border-[#E5E1D8] flex items-start gap-2">
              <Info className="w-4 h-4 text-[#D4A373] shrink-0 mt-0.5" />
              <span>
                Includes official ASYCUDA clearance documentation at Batugade/Mota'ain border.
              </span>
            </div>

            {/* Place Order CTA */}
            <button
              id="btn-place-order"
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="w-full bg-[#2D4F3C] hover:bg-[#1E3628] text-white font-bold text-sm py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-xs disabled:opacity-50"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Border Entry...</span>
                </div>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{getTranslation(language, 'placeOrder')} (${finalTotalUSD.toFixed(2)})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
