import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { GridColumn, GridConfig, GridService } from '../../services/grid.service';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnChanges {
  @Input() gridId?: string;
  @Input() externalConfig: GridConfig | null = null;

  @Input() showActions = false;
  @Output() editClick   = new EventEmitter<Record<string, any>>();
  @Output() deleteClick = new EventEmitter<Record<string, any>>();

  config: GridConfig | null = null;
  loading = false;
  error = '';

  sortKey: string | null = null;
  sortDir: 'asc' | 'desc' = 'asc';

  readonly skeletonRows = [1, 2, 3, 4, 5];
  readonly skeletonCols = [1, 2, 3, 4, 5];

  constructor(private gridService: GridService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['externalConfig'] && this.externalConfig) {
      this.config  = this.externalConfig;
      this.loading = false;
      this.error   = '';
    }
    if (changes['gridId'] && this.gridId) {
      this.load();
    }
  }

  load() {
    this.loading = true;
    this.error   = '';
    this.config  = null;
    this.sortKey = null;

    this.gridService.getGrid(this.gridId!).subscribe({
      next:  (config) => { this.config = config; this.loading = false; },
      error: (err: Error) => { this.error = err.message; this.loading = false; },
    });
  }

  sort(key: string) {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDir = 'asc';
    }
  }

  get sortedData(): Record<string, any>[] {
    if (!this.config) return [];
    if (!this.sortKey) return this.config.data;
    const key = this.sortKey;
    return [...this.config.data].sort((a, b) => {
      const cmp = String(a[key]).localeCompare(String(b[key]), undefined, { numeric: true });
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
