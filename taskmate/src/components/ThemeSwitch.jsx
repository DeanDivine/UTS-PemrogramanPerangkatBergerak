import React from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../constants/themeContext';

export default function ThemeSwitch() {
  const { isDark, toggleTheme, theme } = useTheme();
  const offset = useSharedValue(isDark ? 24 : 0);

  // Animate thumb position when toggling
  React.useEffect(() => {
    offset.value = withTiming(isDark ? 24 : 0, { duration: 200 });
  }, [isDark]);

  const thumbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  return (
    <Pressable
      onPress={toggleTheme}
      style={{
        width: 60,
        height: 32,
        borderRadius: 16,
        backgroundColor: isDark ? '#334155' : '#e2e8f0',
        justifyContent: 'center',
        paddingHorizontal: 4,
      }}
    >
      <Animated.View
        style={[
          {
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: isDark ? '#facc15' : '#f8fafc',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
          },
          thumbAnimatedStyle,
        ]}
      >
        <MaterialCommunityIcons
          name={isDark ? 'weather-night' : 'white-balance-sunny'}
          size={16}
          color={isDark ? '#1e293b' : '#fbbf24'}
        />
      </Animated.View>
    </Pressable>
  );
}
