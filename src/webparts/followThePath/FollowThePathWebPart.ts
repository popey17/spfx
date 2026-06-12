import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'FollowThePathWebPartStrings';
import { EndlessRunnerGame } from './EndlessRunnerGame';

export interface IFollowThePathWebPartProps {
  description: string;
}

export default class FollowThePathWebPart extends BaseClientSideWebPart<IFollowThePathWebPartProps> {

  private _game: EndlessRunnerGame | undefined;

  public render(): void {
    this._disposeGame();
    this._game = new EndlessRunnerGame(this.domElement);
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
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
