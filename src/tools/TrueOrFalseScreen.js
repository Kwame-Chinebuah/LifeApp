import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '../data/theme';
import AdBanner from '../components/AdBanner';

const QUESTIONS = [
  { q: 'The Great Wall of China is visible from space.', a: false, fact: 'It\'s too narrow to be seen from space with the naked eye.' },
  { q: 'Humans share 60% of their DNA with bananas.', a: true, fact: 'We share about 60% of our DNA with bananas!' },
  { q: 'Lightning never strikes the same place twice.', a: false, fact: 'Lightning frequently strikes the same place, especially tall structures.' },
  { q: 'Goldfish have a memory span of only 3 seconds.', a: false, fact: 'Goldfish can actually remember things for months.' },
  { q: 'The Eiffel Tower was originally built for Barcelona.', a: false, fact: 'It was built for the 1889 World\'s Fair in Paris.' },
  { q: 'Honey never expires and can last thousands of years.', a: true, fact: 'Archaeologists found 3,000-year-old honey in Egyptian tombs!' },
  { q: 'A group of flamingos is called a "flamboyance".', a: true, fact: 'Yes — a flamboyance of flamingos!' },
  { q: 'The human brain uses 10% of its capacity.', a: false, fact: 'We use virtually all of our brain — just not all at once.' },
  { q: 'Venus is the closest planet to Earth on average.', a: true, fact: 'Mercury is actually closer on average due to orbital mechanics.' },
  { q: 'Cleopatra lived closer in time to the Moon landing than to the pyramids.', a: true, fact: 'The pyramids are about 2,500 years older than Cleopatra!' },
  { q: 'A day on Venus is longer than a year on Venus.', a: true, fact: 'Venus rotates so slowly its day is longer than its year.' },
  { q: 'Sharks are the only fish that can blink with both eyes.', a: false, fact: 'Sharks have no eyelids — they roll their eyes back to protect them.' },
  { q: 'The shortest war in history lasted 38 minutes.', a: true, fact: 'The Anglo-Zanzibar War of 1896 lasted just 38-45 minutes.' },
  { q: 'Octopuses have three hearts.', a: true, fact: 'Two pump blood to the gills, one pumps it to the body.' },
  { q: 'The tongue is the strongest muscle in the human body.', a: false, fact: 'The masseter (jaw muscle) is considered the strongest.' },
  { q: 'Sound travels faster in water than in air.', a: true, fact: 'Sound travels about 4 times faster in water than in air.' },
  { q: 'Nigeria is the most populated country in Africa.', a: true, fact: 'Nigeria has over 220 million people.' },
  { q: 'The Amazon River flows into the Pacific Ocean.', a: false, fact: 'The Amazon flows into the Atlantic Ocean.' },
  { q: 'A snail can sleep for 3 years.', a: true, fact: 'Snails hibernate and can sleep for up to 3 years.' },
  { q: 'Mount Everest is the tallest mountain from Earth\'s centre.', a: false, fact: 'Mount Chimborazo in Ecuador is farthest from Earth\'s centre.' },
];

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function TrueOrFalseScreen({ navigation }) {
  const [questions] = useState(() => shuffle(QUESTIONS));
  const [idx, setIdx]       = useState(0);
  const [chosen, setChosen] = useState(null);
  const [score, setScore]   = useState(0);
  const [streak, setStreak] = useState(0);
  const [done, setDone]     = useState(false);

  const q = questions[idx];

  function answer(val) {
    if (chosen !== null) return;
    setChosen(val);
    const correct = val === q.a;
    if (correct) { setScore(s => s + 1); setStreak(s => s + 1); }
    else setStreak(0);
  }

  function next() {
    if (idx + 1 >= questions.length) { setDone(true); return; }
    setIdx(i => i + 1);
    setChosen(null);
  }

  function restart() { setIdx(0); setChosen(null); setScore(0); setStreak(0); setDone(false); }

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.topbar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>True or False</Text>
        </View>
        <AdBanner />
        <View style={styles.doneContent}>
          <Text style={styles.doneEmoji}>{pct >= 70 ? '🎉' : pct >= 50 ? '👍' : '😅'}</Text>
          <Text style={styles.doneTitle}>Quiz Complete!</Text>
          <Text style={styles.doneScore}>{score}/{questions.length}</Text>
          <Text style={styles.donePct}>{pct}% correct</Text>
          <TouchableOpacity style={styles.restartBtn} onPress={restart}>
            <Text style={styles.restartBtnText}>Play Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>True or False</Text>
        <Text style={styles.progress}>{idx+1}/{questions.length}</Text>
      </View>
      <AdBanner />

      <View style={styles.content}>
        {/* Score */}
        <View style={styles.scoreRow}>
          <Text style={styles.scoreText}>Score: {score}</Text>
          {streak >= 3 && <Text style={styles.streakText}>🔥 {streak} streak!</Text>}
        </View>

        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((idx) / questions.length) * 100}%` }]} />
        </View>

        {/* Question */}
        <View style={styles.questionBox}>
          <Text style={styles.question}>{q.q}</Text>
        </View>

        {/* Fact reveal */}
        {chosen !== null && (
          <View style={[styles.factBox, chosen === q.a ? styles.factCorrect : styles.factWrong]}>
            <Text style={styles.factResult}>{chosen === q.a ? '✓ Correct!' : '✕ Wrong!'}</Text>
            <Text style={styles.factText}>{q.fact}</Text>
          </View>
        )}

        {/* Buttons */}
        {chosen === null ? (
          <View style={styles.answerRow}>
            <TouchableOpacity style={[styles.answerBtn, styles.trueBtn]} onPress={() => answer(true)}>
              <Text style={styles.answerBtnText}>✓ TRUE</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.answerBtn, styles.falseBtn]} onPress={() => answer(false)}>
              <Text style={styles.answerBtnText}>✕ FALSE</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.nextBtn} onPress={next}>
            <Text style={styles.nextBtnText}>{idx + 1 >= questions.length ? 'See Results' : 'Next →'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  topbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: COLORS.border, gap: 12 },
  backBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.md, borderWidth: 0.5, borderColor: COLORS.border },
  backText: { fontSize: 13, color: COLORS.textSecondary },
  title: { flex: 1, fontSize: 16, fontWeight: '500', color: COLORS.textPrimary },
  progress: { fontSize: 13, color: COLORS.textTertiary },
  content: { flex: 1, padding: 20, gap: 16 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreText: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  streakText: { fontSize: 14, fontWeight: '600', color: COLORS.danger },
  progressBar: { height: 6, backgroundColor: COLORS.bgTertiary, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: COLORS.accent, borderRadius: 3 },
  questionBox: { flex: 1, backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.xl, padding: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: COLORS.border },
  question: { fontSize: 20, fontWeight: '500', color: COLORS.textPrimary, textAlign: 'center', lineHeight: 28 },
  factBox: { padding: 14, borderRadius: RADIUS.lg, gap: 4 },
  factCorrect: { backgroundColor: COLORS.successLight },
  factWrong: { backgroundColor: '#FFF0F0' },
  factResult: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  factText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  answerRow: { flexDirection: 'row', gap: 12 },
  answerBtn: { flex: 1, padding: 18, borderRadius: RADIUS.xl, alignItems: 'center' },
  trueBtn: { backgroundColor: COLORS.success },
  falseBtn: { backgroundColor: COLORS.danger },
  answerBtnText: { fontSize: 18, fontWeight: '700', color: '#fff' },
  nextBtn: { padding: 16, borderRadius: RADIUS.lg, backgroundColor: COLORS.accent, alignItems: 'center' },
  nextBtnText: { fontSize: 16, color: '#fff', fontWeight: '600' },
  doneContent: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  doneEmoji: { fontSize: 64 },
  doneTitle: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  doneScore: { fontSize: 52, fontWeight: '300', color: COLORS.accent },
  donePct: { fontSize: 16, color: COLORS.textSecondary },
  restartBtn: { marginTop: 16, paddingHorizontal: 32, paddingVertical: 14, borderRadius: RADIUS.xl, backgroundColor: COLORS.accent },
  restartBtnText: { fontSize: 16, color: '#fff', fontWeight: '600' },
});
