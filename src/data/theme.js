import AsyncStorage from '@react-native-async-storage/async-storage';

export const LIGHT_COLORS = {
  bg:           '#F5F3EE',
  bgSecondary:  '#EEECE7',
  bgTertiary:   '#E4E2DC',
  textPrimary:  '#1A1A1A',
  textSecondary:'#6B6B6B',
  textTertiary: '#ABABAB',
  accent:       '#378ADD',
  accentLight:  '#E6F1FB',
  accentText:   '#0C447C',
  pro:          '#FAC775',
  proText:      '#412402',
  success:      '#3B6D11',
  successLight: '#EAF3DE',
  border:       'rgba(0,0,0,0.1)',
  borderStrong: 'rgba(0,0,0,0.2)',
  danger:       '#A32D2D',
  dangerLight:  '#FFF0F0',
  star:         '#F5A623',
  cardShadow:   '#C8C4BA',
};

export const DARK_COLORS = {
  bg:           '#1A1A2E',
  bgSecondary:  '#22223A',
  bgTertiary:   '#2C2C48',
  textPrimary:  '#F0EEE8',
  textSecondary:'#A0A0C0',
  textTertiary: '#666688',
  accent:       '#5B9FE8',
  accentLight:  '#1A2F48',
  accentText:   '#8EC5F5',
  pro:          '#FAC775',
  proText:      '#412402',
  success:      '#5DBB4A',
  successLight: '#1A3012',
  border:       'rgba(255,255,255,0.1)',
  borderStrong: 'rgba(255,255,255,0.2)',
  danger:       '#E05555',
  dangerLight:  '#3A1515',
  star:         '#F5A623',
  cardShadow:   '#0A0A18',
};

export const RADIUS = {
  sm: 8,
  md: 10,
  lg: 14,
  xl: 18,
};

// COLORS is a proxy object that always returns the current theme colour
// This means all tool screens that import COLORS get dark/light automatically
let _isDark = false;

// Load saved preference immediately
AsyncStorage.getItem('darkMode').then(val => {
  _isDark = val === 'true';
}).catch(() => {});

export function setDarkMode(val) {
  _isDark = val;
}

export const COLORS = new Proxy({}, {
  get(_, key) {
    return (_isDark ? DARK_COLORS : LIGHT_COLORS)[key];
  }
});
