import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '../data/theme';
import AdBanner from '../components/AdBanner';

const DICE_TYPES = [4, 6, 8, 10, 12, 20, 100];

// Simple 3D die face using shadow layers
function Die3D({ value, diceType, rolling }) {
  const color = rolling ? '#CCCCCC' : '#378ADD';
  const shadow = rolling ? '#AAAAAA' : '#1A5FA0';
  const size = 80;
  const depth = 8;

  return (
    <View style={{ alignItems: 'center', marginBottom: depth }}>
      {/* Bottom shadow layer (3D depth) */}
      <View style={[styles.dieBottom, {
        width: size, height: size,
        backgroundColor: shadow,
        borderRadius: 14,
        top: depth,
        left: depth * 0.7,
        position: 'absolute',
      }]} />
      {/* Right shadow layer */}
      <View style={[{
        width: size, height: size,
        backgroundColor: rolling ? '#BBBBBB' : '#2470BE',
        borderRadius: 14,
        top: depth * 0.5,
        left: depth * 0.35,
        position: 'absolute',
      }]} />
      {/* Main face */}
      <View style={[styles.dieFace, {
        width: size, height: size,
        backgroundColor: color,
        borderRadius: 14,
      }]}>
        <Text style={[styles.dieValue, rolling && { color: '#888' }]}>
          {value || '?'}
        </Text>
        <Text style={styles.dieType}>d{diceType}</Text>
      </View>
    </View>
  );
}

export default function DiceRollerScreen({ navigation }) {
  const [diceType, setDiceType] = useState(6);
  const [count, setCount]       = useState(1);
  const [results, setResults]   = useState([]);
  const [rolling, setRolling]   = useState(false);
  const [display, setDisplay]   = useState([]);
  const [history, setHistory]   = useState([]);

  const shakeAnims = useRef([...Array(10)].map(() => new Animated.Value(0))).current;

  function shake(index) {
    Animated.sequence([
      Animated.timing(shakeAnims[index], { toValue: 6, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnims[index], { toValue: -6, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnims[index], { toValue: 4, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnims[index], { toValue: -4, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnims[index], { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();
  }

  function roll() {
    if (rolling) return;
    setRolling(true);
    setDisplay(Array(count).fill('?'));

    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      const fake = Array.from({ length: count }, () =>
        Math.floor(Math.random() * diceType) + 1
      );
      setDisplay(fake);
      // Shake each die
      fake.forEach((_, i) => shake(i));

      if (frame >= 14) {
        clearInterval(interval);
        const final = Array.from({ length: count }, () =>
          Math.floor(Math.random() * diceType) + 1
        );
        setResults(final);
        setDisplay(final);
        setRolling(false);
        const sum = final.reduce((a, b) => a + b, 0);
        setHistory(prev => [
          `${count}d${diceType} → [${final.join(', ')}]${count > 1 ? ` = ${sum}` : ''}`,
          ...prev.slice(0, 7),
        ]);
      }
    }, 70);
  }

  const sum = results.reduce((a, b) => a + b, 0);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Dice Roller</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Dice type */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Dice type</Text>
          <View style={styles.diceTypes}>
            {DICE_TYPES.map(d => (
              <TouchableOpacity key={d}
                style={[styles.diceTypeBtn, diceType === d && styles.diceTypeBtnActive]}
                onPress={() => { setDiceType(d); setResults([]); setDisplay([]); }}>
                <Text style={[styles.diceTypeBtnText, diceType === d && styles.diceTypeBtnTextActive]}>
                  d{d}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Count */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Number of dice</Text>
          <View style={styles.stepper}>
            <TouchableOpacity style={styles.stepBtn}
              onPress={() => { setCount(c => Math.max(1, c - 1)); setResults([]); setDisplay([]); }}>
              <Text style={styles.stepBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.stepValue}>{count}</Text>
            <TouchableOpacity style={styles.stepBtn}
              onPress={() => { setCount(c => Math.min(6, c + 1)); setResults([]); setDisplay([]); }}>
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3D Dice display */}
        <TouchableOpacity
          style={styles.diceStage}
          onPress={roll}
          disabled={rolling}
          activeOpacity={0.9}
        >
          {display.length === 0 ? (
            <Text style={styles.tapHint}>Tap to roll 🎲</Text>
          ) : (
            <>
              <View style={styles.diceRow}>
                {display.map((val, i) => (
                  <Animated.View key={i} style={{ transform: [{ translateX: shakeAnims[i] }] }}>
                    <Die3D value={val} diceType={diceType} rolling={rolling} />
                  </Animated.View>
                ))}
              </View>
              {!rolling && results.length > 0 && count > 1 && (
                <View style={styles.sumBox}>
                  <Text style={styles.sumLabel}>Total</Text>
                  <Text style={styles.sumValue}>{sum}</Text>
                </View>
              )}
            </>
          )}
        </TouchableOpacity>

        {/* Roll button */}
        <TouchableOpacity
          style={[styles.rollBtn, rolling && styles.rollBtnDisabled]}
          onPress={roll} disabled={rolling} activeOpacity={0.8}>
          <Text style={styles.rollBtnText}>{rolling ? 'Rolling...' : '🎲  Roll the dice'}</Text>
        </TouchableOpacity>

        {/* History */}
        {history.length > 0 && (
          <View style={styles.historyWrap}>
            <Text style={styles.historyTitle}>Recent rolls</Text>
            {history.map((h, i) => (
              <View key={i} style={[styles.historyItem, i === 0 && styles.historyItemFirst]}>
                <Text style={[styles.historyText, i === 0 && styles.historyTextFirst]}>{h}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

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
  section: { gap: 10 },
  sectionLabel: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary },
  diceTypes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  diceTypeBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.md,
    borderWidth: 0.5, borderColor: COLORS.border, backgroundColor: COLORS.bg,
  },
  diceTypeBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  diceTypeBtnText: { fontSize: 14, fontWeight: '500', color: COLORS.textSecondary },
  diceTypeBtnTextActive: { color: '#fff' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stepBtn: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 0.5, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.bgSecondary,
  },
  stepBtnText: { fontSize: 20, color: COLORS.textPrimary },
  stepValue: { fontSize: 24, fontWeight: '500', color: COLORS.textPrimary, minWidth: 30, textAlign: 'center' },
  diceStage: {
    minHeight: 160, backgroundColor: COLORS.bgSecondary,
    borderRadius: RADIUS.xl, padding: 24,
    alignItems: 'center', justifyContent: 'center', gap: 16,
    borderWidth: 0.5, borderColor: COLORS.border,
  },
  tapHint: { fontSize: 18, color: COLORS.textTertiary },
  diceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, justifyContent: 'center' },
  dieFace: { alignItems: 'center', justifyContent: 'center', gap: 2 },
  dieBottom: {},
  dieValue: { fontSize: 30, fontWeight: '700', color: '#fff' },
  dieType: { fontSize: 10, color: 'rgba(255,255,255,0.7)' },
  sumBox: { alignItems: 'center', gap: 2 },
  sumLabel: { fontSize: 12, color: COLORS.textTertiary },
  sumValue: { fontSize: 28, fontWeight: '600', color: COLORS.textPrimary },
  rollBtn: {
    backgroundColor: COLORS.accent, borderRadius: RADIUS.lg,
    padding: 18, alignItems: 'center',
  },
  rollBtnDisabled: { backgroundColor: COLORS.bgTertiary },
  rollBtnText: { fontSize: 18, fontWeight: '600', color: '#fff' },
  historyWrap: { gap: 6 },
  historyTitle: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary },
  historyItem: {
    paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  historyItemFirst: { borderBottomColor: COLORS.accent },
  historyText: { fontSize: 13, color: COLORS.textTertiary },
  historyTextFirst: { color: COLORS.textPrimary, fontWeight: '500' },
});
