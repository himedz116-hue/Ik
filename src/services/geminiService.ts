import { GoogleGenAI, Chat } from "@google/genai";
import { FileContent } from "../types";

// Fix: Aligned `GoogleGenAI` initialization with the coding guidelines by removing the type assertion.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export function startMultiFileChat(filesContent: FileContent[]): Chat {
  const model = 'gemini-2.5-flash';

  const initialPromptParts: any[] = [
    { text: 'مرحباً، سأقوم بتزويدك بمحتوى عدة ملفات لتحليلها. يرجى تأكيد استلامك للمحتويات والاستعداد للإجابة على أسئلتي بخصوصها.\n\nالمحتويات:\n---\n' }
  ];

  filesContent.forEach(file => {
    if (file.type.startsWith('image/')) {
      initialPromptParts.push({ text: `صورة باسم "${file.name}":\n` });
      initialPromptParts.push({
        inlineData: {
          mimeType: file.type,
          data: file.content
        }
      });
      initialPromptParts.push({ text: `\n---\n` });
    } else { // PDF
      initialPromptParts.push({
        text: `محتوى ملف PDF باسم "${file.name}":\n\n${file.content}\n---\n`
      });
    }
  });

  const chat = ai.chats.create({
    model,
    config: {
        systemInstruction: `أنت مساعد ذكاء اصطناعي خبير ومتخصص في تحليل المستندات والصور. كن دقيقاً، ومساعداً، واستند في إجاباتك فقط على المحتوى المتوفر. تذكر سياق المحادثة. قم بتنسيق الكلمات المهمة باستخدام *الكلمة* والكلمات المهمة جداً باستخدام **الكلمة** لتسليط الضوء عليها.`,
    },
    history: [
      {
        role: 'user',
        parts: initialPromptParts
      },
      {
        role: 'model',
        parts: [{ text: "تم استلام محتوى الملفات بنجاح. أنا جاهز الآن. تفضل بطرح أسئلتك." }]
      }
    ]
  });

  return chat;
}

export async function getGeneralResponseStream(message: string) {
    const model = 'gemini-2.5-pro';
    const responseStream = await ai.models.generateContentStream({
        model,
        contents: message,
        config: {
            systemInstruction: 'أنت مساعد ذكاء اصطناعي عام ومفيد. قدم إجابات دقيقة وشاملة. قم بتنسيق الكلمات المهمة باستخدام *الكلمة* والكلمات المهمة جداً باستخدام **الكلمة** لتسليط الضوء عليها.',
        }
    });
    return responseStream;
}
