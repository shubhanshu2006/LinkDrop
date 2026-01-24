// IndexedDB utility for offline file storage with expiry management

const DB_NAME = "LinkDropOfflineFiles";
const DB_VERSION = 1;
const STORE_NAME = "offlineFiles";

export interface OfflineFile {
  id: string;
  fileId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  blob: Blob;
  savedAt: number; // timestamp
  expiresAt: number; // timestamp
  originalName: string;
  userId?: string; // User ID to isolate files per user
}

// Initialize IndexedDB
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        objectStore.createIndex("fileId", "fileId", { unique: false });
        objectStore.createIndex("expiresAt", "expiresAt", { unique: false });
      }
    };
  });
};

// Save file to IndexedDB with expiry duration
export const saveFileOffline = async (
  fileId: string,
  fileName: string,
  fileType: string,
  fileSize: number,
  blob: Blob,
  durationInMinutes: number,
  userId?: string
): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction([STORE_NAME], "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  const now = Date.now();
  const expiresAt = now + durationInMinutes * 60 * 1000;

  const offlineFile: OfflineFile = {
    id: `${fileId}-${now}`, // Unique ID for each save
    fileId,
    fileName,
    fileType,
    fileSize,
    blob,
    savedAt: now,
    expiresAt,
    originalName: fileName,
    userId, // Associate file with user
  };

  return new Promise((resolve, reject) => {
    const request = store.add(offlineFile);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Get all offline files for a specific user (including expired ones for display)
export const getAllOfflineFiles = async (
  userId?: string
): Promise<OfflineFile[]> => {
  const db = await initDB();
  const transaction = db.transaction([STORE_NAME], "readonly");
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      let files = request.result;
      // Filter by userId if provided
      if (userId) {
        files = files.filter((file) => file.userId === userId);
      }
      resolve(files);
    };
    request.onerror = () => reject(request.error);
  });
};

// Get a specific offline file by ID
export const getOfflineFile = async (
  id: string
): Promise<OfflineFile | null> => {
  const db = await initDB();
  const transaction = db.transaction([STORE_NAME], "readonly");
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
};

// Delete a specific offline file
export const deleteOfflineFile = async (id: string): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction([STORE_NAME], "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Delete all expired files
export const deleteExpiredFiles = async (): Promise<number> => {
  const db = await initDB();
  const transaction = db.transaction([STORE_NAME], "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  const index = store.index("expiresAt");

  const now = Date.now();
  let deletedCount = 0;

  return new Promise((resolve, reject) => {
    const request = index.openCursor();

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        const file = cursor.value as OfflineFile;
        if (file.expiresAt <= now) {
          cursor.delete();
          deletedCount++;
        }
        cursor.continue();
      } else {
        resolve(deletedCount);
      }
    };

    request.onerror = () => reject(request.error);
  });
};

// Check if a file is expired
export const isFileExpired = (file: OfflineFile): boolean => {
  return file.expiresAt <= Date.now();
};

// Get storage usage estimate
export const getStorageEstimate = async (): Promise<{
  usage: number;
  quota: number;
  percentage: number;
}> => {
  if ("storage" in navigator && "estimate" in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || 0;
    const percentage = quota > 0 ? (usage / quota) * 100 : 0;
    return { usage, quota, percentage };
  }
  return { usage: 0, quota: 0, percentage: 0 };
};

// Format bytes to human-readable size
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

// Format time remaining
export const getTimeRemaining = (expiresAt: number): string => {
  const now = Date.now();
  const diff = expiresAt - now;

  if (diff <= 0) return "Expired";

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m`;
  return "< 1m";
};

// Auto-cleanup expired files - runs periodically
export const startAutoCleanup = (): void => {
  // Run cleanup immediately on startup
  deleteExpiredFiles().catch((error) => {
    console.error("Failed to auto-cleanup expired files:", error);
  });

  // Run cleanup every 5 minutes
  setInterval(
    async () => {
      try {
        const deletedCount = await deleteExpiredFiles();
        if (deletedCount > 0) {
          console.log(`Auto-cleanup: Deleted ${deletedCount} expired file(s)`);
        }
      } catch (error) {
        console.error("Failed to auto-cleanup expired files:", error);
      }
    },
    5 * 60 * 1000
  ); // 5 minutes
};
