/**
 * Static site content for the marketing surface (Session 1).
 * Courses/stats here are launch placeholders; from Session 2 the catalog
 * is fully DB-driven via the Admin panel (BUILD_SPEC §6.9, §7.1).
 */

export const SITE = {
  name: "W3Codify",
  tagline: "Learn. Build. Get Placed — with an AI mentor in your corner.",
  description:
    "W3Codify is an AI-powered online coding school. Live + self-paced cohorts, real projects, and an always-on AI tutor that explains code and answers your doubts 24/7.",
  url: "https://w3codify.com",
  madeIn: "Made in India 🇮🇳",
} as const;

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "Playground", href: "/playground" },
  { label: "About Us", href: "/about" },
] as const;

export type Course = {
  slug: string;
  title: string;
  blurb: string;
  tags: string[];
  level: "Beginner" | "Intermediate" | "Advanced";
  isLive: boolean;
  priceInr: number; // 0 = free intro
  mrpInr: number;
  rating: number;
  ratingCount: number;
  learners: number;
  instructor: string;
  image: string; // public/images/courses/* — graceful gradient fallback if absent
  accent: string;
};

export const FEATURED_COURSES: Course[] = [
  {
    slug: "machine-learning-deep-learning",
    title: "Machine Learning & Deep Learning",
    blurb:
      "Refresher → deep nets, CNNs, RNNs & Transformers → GOD tier: LLMs, fine-tuning, RAG & MLOps.",
    tags: ["GenAI", "Python", "Deep Learning"],
    level: "Advanced",
    isLive: true,
    priceInr: 24999,
    mrpInr: 49999,
    rating: 4.9,
    ratingCount: 2143,
    learners: 18420,
    instructor: "Dr. Aarav Mehta",
    image: "/images/courses/ml-dl.png",
    accent: "from-[#8b7dff] to-[#22d3ee]",
  },
  {
    slug: "cloud-computing",
    title: "Cloud Computing",
    blurb:
      "Core cloud + Linux → compute, IaC, containers & K8s → GOD tier: multi-region, serverless at scale, SRE.",
    tags: ["AWS", "Kubernetes", "DevOps"],
    level: "Advanced",
    isLive: true,
    priceInr: 21999,
    mrpInr: 42999,
    rating: 4.8,
    ratingCount: 1687,
    learners: 14210,
    instructor: "Sana Kapoor",
    image: "/images/courses/cloud.png",
    accent: "from-[#6d5ef6] to-[#22d3ee]",
  },
  {
    slug: "cyber-security",
    title: "Cyber Security",
    blurb:
      "Security fundamentals → web/app pentesting, OWASP & blue-team → GOD tier: red-team ops & exploit dev.",
    tags: ["Pentesting", "OWASP", "Blue Team"],
    level: "Advanced",
    isLive: false,
    priceInr: 19999,
    mrpInr: 38999,
    rating: 4.9,
    ratingCount: 1320,
    learners: 11030,
    instructor: "Rohan Verma",
    image: "/images/courses/cyber.png",
    accent: "from-[#8b7dff] to-[#5a4be0]",
  },
];

export const STATS = [
  { value: 600_000, suffix: "+", label: "YouTube subscribers" },
  { value: 1_000_000, suffix: "+", label: "Learners worldwide" },
  { value: 92, suffix: "%", label: "Placement rate" },
  { value: 21, prefix: "₹", suffix: " LPA", label: "Avg. package" },
] as const;

export const FEATURES = [
  {
    title: "Live cohorts",
    desc: "Learn in real time with mentors and a batch that keeps you accountable.",
    icon: "radio",
  },
  {
    title: "AI doubt-solving",
    desc: "An always-on AI tutor that explains code, fixes errors, and never sleeps.",
    icon: "sparkles",
  },
  {
    title: "Real projects",
    desc: "Build portfolio-grade products, not toy exercises — shipped and reviewed.",
    icon: "rocket",
  },
  {
    title: "Placement support",
    desc: "Mock interviews, referrals, and a placement cell that works until you're hired.",
    icon: "briefcase",
  },
  {
    title: "Community",
    desc: "A network of 1M+ learners, alumni, and hiring partners in your corner.",
    icon: "users",
  },
  {
    title: "Industry mentors",
    desc: "Learn from engineers who've built at scale — not just taught at it.",
    icon: "graduation-cap",
  },
] as const;

export const ROADMAP = [
  {
    phase: "Foundations",
    desc: "A fast refresher on the fundamentals so everyone starts strong.",
    tier: "Basics",
  },
  {
    phase: "Real Projects",
    desc: "Build and ship production-grade projects with mentor reviews.",
    tier: "Advanced",
  },
  {
    phase: "Specialization",
    desc: "Go deep in GenAI, DSA, or Full-Stack — your chosen track.",
    tier: "Advanced",
  },
  {
    phase: "Placement",
    desc: "Interviews, referrals, and GOD-tier mastery that gets you hired.",
    tier: "GOD",
  },
] as const;

export const COMPANIES = [
  "Google",
  "Amazon",
  "Microsoft",
  "Flipkart",
  "Swiggy",
  "Razorpay",
  "Zomato",
  "PhonePe",
  "Adobe",
  "Atlassian",
] as const;

export const TECH_LOGOS = [
  "HTML",
  "CSS",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "PyTorch",
  "AWS",
  "Docker",
  "Kubernetes",
] as const;

export const INSTRUCTORS = [
  {
    name: "Dr. Aarav Mehta",
    role: "AI Lead · ex-Google Brain",
    bio: "Builds LLM systems at scale. Teaches ML the way it's actually used in production.",
    image: "/images/instructors/aarav.png",
  },
  {
    name: "Sana Kapoor",
    role: "Principal SRE · ex-AWS",
    bio: "Has run multi-region infra for millions of users. Cloud, demystified.",
    image: "/images/instructors/sana.png",
  },
  {
    name: "Rohan Verma",
    role: "Red Team Lead · OSCP",
    bio: "Breaks systems for a living so you can defend them. Security, hands-on.",
    image: "/images/instructors/rohan.png",
  },
] as const;

export const TESTIMONIALS = [
  {
    quote:
      "The AI tutor caught a bug I'd been stuck on for two days at 2AM. Genuinely felt like a senior dev pair-programming with me.",
    name: "Priya S.",
    role: "SDE-1 @ Razorpay",
    rating: 5,
  },
  {
    quote:
      "Went from 'I sort of know Python' to shipping a RAG app in eight weeks. The projects are the real deal.",
    name: "Karthik R.",
    role: "ML Engineer @ Flipkart",
    rating: 5,
  },
  {
    quote:
      "Live cohorts kept me accountable and the placement cell didn't stop until I had an offer. Worth every rupee.",
    name: "Ananya G.",
    role: "Cloud Engineer @ PhonePe",
    rating: 5,
  },
  {
    quote:
      "I've taken a lot of courses. This is the first one that felt like a real school, not a playlist.",
    name: "Dev M.",
    role: "Security Analyst @ Adobe",
    rating: 5,
  },
  {
    quote:
      "The GOD tier is no joke. By the end I was doing things I see staff engineers do.",
    name: "Fatima N.",
    role: "Backend Dev @ Swiggy",
    rating: 5,
  },
] as const;

export const PRICING = [
  {
    name: "Free Intro",
    price: 0,
    cadence: "forever",
    highlight: false,
    description: "Start learning today — no card, no risk.",
    features: [
      "Foundations track for any course",
      "Community access",
      "Limited AI tutor (10 doubts/day)",
      "Self-paced lessons",
    ],
    cta: "Start free",
  },
  {
    name: "Pro Cohort",
    price: 24999,
    mrp: 49999,
    cadence: "one-time",
    highlight: true,
    description: "The full ladder: Basics → Advanced → GOD, live.",
    features: [
      "Everything in Free",
      "Live cohort + recorded lessons",
      "Unlimited AI tutor & code reviews",
      "Real projects with mentor feedback",
      "Placement support & referrals",
      "Verified certificate",
    ],
    cta: "Enroll now",
  },
  {
    name: "Career Track",
    price: 59999,
    mrp: 99999,
    cadence: "one-time",
    highlight: false,
    description: "Multiple courses + 1:1 mentorship until placed.",
    features: [
      "Everything in Pro",
      "Up to 3 courses",
      "1:1 mentorship sessions",
      "Priority placement & mock interviews",
      "Job guarantee*",
    ],
    cta: "Talk to us",
  },
] as const;

export const FAQS = [
  {
    q: "Who is W3Codify for?",
    a: "Students and early-career developers (18–28) who already know the basics and want to reach advanced, job-ready, GOD-tier mastery — with live cohorts and an AI tutor.",
  },
  {
    q: "Is there really a free option?",
    a: "Yes. The Free Intro gives you the Foundations track, community access, and a limited AI tutor — no card required. Upgrade to a paid cohort whenever you're ready.",
  },
  {
    q: "How does the AI tutor work?",
    a: "It's context-aware: it sees your current lesson and your code, then explains concepts, fixes errors step-by-step, and reviews your projects — available 24/7.",
  },
  {
    q: "Do I get a certificate?",
    a: "Paid cohorts include a verified certificate you can share on LinkedIn and with employers, plus a portfolio of real projects.",
  },
  {
    q: "What about placements?",
    a: "Paid tracks include mock interviews, referrals, and a placement cell. Our cohorts see a 92% placement rate with an average ₹21 LPA package.",
  },
  {
    q: "Can I pay in EMIs?",
    a: "Yes — paid cohorts support no-cost EMI via Razorpay. Request a callback and our team will walk you through the options.",
  },
] as const;
