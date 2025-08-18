import { useState } from "react"
import { Search, Plus } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card } from "./ui/card"

export function SearchSidebar() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="w-80 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Aba de Pesquisa
        </h2>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar discussões..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-input border-tech-gray focus:border-tech-purple transition-colors"
          />
        </div>

        <Button 
          className="w-full bg-tech-purple hover:bg-tech-purple-dark text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-glow-purple group"
        >
          <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
          Adicionar Comentário
        </Button>
      </div>

      {searchTerm && (
        <Card className="p-4 bg-gradient-card border-tech-gray">
          <h3 className="text-sm font-medium text-foreground mb-2">
            Resultados da busca
          </h3>
          <p className="text-xs text-muted-foreground">
            Buscar por: "{searchTerm}"
          </p>
        </Card>
      )}
    </div>
  )
}