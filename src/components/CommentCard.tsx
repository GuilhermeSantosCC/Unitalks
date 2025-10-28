import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { VoteButton } from "@/components/ui/vote-button"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { db } from "@/firebase"
import { doc, updateDoc, increment } from "firebase/firestore"

interface CommentCardProps {
  id: string
  author: string
  content: string
  agreeCount: number
  disagreeCount: number
  timestamp: string
}

export function CommentCard({  
  id,
  author, 
  content, 
  agreeCount: initialAgreeCount, 
  disagreeCount: initialDisagreeCount,
  timestamp 
}: CommentCardProps) {
  const [userVote, setUserVote] = useState<'agree' | 'disagree' | null>(null)

  const handleVote = async (voteType: 'agree' | 'disagree') => {
    if (!id) return;

    const postRef = doc(db, 'posts', id);
    if (userVote === voteType) {
      await updateDoc(postRef, {
        [voteType === 'agree' ? 'agreeCount' : 'disagreeCount']: increment(-1)
      });
      setUserVote(null);
    } else {
      const updates: { [key: string]: any } = {};
      if (userVote) {
        updates[userVote === 'agree' ? 'agreeCount' : 'disagreeCount'] = increment(-1);
      }
      updates[voteType === 'agree' ? 'agreeCount' : 'disagreeCount'] = increment(1);
      await updateDoc(postRef, updates);
      setUserVote(voteType);
    }
  }

  return (
    <Card className="w-full bg-gradient-card border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">          
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
                count={initialAgreeCount}
                onClick={() => handleVote('agree')}
              >
                <ThumbsUp className="h-4 w-4" />
                Concordo
              </VoteButton>
              
              <VoteButton
                variant="disagree"
                active={userVote === 'disagree'}
                count={initialDisagreeCount}
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