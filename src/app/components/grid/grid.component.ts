import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import { GridColumn, GridConfig, GridPage, GridService } from '../../services/grid.service';

interface HeaderCell {
  isGroup: boolean;
  label: string;
  span: number;
  colKey: string;
  colWidth: string | undefined;
}
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnChanges {

  // API rejimi: backend'dan grid_id bo'yicha yuklanadi
  @Input() gridId?: number;

  // External rejimi: sahifa o'zi data beradi (Suppliers, Roles)
  @Input() externalConfig: GridConfig | null = null;
  @Input() externalLoading = false;

  @Input() showActions = false;
  @Input() selectable  = false;
  @Output() editClick    = new EventEmitter<Record<string, any>>();
  @Output() deleteClick  = new EventEmitter<Record<string, any>>();
  @Output() fileClick    = new EventEmitter<Record<string, any>>();
  @Output() rowClick     = new EventEmitter<Record<string, any>>();
  @Output() configLoaded = new EventEmitter<GridPage>();

  gridPage: GridPage | null = null;
  loading = false;
  error = '';
  filterText = '';
  currentPage = 0;

  sortKey: string | null = null;
  sortDir: 'asc' | 'desc' = 'asc';

  readonly skeletonRows = [1, 2, 3, 4, 5];
  readonly skeletonCols = [1, 2, 3, 4, 5];

  constructor(private gridService: GridService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['externalConfig'] && this.externalConfig) {
      this.loading = false;
      this.error = '';
    }
    if (changes['gridId'] && this.gridId != null) {
      this.currentPage = 0;
      this.load();
    }
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.gridPage = null;
    this.sortKey = null;
    this.filterText = '';

    this.gridService.getGrid(this.gridId!, this.currentPage).subscribe({
      next: (page) => { this.gridPage = page; this.loading = false; this.configLoaded.emit(page); },
      error: (err: Error) => { this.error = err.message; this.loading = false; },
    });
  }

  sort(key: string): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDir = 'asc';
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.load();
    }
  }

  nextPage(): void {
    if (this.gridPage && this.currentPage < this.gridPage.totalPages - 1) {
      this.currentPage++;
      this.load();
    }
  }

  exportToExcel(): void {
    if (!this.gridPage) return;
    const cols = this.gridPage.gridColumns.filter(c => c.exportable);
    if (!cols.length) return;

    const rows = this.gridPage.data.map(row =>
      cols.reduce((acc, col) => {
        acc[col.label] = row[col.key];
        return acc;
      }, {} as Record<string, any>)
    );

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ma\'lumotlar');
    XLSX.writeFile(wb, `export_${this.gridId}_${Date.now()}.xlsx`);
  }

  get activeColumns(): GridColumn[] {
    if (this.externalConfig) return this.externalConfig.columns;
    return (this.gridPage?.gridColumns ?? []).filter(col => col.visible !== false);
  }

  get activeData(): Record<string, any>[] {
    if (this.externalConfig) return this.externalConfig.data;
    return this.gridPage?.data ?? [];
  }

  get hasExportableColumns(): boolean {
    return !!this.gridPage?.gridColumns.some(c => c.exportable);
  }

  get showCheckbox(): boolean {
    return !!this.gridPage?.gridConfig.checkbox;
  }

  get showFileBtnColumn(): boolean {
    return !!this.gridPage?.gridConfig.showFile;
  }

  applyFilter(text: string): void {
    this.filterText = text;
  }

  get showPagination(): boolean {
    return !!this.gridPage && this.gridPage.totalPages > 1;
  }

  get filteredData(): Record<string, any>[] {
    const data = this.activeData;
    if (!this.filterText) return data;
    const q = this.filterText.toLowerCase();
    return data.filter(row =>
      Object.values(row).some(v => String(v ?? '').toLowerCase().includes(q))
    );
  }

  get sortedData(): Record<string, any>[] {
    if (!this.sortKey) return this.filteredData;
    const key = this.sortKey;
    return [...this.filteredData].sort((a, b) => {
      const cmp = String(a[key] ?? '').localeCompare(String(b[key] ?? ''), undefined, { numeric: true });
      return this.sortDir === 'asc' ? cmp : -cmp;
    });
  }

  get hasGroups(): boolean {
    return this.activeColumns.some(c => !!c.group);
  }

  private get groupsMap(): Map<string, string> {
    const map = new Map<string, string>();
    (this.gridPage?.gridConfig.groups ?? []).forEach(g => map.set(g.key, g.label));
    return map;
  }

  get columnGroups(): HeaderCell[] {
    const cells: HeaderCell[] = [];
    const cols = this.activeColumns;
    const groups = this.groupsMap;
    let i = 0;
    while (i < cols.length) {
      const col = cols[i];
      if (!col.group) {
        cells.push({ isGroup: false, label: col.label, span: 1, colKey: col.key, colWidth: col.width });
        i++;
      } else {
        const groupKey = col.group;
        const groupLabel = groups.get(groupKey) ?? groupKey;
        let span = 0;
        while (i < cols.length && cols[i].group === groupKey) { span++; i++; }
        cells.push({ isGroup: true, label: groupLabel, span, colKey: '', colWidth: undefined });
      }
    }
    return cells;
  }

  get groupedColumns(): GridColumn[] {
    return this.activeColumns.filter(c => !!c.group);
  }

  get showFooter(): boolean {
    return !!this.gridPage?.gridConfig.showFooter;
  }

  footerValue(col: GridColumn): string {
    if (!col.footer) return '';
    if (col.footer === 'label') return col.footerLabel ?? '';

    const nums = this.sortedData
      .map(row => Number(row[col.key]))
      .filter(v => !isNaN(v));

    if (col.footer === 'sum')   return this.formatNumber(nums.reduce((a, b) => a + b, 0));
    if (col.footer === 'avg')   return nums.length ? this.formatNumber(nums.reduce((a, b) => a + b, 0) / nums.length) : '';
    if (col.footer === 'count') return String(this.sortedData.filter(r => r[col.key] != null && r[col.key] !== '').length);
    return '';
  }

  badgeClass(col: GridColumn, value: string): string {
    const color = col.badgeMap?.[value] ?? 'gray';
    return `badge--${color}`;
  }

  formatNumber(value: any): string {
    const n = Number(value);
    return isNaN(n) ? value : n.toLocaleString('uz-UZ');
  }
}
