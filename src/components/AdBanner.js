import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// Your real Ad Unit ID
const AD_UNIT_ID = 'ca-app-pub-8920454653234729/8642463882';

// Use test ID during development, real ID in production
const adUnitId = __DEV__ ? TestIds.BANNER : AD_UNIT_ID;

export default function AdBanner() {
  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={() => console.log('Ad loaded')}
        onAdFailedToLoad={error => console.log('Ad failed:', error)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
  },
});