import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { GridColumn, GridConfig, GridPage, GridService } from '../../services/grid.service';
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
  @Output() editClick     = new EventEmitter<Record<string, any>>();
  @Output() deleteClick   = new EventEmitter<Record<string, any>>();
  @Output() configLoaded  = new EventEmitter<GridPage>();

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
    return this.gridPage?.gridColumns ?? [];
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

  badgeClass(col: GridColumn, value: string): string {
    const color = col.badgeMap?.[value] ?? 'gray';
    return `badge--${color}`;
  }

  formatNumber(value: any): string {
    const n = Number(value);
    return isNaN(n) ? value : n.toLocaleString('uz-UZ');
  }
}
