import { v4 as uuidv4 } from 'uuid';
import {
  storeImage,
  storeAudio,
  getImage,
  getAudio,
  deleteImage,
  deleteAudio,
  mediaExists,
  base64ToBlob,
  blobToBase64,
  generateMediaId
} from './indexedDBStorage';

// Interfaces de données
export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  createdAt: number;
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  coverImageId?: string; // Référence à l'image stockée dans IndexedDB
  tags: string[];
  authorId: string;
  authorName: string;
  isPublic: boolean;
  createdAt: number;
  updatedAt: number;
  isShared?: boolean;
  originalId?: string;
  isPublished?: boolean;
}

export interface Theme {
  id: string;
  deckId: string;
  title: string;
  description: string;
  coverImage?: string;
  coverImageId?: string; // Référence à l'image stockée dans IndexedDB
  createdAt: number;
  updatedAt: number;
}

export interface FlashcardSide {
  text: string;
  image?: string;
  imageId?: string; // Référence à l'image stockée dans IndexedDB
  audio?: string;
  audioId?: string; // Référence à l'audio stocké dans IndexedDB
  additionalInfo?: string;
}

export interface Flashcard {
  id: string;
  deckId: string;
  themeId?: string;
  front: FlashcardSide;
  back: FlashcardSide;
  createdAt: number;
  updatedAt: number;
  lastReviewed?: number;
  reviewCount?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface StudySession {
  id: string;
  deckId: string;
  userId: string;
  startTime: number;
  endTime?: number;
  cardsReviewed: number;
  correctAnswers: number;
  incorrectAnswers: number;
}

export interface SharedDeckExport {
  id: string;
  originalId: string;
  title: string;
  description: string;
  themes: Theme[];
  flashcards: Flashcard[];
  createdAt: number;
  updatedAt: number;
}

// Exporter la fonction isBase64String pour qu'elle soit utilisable par d'autres modules
export const isBase64String = (str: string | undefined): boolean => {
  if (!str) return false;
  return str.startsWith('data:') && str.includes('base64,');
};

// Fonctions utilitaires
export function getLocalStorageItem(key: string) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Erreur lors de la récupération de ${key} depuis localStorage:`, error);
    return null;
  }
}

export function setLocalStorageItem(key: string, value: any) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Erreur lors de l'enregistrement de ${key} dans localStorage:`, error);
    return false;
  }
}

// Fonction pour extraire et stocker les médias d'une flashcard dans IndexedDB
async function processFlashcardMedia(side: FlashcardSide): Promise<FlashcardSide> {
  const result = { ...side };

  try {
    // Traitement de l'image
    if (isBase64String(side.image)) {
      // L'image est en base64, la migrer vers IndexedDB
      const imageId = generateMediaId('img');
      const contentType = side.image!.split(';')[0].split(':')[1];
      const imageBlob = base64ToBlob(side.image!, contentType);
      const success = await storeImage(imageId, imageBlob);
      
      if (success) {
        result.imageId = imageId;
        // Garde une référence temporaire à l'image pour l'affichage immédiat
        // mais elle sera supprimée lors du chargement suivant
        result.image = side.image;
      }
    } else if (side.imageId) {
      // L'imageId existe déjà, vérifier si l'image existe dans IndexedDB
      const exists = await mediaExists(side.imageId, 'image');
      if (!exists && side.image) {
        // L'image n'existe pas dans IndexedDB mais nous avons une image en base64
        if (isBase64String(side.image)) {
          const contentType = side.image.split(';')[0].split(':')[1];
          const imageBlob = base64ToBlob(side.image, contentType);
          await storeImage(side.imageId, imageBlob);
        }
      }
    }
    
    // Traitement de l'audio
    if (isBase64String(side.audio)) {
      // L'audio est en base64, le migrer vers IndexedDB
      const audioId = generateMediaId('aud');
      const contentType = side.audio!.split(';')[0].split(':')[1];
      const audioBlob = base64ToBlob(side.audio!, contentType);
      const success = await storeAudio(audioId, audioBlob);
      
      if (success) {
        result.audioId = audioId;
        // Garde une référence temporaire à l'audio pour l'affichage immédiat
        result.audio = side.audio;
      }
    } else if (side.audioId) {
      // L'audioId existe déjà, vérifier si l'audio existe dans IndexedDB
      const exists = await mediaExists(side.audioId, 'audio');
      if (!exists && side.audio) {
        // L'audio n'existe pas dans IndexedDB mais nous avons un audio en base64
        if (isBase64String(side.audio)) {
          const contentType = side.audio.split(';')[0].split(':')[1];
          const audioBlob = base64ToBlob(side.audio, contentType);
          await storeAudio(side.audioId, audioBlob);
        }
      }
    }
  } catch (error) {
    console.error('Erreur lors du traitement des médias:', error);
  }

  return result;
}

// Fonction pour charger les médias d'une flashcard depuis IndexedDB
export async function loadFlashcardMedia(card: Flashcard): Promise<Flashcard> {
  const result = { ...card };

  try {
    // Chargement des médias front
    if (card.front.imageId) {
      const imageBlob = await getImage(card.front.imageId);
      if (imageBlob) {
        result.front.image = await blobToBase64(imageBlob);
      }
    }
    
    if (card.front.audioId) {
      const audioBlob = await getAudio(card.front.audioId);
      if (audioBlob) {
        result.front.audio = await blobToBase64(audioBlob);
      }
    }
    
    // Chargement des médias back
    if (card.back.imageId) {
      const imageBlob = await getImage(card.back.imageId);
      if (imageBlob) {
        result.back.image = await blobToBase64(imageBlob);
      }
    }
    
    if (card.back.audioId) {
      const audioBlob = await getAudio(card.back.audioId);
      if (audioBlob) {
        result.back.audio = await blobToBase64(audioBlob);
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement des médias:', error);
  }

  return result;
}

// Fonction pour migrer les médias existants
export async function migrateExistingMediaToIndexedDB() {
  console.log('Début de la migration des médias existants vers IndexedDB...');
  
  try {
    const flashcards = getFlashcards();
    let migratedCount = 0;
    
    for (const card of flashcards) {
      let updated = false;
      
      // Migrer le front
      if (isBase64String(card.front.image) && !card.front.imageId) {
        const frontMedia = await migrateBase64MediaToIndexedDB(card.front.image, undefined);
        if (frontMedia.imageId) {
          card.front.imageId = frontMedia.imageId;
          updated = true;
        }
      }
      
      if (isBase64String(card.front.audio) && !card.front.audioId) {
        const frontAudioMedia = await migrateBase64MediaToIndexedDB(undefined, card.front.audio);
        if (frontAudioMedia.audioId) {
          card.front.audioId = frontAudioMedia.audioId;
          updated = true;
        }
      }
      
      // Migrer le back
      if (isBase64String(card.back.image) && !card.back.imageId) {
        const backMedia = await migrateBase64MediaToIndexedDB(card.back.image, undefined);
        if (backMedia.imageId) {
          card.back.imageId = backMedia.imageId;
          updated = true;
        }
      }
      
      if (isBase64String(card.back.audio) && !card.back.audioId) {
        const backAudioMedia = await migrateBase64MediaToIndexedDB(undefined, card.back.audio);
        if (backAudioMedia.audioId) {
          card.back.audioId = backAudioMedia.audioId;
          updated = true;
        }
      }
      
      if (updated) {
        updateFlashcard(card.id, card);
        migratedCount++;
      }
    }
    
    console.log(`Migration terminée: ${migratedCount} flashcards mises à jour`);
    return migratedCount;
  } catch (error) {
    console.error('Erreur lors de la migration des médias existants:', error);
    return 0;
  }
}

// FONCTIONS CRUD POUR UTILISATEURS
export function createUser(username: string, email: string, password: string): User {
  const users = getLocalStorageItem('users') || {};
  
  const id = uuidv4();
  const newUser: User = {
    id,
    username,
    email,
    password,
    createdAt: Date.now(),
  };
  
  users[id] = newUser;
  setLocalStorageItem('users', users);
  
  return newUser;
}

export function getUser(): User | null {
  const sessionId = getLocalStorageItem('sessionId');
  if (!sessionId) return null;
  
  const users = getLocalStorageItem('users') || {};
  return users[sessionId] || null;
}

// Ajout de setUser qui est utilisée dans storageService.ts
export function setUser(user: User): void {
  const users = getLocalStorageItem('users') || {};
  users[user.id] = user;
  setLocalStorageItem('users', users);
  setLocalStorageItem('sessionId', user.id);
}

export function hasSession(): boolean {
  const sessionId = getLocalStorageItem('sessionId');
  if (!sessionId) return false;
  
  const users = getLocalStorageItem('users') || {};
  return !!users[sessionId];
}

export function login(email: string, password: string): User | null {
  const users = getLocalStorageItem('users') || {};
  
  const user = Object.values(users).find(
    (u: any) => u.email === email && u.password === password
  ) as User | undefined;
  
  if (user) {
    setLocalStorageItem('sessionId', user.id);
    return user;
  }
  
  return null;
}

export function logout(): boolean {
  localStorage.removeItem('sessionId');
  return true;
}

// FONCTIONS CRUD POUR DECKS
export function createDeck(deckData: Partial<Deck>): Deck {
  const decks = getLocalStorageItem('decks') || {};
  const currentUser = getUser();
  
  if (!currentUser) throw new Error("User not authenticated");
  
  const id = uuidv4();
  const timestamp = Date.now();
  
  const newDeck: Deck = {
    id,
    title: deckData.title || "Nouveau deck",
    description: deckData.description || "",
    coverImage: deckData.coverImage,
    coverImageId: deckData.coverImageId,
    tags: deckData.tags || [],
    authorId: currentUser.id,
    authorName: currentUser.username,
    isPublic: deckData.isPublic || false,
    createdAt: timestamp,
    updatedAt: timestamp,
    isShared: deckData.isShared || false,
    originalId: deckData.originalId,
    isPublished: deckData.isPublished || false,
  };
  
  // Traiter l'image de couverture si présente
  if (isBase64String(newDeck.coverImage)) {
    // Traitement asynchrone
    (async () => {
      try {
        const coverImageId = generateMediaId('img');
        const contentType = newDeck.coverImage!.split(';')[0].split(':')[1];
        const imageBlob = base64ToBlob(newDeck.coverImage!, contentType);
        const success = await storeImage(coverImageId, imageBlob);
        
        if (success) {
          newDeck.coverImageId = coverImageId;
          // Mettre à jour le deck dans localStorage
          decks[id] = { ...newDeck };
          setLocalStorageItem('decks', decks);
        }
      } catch (error) {
        console.error('Erreur lors du traitement de l\'image de couverture:', error);
      }
    })();
  }
  
  decks[id] = newDeck;
  setLocalStorageItem('decks', decks);
  
  return newDeck;
}

export function getDeck(deckId: string): Deck | null {
  const decks = getLocalStorageItem('decks') || {};
  const deck = decks[deckId];
  
  if (deck && deck.coverImageId) {
    // Charger l'image de couverture depuis IndexedDB de manière asynchrone
    (async () => {
      try {
        const imageBlob = await getImage(deck.coverImageId);
        if (imageBlob) {
          const base64 = await blobToBase64(imageBlob);
          deck.coverImage = base64;
          // Mettre à jour le rendu sans modifier le localStorage
          // (l'image sera chargée à nouveau lors du prochain chargement)
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'image de couverture:', error);
      }
    })();
  }
  
  return deck || null;
}

export function getDecks(): Deck[] {
  const decks = getLocalStorageItem('decks') || {};
  return Object.values(decks) as Deck[];
}

export function getDecksByUser(userId: string): Deck[] {
  const decks = getLocalStorageItem('decks') || {};
  return (Object.values(decks) as Deck[]).filter((deck: Deck) => deck.authorId === userId);
}

export function updateDeck(deckId: string, updates: Partial<Deck>): Deck | null {
  const decks = getLocalStorageItem('decks') || {};
  const deck = decks[deckId];
  
  if (!deck) return null;
  
  // Traiter l'image de couverture si présente et modifiée
  if (isBase64String(updates.coverImage) && updates.coverImage !== deck.coverImage) {
    // Traitement asynchrone
    (async () => {
      try {
        // Supprimer l'ancienne image si elle existe
        if (deck.coverImageId) {
          await deleteImage(deck.coverImageId);
        }
        
        const coverImageId = generateMediaId('img');
        const contentType = updates.coverImage!.split(';')[0].split(':')[1];
        const imageBlob = base64ToBlob(updates.coverImage!, contentType);
        const success = await storeImage(coverImageId, imageBlob);
        
        if (success) {
          // Mettre à jour le deck avec la nouvelle référence
          deck.coverImageId = coverImageId;
          deck.coverImage = updates.coverImage;
          deck.updatedAt = Date.now();
          decks[deckId] = { ...deck };
          setLocalStorageItem('decks', decks);
        }
      } catch (error) {
        console.error('Erreur lors du traitement de l\'image de couverture:', error);
      }
    })();
    
    // Ne pas inclure coverImage dans l'objet updates pour éviter la duplication
    delete updates.coverImage;
  }
  
  const updatedDeck = {
    ...deck,
    ...updates,
    updatedAt: Date.now()
  };
  
  decks[deckId] = updatedDeck;
  setLocalStorageItem('decks', decks);
  
  return updatedDeck;
}

export function deleteDeck(deckId: string): boolean {
  const decks = getLocalStorageItem('decks') || {};
  const deck = decks[deckId];
  
  if (!deck) return false;
  
  // Suppression des médias associés à ce deck
  (async () => {
    try {
      // Supprimer l'image de couverture si elle existe
      if (deck.coverImageId) {
        await deleteImage(deck.coverImageId);
      }
      
      // Supprimer les médias de toutes les flashcards de ce deck
      const flashcards = getFlashcardsByDeck(deckId);
      for (const card of flashcards) {
        if (card.front.imageId) await deleteImage(card.front.imageId);
        if (card.front.audioId) await deleteAudio(card.front.audioId);
        if (card.back.imageId) await deleteImage(card.back.imageId);
        if (card.back.audioId) await deleteAudio(card.back.audioId);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression des médias:', error);
    }
  })();
  
  // Supprimer également toutes les flashcards associées à ce deck
  const flashcards = getLocalStorageItem('flashcards') || {};
  Object.keys(flashcards).forEach(id => {
    if (flashcards[id].deckId === deckId) {
      delete flashcards[id];
    }
  });
  
  // Supprimer également tous les thèmes associés à ce deck
  const themes = getLocalStorageItem('themes') || {};
  Object.keys(themes).forEach(id => {
    if (themes[id].deckId === deckId) {
      delete themes[id];
    }
  });
  
  delete decks[deckId];
  
  setLocalStorageItem('flashcards', flashcards);
  setLocalStorageItem('themes', themes);
  setLocalStorageItem('decks', decks);
  
  return true;
}

// FONCTIONS POUR LES THÈMES
export function createTheme(themeData: Partial<Theme> & { deckId: string }): Theme {
  const themes = getLocalStorageItem('themes') || {};
  
  const id = uuidv4();
  const timestamp = Date.now();
  
  const newTheme: Theme = {
    id,
    deckId: themeData.deckId,
    title: themeData.title || "Nouveau thème",
    description: themeData.description || "",
    coverImage: themeData.coverImage,
    coverImageId: themeData.coverImageId,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  
  // Traiter l'image de couverture si présente
  if (isBase64String(newTheme.coverImage)) {
    // Traitement asynchrone
    (async () => {
      try {
        const coverImageId = generateMediaId('img');
        const contentType = newTheme.coverImage!.split(';')[0].split(':')[1];
        const imageBlob = base64ToBlob(newTheme.coverImage!, contentType);
        const success = await storeImage(coverImageId, imageBlob);
        
        if (success) {
          newTheme.coverImageId = coverImageId;
          // Mettre à jour le thème dans localStorage
          themes[id] = { ...newTheme };
          setLocalStorageItem('themes', themes);
        }
      } catch (error) {
        console.error('Erreur lors du traitement de l\'image de couverture:', error);
      }
    })();
  }
  
  themes[id] = newTheme;
  setLocalStorageItem('themes', themes);
  
  return newTheme;
}

export function getTheme(themeId: string): Theme | null {
  const themes = getLocalStorageItem('themes') || {};
  const theme = themes[themeId];
  
  if (theme && theme.coverImageId) {
    // Charger l'image de couverture depuis IndexedDB de manière asynchrone
    (async () => {
      try {
        const imageBlob = await getImage(theme.coverImageId);
        if (imageBlob) {
          const base64 = await blobToBase64(imageBlob);
          theme.coverImage = base64;
          // Mettre à jour le rendu sans modifier le localStorage
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'image de couverture:', error);
      }
    })();
  }
  
  return theme || null;
}

export function getThemesByDeck(deckId: string): Theme[] {
  const themes = getLocalStorageItem('themes') || {};
  return (Object.values(themes) as Theme[]).filter((theme: Theme) => theme.deckId === deckId);
}

export function updateTheme(themeId: string, updates: Partial<Theme>): Theme | null {
  const themes = getLocalStorageItem('themes') || {};
  const theme = themes[themeId];
  
  if (!theme) return null;
  
  // Traiter l'image de couverture si présente et modifiée
  if (isBase64String(updates.coverImage) && updates.coverImage !== theme.coverImage) {
    // Traitement asynchrone
    (async () => {
      try {
        // Supprimer l'ancienne image si elle existe
        if (theme.coverImageId) {
          await deleteImage(theme.coverImageId);
        }
        
        const coverImageId = generateMediaId('img');
        const contentType = updates.coverImage!.split(';')[0].split(':')[1];
        const imageBlob = base64ToBlob(updates.coverImage!, contentType);
        const success = await storeImage(coverImageId, imageBlob);
        
        if (success) {
          // Mettre à jour le thème avec la nouvelle référence
          theme.coverImageId = coverImageId;
          theme.coverImage = updates.coverImage;
          theme.updatedAt = Date.now();
          themes[themeId] = { ...theme };
          setLocalStorageItem('themes', themes);
        }
      } catch (error) {
        console.error('Erreur lors du traitement de l\'image de couverture:', error);
      }
    })();
    
    // Ne pas inclure coverImage dans l'objet updates pour éviter la duplication
    delete updates.coverImage;
  }
  
  const updatedTheme = {
    ...theme,
    ...updates,
    updatedAt: Date.now()
  };
  
  themes[themeId] = updatedTheme;
  setLocalStorageItem('themes', themes);
  
  return updatedTheme;
}

export function deleteTheme(themeId: string): boolean {
  const themes = getLocalStorageItem('themes') || {};
  const theme = themes[themeId];
  
  if (!theme) return false;
  
  // Suppression de l'image de couverture si elle existe
  if (theme.coverImageId) {
    deleteImage(theme.coverImageId).catch(error => {
      console.error('Erreur lors de la suppression de l\'image de couverture:', error);
    });
  }
  
  delete themes[themeId];
  setLocalStorageItem('themes', themes);
  
  return true;
}

// FONCTIONS POUR LES FLASHCARDS
export function createFlashcard(flashcardData: Partial<Flashcard> & { deckId: string }): Flashcard {
  const flashcards = getLocalStorageItem('flashcards') || {};
  
  const id = uuidv4();
  const timestamp = Date.now();
  
  const newFlashcard: Flashcard = {
    id,
    deckId: flashcardData.deckId,
    themeId: flashcardData.themeId,
    front: flashcardData.front || { text: "" },
    back: flashcardData.back || { text: "" },
    createdAt: timestamp,
    updatedAt: timestamp,
    lastReviewed: flashcardData.lastReviewed,
    reviewCount: flashcardData.reviewCount || 0,
    difficulty: flashcardData.difficulty,
  };
  
  // Traiter les médias de façon asynchrone
  (async () => {
    try {
      // Traiter les médias front
      newFlashcard.front = await processFlashcardMedia(newFlashcard.front);
      
      // Traiter les médias back
      newFlashcard.back = await processFlashcardMedia(newFlashcard.back);
      
      // Mettre à jour la flashcard dans localStorage
      flashcards[id] = { ...newFlashcard };
      setLocalStorageItem('flashcards', flashcards);
    } catch (error) {
      console.error('Erreur lors du traitement des médias:', error);
    }
  })();
  
  flashcards[id] = newFlashcard;
  setLocalStorageItem('flashcards', flashcards);
  
  return newFlashcard;
}

export function getFlashcard(flashcardId: string): Flashcard | null {
  const flashcards = getLocalStorageItem('flashcards') || {};
  const flashcard = flashcards[flashcardId];
  
  if (!flashcard) return null;
  
  // Charger les médias de façon asynchrone
  loadFlashcardMedia(flashcard).then(updatedCard => {
    // La carte mise à jour avec les médias chargés est disponible,
    // mais nous ne modifions pas localStorage
    Object.assign(flashcard, updatedCard);
  }).catch(error => {
    console.error('Erreur lors du chargement des médias:', error);
  });
  
  return flashcard;
}

export function getFlashcards(): Flashcard[] {
  const flashcards = getLocalStorageItem('flashcards') || {};
  return Object.values(flashcards) as Flashcard[];
}

export function getFlashcardsByDeck(deckId: string): Flashcard[] {
  const flashcards = getLocalStorageItem('flashcards') || {};
  return (Object.values(flashcards) as Flashcard[]).filter((card: Flashcard) => card.deckId === deckId);
}

export function getFlashcardsByTheme(themeId: string): Flashcard[] {
  const flashcards = getLocalStorageItem('flashcards') || {};
  return (Object.values(flashcards) as Flashcard[]).filter((card: Flashcard) => card.themeId === themeId);
}

export function updateFlashcard(flashcardId: string, updates: Partial<Flashcard>): Flashcard | null {
  const flashcards = getLocalStorageItem('flashcards') || {};
  const flashcard = flashcards[flashcardId];
  
  if (!flashcard) return null;
  
  // Créer la flashcard mise à jour
  const updatedFlashcard = {
    ...flashcard,
    ...updates,
    updatedAt: Date.now()
  };
  
  // Traiter les médias de façon asynchrone
  (async () => {
    try {
      // Traiter les médias front si mis à jour
      if (updates.front) {
        updatedFlashcard.front = await processFlashcardMedia(updatedFlashcard.front);
      }
      
      // Traiter les médias back si mis à jour
      if (updates.back) {
        updatedFlashcard.back = await processFlashcardMedia(updatedFlashcard.back);
      }
      
      // Mettre à jour la flashcard dans localStorage
      flashcards[flashcardId] = { ...updatedFlashcard };
      setLocalStorageItem('flashcards', flashcards);
    } catch (error) {
      console.error('Erreur lors du traitement des médias:', error);
    }
  })();
  
  flashcards[flashcardId] = updatedFlashcard;
  setLocalStorageItem('flashcards', flashcards);
  
  return updatedFlashcard;
}

export function deleteFlashcard(flashcardId: string): boolean {
  const flashcards = getLocalStorageItem('flashcards') || {};
  const flashcard = flashcards[flashcardId];
  
  if (!flashcard) return false;
  
  // Suppression des médias associés
  (async () => {
    try {
      // Supprimer les médias front
      if (flashcard.front.imageId) {
        await deleteImage(flashcard.front.imageId);
      }
      if (flashcard.front.audioId) {
        await deleteAudio(flashcard.front.audioId);
      }
      
      // Supprimer les médias back
      if (flashcard.back.imageId) {
        await deleteImage(flashcard.back.imageId);
      }
      if (flashcard.back.audioId) {
        await deleteAudio(flashcard.back.audioId);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression des médias:', error);
    }
  })();
  
  delete flashcards[flashcardId];
  setLocalStorageItem('flashcards', flashcards);
  
  return true;
}

// FONCTIONS POUR LES SESSIONS D'ÉTUDE
export function createStudySession(sessionData: Partial<StudySession> & { deckId: string, userId: string }): StudySession {
  const sessions = getLocalStorageItem('studySessions') || {};
  
  const id = uuidv4();
  const timestamp = Date.now();
  
  const newSession: StudySession = {
    id,
    deckId: sessionData.deckId,
    userId: sessionData.userId,
    startTime: timestamp,
    cardsReviewed: sessionData.cardsReviewed || 0,
    correctAnswers: sessionData.correctAnswers || 0,
    incorrectAnswers: sessionData.incorrectAnswers || 0,
  };
  
  sessions[id] = newSession;
  setLocalStorageItem('studySessions', sessions);
  
  return newSession;
}

export function updateStudySession(sessionId: string, updates: Partial<StudySession>): StudySession | null {
  const sessions = getLocalStorageItem('studySessions') || {};
  const session = sessions[sessionId];
  
  if (!session) return null;
  
  const updatedSession = { ...session, ...updates };
  
  sessions[sessionId] = updatedSession;
  setLocalStorageItem('studySessions', sessions);
  
  return updatedSession;
}

export function getStudySessionsByDeck(deckId: string): StudySession[] {
  const sessions = getLocalStorageItem('studySessions') || {};
  return (Object.values(sessions) as StudySession[]).filter((session: StudySession) => session.deckId === deckId);
}

export function getStudySessionsByUser(userId: string): StudySession[] {
  const sessions = getLocalStorageItem('studySessions') || {};
  return (Object.values(sessions) as StudySession[]).filter((session: StudySession) => session.userId === userId);
}

// FONCTIONS POUR GESTION DES IMAGES (BLOB/BASE64)
export async function getBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

// FONCTIONS POUR PARTAGE ET IMPORT/EXPORT DE DECKS
export function exportDeckToJson(deckId: string): SharedDeckExport {
  const deck = getDeck(deckId);
  if (!deck) throw new Error(`Deck not found: ${deckId}`);
  
  const themes = getThemesByDeck(deckId);
  const flashcards = getFlashcardsByDeck(deckId);
  
  const exportData: SharedDeckExport = {
    id: uuidv4(), // Nouvel ID pour le deck partagé
    originalId: deck.id,
    title: deck.title,
    description: deck.description,
    themes: themes.map(theme => ({
      ...theme,
      id: uuidv4() // Nouveaux IDs pour les thèmes
    })),
    flashcards: flashcards.map(card => ({
      ...card,
      id: uuidv4() // Nouveaux IDs pour les flashcards
    })),
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  return exportData;
}

export function importDeckFromJson(exportData: SharedDeckExport, userId: string): string {
  const currentUser = getUser();
  if (!currentUser || currentUser.id !== userId) throw new Error("User not authenticated");
  
  // Créer le nouveau deck
  const newDeck = createDeck({
    title: exportData.title,
    description: exportData.description,
    authorId: currentUser.id,
    authorName: currentUser.username,
    isPublic: false,
    isShared: true, // Marquer comme deck partagé importé
    originalId: exportData.originalId
  });
  
  // Créer des maps pour associer les anciens IDs aux nouveaux
  const themeIdMap = new Map();
  
  // Importer les thèmes
  for (const theme of exportData.themes) {
    const newTheme = createTheme({
      deckId: newDeck.id,
      title: theme.title,
      description: theme.description,
    });
    
    themeIdMap.set(theme.id, newTheme.id);
  }
  
  // Importer les flashcards
  for (const card of exportData.flashcards) {
    // Mapper l'ancien themeId avec le nouveau si disponible
    const newThemeId = card.themeId ? themeIdMap.get(card.themeId) : undefined;
    
    // Importer la flashcard
    createFlashcard({
      deckId: newDeck.id,
      themeId: newThemeId,
      front: card.front,
      back: card.back,
      difficulty: card.difficulty,
    });
  }
  
  return newDeck.id;
}

// Fonction pour mettre à jour un deck importé précédemment
export function updateDeckFromJson(exportData: SharedDeckExport): boolean {
  const decks = getLocalStorageItem('decks') || {};
  
  // Chercher le deck importé par son originalId
  const importedDeck = Object.values(decks).find(
    (deck: Deck) => deck.isShared && deck.originalId === exportData.originalId
  );
  
  if (!importedDeck) return false;
  
  // Mettre à jour le deck de base
  updateDeck(importedDeck.id, {
    title: exportData.title,
    description: exportData.description,
    updatedAt: Date.now()
  });
  
  // Supprimer tous les thèmes actuels
  const themes = getThemesByDeck(importedDeck.id);
  for (const theme of themes) {
    deleteTheme(theme.id);
  }
  
  // Supprimer toutes les flashcards actuelles
  const flashcards = getFlashcardsByDeck(importedDeck.id);
  for (const card of flashcards) {
    deleteFlashcard(card.id);
  }
  
  // Créer des maps pour associer les anciens IDs aux nouveaux
  const themeIdMap = new Map();
  
  // Importer les thèmes
  for (const theme of exportData.themes) {
    const newTheme = createTheme({
      deckId: importedDeck.id,
      title: theme.title,
      description: theme.description,
    });
    
    themeIdMap.set(theme.id, newTheme.id);
  }
  
  // Importer les flashcards
  for (const card of exportData.flashcards) {
    // Mapper l'ancien themeId avec le nouveau si disponible
    const newThemeId = card.themeId ? themeIdMap.get(card.themeId) : undefined;
    
    // Importer la flashcard
    createFlashcard({
      deckId: importedDeck.id,
      themeId: newThemeId,
      front: card.front,
      back: card.back,
      difficulty: card.difficulty,
    });
  }
  
  return true;
}

// Fonctions manquantes selon les erreurs
export function getThemes(): Theme[] {
  const themes = getLocalStorageItem('themes') || {};
  return Object.values(themes) as Theme[];
}

// Implémentation de la fonction manquante migrateBase64MediaToIndexedDB
export async function migrateBase64MediaToIndexedDB(
  imageBase64?: string,
  audioBase64?: string
): Promise<{ imageId?: string; audioId?: string }> {
  const result: { imageId?: string; audioId?: string } = {};
  
  try {
    // Traiter l'image si présente
    if (isBase64String(imageBase64)) {
      const imageId = generateMediaId('img');
      const contentType = imageBase64!.split(';')[0].split(':')[1];
      const imageBlob = base64ToBlob(imageBase64!, contentType);
      const success = await storeImage(imageId, imageBlob);
      
      if (success) {
        result.imageId = imageId;
      }
    }
    
    // Traiter l'audio si présent
    if (isBase64String(audioBase64)) {
      const audioId = generateMediaId('aud');
      const contentType = audioBase64!.split(';')[0].split(':')[1];
      const audioBlob = base64ToBlob(audioBase64!, contentType);
      const success = await storeAudio(audioId, audioBlob);
      
      if (success) {
        result.audioId = audioId;
      }
    }
  } catch (error) {
    console.error('Erreur lors de la migration des médias:', error);
  }
  
  return result;
}

// Correction des fonctions utilisant des tableaux
export function getSharedImportedDecks(): { localDeckId: string }[] {
  const decks = getDecks();
  return decks
    .filter(deck => deck.isShared && deck.originalId)
    .map(deck => ({ localDeckId: deck.id }));
}

// Correction pour les erreurs de type unknown
export function createShareCode(deckId: string, expiryDays: number = 7): string {
  const deck = getDeck(deckId);
  if (!deck) throw new Error(`Deck not found: ${deckId}`);
  
  // Création simple d'un code de partage (dans une vraie app, un système plus sécurisé serait utilisé)
  const code = `share_${deckId}_${Date.now()}_${expiryDays}`;
  
  // Stocker le code dans localStorage avec sa date d'expiration
  const shareCodes = getLocalStorageItem('shareCodes') || {};
  shareCodes[code] = {
    deckId,
    expiryDate: Date.now() + (expiryDays * 24 * 60 * 60 * 1000)
  };
  setLocalStorageItem('shareCodes', shareCodes);
  
  return code;
}

export function getSharedDeck(code: string): Deck | null {
  const shareCodes = getLocalStorageItem('shareCodes') || {};
  const shareInfo = shareCodes[code];
  
  if (!shareInfo) return null;
  
  // Vérifier si le code a expiré
  if (shareInfo.expiryDate < Date.now()) {
    // Suppression du code expiré
    delete shareCodes[code];
    setLocalStorageItem('shareCodes', shareCodes);
    return null;
  }
  
  // Récupérer le deck
  return getDeck(shareInfo.deckId);
}

export function publishDeck(deckId: string): boolean {
  const deck = getDeck(deckId);
  if (!deck) return false;
  
  updateDeck(deckId, { 
    isPublic: true,
    isPublished: true
  });
  
  return true;
}

export function unpublishDeck(deckId: string): boolean {
  const deck = getDeck(deckId);
  if (!deck) return false;
  
  updateDeck(deckId, { 
    isPublic: false,
    isPublished: false
  });
  
  return true;
}

export function updatePublishedDeck(deckId: string): boolean {
  const deck = getDeck(deckId);
  if (!deck) return false;
  
  // Dans une vraie app, cela pourrait propager les mises à jour vers un serveur
  if (deck.isPublished) {
    updateDeck(deckId, { updatedAt: Date.now() });
    return true;
  }
  
  return false;
}

// ... keep existing code

// FONCTION DE GÉNÉRATION DE DONNÉES D'EXEMPLE
export function generateSampleData() {
  // Vérifier si les utilisateurs existent déjà
  const users = getLocalStorageItem('users');
  if (users) return;
  
  // Créer un utilisateur de démonstration
  const demoUser = createUser("Utilisateur Démo", "demo@cdsflashcard.com", "password");
  setLocalStorageItem('sessionId', demoUser.id);
  
  // Créer un deck d'exemple
  const deckId = createDeck({
    title: "Introduction à la programmation",
    description: "Concepts fondamentaux de la programmation informatique",
    tags: ["programmation", "informatique", "débutant"],
    isPublic: true
  }).id;
  
  // Créer des thèmes pour ce deck
  const themeIds = [
    createTheme({
      deckId,
      title: "Variables et Types",
      description: "Les bases des variables et des types de données"
    }).id,
    createTheme({
      deckId,
      title: "Conditions",
      description: "Les structures conditionnelles en programmation"
    }).id,
    createTheme({
      deckId,
      title: "Boucles",
      description: "Les différentes boucles en programmation"
    }).id
  ];
  
  // Créer des flashcards pour ces thèmes
  createFlashcard({
    deckId,
    themeId: themeIds[0],
    front: { text: "Qu'est-ce qu'une variable?" },
    back: { text: "Une variable est un espace nommé en mémoire qui peut stocker une valeur." }
  });
  
  createFlashcard({
    deckId,
    themeId: themeIds[0],
    front: { text: "Quels sont les types de base en JavaScript?" },
    back: { text: "String, Number, Boolean, null, undefined, Symbol et BigInt" }
  });
  
  createFlashcard({
    deckId,
    themeId: themeIds[1],
    front: { text: "Qu'est-ce qu'une condition 'if'?" },
    back: { 
      text: "Une structure qui permet d'exécuter du code uniquement si une condition est vraie.",
      additionalInfo: "Les conditions if sont souvent accompagnées de else et else if pour gérer différents cas."
    }
  });
  
  createFlashcard({
    deckId,
    themeId: themeIds[2],
    front: { text: "Quelle est la différence entre une boucle 'for' et 'while'?" },
    back: { 
      text: "Une boucle for est utilisée quand le nombre d'itérations est connu à l'avance, tandis qu'une boucle while continue jusqu'à ce qu'une condition devienne fausse.",
      additionalInfo: "La boucle for est généralement utilisée avec un compteur, while est plus adaptée pour les conditions de sortie complexes."
    }
  });
}
