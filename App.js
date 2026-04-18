import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen            from './src/screens/HomeScreen';
import CalculatorScreen      from './src/tools/CalculatorScreen';
import UnitConverterScreen   from './src/tools/UnitConverterScreen';
import DiscountCalcScreen    from './src/tools/DiscountCalcScreen';
import AgeCalculatorScreen   from './src/tools/AgeCalculatorScreen';
import StopwatchScreen       from './src/tools/StopwatchScreen';
import TipCalculatorScreen   from './src/tools/TipCalculatorScreen';
import RandomPickerScreen    from './src/tools/RandomPickerScreen';
import ChecklistScreen       from './src/tools/ChecklistScreen';
import BMIScreen             from './src/tools/BMIScreen';
import WaterIntakeScreen     from './src/tools/WaterIntakeScreen';
import PasswordManagerScreen from './src/tools/PasswordManagerScreen';
import QRGeneratorScreen     from './src/tools/QRGeneratorScreen';
import RulerScreen           from './src/tools/RulerScreen';
import FuelCostScreen        from './src/tools/FuelCostScreen';
import DiceRollerScreen      from './src/tools/DiceRollerScreen';
import CoinFlipScreen        from './src/tools/CoinFlipScreen';
import TimeZonesScreen       from './src/tools/TimeZonesScreen';
import GlobeScreen           from './src/tools/GlobeScreen';
import SettingsScreen        from './src/tools/SettingsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="Home"            component={HomeScreen} />
        <Stack.Screen name="Calculator"      component={CalculatorScreen} />
        <Stack.Screen name="UnitConverter"   component={UnitConverterScreen} />
        <Stack.Screen name="DiscountCalc"    component={DiscountCalcScreen} />
        <Stack.Screen name="AgeCalculator"   component={AgeCalculatorScreen} />
        <Stack.Screen name="Stopwatch"       component={StopwatchScreen} />
        <Stack.Screen name="TipCalculator"   component={TipCalculatorScreen} />
        <Stack.Screen name="RandomPicker"    component={RandomPickerScreen} />
        <Stack.Screen name="Checklist"       component={ChecklistScreen} />
        <Stack.Screen name="BMI"             component={BMIScreen} />
        <Stack.Screen name="WaterIntake"     component={WaterIntakeScreen} />
        <Stack.Screen name="PasswordManager" component={PasswordManagerScreen} />
        <Stack.Screen name="QRGenerator"     component={QRGeneratorScreen} />
        <Stack.Screen name="Ruler"           component={RulerScreen} />
        <Stack.Screen name="FuelCost"        component={FuelCostScreen} />
        <Stack.Screen name="DiceRoller"      component={DiceRollerScreen} />
        <Stack.Screen name="CoinFlip"        component={CoinFlipScreen} />
        <Stack.Screen name="TimeZones"       component={TimeZonesScreen} />
        <Stack.Screen name="Globe"           component={GlobeScreen} />
        <Stack.Screen name="Settings"        component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
