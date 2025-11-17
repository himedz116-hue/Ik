import React, { useState, useCallback } from 'react';
import type { Chat } from '@google/genai';
import { startMultiFileChat, getGeneralResponseStream } from './services/geminiService';
import { Message, FileContent } from './types';
import FileUpload from './components/FileUpload';
import ChatInterface from './components/ChatInterface';

// Configure pdf.js worker
// @ts-ignore
if (window.pdfjsLib) {
  // @ts-ignore
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

const App: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [filesContent, setFilesContent] = useState<FileContent[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleFileSelect = useCallback(async (selectedFiles: FileList) => {
    setIsLoading(true);
    setError('');
    const fileList = Array.from(selectedFiles).filter(file => file.type.startsWith('image/') || file.type === 'application/pdf');

    if (fileList.length === 0) {
      setError('الرجاء اختيار ملفات PDF أو صور.');
      setIsLoading(false);
      return;
    }

    setFiles(fileList);
    setMessages([]);
    setFilesContent([]);
    setChat(null);

    try {
      const fileProcessingPromises = fileList.map(async (file): Promise<FileContent> => {
        if (file.type.startsWith('image/')) {
          return new Promise<FileContent>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
              const base64Data = (reader.result as string).split(',')[1];
              resolve({
                name: file.name,
                type: file.type,
                content: base64Data,
              });
            };
            reader.onerror = (error) => reject(error);
          });
        } else { // PDF
          // @ts-ignore
          if (!window.pdfjsLib) {
            throw new Error('مكتبة تحليل PDF لم يتم تحميلها. يرجى المحاولة مرة أخرى.');
          }
          const arrayBuffer = await file.arrayBuffer();
          // @ts-ignore
          const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n\n';
          }
          return { name: file.name, type: file.type, content: fullText };
        }
      });
      
      const contents = await Promise.all(fileProcessingPromises);
      setFilesContent(contents);

      const chatSession = startMultiFileChat(contents);
      setChat(chatSession);

      const fileNames = fileList.map(f => `"${f.name}"`).join(', ');
      setMessages([
        { sender: 'ai', text: `تم تحليل ${fileList.length} ملفات (${fileNames}). كيف يمكنني مساعدتك؟`, type: 'document' }
      ]);

    } catch (e) {
      console.error(e);
      setError('حدث خطأ أثناء تحليل الملفات. يرجى التأكد من أنها ملفات صالحة (PDF أو صور).');
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!chat || isLoading) return;

    const userMessage: Message = { sender: 'user', text: message };
    setMessages(prev => [...prev, userMessage, { sender: 'ai', text: '', type: 'document' }]);
    setIsLoading(true);
    setError('');

    try {
      const stream = await chat.sendMessageStream({ message });
      let fullText = '';
      for await (const chunk of stream) {
        fullText += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if(lastMessage) {
            lastMessage.text = fullText;
          }
          return newMessages;
        });
      }
    } catch (e) {
      console.error(e);
      const errorMessage = 'عذراً، حدث خطأ أثناء التواصل مع الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.';
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if(lastMessage) {
          lastMessage.text = errorMessage;
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  }, [chat, isLoading]);

  const handleGetGeneralAnswer = useCallback(async (question: string) => {
    if (isLoading) return;
    setIsLoading(true);
    setError('');
    
    setMessages(prev => [...prev, { sender: 'ai', text: '', type: 'general' }]);

    try {
      const stream = await getGeneralResponseStream(question);
      let fullText = '**إجابة عامة:**\n\n';
      // Set the initial part immediately
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].text = fullText;
        return newMessages;
      });

      for await (const chunk of stream) {
        fullText += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if(lastMessage) {
            lastMessage.text = fullText;
          }
          return newMessages;
        });
      }
    } catch (e) {
      console.error(e);
      const errorMessage = 'عذراً، حدث خطأ أثناء الحصول على إجابة عامة. يرجى المحاولة مرة أخرى.';
       setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if(lastMessage) {
            lastMessage.text = errorMessage;
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);


  const handleReset = () => {
    setFiles([]);
    setFilesContent([]);
    setChat(null);
    setMessages([]);
    setError('');
    setIsLoading(false);
  };

  return (
    <div className="bg-slate-900 min-h-screen text-white flex flex-col items-center justify-center p-4 transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-slate-900 to-purple-900/30 animate-gradient-xy -z-0"></div>
      <main className="w-full max-w-4xl h-[90vh] flex flex-col z-10 bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl shadow-indigo-500/10 border border-slate-700">
        {files.length === 0 || !chat ? (
          <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} error={error} />
        ) : (
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            fileNames={files.map(f => f.name)}
            onReset={handleReset}
            onGetGeneralAnswer={handleGetGeneralAnswer}
          />
        )}
      </main>
      <footer className="text-center p-4 text-slate-500 z-10 text-sm">
        <p>تصميم وتطوير بواسطة مهندس React خبير وواجهات Gemini</p>
      </footer>
    </div>
  );
};

export default App;
