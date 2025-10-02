import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LicensesCatalog() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Licenses Catalog</h1>
        <p className="text-muted-foreground mt-2">
          Browse and manage available licenses for your account
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Licenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            License catalog will be populated with API data
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
