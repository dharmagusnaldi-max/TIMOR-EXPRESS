import React from 'react';
import { 
  Globe, 
  DollarSign, 
  Smartphone, 
  Monitor, 
  ShoppingCart, 
  Truck, 
  Search, 
  ArrowRightLeft,
  Sparkles
} from 'lucide-react';
import { Language, Currency } from '../types';
import { getTranslation } from '../utils/i18n';
import { EXCHANGE_RATE_USD_TO_IDR } from '../utils/currency';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  currency: Currency;
  onCurrencyToggle: () => void;
  cartCount: number;
  onOpenCart: () => void;
  deviceMode: 'mobile-ios' | 'mobile-android' | 'desktop';
  onDeviceModeChange: (mode: 'mobile-ios' | 'mobile-android' | 'desktop') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  currency,
  onCurrencyToggle,
  cartCount,
  onOpenCart,
  deviceMode,
  onDeviceModeChange,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <header className="bg-white border-b border-[#E5E1D8] text-[#2D4F3C] sticky top-0 z-40 shadow-xs">
      {/* Top micro status bar with corridor indicator & exchange rate */}
      <div className="bg-[#F9F7F2] px-4 py-1.5 text-xs text-[#4A4A4A] flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E1D8]">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-semibold text-[#2D4F3C] bg-white border border-[#E5E1D8] px-2.5 py-0.5 rounded-full text-[11px] shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2D4F3C] animate-pulse"></span>
            Mota'ain Corridor Active
          </span>
          <span className="hidden sm:inline text-[#D4A373]">|</span>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[#4A4A4A] text-[11px]">
            <span>Surabaya & Kupang</span>
            <span className="text-[#D4A373]">➔</span>
            <span>Atambua/Batugade</span>
            <span className="text-[#D4A373]">➔</span>
            <span className="font-semibold text-[#2D4F3C]">Dili Hub</span>
          </span>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* Live Currency Rate pill */}
          <button 
            id="btn-toggle-currency-badge"
            onClick={onCurrencyToggle}
            className="flex items-center gap-1.5 bg-white hover:bg-[#F9F7F2] text-[#2D4F3C] px-2.5 py-0.5 rounded-md border border-[#E5E1D8] transition text-[11px] font-mono font-medium shadow-xs"
            title="Click to toggle primary currency"
          >
            <ArrowRightLeft className="w-3 h-3 text-[#D4A373]" />
            <span>$1 USD = Rp {EXCHANGE_RATE_USD_TO_IDR.toLocaleString('id-ID')}</span>
          </button>

          {/* View mode selector */}
          <div className="flex items-center bg-[#F0EDE7] rounded-md p-0.5 border border-[#E5E1D8]">
            <button
              id="btn-frame-ios"
              onClick={() => onDeviceModeChange('mobile-ios')}
              className={`p-1 rounded text-xs transition flex items-center gap-1 font-semibold ${
                deviceMode === 'mobile-ios' ? 'bg-[#2D4F3C] text-white shadow-xs' : 'text-[#4A4A4A] hover:text-[#2D4F3C]'
              }`}
              title="iOS Mobile View"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[10px]">iOS</span>
            </button>
            <button
              id="btn-frame-android"
              onClick={() => onDeviceModeChange('mobile-android')}
              className={`p-1 rounded text-xs transition flex items-center gap-1 font-semibold ${
                deviceMode === 'mobile-android' ? 'bg-[#2D4F3C] text-white shadow-xs' : 'text-[#4A4A4A] hover:text-[#2D4F3C]'
              }`}
              title="Android Mobile View"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[10px]">Pixel</span>
            </button>
            <button
              id="btn-frame-desktop"
              onClick={() => onDeviceModeChange('desktop')}
              className={`p-1 rounded text-xs transition flex items-center gap-1 font-semibold ${
                deviceMode === 'desktop' ? 'bg-[#2D4F3C] text-white shadow-xs' : 'text-[#4A4A4A] hover:text-[#2D4F3C]'
              }`}
              title="Full Screen Dashboard"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[10px]">Full</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main header bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#2D4F3C] flex items-center justify-center text-white font-extrabold text-sm shadow-xs tracking-tight">
            TX
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-black text-lg tracking-tight text-[#2D4F3C] flex items-center gap-1">
                <span>TIMOR</span>
                <span className="text-[#D4A373]">EXPRESS</span>
              </h1>
              <span className="text-[11px] bg-[#F0EDE7] text-[#2D4F3C] border border-[#E5E1D8] px-1.5 py-0.5 rounded font-mono font-bold">
                TL ⇄ ID
              </span>
            </div>
            <p className="text-[11px] text-[#4A4A4A] hidden sm:block">
              {getTranslation(language, 'appTagline')}
            </p>
          </div>
        </div>

        {/* Global Search with Natural Tones styling */}
        <div className="flex-1 max-w-md mx-2 hidden sm:block">
          <div className="relative">
            <Search className="w-4 h-4 text-[#D4A373] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-global-search"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={getTranslation(language, 'searchPlaceholder')}
              className="w-full bg-[#F9F7F2] border border-[#E5E1D8] text-[#2D4F3C] placeholder-[#4A4A4A]/60 text-xs sm:text-sm rounded-full pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2D4F3C]/20 focus:border-[#2D4F3C] transition"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#4A4A4A] hover:text-[#2D4F3C] bg-white border border-[#E5E1D8] px-1.5 py-0.5 rounded"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Toggles & Cart */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector Dropdown */}
          <div className="relative flex items-center bg-[#F0EDE7] border border-[#E5E1D8] rounded-lg p-1">
            <Globe className="w-3.5 h-3.5 text-[#D4A373] ml-1 mr-1 hidden xs:inline" />
            <select
              id="select-language"
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className="bg-transparent text-xs text-[#2D4F3C] font-bold focus:outline-none cursor-pointer pr-1"
            >
              <option value="tet">🇹🇱 Tetun</option>
              <option value="id">🇮🇩 Indonesia</option>
              <option value="en">🇬🇧 English</option>
            </select>
          </div>

          {/* Natural Tones Signature Currency Toggle */}
          <div className="bg-[#F0EDE7] border border-[#E5E1D8] rounded-lg p-0.5 flex gap-1 items-center">
            <button
              id="btn-currency-usd"
              onClick={() => currency !== 'USD' && onCurrencyToggle()}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition ${
                currency === 'USD'
                  ? 'bg-white text-[#2D4F3C] shadow-xs'
                  : 'text-[#4A4A4A] hover:text-[#2D4F3C]'
              }`}
            >
              USD
            </button>
            <button
              id="btn-currency-idr"
              onClick={() => currency !== 'IDR' && onCurrencyToggle()}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition ${
                currency === 'IDR'
                  ? 'bg-white text-[#2D4F3C] shadow-xs'
                  : 'text-[#4A4A4A] hover:text-[#2D4F3C]'
              }`}
            >
              IDR
            </button>
          </div>

          {/* Cart button */}
          <button
            id="btn-header-cart"
            onClick={onOpenCart}
            className="relative p-2 rounded-lg bg-white hover:bg-[#F9F7F2] border border-[#E5E1D8] text-[#2D4F3C] transition shadow-xs"
            aria-label="Shopping Cart"
          >
            <ShoppingCart className="w-5 h-5 text-[#2D4F3C]" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#D4A373] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile search bar if on small screen */}
      <div className="px-4 pb-2.5 sm:hidden bg-white">
        <div className="relative">
          <Search className="w-4 h-4 text-[#D4A373] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-mobile-search"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={getTranslation(language, 'searchPlaceholder')}
            className="w-full bg-[#F9F7F2] border border-[#E5E1D8] text-[#2D4F3C] placeholder-[#4A4A4A]/60 text-xs rounded-full pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2D4F3C]/20"
          />
        </div>
      </div>
    </header>
  );
};
