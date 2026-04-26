import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

// react-native-google-mobile-ads requires a native build
// It won't work in Expo Go — only in production builds
// This component shows a placeholder in development

let BannerAd, BannerAdSize, TestIds;
try {
  const admob = require('react-native-google-mobile-ads');
  BannerAd = admob.BannerAd;
  BannerAdSize = admob.BannerAdSize;
  TestIds = admob.TestIds;
} catch (e) {
  // Not available in Expo Go
}

const AD_UNIT_ID = 'ca-app-pub-8920454653234729/8642463882';

export default function AdBanner() {
  // Show placeholder in Expo Go / development
  if (!BannerAd) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Ad Banner</Text>
      </View>
    );
  }

  const adUnitId = __DEV__ ? TestIds.BANNER : AD_UNIT_ID;

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
        onAdFailedToLoad={err => console.log('AdMob error:', err)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  placeholder: {
    height: 50,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 11,
    color: '#AAAAAA',
  },
});
