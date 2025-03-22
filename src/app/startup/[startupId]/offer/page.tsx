"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const formSchema = z.object({
  amount: z.string()
    .min(1, "Amount is required")
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, "Amount must be a positive number"),
  equity: z.string()
    .min(1, "Equity percentage is required")
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 0 && val <= 100, "Equity must be between 0 and 100"),
  royalty: z.string()
    .min(1, "Royalty percentage is required")
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 0 && val <= 100, "Royalty must be between 0 and 100"),
  conditions: z.string()
    .min(1, "Conditions are required")
    .transform(val => val.split('\n').filter(line => line.trim() !== '')),
  status: z.enum(['pending', 'accepted', 'rejected']).default('pending'),
});

export default function MakeOffer() {
  const router = useRouter();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      equity: 0,
      royalty: 0,
      conditions: [],
      status: "pending" as const,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      const investorId = localStorage.getItem("InvestorId");
      
      if (!investorId) {
        toast.error("Please log in to make an offer");
        return;
      }

      // Convert string values to numbers before sending
      const formattedValues = {
        ...values,
        amount: Number(values.amount),
        equity: Number(values.equity),
        royalty: Number(values.royalty),
      };

      const response = await fetch("/api/bids", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startupId: params.startupId,
          investorId,
          ...formattedValues,
          status: "pending"
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Offer submitted successfully!");
        router.push(`/investor/discover/${params.startupId}`);
      } else {
        toast.error(data.error || "Failed to submit offer");
      }
    } catch (error) {
      toast.error("An error occurred while submitting the offer");
      console.error("Error submitting offer:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container max-w-3xl mx-auto p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Make an Offer</CardTitle>
          <CardDescription>
            Submit your investment offer for this startup. Please review all terms carefully before submitting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investment Amount ($)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="100000"
                          type="number"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the amount you wish to invest
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="equity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Equity Percentage (%)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="10"
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Requested equity share
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="royalty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Royalty Percentage (%)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="5"
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Requested royalty percentage
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="conditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investment Conditions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter each condition on a new line:
1. Board seat requirement
2. Monthly performance reports
3. First right of refusal for future rounds"
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      List your conditions, one per line
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Offer"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 