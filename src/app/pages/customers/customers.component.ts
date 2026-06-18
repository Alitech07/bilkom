import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClientDto, CustomerService } from '../../services/customer.service';
import { GridComponent } from '../../components/grid/grid.component';
import { GridPage } from '../../services/grid.service';
import { CustomerFormComponent } from './customer-form/customer-form.component';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent {
  // core.grids jadvalidagi customers uchun grid_id qiymati bilan almashtirilsin
  readonly gridId = 5;

  @ViewChild(GridComponent) grid!: GridComponent;
  pageConfig: GridPage | null = null;

  get cfgSearch(): boolean { return this.pageConfig?.gridConfig.search ?? false; }
  get cfgFilter(): boolean { return this.pageConfig?.gridConfig.filter ?? false; }
  get cfgExcel(): boolean  { return !!this.pageConfig?.gridColumns?.some(c => c.exportable); }

  onSearch(text: string): void { this.grid?.applyFilter(text); }

  constructor(
    private customerService: CustomerService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
  ) {}

  onExcel(): void { this.grid?.exportToExcel(); }

  openAdd(): void {
    this.dialog.open(CustomerFormComponent, {
      data: null, width: '600px', disableClose: true,
    }).afterClosed().subscribe((dto: ClientDto | undefined) => {
      if (!dto) return;
      this.customerService.add(dto).subscribe({
        next: (res) => {
          this.snack.open(res.message ?? 'Mijoz qo\'shildi', 'OK', { duration: 3000 });
          this.grid.load();
        },
        error: () => this.snack.open('Xato yuz berdi', 'OK', { duration: 3000 }),
      });
    });
  }

  onEdit(row: Record<string, any>): void {
    this.customerService.getById(row['id']).subscribe({
      next: (client) => {
        this.dialog.open(CustomerFormComponent, {
          data: client, width: '600px', disableClose: true,
        }).afterClosed().subscribe((dto: ClientDto | undefined) => {
          if (!dto) return;
          this.customerService.edit(client.id, dto).subscribe({
            next: (res) => {
              this.snack.open(res.message ?? 'Mijoz yangilandi', 'OK', { duration: 3000 });
              this.grid.load();
            },
            error: () => this.snack.open('Xato yuz berdi', 'OK', { duration: 3000 }),
          });
        });
      },
      error: () => this.snack.open('Mijoz ma\'lumotlarini yuklashda xato', 'OK', { duration: 3000 }),
    });
  }

  onDelete(row: Record<string, any>): void {
    this.customerService.delete(row['id']).subscribe({
      next: (res) => {
        this.snack.open(res.message ?? 'Mijoz o\'chirildi', 'OK', { duration: 3000 });
        this.grid.load();
      },
      error: () => this.snack.open('Xato yuz berdi', 'OK', { duration: 3000 }),
    });
  }
}
