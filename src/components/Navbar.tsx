
import { Link, useLocation } from "react-router-dom";
import { Home, Plus, Search, User, Menu, X, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const Navbar = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🎭</span>
            <h1 className="hidden font-bold font-heading text-lg sm:inline-block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              CDS FLASHCARD-BASE
            </h1>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Accueil
          </Link>
          <Link to="/explore" className={`nav-link ${location.pathname === '/explore' ? 'active' : ''}`}>
            Explorer
          </Link>
          <Link to="/create" className={`nav-link ${location.pathname === '/create' ? 'active' : ''}`}>
            Créer
          </Link>
          <Link to="/profile" className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}>
            Profil
          </Link>
          <Link to="/my-decks" className={`nav-link ${location.pathname === '/my-decks' ? 'active' : ''}`}>
            Mes Decks
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => toast({
              title: "Recherche",
              description: "La fonction de recherche sera bientôt disponible",
            })}
            className="hidden md:flex"
          >
            <Search className="h-5 w-5" />
          </Button>
          
          <Button asChild variant="default" size="sm" className="hidden md:flex">
            <Link to="/create">
              <Plus className="mr-2 h-4 w-4" />
              Créer un deck
            </Link>
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation - Drawer style */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 md:hidden animate-fade-in">
          <div className="bg-background h-full w-4/5 max-w-xs p-6 shadow-lg animate-slide-in-right">
            <div className="flex justify-between items-center mb-8">
              <span className="text-2xl">🎭</span>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleMenu}
                aria-label="Fermer le menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <nav className="flex flex-col space-y-6">
              <Link 
                to="/" 
                className={`flex items-center gap-3 py-2 touch-target ${location.pathname === '/' ? 'text-primary font-medium' : 'text-foreground'}`}
                onClick={toggleMenu}
              >
                <Home className="h-5 w-5" />
                <span>Accueil</span>
              </Link>
              
              <Link 
                to="/explore" 
                className={`flex items-center gap-3 py-2 touch-target ${location.pathname === '/explore' ? 'text-primary font-medium' : 'text-foreground'}`}
                onClick={toggleMenu}
              >
                <Search className="h-5 w-5" />
                <span>Explorer</span>
              </Link>
              
              <Link 
                to="/create" 
                className={`flex items-center gap-3 py-2 touch-target ${location.pathname === '/create' ? 'text-primary font-medium' : 'text-foreground'}`}
                onClick={toggleMenu}
              >
                <Plus className="h-5 w-5" />
                <span>Créer</span>
              </Link>
              
              <Link 
                to="/profile" 
                className={`flex items-center gap-3 py-2 touch-target ${location.pathname === '/profile' ? 'text-primary font-medium' : 'text-foreground'}`}
                onClick={toggleMenu}
              >
                <User className="h-5 w-5" />
                <span>Profil</span>
              </Link>
              
              <Link 
                to="/my-decks" 
                className={`flex items-center gap-3 py-2 touch-target ${location.pathname === '/my-decks' ? 'text-primary font-medium' : 'text-foreground'}`}
                onClick={toggleMenu}
              >
                <Folder className="h-5 w-5" />
                <span>Mes Decks</span>
              </Link>
            </nav>
            
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t">
              <Button asChild variant="default" className="w-full touch-target">
                <Link to="/create" onClick={toggleMenu}>
                  <Plus className="mr-2 h-4 w-4" />
                  Créer un nouveau deck
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
