import { DisplayMode, Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'FollowThePathWebPartStrings';
import { EndlessRunnerGame } from './EndlessRunnerGame';
import { InMemoryPlayerProgressService } from './InMemoryPlayerProgressService';
import { SharePointPlayerProgressService } from './SharePointPlayerProgressService';
import { SharePointQuestionsService } from './SharePointQuestionsService';
import { getDebugUserEmailFromUrl } from './debugUserOverride';
import {
  redirectToRegisterPage,
  isNoRedirectFromUrl,
  resolveActiveUserEmail,
  syncGamePageUrlParams
} from './registrationRedirect';
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
    const lookupEmail = this._resolveActiveUserEmail();
    const progressService = new SharePointPlayerProgressService(this.context, {
      usersListTitle: this.properties.usersListTitle,
      game1DataListTitle: this.properties.game1DataListTitle,
      lookupEmail
    });
    const questionsService = new SharePointQuestionsService(this.context, {
      questionsListTitle: this.properties.questionsListTitle
    });

    Promise.all([progressService.loadSession(), questionsService.loadQuestions()])
      .then(([session, questions]) => {
        if (renderGeneration !== this._renderGeneration) {
          return;
        }

        this._handleLoadedSession(progressService, session, questions, renderGeneration);
      })
      .catch((error: unknown) => {
        if (renderGeneration !== this._renderGeneration) {
          return;
        }

        console.error('[FollowThePath] SharePoint progress load failed.', error);

        if (isNoRedirectFromUrl() || DEBUG_SKIP_USER_CHECK) {
          const fallbackService = new InMemoryPlayerProgressService();
          fallbackService
            .loadSession()
            .then((session) =>
              questionsService.loadQuestions().then((questions) => ({ session, questions }))
            )
            .then(({ session, questions }) => {
              if (renderGeneration !== this._renderGeneration) {
                return;
              }

              this._tryMountWithoutRegistration(fallbackService, session, questions, renderGeneration);
            })
            .catch((fallbackError: unknown) => {
              console.error('[FollowThePath] Fallback load failed.', fallbackError);
            });
          return;
        }

        this.domElement.innerHTML =
          '<p style="padding:16px;font-family:Segoe UI,sans-serif;">' +
          'Unable to load your player profile. Please refresh the page or try again later.' +
          '</p>';
      });
  }

  private _handleLoadedSession(
    progressService: IPlayerProgressService,
    session: PlayerSession,
    questions: Question[],
    renderGeneration: number
  ): void {
    if (session.needsRegistration) {
      if (this._tryMountWithoutRegistration(progressService, session, questions, renderGeneration)) {
        return;
      }

      redirectToRegisterPage(this._getRegistrationEmail(session));
      return;
    }

    this._mountGame(progressService, session, questions, renderGeneration, isNoRedirectFromUrl());
  }

  private _tryMountWithoutRegistration(
    progressService: IPlayerProgressService,
    session: PlayerSession,
    questions: Question[],
    renderGeneration: number
  ): boolean {
    const noRedirect = isNoRedirectFromUrl();

    if (!DEBUG_SKIP_USER_CHECK && !noRedirect) {
      return false;
    }

    if (noRedirect) {
      console.warn('[FollowThePath] noredirect URL parameter: skipping registration redirect.');
    } else {
      console.warn('[FollowThePath] DEBUG_SKIP_USER_CHECK: skipping Users list check for local testing.');
    }

    if (DEBUG_SKIP_USER_CHECK || !session.profile) {
      const localSession: PlayerSession = {
        profile: session.profile,
        progress: createDefaultPlayerProgress(),
        needsRegistration: false
      };

      const localProgressService =
        progressService instanceof SharePointPlayerProgressService
          ? new InMemoryPlayerProgressService()
          : progressService;

      this._mountGame(localProgressService, localSession, questions, renderGeneration, noRedirect);
      return true;
    }

    this._mountGame(
      progressService,
      {
        ...session,
        needsRegistration: false
      },
      questions,
      renderGeneration,
      noRedirect
    );
    return true;
  }

  private _resolveActiveUserEmail(): string {
    return resolveActiveUserEmail(
      this.context.pageContext.user.email || '',
      getDebugUserEmailFromUrl()
    );
  }

  private _getRegistrationEmail(session: PlayerSession): string {
    return session.profile?.email || this._resolveActiveUserEmail();
  }

  private _mountGame(
    progressService: IPlayerProgressService,
    session: PlayerSession,
    questions: Question[],
    renderGeneration: number,
    skipUrlSync: boolean
  ): void {
    if (renderGeneration !== this._renderGeneration) {
      return;
    }

    if (!skipUrlSync) {
      syncGamePageUrlParams();
    }

    this._game = new EndlessRunnerGame(this.domElement, {
      fullscreenLayout: this._isFullscreenLayout(),
      progressService,
      playerProgress: session.progress,
      questions
    });
  }

  private _isFullscreenLayout(): boolean {
    return this.displayMode === DisplayMode.Read;
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
