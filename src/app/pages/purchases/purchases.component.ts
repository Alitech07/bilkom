import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GridComponent } from '../../components/grid/grid.component';
import { GridPage } from '../../services/grid.service';
import { AddEditPurchaseFormComponent, Purchase } from './add-edit-purchase-form/add-edit-purchase-form.component';

@Component({
  selector: 'app-purchases',
  templateUrl: './purchases.component.html',
  styleUrls: ['./purchases.component.scss']
})
export class PurchasesComponent {
  // core.grids jadvalidagi purchases uchun grid_id qiymati bilan almashtirilsin
  readonly gridId = 4;

  @ViewChild(GridComponent) grid!: GridComponent;
  pageConfig: GridPage | null = null;

  get cfgSearch(): boolean { return this.pageConfig?.gridConfig.search ?? false; }
  get cfgFilter(): boolean { return this.pageConfig?.gridConfig.filter ?? false; }
  get cfgExcel(): boolean  { return !!this.pageConfig?.gridColumns?.some(c => c.exportable); }

  onSearch(text: string): void { this.grid?.applyFilter(text); }

  constructor(public dialog: MatDialog) {}

  onExcel(): void { this.grid?.exportToExcel(); }
  onFilter(): void {}

  openAdd(): void {
    this.dialog.open(AddEditPurchaseFormComponent, {
      data: null, width: '560px', disableClose: true,
    }).afterClosed().subscribe((result: Purchase | undefined) => {
      if (!result) return;
      this.grid?.load();
    });
  }

  onEdit(row: Record<string, any>): void {
    this.dialog.open(AddEditPurchaseFormComponent, {
      data: row, width: '560px', disableClose: true,
    }).afterClosed().subscribe((result: Purchase | undefined) => {
      if (!result) return;
      this.grid?.load();
    });
  }

  onDelete(): void {}
}
