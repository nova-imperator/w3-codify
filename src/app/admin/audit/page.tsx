import { getAuditLog } from "@/server/admin/queries";
import { AuditTable } from "@/components/admin/audit-table";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; action?: string; entity?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const data = await getAuditLog({ page, action: sp.action || undefined, entity: sp.entity || undefined });

  return (
    <AuditTable
      logs={data.logs}
      total={data.total}
      page={data.page}
      pageCount={data.pageCount}
      actions={data.actions}
      entities={data.entities}
      action={sp.action ?? ""}
      entity={sp.entity ?? ""}
    />
  );
}
