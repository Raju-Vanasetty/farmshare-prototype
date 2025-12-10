import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sprout, User, Tractor as TractorIcon, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!role) {
      toast({
        title: 'Role required',
        description: 'Please select your role to continue',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      if (data.user) {
        // Insert user role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: data.user.id,
            role: role as any,
          });

        if (roleError) throw roleError;

        toast({
          title: 'Account created!',
          description: 'Welcome to FarmShare.',
        });

        navigate(`/dashboard/${role}`);
      }
    } catch (error: any) {
      let errorMessage = error.message;
      
      // Handle common auth errors with user-friendly messages
      if (error.message?.includes('User already registered') || error.message?.includes('already exists')) {
        errorMessage = 'This email is already registered. Please login instead.';
      } else if (error.message?.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.message?.includes('Password')) {
        errorMessage = 'Password must be at least 6 characters long.';
      }
      
      toast({
        title: 'Registration failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Sprout className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl">Join FarmShare</CardTitle>
          <CardDescription className="text-base">
            Create your account and start your farming journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-3">
              <Label>I am a...</Label>
              <RadioGroup value={role} onValueChange={setRole}>
                <Card className={`cursor-pointer transition-all ${role === 'user' ? 'border-primary border-2 bg-primary/5' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="user" id="user" />
                      <Label htmlFor="user" className="flex items-center gap-3 cursor-pointer flex-1">
                        <div className="p-2 bg-secondary/10 rounded-full">
                          <User className="h-5 w-5 text-secondary" />
                        </div>
                        <div>
                          <div className="font-medium">Hobbyist Farmer</div>
                          <div className="text-sm text-muted-foreground">I want to lease land and grow crops</div>
                        </div>
                      </Label>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`cursor-pointer transition-all ${role === 'farmer' ? 'border-primary border-2 bg-primary/5' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="farmer" id="farmer" />
                      <Label htmlFor="farmer" className="flex items-center gap-3 cursor-pointer flex-1">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">Landowner</div>
                          <div className="text-sm text-muted-foreground">I have land to lease out</div>
                        </div>
                      </Label>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`cursor-pointer transition-all ${role === 'vendor' ? 'border-primary border-2 bg-primary/5' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="vendor" id="vendor" />
                      <Label htmlFor="vendor" className="flex items-center gap-3 cursor-pointer flex-1">
                        <div className="p-2 bg-accent/10 rounded-full">
                          <TractorIcon className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <div className="font-medium">Equipment Vendor</div>
                          <div className="text-sm text-muted-foreground">I rent farming equipment</div>
                        </div>
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              </RadioGroup>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
