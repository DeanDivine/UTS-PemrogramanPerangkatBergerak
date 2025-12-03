import { useEffect, useState, useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet, Dimensions, RefreshControl } from 'react-native';
import { loadTasks } from '../src/storage/taskStorage';
import { loadCategories } from '../src/storage/categoryStorage';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { useTheme } from '../src/constants/themeContext';

const screenWidth = Dimensions.get('window').width;

export default function ProgressScreen() {
  const { theme, isDark } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    (async () => {
      setTasks(await loadTasks());
      setCategories(await loadCategories());
    })();
  }, []);

  const refresh = async () => {
    const [ts, cs] = await Promise.all([loadTasks(), loadCategories()]);
    setTasks(ts);
    setCategories(cs);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const { doneCount, todoCount, avgProgress } = useMemo(() => {
    const d = tasks.filter(t => t.status === 'done').length;
    const total = tasks.length || 1;
    const avg = Math.round(
      tasks.reduce((acc, t) => acc + (typeof t.progress === 'number' ? t.progress : 0), 0) / total
    );
    return { doneCount: d, todoCount: tasks.length - d, avgProgress: avg };
  }, [tasks]);

  const barData = useMemo(() => ({
    labels: ['Done', 'In Progress'],
    datasets: [{ data: [doneCount, todoCount] }]
  }), [doneCount, todoCount]);

  const pieData = useMemo(() => {
    const counts = new Map();
    for (const t of tasks) {
      const key = t.category ?? 'Umum';
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    for (const c of categories) if (!counts.has(c.key)) counts.set(c.key, 0);

    const colorOf = (key) => categories.find(c => c.key === key)?.color || theme.subtext;

    const arr = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({
        name,
        population: value,
        color: colorOf(name),
        legendFontColor: theme.text,
        legendFontSize: 12
      }));

    return arr.some(x => x.population > 0)
      ? arr
      : [{
          name: 'Belum ada data',
          population: 1,
          color: theme.progressBackground,
          legendFontColor: theme.text,
          legendFontSize: 12
        }];
  }, [tasks, categories, theme]);

  const chartConfig = {
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `${isDark ? `rgba(241,245,249,${opacity})` : `rgba(15,23,42,${opacity})`}`,
    labelColor: (opacity = 1) => `${isDark ? `rgba(226,232,240,${opacity})` : `rgba(51,65,85,${opacity})`}`,
    propsForBackgroundLines: { strokeDasharray: '', stroke: theme.border },
    barPercentage: 0.6,
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ padding: 16, gap: 16 }}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={[theme.progressFill]} // Android
          tintColor={theme.progressFill} // iOS
        />
      }
    >
      <Text style={[styles.header, { color: theme.text }]}>Progress – Ringkasan</Text>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.kpiTitle, { color: theme.subtext }]}>Rata-rata Progress</Text>
        <Text style={[styles.kpiValue, { color: theme.text }]}>{avgProgress}%</Text>
        <Text style={[styles.kpiSub, { color: theme.subtext }]}>Dari seluruh task</Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, borderRadius: 16, overflow: 'hidden' }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Status Tugas</Text>
        <BarChart
          width={screenWidth - 32}
          height={220}
          data={barData}
          chartConfig={chartConfig}
          fromZero
          style={{ borderRadius: 12 }}
        />
      </View>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Distribusi per Kategori</Text>
        <PieChart
          width={screenWidth - 32}
          height={240}
          data={pieData}
          accessor="population"
          chartConfig={chartConfig}
          backgroundColor="transparent"
          paddingLeft="0"
          hasLegend
          center={[0, 0]}
        />
      </View>

      <Text style={[styles.note, { color: theme.subtext }]}>
        Tip: Update progress lewat tab Edit (slider 0–100) pada tiap task.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  cardTitle: { fontSize: 14, fontWeight: '800' },
  kpiTitle: { fontSize: 12, fontWeight: '700' },
  kpiValue: { fontSize: 28, fontWeight: '900' },
  kpiSub: { fontSize: 12 },
  note: { fontSize: 12, marginBottom: 24 },
});
