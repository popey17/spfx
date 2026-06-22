import { SPHttpClient } from '@microsoft/sp-http';
import type { WebPartContext } from '@microsoft/sp-webpart-base';

export interface SharePointClockSnapshot {
  serverTime: Date;
  clientTimeAtFetch: Date;
}

/** Read SharePoint server time from the HTTP Date header on a lightweight web request. */
export async function fetchSharePointClockSnapshot(
  context: WebPartContext
): Promise<SharePointClockSnapshot> {
  const clientTimeAtFetch = new Date();
  const response = await context.spHttpClient.get(
    context.pageContext.web.absoluteUrl + '/_api/web?$select=Id',
    SPHttpClient.configurations.v1,
    {
      headers: {
        Accept: 'application/json;odata=nometadata'
      }
    }
  );

  if (!response.ok) {
    throw new Error('SharePoint clock request failed with status ' + response.status);
  }

  const dateHeader = response.headers.get('Date');
  if (!dateHeader) {
    throw new Error('SharePoint clock response missing Date header');
  }

  return {
    serverTime: new Date(dateHeader),
    clientTimeAtFetch
  };
}
