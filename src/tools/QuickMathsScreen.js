import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '../data/theme';
import AdBanner from '../components/AdBanner';

const TIME_LIMIT = 30;

function generate(level) {
  const ops = level < 2 ? ['+', '-'] : level < 4 ? ['+', '-', '×'] : ['+', '-', '×', '÷'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a, b, answer;
  if (op === '+') { a = Math.floor(Math.random() * (10 + level*5)) + 1; b = Math.floor(Math.random() * (10 + level*5)) + 1; answer = a + b; }
  else if (op === '-') { a = Math.floor(Math.random() * (20 + level*5)) + 10; b = Math.floor(Math.random() * a) + 1; answer = a - b; }
  else if (op === '×') { a = Math.floor(Math.random() * (level > 3 ? 12 : 9)) + 2; b = Math.floor(Math.random() * 9) + 2; answer = a * b; }
  else { b = Math.floor(Math.random() * 9) + 2; answer = Math.floor(Math.random() * 10) + 2; a = b * answer; }

  // Generate 3 wrong answers close to correct
  const wrong = new Set();
  while (wrong.size < 3) {
    const w = answer + Math.floor(Math.random() * 10) - 5;
    if (w !== answer && w > 0) wrong.add(w);
  }
  const options = [answer, ...wrong].sort(() => Math.random() - 0.5);
  return { question: `${a} ${op} ${b}`, answer, options };
}

export default function QuickMathsScreen({ navigation }) {
  const [started, setStarted] = useState(false);
  const [done, setDone]       = useState(false);
  const [score, setScore]     = useState(0);
  const [total, setTotal]     = useState(0);
  const [streak, setStreak]   = useState(0);
  const [level, setLevel]     = useState(1);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [q, setQ]             = useState(() => generate(1));
  const [flash, setFlash]     = useState(null); // 'correct' | 'wrong'
  const timerRef = useRef(null);
  const flashAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (started && !done) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); setDone(true); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [started, done]);

  function answer(val) {
    const correct = val === q.answer;
    setTotal(t => t + 1);
    if (correct) {
      setScore(s => s + 1);
      setStreak(s => { const ns = s + 1; if (ns % 5 === 0) setLevel(l => Math.min(l+1, 5)); return ns; });
      setFlash('correct');
    } else {
      setStreak(0);
      setFlash('wrong');
    }
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => setFlash(null));
    setQ(generate(level));
  }

  function start() { setStarted(true); setTimeLeft(TIME_LIMIT); setScore(0); setTotal(0); setStreak(0); setLevel(1); setDone(false); setQ(generate(1)); }

  const timerColor = timeLeft <= 10 ? COLORS.danger : timeLeft <= 20 ? '#EF9F27' : COLORS.success;
  const accuracy = total > 0 ? Math.round((score/total)*100) : 0;

  if (!started) return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Quick Maths</Text>
      </View>
      <AdBanner />
      <View style={styles.startContent}>
        <Text style={styles.startEmoji}>➗</Text>
        <Text style={styles.startTitle}>Quick Maths</Text>
        <Text style={styles.startDesc}>Answer as many questions as you can in {TIME_LIMIT} seconds!</Text>
        <Text style={styles.startDesc}>Get 5 right in a row to level up and face harder questions.</Text>
        <TouchableOpacity style={styles.startBtn} onPress={start}>
          <Text style={styles.startBtnText}>▶ Start</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  if (done) return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Quick Maths</Text>
      </View>
      <AdBanner />
      <View style={styles.doneContent}>
        <Text style={styles.doneEmoji}>{score >= 20 ? '🏆' : score >= 10 ? '⭐' : '💪'}</Text>
        <Text style={styles.doneTitle}>Time's Up!</Text>
        <Text style={styles.doneScore}>{score}</Text>
        <Text style={styles.doneScoreLabel}>correct answers</Text>
        <View style={styles.doneStats}>
          <View style={styles.doneStat}><Text style={styles.doneStatVal}>{total}</Text><Text style={styles.doneStatLabel}>Attempted</Text></View>
          <View style={styles.doneStat}><Text style={styles.doneStatVal}>{accuracy}%</Text><Text style={styles.doneStatLabel}>Accuracy</Text></View>
          <View style={styles.doneStat}><Text style={styles.doneStatVal}>{level}</Text><Text style={styles.doneStatLabel}>Max Level</Text></View>
        </View>
        <TouchableOpacity style={styles.startBtn} onPress={start}>
          <Text style={styles.startBtnText}>Play Again</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Quick Maths</Text>
        <Text style={styles.levelText}>Lv.{level}</Text>
      </View>
      <AdBanner />

      <Animated.View style={[styles.content, flash === 'correct' ? styles.flashCorrect : flash === 'wrong' ? styles.flashWrong : null, { opacity: flashAnim.interpolate({ inputRange:[0,1], outputRange:[1,0.7] }) }]}>
        {/* Timer & score */}
        <View style={styles.statsRow}>
          <View style={[styles.timerBox, { borderColor: timerColor }]}>
            <Text style={[styles.timerText, { color: timerColor }]}>{timeLeft}s</Text>
          </View>
          <Text style={styles.scoreDisplay}>{score} ✓</Text>
          {streak >= 3 && <Text style={styles.streakDisplay}>🔥{streak}</Text>}
        </View>

        {/* Question */}
        <View style={styles.questionBox}>
          <Text style={styles.question}>{q.question} = ?</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsGrid}>
          {q.options.map((opt, i) => (
            <TouchableOpacity key={i} style={styles.optionBtn} onPress={() => answer(opt)} activeOpacity={0.7}>
              <Text style={styles.optionText}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  topbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: COLORS.border, gap: 12 },
  backBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.md, borderWidth: 0.5, borderColor: COLORS.border },
  backText: { fontSize: 13, color: COLORS.textSecondary },
  title: { flex: 1, fontSize: 16, fontWeight: '500', color: COLORS.textPrimary },
  levelText: { fontSize: 13, fontWeight: '600', color: COLORS.accent },
  content: { flex: 1, padding: 20, gap: 24, justifyContent: 'center' },
  flashCorrect: { backgroundColor: COLORS.successLight },
  flashWrong: { backgroundColor: '#FFF0F0' },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  timerBox: { width: 64, height: 64, borderRadius: 32, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  timerText: { fontSize: 20, fontWeight: '700' },
  scoreDisplay: { fontSize: 24, fontWeight: '600', color: COLORS.textPrimary },
  streakDisplay: { fontSize: 20, fontWeight: '600', color: COLORS.danger },
  questionBox: { backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.xl, padding: 32, alignItems: 'center', borderWidth: 0.5, borderColor: COLORS.border },
  question: { fontSize: 40, fontWeight: '300', color: COLORS.textPrimary },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  optionBtn: { flex: 1, minWidth: '40%', padding: 20, borderRadius: RADIUS.xl, backgroundColor: COLORS.accent, alignItems: 'center' },
  optionText: { fontSize: 28, fontWeight: '600', color: '#fff' },
  startContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  startEmoji: { fontSize: 64 },
  startTitle: { fontSize: 28, fontWeight: '700', color: COLORS.textPrimary },
  startDesc: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  startBtn: { paddingHorizontal: 40, paddingVertical: 16, borderRadius: RADIUS.xl, backgroundColor: COLORS.accent, marginTop: 8 },
  startBtnText: { fontSize: 18, fontWeight: '600', color: '#fff' },
  doneContent: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  doneEmoji: { fontSize: 64 },
  doneTitle: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  doneScore: { fontSize: 72, fontWeight: '200', color: COLORS.accent },
  doneScoreLabel: { fontSize: 16, color: COLORS.textSecondary },
  doneStats: { flexDirection: 'row', gap: 20, marginTop: 8 },
  doneStat: { alignItems: 'center' },
  doneStatVal: { fontSize: 24, fontWeight: '600', color: COLORS.textPrimary },
  doneStatLabel: { fontSize: 12, color: COLORS.textTertiary },
});
