
import React from 'react';
import { Message, Sender } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === Sender.USER;
  const isSystem = message.sender === Sender.SYSTEM;

  if (isSystem) {
    return (
      <div className="flex justify-center my-4 px-4">
        <span className="bg-red-50 text-red-600 text-[10px] font-bold px-4 py-1.5 rounded-full border border-red-100 shadow-sm">
          <i className="fas fa-circle-exclamation mr-1"></i> {message.text}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex flex-col max-w-[85%] ${isUser ? 'items-start' : 'items-end'}`}>
        <div 
          className={`px-5 py-3.5 rounded-3xl shadow-md transition-all hover:shadow-lg ${
            isUser 
              ? 'bg-indigo-600 text-white rounded-tr-none' 
              : 'bg-white text-gray-900 border border-gray-100 rounded-tl-none font-medium'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
        </div>
        <span className="text-[9px] text-gray-400 mt-1.5 font-bold px-2 flex items-center gap-1">
          {message.timestamp.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
          {!isUser && <i className="fas fa-check-double text-indigo-400"></i>}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;
