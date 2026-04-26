import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '../data/theme';
import { useTheme } from '../data/ThemeContext';
import AdBanner from '../components/AdBanner';

const ZONES = [
  { city: 'London',        tz: 'Europe/London',        flag: '🇬🇧' },
  { city: 'New York',      tz: 'America/New_York',     flag: '🇺🇸' },
  { city: 'Los Angeles',   tz: 'America/Los_Angeles',  flag: '🇺🇸' },
  { city: 'Toronto',       tz: 'America/Toronto',      flag: '🇨🇦' },
  { city: 'Paris',         tz: 'Europe/Paris',         flag: '🇫🇷' },
  { city: 'Dubai',         tz: 'Asia/Dubai',           flag: '🇦🇪' },
  { city: 'Mumbai',        tz: 'Asia/Kolkata',         flag: '🇮🇳' },
  { city: 'Singapore',     tz: 'Asia/Singapore',       flag: '🇸🇬' },
  { city: 'Tokyo',         tz: 'Asia/Tokyo',           flag: '🇯🇵' },
  { city: 'Sydney',        tz: 'Australia/Sydney',     flag: '🇦🇺' },
  { city: 'Lagos',         tz: 'Africa/Lagos',         flag: '🇳🇬' },
  { city: 'Accra',         tz: 'Africa/Accra',         flag: '🇬🇭' },
  { city: 'Johannesburg',  tz: 'Africa/Johannesburg',  flag: '🇿🇦' },
  { city: 'Nairobi',       tz: 'Africa/Nairobi',       flag: '🇰🇪' },
];

function getTime(tz) {
  return new Date().toLocaleTimeString('en-GB', {
    timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function getDate(tz) {
  return new Date().toLocaleDateString('en-GB', {
    timeZone: tz, weekday: 'short', day: 'numeric', month: 'short',
  });
}

function isNight(tz) {
  const h = parseInt(new Date().toLocaleTimeString('en-GB', { timeZone: tz, hour: '2-digit', hour12: false }));
  return h >= 22 || h < 6;
}

export default function TimeZonesScreen({ navigation }) {
  const { COLORS: dynCOLORS } = useTheme();
  const [times, setTimes] = useState({});
  const [pinned, setPinned] = useState(['Europe/London', 'America/New_York', 'Asia/Dubai']);

  useEffect(() => {
    function update() {
      const t = {};
      ZONES.forEach(z => { t[z.tz] = getTime(z.tz); });
      setTimes(t);
    }
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  function togglePin(tz) {
    setPinned(prev => prev.includes(tz) ? prev.filter(t => t !== tz) : [...prev, tz]);
  }

  const sorted = [...ZONES].sort((a, b) => {
    const ap = pinned.includes(a.tz);
    const bp = pinned.includes(b.tz);
    if (ap && !bp) return -1;
    if (!ap && bp) return 1;
    return 0;
  });

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: dynCOLORS.bg }]}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>World Clock</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {sorted.map(z => {
          const isPinned = pinned.includes(z.tz);
          const night = isNight(z.tz);
          return (
            <TouchableOpacity key={z.tz}
              style={[styles.card, isPinned && styles.cardPinned, night && styles.cardNight]}
              onPress={() => togglePin(z.tz)} activeOpacity={0.7}>
              <Text style={styles.flag}>{z.flag}</Text>
              <View style={styles.cardInfo}>
                <Text style={styles.city}>{z.city}</Text>
                <Text style={styles.date}>{getDate(z.tz)}</Text>
              </View>
              <View style={styles.timeWrap}>
                <Text style={[styles.time, night && styles.timeNight]}>
                  {times[z.tz] || '...'}
                </Text>
                <Text style={styles.nightLabel}>{night ? '🌙' : '☀️'}</Text>
              </View>
              {isPinned && <Text style={styles.pinIcon}>📌</Text>}
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 20 }} />
      </ScrollView>

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
  title: { fontSize: 16, fontWeight: '500', color: COLORS.textPrimary },
  list: { padding: 12, gap: 8 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, backgroundColor: COLORS.bgSecondary,
    borderRadius: RADIUS.lg, borderWidth: 0.5, borderColor: COLORS.border,
  },
  cardPinned: { borderColor: COLORS.accent, backgroundColor: COLORS.accentLight },
  cardNight: { backgroundColor: '#1A1A2E', borderColor: '#2A2A4E' },
  flag: { fontSize: 28 },
  cardInfo: { flex: 1 },
  city: { fontSize: 15, fontWeight: '500', color: COLORS.textPrimary },
  date: { fontSize: 11, color: COLORS.textTertiary, marginTop: 2 },
  timeWrap: { alignItems: 'flex-end', gap: 2 },
  time: { fontSize: 18, fontWeight: '300', color: COLORS.textPrimary, fontVariant: ['tabular-nums'] },
  timeNight: { color: '#A0A0D0' },
  nightLabel: { fontSize: 12 },
  pinIcon: { fontSize: 14 },
});
