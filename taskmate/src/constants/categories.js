// [BARU] Palet warna untuk kategori baru
export const COLOR_PALETTE = [
  '#2563eb', // biru
  '#16a34a', // hijau
  '#f59e0b', // kuning
  '#ef4444', // merah
  '#8b5cf6', '#06b6d4', '#84cc16', '#e11d48'
];

// [BARU] Ambil warna kategori dari daftar dinamis yang ada di storage
export function colorOfName(name, list) {
  const found = list?.find(c => c.key === name);
  return found ? found.color : '#64748b'; // fallback slate
}

// [BARU] Pilih warna otomatis untuk kategori baru berdasarkan urutan
export function pickColor(index) {
  return COLOR_PALETTE[index % COLOR_PALETTE.length];
}
