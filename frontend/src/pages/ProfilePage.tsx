"use client";

import * as React from "react";
import { ProfileEditModal } from "@/components/ui/ProfileEditModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Link as LinkIcon, Github, Linkedin, Instagram, Edit, Calendar, UserPlus } from "lucide-react";
import { CommentCard } from "@/components/CommentCard";
import { PostCommentModal } from "@/components/PostCommentModal";
import { toast } from "@/components/ui/use-toast";
import { useNavigate, useParams } from "react-router-dom";
import { SearchSidebar } from "@/components/SearchSidebar";
import { PostResponse } from "@/types";
import { format } from 'date-fns'; 
import { ptBR } from 'date-fns/locale';
import { FollowListModal } from "@/components/ui/FollowListModal";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";

// ... (Interface UserProfile permanece a mesma)
interface UserProfile {
  id: number;
  name: string;
  username: string;
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
  followers_count: number;
  following_count: number;
}

export function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser, requireAuth } = useAuth(); // Usamos o requireAuth do contexto
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = React.useState(false);
  
  const [isFollowersOpen, setIsFollowersOpen] = React.useState(false);
  const [isFollowingOpen, setIsFollowingOpen] = React.useState(false);
  const [followList, setFollowList] = React.useState<any[]>([]);
  const [isLoadingFollows, setIsLoadingFollows] = React.useState(false);

  const [userPosts, setUserPosts] = React.useState<PostResponse[]>([]);
  const [likedPosts, setLikedPosts] = React.useState<PostResponse[]>([]);
  const [profileData, setProfileData] = React.useState<UserProfile | null>(null);
  const [isLoadingPosts, setIsLoadingPosts] = React.useState(false);
  
  const isOwner = !username || (currentUser && currentUser.username === username);

  React.useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) {
        navigate('/login');
        toast({ title: "Acesso Restrito", description: "Faça login para ver perfis.", variant: "destructive" });
        return;
    }

    const fetchData = async () => {
      try {
        let userData;
        
        if (isOwner) {
            const userRes = await fetch("http://127.0.0.1:8000/users/me", {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!userRes.ok) throw new Error("Falha ao carregar perfil");
            userData = await userRes.json();
        } else if (username) {
            const userRes = await fetch(`http://127.0.0.1:8000/users/${username}`);
            if (!userRes.ok) throw new Error("Usuário não encontrado");
            userData = await userRes.json();
        }

        setProfileData(userData);

        if (userData?.id) {
            setIsLoadingPosts(true);
            const postsRes = await fetch(`http://127.0.0.1:8001/posts/user/${userData.id}`);
            if (postsRes.ok) setUserPosts(await postsRes.json());

            const likesRes = await fetch(`http://127.0.0.1:8001/posts/user/${userData.id}/liked`);
            if (likesRes.ok) setLikedPosts(await likesRes.json());
        }

      } catch (error) {
        console.error(error);
        toast({ title: "Erro", description: "Perfil indisponível.", variant: "destructive" });
        navigate('/');
      } finally {
        setIsLoadingPosts(false);
      }
    };

    fetchData();
  }, [navigate, username, isOwner]);

  const handleProtectedAction = (action: () => void) => {
    requireAuth(action);
  };

  const fetchFollowList = async (type: 'followers' | 'following') => {
    if (!profileData) return;
    setIsLoadingFollows(true);
    setFollowList([]);
    
    if (type === 'followers') setIsFollowersOpen(true);
    else setIsFollowingOpen(true);

    try {
      const response = await fetch(`http://127.0.0.1:8000/users/${profileData.id}/${type}`);
      if (response.ok) {
        const data = await response.json();
        setFollowList(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingFollows(false);
    }
  };

  const handleSaveProfile = async (data: any) => {
    const token = localStorage.getItem('userToken');
    try {
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
      setProfileData(updatedUser);
      toast({ title: "Perfil atualizado!" });
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível salvar.", variant: "destructive" });
    }
  };

  const submitNewPost = async (content: string) => { setIsPostModalOpen(false); };

  if (!profileData) return <div className="min-h-screen bg-[#0a0a0a] text-white p-8 text-center flex items-center justify-center">Carregando...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 lg:p-6">
        
        <aside className="lg:col-span-3 hidden lg:block">
           <SearchSidebar />
        </aside>

        <main className="lg:col-span-9 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-6">
                    <Card className="bg-[#121212] border border-white/10 shadow-2xl overflow-hidden rounded-2xl">
                        <div className="h-32 w-full bg-gradient-to-r from-purple-900 to-blue-900 relative">
                            {profileData.cover_picture && (
                                <img src={profileData.cover_picture} className="w-full h-full object-cover opacity-80" />
                            )}
                            {isOwner && (
                                <Button 
                                    variant="ghost" size="icon" 
                                    className="absolute top-2 right-2 bg-black/40 hover:bg-black/60 text-white rounded-full"
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    <Edit size={16} />
                                </Button>
                            )}
                        </div>

                        <CardContent className="px-6 pb-6 -mt-12 relative">
                            <div className="w-24 h-24 rounded-full border-4 border-[#121212] bg-gray-800 shadow-lg overflow-hidden mx-auto lg:mx-0">
                                {profileData.profile_picture ? (
                                    <img src={profileData.profile_picture} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>
                                )}
                            </div>

                            <div className="mt-4 text-center lg:text-left">
                                <h1 className="text-2xl font-bold text-white">{profileData.name}</h1>
                                <p className="text-purple-400 text-sm">@{profileData.username}</p>
                                
                                <p className="mt-4 text-sm text-gray-300 leading-relaxed">
                                    {profileData.bio || "Olá! Eu estou usando o UniTalks."}
                                </p>

                                {(profileData.college || profileData.course) && (
                                    <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/5 text-xs text-gray-300 space-y-1">
                                        {profileData.college && <div className="flex items-center gap-2"><MapPin size={12} className="text-purple-500"/> {profileData.college}</div>}
                                        {profileData.course && <div className="flex items-center gap-2"><Calendar size={12} className="text-blue-500"/> {profileData.course}</div>}
                                    </div>
                                )}

                                {/* Links Sociais */}
                                <div className="flex flex-wrap justify-center lg:justify-start gap-3 mt-4">
                                    {/* (Ícones de redes sociais mantidos como estão...) */}
                                    {profileData.github && <a href={profileData.github} target="_blank" className="text-gray-400 hover:text-white transition"><Github size={20}/></a>}
                                    {/* ... outros icones */}
                                </div>

                                <div className="flex justify-center lg:justify-start gap-6 mt-6 border-t border-white/10 pt-4">
                                    <button 
                                        onClick={() => handleProtectedAction(() => fetchFollowList('following'))}
                                        className="text-center group hover:bg-white/5 p-2 rounded-lg transition"
                                    >
                                        <span className="block text-lg font-bold text-white group-hover:text-purple-400">{profileData.following_count}</span>
                                        <span className="text-xs text-gray-500">Seguindo</span>
                                    </button>
                                    <button 
                                        onClick={() => handleProtectedAction(() => fetchFollowList('followers'))}
                                        className="text-center group hover:bg-white/5 p-2 rounded-lg transition"
                                    >
                                        <span className="block text-lg font-bold text-white group-hover:text-purple-400">{profileData.followers_count}</span>
                                        <span className="text-xs text-gray-500">Seguidores</span>
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
                <Tabs defaultValue="posts" className="w-full">
                    <TabsList className="w-full grid grid-cols-2 bg-[#121212] border border-white/10 p-1 rounded-xl">
                        <TabsTrigger value="posts" className="rounded-lg data-[state=active]:bg-purple-600 text-gray-400">Posts</TabsTrigger>
                        <TabsTrigger value="likes" className="rounded-lg data-[state=active]:bg-blue-600 text-gray-400">Curtidas</TabsTrigger>
                    </TabsList>

                    <TabsContent value="posts" className="mt-6 space-y-4">
                         {isLoadingPosts ? (
                             <div className="space-y-4">
                                 <Skeleton className="h-32 w-full bg-[#121212] rounded-xl"/>
                                 <Skeleton className="h-32 w-full bg-[#121212] rounded-xl"/>
                             </div>
                         ) : userPosts.length > 0 ? (
                            userPosts.map(post => (
                                <CommentCard
                                    key={post.id}
                                    id={post.id.toString()}
                                    userId={post.owner.id.toString()}
                                    author={post.owner.name}
                                    username={post.owner.username}
                                    content={post.content}
                                    agreeCount={post.agree_count}
                                    disagreeCount={post.disagree_count}
                                    timestamp={format(new Date(post.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                    initialReplies={post.replies || []}
                                />
                            ))
                         ) : (
                             <div className="text-center py-10 text-gray-500 bg-[#121212] rounded-xl border border-white/5">Nenhum post.</div>
                         )}
                    </TabsContent>

                    <TabsContent value="likes" className="mt-6 space-y-4">
                         {/* Lista de curtidas (reutilizando a lógica acima) */}
                         {likedPosts.length > 0 ? likedPosts.map(post => (
                            <CommentCard
                                key={post.id}
                                id={post.id.toString()}
                                userId={post.owner.id.toString()}
                                author={post.owner.name}
                                username={post.owner.username}
                                content={post.content}
                                agreeCount={post.agree_count}
                                disagreeCount={post.disagree_count}
                                timestamp={format(new Date(post.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                initialReplies={post.replies || []}
                            />
                         )) : <div className="text-center py-10 text-gray-500">Nenhuma curtida.</div>}
                    </TabsContent>
                </Tabs>
            </div>
        </main>
      </div>

      {isOwner && profileData && (
        <ProfileEditModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveProfile}
            initialData={{...profileData, profileName: profileData.name}}
        />
      )}

      <FollowListModal isOpen={isFollowersOpen} onClose={() => setIsFollowersOpen(false)} title="Seguidores" users={followList} isLoading={isLoadingFollows} />
      <FollowListModal isOpen={isFollowingOpen} onClose={() => setIsFollowingOpen(false)} title="Seguindo" users={followList} isLoading={isLoadingFollows} />
      <PostCommentModal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} onSubmit={submitNewPost} />
    </div>
  );
}