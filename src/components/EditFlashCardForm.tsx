
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";

interface CardSideData {
  text: string;
  image?: string;
  audio?: string;
  additionalInfo?: string;
}

interface EditFlashCardFormProps {
  initialFront?: CardSideData;
  initialBack?: CardSideData;
  onSubmit: (front: CardSideData, back: CardSideData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const EditFlashCardForm = ({
  initialFront = { text: "", additionalInfo: "" },
  initialBack = { text: "", additionalInfo: "" },
  onSubmit,
  onCancel,
  isLoading = false
}: EditFlashCardFormProps) => {
  const [frontData, setFrontData] = useState<CardSideData>(initialFront);
  const [backData, setBackData] = useState<CardSideData>(initialBack);
  const [showFrontInfo, setShowFrontInfo] = useState(!!initialFront.additionalInfo);
  const [showBackInfo, setShowBackInfo] = useState(!!initialBack.additionalInfo);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const handleFrontImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "L'image ne doit pas dépasser 5 Mo",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFrontData({
        ...frontData,
        image: event.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleBackImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "L'image ne doit pas dépasser 5 Mo",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setBackData({
        ...backData,
        image: event.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFrontAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "L'audio ne doit pas dépasser 10 Mo",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith("audio/")) {
      toast({
        title: "Format non supporté",
        description: "Veuillez sélectionner un fichier audio",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFrontData({
        ...frontData,
        audio: event.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleBackAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "L'audio ne doit pas dépasser 10 Mo",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith("audio/")) {
      toast({
        title: "Format non supporté",
        description: "Veuillez sélectionner un fichier audio",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setBackData({
        ...backData,
        audio: event.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!frontData.text.trim() && !frontData.image) {
      toast({
        title: "Contenu requis",
        description: "Veuillez ajouter du texte ou une image au recto de la carte",
        variant: "destructive",
      });
      return;
    }

    if (!backData.text.trim() && !backData.image) {
      toast({
        title: "Contenu requis",
        description: "Veuillez ajouter du texte ou une image au verso de la carte",
        variant: "destructive",
      });
      return;
    }

    onSubmit(
      {
        ...frontData,
        additionalInfo: showFrontInfo ? frontData.additionalInfo : undefined,
      },
      {
        ...backData,
        additionalInfo: showBackInfo ? backData.additionalInfo : undefined,
      }
    );
  };

  const formClasses = isMobile ? "mobile-form-container" : "p-6";
  const fieldClasses = isMobile ? "mobile-form-field" : "space-y-2";

  return (
    <form onSubmit={handleSubmit} className={formClasses}>
      <div className="grid grid-cols-1 gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Recto de la carte</h3>
          
          <div className={fieldClasses}>
            <Label htmlFor="front-text">Texte</Label>
            <Textarea
              id="front-text"
              rows={3}
              value={frontData.text}
              onChange={(e) => setFrontData({ ...frontData, text: e.target.value })}
              placeholder="Ex: Définition, question, mot..."
              className="w-full resize-y"
            />
          </div>
          
          <div className={fieldClasses}>
            <Label htmlFor="front-image">Image (optionnelle)</Label>
            <Input
              id="front-image"
              type="file"
              accept="image/*"
              onChange={handleFrontImageUpload}
              className="w-full"
            />
            {frontData.image && (
              <div className="relative mt-2 w-full h-32 rounded-md overflow-hidden border">
                <img
                  src={frontData.image}
                  alt="Recto"
                  className="w-full h-full object-contain"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 w-6 h-6 rounded-full"
                  onClick={() => setFrontData({ ...frontData, image: undefined })}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          
          <div className={fieldClasses}>
            <Label htmlFor="front-audio">Audio (optionnel)</Label>
            <Input
              id="front-audio"
              type="file"
              accept="audio/*"
              onChange={handleFrontAudioUpload}
              className="w-full"
            />
            {frontData.audio && (
              <div className="mt-2 relative">
                <audio controls className="w-full">
                  <source src={frontData.audio} />
                  Votre navigateur ne supporte pas l'audio.
                </audio>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 right-0 w-6 h-6 rounded-full"
                  onClick={() => setFrontData({ ...frontData, audio: undefined })}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2 mt-4">
            <Checkbox
              id="show-front-info"
              checked={showFrontInfo}
              onCheckedChange={(checked) => setShowFrontInfo(!!checked)}
            />
            <Label htmlFor="show-front-info">Ajouter des informations supplémentaires</Label>
          </div>
          
          {showFrontInfo && (
            <div className={fieldClasses + " mt-2"}>
              <Label htmlFor="front-additional-info">Informations supplémentaires</Label>
              <Textarea
                id="front-additional-info"
                rows={3}
                value={frontData.additionalInfo || ""}
                onChange={(e) => setFrontData({ ...frontData, additionalInfo: e.target.value })}
                placeholder="Contexte, notes, détails..."
                className="w-full resize-y"
              />
            </div>
          )}
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Verso de la carte</h3>
          
          <div className={fieldClasses}>
            <Label htmlFor="back-text">Texte</Label>
            <Textarea
              id="back-text"
              rows={3}
              value={backData.text}
              onChange={(e) => setBackData({ ...backData, text: e.target.value })}
              placeholder="Ex: Réponse, traduction..."
              className="w-full resize-y"
            />
          </div>
          
          <div className={fieldClasses}>
            <Label htmlFor="back-image">Image (optionnelle)</Label>
            <Input
              id="back-image"
              type="file"
              accept="image/*"
              onChange={handleBackImageUpload}
              className="w-full"
            />
            {backData.image && (
              <div className="relative mt-2 w-full h-32 rounded-md overflow-hidden border">
                <img
                  src={backData.image}
                  alt="Verso"
                  className="w-full h-full object-contain"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 w-6 h-6 rounded-full"
                  onClick={() => setBackData({ ...backData, image: undefined })}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          
          <div className={fieldClasses}>
            <Label htmlFor="back-audio">Audio (optionnel)</Label>
            <Input
              id="back-audio"
              type="file"
              accept="audio/*"
              onChange={handleBackAudioUpload}
              className="w-full"
            />
            {backData.audio && (
              <div className="mt-2 relative">
                <audio controls className="w-full">
                  <source src={backData.audio} />
                  Votre navigateur ne supporte pas l'audio.
                </audio>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 right-0 w-6 h-6 rounded-full"
                  onClick={() => setBackData({ ...backData, audio: undefined })}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2 mt-4">
            <Checkbox
              id="show-back-info"
              checked={showBackInfo}
              onCheckedChange={(checked) => setShowBackInfo(!!checked)}
            />
            <Label htmlFor="show-back-info">Ajouter des informations supplémentaires</Label>
          </div>
          
          {showBackInfo && (
            <div className={fieldClasses + " mt-2"}>
              <Label htmlFor="back-additional-info">Informations supplémentaires</Label>
              <Textarea
                id="back-additional-info"
                rows={3}
                value={backData.additionalInfo || ""}
                onChange={(e) => setBackData({ ...backData, additionalInfo: e.target.value })}
                placeholder="Contexte, notes, détails..."
                className="w-full resize-y"
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end gap-2 mt-6 sticky bottom-0 bg-background p-2 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Annuler
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
};

export default EditFlashCardForm;
