import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, FlatList, Alert,
  Animated, Dimensions, TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TOOLS, CATEGORIES, ALL_TOOLS } from '../data/categories';
import { COLORS, RADIUS } from '../data/theme';
import ToolCard from '../components/ToolCard';
import AdBanner from '../components/AdBanner';

const SIDEBAR_WIDTH = 260;
const SCREEN_WIDTH = Dimensions.get('window').width;

export default function HomeScreen({ navigation }) {
  const [activeCategory, setActiveCategory] = useState('essentials');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [favourites, setFavourites] = useState([]);
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  const cat = CATEGORIES.find(c => c.id === activeCategory);

  function getTools() {
    if (activeCategory === 'favourites') {
      return ALL_TOOLS.filter(t => favourites.includes(t.id));
    }
    return TOOLS[activeCategory] || [];
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
    setActiveCategory(id);
    closeSidebar();
  }

  function toggleFavourite(toolId) {
    setFavourites(prev =>
      prev.includes(toolId) ? prev.filter(id => id !== toolId) : [...prev, toolId]
    );
  }

  function handleToolPress(tool) {
    switch (tool.id) {
      case 'Calculator':         navigation.navigate('Calculator'); break;
      case 'UnitConverter':      navigation.navigate('UnitConverter'); break;
      case 'DiscountCalc':       navigation.navigate('DiscountCalc'); break;
      case 'AgeCalculator':      navigation.navigate('AgeCalculator'); break;
      case 'Stopwatch':          navigation.navigate('Stopwatch'); break;
      case 'TipCalculator':      navigation.navigate('TipCalculator'); break;
      case 'RandomPicker':       navigation.navigate('RandomPicker'); break;
      case 'Checklist':          navigation.navigate('Checklist'); break;
      case 'BMI':                navigation.navigate('BMI'); break;
      case 'WaterIntake':        navigation.navigate('WaterIntake'); break;
      case 'PasswordManager':    navigation.navigate('PasswordManager'); break;
      case 'QRGenerator':        navigation.navigate('QRGenerator'); break;
      case 'Ruler':              navigation.navigate('Ruler'); break;
      case 'FuelCost':           navigation.navigate('FuelCost'); break;
      case 'TimeZones':          navigation.navigate('TimeZones'); break;
      case 'DiceRoller':         navigation.navigate('DiceRoller'); break;
      case 'CoinFlip':           navigation.navigate('CoinFlip'); break;
      case 'Globe':              navigation.navigate('Globe'); break;
      default: Alert.alert('Coming Soon', `${tool.label} is coming in the next update!`);
    }
  }

  const tools = getTools();

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.screen}>
        <View style={styles.topbar}>
          <TouchableOpacity style={styles.menuBtn} onPress={openSidebar}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{cat?.label}</Text>
        </View>

        {tools.length === 0 && activeCategory === 'favourites' ? (
          <View style={styles.emptyFav}>
            <Text style={styles.emptyIcon}>⭐</Text>
            <Text style={styles.emptyTitle}>No favourites yet</Text>
            <Text style={styles.emptyDesc}>Tap the ♡ on any tool to add it here</Text>
          </View>
        ) : (
          <FlatList
            data={tools}
            keyExtractor={(t) => t.id}
            numColumns={3}
            contentContainerStyle={styles.grid}
            columnWrapperStyle={styles.row}
            renderItem={({ item }) => (
              <View style={styles.cardWrapper}>
                <ToolCard
                  tool={item}
                  onPress={() => handleToolPress(item)}
                  onFavourite={() => toggleFavourite(item.id)}
                  isFavourite={favourites.includes(item.id)}
                />
              </View>
            )}
            ListFooterComponent={<View style={{ height: 20 }} />}
          />
        )}
        <AdBanner />
      </SafeAreaView>

      {sidebarOpen && (
        <TouchableWithoutFeedback onPress={closeSidebar}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}

      <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.sidebarHeader}>
            <Text style={styles.logo}>Life App</Text>
            <Text style={styles.tagline}>Everything you need</Text>
          </View>

          <ScrollView style={styles.sidebarList} showsVerticalScrollIndicator={false}>
            {CATEGORIES.map((c) => {
              const isActive = activeCategory === c.id;
              return (
                <TouchableOpacity key={c.id}
                  style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
                  onPress={() => selectCategory(c.id)}>
                  <Text style={styles.sidebarIcon}>{c.icon}</Text>
                  <Text style={[styles.sidebarLabel, isActive && styles.sidebarLabelActive]}>
                    {c.label}
                  </Text>
                  {c.id === 'favourites' && favourites.length > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{favourites.length}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.sidebarBottom}>
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
  screen: { flex: 1, backgroundColor: COLORS.bg },
  topbar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 0.5, borderBottomColor: COLORS.border, gap: 12,
  },
  menuBtn: {
    width: 34, height: 34, borderRadius: RADIUS.md,
    borderWidth: 0.5, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  menuIcon: { fontSize: 15, color: COLORS.textSecondary },
  title: { flex: 1, fontSize: 16, fontWeight: '500', color: COLORS.textPrimary },
  grid: { padding: 12, gap: 10 },
  row: { gap: 10, marginBottom: 10 },
  cardWrapper: { flex: 1 },
  emptyFav: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '500', color: COLORS.textPrimary, marginBottom: 6 },
  emptyDesc: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' },
  overlay: {
    position: 'absolute', top: 0, left: 0,
    width: SCREEN_WIDTH, height: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 10,
  },
  sidebar: {
    position: 'absolute', top: 0, left: 0,
    width: SIDEBAR_WIDTH, height: '100%',
    backgroundColor: COLORS.bgSecondary,
    borderRightWidth: 0.5, borderRightColor: COLORS.border,
    zIndex: 20,
  },
  sidebarHeader: {
    padding: 20, paddingTop: 24,
    borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  logo: { fontSize: 20, fontWeight: '600', color: COLORS.textPrimary },
  tagline: { fontSize: 11, color: COLORS.textTertiary, marginTop: 2 },
  sidebarList: { flex: 1, paddingHorizontal: 8, paddingTop: 10 },
  sidebarItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 11, paddingHorizontal: 10,
    borderRadius: RADIUS.md, marginBottom: 2, gap: 10,
  },
  sidebarItemActive: { backgroundColor: COLORS.bg },
  sidebarIcon: { fontSize: 16, width: 22, textAlign: 'center' },
  sidebarLabel: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  sidebarLabelActive: { fontWeight: '500', color: COLORS.textPrimary },
  badge: { backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 },
  badgeText: { fontSize: 10, color: '#fff', fontWeight: '600' },
  sidebarBottom: {
    padding: 12, borderTopWidth: 0.5, borderTopColor: COLORS.border,
  },
  settingsBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, paddingHorizontal: 10, borderRadius: RADIUS.md,
  },
  settingsIcon: { fontSize: 18 },
  settingsLabel: { fontSize: 14, color: COLORS.textSecondary },
});
