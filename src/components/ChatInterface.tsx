import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { PdfIcon } from './icons/PdfIcon';
import { SendIcon } from './icons/SendIcon';
import MessageComponent from './Message';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  fileNames: string[];
  onReset: () => void;
  onGetGeneralAnswer: (question: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading, fileNames, onReset, onGetGeneralAnswer }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
        inputRef.current.style.height = 'auto'; // Reset height to shrink
        const scrollHeight = inputRef.current.scrollHeight;
        const newHeight = Math.min(scrollHeight, 150); // Cap at max height (approx. 5 lines)
        inputRef.current.style.height = `${newHeight}px`;

        if (newHeight >= 150) {
            inputRef.current.style.overflowY = 'auto';
        } else {
            inputRef.current.style.overflowY = 'hidden';
        }
    }
  }, [input]);


  const handleSubmit = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <header className="flex items-center justify-between p-4 border-b border-slate-700 shadow-md flex-shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <PdfIcon className="w-8 h-8 text-indigo-400 flex-shrink-0" />
          <div className="flex flex-col overflow-hidden">
            <h2 className="font-semibold text-lg truncate text-slate-200" title={fileNames.join(', ')}>
              {`${fileNames.length} ${fileNames.length > 2 ? 'ملفات' : 'ملف'} قيد التحليل`}
            </h2>
            <p className="text-sm text-slate-400 truncate" title={fileNames.join(', ')}>
                {fileNames.join(', ')}
            </p>
          </div>
        </div>
        <button 
          onClick={onReset}
          className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-600 transition-colors duration-200 flex-shrink-0"
        >
          ملفات جديدة
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg, index) => (
          <MessageComponent 
            key={index} 
            message={msg}
            previousMessage={index > 0 ? messages[index - 1] : undefined}
            onGetGeneralAnswer={onGetGeneralAnswer}
            isLoading={isLoading}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-700">
        <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="اسأل أي شيء عن الملفات..."
            className="flex-1 bg-slate-700 border border-slate-600 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow text-slate-200 placeholder-slate-400"
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            title="إرسال"
            className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center flex-shrink-0 disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-indigo-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500"
          >
            <SendIcon className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
