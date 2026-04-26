import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../data/ThemeContext';
import { RADIUS } from '../data/theme';
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

function getQuestion(recentAnswers) {
  const pool = FLAGS.filter(f => !recentAnswers.includes(f.answer));
  const available = pool.length >= 4 ? pool : FLAGS;
  const correct = available[Math.floor(Math.random() * available.length)];
  const wrong = shuffle(FLAGS.filter(f => f.answer !== correct.answer)).slice(0, 3);
  return { correct, options: shuffle([correct, ...wrong]) };
}

export default function FlagQuizScreen({ navigation }) {
  const { COLORS } = useTheme();
  const [recentAnswers, setRecentAnswers] = useState([]);
  const [score,  setScore]  = useState(0);
  const [total,  setTotal]  = useState(0);
  const [streak, setStreak] = useState(0);
  const [q,      setQ]      = useState(() => getQuestion([]));
  const [chosen, setChosen] = useState(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  function answer(option) {
    if (chosen) return;
    setChosen(option.answer);
    setTotal(t => t + 1);
    const correct = option.answer === q.correct.answer;
    if (correct) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6,   duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
      ]).start();
    }
    setTimeout(() => {
      const newRecent = [q.correct.answer, ...recentAnswers].slice(0, 5);
      setRecentAnswers(newRecent);
      setChosen(null);
      setQ(getQuestion(newRecent));
    }, 1200);
  }

  function reset() {
    setScore(0); setTotal(0); setStreak(0);
    setChosen(null); setRecentAnswers([]);
    setQ(getQuestion([]));
  }

  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: COLORS.bg }]}>
      <View style={[styles.topbar, { borderBottomColor: COLORS.border }]}>
        <TouchableOpacity style={[styles.backBtn, { borderColor: COLORS.border }]} onPress={() => navigation.goBack()}>
          <Text style={[styles.backText, { color: COLORS.textSecondary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: COLORS.textPrimary }]}>Flag Quiz</Text>
        <TouchableOpacity onPress={reset}>
          <Text style={[{ fontSize: 13, color: COLORS.accent }]}>Reset</Text>
        </TouchableOpacity>
      </View>
      <AdBanner />

      <View style={styles.content}>
        <View style={styles.scoreRow}>
          {[
            { label: 'Score', value: `${score}/${total}` },
            { label: 'Accuracy', value: `${pct}%` },
          ].map(s => (
            <View key={s.label} style={[styles.scoreCard, { backgroundColor: COLORS.bgSecondary, borderColor: COLORS.border }]}>
              <Text style={[styles.scoreNum, { color: COLORS.textPrimary }]}>{s.value}</Text>
              <Text style={[styles.scoreLabel, { color: COLORS.textTertiary }]}>{s.label}</Text>
            </View>
          ))}
          {streak >= 3 && (
            <View style={[styles.scoreCard, { backgroundColor: COLORS.bgSecondary, borderColor: '#F5A623' }]}>
              <Text style={[styles.scoreNum, { color: COLORS.textPrimary }]}>🔥{streak}</Text>
              <Text style={[styles.scoreLabel, { color: COLORS.textTertiary }]}>Streak</Text>
            </View>
          )}
        </View>

        <Animated.View style={[styles.flagBox, {
          backgroundColor: COLORS.bgSecondary, borderColor: COLORS.border,
          transform: [{ translateX: shakeAnim }],
        }]}>
          <Text style={styles.flagEmoji}>{q.correct.flag}</Text>
          <Text style={[styles.flagQuestion, { color: COLORS.textSecondary }]}>Which country is this?</Text>
        </Animated.View>

        <View style={styles.options}>
          {q.options.map(opt => {
            let bg = COLORS.bgSecondary;
            let bc = COLORS.border;
            let textColor = COLORS.textPrimary;
            if (chosen) {
              if (opt.answer === q.correct.answer) {
                bg = COLORS.successLight; bc = COLORS.success; textColor = COLORS.success;
              } else if (opt.answer === chosen) {
                bg = COLORS.dangerLight; bc = COLORS.danger; textColor = COLORS.danger;
              }
            }
            return (
              <TouchableOpacity key={opt.answer}
                style={[styles.option, { backgroundColor: bg, borderColor: bc }]}
                onPress={() => answer(opt)} disabled={!!chosen} activeOpacity={0.7}>
                <Text style={[styles.optionText, { color: textColor }]}>{opt.answer}</Text>
                {chosen && opt.answer === q.correct.answer && <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.success }}>✓</Text>}
                {chosen && opt.answer === chosen && opt.answer !== q.correct.answer && <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.danger }}>✕</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen:     { flex: 1 },
  topbar:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, gap: 12 },
  backBtn:    { paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.md, borderWidth: 0.5 },
  backText:   { fontSize: 13 },
  title:      { flex: 1, fontSize: 16, fontWeight: '500' },
  content:    { flex: 1, padding: 20, gap: 16 },
  scoreRow:   { flexDirection: 'row', gap: 10 },
  scoreCard:  { flex: 1, padding: 12, borderRadius: RADIUS.lg, borderWidth: 0.5, alignItems: 'center' },
  scoreNum:   { fontSize: 20, fontWeight: '600' },
  scoreLabel: { fontSize: 11 },
  flagBox:    { alignItems: 'center', gap: 12, padding: 24, borderRadius: RADIUS.xl, borderWidth: 0.5 },
  flagEmoji:  { fontSize: 80 },
  flagQuestion: { fontSize: 15 },
  options:    { gap: 10 },
  option:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: RADIUS.lg, borderWidth: 1.5 },
  optionText: { fontSize: 15, fontWeight: '500' },
});
