"use client"

import type React from "react"

import { useState } from "react"
import { Eye, EyeOff, Shield, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { signIn } from "next-auth/react"
import { useRouter } from "next/router"
import Link from "next/link"

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    setError("");
    e.preventDefault();
    setIsLoading(true);
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })

    if (res.ok) {
      setIsLoading(false);
      router.push('/login')
    } else {
      setIsLoading(false);
      const err = await res.json()
      setError(err.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">🎯 Enemies List</h1>
          <p className="text-gray-400">Secure access to your classified intel</p>
        </div>

        {/* Login Card */}
        <Card className="bg-white/10 backdrop-blur-lg border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-white">Sign Up</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-200">
                  Username
                </Label>
                <Input
                  id="username"
                  type="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  className="bg-white/5 border-gray-600 text-white placeholder:text-gray-400 focus:border-red-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-200">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="bg-white/5 border-gray-600 text-white placeholder:text-gray-400 focus:border-red-500 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* <div className="flex items-center justify-between">
                <Button variant="link" className="text-red-400 hover:text-red-300 p-0 h-auto">
                  Forgot password?
                </Button>
              </div> */}

              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing up...</span>
                  </div>
                ) : (
                  "Access Database"
                )}
              </Button>
              {error && (
                <Alert className="bg-red-500/10 border-red-500/20">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Already have clearance?{" "}
                <Link href="/login" passHref>
                  <Button 
                    variant="ghost" // Changed from "outline" to "ghost" for transparent bg
                    className="
                      text-red-400 
                      hover:text-red-300 
                      p-0 
                      h-auto 
                      hover:bg-transparent 
                      focus:bg-transparent
                      active:bg-transparent
                    "
                  >
                    Sign in for access
                  </Button>
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>⚠️ This is a satirical application for entertainment purposes only.</p>
          <p className="mt-1">© 2025 Enemies List Inc. All grudges reserved.</p>
        </div>
      </div>
    </div>
  )
}
