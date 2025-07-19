import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface MatchScoreProps {
  score: number
  size?: "sm" | "md" | "lg"
}

export function MatchScore({ score, size = "md" }: MatchScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent Match"
    if (score >= 60) return "Good Match"
    return "Fair Match"
  }

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className={`font-semibold ${getScoreColor(score)} ${sizeClasses[size]}`}>{score}% Match</span>
        <Badge variant="outline" className={getScoreColor(score)}>
          {getScoreLabel(score)}
        </Badge>
      </div>
      <Progress value={score} className="h-2" />
    </div>
  )
}
