import { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getTaskById, updateTask } from '../../src/storage/taskStorage';
import { loadCategories } from '../../src/storage/categoryStorage';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import { PRIORITIES } from '../../src/constants/priorities';
import { useTheme } from '../../src/constants/themeContext';

export default function EditTask() {
  const { theme, isDark } = useTheme();
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('Umum');
  const [priority, setPriority] = useState('Low');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    (async () => {
      const t = await getTaskById(id);
      const cats = await loadCategories();
      setCategories(cats);
      if (!t) {
        Alert.alert('Error', 'Task tidak ditemukan', [
          {
            text: 'OK',
            onPress: () => router.replace('/'),
          },
        ]);
        return;
      }
      setTitle(t.title || '');
      setDesc(t.description || '');
      setDeadline(t.deadline || '');
      setCategory(t.category || 'Umum');
      setPriority(t.priority || 'Low');
      setProgress(typeof t.progress === 'number' ? t.progress : 0);
    })();
  }, [id]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Judul wajib diisi!');
      return;
    }
    const ok = await updateTask(id, {
      title,
      description: desc,
      deadline,
      category,
      priority,
      progress: Math.round(progress),
    });
    if (!ok) {
      Alert.alert('Error', 'Gagal menyimpan');
      return;
    }
    Alert.alert('Sukses', 'Perubahan disimpan.');
    router.replace('/');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Edit Tugas</Text>

      <Text style={[styles.label, { color: theme.text }]}>Judul</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            color: theme.text,
          },
        ]}
        value={title}
        onChangeText={setTitle}
        placeholder="Judul"
        placeholderTextColor={theme.subtext}
      />

      <Text style={[styles.label, { color: theme.text }]}>Deskripsi</Text>
      <TextInput
        style={[
          styles.input,
          {
            height: 80,
            backgroundColor: theme.card,
            borderColor: theme.border,
            color: theme.text,
          },
        ]}
        value={desc}
        onChangeText={setDesc}
        placeholder="Deskripsi"
        placeholderTextColor={theme.subtext}
        multiline
      />

      <Text style={[styles.label, { color: theme.text }]}>Deadline (YYYY-MM-DD)</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            color: theme.text,
          },
        ]}
        value={deadline}
        onChangeText={setDeadline}
        placeholder="2025-10-05"
        placeholderTextColor={theme.subtext}
      />

      <Text style={[styles.label, { color: theme.text }]}>Kategori</Text>
      <View
        style={[
          styles.pickerWrap,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <Picker
          selectedValue={category}
          onValueChange={setCategory}
          dropdownIconColor={theme.text}
          style={{ color: theme.text }}
        >
          {categories.map((k) => (
            <Picker.Item key={k.key} label={k.key} value={k.key} color={theme.text} />
          ))}
        </Picker>
      </View>

      <Text style={[styles.label, { color: theme.text }]}>Prioritas</Text>
      <View
        style={[
          styles.pickerWrap,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <Picker
          selectedValue={priority}
          onValueChange={setPriority}
          dropdownIconColor={theme.text}
          style={{ color: theme.text }}
        >
          {PRIORITIES.map((p) => (
            <Picker.Item key={p} label={p} value={p} color={theme.text} />
          ))}
        </Picker>
      </View>

      <Text style={[styles.label, { color: theme.text }]}>
        Progress: {Math.round(progress)}%
      </Text>
      <Slider
        style={{ width: '100%', height: 40 }}
        minimumValue={0}
        maximumValue={100}
        step={1}
        value={progress}
        onValueChange={setProgress}
        minimumTrackTintColor={theme.progressFill}
        maximumTrackTintColor={theme.progressBackground}
        thumbTintColor={theme.progressFill}
      />

      <View style={{ marginTop: 20 }}>
        <Button
          title="Simpan Perubahan"
          onPress={handleSave}
          color={isDark ? theme.progressFill : '#2563eb'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  label: { marginTop: 12, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },
  pickerWrap: {
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 6,
  },
});
