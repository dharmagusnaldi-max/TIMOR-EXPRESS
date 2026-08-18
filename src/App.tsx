import React, { useState } from 'react';
import { 
  Language, 
  Currency, 
  Product, 
  ProductCategory, 
  CartItem, 
  CustomQuote, 
  ChatConversation, 
  ShipmentOrder 
} from './types';
import { mockProducts, mockConversations, mockShipments } from './data/mockData';
import { getTranslation } from './utils/i18n';
import { Header } from './components/Header';
import { BottomNav, ActiveTab } from './components/BottomNav';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { BuyerSellerChat } from './components/BuyerSellerChat';
import { QuoteBuilderModal } from './components/QuoteBuilderModal';
import { SmartCheckout } from './components/SmartCheckout';
import { LogisticsTracker } from './components/LogisticsTracker';
import { BorderCustomsGuide } from './components/BorderCustomsGuide';
import { DeviceFrameWrapper } from './components/DeviceFrameWrapper';
import { 
  ShieldCheck, 
  Filter, 
  Clock,
  Layers
} from 'lucide-react';

export default function App() {
  // Global App States
  const [language, setLanguage] = useState<Language>('tet'); // Default to Tetun (Timor-Leste national language)
  const [currency, setCurrency] = useState<Currency>('USD'); // Default to official Timor-Leste currency ($ USD)
  const [activeTab, setActiveTab] = useState<ActiveTab>('catalog');
  const [deviceMode, setDeviceMode] = useState<'mobile-ios' | 'mobile-android' | 'desktop'>('mobile-ios');

  // Search & Catalog Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('all');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('all'); // 'all', 'kupang', 'atambua', 'surabaya'

  // Cart & Active Quote
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { product: mockProducts[0], quantity: 1 }, // Default sample cart
  ]);
  const [appliedQuote, setAppliedQuote] = useState<CustomQuote | null>(null);

  // Selected Product Detail Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  // Chat & Quotes state
  const [conversations, setConversations] = useState<ChatConversation[]>(mockConversations);
  const [activeConvId, setActiveConvId] = useState<string>(mockConversations[0].id);
  const [isQuoteBuilderOpen, setIsQuoteBuilderOpen] = useState<boolean>(false);

  // Orders / Shipments Tracking state
  const [orders, setOrders] = useState<ShipmentOrder[]>(mockShipments);
  const [selectedTrackingOrderId, setSelectedTrackingOrderId] = useState<string>(mockShipments[0].id);

  // Currency Toggle Handler
  const handleCurrencyToggle = () => {
    setCurrency((prev) => (prev === 'USD' ? 'IDR' : 'USD'));
  };

  // Add to cart handler
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  // Start chat with seller handler
  const handleStartChatWithSeller = (product: Product) => {
    const existingConv = conversations.find((c) => c.seller.id === product.seller.id);
    if (existingConv) {
      setActiveConvId(existingConv.id);
    } else {
      const newConv: ChatConversation = {
        id: `conv-${Date.now()}`,
        seller: product.seller,
        unreadCount: 0,
        lastMessage: `Inquiring about ${product.title[language]}`,
        lastMessageTime: 'Just now',
        linkedProductId: product.id,
        messages: [
          {
            id: `m-init-${Date.now()}`,
            senderId: 'buyer-01',
            senderName: 'Alexandre Da Silva (Dili)',
            senderRole: 'buyer',
            originalText: `Halo, ha'u hakarak husu kona-ba sasán: ${product.title[language]}`,
            originalLang: 'tet',
            translatedText: {
              tet: `Halo, ha'u hakarak husu kona-ba sasán: ${product.title[language]}`,
              id: `Halo, saya mau tanya tentang barang: ${product.title['id'] || product.title[language]}`,
              en: `Hello, I would like to inquire about: ${product.title['en'] || product.title[language]}`,
            },
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      };
      setConversations([newConv, ...conversations]);
      setActiveConvId(newConv.id);
    }
    setActiveTab('chat');
  };

  // Send message in chat with auto-translation
  const handleSendMessage = async (text: string, originalLang: Language) => {
    const currentConv = conversations.find((c) => c.id === activeConvId);
    if (!currentConv) return;

    const newBuyerMessage = {
      id: `m-${Date.now()}`,
      senderId: 'buyer-01',
      senderName: 'Alexandre Da Silva (Dili)',
      senderRole: 'buyer' as const,
      originalText: text,
      originalLang,
      translatedText: {
        tet: text,
        id: text.startsWith('Halo') ? 'Halo mas/kak, ' + text : text,
        en: text,
      },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Try calling server-side Gemini translation endpoint in background
    fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        sourceLang: originalLang === 'tet' ? 'Tetum' : 'Indonesian',
        targetLang: originalLang === 'tet' ? 'Indonesian' : 'Tetum',
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.translatedText) {
          setConversations((prev) =>
            prev.map((c) =>
              c.id === activeConvId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === newBuyerMessage.id
                        ? {
                            ...m,
                            translatedText: {
                              ...m.translatedText,
                              id: originalLang === 'tet' ? data.translatedText : m.translatedText?.id || text,
                              tet: originalLang === 'id' ? data.translatedText : m.translatedText?.tet || text,
                            },
                          }
                        : m
                    ),
                  }
                : c
            )
          );
        }
      })
      .catch((e) => console.log('Translate error:', e));

    // Update conversation with buyer message
    const updatedConversations = conversations.map((c) =>
      c.id === activeConvId
        ? {
            ...c,
            lastMessage: text,
            lastMessageTime: 'Just now',
            messages: [...c.messages, newBuyerMessage],
          }
        : c
    );
    setConversations(updatedConversations);

    // Simulate smart seller response after 1.2 seconds
    setTimeout(() => {
      const sellerResponses = [
        {
          id: `m-reply-${Date.now()}`,
          senderId: currentConv.seller.id,
          senderName: `${currentConv.seller.name} (Supplier)`,
          senderRole: 'seller' as const,
          originalText: `Terima kasih Pak! Stok aman di gudang ${currentConv.seller.city}. Truk ekspedisi kami berangkat setiap hari Selasa dan Jumat via Batugade.`,
          originalLang: 'id' as Language,
          translatedText: {
            tet: `Obrigadu Maun! Sasán iha stock seguru iha armazém ${currentConv.seller.city}. Ami-nia kamiaun espedisaun sai kada Tersa no Sesta liu husi Batugade.`,
            id: `Terima kasih Pak! Stok aman di gudang ${currentConv.seller.city}. Truk ekspedisi kami berangkat setiap hari Selasa dan Jumat via Batugade.`,
            en: `Thank you sir! Stock is available in our ${currentConv.seller.city} warehouse. Our overland convoy departs every Tuesday and Friday via Batugade.`,
          },
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ];

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? {
                ...c,
                lastMessage: sellerResponses[0].originalText,
                lastMessageTime: 'Just now',
                messages: [...c.messages, sellerResponses[0]],
              }
            : c
        )
      );
    }, 1200);
  };

  // Accept custom proforma quote handler
  const handleAcceptQuote = (quote: CustomQuote) => {
    setAppliedQuote(quote);
    setActiveTab('checkout');
  };

  // Direct checkout from product modal
  const handleDirectCheckout = (product: Product, quantity: number, municipality: string) => {
    setCartItems([{ product, quantity }]);
    setAppliedQuote(null);
    setActiveTab('checkout');
  };

  // Order success handler
  const handleOrderSuccess = (newOrder: ShipmentOrder) => {
    setOrders([newOrder, ...orders]);
    setSelectedTrackingOrderId(newOrder.id);
    setCartItems([]);
    setAppliedQuote(null);
    setActiveTab('tracking');
  };

  // Advance logistics pipeline stage simulation
  const handleAdvanceStage = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const nextIndex = Math.min(o.stages.length - 1, o.currentStageIndex + 1);
          return {
            ...o,
            currentStageIndex: nextIndex,
          };
        }
        return o;
      })
    );
  };

  // Filter products by category, origin, and search query
  const filteredProducts = mockProducts.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesOrigin =
      selectedOrigin === 'all' ||
      (selectedOrigin === 'kupang' && product.seller.city.toLowerCase().includes('kupang')) ||
      (selectedOrigin === 'atambua' && product.seller.city.toLowerCase().includes('atambua')) ||
      (selectedOrigin === 'surabaya' && product.seller.city.toLowerCase().includes('surabaya'));

    const titleText = product.title[language]?.toLowerCase() || '';
    const descText = product.description[language]?.toLowerCase() || '';
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || titleText.includes(query) || descText.includes(query);

    return matchesCategory && matchesOrigin && matchesSearch;
  });

  const activeConversation =
    conversations.find((c) => c.id === activeConvId) || conversations[0];

  return (
    <DeviceFrameWrapper mode={deviceMode}>
      <div className="flex flex-col min-h-full bg-[#F9F7F2] text-[#2D4F3C] font-sans">
        {/* Multilingual & Multi-currency Header */}
        <Header
          language={language}
          onLanguageChange={setLanguage}
          currency={currency}
          onCurrencyToggle={handleCurrencyToggle}
          cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
          onOpenCart={() => setActiveTab('checkout')}
          deviceMode={deviceMode}
          onDeviceModeChange={setDeviceMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Main View Area */}
        <main className="flex-1 p-3 sm:p-5 overflow-y-auto">
          {/* TAB 1: BUYER HOMEPAGE & CATALOG */}
          {activeTab === 'catalog' && (
            <div className="max-w-6xl mx-auto space-y-5 animate-in fade-in duration-200">
              {/* Hero Banner: Cross-Border Trade Corridor */}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#2D4F3C] via-[#243F30] to-[#1E3628] border border-[#E5E1D8] p-4 sm:p-6 shadow-md text-white">
                <div className="relative z-10 max-w-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black bg-[#D4A373] text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                      Direct Cross-Border Corridor
                    </span>
                    <span className="text-xs text-[#EAE7DF] font-mono font-semibold">
                      PLBN Mota'ain ➔ Batugade
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-2xl font-black text-white leading-tight">
                    {language === 'tet'
                      ? 'Sosa Sasán Diretamente husi Fornesedór Indonézia mai Dili'
                      : language === 'id'
                      ? 'Belanja Langsung dari Supplier Indonesia ke Seluruh Timor-Leste'
                      : 'Source Direct from Indonesian Suppliers to Timor-Leste'}
                  </h2>

                  <p className="text-xs sm:text-sm text-[#EAE7DF] leading-relaxed">
                    {language === 'tet'
                      ? 'Peças motor, eletrodoméstiku, materiál konstrusaun no hahan ho kalkulasaun alfándega transparente & frete garantia to\'o Dili.'
                      : language === 'id'
                      ? 'Sparepart motor, elektronik, alat teknik dan sembako dengan kepastian bea cukai Asycuda & pengiriman via darat Mota\'ain.'
                      : 'Motorcycle parts, solar systems, electronics & groceries with transparent landed customs tax & direct overland shipping.'}
                  </p>

                  {/* Highlights row */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] bg-white/10 backdrop-blur-xs border border-white/20 text-white px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#D4A373]" />
                      Alfándega (2.5%+2.5%) Included
                    </span>
                    <span className="text-[11px] bg-white/10 backdrop-blur-xs border border-white/20 text-white px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-[#D4A373]" />
                      2-5 Days to Dili Hub
                    </span>
                  </div>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#4A4A4A]">
                  <span className="font-bold text-[#2D4F3C] flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-[#D4A373]" />
                    Categories / Kategoria
                  </span>
                  <span className="text-[11px] font-semibold">{filteredProducts.length} items found</span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {[
                    { id: 'all' as ProductCategory, label: getTranslation(language, 'catAll') },
                    { id: 'auto-parts' as ProductCategory, label: getTranslation(language, 'catAutoParts') },
                    { id: 'construction-hardware' as ProductCategory, label: getTranslation(language, 'catConstruction') },
                    { id: 'electronics' as ProductCategory, label: getTranslation(language, 'catElectronics') },
                    { id: 'home-appliances' as ProductCategory, label: getTranslation(language, 'catHomeAppliances') },
                    { id: 'fmcg-foods' as ProductCategory, label: getTranslation(language, 'catFmcgFoods') },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      id={`btn-category-${cat.id}`}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                        selectedCategory === cat.id
                          ? 'bg-[#2D4F3C] text-white border-[#2D4F3C] shadow-xs'
                          : 'bg-white text-[#4A4A4A] border-[#E5E1D8] hover:text-[#2D4F3C] hover:border-[#D4A373]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Origin Filter Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="text-[#4A4A4A] flex items-center gap-1 font-bold whitespace-nowrap">
                  <Filter className="w-3.5 h-3.5 text-[#D4A373]" />
                  Origin Hub:
                </span>
                {[
                  { id: 'all', label: getTranslation(language, 'filterAllOrigins') },
                  { id: 'atambua', label: '🛂 Atambua Hub (1-2 days)' },
                  { id: 'kupang', label: '🏢 Kupang NTT (2-3 days)' },
                  { id: 'surabaya', label: '🏭 Surabaya Depot (4-6 days)' },
                ].map((origin) => (
                  <button
                    key={origin.id}
                    id={`btn-origin-${origin.id}`}
                    onClick={() => setSelectedOrigin(origin.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition border ${
                      selectedOrigin === origin.id
                        ? 'bg-[#F0EDE7] text-[#2D4F3C] border-[#2D4F3C] font-bold shadow-xs'
                        : 'bg-white text-[#4A4A4A] border-[#E5E1D8] hover:text-[#2D4F3C] hover:border-[#D4A373]'
                    }`}
                  >
                    {origin.label}
                  </button>
                ))}
              </div>

              {/* Product Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    language={language}
                    currency={currency}
                    onSelect={(p) => {
                      setSelectedProduct(p);
                      setIsDetailModalOpen(true);
                    }}
                    onStartChat={handleStartChatWithSeller}
                    onAddToCart={(p) => handleAddToCart(p, 1)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: LIVE BUYER-SELLER CHAT & NEGOTIATION */}
          {activeTab === 'chat' && (
            <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-200">
              {/* If multiple conversations exist, show contact tab bar */}
              {conversations.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setActiveConvId(conv.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border flex items-center gap-2 ${
                        activeConvId === conv.id
                          ? 'bg-[#F0EDE7] text-[#2D4F3C] border-[#2D4F3C] shadow-xs'
                          : 'bg-white text-[#4A4A4A] border-[#E5E1D8] hover:text-[#2D4F3C]'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-[#2D4F3C]"></span>
                      <span>{conv.seller.name}</span>
                    </button>
                  ))}
                </div>
              )}

              <BuyerSellerChat
                conversation={activeConversation}
                onSendMessage={handleSendMessage}
                language={language}
                currency={currency}
                onAcceptQuote={handleAcceptQuote}
                onRequestNewQuoteModal={() => setIsQuoteBuilderOpen(true)}
              />
            </div>
          )}

          {/* TAB 3: LOGISTICS PIPELINE TRACKER */}
          {activeTab === 'tracking' && (
            <div className="animate-in fade-in duration-200">
              <LogisticsTracker
                orders={orders}
                selectedOrderId={selectedTrackingOrderId}
                language={language}
                currency={currency}
                onAdvanceStage={handleAdvanceStage}
              />
            </div>
          )}

          {/* TAB 4: SMART CHECKOUT & COST BREAKDOWN */}
          {activeTab === 'checkout' && (
            <div className="animate-in fade-in duration-200">
              <SmartCheckout
                cartItems={cartItems}
                appliedQuote={appliedQuote}
                language={language}
                currency={currency}
                onBackToShopping={() => setActiveTab('catalog')}
                onOrderSuccess={handleOrderSuccess}
              />
            </div>
          )}

          {/* TAB 5: BORDER CUSTOMS & TARIFF GUIDE */}
          {activeTab === 'guide' && (
            <div className="animate-in fade-in duration-200">
              <BorderCustomsGuide language={language} currency={currency} />
            </div>
          )}
        </main>

        {/* Product Detail Modal */}
        <ProductDetailModal
          product={selectedProduct}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          language={language}
          currency={currency}
          onStartChat={handleStartChatWithSeller}
          onAddToCart={handleAddToCart}
          onDirectCheckout={handleDirectCheckout}
        />

        {/* Custom Price Quote Builder Modal */}
        <QuoteBuilderModal
          isOpen={isQuoteBuilderOpen}
          onClose={() => setIsQuoteBuilderOpen(false)}
          products={mockProducts}
          language={language}
          currency={currency}
          onQuoteCreated={(quote) => {
            setConversations((prev) =>
              prev.map((c) =>
                c.id === activeConvId
                  ? {
                      ...c,
                      lastMessage: `Formal Quote Attached: ${quote.quoteNumber}`,
                      lastMessageTime: 'Just now',
                      messages: [
                        ...c.messages,
                        {
                          id: `m-quote-${Date.now()}`,
                          senderId: 'seller-atambua-hardware',
                          senderName: 'Pak Hendra (Supplier Hub)',
                          senderRole: 'seller',
                          originalText: `Berikut penawaran harga resmi ${quote.quoteNumber} untuk pengiriman ke ${quote.destination}. Termasuk bea cukai dan ongkir Batugade.`,
                          originalLang: 'id',
                          translatedText: {
                            tet: `Ne'e kuotasaun folin ofisiál ${quote.quoteNumber} ba entrega ba ${quote.destination}. Inklui taxa alfándega no frete Batugade.`,
                            id: `Berikut penawaran harga resmi ${quote.quoteNumber} untuk pengiriman ke ${quote.destination}. Termasuk bea cukai dan ongkir Batugade.`,
                            en: `Here is the formal price quote ${quote.quoteNumber} for delivery to ${quote.destination}. Inclusive of customs duties and Batugade freight.`,
                          },
                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                          quoteAttachment: quote,
                        },
                      ],
                    }
                  : c
              )
            );
          }}
        />

        {/* Mobile Sticky Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          language={language}
          unreadChatCount={conversations.reduce((acc, c) => acc + c.unreadCount, 0)}
          activeShipmentCount={orders.length}
        />
      </div>
    </DeviceFrameWrapper>
  );
}
