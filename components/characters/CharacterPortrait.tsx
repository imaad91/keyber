"use client";

import { useEffect, useState } from "react";
import {
  CHARACTER_META,
  CHARACTER_PALETTE,
  EXPRESSION_RULES,
  PORTRAIT_SIZES,
  STROKE,
  TRUST_CROSSFADE_MS,
  expressionFromTrust,
  type CharacterExpression,
  type CharacterVisualId,
  type PortraitSize,
} from "@/lib/characterStyle";
import { cn } from "@/lib/utils";

type CharacterPortraitProps = {
  id: CharacterVisualId;
  trust?: number;
  expression?: CharacterExpression;
  size?: PortraitSize | number;
  rounded?: "square" | "full" | "2xl";
  showBadge?: boolean;
  className?: string;
  animateOnTrustChange?: boolean;
};

export function CharacterPortrait({
  id,
  trust = 50,
  expression,
  size = "lg",
  rounded = "2xl",
  showBadge = false,
  className,
  animateOnTrustChange = true,
}: CharacterPortraitProps) {
  const resolved = expression ?? expressionFromTrust(trust);
  const [display, setDisplay] = useState(resolved);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!animateOnTrustChange) {
      setDisplay(resolved);
      return;
    }
    if (resolved === display) return;
    setFading(true);
    const t = window.setTimeout(() => {
      setDisplay(resolved);
      setFading(false);
    }, TRUST_CROSSFADE_MS / 2);
    return () => window.clearTimeout(t);
  }, [resolved, display, animateOnTrustChange]);

  const px = typeof size === "number" ? size : PORTRAIT_SIZES[size];
  const radius =
    rounded === "full"
      ? "9999px"
      : rounded === "2xl"
        ? "1rem"
        : "0.5rem";

  return (
    <div
      className={cn("relative inline-block overflow-hidden", className)}
      style={{ width: px, height: px, borderRadius: radius }}
    >
      <div
        className={cn(
          "h-full w-full transition-opacity ease-in-out",
          fading ? "opacity-0" : "opacity-100"
        )}
        style={{ transitionDuration: `${TRUST_CROSSFADE_MS / 2}ms` }}
      >
        <PortraitSvg id={id} expression={display} />
      </div>
      {showBadge ? (
        <span
          className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
          style={{
            background:
              display === "ALLIE"
                ? CHARACTER_PALETTE.mint
                : display === "MEFIANT"
                  ? "#E8DDD4"
                  : CHARACTER_PALETTE.beige,
            color: CHARACTER_PALETTE.navy,
            border: `1.5px solid ${STROKE.color}`,
          }}
        >
          {EXPRESSION_RULES[display].label}
        </span>
      ) : null}
    </div>
  );
}

function PortraitSvg({
  id,
  expression,
}: {
  id: CharacterVisualId;
  expression: CharacterExpression;
}) {
  const bg = EXPRESSION_RULES[expression].bg;
  const mintWash = expression === "ALLIE" ? CHARACTER_PALETTE.mint : null;

  return (
    <svg
      viewBox="0 0 200 200"
      className="h-full w-full"
      role="img"
      aria-label={`${CHARACTER_META[id].displayName} — ${EXPRESSION_RULES[expression].label}`}
    >
      <rect width="200" height="200" fill={bg} />
      {mintWash ? (
        <circle cx="160" cy="36" r="42" fill={mintWash} opacity="0.28" />
      ) : null}
      {id === "pers-marie" ? (
        <Marie expression={expression} />
      ) : id === "pers-karim" ? (
        <Karim expression={expression} />
      ) : id === "pers-laurent" ? (
        <Laurent expression={expression} />
      ) : (
        <Henri expression={expression} />
      )}
    </svg>
  );
}

function FaceBase({
  skin,
  cx = 100,
  cy = 88,
  r = 42,
}: {
  skin: string;
  cx?: number;
  cy?: number;
  r?: number;
}) {
  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill={skin}
      stroke={STROKE.color}
      strokeWidth={STROKE.width}
    />
  );
}

function Eyes({
  expression,
  y = 82,
  spread = 16,
}: {
  expression: CharacterExpression;
  y?: number;
  spread?: number;
}) {
  const browY =
    expression === "MEFIANT" ? y - 14 : expression === "ALLIE" ? y - 18 : y - 16;
  const browTilt = expression === "MEFIANT" ? 6 : expression === "ALLIE" ? -3 : 0;
  return (
    <g stroke={STROKE.color} strokeWidth={STROKE.width} strokeLinecap="round">
      <line
        x1={100 - spread - 8}
        y1={browY + browTilt}
        x2={100 - spread + 8}
        y2={browY - browTilt}
      />
      <line
        x1={100 + spread - 8}
        y1={browY - browTilt}
        x2={100 + spread + 8}
        y2={browY + browTilt}
      />
      <circle cx={100 - spread} cy={y} r={3.5} fill={STROKE.color} />
      <circle cx={100 + spread} cy={y} r={3.5} fill={STROKE.color} />
    </g>
  );
}

function Mouth({
  expression,
  y = 108,
}: {
  expression: CharacterExpression;
  y?: number;
}) {
  if (expression === "MEFIANT") {
    return (
      <path
        d={`M 88 ${y + 4} Q 100 ${y - 4} 112 ${y + 4}`}
        fill="none"
        stroke={STROKE.color}
        strokeWidth={STROKE.width}
        strokeLinecap="round"
      />
    );
  }
  if (expression === "ALLIE") {
    return (
      <path
        d={`M 88 ${y - 2} Q 100 ${y + 10} 112 ${y - 2}`}
        fill="none"
        stroke={STROKE.color}
        strokeWidth={STROKE.width}
        strokeLinecap="round"
      />
    );
  }
  return (
    <line
      x1={90}
      y1={y}
      x2={110}
      y2={y}
      stroke={STROKE.color}
      strokeWidth={STROKE.width}
      strokeLinecap="round"
    />
  );
}

function Marie({ expression }: { expression: CharacterExpression }) {
  const meta = CHARACTER_META["pers-marie"];
  const skin = CHARACTER_PALETTE.skinLight;
  return (
    <g>
      {/* ponytail */}
      <ellipse
        cx="138"
        cy="70"
        rx="16"
        ry="28"
        fill={meta.hair}
        stroke={STROKE.color}
        strokeWidth={STROKE.width}
      />
      {/* hair mass */}
      <path
        d="M58 92 C58 52 78 38 100 38 C122 38 142 52 142 92 L142 100 C142 70 122 58 100 58 C78 58 58 70 58 100 Z"
        fill={meta.hair}
        stroke={STROKE.color}
        strokeWidth={STROKE.width}
      />
      {/* shoulders / crossed arms suggestion */}
      <path
        d="M40 200 L40 148 C40 132 58 122 78 122 L122 122 C142 122 160 132 160 148 L160 200 Z"
        fill={meta.jacketOrTop}
        stroke={STROKE.color}
        strokeWidth={STROKE.width}
      />
      <path
        d="M52 168 C70 150 90 148 100 148 C110 148 130 150 148 168 L148 200 L52 200 Z"
        fill={CHARACTER_PALETTE.blue}
        stroke={STROKE.color}
        strokeWidth={STROKE.width}
      />
      {/* crossed forearms */}
      <rect
        x="58"
        y="158"
        width="84"
        height="18"
        rx="9"
        fill="#2F5A96"
        stroke={STROKE.color}
        strokeWidth={STROKE.width}
      />
      <FaceBase skin={skin} />
      {/* gold earring */}
      <circle
        cx="142"
        cy="98"
        r="4"
        fill="#E8B84A"
        stroke={STROKE.color}
        strokeWidth={1.5}
      />
      <Eyes expression={expression} />
      <Mouth expression={expression} />
    </g>
  );
}

function Karim({ expression }: { expression: CharacterExpression }) {
  const meta = CHARACTER_META["pers-karim"];
  const skin = CHARACTER_PALETTE.skinMid;
  return (
    <g>
      <path
        d="M40 200 L40 146 C40 130 58 120 80 120 L120 120 C142 120 160 130 160 146 L160 200 Z"
        fill={meta.jacketOrTop}
        stroke={STROKE.color}
        strokeWidth={STROKE.width}
      />
      {/* polo collar */}
      <path
        d="M88 120 L100 136 L112 120"
        fill={CHARACTER_PALETTE.beige}
        stroke={STROKE.color}
        strokeWidth={STROKE.width}
      />
      {/* short hair */}
      <path
        d="M60 90 C60 54 78 40 100 40 C122 40 140 54 140 90 L140 78 C140 58 122 50 100 50 C78 50 60 58 60 78 Z"
        fill={meta.hair}
        stroke={STROKE.color}
        strokeWidth={STROKE.width}
      />
      <FaceBase skin={skin} />
      {/* light beard */}
      <path
        d="M72 100 C76 124 88 132 100 132 C112 132 124 124 128 100"
        fill="#8B6914"
        opacity="0.35"
        stroke={STROKE.color}
        strokeWidth={1.5}
      />
      <Eyes expression={expression} y={80} />
      <Mouth expression={expression} y={106} />
    </g>
  );
}

function Laurent({ expression }: { expression: CharacterExpression }) {
  const meta = CHARACTER_META["pers-laurent"];
  const skin = CHARACTER_PALETTE.skinLight;
  return (
    <g>
      <path
        d="M38 200 L38 148 C38 132 58 122 80 122 L120 122 C142 122 162 132 162 148 L162 200 Z"
        fill={meta.jacketOrTop}
        stroke={STROKE.color}
        strokeWidth={STROKE.width}
      />
      {/* white shirt */}
      <path
        d="M88 122 L100 150 L112 122 Z"
        fill={CHARACTER_PALETTE.white}
        stroke={STROKE.color}
        strokeWidth={STROKE.width}
      />
      {/* salt-and-pepper hair */}
      <path
        d="M62 88 C62 52 78 40 100 40 C122 40 138 52 138 88 L138 76 C138 56 120 48 100 48 C80 48 62 56 62 76 Z"
        fill={meta.hair}
        stroke={STROKE.color}
        strokeWidth={STROKE.width}
      />
      <FaceBase skin={skin} />
      <Eyes
        expression={expression === "ALLIE" ? "NEUTRE" : expression}
        y={80}
      />
      <Mouth
        expression={expression === "ALLIE" ? "NEUTRE" : expression}
        y={108}
      />
      {/* demanding brow boost for default */}
      {expression === "NEUTRE" ? (
        <g stroke={STROKE.color} strokeWidth={2} strokeLinecap="round">
          <line x1={78} y1={68} x2={92} y2={66} />
          <line x1={108} y1={66} x2={122} y2={68} />
        </g>
      ) : null}
    </g>
  );
}

function Henri({ expression }: { expression: CharacterExpression }) {
  const meta = CHARACTER_META["pers-henri"];
  const skin = CHARACTER_PALETTE.skinLight;
  const smileExpr: CharacterExpression =
    expression === "MEFIANT" ? "NEUTRE" : "ALLIE";
  return (
    <g>
      <path
        d="M40 200 L40 148 C40 132 58 124 80 124 L120 124 C142 124 160 132 160 148 L160 200 Z"
        fill={meta.jacketOrTop}
        stroke={STROKE.color}
        strokeWidth={STROKE.width}
      />
      {/* worn jacket patch */}
      <rect
        x="48"
        y="150"
        width="22"
        height="16"
        rx="3"
        fill="#7A8C8A"
        stroke={STROKE.color}
        strokeWidth={1.5}
      />
      {/* white hair */}
      <path
        d="M58 92 C58 50 76 36 100 36 C124 36 142 50 142 92 L142 80 C142 56 122 46 100 46 C78 46 58 56 58 80 Z"
        fill={meta.hair}
        stroke={STROKE.color}
        strokeWidth={STROKE.width}
      />
      <FaceBase skin={skin} />
      {/* glasses */}
      <g
        fill="none"
        stroke={STROKE.color}
        strokeWidth={STROKE.width}
        strokeLinecap="round"
      >
        <circle cx={86} cy={84} r={11} />
        <circle cx={114} cy={84} r={11} />
        <line x1={97} y1={84} x2={103} y2={84} />
        <line x1={75} y1={84} x2={68} y2={80} />
        <line x1={125} y1={84} x2={132} y2={80} />
      </g>
      <Eyes expression={smileExpr} y={84} />
      <Mouth expression={smileExpr} y={110} />
    </g>
  );
}
