"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Product, CustomField } from "@/types";

export function AdminProductsClient({ products: initialProducts }: { products: Product[] }) {
  const [products] = useState(initialProducts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    compareAtPrice: "",
    category: "",
    stock: "",
    imageUrls: [""],
    variants: [] as { name: string; type: string; options: string }[],
    customFields: [] as CustomField[],
  });

  const addImageUrl = () =>
    setForm({ ...form, imageUrls: [...form.imageUrls, ""] });

  const removeImageUrl = (i: number) =>
    setForm({
      ...form,
      imageUrls: form.imageUrls.filter((_, idx) => idx !== i),
    });

  const updateImageUrl = (i: number, val: string) => {
    const urls = [...form.imageUrls];
    urls[i] = val;
    setForm({ ...form, imageUrls: urls });
  };

  const addVariant = () =>
    setForm({
      ...form,
      variants: [...form.variants, { name: "", type: "size", options: "" }],
    });

  const removeVariant = (i: number) =>
    setForm({
      ...form,
      variants: form.variants.filter((_, idx) => idx !== i),
    });

  const addCustomField = () =>
    setForm({
      ...form,
      customFields: [
        ...form.customFields,
        { id: `cf-${Date.now()}`, label: "", type: "text", required: false },
      ],
    });

  const removeCustomField = (i: number) =>
    setForm({
      ...form,
      customFields: form.customFields.filter((_, idx) => idx !== i),
    });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your product catalog
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl gap-2">
              <Plus className="size-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-5 mt-4">
              <div>
                <label className="text-sm font-medium">Product Name</label>
                <Input
                  className="mt-1.5"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Premium Wireless Earbuds"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  className="mt-1.5 w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Product description..."
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Price</label>
                  <Input
                    type="number"
                    className="mt-1.5"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="99.99"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Compare at Price</label>
                  <Input
                    type="number"
                    className="mt-1.5"
                    value={form.compareAtPrice}
                    onChange={(e) =>
                      setForm({ ...form, compareAtPrice: e.target.value })
                    }
                    placeholder="129.99"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Stock</label>
                  <Input
                    type="number"
                    className="mt-1.5"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    placeholder="100"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <select
                  className="mt-1.5 w-full h-9 rounded-md border bg-background px-3 text-sm"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                >
                  <option value="">Select category</option>
                  <option>Electronics</option>
                  <option>Clothing</option>
                  <option>Accessories</option>
                  <option>Home & Garden</option>
                  <option>Sports</option>
                </select>
              </div>

              {/* Images */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Image URLs</label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={addImageUrl}
                  >
                    <Plus className="size-3 mr-1" /> Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {form.imageUrls.map((url, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        value={url}
                        onChange={(e) => updateImageUrl(i, e.target.value)}
                        placeholder="https://..."
                      />
                      {form.imageUrls.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeImageUrl(i)}
                        >
                          <X className="size-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Variants */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Variants</label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={addVariant}
                  >
                    <Plus className="size-3 mr-1" /> Add Variant
                  </Button>
                </div>
                <div className="space-y-3">
                  {form.variants.map((variant, i) => (
                    <div key={i} className="flex gap-2 items-start p-3 bg-muted/50 rounded-xl">
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <Input
                          placeholder="Name (e.g., Size)"
                          value={variant.name}
                          onChange={(e) => {
                            const v = [...form.variants];
                            v[i].name = e.target.value;
                            setForm({ ...form, variants: v });
                          }}
                        />
                        <select
                          className="h-9 rounded-md border bg-background px-3 text-sm"
                          value={variant.type}
                          onChange={(e) => {
                            const v = [...form.variants];
                            v[i].type = e.target.value;
                            setForm({ ...form, variants: v });
                          }}
                        >
                          <option value="size">Size</option>
                          <option value="color">Color</option>
                        </select>
                        <Input
                          placeholder="S, M, L, XL"
                          value={variant.options}
                          onChange={(e) => {
                            const v = [...form.variants];
                            v[i].options = e.target.value;
                            setForm({ ...form, variants: v });
                          }}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => removeVariant(i)}
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Fields */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Custom Fields</label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={addCustomField}
                  >
                    <Plus className="size-3 mr-1" /> Add Field
                  </Button>
                </div>
                <div className="space-y-3">
                  {form.customFields.map((field, i) => (
                    <div key={field.id} className="flex gap-2 items-center p-3 bg-muted/50 rounded-xl">
                      <Input
                        placeholder="Field label"
                        value={field.label}
                        onChange={(e) => {
                          const f = [...form.customFields];
                          f[i] = { ...f[i], label: e.target.value };
                          setForm({ ...form, customFields: f });
                        }}
                        className="flex-1"
                      />
                      <select
                        className="h-9 rounded-md border bg-background px-3 text-sm"
                        value={field.type}
                        onChange={(e) => {
                          const f = [...form.customFields];
                          f[i] = { ...f[i], type: e.target.value as CustomField["type"] };
                          setForm({ ...form, customFields: f });
                        }}
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="select">Select</option>
                        <option value="color">Color</option>
                        <option value="textarea">Textarea</option>
                      </select>
                      <label className="flex items-center gap-1 text-xs whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => {
                            const f = [...form.customFields];
                            f[i] = { ...f[i], required: e.target.checked };
                            setForm({ ...form, customFields: f });
                          }}
                          className="rounded"
                        />
                        Required
                      </label>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => removeCustomField(i)}
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 rounded-xl">
                  Save Draft
                </Button>
                <Button className="flex-1 rounded-xl">Publish</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="py-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Product</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Price</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Stock</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const imageUrl = product.images?.[0]?.url || product.image_url;
                  return (
                    <tr key={product.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <span className="text-sm font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{product.category?.name}</td>
                      <td className="p-4 text-sm font-medium">${product.price.toFixed(2)}</td>
                      <td className="p-4 text-sm">{product.stock}</td>
                      <td className="p-4">
                        <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                          {product.stock > 0 ? "Active" : "Out of Stock"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Button variant="ghost" size="icon-xs">
                          <Trash2 className="size-3.5 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
