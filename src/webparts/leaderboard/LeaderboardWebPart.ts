import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import * as React from 'react';
import * as ReactDom from 'react-dom';

import * as strings from 'LeaderboardWebPartStrings';
import LeaderboardContainer, { createLeaderboardLoader } from './components/LeaderboardContainer';
import { InMemoryLeaderboardService } from './InMemoryLeaderboardService';
import { SharePointLeaderboardService } from './SharePointLeaderboardService';

export interface ILeaderboardWebPartProps {
  description: string;
  /** Users list title for SharePoint rankings. Defaults to Users. */
  usersListTitle?: string;
  /** LOBT reference list title. Defaults to LOBT. */
  lobtListTitle?: string;
  /** When true, attempts SharePoint before falling back to mock data. */
  useSharePointData?: boolean;
}

export default class LeaderboardWebPart extends BaseClientSideWebPart<ILeaderboardWebPartProps> {
  public render(): void {
    const services = this._createLeaderboardServices();
    const element = React.createElement(LeaderboardContainer, {
      loadLeaderboard: createLeaderboardLoader(services)
    });

    ReactDom.render(element, this.domElement);
  }

  protected async onInit(): Promise<void> {
    const service = new SharePointLeaderboardService(this.context, {
      usersListTitle: this.properties.usersListTitle,
      lobtListTitle: this.properties.lobtListTitle
    });
    service.syncCurrentUserLeaderBoardData().catch((error) => {
      console.warn('[Leaderboard] Failed to sync leaderboard data on web part init.', error);
    });
    return super.onInit();
  }

  private _createLeaderboardServices(): Array<InMemoryLeaderboardService | SharePointLeaderboardService> {
    const services: Array<InMemoryLeaderboardService | SharePointLeaderboardService> = [
      new SharePointLeaderboardService(this.context, {
        usersListTitle: this.properties.usersListTitle,
        lobtListTitle: this.properties.lobtListTitle
      })
    ];

    if (!this.properties.useSharePointData) {
      services.push(new InMemoryLeaderboardService());
    }

    return services;
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
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
                  label: strings.UsersListTitleFieldLabel
                }),
                PropertyPaneTextField('lobtListTitle', {
                  label: strings.LobtListTitleFieldLabel
                }),
                PropertyPaneToggle('useSharePointData', {
                  label: strings.UseSharePointDataFieldLabel,
                  onText: 'On',
                  offText: 'Off'
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
