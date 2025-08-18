import { CommentCard } from "./CommentCard"
import { TrendingDiscussions } from "./TrendingDiscussions"
import { SearchSidebar } from "./SearchSidebar"

// Mock data para demonstração
const mockComments = [
  {
    id: "1",
    author: "DevMaster",
    content: "TypeScript mudou completamente a forma como escrevo JavaScript. A tipagem estática realmente previne muitos bugs em produção.",
    agreeCount: 24,
    disagreeCount: 3,
    timestamp: "2h atrás"
  },
  {
    id: "2", 
    author: "CodeNinja",
    content: "React hooks são superiores aos class components em todos os aspectos. Mais limpo, mais funcional e mais fácil de testar.",
    agreeCount: 18,
    disagreeCount: 7,
    timestamp: "4h atrás"
  },
  {
    id: "3",
    author: "FullStackDev",
    content: "Dark mode não é apenas uma questão de estética, mas de acessibilidade e conforto visual, especialmente para quem passa horas programando.",
    agreeCount: 31,
    disagreeCount: 2,
    timestamp: "6h atrás"
  },
  {
    id: "4",
    author: "TechExplorer", 
    content: "CSS-in-JS é uma evolução natural. Ter estilos co-localizados com componentes torna o desenvolvimento mais ágil e manutenível.",
    agreeCount: 12,
    disagreeCount: 15,
    timestamp: "8h atrás"
  },
  {
    id: "5",
    author: "CloudArchitect",
    content: "Microserviços não são sempre a solução. Para muitos projetos, um monolito bem estruturado é mais eficiente e fácil de manter.",
    agreeCount: 27,
    disagreeCount: 9,
    timestamp: "1d atrás"
  },
  {
    id: "6",
    author: "DataWizard",
    content: "GraphQL resolve problemas reais de over-fetching e under-fetching que REST APIs sempre tiveram. É o futuro das APIs.",
    agreeCount: 19,
    disagreeCount: 11,
    timestamp: "1d atrás"
  }
]

export function OpinionFeed() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex max-w-7xl mx-auto">
        {/* Left Sidebar - Trending Discussions */}
        <TrendingDiscussions />
        
        {/* Main Feed */}
        <div className="flex-1 py-8 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-tech bg-clip-text text-transparent mb-2">
                Tech Opinions
              </h1>
              <p className="text-muted-foreground">
                Compartilhe sua opinião sobre tecnologia
              </p>
            </div>
            
            <div className="space-y-6">
              {mockComments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  id={comment.id}
                  author={comment.author}
                  content={comment.content}
                  agreeCount={comment.agreeCount}
                  disagreeCount={comment.disagreeCount}
                  timestamp={comment.timestamp}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Right Sidebar - Search and Add Comment */}
        <SearchSidebar />
      </div>
    </div>
  )
}