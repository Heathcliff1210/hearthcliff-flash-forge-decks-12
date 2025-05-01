
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRightIcon, Globe, Plus, TrendingUp, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import DeckCard, { DeckCardProps } from "@/components/DeckCard";
import { getDecks, getUser, User } from "@/lib/localStorage";

const HomePage = () => {
  const [recentDecks, setRecentDecks] = useState<DeckCardProps[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = getUser();
    setUser(userData);

    // Get all decks and sort by recent
    const allDecks = getDecks();
    const deckCards = allDecks
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 6)
      .map(deck => ({
        id: deck.id,
        title: deck.title,
        description: deck.description,
        coverImage: deck.coverImage,
        cardCount: 0, // Will be filled in next step
        tags: deck.tags,
        author: userData?.name || "Anonyme",
        isPublic: deck.isPublic,
      }));

    setRecentDecks(deckCards);
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/30 via-tertiary/20 to-secondary/30 py-20">
        <div className="container px-4 mx-auto flex flex-col items-center text-center">
          <span className="text-6xl mb-4">🎭</span>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-tertiary to-secondary bg-clip-text text-transparent">
            CDS FLASHCARD-BASE
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">
            Créez, partagez et apprenez avec des flashcards interactives. 
            L'outil parfait pour mémoriser efficacement tous types de connaissances.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-tertiary hover:from-primary/90 hover:to-tertiary/90 animate-float">
              <Link to="/create">
                <Plus className="mr-2 h-4 w-4" />
                Créer un deck
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="border-tertiary/50 hover:bg-tertiary/10">
              <Link to="/explore">
                <Globe className="mr-2 h-4 w-4" />
                Explorer
              </Link>
            </Button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container px-4 mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-tertiary via-secondary to-quaternary bg-clip-text text-transparent">Fonctionnalités exceptionnelles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-background to-tertiary/10 border-primary/20 transition-transform hover:scale-105">
              <CardHeader>
                <div className="mb-2 p-3 w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-tertiary/20 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Flashcards Multimédia</CardTitle>
                <CardDescription>
                  Ajoutez du texte, des images et même de l'audio à vos flashcards.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>Nos flashcards supportent une variété de médias pour enrichir votre apprentissage. Intégrez des images représentatives ou des extraits audio pour faciliter la mémorisation.</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-background to-quaternary/10 border-primary/20 transition-transform hover:scale-105">
              <CardHeader>
                <div className="mb-2 p-3 w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-quaternary/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Organisation par Thèmes</CardTitle>
                <CardDescription>
                  Organisez vos flashcards par thèmes au sein d'un même deck.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>Catégorisez vos flashcards en thèmes pour une meilleure organisation. Personnalisez chaque thème avec sa propre image de couverture.</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-background to-secondary/10 border-primary/20 transition-transform hover:scale-105">
              <CardHeader>
                <div className="mb-2 p-3 w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Partage Facile</CardTitle>
                <CardDescription>
                  Partagez vos decks avec d'autres utilisateurs.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>Générez un code unique pour partager vos decks. Les destinataires peuvent les importer et commencer à étudier instantanément, sans création de compte.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Decks Section */}
      {recentDecks.length > 0 && (
        <section className="py-16 bg-gradient-to-r from-secondary/30 via-background to-tertiary/20">
          <div className="container px-4 mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">Decks récents</h2>
              <Button variant="ghost" size="sm" asChild className="hover:bg-tertiary/10 hover:text-tertiary">
                <Link to="/explore" className="flex items-center">
                  Voir tous les decks
                  <ChevronRightIcon className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentDecks.map((deck) => (
                <DeckCard
                  key={deck.id}
                  id={deck.id}
                  title={deck.title}
                  description={deck.description}
                  cardCount={deck.cardCount}
                  coverImage={deck.coverImage}
                  tags={deck.tags}
                  author={deck.author}
                  isPublic={deck.isPublic}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-quaternary/20 via-background to-primary/20">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-tertiary via-quaternary to-primary bg-clip-text text-transparent">Prêt à créer vos propres flashcards?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Commencez dès maintenant à créer vos propres decks de flashcards. C'est gratuit et ne nécessite pas de compte !
          </p>
          <Button asChild size="lg" className="bg-gradient-to-r from-primary to-quaternary hover:from-primary/90 hover:to-quaternary/90 animate-pulse-slow">
            <Link to="/create" className="flex items-center">
              Commencer
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
