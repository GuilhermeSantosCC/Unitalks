"use client";

import * as React from "react";
import { ProfileEditModal } from "@/components/ui/ProfileEditModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Link as LinkIcon, Calendar, Github, Linkedin, Instagram, Edit, Camera } from "lucide-react";
import { CommentCard } from "@/components/CommentCard";
import { PostCommentModal } from "@/components/PostCommentModal";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { SearchSidebar } from "@/components/SearchSidebar";
import { TrendingDiscussions } from "@/components/TrendingDiscussions";
import { PostResponse } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns'; 
import { ptBR } from 'date-fns/locale';

interface UserProfile {
  id: number;
  name: string;     // Nome de Exibição
  username: string; // @handle
  email: string;
  bio: string;
  college: string;
  course: string;
  profile_picture: string;
  cover_picture: string;
  linkedin: string;
  instagram: string;
  github: string;
  custom_link: string;
  uni_link: string;
}

export function ProfilePage() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = React.useState(false);
  
  const [userPosts, setUserPosts] = React.useState<PostResponse[]>([]);
  const [likedPosts, setLikedPosts] = React.useState<PostResponse[]>([]);
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [isLoadingPosts, setIsLoadingPosts] = React.useState(false);
  
  const navigate = useNavigate();

  // --- Carregar Dados ---
  React.useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // 1. Buscar Perfil
        const userRes = await fetch("http://127.0.0.1:8000/users/me", {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!userRes.ok) throw new Error("Falha ao carregar perfil");
        const userData = await userRes.json();
        setUserProfile(userData);

        // 2. Buscar Posts do Usuário
        setIsLoadingPosts(true);
        const postsRes = await fetch(`http://127.0.0.1:8001/posts/user/${userData.id}`);
        if (postsRes.ok) setUserPosts(await postsRes.json());

        // 3. Buscar Curtidas
        const likesRes = await fetch(`http://127.0.0.1:8001/posts/user/${userData.id}/liked`);
        if (likesRes.ok) setLikedPosts(await likesRes.json());

      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingPosts(false);
      }
    };

    fetchData();
  }, [navigate]);

  // --- Função Auxiliar: Converter Imagem para Base64 ---
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // --- Salvar Perfil ---
  const handleSaveProfile = async (data: any) => {
    const token = localStorage.getItem('userToken');
    try {
      // Se houver arquivos de imagem vindo do modal, converte para string base64
      // (Nota: Você precisará adaptar o ProfileEditModal para enviar Files ou Strings)
      // Aqui assumimos que o Modal já manda as strings ou os dados prontos.
      
      const response = await fetch("http://127.0.0.1:8000/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error("Erro ao atualizar");
      
      const updatedUser = await response.json();
      setUserProfile(updatedUser);
      toast({ title: "Perfil atualizado!" });

    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível salvar.", variant: "destructive" });
    }
  };

  const submitNewPost = async (content: string) => {
     // Reutilizando a lógica se necessário, mas o SearchSidebar já faz isso
     setIsPostModalOpen(false);
  };

  if (!userProfile) return <div className="min-h-screen bg-black text-white p-8 text-center">Carregando...</div>;

  return (
    <div className="min-h-screen bg-black text-white flex justify-center">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6">
        
        {/* ESQUERDA: Navegação (SearchSidebar) */}
        <aside className="lg:col-span-3 border-r border-gray-800 h-screen sticky top-0 hidden lg:block">
           <SearchSidebar />
        </aside>

        {/* CENTRO: Perfil */}
        <main className="lg:col-span-6 border-r border-gray-800 min-h-screen pb-20">
          
          {/* Header Fixo (Nome) */}
          <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md p-3 border-b border-gray-800 flex items-center gap-4">
            <h2 className="text-lg font-bold">{userProfile.name}</h2>
            <span className="text-xs text-gray-500">{userPosts.length} posts</span>
          </div>

          {/* Capa e Avatar */}
          <div className="relative">
            <div className="h-48 bg-gray-800 w-full overflow-hidden">
               {userProfile.cover_picture ? (
                 <img src={userProfile.cover_picture} alt="Capa" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full bg-gradient-to-r from-blue-900 to-purple-900"></div>
               )}
            </div>
            <div className="absolute -bottom-16 left-4">
               <div className="w-32 h-32 rounded-full border-4 border-black bg-gray-900 overflow-hidden">
                 {userProfile.profile_picture ? (
                   <img src={userProfile.profile_picture} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>
                 )}
               </div>
            </div>
            <div className="flex justify-end p-4">
               <Button 
                  variant="outline" 
                  className="rounded-full border-gray-600 text-white hover:bg-white/10 font-bold"
                  onClick={() => setIsModalOpen(true)}
               >
                  Editar perfil
               </Button>
            </div>
          </div>

          {/* Informações do Usuário */}
          <div className="mt-12 px-4">
             <h1 className="text-xl font-extrabold">{userProfile.name}</h1>
             <p className="text-gray-500">@{userProfile.username || "sem_usuario"}</p>
             
             <p className="mt-4 text-white whitespace-pre-wrap">{userProfile.bio || "Sem biografia."}</p>
             
             <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-sm text-gray-500">
                {userProfile.college && (
                  <span className="flex items-center gap-1"><MapPin size={14}/> {userProfile.college}</span>
                )}
                {userProfile.course && (
                  <span className="flex items-center gap-1">🎓 {userProfile.course}</span>
                )}
                {userProfile.github && (
                  <a href={userProfile.github} target="_blank" className="flex items-center gap-1 text-blue-400 hover:underline"><Github size={14}/> GitHub</a>
                )}
                {userProfile.linkedin && (
                  <a href={userProfile.linkedin} target="_blank" className="flex items-center gap-1 text-blue-400 hover:underline"><Linkedin size={14}/> LinkedIn</a>
                )}
                {userProfile.instagram && (
                   <a href={userProfile.instagram} target="_blank" className="flex items-center gap-1 text-blue-400 hover:underline"><Instagram size={14}/> Instagram</a>
                )}
                {userProfile.custom_link && (
                   <a href={userProfile.custom_link} target="_blank" className="flex items-center gap-1 text-blue-400 hover:underline"><LinkIcon size={14}/> Link</a>
                )}
             </div>
             
             <div className="flex gap-4 mt-3 text-sm">
                <span><strong className="text-white">100</strong> Seguindo</span>
                <span><strong className="text-white">500</strong> Seguidores</span>
             </div>
          </div>

          {/* Abas: Posts e Curtidas */}
          <Tabs defaultValue="posts" className="w-full mt-6">
            <TabsList className="w-full grid grid-cols-2 bg-transparent border-b border-gray-800 rounded-none p-0 h-auto">
              <TabsTrigger 
                value="posts" 
                className="rounded-none border-b-4 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent text-gray-500 data-[state=active]:text-white py-4 hover:bg-white/5 transition"
              >
                Posts
              </TabsTrigger>
              <TabsTrigger 
                value="likes" 
                className="rounded-none border-b-4 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent text-gray-500 data-[state=active]:text-white py-4 hover:bg-white/5 transition"
              >
                Curtidas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="mt-0">
               {isLoadingPosts ? <div className="p-8 text-center">Carregando...</div> : (
                 userPosts.length > 0 ? (
                    userPosts.map(post => (
                       <div key={post.id} className="border-b border-gray-800">
                          <CommentCard
                            id={post.id.toString()}
                            userId={post.owner.id.toString()}
                            author={post.owner.name}
                            content={post.content}
                            agreeCount={post.agree_count}
                            disagreeCount={post.disagree_count}
                            timestamp={format(new Date(post.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            initialReplies={post.replies || []}
                          />
                       </div>
                    ))
                 ) : <div className="p-12 text-center text-gray-500">Nenhum post ainda.</div>
               )}
            </TabsContent>

            <TabsContent value="likes" className="mt-0">
               {/* Só mostramos posts curtidos (o dislike não aparece por privacidade) */}
               {likedPosts.length > 0 ? (
                    likedPosts.map(post => (
                       <div key={post.id} className="border-b border-gray-800">
                          <CommentCard
                            id={post.id.toString()}
                            userId={post.owner.id.toString()}
                            author={post.owner.name}
                            content={post.content}
                            agreeCount={post.agree_count}
                            disagreeCount={post.disagree_count}
                            timestamp={format(new Date(post.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            initialReplies={post.replies || []}
                          />
                       </div>
                    ))
                 ) : <div className="p-12 text-center text-gray-500">Nenhuma curtida ainda.</div>}
            </TabsContent>
          </Tabs>
        </main>

        {/* DIREITA: Trending */}
        <aside className="lg:col-span-3 p-4 h-screen sticky top-0 hidden lg:block">
           <TrendingDiscussions />
        </aside>
      </div>

      {/* Modais */}
      <ProfileEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProfile}
        // Passamos os dados atuais para o modal
        initialData={{
          ...userProfile,
          // Tratamento para campos que podem vir nulos
          username: userProfile.username || "",
          linkedin: userProfile.linkedin || "",
          instagram: userProfile.instagram || "",
          uniLink: userProfile.uni_link || "",
          bio: userProfile.bio || "",
          profileName: userProfile.name || "",
          // Passar URLs de imagem existentes
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