import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create Users (Creators and Talent)
  const creator1 = await prisma.user.create({
    data: { name: "Alice Director", role: "CREATOR", bio: "Award-winning indie director." }
  });
  const creator2 = await prisma.user.create({
    data: { name: "Bob Studio", role: "CREATOR", bio: "Sci-fi and fantasy enthusiast." }
  });

  const talent1 = await prisma.user.create({
    data: { name: "Charlie Actor", role: "TALENT", bio: "Specializes in dramatic roles." }
  });
  const talent2 = await prisma.user.create({
    data: { name: "Diana Voice", role: "TALENT", bio: "Voiceover artist and singer." }
  });

  // 2. Create Talent Profiles
  const tp1 = await prisma.talentProfile.create({
    data: {
      userId: talent1.id,
      skills: ["Acting", "Stunts"],
      bio: "10 years experience in action movies.",
      consentForAIGeneration: true,
    }
  });
  const tp2 = await prisma.talentProfile.create({
    data: {
      userId: talent2.id,
      skills: ["Voiceover", "Narration"],
      bio: "Deep, resonant voice for sci-fi.",
      consentForAIGeneration: false,
    }
  });

  // 3. Create Projects
  const project1 = await prisma.project.create({
    data: {
      creatorId: creator1.id,
      title: "Neon Horizon",
      premise: "A cyberpunk detective investigates a rogue AI in Neo-Tokyo.",
      status: "PRODUCED",
      engagementScore: 1250,
    }
  });

  const project2 = await prisma.project.create({
    data: {
      creatorId: creator2.id,
      title: "The Last Oasis",
      premise: "Survivors of a desert wasteland fight over the last water source.",
      status: "PILOT",
      engagementScore: 840,
    }
  });

  const project3 = await prisma.project.create({
    data: {
      creatorId: creator1.id,
      title: "Space Truckers",
      premise: "A comedy about long-haul truckers delivering cargo across the galaxy.",
      status: "FUNDING",
      engagementScore: 300,
    }
  });

  // 4. Add Mock Media Assets (Using open source placeholder video for demo)
  const placeholderVideoUrl = "https://www.w3schools.com/html/mov_bbb.mp4"; // Big Buck Bunny placeholder
  
  await prisma.mediaAsset.createMany({
    data: [
      { projectId: project1.id, type: "VIDEO", b2Key: "mock_neon_horizon.mp4" },
      { projectId: project1.id, type: "TRAILER", b2Key: "mock_neon_trailer.mp4" },
      { projectId: project2.id, type: "VIDEO", b2Key: "mock_oasis.mp4" },
    ]
  });

  // 5. Create Casting Calls
  const call1 = await prisma.castingCall.create({
    data: {
      projectId: project3.id,
      roleName: "Captain Rex",
      description: "Gruff, seasoned captain of the space rig.",
      royaltyTerms: "2% Net Ad Revenue",
      status: "OPEN"
    }
  });

  const call2 = await prisma.castingCall.create({
    data: {
      projectId: project3.id,
      roleName: "Ship AI Voice",
      description: "Sarcastic AI companion.",
      royaltyTerms: "1% Net Ad Revenue",
      status: "OPEN"
    }
  });

  // 6. Create Casting Applications
  await prisma.castingApplication.create({
    data: {
      castingCallId: call1.id,
      talentId: tp1.id,
      status: "PENDING"
    }
  });

  await prisma.castingApplication.create({
    data: {
      castingCallId: call2.id,
      talentId: tp2.id,
      status: "PENDING"
    }
  });

  console.log("Database seeded successfully!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
