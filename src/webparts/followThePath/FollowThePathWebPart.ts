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
import type { IPlayerProgressService } from './IPlayerProgressService';
import type { PlayerSession } from './playerProgressTypes';

export interface IFollowThePathWebPartProps {
  description: string;
  /** Users list — profile and cross-game totals. Defaults to Users. */
  usersListTitle?: string;
  /** Game1Data list — Follow the Path progress (Email links to Users). Defaults to Game1Data. */
  game1DataListTitle?: string;
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
      game1DataListTitle: this.properties.game1DataListTitle
    });

    progressService
      .loadSession()
      .then((session) => {
        if (renderGeneration !== this._renderGeneration) {
          return;
        }

        if (session.needsRegistration) {
          this._renderLoginPage(progressService, renderGeneration);
          return;
        }

        this._mountGame(progressService, session, renderGeneration);
      })
      .catch((error: unknown) => {
        if (renderGeneration !== this._renderGeneration) {
          return;
        }

        console.error('[FollowThePath] SharePoint session load failed; using in-memory fallback.', error);

        const fallbackService = new InMemoryPlayerProgressService();
        fallbackService
          .loadSession()
          .then((session) => {
            if (renderGeneration !== this._renderGeneration) {
              return;
            }

            if (session.needsRegistration) {
              this._renderLoginPage(fallbackService, renderGeneration);
              return;
            }

            this._mountGame(fallbackService, session, renderGeneration);
          })
          .catch((fallbackError: unknown) => {
            console.error('[FollowThePath] In-memory fallback load failed.', fallbackError);
          });
      });
  }

  private _renderLoginPage(service: IPlayerProgressService, renderGeneration: number): void {
    const email = this.context.pageContext.user.email || '';
    const displayName = this.context.pageContext.user.displayName || email;

    const wrapper = document.createElement('div');
    wrapper.className = 'ftp-login-page';
    wrapper.innerHTML =
      '<div class="ftp-login-card">' +
      '<h1 class="ftp-login-title">Follow the Path</h1>' +
      '<p class="ftp-login-subtitle">Sign in to save your progress across games.</p>' +
      '<form class="ftp-login-form">' +
      '<label class="ftp-login-label">Email</label>' +
      '<input class="ftp-login-input" type="email" name="email" readonly />' +
      '<label class="ftp-login-label">Market</label>' +
      '<input class="ftp-login-input" type="text" name="market" required placeholder="e.g. Singapore" />' +
      '<label class="ftp-login-label">BUSU</label>' +
      '<input class="ftp-login-input" type="text" name="busu" required placeholder="e.g. Capital Markets" />' +
      '<p class="ftp-login-error" hidden></p>' +
      '<button class="ftp-login-button" type="submit">Continue</button>' +
      '</form>' +
      '</div>';

    const style = document.createElement('style');
    style.textContent =
      '.ftp-login-page{min-height:420px;display:flex;align-items:center;justify-content:center;padding:24px;background:#0a1628;font-family:"Segoe UI",sans-serif;}' +
      '.ftp-login-card{width:100%;max-width:420px;background:rgba(28,32,42,.95);border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:32px 28px;box-shadow:0 12px 40px rgba(0,0,0,.35);}' +
      '.ftp-login-title{margin:0 0 8px;color:#fff;font-size:28px;font-weight:700;text-align:center;}' +
      '.ftp-login-subtitle{margin:0 0 24px;color:rgba(255,255,255,.75);font-size:14px;text-align:center;line-height:1.4;}' +
      '.ftp-login-label{display:block;margin:0 0 6px;color:rgba(255,255,255,.85);font-size:13px;font-weight:600;}' +
      '.ftp-login-input{width:100%;box-sizing:border-box;margin:0 0 16px;padding:10px 12px;border:1px solid rgba(255,255,255,.2);border-radius:6px;background:rgba(0,0,0,.25);color:#fff;font-size:14px;}' +
      '.ftp-login-input[readonly]{opacity:.7;}' +
      '.ftp-login-button{width:100%;margin-top:8px;padding:12px 16px;border:none;border-radius:6px;background:#f57c00;color:#fff;font-size:16px;font-weight:700;cursor:pointer;}' +
      '.ftp-login-button:disabled{opacity:.6;cursor:wait;}' +
      '.ftp-login-error{margin:0 0 8px;color:#ff8a80;font-size:13px;text-align:center;}';

    const form = wrapper.querySelector('.ftp-login-form') as HTMLFormElement;
    const emailInput = wrapper.querySelector('input[name="email"]') as HTMLInputElement;
    const errorEl = wrapper.querySelector('.ftp-login-error') as HTMLParagraphElement;
    const submitButton = wrapper.querySelector('.ftp-login-button') as HTMLButtonElement;

    emailInput.value = email;

    form.addEventListener('submit', (event: Event) => {
      event.preventDefault();

      const marketInput = form.querySelector('input[name="market"]') as HTMLInputElement;
      const busuInput = form.querySelector('input[name="busu"]') as HTMLInputElement;
      const market = marketInput.value.trim();
      const busu = busuInput.value.trim();

      if (!email) {
        errorEl.textContent = 'Unable to detect your SharePoint account email.';
        errorEl.hidden = false;
        return;
      }

      if (!market || !busu) {
        errorEl.textContent = 'Please enter your Market and BUSU.';
        errorEl.hidden = false;
        return;
      }

      errorEl.hidden = true;
      submitButton.disabled = true;
      submitButton.textContent = 'Signing in...';

      service
        .registerUser({
          title: displayName,
          email,
          market,
          busu
        })
        .then(() => service.loadSession())
        .then((session) => {
          if (renderGeneration !== this._renderGeneration) {
            return;
          }

          this.domElement.innerHTML = '';
          this._mountGame(service, session, renderGeneration);
        })
        .catch((registerError: unknown) => {
          if (renderGeneration !== this._renderGeneration) {
            return;
          }

          console.error('[FollowThePath] Registration failed.', registerError);
          errorEl.textContent = 'Could not save your profile. Please try again.';
          errorEl.hidden = false;
          submitButton.disabled = false;
          submitButton.textContent = 'Continue';
        });
    });

    this.domElement.appendChild(style);
    this.domElement.appendChild(wrapper);
  }

  private _mountGame(
    progressService: IPlayerProgressService,
    session: PlayerSession,
    renderGeneration: number
  ): void {
    if (renderGeneration !== this._renderGeneration) {
      return;
    }

    this._game = new EndlessRunnerGame(this.domElement, {
      fullscreenLayout: this._isFullscreenLayout(),
      progressService,
      playerProgress: session.progress
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
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
