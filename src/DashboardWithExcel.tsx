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
  PieChart,
  Download
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
  Line
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

const DashboardWithExcel: React.FC = () => {
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);

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
              rowObj[header] = row[index] || '';
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

  // สร้างข้อมูลสำหรับ Charts
  const chartData = useMemo(() => {
    if (!excelData || !selectedSheet) return null;

    const currentData = excelData.data[selectedSheet];
    const headers = excelData.headers[selectedSheet];

    if (!currentData || currentData.length === 0) return null;

    // สร้างข้อมูลสำหรับ Pie Chart (นับจำนวนในคอลัมน์แรก)
    const firstColumn = headers[0];
    const pieData = currentData.reduce((acc: Record<string, number>, row) => {
      const value = row[firstColumn]?.toString() || 'ไม่ระบุ';
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});

    const pieChartData = Object.entries(pieData).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / currentData.length) * 100).toFixed(1)
    }));

    // สร้างข้อมูลสำหรับ Bar Chart (ถ้ามีคอลัมน์ตัวเลข)
    const numericColumns = headers.filter(header => {
      return currentData.some(row => {
        const value = row[header];
        return !isNaN(parseFloat(value)) && isFinite(value);
      });
    });

    const barChartData = currentData.slice(0, 10).map((row, index) => {
      const dataPoint: any = { name: `แถว ${index + 1}` };
      numericColumns.forEach(col => {
        dataPoint[col] = parseFloat(row[col]) || 0;
      });
      return dataPoint;
    });

    return {
      pieChartData,
      barChartData,
      numericColumns
    };
  }, [excelData, selectedSheet]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const currentSheetData = selectedSheet && excelData ? excelData.data[selectedSheet] : [];
  const currentHeaders = selectedSheet && excelData ? excelData.headers[selectedSheet] : [];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Excel Dashboard</h1>
            <p className="text-muted-foreground">อัปโหลดและวิเคราะห์ข้อมูล Excel</p>
          </div>
          {excelData && (
            <Button onClick={handleRemoveFile} variant="outline" className="gap-2">
              <X className="w-4 h-4" />
              ล้างข้อมูล
            </Button>
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
                รองรับไฟล์ .xlsx, .xls เพื่อนำเข้าข้อมูลสำหรับการวิเคราะห์
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
        {excelData && (
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
                      {excelData.metadata.totalRows} แถวข้อมูล
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{currentSheetData.length}</p>
                      <p className="text-muted-foreground text-sm">แถวข้อมูล</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{currentHeaders.length}</p>
                      <p className="text-muted-foreground text-sm">คอลัมน์</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Activity className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{excelData.metadata.totalSheets}</p>
                      <p className="text-muted-foreground text-sm">ชีต</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{formatFileSize(excelData.metadata.fileSize)}</p>
                      <p className="text-muted-foreground text-sm">ขนาดไฟล์</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts and Data */}
            <Tabs defaultValue="charts" className="space-y-6">
              <TabsList>
                <TabsTrigger value="charts">กราฟและแผนภูมิ</TabsTrigger>
                <TabsTrigger value="data">ข้อมูลดิบ</TabsTrigger>
              </TabsList>

              <TabsContent value="charts" className="space-y-6">
                {chartData && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pie Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle>การกระจายข้อมูล</CardTitle>
                        <CardDescription>
                          แสดงการกระจายของข้อมูลในคอลัมน์ {currentHeaders[0]}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <RechartsPieChart>
                            <Pie
                              data={chartData.pieChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {chartData.pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: any) => [value, 'จำนวน']} />
                            <Legend />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Bar Chart */}
                    {chartData.numericColumns.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>ข้อมูลตัวเลข</CardTitle>
                          <CardDescription>
                            แสดงข้อมูลตัวเลข 10 แถวแรก
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData.barChartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              {chartData.numericColumns.slice(0, 3).map((column, index) => (
                                <Bar 
                                  key={column} 
                                  dataKey={column} 
                                  fill={COLORS[index % COLORS.length]} 
                                />
                              ))}
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* Data Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>สรุปข้อมูลแต่ละคอลัมน์</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {currentHeaders.slice(0, 6).map((header, index) => {
                        const uniqueValues = new Set(currentSheetData.map(row => row[header]?.toString() || ''));
                        const hasNumericData = currentSheetData.some(row => {
                          const value = row[header];
                          return !isNaN(parseFloat(value)) && isFinite(value);
                        });
                        
                        return (
                          <div key={header} className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-2 truncate" title={header}>
                              {header}
                            </h4>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <p>ค่าที่ไม่ซ้ำ: {uniqueValues.size}</p>
                              <p>ประเภท: {hasNumericData ? 'ตัวเลข' : 'ข้อความ'}</p>
                              {uniqueValues.size <= 5 && (
                                <div className="mt-2">
                                  <p className="font-medium">ค่าที่พบ:</p>
                                  {Array.from(uniqueValues).slice(0, 3).map((value, i) => (
                                    <Badge key={i} variant="outline" className="mr-1 mb-1 text-xs">
                                      {value.toString().slice(0, 10)}
                                    </Badge>
                                  ))}
                                  {uniqueValues.size > 3 && <span className="text-xs">...</span>}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="data" className="space-y-6">
                {/* Data Table */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>ข้อมูลจากชีต: {selectedSheet}</CardTitle>
                        <CardDescription>
                          แสดงข้อมูล {Math.min(currentSheetData.length, 100)} แถวแรก จากทั้งหมด {currentSheetData.length} แถว
                        </CardDescription>
                      </div>
                      <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Export CSV
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {currentSheetData.length > 0 ? (
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
                            {currentSheetData.slice(0, 100).map((row, rowIndex) => (
                              <tr key={rowIndex} className="hover:bg-muted/50 border-b">
                                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                                  {rowIndex + 1}
                                </td>
                                {currentHeaders.map((header, colIndex) => (
                                  <td key={colIndex} className="px-4 py-3">
                                    <div className="truncate max-w-[200px]" title={row[header]?.toString() || ''}>
                                      {row[header]?.toString() || '-'}
                                    </div>
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {currentSheetData.length > 100 && (
                          <div className="p-4 text-center text-muted-foreground border-t bg-muted/20">
                            แสดง 100 แถวแรก จากทั้งหมด {currentSheetData.length} แถว
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

                {/* Column Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle>การวิเคราะห์คอลัมน์</CardTitle>
                    <CardDescription>
                      รายละเอียดเกี่ยวกับแต่ละคอลัมน์ในข้อมูล
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {currentHeaders.map((header, index) => {
                        const columnData = currentSheetData.map(row => row[header]);
                        const uniqueValues = new Set(columnData.map(val => val?.toString() || ''));
                        const nullCount = columnData.filter(val => !val || val === '').length;
                        const hasNumericData = columnData.some(val => !isNaN(parseFloat(val)) && isFinite(val));
                        
                        // คำนวณสถิติสำหรับข้อมูลตัวเลข
                        let stats = null;
                        if (hasNumericData) {
                          const numericData = columnData
                            .map(val => parseFloat(val))
                            .filter(val => !isNaN(val));
                          
                          if (numericData.length > 0) {
                            const min = Math.min(...numericData);
                            const max = Math.max(...numericData);
                            const avg = numericData.reduce((a, b) => a + b, 0) / numericData.length;
                            stats = { min, max, avg };
                          }
                        }

                        return (
                          <div key={header} className="p-4 border rounded-lg space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{header}</h4>
                              <Badge variant={hasNumericData ? "default" : "secondary"}>
                                {hasNumericData ? 'ตัวเลข' : 'ข้อความ'}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">ค่าทั้งหมด</p>
                                <p className="font-medium">{columnData.length}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">ค่าที่ไม่ซ้ำ</p>
                                <p className="font-medium">{uniqueValues.size}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">ค่าว่าง</p>
                                <p className="font-medium">{nullCount}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">ข้อมูลครบ</p>
                                <p className="font-medium">
                                  {((columnData.length - nullCount) / columnData.length * 100).toFixed(1)}%
                                </p>
                              </div>
                            </div>

                            {stats && (
                              <div className="grid grid-cols-3 gap-4 text-sm border-t pt-3">
                                <div>
                                  <p className="text-muted-foreground">ค่าต่ำสุด</p>
                                  <p className="font-medium">{stats.min.toFixed(2)}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">ค่าเฉลี่ย</p>
                                  <p className="font-medium">{stats.avg.toFixed(2)}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">ค่าสูงสุด</p>
                                  <p className="font-medium">{stats.max.toFixed(2)}</p>
                                </div>
                              </div>
                            )}

                            {uniqueValues.size <= 10 && !hasNumericData && (
                              <div className="border-t pt-3">
                                <p className="text-sm text-muted-foreground mb-2">ค่าที่พบ:</p>
                                <div className="flex flex-wrap gap-1">
                                  {Array.from(uniqueValues).slice(0, 10).map((value, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {value.toString().slice(0, 20)}
                                      {value.toString().length > 20 && '...'}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
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
