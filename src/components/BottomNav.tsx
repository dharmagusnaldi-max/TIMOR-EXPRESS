import React from 'react';
import { 
  Store, 
  MessageSquareQuote, 
  Truck, 
  CreditCard, 
  FileText,
} from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../utils/i18n';

export type ActiveTab = 'catalog' | 'chat' | 'tracking' | 'checkout' | 'guide';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  language: Language;
  unreadChatCount?: number;
  activeShipmentCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  language,
  unreadChatCount = 1,
  activeShipmentCount = 1,
}) => {
  const tabs = [
    {
      id: 'catalog' as ActiveTab,
      label: getTranslation(language, 'tabHome'),
      icon: Store,
    },
    {
      id: 'chat' as ActiveTab,
      label: getTranslation(language, 'tabChat'),
      icon: MessageSquareQuote,
      badge: unreadChatCount,
    },
    {
      id: 'tracking' as ActiveTab,
      label: getTranslation(language, 'tabTracking'),
      icon: Truck,
      badge: activeShipmentCount,
    },
    {
      id: 'checkout' as ActiveTab,
      label: getTranslation(language, 'tabCheckout'),
      icon: CreditCard,
    },
    {
      id: 'guide' as ActiveTab,
      label: getTranslation(language, 'tabGuide'),
      icon: FileText,
    },
  ];

  return (
    <nav className="bg-[#FDFCF9] border-t border-[#E5E1D8] text-[#4A4A4A] py-1.5 px-2 flex items-center justify-around z-30 shadow-md">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            id={`nav-tab-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-150 min-w-[62px] ${
              isActive 
                ? 'text-[#2D4F3C] font-bold' 
                : 'text-[#4A4A4A]/70 hover:text-[#2D4F3C]'
            }`}
          >
            {/* Active top pill indicator */}
            {isActive && (
              <span className="absolute -top-1.5 w-6 h-1 bg-[#2D4F3C] rounded-full"></span>
            )}
            
            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-[#2D4F3C]' : ''}`} />
              {tab.badge && tab.badge > 0 ? (
                <span className="absolute -top-1.5 -right-2 bg-[#D4A373] text-white text-[10px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center shadow-xs">
                  {tab.badge}
                </span>
              ) : null}
            </div>
            
            <span className="text-[11px] mt-1 whitespace-nowrap font-medium">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
