import Footer from "@/components/Footer";
import { StartupsReel } from "@/components/StartupsReel";
import React from "react";

const page = () => {
  return (
    <>
    <div className="h-screen bg-background snap-y snap-mandatory overflow-y-scroll scrollbar-hide flex flex-col items-center justify-center mb-12">
      <h1 className="text-4xl font-bold text-center pt-8 pb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
        Investment Reels
      </h1>
      <StartupsReel />
    </div>
    <Footer />
    </>
  );
};

export default page;
