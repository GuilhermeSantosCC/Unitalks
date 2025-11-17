import React, { useState, useRef, ChangeEvent, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, X, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface ProfileData {
  name?: string;
  username?: string;
  bio?: string;
  college?: string;
  course?: string;
  linkedin?: string;
  instagram?: string;
  github?: string;
  custom_link?: string;
  uni_link?: string;
  profile_picture?: string;
  cover_picture?: string;
}

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProfileData) => Promise<void>;
  initialData: any; // Recebe os dados atuais do ProfilePage
}

export function ProfileEditModal({ isOpen, onClose, onSave, initialData }: ProfileEditModalProps) {
  const [formData, setFormData] = useState<ProfileData>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs para os inputs de arquivo (escondidos)
  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Carrega os dados iniciais quando o modal abre
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        name: initialData.profileName, // Mapeando do ProfilePage
        username: initialData.username,
        bio: initialData.bio,
        college: initialData.college,
        course: initialData.course,
        linkedin: initialData.linkedin,
        instagram: initialData.instagram,
        github: initialData.github,
        custom_link: initialData.custom_link,
        uni_link: initialData.uniLink,
        profile_picture: initialData.photoUrl || initialData.profile_picture,
        cover_picture: initialData.cover_picture,
      });
    }
  }, [isOpen, initialData]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Lógica de Imagem (Converter para Base64) ---
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>, field: 'profile_picture' | 'cover_picture') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        toast({ title: "Arquivo muito grande", description: "A imagem deve ter no máximo 2MB.", variant: "destructive" });
        return;
    }

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });

      setFormData((prev) => ({ ...prev, [field]: base64 }));
    } catch (error) {
      console.error("Erro ao converter imagem", error);
      toast({ title: "Erro", description: "Falha ao processar a imagem.", variant: "destructive" });
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1D1D1D] border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription className="text-gray-400">
            Atualize suas informações pessoais e links.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          
          {/* --- Seção de Imagens (Estilo Capa/Avatar) --- */}
          <div className="relative mb-12">
            {/* Capa */}
            <div className="h-32 w-full bg-gray-800 rounded-md overflow-hidden relative group">
              {formData.cover_picture ? (
                <img src={formData.cover_picture} alt="Capa" className="w-full h-full object-cover opacity-80" />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-gray-700 to-gray-600"></div>
              )}
              
              {/* Botão Editar Capa */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full bg-black/50 text-white hover:bg-black/70"
                    onClick={() => coverInputRef.current?.click()}
                >
                    <Camera className="h-5 w-5" />
                </Button>
              </div>
              <input 
                type="file" 
                ref={coverInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => handleImageUpload(e, 'cover_picture')} 
              />
            </div>

            {/* Avatar (Sobreposto) */}
            <div className="absolute -bottom-10 left-4">
               <div className="relative group">
                 <div className="w-24 h-24 rounded-full border-4 border-[#1D1D1D] bg-gray-700 overflow-hidden">
                    {formData.profile_picture ? (
                        <img src={formData.profile_picture} alt="Perfil" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
                    )}
                 </div>
                 {/* Botão Editar Avatar */}
                 <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => profileInputRef.current?.click()}>
                    <Camera className="h-6 w-6 text-white" />
                 </div>
                 <input 
                    type="file" 
                    ref={profileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => handleImageUpload(e, 'profile_picture')} 
                 />
               </div>
            </div>
          </div>

          {/* --- Campos de Texto --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome de Exibição</Label>
              <Input id="name" name="name" value={formData.name || ""} onChange={handleChange} className="bg-gray-800 border-gray-600" placeholder="Seu Nome" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Usuário (@)</Label>
              <Input id="username" name="username" value={formData.username || ""} onChange={handleChange} className="bg-gray-800 border-gray-600" placeholder="@usuario" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biografia</Label>
            <Textarea id="bio" name="bio" value={formData.bio || ""} onChange={handleChange} className="bg-gray-800 border-gray-600 min-h-[80px]" placeholder="Conte um pouco sobre você..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label htmlFor="college">Faculdade</Label>
              <Input id="college" name="college" value={formData.college || ""} onChange={handleChange} className="bg-gray-800 border-gray-600" placeholder="Ex: USP" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course">Curso</Label>
              <Input id="course" name="course" value={formData.course || ""} onChange={handleChange} className="bg-gray-800 border-gray-600" placeholder="Ex: Ciência da Computação" />
            </div>
          </div>

          {/* --- Links Sociais --- */}
          <div className="border-t border-gray-700 pt-4 mt-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Links Sociais (Opcional)</h3>
            <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-gray-500 w-20 text-sm">LinkedIn</span>
                    <Input name="linkedin" value={formData.linkedin || ""} onChange={handleChange} className="bg-gray-800 border-gray-600" placeholder="https://linkedin.com/in/..." />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-gray-500 w-20 text-sm">GitHub</span>
                    <Input name="github" value={formData.github || ""} onChange={handleChange} className="bg-gray-800 border-gray-600" placeholder="https://github.com/..." />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-gray-500 w-20 text-sm">Instagram</span>
                    <Input name="instagram" value={formData.instagram || ""} onChange={handleChange} className="bg-gray-800 border-gray-600" placeholder="https://instagram.com/..." />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-gray-500 w-20 text-sm">Outro</span>
                    <Input name="custom_link" value={formData.custom_link || ""} onChange={handleChange} className="bg-gray-800 border-gray-600" placeholder="Seu portfolio ou site" />
                </div>
            </div>
          </div>

        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700 text-white">
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}