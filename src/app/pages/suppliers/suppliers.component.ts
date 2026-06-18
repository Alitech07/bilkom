import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SupplierDto, SupplierService } from '../../services/supplier.service';
import { GridComponent } from '../../components/grid/grid.component';
import { GridPage } from '../../services/grid.service';
import { SupplierFormComponent } from './supplier-form/supplier-form.component';

@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.scss']
})
export class SuppliersComponent {
  // core.grids jadvalidagi suppliers uchun grid_id qiymati bilan almashtirilsin
  readonly gridId = 6;

  @ViewChild(GridComponent) grid!: GridComponent;
  pageConfig: GridPage | null = null;

  get cfgSearch(): boolean { return this.pageConfig?.gridConfig.search ?? false; }
  get cfgFilter(): boolean { return this.pageConfig?.gridConfig.filter ?? false; }
  get cfgExcel(): boolean  { return !!this.pageConfig?.gridColumns?.some(c => c.exportable); }

  onSearch(text: string): void { this.grid?.applyFilter(text); }

  constructor(
    private supplierService: SupplierService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
  ) {}

  onExcel(): void { this.grid?.exportToExcel(); }

  openAdd(): void {
    this.dialog.open(SupplierFormComponent, {
      data: null, width: '560px', disableClose: true,
    }).afterClosed().subscribe((dto: SupplierDto | undefined) => {
      if (!dto) return;
      this.supplierService.add(dto).subscribe({
        next: (res) => {
          this.snack.open(res.message ?? 'Qo\'shildi', 'OK', { duration: 3000 });
          this.grid.load();
        },
        error: () => this.snack.open('Xato yuz berdi', 'OK', { duration: 3000 }),
      });
    });
  }

  onEdit(row: Record<string, any>): void {
    this.supplierService.getById(row['id']).subscribe({
      next: (supplier) => {
        this.dialog.open(SupplierFormComponent, {
          data: supplier, width: '560px', disableClose: true,
        }).afterClosed().subscribe((dto: SupplierDto | undefined) => {
          if (!dto) return;
          this.supplierService.edit(supplier.id, dto).subscribe({
            next: (res) => {
              this.snack.open(res.message ?? 'Yangilandi', 'OK', { duration: 3000 });
              this.grid.load();
            },
            error: () => this.snack.open('Xato yuz berdi', 'OK', { duration: 3000 }),
          });
        });
      },
      error: () => this.snack.open('Ma\'lumotlarni yuklashda xato', 'OK', { duration: 3000 }),
    });
  }

  onDelete(row: Record<string, any>): void {
    this.supplierService.delete(row['id']).subscribe({
      next: (res) => {
        this.snack.open(res.message ?? 'O\'chirildi', 'OK', { duration: 3000 });
        this.grid.load();
      },
      error: () => this.snack.open('Xato yuz berdi', 'OK', { duration: 3000 }),
    });
  }
}
