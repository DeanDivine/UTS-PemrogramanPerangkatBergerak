import { API_BASE } from '../config/api.js';

function normalizeDate(value) {
  if (!value) return null;
  try {
    // keep only yyyy-mm-dd
    return value.split('T')[0];
  } catch {
    return value;
  }
}

// Ambil semua task
export async function loadTasks() {
  try {
    const res = await fetch(`${API_BASE}/tasks`);
    if (!res.ok) return [];
    const data = await res.json();
    // normalize deadlines
    return data.map(task => ({
      ...task,
      deadline: normalizeDate(task.deadline),
    }));
  } catch {
    return [];
  }
}

// Ambil 1 task
export async function getTaskById(id) {
  try {
    const res = await fetch(`${API_BASE}/tasks/${id}`);
    if (!res.ok) return null;
    const task = await res.json();
    return { ...task, deadline: normalizeDate(task.deadline) };
  } catch {
    return null;
  }
}

// Buat task baru
export async function createTask(task) {
  console.log("📡 createTask() called with:", task);

  try {
    const url = `${API_BASE}/tasks`;
    console.log("🌐 Sending POST to:", url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });

    console.log("📬 Response status:", response.status);
    const text = await response.text();
    console.log("📦 Raw response body:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.warn("⚠️ Response not valid JSON");
      data = null;
    }

    if (!response.ok) {
      console.error("❌ Server returned error:", data || text);
      return false;
    }

    console.log("✅ Task successfully sent to server");
    return true;
  } catch (err) {
    console.error("💥 Network or fetch error in createTask:", err);
    return false;
  }
}



// Update task (patch)
export async function updateTask(id, patch) {
  try {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Hapus task
export async function deleteTask(id) {
  try {
    const res = await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}

// Hapus semua task (tanpa endpoint bulk—loop per item)
export async function clearTasks() {
  const items = await loadTasks();
  await Promise.all(items.map(it => deleteTask(it.id)));
}
