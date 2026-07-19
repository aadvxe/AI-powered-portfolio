"use client";

/**
 * Animated paper-cut sea scene — cream sky, drifting clouds, distant
 * mountains, layered waves and bobbing tall ships, after the style of
 * 19th-century maritime paintings. Pure SVG, no external assets.
 */

/** A stylized clipper ship with square-rigged sails */
function Ship({ x, y, scale, bobClass, faded }: { x: number; y: number; scale: number; bobClass: string; faded?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={faded ? 0.75 : 1}>
      <g className={bobClass}>
        {/* hull */}
        <path
          d="M14,118 L26,140 Q40,148 70,149 L136,149 Q166,146 178,124 L196,112 L188,120 L170,120 Q120,124 40,120 Z"
          fill="#3b352c"
        />
        {/* masts */}
        <path d="M56,26 L56,121" stroke="#3b352c" strokeWidth="3" />
        <path d="M102,12 L102,122" stroke="#3b352c" strokeWidth="3.4" />
        <path d="M146,32 L146,121" stroke="#3b352c" strokeWidth="2.8" />
        {/* fore sails */}
        <path d="M38,36 L74,36 L70,56 L42,56 Z" fill="#f4efe1" stroke="#4a4438" strokeWidth="1" />
        <path d="M35,61 L77,61 L73,84 L39,84 Z" fill="#efe9d8" stroke="#4a4438" strokeWidth="1" />
        <path d="M32,89 L80,89 L76,114 L36,114 Z" fill="#f4efe1" stroke="#4a4438" strokeWidth="1" />
        {/* main sails */}
        <path d="M82,22 L122,22 L118,44 L86,44 Z" fill="#f4efe1" stroke="#4a4438" strokeWidth="1" />
        <path d="M79,49 L125,49 L121,74 L83,74 Z" fill="#efe9d8" stroke="#4a4438" strokeWidth="1" />
        <path d="M76,79 L128,79 L124,116 L80,116 Z" fill="#f4efe1" stroke="#4a4438" strokeWidth="1" />
        {/* mizzen sails */}
        <path d="M130,42 L162,42 L158,62 L134,62 Z" fill="#efe9d8" stroke="#4a4438" strokeWidth="1" />
        <path d="M127,67 L165,67 L161,92 L131,92 Z" fill="#f4efe1" stroke="#4a4438" strokeWidth="1" />
        {/* jib sail */}
        <path d="M162,112 L196,102 L166,68 Z" fill="#efe9d8" stroke="#4a4438" strokeWidth="1" />
        {/* flags */}
        <path d="M102,12 L114,16 L102,20 Z" fill="#b3542f" />
        <path d="M56,26 L66,29 L56,33 Z" fill="#b3542f" />
      </g>
    </g>
  );
}

/** Repeating wavy band; pattern period 120px over 2880px width so a
 *  1440px translate loops seamlessly */
function waveTop() {
  let d = "M0,24 q30,-20 60,0";
  for (let i = 0; i < 23; i++) d += " t120,0";
  return d;
}

function WaveBand({ y, fill, foam, className }: { y: number; fill: string; foam?: boolean; className: string }) {
  const top = waveTop();
  return (
    <g transform={`translate(0 ${y})`}>
      <g className={className}>
        <path d={`${top} t120,0 L2960,240 L0,240 Z`} fill={fill} />
        {foam && (
          <path d={`${top} t120,0`} fill="none" stroke="#f4efe1" strokeWidth="2" opacity="0.45" />
        )}
      </g>
    </g>
  );
}

function Cloud({ x, y, scale, className }: { x: number; y: number; scale: number; className: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} className={className}>
      <path
        d="M0,42 Q4,18 30,16 Q38,-4 66,2 Q84,-10 104,4 Q130,-2 138,16 Q166,16 168,38 Q170,52 150,54 L16,54 Q-2,54 0,42 Z"
        fill="#f7f3e7"
        opacity="0.9"
      />
    </g>
  );
}

export function SeaScene() {
  return (
    <svg
      viewBox="0 0 1440 560"
      preserveAspectRatio="xMidYMax slice"
      className="pointer-events-none h-full w-full"
      aria-hidden
    >
      {/* sky wash */}
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#efece3" />
          <stop offset="72%" stopColor="#e9e2cf" />
          <stop offset="100%" stopColor="#e2d8bf" />
        </linearGradient>
      </defs>
      <rect width="1440" height="420" fill="url(#sky)" />

      {/* clouds */}
      <Cloud x={140} y={70} scale={1.15} className="cloud-a" />
      <Cloud x={620} y={40} scale={0.8} className="cloud-b" />
      <Cloud x={980} y={90} scale={1.35} className="cloud-a" />
      <Cloud x={1290} y={50} scale={0.7} className="cloud-b" />

      {/* birds */}
      <path d="M430,150 q7,-8 14,0 q7,-8 14,0" fill="none" stroke="#6b6455" strokeWidth="2" strokeLinecap="round" />
      <path d="M480,132 q6,-7 12,0 q6,-7 12,0" fill="none" stroke="#6b6455" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
      <path d="M1080,160 q6,-7 12,0 q6,-7 12,0" fill="none" stroke="#6b6455" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />

      {/* distant mountain ranges */}
      <path
        d="M0,352 L90,320 L170,344 L260,300 L350,340 L470,296 L560,336 L640,318 L720,348 L820,306 L930,342 L1030,310 L1120,344 L1230,298 L1330,336 L1440,316 L1440,420 L0,420 Z"
        fill="#b5a48d"
        opacity="0.75"
      />
      <path
        d="M0,384 L110,352 L210,380 L330,338 L430,376 L540,350 L660,382 L780,344 L890,378 L1000,352 L1110,382 L1240,346 L1350,378 L1440,360 L1440,430 L0,430 Z"
        fill="#8d7b68"
        opacity="0.85"
      />

      {/* far ship, behind the first wave band */}
      <Ship x={640} y={330} scale={0.4} bobClass="ship-bob-3" faded />

      {/* sea */}
      <WaveBand y={382} fill="#87999f" className="wave-slow" foam />
      <Ship x={950} y={300} scale={0.62} bobClass="ship-bob-2" />
      <WaveBand y={428} fill="#6b8290" className="wave-mid" foam />
      <Ship x={170} y={280} scale={0.95} bobClass="ship-bob" />
      <WaveBand y={478} fill="#597083" className="wave-fast" foam />
      <WaveBand y={524} fill="#4b6172" className="wave-mid" />
    </svg>
  );
}
