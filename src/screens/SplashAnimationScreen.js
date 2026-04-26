import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SplashAnimationScreen({ onFinish }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const exitAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.delay(1400),
      Animated.timing(exitAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: exitAnim }]}>
      <Animated.Image
        source={require('./splash.png')}
        style={[styles.image, { opacity: fadeAnim }]}
        resizeMode="cover"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#12237F',
  },
  image: {
    width,
    height,
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
