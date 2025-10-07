import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, FileText, Clock, AlertTriangle } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { useReports } from "@/hooks/useReports";
import { useToast } from "@/components/ui/use-toast";
import { DynamicReportForm } from "@/components/DynamicReportForm";
import { useOrganizationReportTemplates } from "@/hooks/useReportTemplates";
import { supabase } from "@/integrations/supabase/client";

export default function PatrollerDashboard() {
  const { profile } = useUserProfile();
  const { createReport } = useReports();
  const { toast } = useToast();
  const { templates, loading: loadingTemplates } = useOrganizationReportTemplates();
  const [visibilityByTemplate, setVisibilityByTemplate] = useState<Record<string, boolean>>({});
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [organizationName, setOrganizationName] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    const fetchOrganizationName = async () => {
      const orgId = profile?.profileData?.organization_id;
      const tenantId = profile?.profileData?.tenant_id;
      if (!orgId || !tenantId) {
        setOrganizationName(null);
        return;
      }
      const { data } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', orgId)
        .eq('tenant_id', tenantId)
        .single();
      if (!isCancelled) {
        setOrganizationName(data?.name ?? null);
      }
    };
    fetchOrganizationName();
    return () => { isCancelled = true; };
  }, [profile?.profileData?.organization_id, profile?.profileData?.tenant_id]);

  useEffect(() => {
    let isCancelled = false;
    const fetchVisibility = async () => {
      const orgId = profile?.profileData?.organization_id;
      const tenantId = profile?.profileData?.tenant_id;
      if (!orgId || !tenantId) return;
      const { data } = await supabase
        .from('organization_report_settings')
        .select('template_id, visible_to_patrollers')
        .eq('organization_id', orgId)
        .eq('tenant_id', tenantId);
      if (isCancelled) return;
      const map: Record<string, boolean> = {};
      templates.forEach(t => { map[t.id] = true; });
      (data || []).forEach(r => { map[r.template_id as any] = !!r.visible_to_patrollers; });
      setVisibilityByTemplate(map);
    };
    fetchVisibility();
    return () => { isCancelled = true; };
  }, [templates, profile?.profileData?.organization_id, profile?.profileData?.tenant_id]);

  const REPORT_TYPES = useMemo(() => {
    return templates
      .filter(t => visibilityByTemplate[t.id] !== false)
      .map(t => ({ id: String(t.id), name: t.name, description: t.description }));
  }, [templates, visibilityByTemplate]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Fetch full template when report is selected
  useEffect(() => {
    const fetchTemplate = async () => {
      if (!selectedReport) {
        setSelectedTemplate(null);
        return;
      }
      
      const { data, error } = await supabase
        .from('report_templates')
        .select('id, name, description, template_schema')
        .eq('id', selectedReport)
        .single();
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to load report template",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedTemplate(data);
    };
    
    fetchTemplate();
  }, [selectedReport, toast]);

  const handleReportSubmit = async (formData: Record<string, any>) => {
    if (!selectedTemplate) return;
    
    try {
      // Include voice transcript in metadata if present
      const metadata = {
        ...formData,
        ...(voiceTranscript && { voiceTranscript })
      };
      
      const success = await createReport({
        title: selectedTemplate.name,
        description: selectedTemplate.description,
        report_type: selectedTemplate.name,
        template_id: selectedTemplate.id,
        template_version: 1,
        metadata,
      });
      
      if (success) {
        toast({
          title: "Report Submitted",
          description: "Your report has been submitted successfully.",
        });
        
        // Reset form
        setSelectedReport(null);
        setSelectedTemplate(null);
        setVoiceTranscript("");
      }
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
          {getGreeting()}, {profile?.fullName?.split(' ')[0] || 'Patroller'}
        </h1>
        <p className="text-muted-foreground">
          Ready to submit a report or log an incident
        </p>
        {organizationName && (
          <p className="text-sm text-muted-foreground">
            Account: <span className="font-semibold text-foreground">{organizationName}</span>
          </p>
        )}
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
                {loadingTemplates ? (
                  <div className="col-span-2 text-sm text-muted-foreground">Loading report templates…</div>
                ) : REPORT_TYPES.length === 0 ? (
                  <div className="col-span-2 text-sm text-muted-foreground">No report templates available.</div>
                ) : REPORT_TYPES.map((report) => (
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
          {selectedTemplate && selectedTemplate.template_schema ? (
            <DynamicReportForm
              templateSchema={selectedTemplate.template_schema}
              templateId={selectedTemplate.id}
              templateName={selectedTemplate.name}
              onSubmit={handleReportSubmit}
              onCancel={() => {
                setSelectedReport(null);
                setSelectedTemplate(null);
                setVoiceTranscript("");
              }}
            />
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              Loading report form...
            </div>
          )}
        </div>
      )}
    </div>
  );
}