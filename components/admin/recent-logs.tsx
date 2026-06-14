import { Log } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

export function RecentLogs({ logs }: { logs: Log[] }) {
  if (logs.length === 0) {
    return <p className="text-muted-foreground text-sm">No activity yet.</p>;
  }

  return (
    <Card className="py-0 divide-y">
      {logs.map((log) => (
        <CardContent key={log.id} className="px-4 py-3 flex items-center justify-between">
          <div>
            <span className="text-sm font-medium">{log.action}</span>
            <p className="text-xs text-muted-foreground mt-0.5">{log.details}</p>
          </div>
          <time className="text-xs text-muted-foreground whitespace-nowrap">
            {new Date(log.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </time>
        </CardContent>
      ))}
    </Card>
  );
}
