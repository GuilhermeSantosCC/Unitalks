// src/pages/ProfilePage.tsx

'use client';

import * as React from 'react';
import { ProfileEditModal } from '@/components/ui/ProfileEditModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Link as LinkIcon, Github, Linkedin, Instagram, Edit, Calendar } from 'lucide-react';
import { CommentCard } from '@/components/CommentCard';
import { PostCommentModal } from '@/components/PostCommentModal';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { SearchSidebar } from '@/components/SearchSidebar';
import { PostResponse } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FollowListModal } from '@/components/ui/FollowListModal';
import { Skeleton } from '@/components/ui/skeleton';

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
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = React.useState(false);

  // Estados para os Modais de Seguidores
  const [isFollowersOpen, setIsFollowersOpen] = React.useState(false);
  const [isFollowingOpen, setIsFollowingOpen] = React.useState(false);
  const [followList, setFollowList] = React.useState<any[]>([]);
  const [isLoadingFollows, setIsLoadingFollows] = React.useState(false);

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
        // 1. Perfil
        const userRes = await fetch('http://127.0.0.1:8000/users/me', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!userRes.ok) throw new Error('Falha ao carregar perfil');
        const userData = await userRes.json();
        setUserProfile(userData);

        // 2. Posts
        setIsLoadingPosts(true);
        const postsRes = await fetch(`http://127.0.0.1:8001/posts/user/${userData.id}`);
        if (postsRes.ok) setUserPosts(await postsRes.json());

        // 3. Curtidas
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

  // --- Buscar Lista de Seguidores/Seguindo ---
  const fetchFollowList = async (type: 'followers' | 'following') => {
    if (!userProfile) return;
    setIsLoadingFollows(true);
    setFollowList([]);

    if (type === 'followers') setIsFollowersOpen(true);
    else setIsFollowingOpen(true);

    try {
      const response = await fetch(`http://127.0.0.1:8000/users/${userProfile.id}/${type}`);
      if (response.ok) {
        const data = await response.json();
        setFollowList(data);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a lista.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingFollows(false);
    }
  };

  // --- Salvar Perfil ---
  const handleSaveProfile = async (data: any) => {
    const token = localStorage.getItem('userToken');
    try {
      const response = await fetch('http://127.0.0.1:8000/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erro ao atualizar');
      const updatedUser = await response.json();
      setUserProfile(updatedUser);
      toast({ title: 'Perfil atualizado!' });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar.',
        variant: 'destructive',
      });
    }
  };

  const submitNewPost = async (content: string) => {
    setIsPostModalOpen(false);
  };

  if (!userProfile)
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background text-foreground p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500"></div>
      </div>
    );

  return (
    <div className="h-screen w-full bg-background text-foreground font-sans overflow-x-hidden">
      {/* Grid Principal */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 lg:p-6">
        {/* --- COLUNA ESQUERDA: Sidebar de Navegação (Só em telas grandes) --- */}
        <aside className="lg:col-span-3 hidden lg:block">
          <SearchSidebar />
        </aside>

        {/* --- COLUNA CENTRAL: Perfil & Posts --- */}
        <main className="lg:col-span-9 space-y-6">
          {/* 1. Card de Perfil (Estilo X/Tumblr) */}
          <Card className="bg-[#141414]/60 backdrop-blur-md border border-white/10 shadow-[0_0_40px_rgba(139,92,246,0.1)] rounded-2xl overflow-hidden">
            {/* Capa */}
            <div className="h-24 w-full bg-gradient-to-r from-purple-900 to-blue-900 relative">
              {userProfile.cover_picture && (
                <img src={userProfile.cover_picture} className="w-full h-full object-cover opacity-80" />
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-black/40 hover:bg-black/60 text-white rounded-full"
                onClick={() => setIsModalOpen(true)}
              >
                <Edit size={16} />
              </Button>
            </div>

            <CardContent className="px-4 pb-4 -mt-12 relative">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full border-4 border-[#141414] bg-gray-800 shadow-lg overflow-hidden mx-auto lg:mx-0">
                {userProfile.profile_picture ? (
                  <img src={userProfile.profile_picture} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl">👤</div>
                )}
              </div>

              <div className="mt-3 text-center lg:text-left">
                <h1 className="text-xl font-bold text-white">{userProfile.name}</h1>
                <p className="text-purple-400 text-sm">@{userProfile.username}</p>

                <p className="mt-3 text-sm text-gray-300 leading-relaxed">
                  {userProfile.bio || 'Olá! Eu estou usando o UniTalks.'}
                </p>

                {/* Infos Acadêmicas */}
                {(userProfile.college || userProfile.course) && (
                  <div className="mt-3 p-2 bg-white/5 rounded-lg border border-white/5 text-xs text-gray-300 space-y-1">
                    {userProfile.college && (
                      <div className="flex items-center gap-1">
                        <MapPin size={12} className="text-purple-500" /> {userProfile.college}
                      </div>
                    )}
                    {userProfile.course && (
                      <div className="flex items-center gap-1">
                        <Calendar size={12} className="text-blue-500" /> {userProfile.course}
                      </div>
                    )}
                  </div>
                )}

                {/* Links Sociais */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-2 mt-3">
                  {userProfile.github && (
                    <a href={userProfile.github} target="_blank" className="text-gray-400 hover:text-white transition">
                      <Github size={18} />
                    </a>
                  )}
                  {userProfile.linkedin && (
                    <a href={userProfile.linkedin} target="_blank" className="text-gray-400 hover:text-blue-400 transition">
                      <Linkedin size={18} />
                    </a>
                  )}
                  {userProfile.instagram && (
                    <a href={userProfile.instagram} target="_blank" className="text-gray-400 hover:text-pink-400 transition">
                      <Instagram size={18} />
                    </a>
                  )}
                  {userProfile.custom_link && (
                    <a href={userProfile.custom_link} target="_blank" className="text-gray-400 hover:text-purple-400 transition">
                      <LinkIcon size={18} />
                    </a>
                  )}
                </div>

                {/* Seguidores / Seguindo */}
                <div className="flex justify-center lg:justify-start gap-6 mt-4 border-t border-white/10 pt-3">
                  <button
                    onClick={() => fetchFollowList('following')}
                    className="text-center group hover:bg-white/5 p-2 rounded-lg transition"
                  >
                    <span className="block text-lg font-bold text-white group-hover:text-purple-400">
                      {userProfile.following_count}
                    </span>
                    <span className="text-xs text-gray-500">Seguindo</span>
                  </button>
                  <button
                    onClick={() => fetchFollowList('followers')}
                    className="text-center group hover:bg-white/5 p-2 rounded-lg transition"
                  >
                    <span className="block text-lg font-bold text-white group-hover:text-purple-400">
                      {userProfile.followers_count}
                    </span>
                    <span className="text-xs text-gray-500">Seguidores</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Tabs: Meus Posts / Curtidas */}
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="w-full grid grid-cols-2 bg-[#141414]/60 border border-white/10 p-1 rounded-xl">
              <TabsTrigger
                value="posts"
                className="rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400"
              >
                Meus Posts
              </TabsTrigger>
              <TabsTrigger
                value="likes"
                className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400"
              >
                Curtidas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="mt-4 space-y-4">
              {isLoadingPosts ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full bg-[#141414]/60 rounded-xl" />
                  <Skeleton className="h-24 w-full bg-[#141414]/60 rounded-xl" />
                </div>
              ) : userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <CommentCard
                    key={post.id}
                    id={post.id.toString()}
                    userId={post.owner.id.toString()}
                    author={post.owner.name}
                    content={post.content}
                    agreeCount={post.agree_count}
                    disagreeCount={post.disagree_count}
                    timestamp={format(new Date(post.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    initialReplies={post.replies || []}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 bg-[#141414]/60 rounded-xl border border-white/5">
                  Você ainda não fez nenhum post.
                </div>
              )}
            </TabsContent>

            <TabsContent value="likes" className="mt-4 space-y-4">
              {likedPosts.length > 0 ? (
                likedPosts.map((post) => (
                  <CommentCard
                    key={post.id}
                    id={post.id.toString()}
                    userId={post.owner.id.toString()}
                    author={post.owner.name}
                    content={post.content}
                    agreeCount={post.agree_count}
                    disagreeCount={post.disagree_count}
                    timestamp={format(new Date(post.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    initialReplies={post.replies || []}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 bg-[#141414]/60 rounded-xl border border-white/5">
                  Nenhuma curtida ainda.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* --- MODAIS --- */}
      <ProfileEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProfile}
        initialData={{
          ...userProfile,
          username: userProfile.username || '',
          profileName: userProfile.name || '',
        }}
      />

      <FollowListModal
        isOpen={isFollowersOpen}
        onClose={() => setIsFollowersOpen(false)}
        title="Seguidores"
        users={followList}
        isLoading={isLoadingFollows}
      />

      <FollowListModal
        isOpen={isFollowingOpen}
        onClose={() => setIsFollowingOpen(false)}
        title="Seguindo"
        users={followList}
        isLoading={isLoadingFollows}
      />

      <PostCommentModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onSubmit={submitNewPost}
      />
    </div>
  );
}