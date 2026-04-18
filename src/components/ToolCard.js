import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '../data/theme';

export default function ToolCard({ tool, onPress, onFavourite, isFavourite }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <TouchableOpacity style={styles.heart} onPress={onFavourite} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
        <Text style={[styles.heartIcon, isFavourite && styles.heartActive]}>
          {isFavourite ? '♥' : '♡'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.icon}>{tool.icon}</Text>
      <Text style={styles.label} numberOfLines={1}>{tool.label}</Text>
      <Text style={styles.desc} numberOfLines={1}>{tool.desc}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bg,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 12,
    alignItems: 'flex-start',
    position: 'relative',
    minHeight: 90,
  },
  heart: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  heartIcon: {
    fontSize: 16,
    color: COLORS.textTertiary,
  },
  heartActive: {
    color: '#E0245E',
  },
  icon: { fontSize: 22, marginBottom: 6, marginTop: 2 },
  label: { fontSize: 12, fontWeight: '500', color: COLORS.textPrimary, marginBottom: 2 },
  desc: { fontSize: 10, color: COLORS.textTertiary, lineHeight: 14 },
});
