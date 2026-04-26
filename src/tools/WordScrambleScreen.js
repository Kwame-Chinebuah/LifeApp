import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '../data/theme';
import { useTheme } from '../data/ThemeContext';
import AdBanner from '../components/AdBanner';

const WORDS = [
  { word:'ELEPHANT',   hint:'Large African animal' },
  { word:'CALCULATOR', hint:'Used for maths' },
  { word:'CALENDAR',   hint:'Shows the days of the year' },
  { word:'MOUNTAIN',   hint:'Very tall natural feature' },
  { word:'KEYBOARD',   hint:'Used for typing' },
  { word:'CHOCOLATE',  hint:'Sweet brown treat' },
  { word:'BUTTERFLY',  hint:'Colourful flying insect' },
  { word:'TELEPHONE',  hint:'Device for calling people' },
  { word:'UMBRELLA',   hint:'Keeps you dry in rain' },
  { word:'ADVENTURE',  hint:'An exciting experience' },
  { word:'FOOTBALL',   hint:'Popular team sport' },
  { word:'PASSPORT',   hint:'Needed for travel abroad' },
  { word:'HOSPITAL',   hint:'Where doctors work' },
  { word:'RAINBOW',    hint:'Appears after rain' },
  { word:'DINOSAUR',   hint:'Ancient extinct creature' },
  { word:'LANGUAGE',   hint:'A system of communication' },
  { word:'TOMORROW',   hint:'The day after today' },
  { word:'DIAMOND',    hint:'Precious gemstone' },
  { word:'SWIMMING',   hint:'Water sport' },
  { word:'COMPUTER',   hint:'Electronic device' },
];

function scramble(word) {
  let arr = word.split('');
  for (let i = arr.length-1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const s = arr.join('');
  return s === word ? scramble(word) : s;
}

function getWord(used) {
  const pool = WORDS.filter(w => !used.includes(w.word));
  const arr  = pool.length > 0 ? pool : WORDS;
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function WordScrambleScreen({ navigation }) {
  const { COLORS: dynCOLORS } = useTheme();
  const [used,      setUsed]     = useState([]);
  const [current,   setCurrent]  = useState(() => getWord([]));
  const [shuffled,  setShuffled] = useState(() => scramble(getWord([]).word));
  const [guess,     setGuess]    = useState('');
  const [result,    setResult]   = useState(null);
  const [score,     setScore]    = useState(0);
  const [total,     setTotal]    = useState(0);
  const [showHint,  setShowHint] = useState(false);

  function next(correct) {
    const newUsed = correct ? [...used, current.word] : used;
    setUsed(newUsed);
    const w = getWord(newUsed);
    setCurrent(w); setShuffled(scramble(w.word));
    setGuess(''); setResult(null); setShowHint(false);
    setTotal(t => t + 1);
    if (correct) setScore(s => s + 1);
  }

  function check() {
    const correct = guess.trim().toUpperCase() === current.word;
    setResult(correct ? 'correct' : 'wrong');
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: dynCOLORS.bg }]}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Word Scramble</Text>
        <Text style={styles.score}>{score}/{total}</Text>
      </View>
      <AdBanner />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.scrambleBox}>
            <Text style={styles.scrambleWord}>{shuffled}</Text>
            <Text style={styles.scrambleLabel}>Unscramble this word</Text>
          </View>

          <View style={styles.tiles}>
            {shuffled.split('').map((l, i) => (
              <View key={i} style={styles.tile}><Text style={styles.tileLetter}>{l}</Text></View>
            ))}
          </View>

          {showHint ? (
            <Text style={styles.hintText}>💡 {current.hint}</Text>
          ) : (
            <TouchableOpacity onPress={() => setShowHint(true)}>
              <Text style={styles.hintBtn}>💡 Show hint</Text>
            </TouchableOpacity>
          )}

          {/* Input at top before result */}
          {!result && (
            <TextInput
              style={styles.input}
              value={guess}
              onChangeText={v => setGuess(v.toUpperCase())}
              placeholder="Type your answer..."
              placeholderTextColor={COLORS.textTertiary}
              autoCapitalize="characters"
              autoCorrect={false}
              onSubmitEditing={check}
              returnKeyType="done"
            />
          )}

          {result && (
            <View style={[styles.resultBox, result==='correct' ? styles.resultCorrect : styles.resultWrong]}>
              <Text style={styles.resultText}>
                {result === 'correct' ? '✓ Correct! Well done!' : `✕ The answer was: ${current.word}`}
              </Text>
            </View>
          )}

          <View style={styles.btnRow}>
            {!result ? (
              <>
                <TouchableOpacity style={styles.skipBtn} onPress={() => next(false)}>
                  <Text style={styles.skipBtnText}>Skip</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.checkBtn} onPress={check} disabled={!guess.trim()}>
                  <Text style={styles.checkBtnText}>Check</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.nextBtn} onPress={() => next(result==='correct')}>
                <Text style={styles.nextBtnText}>Next Word →</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  topbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: COLORS.border, gap: 12 },
  backBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.md, borderWidth: 0.5, borderColor: COLORS.border },
  backText: { fontSize: 13, color: COLORS.textSecondary },
  title: { flex: 1, fontSize: 16, fontWeight: '500', color: COLORS.textPrimary },
  score: { fontSize: 15, fontWeight: '600', color: COLORS.accent },
  content: { padding: 20, gap: 16 },
  scrambleBox: { backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.xl, padding: 28, alignItems: 'center', gap: 8, borderWidth: 0.5, borderColor: COLORS.border },
  scrambleWord: { fontSize: 36, fontWeight: '700', color: COLORS.accent, letterSpacing: 6 },
  scrambleLabel: { fontSize: 13, color: COLORS.textTertiary },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  tile: { width: 36, height: 36, borderRadius: RADIUS.sm, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  tileLetter: { fontSize: 16, fontWeight: '700', color: '#fff' },
  hintText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', backgroundColor: COLORS.bgSecondary, padding: 10, borderRadius: RADIUS.md },
  hintBtn: { fontSize: 13, color: COLORS.accent, textAlign: 'center' },
  input: { borderWidth: 0.5, borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: 14, fontSize: 22, color: COLORS.textPrimary, backgroundColor: COLORS.bgSecondary, textAlign: 'center', letterSpacing: 4 },
  resultBox: { padding: 14, borderRadius: RADIUS.lg, alignItems: 'center' },
  resultCorrect: { backgroundColor: COLORS.successLight },
  resultWrong: { backgroundColor: '#FFF0F0' },
  resultText: { fontSize: 15, fontWeight: '500', color: COLORS.textPrimary },
  btnRow: { flexDirection: 'row', gap: 12 },
  skipBtn: { flex: 1, padding: 14, borderRadius: RADIUS.lg, borderWidth: 0.5, borderColor: COLORS.border, alignItems: 'center' },
  skipBtnText: { fontSize: 15, color: COLORS.textSecondary },
  checkBtn: { flex: 2, padding: 14, borderRadius: RADIUS.lg, backgroundColor: COLORS.accent, alignItems: 'center' },
  checkBtnText: { fontSize: 15, color: '#fff', fontWeight: '600' },
  nextBtn: { flex: 1, padding: 14, borderRadius: RADIUS.lg, backgroundColor: COLORS.accent, alignItems: 'center' },
  nextBtnText: { fontSize: 15, color: '#fff', fontWeight: '600' },
});
