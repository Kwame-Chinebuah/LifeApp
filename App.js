import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider } from './src/data/ThemeContext';
import { useTheme } from './src/data/ThemeContext';

// Screens
import SplashAnimationScreen  from './src/screens/SplashAnimationScreen';

const splashImage = require('./assets/splash.png');
import HomeScreen             from './src/screens/HomeScreen';

// Existing tools
import CalculatorScreen       from './src/tools/CalculatorScreen';
import UnitConverterScreen    from './src/tools/UnitConverterScreen';
import DiscountCalcScreen     from './src/tools/DiscountCalcScreen';
import AgeCalculatorScreen    from './src/tools/AgeCalculatorScreen';
import StopwatchScreen        from './src/tools/StopwatchScreen';
import TipCalculatorScreen    from './src/tools/TipCalculatorScreen';
import RandomPickerScreen     from './src/tools/RandomPickerScreen';
import ChecklistScreen        from './src/tools/ChecklistScreen';
import BMIScreen              from './src/tools/BMIScreen';
import WaterIntakeScreen      from './src/tools/WaterIntakeScreen';
import PasswordManagerScreen  from './src/tools/PasswordManagerScreen';
import QRGeneratorScreen      from './src/tools/QRGeneratorScreen';
import RulerScreen            from './src/tools/RulerScreen';
import FuelCostScreen         from './src/tools/FuelCostScreen';
import DiceRollerScreen       from './src/tools/DiceRollerScreen';
import CoinFlipScreen         from './src/tools/CoinFlipScreen';
import TimeZonesScreen        from './src/tools/TimeZonesScreen';
import GlobeScreen            from './src/tools/GlobeScreen';
import SettingsScreen         from './src/tools/SettingsScreen';

// NEW tools
import ShoppingListScreen     from './src/tools/ShoppingListScreen';
import MealPlannerScreen      from './src/tools/MealPlannerScreen';
import WeightTrackerScreen    from './src/tools/WeightTrackerScreen';
import MeditationScreen       from './src/tools/MeditationScreen';
import BreathingScreen        from './src/tools/BreathingScreen';
import MedicationScreen       from './src/tools/MedicationScreen';
import SolarSystemScreen      from './src/tools/SolarSystemScreen';
import FlagQuizScreen         from './src/tools/FlagQuizScreen';
import WordScrambleScreen     from './src/tools/WordScrambleScreen';
import TrueOrFalseScreen      from './src/tools/TrueOrFalseScreen';
import QuickMathsScreen       from './src/tools/QuickMathsScreen';
import ProScreen              from './src/screens/ProScreen';
import NotesScreen            from './src/tools/NotesScreen';

const Stack = createStackNavigator();

// Wraps any screen so it gets the dark/light background automatically
// Uses absolute positioning to cover the SafeAreaView background too
function withTheme(ScreenComponent) {
  return function ThemedScreen(props) {
    const { COLORS } = useTheme();
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: COLORS.bg }]} />
        <ScreenComponent {...props} />
      </View>
    );
  };
}

function AppNavigator() {
  const [splashDone, setSplashDone] = useState(false);

  if (!splashDone) {
    return <SplashAnimationScreen splashImage={splashImage} onFinish={() => setSplashDone(true)} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="Home"               component={HomeScreen} />
        {/* Existing tools */}
        <Stack.Screen name="Calculator"         component={withTheme(CalculatorScreen)} />
        <Stack.Screen name="UnitConverter"      component={withTheme(UnitConverterScreen)} />
        <Stack.Screen name="DiscountCalc"       component={withTheme(DiscountCalcScreen)} />
        <Stack.Screen name="AgeCalculator"      component={withTheme(AgeCalculatorScreen)} />
        <Stack.Screen name="Stopwatch"          component={withTheme(StopwatchScreen)} />
        <Stack.Screen name="TipCalculator"      component={withTheme(TipCalculatorScreen)} />
        <Stack.Screen name="RandomPicker"       component={withTheme(RandomPickerScreen)} />
        <Stack.Screen name="Checklist"          component={withTheme(ChecklistScreen)} />
        <Stack.Screen name="BMI"                component={withTheme(BMIScreen)} />
        <Stack.Screen name="WaterIntake"        component={withTheme(WaterIntakeScreen)} />
        <Stack.Screen name="PasswordManager"    component={withTheme(PasswordManagerScreen)} />
        <Stack.Screen name="QRGenerator"        component={withTheme(QRGeneratorScreen)} />
        <Stack.Screen name="Ruler"              component={withTheme(RulerScreen)} />
        <Stack.Screen name="FuelCost"           component={withTheme(FuelCostScreen)} />
        <Stack.Screen name="DiceRoller"         component={withTheme(DiceRollerScreen)} />
        <Stack.Screen name="CoinFlip"           component={withTheme(CoinFlipScreen)} />
        <Stack.Screen name="TimeZones"          component={withTheme(TimeZonesScreen)} />
        <Stack.Screen name="Globe"              component={withTheme(GlobeScreen)} />
        <Stack.Screen name="Settings"           component={withTheme(SettingsScreen)} />
        {/* NEW tools */}
        <Stack.Screen name="ShoppingList"       component={withTheme(ShoppingListScreen)} />
        <Stack.Screen name="MealPlanner"        component={withTheme(MealPlannerScreen)} />
        <Stack.Screen name="WeightTracker"      component={withTheme(WeightTrackerScreen)} />
        <Stack.Screen name="Meditation"         component={withTheme(MeditationScreen)} />
        <Stack.Screen name="Breathing"          component={withTheme(BreathingScreen)} />
        <Stack.Screen name="MedicationReminder" component={withTheme(MedicationScreen)} />
        <Stack.Screen name="SolarSystem"        component={withTheme(SolarSystemScreen)} />
        <Stack.Screen name="FlagQuiz"           component={withTheme(FlagQuizScreen)} />
        <Stack.Screen name="WordScramble"       component={withTheme(WordScrambleScreen)} />
        <Stack.Screen name="TrueOrFalse"        component={withTheme(TrueOrFalseScreen)} />
        <Stack.Screen name="QuickMaths"         component={withTheme(QuickMathsScreen)} />
        <Stack.Screen name="Pro"                component={ProScreen} />
        <Stack.Screen name="Notes"              component={withTheme(NotesScreen)} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}
