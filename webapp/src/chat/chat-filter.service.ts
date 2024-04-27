// import { Injectable } from '@nestjs/common';
// import * as fs from 'fs';
// import * as path from 'path';

// @Injectable()
// export class ChatFilterService {
//   private bannedWords: string[];

//   constructor() {
//     this.loadBannedWords();
//   }

//   private loadBannedWords(): void {
//     try {
//       const filePath = path.resolve('src', 'chat', 'banned-words.txt'); // Txt 파일 경로 설정 src/chat/chat.html

//       const data = fs.readFileSync(filePath, 'utf8');
//       this.bannedWords = data.split('\n').map((word) => word.trim());
//     } catch (error) {
//       console.error('욕설 목록 파일 읽기 오류:', error);
//       this.bannedWords = [];
//     }
//   }

//   filterMessage(message: any): any {
//     if (!this.bannedWords || this.bannedWords.length === 0) {
//       return message;
//     }

//     let replaceMessage = message.data.toString();

//     const profanity = this.bannedWords;
//     function messageFilter(text) {
//       const regex = new RegExp(profanity.join('|'), 'gi');
//       return text.replace(regex, '**');
//     }

//     const filteredMessage = messageFilter(replaceMessage);

//     return filteredMessage;
//   }
// }

//ver2
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ChatFilterService {
  private bannedWords: string[];

  // constructor() {
  //   this.loadBannedWords();
  // }

  // private loadBannedWords(): void {
  //   try {
  //     const filePath = path.resolve('src', 'chat', 'banned-words.txt');

  //     const data = fs.readFileSync(filePath, 'utf8');
  //     this.bannedWords = data.split('\n').map((word) => word.trim());
  //   } catch (error) {
  //     console.error('욕설 목록 파일 읽기 오류:', error);
  //     this.bannedWords = [];
  //   }
  // }

  filterMessage(message: { message: string; clientId: string }): string {
    if (!this.bannedWords || this.bannedWords.length === 0) {
      return message.message;
    }

    const { message: originalMessage, clientId } = message;
    const clientIdPrefix = clientId.substring(0, 4); // 클라이언트 ID 앞 4글자 추출

    let filteredMessage = originalMessage;

    const profanity = this.bannedWords;
    function messageFilter(text) {
      const regex = new RegExp(profanity.join('|'), 'gi');
      return text.replace(regex, '**');
    }

    filteredMessage = messageFilter(filteredMessage);

    return `${clientIdPrefix} : ${filteredMessage}`;
  }
}
