import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'compact' | 'symbol' | 'calligraphy-only';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  inverted?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  variant = 'full',
  size = 'md',
  inverted = false,
}) => {
  const logoSrc = inverted ? '/logo-calligraphy-white.png' : '/logo-calligraphy.png';
  const subColor = inverted ? 'text-paper-300' : 'text-ink-600';
  const sealColor = inverted ? 'text-lacquer-light border-lacquer-light/60 bg-lacquer-dark/30' : 'text-lacquer border-lacquer/80 bg-lacquer/5';

  // Height configurations for the calligraphy image (aspect ratio is ~1.95:1)
  const sizeClasses = {
    sm: {
      imgHeight: 'h-6 sm:h-7',
      english: 'text-[9px] tracking-[0.3em]',
      symbol: 'w-5 h-5 text-xs',
      gap: 'gap-1',
    },
    md: {
      imgHeight: 'h-8 sm:h-9',
      english: 'text-[10px] tracking-[0.34em]',
      symbol: 'w-6 h-6 text-xs',
      gap: 'gap-1.5',
    },
    lg: {
      imgHeight: 'h-11 sm:h-14',
      english: 'text-[12px] tracking-[0.38em]',
      symbol: 'w-8 h-8 text-sm',
      gap: 'gap-2',
    },
    xl: {
      imgHeight: 'h-16 sm:h-24 md:h-28',
      english: 'text-xs sm:text-sm tracking-[0.42em]',
      symbol: 'w-10 h-10 text-base',
      gap: 'gap-2.5',
    },
  }[size];

  // Symbol seal icon (조선 왕실 인장 느낌의 모던 낙관)
  const SealMark = () => (
    <div
      className={`inline-flex items-center justify-center border ${sealColor} ${sizeClasses.symbol} font-serif select-none transition-transform hover:rotate-3 flex-shrink-0`}
      title="전주이씨 인장 (全州李氏)"
    >
      <span className="font-semibold transform -translate-y-[0.5px]">李</span>
    </div>
  );

  if (variant === 'symbol') {
    return <SealMark />;
  }

  if (variant === 'calligraphy-only') {
    return (
      <div className={`inline-flex items-center select-none cursor-pointer ${className}`}>
        <img
          src={logoSrc}
          alt="전주이씨 (JEONJU LEE)"
          className={`${sizeClasses.imgHeight} w-auto object-contain transition-opacity hover:opacity-85`}
        />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 select-none group cursor-pointer ${className}`}>
        <img
          src={logoSrc}
          alt="전주이씨"
          className={`${sizeClasses.imgHeight} w-auto object-contain transition-opacity group-hover:opacity-85`}
        />
        <SealMark />
      </div>
    );
  }

  return (
    <div
      className={`inline-flex flex-col items-center justify-center select-none text-center cursor-pointer group ${className}`}
    >
      <div className="flex items-center gap-2">
        <img
          src={logoSrc}
          alt="전주이씨 캘리그래피 로고"
          className={`${sizeClasses.imgHeight} w-auto object-contain transition-transform group-hover:scale-[1.02] duration-300`}
        />
        <SealMark />
      </div>
      <span
        className={`font-sans font-light uppercase ${sizeClasses.english} ${subColor} mt-1`}
      >
        JEONJU LEE
      </span>
    </div>
  );
};
