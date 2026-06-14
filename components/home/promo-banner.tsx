import { Button } from "@/components/ui/button";
import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";

export function PromoBanner() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-blue-700 px-8 py-16 sm:px-16 sm:py-20">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-medium px-3 py-1.5 rounded-full mb-4">
              <Clock className="size-3.5" />
              Limited Time Offer
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
              Up to 40% Off
              <span className="block">Spring Collection</span>
            </h2>
            <p className="mt-3 text-white/80 text-lg max-w-md">
              Don&apos;t miss out on our biggest sale of the season. Premium quality at unbeatable prices.
            </p>

            {/* Countdown placeholder */}
            <div className="flex gap-4 mt-8">
              {[
                { value: "02", label: "Days" },
                { value: "14", label: "Hours" },
                { value: "36", label: "Mins" },
                { value: "52", label: "Secs" },
              ].map((unit) => (
                <div key={unit.label} className="text-center">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <span className="text-xl font-bold text-white font-mono">
                      {unit.value}
                    </span>
                  </div>
                  <span className="text-[10px] text-white/60 uppercase tracking-wider mt-1.5 block">
                    {unit.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Link href="/?sort=price_asc">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 text-base px-8 h-12 rounded-xl font-semibold"
            >
              Shop the Sale
              <ArrowRight className="size-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
