export class AbstractTableSetting {
    constructor() {
        this.paging = true;
        this.tools = true;
    }
  settingColumn: boolean;
  addRow: boolean;
  editRow: boolean;
  deleteRow: boolean;
  tableName: string;
  hideHeader: boolean;
  filter: boolean;
  cols: Array<any>;
  columns: Array<any>;
  paging: boolean;
  tools: boolean;
  selectAll: boolean;
  selectOne: boolean;
  deleteAll: boolean;
}

export class AbstractTableEvent {
    filters: any;
    first: number;
    globalFilter: string;
    multiSortMeta: Array<{field: string, order: number}>
    rows: number;
}


