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

  async generateDailyChallenge(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const today = new Date().toISOString().split('T')[0];
    if (user.lastDailyGameAt === today) {
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
        coins: Math.floor(Math.random() * 20) + 10, // 10-30 Coins
      },
      difficulty: 'HARD',
    };
  }

  async verifyDailyChallenge(userId: string, id: string, answer: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const today = new Date().toISOString().split('T')[0];
    if (user.lastDailyGameAt === today) {
       throw new ForbiddenException('You have already completed the daily challenge today.');
    }

    const result = await this.verifyScramble(id, answer);

    if (result.success) {
      // Random reward
      const xp = Math.floor(Math.random() * 50) + 50;
      const coins = Math.floor(Math.random() * 20) + 10;
      
      await this.usersService.addRewards(userId, xp, coins);
      
      return {
        ...result,
        rewards: { xp, coins },
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

  async verifyScramble(id: string, answer: string) {
    const vocab = await this.vocabulariesService.findAll(); 
    const item = vocab.find(v => v.id === id);
    
    if (!item) return { success: false, message: 'Word not found' };

    const isCorrect = item.word.toLowerCase() === answer.toLowerCase();
    return {
      success: isCorrect,
      correctWord: isCorrect ? item.word : null,
      message: isCorrect ? 'Correct!' : 'Try again!',
    };
  }
}
