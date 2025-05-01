
import { useState, useEffect } from 'react';
import { getUser } from '@/lib/localStorage';
import DeckCard from '@/components/DeckCard';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { Plus, RefreshCcw, Loader2, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { initStorage, getDecks } from '@/lib/storageService';
import type { Deck } from '@/lib/localStorage';

const MyDecksPage = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [user, setUser] = useState(getUser());
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [storageInfo, setStorageInfo] = useState<{ usage: number, quota: number, percentUsed: number } | null>(null);

  const fetchDecks = async () => {
    setIsLoading(true);
    try {
      const currentUser = getUser();
      setUser(currentUser);
      
      const allDecks = await getDecks();
      const userDecks = allDecks.filter(deck => deck.authorId === currentUser?.id);
      
      console.log('Fetching decks for user:', currentUser?.id);
      console.log('Found decks:', userDecks.length);
      
      setDecks(userDecks);
      
      // Vérifier l'utilisation du stockage
      if (window.navigator.storage && window.navigator.storage.estimate) {
        const estimate = await window.navigator.storage.estimate();
        const usage = estimate.usage || 0;
        const quota = estimate.quota || 100 * 1024 * 1024; // 100 MB par défaut
        const percentUsed = Math.round((usage / quota) * 100);
        
        setStorageInfo({ usage, quota, percentUsed });
        console.log(`Utilisation du stockage: ${Math.round(usage / 1024 / 1024)}MB sur ${Math.round(quota / 1024 / 1024)}MB`);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching decks:', error);
      setIsLoading(false);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos decks.",
        variant: "destructive"
      });
    }
  };

  const refreshDecks = async () => {
    setIsLoading(true);
    
    try {
      const currentUser = getUser();
      setUser(currentUser);
      
      const allDecks = await getDecks();
      const userDecks = allDecks.filter(deck => deck.authorId === currentUser?.id);
      
      console.log('Refreshing decks for user:', currentUser?.id);
      console.log('Found decks:', userDecks.length);
      
      setDecks(userDecks);
      toast({
        title: "Liste mise à jour",
        description: `${userDecks.length} deck(s) trouvé(s)`,
      });
    } catch (error) {
      console.error('Error refreshing decks:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'actualiser vos decks.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initStorage();
        await fetchDecks();
      } catch (error) {
        console.error('Error initializing storage:', error);
        setIsLoading(false);
        toast({
          title: "Erreur d'initialisation",
          description: "Impossible d'initialiser le stockage. Utilisation du stockage local uniquement.",
          variant: "destructive"
        });
      }
    };
    
    initializeApp();
  }, []);

  useEffect(() => {
    fetchDecks();
  }, [location.key]);

  return (
    <div className={`container mx-auto p-4 md:p-6 animate-fade-in pb-20 ${isMobile ? 'mobile-app-container' : ''}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold font-display bg-gradient-to-r from-primary via-tertiary to-secondary bg-clip-text text-transparent mb-4 md:mb-0">
          Mes Decks
        </h1>
        <div className="flex gap-2 w-full md:w-auto">
          <Button 
            variant="outline" 
            onClick={refreshDecks} 
            disabled={isLoading}
            className="flex-1 md:flex-none"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="mr-2 h-4 w-4" />
            )}
            {!isMobile && "Actualiser"}
          </Button>
          <Button 
            asChild 
            className="flex-1 md:flex-none bg-gradient-to-r from-primary to-tertiary hover:from-primary/90 hover:to-tertiary/90"
          >
            <Link to="/create">
              <Plus className="mr-2 h-4 w-4" />
              {isMobile ? "Créer" : "Créer un nouveau deck"}
            </Link>
          </Button>
        </div>
      </div>
      
      {storageInfo && (
        <div className="mb-6 bg-quaternary/10 rounded-lg p-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Espace utilisé:</span>
            <span className="font-medium">{Math.round(storageInfo.usage / 1024 / 1024)}MB / {Math.round(storageInfo.quota / 1024 / 1024)}MB</span>
          </div>
          <div className="w-full bg-muted h-2 rounded-full mt-2">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-primary to-tertiary" 
              style={{ width: `${storageInfo.percentUsed}%` }}
            ></div>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-muted-foreground">
          {decks.length} deck{decks.length !== 1 ? "s" : ""}
        </div>
        <Button variant="ghost" size="sm" className="text-sm">
          <Filter className="h-4 w-4 mr-2" />
          Filtrer
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Chargement des decks...</span>
        </div>
      ) : decks.length === 0 ? (
        <div className="text-center py-12 card-gradient-accent rounded-lg p-8">
          <p className="text-muted-foreground mb-6 font-serif">
            Vous n'avez pas encore créé de decks.
          </p>
          <Button 
            asChild 
            size="lg" 
            className="animate-pulse-slow bg-gradient-to-r from-primary via-tertiary to-secondary hover:from-primary/90 hover:via-tertiary/90 hover:to-secondary/90"
          >
            <Link to="/create">
              <Plus className="mr-2 h-4 w-4" />
              Créer votre premier deck
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {decks.map(deck => (
            <DeckCard 
              key={deck.id}
              id={deck.id}
              title={deck.title}
              description={deck.description}
              cardCount={0}
              coverImage={deck.coverImage}
              tags={deck.tags}
              author={user?.name || 'Utilisateur'}
              isPublic={deck.isPublic}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyDecksPage;
