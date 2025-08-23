import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { useDashboard } from '@/contexts/DashboardContext';

const OPENAI_API_KEY = "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";
const OPENAI_MODEL = "gpt-4.1";
const MAX_TOKENS = 20000;
const TEMPERATURE = 0;
const DEFAULT_AI_CONTEXT = 'คุณคือ AI ผู้ช่วยวิเคราะห์ข้อมูลบน Dashboard ตาม filter และข้อมูลที่เห็นขณะนี้ ให้คำตอบที่กระชับตามข้อมูลที่เห็น';

function getAIContextPrompt() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('ai_context_prompt') || DEFAULT_AI_CONTEXT;
  }
  return DEFAULT_AI_CONTEXT;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatSidebarProps {
  open: boolean;
  onClose: () => void;
}

export const AIChatSidebar: React.FC<AIChatSidebarProps> = ({ open, onClose }) => {
  const { state } = useDashboard();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const getDashboardContext = () => ({
    filters: state.filters,
    currentView: state.currentView,
    data: state.filteredData,
  });

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setError(null);
    const newMessages = [...messages, { role: 'user' as const, content: input }];
    setMessages(newMessages);
    setInput('');
    const contextPrompt = getAIContextPrompt();
    const dashboardContext = getDashboardContext();
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          max_tokens: MAX_TOKENS,
          temperature: TEMPERATURE,
          messages: [
            { role: 'system', content: contextPrompt + '\nContext: ' + JSON.stringify(dashboardContext) },
            ...newMessages,
          ],
        }),
      });
      const data = await response.json();
      if (data.choices && data.choices[0]?.message?.content) {
        setMessages([...newMessages, { role: 'assistant', content: data.choices[0].message.content }]);
      } else if (data.error && data.error.message) {
        setError('API Error: ' + data.error.message);
      } else {
        setError('ไม่สามารถรับคำตอบจาก AI ได้');
      }
    } catch (err: any) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ AI: ' + (err?.message || 'Unknown error'));
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed top-0 right-0 h-full w-full max-w-md z-50 bg-white shadow-lg border-l flex flex-col transition-transform duration-300" style={{ transform: open ? 'translateX(0)' : 'translateX(100%)' }}>
      <div className="flex items-center justify-between p-4 border-b">
        <div className="font-semibold text-lg">AI ผู้ช่วยวิเคราะห์</div>
        <Button variant="ghost" type="button" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>
      <ScrollArea className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-gray-400 text-center mt-8">เริ่มต้นสนทนากับ AI ได้ที่นี่</div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <Card className={`max-w-[80%] px-4 py-2 ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900'}`}>{msg.content}</Card>
            </div>
          ))}
          {error && <div className="text-red-500 text-center text-sm">{error}</div>}
        </div>
      </ScrollArea>
      <form
        className="p-4 border-t flex gap-2 bg-white"
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
      >
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="พิมพ์ข้อความถาม AI..."
          className="flex-1"
          autoFocus
          disabled={loading}
        />
        <Button type="submit" disabled={!input.trim() || loading}>{loading ? 'กำลังส่ง...' : 'ส่ง'}</Button>
      </form>
    </div>
  );
};
