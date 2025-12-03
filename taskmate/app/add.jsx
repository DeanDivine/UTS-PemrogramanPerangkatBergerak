import * as Crypto from 'expo-crypto';
import { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { loadCategories, saveCategories } from '../src/storage/categoryStorage';
import { createTask } from '../src/storage/taskStorage';
import AddCategoryModal from '../src/components/AddCategoryModal';
import { pickColor } from '../src/constants/categories';
import { PRIORITIES } from '../src/constants/priorities';
import { useTheme } from '../src/constants/themeContext';
import ModalSelector from 'react-native-modal-selector';

export default function Add() {
  const router = useRouter();
  const { theme } = useTheme(); // 👈 get current theme

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [deadline, setDeadline] = useState('2025-09-30');
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('Umum');
  const [showCatModal, setShowCatModal] = useState(false);
  const [priority, setPriority] = useState('Low');


  useEffect(() => {
    (async () => setCategories(await loadCategories()))();
  }, []);

  const handleAdd = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Judul wajib diisi!');
      return;
    }

    const id = await Crypto.randomUUID();
    const newTask = {
      id,
      title,
      description: desc,
      deadline,
      category,
      priority,
      status: 'pending',
      progress: 0,
    };

    const ok = await createTask(newTask);
    if (!ok) {
      Alert.alert('Error', 'Gagal menyimpan ke server');
      return;
    }

    setTitle('');
    setDesc('');
    setDeadline('2025-09-30');
    setCategory('Umum');
    setPriority('Low');
    router.replace('/');
  };

  const onSubmitCategory = async ({ key, color }) => {
    if (categories.some(c => c.key.toLowerCase() === key.toLowerCase())) {
      Alert.alert('Info', 'Kategori sudah ada.');
      setShowCatModal(false);
      return;
    }
    const next = [...categories, { key, color: color || pickColor(categories.length) }];
    await saveCategories(next);
    setCategories(next);
    setCategory(key);
    setShowCatModal(false);
  };

  const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: theme.background },
    title: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: theme.text },
    label: { marginTop: 12, fontWeight: '600', color: theme.text },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      padding: 10,
      marginTop: 6,
      backgroundColor: theme.card,
      color: theme.text,
    },
    pickerWrap: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      marginTop: 6,
      backgroundColor: theme.card,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tambah Tugas</Text>

      <Text style={styles.label}>Judul</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Contoh: Tugas Mobile"
        placeholderTextColor={theme.subtext}
      />

      <Text style={styles.label}>Deskripsi</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={desc}
        onChangeText={setDesc}
        placeholder="Deskripsi singkat"
        multiline
        placeholderTextColor={theme.subtext}
      />

      <Text style={styles.label}>Deadline (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        value={deadline}
        onChangeText={setDeadline}
        placeholder="2025-09-30"
        placeholderTextColor={theme.subtext}
      />

      <Text style={styles.label}>Kategori</Text>
      <View style={styles.pickerWrap}>
        <Picker
          selectedValue={category}
          onValueChange={(val) => {
            if (val === '__ADD__') {
              setShowCatModal(true);
              return;
            }
            setCategory(val);
          }}
          dropdownIconColor={theme.text}
          style={{ color: theme.text }}
        >
          {categories.map(k => (
            <Picker.Item key={k.key} label={k.key} value={k.key} />
          ))}
          <Picker.Item label="＋ Tambah kategori…" value="__ADD__" />
        </Picker>
      </View>

      <Text style={styles.label}>Prioritas</Text>
      <View style={styles.pickerWrap}>
        <Picker
          selectedValue={priority}
          onValueChange={setPriority}
          dropdownIconColor={theme.text}
          style={{ color: theme.text }}
        >
          {PRIORITIES.map(p => (
            <Picker.Item key={p} label={p} value={p} />
          ))}
        </Picker>
      </View>

      <Button title="Simpan Tugas" onPress={handleAdd} color={theme.progressFill} />

      <AddCategoryModal
        visible={showCatModal}
        onClose={() => setShowCatModal(false)}
        onSubmit={onSubmitCategory}
        suggestedColor={pickColor(categories.length)}
      />
    </View>
  );
}
