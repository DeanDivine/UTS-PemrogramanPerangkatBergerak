import { useEffect, useState, useMemo } from 'react';
import { SafeAreaView, Text, SectionList, StyleSheet, View, Button, Alert, TouchableOpacity } from 'react-native';
import TaskItem from '../src/components/TaskItem';
import FilterToolbarFancy from '../src/components/FilterToolbarFancy';
import AddCategoryModal from '../src/components/AddCategoryModal';
import { loadTasks, updateTask, deleteTask, clearTasks as clearAllTasks } from '../src/storage/taskStorage';
import { loadCategories, saveCategories } from '../src/storage/categoryStorage';
import { pickColor } from '../src/constants/categories';
import { weightOfPriority } from '../src/constants/priorities';
import { useTheme } from '../src/constants/themeContext';
import ThemeSwitch from '../src/components/ThemeSwitch';

export default function Home() {
  // DATA
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);

  // FILTER
  const [statusFilter, setStatusFilter] = useState('all'); // all|todo|done
  const [categoryFilter, setCategoryFilter] = useState('all'); // all|Umum|...
  const [priorityFilter, setPriorityFilter] = useState('all'); // all|Low|Medium|High

  //REFRESH
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Modal tambah kategori
  const [showCatModal, setShowCatModal] = useState(false);

  const refresh = async () => {
    const [ts, cs] = await Promise.all([loadTasks(), loadCategories()]);
    setTasks(ts);
    setCategories(cs);
  };

  //Toggle Dark/Light Mode
  const { theme, toggleTheme, isDark } = useTheme();



  useEffect(() => { refresh(); }, []);

  // Manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => setIsRefreshing(false), 400); // small delay for smoother UI
  };

  // Toggle status (server)
  const handleToggle = async (task) => {
    const next = task.status === 'done' ? 'pending' : 'done';
    const ok = await updateTask(task.id, { status: next });
    if (ok) {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: next } : t));
    } else {
      Alert.alert('Error', 'Gagal memperbarui status di server');
    }
  };

  // Hapus task (server)
  const handleDelete = async (task) => {
    const ok = await deleteTask(task.id);
    if (ok) setTasks(prev => prev.filter(t => t.id !== task.id));
    else Alert.alert('Error', 'Gagal menghapus di server');
  };

  // Ringkasan
  const doneCount = useMemo(() => tasks.filter(t => t.status === 'done').length, [tasks]);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const overdueCount = useMemo(
    () => tasks.filter(t => t.deadline && t.deadline < today && t.status !== 'done').length,
    [tasks, today]
  );

  // Clear
  const handleClearDone = () => {
    if (!doneCount) { Alert.alert('Info', 'Tidak ada tugas Done.'); return; }
    Alert.alert('Hapus Tugas Selesai', `Yakin hapus ${doneCount} tugas selesai?`, [
      { text: 'Batal' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          const toDelete = tasks.filter(t => t.status === 'done');
          await Promise.all(toDelete.map(t => deleteTask(t.id)));
          setTasks(prev => prev.filter(t => t.status !== 'done'));
        }
      }
    ]);
  };

  const handleClearAll = () => {
    if (!tasks.length) { Alert.alert('Info', 'Daftar tugas kosong.'); return; }
    Alert.alert('Konfirmasi', 'Hapus semua tugas?', [
      { text: 'Batal' },
      {
        text: 'Ya',
        onPress: async () => {
          await clearAllTasks();
          setTasks([]);
        }
      }
    ]);
  };

  // Filter
  const filtered = useMemo(() => {
    return tasks.filter(t => {
      const byStatus =
        statusFilter === 'all' ||
        (statusFilter === 'todo' ? t.status !== 'done' : t.status === 'done');
      const byCategory = categoryFilter === 'all' || (t.category ?? 'Umum') === categoryFilter;
      const byPriority = priorityFilter === 'all' || (t.priority ?? 'Low') === priorityFilter;
      return byStatus && byCategory && byPriority;
    });
  }, [tasks, statusFilter, categoryFilter, priorityFilter]);

  // Sort: priority weight desc, deadline asc
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const wa = weightOfPriority(a.priority ?? 'Low');
      const wb = weightOfPriority(b.priority ?? 'Low');
      if (wa !== wb) return wb - wa;
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });
  }, [filtered]);

  // Grouping -> SectionList
  const sections = useMemo(() => {
    const map = new Map();
    for (const t of sorted) {
      const key = t.category ?? 'Umum';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(t);
    }
    const entries = categoryFilter === 'all'
      ? [...map.entries()]
      : [[categoryFilter, map.get(categoryFilter) || []]];
    return entries.map(([title, data]) => ({ title, data }));
  }, [sorted, categoryFilter]);

  // Tambah kategori dari Home (opsional)
  const handleSubmitCategory = async (cat) => {
    if (categories.some(c => c.key.toLowerCase() === cat.key.toLowerCase())) {
      Alert.alert('Info', 'Nama kategori sudah ada.');
      setShowCatModal(false);
      return;
    }
    const color = cat.color || pickColor(categories.length);
    const next = [...categories, { key: cat.key, color }];
    await saveCategories(next);
    setCategories(next);
    setCategoryFilter(cat.key);
    setShowCatModal(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.container }]}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
        }}
      >
        <Text style={[styles.header, { color: theme.text }]}>
          TaskMate – Daftar Tugas
        </Text>
        <ThemeSwitch />
      </View>

      {/* Toolbar Filter */}
      <View style={{ paddingHorizontal: 16, gap: 12 }}>
        <FilterToolbarFancy
          categories={categories}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          theme={theme}
        />

        {/* Summary Toolbar */}
        <View
          style={[
            styles.toolbar,
            {
              borderColor: theme.border,
              backgroundColor: theme.card,
            },
          ]}
        >
          <Text style={[styles.toolbarText, { color: theme.indexToolbarText || theme.text }]}>
            Done: {doneCount} / {tasks.length}
          </Text>

          <Text
            style={[
              styles.toolbarText,
              { color: overdueCount ? theme.danger : theme.text },
            ]}
          >
            Overdue: {overdueCount}
          </Text>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button
              title="Clear Done"
              onPress={handleClearDone}
              disabled={!doneCount}
              color={theme.progressFill}
            />
            <Button
              title="Clear All"
              onPress={handleClearAll}
              color={theme.danger}
            />
          </View>
        </View>
      </View>

      {/* Task List */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={[styles.sectionHeader, { color: theme.text }]}>{title}</Text>
        )}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            categories={categories}
            onToggle={handleToggle}
            onDelete={handleDelete}
            theme={theme} // ensure TaskItem uses theme.statusColors
          />
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: theme.subtext }}>
            Tidak ada tugas
          </Text>
        }
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
      />

      {/* Add Category Modal */}
      <AddCategoryModal
        visible={showCatModal}
        onClose={() => setShowCatModal(false)}
        onSubmit={handleSubmitCategory}
        suggestedColor={pickColor(categories.length)}
        theme={theme}
      />
    </SafeAreaView>

  );

}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { fontSize: 20, fontWeight: '700', padding: 16 },
  toolbar: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  toolbarText: { fontWeight: '600' },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
});
