import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, RADIUS } from '../data/theme';
import { useTheme } from '../data/ThemeContext';
import AdBanner from '../components/AdBanner';

const KEY = 'period_tracker';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS_IN_MONTH = (y, m) => new Date(y, m + 1, 0).getDate();
const DAY_NAMES = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth()    === b.getMonth()    &&
         a.getDate()     === b.getDate();
}

function formatDate(d) {
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function PeriodTrackerScreen({ navigation }) {
  const { COLORS: dynCOLORS } = useTheme();
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [periods,   setPeriods]   = useState([]); // array of date strings 'YYYY-MM-DD'
  const [cycleLen,  setCycleLen]  = useState(28);
  const [periodLen, setPeriodLen] = useState(5);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(d => {
      if (d) {
        const saved = JSON.parse(d);
        setPeriods(saved.periods || []);
        setCycleLen(saved.cycleLen || 28);
        setPeriodLen(saved.periodLen || 5);
      }
    }).catch(() => {});
  }, []);

  async function save(p, cl, pl) {
    try { await AsyncStorage.setItem(KEY, JSON.stringify({ periods: p, cycleLen: cl, periodLen: pl })); } catch {}
  }

  function toKey(d) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function toggleDay(d) {
    const key  = toKey(d);
    const next = periods.includes(key) ? periods.filter(p => p !== key) : [...periods, key];
    setPeriods(next);
    save(next, cycleLen, periodLen);
  }

  // Get last period start (most recent marked day)
  function getLastPeriodStart() {
    if (periods.length === 0) return null;
    const sorted = [...periods].sort().reverse();
    return new Date(sorted[0] + 'T00:00:00');
  }

  const lastStart = getLastPeriodStart();

  // Calculate next period and ovulation
  const nextPeriod   = lastStart ? addDays(lastStart, cycleLen) : null;
  const ovulation    = lastStart ? addDays(lastStart, cycleLen - 14) : null;
  const fertileStart = ovulation  ? addDays(ovulation, -5) : null;
  const fertileEnd   = ovulation  ? addDays(ovulation, 1) : null;

  function getDayType(d) {
    const key = toKey(d);
    if (periods.includes(key)) return 'period';
    if (ovulation && sameDay(d, ovulation)) return 'ovulation';
    if (fertileStart && fertileEnd && d >= fertileStart && d <= fertileEnd) return 'fertile';
    if (nextPeriod) {
      for (let i = 0; i < periodLen; i++) {
        if (sameDay(d, addDays(nextPeriod, i))) return 'predicted';
      }
    }
    return null;
  }

  // Build calendar
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = DAYS_IN_MONTH(viewYear, viewMonth);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));

  const daysUntilNext = nextPeriod ? Math.ceil((nextPeriod - today) / (1000*60*60*24)) : null;
  const daysUntilOv   = ovulation  ? Math.ceil((ovulation - today) / (1000*60*60*24)) : null;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: dynCOLORS.bg }]}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Period & Ovulation</Text>
      </View>
      <AdBanner />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Cycle settings */}
        <View style={styles.settingsRow}>
          <View style={styles.settingCard}>
            <Text style={styles.settingLabel}>Cycle Length</Text>
            <View style={styles.stepper}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => { const v = Math.max(21,cycleLen-1); setCycleLen(v); save(periods,v,periodLen); }}>
                <Text style={styles.stepBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.stepValue}>{cycleLen}d</Text>
              <TouchableOpacity style={styles.stepBtn} onPress={() => { const v = Math.min(35,cycleLen+1); setCycleLen(v); save(periods,v,periodLen); }}>
                <Text style={styles.stepBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.settingCard}>
            <Text style={styles.settingLabel}>Period Length</Text>
            <View style={styles.stepper}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => { const v = Math.max(2,periodLen-1); setPeriodLen(v); save(periods,cycleLen,v); }}>
                <Text style={styles.stepBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.stepValue}>{periodLen}d</Text>
              <TouchableOpacity style={styles.stepBtn} onPress={() => { const v = Math.min(10,periodLen+1); setPeriodLen(v); save(periods,cycleLen,v); }}>
                <Text style={styles.stepBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Summary cards */}
        {lastStart && (
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { borderColor: '#E91E8C' }]}>
              <Text style={styles.summaryIcon}>🩸</Text>
              <Text style={styles.summaryLabel}>Next Period</Text>
              <Text style={styles.summaryValue}>
                {daysUntilNext !== null && daysUntilNext <= 0 ? 'Today / Overdue' : `in ${daysUntilNext} days`}
              </Text>
              <Text style={styles.summaryDate}>{formatDate(nextPeriod)}</Text>
            </View>
            <View style={[styles.summaryCard, { borderColor: '#9C27B0' }]}>
              <Text style={styles.summaryIcon}>🌸</Text>
              <Text style={styles.summaryLabel}>Ovulation</Text>
              <Text style={styles.summaryValue}>
                {daysUntilOv !== null && daysUntilOv <= 0 ? 'Passed' : `in ${daysUntilOv} days`}
              </Text>
              <Text style={styles.summaryDate}>{formatDate(ovulation)}</Text>
            </View>
          </View>
        )}

        {/* Calendar */}
        <View style={styles.calendar}>
          <View style={styles.calHeader}>
            <TouchableOpacity style={styles.navBtn} onPress={prevMonth}>
              <Text style={styles.navBtnText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.calTitle}>{MONTHS[viewMonth]} {viewYear}</Text>
            <TouchableOpacity style={styles.navBtn} onPress={nextMonth}>
              <Text style={styles.navBtnText}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dayNames}>
            {DAY_NAMES.map(d => <Text key={d} style={styles.dayName}>{d}</Text>)}
          </View>

          <View style={styles.daysGrid}>
            {cells.map((d, i) => {
              if (!d) return <View key={`e${i}`} style={styles.emptyCell} />;
              const type    = getDayType(d);
              const isToday = sameDay(d, today);
              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.dayCell,
                    type === 'period'    && styles.dayCellPeriod,
                    type === 'ovulation' && styles.dayCellOvulation,
                    type === 'fertile'   && styles.dayCellFertile,
                    type === 'predicted' && styles.dayCellPredicted,
                    isToday && styles.dayCellToday,
                  ]}
                  onPress={() => toggleDay(d)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.dayText,
                    (type === 'period' || type === 'ovulation') && styles.dayTextLight,
                    isToday && !type && styles.dayTextToday,
                  ]}>
                    {d.getDate()}
                  </Text>
                  {type === 'ovulation' && <Text style={styles.dayDot}>🌸</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          {[
            { color: '#E91E8C', label: 'Period (logged)' },
            { color: '#FFB3D9', label: 'Predicted period' },
            { color: '#9C27B0', label: 'Ovulation day' },
            { color: '#E1BEE7', label: 'Fertile window' },
          ].map(l => (
            <View key={l.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: l.color }]} />
              <Text style={styles.legendLabel}>{l.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.disclaimer}>
          ℹ️ Tap any day to log your period. Predictions are based on your average cycle and are for guidance only — not medical advice.
        </Text>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  topbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: COLORS.border, gap: 12 },
  backBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.md, borderWidth: 0.5, borderColor: COLORS.border },
  backText: { fontSize: 13, color: COLORS.textSecondary },
  title: { fontSize: 16, fontWeight: '500', color: COLORS.textPrimary },
  content: { padding: 16, gap: 16 },
  settingsRow: { flexDirection: 'row', gap: 12 },
  settingCard: { flex: 1, backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.lg, padding: 14, borderWidth: 0.5, borderColor: COLORS.border, gap: 8, alignItems: 'center' },
  settingLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: { width: 30, height: 30, borderRadius: 15, borderWidth: 0.5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontSize: 18, color: COLORS.textPrimary },
  stepValue: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, minWidth: 36, textAlign: 'center' },
  summaryRow: { flexDirection: 'row', gap: 12 },
  summaryCard: { flex: 1, padding: 14, borderRadius: RADIUS.lg, borderWidth: 2, backgroundColor: COLORS.bgSecondary, alignItems: 'center', gap: 4 },
  summaryIcon: { fontSize: 24 },
  summaryLabel: { fontSize: 11, color: COLORS.textTertiary },
  summaryValue: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  summaryDate: { fontSize: 11, color: COLORS.textSecondary },
  calendar: { backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.xl, padding: 16, borderWidth: 0.5, borderColor: COLORS.border },
  calHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  navBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 0.5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  navBtnText: { fontSize: 22, color: COLORS.textPrimary },
  calTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  dayNames: { flexDirection: 'row', marginBottom: 6 },
  dayName: { flex: 1, textAlign: 'center', fontSize: 11, color: COLORS.textTertiary, fontWeight: '500' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  emptyCell: { width: `${100/7}%`, aspectRatio: 1 },
  dayCell: { width: `${100/7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 100, padding: 2 },
  dayCellPeriod:    { backgroundColor: '#E91E8C' },
  dayCellOvulation: { backgroundColor: '#9C27B0' },
  dayCellFertile:   { backgroundColor: '#E1BEE7' },
  dayCellPredicted: { backgroundColor: '#FFB3D9' },
  dayCellToday:     { borderWidth: 2, borderColor: COLORS.accent },
  dayText: { fontSize: 13, color: COLORS.textPrimary },
  dayTextLight: { color: '#fff', fontWeight: '600' },
  dayTextToday: { color: COLORS.accent, fontWeight: '700' },
  dayDot: { fontSize: 8, position: 'absolute', bottom: 1 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendLabel: { fontSize: 12, color: COLORS.textSecondary },
  disclaimer: { fontSize: 11, color: COLORS.textTertiary, lineHeight: 17, backgroundColor: COLORS.bgSecondary, padding: 12, borderRadius: RADIUS.md },
});
