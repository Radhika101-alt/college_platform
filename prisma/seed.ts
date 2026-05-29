import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  await prisma.college.createMany({
    data: [
      {
        name: "IIT Delhi",
        location: "Delhi",
        fees: 250000,
        rating: 4.8,
        overview: "Top engineering college in India",
        placements: "35 LPA",
        image:
          "https://images.unsplash.com/photo-1593456081347-f60b7628567d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fElJVCUyMGRlbGhpfGVufDB8fDB8fHww"
      },

      {
        name: "VNIT Nagpur",
        location: "Nagpur",
        fees: 180000,
        rating: 4.3,
        overview: "Top NIT in central India",
        placements: "18 LPA",
        image:
          "https://images.unsplash.com/photo-1562774053-701939374585"
      }
    ]
  })

  console.log("Database seeded!")
}

main()
  .catch((e) => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })