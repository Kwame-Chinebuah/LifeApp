import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '../data/theme';
import AdBanner from '../components/AdBanner';

const PRESETS = [
  { label: '5 min',  seconds: 300 },
  { label: '10 min', seconds: 600 },
  { label: '15 min', seconds: 900 },
  { label: '20 min', seconds: 1200 },
  { label: '30 min', seconds: 1800 },
];

function fmt(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

export default function MeditationScreen({ navigation }) {
  const [duration, setDuration] = useState(600);
  const [remaining, setRemaining] = useState(600);
  const [running, setRunning]   = useState(false);
  const [done, setDone]         = useState(false);
  const intervalRef = useRef(null);
  const pulseAnim   = useRef(new Animated.Value(1)).current;
  const pulseLoop   = useRef(null);

  useEffect(() => { setRemaining(duration); setDone(false); }, [duration]);

  useEffect(() => {
    if (running) {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.12, duration: 3000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 3000, useNativeDriver: true }),
        ])
      );
      pulseLoop.current.start();
    } else {
      pulseLoop.current?.stop();
      Animated.timing(pulseAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }
  }, [running]);

  function start() {
    if (done) { setRemaining(duration); setDone(false); return; }
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          setDone(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function pause() {
    clearInterval(intervalRef.current);
    setRunning(false);
  }

  function reset() {
    clearInterval(intervalRef.current);
    setRunning(false);
    setDone(false);
    setRemaining(duration);
  }

  const pct = 1 - remaining / duration;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Meditation</Text>
      </View>
      <AdBanner />

      <View style={styles.content}>
        {/* Duration presets */}
        {!running && !done && (
          <View style={styles.presets}>
            {PRESETS.map(p => (
              <TouchableOpacity key={p.seconds}
                style={[styles.preset, duration===p.seconds && styles.presetActive]}
                onPress={() => setDuration(p.seconds)}>
                <Text style={[styles.presetText, duration===p.seconds && styles.presetTextActive]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Pulsing circle */}
        <Animated.View style={[styles.circle, { transform: [{ scale: pulseAnim }] }]}>
          <View style={[styles.circleInner, { borderColor: done ? COLORS.success : COLORS.accent }]}>
            {done ? (
              <>
                <Text style={styles.doneIcon}>🧘</Text>
                <Text style={styles.doneText}>Complete</Text>
              </>
            ) : (
              <>
                <Text style={styles.timer}>{fmt(remaining)}</Text>
                <Text style={styles.timerSub}>{running ? 'Focus...' : 'Ready'}</Text>
              </>
            )}
          </View>
        </Animated.View>

        {/* Controls */}
        <View style={styles.controls}>
          {!running ? (
            <TouchableOpacity style={styles.mainBtn} onPress={start}>
              <Text style={styles.mainBtnText}>{done ? '🔄 Again' : remaining < duration ? '▶ Resume' : '▶ Begin'}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.mainBtn, styles.pauseBtn]} onPress={pause}>
              <Text style={styles.mainBtnText}>⏸ Pause</Text>
            </TouchableOpacity>
          )}
          {(running || remaining < duration) && (
            <TouchableOpacity style={styles.resetBtn} onPress={reset}>
              <Text style={styles.resetBtnText}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.tip}>
          {running ? '🌿 Breathe deeply. Let thoughts pass.' : '🧘 Choose duration and begin your session'}
        </Text>
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
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, gap: 32 },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  preset: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 0.5, borderColor: COLORS.border },
  presetActive: { backgroundColor: COLORS.accentLight, borderColor: COLORS.accent },
  presetText: { fontSize: 14, color: COLORS.textSecondary },
  presetTextActive: { color: COLORS.accentText, fontWeight: '500' },
  circle: { alignItems: 'center', justifyContent: 'center' },
  circleInner: { width: 220, height: 220, borderRadius: 110, borderWidth: 4, backgroundColor: COLORS.bgSecondary, alignItems: 'center', justifyContent: 'center', gap: 8 },
  timer: { fontSize: 48, fontWeight: '200', color: COLORS.textPrimary, fontVariant: ['tabular-nums'] },
  timerSub: { fontSize: 14, color: COLORS.textTertiary },
  doneIcon: { fontSize: 48 },
  doneText: { fontSize: 18, fontWeight: '500', color: COLORS.success },
  controls: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  mainBtn: { paddingHorizontal: 32, paddingVertical: 16, borderRadius: RADIUS.xl, backgroundColor: COLORS.accent },
  pauseBtn: { backgroundColor: COLORS.bgTertiary },
  mainBtnText: { fontSize: 18, fontWeight: '600', color: '#fff' },
  resetBtn: { paddingHorizontal: 20, paddingVertical: 16, borderRadius: RADIUS.xl, borderWidth: 0.5, borderColor: COLORS.border },
  resetBtnText: { fontSize: 15, color: COLORS.textSecondary },
  tip: { fontSize: 13, color: COLORS.textTertiary, textAlign: 'center', paddingHorizontal: 20 },
});
