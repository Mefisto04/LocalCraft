"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<"startup" | "investor">("startup");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email"),
      password: formData.get("password"),
      userType,
    };

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }
      const result = await response.json();

      localStorage.setItem("UserId", result.user.id);
      if (userType === "startup") {
        localStorage.setItem("StartupId", result.user.startupId);
      } else {
        localStorage.setItem("InvestorId", result.user.investorId);
      }

      toast.success("Login successful!");

      router.push(userType === "startup" ? "/startups" : "/investor");
      // router.push("/startups")
    } catch (error) {
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Navbar />
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Login to your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Account Type</Label>
              <RadioGroup
                defaultValue="startup"
                onValueChange={(value: "startup" | "investor") =>
                  setUserType(value)
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="startup" id="startup" />
                  <Label htmlFor="startup">Startup</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="investor" id="investor" />
                  <Label htmlFor="investor">Investor</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
            <p className="text-sm text-center text-gray-500">
              Don't have an account?{" "}
              <Link
                href="/auth/register"
                className="text-blue-500 hover:text-blue-700"
              >
                Register
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
