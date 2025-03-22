"use client";

import { useState, useEffect } from "react";
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
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CloudUpload, X, Video } from "lucide-react";
import Image from "next/image";
import config from "@/lib/config";

export default function RegisterPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<"startup" | "investor">("startup");
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "startup" as "startup" | "investor",
    domain: "",
    capital: 0,
    tagline: "",
    companyImage: {
      url: "",
      fileType: "",
      originalName: ""
    },
    pitchVideo: {
      url: "",
      fileType: "",
      originalName: ""
    },
    socialProof: {
      instagramFollowers: 0,
    },
    fundingInfo: {
      currentRound: "Seed",
      amountRaised: 0,
      targetAmount: 0,
    },
    investorPrefs: {
      minInvestment: 0,
      maxInvestment: 0,
      preferredIndustries: [] as string[],
      preferredStages: [] as string[],
    },
    // Investor fields
    vision: "",
    expertise: [] as string[],
    pastFunding: [] as {
      companyName: string;
      amount: number;
      year: number;
    }[],
  });

  // Add a useEffect to sync userType changes
  useEffect(() => {
    setFormData((prev) => ({ ...prev, userType }));
  }, [userType]);

  const handleUserTypeChange = (value: "startup" | "investor") => {
    setUserType(value);
    setStep(1); // Reset to step 1 when changing user type
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...(formData[parent as keyof typeof formData] as Record<string, any>),
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...(formData[parent as keyof typeof formData] as Record<string, any>),
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleArrayChange = (name: string, value: string) => {
    const values = value.split(",").map((item) => item.trim());

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...(formData[parent as keyof typeof formData] as Record<string, any>),
          [child]: values,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: values,
      });
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...(formData[parent as keyof typeof formData] as Record<string, any>),
          [child]: Number(value),
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: Number(value),
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Check file size
    if (file.size > config.maxImageSize) {
      toast.error(`File size exceeds the maximum allowed size of ${config.maxImageSize / (1024 * 1024)}MB`);
      return;
    }
    
    try {
      setUploadingImage(true);
      
      const formData = new FormData();
      formData.append('file', file);
      
      console.log(`Using upload endpoint: ${config.uploadEndpoint}`);
      const response = await fetch(config.uploadEndpoint, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }
      
      const result = await response.json();
      
      setFormData(prev => ({
        ...prev,
        companyImage: {
          url: result.url,
          fileType: result.fileType,
          originalName: result.originalName
        }
      }));
      
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image');
      console.error('Upload error:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      companyImage: {
        url: "",
        fileType: "",
        originalName: ""
      }
    }));
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Check file size (100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast.error("File size exceeds the maximum allowed size of 100MB");
      return;
    }
    
    try {
      setUploadingVideo(true);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload/video', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }
      
      const result = await response.json();
      
      setFormData(prev => ({
        ...prev,
        pitchVideo: {
          url: result.url,
          fileType: result.fileType,
          originalName: result.originalName
        }
      }));
      
      toast.success('Video uploaded successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload video');
      console.error('Upload error:', error);
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleRemoveVideo = () => {
    setFormData(prev => ({
      ...prev,
      pitchVideo: {
        url: "",
        fileType: "",
        originalName: ""
      }
    }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate first step
    if (step === 1) {
      if (
        !formData.name ||
        !formData.email ||
        !formData.password ||
        !formData.confirmPassword
      ) {
        toast.error("Please fill all required fields");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }

    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Registration failed");
      }

      toast.success("Registration successful! Please login.");
      router.push("/auth/login");
    } catch (error: any) {
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[450px]">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>
            {userType === "startup"
              ? `Register as a startup ${
                  step === 1 ? "(Step 1 of 2)" : "(Step 2 of 2)"
                }`
              : "Register as an investor"}
          </CardDescription>
        </CardHeader>

        {userType === "startup" && step === 1 ? (
          <motion.div
            key="step1"
            initial="enter"
            animate="center"
            exit="exit"
            variants={slideVariants}
            transition={{ duration: 0.3 }}
            custom={1}
          >
            <form onSubmit={handleNext}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <RadioGroup
                    defaultValue={formData.userType}
                    onValueChange={handleUserTypeChange}
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
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
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
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full">
                  Next
                </Button>
                <p className="text-sm text-center text-gray-500">
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Login
                  </Link>
                </p>
              </CardFooter>
            </form>
          </motion.div>
        ) : userType === "startup" && step === 2 ? (
          <motion.div
            key="step2"
            initial="enter"
            animate="center"
            exit="exit"
            variants={slideVariants}
            transition={{ duration: 0.3 }}
            custom={1}
          >
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="domain">Domain</Label>
                  <Input
                    id="domain"
                    name="domain"
                    type="text"
                    placeholder="Enter your domain"
                    value={formData.domain}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capital">Capital</Label>
                  <Input
                    id="capital"
                    name="capital"
                    type="number"
                    placeholder="Enter your capital"
                    value={formData.capital || ""}
                    onChange={handleNumberChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    name="tagline"
                    type="text"
                    placeholder="Enter your startup tagline"
                    value={formData.tagline}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyImage">Company Image</Label>
                  <div className="mt-2">
                    {formData.companyImage.url ? (
                      <div className="relative w-full h-40 bg-gray-100 rounded-md overflow-hidden">
                        {formData.companyImage.url.startsWith('data:') ? (
                          <div 
                            className="w-full h-full bg-contain bg-center bg-no-repeat" 
                            style={{ backgroundImage: `url(${formData.companyImage.url})` }}
                          />
                        ) : (
                          <Image 
                            src={formData.companyImage.url} 
                            alt="Company Image" 
                            fill 
                            className="object-cover"
                          />
                        )}
                        <button 
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                        <p className="absolute bottom-2 left-2 text-xs bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                          {formData.companyImage.originalName}
                        </p>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center">
                        <CloudUpload className="h-10 w-10 text-gray-400" />
                        <label 
                          htmlFor="company-image-upload"
                          className="mt-2 cursor-pointer text-center"
                        >
                          <span className="mt-2 block text-sm font-medium text-gray-700">
                            {uploadingImage ? "Uploading..." : "Click to upload company image"}
                          </span>
                          <input
                            id="company-image-upload"
                            name="company-image-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleFileUpload}
                            disabled={uploadingImage}
                          />
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pitchVideo">Pitch Video</Label>
                  <div className="mt-2">
                    {formData.pitchVideo.url ? (
                      <div className="relative w-full bg-gray-100 rounded-md overflow-hidden">
                        <video 
                          src={formData.pitchVideo.url} 
                          controls 
                          className="w-full"
                        />
                        <button 
                          type="button"
                          onClick={handleRemoveVideo}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                        <p className="absolute bottom-2 left-2 text-xs bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                          {formData.pitchVideo.originalName}
                        </p>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center">
                        <Video className="h-10 w-10 text-gray-400" />
                        <label 
                          htmlFor="pitch-video-upload"
                          className="mt-2 cursor-pointer text-center"
                        >
                          <span className="mt-2 block text-sm font-medium text-gray-700">
                            {uploadingVideo ? "Uploading..." : "Click to upload pitch video"}
                          </span>
                          <input
                            id="pitch-video-upload"
                            name="pitch-video-upload"
                            type="file"
                            accept="video/*"
                            className="sr-only"
                            onChange={handleVideoUpload}
                            disabled={uploadingVideo}
                          />
                          <p className="text-xs text-gray-500">MP4, WebM, or OGG up to 100MB</p>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="socialProof.instagramFollowers">
                    Instagram Followers
                  </Label>
                  <Input
                    id="socialProof.instagramFollowers"
                    name="socialProof.instagramFollowers"
                    type="number"
                    placeholder="Enter Instagram followers count"
                    value={formData.socialProof.instagramFollowers || ""}
                    onChange={handleNumberChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fundingInfo.currentRound">
                    Current Funding Round
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange("fundingInfo.currentRound", value)
                    }
                    defaultValue={formData.fundingInfo.currentRound}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select funding round" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pre-seed">Pre-seed</SelectItem>
                      <SelectItem value="Seed">Seed</SelectItem>
                      <SelectItem value="Series A">Series A</SelectItem>
                      <SelectItem value="Series B">Series B</SelectItem>
                      <SelectItem value="Series C">Series C</SelectItem>
                      <SelectItem value="Series D+">Series D+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fundingInfo.amountRaised">
                    Amount Raised
                  </Label>
                  <Input
                    id="fundingInfo.amountRaised"
                    name="fundingInfo.amountRaised"
                    type="number"
                    placeholder="Enter amount raised"
                    value={formData.fundingInfo.amountRaised || ""}
                    onChange={handleNumberChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fundingInfo.targetAmount">
                    Target Amount
                  </Label>
                  <Input
                    id="fundingInfo.targetAmount"
                    name="fundingInfo.targetAmount"
                    type="number"
                    placeholder="Enter target amount"
                    value={formData.fundingInfo.targetAmount || ""}
                    onChange={handleNumberChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="investorPrefs.minInvestment">
                    Minimum Investment
                  </Label>
                  <Input
                    id="investorPrefs.minInvestment"
                    name="investorPrefs.minInvestment"
                    type="number"
                    placeholder="Enter minimum investment"
                    value={formData.investorPrefs.minInvestment || ""}
                    onChange={handleNumberChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="investorPrefs.maxInvestment">
                    Maximum Investment
                  </Label>
                  <Input
                    id="investorPrefs.maxInvestment"
                    name="investorPrefs.maxInvestment"
                    type="number"
                    placeholder="Enter maximum investment"
                    value={formData.investorPrefs.maxInvestment || ""}
                    onChange={handleNumberChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="investorPrefs.preferredIndustries">
                    Preferred Industries (comma-separated)
                  </Label>
                  <Input
                    id="investorPrefs.preferredIndustries"
                    name="investorPrefs.preferredIndustries"
                    type="text"
                    placeholder="e.g., AI, Fintech, Healthcare"
                    value={formData.investorPrefs.preferredIndustries.join(
                      ", "
                    )}
                    onChange={(e) =>
                      handleArrayChange(
                        "investorPrefs.preferredIndustries",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="investorPrefs.preferredStages">
                    Preferred Stages (comma-separated)
                  </Label>
                  <Input
                    id="investorPrefs.preferredStages"
                    name="investorPrefs.preferredStages"
                    type="text"
                    placeholder="e.g., Seed, Series A, Series B"
                    value={formData.investorPrefs.preferredStages.join(", ")}
                    onChange={(e) =>
                      handleArrayChange(
                        "investorPrefs.preferredStages",
                        e.target.value
                      )
                    }
                    
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <div className="flex w-full space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-1/2"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button type="submit" className="w-1/2" disabled={loading}>
                    {loading ? "Registering..." : "Register"}
                  </Button>
                </div>
                <p className="text-sm text-center text-gray-500">
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Login
                  </Link>
                </p>
              </CardFooter>
            </form>
          </motion.div>
        ) : userType === "investor" && step === 1 ? (
          <motion.div
            key="investor-step1"
            initial="enter"
            animate="center"
            exit="exit"
            variants={slideVariants}
            transition={{ duration: 0.3 }}
            custom={1}
          >
            <form onSubmit={handleNext}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <RadioGroup
                    defaultValue={formData.userType}
                    onValueChange={handleUserTypeChange}
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
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
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
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full">
                  Next
                </Button>
                <p className="text-sm text-center text-gray-500">
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Login
                  </Link>
                </p>
              </CardFooter>
            </form>
          </motion.div>
        ) : userType === "investor" && step === 2 ? (
          <motion.div
            key="investor-step2"
            initial="enter"
            animate="center"
            exit="exit"
            variants={slideVariants}
            transition={{ duration: 0.3 }}
            custom={1}
          >
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="domain">Domain</Label>
                  <Input
                    id="domain"
                    name="domain"
                    type="text"
                    placeholder="Enter your domain"
                    value={formData.domain}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capital">Capital</Label>
                  <Input
                    id="capital"
                    name="capital"
                    type="number"
                    placeholder="Enter your capital"
                    value={formData.capital || ""}
                    onChange={handleNumberChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vision">Vision</Label>
                  <Textarea
                    id="vision"
                    name="vision"
                    placeholder="Enter your vision"
                    value={formData.vision}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expertise">Expertise (comma-separated)</Label>
                  <Input
                    id="expertise"
                    name="expertise"
                    type="text"
                    placeholder="e.g., AI, Fintech, Healthcare"
                    value={
                      Array.isArray(formData.expertise)
                        ? formData.expertise.join(", ")
                        : formData.expertise
                    }
                    onChange={(e) =>
                      handleArrayChange("expertise", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Past Funding</Label>
                  {formData.pastFunding.map((funding, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2 mt-2">
                      <Input
                        placeholder="Company Name"
                        value={funding.companyName}
                        onChange={(e) => {
                          const newPastFunding = [...formData.pastFunding];
                          newPastFunding[index].companyName = e.target.value;
                          setFormData({
                            ...formData,
                            pastFunding: newPastFunding,
                          });
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={funding.amount || ""}
                        onChange={(e) => {
                          const newPastFunding = [...formData.pastFunding];
                          newPastFunding[index].amount = Number(e.target.value);
                          setFormData({
                            ...formData,
                            pastFunding: newPastFunding,
                          });
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Year"
                        value={funding.year || ""}
                        onChange={(e) => {
                          const newPastFunding = [...formData.pastFunding];
                          newPastFunding[index].year = Number(e.target.value);
                          setFormData({
                            ...formData,
                            pastFunding: newPastFunding,
                          });
                        }}
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        pastFunding: [
                          ...formData.pastFunding,
                          {
                            companyName: "",
                            amount: 0,
                            year: new Date().getFullYear(),
                          },
                        ],
                      });
                    }}
                  >
                    Add Past Funding
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <div className="flex w-full space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-1/2"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button type="submit" className="w-1/2" disabled={loading}>
                    {loading ? "Registering..." : "Register"}
                  </Button>
                </div>
                <p className="text-sm text-center text-gray-500">
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Login
                  </Link>
                </p>
              </CardFooter>
            </form>
          </motion.div>
        ) : null}
      </Card>
    </div>
  );
}
