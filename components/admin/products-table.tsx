"use client";

import { Product, Category } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { deleteProduct } from "@/app/actions/admin";
import { ProductFormModal } from "./product-form-modal";
import toast from "react-hot-toast";
import Image from "next/image";

interface Props {
  products: Product[];
  categories: Category[];
}

export function ProductsTable({ products, categories }: Props) {
  async function handleDelete(id: string, name: string) {
    if (!confirm(`Deactivate "${name}"?`)) return;
    const result = await deleteProduct(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Product deactivated");
    }
  }

  if (products.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No products yet. Add your first product.</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden py-0">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                Product
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                Category
              </th>
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                Price
              </th>
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                Stock
              </th>
              <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                Status
              </th>
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden flex-shrink-0 relative">
                      {product.image_url ? (
                        <Image src={product.image_url} alt="" fill className="object-cover" sizes="40px" />
                      ) : null}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {product.description}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {product.category?.name || "—"}
                </td>
                <td className="px-4 py-3 text-sm text-right font-medium">
                  ${Number(product.price).toFixed(2)}
                  {product.compare_at_price && (
                    <span className="block text-xs text-muted-foreground line-through">
                      ${Number(product.compare_at_price).toFixed(2)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <span className={product.stock <= 5 ? "text-destructive font-medium" : ""}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge variant={product.is_active ? "default" : "secondary"}>
                    {product.is_active ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <ProductFormModal categories={categories} product={product} />
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleDelete(product.id, product.name)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
