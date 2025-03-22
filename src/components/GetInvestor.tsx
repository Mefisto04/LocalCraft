// app/investors/page.tsx
"use client";

import { useEffect, useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface InvestorData {
  _id: string;
  investorId: string;
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
  createdAt: string;
  isVerified: boolean;
}

export default function InvestorsPage() {
  const [investors, setInvestors] = useState<InvestorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvestors = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/auth/get-investor');
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || "Failed to fetch investors");
        }
        
        setInvestors(data.investors);
      } catch (error) {
        console.error("Error fetching investors:", error);
        setError(error instanceof Error ? error.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchInvestors();
  }, []);

  // Get initials for avatar
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map(part => part.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
      notation: 'compact',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Investors</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">Error: {error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Investors Directory</h1>
      
      {investors.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No investors found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {investors.map((investor) => (
            <Card key={investor._id} className="flex flex-col h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(investor.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{investor.name}</CardTitle>
                      <CardDescription>{investor.domain}</CardDescription>
                    </div>
                  </div>
                  {investor.isVerified && (
                    <Badge className="bg-green-500 hover:bg-green-600">Verified</Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4 flex-grow">
                <div>
                  <p className="text-sm font-medium text-gray-500">Capital Available</p>
                  <p className="text-xl font-bold">{formatCurrency(investor.capital)}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Vision</p>
                  <p className="text-sm line-clamp-2">{investor.vision}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Expertise</p>
                  <div className="flex flex-wrap gap-2">
                    {investor.expertise.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                    {investor.expertise.length > 3 && (
                      <Badge variant="outline">
                        +{investor.expertise.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                
                {investor.pastFunding.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Top Investment
                    </p>
                    <p className="text-sm">
                      {investor.pastFunding[0].companyName} ({investor.pastFunding[0].year}): {formatCurrency(investor.pastFunding[0].amount)}
                    </p>
                  </div>
                )}
              </CardContent>
              
              <CardFooter>
                <Button className="w-full" variant="outline">
                  View Profile
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}