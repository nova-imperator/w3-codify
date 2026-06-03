import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";
import { Button } from "@/components/ui/button";
import { Certificate } from "@/components/classroom/certificate";

export const metadata: Metadata = { title: "Certificate", robots: { index: false } };
export const dynamic = "force-dynamic";

type Cert = { at: string; scorePct: number };

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/auth/signin?callbackUrl=/classroom/${courseId}/certificate`);

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
  });
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { instructors: { select: { name: true, role: true } } },
  });
  if (!course) notFound();

  const progress = (enrollment?.progress ?? {}) as { certificate?: Cert | null };
  const cert = progress.certificate ?? null;

  if (!cert) {
    return (
      <div className="container-page flex min-h-[70svh] flex-col items-center justify-center gap-4 pt-28 text-center">
        <h1 className="text-2xl font-semibold">Certificate not unlocked yet</h1>
        <p className="max-w-md text-fg-muted">
          Pass the final assessment for <span className="font-medium text-fg">{course.title}</span> to unlock your
          certificate of completion.
        </p>
        <Button asChild>
          <Link href={`/classroom/${courseId}`}>
            <ArrowLeft className="size-4" /> Back to the course
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-page py-10 pt-24">
      <div className="mb-6 flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/classroom/${courseId}`}>
            <ArrowLeft className="size-4" /> Back to the course
          </Link>
        </Button>
      </div>
      <Certificate
        studentName={user.name ?? "W3Codify Learner"}
        courseTitle={course.title}
        instructor={course.instructors[0]?.name ?? "W3Codify"}
        scorePct={cert.scorePct}
        dateISO={cert.at}
        certId={`W3C-${courseId.slice(-6).toUpperCase()}-${(user.id ?? "").slice(-4).toUpperCase()}`}
      />
    </div>
  );
}
