import { PrismaClient, UserRole, JobType, LocationType, JobStatus, ExperienceLevel } from "../generated/prisma"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🧹 Clearing existing data...")
  
  // Clear all data in reverse order of dependencies
  await prisma.savedJob.deleteMany()
  await prisma.application.deleteMany()
  await prisma.job.deleteMany()
  await prisma.company.deleteMany()
  await prisma.user.deleteMany()
  
  console.log("🌱 Starting fresh seed...")

  // Create demo users
  const hashedPassword = await bcrypt.hash("password123", 12)

  // Individual users
  const user1 = await prisma.user.create({
    data: {
      email: "john.doe@example.com",
      password: hashedPassword,
      name: "John Doe",
      role: UserRole.USER,
      location: "San Francisco, CA",
      headline: "Full Stack Developer",
      bio: "Passionate full-stack developer with 5+ years of experience in React, Node.js, and cloud technologies.",
      skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS"],
      verified: true,
    },
  })

  const user2 = await prisma.user.create({
    data: {
      email: "jane.smith@example.com",
      password: hashedPassword,
      name: "Jane Smith",
      role: UserRole.USER,
      location: "New York, NY",
      headline: "Senior Frontend Developer",
      bio: "Creative frontend developer specializing in React and modern web technologies.",
      skills: ["React", "Vue.js", "JavaScript", "CSS", "Figma"],
      verified: true,
    },
  })

  // Company users
  const companyUser1 = await prisma.user.create({
    data: {
      email: "hr@techcorp.com",
      password: hashedPassword,
      name: "TechCorp HR",
      role: UserRole.COMPANY,
      verified: true,
    },
  })

  const companyUser2 = await prisma.user.create({
    data: {
      email: "hiring@startupxyz.com",
      password: hashedPassword,
      name: "StartupXYZ Hiring",
      role: UserRole.COMPANY,
      verified: true,
    },
  })

  console.log("✅ Users created successfully")

  // Create companies
  const company1 = await prisma.company.create({
    data: {
      name: "TechCorp",
      email: "hr@techcorp.com",
      website: "https://techcorp.com",
      description: "Leading technology company building the future of software development.",
      location: "San Francisco, CA",
      size: "201-500",
      verified: true,
      contactName: "Sarah Johnson",
      contactEmail: "sarah@techcorp.com",
      userId: companyUser1.id,
    },
  })

  const company2 = await prisma.company.create({
    data: {
      name: "StartupXYZ",
      email: "hiring@startupxyz.com",
      website: "https://startupxyz.com",
      description: "Fast-growing startup revolutionizing the fintech industry.",
      location: "Austin, TX",
      size: "11-50",
      verified: true,
      contactName: "Mike Chen",
      contactEmail: "mike@startupxyz.com",
      userId: companyUser2.id,
    },
  })

  console.log("✅ Companies created successfully")

  // Create demo jobs
  const jobs = [
    {
      title: "Senior Full Stack Developer",
      description:
        "We are looking for a Senior Full Stack Developer to join our growing team. You will be responsible for developing and maintaining web applications using modern technologies.",
      responsibilities: [
        "Develop and maintain web applications using React and Node.js",
        "Collaborate with cross-functional teams to define and implement new features",
        "Write clean, maintainable, and well-tested code",
        "Participate in code reviews and technical discussions",
        "Mentor junior developers",
      ],
      qualifications: [
        "5+ years of experience in full-stack development",
        "Strong proficiency in React, Node.js, and TypeScript",
        "Experience with PostgreSQL and Redis",
        "Knowledge of cloud platforms (AWS, GCP, or Azure)",
        "Excellent communication and teamwork skills",
      ],
      location: "San Francisco, CA",
      locationType: LocationType.HYBRID,
      jobType: JobType.FULL_TIME,
      salaryMin: 120000,
      salaryMax: 180000,
      skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS"],
      experienceLevel: ExperienceLevel.SENIOR,
      status: JobStatus.OPEN,
      featured: true,
      companyId: company1.id,
    },
    {
      title: "Frontend Developer",
      description:
        "Join our team as a Frontend Developer and help us build beautiful, responsive user interfaces that delight our customers.",
      responsibilities: [
        "Build responsive web applications using React and modern CSS",
        "Implement pixel-perfect designs from Figma mockups",
        "Optimize applications for maximum speed and scalability",
        "Collaborate with designers and backend developers",
        "Ensure cross-browser compatibility",
      ],
      qualifications: [
        "3+ years of experience in frontend development",
        "Strong proficiency in React and JavaScript/TypeScript",
        "Experience with CSS frameworks and preprocessors",
        "Knowledge of responsive design principles",
        "Attention to detail and design sensibility",
      ],
      location: "Remote",
      locationType: LocationType.REMOTE,
      jobType: JobType.FULL_TIME,
      salaryMin: 80000,
      salaryMax: 120000,
      skills: ["React", "JavaScript", "CSS", "HTML", "Figma"],
      experienceLevel: ExperienceLevel.MID,
      status: JobStatus.OPEN,
      companyId: company1.id,
    },
    {
      title: "DevOps Engineer",
      description:
        "We are seeking a DevOps Engineer to help us scale our infrastructure and improve our deployment processes.",
      responsibilities: [
        "Design and maintain CI/CD pipelines",
        "Manage cloud infrastructure on AWS",
        "Implement monitoring and alerting systems",
        "Automate deployment and scaling processes",
        "Ensure security best practices",
      ],
      qualifications: [
        "4+ years of experience in DevOps or Site Reliability Engineering",
        "Strong knowledge of AWS services",
        "Experience with Docker and Kubernetes",
        "Proficiency in Infrastructure as Code (Terraform, CloudFormation)",
        "Knowledge of monitoring tools (Prometheus, Grafana, DataDog)",
      ],
      location: "Austin, TX",
      locationType: LocationType.ONSITE,
      jobType: JobType.FULL_TIME,
      salaryMin: 100000,
      salaryMax: 150000,
      skills: ["AWS", "Docker", "Kubernetes", "Terraform", "Python"],
      experienceLevel: ExperienceLevel.SENIOR,
      status: JobStatus.OPEN,
      companyId: company2.id,
    },
    {
      title: "React Developer (Contract)",
      description: "Short-term contract position to help build a new customer dashboard using React and TypeScript.",
      responsibilities: [
        "Develop new React components for customer dashboard",
        "Integrate with existing APIs",
        "Implement responsive design",
        "Write unit tests for components",
        "Document code and components",
      ],
      qualifications: [
        "2+ years of experience with React",
        "Strong TypeScript skills",
        "Experience with testing libraries (Jest, React Testing Library)",
        "Ability to work independently",
        "Available for 3-month contract",
      ],
      location: "Remote",
      locationType: LocationType.REMOTE,
      jobType: JobType.CONTRACT,
      salaryMin: 60,
      salaryMax: 80,
      skills: ["React", "TypeScript", "Jest", "CSS"],
      experienceLevel: ExperienceLevel.MID,
      status: JobStatus.OPEN,
      companyId: company2.id,
    },
    {
      title: "Junior Software Developer",
      description:
        "Great opportunity for a junior developer to join our team and grow their skills in a supportive environment.",
      responsibilities: [
        "Assist in developing web applications",
        "Write and maintain unit tests",
        "Participate in code reviews",
        "Learn new technologies and best practices",
        "Collaborate with senior developers",
      ],
      qualifications: [
        "0-2 years of professional experience",
        "Basic knowledge of JavaScript and React",
        "Understanding of HTML and CSS",
        "Eagerness to learn and grow",
        "Good communication skills",
      ],
      location: "San Francisco, CA",
      locationType: LocationType.HYBRID,
      jobType: JobType.FULL_TIME,
      salaryMin: 70000,
      salaryMax: 90000,
      skills: ["JavaScript", "React", "HTML", "CSS"],
      experienceLevel: ExperienceLevel.ENTRY,
      status: JobStatus.OPEN,
      companyId: company1.id,
    },
  ]

  console.log("🚀 Creating jobs...")
  for (const jobData of jobs) {
    const job = await prisma.job.create({
      data: jobData,
    })
    console.log(`✅ Created job: ${job.title}`)
  }

  console.log("✅ Seed completed successfully!")
  console.log("Demo users created:")
  console.log("- john.doe@example.com (password: password123)")
  console.log("- jane.smith@example.com (password: password123)")
  console.log("- hr@techcorp.com (password: password123)")
  console.log("- hiring@startupxyz.com (password: password123)")
  console.log("")
  console.log("Demo companies created:")
  console.log("- TechCorp (San Francisco)")
  console.log("- StartupXYZ (Austin)")
  console.log("")
  console.log("Demo jobs created:")
  console.log("- Senior Full Stack Developer at TechCorp")
  console.log("- Frontend Developer at TechCorp")
  console.log("- DevOps Engineer at StartupXYZ")
  console.log("- React Developer (Contract) at StartupXYZ")
  console.log("- Junior Software Developer at TechCorp")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
