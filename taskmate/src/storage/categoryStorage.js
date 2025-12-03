import { API_BASE } from '../config/api.js';

// Ambil kategori
export async function loadCategories() {
  try {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) {
      return [{ key: 'Umum', color: '#334155' }]; // fallback agar UI tetap jalan
    }
    return await res.json();
  } catch {
    return [{ key: 'Umum', color: '#334155' }];
  }
}

// Buat 1 kategori
export async function createCategory(cat) {
  try {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Kompatibilitas nama lama modul (M3): simpan array -> create baru yang belum ada
export async function saveCategories(nextList) {
  const current = await loadCategories();
  const existing = new Set(current.map(c => c.key.toLowerCase()));
  const toCreate = nextList.filter(c => !existing.has(c.key.toLowerCase()));
  await Promise.all(toCreate.map(createCategory));
  return true;
}
