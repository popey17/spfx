import type { Question } from './gameConfig';

export interface IQuestionsService {
  loadQuestions(): Promise<Question[]>;
}
