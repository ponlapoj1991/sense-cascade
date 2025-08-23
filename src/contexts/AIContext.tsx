// src/contexts/AIContext.tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface AISettings {
  systemPrompt: string;
  model: 'gpt-4.1' | 'gpt-4' | 'gpt-3.5-turbo';
  temperature: number;
  maxTokens: number;
  apiKey: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface AIState {
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  settings: AISettings;
  error: string | null;
}

export type AIAction =
  | { type: 'TOGGLE_CHAT' }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SETTINGS'; payload: Partial<AISettings> }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_MESSAGES' };

const initialSettings: AISettings = {
  systemPrompt: 'คุณเป็น AI ผู้ช่วยที่เชี่ยวชาญด้านการวิเคราะห์ข้อมูล Social Media และ Digital Marketing ให้คำแนะนำที่เป็นประโยชน์และตอบคำถามอย่างชัดเจน',
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 1000,
  apiKey: ''
};

const initialState: AIState = {
  isOpen: false,
  messages: [],
  isLoading: false,
  settings: initialSettings,
  error: null
};

function aiReducer(state: AIState, action: AIAction): AIState {
  switch (action.type) {
    case 'TOGGLE_CHAT':
      return { ...state, isOpen: !state.isOpen };
    
    case 'ADD_MESSAGE':
      return { 
        ...state, 
        messages: [...state.messages, action.payload],
        error: null
      };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_SETTINGS':
      return { 
        ...state, 
        settings: { ...state.settings, ...action.payload }
      };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] };
    
    default:
      return state;
  }
}

interface AIContextType {
  state: AIState;
  dispatch: React.Dispatch<AIAction>;
  sendMessage: (message: string, dashboardContext?: any) => Promise<void>;
  toggleChat: () => void;
  updateSettings: (settings: Partial<AISettings>) => void;
  clearChat: () => void;
}

const AIContext = createContext<AIContextType | null>(null);

export function AIProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(aiReducer, initialState);

  const toggleChat = () => {
    dispatch({ type: 'TOGGLE_CHAT' });
  };

  const updateSettings = (settings: Partial<AISettings>) => {
    dispatch({ type: 'SET_SETTINGS', payload: settings });
    // Save to localStorage
    localStorage.setItem('ai-settings', JSON.stringify({ ...state.settings, ...settings }));
  };

  const clearChat = () => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  };

  const sendMessage = async (message: string, dashboardContext?: any) => {
    if (!state.settings.apiKey) {
      dispatch({ type: 'SET_ERROR', payload: 'กรุณาใส่ OpenAI API Key ใน Settings' });
      return;
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Prepare messages for OpenAI
      const messages = [
        {
          role: 'system',
          content: state.settings.systemPrompt
        },
        // Add dashboard context if provided
        ...(dashboardContext ? [{
          role: 'system',
          content: `ข้อมูล Dashboard ปัจจุบัน: ${JSON.stringify(dashboardContext, null, 2)}`
        }] : []),
        // Add conversation history
        ...state.messages.slice(-10).map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: 'user',
          content: message
        }
      ];

      console.log('🤖 Sending to OpenAI:', { messages, settings: state.settings });

      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.settings.apiKey}`
        },
        body: JSON.stringify({
          model: state.settings.model,
          messages,
          temperature: state.settings.temperature,
          max_tokens: state.settings.maxTokens
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API Error');
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      // Add AI response
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });

    } catch (error) {
      console.error('❌ OpenAI API Error:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการเชื่อมต่อ' 
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Load settings from localStorage
  React.useEffect(() => {
    const savedSettings = localStorage.getItem('ai-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        dispatch({ type: 'SET_SETTINGS', payload: parsed });
      } catch (error) {
        console.error('Failed to load AI settings:', error);
      }
    }
  }, []);

  return (
    <AIContext.Provider value={{
      state,
      dispatch,
      sendMessage,
      toggleChat,
      updateSettings,
      clearChat
    }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}
