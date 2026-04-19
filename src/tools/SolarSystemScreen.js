import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '../data/theme';
import AdBanner from '../components/AdBanner';

const PLANETS = [
  { name: 'Sun',     emoji: '☀️', color: '#FDB813', size: 60, fact: 'The Sun contains 99.86% of the Solar System\'s mass.', distance: '0 km', moons: 0, type: 'Star' },
  { name: 'Mercury', emoji: '🪨', color: '#9E9E9E', size: 18, fact: 'Mercury has no atmosphere and extreme temperatures.', distance: '57.9M km', moons: 0, type: 'Rocky' },
  { name: 'Venus',   emoji: '🌕', color: '#E8C84A', size: 24, fact: 'Venus is the hottest planet at 465°C average.', distance: '108.2M km', moons: 0, type: 'Rocky' },
  { name: 'Earth',   emoji: '🌍', color: '#4A90D9', size: 26, fact: 'Earth is the only known planet with life.', distance: '149.6M km', moons: 1, type: 'Rocky' },
  { name: 'Mars',    emoji: '🔴', color: '#C1440E', size: 22, fact: 'Mars has the largest volcano in the Solar System.', distance: '227.9M km', moons: 2, type: 'Rocky' },
  { name: 'Jupiter', emoji: '🟤', color: '#C88B3A', size: 52, fact: 'Jupiter is so big it could fit all other planets inside.', distance: '778.5M km', moons: 95, type: 'Gas Giant' },
  { name: 'Saturn',  emoji: '🪐', color: '#E4D191', size: 46, fact: 'Saturn\'s rings are made of ice and rock.', distance: '1.43B km', moons: 146, type: 'Gas Giant' },
  { name: 'Uranus',  emoji: '🔵', color: '#7DE8E8', size: 36, fact: 'Uranus rotates on its side.', distance: '2.87B km', moons: 28, type: 'Ice Giant' },
  { name: 'Neptune', emoji: '💙', color: '#4B70DD', size: 34, fact: 'Neptune has winds of up to 2,100 km/h.', distance: '4.50B km', moons: 16, type: 'Ice Giant' },
];

export default function SolarSystemScreen({ navigation }) {
  const [selected, setSelected] = useState(null);
  const spinAnims = useRef(PLANETS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    PLANETS.forEach((p, i) => {
      if (i === 0) return;
      const duration = 3000 + i * 2000;
      Animated.loop(
        Animated.timing(spinAnims[i], { toValue: 1, duration, useNativeDriver: true })
      ).start();
    });
  }, []);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Solar System</Text>
      </View>
      <AdBanner />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Visual solar system */}
        <View style={styles.solarWrap}>
          <Text style={styles.solarLabel}>Tap a planet to learn more</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.solarRow}>
            {PLANETS.map((p, i) => (
              <TouchableOpacity key={p.name} style={styles.planetWrap}
                onPress={() => setSelected(p)} activeOpacity={0.8}>
                <View style={[styles.planetCircle, {
                  width: p.size, height: p.size, borderRadius: p.size/2,
                  backgroundColor: p.color,
                  borderColor: selected?.name === p.name ? '#fff' : 'transparent',
                  borderWidth: selected?.name === p.name ? 2 : 0,
                }]} />
                <Text style={styles.planetName}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Selected planet info */}
        {selected && (
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <View style={[styles.infoPlanet, { width: 56, height: 56, borderRadius: 28, backgroundColor: selected.color }]} />
              <View>
                <Text style={styles.infoName}>{selected.name}</Text>
                <Text style={styles.infoType}>{selected.type}</Text>
              </View>
            </View>
            <Text style={styles.infoFact}>{selected.fact}</Text>
            <View style={styles.infoStats}>
              {[
                { label: 'Distance from Sun', value: selected.distance },
                { label: 'Moons',             value: String(selected.moons) },
                { label: 'Type',              value: selected.type },
              ].map(s => (
                <View key={s.label} style={styles.infoStat}>
                  <Text style={styles.infoStatLabel}>{s.label}</Text>
                  <Text style={styles.infoStatValue}>{s.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Planet list */}
        <Text style={styles.listTitle}>All Planets</Text>
        {PLANETS.map(p => (
          <TouchableOpacity key={p.name} style={[styles.listItem, selected?.name===p.name && styles.listItemActive]}
            onPress={() => setSelected(p)}>
            <View style={[styles.listDot, { backgroundColor: p.color, width: p.size*0.5, height: p.size*0.5, borderRadius: p.size*0.25 }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.listName}>{p.name}</Text>
              <Text style={styles.listType}>{p.type} · {p.distance}</Text>
            </View>
            {p.moons > 0 && <Text style={styles.listMoons}>🌙 {p.moons}</Text>}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0A0A1A' },
  topbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.1)', gap: 12 },
  backBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.md, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.2)' },
  backText: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  title: { fontSize: 16, fontWeight: '500', color: '#fff' },
  content: { padding: 16, gap: 16 },
  solarWrap: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: RADIUS.xl, padding: 16 },
  solarLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: 12 },
  solarRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 10 },
  planetWrap: { alignItems: 'center', gap: 6 },
  planetCircle: { shadowColor: '#fff', shadowOpacity: 0.2, shadowRadius: 8 },
  planetName: { fontSize: 10, color: 'rgba(255,255,255,0.6)', textAlign: 'center' },
  infoCard: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: RADIUS.xl, padding: 16, gap: 12 },
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  infoPlanet: {},
  infoName: { fontSize: 22, fontWeight: '600', color: '#fff' },
  infoType: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  infoFact: { fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 20 },
  infoStats: { gap: 8 },
  infoStat: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.1)' },
  infoStatLabel: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  infoStatValue: { fontSize: 13, fontWeight: '500', color: '#fff' },
  listTitle: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5 },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: RADIUS.lg, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.08)' },
  listItemActive: { borderColor: 'rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.1)' },
  listDot: {},
  listName: { fontSize: 15, fontWeight: '500', color: '#fff' },
  listType: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  listMoons: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
});
