import React, { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, StyleSheet, View } from "react-native";
import Svg, { Circle, G, Line, Path } from "react-native-svg";
import { BodyText } from "@/components/BodyText";
import { color, space, tapTarget } from "@/theme/tokens";

/**
 * A hip hinge has no demo photo anywhere — neither NIA nor NHS programs one for
 * this population (see assets/demos/CREDITS.md), and the seated chair variant
 * is specific to this app. A line figure arguably teaches it better than a
 * photo would: the cue is "the back stays straight, the fold happens at the
 * hip", and a single straight spine pivoting about one joint shows precisely
 * that, where clothing and body shape obscure it in a photograph.
 */

const CYCLE_MS = 4200; // slow: the movement itself should be unhurried

type Variant = "seated" | "standing";
type Figure = "female" | "male";

/**
 * The figures differ by hair, shoulder/hip width, and torso-to-leg proportion:
 * the female figure gets a shorter torso over longer legs and wider hips.
 * Deliberately not the restroom-sign skirt — it is dated, and nobody trains in
 * one; a figure that does not look like it is exercising undercuts the point.
 */
const FIGURE = {
  female: { hair: true, shoulderWidth: 13, hipWidth: 17, headR: 12, torso: 45, legBonus: 10 },
  male: { hair: false, shoulderWidth: 17, hipWidth: 12, headR: 13, torso: 57, legBonus: 0 },
} as const;

/** Seated and standing hinges differ in setup, so the figure does too. */
const GEOMETRY = {
  seated: { hip: { x: 112, y: 104 }, maxFold: 48, viewBox: "52 14 158 172" },
  standing: { hip: { x: 112, y: 86 }, maxFold: 55, viewBox: "74 6 108 178" },
} as const;

interface Props {
  variant?: Variant;
  figure?: Figure;
}

export function HipHingeAnimation({ variant = "seated", figure = "female" }: Props) {
  const { maxFold: MAX_FOLD_DEGREES, viewBox } = GEOMETRY[variant];
  const F = FIGURE[figure];
  const base = GEOMETRY[variant].hip;
  // Standing: raise the hip to lengthen the legs. Seated: the hip must stay on
  // the seat, so the thigh reaches further forward instead.
  const HIP = variant === "standing" ? { x: base.x, y: base.y - F.legBonus } : base;
  const knee = variant === "standing" ? 118 : 168 + F.legBonus;
  const [fold, setFold] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (!cancelled) setReduceMotion(enabled);
      })
      .catch(() => {
        /* default to animating */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setFold(MAX_FOLD_DEGREES * 0.8);
      return;
    }
    const start = Date.now();
    const tick = () => {
      const t = ((Date.now() - start) % CYCLE_MS) / CYCLE_MS;
      // Smooth there-and-back, pausing naturally at each end.
      const eased = (1 - Math.cos(t * 2 * Math.PI)) / 2;
      setFold(eased * MAX_FOLD_DEGREES);
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [reduceMotion]);

  const shoulder = { x: HIP.x, y: HIP.y - F.torso };

  return (
    <View style={styles.wrap}>
      <View style={styles.canvas}>
        <Svg
          viewBox={viewBox}
          width="100%"
          height="100%"
          accessibilityLabel={`Animated figure ${variant === "seated" ? "seated on a chair" : "standing"}, folding forward from the hips with a straight back`}
        >
          {variant === "seated" && (
            <>
              <Line x1={70} y1={108} x2={70} y2={48} stroke={color.border} strokeWidth={5} strokeLinecap="round" />
              <Line x1={70} y1={108} x2={146} y2={108} stroke={color.border} strokeWidth={5} strokeLinecap="round" />
              <Line x1={74} y1={108} x2={74} y2={172} stroke={color.border} strokeWidth={5} strokeLinecap="round" />
              <Line x1={142} y1={108} x2={142} y2={172} stroke={color.border} strokeWidth={5} strokeLinecap="round" />
            </>
          )}

          {/* floor */}
          <Line x1={30} y1={172} x2={214} y2={172} stroke={color.border} strokeWidth={3} strokeLinecap="round" />

          {/* legs stay put: only the torso moves */}
          {variant === "seated" ? (
            <>
              <Line x1={HIP.x} y1={HIP.y} x2={knee} y2={104} stroke={color.primary} strokeWidth={9} strokeLinecap="round" />
              <Line x1={knee} y1={104} x2={knee} y2={166} stroke={color.primary} strokeWidth={9} strokeLinecap="round" />
              <Line x1={knee} y1={168} x2={knee + 24} y2={168} stroke={color.primary} strokeWidth={9} strokeLinecap="round" />
            </>
          ) : (
            <>
              {/* soft knee bend, as the cues describe */}
              <Line x1={HIP.x} y1={HIP.y} x2={118} y2={HIP.y + (168 - HIP.y) * 0.55} stroke={color.primary} strokeWidth={9} strokeLinecap="round" />
              <Line x1={118} y1={HIP.y + (168 - HIP.y) * 0.55} x2={112} y2={168} stroke={color.primary} strokeWidth={9} strokeLinecap="round" />
              <Line x1={112} y1={168} x2={138} y2={168} stroke={color.primary} strokeWidth={9} strokeLinecap="round" />
            </>
          )}

          {/* everything that pivots about the hip */}
          {/* SVG's own rotate(angle, cx, cy): react-native-svg's `origin` and
              `originX`/`originY` props are dropped by the web shim, which
              silently pivots the figure about the canvas corner instead. */}
          <G transform={`rotate(${fold}, ${HIP.x}, ${HIP.y})`}>
            {/* spine drawn as one unbroken straight line — that is the teaching point */}
            <Line
              x1={HIP.x}
              y1={HIP.y}
              x2={shoulder.x}
              y2={shoulder.y}
              stroke={color.primary}
              strokeWidth={11}
              strokeLinecap="round"
            />
            {/* shoulders */}
            <Line
              x1={shoulder.x - F.shoulderWidth / 2}
              y1={shoulder.y}
              x2={shoulder.x + F.shoulderWidth / 2}
              y2={shoulder.y}
              stroke={color.primary}
              strokeWidth={7}
              strokeLinecap="round"
            />
            {F.hair && (
              <>
                {/* drawn before the head so only a rim of hair shows around it */}
                <Circle
                  cx={shoulder.x - 4}
                  cy={shoulder.y - 15}
                  r={F.headR + 4}
                  fill={color.textMuted}
                />
                <Path
                  d={`M ${shoulder.x - 13} ${shoulder.y - 20} q -5 18 1 26 q 8 3 10 -5 q -7 -9 -3 -20 Z`}
                  fill={color.textMuted}
                />
              </>
            )}
            <Circle cx={shoulder.x} cy={shoulder.y - 15} r={F.headR} fill={color.primary} />
            {/* arm reaching down the thigh */}
            {/* arm hangs from the shoulder; body-coloured so the orange hip
                marker stays the only thing competing for attention */}
            <Line
              x1={shoulder.x + 2}
              y1={shoulder.y + 2}
              x2={shoulder.x + (variant === "seated" ? 26 : 8)}
              y2={shoulder.y + F.torso * 0.72}
              stroke={color.primary}
              strokeWidth={6}
              strokeLinecap="round"
              opacity={0.75}
            />
          </G>

          {/* pelvis width differs between figures; the dot marks the pivot */}
          <Line
            x1={HIP.x - F.hipWidth / 2}
            y1={HIP.y}
            x2={HIP.x + F.hipWidth / 2}
            y2={HIP.y}
            stroke={color.primary}
            strokeWidth={8}
            strokeLinecap="round"
          />
          <Circle cx={HIP.x} cy={HIP.y} r={6} fill={color.accent} />
        </Svg>
      </View>
      <BodyText muted style={styles.caption}>
        The orange dot is your hip. Your back stays in one straight line and folds from there —
        your spine does not curl.
      </BodyText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: space.md,
    marginBottom: space.md,
  },
  canvas: {
    height: 220,
    borderRadius: tapTarget.radius,
    backgroundColor: color.surfaceMuted,
    padding: space.sm,
  },
  caption: {
    marginTop: space.xs,
  },
});
