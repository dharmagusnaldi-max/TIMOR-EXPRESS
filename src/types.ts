export type Language = 'tet' | 'id' | 'en';
export type Currency = 'USD' | 'IDR';

export type ProductCategory = 
  | 'all'
  | 'home-appliances'
  | 'electronics'
  | 'auto-parts'
  | 'fmcg-foods'
  | 'construction-hardware';

export interface SellerInfo {
  id: string;
  name: string;
  city: string; // e.g. "Surabaya", "Kupang", "Atambua"
  province: string; // "East Java" | "East Nusa Tenggara (NTT)"
  hubType: 'Border Consolidation Hub' | 'Distribution Warehouse' | 'Factory Direct Depot';
  verified: boolean;
  rating: number;
  reviewCount: number;
  responseTime: string;
  languages: string[];
}

export interface Product {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  category: ProductCategory;
  priceUSD: number;
  priceIDR: number;
  weightKg: number;
  minOrderQuantity: number;
  stock: number;
  images: string[];
  seller: SellerInfo;
  estimatedDaysToDili: string; // e.g. "3-4 days"
  shippingMethod: 'Overland Timor Highway' | 'Sea-Land Express' | 'Air-Land Express';
  features: Record<Language, string[]>;
  customsCategoryCode: string; // e.g. "HS-8708.29"
  popularInTimor: string; // Why it's in demand in Dili/Baucau
}

export interface CustomQuoteItem {
  productId: string;
  productTitle: string;
  quantity: number;
  unitPriceUSD: number;
  unitPriceIDR: number;
  weightKg: number;
}

export interface CustomQuote {
  id: string;
  quoteNumber: string;
  sellerId: string;
  sellerName: string;
  sellerOrigin: string;
  buyerName: string;
  destination: string;
  items: CustomQuoteItem[];
  basePriceUSD: number;
  domesticFreightUSD: number;
  borderHubHandlingUSD: number;
  customsDutyTaxUSD: number;
  lastMileDeliveryUSD: number;
  totalUSD: number;
  totalIDR: number;
  status: 'draft' | 'pending' | 'accepted' | 'rejected' | 'paid';
  createdAt: string;
  validUntil: string;
  notes: string;
  routeSummary: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'buyer' | 'seller' | 'system';
  originalText: string;
  originalLang: Language;
  translatedText?: Record<Language, string>;
  timestamp: string;
  quoteAttachment?: CustomQuote;
  isTranslating?: boolean;
}

export interface ChatConversation {
  id: string;
  seller: SellerInfo;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  messages: ChatMessage[];
  linkedProductId?: string;
}

export type TrackingStageStatus = 'completed' | 'in-progress' | 'pending';

export interface TrackingStage {
  id: string;
  title: Record<Language, string>;
  subtitle: Record<Language, string>;
  location: string;
  status: TrackingStageStatus;
  timestamp?: string;
  checkpointDetails: Record<Language, string>;
  officerOrFacility?: string;
}

export interface ShipmentOrder {
  id: string;
  orderNumber: string;
  items: {
    product: Product;
    quantity: number;
  }[];
  totalUSD: number;
  totalIDR: number;
  breakdown: {
    basePriceUSD: number;
    domesticFreightUSD: number;
    borderHubUSD: number;
    customsTaxUSD: number;
    lastMileUSD: number;
  };
  destination: {
    fullName: string;
    phone: string;
    municipality: string; // "Dili", "Baucau", "Maliana", "Oecusse"
    addressLine: string;
    deliveryMethod: 'doorstep' | 'hub-pickup';
  };
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'cod';
  createdAt: string;
  estimatedDeliveryDate: string;
  currentStageIndex: number; // 0 to 4
  stages: TrackingStage[];
  customsDeclarationCode: string; // e.g. "ASYCUDA-TL-2026-09884"
  trackingHistory: {
    time: string;
    title: string;
    description: string;
    location: string;
  }[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}
