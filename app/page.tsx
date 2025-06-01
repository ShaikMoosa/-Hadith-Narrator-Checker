"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Search,
  BookOpen,
  Users,
  BarChart3,
  Brain,
  FileText,
  Play,
  Download,
  Globe,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  Database,
  Award,
  Clock,
} from "lucide-react"
import Link from "next/link"

// Animated Counter Component
function AnimatedCounter({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      setCount(Math.floor(progress * end))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

export default function HadithNarratorChecker() {
  const [activeFeature, setActiveFeature] = useState("analysis")
  const [searchQuery, setSearchQuery] = useState("")

  const features = [
    {
      id: "analysis",
      icon: BookOpen,
      title: "Hadith Text Analysis",
      description: "Real-time narrator extraction with Arabic/English processing and traditional isnad chain analysis",
      preview: (
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-r-4 border-green-600">
            <p className="text-right text-lg font-arabic mb-2">حدثنا محمد بن إسماعيل قال حدثنا عبد الله بن موسى</p>
            <p className="text-sm text-gray-600">Narrator: Muhammad ibn Ismail → Abdullah ibn Musa</p>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm">Authentic chain detected</span>
            <Badge variant="secondary">95% confidence</Badge>
          </div>
        </div>
      ),
    },
    {
      id: "search",
      icon: Search,
      title: "Advanced Search Engine",
      description: "Multi-language search with credibility filtering and geographic/temporal filters",
      preview: (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search narrators in Arabic or English..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Badge variant="outline">Credible Only</Badge>
            <Badge variant="outline">8th Century</Badge>
            <Badge variant="outline">Basra Region</Badge>
            <Badge variant="outline">Bukhari Chain</Badge>
          </div>
        </div>
      ),
    },
    {
      id: "database",
      icon: Users,
      title: "Narrator Database",
      description: "1000+ authenticated narrators with detailed biographical profiles and scholarly opinions",
      preview: (
        <div className="space-y-3">
          <div className="p-3 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Abu Hurairah</h4>
              <Badge className="bg-green-100 text-green-800">Authentic</Badge>
            </div>
            <p className="text-sm text-gray-600">Companion of Prophet Muhammad (PBUH)</p>
            <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
              <span>📍 Medina</span>
              <span>📅 7th Century</span>
              <span>📚 5374 Hadiths</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "analytics",
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Real-time database statistics with credibility distribution and regional coverage",
      preview: (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">87%</div>
              <div className="text-xs text-gray-500">Authentic</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">13%</div>
              <div className="text-xs text-gray-500">Disputed</div>
            </div>
          </div>
          <Progress value={87} className="h-2" />
          <div className="text-xs text-gray-500 text-center">Credibility Distribution</div>
        </div>
      ),
    },
    {
      id: "ai",
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Machine learning narrator detection with text similarity engine and confidence scoring",
      preview: (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">AI Confidence Score</span>
            <Badge className="bg-purple-100 text-purple-800">94.7%</Badge>
          </div>
          <Progress value={95} className="h-2" />
          <div className="text-xs text-gray-500">
            ✓ Pattern matching: 98%
            <br />✓ Historical context: 92%
            <br />✓ Chain validation: 94%
          </div>
        </div>
      ),
    },
    {
      id: "reports",
      icon: FileText,
      title: "Report Generation",
      description: "Professional PDF reports with bulk text processing and export capabilities",
      preview: (
        <div className="space-y-3">
          <div className="p-3 border rounded-lg bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Analysis Report</span>
              <Download className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-xs text-gray-500">
              📄 15 pages • 🔍 23 narrators analyzed
              <br />📊 Credibility assessment • 📚 Source citations
            </div>
          </div>
          <Button size="sm" className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Generate PDF Report
          </Button>
        </div>
      ),
    },
  ]

  const stats = [
    { label: "Authenticated Narrators", value: 1247, suffix: "+" },
    { label: "Hadith Texts Analyzed", value: 15420, suffix: "+" },
    { label: "Academic Institutions", value: 89, suffix: "" },
    { label: "Countries Supported", value: 24, suffix: "" },
  ]

  const technologies = [
    { name: "Next.js 15", description: "App Router with SSR", icon: "⚡" },
    { name: "PostgreSQL", description: "Full-text search engine", icon: "🗄️" },
    { name: "Supabase", description: "Backend & Authentication", icon: "🔐" },
    { name: "AI/ML", description: "TensorFlow & OpenAI", icon: "🤖" },
    { name: "Arabic NLP", description: "Advanced text processing", icon: "🔤" },
    { name: "PDF Generation", description: "Professional reports", icon: "📄" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Hadith Narrator Checker</h1>
                <p className="text-sm text-gray-600">AI-Powered Islamic Scholarship</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="#features" className="text-gray-600 hover:text-green-600 transition-colors">
                Features
              </Link>
              <Link href="#demo" className="text-gray-600 hover:text-green-600 transition-colors">
                Demo
              </Link>
              <Link href="#technology" className="text-gray-600 hover:text-green-600 transition-colors">
                Technology
              </Link>
              <Button asChild className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                <Link href="/app">Start Free Analysis</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            {/* Arabic Title */}
            <h1 className="text-4xl md:text-6xl font-bold text-right mb-4 font-arabic text-gray-900">
              فاحص رواة الأحاديث بالذكاء الاصطناعي
            </h1>

            {/* English Title */}
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              AI-Powered Hadith Narrator Authentication
            </h2>

            {/* Tagline */}
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Where Classical Islamic Scholarship Meets Modern Technology
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-lg px-8 py-3"
              >
                <Link href="/app">
                  <Play className="h-5 w-5 mr-2" />
                  Start Free Analysis
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-lg px-8 py-3 border-green-600 text-green-600 hover:bg-green-50"
              >
                <Link href="/app">
                  <Database className="h-5 w-5 mr-2" />
                  Access Database
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="text-lg px-8 py-3 text-blue-600 hover:bg-blue-50">
                <Link href="#demo">
                  <Play className="h-5 w-5 mr-2" />
                  Watch Demo
                </Link>
              </Button>
            </div>

            {/* Trust Signals */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2 text-green-600" />
                Open Source
              </div>
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-2 text-blue-600" />
                Academic Grade
              </div>
              <div className="flex items-center">
                <Zap className="h-4 w-4 mr-2 text-yellow-600" />
                Lightning Fast
              </div>
              <div className="flex items-center">
                <Globe className="h-4 w-4 mr-2 text-purple-600" />
                24 Countries
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-gray-600 text-sm md:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Comprehensive Analysis Tools</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the power of traditional Islamic scholarship enhanced by cutting-edge AI technology
            </p>
          </div>

          <Tabs value={activeFeature} onValueChange={setActiveFeature} className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-8">
              {features.map((feature) => (
                <TabsTrigger
                  key={feature.id}
                  value={feature.id}
                  className="flex flex-col items-center p-3 data-[state=active]:bg-green-100 data-[state=active]:text-green-700"
                >
                  <feature.icon className="h-5 w-5 mb-1" />
                  <span className="text-xs hidden sm:block">{feature.title.split(" ")[0]}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {features.map((feature) => (
              <TabsContent key={feature.id} value={feature.id}>
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg">
                        <feature.icon className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                        <CardDescription className="text-base">{feature.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div className="order-2 md:order-1">{feature.preview}</div>
                      <div className="order-1 md:order-2">
                        <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-lg">
                          <h4 className="font-semibold mb-3 text-gray-900">Key Benefits:</h4>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-center">
                              <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                              Real-time processing with instant results
                            </li>
                            <li className="flex items-center">
                              <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                              Traditional methodology compliance
                            </li>
                            <li className="flex items-center">
                              <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                              Multi-language support (Arabic/English)
                            </li>
                            <li className="flex items-center">
                              <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                              Academic-grade accuracy and citations
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Technology Stack */}
      <section id="technology" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Built with Modern Technology</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Enterprise-grade infrastructure ensuring reliability, security, and performance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technologies.map((tech, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-2xl">{tech.icon}</span>
                    <h3 className="font-semibold text-lg">{tech.name}</h3>
                  </div>
                  <p className="text-gray-600">{tech.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Academic Credibility */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">Traditional Meets Modern</h2>
              <p className="text-lg text-gray-600 mb-6">
                Our methodology combines time-tested Islamic scholarship principles with cutting-edge AI technology,
                ensuring both authenticity and accuracy in hadith narrator authentication.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <BookOpen className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Classical Jarh wa Ta'dil</h4>
                    <p className="text-gray-600 text-sm">
                      Based on traditional Islamic methodology for narrator criticism and authentication
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Brain className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">AI-Enhanced Analysis</h4>
                    <p className="text-gray-600 text-sm">
                      Machine learning algorithms trained on classical Islamic texts and scholarly opinions
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="h-6 w-6 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Scholarly Verification</h4>
                    <p className="text-gray-600 text-sm">
                      All results cross-referenced with established Islamic scholarly consensus
                    </p>
                  </div>
                </div>
              </div>

              <Button asChild className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                <Link href="/app">
                  Learn About Our Methodology
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-green-100 to-blue-100 p-8 rounded-2xl">
                <div className="bg-white p-6 rounded-lg shadow-lg mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Sample Analysis Result</h4>
                    <Badge className="bg-green-100 text-green-800">Verified</Badge>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Narrator Authenticity:</span>
                      <span className="font-semibold text-green-600">Authentic (ثقة)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Classical Rating:</span>
                      <span className="font-semibold">Trustworthy</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">AI Confidence:</span>
                      <span className="font-semibold text-blue-600">94.7%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sources:</span>
                      <span className="font-semibold">Ibn Hajar, Al-Dhahabi</span>
                    </div>
                  </div>
                </div>
                <div className="text-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Analysis completed in 0.3 seconds
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section id="demo" className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Try It Yourself</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the power of AI-driven hadith narrator authentication with our live demo
            </p>
          </div>

          <Card className="max-w-4xl mx-auto shadow-xl">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Enter Hadith Text (Arabic or English)</label>
                  <textarea
                    className="w-full p-4 border rounded-lg resize-none h-32"
                    placeholder="حدثنا محمد بن إسماعيل قال حدثنا عبد الله بن موسى..."
                    defaultValue="حدثنا محمد بن إسماعيل قال حدثنا عبد الله بن موسى عن شيبان عن يحيى عن أبي سلمة عن أبي هريرة"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                    <Link href="/app">
                      <Search className="h-4 w-4 mr-2" />
                      Analyze Narrators
                    </Link>
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download Sample Report
                  </Button>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold mb-4">Analysis Preview:</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium mb-2">Detected Narrators:</h5>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-white rounded border">
                          <span className="text-sm">Muhammad ibn Ismail</span>
                          <Badge className="bg-green-100 text-green-800">Authentic</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white rounded border">
                          <span className="text-sm">Abdullah ibn Musa</span>
                          <Badge className="bg-green-100 text-green-800">Authentic</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white rounded border">
                          <span className="text-sm">Abu Hurairah</span>
                          <Badge className="bg-green-100 text-green-800">Companion</Badge>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Chain Analysis:</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Chain Strength:</span>
                          <span className="font-semibold text-green-600">Strong (صحيح)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">AI Confidence:</span>
                          <span className="font-semibold text-blue-600">96.2%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Processing Time:</span>
                          <span className="font-semibold">0.24s</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Revolutionize Your Islamic Research?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
            Join scholars and researchers worldwide who trust our AI-powered platform for authentic hadith narrator
            verification
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-3">
              <Link href="/app">
                <Play className="h-5 w-5 mr-2" />
                Start Free Analysis
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-green-600 text-lg px-8 py-3"
            >
              <Link href="/app">
                <Users className="h-5 w-5 mr-2" />
                Join Community
              </Link>
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-2xl font-bold mb-1">Free</div>
              <div className="text-sm opacity-75">Basic Analysis</div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-1">24/7</div>
              <div className="text-sm opacity-75">Support</div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-1">Open</div>
              <div className="text-sm opacity-75">Source</div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-1">Global</div>
              <div className="text-sm opacity-75">Community</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold">Hadith Narrator Checker</span>
              </div>
              <p className="text-gray-400 text-sm">
                Bridging traditional Islamic scholarship with modern AI technology for authentic hadith research.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/app" className="hover:text-white transition-colors">
                    Text Analysis
                  </Link>
                </li>
                <li>
                  <Link href="/app" className="hover:text-white transition-colors">
                    Narrator Database
                  </Link>
                </li>
                <li>
                  <Link href="/app" className="hover:text-white transition-colors">
                    AI Analysis
                  </Link>
                </li>
                <li>
                  <Link href="/app" className="hover:text-white transition-colors">
                    Report Generation
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Methodology
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Community
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    GitHub
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Discord
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Hadith Narrator Checker. Built with ❤️ for the Islamic scholarly community.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
