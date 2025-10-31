import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, MessageSquare, TrendingUp, Shield, Sparkles, Brain, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Auth from "./Auth";
import Footer from "./Footer";
import { Link } from "react-router-dom";

export default function Landing() {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const { theme, setTheme } = useTheme();

  if (showAuth) {
    return (
      <div className="min-h-screen bg-gradient-hero flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Button
              variant="ghost"
              onClick={() => setShowAuth(false)}
              className="mb-4"
            >
              ← Back to Home
            </Button>
            <Auth initialMode={authMode} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Glow Effect Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-calm/20 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>
      
      {/* Hero Section */}
      <header className="border-b bg-card/70 backdrop-blur-md fixed top-0 left-0 right-0 z-50 shadow-soft">
        <div className="container mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-calm flex items-center justify-center shadow-glow">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">The Silent Stress</h1>
          </div>
          <nav className="flex gap-2 items-center">
            <Button
              variant="ghost"
              className="hidden md:inline-flex"
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            >
              Features
            </Button>
            <Button
              variant="ghost"
              className="hidden md:inline-flex"
              onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
            >
              About
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hover:scale-110 transition-transform"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Button
              onClick={() => {
                setAuthMode("signup");
                setShowAuth(true);
              }}
              className="shadow-glow bg-gradient-calm hover:shadow-card transition-all"
            >
              Get Started
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Content */}
      <section className="container mx-auto px-4 py-16 md:py-24 text-center relative z-10 mt-16">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-4xl md:text-7xl font-bold leading-tight animate-fade-in">
            Your AI-Powered
            <br />
            <span className="bg-gradient-calm bg-clip-text text-transparent drop-shadow-glow">
              Emotional Wellness
            </span>
            <br />
            Companion
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in">
            Mental health rarely speaks loudly. The Silent Stress detects emotional patterns
            through AI, offering support before you even realize you need it.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-fade-in">
            <Button
              size="lg"
              onClick={() => {
                setAuthMode("signup");
                setShowAuth(true);
              }}
              className="shadow-glow bg-gradient-calm hover:shadow-card transition-all text-lg px-8 hover:scale-105"
            >
              Start Your Journey
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="hover:scale-105 transition-transform border-2"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16 relative z-10">
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 animate-fade-in">
          Features That Care
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-2 hover:shadow-glow hover:border-primary/50 transition-all duration-300 hover:scale-105 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <MessageSquare className="w-12 h-12 mb-4 text-primary" />
              <CardTitle>AI Companion</CardTitle>
              <CardDescription>
                Chat with an empathetic AI that truly listens and understands your emotions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-glow hover:border-primary/50 transition-all duration-300 hover:scale-105 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <Brain className="w-12 h-12 mb-4 text-primary" />
              <CardTitle>Sentiment Analysis</CardTitle>
              <CardDescription>
                Real-time emotional pattern detection from your conversations
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-glow hover:border-primary/50 transition-all duration-300 hover:scale-105 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <Sparkles className="w-12 h-12 mb-4 text-primary" />
              <CardTitle>Personalized Interventions</CardTitle>
              <CardDescription>
                Get tailored suggestions for music, journaling, mindfulness, and more
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-glow hover:border-primary/50 transition-all duration-300 hover:scale-105 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <TrendingUp className="w-12 h-12 mb-4 text-primary" />
              <CardTitle>Mood Tracking</CardTitle>
              <CardDescription>
                Monitor your emotional wellness journey with insightful patterns
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-glow hover:border-primary/50 transition-all duration-300 hover:scale-105 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <Shield className="w-12 h-12 mb-4 text-primary" />
              <CardTitle>Privacy First</CardTitle>
              <CardDescription>
                Your conversations are secure and confidential, always
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-glow hover:border-primary/50 transition-all duration-300 hover:scale-105 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <Heart className="w-12 h-12 mb-4 text-primary" />
              <CardTitle>24/7 Support</CardTitle>
              <CardDescription>
                Your wellness companion is always there when you need to talk
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="container mx-auto px-4 py-16 bg-card/50 backdrop-blur-sm rounded-3xl my-16 relative z-10 shadow-card">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h3 className="text-3xl md:text-4xl font-bold">About The Silent Stress</h3>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Mental health challenges often go unnoticed until they become overwhelming.
            The Silent Stress uses advanced AI to detect subtle emotional patterns in your
            daily conversations, providing gentle support and personalized interventions
            before stress escalates.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Our mission is to make emotional wellness support accessible, private, and
            effective for everyone. We believe that with the right support at the right
            time, everyone can maintain better mental health.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center relative z-10">
        <Card className="border-2 shadow-glow max-w-2xl mx-auto bg-card/80 backdrop-blur-sm hover:shadow-card transition-all">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">
              Ready to Begin Your Wellness Journey?
            </CardTitle>
            <CardDescription className="text-base">
              Join thousands finding peace and support with The Silent Stress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              size="lg"
              onClick={() => {
                setAuthMode("signup");
                setShowAuth(true);
              }}
              className="shadow-glow bg-gradient-calm hover:shadow-card transition-all text-lg px-8 hover:scale-105"
            >
              Get Started Free
            </Button>
          </CardContent>
        </Card>
      </section>

      <Footer />
    </div>
  );
}
