import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import fulafiaLogo from "@/assets/fulafia-logo.png";

const faculties = {
  "Faculty of Science": [
    "Computer Science",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Microbiology"
  ],
  "Faculty of Arts": [
    "English Language",
    "History",
    "Islamic Studies",
    "Arabic",
    "Philosophy"
  ],
  "Faculty of Social Sciences": [
    "Economics",
    "Political Science",
    "Sociology",
    "Geography",
    "Psychology"
  ],
  "Faculty of Education": [
    "Educational Foundations",
    "Science Education",
    "Arts Education",
    "Educational Management"
  ],
  "Faculty of Management Sciences": [
    "Accounting",
    "Business Administration",
    "Banking and Finance",
    "Marketing"
  ],
  "Faculty of Agriculture": [
    "Agronomy",
    "Animal Science",
    "Crop Protection",
    "Agricultural Economics"
  ]
};

const levels = ["100", "200", "300", "400", "500"];

const Apply = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const uploadFile = async (file: File, bucket: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) {
      console.error(`Error uploading ${bucket}:`, error);
      return null;
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const fullName = formData.get("fullName") as string;
      const matricNumber = formData.get("matricNumber") as string;
      const faculty = formData.get("faculty") as string;
      const department = formData.get("department") as string;
      const level = formData.get("level") as string;

      // Upload files
      let passportUrl = null;
      let signatureUrl = null;

      if (passportFile) {
        passportUrl = await uploadFile(passportFile, "passport-photos");
        if (!passportUrl) {
          toast.error("Failed to upload passport photo");
          return;
        }
      }

      if (signatureFile) {
        signatureUrl = await uploadFile(signatureFile, "signatures");
        if (!signatureUrl) {
          toast.error("Failed to upload signature");
          return;
        }
      }

      // Submit application
      const { error } = await supabase
        .from("applications")
        .insert({
          user_id: user.id,
          matric_number: matricNumber,
          faculty,
          department,
          level,
          passport_photo_url: passportUrl,
          signature_url: signatureUrl,
          status: "pending"
        });

      if (error) {
        toast.error("Failed to submit application: " + error.message);
      } else {
        toast.success("Application submitted successfully!");
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Application error:", error);
    } finally {
      setLoading(false);
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
              <p className="text-sm text-muted-foreground">ID Card Application</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}>
            ← Back to Home
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>ID Card Application</CardTitle>
            <CardDescription>
              Fill out the form below to apply for your student ID card
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="matricNumber">Matriculation Number</Label>
                  <Input
                    id="matricNumber"
                    name="matricNumber"
                    type="text"
                    placeholder="e.g., FUL/2024/001"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="faculty">Faculty</Label>
                <Select 
                  name="faculty" 
                  value={selectedFaculty} 
                  onValueChange={setSelectedFaculty}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(faculties).map((faculty) => (
                      <SelectItem key={faculty} value={faculty}>
                        {faculty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select name="department" disabled={!selectedFaculty} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedFaculty && faculties[selectedFaculty as keyof typeof faculties]?.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Select name="level" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level} Level
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passport">Passport Photo</Label>
                <Input
                  id="passport"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPassportFile(e.target.files?.[0] || null)}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Upload a recent passport-sized photograph (JPG, PNG)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signature">Digital Signature</Label>
                <Input
                  id="signature"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSignatureFile(e.target.files?.[0] || null)}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Upload your signature (JPG, PNG)
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Submitting Application..." : "Submit Application"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Apply;