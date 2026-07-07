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

  private openForm(data: Record<string, any> | null, width = '560px'): void {
    this.dialog.open(WarehouseFormComponent, {
      data, width, disableClose: true,
    }).afterClosed().subscribe((result: WarehouseFormResult | undefined) => {
      if (!result) return;
      const req = result.id
        ? this.warehouseService.edit(result.id, result.dto)
        : this.warehouseService.add(result.dto);
      req.subscribe({
        next: res => {
          this.snack.open(res.message ?? 'Saqlandi', 'OK', { duration: 3000 });
          this.grid.load();
        },
        error: () => this.snack.open('Xato yuz berdi', 'OK', { duration: 3000 }),
      });
    });
  }

  openAdd(): void {
    this.openForm({ purchaseMode: true });
  }

  openAddNew(): void {
    this.openForm(null);
  }

  onEdit(row: Record<string, any>): void {
    const isPurchaseRow = !!row['purchase_id'];
    this.openForm({
      ...row,
      purchaseMode: isPurchaseRow,
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
