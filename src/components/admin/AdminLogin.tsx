import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";
import { toast } from "sonner";

const AdminLogin = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const { adminExists, isLoading, login, signup } = useAdminAuth();

  useEffect(() => {
    if (!adminExists) setMode("signup");
  }, [adminExists]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || (mode === "signup" && !fullName)) {
      toast.error("Please fill all required fields");
      return;
    }

    const result = mode === "login"
      ? await login(email, password)
      : await signup(email, password, fullName);

    if (!result.success) {
      toast.error(result.message ?? "Unable to continue");
      return;
    }

    if (result.requiresConfirmation) {
      toast.success(result.message ?? "Check your email to confirm the account, then log in here.");
      setMode("login");
      setPassword("");
      return;
    }

    setPassword("");

    if (mode === "login") {
      toast.success("Welcome to the admin panel");
    } else {
      toast.success("Admin account created");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6 text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-semibold">Admin Access</h1>
          <p className="text-sm text-muted-foreground">
            {adminExists
              ? "Sign in with your authorized admin account."
              : "Create the first admin account to unlock coupon management."}
          </p>
        </div>

        {!adminExists && (
          <div className="rounded-md border border-border bg-card px-4 py-3 text-left text-xs text-muted-foreground">
            After the first admin is created, only approved admin accounts will be able to create, edit, or delete coupons.
          </div>
        )}

        {!adminExists && (
          <button
            type="button"
            onClick={() => setMode((current) => (current === "login" ? "signup" : "login"))}
            className="text-xs text-muted-foreground underline underline-offset-4"
          >
            {mode === "login" ? "Need to create the first admin account?" : "Already created it? Log in instead"}
          </button>
        )}

        {mode === "signup" && (
          <Input
            type="text"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        )}
        <Input
          type="email"
          placeholder="Admin email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading
            ? mode === "login"
              ? "Signing in..."
              : "Creating admin..."
            : mode === "login"
              ? "Enter Admin"
              : "Create Admin"}
        </Button>
      </form>
    </div>
  );
};

export default AdminLogin;
