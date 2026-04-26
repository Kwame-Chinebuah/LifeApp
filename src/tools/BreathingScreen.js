import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '../data/theme';
import { useTheme } from '../data/ThemeContext';
import AdBanner from '../components/AdBanner';

const PATTERNS = [
  { label: '4-4',     name: 'Box Lite',    inhale: 4, hold1: 0, exhale: 4, hold2: 0 },
  { label: '4-7-8',   name: 'Calm',        inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
  { label: '4-4-4-4', name: 'Box',         inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
  { label: '5-5',     name: 'Coherent',    inhale: 5, hold1: 0, exhale: 5, hold2: 0 },
];

const PHASES = (p) => {
  const arr = [{ label: 'Inhale', dur: p.inhale, color: '#378ADD' }];
  if (p.hold1) arr.push({ label: 'Hold', dur: p.hold1, color: '#8B5CF6' });
  arr.push({ label: 'Exhale', dur: p.exhale, color: '#1D9E75' });
  if (p.hold2) arr.push({ label: 'Hold', dur: p.hold2, color: '#8B5CF6' });
  return arr;
};

export default function BreathingScreen({ navigation }) {
  const { COLORS: dynCOLORS } = useTheme();
  const [pattern, setPattern]   = useState(PATTERNS[0]);
  const [running, setRunning]   = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [count, setCount]       = useState(0);
  const [cycles, setCycles]     = useState(0);
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const animRef   = useRef(null);
  const timer     = useRef(null);

  const phases = PHASES(pattern);
  const phase  = phases[phaseIdx % phases.length];

  useEffect(() => { if (!running) return; runPhase(phaseIdx, 0); }, [running, phaseIdx]);

  function runPhase(pIdx, tick) {
    clearTimeout(timer.current);
    const ph = phases[pIdx % phases.length];
    if (tick === 0) {
      // Animate circle
      const toScale = ph.label === 'Inhale' ? 1 : ph.label === 'Exhale' ? 0.6 : undefined;
      if (toScale !== undefined) {
        animRef.current = Animated.timing(scaleAnim, { toValue: toScale, duration: ph.dur * 1000, useNativeDriver: true });
        animRef.current.start();
      }
    }
    setCount(ph.dur - tick);
    if (tick < ph.dur) {
      timer.current = setTimeout(() => runPhase(pIdx, tick + 1), 1000);
    } else {
      const next = pIdx + 1;
      if (next % phases.length === 0) setCycles(c => c + 1);
      setPhaseIdx(next);
    }
  }

  function start() { setRunning(true); setPhaseIdx(0); setCycles(0); setCount(phases[0].dur); }

  function stop() {
    clearTimeout(timer.current);
    animRef.current?.stop();
    setRunning(false);
    setPhaseIdx(0);
    setCycles(0);
    Animated.timing(scaleAnim, { toValue: 0.6, duration: 500, useNativeDriver: true }).start();
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: dynCOLORS.bg }]}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Breathing Timer</Text>
      </View>
      <AdBanner />

      <View style={styles.content}>
        {/* Pattern selector */}
        {!running && (
          <View style={styles.patterns}>
            {PATTERNS.map(p => (
              <TouchableOpacity key={p.label}
                style={[styles.patternBtn, pattern.label===p.label && styles.patternBtnActive]}
                onPress={() => setPattern(p)}>
                <Text style={[styles.patternName, pattern.label===p.label && styles.patternNameActive]}>{p.name}</Text>
                <Text style={[styles.patternLabel, pattern.label===p.label && styles.patternLabelActive]}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Breathing circle */}
        <View style={styles.circleWrap}>
          <Animated.View style={[styles.outerCircle, { transform: [{ scale: scaleAnim }], borderColor: running ? phase.color : COLORS.border }]}>
            <View style={styles.innerCircle}>
              {running ? (
                <>
                  <Text style={[styles.phaseText, { color: phase.color }]}>{phase.label}</Text>
                  <Text style={styles.countText}>{count}</Text>
                </>
              ) : (
                <Text style={styles.readyText}>Ready</Text>
              )}
            </View>
          </Animated.View>
        </View>

        {running && (
          <Text style={styles.cyclesText}>{cycles} cycles completed</Text>
        )}

        {/* Phase indicators */}
        {running && (
          <View style={styles.phaseRow}>
            {phases.map((p, i) => (
              <View key={i} style={[styles.phaseIndicator, { backgroundColor: (phaseIdx % phases.length) === i ? p.color : COLORS.bgTertiary }]} />
            ))}
          </View>
        )}

        <TouchableOpacity style={[styles.mainBtn, running && styles.stopBtn]} onPress={running ? stop : start}>
          <Text style={styles.mainBtnText}>{running ? '■ Stop' : '▶ Begin'}</Text>
        </TouchableOpacity>

        {!running && (
          <Text style={styles.hint}>Pattern: {phases.map(p => `${p.label} ${p.dur}s`).join(' → ')}</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  topbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: COLORS.border, gap: 12 },
  backBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.md, borderWidth: 0.5, borderColor: COLORS.border },
  backText: { fontSize: 13, color: COLORS.textSecondary },
  title: { fontSize: 16, fontWeight: '500', color: COLORS.textPrimary },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, gap: 24 },
  patterns: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  patternBtn: { padding: 12, borderRadius: RADIUS.lg, borderWidth: 0.5, borderColor: COLORS.border, alignItems: 'center', minWidth: 80 },
  patternBtnActive: { backgroundColor: COLORS.accentLight, borderColor: COLORS.accent },
  patternName: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary },
  patternNameActive: { color: COLORS.accentText },
  patternLabel: { fontSize: 11, color: COLORS.textTertiary },
  patternLabelActive: { color: COLORS.accent },
  circleWrap: { alignItems: 'center', justifyContent: 'center', width: 240, height: 240 },
  outerCircle: { width: 240, height: 240, borderRadius: 120, borderWidth: 4, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bgSecondary },
  innerCircle: { alignItems: 'center', gap: 6 },
  phaseText: { fontSize: 20, fontWeight: '600' },
  countText: { fontSize: 48, fontWeight: '200', color: COLORS.textPrimary },
  readyText: { fontSize: 24, color: COLORS.textTertiary },
  cyclesText: { fontSize: 14, color: COLORS.textSecondary },
  phaseRow: { flexDirection: 'row', gap: 8 },
  phaseIndicator: { width: 32, height: 6, borderRadius: 3 },
  mainBtn: { paddingHorizontal: 40, paddingVertical: 16, borderRadius: RADIUS.xl, backgroundColor: COLORS.accent },
  stopBtn: { backgroundColor: COLORS.danger },
  mainBtnText: { fontSize: 18, fontWeight: '600', color: '#fff' },
  hint: { fontSize: 12, color: COLORS.textTertiary, textAlign: 'center' },
});
