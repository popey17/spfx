import { DisplayMode, Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'FollowThePathWebPartStrings';
import { EndlessRunnerGame } from './EndlessRunnerGame';
import { InMemoryPlayerProgressService } from './InMemoryPlayerProgressService';
import { createDefaultPlayerProgress } from './playerProgressTypes';
import { SharePointPlayerProgressService } from './SharePointPlayerProgressService';

export interface IFollowThePathWebPartProps {
  description: string;
  /** Shared list used by all games — one row per user. Defaults to PlayerGameHub. */
  sharedPlayerListTitle?: string;
}

export default class FollowThePathWebPart extends BaseClientSideWebPart<IFollowThePathWebPartProps> {

  private _game: EndlessRunnerGame | undefined;
  private _renderGeneration: number = 0;

  public render(): void {
    this._disposeGame();
    const renderGeneration = ++this._renderGeneration;
    const progressService = new SharePointPlayerProgressService(this.context, {
      listTitle: this.properties.sharedPlayerListTitle
    });

    progressService
      .loadForCurrentUser()
      .then((playerProgress) => {
        if (renderGeneration !== this._renderGeneration) {
          return;
        }

        this._game = new EndlessRunnerGame(this.domElement, {
          fullscreenLayout: this._isFullscreenLayout(),
          progressService,
          playerProgress
        });
      })
      .catch((error: unknown) => {
        if (renderGeneration !== this._renderGeneration) {
          return;
        }

        console.error('[FollowThePath] SharePoint progress load failed; using in-memory fallback.', error);

        const fallbackService = new InMemoryPlayerProgressService();
        this._game = new EndlessRunnerGame(this.domElement, {
          fullscreenLayout: this._isFullscreenLayout(),
          progressService: fallbackService,
          playerProgress: createDefaultPlayerProgress()
        });
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
                PropertyPaneTextField('sharedPlayerListTitle', {
                  label: 'Shared player list title (all games)'
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
