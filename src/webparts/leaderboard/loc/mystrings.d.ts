declare interface ILeaderboardWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;
  UsersListTitleFieldLabel: string;
  LobtListTitleFieldLabel: string;
  UseSharePointDataFieldLabel: string;
}

declare module 'LeaderboardWebPartStrings' {
  const strings: ILeaderboardWebPartStrings;
  export = strings;
}
