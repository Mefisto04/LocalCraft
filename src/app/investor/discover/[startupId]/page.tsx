"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MatchMeter } from "@/components/MatchMeter";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { StarIcon } from "lucide-react";

interface StartupDetails {
  startupId: string;
  name: string;
  email: string;
  domain: string;
  capital: number;
  tagline: string;
  companyImage: {
    url: string;
    fileType: string;
    originalName: string;
  };
  pitchVideo: {
    url: string;
    fileType: string;
    originalName: string;
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
  matchScores?: {
    visionAlignment: { score: number; reason: string };
    domainMatch: { score: number; reason: string };
    growthPotential: { score: number; reason: string };
  };
}

export default function StartupReport() {
  const router = useRouter();
  const params = useParams();
  const [startup, setStartup] = useState<StartupDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    rating: 0,
    comment: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchStartupDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/startups/${params.startupId}`);
        const data = await response.json();

        if (data.success) {
          setStartup(data.data);
        } else {
          console.error("Failed to fetch startup details:", data.error);
        }
      } catch (error) {
        console.error("Error fetching startup details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.startupId) {
      fetchStartupDetails();
    }
  }, [params.startupId]);

  const handleFeedbackSubmit = async () => {
    if (!startup) return;
    
    try {
      setSubmitting(true);
      
      // Here you would implement the API call to submit feedback
      const response = await fetch(`/api/startups/${params.startupId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startupId: startup.startupId,
          rating: feedbackData.rating,
          comment: feedbackData.comment,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Close dialog and show success message
        setFeedbackOpen(false);
        // You could add a toast notification here
      } else {
        console.error("Failed to submit feedback:", data.error);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!startup) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold text-red-500">Startup not found</h1>
      </div>
    );
  }

  return (
    <>
    <div className="container mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Company Overview</CardTitle>
            <CardDescription>{startup.tagline}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative h-48 rounded-lg overflow-hidden">
                <img
                  src={startup.companyImage.url}
                  alt={startup.name}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Domain</h3>
                  <p>{startup.domain}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Capital</h3>
                  <p>${startup.capital.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Funding Information */}
        <Card>
          <CardHeader>
            <CardTitle>Funding Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Current Round</h3>
                  <p>{startup.fundingInfo.currentRound}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Amount Raised</h3>
                  <p>${startup.fundingInfo.amountRaised.toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Target Amount</h3>
                  <p>${startup.fundingInfo.targetAmount.toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Progress</h3>
                  <p>
                    {Math.round(
                      (startup.fundingInfo.amountRaised /
                        startup.fundingInfo.targetAmount) *
                        100
                    )}
                    %
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pitch Video */}
        <Card>
          <CardHeader>
            <CardTitle>Pitch Video</CardTitle>
          </CardHeader>
          <CardContent>
            {startup.pitchVideo?.url ? (
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <video
                  src={startup.pitchVideo.url}
                  controls
                  className="w-full h-full"
                />
              </div>
            ) : (
              <div className="aspect-video rounded-lg bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500">No pitch video available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Investment Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Investment Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Investment Range</h3>
                <p>
                  ${startup.investorPrefs.minInvestment.toLocaleString()} -{" "}
                  ${startup.investorPrefs.maxInvestment.toLocaleString()}
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Preferred Industries</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {startup.investorPrefs.preferredIndustries.map((industry) => (
                    <span
                      key={industry}
                      className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {industry}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Preferred Stages</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {startup.investorPrefs.preferredStages.map((stage) => (
                    <span
                      key={stage}
                      className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {stage}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Match Scores */}
        {startup.matchScores && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Match Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <MatchMeter
                    value={startup.matchScores.visionAlignment.score * 10}
                    label="Vision Match"
                  />
                  <p className="mt-2 text-sm text-muted-foreground">
                    {startup.matchScores.visionAlignment.reason}
                  </p>
                </div>
                <div>
                  <MatchMeter
                    value={startup.matchScores.domainMatch.score * 10}
                    label="Domain Match"
                  />
                  <p className="mt-2 text-sm text-muted-foreground">
                    {startup.matchScores.domainMatch.reason}
                  </p>
                </div>
                <div>
                  <MatchMeter
                    value={startup.matchScores.growthPotential.score * 10}
                    label="Growth Potential"
                  />
                  <p className="mt-2 text-sm text-muted-foreground">
                    {startup.matchScores.growthPotential.reason}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <div className="flex justify-center gap-4">
              <Button 
                variant="outline" 
                size="lg"
                className="w-[200px] text-lg font-semibold"
                onClick={() => setFeedbackOpen(true)}
              >
                Give Feedback
              </Button>
              <Button 
                size="lg"
                className="w-[200px] text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                onClick={() => {
                  router.push(`/startup/${startup.startupId}/offer`);
                }}
              >
                Make an Offer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    {/* Feedback Dialog */}
    <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Provide Feedback</DialogTitle>
          <DialogDescription>
            Share your thoughts about {startup?.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Startup Info */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Startup</Label>
                <p className="font-medium">{startup?.name}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Domain</Label>
                <p className="font-medium">{startup?.domain}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                <p className="font-medium">{startup?.email}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Capital</Label>
                <p className="font-medium">${startup?.capital.toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Current Round</Label>
                <p className="font-medium">{startup?.fundingInfo.currentRound}</p>
              </div>
            </div>
          </div>
          
          {/* Rating */}
          <div>
            <Label htmlFor="rating">Rating</Label>
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFeedbackData({...feedbackData, rating: star})}
                  className={`p-1 rounded-full transition-colors ${
                    feedbackData.rating >= star 
                      ? "text-yellow-500 hover:text-yellow-600" 
                      : "text-gray-300 hover:text-yellow-400"
                  }`}
                >
                  <StarIcon className="h-8 w-8 fill-current" />
                </button>
              ))}
            </div>
          </div>
          
          {/* Feedback Comment */}
          <div>
            <Label htmlFor="comment">Your Feedback</Label>
            <Textarea
              id="comment"
              placeholder="Share your thoughts about this startup..."
              className="mt-2"
              rows={5}
              value={feedbackData.comment}
              onChange={(e) => setFeedbackData({...feedbackData, comment: e.target.value})}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setFeedbackOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            // onClick={handleFeedbackSubmit}
            disabled={feedbackData.rating === 0 || !feedbackData.comment || submitting}
          >
            {submitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    
    <Footer />
    </>
  );
} 