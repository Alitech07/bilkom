import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GridComponent } from '../../components/grid/grid.component';
import { GridPage } from '../../services/grid.service';
import { WarehouseService } from '../../services/warehouse.service';
import { WarehouseFormComponent, WarehouseFormResult } from './warehouse-form/warehouse-form.component';

@Component({
  selector: 'app-warehouse',
  templateUrl: './warehouse.component.html',
  styleUrls: ['./warehouse.component.scss']
})
export class WarehouseComponent {
  readonly gridId = 3;

  @ViewChild(GridComponent) grid!: GridComponent;
  pageConfig: GridPage | null = null;

  get cfgSearch(): boolean { return this.pageConfig?.gridConfig.search ?? false; }
  get cfgFilter(): boolean { return this.pageConfig?.gridConfig.filter ?? false; }
  get cfgExcel(): boolean  { return !!this.pageConfig?.gridColumns?.some(c => c.exportable); }

  constructor(
    private dialog: MatDialog,
    private snack: MatSnackBar,
    private warehouseService: WarehouseService,
  ) {}

  onSearch(text: string): void { this.grid?.applyFilter(text); }
  onExcel(): void { this.grid?.exportToExcel(); }

  openAdd(): void {
    this.dialog.open(WarehouseFormComponent, {
      data: null, width: '560px', disableClose: true,
    }).afterClosed().subscribe((result: WarehouseFormResult | undefined) => {
      if (!result) return;
      this.warehouseService.add(result.dto).subscribe({
        next: res => {
          this.snack.open(res.message ?? 'Qo\'shildi', 'OK', { duration: 3000 });
          this.grid.load();
        },
        error: () => this.snack.open('Xato yuz berdi', 'OK', { duration: 3000 }),
      });
    });
  }

  onEdit(row: Record<string, any>): void {
    this.dialog.open(WarehouseFormComponent, {
      data: row, width: '560px', disableClose: true,
    }).afterClosed().subscribe((result: WarehouseFormResult | undefined) => {
      if (!result?.id) return;
      this.warehouseService.edit(result.id, result.dto).subscribe({
        next: res => {
          this.snack.open(res.message ?? 'Yangilandi', 'OK', { duration: 3000 });
          this.grid.load();
        },
        error: () => this.snack.open('Xato yuz berdi', 'OK', { duration: 3000 }),
      });
    });
  }

  onDelete(row: Record<string, any>): void {
    const id = row['id'];
    if (!id) return;
    this.warehouseService.delete(id).subscribe({
      next: res => {
        this.snack.open(res.message ?? 'O\'chirildi', 'OK', { duration: 3000 });
        this.grid.load();
      },
      error: () => this.snack.open('Xato yuz berdi', 'OK', { duration: 3000 }),
    });
  }
}
