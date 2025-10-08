import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Upload, X, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface FileUploadProps {
  bucket: string;
  path: string;
  accept?: string;
  maxSize?: number; // in MB
  onUploadComplete?: (url: string, filename: string) => void;
  onUploadError?: (error: string) => void;
  label?: string;
  description?: string;
  existingFile?: {
    url: string;
    filename: string;
  } | null;
}

export default function FileUpload({
  bucket,
  path,
  accept = "image/*,.pdf,.doc,.docx",
  maxSize = 10,
  onUploadComplete,
  onUploadError,
  label,
  description,
  existingFile,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<{
    url: string;
    filename: string;
  } | null>(existingFile || null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        const errorMsg = `File size must be less than ${maxSize}MB`;
        toast({
          title: "File too large",
          description: errorMsg,
          variant: "destructive",
        });
        if (onUploadError) onUploadError(errorMsg);
        return;
      }

      setUploading(true);
      setUploadProgress(0);

      // Create unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      clearInterval(progressInterval);

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(filePath);

      setUploadProgress(100);
      setUploadedFile({
        url: publicUrl,
        filename: file.name,
      });

      toast({
        title: "Upload successful",
        description: `${file.name} has been uploaded successfully.`,
      });

      if (onUploadComplete) {
        onUploadComplete(publicUrl, file.name);
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      const errorMsg = error.message || "Failed to upload file";
      toast({
        title: "Upload failed",
        description: errorMsg,
        variant: "destructive",
      });
      if (onUploadError) onUploadError(errorMsg);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleRemoveFile = async () => {
    if (!uploadedFile) return;

    try {
      // Extract file path from URL
      const urlParts = uploadedFile.url.split(`/${bucket}/`);
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from(bucket).remove([filePath]);
      }

      setUploadedFile(null);
      toast({
        title: "File removed",
        description: "The file has been removed successfully.",
      });
    } catch (error: any) {
      console.error("Remove file error:", error);
      toast({
        title: "Failed to remove file",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      {description && <p className="text-sm text-muted-foreground">{description}</p>}

      {!uploadedFile ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept={accept}
              onChange={handleFileUpload}
              disabled={uploading}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={uploading}
              onClick={() => document.querySelector<HTMLInputElement>(`input[type="file"]`)?.click()}
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>

          {uploading && (
            <div className="space-y-1">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-xs text-muted-foreground">Uploading... {uploadProgress}%</p>
            </div>
          )}
        </div>
      ) : (
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">{uploadedFile.filename}</p>
                <a
                  href={uploadedFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  View file
                </a>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemoveFile}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
