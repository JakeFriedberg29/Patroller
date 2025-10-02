import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Billing() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground mt-2">
          Manage billing information and view payment history
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Billing Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Billing information will be populated with API data
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
