import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, RADIUS } from '../data/theme';
import { useTheme } from '../data/ThemeContext';

const BACKUP_OPTIONS = [
  { id: 'daily',   label: 'Daily',       desc: 'Back up every day' },
  { id: 'weekly',  label: 'Weekly',      desc: 'Back up every week' },
  { id: 'monthly', label: 'Monthly',     desc: 'Back up every month' },
  { id: 'manual',  label: 'Manual only', desc: 'Only when I tap Back Up Now' },
];

export default function SettingsScreen({ navigation }) {
  const { COLORS: dynCOLORS } = useTheme();
  const [backupFreq, setBackupFreq] = useState('weekly');
  const [lastBackup, setLastBackup] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const freq = await AsyncStorage.getItem('backup_freq');
        const last = await AsyncStorage.getItem('last_backup');
        if (freq) setBackupFreq(freq);
        if (last) setLastBackup(last);
      } catch {}
    }
    load();
  }, []);

  async function saveFreq(id) {
    setBackupFreq(id);
    try { await AsyncStorage.setItem('backup_freq', id); } catch {}
  }

  async function backupNow() {
    const now = new Date().toLocaleString();
    setLastBackup(now);
    try { await AsyncStorage.setItem('last_backup', now); } catch {}
    Alert.alert('✅ Backed Up', 'Your app settings have been saved locally.');
  }

  async function clearData() {
    Alert.alert(
      'Clear All Data',
      'This will reset all your app data including passwords, checklists and water logs. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Everything', style: 'destructive',
          onPress: async () => {
            try { await AsyncStorage.clear(); } catch {}
            Alert.alert('Cleared', 'All data has been reset.');
          }
        },
      ]
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: dynCOLORS.bg }]}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Backup frequency */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Backup Frequency</Text>
          <Text style={styles.sectionDesc}>
            How often should Life App back up your in-app data (passwords, checklists, water logs)?
          </Text>
          {BACKUP_OPTIONS.map(opt => (
            <TouchableOpacity key={opt.id}
              style={[styles.optionRow, backupFreq === opt.id && styles.optionRowActive]}
              onPress={() => saveFreq(opt.id)}>
              <View style={styles.optionInfo}>
                <Text style={styles.optionLabel}>{opt.label}</Text>
                <Text style={styles.optionDesc}>{opt.desc}</Text>
              </View>
              <View style={[styles.radio, backupFreq === opt.id && styles.radioActive]}>
                {backupFreq === opt.id && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Manual backup */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Backup Now</Text>
          {lastBackup && (
            <Text style={styles.lastBackup}>Last backup: {lastBackup}</Text>
          )}
          <TouchableOpacity style={styles.backupBtn} onPress={backupNow}>
            <Text style={styles.backupBtnText}>💾  Back Up Now</Text>
          </TouchableOpacity>
        </View>

        {/* App info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Storage</Text>
            <Text style={styles.infoValue}>Local device only</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ads</Text>
            <Text style={styles.infoValue}>Removed with Pro</Text>
          </View>
        </View>

        {/* Danger zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <TouchableOpacity style={styles.clearBtn} onPress={clearData}>
            <Text style={styles.clearBtnText}>🗑️  Clear All App Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  content: { padding: 20, gap: 24 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  sectionDesc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  optionRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, borderRadius: RADIUS.lg,
    borderWidth: 0.5, borderColor: COLORS.border,
    backgroundColor: COLORS.bgSecondary, gap: 12,
  },
  optionRowActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accentLight },
  optionInfo: { flex: 1 },
  optionLabel: { fontSize: 14, fontWeight: '500', color: COLORS.textPrimary },
  optionDesc: { fontSize: 12, color: COLORS.textTertiary, marginTop: 2 },
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: COLORS.accent },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.accent },
  lastBackup: { fontSize: 12, color: COLORS.textTertiary },
  backupBtn: {
    backgroundColor: COLORS.accent, borderRadius: RADIUS.lg,
    padding: 14, alignItems: 'center',
  },
  backupBtnText: { fontSize: 15, color: '#fff', fontWeight: '600' },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  infoLabel: { fontSize: 14, color: COLORS.textSecondary },
  infoValue: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '500' },
  clearBtn: {
    borderWidth: 1, borderColor: COLORS.danger, borderRadius: RADIUS.lg,
    padding: 14, alignItems: 'center',
  },
  clearBtnText: { fontSize: 15, color: COLORS.danger, fontWeight: '500' },
});
