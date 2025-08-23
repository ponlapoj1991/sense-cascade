import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  MessageCircle,
  Heart,
  Share2,
  Calendar,
  Filter
} from 'lucide-react';
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

interface ExcelData {
  sheetNames: string[];
  data: Record<string, any[]>;
  headers: Record<string, string[]>;
  metadata: {
    fileName: string;
    fileSize: number;
    totalRows: number;
    totalSheets: number;
  };
}

interface SocialMediaData {
  Url?: string;
  date?: string | Date;
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
  [key: string]: any;
}

const DashboardWithExcel: React.FC = () => {
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);
  const [dateFilter, setDateFilter] = useState<string>('all');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, {
        type: 'array',
        cellDates: true,
        cellNF: false,
        cellText: false
      });

      const sheetNames = workbook.SheetNames;
      const data: Record<string, any[]> = {};
      const headers: Record<string, string[]> = {};
      let totalRows = 0;

      sheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: '',
          blankrows: false
        });

        if (jsonData.length > 0) {
          const sheetHeaders = (jsonData[0] as string[]).map(header => 
            header?.toString().trim() || 'Column'
          );
          
          const sheetData = jsonData.slice(1).map((row: any[]) => {
            const rowObj: Record<string, any> = {};
sheetHeaders.forEach((header, index) => {
  let value = row[index] || '';
  if (header.toLowerCase().includes('date') && value) {
    if (typeof value === 'number') {
      const utc_days = Math.floor(value - 25569);
      const utc_value = utc_days * 86400; 
      value = new Date(utc_value * 1000);
    } else if (typeof value === 'string') {
      let dateValue = new Date(value);
      if (isNaN(dateValue.getTime()) && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
        const [d, m, y] = value.split('/');
        dateValue = new Date(`${y}-${m}-${d}`);
      }
      if (!isNaN(dateValue.getTime())) {
        value = dateValue;
      }
    } else if (value instanceof Date) {
      value = value;
    }
  }
  if (['total_engagement', 'Comment', 'Reactions', 'Share'].includes(header)) {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      value = numValue;
    }
  }
  rowObj[header] = value;
});
            return rowObj;
          });

          headers[sheetName] = sheetHeaders;
          data[sheetName] = sheetData;
          totalRows += sheetData.length;
        }
      });

      const excelDataResult: ExcelData = {
        sheetNames,
        data,
        headers,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          totalRows,
          totalSheets: sheetNames.length
        }
      };

      setExcelData(excelDataResult);
      setSelectedSheet(sheetNames[0] || '');

    } catch (err) {
      console.error('Error reading Excel file:', err);
      setError(`ไม่สามารถอ่านไฟล์ Excel ได้: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFile = () => {
    setExcelData(null);
    setSelectedSheet('');
    setError(null);
    setDateFilter('all');
    if (fileInputRef) {
      fileInputRef.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Process social media analytics data
  const socialMediaAnalytics = useMemo(() => {
    if (!excelData || !selectedSheet) return null;

    const currentData = excelData.data[selectedSheet] as SocialMediaData[];
    const headers = excelData.headers[selectedSheet];

    if (!currentData || currentData.length === 0) return null;

    // Filter by date if needed
    let filteredData = currentData;
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case '7days':
          filterDate.setDate(now.getDate() - 7);
          break;
        case '30days':
          filterDate.setDate(now.getDate() - 30);
          break;
        case '90days':
          filterDate.setDate(now.getDate() - 90);
          break;
      }
      
      filteredData = currentData.filter(item => {
        if (!item.date) return true;
        const itemDate = new Date(item.date);
        return itemDate >= filterDate;
      });
    }

    // Sentiment Analysis
    const sentimentData = filteredData.reduce((acc: Record<string, number>, item) => {
      const sentiment = item.sentiment || 'Unknown';
      acc[sentiment] = (acc[sentiment] || 0) + 1;
      return acc;
    }, {});

    const sentimentChartData = Object.entries(sentimentData).map(([name, value]) => ({
      name,
      value: Number(value),
      percentage: ((Number(value) / filteredData.length) * 100).toFixed(1)
    }));

    // Channel Analysis
    const channelData = filteredData.reduce((acc: Record<string, number>, item) => {
      const channel = item.Channel || 'Unknown';
      acc[channel] = (acc[channel] || 0) + 1;
      return acc;
    }, {});

    const channelChartData = Object.entries(channelData).map(([name, value]) => ({
      name,
      value: Number(value),
      engagement: filteredData
        .filter(item => item.Channel === name)
        .reduce((sum, item) => sum + (Number(item.total_engagement) || 0), 0)
    }));

    // Category Analysis
    const categoryData = filteredData.reduce((acc: Record<string, number>, item) => {
      const category = item.Category || 'Unknown';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({
      name,
      value: Number(value)
    }));

    // Timeline Analysis (by date)
    const timelineData = filteredData.reduce((acc: Record<string, any>, item) => {
      if (!item.date) return acc;
      
      const date = new Date(item.date);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          mentions: 0,
          engagement: 0,
          positive: 0,
          negative: 0,
          neutral: 0
        };
      }
      
      acc[dateKey].mentions += 1;
      acc[dateKey].engagement += Number(item.total_engagement) || 0;
      
      const sentiment = item.sentiment?.toLowerCase() || 'neutral';
      if (sentiment.includes('positive')) acc[dateKey].positive += 1;
      else if (sentiment.includes('negative')) acc[dateKey].negative += 1;
      else acc[dateKey].neutral += 1;
      
      return acc;
    }, {});

    const timelineChartData = Object.values(timelineData).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // KPIs
    const totalMentions = filteredData.length;
    const totalEngagement = filteredData.reduce((sum, item) => sum + (Number(item.total_engagement) || 0), 0);
    const avgEngagement = totalMentions > 0 ? totalEngagement / totalMentions : 0;
    const uniqueUsers = new Set(filteredData.map(item => item.username)).size;
    const positiveMentions = filteredData.filter(item => 
      item.sentiment?.toLowerCase().includes('positive')
    ).length;
    const sentimentScore = totalMentions > 0 ? (positiveMentions / totalMentions) * 100 : 0;

    return {
      filteredData,
      sentimentChartData,
      channelChartData,  
      categoryChartData,
      timelineChartData,
      kpis: {
        totalMentions,
        totalEngagement,
        avgEngagement,
        uniqueUsers,
        sentimentScore
      }
    };
  }, [excelData, selectedSheet, dateFilter]);

  const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#06b6d4'];

  const currentSheetData = selectedSheet && excelData ? excelData.data[selectedSheet] : [];
  const currentHeaders = selectedSheet && excelData ? excelData.headers[selectedSheet] : [];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Social Media Analytics Dashboard</h1>
            <p className="text-muted-foreground">อัปโหลดและวิเคราะห์ข้อมูล Social Media Mentions</p>
          </div>
          {excelData && (
            <div className="flex gap-2">
              <select 
                className="px-3 py-2 border rounded-md bg-background"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">ข้อมูลทั้งหมด</option>
                <option value="7days">7 วันล่าสุด</option>
                <option value="30days">30 วันล่าสุด</option>
                <option value="90days">90 วันล่าสุด</option>
              </select>
              <Button onClick={handleRemoveFile} variant="outline" className="gap-2">
                <X className="w-4 h-4" />
                ล้างข้อมูล
              </Button>
            </div>
          )}
        </div>

        {/* File Upload */}
        {!excelData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" />
                อัปโหลดไฟล์ Excel
              </CardTitle>
              <CardDescription>
                รองรับไฟล์ .xlsx, .xls ที่มีข้อมูล Social Media Mentions
                <br />
                คอลัมน์ที่รองรับ: Url, date, content, sentiment, Channel, content_type, total_engagement, username, Category, Sub_Category, type_of_speaker, Comment, Reactions, Share
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <input
                  ref={setFileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="excel-upload"
                />
                <label htmlFor="excel-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    คลิกเพื่อเลือกไฟล์ Excel
                  </p>
                  <p className="text-sm text-gray-500">
                    หรือลากไฟล์มาวางที่นี่
                  </p>
                </label>
              </div>

              {isLoading && (
                <div className="text-center py-4 mt-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">กำลังอ่านไฟล์...</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>เกิดข้อผิดพลาด</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Dashboard Content */}
        {excelData && socialMediaAnalytics && (
          <>
            {/* File Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{excelData.metadata.fileName}</h3>
                    <p className="text-muted-foreground">
                      {formatFileSize(excelData.metadata.fileSize)} • 
                      {excelData.metadata.totalSheets} ชีต • 
                      {socialMediaAnalytics.filteredData.length} รายการ (จากทั้งหมด {excelData.metadata.totalRows} รายการ)
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {excelData.sheetNames.map(sheetName => (
                      <Badge
                        key={sheetName}
                        variant={selectedSheet === sheetName ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setSelectedSheet(sheetName)}
                      >
                        {sheetName}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <MessageCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{socialMediaAnalytics.kpis.totalMentions.toLocaleString()}</p>
                      <p className="text-muted-foreground text-sm">Total Mentions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Heart className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{socialMediaAnalytics.kpis.totalEngagement.toLocaleString()}</p>
                      <p className="text-muted-foreground text-sm">Total Engagement</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{Math.round(socialMediaAnalytics.kpis.avgEngagement)}</p>
                      <p className="text-muted-foreground text-sm">Avg Engagement</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Users className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{socialMediaAnalytics.kpis.uniqueUsers.toLocaleString()}</p>
                      <p className="text-muted-foreground text-sm">Unique Users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-pink-100 rounded-lg">
                      <Activity className="w-6 h-6 text-pink-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{socialMediaAnalytics.kpis.sentimentScore.toFixed(1)}%</p>
                      <p className="text-muted-foreground text-sm">Positive Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sentiment Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Sentiment Analysis</CardTitle>
                  <CardDescription>การกระจายของ Sentiment</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={socialMediaAnalytics.sentimentChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {socialMediaAnalytics.sentimentChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => [value, 'จำนวน']} />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Channel Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Channel Performance</CardTitle>
                  <CardDescription>จำนวน Mentions แต่ละ Channel</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={socialMediaAnalytics.channelChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                  <CardDescription>การกระจายตาม Category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={socialMediaAnalytics.categoryChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Timeline */}
              {socialMediaAnalytics.timelineChartData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Timeline Analysis</CardTitle>
                    <CardDescription>แนวโน้มของ Mentions ตามเวลา</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={socialMediaAnalytics.timelineChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => new Date(value).toLocaleDateString('th-TH')}
                        />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(value) => new Date(value).toLocaleDateString('th-TH')}
                        />
                        <Area type="monotone" dataKey="mentions" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Data Table */}
            <Tabs defaultValue="summary" className="space-y-6">
              <TabsList>
                <TabsTrigger value="summary">สรุปข้อมูล</TabsTrigger>
                <TabsTrigger value="data">ข้อมูลดิบ</TabsTrigger>
              </TabsList>

              <TabsContent value="summary">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Top Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {socialMediaAnalytics.categoryChartData.slice(0, 5).map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm truncate">{item.name}</span>
                            <Badge variant="outline">{item.value}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Channel Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {socialMediaAnalytics.channelChartData.slice(0, 5).map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm truncate">{item.name}</span>
                            <div className="text-right">
                              <div className="text-sm font-medium">{item.value} mentions</div>
                              <div className="text-xs text-muted-foreground">{item.engagement.toLocaleString()} engagement</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Sentiment Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {socialMediaAnalytics.sentimentChartData.map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm truncate">{item.name}</span>
                            <div className="text-right">
                              <div className="text-sm font-medium">{item.value}</div>
                              <div className="text-xs text-muted-foreground">{item.percentage}%</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="data">
                <Card>
                  <CardHeader>
                    <CardTitle>ข้อมูลจากชีต: {selectedSheet}</CardTitle>
                    <CardDescription>
                      แสดงข้อมูล {Math.min(socialMediaAnalytics.filteredData.length, 100)} แถวแรก 
                      จากทั้งหมด {socialMediaAnalytics.filteredData.length} แถว
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {socialMediaAnalytics.filteredData.length > 0 ? (
                      <div className="overflow-auto max-h-[600px] border rounded-lg">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50 sticky top-0">
                            <tr>
                              <th className="px-4 py-3 text-left font-medium border-b w-12">#</th>
                              {currentHeaders.map((header, index) => (
                                <th key={index} className="px-4 py-3 text-left font-medium border-b min-w-[120px]">
                                  <div className="truncate" title={header}>
                                    {header}
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {socialMediaAnalytics.filteredData.slice(0, 100).map((row, rowIndex) => (
                              <tr key={rowIndex} className="hover:bg-muted/50 border-b">
                                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                                  {rowIndex + 1}
                                </td>
                                {currentHeaders.map((header, colIndex) => (
                                  <td key={colIndex} className="px-4 py-3">
                                    <div className="truncate max-w-[200px]" title={row[header]?.toString() || ''}>
                                      {row[header] instanceof Date 
                                        ? row[header].toLocaleDateString('th-TH')
                                        : row[header]?.toString() || '-'
                                      }
                                    </div>
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {socialMediaAnalytics.filteredData.length > 100 && (
                          <div className="p-4 text-center text-muted-foreground border-t bg-muted/20">
                            แสดง 100 แถวแรก จากทั้งหมด {socialMediaAnalytics.filteredData.length} แถว
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">ไม่พบข้อมูลในชีตนี้</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardWithExcel;
