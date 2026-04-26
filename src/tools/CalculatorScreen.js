import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '../data/theme';
import { useTheme } from '../data/ThemeContext';
import AdBanner from '../components/AdBanner';

const ROWS = [
  ['AC', '()', '%', '÷'],
  ['7',  '8',  '9', '×'],
  ['4',  '5',  '6', '−'],
  ['1',  '2',  '3', '+'],
  ['0',        '.', '='],
];

export default function CalculatorScreen({ navigation }) {
  const { COLORS: dynCOLORS } = useTheme();
  const [expr, setExpr]           = useState('');
  const [display, setDisplay]     = useState('0');
  const [hasResult, setHasResult] = useState(false);

  function countChar(str, ch) {
    return (str.match(new RegExp('\\' + ch, 'g')) || []).length;
  }

  function press(val) {
    const ops = ['+', '−', '×', '÷'];

    if (val === 'AC') {
      setExpr(''); setDisplay('0'); setHasResult(false); return;
    }

    if (val === '=') {
      try {
        const raw = expr
          .replace(/÷/g, '/')
          .replace(/×/g, '*')
          .replace(/−/g, '-');
        const result = Function('"use strict"; return (' + raw + ')')();
        const clean = parseFloat(result.toFixed(10)).toString();
        setDisplay(clean);
        setExpr(clean);
        setHasResult(true);
      } catch {
        setDisplay('Error');
      }
      return;
    }

    if (val === '()') {
      const openCount  = countChar(expr, '(');
      const closeCount = countChar(expr, ')');
      const bracket = openCount > closeCount ? ')' : '(';
      const newExpr = (hasResult ? '' : expr) + bracket;
      setExpr(newExpr);
      setDisplay(bracket);
      setHasResult(false);
      return;
    }

    if (val === '%') {
      try {
        const raw = expr.replace(/÷/g, '/').replace(/×/g, '*').replace(/−/g, '-');
        const result = Function('"use strict"; return (' + raw + ')')();
        const pct = parseFloat((result / 100).toFixed(10)).toString();
        setDisplay(pct); setExpr(pct); setHasResult(true);
      } catch { setDisplay('Error'); }
      return;
    }

    if (ops.includes(val)) {
      const newExpr = (hasResult ? display : expr) + val;
      setExpr(newExpr);
      setDisplay(val);
      setHasResult(false);
      return;
    }

    // Number or decimal
    if (hasResult) {
      setExpr(val); setDisplay(val); setHasResult(false);
    } else {
      if (val === '.' && expr.split(/[+−×÷(]/).pop().includes('.')) return;
      const newExpr = expr + val;
      setExpr(newExpr);
      const parts = newExpr.split(/[+−×÷(]/);
      setDisplay(parts[parts.length - 1].replace(')', '') || '0');
    }
  }

  function getBtnStyle(l) {
    if (l === '=')                     return [styles.btn, styles.btnEq];
    if (['÷','×','−','+'].includes(l)) return [styles.btn, styles.btnOp];
    if (['AC','%','()'].includes(l))   return [styles.btn, styles.btnFn];
    return [styles.btn, styles.btnNum];
  }

  function getBtnTextStyle(l) {
    if (l === '=')                     return [styles.btnText, { color: '#fff' }];
    if (['÷','×','−','+'].includes(l)) return [styles.btnText, { color: COLORS.accent }];
    if (['AC','%','()'].includes(l))   return [styles.btnText, { color: COLORS.danger, fontSize: 18 }];
    return [styles.btnText, { color: COLORS.textPrimary }];
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: dynCOLORS.bg }]}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Calculator</Text>
      </View>

      {/* Display */}
      <View style={styles.display}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}>
          <Text style={styles.exprText}>{expr || '0'}</Text>
        </ScrollView>
        <Text style={styles.resultText} adjustsFontSizeToFit numberOfLines={1}>
          {display}
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.grid}>
        {ROWS.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((btn, bi) => (
              <TouchableOpacity
                key={bi}
                style={[...getBtnStyle(btn), btn === '0' && styles.btnWide]}
                onPress={() => press(btn)}
                activeOpacity={0.7}
              >
                <Text style={getBtnTextStyle(btn)}>{btn}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      <AdBanner />
    </SafeAreaView>
  );
}

const B = 74;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  topbar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 0.5, borderBottomColor: COLORS.border, gap: 12,
  },
  backBtn: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: RADIUS.md, borderWidth: 0.5, borderColor: COLORS.border,
  },
  backText: { fontSize: 13, color: COLORS.textSecondary },
  title: { fontSize: 16, fontWeight: '500', color: COLORS.textPrimary },
  display: {
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20,
    alignItems: 'flex-end',
    borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
    backgroundColor: COLORS.bgSecondary,
    minHeight: 120, justifyContent: 'flex-end',
  },
  exprText: { fontSize: 18, color: COLORS.textTertiary, marginBottom: 6, textAlign: 'right' },
  resultText: { fontSize: 56, fontWeight: '300', color: COLORS.textPrimary, letterSpacing: -1 },
  grid: { flex: 1, paddingHorizontal: 12, paddingVertical: 10, gap: 8, justifyContent: 'center' },
  row: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  btn: {
    width: B, height: B, borderRadius: B / 2,
    alignItems: 'center', justifyContent: 'center', borderWidth: 0.5,
  },
  btnWide: { width: B * 2 + 10, borderRadius: B / 2, alignItems: 'flex-start', paddingLeft: 28 },
  btnNum: { backgroundColor: COLORS.bg, borderColor: COLORS.border },
  btnOp:  { backgroundColor: COLORS.accentLight, borderColor: COLORS.accentLight },
  btnFn:  { backgroundColor: COLORS.dangerLight, borderColor: '#FFE0E0' },
  btnEq:  { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  btnText: { fontSize: 24, fontWeight: '400' },
});
