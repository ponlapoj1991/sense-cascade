// src/components/AI/AISettings.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAI } from '@/contexts/AIContext';
import { 
  Bot, 
  Key, 
  Settings2, 
  Save, 
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

export function AISettings() {
  const { state, updateSettings } = useAI();
  const [localSettings, setLocalSettings] = useState(state.settings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSettingChange = (field: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    updateSettings(localSettings);
    setHasUnsavedChanges(false);
  };

  const handleReset = () => {
    setLocalSettings(state.settings);
    setHasUnsavedChanges(false);
  };

  const isApiKeyValid = localSettings.apiKey && localSettings.apiKey.startsWith('sk-');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">AI Settings</h3>
        </div>
        {hasUnsavedChanges && (
          <Badge variant="outline" className="text-warning border-warning">
            มีการเปลี่ยนแปลง
          </Badge>
        )}
      </div>

      {/* API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-md flex items-center space-x-2">
            <Key className="h-4 w-4" />
            <span>API Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="api-key">OpenAI API Key</Label>
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Input
                  id="api-key"
                  type={showApiKey ? "text" : "password"}
                  placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={localSettings.apiKey}
                  onChange={(e) => handleSettingChange('apiKey', e.target.value)}
                  className={`pr-10 ${isApiKeyValid ? 'border-success' : localSettings.apiKey ? 'border-destructive' : ''}`}
                />
                {isApiKeyValid && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-success" />
                )}
                {localSettings.apiKey && !isApiKeyValid && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-destructive" />
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? 'ซ่อน' : 'แสดง'}
              </Button>
            </div>
            {localSettings.apiKey && !isApiKeyValid && (
              <p className="text-xs text-destructive flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                API Key ไม่ถูกต้อง (ต้องเริ่มด้วย 'sk-')
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              ได้รับ API Key ได้ที่ <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">platform.openai.com</a>
            </p>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select 
              value={localSettings.model} 
              onValueChange={(value) => handleSettingChange('model', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4">GPT-4 (แนะนำ)</SelectItem>
                <SelectItem value="gpt-4.1">GPT-4.1 (ล่าสุด)</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (เร็ว+ประหยัด)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* AI Behavior */}
      <Card>
        <CardHeader>
          <CardTitle className="text-md flex items-center space-x-2">
            <Settings2 className="h-4 w-4" />
            <span>AI Behavior</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Custom System Prompt */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor="system-prompt">Custom System Prompt</Label>
              <Info className="h-3 w-3 text-muted-foreground" title="กำหนดบทบาทและพฤติกรรมของ AI" />
            </div>
            <Textarea
              id="system-prompt"
              placeholder="บทบาทของคุณคือนักวิเคราะห์ข้อมูล Social Media ที่เชี่ยวชาญ..."
              rows={6}
              value={localSettings.systemPrompt}
              onChange={(e) => handleSettingChange('systemPrompt', e.target.value)}
              className="resize-none"
            />
            <div className="text-xs text-muted-foreground">
              <strong>ตัวอย่าง:</strong> "คุณเป็นผู้เชี่ยวชาญด้าน Digital Marketing และ Social Listening ที่ให้คำแนะนำเชิงกลยุทธ์ ตอบคำถามด้วยภาษาไทยอย่างเป็นมิตรและใช้ emoji เพื่อให้น่าสนใจ"
            </div>
          </div>

          {/* Temperature */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Temperature: {localSettings.temperature}</Label>
              <Badge variant="outline" className="text-xs">
                {localSettings.temperature <= 0.3 ? 'เฉพาะเจาะจง' : 
                 localSettings.temperature <= 0.7 ? 'สมดุล' : 'สร้างสรรค์'}
              </Badge>
            </div>
            <Slider
              value={[localSettings.temperature]}
              onValueChange={([value]) => handleSettingChange('temperature', value)}
              max={1}
              min={0}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>เฉพาะเจาะจง</span>
              <span>สร้างสรรค์</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Max Tokens: {localSettings.maxTokens}</Label>
              <Badge variant="outline" className="text-xs">
                ~{Math.round(localSettings.maxTokens * 0.75)} คำ
              </Badge>
            </div>
            <Slider
              value={[localSettings.maxTokens]}
              onValueChange={([value]) => handleSettingChange('maxTokens', value)}
              max={2000}
              min={100}
              step={50}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>สั้น (100)</span>
              <span>ยาว (2000)</span>
