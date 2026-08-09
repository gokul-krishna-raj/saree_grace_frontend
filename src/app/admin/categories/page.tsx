"use client";

import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { useState } from "react";

import { CategoryFormModal } from "@/components/admin/CategoryFormModal";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { getApiErrorMessage } from "@/lib/apiError";
import { toast } from "@/lib/toast";
import { useDeleteCategoryMutation, useGetCategoryTreeQuery } from "@/store/api/categoriesApi";
import type { Category, CategoryTreeNode } from "@/types";

function CategoryRow({
  node,
  depth,
  onEdit,
}: {
  node: CategoryTreeNode;
  depth: number;
  onEdit: (category: Category) => void;
}) {
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  async function handleDelete() {
    if (!window.confirm(`Delete "${node.category.name}"?`)) return;
    try {
      await deleteCategory({ id: node.category._id }).unwrap();
    } catch (error) {
      // The backend blocks deleting a category that still has products or subcategories
      // (409) rather than cascading — surface that exact reason, not a generic failure.
      toast.error(
        getApiErrorMessage(
          error as FetchBaseQueryError | SerializedError,
          "Couldn't delete this category.",
        ),
      );
    }
  }

  return (
    <>
      <div
        className="border-maroon-50 flex items-center justify-between border-b py-2"
        style={{ paddingLeft: depth * 20 }}
      >
        <span className="text-maroon-900">{node.category.name}</span>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => onEdit(node.category)}>
            Edit
          </Button>
          <Button
            variant="ghost"
            onClick={handleDelete}
            isLoading={isDeleting}
            disabled={isDeleting}
          >
            Delete
          </Button>
        </div>
      </div>
      {node.children.map((child) => (
        <CategoryRow key={child.category._id} node={child} depth={depth + 1} onEdit={onEdit} />
      ))}
    </>
  );
}

export default function AdminCategoriesPage() {
  const { data: tree, isLoading } = useGetCategoryTreeQuery();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  function openCreate() {
    setEditingCategory(null);
    setModalOpen(true);
  }

  function openEdit(category: Category) {
    setEditingCategory(category);
    setModalOpen(true);
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-heading text-maroon-900 text-2xl">Categories</h1>
        <Button onClick={openCreate}>New category</Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : !tree || tree.length === 0 ? (
        <p className="text-maroon-600 text-sm">No categories yet.</p>
      ) : (
        <div className="border-maroon-50 rounded-lg border bg-white p-3">
          {tree.map((node) => (
            <CategoryRow key={node.category._id} node={node} depth={0} onEdit={openEdit} />
          ))}
        </div>
      )}

      <CategoryFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editingCategory={editingCategory}
      />
    </div>
  );
}
