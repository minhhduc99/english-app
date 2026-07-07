import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { VocabulariesService } from '../vocabularies/vocabularies.service';
import { UsersService } from '../users/services/users.service';

@Injectable()
export class GamesService {
  constructor(
    private readonly vocabulariesService: VocabulariesService,
    private readonly usersService: UsersService,
  ) {}

  async generateScramble(count: number = 5) {
    const allVocabs = await this.vocabulariesService.findAll();
    
    // Pick random words
    const shuffled = allVocabs.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    return selected.map(vocab => ({
      id: vocab.id,
      scrambled: this.scrambleString(vocab.word),
      hint: vocab.definition,
      wordLength: vocab.word.length,
    }));
  }

  async generateSentence(count: number = 5) {
    const allVocabs = await this.vocabulariesService.findAll();
    // Filter out items without example sentences and shuffle
    const pool = allVocabs.filter(v => v.example && v.example.length > 10);
    const shuffled = pool.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    return selected.map(vocab => ({
      id: vocab.id,
      scrambledWords: this.scrambleWords(vocab.example),
      correctSentence: vocab.example,
      hint: vocab.word,
    }));
  }

  async generateMemoryMatch(count: number = 6) {
    const allVocabs = await this.vocabulariesService.findAll();
    // Shuffle and pick words
    const shuffled = allVocabs.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    const cards = [];
    selected.forEach(vocab => {
      // Create word card
      cards.push({
        id: `word-${vocab.id}`,
        vocabId: vocab.id,
        content: vocab.word,
        type: 'WORD',
      });
      // Create definition card
      cards.push({
        id: `def-${vocab.id}`,
        vocabId: vocab.id,
        content: vocab.definition,
        type: 'DEFINITION',
      });
    });

    // Final shuffle of the pair cards
    return cards.sort(() => 0.5 - Math.random());
  }

  async generateTranslationQuiz(count: number = 5) {
    const allVocabs = await this.vocabulariesService.findAll();
    const shuffled = allVocabs.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    return selected.map(vocab => {
      const type = Math.random() > 0.5 ? 'EN_VN' : 'VN_EN';
      const question = type === 'EN_VN' ? vocab.word : vocab.definition;
      const correctAnswer = type === 'EN_VN' ? vocab.definition : vocab.word;

      return {
        id: vocab.id,
        type,
        question,
      };
    });
  }

  private scrambleWords(sentence: string): string[] {
    const words = sentence.split(' ');
    // Fisher-Yates shuffle
    for (let i = words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [words[i], words[j]] = [words[j], words[i]];
    }
    
    // Ensure it's actually scrambled (not same as original)
    if (words.join(' ') === sentence && words.length > 1) {
      return this.scrambleWords(sentence);
    }
    
    return words;
  }

  async generateDailyChallenge(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const today = new Date().toISOString().split('T')[0];
    if (user.studentStats?.lastDailyGameAt === today) {
      return { completed: true, message: 'Daily challenge already completed!' };
    }

    const allVocabs = await this.vocabulariesService.findAll();
    // For "Difficult" challenge, pick a long word or a complex one
    const difficultVocabs = allVocabs.filter(v => v.word.length > 7);
    const pool = difficultVocabs.length > 0 ? difficultVocabs : allVocabs;
    
    const selected = pool[Math.floor(Math.random() * pool.length)];

    return {
      completed: false,
      id: selected.id,
      scrambled: this.scrambleString(selected.word),
      hint: selected.definition,
      rewardPotential: {
        xp: Math.floor(Math.random() * 50) + 50, // 50-100 XP
        stickers: Math.floor(Math.random() * 20) + 10, // 10-30 Stickers
      },
      difficulty: 'HARD',
    };
  }

  async verifyDailyChallenge(userId: string, id: string, answer: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const today = new Date().toISOString().split('T')[0];
    if (user.studentStats?.lastDailyGameAt === today) {
       throw new ForbiddenException('You have already completed the daily challenge today.');
    }

    const result = await this.verifyScramble(null!, id, answer);

    if (result.success) {
      // Random reward
      const xp = Math.floor(Math.random() * 50) + 50;
      const stickers = Math.floor(Math.random() * 20) + 10;
      
      const stats = await this.usersService.addRewards(userId, xp, stickers, true);
      
      return {
        ...result,
        rewards: { xp, stickers },
        stats,
      };
    }

    return result;
  }

  private scrambleString(str: string): string {
    const arr = str.split('');
    let n = arr.length;

    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    const scrambled = arr.join('');
    
    // Ensure it's actually scrambled (not same as original)
    if (scrambled === str && str.length > 1) {
      return this.scrambleString(str);
    }
    
    return scrambled;
  }

  private normalizeString(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/[.,!?;:()\[\]{}]/g, '') // Remove punctuation
      .replace(/\s+/g, ' '); // Normalize multiple spaces to a single space
  }

  async verifyScramble(userId: string, id: string, answer: string) {
    const vocab = await this.vocabulariesService.findAll(); 
    const item = vocab.find(v => v.id === id);
    
    if (!item) return { success: false, message: 'Word not found' };

    const isCorrect = this.normalizeString(item.word) === this.normalizeString(answer);
    
    let rewards = null;
    let stats = null;

    if (isCorrect && userId) {
      const xp = 20;
      const stickers = 5;
      stats = await this.usersService.addRewards(userId, xp, stickers, false);
      rewards = { xp, stickers };
    }

    return {
      success: isCorrect,
      correctWord: item.word,
      message: isCorrect ? 'Correct!' : 'Try again!',
      rewards,
      stats,
    };
  }

  async verifySentence(userId: string, id: string, answer: string) {
    const vocab = await this.vocabulariesService.findAll();
    const item = vocab.find(v => v.id === id);
    
    if (!item) return { success: false, message: 'Sentence not found' };

    const isCorrect = this.normalizeString(item.example) === this.normalizeString(answer);

    let rewards = null;
    let stats = null;

    if (isCorrect && userId) {
      const xp = 30;
      const stickers = 10;
      stats = await this.usersService.addRewards(userId, xp, stickers, false);
      rewards = { xp, stickers };
    }

    return {
      success: isCorrect,
      correctSentence: item.example,
      message: isCorrect ? 'Correct!' : 'Try again!',
      rewards,
      stats,
    };
  }

  async awardGameReward(userId: string, mode: string) {
    let xp = 10;
    let stickers = 2;

    if (mode === 'memory') {
      xp = 40;
      stickers = 15;
    }

    const stats = await this.usersService.addRewards(userId, xp, stickers, false);
    
    return {
      success: true,
      rewards: { xp, stickers },
      stats,
    };
  }

  async verifyTranslation(userId: string, id: string, answer: string, type: 'EN_VN' | 'VN_EN') {
    const vocab = await this.vocabulariesService.findAll();
    const item = vocab.find(v => v.id === id);
    
    if (!item) return { success: false, message: 'Word not found' };

    const correctAnswer = type === 'EN_VN' ? item.definition : item.word;
    const isCorrect = this.normalizeString(correctAnswer) === this.normalizeString(answer);

    let rewards = null;
    let stats = null;

    if (isCorrect && userId) {
      const xp = 25;
      const stickers = 8;
      stats = await this.usersService.addRewards(userId, xp, stickers, false);
      rewards = { xp, stickers };
    }

    return {
      success: isCorrect,
      correctAnswer: correctAnswer,
      message: isCorrect ? 'Correct!' : 'Try again!',
      rewards,
      stats,
    };
  }
}
