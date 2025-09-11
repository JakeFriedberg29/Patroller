import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Pause, X, Play } from "lucide-react";

interface VoiceRecorderProps {
  onAudioRecorded: (audioBlob: Blob, transcript: string) => void;
  onClose: () => void;
}

export function VoiceRecorder({ onAudioRecorded, onClose }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isStarting, setIsStarting] = useState(true);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startRecording();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        // For now, we'll pass an empty transcript. In a real implementation,
        // you'd integrate with a speech-to-text service
        onAudioRecorded(audioBlob, "Voice recording completed");
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsStarting(false);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      setIsStarting(false);
    }
  };

  const togglePause = () => {
    if (!mediaRecorderRef.current) return;

    if (isPaused) {
      mediaRecorderRef.current.resume();
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      mediaRecorderRef.current.pause();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    setIsPaused(!isPaused);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center justify-center space-y-8 p-8">
        {/* Recording visualization */}
        <div className="relative">
          <div 
            className={`w-48 h-48 rounded-full bg-muted flex items-center justify-center transition-all duration-300 ${
              isRecording && !isPaused ? 'animate-pulse bg-primary/20' : ''
            }`}
          >
            {isStarting ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            ) : (
              <Mic className={`w-16 h-16 ${isRecording && !isPaused ? 'text-primary' : 'text-muted-foreground'}`} />
            )}
          </div>
          
          {/* Recording indicator dots */}
          {isRecording && (
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    isPaused ? 'bg-muted-foreground/50' : 'bg-primary animate-pulse'
                  }`}
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Status text */}
        <div className="text-center space-y-2">
          <p className="text-lg font-medium">
            {isStarting ? 'Initializing...' : 
             isPaused ? 'Recording paused' : 
             isRecording ? 'Start speaking' : 'Ready to record'}
          </p>
          {isRecording && (
            <p className="text-sm text-muted-foreground">
              {formatTime(recordingTime)}
            </p>
          )}
        </div>

        {/* Control buttons */}
        <div className="flex items-center space-x-6">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full w-14 h-14"
            onClick={togglePause}
            disabled={!isRecording || isStarting}
          >
            {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
          </Button>

          <Button
            variant="destructive"
            size="lg"
            className="rounded-full w-14 h-14"
            onClick={() => {
              stopRecording();
              onClose();
            }}
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Stop recording button */}
        {isRecording && !isStarting && (
          <Button
            onClick={stopRecording}
            className="mt-4"
          >
            Stop & Use Recording
          </Button>
        )}
      </div>
    </div>
  );
}