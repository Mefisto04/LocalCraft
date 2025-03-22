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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Check, DollarSign, Percent, X, MessageSquare } from "lucide-react";
import Footer from "@/components/Footer";

interface Bid {
  _id: string;
  startupId: string;
  investorId: string;
  amount: number;
  equity: number;
  royalty: number;
  conditions: string[];
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  investorName?: string;
}

interface InvestorInfo {
  name: string;
  domain: string;
  capital: number;
}

export default function LiveFundingPage() {
  const router = useRouter();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [negotiationMessage, setNegotiationMessage] = useState("");
  const [showNegotiateDialog, setShowNegotiateDialog] = useState(false);
  const [investorInfo, setInvestorInfo] = useState<Record<string, InvestorInfo>>({});

  useEffect(() => {
    const startupId = localStorage.getItem("StartupId");
    if (!startupId) {
      alert("You need to be logged in as a startup");
      router.push("/auth/login");
      return;
    }

    fetchBids(startupId);
  }, [router]);

  const fetchBids = async (startupId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bids/startup/${startupId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch bids");
      }
      
      const data = await response.json();
      const fetchedBids = data.bids || [];
      setBids(fetchedBids);
      
      // Fetch investor details for each bid
      const bidArray = fetchedBids as { investorId: string }[];
      const investorIds = [...new Set(bidArray.map(bid => bid.investorId))];
      
      const investorInfoMap: Record<string, InvestorInfo> = {};
      
      // Use explicit typing for the Promise.all array
      const promises: Promise<void>[] = investorIds.map(async (investorId) => {
        const investorRes = await fetch(`/api/investors/${investorId}`);
        if (investorRes.ok) {
          const investorData = await investorRes.json();
          if (investorData.investor) {
            investorInfoMap[investorId] = {
              name: investorData.investor.name || "Unknown",
              domain: investorData.investor.domain || "Unknown",
              capital: investorData.investor.capital || 0
            };
          }
        }
      });
      
      await Promise.all(promises);
      setInvestorInfo(investorInfoMap);
    } catch (error) {
      console.error("Error fetching bids:", error);
      alert("Could not load funding offers");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (bid: Bid) => {
    try {
      const response = await fetch(`/api/bids/${bid._id}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startupId: bid.startupId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to accept bid");
      }

      alert("Offer accepted successfully!");
      
      // Update local state
      setBids(prevBids => 
        prevBids.map(b => ({
          ...b,
          status: b._id === bid._id ? 'accepted' : 'rejected'
        }))
      );
    } catch (error) {
      console.error("Error accepting bid:", error);
      alert("Failed to accept offer");
    }
  };

  const handleReject = async (bid: Bid) => {
    try {
      const response = await fetch(`/api/bids/${bid._id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startupId: bid.startupId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject bid");
      }

      alert("Offer rejected successfully");
      
      // Update local state - remove the rejected bid
      setBids(prevBids => prevBids.filter(b => b._id !== bid._id));
    } catch (error) {
      console.error("Error rejecting bid:", error);
      alert("Failed to reject offer");
    }
  };

  const handleNegotiate = async () => {
    if (!selectedBid) return;
    
    try {
      const response = await fetch(`/api/bids/${selectedBid._id}/negotiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startupId: selectedBid.startupId,
          message: negotiationMessage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send negotiation message");
      }

      alert("Negotiation message sent successfully");
      setShowNegotiateDialog(false);
      setNegotiationMessage("");
    } catch (error) {
      console.error("Error sending negotiation:", error);
      alert("Failed to send negotiation message");
    }
  };

  const openNegotiateDialog = (bid: Bid) => {
    setSelectedBid(bid);
    setShowNegotiateDialog(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Live Funding Offers</h1>
        <div className="flex justify-center items-center h-64">
          <p>Loading offers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Live Funding Offers</h1>
      
      {bids.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <h3 className="text-lg font-medium">No funding offers yet</h3>
              <p className="text-muted-foreground mt-2">
                When investors make offers, they will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="pending">
          <TabsList className="mb-4">
            <TabsTrigger value="pending">Pending Offers</TabsTrigger>
            <TabsTrigger value="accepted">Accepted Offers</TabsTrigger>
            <TabsTrigger value="all">All Offers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending">
            <OffersTable 
              bids={bids.filter(bid => bid.status === 'pending')}
              investorInfo={investorInfo}
              onAccept={handleAccept}
              onReject={handleReject}
              onNegotiate={openNegotiateDialog}
              formatCurrency={formatCurrency}
            />
          </TabsContent>
          
          <TabsContent value="accepted">
            <OffersTable 
              bids={bids.filter(bid => bid.status === 'accepted')}
              investorInfo={investorInfo}
              onAccept={handleAccept}
              onReject={handleReject}
              onNegotiate={openNegotiateDialog}
              formatCurrency={formatCurrency}
              showActions={false}
            />
          </TabsContent>
          
          <TabsContent value="all">
            <OffersTable 
              bids={bids}
              investorInfo={investorInfo}
              onAccept={handleAccept}
              onReject={handleReject}
              onNegotiate={openNegotiateDialog}
              formatCurrency={formatCurrency}
            />
          </TabsContent>
        </Tabs>
      )}
      
      {/* Negotiate Dialog */}
      <Dialog open={showNegotiateDialog} onOpenChange={setShowNegotiateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Negotiate Offer</DialogTitle>
            <DialogDescription>
              Send a message to the investor with your counter-proposal or questions.
            </DialogDescription>
          </DialogHeader>
          
          {selectedBid && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Amount:</p>
                  <p className="text-lg">{formatCurrency(selectedBid.amount)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Equity:</p>
                  <p className="text-lg">{selectedBid.equity}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Royalty:</p>
                  <p className="text-lg">{selectedBid.royalty}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Investor:</p>
                  <p className="text-lg">{investorInfo[selectedBid.investorId]?.name || "Unknown"}</p>
                </div>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Your Message
                </label>
                <Textarea
                  id="message"
                  placeholder="I'm interested in your offer, but would like to discuss the equity percentage..."
                  rows={5}
                  value={negotiationMessage}
                  onChange={(e) => setNegotiationMessage(e.target.value)}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNegotiateDialog(false)}>Cancel</Button>
            <Button onClick={handleNegotiate} disabled={!negotiationMessage.trim()}>
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface OffersTableProps {
  bids: Bid[];
  investorInfo: Record<string, InvestorInfo>;
  onAccept: (bid: Bid) => void;
  onReject: (bid: Bid) => void;
  onNegotiate: (bid: Bid) => void;
  formatCurrency: (amount: number) => string;
  showActions?: boolean;
}

function OffersTable({
  bids,
  investorInfo,
  onAccept,
  onReject,
  onNegotiate,
  formatCurrency,
  showActions = true
}: OffersTableProps) {
  return (
    <>
    <div className="rounded-md border h-screen">
      <Table>
        <TableCaption>List of funding offers for your startup</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Investor</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Equity</TableHead>
            <TableHead>Royalty</TableHead>
            <TableHead>Conditions</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            {showActions && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {bids.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showActions ? 8 : 7} className="text-center py-6">
                No offers found
              </TableCell>
            </TableRow>
          ) : (
            bids.map((bid) => (
              <TableRow key={bid._id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{investorInfo[bid.investorId]?.name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{investorInfo[bid.investorId]?.domain || ""}</p>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(bid.amount)}
                </TableCell>
                <TableCell>{bid.equity}%</TableCell>
                <TableCell>{bid.royalty}%</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {bid.conditions.length === 0 ? (
                      <span className="text-xs text-muted-foreground">None</span>
                    ) : (
                      bid.conditions.map((condition, i) => (
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
                  {formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true })}
                </TableCell>
                {showActions && (
                  <TableCell>
                    {bid.status === 'pending' ? (
                      <div className="flex items-center gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                              <Check className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Accept this offer?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Accepting this offer will reject all other pending offers. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onAccept(bid)}>
                                Accept
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 w-8 p-0"
                          onClick={() => onNegotiate(bid)}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                              <X className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Reject this offer?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently remove this offer. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onReject(bid)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Reject
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {bid.status === 'accepted' ? 'Accepted' : 'Rejected'}
                      </span>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
    <Footer />
    </>
  );
}
