import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import type { WebPartContext } from '@microsoft/sp-webpart-base';

import type { Question } from './gameConfig';
import type { IQuestionsService } from './IQuestionsService';
import {
  buildQuestionFieldMapFromListFields,
  EXCEL_IMPORT_QUESTION_FIELD_MAP,
  getQuestionSelectFields,
  mergeQuestionFieldMaps,
  parseQuestionsFromListItems,
  QUESTIONS_LIST_CONFIG,
  resolveQuestions,
  type QuestionFieldMap,
  type SharePointListFieldDefinition
} from './questionTypes';

export interface SharePointQuestionsServiceOptions {
  questionsListTitle?: string;
}

export class SharePointQuestionsService implements IQuestionsService {
  private readonly _context: WebPartContext;
  private readonly _questionsListTitle: string;

  public constructor(context: WebPartContext, options: SharePointQuestionsServiceOptions = {}) {
    this._context = context;
    this._questionsListTitle = options.questionsListTitle || QUESTIONS_LIST_CONFIG.listTitle;
  }

  public async loadQuestions(): Promise<Question[]> {
    try {
      const discoveredFieldMap = await this._fetchQuestionFieldMap();
      const fieldMap = mergeQuestionFieldMaps(discoveredFieldMap, EXCEL_IMPORT_QUESTION_FIELD_MAP);
      const items = await this._fetchAllQuestions(fieldMap);
      const parsed = parseQuestionsFromListItems(items, fieldMap);

      return resolveQuestions(parsed, { fieldMap, rawItems: items });
    } catch (error: unknown) {
      console.error('[FollowThePath] SharePoint questions load failed; using built-in defaults.', error);
      return resolveQuestions(undefined);
    }
  }

  private async _fetchQuestionFieldMap(): Promise<Partial<QuestionFieldMap>> {
    const select = encodeURIComponent('Title,StaticName,InternalName,Hidden');
    const url =
      `${this._context.pageContext.web.absoluteUrl}` +
      `/_api/web/lists/getbytitle('${this._escapeODataString(this._questionsListTitle)}')/fields` +
      `?$select=${select}&$top=200`;

    const response: SPHttpClientResponse = await this._context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );

    if (!response.ok) {
      console.warn(
        '[FollowThePath] Could not read Game1Questions field metadata; falling back to default column names.',
        await this._readSharePointError(response, 'Failed to load list fields.')
      );
      return {};
    }

    const payload = (await response.json()) as { value?: SharePointListFieldDefinition[] };
    const visibleFields = (payload.value ?? []).filter((field) => field.Hidden !== true);
    return buildQuestionFieldMapFromListFields(visibleFields);
  }

  private async _fetchAllQuestions(
    fieldMap: Partial<QuestionFieldMap>
  ): Promise<Array<Record<string, unknown>>> {
    const listBaseUrl =
      `${this._context.pageContext.web.absoluteUrl}` +
      `/_api/web/lists/getbytitle('${this._escapeODataString(this._questionsListTitle)}')/items`;

    const selectQuery = encodeURIComponent(getQuestionSelectFields(fieldMap).join(','));
    const attempts = [`?$select=${selectQuery}&$top=100`, '?$top=100'];

    let lastError = `Failed to load list "${this._questionsListTitle}".`;

    for (const query of attempts) {
      const response: SPHttpClientResponse = await this._context.spHttpClient.get(
        `${listBaseUrl}${query}`,
        SPHttpClient.configurations.v1
      );

      if (response.ok) {
        const payload = (await response.json()) as { value?: Array<Record<string, unknown>> };
        return payload.value ?? [];
      }

      lastError = await this._readSharePointError(
        response,
        `Failed to load list "${this._questionsListTitle}".`
      );
    }

    throw new Error(lastError);
  }

  private _escapeODataString(value: string): string {
    return value.replace(/'/g, "''");
  }

  private async _readSharePointError(response: SPHttpClientResponse, fallback: string): Promise<string> {
    try {
      const text = await response.text();
      if (!text) {
        return `${fallback} (HTTP ${response.status})`;
      }

      const payload = JSON.parse(text) as { error?: { message?: { value?: string } } };
      return payload.error?.message?.value || `${fallback} (HTTP ${response.status})`;
    } catch {
      return `${fallback} (HTTP ${response.status})`;
    }
  }
}
