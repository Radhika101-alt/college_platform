import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const DB_UNAVAILABLE_MESSAGE =
  "Database is temporarily unavailable. Please try again in a minute."

function isDbUnavailableError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false

  const name = "name" in error ? String((error as { name?: unknown }).name) : ""
  const message =
    "message" in error ? String((error as { message?: unknown }).message) : ""
  const code =
    "code" in error ? String((error as { code?: unknown }).code) : ""
  const errorCode =
    "errorCode" in error
      ? String((error as { errorCode?: unknown }).errorCode)
      : ""

  if (name === "PrismaClientInitializationError") return true
  if (code === "P1001" || code === "P1002") return true
  if (errorCode === "P1001" || errorCode === "P1002") return true

  const lowered = message.toLowerCase()
  return (
    lowered.includes("can't reach database server") ||
    lowered.includes("cannot reach database server") ||
    lowered.includes("connection refused") ||
    lowered.includes("timeout")
  )
}

const seedDbTimeoutMs = Math.max(
  1000,
  Number(process.env.SEED_DB_TIMEOUT_MS ?? 30000)
)

const failFastTimer = setTimeout(() => {
  console.error(DB_UNAVAILABLE_MESSAGE)
  console.error(
    `Seed timed out after ${seedDbTimeoutMs}ms while trying to connect to the database.`
  )
  process.exit(1)
}, seedDbTimeoutMs)

async function main() {
  const existingCount = await prisma.college.count()

  if (existingCount < 40) {
    const locations = [
      "Delhi",
      "Mumbai",
      "Bengaluru",
      "Hyderabad",
      "Chennai",
      "Pune",
      "Kolkata",
      "Ahmedabad",
      "Jaipur",
      "Nagpur",
      "Indore",
      "Lucknow",
      "Chandigarh",
      "Bhopal",
      "Surat",
    ]

    const baseColleges = [
      { name: "IIT Delhi", location: "Delhi", rating: 4.8 },
      { name: "IIT Bombay", location: "Mumbai", rating: 4.8 },
      { name: "IIT Madras", location: "Chennai", rating: 4.8 },
      { name: "IIT Kanpur", location: "Kanpur", rating: 4.7 },
      { name: "IIT Kharagpur", location: "Kharagpur", rating: 4.7 },
      { name: "NIT Trichy", location: "Tiruchirappalli", rating: 4.6 },
      { name: "NIT Surathkal", location: "Mangalore", rating: 4.6 },
      { name: "VNIT Nagpur", location: "Nagpur", rating: 4.3 },
    ]

    const needed = 40 - existingCount
    const generated: Array<{
      name: string
      location: string
      fees: number
      rating: number
      overview: string
      placements: string
      image: string
    }> = []

    for (const c of baseColleges) {
      generated.push({
        name: c.name,
        location: c.location,
        fees: 240000,
        rating: c.rating,
        overview:
          "Strong academics, active campus life, and diverse student community.",
        placements: "20–35 LPA",
        image:
          "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop&q=60",
      })
    }

    for (let i = 0; i < Math.max(0, needed); i++) {
      const location = locations[i % locations.length]
      const fees = 120000 + (i % 10) * 15000
      const rating = 3.8 + (i % 10) * 0.1
      generated.push({
        name: `National Institute of Technology ${location} ${i + 1}`,
        location,
        fees,
        rating: Math.round(rating * 10) / 10,
        overview:
          "Known for modern curriculum, industry exposure, and strong peer network.",
        placements: "10–22 LPA",
        image:
          "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=60",
      })
    }

    await prisma.college.createMany({
      data: generated.slice(0, baseColleges.length + needed),
    })
  }

  const demoEmail = "demo@collegeplatform.com"
  const demoPasswordHash = await bcrypt.hash("password123", 10)
  const demoUser = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {},
    create: {
      email: demoEmail,
      name: "Demo User",
      passwordHash: demoPasswordHash,
    },
  })

  const secondEmail = "student2@collegeplatform.com"
  const secondUser = await prisma.user.upsert({
    where: { email: secondEmail },
    update: {},
    create: {
      email: secondEmail,
      name: "Student Two",
      passwordHash: await bcrypt.hash("password123", 10),
    },
  })

  const colleges = await prisma.college.findMany({
    select: { id: true, name: true, fees: true, rating: true },
  })

  const year = new Date().getFullYear()
  const exam = "JEE"
  const categories = ["General", "OBC", "SC", "ST"]
  const categoryOffsets: Record<string, number> = {
    General: 0,
    OBC: -4,
    SC: -10,
    ST: -12,
  }

  for (const c of colleges) {
    const existingCourses = await prisma.course.count({
      where: { collegeId: c.id },
    })
    if (existingCourses === 0) {
      const baseFee = Math.max(60000, Math.floor(c.fees / 4))
      await prisma.course.createMany({
        data: [
          {
            collegeId: c.id,
            name: "Computer Science and Engineering",
            level: "B.Tech",
            duration: "4 years",
            totalFees: baseFee * 4,
          },
          {
            collegeId: c.id,
            name: "Electronics and Communication Engineering",
            level: "B.Tech",
            duration: "4 years",
            totalFees: baseFee * 4,
          },
          {
            collegeId: c.id,
            name: "Business Administration",
            level: "MBA",
            duration: "2 years",
            totalFees: baseFee * 3,
          },
        ],
      })
    }

    const courses = await prisma.course.findMany({
      where: { collegeId: c.id },
      select: { id: true },
    })

    const baseMinScore = Math.round(
      Math.min(95, Math.max(40, 20 + (c.rating ?? 4.0) * 12))
    )

    for (const course of courses) {
      for (const category of categories) {
        const minScore = Math.max(0, Math.min(100, baseMinScore + (categoryOffsets[category] ?? 0)))
        await prisma.admissionCutoff.upsert({
          where: {
            courseId_exam_category_year: {
              courseId: course.id,
              exam,
              category,
              year,
            },
          },
          update: { minScore },
          create: {
            courseId: course.id,
            exam,
            category,
            year,
            minScore,
          },
        })
      }
    }

    const existingReview = await prisma.review.findUnique({
      where: {
        userId_collegeId: {
          userId: demoUser.id,
          collegeId: c.id,
        },
      },
    })

    if (!existingReview) {
      await prisma.review.create({
        data: {
          userId: demoUser.id,
          collegeId: c.id,
          rating: 4,
          title: "Strong academics and peers",
          body:
            "Faculty is supportive and the peer group is motivating. Placements are competitive, and there are many clubs for overall growth. Hostel and mess experience can vary by year.",
        },
      })
    }

    const existingThread = await prisma.discussionThread.findFirst({
      where: {
        collegeId: c.id,
        title: "How are placements and internships?",
      },
      select: { id: true },
    })

    const thread =
      existingThread ??
      (await prisma.discussionThread.create({
        data: {
          collegeId: c.id,
          userId: demoUser.id,
          title: "How are placements and internships?",
          body:
            "I’m considering this college. How are placements for top branches and what’s the internship scene like? Any tips for first-year students?",
        },
        select: { id: true },
      }))

    const existingReply = await prisma.discussionReply.findFirst({
      where: {
        threadId: thread.id,
        userId: secondUser.id,
      },
      select: { id: true },
    })

    if (!existingReply) {
      await prisma.discussionReply.create({
        data: {
          threadId: thread.id,
          userId: secondUser.id,
          body:
            "Placements are decent if you maintain a strong CGPA and build projects early. For internships, start DSA + one solid development track and apply consistently in 2nd/3rd year.",
        },
      })
    }
  }

  console.log(
    `Database seeded! Colleges: ${colleges.length}, Demo users: ${demoEmail}, ${secondEmail}`
  )
}

main()
  .catch((e) => {
    if (isDbUnavailableError(e)) {
      console.error(DB_UNAVAILABLE_MESSAGE)
      console.error(
        "Seed aborted because the database is unreachable (check DATABASE_URL / Neon status)."
      )
    } else {
      console.error(e)
    }
    process.exitCode = 1
  })
  .finally(async () => {
    clearTimeout(failFastTimer)
    await prisma.$disconnect()
  })