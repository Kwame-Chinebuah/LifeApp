import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, TextInput,
  FlatList, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, RADIUS } from '../data/theme';
import AdBanner from '../components/AdBanner';

const KEY = 'shopping_list';

export default function ShoppingListScreen({ navigation }) {
  const [items, setItems]     = useState([]);
  const [newItem, setNewItem] = useState('');
  const [newQty, setNewQty]   = useState('1');
  const [filter, setFilter]   = useState('all');

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(d => { if (d) setItems(JSON.parse(d)); }).catch(() => {});
  }, []);

  async function saveItems(next) {
    setItems(next);
    try { await AsyncStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  }

  function add() {
    if (!newItem.trim()) return;
    saveItems([...items, { id: Date.now().toString(), name: newItem.trim(), qty: newQty || '1', done: false }]);
    setNewItem('');
    setNewQty('1');
  }

  function toggle(id) { saveItems(items.map(i => i.id === id ? { ...i, done: !i.done } : i)); }
  function remove(id) { saveItems(items.filter(i => i.id !== id)); }
  function clearDone() { saveItems(items.filter(i => !i.done)); }

  const shown = filter === 'done'    ? items.filter(i => i.done)
              : filter === 'pending' ? items.filter(i => !i.done)
              : items;
  const doneCount = items.filter(i => i.done).length;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Shopping List</Text>
        {doneCount > 0 && (
          <TouchableOpacity onPress={clearDone}>
            <Text style={styles.clearBtn}>Clear done</Text>
          </TouchableOpacity>
        )}
      </View>
      <AdBanner />

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {[['all','All'],['pending','Pending'],['done','Done']].map(([id, label]) => (
          <TouchableOpacity key={id}
            style={[styles.filterBtn, filter === id && styles.filterBtnActive]}
            onPress={() => setFilter(id)}>
            <Text style={[styles.filterText, filter === id && styles.filterTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
        <Text style={styles.count}>{doneCount}/{items.length}</Text>
      </View>

      {/* KeyboardAvoidingView wraps everything below tabs */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          data={shown}
          keyExtractor={i => i.id}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.item, item.done && styles.itemDone]}
              onPress={() => toggle(item.id)} activeOpacity={0.7}>
              <View style={[styles.check, item.done && styles.checkDone]}>
                {item.done && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <Text style={[styles.itemName, item.done && styles.itemNameDone]}>{item.name}</Text>
              <Text style={styles.itemQty}>×{item.qty}</Text>
              <TouchableOpacity onPress={() => remove(item.id)} hitSlop={{ top:10,right:10,bottom:10,left:10 }}>
                <Text style={styles.deleteBtn}>✕</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🛒</Text>
              <Text style={styles.emptyText}>Your list is empty</Text>
            </View>
          }
          ListFooterComponent={<View style={{ height: 8 }} />}
        />

        {/* Add row — always visible above keyboard */}
        <View style={styles.addRow}>
          <TextInput
            style={[styles.addInput, { flex: 1 }]}
            value={newItem}
            onChangeText={setNewItem}
            placeholder="Add item..."
            placeholderTextColor={COLORS.textTertiary}
            onSubmitEditing={add}
            returnKeyType="done"
            blurOnSubmit={false}
          />
          <TextInput
            style={[styles.addInput, { width: 52, textAlign: 'center' }]}
            value={newQty}
            onChangeText={setNewQty}
            keyboardType="numeric"
            placeholder="Qty"
            placeholderTextColor={COLORS.textTertiary}
          />
          <TouchableOpacity style={styles.addBtn} onPress={add}>
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  topbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: COLORS.border, gap: 12 },
  backBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.md, borderWidth: 0.5, borderColor: COLORS.border },
  backText: { fontSize: 13, color: COLORS.textSecondary },
  title: { flex: 1, fontSize: 16, fontWeight: '500', color: COLORS.textPrimary },
  clearBtn: { fontSize: 13, color: COLORS.danger },
  filterRow: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 8, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16, borderWidth: 0.5, borderColor: COLORS.border },
  filterBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  filterText: { fontSize: 12, color: COLORS.textSecondary },
  filterTextActive: { color: '#fff', fontWeight: '500' },
  count: { marginLeft: 'auto', fontSize: 12, color: COLORS.textTertiary },
  list: { padding: 12, gap: 8 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.lg, borderWidth: 0.5, borderColor: COLORS.border },
  itemDone: { opacity: 0.6 },
  check: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  checkDone: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  checkMark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  itemName: { flex: 1, fontSize: 15, color: COLORS.textPrimary },
  itemNameDone: { textDecorationLine: 'line-through', color: COLORS.textTertiary },
  itemQty: { fontSize: 13, color: COLORS.textTertiary },
  deleteBtn: { fontSize: 14, color: COLORS.textTertiary, padding: 4 },
  empty: { paddingTop: 60, alignItems: 'center', gap: 8 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 15, color: COLORS.textTertiary },
  addRow: { flexDirection: 'row', gap: 8, padding: 12, borderTopWidth: 0.5, borderTopColor: COLORS.border, backgroundColor: COLORS.bg },
  addInput: { borderWidth: 0.5, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: COLORS.textPrimary, backgroundColor: COLORS.bgSecondary },
  addBtn: { width: 44, height: 44, borderRadius: RADIUS.md, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { fontSize: 24, color: '#fff', fontWeight: '300' },
});
