import { Injectable, signal } from '@angular/core';
import { DATASET } from './dataset';
import { GoogleGenAI } from '@google/genai';

export type VoiceEmotion = 'casual' | 'serious' | 'excited' | 'default';

export interface ChatResponse {
  text: string;
  emotion: VoiceEmotion;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  private model = 'gemini-3-flash-preview';

  history = signal<{ role: 'user' | 'ai', text: string, emotion?: VoiceEmotion }[]>([
    { role: 'ai', text: "Halo! Saya LIYAS AI. Ada yang bisa saya bantu hari ini?", emotion: 'casual' }
  ]);

  async getResponse(text: string): Promise<ChatResponse> {
    this.history.update(h => [...h, { role: 'user', text }]);
    
    // 1. Try local dataset (Offline-first)
    const localMatch = this.matchLocal(text);
    if (localMatch) {
      const response: ChatResponse = { 
        text: localMatch.response, 
        emotion: this.inferEmotion(localMatch.response) 
      };
      this.history.update(h => [...h, { role: 'ai', text: response.text, emotion: response.emotion }]);
      return response;
    }

    // 2. Fallback to Gemini
    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: text,
        config: {
          systemInstruction: "Anda adalah LIYAS AI, asisten pribadi yang santai dan membantu. Gunakan bahasa Indonesia yang ramah. Jawab dengan singkat. Tentukan emosi jawaban Anda: 'casual', 'serious', atau 'excited'. Format jawaban: [EMOTION] Pesan Anda."
        }
      });
      
      let aiText = response.text || "Maaf, saya tidak mengerti.";
      let emotion: VoiceEmotion = 'casual';

      if (aiText.startsWith('[SERIOUS]')) {
        emotion = 'serious';
        aiText = aiText.replace('[SERIOUS]', '').trim();
      } else if (aiText.startsWith('[EXCITED]')) {
        emotion = 'excited';
        aiText = aiText.replace('[EXCITED]', '').trim();
      } else if (aiText.startsWith('[CASUAL]')) {
        emotion = 'casual';
        aiText = aiText.replace('[CASUAL]', '').trim();
      }

      const chatResp: ChatResponse = { text: aiText, emotion };
      this.history.update(h => [...h, { role: 'ai', text: chatResp.text, emotion: chatResp.emotion }]);
      return chatResp;
    } catch (error) {
      console.error('Gemini error:', error);
      const fallback: ChatResponse = { text: "Maaf, saya sedang mengalami gangguan koneksi.", emotion: 'serious' };
      this.history.update(h => [...h, { role: 'ai', text: fallback.text, emotion: fallback.emotion }]);
      return fallback;
    }
  }

  private matchLocal(text: string) {
    const lowerText = text.toLowerCase();
    for (const item of DATASET) {
      if (item.keywords.some(k => lowerText.includes(k))) {
        return item;
      }
    }
    return null;
  }

  private inferEmotion(text: string): VoiceEmotion {
    const lower = text.toLowerCase();
    if (lower.includes('!') || lower.includes('😄') || lower.includes('senang')) return 'excited';
    if (lower.includes('maaf') || lower.includes('berat') || lower.includes('fase')) return 'serious';
    return 'casual';
  }
}
