import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SplashAnimationScreen({ onFinish }) {
  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const scaleAnim   = useRef(new Animated.Value(0.8)).current;
  const byFadeAnim  = useRef(new Animated.Value(0)).current;
  const exitAnim    = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // Logo fades + scales in
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
      ]),
      // "by KwamKitt" fades in
      Animated.timing(byFadeAnim, { toValue: 1, duration: 500, delay: 200, useNativeDriver: true }),
      // Hold for a moment
      Animated.delay(900),
      // Everything fades out
      Animated.timing(exitAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: exitAnim }]}>
      <Animated.View style={[styles.logoWrap, {
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }]}>
        {/* L monogram */}
        <View style={styles.lWrap}>
          <View style={styles.lVertical} />
          <View style={styles.lHorizontal} />
          {/* KK dot */}
          <View style={styles.kkDot}>
            <Text style={styles.kkText}>KK</Text>
          </View>
        </View>
        <Text style={styles.appName}>Life App</Text>
        <Text style={styles.tagline}>Everything you need</Text>
      </Animated.View>

      <Animated.Text style={[styles.byLine, { opacity: byFadeAnim }]}>
        by KwamKitt
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#12237F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    gap: 16,
  },
  lWrap: {
    width: 120,
    height: 120,
    position: 'relative',
  },
  lVertical: {
    position: 'absolute',
    left: 16,
    top: 8,
    width: 22,
    height: 90,
    backgroundColor: '#E8EAFF',
    borderRadius: 4,
  },
  lHorizontal: {
    position: 'absolute',
    left: 16,
    bottom: 8,
    width: 72,
    height: 22,
    backgroundColor: '#E8EAFF',
    borderRadius: 4,
  },
  kkDot: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FF9600',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0E1020',
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  byLine: {
    position: 'absolute',
    bottom: 60,
    fontSize: 13,
    color: '#FF9600',
    letterSpacing: 1,
  },
});
