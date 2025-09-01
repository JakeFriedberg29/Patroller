import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calendar, BarChart3 } from "lucide-react";

const mockReports = [
  {
    id: 1,
    title: "Monthly Activity Summary",
    type: "Operations",
    date: "2024-08-31",
    description: "Summary of all operations and incidents for August 2024"
  },
  {
    id: 2,
    title: "Equipment Maintenance Report", 
    type: "Maintenance",
    date: "2024-08-30",
    description: "Status and maintenance schedule for all equipment"
  },
  {
    id: 3,
    title: "Team Performance Metrics",
    type: "Personnel",
    date: "2024-08-29",
    description: "Individual and team performance analysis"
  },
  {
    id: 4,
    title: "Response Time Analysis",
    type: "Analytics", 
    date: "2024-08-28",
    description: "Analysis of response times and efficiency metrics"
  }
];

export default function OrganizationReports() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Reports</h1>
            <p className="text-muted-foreground">View and generate organization reports</p>
          </div>
        </div>
        <Button className="gap-2">
          <BarChart3 className="h-4 w-4" />
          Generate Report
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">47</div>
              <div className="text-sm text-muted-foreground">Total Reports</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">12</div>
              <div className="text-sm text-muted-foreground">This Month</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">3</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">98%</div>
              <div className="text-sm text-muted-foreground">Complete Rate</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">{report.title}</h3>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {report.date}
                      </span>
                      <span className="text-xs bg-secondary px-2 py-1 rounded">
                        {report.type}
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}