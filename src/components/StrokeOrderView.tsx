import React, { useState, useEffect, useRef } from 'react';
import {
  View, StyleSheet, ActivityIndicator, TouchableOpacity, Text, Animated,
} from 'react-native';
import Svg, { Path, Circle, Text as SvgText, G } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

const VIEWBOX = 109;

function kanjiHex(char: string): string {
  return char.codePointAt(0)!.toString(16).padStart(5, '0');
}

interface Stroke {
  d: string;
  startX: number;
  startY: number;
}

function parseStrokes(svgText: string): Stroke[] {
  const result: { index: number; d: string }[] = [];

  // KanjiVG paths can have id= before or after d=
  const re1 = /<path[^>]*id="[^"]*-s(\d+)"[^>]*d="([^"]+)"/g;
  const re2 = /<path[^>]*d="([^"]+)"[^>]*id="[^"]*-s(\d+)"/g;

  let m: RegExpExecArray | null;
  while ((m = re1.exec(svgText))) {
    result.push({ index: parseInt(m[1]), d: m[2] });
  }
  while ((m = re2.exec(svgText))) {
    const idx = parseInt(m[2]);
    if (!result.find(s => s.index === idx)) {
      result.push({ index: idx, d: m[1] });
    }
  }

  return result
    .sort((a, b) => a.index - b.index)
    .map(({ d }) => {
      const mv = d.match(/M\s*([\d.]+)[,\s]+([\d.]+)/);
      return {
        d,
        startX: mv ? parseFloat(mv[1]) : 0,
        startY: mv ? parseFloat(mv[2]) : 0,
      };
    });
}

interface Props {
  char: string;
  size?: number;
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function StrokeOrderView({ char, size = 210 }: Props) {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);

  const anims = useRef<Animated.Value[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const hex = kanjiHex(char);
  const svgUrl = `https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg@master/kanji/${hex}.svg`;

  useEffect(() => {
    setLoading(true);
    setFetchError(false);
    setStrokes([]);
    setVisibleCount(0);

    fetch(svgUrl)
      .then(r => { if (!r.ok) throw new Error('not found'); return r.text(); })
      .then(text => {
        const parsed = parseStrokes(text);
        anims.current = parsed.map(() => new Animated.Value(0));
        setStrokes(parsed);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setFetchError(true);
      });

    return () => clearTimeout(timer.current);
  }, [char]);

  const runAnimation = (startIdx: number) => {
    if (startIdx >= strokes.length) return;
    setVisibleCount(startIdx + 1);
    Animated.timing(anims.current[startIdx], {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start(() => {
      timer.current = setTimeout(() => runAnimation(startIdx + 1), 420);
    });
  };

  const replay = () => {
    clearTimeout(timer.current);
    anims.current.forEach(a => a.setValue(0));
    setVisibleCount(0);
    runAnimation(0);
  };

  useEffect(() => {
    if (strokes.length > 0) {
      runAnimation(0);
    }
    return () => clearTimeout(timer.current);
  }, [strokes]);

  const scale = size / VIEWBOX;

  return (
    <View style={styles.wrap}>
      <View style={[styles.svgBox, { width: size, height: size }]}>
        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        )}
        {fetchError && (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{char}</Text>
            <Text style={styles.errorSub}>stroke data unavailable</Text>
          </View>
        )}
        {!loading && !fetchError && strokes.length > 0 && (
          <Svg width={size} height={size} viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}>
            {strokes.map((stroke, i) => {
              const visible = i < visibleCount;
              const isLatest = i === visibleCount - 1;
              const isPast = i < visibleCount - 1;

              if (!visible) {
                // ghost stroke
                return (
                  <Path
                    key={i}
                    d={stroke.d}
                    stroke={Colors.border}
                    strokeWidth={3}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.4}
                  />
                );
              }

              return (
                <G key={i}>
                  <AnimatedPath
                    d={stroke.d}
                    stroke={isPast ? Colors.primary : Colors.text}
                    strokeWidth={isPast ? 3.5 : 4}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={anims.current[i]}
                  />
                  {/* Stroke number dot */}
                  <Circle
                    cx={stroke.startX}
                    cy={stroke.startY}
                    r={5.5}
                    fill={Colors.accent}
                    opacity={isPast ? 0.55 : 1}
                  />
                  <SvgText
                    x={stroke.startX}
                    y={stroke.startY + 4}
                    fontSize={7}
                    fontWeight="bold"
                    fill="#fff"
                    textAnchor="middle"
                  >
                    {i + 1}
                  </SvgText>
                </G>
              );
            })}
          </Svg>
        )}
      </View>

      {!loading && !fetchError && (
        <TouchableOpacity style={styles.replayBtn} onPress={replay} activeOpacity={0.7}>
          <Ionicons name="refresh" size={13} color={Colors.textSecondary} />
          <Text style={styles.replayText}>Replay</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  svgBox: {
    borderRadius: 16,
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  centered: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 48,
    fontFamily: 'NotoSansJP_900Black',
    color: Colors.text,
  },
  errorSub: {
    fontSize: 11,
    fontFamily: 'NotoSansJP_500Medium',
    color: Colors.textLight,
    marginTop: 4,
  },
  replayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  replayText: {
    fontSize: 12,
    fontFamily: 'NotoSansJP_500Medium',
    color: Colors.textSecondary,
  },
});
