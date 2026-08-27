import React, { useState } from 'react';

export const FigmaCursor = ({ color = "#8B5CF6", label = "" }: { color?: string; label?: string }) => (
  <div className="relative inline-flex items-center group pointer-events-none z-30 select-none">
    <svg className="w-5 h-5 drop-shadow-md filter" viewBox="0 0 24 24" fill="none">
      <path d="M3 3L10.07 19.97L13.58 13.58L19.97 10.07L3 3Z" fill={color} stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
    {label && (
      <span 
        className="ml-1 px-2.5 py-0.5 text-[11px] font-semibold text-white rounded-md shadow-md tracking-wide whitespace-nowrap font-sans"
        style={{ backgroundColor: color }}
      >
        {label}
      </span>
    )}
  </div>
);

export const MacOSFolderIcon = ({ className = "w-14 h-auto" }: { className?: string }) => (
  <img
    src="/icons/folder.svg"
    alt="Folder"
    className={`${className} object-contain select-none pointer-events-none drop-shadow-md`}
    draggable={false}
  />
);

export const SafariIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <img
    src="https://s3-new.macosicons.com/macosicons/parse/Safari__MacOS_Tahoe__utug9Rt8g6_lowResPng-e86f84b6e9.png"
    alt="Safari"
    className={`${className} object-contain select-none pointer-events-none drop-shadow-lg`}
    draggable={false}
  />
);

export const NotionIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <img
    src="https://s3-new.macosicons.com/macosicons/parse/Notes__MacOS_Tahoe__Tn8SuaHtAM_lowResPng-632fb908b1.png"
    alt="Notion"
    className={`${className} object-contain select-none pointer-events-none drop-shadow-lg`}
    draggable={false}
  />
);

export const VsCodeIcon = ({ className = "w-12 h-12" }: { className?: string }) => {
  const [src, setSrc] = useState("https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/vscode.png");
  return (
    <img
      src={src}
      alt="VS Code"
      className={`${className} object-contain select-none pointer-events-none drop-shadow-lg`}
      draggable={false}
      onError={() => {
        setSrc("https://raw.githubusercontent.com/devicons/devicon/master/icons/vscode/vscode-original.svg");
      }}
    />
  );
};

export const PythonIcon = ({ className = "w-12 h-12" }: { className?: string }) => {
  const [src, setSrc] = useState("https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/python.png");
  return (
    <img
      src={src}
      alt="Python"
      className={`${className} object-contain select-none pointer-events-none drop-shadow-lg`}
      draggable={false}
      onError={() => {
        setSrc("https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg");
      }}
    />
  );
};

export const TensorFlowIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center select-none pointer-events-none drop-shadow-lg`}>
    <svg 
      viewBox="18 14 84 94" 
      className="w-full h-full" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* TOP FACES (Amber/Gold #FFB703) */}
      <polygon 
        points="18,34 52,14 102,43 85,53 52,34 35,44" 
        fill="#FFB703" 
      />
      <polygon 
        points="52,72 69,62 86,72 69,82" 
        fill="#FFB703" 
      />

      {/* LEFT FACES (Deep Red-Orange #E74C23) */}
      <polygon 
        points="18,34 35,44 35,63 18,53" 
        fill="#E74C23" 
      />
      <polygon 
        points="35,44 52,53 52,108 35,98" 
        fill="#E74C23" 
      />
      <polygon 
        points="52,72 69,82 69,101 52,91" 
        fill="#E74C23" 
      />

      {/* RIGHT / FRONT-RIGHT FACES (Warm Orange #F7931E) */}
      <polygon 
        points="52,34 85,53 85,72 52,53" 
        fill="#F7931E" 
      />
      <polygon 
        points="102,43 102,62 85,72 85,53" 
        fill="#F7931E" 
      />
      <polygon 
        points="86,72 86,91 69,101 69,82" 
        fill="#F7931E" 
      />
    </svg>
  </div>
);

export const FigmaIcon = TensorFlowIcon;

export const PhotosIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <img
    src="https://s3-new.macosicons.com/macosicons/parse/low_res_Photos_macOS_Golden_Gate_mxVHKSuSHM-06d7e83102.png"
    alt="Photos"
    className={`${className} object-contain select-none pointer-events-none drop-shadow-lg`}
    draggable={false}
  />
);

export const PdfIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <img
    src="https://s3.macosicons.com/macosicons/icons/ayIhAsqzsY/lowResPngFile_55b757e27580fefb9bd856a23abf6d0f_low_res_Pdf_Document.png"
    alt="PDF"
    className={`${className} object-contain select-none pointer-events-none drop-shadow-lg`}
    draggable={false}
  />
);

export const TextFileIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <img
    src="https://s3.macosicons.com/macosicons/icons/aExwB3ULuk/lowResPngFile_a819aac512e7261fee3310f1bbdaada7_aExwB3ULuk.png"
    alt="Text Document"
    className={`${className} object-contain select-none pointer-events-none drop-shadow-lg`}
    draggable={false}
  />
);
