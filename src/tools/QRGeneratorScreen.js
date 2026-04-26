import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  TextInput, ScrollView, Image, Share, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '../data/theme';
import { useTheme } from '../data/ThemeContext';
import AdBanner from '../components/AdBanner';

const TYPES = [
  { id: 'url',   label: 'Website',  icon: '🌐', placeholder: 'https://example.com' },
  { id: 'text',  label: 'Text',     icon: '📝', placeholder: 'Enter any text...' },
  { id: 'email', label: 'Email',    icon: '📧', placeholder: 'you@example.com' },
  { id: 'phone', label: 'Phone',    icon: '📞', placeholder: '+44 7700 000000' },
  { id: 'wifi',  label: 'WiFi',     icon: '📶', placeholder: 'Network name' },
];

export default function QRGeneratorScreen({ navigation }) {
  const { COLORS: dynCOLORS } = useTheme();
  const [type, setType]         = useState('url');
  const [value, setValue]       = useState('');
  const [wifiPass, setWifiPass] = useState('');
  const [qrUrl, setQrUrl]       = useState(null);

  function buildContent() {
    if (type === 'email') return `mailto:${value}`;
    if (type === 'phone') return `tel:${value}`;
    if (type === 'wifi')  return `WIFI:T:WPA;S:${value};P:${wifiPass};;`;
    return value;
  }

  function generate() {
    if (!value.trim()) return;
    const content = encodeURIComponent(buildContent());
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${content}`);
  }

  async function shareQR() {
    if (!qrUrl) return;
    try {
      await Share.share({
        message: `QR Code for: ${value}\n\nGenerated with Life App`,
        url: qrUrl,
        title: 'Share QR Code',
      });
    } catch (e) {
      Alert.alert('Share', 'Screenshot the QR code to share it');
    }
  }

  const activeType = TYPES.find(t => t.id === type);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: dynCOLORS.bg }]}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>QR Generator</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Type selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          style={styles.typeScroll} contentContainerStyle={styles.typeContent}>
          {TYPES.map(t => (
            <TouchableOpacity key={t.id}
              style={[styles.typeBtn, type === t.id && styles.typeBtnActive]}
              onPress={() => { setType(t.id); setValue(''); setQrUrl(null); }}>
              <Text style={styles.typeIcon}>{t.icon}</Text>
              <Text style={[styles.typeLabel, type === t.id && styles.typeLabelActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputBlock}>
          <Text style={styles.inputLabel}>{activeType?.label}</Text>
          <TextInput style={styles.input} value={value}
            onChangeText={v => { setValue(v); setQrUrl(null); }}
            placeholder={activeType?.placeholder}
            placeholderTextColor={COLORS.textTertiary}
            autoCapitalize="none"
            keyboardType={type === 'phone' ? 'phone-pad' : type === 'email' ? 'email-address' : 'default'}
          />
          {type === 'wifi' && (
            <TextInput style={[styles.input, { marginTop: 10 }]}
              value={wifiPass} onChangeText={setWifiPass}
              placeholder="WiFi Password" placeholderTextColor={COLORS.textTertiary}
              secureTextEntry />
          )}
        </View>

        <TouchableOpacity style={styles.generateBtn} onPress={generate} activeOpacity={0.8}>
          <Text style={styles.generateBtnText}>Generate QR Code</Text>
        </TouchableOpacity>

        {/* QR display */}
        {qrUrl && (
          <View style={styles.qrBox}>
            <Image source={{ uri: qrUrl }} style={styles.qrImage} resizeMode="contain" />
            <Text style={styles.qrValue} numberOfLines={2}>{value}</Text>
            <View style={styles.qrActions}>
              <TouchableOpacity style={styles.shareBtn} onPress={shareQR} activeOpacity={0.8}>
                <Text style={styles.shareBtnText}>📤  Share QR Code</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.screenshotHint}>
                <Text style={styles.screenshotHintText}>📸 Screenshot to save</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
      </KeyboardAvoidingView>

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
  content: { padding: 20, gap: 20 },
  typeScroll: { maxHeight: 72, marginHorizontal: -4 },
  typeContent: { gap: 8, paddingHorizontal: 4, alignItems: 'center' },
  typeBtn: {
    alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: RADIUS.lg, borderWidth: 0.5, borderColor: COLORS.border, minWidth: 72,
  },
  typeBtnActive: { backgroundColor: COLORS.accentLight, borderColor: COLORS.accent },
  typeIcon: { fontSize: 20 },
  typeLabel: { fontSize: 11, color: COLORS.textSecondary },
  typeLabelActive: { color: COLORS.accentText, fontWeight: '500' },
  inputBlock: { gap: 8 },
  inputLabel: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary },
  input: {
    borderWidth: 0.5, borderColor: COLORS.border, borderRadius: RADIUS.lg,
    padding: 14, fontSize: 16, color: COLORS.textPrimary, backgroundColor: COLORS.bgSecondary,
  },
  generateBtn: { backgroundColor: COLORS.accent, borderRadius: RADIUS.lg, padding: 16, alignItems: 'center' },
  generateBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  qrBox: {
    alignItems: 'center', gap: 14, padding: 24,
    backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.xl,
    borderWidth: 0.5, borderColor: COLORS.border,
  },
  qrImage: { width: 230, height: 230, backgroundColor: '#fff', borderRadius: RADIUS.md },
  qrValue: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' },
  qrActions: { width: '100%', gap: 10 },
  shareBtn: {
    backgroundColor: COLORS.accent, borderRadius: RADIUS.lg,
    padding: 14, alignItems: 'center',
  },
  shareBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  screenshotHint: { alignItems: 'center' },
  screenshotHintText: { fontSize: 12, color: COLORS.textTertiary },
});
