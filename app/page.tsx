import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Users, Target, Zap, Star } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-indigo-600">SponsorSync</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="outline" className="mb-4">
            🚀 Smart Matchmaking Platform
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Connect Student Events with
            <span className="text-indigo-600"> Perfect Sponsors</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            SponsorSync uses intelligent matching to bridge the gap between student organizers and sponsors, creating
            meaningful partnerships that drive success for both parties.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/auth">
              <Button size="lg" className="text-lg px-8">
                Start Matching
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose SponsorSync?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform combines smart technology with intuitive design to make sponsorship matching effortless and
              effective.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>Smart Matching</CardTitle>
                <CardDescription>
                  AI-powered algorithm matches events with sponsors based on compatibility scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Audience alignment analysis</li>
                  <li>• Industry compatibility scoring</li>
                  <li>• Goal-based recommendations</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Dual Dashboard</CardTitle>
                <CardDescription>Separate optimized experiences for organizers and sponsors</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Event management tools</li>
                  <li>• Sponsor discovery interface</li>
                  <li>• Real-time match notifications</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Success Tracking</CardTitle>
                <CardDescription>Comprehensive analytics and success metrics for all partnerships</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Partnership success rates</li>
                  <li>• Engagement analytics</li>
                  <li>• ROI tracking tools</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How SponsorSync Works</h2>
            <p className="text-lg text-gray-600">Simple steps to create meaningful sponsorship partnerships</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* For Organizers */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">For Student Organizers</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold">Create Event Profile</h4>
                    <p className="text-gray-600">Add event details, audience info, and sponsorship needs</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold">Get Smart Matches</h4>
                    <p className="text-gray-600">
                      Receive AI-powered sponsor recommendations with compatibility scores
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold">Connect & Collaborate</h4>
                    <p className="text-gray-600">Message sponsors directly and finalize partnership details</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Sponsors */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">For Sponsors</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold">Set Up Company Profile</h4>
                    <p className="text-gray-600">Define your target audience, goals, and sponsorship preferences</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold">Discover Perfect Events</h4>
                    <p className="text-gray-600">Browse curated event recommendations based on your criteria</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold">Express Interest</h4>
                    <p className="text-gray-600">Connect with organizers and propose sponsorship partnerships</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-indigo-600">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Find Your Perfect Match?</h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of organizers and sponsors who have found success through SponsorSync
          </p>
          <Link href="/auth">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">SponsorSync</span>
            </div>
            <p className="text-gray-400">© 2024 SponsorSync. Connecting organizers with sponsors.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
