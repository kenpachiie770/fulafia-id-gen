import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Clock, CheckCircle, AlertCircle, IdCard } from "lucide-react";
import fulafiaLogo from "@/assets/fulafia-logo.png";

interface Application {
  id: string;
  matric_number: string;
  faculty: string;
  department: string;
  level: string;
  status: string;
  created_at: string;
  passport_photo_url?: string;
  signature_url?: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      fetchApplications(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      fetchApplications(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchApplications = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching applications:", error);
      } else {
        setApplications(data || []);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "processing":
        return <AlertCircle className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "ready":
        return <IdCard className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "processing":
        return "default";
      case "completed":
        return "default";
      case "ready":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600";
      case "processing":
        return "text-blue-600";
      case "completed":
        return "text-green-600";
      case "ready":
        return "text-green-600";
      case "rejected":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={fulafiaLogo} alt="FULafia Logo" className="w-12 h-12" />
            <div>
              <h1 className="text-xl font-bold text-primary">FULafia</h1>
              <p className="text-sm text-muted-foreground">Student Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate("/")}>
              ← Back to Home
            </Button>
            <Button onClick={() => supabase.auth.signOut()}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Your Dashboard</h1>
          <p className="text-muted-foreground">
            Track your ID card applications and manage your account
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p>Loading your applications...</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {applications.length === 0 ? (
              <Card>
                <CardHeader className="text-center">
                  <CardTitle>No Applications Found</CardTitle>
                  <CardDescription>
                    You haven't submitted any ID card applications yet
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button onClick={() => navigate("/apply")}>
                    Apply for ID Card
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold">Your Applications</h2>
                  <Button onClick={() => navigate("/apply")}>
                    New Application
                  </Button>
                </div>

                {applications.map((application) => (
                  <Card key={application.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center space-x-2">
                            <span>Application #{application.id.slice(0, 8)}</span>
                            <Badge 
                              variant={getStatusVariant(application.status)}
                              className={`flex items-center space-x-1 ${getStatusColor(application.status)}`}
                            >
                              {getStatusIcon(application.status)}
                              <span className="capitalize">{application.status}</span>
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            Submitted on {new Date(application.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Matriculation Number</p>
                          <p className="font-semibold">{application.matric_number}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Level</p>
                          <p className="font-semibold">{application.level} Level</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Faculty</p>
                          <p className="font-semibold">{application.faculty}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Department</p>
                          <p className="font-semibold">{application.department}</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${
                              application.passport_photo_url ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                            <span>Passport Photo</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${
                              application.signature_url ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                            <span>Signature</span>
                          </div>
                        </div>
                      </div>

                      {application.status === "ready" && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <p className="text-green-800 font-medium">
                              Your ID card is ready for pickup!
                            </p>
                          </div>
                          <p className="text-sm text-green-600 mt-1">
                            Visit the ICT Unit to collect your ID card.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;