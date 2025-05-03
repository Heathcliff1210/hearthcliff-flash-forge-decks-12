
/**
 * Service de gestion du stockage des médias dans IndexedDB
 */

// Constantes de configuration de la base de données
const DB_NAME = 'MediaDB';
const DB_VERSION = 1;
const IMAGES_STORE = 'imagesStore';
const AUDIO_STORE = 'audioStore';

// Interface pour la gestion des erreurs
interface DBError {
  message: string;
  error?: Error;
}

// Type pour les callbacks de résultats
type ResultCallback<T> = (result: T | null, error: DBError | null) => void;

/**
 * Ouvre une connexion à la base de données IndexedDB
 */
const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Erreur lors de l\'ouverture de la base de données:', request.error);
      reject(request.error);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      // Création des object stores si besoin
      if (!db.objectStoreNames.contains(IMAGES_STORE)) {
        db.createObjectStore(IMAGES_STORE);
      }
      
      if (!db.objectStoreNames.contains(AUDIO_STORE)) {
        db.createObjectStore(AUDIO_STORE);
      }
    };

    request.onsuccess = (event) => {
      const db = request.result;
      
      db.onerror = (event) => {
        console.error('Erreur de base de données:', (event.target as IDBRequest).error);
      };
      
      resolve(db);
    };
  });
};

/**
 * Stocke une image (Blob) dans IndexedDB
 */
export const storeImage = async (imageId: string, imageBlob: Blob): Promise<boolean> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([IMAGES_STORE], 'readwrite');
      const store = transaction.objectStore(IMAGES_STORE);
      const request = store.put(imageBlob, imageId);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => {
        console.error('Erreur lors du stockage de l\'image:', request.error);
        reject(request.error);
      };
      
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Erreur dans storeImage:', error);
    return false;
  }
};

/**
 * Stocke un fichier audio (Blob) dans IndexedDB
 */
export const storeAudio = async (audioId: string, audioBlob: Blob): Promise<boolean> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([AUDIO_STORE], 'readwrite');
      const store = transaction.objectStore(AUDIO_STORE);
      const request = store.put(audioBlob, audioId);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => {
        console.error('Erreur lors du stockage de l\'audio:', request.error);
        reject(request.error);
      };
      
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Erreur dans storeAudio:', error);
    return false;
  }
};

/**
 * Récupère une image depuis IndexedDB
 */
export const getImage = async (imageId: string): Promise<Blob | null> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([IMAGES_STORE], 'readonly');
      const store = transaction.objectStore(IMAGES_STORE);
      const request = store.get(imageId);
      
      request.onsuccess = () => {
        const result = request.result as Blob;
        resolve(result || null);
      };
      
      request.onerror = () => {
        console.error('Erreur lors de la récupération de l\'image:', request.error);
        reject(request.error);
      };
      
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Erreur dans getImage:', error);
    return null;
  }
};

/**
 * Récupère un fichier audio depuis IndexedDB
 */
export const getAudio = async (audioId: string): Promise<Blob | null> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([AUDIO_STORE], 'readonly');
      const store = transaction.objectStore(AUDIO_STORE);
      const request = store.get(audioId);
      
      request.onsuccess = () => {
        const result = request.result as Blob;
        resolve(result || null);
      };
      
      request.onerror = () => {
        console.error('Erreur lors de la récupération de l\'audio:', request.error);
        reject(request.error);
      };
      
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Erreur dans getAudio:', error);
    return null;
  }
};

/**
 * Supprime une image depuis IndexedDB
 */
export const deleteImage = async (imageId: string): Promise<boolean> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([IMAGES_STORE], 'readwrite');
      const store = transaction.objectStore(IMAGES_STORE);
      const request = store.delete(imageId);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => {
        console.error('Erreur lors de la suppression de l\'image:', request.error);
        reject(request.error);
      };
      
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Erreur dans deleteImage:', error);
    return false;
  }
};

/**
 * Supprime un fichier audio depuis IndexedDB
 */
export const deleteAudio = async (audioId: string): Promise<boolean> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([AUDIO_STORE], 'readwrite');
      const store = transaction.objectStore(AUDIO_STORE);
      const request = store.delete(audioId);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => {
        console.error('Erreur lors de la suppression de l\'audio:', request.error);
        reject(request.error);
      };
      
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Erreur dans deleteAudio:', error);
    return false;
  }
};

/**
 * Vérifie si un média existe dans IndexedDB
 */
export const mediaExists = async (id: string, type: 'image' | 'audio'): Promise<boolean> => {
  try {
    const store = type === 'image' ? IMAGES_STORE : AUDIO_STORE;
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([store], 'readonly');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.count(id);
      
      request.onsuccess = () => resolve(request.result > 0);
      request.onerror = () => {
        console.error(`Erreur lors de la vérification du média ${type}:`, request.error);
        reject(request.error);
      };
      
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error(`Erreur dans mediaExists (${type}):`, error);
    return false;
  }
};

/**
 * Convertit une chaîne base64 en Blob
 */
export const base64ToBlob = (base64: string, contentType: string = ''): Blob => {
  // Extrait la partie données de la chaîne base64
  const base64Data = base64.includes('base64,') 
    ? base64.split('base64,')[1] 
    : base64;
  
  // Décode la chaîne base64
  const byteCharacters = atob(base64Data);
  const byteArrays = [];
  
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  
  // Détermine le type MIME à partir de la chaîne base64 si non spécifié
  if (!contentType && base64.includes('data:')) {
    contentType = base64.split(';')[0].split(':')[1];
  }
  
  return new Blob(byteArrays, { type: contentType });
};

/**
 * Convertit un Blob en chaîne base64 (pour la compatibilité descendante)
 */
export const blobToBase64 = async (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Crée un ID unique pour un média
 */
export const generateMediaId = (prefix: 'img' | 'aud'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
};

/**
 * Vérifie si une chaîne est au format base64 (pour la migration)
 */
export const isBase64String = (str: string | undefined): boolean => {
  if (!str) return false;
  return str.startsWith('data:') && str.includes('base64,');
};

/**
 * Migre les médias en base64 vers IndexedDB
 * @returns Objet avec les nouveaux IDs de médias
 */
export const migrateBase64MediaToIndexedDB = async (
  imageBase64?: string,
  audioBase64?: string
): Promise<{ imageId?: string, audioId?: string }> => {
  const result: { imageId?: string, audioId?: string } = {};
  
  try {
    // Migre l'image si présente
    if (isBase64String(imageBase64)) {
      const imageId = generateMediaId('img');
      const contentType = imageBase64!.split(';')[0].split(':')[1];
      const imageBlob = base64ToBlob(imageBase64!, contentType);
      const success = await storeImage(imageId, imageBlob);
      
      if (success) {
        result.imageId = imageId;
      }
    }
    
    // Migre l'audio si présent
    if (isBase64String(audioBase64)) {
      const audioId = generateMediaId('aud');
      const contentType = audioBase64!.split(';')[0].split(':')[1];
      const audioBlob = base64ToBlob(audioBase64!, contentType);
      const success = await storeAudio(audioId, audioBlob);
      
      if (success) {
        result.audioId = audioId;
      }
    }
    
    return result;
  } catch (error) {
    console.error('Erreur lors de la migration des médias:', error);
    return result;
  }
};
