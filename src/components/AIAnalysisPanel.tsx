import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AIAnalysis } from '@/hooks/useAIAnalysis';
import { Brain, CheckCircle, XCircle, Copy, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIAnalysisPanelProps {
  analysis: AIAnalysis;
  onUpdateAnalysis: (analysisId: string, updates: Partial<AIAnalysis>) => Promise<void>;
}

export const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({
  analysis,
  onUpdateAnalysis
}) => {
  const [developerNotes, setDeveloperNotes] = useState(analysis.developer_notes || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const getAnalysisTypeIcon = (type: string) => {
    switch (type) {
      case 'bug_report': return '🐛';
      case 'question': return '❓';
      case 'feature_request': return '✨';
      default: return '💬';
    }
  };

  const getAnalysisTypeColor = (type: string) => {
    switch (type) {
      case 'bug_report': return 'bg-red-500 text-white';
      case 'question': return 'bg-blue-500 text-white';
      case 'feature_request': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const handleApproval = async (approved: boolean) => {
    setIsUpdating(true);
    try {
      await onUpdateAnalysis(analysis.id, {
        developer_approved: approved,
        developer_notes: developerNotes
      });
      toast({
        title: approved ? 'Analysis Approved' : 'Analysis Rejected',
        description: 'Your feedback has been saved.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update analysis.',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied to clipboard',
        description: 'Text has been copied to your clipboard.',
      });
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Could not copy to clipboard.',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card className="mt-3 border-blue-200 bg-blue-50/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="h-4 w-4 text-blue-600" />
            AI Analysis
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={getAnalysisTypeColor(analysis.analysis_type)}>
              {getAnalysisTypeIcon(analysis.analysis_type)} {analysis.analysis_type.replace('_', ' ')}
            </Badge>
            <Badge variant="outline">
              {Math.round(analysis.confidence_score * 100)}% confidence
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {analysis.generated_prompt && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Generated Lovable Prompt:</h4>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(analysis.generated_prompt!)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <div className="bg-white p-3 rounded-md border text-sm font-mono">
              {analysis.generated_prompt}
            </div>
          </div>
        )}

        {analysis.suggested_response && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Suggested Response:</h4>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(analysis.suggested_response!)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <div className="bg-white p-3 rounded-md border text-sm">
              {analysis.suggested_response}
            </div>
          </div>
        )}

        {analysis.sources && analysis.sources.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Sources:</h4>
            <ul className="text-sm text-muted-foreground">
              {analysis.sources.map((source, index) => (
                <li key={index}>• {source}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="font-medium text-sm">Developer Notes:</h4>
          <Textarea
            value={developerNotes}
            onChange={(e) => setDeveloperNotes(e.target.value)}
            placeholder="Add your notes about this analysis..."
            className="min-h-[60px]"
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          {analysis.developer_approved === null ? (
            <>
              <Button
                size="sm"
                onClick={() => handleApproval(true)}
                disabled={isUpdating}
                className="flex items-center gap-1"
              >
                <CheckCircle className="h-3 w-3" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleApproval(false)}
                disabled={isUpdating}
                className="flex items-center gap-1"
              >
                <XCircle className="h-3 w-3" />
                Reject
              </Button>
            </>
          ) : (
            <Badge variant={analysis.developer_approved ? "default" : "destructive"}>
              {analysis.developer_approved ? "Approved" : "Rejected"} by Developer
            </Badge>
          )}
        </div>

        <div className="text-xs text-muted-foreground pt-2 border-t">
          Analyzed: {new Date(analysis.processed_at).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
};