// AdBanner.js
// ─────────────────────────────────────────────────────────────
// TO CONNECT REAL ADS:
// 1. Run: npx expo install expo-ads-admob
// 2. Get your AdMob App ID and Banner Ad Unit ID from admob.google.com
// 3. Replace the placeholder below with:
//
//    import { AdMobBanner } from 'expo-ads-admob';
//    <AdMobBanner
//      bannerSize="fullBanner"
//      adUnitID="ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX"
//      onDidFailToReceiveAdWithError={err => console.log(err)}
//    />
//
// 4. Add your AdMob App ID to app.json under expo.plugins:
//    ["expo-ads-admob", { "androidAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX" }]
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../data/theme';

export default function AdBanner() {
  // ← Replace this View with AdMobBanner when ready
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Ad Space — Connect AdMob to earn here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 52,
    backgroundColor: COLORS.bgSecondary,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },
});
