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
      const workbook = XLSX.read(arrayBuffer);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(worksheet);

      // Process and validate data
      const processedData = rawData.map((row: any) => ({
        Url: row.Url || row.URL || '',
        date: row.date || row.Date || new Date(),
        content: row.content || row.Content || '',
        sentiment: row.sentiment || row.Sentiment || 'Neutral',
        Channel: row.Channel || row.channel || '',
        content_type: row.content_type || row['Content Type'] || row.contentType || '',
        total_engagement: parseInt(row.total_engagement || row['Total Engagement'] || row.totalEngagement || '0'),
        username: row.username || row.Username || row.user || '',
        Category: row.Category || row.category || '',
        Sub_Category: row.Sub_Category || row['Sub Category'] || row.subCategory || '',
        type_of_speaker: row.type_of_speaker || row['Type of Speaker'] || row.speakerType || '',
        Comment: parseInt(row.Comment || row.Comments || row.comment || '0'),
        Reactions: parseInt(row.Reactions || row.reactions || row.Reaction || '0'),
        Share: parseInt(row.Share || row.Shares || row.shares || '0')
      }));

      onDataUpload(processedData);
      setOpen(false);
      
    } catch (err) {
      setError('Failed to process Excel file. Please check the format.');
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
    dispatch({ type: 'SET_LOADING', payload: true });
    setTimeout(() => {
      dispatch({ type: 'SET_DATA', payload: data });
      dispatch({ type: 'SET_LOADING', payload: false });
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

  if (state.data.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
              Social Listening Dashboard
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Upload your Excel data to get started with comprehensive social media analytics
            </p>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="mx-auto w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center">
              <FileSpreadsheet className="h-12 w-12 text-white" />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">What you'll get:</h3>
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
            
            <FileUploadDialog onDataUpload={handleDataUpload} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background w-full">
      {/* Sidebar */}
      <Sidebar className="w-64 flex-shrink-0" />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-card border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">
              {state.currentView === 'overview' && 'Dashboard Overview'}
              {state.currentView === 'sentiment' && 'Sentiment Analysis'}
              {state.currentView === 'performance' && 'Performance Metrics'}
              {state.currentView === 'influencer' && 'Influencer Insights'}
              {state.currentView === 'content' && 'Content Analysis'}
            </h1>
            <div className="text-sm text-muted-foreground">
              {state.filteredData.length.toLocaleString()} of {state.data.length.toLocaleString()} mentions
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
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
            
            <FileUploadDialog onDataUpload={handleDataUpload} />
          </div>
        </header>
        
        {/* Content Area */}
        <div className="flex-1 flex">
          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            {renderCurrentView()}
          </div>
          
          {/* Filter Panel */}
          {showFilters && (
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