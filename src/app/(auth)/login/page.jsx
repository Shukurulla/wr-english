"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import { toast } from "@/stores/toast";
import api from "@/lib/api-client";
import { Eye, EyeOff, Mail, Lock, User, Users } from "lucide-react";

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");

  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  useEffect(() => {
    if (mode === "register" && groups.length === 0) {
      api.get("/groups/public").then((res) => {
        setGroups(res.data || []);
      }).catch(() => {});
    }
  }, [mode]);

  const redirect = (user) => {
    const redirects = { student: "/dashboard", admin: "/admin/dashboard" };
    router.push(redirects[user.role] || "/dashboard");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome, ${user.fullName}!`);
      redirect(user);
    } catch (err) {
      setError(err?.error?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (!fullName.trim()) { setError("Full name is required"); return; }
    if (!selectedGroup) { setError("Please select a group"); return; }
    setLoading(true);
    try {
      const res = await api.post("/auth/register", {
        fullName: fullName.trim(),
        email,
        password,
        role: "student",
        studentInfo: { groupId: selectedGroup },
      });
      const data = res.data || res;
      const { accessToken, refreshToken, user } = data;
      if (accessToken) localStorage.setItem("accessToken", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      if (user) {
        useAuthStore.setState({ user, isLoading: false });
        toast.success("Account created!");
        redirect(user);
      }
    } catch (err) {
      setError(err?.error?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError("");
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex md:w-1/2 lg:w-[55%] bg-ink relative overflow-hidden flex-col justify-between p-10 lg:p-14">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_top_right,_rgba(4,120,87,0.15)_0%,_transparent_70%)]" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
            <span className="text-ink font-display text-xl font-semibold">R</span>
          </div>
          <span className="text-white/90 font-semibold text-lg tracking-tight">Reading &amp; Writing</span>
        </div>
        <div className="relative z-10 max-w-lg">
          <h1 className="text-white text-4xl lg:text-5xl font-display font-bold leading-tight tracking-tight">
            The precise measure<br />
            <span className="italic text-white/70">of language skills</span>
          </h1>
          <p className="text-white/50 text-base mt-6 leading-relaxed max-w-sm">
            Reading and Writing skills assessed by IELTS standards
          </p>
        </div>
        <div className="relative z-10">
          <p className="text-white/30 text-sm">&copy; 2026 University</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-porcelain p-6 sm:p-10">
        <div className="w-full max-w-sm page-enter">
          <div className="md:hidden text-center mb-10">
            <div className="w-14 h-14 rounded-2xl bg-ink flex items-center justify-center mx-auto mb-4">
              <span className="text-porcelain font-display text-2xl font-semibold">R</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Reading &amp; Writing</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-display font-bold text-ink tracking-tight">
              {mode === "login" ? "Sign In" : "Create Account"}
            </h2>
            <p className="text-muted text-sm mt-2">
              {mode === "login"
                ? "Enter your credentials to access your account"
                : "Fill in your details to register"}
            </p>
          </div>

          <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="space-y-5">
            {error && (
              <div className="bg-[#FEF2F2] border border-[#B91C1C]/20 rounded-xl p-3 text-sm text-[#B91C1C]">
                {error}
              </div>
            )}

            {mode === "register" && (
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-ink">Full Name</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="w-full rounded-xl border border-line pl-10 pr-4 py-3 text-sm bg-white transition-all duration-200 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none placeholder:text-faint"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-ink">Email</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.uz"
                  required
                  className="w-full rounded-xl border border-line pl-10 pr-4 py-3 text-sm bg-white transition-all duration-200 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none placeholder:text-faint"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-ink">Password</label>
                {mode === "login" && (
                  <button type="button" className="text-xs text-accent hover:underline font-medium">
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "login" ? "Enter your password" : "Create a password (min 6 chars)"}
                  required
                  minLength={mode === "register" ? 6 : undefined}
                  className="w-full rounded-xl border border-line pl-10 pr-10 py-3 text-sm bg-white transition-all duration-200 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none placeholder:text-faint"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-faint hover:text-ink transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === "register" && (
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-ink">Group</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint">
                    <Users className="w-4 h-4" />
                  </div>
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    required
                    className="w-full rounded-xl border border-line pl-10 pr-4 py-3 text-sm bg-white appearance-none transition-all duration-200 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none"
                  >
                    <option value="">Select your group</option>
                    {groups.map((g) => (
                      <option key={g._id} value={g._id}>{g.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {mode === "login" && (
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-line text-ink focus:ring-accent focus:ring-offset-0"
                />
                <span className="text-sm text-muted">Remember me</span>
              </label>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full !bg-ink !text-porcelain hover:!bg-zinc-800"
              size="lg"
            >
              {mode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <p className="text-sm text-center text-muted mt-8">
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button onClick={switchMode} className="text-accent font-semibold hover:underline">
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button onClick={switchMode} className="text-accent font-semibold hover:underline">
                  Sign In
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
