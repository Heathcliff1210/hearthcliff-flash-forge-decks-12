
import { useState, useEffect } from "react";
import { getUser, logout } from "@/lib/localStorage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Settings, User as UserIcon, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StorageMigrationTool from "@/components/StorageMigrationTool";

const ProfilePage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = getUser();
    setUser(userData);
  }, []);

  const handleLogout = () => {
    const success = logout();
    
    if (success) {
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès"
      });
      navigate("/login");
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center py-16">
          <Shield className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Non connecté</h2>
          <p className="text-muted-foreground mb-4">
            Veuillez vous connecter pour accéder à votre profil
          </p>
          <Button onClick={() => navigate("/login")}>
            Se connecter
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <UserIcon className="h-8 w-8" />
        Mon profil
      </h1>
      
      <div className="grid gap-8 md:grid-cols-2">
        {/* Informations du profil */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Informations personnelles
            </CardTitle>
            <CardDescription>
              Vos informations de compte
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nom d'utilisateur</p>
              <p className="font-medium">{user.username}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Adresse e-mail</p>
              <p className="font-medium">{user.email}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date d'inscription</p>
              <p className="font-medium">
                {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Modifier
            </Button>
            
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </Button>
          </CardFooter>
        </Card>
        
        {/* Statistiques et paramètres */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Paramètres et outils
            </CardTitle>
            <CardDescription>
              Gérer votre compte et vos préférences
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <StorageMigrationTool />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
