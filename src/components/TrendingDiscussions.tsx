import { Card } from "./ui/card"

const trendingTopics = [
  {
    id: "trending-1",
    title: "TypeScript vs JavaScript",
    votes: 142,
    comments: 28
  },
  {
    id: "trending-2", 
    title: "React vs Vue.js",
    votes: 98,
    comments: 19
  },
  {
    id: "trending-3",
    title: "Dark mode é essencial?",
    votes: 87,
    comments: 15
  }
]

export function TrendingDiscussions() {
  return (
    <div className="w-80 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Discussões do momento
        </h2>
        <div className="h-0.5 w-12 bg-gradient-tech rounded"></div>
      </div>
      
      <div className="space-y-4">
        {trendingTopics.map((topic, index) => (
          <Card key={topic.id} className="p-4 bg-gradient-card border-tech-gray hover:border-tech-purple/50 transition-all duration-300 cursor-pointer group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-foreground group-hover:text-tech-purple transition-colors">
                  {topic.title}
                </h3>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="text-tech-green">↑</span>
                    {topic.votes}
                  </span>
                  <span className="flex items-center gap-1">
                    💬 {topic.comments}
                  </span>
                </div>
              </div>
              <div className="text-xs font-medium text-tech-purple ml-2">
                #{index + 1}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}