import React, { useState } from 'react';
import { 
  Send, 
  Sparkles, 
  FileText, 
  ShieldCheck, 
  MapPin, 
  CheckCircle2
} from 'lucide-react';
import { ChatConversation, CustomQuote, Language, Currency } from '../types';
import { getTranslation } from '../utils/i18n';

interface BuyerSellerChatProps {
  conversation: ChatConversation;
  onSendMessage: (text: string, originalLang: Language) => void;
  language: Language;
  currency: Currency;
  onAcceptQuote: (quote: CustomQuote) => void;
  onRequestNewQuoteModal: () => void;
  onSelectProductContext?: (productId: string) => void;
}

export const BuyerSellerChat: React.FC<BuyerSellerChatProps> = ({
  conversation,
  onSendMessage,
  language,
  currency,
  onAcceptQuote,
  onRequestNewQuoteModal,
}) => {
  const [inputText, setInputText] = useState('');
  const [autoTranslate, setAutoTranslate] = useState(true);

  const quickQuestions = [
    getTranslation(language, 'quickQ1'),
    getTranslation(language, 'quickQ2'),
    getTranslation(language, 'quickQ3'),
    getTranslation(language, 'quickQ4'),
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;
    onSendMessage(text, language);
    setInputText('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[780px] bg-white border border-[#E5E1D8] rounded-2xl overflow-hidden shadow-md">
      {/* Chat Room Top Bar */}
      <div className="bg-[#FDFCF9] border-b border-[#E5E1D8] p-3.5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-[#2D4F3C] flex items-center justify-center font-bold text-white shadow-xs text-sm">
              {conversation.seller.name.slice(0, 2).toUpperCase()}
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#2D4F3C] border-2 border-white rounded-full"></span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-[#2D4F3C] flex items-center gap-1">
                <span>{conversation.seller.name}</span>
                {conversation.seller.verified && (
                  <ShieldCheck className="w-4 h-4 text-[#2D4F3C]" title="Verified Cross-Border Supplier" />
                )}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#4A4A4A]">
              <span className="flex items-center gap-0.5 text-[#4A4A4A]">
                <MapPin className="w-3 h-3 text-[#D4A373]" />
                {conversation.seller.city}, {conversation.seller.province}
              </span>
              <span>•</span>
              <span className="text-[#2D4F3C] font-mono text-[11px] font-semibold">Responds {conversation.seller.responseTime}</span>
            </div>
          </div>
        </div>

        {/* Translation Switcher & Action */}
        <div className="flex items-center gap-2">
          <button
            id="btn-toggle-autotranslate"
            onClick={() => setAutoTranslate(!autoTranslate)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
              autoTranslate
                ? 'bg-[#F0EDE7] border-[#2D4F3C] text-[#2D4F3C] shadow-xs'
                : 'bg-white border-[#E5E1D8] text-[#4A4A4A]'
            }`}
            title="Real-time translation between Tetun and Bahasa Indonesia"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
            <span className="hidden sm:inline">
              {autoTranslate ? getTranslation(language, 'autoTranslateOn') : getTranslation(language, 'autoTranslateOff')}
            </span>
            <span className="sm:hidden">AI Translate</span>
          </button>

          <button
            id="btn-request-quote"
            onClick={onRequestNewQuoteModal}
            className="flex items-center gap-1 bg-[#D4A373] hover:bg-[#B88554] text-white text-xs font-bold px-2.5 py-1 rounded-lg transition shadow-xs"
            title="Draft formal price quote"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{getTranslation(language, 'sendQuote')}</span>
            <span className="sm:hidden">Quote</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 bg-[#F9F7F2]">
        {/* Corridor security notice */}
        <div className="bg-white border border-[#E5E1D8] rounded-xl p-2.5 text-center text-xs text-[#4A4A4A] max-w-md mx-auto shadow-xs">
          <span className="text-[#2D4F3C] font-bold">🔒 Timor Express Escrow Protection:</span>{' '}
          All payments and proforma quotes through this chat are guaranteed until Mota'ain customs clearance and Dili delivery.
        </div>

        {conversation.messages.map((msg) => {
          const isMe = msg.senderRole === 'buyer';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[90%] sm:max-w-[78%] ${
                isMe ? 'ml-auto' : 'mr-auto'
              }`}
            >
              {/* Sender Name & Timestamp */}
              <div className="text-[11px] text-[#4A4A4A]/80 mb-1 px-1 flex items-center gap-1.5">
                <span className="font-semibold text-[#2D4F3C]">{msg.senderName}</span>
                <span>•</span>
                <span className="text-[10px]">{msg.timestamp}</span>
              </div>

              {/* Message Bubble Container */}
              <div
                className={`rounded-2xl p-3.5 shadow-xs border ${
                  isMe
                    ? 'bg-[#2D4F3C] text-white border-transparent rounded-tr-xs'
                    : 'bg-[#F0EDE7] text-[#2D4F3C] border-[#E5E1D8] rounded-tl-xs'
                }`}
              >
                {/* Original Text */}
                <p className="text-xs sm:text-sm leading-relaxed mb-1 font-medium">
                  {msg.originalText}
                </p>

                {/* AI Translated Text Sub-bubble if enabled */}
                {autoTranslate && msg.translatedText && (
                  <div
                    className={`mt-2 pt-2 border-t text-xs rounded-lg p-2 ${
                      isMe
                        ? 'bg-[#1E3628] border-white/20 text-[#EAE7DF]'
                        : 'bg-white border-[#E5E1D8] text-[#4A4A4A]'
                    }`}
                  >
                    <div className="flex items-center gap-1 text-[10px] text-[#D4A373] font-bold uppercase tracking-wider mb-1">
                      <Sparkles className="w-3 h-3" />
                      <span>{getTranslation(language, 'translatedMessage')} ({language.toUpperCase()}):</span>
                    </div>
                    <p className="italic leading-snug">
                      {msg.translatedText[language] || msg.translatedText['en'] || msg.originalText}
                    </p>
                  </div>
                )}

                {/* Custom Formal Price Quote Attachment */}
                {msg.quoteAttachment && (
                  <div className="mt-3 bg-white border-2 border-[#D4A373] rounded-xl p-3.5 text-[#2D4F3C] shadow-sm">
                    <div className="flex items-center justify-between border-b border-[#E5E1D8] pb-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-[#D4A373]" />
                        <span className="text-xs font-bold text-[#2D4F3C]">
                          {msg.quoteAttachment.quoteNumber}
                        </span>
                      </div>
                      <span className="text-[10px] bg-[#F0EDE7] text-[#2D4F3C] border border-[#E5E1D8] px-1.5 py-0.5 rounded font-mono font-semibold">
                        Valid: {msg.quoteAttachment.validUntil}
                      </span>
                    </div>

                    {/* Quote Items List */}
                    <div className="space-y-1 mb-2.5">
                      {msg.quoteAttachment.items.map((item, i) => (
                        <div key={i} className="text-xs flex justify-between">
                          <span className="text-[#4A4A4A] font-medium">
                            {item.quantity}x {item.productTitle}
                          </span>
                          <span className="font-mono text-[#2D4F3C] font-bold">
                            ${(item.unitPriceUSD * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Transparent Cross-Border Cost Itemization in Quote */}
                    <div className="bg-[#F9F7F2] rounded-lg p-2 text-[11px] space-y-1 border border-[#E5E1D8] text-[#4A4A4A] font-mono mb-3">
                      <div className="flex justify-between">
                        <span className="text-[#4A4A4A]">1. Base Goods Price:</span>
                        <span className="font-semibold text-[#2D4F3C]">${msg.quoteAttachment.basePriceUSD.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#4A4A4A]">2. Domestic ID Freight:</span>
                        <span className="font-semibold text-[#2D4F3C]">${msg.quoteAttachment.domesticFreightUSD.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#4A4A4A]">3. Atambua Hub & PEB:</span>
                        <span className="font-semibold text-[#2D4F3C]">${msg.quoteAttachment.borderHubHandlingUSD.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#4A4A4A]">4. Timor-Leste Customs (2.5%+2.5%):</span>
                        <span className="text-[#B45309] font-bold">${msg.quoteAttachment.customsDutyTaxUSD.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#4A4A4A]">5. Dili Hub Last-Mile:</span>
                        <span className="font-semibold text-[#2D4F3C]">${msg.quoteAttachment.lastMileDeliveryUSD.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-[#E5E1D8] text-xs font-bold text-[#2D4F3C]">
                        <span>Total Landed (USD):</span>
                        <span>${msg.quoteAttachment.totalUSD.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Route Note */}
                    <div className="text-[10px] text-[#4A4A4A] mb-3 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#D4A373] shrink-0" />
                      <span className="truncate">{msg.quoteAttachment.routeSummary}</span>
                    </div>

                    {/* Accept & Checkout Quote Button */}
                    <button
                      id={`btn-accept-quote-${msg.quoteAttachment.id}`}
                      onClick={() => onAcceptQuote(msg.quoteAttachment!)}
                      className="w-full bg-[#2D4F3C] hover:bg-[#1E3628] text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{getTranslation(language, 'acceptQuote')} (${msg.quoteAttachment.totalUSD.toFixed(2)})</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Trade Question Prompts Chips */}
      <div className="bg-[#FDFCF9] border-t border-[#E5E1D8] px-3 py-2 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
        <span className="text-[11px] text-[#4A4A4A] font-bold whitespace-nowrap mr-1">
          {getTranslation(language, 'quickQuestions')}
        </span>
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="text-[11px] bg-[#F0EDE7] hover:bg-[#E5E1D8] text-[#2D4F3C] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap border border-[#E5E1D8] transition"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <div className="bg-white p-3 border-t border-[#E5E1D8] flex items-center gap-2">
        <input
          id="input-chat-message"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={getTranslation(language, 'typeMessage')}
          className="flex-1 bg-[#F9F7F2] border border-[#E5E1D8] text-[#2D4F3C] placeholder-[#4A4A4A]/60 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2D4F3C]/20"
        />

        <button
          id="btn-send-chat"
          onClick={() => handleSend()}
          disabled={!inputText.trim()}
          className="bg-[#2D4F3C] hover:bg-[#1E3628] disabled:opacity-40 text-white p-2.5 rounded-xl transition flex items-center justify-center font-bold shadow-xs"
          title="Send Message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
