/**
 * Torn-paper edge between sections. Renders a jagged strip filled with the
 * color of the section it belongs to; `flip` mirrors it for bottom edges.
 */

const EDGES = [
  "M0,30 L0,16 L48,21 L92,9 L143,18 L201,7 L259,17 L318,10 L370,20 L432,8 L491,18 L548,11 L604,21 L667,9 L724,17 L779,7 L841,19 L903,10 L958,20 L1013,8 L1074,17 L1136,9 L1193,19 L1247,11 L1304,20 L1361,8 L1409,16 L1440,12 L1440,30 Z",
  "M0,30 L0,12 L39,19 L97,8 L152,17 L214,10 L271,21 L327,9 L385,16 L447,7 L502,19 L561,11 L622,20 L684,8 L739,18 L797,10 L853,20 L911,7 L968,17 L1029,11 L1087,21 L1148,9 L1204,18 L1262,8 L1317,17 L1378,10 L1421,18 L1440,14 L1440,30 Z",
];

interface TornDividerProps {
  fill?: string;
  flip?: boolean;
  variant?: 0 | 1;
}

export function TornDivider({ fill = "var(--paper-deep)", flip, variant = 0 }: TornDividerProps) {
  return (
    <svg
      viewBox="0 0 1440 30"
      preserveAspectRatio="none"
      className={`block h-6 w-full md:h-8 ${flip ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path d={EDGES[variant]} fill={fill} />
    </svg>
  );
}
