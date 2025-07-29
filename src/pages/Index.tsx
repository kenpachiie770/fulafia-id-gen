import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, IdCard, Shield, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import fulafiaLogo from "@/assets/fulafia-logo.png";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={fulafiaLogo} alt="FULafia Logo" className="w-12 h-12" />
            <div>
              <h1 className="text-xl font-bold text-primary">FULafia</h1>
              <p className="text-sm text-muted-foreground">ID Card System</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Logged In</Badge>
                <Button 
                  variant="outline" 
                  onClick={() => supabase.auth.signOut()}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="default">Login / Register</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <img src={fulafiaLogo} alt="FULafia Logo" className="w-24 h-24 mx-auto" />
              <div className="absolute inset-0 fulafia-gradient opacity-20 rounded-full"></div>
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 fulafia-gradient bg-clip-text text-transparent">
            Federal University of Lafia
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
            Online ID Card Enrollment System
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Apply for your student ID card online. Fast, secure, and convenient enrollment process.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Easy Application</CardTitle>
              <CardDescription>
                Simple online form to apply for your student ID card
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Select Faculty & Department</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Upload Passport Photo</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Digital Signature</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-secondary/20 hover:border-secondary/40 transition-colors">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-secondary/10 rounded-full w-fit">
                <IdCard className="w-8 h-8 text-secondary" />
              </div>
              <CardTitle>Track Progress</CardTitle>
              <CardDescription>
                Monitor your application status in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">Pending</Badge>
                  <span className="text-sm text-muted-foreground">Application Submitted</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">Processing</Badge>
                  <span className="text-sm text-muted-foreground">Under Review</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">Ready</Badge>
                  <span className="text-sm text-muted-foreground">Ready for Pickup</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Secure & Official</CardTitle>
              <CardDescription>
                Official FULafia ID cards with security features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>QR Code Verification</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Official University Seal</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Tamper-Proof Design</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          {user ? (
            <div className="space-y-4">
              <p className="text-lg text-muted-foreground">Welcome back! Ready to continue?</p>
              <div className="flex justify-center space-x-4">
                <Link to="/apply">
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    Apply for ID Card
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button size="lg" variant="outline">
                    View Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg text-muted-foreground">Get started with your ID card application</p>
              <Link to="/auth">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 Federal University of Lafia. All rights reserved.</p>
            <p className="text-sm mt-2">ICT & Registry Unit</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
