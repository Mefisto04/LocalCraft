"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { RefreshCw } from "lucide-react";
import Footer from "@/components/Footer";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [startups, setStartups] = useState([]);
  const [investors, setInvestors] = useState([]);
  const [refreshing, setRefreshing] = useState({
    startups: false,
    investors: false
  });

  const fetchData = async () => {
    try {
      // Fetch startups data
      setRefreshing(prev => ({ ...prev, startups: true }));
      const startupsResponse = await fetch("/api/admin/startups");
      const startupsResult = await startupsResponse.json();
      
      if (startupsResult.success) {
        setStartups(startupsResult.data);
      }
      setRefreshing(prev => ({ ...prev, startups: false }));

      // Fetch investors data
      setRefreshing(prev => ({ ...prev, investors: true }));
      const investorsResponse = await fetch("/api/admin/investors");
      const investorsResult = await investorsResponse.json();
      
      if (investorsResult.success) {
        setInvestors(investorsResult.data);
      }
      setRefreshing(prev => ({ ...prev, investors: false }));
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if admin is logged in
    const isLoggedIn = localStorage.getItem("adminLoggedIn") === "true";
    
    if (!isLoggedIn) {
      toast.error("Please login to access admin dashboard");
      router.push("/auth/adminLogin");
      return;
    }

    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    router.push("/auth/adminLogin");
    toast.success("Logged out successfully");
  };

  const toggleVerificationStatus = async (type: 'startup' | 'investor', id: string, currentStatus: boolean) => {
    try {
      const endpoint = type === 'startup' 
        ? `/api/admin/startups/${id}/verify` 
        : `/api/admin/investors/${id}/verify`;
      
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isVerified: !currentStatus }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`${type === 'startup' ? 'Startup' : 'Investor'} ${currentStatus ? 'unverified' : 'verified'} successfully`);
        fetchData();
      } else {
        toast.error(data.error || "Failed to update verification status");
      }
    } catch (error) {
      console.error(`Error updating ${type} verification:`, error);
      toast.error(`An error occurred while updating ${type}`);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <Tabs defaultValue="startups">
        <TabsList className="mb-4">
          <TabsTrigger value="startups">Startups</TabsTrigger>
          <TabsTrigger value="investors">Investors</TabsTrigger>
        </TabsList>
        
        <TabsContent value="startups">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Startup Management</CardTitle>
                <CardDescription>
                  View and manage registered startups
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => fetchData()}
                disabled={refreshing.startups}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing.startups ? 'animate-spin' : ''}`} />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-3 text-left">ID</th>
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-left">Domain</th>
                      <th className="p-3 text-left">Capital</th>
                      <th className="p-3 text-left">Registered</th>
                      <th className="p-3 text-left">Verified</th>
                    </tr>
                  </thead>
                  <tbody>
                    {startups.length > 0 ? (
                      startups.map((startup: any) => (
                        <tr key={startup._id} className="border-t">
                          <td className="p-3">{startup.startupId}</td>
                          <td className="p-3">{startup.name}</td>
                          <td className="p-3">{startup.email}</td>
                          <td className="p-3">{startup.domain}</td>
                          <td className="p-3">${startup.capital.toLocaleString()}</td>
                          <td className="p-3">{new Date(startup.createdAt).toLocaleDateString()}</td>
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              <Switch 
                                checked={startup.isVerified} 
                                onCheckedChange={() => toggleVerificationStatus('startup', startup._id, startup.isVerified)} 
                              />
                              <span>{startup.isVerified ? 'Yes' : 'No'}</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-4 text-center">
                          No startups found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="investors">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Investor Management</CardTitle>
                <CardDescription>
                  View and manage registered investors
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => fetchData()}
                disabled={refreshing.investors}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing.investors ? 'animate-spin' : ''}`} />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-3 text-left">ID</th>
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-left">Domain</th>
                      <th className="p-3 text-left">Capital</th>
                      <th className="p-3 text-left">Registered</th>
                      <th className="p-3 text-left">Verified</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investors.length > 0 ? (
                      investors.map((investor: any) => (
                        <tr key={investor._id} className="border-t">
                          <td className="p-3">{investor.investorId}</td>
                          <td className="p-3">{investor.name}</td>
                          <td className="p-3">{investor.email}</td>
                          <td className="p-3">{investor.domain}</td>
                          <td className="p-3">${investor.capital.toLocaleString()}</td>
                          <td className="p-3">{new Date(investor.createdAt).toLocaleDateString()}</td>
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              <Switch 
                                checked={investor.isVerified} 
                                onCheckedChange={() => toggleVerificationStatus('investor', investor._id, investor.isVerified)} 
                              />
                              <span>{investor.isVerified ? 'Yes' : 'No'}</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-4 text-center">
                          No investors found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    <Footer />
    </>
  );
}