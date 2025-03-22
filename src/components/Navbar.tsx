"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Menu, X, UploadCloud, Bell, ExternalLink } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface Bid {
  _id: string;
  startupId: string;
  startupName: string;
  amount: number;
  equity: number;
  royalty: number;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<"startup" | "investor" | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [rejectedBids, setRejectedBids] = useState<Bid[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showLatestNotification, setShowLatestNotification] = useState(false);
  const [latestRejectedBid, setLatestRejectedBid] = useState<Bid | null>(null);

  useEffect(() => {
    // Get user type and name from localStorage
    const startupId = localStorage.getItem("StartupId");
    const investorId = localStorage.getItem("InvestorId");

    setUserType(startupId ? "startup" : investorId ? "investor" : null);
    setUserName(localStorage.getItem("userName") || "User");

    // Check if the user is logged in (but allow "/" to always show the navbar)
    const isAuthPage = pathname?.startsWith("/auth");
    setIsAuthenticated(!!startupId || !!investorId);

    // Add scroll listener
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);

    // Fetch rejected bids if user is an investor and not on auth pages
    if (investorId && !isAuthPage) {
      fetchRejectedBids(investorId);
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };
  const fetchRejectedBids = async (investorId: string) => {
    try {
      const response = await fetch(`/api/bids/investor/${investorId}/rejected`);

      if (!response.ok) {
        throw new Error("Failed to fetch rejected bids");
      }

      const data = await response.json();
      const bids = data.bids || [];
      setRejectedBids(bids);

      // Check for new notifications
      const viewedNotifications = JSON.parse(
        localStorage.getItem("viewedNotifications") || "[]"
      );
      const newBids = bids.filter(
        (bid: Bid) => !viewedNotifications.includes(bid._id)
      );
      setUnreadCount(newBids.length);

      // Set latest notification for popup
      if (newBids.length > 0) {
        setLatestRejectedBid(newBids[0]);
        setShowLatestNotification(true);

        // Auto hide after 5 seconds
        setTimeout(() => {
          setShowLatestNotification(false);
        }, 5000);
      }
    } catch (error) {
      console.error("Error fetching rejected bids:", error);
    }
  };
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      // Clear localStorage
      localStorage.removeItem("UserId");
      localStorage.removeItem("StartupId");
      localStorage.removeItem("InvestorId");
      localStorage.removeItem("userName");

      setIsAuthenticated(false);
      toast.success("Logged out successfully");
      router.push("/auth/login");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  // Hide navbar on auth pages, except the homepage ("/")
  if (pathname?.startsWith("/auth") && pathname !== "/") {
    return null;
  }

  return (
    <nav
      className={`w-full z-50 transition-all duration-300 border-b ${
        isScrolled
          ? "fixed bg-background/95 backdrop-blur-sm shadow-sm"
          : "relative bg-background"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <div className="bg-primary rounded-md p-1.5">
              <UploadCloud className="h-6 w-6 text-primary-foreground" />
            </div>
            <Link href="/" className="text-2xl font-bold text-foreground">
              LocalCraft
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Show normal navbar on "/" page */}
            {!isAuthenticated || pathname === "/" ? (
              <>
                <Link
                  href="#startup-flow"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Startup
                </Link>
                <Link
                  href="#investor-flow"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Investor
                </Link>
                <Link
                  href="#features"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Features
                </Link>
                <Link
                  href="#testimonials"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Testimonials
                </Link>
                <Link href="/auth/login">
                  <Button variant="outline" className="mr-2">
                    Log in
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button>Get Started</Button>
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                {/* Add routes based on userType */}
                {userType === "startup" && (
                  <>
                    <Link href="/startups">Home</Link>
                    <Link href="/startups/liveFunding">Live Funding</Link>
                  </>
                )}
                {userType === "investor" && (
                  <>
                    <Link href="/investor">Home</Link>
                    <Link href="/investor/discover">Discover</Link>
                  </>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {userName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>
                      <p className="text-sm font-medium">{userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {userType === "startup" ? "Startup" : "Investor"}
                      </p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              {!isAuthenticated ? (
                <>
                  <Link
                    href="#startup-flow"
                    className="text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Startup
                  </Link>
                  <Link
                    href="#investor-flow"
                    className="text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Investor
                  </Link>
                  <Link
                    href="#features"
                    className="text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Features
                  </Link>
                  <Link
                    href="#testimonials"
                    className="text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Testimonials
                  </Link>
                  <div className="flex space-x-2 pt-2">
                    <Link href="/auth/login" className="flex-1">
                      <Button variant="outline" className="w-full">
                        Log in
                      </Button>
                    </Link>
                    <Link href="/auth/login" className="flex-1">
                      <Button className="w-full">Sign up</Button>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  {userType === "startup" && (
                    <>
                      <Link
                        href="/startups"
                        className="text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Home
                      </Link>
                      <Link
                        href="/startups/liveFunding"
                        className="text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Live Funding
                      </Link>
                    </>
                  )}
                  {userType === "investor" && (
                    <>
                      <Link
                        href="/investor"
                        className="text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Home
                      </Link>
                      <Link
                        href="/investor/discover"
                        className="text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Discover
                      </Link>
                      <Link
                        href="/investor/my-bids"
                        className="flex items-center justify-between text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          <Bell className="mr-2 h-4 w-4" />
                          Notifications
                        </div>
                        {unreadCount > 0 && (
                          <Badge variant="destructive" className="ml-auto">
                            {unreadCount}
                          </Badge>
                        )}
                      </Link>
                    </>
                  )}
                  <Link
                    href="/profile"
                    className="text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="justify-start"
                  >
                    Log out
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Latest notification popup */}
      {showLatestNotification &&
        latestRejectedBid &&
        userType === "investor" && (
          <div className="fixed bottom-4 right-4 bg-background border rounded-lg shadow-lg p-4 max-w-xs w-full z-50 animate-in slide-in-from-right-10">
            <div className="flex justify-between items-start mb-2">
              <div className="font-semibold text-sm">Offer Rejected</div>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 -mt-1 -mr-1"
                onClick={() => setShowLatestNotification(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-sm">
              <span className="font-medium">
                {latestRejectedBid.startupName || "A startup"}
              </span>{" "}
              has rejected your offer of{" "}
              {formatCurrency(latestRejectedBid.amount)} for{" "}
              {latestRejectedBid.equity}% equity.
            </p>
            <div className="mt-3 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  router.push("/investor/my-bids");
                  setShowLatestNotification(false);
                }}
              >
                View Details
              </Button>
            </div>
          </div>
        )}
    </nav>
  );
}
