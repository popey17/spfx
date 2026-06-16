import {
  MAX_QUESTION_LEVEL,
  QUESTIONS,
  QUESTIONS_PER_LEVEL,
  TOTAL_QUESTION_COUNT,
  type Question
} from './gameConfig';

/**
 * Game1Questions list — scenario questions for Follow the Path.
 *
 * Display names: Level | SortOrder | Scenario | Prompt | Option1 | Option2 | CorrectIndex
 *
 * Lists created via Excel/CSV import often use internal names field_1 … field_7
 * (see EXCEL_IMPORT_QUESTION_FIELD_MAP).
 *
 * Level: 1 (Easy), 2 (Medium), 3 (Hard).
 * SortOrder: 1–4 within each level (maps to earned-question slot order).
 * CorrectIndex: 0 = Option1, 1 = Option2.
 */
export const QUESTIONS_LIST_CONFIG = {
  listTitle: 'Game1Questions',
  fields: {
    id: 'Id',
    level: 'Level',
    sortOrder: 'SortOrder',
    scenario: 'Scenario',
    prompt: 'Prompt',
    option1: 'Option1',
    option2: 'Option2',
    correctIndex: 'CorrectIndex'
  }
} as const;

/** Internal names assigned when the list is created from an Excel/CSV import. */
export const EXCEL_IMPORT_QUESTION_FIELD_MAP: QuestionFieldMap = {
  level: 'field_1',
  sortOrder: 'field_2',
  scenario: 'field_3',
  prompt: 'field_4',
  option1: 'field_5',
  option2: 'field_6',
  correctIndex: 'field_7'
};

export type QuestionFieldKey = keyof typeof QUESTIONS_LIST_CONFIG.fields;

export interface QuestionFieldMap {
  level: string;
  sortOrder: string;
  scenario: string;
  prompt: string;
  option1: string;
  option2: string;
  correctIndex: string;
}

export interface SharePointListFieldDefinition {
  Title?: string;
  StaticName?: string;
  InternalName?: string;
  Hidden?: boolean;
}

export const DEFAULT_QUESTIONS: Question[] = QUESTIONS;

const QUESTION_DATA_FIELD_KEYS: Array<keyof QuestionFieldMap> = [
  'level',
  'sortOrder',
  'scenario',
  'prompt',
  'option1',
  'option2',
  'correctIndex'
];

/** Display names and static names to match when resolving list columns. */
const QUESTION_FIELD_DISPLAY_MATCHES: Record<keyof QuestionFieldMap, string[]> = {
  level: ['Level', 'QuestionLevel', 'Question Level'],
  sortOrder: ['SortOrder', 'Sort Order', 'Order'],
  scenario: ['Scenario', 'Question Scenario', 'Question'],
  prompt: ['Prompt', 'Question Prompt'],
  option1: ['Option1', 'Option 1', 'Answer1', 'Answer 1', 'Choice1', 'Choice 1'],
  option2: ['Option2', 'Option 2', 'Answer2', 'Answer 2', 'Choice2', 'Choice 2'],
  correctIndex: ['CorrectIndex', 'Correct Index', 'Correct Answer', 'CorrectAnswer']
};

/** SharePoint may encode spaces in column internal names (e.g. Option_x0020_1). */
const QUESTION_FIELD_ALIASES: Record<keyof QuestionFieldMap, string[]> = {
  level: ['Level', 'QuestionLevel', 'field_1'],
  sortOrder: ['SortOrder', 'Sort_x0020_Order', 'field_2'],
  scenario: ['Scenario', 'field_3'],
  prompt: ['Prompt', 'field_4'],
  option1: ['Option1', 'Option_x0020_1', 'Option_1', 'field_5'],
  option2: ['Option2', 'Option_x0020_2', 'Option_2', 'field_6'],
  correctIndex: ['CorrectIndex', 'Correct_x0020_Index', 'CorrectIndex0', 'field_7']
};

export function buildQuestionFieldMapFromListFields(
  listFields: SharePointListFieldDefinition[]
): Partial<QuestionFieldMap> {
  const map: Partial<QuestionFieldMap> = {};

  for (let fieldIndex = 0; fieldIndex < QUESTION_DATA_FIELD_KEYS.length; fieldIndex++) {
    const logicalKey = QUESTION_DATA_FIELD_KEYS[fieldIndex];
    const candidates = QUESTION_FIELD_DISPLAY_MATCHES[logicalKey];
    let matchedField: SharePointListFieldDefinition | undefined;

    for (let listIndex = 0; listIndex < listFields.length; listIndex++) {
      const field = listFields[listIndex];
      const title = normalizeFieldToken(field.Title);
      const staticName = normalizeFieldToken(field.StaticName || field.InternalName);

      for (let candidateIndex = 0; candidateIndex < candidates.length; candidateIndex++) {
        const normalizedCandidate = normalizeFieldToken(candidates[candidateIndex]);
        if (title === normalizedCandidate || staticName === normalizedCandidate) {
          matchedField = field;
          break;
        }
      }

      if (matchedField) {
        break;
      }
    }

    if (matchedField) {
      map[logicalKey] = matchedField.StaticName || matchedField.InternalName || '';
    }
  }

  return map;
}

export function mergeQuestionFieldMaps(
  primary: Partial<QuestionFieldMap>,
  fallback: Partial<QuestionFieldMap>
): Partial<QuestionFieldMap> {
  const merged: Partial<QuestionFieldMap> = {};

  for (let fieldIndex = 0; fieldIndex < QUESTION_DATA_FIELD_KEYS.length; fieldIndex++) {
    const logicalKey = QUESTION_DATA_FIELD_KEYS[fieldIndex];
    merged[logicalKey] = primary[logicalKey] || fallback[logicalKey];
  }

  return merged;
}

export function getQuestionSelectFields(fieldMap?: Partial<QuestionFieldMap>): string[] {
  const selectFields: string[] = [QUESTIONS_LIST_CONFIG.fields.id];
  const seen: Record<string, boolean> = { [QUESTIONS_LIST_CONFIG.fields.id]: true };

  for (let fieldIndex = 0; fieldIndex < QUESTION_DATA_FIELD_KEYS.length; fieldIndex++) {
    const logicalKey = QUESTION_DATA_FIELD_KEYS[fieldIndex];
    const mappedName = fieldMap?.[logicalKey] || QUESTIONS_LIST_CONFIG.fields[logicalKey];

    if (!seen[mappedName]) {
      seen[mappedName] = true;
      selectFields.push(mappedName);
    }
  }

  return selectFields;
}

export function readQuestionFromListItem(
  item: Record<string, unknown>,
  fieldMap?: Partial<QuestionFieldMap>
): Question {
  const option1 = String(readQuestionListField(item, 'option1', fieldMap) ?? '').trim();
  const option2 = String(readQuestionListField(item, 'option2', fieldMap) ?? '').trim();
  const correctIndex = toNumber(readQuestionListField(item, 'correctIndex', fieldMap), 0);

  return {
    level: parseQuestionLevel(readQuestionListField(item, 'level', fieldMap)),
    scenario: String(readQuestionListField(item, 'scenario', fieldMap) ?? '').trim(),
    prompt: String(readQuestionListField(item, 'prompt', fieldMap) ?? 'WHAT DO YOU DO?').trim(),
    options: [option1, option2],
    correctIndex: correctIndex <= 0 ? 0 : 1
  };
}

export function readQuestionListField(
  item: Record<string, unknown>,
  fieldKey: keyof QuestionFieldMap,
  fieldMap?: Partial<QuestionFieldMap>
): unknown {
  const keys: string[] = [];

  const mappedName = fieldMap?.[fieldKey];
  if (mappedName) {
    keys.push(mappedName);
  }

  for (let aliasIndex = 0; aliasIndex < QUESTION_FIELD_ALIASES[fieldKey].length; aliasIndex++) {
    keys.push(QUESTION_FIELD_ALIASES[fieldKey][aliasIndex]);
  }

  for (const key of keys) {
    const value = getItemValueCaseInsensitive(item, key);
    if (hasFieldValue(value)) {
      return value;
    }
  }

  return getItemValueByToken(item, fieldKey);
}

export function parseQuestionsFromListItems(
  items: Array<Record<string, unknown>>,
  fieldMap?: Partial<QuestionFieldMap>
): Question[] {
  return items
    .slice()
    .sort((left, right) => {
      const levelDelta =
        parseQuestionLevel(readQuestionListField(left, 'level', fieldMap)) -
        parseQuestionLevel(readQuestionListField(right, 'level', fieldMap));
      if (levelDelta !== 0) {
        return levelDelta;
      }

      return (
        toNumber(readQuestionListField(left, 'sortOrder', fieldMap), 0) -
        toNumber(readQuestionListField(right, 'sortOrder', fieldMap), 0)
      );
    })
    .map((item) => readQuestionFromListItem(item, fieldMap));
}

export function isValidQuestionSet(questions: Question[]): boolean {
  if (questions.length !== TOTAL_QUESTION_COUNT) {
    return false;
  }

  for (let level = 1; level <= MAX_QUESTION_LEVEL; level++) {
    const levelQuestions = questions.filter((question) => question.level === level);
    if (levelQuestions.length !== QUESTIONS_PER_LEVEL) {
      return false;
    }
  }

  for (const question of questions) {
    if (!question.scenario || !question.prompt) {
      return false;
    }

    if (question.options.length < 2 || !question.options[0] || !question.options[1]) {
      return false;
    }

    if (question.correctIndex < 0 || question.correctIndex >= question.options.length) {
      return false;
    }
  }

  return true;
}

export function resolveQuestions(
  loaded: Question[] | undefined,
  diagnostics?: {
    fieldMap?: Partial<QuestionFieldMap>;
    rawItems?: Array<Record<string, unknown>>;
  }
): Question[] {
  if (loaded && isValidQuestionSet(loaded)) {
    return loaded;
  }

  if (loaded && loaded.length > 0) {
    const sampleRaw = diagnostics?.rawItems?.[0];
    console.warn(
      '[FollowThePath] SharePoint returned question rows but required fields are missing or invalid; using built-in defaults.',
      {
        rowCount: loaded.length,
        fieldMap: diagnostics?.fieldMap,
        sampleParsed: loaded[0],
        sampleRawKeys: sampleRaw ? Object.keys(sampleRaw) : [],
        sampleRaw
      }
    );
  }

  return DEFAULT_QUESTIONS.slice();
}

function parseQuestionLevel(value: unknown): number {
  const numeric = toNumber(value, 0);
  if (numeric >= 1 && numeric <= MAX_QUESTION_LEVEL) {
    return numeric;
  }

  const text = String(value || '').toLowerCase();
  if (text.indexOf('easy') !== -1) {
    return 1;
  }
  if (text.indexOf('medium') !== -1 || text.indexOf('intermediate') !== -1) {
    return 2;
  }
  if (text.indexOf('hard') !== -1 || text.indexOf('advanced') !== -1) {
    return 3;
  }

  return 1;
}

function getItemValueCaseInsensitive(item: Record<string, unknown>, key: string): unknown {
  if (hasFieldValue(item[key])) {
    return item[key];
  }

  const normalizedKey = normalizeFieldToken(key);
  for (const itemKey of Object.keys(item)) {
    if (normalizeFieldToken(itemKey) === normalizedKey) {
      const value = item[itemKey];
      if (hasFieldValue(value)) {
        return value;
      }
    }
  }

  return undefined;
}

function getItemValueByToken(item: Record<string, unknown>, fieldKey: keyof QuestionFieldMap): unknown {
  const token = fieldKey.toLowerCase();

  for (const itemKey of Object.keys(item)) {
    const normalizedKey = normalizeFieldToken(itemKey);
    if (
      normalizedKey === token ||
      normalizedKey.indexOf(token) !== -1 ||
      normalizedKey.replace(/[^a-z0-9]/g, '') === token
    ) {
      const value = item[itemKey];
      if (hasFieldValue(value)) {
        return value;
      }
    }
  }

  return undefined;
}

function normalizeFieldToken(value: unknown): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/_x0020_/g, ' ')
    .replace(/[^a-z0-9]/g, '');
}

function hasFieldValue(value: unknown): boolean {
  return value !== undefined && value !== null && value !== '';
}

function toNumber(value: unknown, fallback: number): number {
  const parsed = typeof value === 'number' ? value : parseInt(String(value), 10);
  return isNaN(parsed) ? fallback : parsed;
}
