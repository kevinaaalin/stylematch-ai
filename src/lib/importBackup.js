import { encodeLocalDatabase, decodeLocalDatabase } from './localMediaEnvelope.js';

function openBackups() {
  return new Promise((resolve, reject) => {
    let blocked = false;
    const request = indexedDB.open('stylematch-import-backups', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('backups');
    request.onsuccess = () => {
      if (blocked) request.result.close();
      else resolve(request.result);
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () => {
      blocked = true;
      reject(new Error('備份資料庫被其他分頁占用，請關閉其他分頁後重試。'));
    };
  });
}

export async function saveImportBackup(backup) {
  const encoded = encodeLocalDatabase(backup);
  const db = await openBackups();
  try {
    await new Promise((resolve, reject) => {
      const transaction = db.transaction('backups', 'readwrite');
      const store = transaction.objectStore('backups');
      const id = crypto.randomUUID();
      store.add(encoded, id);
      store.put(id, 'latest');
      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(transaction.error || new Error('匯入前備份未完成，案件資料未更動。'));
      transaction.onerror = () => {};
    });
  } finally { db.close(); }
}

export async function readLatestImportBackup() {
  const db = await openBackups();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction('backups', 'readonly');
      const store = transaction.objectStore('backups');
      let raw;
      const latest = store.get('latest');
      latest.onsuccess = () => {
        if (latest.result) {
          const value = store.get(latest.result);
          value.onsuccess = () => { raw = value.result; };
        }
      };
      transaction.oncomplete = () => {
        try { resolve(raw ? decodeLocalDatabase(raw) : null); } catch (error) { reject(error); }
      };
      transaction.onabort = () => reject(transaction.error);
      transaction.onerror = () => {};
    });
  } finally { db.close(); }
}
