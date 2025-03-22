"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { RefreshCcw, ExternalLink } from "lucide-react";

interface Bid {
  _id: string;
  startupId: string;
  startupName: string;
  amount: number;
  equity: number;
  royalty: number;
  conditions: string[];
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export default function MyBidsPage() {
  const router = useRouter();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const investorId = localStorage.getItem("InvestorId");
    if (!investorId) {
      alert("You need to be logged in as an investor");
      router.push("/auth/login");
      return;
    }

    fetchBids(investorId);
    
    // Update viewedNotifications in localStorage
    const rejectedBids = bids.filter(bid => bid.status === "rejected");
    if (rejectedBids.length > 0) {
      const viewedNotifications = JSON.parse(localStorage.getItem("viewedNotifications") || "[]");
      const newViewedNotifications = [
        ...viewedNotifications,
        ...rejectedBids.map(bid => bid._id)
      ];
      localStorage.setItem("viewedNotifications", JSON.stringify(newViewedNotifications));
    }
  }, [router]);

  const fetchBids = async (investorId: string) => {
    try {
      setRefreshing(true);
      const response = await fetch(`/api/bids/investor/${investorId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch bids");
      }
      
      const data = await response.json();
      setBids(data.bids || []);
    } catch (error) {
      console.error("Error fetching bids:", error);
      alert("Could not load your bids");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleRefresh = () => {
    const investorId = localStorage.getItem("InvestorId");
    if (investorId) {
      fetchBids(investorId);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">My Bids</h1>
        <div className="flex justify-center items-center h-64">
          <p>Loading bids...</p>
        </div>
      </div>
    );
  }

  // Group bids by status
  const pendingBids = bids.filter(bid => bid.status === "pending");
  const acceptedBids = bids.filter(bid => bid.status === "accepted");
  const rejectedBids = bids.filter(bid => bid.status === "rejected");

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Bids</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1"
        >
          <RefreshCcw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      {bids.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <h3 className="text-lg font-medium">No bids yet</h3>
              <p className="text-muted-foreground mt-2">
                When you make bids to startups, they will appear here.
              </p>
              <Button
                className="mt-4"
                onClick={() => router.push('/investor/discover')}
              >
                Discover Startups
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue={rejectedBids.length > 0 ? "rejected" : "all"}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Bids ({bids.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingBids.length})</TabsTrigger>
            <TabsTrigger value="accepted">Accepted ({acceptedBids.length})</TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedBids.length})
              {rejectedBids.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                  {rejectedBids.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <BidsTable bids={bids} formatCurrency={formatCurrency} />
          </TabsContent>
          
          <TabsContent value="pending">
            <BidsTable bids={pendingBids} formatCurrency={formatCurrency} />
          </TabsContent>
          
          <TabsContent value="accepted">
            <BidsTable bids={acceptedBids} formatCurrency={formatCurrency} />
          </TabsContent>
          
          <TabsContent value="rejected">
            <BidsTable bids={rejectedBids} formatCurrency={formatCurrency} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

interface BidsTableProps {
  bids: Bid[];
  formatCurrency: (amount: number) => string;
}

function BidsTable({ bids, formatCurrency }: BidsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>List of your bids to startups</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Startup</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Equity</TableHead>
            <TableHead>Royalty</TableHead>
            <TableHead>Conditions</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bids.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-6">
                No bids found
              </TableCell>
            </TableRow>
          ) : (
            bids.map((bid) => (
              <TableRow key={bid._id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{bid.startupName || "Unknown Startup"}</p>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(bid.amount)}
                </TableCell>
                <TableCell>{bid.equity}%</TableCell>
                <TableCell>{bid.royalty}%</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {bid.conditions?.length === 0 ? (
                      <span className="text-xs text-muted-foreground">None</span>
                    ) : (
                      bid.conditions?.map((condition, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {condition}
                        </Badge>
                      ))
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      bid.status === 'accepted'
                        ? 'default'
                        : bid.status === 'rejected'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {bid.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDistanceToNow(new Date(bid.updatedAt || bid.createdAt), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => window.open(`/startup/${bid.startupId}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
} 