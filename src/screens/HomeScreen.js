import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Alert,
  Animated, Dimensions, TouchableWithoutFeedback,
  TextInput, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TOOLS, CATEGORIES, ALL_TOOLS } from '../data/categories';
import { RADIUS } from '../data/theme';
import { useTheme } from '../data/ThemeContext';
import AdBanner from '../components/AdBanner';

const SIDEBAR_WIDTH = 260;
const SCREEN_WIDTH  = Dimensions.get('window').width;
const CARD_W        = (SCREEN_WIDTH - 48) / 3;
const RECENT_KEY    = 'recent_tools';
const FAV_KEY       = 'favourites';
const NOTES_KEY     = 'pinned_notes';
const NOTES_TOOL_KEY = 'notes_tool';

const NOTE_COLORS = ['#FFD966','#82E0AA','#F1948A','#85C1E9','#F0B27A'];
const NOTE_DARK   = ['#5C4A00','#1A5235','#6B1A1A','#1A3A5C','#6B3A00'];

function StickyNote({ note, index, isDark, onPress, onLongPress }) {
  const bg = isDark ? NOTE_DARK[index % NOTE_DARK.length] : NOTE_COLORS[index % NOTE_COLORS.length];
  const isEmpty = !note.title && !note.body;
  return (
    <TouchableOpacity style={[styles.stickyNote, { backgroundColor: bg }]}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={500}
      activeOpacity={0.85}>
      <Text style={[styles.stickyTitle, { color: isDark ? '#FFFFcc' : '#1A1A1A' }]} numberOfLines={1}>
        {note.title || (isEmpty ? 'Tap to add note' : '')}
      </Text>
      <Text style={[styles.stickyBody, { color: isDark ? '#DDDDAA' : '#444' }]} numberOfLines={4}>
        {note.body || ''}
      </Text>
    </TouchableOpacity>
  );
}

function Card({ tool, onPress, onLongPress, isFav, COLORS }) {
  return (
    <TouchableOpacity style={[styles.card, {
      backgroundColor: COLORS.bgSecondary,
      borderColor: COLORS.border,
      shadowColor: COLORS.cardShadow,
    }]}
      onPress={onPress} onLongPress={onLongPress}
      delayLongPress={500} activeOpacity={0.8}>
      {isFav && <View style={[styles.favDot, { backgroundColor: COLORS.star }]} />}
      <Text style={styles.cardIcon}>{tool.icon}</Text>
      <Text style={[styles.cardLabel, { color: COLORS.textPrimary }]} numberOfLines={2}>{tool.label}</Text>
    </TouchableOpacity>
  );
}

function Grid({ tools, onPress, onLongPress, favourites, COLORS }) {
  const rows = [];
  for (let i = 0; i < tools.length; i += 3) rows.push(tools.slice(i, i + 3));
  return (
    <View style={styles.grid}>
      {rows.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map(t => (
            <Card key={t.id} tool={t} COLORS={COLORS}
              onPress={() => onPress(t)} onLongPress={() => onLongPress(t.id)}
              isFav={favourites.includes(t.id)} />
          ))}
          {row.length < 3 && [...Array(3 - row.length)].map((_, i) => (
            <View key={`e${i}`} style={styles.cardEmpty} />
          ))}
        </View>
      ))}
    </View>
  );
}

function CategoryIntro({ onDone, COLORS }) {
  const cats = CATEGORIES.filter(c => !c.special);
  const fadeAnims  = useRef(cats.map(() => new Animated.Value(0))).current;
  const slideAnims = useRef(cats.map(() => new Animated.Value(50))).current;
  const exitAnims  = useRef(cats.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const fadeIn = cats.map((_, i) =>
      Animated.parallel([
        Animated.timing(fadeAnims[i],  { toValue: 1, duration: 280, delay: i * 100, useNativeDriver: true }),
        Animated.timing(slideAnims[i], { toValue: 0, duration: 280, delay: i * 100, useNativeDriver: true }),
      ])
    );
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
    <View style={[styles.introWrap, { backgroundColor: COLORS.bg }]}>
      <Text style={[styles.introTitle, { color: COLORS.textPrimary }]}>Life App</Text>
      <Text style={[styles.introSub, { color: COLORS.textTertiary }]}>Everything you need</Text>
      <View style={styles.introList}>
        {cats.map((cat, i) => (
          <Animated.View key={cat.id} style={[styles.introItem, {
            backgroundColor: COLORS.bgSecondary, borderColor: COLORS.border,
            opacity: fadeAnims[i],
            transform: [{ translateY: slideAnims[i] }, { translateX: exitAnims[i] }],
          }]}>
            <Text style={styles.introItemIcon}>{cat.icon}</Text>
            <Text style={[styles.introItemLabel, { color: COLORS.textPrimary }]}>{cat.label}</Text>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const { COLORS, isDark, toggleDark } = useTheme();
  const [showIntro,      setShowIntro]    = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [sidebarOpen,    setSidebarOpen]  = useState(false);
  const [favourites,     setFavourites]   = useState([]);
  const [recentIds,      setRecentIds]    = useState([]);
  const [notes, setNotes] = useState([
    { id: 'pin1', title: '', body: '' },
    { id: 'pin2', title: '', body: '' },
    { id: 'pin3', title: '', body: '' },
    { id: 'pin4', title: '', body: '' },
    { id: 'pin5', title: '', body: '' },
  ]);
  const [editingNote, setEditingNote] = useState(null);
  const [editTitle,   setEditTitle]   = useState('');
  const [editBody,    setEditBody]    = useState('');
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  useEffect(() => {
    async function load() {
      try {
        const r = await AsyncStorage.getItem(RECENT_KEY);
        const f = await AsyncStorage.getItem(FAV_KEY);
        const n = await AsyncStorage.getItem(NOTES_KEY);
        if (r) setRecentIds(JSON.parse(r));
        if (f) setFavourites(JSON.parse(f));
        if (n) setNotes(JSON.parse(n));
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
    const tool  = ALL_TOOLS.find(t => t.id === toolId);
    const isFav = favourites.includes(toolId);
    const next  = isFav ? favourites.filter(id => id !== toolId) : [...favourites, toolId];
    setFavourites(next);
    try { await AsyncStorage.setItem(FAV_KEY, JSON.stringify(next)); } catch {}
    Alert.alert(isFav ? 'Removed' : '⭐ Added to Favourites',
      `${tool?.label} ${isFav ? 'removed from' : 'added to'} favourites`,
      [{ text: 'OK' }]);
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

  function openNote(index) {
    setEditingNote(index);
    setEditTitle(notes[index].title);
    setEditBody(notes[index].body);
  }

  async function saveNote() {
    const next = notes.map((n, i) =>
      i === editingNote ? { ...n, title: editTitle, body: editBody } : n
    );
    setNotes(next);
    setEditingNote(null);
    try {
      await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(next));
      // Also save non-empty notes to notes_tool so they appear in Notes screen
      const toolNotes = await AsyncStorage.getItem(NOTES_TOOL_KEY);
      const existing = toolNotes ? JSON.parse(toolNotes) : [];
      const edited = next[editingNote];
      if (edited && (edited.title || edited.body)) {
        // Check if this note already exists in tool notes
        const alreadyExists = existing.find(n => n.id === edited.id);
        if (!alreadyExists) {
          const newToolNote = {
            id: edited.id || Date.now().toString(),
            title: edited.title,
            body: edited.body,
            colorIdx: editingNote % 7,
          };
          await AsyncStorage.setItem(NOTES_TOOL_KEY, JSON.stringify([newToolNote, ...existing]));
        } else {
          const updated = existing.map(n => n.id === edited.id
            ? { ...n, title: edited.title, body: edited.body } : n);
          await AsyncStorage.setItem(NOTES_TOOL_KEY, JSON.stringify(updated));
        }
      }
    } catch {}
  }

  function longPressNote(index) {
    const note = notes[index];
    const isEmpty = !note.title && !note.body;
    if (isEmpty) return; // nothing to do on empty notes
    Alert.alert(note.title || 'Note', 'What would you like to do?', [
      { text: '✏️ Edit', onPress: () => openNote(index) },
      {
        text: '🗑️ Clear note', style: 'destructive',
        onPress: async () => {
          const next = notes.map((n, i) => i === index ? { ...n, title: '', body: '' } : n);
          setNotes(next);
          try { await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(next)); } catch {}
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  function handleToolPress(tool) {
    trackRecent(tool.id);
    const routes = {
      Calculator:'Calculator', UnitConverter:'UnitConverter', DiscountCalc:'DiscountCalc',
      AgeCalculator:'AgeCalculator', Stopwatch:'Stopwatch', TipCalculator:'TipCalculator',
      RandomPicker:'RandomPicker', Checklist:'Checklist', ShoppingList:'ShoppingList',
      MealPlanner:'MealPlanner', Notes:'Notes', BMI:'BMI', WaterIntake:'WaterIntake',
      WeightTracker:'WeightTracker', Meditation:'Meditation', Breathing:'Breathing',
      MedicationReminder:'MedicationReminder', PasswordManager:'PasswordManager',
      QRGenerator:'QRGenerator', Ruler:'Ruler', FuelCost:'FuelCost',
      TimeZones:'TimeZones', Globe:'Globe', SolarSystem:'SolarSystem',
      DiceRoller:'DiceRoller', CoinFlip:'CoinFlip', FlagQuiz:'FlagQuiz',
      WordScramble:'WordScramble', TrueOrFalse:'TrueOrFalse', QuickMaths:'QuickMaths',
      PeriodTracker:'PeriodTracker',
    };
    if (routes[tool.id]) navigation.navigate(routes[tool.id]);
    else Alert.alert('Coming Soon', `${tool.label} is coming soon!`);
  }

  const recents  = ALL_TOOLS.filter(t => recentIds.includes(t.id))
    .sort((a, b) => recentIds.indexOf(a.id) - recentIds.indexOf(b.id)).slice(0, 3);
  const favTools = ALL_TOOLS.filter(t => favourites.includes(t.id));
  const cat      = activeCategory === 'favourites' ? { label: 'Favourites' }
                 : CATEGORIES.find(c => c.id === activeCategory);
  const catTools = activeCategory === 'favourites' ? favTools : (TOOLS[activeCategory] || []);

  if (showIntro) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: COLORS.bg }]}>
        <View style={[styles.topbar, { borderBottomColor: COLORS.border, backgroundColor: COLORS.bg }]}>
          <Text style={[styles.topbarBrand, { color: COLORS.textPrimary }]}>Life App</Text>
        </View>
        <CategoryIntro COLORS={COLORS} onDone={() => setShowIntro(false)} />
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={[styles.screen, { backgroundColor: COLORS.bg }]}>
        <View style={[styles.topbar, { borderBottomColor: COLORS.border }]}>
          <TouchableOpacity style={[styles.menuBtn, { borderColor: COLORS.border, backgroundColor: COLORS.bgSecondary }]} onPress={openSidebar}>
            <Text style={[styles.menuIcon, { color: COLORS.textPrimary }]}>☰</Text>
          </TouchableOpacity>
          <Text style={[styles.topbarTitle, { color: COLORS.textPrimary }]}>
            {activeCategory ? cat?.label : 'Life App'}
          </Text>
          {activeCategory && (
            <TouchableOpacity onPress={() => setActiveCategory(null)}>
              <Text style={{ fontSize: 20 }}>🏠</Text>
            </TouchableOpacity>
          )}
        </View>

        <AdBanner />

        {!activeCategory ? (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={[styles.sectionTitle, { color: COLORS.textSecondary }]}>📌 Pinned Notes</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.notesContent}>
              {notes.map((note, i) => (
                <StickyNote key={note.id} note={note} index={i} isDark={isDark}
                  onPress={() => openNote(i)}
                  onLongPress={() => longPressNote(i)} />
              ))}
            </ScrollView>

            {recents.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: COLORS.textSecondary }]}>Recently Used</Text>
                <Grid tools={recents} COLORS={COLORS} onPress={handleToolPress}
                  onLongPress={toggleFavourite} favourites={favourites} />
              </View>
            )}

            {favTools.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: COLORS.textSecondary }]}>⭐ Favourites</Text>
                <Grid tools={favTools} COLORS={COLORS} onPress={handleToolPress}
                  onLongPress={toggleFavourite} favourites={favourites} />
              </View>
            )}

            {recents.length === 0 && favTools.length === 0 && (
              <View style={styles.emptyHome}>
                <Text style={styles.emptyIcon}>👆</Text>
                <Text style={[styles.emptyTitle, { color: COLORS.textPrimary }]}>Welcome to Life App</Text>
                <Text style={[styles.emptyDesc, { color: COLORS.textSecondary }]}>
                  Open a tool to get started{'\n'}Press & hold any tool to favourite it
                </Text>
              </View>
            )}
            <View style={{ height: 24 }} />
          </ScrollView>
        ) : activeCategory === 'favourites' && favTools.length === 0 ? (
          <View style={styles.emptyHome}>
            <Text style={styles.emptyIcon}>⭐</Text>
            <Text style={[styles.emptyTitle, { color: COLORS.textPrimary }]}>No favourites yet</Text>
            <Text style={[styles.emptyDesc, { color: COLORS.textSecondary }]}>Press & hold any tool to add it here</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Grid tools={catTools} COLORS={COLORS} onPress={handleToolPress}
              onLongPress={toggleFavourite} favourites={favourites} />
            <View style={{ height: 24 }} />
          </ScrollView>
        )}
      </SafeAreaView>

      {sidebarOpen && (
        <TouchableWithoutFeedback onPress={closeSidebar}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}

      <Animated.View style={[styles.sidebar, {
        backgroundColor: COLORS.bgSecondary,
        borderRightColor: COLORS.border,
        transform: [{ translateX: slideAnim }],
      }]}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={[styles.sidebarHeader, { borderBottomColor: COLORS.border }]}>
            <View style={styles.sidebarHeaderTop}>
              <View>
                <Text style={[styles.logo, { color: COLORS.textPrimary }]}>Life App</Text>
                <Text style={[styles.tagline, { color: COLORS.textTertiary }]}>Everything you need</Text>
              </View>
              <TouchableOpacity style={[styles.darkToggle, { backgroundColor: COLORS.bgTertiary }]}
                onPress={toggleDark}>
                <Text style={{ fontSize: 18 }}>{isDark ? '☀️' : '🌙'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.sidebarList} showsVerticalScrollIndicator={false}>
            {[{ id: 'home', icon: '🏠', label: 'Home' }, { id: 'favourites', icon: '⭐', label: 'Favourites' }]
              .concat(CATEGORIES.filter(c => !c.special))
              .map(c => {
                const isActive = c.id === 'home' ? !activeCategory : activeCategory === c.id;
                return (
                  <TouchableOpacity key={c.id}
                    style={[styles.sidebarItem, isActive && { backgroundColor: COLORS.bg }]}
                    onPress={() => selectCategory(c.id)}>
                    <Text style={styles.sidebarIcon}>{c.icon}</Text>
                    <Text style={[styles.sidebarLabel, { color: isActive ? COLORS.textPrimary : COLORS.textSecondary },
                      isActive && { fontWeight: '500' }]}>{c.label}</Text>
                    {c.id === 'favourites' && favourites.length > 0 && (
                      <View style={[styles.badge, { backgroundColor: COLORS.accent }]}>
                        <Text style={styles.badgeText}>{favourites.length}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
          </ScrollView>

          <View style={[styles.sidebarBottom, { borderTopColor: COLORS.border }]}>
            <TouchableOpacity style={[styles.proBtn, { backgroundColor: COLORS.accentLight }]}
              onPress={() => { closeSidebar(); navigation.navigate('Pro'); }}>
              <Text style={{ fontSize: 14 }}>⭐</Text>
              <Text style={[styles.proLabel, { color: COLORS.accentText }]}>Upgrade to Pro</Text>
              <Text style={[{ fontSize: 11, color: COLORS.accentText, opacity: 0.8 }]}>£1 once</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsBtn}
              onPress={() => { closeSidebar(); navigation.navigate('Settings'); }}>
              <Text style={{ fontSize: 16 }}>⚙️</Text>
              <Text style={[styles.settingsLabel, { color: COLORS.textSecondary }]}>Settings</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>

      {/* Note edit modal */}
      <Modal visible={editingNote !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={saveNote} />
          <View style={[styles.noteModal, {
            backgroundColor: editingNote !== null
              ? NOTE_COLORS[editingNote % NOTE_COLORS.length] : '#FFD966',
          }]}>
            <Text style={styles.noteModalLabel}>📌 Edit Note</Text>
            <TextInput style={styles.noteTitleInput} value={editTitle} onChangeText={setEditTitle}
              placeholder="Title..." placeholderTextColor="#888" autoFocus />
            <TextInput style={styles.noteBodyInput} value={editBody} onChangeText={setEditBody}
              placeholder="Write your note here..." placeholderTextColor="#888" multiline />
            <TouchableOpacity style={styles.noteSaveBtn} onPress={saveNote}>
              <Text style={styles.noteSaveBtnText}>Save Note ✓</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:         { flex: 1 },
  topbar:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 0.5, gap: 12 },
  topbarBrand:    { flex: 1, fontSize: 20, fontWeight: '700', textAlign: 'center' },
  topbarTitle:    { flex: 1, fontSize: 16, fontWeight: '500' },
  menuBtn:        { width: 32, height: 32, borderRadius: RADIUS.md, borderWidth: 0.5, alignItems: 'center', justifyContent: 'center' },
  menuIcon:       { fontSize: 14 },
  scrollContent:  { paddingHorizontal: 12, paddingTop: 12 },
  section:        { marginBottom: 14 },
  sectionTitle:   { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 },
  notesContent:   { paddingBottom: 12, gap: 10, flexDirection: 'row', paddingRight: 12 },
  stickyNote:     { width: 130, height: 120, borderRadius: 4, padding: 10, gap: 4, elevation: 4, shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: { width: 2, height: 3 }, marginBottom: 8 },
  stickyTitle:    { fontSize: 13, fontWeight: '700' },
  stickyBody:     { fontSize: 11, lineHeight: 16 },
  grid:           { gap: 8 },
  row:            { flexDirection: 'row', gap: 8 },
  card:           { width: CARD_W, height: CARD_W * 0.85, borderWidth: 0.5, borderRadius: RADIUS.lg, padding: 8, justifyContent: 'flex-end', position: 'relative', elevation: 3, shadowOpacity: 0.18, shadowRadius: 4, shadowOffset: { width: 0, height: 3 } },
  cardEmpty:      { width: CARD_W, height: CARD_W * 0.85 },
  favDot:         { position: 'absolute', top: 7, right: 7, width: 6, height: 6, borderRadius: 3 },
  cardIcon:       { fontSize: 20, marginBottom: 3 },
  cardLabel:      { fontSize: 11, fontWeight: '500', lineHeight: 14 },
  emptyHome:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 40, marginTop: 40 },
  emptyIcon:      { fontSize: 48 },
  emptyTitle:     { fontSize: 18, fontWeight: '600' },
  emptyDesc:      { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  introWrap:      { flex: 1, paddingHorizontal: 24, paddingTop: 20, gap: 8 },
  introTitle:     { fontSize: 28, fontWeight: '700', marginBottom: 2 },
  introSub:       { fontSize: 14, marginBottom: 20 },
  introList:      { gap: 8 },
  introItem:      { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12, borderRadius: RADIUS.lg, borderWidth: 0.5 },
  introItemIcon:  { fontSize: 20 },
  introItemLabel: { fontSize: 14, fontWeight: '500' },
  overlay:        { position: 'absolute', top: 0, left: 0, width: SCREEN_WIDTH, height: '100%', backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 10 },
  sidebar:        { position: 'absolute', top: 0, left: 0, width: SIDEBAR_WIDTH, height: '100%', borderRightWidth: 0.5, zIndex: 20 },
  sidebarHeader:  { padding: 16, paddingTop: 20, borderBottomWidth: 0.5 },
  sidebarHeaderTop:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  logo:           { fontSize: 18, fontWeight: '600' },
  tagline:        { fontSize: 11, marginTop: 2 },
  darkToggle:     { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  sidebarList:    { flex: 1, paddingHorizontal: 8, paddingTop: 8 },
  sidebarItem:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 10, borderRadius: RADIUS.md, marginBottom: 2, gap: 10 },
  sidebarIcon:    { fontSize: 15, width: 22, textAlign: 'center' },
  sidebarLabel:   { fontSize: 13, flex: 1 },
  badge:          { borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 },
  badgeText:      { fontSize: 10, color: '#fff', fontWeight: '600' },
  sidebarBottom:  { padding: 12, borderTopWidth: 0.5, gap: 6 },
  proBtn:         { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 10, borderRadius: RADIUS.md },
  proLabel:       { flex: 1, fontSize: 13, fontWeight: '600' },
  settingsBtn:    { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, paddingHorizontal: 10, borderRadius: RADIUS.md },
  settingsLabel:  { fontSize: 13 },
  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-start', paddingTop: 80 },
  noteModal:      { marginHorizontal: 16, borderRadius: 12, padding: 20, gap: 10, zIndex: 1, elevation: 8 },
  noteModalLabel: { fontSize: 13, fontWeight: '600', color: '#333' },
  noteTitleInput: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.2)', paddingBottom: 6 },
  noteBodyInput:  { fontSize: 14, color: '#333', minHeight: 120, textAlignVertical: 'top', lineHeight: 22 },
  noteSaveBtn:    { backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 8, padding: 12, alignItems: 'center' },
  noteSaveBtnText:{ fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
});
