import React from 'react';
import { Message } from '../types';
import { BotIcon } from './icons/BotIcon';
import { UserIcon } from './icons/UserIcon';
import { SparkleIcon } from './icons/SparkleIcon';

interface MessageComponentProps {
  message: Message;
  previousMessage?: Message;
  onGetGeneralAnswer: (question: string) => void;
  isLoading: boolean;
}

const parseText = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-purple-300">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="italic text-indigo-300 not-italic font-medium">{part.slice(1, -1)}</em>;
    }
    return part;
  });
};


const MessageComponent: React.FC<MessageComponentProps> = ({ message, previousMessage, onGetGeneralAnswer, isLoading }) => {
  const isUser = message.sender === 'user';
  
  const showGeneralAnswerButton = 
    !isUser && 
    message.type === 'document' && 
    previousMessage?.sender === 'user';

  return (
    <div className={`flex flex-col animate-fade-in-up ${isUser ? 'items-end' : 'items-start'}`}>
      <div className={`flex items-end gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
        {!isUser && (
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
            <BotIcon className="w-6 h-6 text-white" />
          </div>
        )}
        <div
          className={`rounded-2xl p-4 max-w-lg lg:max-w-xl shadow-md ${
            isUser
              ? 'bg-indigo-600 text-white rounded-br-none'
              : 'bg-slate-700 text-slate-200 rounded-bl-none'
          }`}
        >
          <p className="whitespace-pre-wrap">{parseText(message.text)}</p>
        </div>
        {isUser && (
           <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-6 h-6 text-slate-300" />
          </div>
        )}
      </div>
      {showGeneralAnswerButton && previousMessage && (
        <div className="pl-14 pt-2">
            <button
                onClick={() => onGetGeneralAnswer(previousMessage.text)}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-purple-300 bg-purple-500/10 rounded-full border border-purple-500/20 hover:bg-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="الحصول على إجابة عامة للسؤال السابق"
            >
                <SparkleIcon className="w-4 h-4" />
                <span>الحصول على إجابة عامة</span>
            </button>
        </div>
      )}
    </div>
  );
};

export default MessageComponent;
