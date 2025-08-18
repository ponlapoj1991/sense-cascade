import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import { SocialMention } from '@/types/dashboard';

interface FileUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDataUploaded: (data: SocialMention[]) => void;
}

interface ParsedRow {
  Url?: string;
  date?: string;
  content?: string;
  sentiment?: string;
  Channel?: string;
  content_type?: string;
  total_engagement?: number;
  username?: string;
  Category?: string;
  Sub_Category?: string;
  type_of_speaker?: string;
  Comment?: number;
  Reactions?: number;
  Share?: number;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const REQUIRED_COLUMNS = ['Url', 'date', 'content', 'sentiment', 'Channel', 'content_type', 'total_engagement', 'username', 'Category', 'Sub_Category', 'type_of_speaker', 'Comment', 'Reactions', 'Share'];

export function FileUploadDialog({ isOpen, onClose, onDataUploaded }: FileUploadDialogProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      return 'Please upload an Excel file (.xlsx or .xls)';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 50MB';
    }
    return null;
  };

  const validateColumns = (headers: string[]): string | null => {
    const missingColumns = REQUIRED_COLUMNS.filter(col => !headers.includes(col));
    if (missingColumns.length > 0) {
      return `Missing required columns: ${missingColumns.join(', ')}`;
    }
    return null;
  };

  const parseExcelData = (data: ParsedRow[]): SocialMention[] => {
    return data.map((row, index) => ({
      id: index + 1,
      date: row.date || '',
      content: row.content || '',
      sentiment: (row.sentiment as 'Positive' | 'Negative' | 'Neutral') || 'Neutral',
      channel: (row.Channel as 'Facebook' | 'Website' | 'Twitter' | 'Instagram' | 'TikTok' | 'YouTube') || 'Website',
      content_type: (row.content_type as 'Post' | 'Video' | 'Comment' | 'Story') || 'Post',
      total_engagement: Number(row.total_engagement) || 0,
      username: row.username || '',
      category: (row.Category as 'Business Branding' | 'ESG Branding' | 'Crisis Management') || 'Business Branding',
      sub_category: (row.Sub_Category as 'Sport' | 'Stock' | 'Net zero' | 'Corporate') || 'Corporate',
      type_of_speaker: (row.type_of_speaker as 'Publisher' | 'Influencer voice' | 'Consumer' | 'Media') || 'Consumer',
      comments: Number(row.Comment) || 0,
      reactions: Number(row.Reactions) || 0,
      shares: Number(row.Share) || 0,
    }));
  };

  const processFile = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate progress for reading file
      setUploadProgress(20);

      const data = await file.arrayBuffer();
      setUploadProgress(40);

      const workbook = XLSX.read(data, { type: 'array' });
      setUploadProgress(60);

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as ParsedRow[];

      setUploadProgress(80);

      // Validate headers
      if (jsonData.length === 0) {
        throw new Error('Excel file is empty');
      }

      const headers = Object.keys(jsonData[0]);
      const columnError = validateColumns(headers);
      if (columnError) {
        throw new Error(columnError);
      }

      // Parse and validate data
      const parsedData = parseExcelData(jsonData);
      setUploadProgress(100);

      // Success
      setTimeout(() => {
        setSuccess(true);
        onDataUploaded(parsedData);
        setTimeout(() => {
          onClose();
          resetState();
        }, 1500);
      }, 500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (file: File) => {
    const validation = validateFile(file);
    if (validation) {
      setError(validation);
      return;
    }
    processFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const resetState = () => {
    setIsUploading(false);
    setUploadProgress(0);
    setError(null);
    setSuccess(false);
    setIsDragOver(false);
  };

  const handleClose = () => {
    if (!isUploading) {
      onClose();
      resetState();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Upload Excel Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Area */}
          <div
            className={cn(
              "relative border-2 border-dashed rounded-lg p-6 text-center transition-colors",
              isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25",
              isUploading && "pointer-events-none opacity-50"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
            
            <div className="space-y-2">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {isDragOver ? 'Drop your file here' : 'Drag & drop your Excel file here'}
                </p>
                <p className="text-xs text-muted-foreground">
                  or click to browse (.xlsx, .xls - max 50MB)
                </p>
              </div>
            </div>
          </div>

          {/* Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing file...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Success */}
          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                File uploaded successfully! Dashboard is updating...
              </AlertDescription>
            </Alert>
          )}

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Required Format Info */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium">Required Excel columns:</p>
            <p className="leading-relaxed">
              Url, date, content, sentiment, Channel, content_type, total_engagement, 
              username, Category, Sub_Category, type_of_speaker, Comment, Reactions, Share
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isUploading}>
              {isUploading ? 'Processing...' : 'Cancel'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}