import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import api from '../api/client';
import {
  Bot,
  Send,
  User,
  Sparkles,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react';

const QUICK_PROMPTS = [
  'Laptop won’t turn on or charge',
  'Blue Screen of Death (BSOD) crashing constantly',
  'Accidental water or coffee spill on laptop',
  'Laptop fan making loud noise & overheating',
  'System is extremely slow and freezing',
];

export const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `Hello! I am the Lapy Procare Virtual IT Assistant. 
Describe your computer's symptoms (e.g., liquid spill, black screen, thermal overheating, or slow boots), and I will provide preliminary diagnostic triage and safety guidelines.`,
      suggestedService: null,
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isTyping) return;

    const userMsg = { sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const res = await api.post('/ai/troubleshoot', { message: text });
      const { reply, suggestedService, bookingRecommended } = res.data.data;

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: reply,
          suggestedService,
          bookingRecommended,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text:
            err.response?.data?.message ||
            'Unable to process diagnostic inquiry. Please connect with our engineers via WhatsApp at +91 7666104889.',
          suggestedService: 'Hardware Troubleshooting',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        sender: 'bot',
        text: 'Chat history cleared. How can I assist with your computer hardware or software today?',
      },
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <Badge status="Diagnosis in Progress" className="bg-indigo-50 text-indigo-700 border-indigo-200">
          Automated IT Triage
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#111827] font-['Sora']">
          AI Hardware Assistant
        </h1>
        <p className="text-[#64748B] text-xs sm:text-sm">
          Instant preliminary symptom check before you bring your device to our Vamanjoor lab.
        </p>
      </div>

      {/* Main Chat Interface */}
      <Card className="p-0 border-[#E2E8F0] bg-white rounded-3xl overflow-hidden shadow-card flex flex-col h-[600px]">
        {/* Chat Header Bar */}
        <div className="px-6 py-4 bg-slate-50 border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#111827]">Lapy Procare Diagnostic AI</h3>
              <p className="text-[11px] text-teal-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span> Online Consultation
              </p>
            </div>
          </div>
          <button
            onClick={handleClear}
            title="Reset Chat"
            className="text-xs text-[#64748B] hover:text-[#111827] flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear
          </button>
        </div>

        {/* Chat History Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'bot' && (
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-[#4F46E5] text-white rounded-tr-none'
                    : 'bg-slate-50 border border-slate-200 text-[#111827] rounded-tl-none'
                }`}
              >
                {msg.text}

                {/* Suggested Service & Booking Action Button */}
                {msg.suggestedService && (
                  <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] text-indigo-600 font-bold">
                      Recommended: {msg.suggestedService}
                    </span>
                    <Link to={`/customer/book?service=${encodeURIComponent(msg.suggestedService)}`}>
                      <Button size="sm" variant="outline" className="text-xs py-1 px-2.5">
                        Book Diagnostic Slot
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 px-4 py-2.5 rounded-2xl w-fit">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing diagnostic symptom matrix...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Symptoms Pills */}
        <div className="px-6 py-2.5 bg-slate-50 border-t border-[#E2E8F0] overflow-x-auto flex gap-2">
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="px-3 py-1 bg-white hover:bg-indigo-50 text-[#475569] hover:text-indigo-700 border border-[#E2E8F0] text-[11px] rounded-full whitespace-nowrap shrink-0 transition-colors shadow-sm"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-[#E2E8F0]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Describe what happened to your computer..."
              className="flex-1 bg-slate-50 border border-[#E2E8F0] rounded-xl px-4 py-3 text-xs sm:text-sm text-[#111827] placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
            <Button type="submit" size="md" isLoading={isTyping} icon={Send}>
              Send
            </Button>
          </form>
        </div>
      </Card>

      {/* Safety Notice */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-800 max-w-2xl mx-auto shadow-sm">
        <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Safety Advisory:</strong> Never attempt to disassemble high-voltage power supplies or puncture swollen lithium batteries. If you smell burning electronics, immediately cut power and bring the device to our workshop.
        </p>
      </div>
    </div>
  );
};
