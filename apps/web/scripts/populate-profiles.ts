/**
 * One-time script to populate profiles for existing users
 * Run with: npx tsx scripts/populate-profiles.ts
 *
 * Install tsx if needed: npm install -D tsx
 */

import { prisma } from "../lib/prisma";

async function populateProfiles() {
  try {
    console.log("🔍 Finding users without profiles...");

    // Find all users without profiles
    const usersWithoutProfiles = await prisma.users.findMany({
      where: {
        profiles: null,
        deleted_at: null,
        is_anonymous: false,
      },
      select: {
        id: true,
        email: true,
        raw_user_meta_data: true,
      },
    });

    console.log(`📊 Found ${usersWithoutProfiles.length} users without profiles`);

    if (usersWithoutProfiles.length === 0) {
      console.log("✅ All users already have profiles!");
      return;
    }

    console.log("🚀 Creating profiles...");

    let successCount = 0;
    let errorCount = 0;

    for (const user of usersWithoutProfiles) {
      try {
        // Extract name from metadata (works for OAuth users)
        const metadata = user.raw_user_meta_data as any;
        const fullName =
          metadata?.full_name ||
          metadata?.name ||
          user.email?.split("@")[0] || // Use email username as fallback
          null;

        await prisma.profiles.create({
          data: {
            user_id: user.id,
            full_name: fullName,
          },
        });

        successCount++;
        console.log(`  ✓ Created profile for user: ${user.email}`);
      } catch (error: any) {
        errorCount++;
        console.error(`  ✗ Failed to create profile for ${user.email}:`, error.message);
      }
    }

    console.log("\n📈 Summary:");
    console.log(`  ✅ Successfully created: ${successCount} profiles`);
    if (errorCount > 0) {
      console.log(`  ❌ Failed: ${errorCount} profiles`);
    }
    console.log("✨ Done!");
  } catch (error) {
    console.error("❌ Error populating profiles:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
populateProfiles();
