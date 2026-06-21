import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GridComponent } from '../../components/grid/grid.component';
import { GridPage } from '../../services/grid.service';
import { PurchaseService } from '../../services/purchase.service';
import { AddEditPurchaseFormComponent, PurchaseFormResult } from './add-edit-purchase-form/add-edit-purchase-form.component';
import { environment } from '../../../environments/environment';
import { FileViewerComponent } from '../../components/file-viewer/file-viewer.component';

@Component({
  selector: 'app-purchases',
  templateUrl: './purchases.component.html',
  styleUrls: ['./purchases.component.scss']
})
export class PurchasesComponent {
  readonly gridId = 4;

  @ViewChild(GridComponent) grid!: GridComponent;
  pageConfig: GridPage | null = null;

  get cfgSearch(): boolean { return this.pageConfig?.gridConfig.search ?? false; }
  get cfgFilter(): boolean { return this.pageConfig?.gridConfig.filter ?? false; }
  get cfgExcel(): boolean  { return !!this.pageConfig?.gridColumns?.some(c => c.exportable); }

  onSearch(text: string): void { this.grid?.applyFilter(text); }

  constructor(
    private dialog: MatDialog,
    private snack: MatSnackBar,
    private purchaseService: PurchaseService,
  ) {}

  onExcel(): void { this.grid?.exportToExcel(); }
  onFilter(): void {}

  openAdd(): void {
    this.dialog.open(AddEditPurchaseFormComponent, {
      data: null, width: '600px', disableClose: true,
    }).afterClosed().subscribe((result: PurchaseFormResult | undefined) => {
      if (!result) return;
      this.purchaseService.add(result.dto).subscribe({
        next: (res) => {
          this.snack.open(res.message ?? 'Xarid qo\'shildi', 'OK', { duration: 3000 });
          this.grid?.load();
        },
        error: () => this.snack.open('Xato yuz berdi', 'OK', { duration: 3000 }),
      });
    });
  }

  onEdit(row: Record<string, any>): void {
    this.dialog.open(AddEditPurchaseFormComponent, {
      data: row, width: '600px', disableClose: true,
    }).afterClosed().subscribe((result: PurchaseFormResult | undefined) => {
      if (!result) return;
      const id = result.id;
      if (!id) return;
      this.purchaseService.edit(id, result.dto).subscribe({
        next: (res) => {
          this.snack.open(res.message ?? 'Yangilandi', 'OK', { duration: 3000 });
          this.grid?.load();
        },
        error: () => this.snack.open('Xato yuz berdi', 'OK', { duration: 3000 }),
      });
    });
  }

  onFileClick(row: Record<string, any>): void {
    const path: string = row['certificate_path'] ?? row['certificatePath'] ?? '';
    if (!path) {
      this.snack.open('Fayl mavjud emas', 'OK', { duration: 3000 });
      return;
    }
    const fileName = path.split('/').pop() ?? '';
    const url = `${environment.apiUrl}/purchases/certificate/${fileName}`;
    this.dialog.open(FileViewerComponent, {
      data: { url, fileName },
      width: '85vw',
      maxWidth: '1100px',
      height: '90vh',
      panelClass: 'file-viewer-dialog',
    });
  }

  onDelete(row: Record<string, any>): void {
    const id = row['purchase_id'] ?? row['id'];
    if (!id) return;
    this.purchaseService.delete(id).subscribe({
      next: (res) => {
        this.snack.open(res.message ?? 'O\'chirildi', 'OK', { duration: 3000 });
        this.grid?.load();
      },
      error: () => this.snack.open('Xato yuz berdi', 'OK', { duration: 3000 }),
    });
  }
}
