import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '../../services/toast.service';
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
  // ── Tab 1: Xaridlar ─────────────────────────────────────
  readonly gridId = 4;
  @ViewChild('purchaseGrid') grid!: GridComponent;
  pageConfig: GridPage | null = null;

  get cfgSearch(): boolean { return this.pageConfig?.gridConfig.search ?? false; }
  get cfgFilter(): boolean { return this.pageConfig?.gridConfig.filter ?? false; }
  get cfgExcel(): boolean  { return !!this.pageConfig?.gridColumns?.some(c => c.exportable); }

  onSearch(text: string): void { this.grid?.applyFilter(text); }
  onExcel(): void { this.grid?.exportToExcel(); }
  onFilter(): void {}

  // ── Tab 3: Mahsulotlar hisobi ────────────────────────────
  readonly productGridId = 14;
  @ViewChild('productGrid') productGrid!: GridComponent;
  productPageConfig: GridPage | null = null;
  get productCfgExcel(): boolean { return !!this.productPageConfig?.gridColumns?.some(c => c.exportable); }

  constructor(
    private dialog: MatDialog,
    private toast: ToastService,
    private purchaseService: PurchaseService,
  ) {}

  private reload(): void {
    this.grid?.load();
    this.productGrid?.load();
  }

  openAdd(): void {
    this.dialog.open(AddEditPurchaseFormComponent, {
      data: { onSaved: () => this.reload() },
      width: '960px', maxWidth: '98vw', disableClose: true,
    }).afterClosed().subscribe((result: PurchaseFormResult | undefined) => {
      if (!result) return;
      if (result.alreadySaved && result.id) {
        // "Saqlash" orqali allaqachon saqlangan — yakuniy holat bilan edit
        this.purchaseService.edit(result.id, result.dto).subscribe({
          next: () => this.reload(),
          error: () => this.toast.error('Xato yuz berdi'),
        });
      } else {
        this.purchaseService.add(result.dto).subscribe({
          next: (res) => {
            this.toast.success(res.message ?? 'Xarid qo\'shildi');
            this.reload();
          },
          error: () => this.toast.error('Xato yuz berdi'),
        });
      }
    });
  }

  onEdit(row: Record<string, any>): void {
    this.dialog.open(AddEditPurchaseFormComponent, {
      data: { ...row, onSaved: () => this.reload() },
      width: '960px', maxWidth: '98vw', disableClose: true,
    }).afterClosed().subscribe((result: PurchaseFormResult | undefined) => {
      if (!result) return;
      const id = result.id;
      if (!id) return;
      this.purchaseService.edit(id, result.dto).subscribe({
        next: (res) => {
          this.toast.success(res.message ?? 'Yangilandi');
          this.reload();
        },
        error: () => this.toast.error('Xato yuz berdi'),
      });
    });
  }

  onFileClick(row: Record<string, any>): void {
    const path: string = row['certificate_path'] ?? row['certificatePath'] ?? '';
    if (!path) {
      this.toast.success('Fayl mavjud emas');
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
        this.toast.success(res.message ?? 'O\'chirildi');
        this.grid?.load();
      },
      error: () => this.toast.error('Xato yuz berdi'),
    });
  }
}

