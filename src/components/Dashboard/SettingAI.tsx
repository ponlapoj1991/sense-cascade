import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

const DEFAULT_AI_CONTEXT = 'คุณคือ AI ผู้ช่วยวิเคราะห์ข้อมูลบน Dashboard ตาม filter และข้อมูลที่เห็นขณะนี้';

export const SettingAI: React.FC = () => {
  const [contextPrompt, setContextPrompt] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedContext = localStorage.getItem('ai_context_prompt') || DEFAULT_AI_CONTEXT;
    setContextPrompt(storedContext);
    const storedKey = localStorage.getItem('openai_api_key') || '';
    setApiKey(storedKey);
  }, []);

  const handleSave = () => {
    localStorage.setItem('ai_context_prompt', contextPrompt);
    localStorage.setItem('openai_api_key', apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  return (
    <Card className="max-w-xl mx-auto mt-10 p-6">
      <div className="font-semibold text-lg mb-4">ตั้งค่า AI Context/Prompt & API Key</div>
      <div className="mb-2 text-sm text-muted-foreground">บทบาทของ AI หรือแนวทางการตอบ เช่น “บทบาทของคุณคือ...”</div>
      <Input
        value={contextPrompt}
        onChange={e => setContextPrompt(e.target.value)}
        className="mb-4"
        placeholder="ระบุ context/prompt ของ AI"
      />
      <div className="mb-2 text-sm text-muted-foreground">OpenAI API Key (sk-...)</div>
      <Input
        value={apiKey}
        onChange={e => setApiKey(e.target.value)}
        className="mb-4"
        placeholder="กรอก OpenAI API Key ของคุณ"
        type="password"
      />
      <Button onClick={handleSave} type="button">บันทึก</Button>
      {saved && <div className="text-green-600 text-sm mt-2">บันทึกเรียบร้อย</div>}
    </Card>
  );
};
