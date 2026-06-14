import { Log } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollText } from "lucide-react";

export function LogsView({ logs }: { logs: Log[] }) {
  if (logs.length === 0) {
    return (
      <Card className="p-8 text-center">
        <ScrollText className="size-12 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground">No activity logs yet.</p>
      </Card>
    );
  }

  return (
    <Card className="py-0 divide-y">
      {logs.map((log) => (
        <CardContent
          key={log.id}
          className="px-6 py-4 flex items-start justify-between gap-4"
        >
          <div>
            <p className="text-sm font-medium">{log.action}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{log.details}</p>
          </div>
          <time className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
            {new Date(log.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </time>
        </CardContent>
      ))}
    </Card>
  );
}
