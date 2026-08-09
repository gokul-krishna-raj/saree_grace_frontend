"use client";

import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { useState } from "react";

import { OccasionFormModal } from "@/components/admin/OccasionFormModal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { getApiErrorMessage } from "@/lib/apiError";
import { toast } from "@/lib/toast";
import { useDeleteOccasionMutation, useGetOccasionsQuery } from "@/store/api/occasionsApi";
import type { Occasion } from "@/types";

function OccasionRow({ occasion, onEdit }: { occasion: Occasion; onEdit: (o: Occasion) => void }) {
  const [deleteOccasion, { isLoading: isDeleting }] = useDeleteOccasionMutation();

  async function handleDelete() {
    if (!window.confirm(`Delete "${occasion.name}"?`)) return;
    try {
      await deleteOccasion({ id: occasion._id }).unwrap();
      toast.success("Occasion deleted");
    } catch (error) {
      // The backend blocks deleting an occasion still referenced by products (409) — surface
      // that exact reason, not a generic failure.
      toast.error(
        getApiErrorMessage(
          error as FetchBaseQueryError | SerializedError,
          "Couldn't delete this occasion.",
        ),
      );
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 p-3">
      <div className="flex items-center gap-2">
        <p className="text-maroon-900 font-medium">{occasion.name}</p>
        <Badge variant={occasion.isActive ? "gold" : "outline"}>
          {occasion.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => onEdit(occasion)}>
          Edit
        </Button>
        <Button variant="ghost" onClick={handleDelete} isLoading={isDeleting} disabled={isDeleting}>
          Delete
        </Button>
      </div>
    </div>
  );
}

export default function AdminOccasionsPage() {
  const { data: occasions, isLoading } = useGetOccasionsQuery();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOccasion, setEditingOccasion] = useState<Occasion | null>(null);

  function openCreate() {
    setEditingOccasion(null);
    setModalOpen(true);
  }

  function openEdit(occasion: Occasion) {
    setEditingOccasion(occasion);
    setModalOpen(true);
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-heading text-maroon-900 text-2xl">Occasions</h1>
        <Button onClick={openCreate}>New occasion</Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : !occasions || occasions.length === 0 ? (
        <p className="text-maroon-600 text-sm">No occasions yet.</p>
      ) : (
        <div className="divide-maroon-50 border-maroon-50 flex flex-col divide-y rounded-lg border bg-white">
          {occasions.map((occasion) => (
            <OccasionRow key={occasion._id} occasion={occasion} onEdit={openEdit} />
          ))}
        </div>
      )}

      <OccasionFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editingOccasion={editingOccasion}
      />
    </div>
  );
}
