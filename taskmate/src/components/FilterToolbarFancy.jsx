import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../constants/themeContext'; // adjust path if needed

// [SUB] Komponen pill (tombol oval) yang menampilkan label + nilai terpilih
function Pill({ label, value, onPress, theme }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.pill,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          shadowColor: theme.mode === 'dark' ? '#000' : '#000',
        },
      ]}
    >
      <Text style={[styles.pillLabel, { color: theme.subtext }]}>{label}</Text>
      <Text
        style={[styles.pillValue, { color: theme.text }]}
        numberOfLines={1}
      >
        {value}
      </Text>
      <Ionicons
        name="chevron-down"
        size={16}
        color={theme.text}
        style={{ opacity: 0.8 }}
      />
    </TouchableOpacity>
  );
}

// [SUB] Bottom sheet sederhana untuk menampilkan daftar opsi
function BottomPicker({ visible, title, options = [], current, onSelect, onClose, theme }) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.sheetBackdrop}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <SafeAreaView
          style={[
            styles.sheet,
            {
              backgroundColor: theme.card,
              borderTopColor: theme.border,
            },
          ]}
        >
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: theme.text }]}>{title}</Text>
            <Ionicons name="close" size={22} color={theme.text} onPress={onClose} />
          </View>

          <FlatList
            data={options}
            keyExtractor={(it) => String(it.value)}
            renderItem={({ item }) => {
              const selected = item.value === current;
              return (
                <TouchableOpacity
                  style={[
                    styles.optionRow,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.border,
                    },
                    selected && {
                      backgroundColor: theme.statusColors.today.bg,
                      borderColor: theme.statusColors.today.border,
                    },
                  ]}
                  onPress={() => {
                    onSelect?.(item.value);
                    onClose?.();
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: selected
                          ? theme.statusColors.today.text
                          : theme.text,
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                  {selected ? (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={theme.statusColors.today.text}
                    />
                  ) : null}
                </TouchableOpacity>
              );
            }}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
}

/**
 * FilterToolbarFancy
 * - themed version using global ThemeContext
 */
export default function FilterToolbarFancy({
  categories = [],
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
}) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(null);

  // Options
  const catOptions = useMemo(
    () => [
      { label: 'All Categories', value: 'all' },
      ...categories.map((c) => ({ label: c.key, value: c.key })),
    ],
    [categories]
  );

  const statusOptions = [
    { label: 'All', value: 'all' },
    { label: 'In Progress', value: 'todo' },
    { label: 'Done', value: 'done' },
  ];

  const prioOptions = [
    { label: 'All', value: 'all' },
    { label: 'High', value: 'High' },
    { label: 'Medium', value: 'Medium' },
    { label: 'Low', value: 'Low' },
  ];

  // Display text
  const catValueText = categoryFilter === 'all' ? 'All' : categoryFilter;
  const statusValueText =
    statusFilter === 'all'
      ? 'All'
      : statusFilter === 'todo'
      ? 'In Progress'
      : 'Done';
  const prioValueText = priorityFilter === 'all' ? 'All' : priorityFilter;

  return (
    <View style={[styles.wrap, { backgroundColor: theme.background }]}>
      <Pill label="Category" value={catValueText} onPress={() => setOpen('cat')} theme={theme} />
      <Pill label="Progress" value={statusValueText} onPress={() => setOpen('status')} theme={theme} />
      <Pill label="Priority" value={prioValueText} onPress={() => setOpen('prio')} theme={theme} />

      {/* Modals */}
      <BottomPicker
        visible={open === 'cat'}
        title="Choose Category"
        options={catOptions}
        current={categoryFilter}
        onSelect={setCategoryFilter}
        onClose={() => setOpen(null)}
        theme={theme}
      />
      <BottomPicker
        visible={open === 'status'}
        title="Set Progress"
        options={statusOptions}
        current={statusFilter}
        onSelect={setStatusFilter}
        onClose={() => setOpen(null)}
        theme={theme}
      />
      <BottomPicker
        visible={open === 'prio'}
        title="Set Priority"
        options={prioOptions}
        current={priorityFilter}
        onSelect={setPriorityFilter}
        onClose={() => setOpen(null)}
        theme={theme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', gap: 10 },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  pillLabel: { fontSize: 12, fontWeight: '600' },
  pillValue: { fontSize: 13, flex: 1, fontWeight: '700' },

  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '60%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sheetTitle: { fontSize: 16, fontWeight: '700' },
  optionRow: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionText: { fontWeight: '600' },
});
