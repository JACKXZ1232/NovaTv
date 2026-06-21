import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Screens imports
import { HomeScreen } from '../screens/HomeScreen';
import { DetailScreen } from '../screens/DetailScreen';
import { PlayerScreen } from '../screens/PlayerScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { ExploreScreen } from '../screens/ExploreScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom bar navigation layout
function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0a0a0a',
          borderTopColor: '#1b1b1b',
          paddingBottom: 5,
          height: 60,
        },
        tabBarActiveTintColor: '#E50914',
        tabBarInactiveTintColor: '#8c8c8c',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen 
        name="Inicio" 
        component={HomeScreen} 
        options={{
          tabBarLabel: 'Inicio',
          // En producción, carga iconos de lucide-react-native o svg
        }}
      />
      <Tab.Screen 
        name="Buscar" 
        component={SearchScreen} 
        options={{
          tabBarLabel: 'Buscador',
        }}
      />
      <Tab.Screen 
        name="Explorar" 
        component={ExploreScreen} 
        options={{
          tabBarLabel: 'Explorar',
        }}
      />
      <Tab.Screen 
        name="MiLista" 
        component={FavoritesScreen} 
        options={{
          tabBarLabel: 'Mi Lista',
        }}
      />
    </Tab.Navigator>
  );
}

// Stack router
export function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="HomeTabs"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0a0a0a' },
      }}
    >
      <Stack.Screen name="HomeTabs" component={HomeTabs} />
      <Stack.Screen name="Detail" component={DetailScreen} />
      <Stack.Screen name="Player" component={PlayerScreen} />
    </Stack.Navigator>
  );
}
