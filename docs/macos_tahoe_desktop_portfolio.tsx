// @ts-nocheck
import React, { useState } from 'react';

if (typeof document !== 'undefined' && !document.getElementById('tahoe-fonts')) {
  const link = document.createElement('link');
  link.id = 'tahoe-fonts';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@1&family=Inter:wght@400;500;600;700;800;900&display=swap';
  document.head.appendChild(link);
}

const MemojiAvatar = () => (
  <div className="w-10 h-10 rounded-full bg-amber-100/90 border-2 border-white/80 flex items-center justify-center shadow-lg overflow-hidden shrink-0 backdrop-blur-md">
    <svg className="w-8 h-8 transform translate-y-0.5" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="16" fill="#FDE68A" />
      <path d="M18 8C12.4772 8 8 12.4772 8 18C8 23.5228 12.4772 28 18 28C23.5228 28 28 23.5228 28 18C28 12.4772 23.5228 8 18 8Z" fill="#F3D0B5" />
      <circle cx="14" cy="17" r="3.5" stroke="#1E293B" strokeWidth="1.5" fill="none" />
      <circle cx="22" cy="17" r="3.5" stroke="#1E293B" strokeWidth="1.5" fill="none" />
      <line x1="17.5" y1="17" x2="18.5" y2="17" stroke="#1E293B" strokeWidth="1.5" />
      <path d="M15 22C16 23.5 20 23.5 21 22" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 15C10 11 13 9 18 9C23 9 26 11 26 15C26 12 22 10 18 10C14 10 10 12 10 15Z" fill="#332211" />
    </svg>
  </div>
);

const FigmaCursor = ({ color = "#8B5CF6", label = "" }) => (
  <div className="relative inline-flex items-center group pointer-events-none z-30">
    <svg className="w-5 h-5 drop-shadow-md filter" viewBox="0 0 24 24" fill="none">
      <path d="M3 3L10.07 19.97L13.58 13.58L19.97 10.07L3 3Z" fill={color} stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
    {label && (
      <span 
        className="ml-1 px-2.5 py-0.5 text-[11px] font-semibold text-white rounded-md shadow-md tracking-wide whitespace-nowrap"
        style={{ backgroundColor: color }}
      >
        {label}
      </span>
    )}
  </div>
);

const NotionIcon = ({ className = "w-12 h-12" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="22" fill="#EAE8E3"/>
    <path d="M28.6 25.5C30.2 25.3 32.7 25.1 35.8 24.9L70.5 22.8C72.3 22.7 73.1 23.8 72.8 25.4L68.2 69.8C68 71.3 66.8 72.5 65.1 72.7L25 75.8C23.3 75.9 22.2 74.8 22.5 73.2L27.1 28.8C27.3 27.2 28.5 25.6 28.6 25.5Z" fill="white" stroke="#111" strokeWidth="3"/>
    <path d="M35.5 35L50 34L61 33.2" stroke="#111" strokeWidth="4" strokeLinecap="round"/>
    <path d="M36 43L36 67" stroke="#111" strokeWidth="4" strokeLinecap="round"/>
    <path d="M36 43L57 65L57 41" stroke="#111" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const FigmaIcon = ({ className = "w-12 h-12" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="22" fill="#1E1E1E"/>
    <g transform="translate(25, 18) scale(0.54)">
      <path d="M19 0H38V38H19C8.50659 0 0 8.50659 0 19C0 29.4934 8.50659 38 19 38Z" fill="#F24E1E"/>
      <path d="M0 57C0 46.5066 8.50659 38 19 38H38V76H19C8.50659 76 0 67.4934 0 57Z" fill="#A259FF"/>
      <path d="M0 95C0 84.5066 8.50659 76 19 76H38V114C38 124.493 29.4934 133 19 133C8.50659 133 0 124.493 0 114V95Z" fill="#0ACF83"/>
      <path d="M38 0H57C67.4934 0 76 8.50659 76 19C76 29.4934 67.4934 38 57 38H38V0Z" fill="#FF7262"/>
      <path d="M76 57C76 67.4934 67.4934 76 57 76C46.5066 76 38 67.4934 38 57C38 46.5066 46.5066 38 57 38C67.4934 38 76 46.5066 76 57Z" fill="#1ABCFE"/>
    </g>
  </svg>
);

const SafariIcon = ({ className = "w-12 h-12" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="22" fill="url(#safari-bg)"/>
    <circle cx="50" cy="50" r="38" stroke="white" strokeWidth="2" strokeOpacity="0.6"/>
    <circle cx="50" cy="50" r="34" stroke="white" strokeWidth="1" strokeDasharray="2 4" strokeOpacity="0.8"/>
    <path d="M62 38L45 45L38 62L55 55L62 38Z" fill="#FF3B30"/>
    <path d="M38 62L45 45L55 55L38 62Z" fill="white"/>
    <circle cx="50" cy="50" r="3" fill="#1C1C1E"/>
    <defs>
      <linearGradient id="safari-bg" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#64B5F6"/>
        <stop offset="1" stopColor="#1565C0"/>
      </linearGradient>
    </defs>
  </svg>
);

const MacOSFolderIcon = ({ className = "w-20 h-16" }) => (
  <svg className={className} viewBox="0 0 120 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 16C10 11.5817 13.5817 8 18 8H42.5858C44.7087 8 46.7448 8.84285 48.2426 10.3406L55.7574 17.8558C57.2552 19.3536 59.2913 20.1964 61.4142 20.1964H102C106.418 20.1964 110 23.7782 110 28.1964V80C110 84.4183 106.418 88 102 88H10C5.58172 88 2 84.4183 2 80V24C2 19.5817 5.58172 16 10 16Z" fill="#78B0FA"/>
    <path d="M0 32C0 27.5817 3.58172 24 8 24H112C116.418 24 120 27.5817 120 32V80C120 84.4183 116.418 88 112 88H8C3.58172 88 0 84.4183 0 80V32Z" fill="url(#folder-tahoe-grad)"/>
    <path d="M0 32C0 27.5817 3.58172 24 8 24H112C116.418 24 120 27.5817 120 32V36H0V32Z" fill="#A5C9FF" fillOpacity="0.6"/>
    <defs>
      <linearGradient id="folder-tahoe-grad" x1="60" y1="24" x2="60" y2="88" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6DB0FF"/>
        <stop offset="1" stopColor="#3B82F6"/>
      </linearGradient>
    </defs>
  </svg>
);

const LiquidGlassWrapper = ({ children, className = "", style = {} }) => (
  <div 
    className={`liquidGlass-wrapper ${className}`}
    style={style}
  >
    <div className="liquidGlass-effect" />
    <div className="liquidGlass-tint" />
    <div className="liquidGlass-shine" />
    <div className="relative z-10 w-full h-full flex items-center justify-center">
      {children}
    </div>
  </div>
);

const FIXED_DESKTOP_ITEMS = [
  {
    id: 'folder-web-design',
    type: 'folder',
    title: 'web design',
    icon: 'folder',
    x: 10,
    y: 18
  },
  {
    id: 'app-notion',
    type: 'app',
    title: 'Notion',
    icon: 'notion',
    x: 22,
    y: 12
  },
  {
    id: 'img-school-women',
    type: 'image',
    title: 'school_for_women.jpeg',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    x: 8,
    y: 74
  },
  {
    id: 'app-safari',
    type: 'app',
    title: 'Safari',
    icon: 'safari',
    x: 20,
    y: 84
  },
  {
    id: 'img-ecological',
    type: 'image',
    title: 'ecological_school.jpeg',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
    x: 74,
    y: 14
  },
  {
    id: 'folder-social-media',
    type: 'folder',
    title: 'social media',
    icon: 'folder',
    x: 88,
    y: 18
  },
  {
    id: 'app-figma',
    type: 'app',
    title: 'Figma',
    icon: 'figma',
    x: 90,
    y: 52
  },
  {
    id: 'img-cake-shop',
    type: 'image',
    title: 'cake_shop.jpeg',
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
    x: 84,
    y: 82
  },
  {
    id: 'img-elysium',
    type: 'image',
    title: 'elysium_group.jpeg',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
    x: 70,
    y: 88
  }
];

export default function App() {
  const [selectedId, setSelectedId] = useState(null);

  const handleItemClick = (e, item) => {
    e.stopPropagation();
    setSelectedId(item.id);
  };

  return (
    <div 
      onClick={() => setSelectedId(null)}
      className="relative w-full h-screen overflow-hidden select-none font-sans bg-[#F4F2EB] text-[#1E1B18]"
      style={{ 
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Inter, sans-serif' 
      }}
    >
      {/* Liquid Glass Distortion SVG Filter */}
      <svg className="hidden">
        <defs>
          <filter id="glass-distortion" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.02 0.05" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* LIQUID GLASS & GRID STYLES */}
      <style>{`
        .liquidGlass-wrapper {
          position: relative;
          display: flex;
          font-weight: 600;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.2);
        }

        .liquidGlass-effect {
          position: absolute;
          z-index: 0;
          inset: 0;
          backdrop-filter: blur(12px);
          filter: url(#glass-distortion);
          overflow: hidden;
        }

        .liquidGlass-tint {
          z-index: 1;
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.55);
        }

        .liquidGlass-shine {
          position: absolute;
          inset: 0;
          z-index: 2;
          overflow: hidden;
          box-shadow: inset 2px 2px 1.5px 0 rgba(255, 255, 255, 0.8),
                      inset -1px -1px 1px 1px rgba(255, 255, 255, 0.4);
        }

        .tahoe-grid-bg {
          background-image: 
            linear-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.04) 1px, transparent 1px);
          background-size: 36px 36px;
        }
      `}</style>

      <div className="absolute inset-0 tahoe-grid-bg pointer-events-none z-0 opacity-70" />

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 px-4">
        <div className="relative text-center max-w-5xl mx-auto flex flex-col items-center justify-center -translate-y-4">
          
          {/* CALLOUT 1: Memoji + Hello Callout */}
          <div className="flex items-center space-x-2 mb-2 pointer-events-auto transform hover:scale-105 transition-transform cursor-pointer">
            <MemojiAvatar />
            <LiquidGlassWrapper className="rounded-full px-4 py-1.5 border border-white/80 shadow-sm">
              <span className="text-xs sm:text-sm font-semibold text-stone-800">Hello, I'm Binil</span>
            </LiquidGlassWrapper>
          </div>

          {/* MAIN HERO TITLE LINE 1: "designer" (Cursive Script) */}
          <div className="relative z-20 pointer-events-auto">
            <h2 
              className="text-6xl sm:text-8xl md:text-9xl tracking-tight text-blue-600/90 leading-none select-none"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic' }}
            >
              designer
            </h2>

            {/* Figma Cursor Badge overlay "Product" */}
            <div className="absolute -top-2 -right-12 sm:-right-20 pointer-events-auto transform rotate-6">
              <FigmaCursor color="#9333EA" label="Product" />
            </div>

            {/* Location Note: // Based in Bangalore, India */}
            <div className="hidden lg:flex absolute -right-52 top-6 text-left font-mono text-[11px] text-stone-500/80 leading-tight">
              <span>// Based in<br />Bangalore, India</span>
            </div>
          </div>

          {/* MAIN HERO TITLE LINE 2 + GIANT CENTER FOLDER: "portfolio" */}
          <div className="relative flex flex-col items-center justify-center -mt-4 sm:-mt-8 mb-2">
            
            <h1 className="text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] font-black tracking-tight text-[#1C1917] uppercase leading-none select-none">
              portfolio
            </h1>

            {/* GIANT MAIN FOLDER */}
            <div className="relative -mt-16 sm:-mt-24 md:-mt-32 transition-all duration-300 z-30 pointer-events-auto">
              <MacOSFolderIcon className="w-48 h-36 sm:w-64 sm:h-48 md:w-80 md:h-60 drop-shadow-2xl" />

              {/* Cursor Pointer Image overlay */}
              <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 pointer-events-none transform -rotate-12 drop-shadow-xl">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 fill-white stroke-stone-900" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M3 3L10.07 19.97L13.58 13.58L19.97 10.07L3 3Z" />
                </svg>
              </div>
            </div>

            {/* Green Let's Connect Pill Callout */}
            <div className="absolute right-0 sm:right-[-40px] md:right-[-80px] top-1/2 -translate-y-1/2 pointer-events-auto z-40">
              <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/80 text-stone-900 text-xs sm:text-sm font-semibold border border-stone-200 shadow-lg backdrop-blur-md">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Let's Connect</span>
              </div>
            </div>
          </div>

          {/* MAIN HERO YEAR STATEMENT: "(2026)" */}
          <div className="relative pointer-events-auto">
            <span 
              className="text-2xl sm:text-4xl font-bold tracking-tight text-stone-700/80"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic' }}
            >
              (2026)
            </span>

            {/* Purple User Badge Cursor "thegr8binil" */}
            <div className="absolute -bottom-1 -right-20 pointer-events-auto transform -rotate-3">
              <FigmaCursor color="#3B82F6" label="thegr8binil" />
            </div>
          </div>

          {/* LEFT CODE ANNOTATION */}
          <div className="hidden md:flex absolute -left-16 bottom-12 flex-col items-start font-mono text-[11px] text-stone-500 pointer-events-auto">
            <span>// Product with</span>
            <span>Purpose & Impact</span>
            <div className="mt-1 flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center text-[8px] text-white font-bold">✓</div>
              <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold shadow-sm">Dev</span>
            </div>
          </div>

          {/* SUB-HEADLINE STATEMENT */}
          <p className="mt-6 sm:mt-8 text-base sm:text-xl font-medium max-w-2xl text-center leading-relaxed text-stone-700">
            I create digital experiences that border on{' '}
            <span className="text-purple-600 font-bold underline decoration-2 decoration-purple-400/50">efficiency</span>,{' '}
            <span className="text-amber-600 font-bold underline decoration-2 decoration-amber-400/50">aesthetics</span> and{' '}
            <span className="text-teal-600 font-bold underline decoration-2 decoration-teal-400/50">functionality</span>.
          </p>

        </div>
      </div>

      {FIXED_DESKTOP_ITEMS.map((item) => {
        const isSelected = selectedId === item.id;

        return (
          <div
            key={item.id}
            onClick={(e) => handleItemClick(e, item)}
            className={`absolute cursor-pointer flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 z-20 ${
              isSelected 
                ? 'bg-blue-500/15 border border-blue-400/60 backdrop-blur-md shadow-md' 
                : 'hover:bg-white/40'
            }`}
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {/* ITEM TYPE: Folder */}
            {item.type === 'folder' && (
              <div className="flex flex-col items-center">
                <MacOSFolderIcon className="w-14 h-12 sm:w-16 sm:h-14 drop-shadow-md" />
                <span className="mt-1.5 text-xs font-semibold tracking-tight px-2 py-0.5 rounded-md bg-white/75 text-stone-800 border border-stone-200/80 backdrop-blur-md text-center shadow-xs">
                  {item.title}
                </span>
              </div>
            )}

            {/* ITEM TYPE: App */}
            {item.type === 'app' && (
              <div className="flex flex-col items-center">
                {item.icon === 'notion' && <NotionIcon className="w-11 h-11 sm:w-12 sm:h-12 drop-shadow-lg" />}
                {item.icon === 'figma' && <FigmaIcon className="w-11 h-11 sm:w-12 sm:h-12 drop-shadow-lg" />}
                {item.icon === 'safari' && <SafariIcon className="w-11 h-11 sm:w-12 sm:h-12 drop-shadow-lg" />}
                <span className="mt-1.5 text-xs font-semibold px-2 py-0.5 rounded-md bg-white/75 text-stone-800 border border-stone-200/80 backdrop-blur-md shadow-xs">
                  {item.title}
                </span>
              </div>
            )}

            {/* ITEM TYPE: Image Preview */}
            {item.type === 'image' && (
              <div className="flex flex-col items-center max-w-[110px] sm:max-w-[130px]">
                <div className="p-1 bg-white/90 shadow-lg rounded-lg border border-stone-200/80 transform hover:scale-105 transition-transform backdrop-blur-md">
                  <img 
                    src={item.imageUrl} 
                    alt={item.title} 
                    className="w-18 h-22 sm:w-22 sm:h-26 object-cover rounded" 
                    draggable={false}
                  />
                </div>
                <span className="mt-1.5 text-[10px] sm:text-xs font-mono px-1.5 py-0.5 rounded bg-white/80 text-stone-800 border border-stone-200/80 backdrop-blur-md truncate max-w-full shadow-xs">
                  {item.title}
                </span>
              </div>
            )}
          </div>
        );
      })}

    </div>
  );
}