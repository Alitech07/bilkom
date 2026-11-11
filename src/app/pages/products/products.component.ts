import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '../../services/toast.service';
import { ProductDto, ProductService } from '../../services/product.service';
import { GridComponent } from '../../components/grid/grid.component';
import { GridPage } from '../../services/grid.service';
import { ProductFormComponent } from './product-form/product-form.component';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent {
  // core.grids jadvalidagi products uchun grid_id qiymati bilan almashtirilsin
  readonly gridId = 1;

  @ViewChild(GridComponent) grid!: GridComponent;
  pageConfig: GridPage | null = null;

  get cfgSearch(): boolean { return this.pageConfig?.gridConfig.search ?? false; }
  get cfgFilter(): boolean { return this.pageConfig?.gridConfig.filter ?? false; }
  get cfgExcel(): boolean  { return !!this.pageConfig?.gridColumns?.some(c => c.exportable); }

  onSearch(text: string): void { this.grid?.applyFilter(text); }

  constructor(
    private productService: ProductService,
    private dialog: MatDialog,
    private toast: ToastService,
  ) {}

  onExcel(): void { this.grid?.exportToExcel(); }

  openAdd(): void {
    this.dialog.open(ProductFormComponent, {
      data: null, width: '600px', disableClose: true,
    }).afterClosed().subscribe((dto: ProductDto | undefined) => {
      if (!dto) return;
      this.productService.add(dto).subscribe({
        next: (res) => {
          this.toast.success(res.message ?? 'Mahsulot qo\'shildi');
          this.grid.load();
        },
        error: () => this.toast.error('Xato yuz berdi'),
      });
    });
  }

  onEdit(row: Record<string, any>): void {
    const id = Number(row['id'] ?? row['product_id']);
    if (!id) {
      this.toast.success('Mahsulot ID topilmadi — view\'da "id" ustuni bo\'lishi kerak');
      return;
    }
    this.productService.getById(id).subscribe({
      next: (product) => {
        this.dialog.open(ProductFormComponent, {
          data: product, width: '600px', disableClose: true,
        }).afterClosed().subscribe((dto: ProductDto | undefined) => {
          if (!dto) return;
          this.productService.edit(id, dto).subscribe({
            next: (res) => {
              this.toast.success(res.message ?? 'Mahsulot yangilandi');
              this.grid.load();
            },
            error: () => this.toast.error('Xato yuz berdi'),
          });
        });
      },
      error: () => this.toast.error('Mahsulot ma\'lumotlarini yuklashda xato'),
    });
  }

  onDelete(row: Record<string, any>): void {
    const id = Number(row['id'] ?? row['product_id']);
    if (!id) return;
    this.productService.delete(id).subscribe({
      next: (res) => {
        this.toast.success(res.message ?? 'Mahsulot o\'chirildi');
        this.grid.load();
      },
      error: () => this.toast.error('Xato yuz berdi'),
    });
  }
}

