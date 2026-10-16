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

const TORSO_LENGTH = 54;
const CYCLE_MS = 4200; // slow: the movement itself should be unhurried

type Variant = "seated" | "standing";

/** Seated and standing hinges differ in setup, so the figure does too. */
const GEOMETRY = {
  seated: { hip: { x: 112, y: 104 }, maxFold: 48 },
  standing: { hip: { x: 112, y: 86 }, maxFold: 55 },
} as const;

interface Props {
  variant?: Variant;
}

export function HipHingeAnimation({ variant = "seated" }: Props) {
  const { hip: HIP, maxFold: MAX_FOLD_DEGREES } = GEOMETRY[variant];
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

  const shoulder = { x: HIP.x, y: HIP.y - TORSO_LENGTH };

  return (
    <View style={styles.wrap}>
      <View style={styles.canvas}>
        <Svg
          viewBox="0 0 240 190"
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
              <Line x1={HIP.x} y1={HIP.y} x2={168} y2={104} stroke={color.primary} strokeWidth={9} strokeLinecap="round" />
              <Line x1={168} y1={104} x2={168} y2={166} stroke={color.primary} strokeWidth={9} strokeLinecap="round" />
              <Line x1={168} y1={168} x2={192} y2={168} stroke={color.primary} strokeWidth={9} strokeLinecap="round" />
            </>
          ) : (
            <>
              {/* soft knee bend, as the cues describe */}
              <Line x1={HIP.x} y1={HIP.y} x2={118} y2={132} stroke={color.primary} strokeWidth={9} strokeLinecap="round" />
              <Line x1={118} y1={132} x2={112} y2={168} stroke={color.primary} strokeWidth={9} strokeLinecap="round" />
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
            <Circle cx={shoulder.x} cy={shoulder.y - 15} r={13} fill={color.primary} />
            {/* arm reaching down the thigh */}
            <Path
              d={`M ${shoulder.x} ${shoulder.y + 6} Q ${shoulder.x + 20} ${shoulder.y + 30} ${shoulder.x + (variant === "seated" ? 30 : 14)} ${HIP.y - 6}`}
              stroke={color.accent}
              strokeWidth={7}
              strokeLinecap="round"
              fill="none"
            />
          </G>

          {/* hip joint marker: where the movement comes from */}
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
