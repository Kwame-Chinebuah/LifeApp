import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../data/theme';

// AD BANNER — positioned at TOP just under the heading
// Replace this View with AdMobBanner when ready:
// import { AdMobBanner } from 'expo-ads-admob';
// <AdMobBanner bannerSize="fullBanner" adUnitID="ca-app-pub-XXXX/XXXX" />

export default function AdBanner() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>📢 Ad — Connect AdMob to earn here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    backgroundColor: COLORS.bgSecondary,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },
});
