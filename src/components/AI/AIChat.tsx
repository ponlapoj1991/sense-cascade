import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAI } from '@/contexts/AIContext';
import { useDashboard } from '@/contexts/DashboardContext';
import { DataProcessingService } from '@/services/dataProcessingService';
import { 
  Bot, 
  User, 
  Send, 
  Trash2, 
  Loader2,
  AlertCircle,
  Brain,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';

interface AIChatProps {
  className?: string;
}

// Markdown renderer component
const MarkdownText = ({ text }: { text: string }) => {
  const renderText = (text: string) => {
    // แปลง **text** เป็น <strong>text</strong>
    const boldText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // แปลง *text* เป็น <em>text</em>
    const italicText = boldText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // แปลง `code` เป็น <code>code</code>
    const codeText = italicText.replace(/`(.*?)`/g, '<code class="bg-muted px-1 rounded text-sm">$1</code>');
    
    // แปลง numbers เป็นตัวหนา
    const numberText = codeText.replace(/(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/g, '<strong>$1</strong>');
    
    return numberText;
  };

  return (
    <div 
      className="whitespace-pre-wrap leading-relaxed"
      dangerouslySetInnerHTML={{ __html: renderText(text) }}
    />
  );
};

// Typing animation component
const TypingMessage = ({ 
  message, 
  onComplete 
}: { 
  message: string; 
  onComplete: () => void; 
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < message.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + message[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 25); // Slightly faster typing

      return () => clearTimeout(timer);
    } else if (currentIndex === message.length && onComplete) {
      onComplete();
    }
  }, [currentIndex, message, onComplete]);

  return <MarkdownText text={displayedText} />;
};

export function AIChat({ className }: AIChatProps) {
  const { state: aiState, sendMessage, clearChat } = useAI();
  const { state: dashboardState } = useDashboard();
  const [inputMessage, setInputMessage] = useState('');
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [isProcessingData, setIsProcessingData] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiState.messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // เมื่อมี message ใหม่จาก AI ให้เริ่ม typing animation
  useEffect(() => {
    const lastMessage = aiState.messages[aiState.messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && !typingMessageId) {
      setTypingMessageId(lastMessage.id);
    }
  }, [aiState.messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || aiState.isLoading) return;

    setIsProcessingData(true);
    
    try {
      // Process data using DataProcessingService
      const processedContext = DataProcessingService.processDataForAI(
        inputMessage,
        dashboardState.data,
        dashboardState.filters,
        dashboardState.currentView
      );

      // สร้าง rich context สำหรับ AI
      const richContext = {
        // Basic info
        currentView: dashboardState.currentView,
        userQuery: inputMessage,
        
        // Data overview
        dataOverview: {
          totalOriginalItems: processedContext.totalItems,
          filteredItems: processedContext.filteredItems,
          queryType: processedContext.queryType.type,
          hasContentAnalysis: processedContext.queryType.contentAnalysis
        },
        
        // Calculated metrics
        sentimentAnalysis: {
          breakdown: processedContext.sentimentBreakdown,
          trend: `Positive: ${processedContext.sentimentBreakdown.positive.percentage}%, Negative: ${processedContext.sentimentBreakdown.negative.percentage}%, Neutral: ${processedContext.sentimentBreakdown.neutral.percentage}%`
        },
        
        channelAnalysis: {
          breakdown: processedContext.channelBreakdown,
          topChannels: Object.entries(processedContext.channelBreakdown)
            .sort(([,a], [,b]) => b.count - a.count)
            .slice(0, 3)
            .map(([channel, stats]) => `${channel}: ${stats.count} posts (${stats.percentage}%)`)
        },
        
        engagementInsights: {
          totalEngagement: processedContext.engagementStats.total.toLocaleString(),
          averageEngagement: processedContext.engagementStats.average.toLocaleString(),
          medianEngagement: processedContext.engagementStats.median.toLocaleString(),
          top10Engagement: processedContext.engagementStats.top10Total.toLocaleString()
        },
        
        // Content insights (if available)
        ...(processedContext.contentInsights && {
          contentAnalysis: {
            insights: processedContext.contentInsights,
            topContent: processedContext.contentInsights.contentSamples.map(sample => ({
              text: sample.content,
              engagement: sample.engagement,
              channel: sample.channel,
              sentiment: sample.sentiment
            }))
          }
        }),
        
        // Query results
        queryResults: {
          summary: processedContext.summary,
          topResults: processedContext.topResults.slice(0, 5).map(item => ({
            content: item.content.substring(0, 150) + (item.content.length > 150 ? '...' : ''),
            engagement: item.total_engagement,
            sentiment: item.sentiment,
            channel: item.channel,
            category: item.category,
            username: item.username
          }))
        },
        
        // Context for AI response
        responseInstructions: {
          language: 'Thai',
          includeNumbers: true,
          includeInsights: true,
          responseStyle: 'analytical_friendly',
          shouldAnalyzeContent: processedContext.queryType.contentAnalysis,
          currentDashboardView: dashboardState.currentView
        }
      };

      console.log('🧠 Processed Context for AI:', richContext);

      await sendMessage(inputMessage, richContext);
      setInputMessage('');
      
    } catch (error) {
      console.error('Data processing error:', error);
      // Fallback to basic context
      const basicContext = {
        currentView: dashboardState.currentView,
        totalItems: dashboardState.filteredData.length,
        error: 'Could not process advanced analytics'
      };
      
      await sendMessage(inputMessage, basicContext);
      setInputMessage('');
    } finally {
      setIsProcessingData(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm');
  };

  const getViewBadgeColor = (view: string) => {
    switch (view) {
      case 'overview': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'sentiment': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'performance': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'influencer': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'content': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getProcessingIndicator = () => {
    if (isProcessingData) {
      return (
        <div className="flex items-center text-xs text-muted-foreground mb-2">
          <Brain className="h-3 w-3 animate-pulse mr-1" />
          กำลังประมวลผลข้อมูล...
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`flex flex-col h-full max-h-screen ${className}`}>
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-4 border-b bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">AI Assistant</h3>
              <div className="flex items-center space-x-2 mt-1">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getViewBadgeColor(dashboardState.currentView)}`}
                >
                  {dashboardState.currentView}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {dashboardState.filteredData.length.toLocaleString()} items
                </span>
                <BarChart3 className="h-3 w-3 text-muted-foreground" />
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            disabled={aiState.messages.length === 0}
            title="Clear chat"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages - Fixed Height with Scroll */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {/* Welcome message when no messages */}
            {aiState.messages.length === 0 && (
              <div className="text-center py-8">
                <div className="p-4 bg-muted/30 rounded-lg mb-4 max-w-sm mx-auto">
                  <Bot className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    สวัสดีครับ! ผมคือ AI ผู้ช่วยวิเคราะห์ข้อมูล
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ถามเกี่ยวกับข้อมูล **{dashboardState.filteredData.length.toLocaleString()}** รายการที่แสดงอยู่ได้เลย
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground space-y-1">
                    <p>💡 ลองถาม: "วิเคราะห์ sentiment ทั้งหมด"</p>
                    <p>💡 หรือ: "top 5 โพสต์ที่ engagement สูงสุด"</p>
                    <p>💡 หรือ: "เนื้อหาใน Facebook เป็นยังไง"</p>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            {aiState.messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="p-1.5 bg-primary/10 rounded-full flex-shrink-0 mt-1">
                    <Bot className="h-3 w-3 text-primary" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-12'
                      : 'bg-muted'
                  }`}
                >
                  <div className="text-sm">
                    {message.role === 'assistant' && typingMessageId === message.id ? (
                      <TypingMessage 
                        message={message.content}
                        onComplete={() => setTypingMessageId(null)}
                      />
                    ) : (
                      message.role === 'assistant' ? (
                        <MarkdownText text={message.content} />
                      ) : (
                        message.content
                      )
                    )}
                  </div>
                  <div className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="p-1.5 bg-muted rounded-full flex-shrink-0 mt-1">
                    <User className="h-3 w-3" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {(aiState.isLoading || isProcessingData) && (
              <div className="flex items-start space-x-3">
                <div className="p-1.5 bg-primary/10 rounded-full flex-shrink-0 mt-1">
                  <Bot className="h-3 w-3 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl px-4 py-3">
                  {getProcessingIndicator()}
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      {isProcessingData ? 'กำลังวิเคราะห์ข้อมูล...' : 'กำลังพิมพ์...'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Error message */}
            {aiState.error && (
              <div className="flex items-start space-x-3">
                <div className="p-1.5 bg-destructive/10 rounded-full flex-shrink-0 mt-1">
                  <AlertCircle className="h-3 w-3 text-destructive" />
                </div>
                <div className="bg-destructive/10 border border-destructive/20 rounded-2xl px-4 py-3 max-w-[80%]">
                  <div className="text-sm text-destructive">{aiState.error}</div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Fixed Input */}
      <div className="flex-shrink-0 border-t bg-card p-4">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              placeholder="วิเคราะห์ข้อมูล, หา top posts, เปรียบเทียบ channels..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={aiState.isLoading || isProcessingData || !aiState.settings.apiKey}
              className="pr-12"
            />
            {!aiState.settings.apiKey && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <AlertCircle className="h-4 w-4 text-warning" title="ต้องใส่ API Key ก่อน" />
              </div>
            )}
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || aiState.isLoading || isProcessingData || !aiState.settings.apiKey}
            size="sm"
          >
            {aiState.isLoading || isProcessingData ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {!aiState.settings.apiKey && (
          <p className="text-xs text-warning mt-2 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            กรุณาใส่ OpenAI API Key ในการตั้งค่าก่อนใช้งาน
          </p>
        )}

        {/* Quick action buttons */}
        {dashboardState.data.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-6 px-2"
              onClick={() => setInputMessage('วิเคราะห์ sentiment ทั้งหมด')}
              disabled={aiState.isLoading || isProcessingData}
            >
              Sentiment Analysis
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-6 px-2"
              onClick={() => setInputMessage('top 10 posts ที่ engagement สูงสุด')}
              disabled={aiState.isLoading || isProcessingData}
            >
              Top Posts
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-6 px-2"
              onClick={() => setInputMessage('เปรียบเทียบ performance แต่ละ channel')}
              disabled={aiState.isLoading || isProcessingData}
            >
              Compare Channels
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
