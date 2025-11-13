"use client";

import * as React from "react";
import { ProfileEditModal } from "@/components/ui/ProfileEditModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, User, Link, Edit } from "lucide-react";
import { CommentCard } from "@/components/CommentCard";
import { PostCommentModal } from "@/components/PostCommentModal";

interface UserProfile {
  username: string;
  profileName: string;
  bio: string;
  photoUrl: string;
  linkedin: string;
  instagram: string;
  uniLink: string;
  isEditing: boolean;
}

interface PostData {
  id: string;
  userId: string;
  author: string;
  content: string;
  agreeCount: number;
  disagreeCount: number;
  timestamp: string;
}

const mockDiscussions = [
  { id: 1, title: "TypeScript vs JavaScript", views: "1.142", comments: "98" },
  { id: 2, title: "React vs Vue.js", views: "1.117", comments: "45" },
  { id: 3, title: "Dark Mode é essencial?", views: "1.88", comments: "85" },
];

export function ProfilePage() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<AuthUser | null>(null);
  const [userPosts, setUserPosts] = React.useState<PostData[]>([]);

  const [userProfile, setUserProfile] = React.useState<UserProfile>({
    username: "@nomedousuário",
    profileName: "Nome Completo do Usuário",
    bio: "Olá! Sou um entusiasta da tecnologia e desenvolvimento web. Gosto de discutir frameworks e novas tendências.",
    photoUrl: "[Imagem de Perfil]",
    linkedin: "https://linkedin.com/in/",
    instagram: "https://instagram.com/",
    uniLink: "https://unneg/ioussbe",
    isEditing: false,
  });

  const handleSaveProfile = (data: {
    bio: string;
    profileName: string;
    username: string;
    linkedin: string;
    instagram: string;
    uniLink: string;
  }) => {
    setUserProfile((prev) => ({
      ...prev,
      bio: data.bio,
      profileName: data.profileName,
      username: `@${data.username.replace("@", "")}`,
      linkedin: data.linkedin,
      instagram: data.instagram,
      uniLink: data.uniLink,
    }));
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna lateral */}
        <aside className="lg:col-span-3 bg-[#1D1D1D] rounded-lg p-4 h-fit">
          <h2 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">
            Discussões do momento
          </h2>
          <nav>
            {mockDiscussions.map((d, index) => (
              <a
                key={d.id}
                href="#"
                className="flex justify-between items-center p-2 rounded-md hover:bg-[#252525] transition-colors mb-2 group"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium group-hover:text-purple-400">{d.title}</span>
                  <span className="text-xs text-gray-400">
                    {d.views} 👁️ | {d.comments} 💬
                  </span>
                </div>
                <span className="text-xs text-gray-500 font-bold">#{index + 1}</span>
              </a>
            ))}
          </nav>
        </aside>

        {/* Perfil central */}
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
                  {userProfile.linkedin && (
                    <a
                      href={userProfile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center hover:text-purple-400 transition-colors"
                    >
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/480px-LinkedIn_logo_initials.png"
                        alt="LinkedIn"
                        className="w-4 h-4 mr-1"
                      />
                      LinkedIn
                    </a>
                  )}
                  {userProfile.instagram && (
                    <a
                      href={userProfile.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center hover:text-purple-400 transition-colors"
                    >
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Instagram_logo_2022.svg/1000px-Instagram_logo_2022.svg.png"
                        alt="Instagram"
                        className="w-4 h-4 mr-1"
                      />
                      Instagram
                    </a>
                  )}
                  {userProfile.uniLink && (
                    <a
                      href={userProfile.uniLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center hover:text-purple-400 transition-colors"
                    >
                      <Link className="w-4 h-4 mr-1" />
                      {userProfile.uniLink}
                    </a>
                  )}
                </div>

                <p className="text-base text-gray-300 mt-3">
                  <span className="font-bold text-white">Biografia</span>
                  <br />
                  {userProfile.bio}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tabs dos comentários */}
          <Tabs defaultValue="feitos" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#252525] border border-gray-700">
              <TabsTrigger value="feitos">Comentários Feitos ({userPosts.length})</TabsTrigger>
              <TabsTrigger value="curtidos">Curtidos (1)</TabsTrigger>
            </TabsList>

            <TabsContent value="feitos" className="mt-4 grid gap-4">
              {userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <CommentCard key={post.id} {...post} />
                ))
              ) : (
                <p className="text-gray-400 text-center p-8 bg-[#1D1D1D] rounded-lg">
                  Nenhum comentário ainda.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </main>

        {/* Barra lateral direita */}
        <aside className="lg:col-span-3">
          <Card className="bg-[#1D1D1D] p-4 mb-6 h-fit">
            <CardTitle className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">
              Aba de Pesquisa
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar discussões..."
                className="pl-10 bg-gray-700 text-white border-gray-600"
              />
            </div>
            <Button
              className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold"
              onClick={() => setIsPostModalOpen(true)}
            >
              + Adicionar Comentário
            </Button>
          </Card>
        </aside>
      </div>

      {/* Modais */}
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

      <PostCommentModal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} />
    </div>
  );
}
