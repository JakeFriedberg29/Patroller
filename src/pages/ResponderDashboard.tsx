import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, FileText, Clock, AlertTriangle } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { IncidentForm } from "@/components/IncidentForm";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { useIncidents } from "@/hooks/useIncidents";
import { useToast } from "@/components/ui/use-toast";

const REPORT_TYPES = [
  { id: 'incident', name: 'Incident Report', description: 'Report an incident or emergency' },
  { id: 'medical', name: 'Medical/First Aid Report', description: 'Report medical assistance provided' },
  { id: 'rescue', name: 'Rescue Report', description: 'Report rescue operations' },
  { id: 'patrol', name: 'Patrol Report', description: 'Report patrol activities' }
];

export default function ResponderDashboard() {
  const { profile } = useUserProfile();
  const { createIncident } = useIncidents();
  const { toast } = useToast();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const handleReportSubmit = async (reportData: any) => {
    try {
      const incidentData = {
        ...reportData,
        description: voiceTranscript ? 
          `${reportData.description}\n\nVoice Recording Notes: ${voiceTranscript}` : 
          reportData.description
      };
      
      await createIncident(incidentData);
      
      toast({
        title: "Report Submitted",
        description: "Your report has been submitted successfully.",
      });
      
      // Reset form
      setSelectedReport(null);
      setVoiceTranscript("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVoiceRecorded = (audioBlob: Blob, transcript: string) => {
    setVoiceTranscript(transcript);
    setShowVoiceRecorder(false);
    
    toast({
      title: "Voice Recording Added",
      description: "Your voice recording has been processed and added to the report.",
    });
  };

  if (showVoiceRecorder) {
    return (
      <VoiceRecorder
        onAudioRecorded={handleVoiceRecorded}
        onClose={() => setShowVoiceRecorder(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 py-8">
        <h1 className="text-3xl font-bold">
          {getGreeting()}, {profile?.fullName?.split(' ')[0] || 'Responder'}
        </h1>
        <p className="text-muted-foreground">
          Ready to submit a report or log an incident
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <Clock className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Current Time</p>
              <p className="font-semibold">{new Date().toLocaleTimeString()}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant="secondary">On Duty</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <FileText className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Reports Today</p>
              <p className="font-semibold">0</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Selection */}
      {!selectedReport && (
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Select Report Type</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {REPORT_TYPES.map((report) => (
                  <Card 
                    key={report.id} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setSelectedReport(report.id)}
                  >
                    <CardContent className="p-4">
                      <h3 className="font-semibold">{report.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {report.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Form */}
      {selectedReport && (
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {REPORT_TYPES.find(r => r.id === selectedReport)?.name}
            </h2>
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedReport(null);
                setVoiceTranscript("");
              }}
            >
              Back to Selection
            </Button>
          </div>

          {/* Voice Recording Button */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mic className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Voice Recording</p>
                    <p className="text-sm text-muted-foreground">
                      Add voice notes to your report
                    </p>
                  </div>
                </div>
                <Button
                  variant={voiceTranscript ? "secondary" : "outline"}
                  onClick={() => setShowVoiceRecorder(true)}
                >
                  {voiceTranscript ? "Re-record" : "Start Recording"}
                </Button>
              </div>
              {voiceTranscript && (
                <div className="mt-3 p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium">Voice Recording Added</p>
                  <p className="text-xs text-muted-foreground">
                    Voice notes will be included with your report
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Report Form */}
          <IncidentForm onSubmit={handleReportSubmit} />
        </div>
      )}
    </div>
  );
}