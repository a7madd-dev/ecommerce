"use client";

import { useState } from "react";
import { Star, CheckCircle, ThumbsUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Review } from "@/types";

interface Props {
  reviews: Review[];
  rating: number;
  reviewCount: number;
}

const REVIEWS_PER_PAGE = 6;

export function ProductReviews({ reviews, rating, reviewCount }: Props) {
  const [page, setPage] = useState(0);
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const totalPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
  const paginatedReviews = reviews.slice(
    page * REVIEWS_PER_PAGE,
    (page + 1) * REVIEWS_PER_PAGE
  );

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { star, count, pct };
  });

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-8">Customer Reviews</h2>

        <div className="grid md:grid-cols-[300px_1fr] gap-8">
          {/* Summary */}
          <div className="bg-card border rounded-2xl p-6 h-fit space-y-6">
            <div className="text-center">
              <div className="text-5xl font-bold">{rating}</div>
              <div className="flex items-center justify-center gap-1 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "size-5",
                      i < Math.floor(rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Based on {reviewCount.toLocaleString()} reviews
              </p>
            </div>

            {/* Breakdown */}
            <div className="space-y-2">
              {ratingBreakdown.map((item) => (
                <div key={item.star} className="flex items-center gap-2 text-sm">
                  <span className="w-8 text-right">{item.star}</span>
                  <Star className="size-3 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-muted-foreground">{item.count}</span>
                </div>
              ))}
            </div>

            {/* Write Review */}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full rounded-xl">Write a Review</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Write a Review</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Rating</p>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <button
                          key={i}
                          onMouseEnter={() => setHoverRating(i + 1)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setNewRating(i + 1)}
                        >
                          <Star
                            className={cn(
                              "size-7 transition-colors cursor-pointer",
                              i < (hoverRating || newRating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground/30"
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Title</p>
                    <Input placeholder="Summarize your experience" />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Review</p>
                    <textarea
                      className="w-full min-h-[120px] rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="Share your thoughts about this product..."
                    />
                  </div>
                  <Button className="w-full rounded-xl">Submit Review</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {paginatedReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-card border rounded-2xl p-5 space-y-3 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                      {review.user_avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm truncate">
                          {review.user_name}
                        </span>
                        {review.verified && (
                          <CheckCircle className="size-3.5 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "size-3.5",
                          i < review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground/30"
                        )}
                      />
                    ))}
                  </div>

                  <h4 className="font-semibold text-sm">{review.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {review.content}
                  </p>

                  <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <ThumbsUp className="size-3.5" />
                    Helpful ({review.helpful})
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="rounded-lg"
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={cn(
                      "w-8 h-8 rounded-lg text-sm font-medium transition-colors",
                      i === page
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page === totalPages - 1}
                  className="rounded-lg"
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
