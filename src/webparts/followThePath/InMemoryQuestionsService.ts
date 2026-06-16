import type { Question } from './gameConfig';
import type { IQuestionsService } from './IQuestionsService';
import { DEFAULT_QUESTIONS } from './questionTypes';

export class InMemoryQuestionsService implements IQuestionsService {
  public async loadQuestions(): Promise<Question[]> {
    return DEFAULT_QUESTIONS.slice();
  }
}
