// src/components/AI/AIChat.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAI } from '@/contexts/AIContext';
import { useDashboard } from '@/contexts/DashboardContext';
import { 
  Bot, 
  User, 
  Send, 
  Trash2, 
  Settings, 
  Loader2,
  X,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface AIChatProps {
  className?: string;
}

export function AIChat({ className }: AIChatProps) {
  const { state: aiState, sendMessage, clearChat } = useAI();
  const { state: dashboardState } = useDashboard();
  const [inputMessage, setInputMessage] = useState('');
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

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || aiState.isLoading) return;

    // Prepare dashboard context
    const dashboardContext = {
      currentView: dashboardState.currentView,
      totalItems: dashboardState.filteredData.length,
      totalOriginalItems: dashboardState.data.length,
      appliedFilters: {
        dateRange: dashboardState.filters.dateRange,
        channels: dashboardState.filters.channels,
        sentiment: dashboardState.filters.sentiment,
        categories: dashboardState.filters.categories,
        contentTypes: dashboardState.filters.contentTypes,
        speakerTypes: dashboardState.filters.speakerTypes
      },
      // Sample of current data (first 5 items for context)
      sampleData: dashboardState.filteredData.slice(0, 5).map(item => ({
        date: item.date,
        sentiment: item.sentiment,
        channel: item.channel,
        content: item.content.substring(0, 100) + '...',
        engagement: item.total_engagement
      }))
    };

    console.log('📊 Dashboard Context for AI:', dashboardContext);

    await sendMessage(inputMessage, dashboardContext);
    setInputMessage('');
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

  return (
    <Card className={`h-full flex flex-col ${className}`}>
      {/* Header */}
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Assistant</CardTitle>
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
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
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
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full px-4">
          <div className="space-y-4 py-4">
            {/* Welcome message when no messages */}
            {aiState.messages.length === 0 && (
              <div className="text-center py-8">
                <div className="p-4 bg-muted/30 rounded-lg mb-4 max-w-sm mx-auto">
                  <Bot className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    สวัสดีครับ! ผมคือ AI ผู้ช่วยวิเคราะห์ข้อมูล
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ถามผมเกี่ยวกับข้อมูลที่คุณกำลังดูอยู่ได้เลยครับ
                  </p>
                </div>
              </div>
            )}

            {/* Messages */}
            {aiState.messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-2 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="p-1.5 bg-primary/10 rounded-full flex-shrink-0 mt-0.5">
                    <Bot className="h-3 w-3 text-primary" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-12'
                      : 'bg-muted'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  <div className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="p-1.5 bg-muted rounded-full flex-shrink-0 mt-0.5">
                    <User className="h-3 w-3" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {aiState.isLoading && (
              <div className="flex items-start space-x-2">
                <div className="p-1.5 bg-primary/10 rounded-full flex-shrink-0 mt-0.5">
                  <Bot className="h-3 w-3 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-sm text-muted-foreground">กำลังพิมพ์...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error message */}
            {aiState.error && (
              <div className="flex items-start space-x-2">
                <div className="p-1.5 bg-destructive/10 rounded-full flex-shrink-0 mt-0.5">
                  <AlertCircle className="h-3 w-3 text-destructive" />
                </div>
                <div className="bg-destructive/10 border border-destructive/20 rounded-2xl px-4 py-2 max-w-[80%]">
                  <div className="text-sm text-destructive">{aiState.error}</div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              placeholder="ถามเกี่ยวกับข้อมูลที่แสดงอยู่..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={aiState.isLoading || !aiState.settings.apiKey}
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
            disabled={!inputMessage.trim() || aiState.isLoading || !aiState.settings.apiKey}
            size="sm"
          >
            {aiState.isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {!aiState.settings.apiKey && (
          <p className="text-xs text-warning mt-2 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            กรุณาใส่ OpenAI API Key ใน Settings ก่อนใช้งาน
          </p>
        )}
      </div>
    </Card>
  );
}
