import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { DashboardProvider, useDashboard } from '@/contexts/DashboardContext';
import { Sidebar } from '@/components/Dashboard/Sidebar';
import { FilterPanel } from '@/components/Dashboard/FilterPanel';
import { OverviewView } from '@/components/Views/OverviewView';
import { SentimentView } from '@/components/Views/SentimentView';
import { PerformanceView } from '@/components/Views/PerformanceView';
import { InfluencerView } from '@/components/Views/InfluencerView';
import { ContentView } from '@/components/Views/ContentView';
import { Upload, FileSpreadsheet, AlertCircle, Filter, X, CheckCircle } from 'lucide-react';
import { SocialMention } from '@/types/dashboard';

// ฟังก์ชันสำหรับประมวลผลข้อมูล Excel - FIXED!
const processExcelData = (rawData: any[]): SocialMention[] => {
  console.log('Processing Excel data:', rawData.length, 'rows');
  console.log('Sample row:', rawData[0]);
  
  return rawData.map((row, index) => {
    // จัดการวันที่ - FIXED to handle ISO DateTime!
    let dateValue = row.date || row.Date || row.DATE || '';
    if (dateValue) {
      try {
        let parsedDate: Date;
        
        if (typeof dateValue === 'string') {
          // Handle ISO DateTime format: "2025-04-08T16:59:56.000Z"
          if (dateValue.includes('T')) {
            parsedDate = new Date(dateValue);
            console.log('Parsed ISO DateTime:', dateValue, '→', parsedDate);
          } else {
            // Handle simple date format: "2024-01-15"
            parsedDate = new Date(dateValue);
            console.log('Parsed simple date:', dateValue, '→', parsedDate);
          }
        } else if (typeof dateValue === 'number') {
          // Excel serial date
          parsedDate = new Date((dateValue - 25569) * 86400 * 1000);
          console.log('Parsed Excel serial date:', dateValue, '→', parsedDate);
        } else if (dateValue instanceof Date) {
          parsedDate = dateValue;
        } else {
          // Fallback to current date if parsing fails
          console.warn('Unknown date format:', dateValue, '→ using current date');
          parsedDate = new Date();
        }
        
        // Validate parsed date
        if (isNaN(parsedDate.getTime())) {
          console.warn('Invalid date found:', dateValue, '→ using current date');
          parsedDate = new Date();
        }
        
        // Convert to simple date format YYYY-MM-DD
        dateValue = parsedDate.toISOString().split('T')[0];
        
      } catch (error) {
        console.error('Date parsing error:', error, 'original value:', dateValue);
        dateValue = new Date().toISOString().split('T')[0];
      }
    } else {
      console.warn('Empty date field → using current date');
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
      console.log(`✅ Processed row ${index + 1}:`, {
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

interface FileUploadProps {
  onDataUpload: (data: SocialMention[]) => void;
}

function FileUpload({ onDataUpload }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [open, setOpen] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setSuccess(false);
    setUploadProgress(0);

    try {
      // Validate file
      if (!file.name.match(/\.(xlsx|xls)$/i)) {
        throw new Error('กรุณาเลือกไฟล์ Excel (.xlsx หรือ .xls)');
      }

      if (file.size > 50 * 1024 * 1024) { // 50MB
        throw new Error('ไฟล์ต้องมีขนาดไม่เกิน 50MB');
      }

      setUploadProgress(20);

      // Read file
      const arrayBuffer = await file.arrayBuffer();
      setUploadProgress(40);

      // Parse Excel
      const workbook = XLSX.read(arrayBuffer, {
        cellDates: true,
        dateNF: 'yyyy-mm-dd'
      });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      setUploadProgress(70);

      if (rawData.length === 0) {
        throw new Error('ไฟล์ Excel ไม่มีข้อมูล');
      }

      console.log('📊 Raw Excel data loaded:', rawData.length, 'rows');
      console.log('📊 Sample raw data:', rawData[0]);

      // Process data - USING FIXED FUNCTION!
      const processedData = processExcelData(rawData);
      setUploadProgress(90);

      console.log(`✅ ประมวลผลข้อมูลเสร็จสิ้น: ${processedData.length} รายการ`);
      console.log('📊 Sample processed data:', processedData[0]);
      
      onDataUpload(processedData);
      setUploadProgress(100);
      setSuccess(true);

      // Auto close after success
      setTimeout(() => {
        setOpen(false);
        setIsUploading(false);
        setSuccess(false);
        setUploadProgress(0);
      }, 2000);

    } catch (err) {
      console.error('❌ Excel upload error:', err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary text-white">
          <Upload className="h-4 w-4 mr-2" />
          อัปโหลดข้อมูล Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>อัปโหลดไฟล์ Excel</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>อัปโหลดข้อมูลสำเร็จ!</AlertDescription>
            </Alert>
          )}

          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <div className="space-y-2">
              <p className="text-sm font-medium">เลือกไฟล์ Excel</p>
              <p className="text-xs text-muted-foreground">
                รองรับไฟล์ .xlsx, .xls ขนาดไม่เกิน 50MB
              </p>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 disabled:opacity-50"
              />
            </div>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>กำลังประมวลผล...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>คอลัมน์ที่รองรับ:</strong></p>
            <p>Url, date, content, sentiment, Channel, content_type, total_engagement, username, Category, Sub_Category, type_of_speaker, Comment, Reactions, Share</p>
            <p className="text-xs text-success">✅ รองรับชื่อคอลัมน์หลากหลายรูปแบบ</p>
            <p className="text-xs text-success">✅ รองรับ ISO DateTime และ Simple Date</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DashboardContent() {
  const { state, dispatch } = useDashboard();
  const [showFilters, setShowFilters] = useState(false);

  const handleDataUpload = (data: SocialMention[]) => {
    console.log('📈 อัปโหลดข้อมูลเข้าสู่ระบบ:', data.length, 'รายการ');
    dispatch({ type: 'SET_LOADING', payload: true });
    
    setTimeout(() => {
      dispatch({ type: 'SET_DATA', payload: data });
      dispatch({ type: 'SET_LOADING', payload: false });
      console.log('✅ ข้อมูลถูกโหลดเข้าระบบเรียบร้อย');
    }, 500);
  };

  const renderCurrentView = () => {
    if (state.isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      );
    }

    switch (state.currentView) {
      case 'sentiment':
        return <SentimentView />;
      case 'performance':
        return <PerformanceView />;
      case 'influencer':
        return <InfluencerView />;
      case 'content':
        return <ContentView />;
      default:
        return <OverviewView />;
    }
  };

  const hasActiveFilters = () => {
    const { filters } = state;
    return (
      filters.sentiment.length > 0 ||
      filters.channels.length > 0 ||
      filters.categories.length > 0 ||
      (filters.dateRange.start && filters.dateRange.end)
    );
  };

  return (
    <div className="flex min-h-screen bg-background w-full">
      {/* Sidebar */}
      <Sidebar className="w-64 flex-shrink-0" />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-card border-b border-border p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold bg-gradient-primary bg-clip-text text-transparent">
              Social Listening Dashboard
            </h1>
            {state.data.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {state.filteredData.length.toLocaleString()} จาก {state.data.length.toLocaleString()} รายการ
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {state.data.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={`relative ${hasActiveFilters() ? 'border-primary' : ''}`}
              >
                <Filter className="h-4 w-4 mr-2" />
                ตัวกรอง
                {hasActiveFilters() && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">
                    •
                  </div>
                )}
              </Button>
            )}
            
            <FileUpload onDataUpload={handleDataUpload} />
          </div>
        </header>
        
        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            {state.data.length === 0 ? (
              <div className="flex items-center justify-center h-full p-6">
                <Card className="w-full max-w-2xl">
                  <CardContent className="text-center space-y-6 p-8">
                    <div className="mx-auto w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center">
                      <FileSpreadsheet className="h-12 w-12 text-white" />
                    </div>
                    
                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold">ยินดีต้อนรับสู่ Social Listening Dashboard</h2>
                      <p className="text-muted-foreground">
                        อัปโหลดข้อมูล Excel เพื่อเริ่มต้นการวิเคราะห์โซเชียลมีเดีย
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <p>✅ วิเคราะห์ความรู้สึกและแนวโน้ม</p>
                          <p>✅ วัดผลประสิทธิภาพตามช่องทาง</p>
                          <p>✅ ข้อมูลเชิงลึกจากผู้มีอิทธิพล</p>
                        </div>
                        <div className="space-y-2">
                          <p>✅ วิเคราะห์ประสิทธิภาพเนื้อหา</p>
                          <p>✅ การกรองและเจาะลึกข้อมูล</p>
                          <p>✅ การแสดงผลแบบเรียลไทม์</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              renderCurrentView()
            )}
          </div>
          
          {/* Filter Panel */}
          {showFilters && state.data.length > 0 && (
            <div className="w-80 border-l border-border bg-card overflow-y-auto">
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">ตัวกรองข้อมูล</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <FilterPanel />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SocialListeningDashboard() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
