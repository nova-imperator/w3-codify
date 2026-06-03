import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";

export async function getMyProfile() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return null;

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      projects: { orderBy: { createdAt: "desc" } },
      enrollments: {
        orderBy: { createdAt: "desc" },
        include: {
          course: {
            select: { slug: true, title: true, thumbnail: true, isLive: true, priceInr: true },
          },
        },
      },
    },
  });
  return user;
}

export type MyProfile = NonNullable<Awaited<ReturnType<typeof getMyProfile>>>;
