import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '../data/theme';
import AdBanner from '../components/AdBanner';

const FLAGS = [
  { flag:'🇬🇧', answer:'United Kingdom' }, { flag:'🇳🇬', answer:'Nigeria' },
  { flag:'🇺🇸', answer:'United States' },  { flag:'🇫🇷', answer:'France' },
  { flag:'🇩🇪', answer:'Germany' },         { flag:'🇯🇵', answer:'Japan' },
  { flag:'🇧🇷', answer:'Brazil' },          { flag:'🇮🇳', answer:'India' },
  { flag:'🇨🇳', answer:'China' },           { flag:'🇬🇭', answer:'Ghana' },
  { flag:'🇿🇦', answer:'South Africa' },    { flag:'🇮🇹', answer:'Italy' },
  { flag:'🇪🇸', answer:'Spain' },           { flag:'🇷🇺', answer:'Russia' },
  { flag:'🇦🇺', answer:'Australia' },       { flag:'🇨🇦', answer:'Canada' },
  { flag:'🇲🇽', answer:'Mexico' },          { flag:'🇰🇷', answer:'South Korea' },
  { flag:'🇸🇦', answer:'Saudi Arabia' },    { flag:'🇦🇪', answer:'UAE' },
  { flag:'🇵🇹', answer:'Portugal' },        { flag:'🇳🇱', answer:'Netherlands' },
  { flag:'🇸🇳', answer:'Senegal' },         { flag:'🇰🇪', answer:'Kenya' },
  { flag:'🇯🇲', answer:'Jamaica' },         { flag:'🇹🇹', answer:'Trinidad & Tobago' },
  { flag:'🇵🇰', answer:'Pakistan' },        { flag:'🇧🇩', answer:'Bangladesh' },
  { flag:'🇹🇭', answer:'Thailand' },        { flag:'🇸🇬', answer:'Singapore' },
];

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function getQuestion(all, used) {
  const remaining = all.filter(f => !used.includes(f.answer));
  const pool = remaining.length >= 4 ? remaining : all;
  const correct = pool[Math.floor(Math.random() * pool.length)];
  const wrong = shuffle(all.filter(f => f.answer !== correct.answer)).slice(0, 3);
  const options = shuffle([correct, ...wrong]);
  return { correct, options };
}

export default function FlagQuizScreen({ navigation }) {
  const [score, setScore]     = useState(0);
  const [total, setTotal]     = useState(0);
  const [used, setUsed]       = useState([]);
  const [q, setQ]             = useState(() => getQuestion(FLAGS, []));
  const [chosen, setChosen]   = useState(null);
  const [streak, setStreak]   = useState(0);
  const shakeAnim = React.useRef(new Animated.Value(0)).current;

  function answer(option) {
    if (chosen) return;
    setChosen(option.answer);
    setTotal(t => t + 1);
    const correct = option.answer === q.correct.answer;
    if (correct) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
      setUsed(u => [...u, q.correct.answer]);
    } else {
      setStreak(0);
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
    setTimeout(() => { setChosen(null); setQ(getQuestion(FLAGS, used)); }, 1200);
  }

  function reset() { setScore(0); setTotal(0); setUsed([]); setStreak(0); setChosen(null); setQ(getQuestion(FLAGS, [])); }

  const pct = total > 0 ? Math.round((score/total)*100) : 0;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Flag Quiz</Text>
        <TouchableOpacity onPress={reset}><Text style={styles.resetBtn}>Reset</Text></TouchableOpacity>
      </View>
      <AdBanner />

      <View style={styles.content}>
        {/* Score */}
        <View style={styles.scoreRow}>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreNum}>{score}/{total}</Text>
            <Text style={styles.scoreLabel}>Score</Text>
          </View>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreNum}>{pct}%</Text>
            <Text style={styles.scoreLabel}>Accuracy</Text>
          </View>
          {streak >= 3 && (
            <View style={[styles.scoreCard, { borderColor: '#F5A623' }]}>
              <Text style={styles.scoreNum}>🔥{streak}</Text>
              <Text style={styles.scoreLabel}>Streak</Text>
            </View>
          )}
        </View>

        {/* Flag */}
        <Animated.View style={[styles.flagBox, { transform: [{ translateX: shakeAnim }] }]}>
          <Text style={styles.flagEmoji}>{q.correct.flag}</Text>
          <Text style={styles.flagQuestion}>Which country is this?</Text>
        </Animated.View>

        {/* Options */}
        <View style={styles.options}>
          {q.options.map(opt => {
            let bg = COLORS.bgSecondary;
            let bc = COLORS.border;
            if (chosen) {
              if (opt.answer === q.correct.answer) { bg = COLORS.successLight; bc = COLORS.success; }
              else if (opt.answer === chosen) { bg = '#FFF0F0'; bc = COLORS.danger; }
            }
            return (
              <TouchableOpacity key={opt.answer}
                style={[styles.option, { backgroundColor: bg, borderColor: bc }]}
                onPress={() => answer(opt)} disabled={!!chosen} activeOpacity={0.7}>
                <Text style={styles.optionText}>{opt.answer}</Text>
                {chosen && opt.answer === q.correct.answer && <Text style={styles.optionTick}>✓</Text>}
                {chosen && opt.answer === chosen && opt.answer !== q.correct.answer && <Text style={styles.optionCross}>✕</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
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
  resetBtn: { fontSize: 13, color: COLORS.accent },
  content: { flex: 1, padding: 20, gap: 20 },
  scoreRow: { flexDirection: 'row', gap: 10 },
  scoreCard: { flex: 1, padding: 12, backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.lg, borderWidth: 0.5, borderColor: COLORS.border, alignItems: 'center' },
  scoreNum: { fontSize: 20, fontWeight: '600', color: COLORS.textPrimary },
  scoreLabel: { fontSize: 11, color: COLORS.textTertiary },
  flagBox: { alignItems: 'center', gap: 12, padding: 24, backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.xl, borderWidth: 0.5, borderColor: COLORS.border },
  flagEmoji: { fontSize: 80 },
  flagQuestion: { fontSize: 15, color: COLORS.textSecondary },
  options: { gap: 10 },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: RADIUS.lg, borderWidth: 1.5 },
  optionText: { fontSize: 15, fontWeight: '500', color: COLORS.textPrimary },
  optionTick: { fontSize: 18, color: COLORS.success },
  optionCross: { fontSize: 18, color: COLORS.danger },
});
