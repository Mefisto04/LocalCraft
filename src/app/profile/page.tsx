"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, DollarSign, Users, Target, Instagram, Video, FileText } from "lucide-react";
import { toast } from "sonner";

interface StartupProfile {
  name: string;
  email: string;
  domain: string;
  capital: number;
  tagline: string;
  companyImage: {
    url: string;
  };
  pitchVideo: {
    url: string;
  };
  socialProof: {
    instagramFollowers: number;
  };
  fundingInfo: {
    currentRound: string;
    amountRaised: number;
    targetAmount: number;
  };
  investorPrefs: {
    minInvestment: number;
    maxInvestment: number;
    preferredIndustries: string[];
    preferredStages: string[];
  };
}

interface InvestorProfile {
  name: string;
  email: string;
  domain: string;
  capital: number;
  pastFunding: {
    companyName: string;
    amount: number;
    year: number;
  }[];
  vision: string;
  expertise: string[];
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<"startup" | "investor" | null>(null);
  const [profile, setProfile] = useState<StartupProfile | InvestorProfile | null>(null);

  useEffect(() => {
    const startupId = localStorage.getItem("StartupId");
    const investorId = localStorage.getItem("InvestorId");
    
    if (!startupId && !investorId) {
      router.push("/auth/login");
      return;
    }

    setUserType(startupId ? "startup" : "investor");
    
    // Fetch profile data
    const fetchProfile = async () => {
      try {
        setError(null);
        const response = await fetch(`/api/profile/${startupId || investorId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch profile");
        }
        
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch profile");
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-3 w-[150px]" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load profile</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
            <div className="mt-4 flex space-x-4">
              <Button variant="outline" onClick={() => router.back()}>
                Go Back
              </Button>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback>
                {profile.name.split(" ").map(n => n[0]).join("").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{profile.name}</CardTitle>
              <CardDescription>{profile.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">Domain:</span>
                <span className="font-medium">{profile.domain}</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">Capital:</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    maximumFractionDigits: 0,
                  }).format(profile.capital)}
                </span>
              </div>
            </div>
          </div>

          {userType === "startup" && "tagline" in profile && (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Company Information</h3>
                <p>{profile.tagline}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-2">
                        <Instagram className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Instagram Followers</p>
                          <p className="font-medium">{profile.socialProof.instagramFollowers.toLocaleString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-2">
                        <Target className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Current Round</p>
                          <p className="font-medium">{profile.fundingInfo.currentRound}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Amount Raised</p>
                          <p className="font-medium">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                              maximumFractionDigits: 0,
                            }).format(profile.fundingInfo.amountRaised)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Preferred Industries</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.investorPrefs.preferredIndustries.map((industry, i) => (
                      <Badge key={i} variant="secondary">{industry}</Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Preferred Stages</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.investorPrefs.preferredStages.map((stage, i) => (
                      <Badge key={i} variant="secondary">{stage}</Badge>
                    ))}
                  </div>
                </div>

                {profile.companyImage.url && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Company Image
                    </h4>
                    <img
                      src={profile.companyImage.url}
                      alt="Company"
                      className="rounded-lg max-w-md"
                    />
                  </div>
                )}

                {profile.pitchVideo.url && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Pitch Video
                    </h4>
                    <video
                      controls
                      className="rounded-lg max-w-md"
                      src={profile.pitchVideo.url}
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {userType === "investor" && "expertise" in profile && (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Investor Information</h3>
                <div className="space-y-2">
                  <h4 className="font-medium">Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.expertise.map((skill, i) => (
                      <Badge key={i} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Vision</h4>
                  <p>{profile.vision}</p>
                </div>

                {profile.pastFunding.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Past Investments</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.pastFunding.map((funding, i) => (
                        <Card key={i}>
                          <CardContent className="pt-6">
                            <div className="space-y-2">
                              <p className="font-medium">{funding.companyName}</p>
                              <div className="flex justify-between text-sm text-muted-foreground">
                                <span>{funding.year}</span>
                                <span>
                                  {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                    maximumFractionDigits: 0,
                                  }).format(funding.amount)}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => router.back()}>
              Back
            </Button>
            <Button onClick={() => router.push("/profile/edit")}>
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 