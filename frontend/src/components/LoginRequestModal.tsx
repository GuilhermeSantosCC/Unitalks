import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus } from "lucide-react";

interface LoginRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginRequestModal({ isOpen, onClose }: LoginRequestModalProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1D1D1D] border-gray-700 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Junte-se ao UniTalks!
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400 mt-2">
            Para curtir, visitar perfis ou ver mais discussões, você precisa estar conectado à nossa comunidade.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 py-4">
          <Button 
            onClick={() => navigate("/login")} 
            className="w-full bg-purple-600 hover:bg-purple-700 font-semibold"
          >
            <LogIn className="mr-2 h-4 w-4" /> Fazer Login
          </Button>
          
          <Button 
            onClick={() => navigate("/register")} 
            variant="outline" 
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <UserPlus className="mr-2 h-4 w-4" /> Criar Conta
          </Button>
        </div>

        <DialogFooter className="sm:justify-center">
          <button onClick={onClose} className="text-xs text-gray-500 hover:text-gray-400 underline">
            Continuar apenas olhando
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}