"use client";

import * as React from "react";
import { ProfileEditModal } from "@/components/ui/ProfileEditModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Link, Edit } from "lucide-react";
import { CommentCard } from "@/components/CommentCard";
import { PostCommentModal } from "@/components/PostCommentModal";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { SearchSidebar } from "@/components/SearchSidebar";

interface UserProfile {
  username: string;
  profileName: string;
  bio: string;
  photoUrl: string;
  linkedin: string;
  instagram: string;
  uniLink: string;
}

interface PostData {
  id: string;
  userId: string;
  author: string;
  content: string;
  agreeCount: number;
  disagreeCount: number;
  timestamp: string;
  replies: any[]; 
}

export function ProfilePage() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = React.useState(false);
  const [userPosts, setUserPosts] = React.useState<PostData[]>([]);
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  
  const navigate = useNavigate();

  React.useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      toast({ title: "Acesso Negado", description: "Você precisa estar logado para ver seu perfil.", variant: "destructive" });
      navigate('/login');
      return;
    }

    // TODO: Implementar 'fetch' para /api/users/me na branch 'api-profile'
    setUserProfile({
      username: "@usuario",
      profileName: "Carregando...",
      bio: "Aguardando implementação da API de perfil...",
      photoUrl: "",
      linkedin: "",
      instagram: "",
      uniLink: "",
    });
  }, [navigate]);

  const handleSaveProfile = async (data: Omit<UserProfile, 'photoUrl' | 'isEditing'>) => {
    console.warn("API de Edição de Perfil não implementada.");
    toast({ title: "Simulado", description: "Perfil salvo (simulação)." });
    setUserProfile((prev) => prev ? {
      ...prev,
      ...data,
      username: `@${data.username.replace("@", "")}`,
    } : null);
  };

  const submitNewPost = async (content: string) => {
     console.warn("API de Posts não implementada (via ProfilePage).");
     setIsPostModalOpen(false);
  };

  if (!userProfile) {
    return <div className="min-h-screen bg-[#111111] text-white p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-[#111111] text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Coluna lateral ESQUERDA (Vazia ou Trending futuramente) */}
        <aside className="lg:col-span-3 bg-[#1D1D1D] rounded-lg p-4 h-fit hidden lg:block">
          <div className="text-sm text-gray-500 text-center">
            Espaço para Trending Topics
          </div>
        </aside>

        {/* Perfil CENTRAL */}
        <main className="lg:col-span-6">
          <h1 className="text-xl font-bold mb-4">UniTalks - Seu espaço de fala!</h1>

          <Card className="bg-[#1D1D1D] border-none shadow-lg mb-6">
            <div
              className="h-40 rounded-t-lg"
              style={{ background: "linear-gradient(to right, #00C6FF, #0072FF, #8E44AD)" }}
            ></div>
            <CardContent className="p-6 -mt-16">
              <div className="flex items-end space-x-4">
                <div className="w-24 h-24 rounded-full bg-gray-700 border-4 border-[#1D1D1D] flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
                <div className="flex-grow">
                  <p className="text-lg font-bold text-white mt-1">{userProfile.username}</p>
                  <h2 className="text-2xl font-extrabold text-white">{userProfile.profileName}</h2>
                </div>
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center gap-2"
                  size="sm"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </Button>
              </div>

              <div className="mt-4">
                <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-2">
                   <div className="flex items-center gap-2">
                      <Link className="w-4 h-4" />
                      <span>Links sociais indisponíveis</span>
                   </div>
                </div>

                <p className="text-base text-gray-300 mt-3">
                  <span className="font-bold text-white">Biografia</span>
                  <br />
                  {userProfile.bio}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="feitos" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#252525] border border-gray-700">
              <TabsTrigger value="feitos">Comentários Feitos ({userPosts.length})</TabsTrigger>
              <TabsTrigger value="curtidos">Curtidos (0)</TabsTrigger>
            </TabsList>

            <TabsContent value="feitos" className="mt-4 grid gap-4">
              {userPosts.length > 0 ? (
                userPosts.map((post) => (
                  // @ts-ignore
                  <CommentCard key={post.id} {...post} />
                ))
              ) : (
                <p className="text-gray-400 text-center p-8 bg-[#1D1D1D] rounded-lg">
                  Nenhum comentário carregado.
                </p>
              )}
            </TabsContent>
            <TabsContent value="curtidos" className="mt-4 grid gap-4">
               <p className="text-gray-400 text-center p-8 bg-[#1D1D1D] rounded-lg">
                  Funcionalidade de posts curtidos ainda não implementada.
                </p>
            </TabsContent>
          </Tabs>
        </main>

        {/* Coluna lateral DIREITA (Agora com Navegação!) */}
        <aside className="lg:col-span-3">
            <SearchSidebar />
        </aside>
      </div>

      <ProfileEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProfile}
        initialData={{
          bio: userProfile.bio,
          profileName: userProfile.profileName,
          username: userProfile.username.replace("@", ""),
          linkedin: userProfile.linkedin,
          instagram: userProfile.instagram,
          uniLink: userProfile.uniLink,
        }}
      />

      <PostCommentModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)}
        onSubmit={submitNewPost} 
      />
    </div>
  );
}