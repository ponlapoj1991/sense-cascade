import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DashboardProvider, useDashboard } from '@/contexts/DashboardContext';
import { Sidebar } from '@/components/Dashboard/Sidebar';
import { FilterPanel } from '@/components/Dashboard/FilterPanel';
import { OverviewView } from '@/components/Views/OverviewView';
import { SentimentView } from '@/components/Views/SentimentView';
import { PerformanceView } from '@/components/Views/PerformanceView';
import { InfluencerView } from '@/components/Views/InfluencerView';
import { ContentView } from '@/components/Views/ContentView';
import { Upload, FileSpreadsheet, AlertCircle, Filter, X } from 'lucide-react';

function FileUploadDialog({ onDataUpload }: { onDataUpload: (data: any[]) => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, {
        cellDates: true,
        dateNF: 'yyyy-mm-dd'
      });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(worksheet);

      console.log('Raw data sample:', rawData.slice(0, 2));

      // Process and validate data
      const processedData = rawData.map((row: any, index: number) => {
        // Handle date conversion properly
        let dateValue = row.date || row.Date;
        
        if (dateValue !== null && dateValue !== undefined && dateValue !== '') {
          if (typeof dateValue === 'string') {
            // Handle YYYY/MM/DD format
            if (dateValue.includes('/')) {
              const [year, month, day] = dateValue.split('/');
              const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
              if (!isNaN(parsedDate.getTime())) {
                dateValue = parsedDate.toISOString().split('T')[0];
              } else {
                dateValue = new Date().toISOString().split('T')[0];
              }
            } else {
              const parsedDate = new Date(dateValue);
              if (!isNaN(parsedDate.getTime())) {
                dateValue = parsedDate.toISOString().split('T')[0];
              } else {
                dateValue = new Date().toISOString().split('T')[0];
              }
            }
          } else if (typeof dateValue === 'number') {
            // Excel serial date
            const jsDate = new Date((dateValue - 25569) * 86400 * 1000);
            dateValue = jsDate.toISOString().split('T')[0];
          } else if (dateValue instanceof Date) {
            dateValue = dateValue.toISOString().split('T')[0];
          } else {
            dateValue = new Date().toISOString().split('T')[0];
          }
        } else {
          dateValue = new Date().toISOString().split('T')[0];
        }

        const processedRow = {
          id: index + 1,
          date: dateValue,
          content: row.content || row.Content || '',
          sentiment: (row.sentiment || row.Sentiment || 'Neutral') as 'Positive' | 'Negative' | 'Neutral',
          channel: (row.Channel || row.channel || 'Website') as 'Facebook' | 'Website' | 'Twitter' | 'Instagram' | 'TikTok' | 'YouTube',
          content_type: (row.content_type || row['Content Type'] || row.contentType || 'Post') as 'Post' | 'Video' | 'Comment' | 'Story',
          total_engagement: parseInt(row.total_engagement || row['Total Engagement'] || row.totalEngagement || '0') || 0,
          username: row.username || row.Username || row.user || '',
          category: (row.Category || row.category || 'Business Branding') as 'Business Branding' | 'ESG Branding' | 'Crisis Management',
          sub_category: (row.Sub_Category || row['Sub Category'] || row.subCategory || 'Corporate') as 'Sport' | 'Stock' | 'Net zero' | 'Corporate',
          type_of_speaker: (row.type_of_speaker || row['Type of Speaker'] || row.speakerType || 'Consumer') as 'Publisher' | 'Influencer voice' | 'Consumer' | 'Media',
          comments: parseInt(row.Comment || row.Comments || row.comment || '0') || 0,
          reactions: parseInt(row.Reactions || row.reactions || row.Reaction || '0') || 0,
          shares: parseInt(row.Share || row.Shares || row.shares || '0') || 0
        };

        return processedRow;
      });

      console.log('Processed data sample:', processedData.slice(0, 2));
      console.log('Total processed rows:', processedData.length);

      if (processedData.length === 0) {
        throw new Error('No valid data found in the Excel file');
      }

      onDataUpload(processedData);
      setOpen(false);
      
    } catch (err) {
      console.error('Excel processing error:', err);
      setError(`Failed to process Excel file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary text-white">
          <Upload className="h-4 w-4 mr-2" />
          Upload Excel Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Excel File</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {error && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <div className="space-y-2">
              <p className="text-sm font-medium">Upload your Excel file</p>
              <p className="text-xs text-muted-foreground">
                Supports .xlsx files up to 50MB
              </p>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary-dark"
              />
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Required columns:</strong></p>
            <p>Url, date, content, sentiment, Channel, content_type, total_engagement, username, Category, Sub_Category, type_of_speaker, Comment, Reactions, Share</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DashboardContent() {
  const { state, dispatch } = useDashboard();
  const [showFilters, setShowFilters] = useState(false);

  const handleDataUpload = (data: any[]) => {
    console.log('Data received in handleDataUpload:', data.length, 'rows');
    dispatch({ type: 'SET_LOADING', payload: true });
    setTimeout(() => {
      dispatch({ type: 'SET_DATA', payload: data });
      dispatch({ type: 'SET_LOADING', payload: false });
      console.log('Data set in context');
    }, 500);
  };

  const renderCurrentView = () => {
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

  return (
    <div className="flex min-h-screen bg-background w-full">
      {/* Sidebar */}
      <Sidebar className="w-64 flex-shrink-0" />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-card border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold bg-gradient-primary bg-clip-text text-transparent">
              Social Listening Dashboard
            </h1>
            {state.data.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {state.filteredData.length.toLocaleString()} of {state.data.length.toLocaleString()} mentions
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {state.data.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {/* Filter count badge */}
                {Object.values(state.filters).some(v => 
                  Array.isArray(v) ? v.length > 0 : 
                  typeof v === 'object' && v !== null ? Object.values(v).some(val => val !== null && val !== 0 && val !== Infinity) :
                  false
                ) && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">
                    !
                  </div>
                )}
              </Button>
            )}
            
            <FileUploadDialog onDataUpload={handleDataUpload} />
          </div>
        </header>
        
        {/* Content Area */}
        <div className="flex-1 flex">
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
                      <h2 className="text-2xl font-bold">Welcome to Social Listening Dashboard</h2>
                      <p className="text-muted-foreground">
                        Upload your Excel data to get started with comprehensive social media analytics
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <p>✓ Sentiment Analysis & Trends</p>
                          <p>✓ Channel Performance Metrics</p>
                          <p>✓ Influencer Insights & Rankings</p>
                        </div>
                        <div className="space-y-2">
                          <p>✓ Content Performance Analysis</p>
                          <p>✓ Interactive Filtering & Drilling</p>
                          <p>✓ Real-time Data Visualization</p>
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
            <div className="w-80 border-l border-border bg-card p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Filters</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <FilterPanel />
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
