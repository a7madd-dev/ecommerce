"use client";

import { useState } from "react";
import { Product, Category } from "@/types";
import { createProduct, updateProduct, createCategory } from "@/app/actions/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  categories: Category[];
  product?: Product;
}

export function ProductFormModal({ categories, product }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newCatOpen, setNewCatOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  const isEdit = !!product;

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = isEdit
      ? await updateProduct(product.id, formData)
      : await createProduct(formData);

    if ("error" in result) {
      const err = result.error as Record<string, string[]> | string;
      const errorMsg =
        typeof err === "string" ? err : Object.values(err).flat().join(", ");
      toast.error(errorMsg);
    } else {
      toast.success(isEdit ? "Product updated" : "Product created");
      setOpen(false);
    }
    setLoading(false);
  }

  async function handleNewCategory() {
    if (!newCatName.trim()) return;
    const fd = new FormData();
    fd.set("name", newCatName.trim());
    const result = await createCategory(fd);
    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : "Failed");
    } else {
      toast.success("Category created");
      setNewCatName("");
      setNewCatOpen(false);
    }
  }

  return (
    <>
      {isEdit ? (
        <Button variant="ghost" size="icon-xs" onClick={() => setOpen(true)}>
          <Pencil className="size-4" />
        </Button>
      ) : (
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-4 mr-1" />
          Add Product
        </Button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto border">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">
                {isEdit ? "Edit Product" : "New Product"}
              </h2>
              <Button variant="ghost" size="icon-xs" onClick={() => setOpen(false)}>
                <X className="size-5" />
              </Button>
            </div>
            <form action={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Name</label>
                <Input name="name" defaultValue={product?.name} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  defaultValue={product?.description}
                  required
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Price</label>
                  <Input
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={product?.price}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Compare at Price</label>
                  <Input
                    name="compare_at_price"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={product?.compare_at_price ?? ""}
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Stock</label>
                <Input
                  name="stock"
                  type="number"
                  min="0"
                  defaultValue={product?.stock}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Image URL</label>
                <Input
                  name="image_url"
                  type="url"
                  defaultValue={product?.image_url}
                  placeholder="https://... (leave empty for fallback)"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Category</label>
                <div className="flex gap-2">
                  <select
                    name="category_id"
                    defaultValue={product?.category_id}
                    required
                    className="flex-1 px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                  >
                    <option value="">Select...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    size="default"
                    onClick={() => setNewCatOpen(!newCatOpen)}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              </div>

              {newCatOpen && (
                <div className="flex gap-2">
                  <Input
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="New category name"
                  />
                  <Button type="button" variant="secondary" onClick={handleNewCategory}>
                    Add
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_active"
                  value="true"
                  defaultChecked={product?.is_active !== false}
                  className="rounded"
                />
                <label className="text-sm">Active (visible to customers)</label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      Saving...
                    </span>
                  ) : isEdit ? (
                    "Update"
                  ) : (
                    "Create"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
