import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Cloud, 
  AlertCircle, 
  CheckCircle,
  Loader2
} from 'lucide-react';
import Papa from 'papaparse';
import { SocialMention } from '@/types/dashboard';

// Configuration - Hard-coded values
const SHEET_CONFIG = {
  sheetId: '1pTvDqlnGmSKbIyg2t8dRVy08uOfe-dnji8pJNd6z0Cw',
  sheetName: 'SCGDATA',
  gid: 0 // Usually 0 for first sheet, can be found in URL after #gid=
};

interface GoogleSheetsUploadProps {
  onDataUpload: (data: SocialMention[]) => void;
}

// Same data processing function as Excel upload
const processGoogleSheetData = (rawData: any[]): SocialMention[] => {
  console.log('Processing Google Sheets data:', rawData.length, 'rows');
  console.log('Sample row:', rawData[0]);
  
  return rawData.map((row, index) => {
    // Handle date field - same logic as Excel
    let dateValue = row.date || row.Date || row.DATE || '';
    if (dateValue) {
      try {
        let parsedDate: Date;
        
        if (typeof dateValue === 'string') {
          if (dateValue.includes('T')) {
            parsedDate = new Date(dateValue);
          } else {
            parsedDate = new Date(dateValue);
          }
        } else if (typeof dateValue === 'number') {
          parsedDate = new Date((dateValue - 25569) * 86400 * 1000);
        } else if (dateValue instanceof Date) {
          parsedDate = dateValue;
        } else {
          parsedDate = new Date();
        }
        
        if (isNaN(parsedDate.getTime())) {
          parsedDate = new Date();
        }
        
        dateValue = parsedDate.toISOString().split('T')[0];
        
      } catch (error) {
        console.error('Date parsing error:', error);
        dateValue = new Date().toISOString().split('T')[0];
      }
    } else {
      dateValue = new Date().toISOString().split('T')[0];
    }

    const processedRow = {
      id: index + 1,
      date: dateValue,
      content: String(row.content || row.Content || row.CONTENT || '').trim(),
      sentiment: (row.sentiment || row.Sentiment || row.SENTIMENT || 'Neutral') as 'Positive' | 'Negative' | 'Neutral',
      channel: (row.Channel || row.channel || row.CHANNEL || 'Website') as any,
      content_type: (row.content_type || row['Content Type'] || row.contentType || 'Post') as any,
      total_engagement: parseInt(String(row.total_engagement || row['Total Engagement'] || row.totalEngagement || '0')) || 0,
      username: String(row.username || row.Username || row.USERNAME || row.user || '').trim(),
      category: (row.Category || row.category || row.CATEGORY || 'Business Branding') as any,
      sub_category: (row.Sub_Category || row['Sub Category'] || row.subCategory || row.Sub_category || 'Corporate') as any,
      type_of_speaker: (row.type_of_speaker || row['Type of Speaker'] || row.speakerType || 'Consumer') as any,
      comments: parseInt(String(row.Comment || row.Comments || row.comment || '0')) || 0,
      reactions: parseInt(String(row.Reactions || row.reactions || row.Reaction || '0')) || 0,
      shares: parseInt(String(row.Share || row.Shares || row.shares || '0')) || 0
    };

    // Debug log for first few rows
    if (index < 3) {
      console.log(`Google Sheets processed row ${index + 1}:`, {
        originalDate: row.date,
        processedDate: processedRow.date,
        sentiment: processedRow.sentiment,
        channel: processedRow.channel,
        engagement: processedRow.total_engagement
      });
    }

    return processedRow;
  });
};

export function GoogleSheetsUpload({ onDataUpload }: GoogleSheetsUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const buildCSVUrl = () => {
    // Google Sheets CSV export URL format
    return `https://docs.google.com/spreadsheets/d/${SHEET_CONFIG.sheetId}/export?format=csv&gid=${SHEET_CONFIG.gid}`;
  };

  const handleGoogleSheetsLoad = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setProgress(0);

    try {
      setProgress(20);
      
      // Build CSV export URL
      const csvUrl = buildCSVUrl();
      console.log('Fetching from Google Sheets:', csvUrl);
      
      setProgress(40);
      
      // Fetch CSV data from Google Sheets
      const response = await fetch(csvUrl, {
        mode: 'cors',
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}. Sheet may not be public or URL is incorrect.`);
      }
      
      const csvText = await response.text();
      setProgress(60);
      
      if (!csvText || csvText.trim().length === 0) {
        throw new Error('No data received from Google Sheets');
      }
      
      console.log('CSV data received, length:', csvText.length);
      console.log('First 200 chars:', csvText.substring(0, 200));
      
      setProgress(80);
      
      // Parse CSV using Papaparse
      const parseResult = Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(), // Clean headers
        complete: (results) => {
          console.log('Papa parse complete:', results);
        },
        error: (error) => {
          console.error('Papa parse error:', error);
        }
      });
      
      if (parseResult.errors && parseResult.errors.length > 0) {
        console.warn('CSV parsing warnings:', parseResult.errors);
      }
      
      const rawData = parseResult.data;
      
      if (!rawData || rawData.length === 0) {
        throw new Error('No data rows found in Google Sheets');
      }
      
      console.log('Raw data from Google Sheets:', rawData.length, 'rows');
      console.log('Sample raw data:', rawData[0]);
      console.log('Headers detected:', Object.keys(rawData[0] || {}));
      
      setProgress(90);
      
      // Process data using same logic as Excel
      const processedData = processGoogleSheetData(rawData);
      
      console.log(`Google Sheets data processed: ${processedData.length} items`);
      console.log('Sample processed data:', processedData[0]);
      
      setProgress(100);
      
      // Send processed data to dashboard
      onDataUpload(processedData);
      setSuccess(true);
      
      // Reset state after success
      setTimeout(() => {
        setSuccess(false);
        setProgress(0);
        setIsLoading(false);
      }, 2000);
      
    } catch (err) {
      console.error('Google Sheets load error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data from Google Sheets');
      setIsLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleGoogleSheetsLoad}
        disabled={isLoading}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Cloud className="h-4 w-4 mr-2" />
        )}
        {isLoading ? 'กำลังโหลด...' : 'เชื่อมต่อ Google Sheets'}
      </Button>

      {isLoading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>กำลังโหลดข้อมูลจาก Google Sheets...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>โหลดข้อมูลจาก Google Sheets สำเร็จ!</AlertDescription>
        </Alert>
      )}

      <div className="text-xs text-muted-foreground">
        <p><strong>Google Sheets:</strong> {SHEET_CONFIG.sheetName}</p>
        <p><strong>Sheet ID:</strong> ...{SHEET_CONFIG.sheetId.slice(-8)}</p>
        <p>ข้อมูลจะถูกประมวลผลเหมือนกับไฟล์ Excel</p>
      </div>
    </div>
  );
}
