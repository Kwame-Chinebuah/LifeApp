import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '../data/theme';
import { useTheme } from '../data/ThemeContext';
import AdBanner from '../components/AdBanner';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const ITEM_HEIGHT = 44;

function PickerColumn({ items, selected, onSelect }) {
  const scrollRef = useRef(null);
  const selectedIndex = items.indexOf(selected);

  function onScrollEnd(e) {
    const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(index, items.length - 1));
    onSelect(items[clamped]);
  }

  return (
    <View style={styles.pickerCol}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={onScrollEnd}
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
        contentOffset={{ x: 0, y: selectedIndex * ITEM_HEIGHT }}
      >
        {items.map((item, i) => {
          const isSelected = item === selected;
          return (
            <TouchableOpacity
              key={i}
              style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}
              onPress={() => {
                onSelect(item);
                scrollRef.current?.scrollTo({ y: i * ITEM_HEIGHT, animated: true });
              }}
            >
              <Text style={[styles.pickerItemText, isSelected && styles.pickerItemTextSelected]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {/* Selection highlight overlay */}
      <View pointerEvents="none" style={styles.pickerHighlight} />
    </View>
  );
}

export default function AgeCalculatorScreen({ navigation }) {
  const { COLORS: dynCOLORS } = useTheme();
  const now = new Date();
  const [selDay,   setSelDay]   = useState(1);
  const [selMonth, setSelMonth] = useState(1);
  const [selYear,  setSelYear]  = useState(1990);
  const [dob, setDob]           = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  const maxYear = now.getFullYear();

  function daysInMonth(m, y) {
    return new Date(y, m, 0).getDate();
  }

  const days   = Array.from({ length: daysInMonth(selMonth, selYear) }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years  = Array.from({ length: 100 }, (_, i) => maxYear - i);

  function confirmDate() {
    setDob(new Date(selYear, selMonth - 1, selDay));
    setShowPicker(false);
  }

  function calcAge() {
    if (!dob) return null;
    let y = now.getFullYear() - dob.getFullYear();
    let m = now.getMonth() - dob.getMonth();
    let d = now.getDate() - dob.getDate();
    if (d < 0) { m--; d += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
    if (m < 0) { y--; m += 12; }
    const totalDays  = Math.floor((now - dob) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const nextBday   = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
    if (nextBday <= now) nextBday.setFullYear(now.getFullYear() + 1);
    const daysToNext = Math.ceil((nextBday - now) / (1000 * 60 * 60 * 24));
    return { y, m, d, totalDays, totalWeeks, daysToNext };
  }

  const age = calcAge();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: dynCOLORS.bg }]}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Age Calculator</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.dobBtn} onPress={() => setShowPicker(true)}>
          <View style={styles.dobBtnLeft}>
            <Text style={styles.dobLabel}>Date of Birth</Text>
            <Text style={styles.dobValue}>
              {dob
                ? `${selDay} ${MONTHS[selMonth - 1]} ${selYear}`
                : 'Tap to select your date of birth'}
            </Text>
          </View>
          <Text style={styles.dobArrow}>▼</Text>
        </TouchableOpacity>

        {age && (
          <View style={styles.results}>
            <View style={styles.mainAge}>
              <Text style={styles.mainAgeNum}>{age.y}</Text>
              <Text style={styles.mainAgeLabel}>years old</Text>
              <Text style={styles.mainAgeSub}>{age.m} months and {age.d} days</Text>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{age.totalDays.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Total days</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{age.totalWeeks.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Total weeks</Text>
              </View>
              <View style={[styles.statCard, { borderColor: COLORS.pro, borderWidth: 1.5 }]}>
                <Text style={[styles.statValue, { color: '#B8960C' }]}>{age.daysToNext}</Text>
                <Text style={styles.statLabel}>Days to birthday 🎂</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Date Picker Modal */}
      <Modal visible={showPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date of Birth</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pickerLabels}>
              <Text style={styles.pickerLabel}>Day</Text>
              <Text style={styles.pickerLabel}>Month</Text>
              <Text style={styles.pickerLabel}>Year</Text>
            </View>

            <View style={styles.pickerRow}>
              <PickerColumn
                items={days}
                selected={selDay}
                onSelect={setSelDay}
              />
              <PickerColumn
                items={months}
                selected={selMonth}
                onSelect={v => {
                  setSelMonth(v);
                  const maxDay = daysInMonth(v, selYear);
                  if (selDay > maxDay) setSelDay(maxDay);
                }}
              />
              <PickerColumn
                items={years}
                selected={selYear}
                onSelect={setSelYear}
              />
            </View>

            <TouchableOpacity style={styles.confirmBtn} onPress={confirmDate}>
              <Text style={styles.confirmBtnText}>Confirm Date</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  content: { padding: 20, gap: 20 },
  dobBtn: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, borderRadius: RADIUS.lg,
    borderWidth: 0.5, borderColor: COLORS.border,
    backgroundColor: COLORS.bgSecondary,
  },
  dobBtnLeft: { flex: 1 },
  dobLabel: { fontSize: 11, color: COLORS.textTertiary, marginBottom: 4 },
  dobValue: { fontSize: 16, fontWeight: '500', color: COLORS.textPrimary },
  dobArrow: { fontSize: 12, color: COLORS.textTertiary },
  results: { gap: 16 },
  mainAge: {
    backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.lg,
    padding: 24, alignItems: 'center',
  },
  mainAgeNum: { fontSize: 72, fontWeight: '200', color: COLORS.textPrimary, lineHeight: 80 },
  mainAgeLabel: { fontSize: 18, color: COLORS.textSecondary, marginBottom: 4 },
  mainAgeSub: { fontSize: 14, color: COLORS.textTertiary },
  statsGrid: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, padding: 14, borderRadius: RADIUS.lg,
    borderWidth: 0.5, borderColor: COLORS.border,
    backgroundColor: COLORS.bgSecondary, alignItems: 'center',
  },
  statValue: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary },
  statLabel: { fontSize: 10, color: COLORS.textTertiary, marginTop: 3, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 17, fontWeight: '600', color: COLORS.textPrimary },
  modalClose: { fontSize: 18, color: COLORS.textTertiary, padding: 4 },
  pickerLabels: { flexDirection: 'row', marginBottom: 4 },
  pickerLabel: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '600', color: COLORS.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 },
  pickerRow: {
    flexDirection: 'row', height: 220,
    borderWidth: 0.5, borderColor: COLORS.border,
    borderRadius: RADIUS.lg, overflow: 'hidden',
  },
  pickerCol: {
    flex: 1, borderRightWidth: 0.5, borderRightColor: COLORS.border,
    position: 'relative', overflow: 'hidden',
  },
  pickerItem: {
    height: ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center',
  },
  pickerItemSelected: { backgroundColor: COLORS.accentLight },
  pickerItemText: { fontSize: 16, color: COLORS.textSecondary },
  pickerItemTextSelected: { fontSize: 18, fontWeight: '600', color: COLORS.accentText },
  pickerHighlight: {
    position: 'absolute', top: '50%', left: 0, right: 0,
    height: ITEM_HEIGHT, marginTop: -ITEM_HEIGHT / 2,
    borderTopWidth: 1, borderBottomWidth: 1,
    borderColor: COLORS.accent,
    pointerEvents: 'none',
  },
  confirmBtn: {
    marginTop: 16, backgroundColor: COLORS.accent,
    borderRadius: RADIUS.lg, padding: 16, alignItems: 'center',
  },
  confirmBtnText: { fontSize: 16, color: '#fff', fontWeight: '600' },
});
