import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  TextInput, ScrollView, Clipboard, ToastAndroid, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '../data/theme';
import AdBanner from '../components/AdBanner';

function copyToClipboard(text) {
  Clipboard.setString(text);
  if (Platform.OS === 'android') {
    ToastAndroid.show('Copied to clipboard!', ToastAndroid.SHORT);
  } else {
    Alert.alert('Copied!', 'Numbers copied to clipboard.');
  }
}

export default function RandomPickerScreen({ navigation }) {
  const [count, setCount]     = useState('1');
  const [minVal, setMinVal]   = useState('1');
  const [maxVal, setMaxVal]   = useState('100');
  const [display, setDisplay] = useState([]);
  const [results, setResults] = useState([]);
  const [rolling, setRolling] = useState(false);

  function generate() {
    const n   = Math.min(Math.max(parseInt(count) || 1, 1), 20);
    const min = parseInt(minVal);
    const max = parseInt(maxVal);
    if (isNaN(min) || isNaN(max) || min >= max) {
      Alert.alert('Invalid Range', 'Min must be less than Max.');
      return;
    }

    setRolling(true);
    setDisplay([]);

    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      const fake = Array.from({ length: n }, () =>
        Math.floor(Math.random() * (max - min + 1)) + min
      );
      setDisplay(fake);
      if (frame >= 15) {
        clearInterval(interval);
        const final = Array.from({ length: n }, () =>
          Math.floor(Math.random() * (max - min + 1)) + min
        );
        setResults(final);
        setDisplay(final);
        setRolling(false);
      }
    }, 60);
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Random Number Picker</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Settings */}
        <View style={styles.settings}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>How many numbers?</Text>
            <View style={styles.stepper}>
              <TouchableOpacity style={styles.stepBtn}
                onPress={() => setCount(String(Math.max(1, (parseInt(count)||1) - 1)))}>
                <Text style={styles.stepBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.stepValue}>{count}</Text>
              <TouchableOpacity style={styles.stepBtn}
                onPress={() => setCount(String(Math.min(20, (parseInt(count)||1) + 1)))}>
                <Text style={styles.stepBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.rangeRow}>
            <View style={styles.rangeField}>
              <Text style={styles.settingLabel}>Min</Text>
              <TextInput style={styles.rangeInput} value={minVal} onChangeText={setMinVal}
                keyboardType="numeric" placeholderTextColor={COLORS.textTertiary} />
            </View>
            <Text style={styles.rangeDash}>—</Text>
            <View style={styles.rangeField}>
              <Text style={styles.settingLabel}>Max</Text>
              <TextInput style={styles.rangeInput} value={maxVal} onChangeText={setMaxVal}
                keyboardType="numeric" placeholderTextColor={COLORS.textTertiary} />
            </View>
          </View>
        </View>

        {/* Result display */}
        <View style={styles.resultBox}>
          {display.length === 0 && !rolling && (
            <Text style={styles.placeholder}>Press Generate</Text>
          )}
          <View style={styles.numbersGrid}>
            {display.map((n, i) => (
              <View key={i} style={[styles.numberBubble, rolling && styles.numberBubbleRolling]}>
                <Text style={[styles.numberText, rolling && styles.numberTextRolling]}>{n}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Generate button */}
        <TouchableOpacity
          style={[styles.generateBtn, rolling && styles.generateBtnDisabled]}
          onPress={generate} disabled={rolling} activeOpacity={0.8}>
          <Text style={styles.generateBtnText}>{rolling ? 'Picking...' : '🎰  Generate'}</Text>
        </TouchableOpacity>

        {/* Copy button — only shows after generation */}
        {results.length > 0 && !rolling && (
          <TouchableOpacity
            style={styles.copyBtn}
            onPress={() => copyToClipboard(results.join(', '))}
            activeOpacity={0.7}>
            <Text style={styles.copyBtnText}>📋  Copy Numbers</Text>
          </TouchableOpacity>
        )}

        {results.length > 0 && !rolling && (
          <View style={styles.history}>
            <Text style={styles.historyLabel}>Last result</Text>
            <Text style={styles.historyText}>{results.join(', ')}</Text>
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
  title: { fontSize: 15, fontWeight: '500', color: COLORS.textPrimary },
  content: { padding: 20, gap: 16 },
  settings: { backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.lg, padding: 16, gap: 16 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settingLabel: { fontSize: 14, fontWeight: '500', color: COLORS.textPrimary },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 0.5, borderColor: COLORS.border,
    backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center',
  },
  stepBtnText: { fontSize: 20, color: COLORS.textPrimary },
  stepValue: { fontSize: 20, fontWeight: '500', color: COLORS.textPrimary, minWidth: 30, textAlign: 'center' },
  rangeRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  rangeField: { flex: 1, gap: 6 },
  rangeDash: { fontSize: 20, color: COLORS.textTertiary, paddingBottom: 10 },
  rangeInput: {
    borderWidth: 0.5, borderColor: COLORS.border, borderRadius: RADIUS.md,
    padding: 10, fontSize: 20, color: COLORS.textPrimary,
    backgroundColor: COLORS.bg, textAlign: 'center',
  },
  resultBox: {
    minHeight: 160, backgroundColor: COLORS.bgSecondary,
    borderRadius: RADIUS.xl, padding: 20,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: COLORS.border,
  },
  placeholder: { fontSize: 16, color: COLORS.textTertiary },
  numbersGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  numberBubble: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center',
  },
  numberBubbleRolling: { backgroundColor: COLORS.bgTertiary },
  numberText: { fontSize: 24, fontWeight: '700', color: '#fff' },
  numberTextRolling: { color: COLORS.textTertiary },
  generateBtn: { backgroundColor: COLORS.accent, borderRadius: RADIUS.lg, padding: 18, alignItems: 'center' },
  generateBtnDisabled: { backgroundColor: COLORS.bgTertiary },
  generateBtnText: { fontSize: 18, fontWeight: '600', color: '#fff' },
  copyBtn: {
    borderWidth: 1.5, borderColor: COLORS.accent,
    borderRadius: RADIUS.lg, padding: 14, alignItems: 'center',
  },
  copyBtnText: { fontSize: 15, fontWeight: '500', color: COLORS.accent },
  history: { padding: 16, backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.lg, alignItems: 'center', gap: 4 },
  historyLabel: { fontSize: 11, color: COLORS.textTertiary },
  historyText: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '500' },
});
