import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, TextInput,
  FlatList, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '../data/theme';
import AdBanner from '../components/AdBanner';

function generatePassword(length = 16, opts = {}) {
  const lower  = 'abcdefghijklmnopqrstuvwxyz';
  const upper  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nums   = '0123456789';
  const syms   = '!@#$%^&*()_+-=[]{}';
  let chars = lower;
  if (opts.upper)   chars += upper;
  if (opts.numbers) chars += nums;
  if (opts.symbols) chars += syms;
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function PasswordManagerScreen({ navigation }) {
  const [passwords, setPasswords] = useState([]);
  const [adding, setAdding]       = useState(false);
  const [siteName, setSiteName]   = useState('');
  const [username, setUsername]   = useState('');
  const [password, setPassword]   = useState('');
  const [showPw, setShowPw]       = useState({});
  const [genLen, setGenLen]       = useState(16);
  const [opts, setOpts]           = useState({ upper: true, numbers: true, symbols: false });

  function toggleOpt(k) { setOpts(o => ({ ...o, [k]: !o[k] })); }
  function gen() { setPassword(generatePassword(genLen, opts)); }

  function save() {
    if (!siteName.trim() || !password.trim()) return;
    setPasswords(prev => [...prev, {
      id: Date.now().toString(),
      site: siteName.trim(), username: username.trim(), password,
    }]);
    setSiteName(''); setUsername(''); setPassword('');
    setAdding(false);
  }

  function deleteEntry(id) {
    Alert.alert('Delete', 'Delete this password entry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setPasswords(prev => prev.filter(p => p.id !== id)) },
    ]);
  }

  function toggleShow(id) { setShowPw(prev => ({ ...prev, [id]: !prev[id] })); }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Password Manager</Text>
      </View>
      <AdBanner />

      <View style={styles.notice}>
        <Text style={styles.noticeText}>🔒 Stored locally on your device only</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {adding ? (
          // ── Add form — scrollable so keyboard doesn't cover ──
          <ScrollView
            contentContainerStyle={styles.formScroll}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.formTitle}>New Password</Text>
            <TextInput
              style={styles.input}
              value={siteName}
              onChangeText={setSiteName}
              placeholder="Site / App name (e.g. Asda Rewards)"
              placeholderTextColor={COLORS.textTertiary}
              autoFocus
            />
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Username / Email (optional)"
              placeholderTextColor={COLORS.textTertiary}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={COLORS.textTertiary}
              secureTextEntry
            />

            {/* Generator */}
            <View style={styles.genRow}>
              <TouchableOpacity style={styles.genBtn} onPress={gen}>
                <Text style={styles.genBtnText}>⚡ Generate</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setGenLen(l => Math.max(8, l - 4))}>
                <Text style={styles.stepBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.lenText}>{genLen}</Text>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setGenLen(l => Math.min(32, l + 4))}>
                <Text style={styles.stepBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.optsRow}>
              {[['upper','ABC'],['numbers','123'],['symbols','!@#']].map(([k,l]) => (
                <TouchableOpacity key={k}
                  style={[styles.optBtn, opts[k] && styles.optBtnActive]}
                  onPress={() => toggleOpt(k)}>
                  <Text style={[styles.optBtnText, opts[k] && styles.optBtnTextActive]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.formBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setAdding(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={save}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          <>
            <FlatList
              data={passwords}
              keyExtractor={p => p.id}
              contentContainerStyle={styles.list}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Text style={styles.emptyIcon}>🔐</Text>
                  <Text style={styles.emptyText}>No passwords saved yet</Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardSite}>{item.site}</Text>
                    <TouchableOpacity onPress={() => deleteEntry(item.id)}>
                      <Text style={styles.deleteBtn}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  {item.username ? <Text style={styles.cardUsername}>{item.username}</Text> : null}
                  <View style={styles.pwRow}>
                    <Text style={styles.cardPw} numberOfLines={1}>
                      {showPw[item.id] ? item.password : '••••••••••••'}
                    </Text>
                    <TouchableOpacity onPress={() => toggleShow(item.id)}>
                      <Text style={styles.showBtn}>{showPw[item.id] ? 'Hide' : 'Show'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              ListFooterComponent={<View style={{ height: 80 }} />}
            />
            <TouchableOpacity style={styles.addBtn} onPress={() => setAdding(true)}>
              <Text style={styles.addBtnText}>+ Add Password</Text>
            </TouchableOpacity>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  topbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: COLORS.border, gap: 12 },
  backBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.md, borderWidth: 0.5, borderColor: COLORS.border },
  backText: { fontSize: 13, color: COLORS.textSecondary },
  title: { fontSize: 16, fontWeight: '500', color: COLORS.textPrimary },
  notice: { padding: 10, backgroundColor: COLORS.accentLight, alignItems: 'center' },
  noticeText: { fontSize: 12, color: COLORS.accentText },
  formScroll: { padding: 16, gap: 12 },
  formTitle: { fontSize: 17, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  input: { borderWidth: 0.5, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: 14, fontSize: 15, color: COLORS.textPrimary, backgroundColor: COLORS.bgSecondary },
  genRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  genBtn: { flex: 1, padding: 12, borderRadius: RADIUS.md, backgroundColor: COLORS.bgTertiary, alignItems: 'center' },
  genBtnText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
  stepBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 0.5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontSize: 18, color: COLORS.textPrimary },
  lenText: { fontSize: 15, fontWeight: '500', color: COLORS.textPrimary, minWidth: 28, textAlign: 'center' },
  optsRow: { flexDirection: 'row', gap: 10 },
  optBtn: { flex: 1, padding: 10, borderRadius: RADIUS.sm, borderWidth: 0.5, borderColor: COLORS.border, alignItems: 'center' },
  optBtnActive: { backgroundColor: COLORS.accentLight, borderColor: COLORS.accent },
  optBtnText: { fontSize: 13, color: COLORS.textSecondary },
  optBtnTextActive: { color: COLORS.accentText, fontWeight: '500' },
  formBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: RADIUS.lg, borderWidth: 0.5, borderColor: COLORS.border, alignItems: 'center' },
  cancelBtnText: { fontSize: 15, color: COLORS.textSecondary },
  saveBtn: { flex: 2, padding: 14, borderRadius: RADIUS.lg, backgroundColor: COLORS.accent, alignItems: 'center' },
  saveBtnText: { fontSize: 15, color: '#fff', fontWeight: '600' },
  list: { padding: 16, gap: 10 },
  empty: { paddingTop: 60, alignItems: 'center', gap: 8 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 15, color: COLORS.textTertiary },
  card: { padding: 14, backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.lg, borderWidth: 0.5, borderColor: COLORS.border, gap: 6 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardSite: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  deleteBtn: { fontSize: 14, color: COLORS.textTertiary, padding: 4 },
  cardUsername: { fontSize: 13, color: COLORS.textSecondary },
  pwRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardPw: { fontSize: 14, color: COLORS.textPrimary, fontFamily: 'monospace', flex: 1 },
  showBtn: { fontSize: 12, color: COLORS.accent, paddingLeft: 8 },
  addBtn: { margin: 16, padding: 14, borderRadius: RADIUS.lg, backgroundColor: COLORS.accent, alignItems: 'center' },
  addBtnText: { fontSize: 15, color: '#fff', fontWeight: '600' },
});
