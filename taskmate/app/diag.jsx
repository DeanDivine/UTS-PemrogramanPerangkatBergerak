console.log("🔍 diag.jsx file loaded by Expo Router");

import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { API_BASE } from '../src/config/api';
import { loadTasks } from '../src/storage/taskStorage';
import { loadCategories } from '../src/storage/categoryStorage';
import { useTheme } from '../src/constants/themeContext';

export default function Diagnostics() {
  const { theme, isDark } = useTheme();
  const [status, setStatus] = useState({
    api: false,
    tasks: 0,
    cats: 0,
    base: API_BASE,
    err: '',
  });
  const [loading, setLoading] = useState(false);

  const ping = async () => {
    console.log('🔄 Running ping()...');
    setLoading(true);
    try {
      console.log('Fetching from:', `${API_BASE}/health`);
      const res = await fetch(`${API_BASE}/health`);
      console.log('Response status:', res.status);
      const ok = res.ok;
      const [tasks, cats] = await Promise.all([loadTasks(), loadCategories()]);
      console.log('Tasks loaded:', tasks.length, 'Cats loaded:', cats.length);
      setStatus({
        api: ok,
        tasks: tasks.length,
        cats: cats.length,
        base: API_BASE,
        err: '',
      });
    } catch (e) {
      console.error('Ping error:', e);
      setStatus((s) => ({ ...s, err: String(e) }));
      Alert.alert('Network Error', String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🟢 useEffect triggered');
    ping();
  }, []);

  console.log('✅ Diagnostics component is mounted');

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.h, { color: theme.text }]}>Diagnostics</Text>

      <Text style={[styles.kv, { color: theme.subtext }]}>
        API_BASE:{' '}
        <Text style={[styles.mono, { color: theme.text }]}>{status.base}</Text>
      </Text>

      <Text style={[styles.kv, { color: theme.subtext }]}>
        API /health:{' '}
        <Text style={{ color: status.api ? '#16a34a' : theme.danger }}>
          {String(status.api)}
        </Text>
      </Text>

      <Text style={[styles.kv, { color: theme.subtext }]}>
        Tasks fetched:{' '}
        <Text style={{ color: theme.text }}>{status.tasks}</Text>
      </Text>

      <Text style={[styles.kv, { color: theme.subtext }]}>
        Categories fetched:{' '}
        <Text style={{ color: theme.text }}>{status.cats}</Text>
      </Text>

      {status.err ? (
        <Text style={[styles.kv, { color: theme.danger }]}>
          Error: {status.err}
        </Text>
      ) : null}

      <View style={{ height: 16 }} />

      {loading ? (
        <ActivityIndicator color={theme.progressFill} />
      ) : (
        <View
          style={[
            styles.buttonWrap,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
        >
          <Button
            title="Re-run Checks"
            onPress={ping}
            color={isDark ? theme.progressFill : theme.text}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  h: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  kv: { fontSize: 14, marginTop: 6 },
  mono: { fontFamily: 'Courier' },
  buttonWrap: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 4,
    overflow: 'hidden',
  },
});
