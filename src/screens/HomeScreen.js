import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Alert,
  Animated, Dimensions, TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TOOLS, CATEGORIES, ALL_TOOLS } from '../data/categories';
import { COLORS, RADIUS } from '../data/theme';
import AdBanner from '../components/AdBanner';

const SIDEBAR_WIDTH = 260;
const SCREEN_WIDTH  = Dimensions.get('window').width;
const CARD_W        = (SCREEN_WIDTH - 48) / 3;
const RECENT_KEY    = 'recent_tools';
const FAV_KEY       = 'favourites';

// ── Single tool card ──────────────────────────────────────────
function Card({ tool, onPress, onLongPress, isFav }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={500}
      activeOpacity={0.75}
    >
      {isFav && <View style={styles.favDot} />}
      <Text style={styles.cardIcon}>{tool.icon}</Text>
      <Text style={styles.cardLabel} numberOfLines={2}>{tool.label}</Text>
      <Text style={styles.cardDesc}  numberOfLines={1}>{tool.desc}</Text>
    </TouchableOpacity>
  );
}

// ── 3-column grid — always 3 per row, empty slots hold space ──
function Grid({ tools, onPress, onLongPress, favourites }) {
  const rows = [];
  for (let i = 0; i < tools.length; i += 3) {
    rows.push(tools.slice(i, i + 3));
  }
  return (
    <View style={styles.grid}>
      {rows.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map(t => (
            <Card
              key={t.id}
              tool={t}
              onPress={() => onPress(t)}
              onLongPress={() => onLongPress(t.id)}
              isFav={favourites.includes(t.id)}
            />
          ))}
          {/* empty slot placeholders */}
          {row.length < 3 && [...Array(3 - row.length)].map((_, i) => (
            <View key={`empty-${i}`} style={styles.cardEmpty} />
          ))}
        </View>
      ))}
    </View>
  );
}

// ── Category intro animation ───────────────────────────────────
function CategoryIntro({ onDone }) {
  const cats       = CATEGORIES.filter(c => !c.special);
  const fadeAnims  = useRef(cats.map(() => new Animated.Value(0))).current;
  const slideAnims = useRef(cats.map(() => new Animated.Value(60))).current;
  const exitAnims  = useRef(cats.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Step 1: stagger each category sliding up and fading in
    const fadeIn = cats.map((_, i) =>
      Animated.parallel([
        Animated.timing(fadeAnims[i],  { toValue: 1, duration: 280, delay: i * 100, useNativeDriver: true }),
        Animated.timing(slideAnims[i], { toValue: 0, duration: 280, delay: i * 100, useNativeDriver: true }),
      ])
    );
    // Step 2: all slide left together
    const slideLeft = cats.map((_, i) =>
      Animated.timing(exitAnims[i], { toValue: -SCREEN_WIDTH, duration: 350, delay: i * 30, useNativeDriver: true })
    );

    Animated.sequence([
      Animated.parallel(fadeIn),
      Animated.delay(600),
      Animated.parallel(slideLeft),
    ]).start(() => onDone());
  }, []);

  return (
    <View style={styles.introWrap}>
      <Text style={styles.introTitle}>Life App</Text>
      <Text style={styles.introSub}>Everything you need</Text>
      <View style={styles.introList}>
        {cats.map((cat, i) => (
          <Animated.View
            key={cat.id}
            style={[
              styles.introItem,
              {
                opacity:   fadeAnims[i],
                transform: [
                  { translateY: slideAnims[i] },
                  { translateX: exitAnims[i] },
                ],
              },
            ]}
          >
            <Text style={styles.introItemIcon}>{cat.icon}</Text>
            <Text style={styles.introItemLabel}>{cat.label}</Text>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

// ── Main component ─────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const [showIntro,      setShowIntro]      = useState(true);
  const [activeCategory, setActiveCategory] = useState(null); // null = home view
  const [sidebarOpen,    setSidebarOpen]    = useState(false);
  const [favourites,     setFavourites]     = useState([]);
  const [recentIds,      setRecentIds]      = useState([]);
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  useEffect(() => {
    async function load() {
      try {
        const r = await AsyncStorage.getItem(RECENT_KEY);
        const f = await AsyncStorage.getItem(FAV_KEY);
        if (r) setRecentIds(JSON.parse(r));
        if (f) setFavourites(JSON.parse(f));
      } catch {}
    }
    load();
  }, []);

  async function trackRecent(toolId) {
    const next = [toolId, ...recentIds.filter(id => id !== toolId)].slice(0, 10);
    setRecentIds(next);
    try { await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch {}
  }

  async function toggleFavourite(toolId) {
    const tool   = ALL_TOOLS.find(t => t.id === toolId);
    const isFav  = favourites.includes(toolId);
    const next   = isFav ? favourites.filter(id => id !== toolId) : [...favourites, toolId];
    setFavourites(next);
    try { await AsyncStorage.setItem(FAV_KEY, JSON.stringify(next)); } catch {}
    Alert.alert(
      isFav ? 'Removed from Favourites' : '⭐ Added to Favourites',
      isFav ? `${tool?.label} removed` : `${tool?.label} added to favourites`,
      [{ text: 'OK' }]
    );
  }

  function openSidebar() {
    setSidebarOpen(true);
    Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
  }

  function closeSidebar() {
    Animated.timing(slideAnim, { toValue: -SIDEBAR_WIDTH, duration: 250, useNativeDriver: true })
      .start(() => setSidebarOpen(false));
  }

  function selectCategory(id) {
    setActiveCategory(id === 'home' ? null : id);
    closeSidebar();
  }

  function handleToolPress(tool) {
    trackRecent(tool.id);
    switch (tool.id) {
      case 'Calculator':          navigation.navigate('Calculator'); break;
      case 'UnitConverter':       navigation.navigate('UnitConverter'); break;
      case 'DiscountCalc':        navigation.navigate('DiscountCalc'); break;
      case 'AgeCalculator':       navigation.navigate('AgeCalculator'); break;
      case 'Stopwatch':           navigation.navigate('Stopwatch'); break;
      case 'TipCalculator':       navigation.navigate('TipCalculator'); break;
      case 'RandomPicker':        navigation.navigate('RandomPicker'); break;
      case 'Checklist':           navigation.navigate('Checklist'); break;
      case 'ShoppingList':        navigation.navigate('ShoppingList'); break;
      case 'MealPlanner':         navigation.navigate('MealPlanner'); break;
      case 'BMI':                 navigation.navigate('BMI'); break;
      case 'WaterIntake':         navigation.navigate('WaterIntake'); break;
      case 'WeightTracker':       navigation.navigate('WeightTracker'); break;
      case 'Meditation':          navigation.navigate('Meditation'); break;
      case 'Breathing':           navigation.navigate('Breathing'); break;
      case 'MedicationReminder':  navigation.navigate('MedicationReminder'); break;
      case 'PeriodTracker':       navigation.navigate('PeriodTracker'); break;
      case 'PasswordManager':     navigation.navigate('PasswordManager'); break;
      case 'QRGenerator':         navigation.navigate('QRGenerator'); break;
      case 'Ruler':               navigation.navigate('Ruler'); break;
      case 'FuelCost':            navigation.navigate('FuelCost'); break;
      case 'TimeZones':           navigation.navigate('TimeZones'); break;
      case 'Globe':               navigation.navigate('Globe'); break;
      case 'SolarSystem':         navigation.navigate('SolarSystem'); break;
      case 'DiceRoller':          navigation.navigate('DiceRoller'); break;
      case 'CoinFlip':            navigation.navigate('CoinFlip'); break;
      case 'FlagQuiz':            navigation.navigate('FlagQuiz'); break;
      case 'WordScramble':        navigation.navigate('WordScramble'); break;
      case 'TrueOrFalse':         navigation.navigate('TrueOrFalse'); break;
      case 'QuickMaths':          navigation.navigate('QuickMaths'); break;
      default: Alert.alert('Coming Soon', `${tool.label} is coming soon!`);
    }
  }

  // ── Data ────────────────────────────────────────────────────
  const recents  = ALL_TOOLS.filter(t => recentIds.includes(t.id))
    .sort((a, b) => recentIds.indexOf(a.id) - recentIds.indexOf(b.id))
    .slice(0, 3);

  const favTools = ALL_TOOLS.filter(t => favourites.includes(t.id));

  const cat      = activeCategory === 'favourites'
    ? { label: 'Favourites', icon: '⭐' }
    : CATEGORIES.find(c => c.id === activeCategory);

  const catTools = activeCategory === 'favourites'
    ? favTools
    : TOOLS[activeCategory] || [];

  // ── Heading label ────────────────────────────────────────────
  const headingLabel = activeCategory
    ? cat?.label
    : 'Life App';

  // ── Show intro animation first ───────────────────────────────
  if (showIntro) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.topbar}>
          <Text style={styles.topbarBrand}>Life App</Text>
        </View>
        <CategoryIntro onDone={() => setShowIntro(false)} />
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.screen}>
        {/* Top bar */}
        <View style={styles.topbar}>
          <TouchableOpacity style={styles.menuBtn} onPress={openSidebar}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.topbarTitle}>{headingLabel}</Text>
          {activeCategory && (
            <TouchableOpacity style={styles.homeBtn} onPress={() => setActiveCategory(null)}>
              <Text style={styles.homeBtnText}>🏠</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Ad banner */}
        <AdBanner />

        {/* Content */}
        {!activeCategory ? (
          // ── Home view: recently used + favourites ────────────
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {recents.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recently Used</Text>
                <Grid
                  tools={recents}
                  onPress={handleToolPress}
                  onLongPress={toggleFavourite}
                  favourites={favourites}
                />
              </View>
            )}

            {favTools.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⭐ Favourites</Text>
                <Grid
                  tools={favTools}
                  onPress={handleToolPress}
                  onLongPress={toggleFavourite}
                  favourites={favourites}
                />
              </View>
            )}

            {recents.length === 0 && favTools.length === 0 && (
              <View style={styles.emptyHome}>
                <Text style={styles.emptyIcon}>👆</Text>
                <Text style={styles.emptyTitle}>Welcome to Life App</Text>
                <Text style={styles.emptyDesc}>Open a tool to get started{'\n'}Press & hold to favourite</Text>
              </View>
            )}
            <View style={{ height: 24 }} />
          </ScrollView>
        ) : activeCategory === 'favourites' && favTools.length === 0 ? (
          // ── Empty favourites ─────────────────────────────────
          <View style={styles.emptyHome}>
            <Text style={styles.emptyIcon}>⭐</Text>
            <Text style={styles.emptyTitle}>No favourites yet</Text>
            <Text style={styles.emptyDesc}>Press & hold any tool to add it here</Text>
          </View>
        ) : (
          // ── Category tools grid ──────────────────────────────
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Grid
              tools={catTools}
              onPress={handleToolPress}
              onLongPress={toggleFavourite}
              favourites={favourites}
            />
            <View style={{ height: 24 }} />
          </ScrollView>
        )}
      </SafeAreaView>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <TouchableWithoutFeedback onPress={closeSidebar}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}

      {/* Sidebar */}
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.sidebarHeader}>
            <Text style={styles.logo}>Life App</Text>
            <Text style={styles.tagline}>Everything you need</Text>
          </View>

          <ScrollView style={styles.sidebarList} showsVerticalScrollIndicator={false}>
            {/* Home */}
            <TouchableOpacity
              style={[styles.sidebarItem, !activeCategory && styles.sidebarItemActive]}
              onPress={() => selectCategory('home')}
            >
              <Text style={styles.sidebarIcon}>🏠</Text>
              <Text style={[styles.sidebarLabel, !activeCategory && styles.sidebarLabelActive]}>Home</Text>
            </TouchableOpacity>

            {/* Favourites */}
            <TouchableOpacity
              style={[styles.sidebarItem, activeCategory === 'favourites' && styles.sidebarItemActive]}
              onPress={() => selectCategory('favourites')}
            >
              <Text style={styles.sidebarIcon}>⭐</Text>
              <Text style={[styles.sidebarLabel, activeCategory === 'favourites' && styles.sidebarLabelActive]}>
                Favourites
              </Text>
              {favourites.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{favourites.length}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Other categories */}
            {CATEGORIES.filter(c => !c.special).map(c => (
              <TouchableOpacity
                key={c.id}
                style={[styles.sidebarItem, activeCategory === c.id && styles.sidebarItemActive]}
                onPress={() => selectCategory(c.id)}
              >
                <Text style={styles.sidebarIcon}>{c.icon}</Text>
                <Text style={[styles.sidebarLabel, activeCategory === c.id && styles.sidebarLabelActive]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.sidebarBottom}>
            <TouchableOpacity style={styles.proBtn}
              onPress={() => { closeSidebar(); navigation.navigate('Pro'); }}>
              <Text style={styles.proIcon}>⭐</Text>
              <Text style={styles.proLabel}>Upgrade to Pro</Text>
              <Text style={styles.proPrice}>£1/mo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsBtn}
              onPress={() => { closeSidebar(); navigation.navigate('Settings'); }}>
              <Text style={styles.settingsIcon}>⚙️</Text>
              <Text style={styles.settingsLabel}>Settings</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: COLORS.bg },
  topbar:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: COLORS.border, gap: 12 },
  topbarBrand:  { flex: 1, fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center' },
  topbarTitle:  { flex: 1, fontSize: 16, fontWeight: '500', color: COLORS.textPrimary },
  menuBtn:      { width: 34, height: 34, borderRadius: RADIUS.md, borderWidth: 0.5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  menuIcon:     { fontSize: 15, color: COLORS.textSecondary },
  homeBtn:      { padding: 4 },
  homeBtnText:  { fontSize: 20 },

  // Intro animation
  introWrap:      { flex: 1, paddingHorizontal: 24, paddingTop: 20, gap: 8 },
  introTitle:     { fontSize: 28, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  introSub:       { fontSize: 14, color: COLORS.textTertiary, marginBottom: 20 },
  introList:      { gap: 8 },
  introItem:      { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.lg, borderWidth: 0.5, borderColor: COLORS.border },
  introItemIcon:  { fontSize: 22 },
  introItemLabel: { fontSize: 15, fontWeight: '500', color: COLORS.textPrimary },

  // Grid
  scrollContent: { paddingHorizontal: 12, paddingTop: 14 },
  section:       { marginBottom: 20 },
  sectionTitle:  { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 },
  grid:          { gap: 10 },
  row:           { flexDirection: 'row', gap: 10, marginBottom: 0 },
  card: {
    width: CARD_W, height: CARD_W,
    backgroundColor: COLORS.bg,
    borderWidth: 0.5, borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 10,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  cardEmpty:    { width: CARD_W, height: CARD_W },
  favDot:       { position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#F5A623' },
  cardIcon:     { fontSize: 22, marginBottom: 4 },
  cardLabel:    { fontSize: 11, fontWeight: '500', color: COLORS.textPrimary, lineHeight: 14 },
  cardDesc:     { fontSize: 9, color: COLORS.textTertiary, marginTop: 1 },

  // Empty states
  emptyHome:  { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 40 },
  emptyIcon:  { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary },
  emptyDesc:  { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },

  // Sidebar
  overlay: { position: 'absolute', top: 0, left: 0, width: SCREEN_WIDTH, height: '100%', backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 10 },
  sidebar: { position: 'absolute', top: 0, left: 0, width: SIDEBAR_WIDTH, height: '100%', backgroundColor: COLORS.bgSecondary, borderRightWidth: 0.5, borderRightColor: COLORS.border, zIndex: 20 },
  sidebarHeader: { padding: 20, paddingTop: 24, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  logo:          { fontSize: 20, fontWeight: '600', color: COLORS.textPrimary },
  tagline:       { fontSize: 11, color: COLORS.textTertiary, marginTop: 2 },
  sidebarList:   { flex: 1, paddingHorizontal: 8, paddingTop: 10 },
  sidebarItem:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, paddingHorizontal: 10, borderRadius: RADIUS.md, marginBottom: 2, gap: 10 },
  sidebarItemActive: { backgroundColor: COLORS.bg },
  sidebarIcon:   { fontSize: 16, width: 22, textAlign: 'center' },
  sidebarLabel:  { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  sidebarLabelActive: { fontWeight: '500', color: COLORS.textPrimary },
  badge:         { backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 },
  badgeText:     { fontSize: 10, color: '#fff', fontWeight: '600' },
  sidebarBottom: { padding: 12, borderTopWidth: 0.5, borderTopColor: COLORS.border, gap: 6 },
  proBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 10, borderRadius: RADIUS.md, backgroundColor: COLORS.accentLight, marginBottom: 2 },
  proIcon: { fontSize: 16 },
  proLabel: { flex: 1, fontSize: 13, color: COLORS.accentText, fontWeight: '600' },
  proPrice: { fontSize: 12, color: COLORS.accentText, opacity: 0.8 },
  settingsBtn:   { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 10, borderRadius: RADIUS.md },
  settingsIcon:  { fontSize: 18 },
  settingsLabel: { fontSize: 14, color: COLORS.textSecondary },
});
