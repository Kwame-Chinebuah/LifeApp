import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CATEGORIES } from '../data/categories';
import { COLORS, RADIUS } from '../data/theme';

export default function SidebarContent({ activeCategory, onSelectCategory, navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Life App</Text>
        <Text style={styles.tagline}>Everything you need</Text>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.item, isActive && styles.itemActive]}
              onPress={() => { onSelectCategory(cat.id); navigation.closeDrawer(); }}
              activeOpacity={0.7}
            >
              <Text style={styles.itemIcon}>{cat.icon}</Text>
              <Text style={[styles.itemLabel, isActive && styles.itemLabelActive]}>
                {cat.label}
              </Text>
              {cat.pro && (
                <View style={styles.proBadge}>
                  <Text style={styles.proText}>PRO</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.proBlock}>
        <Text style={styles.proTitle}>✦  Go Pro — £2.99/mo</Text>
        <Text style={styles.proSub}>Remove ads · Unlock all tools</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgSecondary },
  header: {
    padding: 20,
    paddingTop: 24,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  logo: { fontSize: 20, fontWeight: '600', color: COLORS.textPrimary, letterSpacing: -0.3 },
  tagline: { fontSize: 11, color: COLORS.textTertiary, marginTop: 2 },
  list: { flex: 1, paddingHorizontal: 8, paddingTop: 10 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: RADIUS.md,
    marginBottom: 2,
    gap: 10,
  },
  itemActive: { backgroundColor: COLORS.bg },
  itemIcon: { fontSize: 16, width: 22, textAlign: 'center' },
  itemLabel: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  itemLabelActive: { fontWeight: '500', color: COLORS.textPrimary },
  proBadge: {
    backgroundColor: COLORS.pro,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  proText: { fontSize: 8, fontWeight: '600', color: COLORS.proText },
  proBlock: {
    margin: 12,
    backgroundColor: COLORS.pro,
    borderRadius: RADIUS.lg,
    padding: 14,
  },
  proTitle: { fontSize: 13, fontWeight: '600', color: COLORS.proText },
  proSub: { fontSize: 11, color: '#633806', marginTop: 3 },
});
