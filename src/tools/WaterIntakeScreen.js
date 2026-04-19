import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, Modal, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, RADIUS } from '../data/theme';
import AdBanner from '../components/AdBanner';

const SIZES = [
  { label: 'Sip',    ml: 100,  icon: '💧' },
  { label: 'Cup',    ml: 250,  icon: '☕' },
  { label: 'Bottle', ml: 500,  icon: '🍶' },
  { label: 'Large',  ml: 750,  icon: '🧴' },
];

const TODAY_KEY = () => `water_${new Date().toDateString()}`;
const GOAL_KEY  = 'water_goal';
const LOG_KEY   = () => `water_log_${new Date().toDateString()}`;

export default function WaterIntakeScreen({ navigation }) {
  const [intake, setIntake]       = useState(0);
  const [goal, setGoal]           = useState(2000);
  const [log, setLog]             = useState([]);
  const [showGoal, setShowGoal]   = useState(false);
  const [goalInput, setGoalInput] = useState('2000');

  // Load saved data on mount
  useEffect(() => {
    async function load() {
      try {
        const savedGoal   = await AsyncStorage.getItem(GOAL_KEY);
        const savedIntake = await AsyncStorage.getItem(TODAY_KEY());
        const savedLog    = await AsyncStorage.getItem(LOG_KEY());
        if (savedGoal)   setGoal(parseInt(savedGoal));
        if (savedGoal)   setGoalInput(savedGoal);
        if (savedIntake) setIntake(parseInt(savedIntake));
        if (savedLog)    setLog(JSON.parse(savedLog));
      } catch {}
    }
    load();
  }, []);

  async function add(ml) {
    const newIntake = intake + ml;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
    const newLog = [{ ml, time, id: Date.now() }, ...log];
    setIntake(newIntake);
    setLog(newLog);
    try {
      await AsyncStorage.setItem(TODAY_KEY(), String(newIntake));
      await AsyncStorage.setItem(LOG_KEY(), JSON.stringify(newLog));
    } catch {}
  }

  async function undo() {
    if (log.length === 0) return;
    const last = log[0];
    const newIntake = Math.max(0, intake - last.ml);
    const newLog = log.slice(1);
    setIntake(newIntake);
    setLog(newLog);
    try {
      await AsyncStorage.setItem(TODAY_KEY(), String(newIntake));
      await AsyncStorage.setItem(LOG_KEY(), JSON.stringify(newLog));
    } catch {}
  }

  async function reset() {
    Alert.alert('Reset Today', 'Clear all of today\'s water intake?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: async () => {
        setIntake(0); setLog([]);
        try {
          await AsyncStorage.setItem(TODAY_KEY(), '0');
          await AsyncStorage.setItem(LOG_KEY(), '[]');
        } catch {}
      }},
    ]);
  }

  async function saveGoal() {
    const g = parseInt(goalInput) || 2000;
    setGoal(g);
    setShowGoal(false);
    try { await AsyncStorage.setItem(GOAL_KEY, String(g)); } catch {}
  }

  const pct = Math.min(Math.round((intake / goal) * 100), 100);

  function getColor() {
    if (pct < 25)  return '#74B9FF';
    if (pct < 50)  return '#378ADD';
    if (pct < 75)  return '#1D9E75';
    if (pct < 100) return COLORS.success;
    return '#F5A623';
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Water Tracker</Text>
        <TouchableOpacity onPress={() => setShowGoal(true)} style={styles.goalBtn}>
          <Text style={styles.goalBtnText}>Set Goal</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Main circle */}
        <View style={styles.circleWrap}>
          <View style={[styles.circle, { borderColor: getColor() }]}>
            <Text style={styles.intakeNum}>{intake}</Text>
            <Text style={styles.intakeUnit}>ml</Text>
            <Text style={styles.goalText}>of {goal}ml goal</Text>
          </View>
          <Text style={[styles.pctText, { color: getColor() }]}>{pct}%</Text>
          {pct >= 100 && <Text style={styles.celebrate}>🎉 Daily goal reached!</Text>}
        </View>

        {/* Progress bar */}
        <View style={styles.barWrap}>
          <View style={styles.bar}>
            <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: getColor() }]} />
          </View>
          <View style={styles.barLabels}>
            <Text style={styles.barLabel}>0</Text>
            <Text style={styles.barLabel}>{Math.round(goal/2)}ml</Text>
            <Text style={styles.barLabel}>{goal}ml</Text>
          </View>
        </View>

        {/* Add buttons */}
        <View style={styles.addGrid}>
          {SIZES.map(s => (
            <TouchableOpacity key={s.label} style={styles.addBtn} onPress={() => add(s.ml)} activeOpacity={0.7}>
              <Text style={styles.addBtnIcon}>{s.icon}</Text>
              <Text style={styles.addBtnLabel}>{s.label}</Text>
              <Text style={styles.addBtnMl}>+{s.ml}ml</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {log.length > 0 && (
            <TouchableOpacity style={styles.undoBtn} onPress={undo}>
              <Text style={styles.undoBtnText}>↩ Undo last</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.resetBtn} onPress={reset}>
            <Text style={styles.resetBtnText}>Reset today</Text>
          </TouchableOpacity>
        </View>

        {/* Log */}
        {log.length > 0 && (
          <View style={styles.logWrap}>
            <Text style={styles.logTitle}>Today's log</Text>
            {log.slice(0, 10).map(entry => (
              <View key={entry.id} style={styles.logItem}>
                <Text style={styles.logTime}>{entry.time}</Text>
                <Text style={styles.logMl}>+{entry.ml}ml</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Goal setting modal — appears at TOP above keyboard */}
      <Modal visible={showGoal} transparent animationType="fade">
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={() => setShowGoal(false)} />
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Set Daily Goal</Text>
            <Text style={styles.modalSub}>Recommended: 2000–3000ml per day</Text>
            <TextInput
              style={styles.modalInput}
              value={goalInput}
              onChangeText={setGoalInput}
              keyboardType="numeric"
              placeholder="2000"
              placeholderTextColor={COLORS.textTertiary}
              autoFocus
            />
            <Text style={styles.modalUnit}>ml per day</Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowGoal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={saveGoal}>
                <Text style={styles.modalSaveText}>Save Goal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
  title: { flex: 1, fontSize: 16, fontWeight: '500', color: COLORS.textPrimary },
  goalBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: RADIUS.md, borderWidth: 0.5, borderColor: COLORS.accent },
  goalBtnText: { fontSize: 13, color: COLORS.accent },
  content: { padding: 20, gap: 20, alignItems: 'center' },
  circleWrap: { alignItems: 'center', gap: 8 },
  circle: {
    width: 190, height: 190, borderRadius: 95,
    borderWidth: 6, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.bgSecondary,
  },
  intakeNum: { fontSize: 44, fontWeight: '300', color: COLORS.textPrimary, lineHeight: 50 },
  intakeUnit: { fontSize: 16, color: COLORS.textSecondary },
  goalText: { fontSize: 11, color: COLORS.textTertiary, marginTop: 2 },
  pctText: { fontSize: 18, fontWeight: '600' },
  celebrate: { fontSize: 15, fontWeight: '500' },
  barWrap: { width: '100%', gap: 4 },
  bar: { height: 8, backgroundColor: COLORS.bgTertiary, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  barLabel: { fontSize: 10, color: COLORS.textTertiary },
  addGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, width: '100%' },
  addBtn: {
    flex: 1, minWidth: '40%', padding: 16,
    backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.lg,
    borderWidth: 0.5, borderColor: COLORS.border, alignItems: 'center', gap: 4,
  },
  addBtnIcon: { fontSize: 26 },
  addBtnLabel: { fontSize: 13, fontWeight: '500', color: COLORS.textPrimary },
  addBtnMl: { fontSize: 12, color: COLORS.accent },
  actions: { flexDirection: 'row', gap: 10 },
  undoBtn: { flex: 1, padding: 10, borderRadius: RADIUS.md, borderWidth: 0.5, borderColor: COLORS.border, alignItems: 'center' },
  undoBtnText: { fontSize: 13, color: COLORS.textSecondary },
  resetBtn: { flex: 1, padding: 10, borderRadius: RADIUS.md, borderWidth: 0.5, borderColor: COLORS.danger, alignItems: 'center' },
  resetBtnText: { fontSize: 13, color: COLORS.danger },
  logWrap: { width: '100%', gap: 6 },
  logTitle: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary },
  logItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  logTime: { fontSize: 13, color: COLORS.textTertiary },
  logMl: { fontSize: 13, fontWeight: '500', color: COLORS.accent },
  modalOverlay: { flex: 1, justifyContent: 'flex-start', paddingTop: 80 },
  modalBox: { marginHorizontal: 16, backgroundColor: COLORS.bg, borderRadius: 20, padding: 24, gap: 12, zIndex: 1 },
  modalTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary },
  modalSub: { fontSize: 13, color: COLORS.textSecondary },
  modalInput: { borderWidth: 0.5, borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: 14, fontSize: 32, color: COLORS.textPrimary, textAlign: 'center', backgroundColor: COLORS.bgSecondary },
  modalUnit: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  modalCancel: { flex: 1, padding: 14, borderRadius: RADIUS.lg, borderWidth: 0.5, borderColor: COLORS.border, alignItems: 'center' },
  modalCancelText: { fontSize: 15, color: COLORS.textSecondary },
  modalSave: { flex: 2, padding: 14, borderRadius: RADIUS.lg, backgroundColor: COLORS.accent, alignItems: 'center' },
  modalSaveText: { fontSize: 15, color: '#fff', fontWeight: '600' },
});
