import React from 'react';

interface DeviceFrameWrapperProps {
  mode: 'mobile-ios' | 'mobile-android' | 'desktop';
  children: React.ReactNode;
}

export const DeviceFrameWrapper: React.FC<DeviceFrameWrapperProps> = ({ mode, children }) => {
  if (mode === 'desktop') {
    return <div className="w-full min-h-screen bg-[#F9F7F2] text-[#2D4F3C]">{children}</div>;
  }

  const isIos = mode === 'mobile-ios';

  return (
    <div className="min-h-screen bg-[#F0EDE7] flex flex-col items-center justify-start py-4 sm:py-8 px-2 sm:px-4">
      {/* Visual Mobile Phone Chassis Container with Natural Tones frame */}
      <div 
        className={`relative w-full max-w-[430px] h-[900px] max-h-[94vh] bg-[#2D4F3C] rounded-[46px] p-3 shadow-2xl border-4 ${
          isIos ? 'border-[#1E3628] shadow-[#2D4F3C]/20' : 'border-[#1E3628] shadow-[#2D4F3C]/20'
        } flex flex-col overflow-hidden transition-all duration-300 ring-1 ring-[#E5E1D8]`}
      >
        {/* Dynamic Island / Camera Punch Hole */}
        {isIos ? (
          <div className="absolute top-4.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-[#1A2E22] rounded-full z-50 flex items-center justify-between px-2.5 pointer-events-none">
            <div className="w-2.5 h-2.5 rounded-full bg-[#122018] border border-white/10"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#D4A373] animate-pulse"></div>
          </div>
        ) : (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#1A2E22] rounded-full z-50 pointer-events-none border border-white/10"></div>
        )}

        {/* Mobile Screen Area */}
        <div className="w-full h-full bg-[#F9F7F2] rounded-[38px] overflow-y-auto flex flex-col relative text-[#2D4F3C] border border-[#E5E1D8]">
          {children}
        </div>

        {/* iOS Home Indicator Bar */}
        {isIos && (
          <div className="w-32 h-1 bg-[#F0EDE7]/60 rounded-full mx-auto mt-2 pointer-events-none"></div>
        )}
      </div>

      <div className="mt-3 text-center text-xs text-[#4A4A4A] font-mono font-medium">
        Viewing in {isIos ? 'iOS Mobile Frame (430px)' : 'Android Pixel Mobile Frame (412px)'} • Switch to 'Full' above for wide dashboard mode
      </div>
    </div>
  );
};
