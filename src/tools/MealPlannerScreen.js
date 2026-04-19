import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, Modal, KeyboardAvoidingView, Platform, Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, RADIUS } from '../data/theme';
import AdBanner from '../components/AdBanner';

const DAYS  = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const MEALS = ['Breakfast','Lunch','Supper','Snacks','Drinks'];
const ICONS = { Breakfast:'🌅', Lunch:'☀️', Supper:'🌙', Snacks:'🍎', Drinks:'💧' };
const KEY   = 'meal_planner';

export default function MealPlannerScreen({ navigation }) {
  const [plan, setPlan]         = useState({});
  const [editing, setEditing]   = useState(null);
  const [text, setText]         = useState('');
  const [activeDay, setActiveDay] = useState('Monday');

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(d => { if (d) setPlan(JSON.parse(d)); }).catch(() => {});
  }, []);

  async function save(next) {
    setPlan(next);
    try { await AsyncStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  }

  function openEdit(day, meal) {
    setEditing({ day, meal });
    setText(plan[day]?.[meal] || '');
  }

  function saveEdit() {
    if (!editing) return;
    Keyboard.dismiss();
    const next = { ...plan, [editing.day]: { ...plan[editing.day], [editing.meal]: text.trim() } };
    save(next);
    setEditing(null);
  }

  function clearDay() {
    const next = { ...plan };
    delete next[activeDay];
    save(next);
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Meal Planner</Text>
        <TouchableOpacity onPress={clearDay}>
          <Text style={styles.clearBtn}>Clear day</Text>
        </TouchableOpacity>
      </View>
      <AdBanner />

      {/* Day selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={styles.dayScroll} contentContainerStyle={styles.dayContent}>
        {DAYS.map(d => (
          <TouchableOpacity key={d}
            style={[styles.dayBtn, activeDay === d && styles.dayBtnActive]}
            onPress={() => setActiveDay(d)}>
            <Text style={[styles.dayText, activeDay === d && styles.dayTextActive]}>
              {d.slice(0, 3)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.dayHeading}>{activeDay}</Text>
        {MEALS.map(meal => (
          <TouchableOpacity key={meal} style={styles.mealCard} onPress={() => openEdit(activeDay, meal)}>
            <View style={styles.mealHeader}>
              <Text style={styles.mealIcon}>{ICONS[meal]}</Text>
              <Text style={styles.mealLabel}>{meal}</Text>
              <Text style={styles.editHint}>tap to edit</Text>
            </View>
            <Text style={[styles.mealText, !plan[activeDay]?.[meal] && styles.mealTextEmpty]}>
              {plan[activeDay]?.[meal] || 'Not planned yet'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Edit modal — input at TOP so keyboard doesn't cover it */}
      <Modal visible={!!editing} transparent animationType="fade">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setEditing(null)} />
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {editing ? `${ICONS[editing.meal]} ${editing.meal} — ${editing.day}` : ''}
            </Text>
            {/* Input at top — visible above keyboard */}
            <TextInput
              style={styles.modalInput}
              value={text}
              onChangeText={setText}
              placeholder="What are you having?"
              placeholderTextColor={COLORS.textTertiary}
              multiline
              autoFocus
              returnKeyType="done"
              blurOnSubmit
              onSubmitEditing={saveEdit}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { Keyboard.dismiss(); setEditing(null); }}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={saveEdit}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  topbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: COLORS.border, gap: 12 },
  backBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.md, borderWidth: 0.5, borderColor: COLORS.border },
  backText: { fontSize: 13, color: COLORS.textSecondary },
  title: { flex: 1, fontSize: 16, fontWeight: '500', color: COLORS.textPrimary },
  clearBtn: { fontSize: 13, color: COLORS.danger },
  dayScroll: { maxHeight: 50, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  dayContent: { paddingHorizontal: 12, paddingVertical: 8, gap: 8, alignItems: 'center' },
  dayBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 0.5, borderColor: COLORS.border },
  dayBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  dayText: { fontSize: 13, color: COLORS.textSecondary },
  dayTextActive: { color: '#fff', fontWeight: '600' },
  content: { padding: 16, gap: 12 },
  dayHeading: { fontSize: 20, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  mealCard: { backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.lg, padding: 14, borderWidth: 0.5, borderColor: COLORS.border, gap: 6 },
  mealHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mealIcon: { fontSize: 18 },
  mealLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, flex: 1 },
  editHint: { fontSize: 11, color: COLORS.textTertiary },
  mealText: { fontSize: 14, color: COLORS.textPrimary, paddingLeft: 26 },
  mealTextEmpty: { color: COLORS.textTertiary, fontStyle: 'italic' },
  // Modal — sits in upper portion of screen
  modalOverlay: { flex: 1, justifyContent: 'flex-start', paddingTop: 80 },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalBox: { marginHorizontal: 16, backgroundColor: COLORS.bg, borderRadius: 20, padding: 20, gap: 12, zIndex: 1 },
  modalTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  modalInput: { borderWidth: 0.5, borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: 14, fontSize: 15, color: COLORS.textPrimary, backgroundColor: COLORS.bgSecondary, minHeight: 90, textAlignVertical: 'top' },
  modalBtns: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: RADIUS.lg, borderWidth: 0.5, borderColor: COLORS.border, alignItems: 'center' },
  cancelText: { fontSize: 15, color: COLORS.textSecondary },
  saveBtn: { flex: 2, padding: 14, borderRadius: RADIUS.lg, backgroundColor: COLORS.accent, alignItems: 'center' },
  saveText: { fontSize: 15, color: '#fff', fontWeight: '600' },
});
