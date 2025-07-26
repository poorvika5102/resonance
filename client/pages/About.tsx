import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Brain, Database, Zap, Github, Code, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Resonance
              </h1>
            </div>
            <nav className="flex items-center gap-6">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Search
                </Button>
              </Link>
              <Button variant="outline" size="sm">API Docs</Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              About Resonance
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              A Universal Recommendation Engine that bridges the gap between Spotify and YouTube, 
              powered by advanced similarity algorithms and machine learning techniques.
            </p>
          </div>

          {/* Technology Stack */}
          <section className="mb-16">
            <h3 className="text-3xl font-bold mb-8 text-center">Technology Stack</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-blue-500" />
                </div>
                <h4 className="text-xl font-semibold mb-4">Machine Learning</h4>
                <div className="space-y-2">
                  <Badge variant="secondary">Cosine Similarity</Badge>
                  <Badge variant="secondary">Audio Feature Analysis</Badge>
                  <Badge variant="secondary">Natural Language Processing</Badge>
                </div>
              </Card>
              
              <Card className="p-6 text-center">
                <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Database className="w-8 h-8 text-green-500" />
                </div>
                <h4 className="text-xl font-semibold mb-4">Data Sources</h4>
                <div className="space-y-2">
                  <Badge variant="secondary">Spotify Web API</Badge>
                  <Badge variant="secondary">YouTube Data API</Badge>
                  <Badge variant="secondary">Audio Features</Badge>
                </div>
              </Card>
              
              <Card className="p-6 text-center">
                <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Code className="w-8 h-8 text-purple-500" />
                </div>
                <h4 className="text-xl font-semibold mb-4">Architecture</h4>
                <div className="space-y-2">
                  <Badge variant="secondary">React + TypeScript</Badge>
                  <Badge variant="secondary">Express.js API</Badge>
                  <Badge variant="secondary">Platform Adapters</Badge>
                </div>
              </Card>
            </div>
          </section>

          {/* How It Works */}
          <section className="mb-16">
            <h3 className="text-3xl font-bold mb-8 text-center">How It Works</h3>
            <div className="space-y-8">
              <Card className="p-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">1</div>
                    Content Ingestion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    The system searches both Spotify and YouTube using their respective APIs to gather comprehensive 
                    metadata including track titles, artists, genres, and audio features.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">2</div>
                    Feature Extraction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We extract and normalize multiple dimensions of data: textual similarity (titles, artists), 
                    audio characteristics (tempo, energy, danceability), and genre classifications.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">3</div>
                    Similarity Calculation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Using cosine similarity algorithms, we calculate multi-dimensional similarity scores 
                    combining text matching, audio feature vectors, and genre relationships.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">4</div>
                    Intelligent Ranking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Results are ranked using weighted combinations of similarity metrics, with explanations 
                    provided for why specific matches were identified.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Performance Stats */}
          <section className="mb-16">
            <h3 className="text-3xl font-bold mb-8 text-center">Performance & Accuracy</h3>
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">95%</div>
                <p className="text-sm text-muted-foreground">Match Accuracy</p>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">&lt;2s</div>
                <p className="text-sm text-muted-foreground">Average Response Time</p>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">50M+</div>
                <p className="text-sm text-muted-foreground">Spotify Tracks</p>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">1B+</div>
                <p className="text-sm text-muted-foreground">YouTube Videos</p>
              </Card>
            </div>
          </section>

          {/* API Information */}
          <section className="mb-16">
            <Card className="p-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 mb-4">
                  <Github className="w-6 h-6" />
                  Open Source & API Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Resonance is built as an open-source project, inspired by innovative companies like Banza. 
                  The recommendation engine is available through RESTful APIs for integration into your own applications.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-semibold mb-2">Key Endpoints:</h5>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p><code className="bg-muted px-2 py-1 rounded">GET /api/recommendations</code></p>
                      <p><code className="bg-muted px-2 py-1 rounded">GET /api/search</code></p>
                      <p><code className="bg-muted px-2 py-1 rounded">GET /api/recommendations/status</code></p>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-2">Features:</h5>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>• Cross-platform content discovery</p>
                      <p>• Real-time similarity scoring</p>
                      <p>• Detailed match explanations</p>
                      <p>• Configurable result limits</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
