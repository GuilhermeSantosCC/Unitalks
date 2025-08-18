import { useState } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { VoteButton } from "@/components/ui/vote-button"
import { ThumbsUp, ThumbsDown } from "lucide-react"

interface CommentCardProps {
  id: string
  author: string
  content: string
  avatar?: string
  agreeCount: number
  disagreeCount: number
  timestamp: string
}

export function CommentCard({ 
  id, 
  author, 
  content, 
  avatar, 
  agreeCount: initialAgreeCount, 
  disagreeCount: initialDisagreeCount,
  timestamp 
}: CommentCardProps) {
  const [userVote, setUserVote] = useState<'agree' | 'disagree' | null>(null)
  const [agreeCount, setAgreeCount] = useState(initialAgreeCount)
  const [disagreeCount, setDisagreeCount] = useState(initialDisagreeCount)

  const handleVote = (voteType: 'agree' | 'disagree') => {
    if (userVote === voteType) {
      // Remove vote
      if (voteType === 'agree') {
        setAgreeCount(prev => prev - 1)
      } else {
        setDisagreeCount(prev => prev - 1)
      }
      setUserVote(null)
    } else {
      // Change or add vote
      if (userVote === 'agree') {
        setAgreeCount(prev => prev - 1)
        setDisagreeCount(prev => prev + 1)
      } else if (userVote === 'disagree') {
        setDisagreeCount(prev => prev - 1)
        setAgreeCount(prev => prev + 1)
      } else {
        // First vote
        if (voteType === 'agree') {
          setAgreeCount(prev => prev + 1)
        } else {
          setDisagreeCount(prev => prev + 1)
        }
      }
      setUserVote(voteType)
    }
  }

  return (
    <Card className="w-full bg-gradient-card border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10 ring-2 ring-tech-purple/20">
            <AvatarImage src={avatar} alt={author} />
            <AvatarFallback className="bg-tech-purple/20 text-tech-purple font-semibold">
              {author.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-foreground">{author}</h4>
              <span className="text-xs text-muted-foreground">{timestamp}</span>
            </div>
            
            <p className="text-foreground leading-relaxed">{content}</p>
            
            <div className="flex items-center gap-3 pt-2">
              <VoteButton
                variant="agree"
                active={userVote === 'agree'}
                count={agreeCount}
                onClick={() => handleVote('agree')}
              >
                <ThumbsUp className="h-4 w-4" />
                Concordo
              </VoteButton>
              
              <VoteButton
                variant="disagree"
                active={userVote === 'disagree'}
                count={disagreeCount}
                onClick={() => handleVote('disagree')}
              >
                <ThumbsDown className="h-4 w-4" />
                Discordo
              </VoteButton>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}