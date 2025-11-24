import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User } from "lucide-react";

// Interface simplificada do usuário para a lista
interface UserSummary {
  id: number;
  name: string;
  username: string;
  profile_picture?: string;
  bio?: string;
}

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: UserSummary[];
  isLoading: boolean;
}

export function FollowListModal({ isOpen, onClose, title, users, isLoading }: FollowListModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#121212] border-gray-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[300px] pr-4 mt-4">
          {isLoading ? (
             <div className="text-center text-gray-500 py-8">Carregando lista...</div>
          ) : users.length > 0 ? (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                  <Avatar>
                    <AvatarImage src={user.profile_picture} />
                    <AvatarFallback className="bg-purple-900 text-white">
                      {user.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">@{user.username}</p>
                    {user.bio && <p className="text-xs text-gray-500 truncate mt-0.5">{user.bio}</p>}
                  </div>
                  {/* Futuramente: Botão de Seguir/Deixar de Seguir aqui */}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Ninguém aqui ainda.
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}