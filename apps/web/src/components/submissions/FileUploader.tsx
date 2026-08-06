"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Download,
  FileUp,
  Loader2,
  Paperclip,
  Trash2,
} from "lucide-react";

export const ACCEPTED_FILE_TYPES = ".pdf,.png,.jpg,.jpeg,.gif,.zip";
export const MAX_FILE_SIZE_MB = 10;

interface FileUploaderProps {
  uploadedFiles: string[];
  isUploading: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (filePath: string) => void;
  getFileName: (filePath: string) => string;
  getDownloadUrl: (filePath: string) => string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export function FileUploader({
  uploadedFiles,
  isUploading,
  onFileUpload,
  onRemoveFile,
  getFileName,
  getDownloadUrl,
  fileInputRef,
}: FileUploaderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Paperclip className="h-4 w-4" />
          Supporting Files
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_FILE_TYPES}
            onChange={onFileUpload}
            className="hidden"
            id="file-upload"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <FileUp className="h-4 w-4" />
                Upload File
              </>
            )}
          </Button>
          <span className="text-xs text-muted-foreground">
            PDF, images, or ZIP. Max {MAX_FILE_SIZE_MB}MB.
          </span>
        </div>

        {uploadedFiles.length > 0 && (
          <ul className="space-y-2">
            {uploadedFiles.map((filePath) => (
              <li
                key={filePath}
                className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
              >
                <span className="truncate flex-1 min-w-0">
                  {getFileName(filePath)}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={getDownloadUrl(filePath)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => onRemoveFile(filePath)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
