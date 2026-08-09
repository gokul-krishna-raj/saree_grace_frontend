export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-maroon-50 rounded-lg border bg-white p-4">
      <p className="text-maroon-600 text-sm">{label}</p>
      <p className="font-heading text-maroon-900 mt-1 text-2xl">{value}</p>
    </div>
  );
}
