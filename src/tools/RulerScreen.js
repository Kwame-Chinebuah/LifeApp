import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, PanResponder, useRef,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '../data/theme';
import { useTheme } from '../data/ThemeContext';
import AdBanner from '../components/AdBanner';

const SCREEN_WIDTH  = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

// Average phone PPI — close enough for most phones
const PPI = 160;
const CM_PER_INCH = 2.54;
const PX_PER_CM = PPI / CM_PER_INCH;
const PX_PER_MM = PX_PER_CM / 10;

export default function RulerScreen({ navigation }) {
  const { COLORS: dynCOLORS } = useTheme();
  const [unit, setUnit]   = useState('cm'); // cm or in
  const [length, setLength] = useState(SCREEN_HEIGHT * 0.6);

  const pxPerUnit = unit === 'cm' ? PX_PER_CM : PPI;
  const totalUnits = length / pxPerUnit;
  const majorTick = unit === 'cm' ? 1 : 1;
  const minorTick = unit === 'cm' ? 0.1 : 0.0625; // 1mm or 1/16"

  function buildTicks() {
    const ticks = [];
    const total = length;
    const minorPx = minorTick * pxPerUnit;
    const majorPx = majorTick * pxPerUnit;
    let pos = 0;
    while (pos <= total) {
      const isMajor = Math.abs(Math.round(pos / majorPx) * majorPx - pos) < 0.5;
      const isMid   = unit === 'cm'
        ? Math.abs(Math.round(pos / (PX_PER_MM * 5)) * (PX_PER_MM * 5) - pos) < 0.5
        : Math.abs(Math.round(pos / (PPI * 0.25)) * (PPI * 0.25) - pos) < 0.5;
      ticks.push({ pos, isMajor, isMid });
      pos += minorPx;
    }
    return ticks;
  }

  const ticks = buildTicks();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: dynCOLORS.bg }]}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Ruler</Text>
        <View style={styles.unitToggle}>
          {['cm', 'in'].map(u => (
            <TouchableOpacity key={u} style={[styles.unitBtn, unit === u && styles.unitBtnActive]}
              onPress={() => setUnit(u)}>
              <Text style={[styles.unitBtnText, unit === u && styles.unitBtnTextActive]}>{u}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.notice}>
        <Text style={styles.noticeText}>⚠️ Accuracy varies by device — for reference only</Text>
      </View>

      <View style={styles.rulerWrap}>
        {/* Ruler body */}
        <View style={[styles.ruler, { height: length }]}>
          {/* Left edge */}
          <View style={styles.rulerEdge} />

          {/* Ticks */}
          {ticks.map((tick, i) => (
            <View key={i} style={[
              styles.tick,
              { top: tick.pos },
              tick.isMajor ? styles.tickMajor : tick.isMid ? styles.tickMid : styles.tickMinor,
            ]}>
              {tick.isMajor && tick.pos > 0 && (
                <Text style={styles.tickLabel}>
                  {unit === 'cm'
                    ? (tick.pos / PX_PER_CM).toFixed(0)
                    : (tick.pos / PPI).toFixed(0)}
                </Text>
              )}
            </View>
          ))}

          {/* End cap */}
          <View style={[styles.tick, styles.tickMajor, { top: length - 1 }]} />
        </View>

        {/* Measurement display */}
        <View style={styles.measureBox}>
          <Text style={styles.measureValue}>{totalUnits.toFixed(1)}</Text>
          <Text style={styles.measureUnit}>{unit}</Text>
        </View>
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
  title: { flex: 1, fontSize: 16, fontWeight: '500', color: COLORS.textPrimary },
  unitToggle: { flexDirection: 'row', borderWidth: 0.5, borderColor: COLORS.border, borderRadius: RADIUS.md, overflow: 'hidden' },
  unitBtn: { paddingHorizontal: 12, paddingVertical: 5, backgroundColor: COLORS.bg },
  unitBtnActive: { backgroundColor: COLORS.accent },
  unitBtnText: { fontSize: 13, color: COLORS.textSecondary },
  unitBtnTextActive: { color: '#fff', fontWeight: '500' },
  notice: { padding: 8, backgroundColor: '#FFF8E7', alignItems: 'center', borderBottomWidth: 0.5, borderBottomColor: '#FFE09A' },
  noticeText: { fontSize: 11, color: '#7A5C00' },
  rulerWrap: {
    flex: 1, flexDirection: 'row', padding: 20, gap: 16, alignItems: 'flex-start',
  },
  ruler: {
    width: 80,
    backgroundColor: '#FFFDE7',
    borderWidth: 1,
    borderColor: '#D4A017',
    borderRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  rulerEdge: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
    backgroundColor: '#D4A017',
  },
  tick: {
    position: 'absolute', left: 4, flexDirection: 'row', alignItems: 'center',
  },
  tickMajor: { width: 44, height: 1, backgroundColor: '#5D4037' },
  tickMid:   { width: 28, height: 1, backgroundColor: '#8D6E63' },
  tickMinor: { width: 16, height: 1, backgroundColor: '#BCAAA4' },
  tickLabel: {
    position: 'absolute', left: 46,
    fontSize: 11, color: '#3E2723', fontWeight: '500',
  },
  measureBox: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.xl,
    padding: 20, gap: 4,
  },
  measureValue: { fontSize: 48, fontWeight: '300', color: COLORS.textPrimary },
  measureUnit: { fontSize: 18, color: COLORS.textSecondary },
});
