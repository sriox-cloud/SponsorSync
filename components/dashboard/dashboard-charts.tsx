"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

interface DashboardChartsProps {
  events: any[]
  matches: any[]
}

export function DashboardCharts({ events, matches }: DashboardChartsProps) {
  // Prepare data for charts
  const categoryData = events.reduce((acc, event) => {
    acc[event.category] = (acc[event.category] || 0) + 1
    return acc
  }, {})

  const categoryChartData = Object.entries(categoryData).map(([category, count]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    count,
  }))

  const audienceData = events.map((event, index) => ({
    name: `Event ${index + 1}`,
    audience: event.expected_audience || 0,
  }))

  const matchScoreData = matches.map((match, index) => ({
    name: `Match ${index + 1}`,
    score: match.match_score,
  }))

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Event Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Events by Category</CardTitle>
          <CardDescription>Distribution of your events</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              count: {
                label: "Events",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[200px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData}>
                <XAxis dataKey="category" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Audience Reach */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Audience Reach</CardTitle>
          <CardDescription>Expected attendees per event</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              audience: {
                label: "Audience",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[200px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={audienceData}>
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="audience" stroke="var(--color-audience)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Match Scores */}
      {matches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Match Quality</CardTitle>
            <CardDescription>Sponsor compatibility scores</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                score: {
                  label: "Match Score",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={matchScoreData}>
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="score" fill="var(--color-score)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
