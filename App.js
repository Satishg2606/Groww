import React from 'react';
import {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';


import { NavigationContainer } from '@react-navigation/native';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ExploreStocks from './app/component/exploreStocksScreen.js';
import { ALPHA_VANTAGE_API_KEY } from '@env';
import StockDetails from './app/component/stockDetailsScreen.js';

// const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


function App({ navigation }) {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="exploreStocks">
        <Stack.Screen 
        name="exploreStocks" 
        component={ExploreStocks} 
        options={{ headerShown:false }} />
        <Stack.Screen 
        name="StockDetails" 
        component={StockDetails} 
        options={{ headerShown:false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;