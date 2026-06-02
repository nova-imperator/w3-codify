import { getAdminLeads } from "@/server/admin/queries";
import { LeadsBoard } from "@/components/admin/leads-board";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const rows = await getAdminLeads();
  const leads = rows.map((l) => ({
    id: l.id,
    name: l.name,
    phone: l.phone,
    enquiryFor: l.enquiryFor,
    message: l.message,
    status: ["new", "contacted", "closed"].includes(l.status) ? l.status : "new",
    createdAt: l.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
  }));
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-fg-muted">
        Move leads through your pipeline: New → Contacted → Closed.
      </p>
      <LeadsBoard leads={leads} />
    </div>
  );
}
