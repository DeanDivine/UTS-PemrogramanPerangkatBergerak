import 'react-native-gesture-handler';
import 'react-native-reanimated';

import { Tabs } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useTheme } from '../src/constants/themeContext';
import React from 'react';

// Separate component so we can access the theme via hook
function ThemedTabs() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: theme.card },
        headerTintColor: theme.text,
        headerTitleStyle: { color: theme.text },

        tabBarShowLabel: true,
        tabBarActiveTintColor: theme.progressFill, // use your primary accent
        tabBarInactiveTintColor: theme.subtext,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopWidth: 0,
          borderTopColor: theme.border,
          height: 60,
        },

        // icons per tab
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'index') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'add') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'progress') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else if (route.name === 'diag') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'edit/[id]') {
            iconName = focused ? 'build' : 'build-outline';
          }

          return <Ionicons name={iconName} size={23} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="add" options={{ title: 'Add' }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress' }} />
      <Tabs.Screen name="diag" options={{ title: 'Diag' }} />
      <Tabs.Screen name="edit/[id]" options={{ title: 'Edit' }} />
    </Tabs>
  );
}

export default function Layout() {
  return (
    <ThemeProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemedTabs />
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
