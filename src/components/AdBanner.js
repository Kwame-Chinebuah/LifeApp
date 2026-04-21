import React from 'react';
import { View, StyleSheet } from 'react-native';

// ─── AdMob Banner ─────────────────────────────────────────────
// App ID:     ca-app-pub-8920454653234729~3861757950
// Ad Unit ID: ca-app-pub-8920454653234729/8642463882
//
// TO ACTIVATE REAL ADS:
// 1. Run: npx expo install expo-ads-admob
// 2. Uncomment the import and AdMobBanner block below
// 3. Delete the placeholder View
// ─────────────────────────────────────────────────────────────

// import { AdMobBanner } from 'expo-ads-admob';

const AD_UNIT_ID = 'ca-app-pub-8920454653234729/8642463882';

export default function AdBanner() {
  return (
    <View style={styles.container}>
      {/*
      <AdMobBanner
        bannerSize="fullBanner"
        adUnitID={AD_UNIT_ID}
        servePersonalizedAds={false}
        onDidFailToReceiveAdWithError={err => console.log('AdMob error:', err)}
      />
      */}
      <View style={styles.placeholder} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 50,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  placeholder: {
    height: 50,
    width: '100%',
  },
});
