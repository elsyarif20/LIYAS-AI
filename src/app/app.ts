import { ChangeDetectionStrategy, Component, inject, signal, ViewChild, ElementRef, ChangeDetectorRef, PLATFORM_ID, effect, untracked } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChatbotService } from './chatbot.service';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [CommonModule, MatIconModule, FormsModule, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  chatbotService = inject(ChatbotService);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  messageControl = new FormControl('');
  isProcessing = signal(false);
  
  constructor() {
    // Menggunakan effect untuk memantau perubahan history dan scroll ke bawah secara otomatis
    // setTimeout digunakan untuk memastikan scroll terjadi setelah DOM diperbarui
    effect(() => {
      this.chatbotService.history(); // Track changes
      if (isPlatformBrowser(this.platformId)) {
        untracked(() => {
          setTimeout(() => this.scrollToBottom(), 0);
        });
      }
    });
  }

  private scrollToBottom(): void {
    if (this.scrollContainer) {
      const el = this.scrollContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.cdr.markForCheck();
    }
  }

  async sendMessage() {
    const text = this.messageControl.value?.trim();
    if (!text || this.isProcessing()) return;

    this.messageControl.setValue('');
    this.isProcessing.set(true);
    this.cdr.markForCheck();
    
    try {
      await this.chatbotService.getResponse(text);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      // Gunakan setTimeout untuk memastikan perubahan state 'isProcessing' 
      // terjadi setelah siklus deteksi perubahan saat ini selesai.
      setTimeout(() => {
        this.isProcessing.set(false);
        this.cdr.markForCheck();
      }, 0);
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }
}
