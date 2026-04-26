import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '../data/theme';
import { useTheme } from '../data/ThemeContext';
import AdBanner from '../components/AdBanner';

function pad(n) { return String(n).padStart(2, '0'); }

function formatTime(ms) {
  const h  = Math.floor(ms / 3600000);
  const m  = Math.floor((ms % 3600000) / 60000);
  const s  = Math.floor((ms % 60000) / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}.${pad(cs)}`;
}

export default function StopwatchScreen({ navigation }) {
  const { COLORS: dynCOLORS } = useTheme();
  const [mode, setMode]       = useState('stopwatch'); // 'stopwatch' | 'timer'
  const [ms, setMs]           = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps]       = useState([]);

  // Timer setup
  const [timerH, setTimerH] = useState('0');
  const [timerM, setTimerM] = useState('5');
  const [timerS, setTimerS] = useState('0');
  const [timerTotal, setTimerTotal] = useState(0);
  const [timerSet, setTimerSet]     = useState(false);

  const intervalRef = useRef(null);
  const startRef    = useRef(0);
  const baseRef     = useRef(0);

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  function startStop() {
    if (running) {
      clearInterval(intervalRef.current);
      setRunning(false);
    } else {
      if (mode === 'timer' && !timerSet) {
        const total = (parseInt(timerH)||0)*3600000 + (parseInt(timerM)||0)*60000 + (parseInt(timerS)||0)*1000;
        if (total === 0) return;
        setTimerTotal(total);
        setMs(total);
        setTimerSet(true);
        baseRef.current = total;
        startRef.current = Date.now();
        intervalRef.current = setInterval(() => {
          const elapsed = Date.now() - startRef.current;
          const remaining = baseRef.current - elapsed;
          if (remaining <= 0) {
            clearInterval(intervalRef.current);
            setMs(0); setRunning(false); setTimerSet(false);
          } else { setMs(remaining); }
        }, 50);
      } else if (mode === 'timer' && timerSet) {
        startRef.current = Date.now();
        intervalRef.current = setInterval(() => {
          const elapsed = Date.now() - startRef.current;
          const remaining = baseRef.current - elapsed;
          if (remaining <= 0) {
            clearInterval(intervalRef.current);
            setMs(0); setRunning(false); setTimerSet(false);
          } else { setMs(remaining); }
        }, 50);
      } else {
        startRef.current = Date.now() - baseRef.current;
        intervalRef.current = setInterval(() => {
          setMs(Date.now() - startRef.current);
        }, 50);
      }
      setRunning(true);
    }
  }

  function reset() {
    clearInterval(intervalRef.current);
    setRunning(false);
    setMs(0);
    setLaps([]);
    baseRef.current = 0;
    setTimerSet(false);
  }

  function lap() {
    if (!running || mode !== 'stopwatch') return;
    setLaps(prev => [{ time: ms, label: `Lap ${prev.length + 1}` }, ...prev]);
    baseRef.current = ms;
    startRef.current = Date.now() - ms;
  }

  function switchMode(m) {
    reset();
    setMode(m);
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: dynCOLORS.bg }]}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Stopwatch</Text>
      </View>

      {/* Mode toggle */}
      <View style={styles.modeRow}>
        <TouchableOpacity style={[styles.modeBtn, mode === 'stopwatch' && styles.modeBtnActive]}
          onPress={() => switchMode('stopwatch')}>
          <Text style={[styles.modeBtnText, mode === 'stopwatch' && styles.modeBtnTextActive]}>⏱ Stopwatch</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.modeBtn, mode === 'timer' && styles.modeBtnActive]}
          onPress={() => switchMode('timer')}>
          <Text style={[styles.modeBtnText, mode === 'timer' && styles.modeBtnTextActive]}>⏳ Timer</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Clock display */}
        <View style={styles.clockBox}>
          <Text style={styles.clockText}>{formatTime(ms)}</Text>
          {mode === 'timer' && timerSet && (
            <Text style={styles.timerSub}>
              {Math.round(ms / 1000)}s remaining
            </Text>
          )}
        </View>

        {/* Timer setup */}
        {mode === 'timer' && !timerSet && (
          <View style={styles.timerSetup}>
            <Text style={styles.timerSetupLabel}>Set Duration</Text>
            <View style={styles.timerInputRow}>
              <View style={styles.timerInputCol}>
                <TextInput style={styles.timerInput} value={timerH} onChangeText={setTimerH} keyboardType="numeric" maxLength={2} />
                <Text style={styles.timerInputLabel}>h</Text>
              </View>
              <Text style={styles.timerColon}>:</Text>
              <View style={styles.timerInputCol}>
                <TextInput style={styles.timerInput} value={timerM} onChangeText={setTimerM} keyboardType="numeric" maxLength={2} />
                <Text style={styles.timerInputLabel}>m</Text>
              </View>
              <Text style={styles.timerColon}>:</Text>
              <View style={styles.timerInputCol}>
                <TextInput style={styles.timerInput} value={timerS} onChangeText={setTimerS} keyboardType="numeric" maxLength={2} />
                <Text style={styles.timerInputLabel}>s</Text>
              </View>
            </View>
          </View>
        )}

        {/* Controls */}
        <View style={styles.controls}>
          {mode === 'stopwatch' && (
            <TouchableOpacity style={[styles.ctrlBtn, styles.ctrlBtnGray]} onPress={lap} disabled={!running}>
              <Text style={styles.ctrlBtnText}>Lap</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.ctrlBtn, running ? styles.ctrlBtnRed : styles.ctrlBtnGreen]} onPress={startStop}>
            <Text style={[styles.ctrlBtnText, { color: '#fff' }]}>{running ? 'Stop' : 'Start'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.ctrlBtn, styles.ctrlBtnGray]} onPress={reset}>
            <Text style={styles.ctrlBtnText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Laps */}
        {mode === 'stopwatch' && laps.length > 0 && (
          <ScrollView style={styles.lapList} showsVerticalScrollIndicator={false}>
            {laps.map((lap, i) => (
              <View key={i} style={styles.lapItem}>
                <Text style={styles.lapLabel}>{lap.label}</Text>
                <Text style={styles.lapTime}>{formatTime(lap.time)}</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  topbar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 0.5, borderBottomColor: COLORS.border, gap: 12,
  },
  backBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.md, borderWidth: 0.5, borderColor: COLORS.border },
  backText: { fontSize: 13, color: COLORS.textSecondary },
  title: { fontSize: 16, fontWeight: '500', color: COLORS.textPrimary },
  modeRow: {
    flexDirection: 'row', padding: 12, gap: 8,
    borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  modeBtn: {
    flex: 1, paddingVertical: 8, borderRadius: RADIUS.md,
    borderWidth: 0.5, borderColor: COLORS.border,
    alignItems: 'center', backgroundColor: COLORS.bg,
  },
  modeBtnActive: { backgroundColor: COLORS.accentLight, borderColor: COLORS.accent },
  modeBtnText: { fontSize: 14, color: COLORS.textSecondary },
  modeBtnTextActive: { color: COLORS.accentText, fontWeight: '500' },
  content: { flex: 1, padding: 20, gap: 20 },
  clockBox: {
    alignItems: 'center', paddingVertical: 32,
    backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.xl,
  },
  clockText: { fontSize: 56, fontWeight: '200', color: COLORS.textPrimary, fontVariant: ['tabular-nums'] },
  timerSub: { fontSize: 14, color: COLORS.textTertiary, marginTop: 6 },
  timerSetup: { gap: 10 },
  timerSetupLabel: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary, textAlign: 'center' },
  timerInputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  timerInputCol: { alignItems: 'center', gap: 4 },
  timerInput: {
    width: 64, height: 56, borderRadius: RADIUS.md,
    borderWidth: 0.5, borderColor: COLORS.border,
    textAlign: 'center', fontSize: 28, fontWeight: '300',
    color: COLORS.textPrimary, backgroundColor: COLORS.bgSecondary,
  },
  timerInputLabel: { fontSize: 11, color: COLORS.textTertiary },
  timerColon: { fontSize: 32, color: COLORS.textTertiary, marginBottom: 16 },
  controls: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  ctrlBtn: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
  },
  ctrlBtnGreen: { backgroundColor: COLORS.success },
  ctrlBtnRed: { backgroundColor: COLORS.danger },
  ctrlBtnGray: { backgroundColor: COLORS.bgTertiary, borderWidth: 0.5, borderColor: COLORS.border },
  ctrlBtnText: { fontSize: 16, fontWeight: '500', color: COLORS.textPrimary },
  lapList: { flex: 1 },
  lapItem: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  lapLabel: { fontSize: 14, color: COLORS.textSecondary },
  lapTime: { fontSize: 14, fontWeight: '500', color: COLORS.textPrimary, fontVariant: ['tabular-nums'] },
});
