import { DisplayMode, Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'FollowThePathWebPartStrings';
import { EndlessRunnerGame } from './EndlessRunnerGame';
import { InMemoryPlayerProgressService } from './InMemoryPlayerProgressService';
import { InMemoryQuestionsService } from './InMemoryQuestionsService';
import { SharePointPlayerProgressService } from './SharePointPlayerProgressService';
import { SharePointQuestionsService } from './SharePointQuestionsService';
import { getDebugUserEmailFromUrl } from './debugUserOverride';
import { redirectToRegisterPage } from './registrationRedirect';
import type { IPlayerProgressService } from './IPlayerProgressService';
import type { Question } from './gameConfig';
import { DEBUG_SKIP_USER_CHECK } from './gameConfig';
import type { PlayerSession } from './playerProgressTypes';
import { createDefaultPlayerProgress } from './playerProgressTypes';

export interface IFollowThePathWebPartProps {
  description: string;
  /** Users list — profile and cross-game totals. Defaults to Users. */
  usersListTitle?: string;
  /** Game1Data list — Follow the Path progress (Email links to Users). Defaults to Game1Data. */
  game1DataListTitle?: string;
  /** Game1Questions list — scenario questions. Defaults to Game1Questions. */
  questionsListTitle?: string;
}

export default class FollowThePathWebPart extends BaseClientSideWebPart<IFollowThePathWebPartProps> {

  private _game: EndlessRunnerGame | undefined;
  private _renderGeneration: number = 0;

  public render(): void {
    this._disposeGame();
    this.domElement.innerHTML = '';
    const renderGeneration = ++this._renderGeneration;
    const progressService = new SharePointPlayerProgressService(this.context, {
      usersListTitle: this.properties.usersListTitle,
      game1DataListTitle: this.properties.game1DataListTitle,
      debugUserEmail: getDebugUserEmailFromUrl()
    });
    const questionsService = new SharePointQuestionsService(this.context, {
      questionsListTitle: this.properties.questionsListTitle
    });

    Promise.all([progressService.loadSession(), questionsService.loadQuestions()])
      .then(([session, questions]) => {
        if (renderGeneration !== this._renderGeneration) {
          return;
        }

        if (session.needsRegistration) {
          if (this._tryMountWithoutUserCheck(progressService, session, questions, renderGeneration)) {
            return;
          }

          redirectToRegisterPage();
          return;
        }

        this._mountGame(progressService, session, questions, renderGeneration);
      })
      .catch((error: unknown) => {
        if (renderGeneration !== this._renderGeneration) {
          return;
        }

        console.error('[FollowThePath] SharePoint session load failed; using in-memory fallback.', error);

        const fallbackService = new InMemoryPlayerProgressService();
        const fallbackQuestionsService = new InMemoryQuestionsService();

        Promise.all([fallbackService.loadSession(), fallbackQuestionsService.loadQuestions()])
          .then(([session, questions]) => {
            if (renderGeneration !== this._renderGeneration) {
              return;
            }

            if (session.needsRegistration) {
              if (this._tryMountWithoutUserCheck(fallbackService, session, questions, renderGeneration)) {
                return;
              }

              redirectToRegisterPage();
              return;
            }

            this._mountGame(fallbackService, session, questions, renderGeneration);
          })
          .catch((fallbackError: unknown) => {
            console.error('[FollowThePath] In-memory fallback load failed.', fallbackError);
          });
      });
  }

  private _tryMountWithoutUserCheck(
    progressService: IPlayerProgressService,
    session: PlayerSession,
    questions: Question[],
    renderGeneration: number
  ): boolean {
    if (!DEBUG_SKIP_USER_CHECK) {
      return false;
    }

    console.warn('[FollowThePath] DEBUG_SKIP_USER_CHECK: skipping Users list check for local testing.');

    const localSession: PlayerSession = {
      profile: session.profile,
      progress: createDefaultPlayerProgress(),
      needsRegistration: false
    };

    const localProgressService =
      progressService instanceof SharePointPlayerProgressService
        ? new InMemoryPlayerProgressService()
        : progressService;

    this._mountGame(localProgressService, localSession, questions, renderGeneration);
    return true;
  }

  private _mountGame(
    progressService: IPlayerProgressService,
    session: PlayerSession,
    questions: Question[],
    renderGeneration: number
  ): void {
    if (renderGeneration !== this._renderGeneration) {
      return;
    }

    this._game = new EndlessRunnerGame(this.domElement, {
      fullscreenLayout: this._isFullscreenLayout(),
      progressService,
      playerProgress: session.progress,
      questions
    });
  }

  private _isFullscreenLayout(): boolean {
    if (this.displayMode !== DisplayMode.Read) {
      return false;
    }

    const path = window.location.pathname.toLowerCase();
    const params = new URLSearchParams(window.location.search);

    return (
      path.indexOf('follow-the-path') !== -1 ||
      params.get('env') === 'WebView' ||
      params.get('layout') === 'fullscreen'
    );
  }

  protected onDispose(): void {
    this._disposeGame();
  }

  private _disposeGame(): void {
    if (this._game) {
      this._game.dispose();
      this._game = undefined;
    }
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                }),
                PropertyPaneTextField('usersListTitle', {
                  label: 'Users list title'
                }),
                PropertyPaneTextField('game1DataListTitle', {
                  label: 'Game1Data list title'
                }),
                PropertyPaneTextField('questionsListTitle', {
                  label: 'Game1Questions list title'
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
