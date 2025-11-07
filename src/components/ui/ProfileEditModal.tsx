"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    bio: string;
    profileName: string;
    username: string;
    linkedin: string;
    instagram: string;
    uniLink: string;
  }) => void;
  initialData: {
    bio: string;
    profileName: string;
    username: string;
    linkedin: string;
    instagram: string;
    uniLink: string;
  };
}

export function ProfileEditModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: ProfileEditModalProps) {
  const [bio, setBio] = React.useState(initialData.bio);
  const [profileName, setProfileName] = React.useState(initialData.profileName);
  const [username, setUsername] = React.useState(initialData.username);
  const [linkedin, setLinkedin] = React.useState(initialData.linkedin);
  const [instagram, setInstagram] = React.useState(initialData.instagram);
  const [uniLink, setUniLink] = React.useState(initialData.uniLink);

  React.useEffect(() => {
    setBio(initialData.bio);
    setProfileName(initialData.profileName);
    setUsername(initialData.username);
    setLinkedin(initialData.linkedin);
    setInstagram(initialData.instagram);
    setUniLink(initialData.uniLink);
  }, [initialData, isOpen]);

  const handleSave = () => {
    onSave({ bio, profileName, username, linkedin, instagram, uniLink });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] dark:bg-gray-800 dark:text-white border-none p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Editar Perfil</DialogTitle>
          <DialogDescription className="text-sm text-gray-400">
            Atualize suas informações e links de redes sociais.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="profileName" className="text-right">Nome</Label>
            <Input id="profileName" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">Usuário</Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="linkedin" className="text-right">LinkedIn</Label>
            <Input id="linkedin" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="col-span-3" placeholder="https://linkedin.com/in/..." />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="instagram" className="text-right">Instagram</Label>
            <Input id="instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} className="col-span-3" placeholder="https://instagram.com/..." />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="uniLink" className="text-right">Link pessoal</Label>
            <Input id="uniLink" value={uniLink} onChange={(e) => setUniLink(e.target.value)} className="col-span-3" placeholder="https://..." />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="bio" className="text-right mt-2">Bio</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="col-span-3 resize-none" />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white">Salvar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
