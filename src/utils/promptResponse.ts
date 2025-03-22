// Mock responses for match scoring
// This file provides test data to simulate Gemini API responses

export interface MatchScores {
  visionAlignment: { score: number; reason: string };
  domainMatch: { score: number; reason: string };
  growthPotential: { score: number; reason: string };
}

// Generate a random score between min and max (inclusive)
const randomScore = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Collection of sample reasons for each category
const visionReasons = [
  "The investor's vision aligns perfectly with the startup's focus area.",
  "There's a strong thematic consistency between the investor's portfolio and this startup.",
  "The startup's domain is directly related to the investor's stated interests.",
  "While not a perfect match, there's significant overlap in vision and goals.",
  "The investor's expertise would be valuable for this startup's trajectory."
];

const domainReasons = [
  "The startup operates in a core domain of the investor's expertise.",
  "There's a moderate connection to the investor's preferred industries.",
  "The technology stack aligns with the investor's technical background.",
  "The startup addresses problems in markets familiar to the investor.",
  "The business model leverages concepts the investor has previously supported."
];

const growthReasons = [
  "The startup shows strong social proof and market traction.",
  "Current metrics suggest promising growth potential.",
  "The funding stage and amount raised indicate market validation.",
  "The target market size presents significant scaling opportunities.",
  "The startup's current trajectory suggests good ROI potential."
];

// Function to get a random reason from an array
const getRandomReason = (reasons: string[]): string => {
  return reasons[Math.floor(Math.random() * reasons.length)];
};

// Generate a mock match score for a single startup
export const generateMockMatchScore = (): MatchScores => {
  return {
    visionAlignment: {
      score: randomScore(5, 10),
      reason: getRandomReason(visionReasons)
    },
    domainMatch: {
      score: randomScore(4, 9),
      reason: getRandomReason(domainReasons)
    },
    growthPotential: {
      score: randomScore(3, 10),
      reason: getRandomReason(growthReasons)
    }
  };
};

// Sample fixed response that matches the example in the request
export const sampleMatchScore: MatchScores = {
  visionAlignment: {
    score: 10,
    reason: "The investor's vision is \"AI, Finance\" and their expertise includes \"AI\" and \"Finance\". The startup's domain is \"gemini\", which while not explicitly AI/Finance, can be interpreted as related to cryptocurrency/Fintech, aligning with the investor's focus on Finance. Furthermore, the investor has a history of funding BHIM UPI which operates in the financial technology space. This suggests a strong thematic consistency in the investor's portfolio."
  },
  domainMatch: {
    score: 7,
    reason: "Although \"gemini\" isn't a perfect match for the investor's stated \"AI\" domain, there's a plausible connection to Fintech and cryptocurrency, which falls under the broader umbrella of Finance, a key area of investor expertise and interest. We cannot definitively say it's outside their domain, hence the moderate score."
  },
  growthPotential: {
    score: 6,
    reason: "The startup has some social proof with 234 Instagram followers, which suggests some level of market traction. However, the provided information lacks key details to fully assess growth potential. While the startup is seeking seed funding and has already raised a portion of their target amount, there are no details on revenue, user growth, or any other metrics that would signal high growth potential. The 'tagline' and 'pitch video' offer very little substantive information for evaluation."
  }
};

// Collection of predefined responses for testing different scenarios
export const mockMatchScores: MatchScores[] = [
  // High match example
  {
    visionAlignment: {
      score: 9,
      reason: "The investor's focus on AI and technology perfectly aligns with this startup's AI-driven platform."
    },
    domainMatch: {
      score: 8,
      reason: "The startup operates in fintech, which is one of the investor's primary domains of expertise."
    },
    growthPotential: {
      score: 9,
      reason: "With 10,000+ users and 25% month-over-month growth, this startup shows exceptional growth potential."
    }
  },
  // Medium match example
  {
    visionAlignment: {
      score: 7,
      reason: "The investor's interest in sustainability partially aligns with this startup's eco-friendly approach."
    },
    domainMatch: {
      score: 6,
      reason: "The startup's focus on consumer products has some overlap with the investor's retail experience."
    },
    growthPotential: {
      score: 7,
      reason: "Steady growth in a competitive market indicates potential, though not explosive growth."
    }
  },
  // Low match example
  {
    visionAlignment: {
      score: 4,
      reason: "Limited alignment between the investor's tech focus and this startup's traditional business model."
    },
    domainMatch: {
      score: 3,
      reason: "The startup operates in healthcare, which is outside the investor's stated domains of expertise."
    },
    growthPotential: {
      score: 5,
      reason: "Early stage with limited traction, but addressing a growing market need."
    }
  },
  // Include the sample response from the request
  sampleMatchScore
];

// Function to get a mock response for a list of startups
export const getMockMatchScores = (count: number): MatchScores[] => {
  // If we have enough predefined responses, use them
  if (count <= mockMatchScores.length) {
    return mockMatchScores.slice(0, count);
  }
  
  // Otherwise, generate additional random responses
  const results: MatchScores[] = [...mockMatchScores];
  for (let i = mockMatchScores.length; i < count; i++) {
    results.push(generateMockMatchScore());
  }
  
  return results;
}; 