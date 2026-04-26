import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '../data/theme';
import { useTheme } from '../data/ThemeContext';
import AdBanner from '../components/AdBanner';

// 3D coin using layered views to simulate depth
function Coin3D({ side, flipping }) {
  const isHeads = side === 'HEADS';
  const size = 180;
  const depth = 12;

  const faceColor  = isHeads ? '#F5C842' : '#C0C0C0';
  const edgeColor  = isHeads ? '#B8960C' : '#909090';
  const textColor  = isHeads ? '#7A5C00' : '#444444';

  if (flipping) {
    return (
      <View style={{ width: size, height: size + depth, alignItems: 'center' }}>
        {/* Edge layers */}
        {[...Array(depth)].map((_, i) => (
          <View key={i} style={{
            position: 'absolute',
            top: depth - i,
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: '#AAAAAA',
          }} />
        ))}
        <View style={[styles.coinFace, {
          width: size, height: size, borderRadius: size / 2,
          backgroundColor: '#DDDDDD', borderColor: '#BBBBBB',
        }]}>
          <Text style={{ fontSize: 50 }}>🔄</Text>
          <Text style={[styles.coinSideText, { color: '#888' }]}>...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ width: size, height: size + depth, alignItems: 'center' }}>
      {/* Stacked edge layers for 3D depth */}
      {[...Array(depth)].map((_, i) => (
        <View key={i} style={{
          position: 'absolute',
          top: depth - i,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: edgeColor,
        }} />
      ))}
      {/* Main face */}
      <View style={[styles.coinFace, {
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: faceColor, borderColor: edgeColor,
      }]}>
        <Text style={styles.coinEmoji}>{isHeads ? '👑' : '🦅'}</Text>
        <Text style={[styles.coinSideText, { color: textColor }]}>{side}</Text>
      </View>
    </View>
  );
}

export default function CoinFlipScreen({ navigation }) {
  const { COLORS: dynCOLORS } = useTheme();
  const [result, setResult]     = useState(null);
  const [flipping, setFlipping] = useState(false);
  const [heads, setHeads]       = useState(0);
  const [tails, setTails]       = useState(0);
  const [streak, setStreak]     = useState({ side: null, count: 0 });

  const bounceAnim = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  function flip() {
    if (flipping) return;
    setFlipping(true);

    // Bounce up and down animation
    Animated.sequence([
      Animated.timing(translateY, { toValue: -40, duration: 150, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0,   duration: 150, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -25, duration: 120, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0,   duration: 120, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -10, duration: 90,  useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0,   duration: 90,  useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      const final = Math.random() > 0.5 ? 'HEADS' : 'TAILS';
      setResult(final);
      setFlipping(false);
      if (final === 'HEADS') setHeads(h => h + 1);
      else setTails(t => t + 1);
      setStreak(prev => {
        if (prev.side === final) return { side: final, count: prev.count + 1 };
        return { side: final, count: 1 };
      });
    }, 800);
  }

  function reset() {
    setResult(null);
    setHeads(0);
    setTails(0);
    setStreak({ side: null, count: 0 });
  }

  const total = heads + tails;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: dynCOLORS.bg }]}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Coin Flip</Text>
        <TouchableOpacity onPress={reset}>
          <Text style={styles.resetBtn}>Reset</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* 3D Coin */}
        <TouchableOpacity onPress={flip} disabled={flipping} activeOpacity={0.9}>
          <Animated.View style={{ transform: [{ translateY }] }}>
            <Coin3D side={result || 'HEADS'} flipping={flipping} />
          </Animated.View>
        </TouchableOpacity>

        {!result && !flipping && (
          <Text style={styles.tapHint}>Tap the coin or press Flip</Text>
        )}

        {result && !flipping && (
          <Text style={styles.resultText}>{result}!</Text>
        )}

        {/* Flip button */}
        <TouchableOpacity
          style={[styles.flipBtn, flipping && styles.flipBtnDisabled]}
          onPress={flip} disabled={flipping} activeOpacity={0.8}>
          <Text style={styles.flipBtnText}>{flipping ? '🪙  Flipping...' : '🪙  Flip'}</Text>
        </TouchableOpacity>

        {/* Stats */}
        {total > 0 && (
          <View style={styles.stats}>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>👑</Text>
              <Text style={styles.statNum}>{heads}</Text>
              <Text style={styles.statLabel}>Heads</Text>
              {total > 0 && <Text style={styles.statPct}>{Math.round((heads/total)*100)}%</Text>}
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>🦅</Text>
              <Text style={styles.statNum}>{tails}</Text>
              <Text style={styles.statLabel}>Tails</Text>
              {total > 0 && <Text style={styles.statPct}>{Math.round((tails/total)*100)}%</Text>}
            </View>
          </View>
        )}

        {streak.count >= 3 && (
          <Text style={styles.streakText}>
            🔥 {streak.count} {streak.side} in a row!
          </Text>
        )}

        {total > 0 && (
          <Text style={styles.totalText}>{total} total flip{total !== 1 ? 's' : ''}</Text>
        )}
      </View>

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
  resetBtn: { fontSize: 13, color: COLORS.danger },
  content: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 20, gap: 20,
  },
  coinFace: {
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, gap: 6,
  },
  coinEmoji: { fontSize: 56 },
  coinSideText: { fontSize: 16, fontWeight: '700', letterSpacing: 2 },
  tapHint: { fontSize: 14, color: COLORS.textTertiary },
  resultText: { fontSize: 28, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: 3 },
  flipBtn: {
    backgroundColor: COLORS.accent, borderRadius: RADIUS.lg,
    paddingHorizontal: 40, paddingVertical: 16,
  },
  flipBtnDisabled: { backgroundColor: COLORS.bgTertiary },
  flipBtnText: { fontSize: 18, fontWeight: '600', color: '#fff' },
  stats: {
    flexDirection: 'row', backgroundColor: COLORS.bgSecondary,
    borderRadius: RADIUS.xl, padding: 20, width: '100%',
    alignItems: 'center', borderWidth: 0.5, borderColor: COLORS.border,
  },
  statCard: { flex: 1, alignItems: 'center', gap: 3 },
  statEmoji: { fontSize: 24 },
  statNum: { fontSize: 32, fontWeight: '300', color: COLORS.textPrimary },
  statLabel: { fontSize: 12, color: COLORS.textSecondary },
  statPct: { fontSize: 11, color: COLORS.textTertiary },
  statDivider: { width: 1, height: 60, backgroundColor: COLORS.border },
  streakText: { fontSize: 15, fontWeight: '600', color: COLORS.danger },
  totalText: { fontSize: 13, color: COLORS.textTertiary },
});
