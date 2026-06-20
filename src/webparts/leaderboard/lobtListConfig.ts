/** SharePoint LOBT reference list (Title, Status, OrderNo). */
export const LOBT_LIST_CONFIG = {
  listTitle: 'LOBT',
  fields: {
    id: 'Id',
    title: 'Title',
    status: 'Status',
    orderNo: 'OrderNo'
  },
  activeStatus: 'Active'
} as const;

export interface LobtTypeRow {
  id: number;
  title: string;
  orderNo: number;
}
