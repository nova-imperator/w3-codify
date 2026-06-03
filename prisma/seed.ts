/**
 * Seed the 3 launch courses (BUILD_SPEC §7.1) with instructors + curriculum.
 * Idempotent: courses upsert by slug; instructors upsert by fixed id;
 * a course's sections are rebuilt each run (cascade clears old lessons).
 */
import { PrismaClient, Level, CourseStatus } from "@prisma/client";

const prisma = new PrismaClient();

type LessonSeed = { title: string; min: number; free?: boolean };
type SectionSeed = { title: string; lessons: LessonSeed[] };
type CourseSeed = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  thumbnail: string;
  tags: string[];
  level: Level;
  isLive: boolean;
  priceInr: number;
  mrpInr: number;
  rating: number;
  ratingCount: number;
  learners: number;
  outcomes: string[];
  requirements: string[];
  instructorId: string;
  sections: SectionSeed[];
};

const INSTRUCTORS = [
  {
    id: "inst_aarav",
    name: "Dr. Aarav Mehta",
    role: "AI Lead · ex-Google Brain",
    bio: "Builds LLM systems at scale. Teaches ML the way it's actually used in production.",
    photo: "/images/instructors/aarav.png",
    socials: { linkedin: "#", twitter: "#" },
  },
  {
    id: "inst_sana",
    name: "Sana Kapoor",
    role: "Principal SRE · ex-AWS",
    bio: "Has run multi-region infra for millions of users. Cloud, demystified.",
    photo: "/images/instructors/sana.png",
    socials: { linkedin: "#", twitter: "#" },
  },
  {
    id: "inst_rohan",
    name: "Rohan Verma",
    role: "Red Team Lead · OSCP",
    bio: "Breaks systems for a living so you can defend them. Security, hands-on.",
    photo: "/images/instructors/rohan.png",
    socials: { linkedin: "#", twitter: "#" },
  },
];

const COURSES: CourseSeed[] = [
  {
    id: "course_ml",
    slug: "machine-learning-deep-learning",
    title: "Machine Learning & Deep Learning",
    subtitle: "From a fast refresher to LLMs, fine-tuning, RAG & MLOps.",
    description:
      "Go from solid fundamentals to research-grade, production-ready ML. A quick refresher on the math and sklearn, then deep into neural networks, CNNs, RNNs and Transformers — finishing at GOD tier with LLMs, fine-tuning, RAG pipelines, and MLOps. Built for people who already know the basics and want real mastery.",
    thumbnail: "/images/courses/ml-dl.png",
    tags: ["GenAI", "Python", "Deep Learning"],
    level: Level.ADVANCED,
    isLive: true,
    priceInr: 0, // Launch offer — free for now (real price re-activates paid + Razorpay)
    mrpInr: 49999,
    rating: 4.9,
    ratingCount: 2143,
    learners: 18420,
    outcomes: [
      "Build and train deep neural networks from scratch",
      "Implement CNNs, RNNs and Transformer architectures",
      "Fine-tune LLMs and build production RAG pipelines",
      "Ship models with a real MLOps workflow",
      "Read and reproduce modern ML research papers",
      "Deploy and monitor models at scale",
    ],
    requirements: [
      "Comfortable with Python and basic programming",
      "High-school level math (we refresh the rest)",
      "A laptop with internet — no GPU required to start",
    ],
    instructorId: "inst_aarav",
    sections: [
      {
        title: "Overview",
        lessons: [
          { title: "How this course works", min: 6, free: true },
          { title: "Your learning roadmap: Basics → Advanced → GOD", min: 9, free: true },
        ],
      },
      {
        title: "Basics Refresher",
        lessons: [
          { title: "ML intuition & the math you actually need", min: 22 },
          { title: "NumPy, pandas & scikit-learn in practice", min: 28 },
          { title: "Your first model: train, evaluate, iterate", min: 24 },
        ],
      },
      {
        title: "Advanced — Deep Learning",
        lessons: [
          { title: "Neural networks & backpropagation", min: 34 },
          { title: "CNNs for computer vision", min: 31 },
          { title: "RNNs, LSTMs & sequence modeling", min: 29 },
          { title: "Transformers & attention", min: 38 },
          { title: "Training at scale: tricks that matter", min: 26 },
        ],
      },
      {
        title: "GOD Tier — LLMs & MLOps",
        lessons: [
          { title: "Fine-tuning LLMs (LoRA / QLoRA)", min: 42 },
          { title: "Retrieval-Augmented Generation (RAG)", min: 40 },
          { title: "Evaluation, guardrails & safety", min: 30 },
          { title: "MLOps: serving, monitoring, CI/CD", min: 36 },
          { title: "Capstone: a research-grade project", min: 48 },
        ],
      },
    ],
  },
  {
    id: "course_cloud",
    slug: "cloud-computing",
    title: "Cloud Computing",
    subtitle: "Core cloud to multi-region architecture, K8s & SRE.",
    description:
      "Master the cloud the way senior engineers use it. Start with core cloud, Linux and networking, move through compute, storage, databases, IaC, containers and Kubernetes, then reach GOD tier: multi-region architecture, serverless at scale, cost & security, and SRE practices that keep systems alive.",
    thumbnail: "/images/courses/cloud.png",
    tags: ["AWS", "Kubernetes", "DevOps"],
    level: Level.ADVANCED,
    isLive: true,
    priceInr: 0, // Launch offer — free for now
    mrpInr: 42999,
    rating: 4.8,
    ratingCount: 1687,
    learners: 14210,
    outcomes: [
      "Design resilient, multi-region cloud architectures",
      "Run containers in production with Kubernetes",
      "Automate everything with Infrastructure as Code",
      "Build serverless systems that scale to zero and to millions",
      "Apply SRE practices: SLOs, observability, on-call",
      "Optimize for cost and security from day one",
    ],
    requirements: [
      "Basic Linux and command-line comfort",
      "Understanding of how the web works (HTTP, DNS)",
      "A free-tier cloud account (we'll guide setup)",
    ],
    instructorId: "inst_sana",
    sections: [
      {
        title: "Overview",
        lessons: [
          { title: "What modern cloud really looks like", min: 7, free: true },
          { title: "Course roadmap & lab setup", min: 11, free: true },
        ],
      },
      {
        title: "Basics Refresher",
        lessons: [
          { title: "Cloud building blocks & the shared model", min: 21 },
          { title: "Linux & networking essentials", min: 26 },
        ],
      },
      {
        title: "Advanced — Build & Operate",
        lessons: [
          { title: "Compute, storage & managed databases", min: 33 },
          { title: "Infrastructure as Code (Terraform)", min: 35 },
          { title: "Containers & Docker deep dive", min: 30 },
          { title: "Kubernetes in production", min: 44 },
          { title: "CI/CD pipelines that don't break", min: 28 },
        ],
      },
      {
        title: "GOD Tier — Scale & Reliability",
        lessons: [
          { title: "Multi-region & high availability", min: 39 },
          { title: "Serverless at scale", min: 34 },
          { title: "Cost & security engineering", min: 31 },
          { title: "SRE: SLOs, observability & on-call", min: 37 },
          { title: "Capstone: a production-grade platform", min: 46 },
        ],
      },
    ],
  },
  {
    id: "course_cyber",
    slug: "cyber-security",
    title: "Cyber Security",
    subtitle: "Security fundamentals to red-team ops & exploit dev.",
    description:
      "Learn to defend by learning to attack. From security fundamentals and networking, through web/app pentesting, OWASP and blue-team tooling, all the way to GOD tier: red-team operations, exploit development, cloud & application security, and threat hunting. Hands-on, real-world, and ethical throughout.",
    thumbnail: "/images/courses/cyber.png",
    tags: ["Pentesting", "OWASP", "Blue Team"],
    level: Level.ADVANCED,
    isLive: false,
    priceInr: 0, // Launch offer — free for now
    mrpInr: 38999,
    rating: 4.9,
    ratingCount: 1320,
    learners: 11030,
    outcomes: [
      "Find and exploit common web vulnerabilities (OWASP Top 10)",
      "Run a full pentest workflow end-to-end",
      "Build blue-team detection and response skills",
      "Develop basic exploits and understand memory safety",
      "Secure cloud and application environments",
      "Hunt threats and respond to real incidents",
    ],
    requirements: [
      "Comfort with the command line and basic networking",
      "Curiosity and an ethical, lawful mindset",
      "A machine that can run a VM lab",
    ],
    instructorId: "inst_rohan",
    sections: [
      {
        title: "Overview",
        lessons: [
          { title: "Ethics, scope & how to learn safely", min: 8, free: true },
          { title: "Roadmap & building your lab", min: 12, free: true },
        ],
      },
      {
        title: "Basics Refresher",
        lessons: [
          { title: "Security fundamentals & threat models", min: 23 },
          { title: "Networking for hackers", min: 27 },
        ],
      },
      {
        title: "Advanced — Offense & Defense",
        lessons: [
          { title: "Web app pentesting & OWASP Top 10", min: 40 },
          { title: "Tooling: Burp, nmap, Metasploit", min: 32 },
          { title: "SQL injection, XSS & auth attacks", min: 36 },
          { title: "Blue-team: logging, detection, SIEM", min: 30 },
        ],
      },
      {
        title: "GOD Tier — Red Team & Beyond",
        lessons: [
          { title: "Red-team operations & C2 basics", min: 41 },
          { title: "Intro to exploit development", min: 45 },
          { title: "Cloud & AppSec", min: 33 },
          { title: "Threat hunting & incident response", min: 35 },
          { title: "Capstone: a full engagement report", min: 44 },
        ],
      },
    ],
  },
];

async function main() {
  for (const i of INSTRUCTORS) {
    await prisma.instructor.upsert({
      where: { id: i.id },
      update: { name: i.name, role: i.role, bio: i.bio, photo: i.photo, socials: i.socials },
      create: i,
    });
  }

  for (const c of COURSES) {
    const { sections, instructorId, ...scalar } = c;
    const data = {
      ...scalar,
      status: CourseStatus.PUBLISHED,
      instructors: { connect: [{ id: instructorId }] },
    };
    const course = await prisma.course.upsert({
      where: { slug: c.slug },
      update: data,
      create: data,
    });

    // Rebuild curriculum (cascade removes old lessons/blocks).
    await prisma.section.deleteMany({ where: { courseId: course.id } });
    for (const [si, s] of sections.entries()) {
      await prisma.section.create({
        data: {
          courseId: course.id,
          title: s.title,
          order: si,
          lessons: {
            create: s.lessons.map((l, li) => ({
              title: l.title,
              durationSec: l.min * 60,
              isFreePreview: l.free ?? false,
              order: li,
            })),
          },
        },
      });
    }
    console.log(`seeded: ${c.title} (${sections.length} sections)`);
  }

  await seedAdminAndDemo();
  console.log("✓ seed complete");
}

// Admin account + demo students/enrollments/leads so the panel is populated.
async function seedAdminAndDemo() {
  const admin = await prisma.user.upsert({
    where: { phone: "9000000001" },
    update: { role: "ADMIN", firstName: "Brad", lastName: "Forbes", phoneVerified: true },
    create: {
      phone: "9000000001",
      firstName: "Brad",
      lastName: "Forbes",
      email: "bradforbes24@hotmail.com",
      role: "ADMIN",
      phoneVerified: true,
    },
  });
  console.log(`admin ready: ${admin.phone} (${admin.role})`);

  const demoStudents = [
    { phone: "9810000001", firstName: "Priya", lastName: "Sharma", email: "priya.demo@w3codify.com", slug: "machine-learning-deep-learning" },
    { phone: "9810000002", firstName: "Karthik", lastName: "R", email: "karthik.demo@w3codify.com", slug: "cloud-computing" },
    { phone: "9810000003", firstName: "Ananya", lastName: "Gupta", email: "ananya.demo@w3codify.com", slug: "cyber-security" },
    { phone: "9810000004", firstName: "Dev", lastName: "Mehra", email: "dev.demo@w3codify.com", slug: "machine-learning-deep-learning" },
  ];
  for (const s of demoStudents) {
    const user = await prisma.user.upsert({
      where: { phone: s.phone },
      update: { firstName: s.firstName, lastName: s.lastName },
      create: {
        phone: s.phone,
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.email,
        phoneVerified: true,
        role: "STUDENT",
      },
    });
    const course = await prisma.course.findUnique({ where: { slug: s.slug } });
    if (course) {
      await prisma.enrollment.upsert({
        where: { userId_courseId: { userId: user.id, courseId: course.id } },
        update: {},
        create: {
          userId: user.id,
          courseId: course.id,
          type: course.priceInr > 0 ? "PAID" : "FREE",
        },
      });
    }
  }
  console.log(`demo students: ${demoStudents.length}`);

  const demoLeads = [
    { id: "lead_demo_1", name: "Rahul Nair", phone: "9820011111", enquiryFor: "Online Course (Website)", message: "Interested in the ML cohort — when's the next batch?", status: "new" },
    { id: "lead_demo_2", name: "Meera Iyer", phone: "9820022222", enquiryFor: "Online Course (Website)", message: "Do you offer EMI for the Career Track?", status: "contacted" },
    { id: "lead_demo_3", name: "Sahil Kapoor", phone: "9820033333", enquiryFor: "Offline Course", message: "Looking for weekend batches in Mumbai.", status: "new" },
    { id: "lead_demo_4", name: "Tanvi Desai", phone: "9820044444", enquiryFor: "Online Course (Website)", message: "Enrolled — thanks for the quick callback!", status: "closed" },
  ];
  for (const l of demoLeads) {
    await prisma.callbackLead.upsert({
      where: { id: l.id },
      update: { status: l.status },
      create: l,
    });
  }
  console.log(`demo leads: ${demoLeads.length}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
