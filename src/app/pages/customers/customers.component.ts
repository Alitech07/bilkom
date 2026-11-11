import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '../../services/toast.service';
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
    private toast: ToastService,
  ) {}

  onExcel(): void { this.grid?.exportToExcel(); }

  openAdd(): void {
    this.dialog.open(CustomerFormComponent, {
      data: null, width: '600px', disableClose: true,
    }).afterClosed().subscribe((dto: ClientDto | undefined) => {
      if (!dto) return;
      this.customerService.add(dto).subscribe({
        next: (res) => {
          this.toast.success(res.message ?? 'Mijoz qo\'shildi');
          this.grid.load();
        },
        error: () => this.toast.error('Xato yuz berdi'),
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
              this.toast.success(res.message ?? 'Mijoz yangilandi');
              this.grid.load();
            },
            error: () => this.toast.error('Xato yuz berdi'),
          });
        });
      },
      error: () => this.toast.error('Mijoz ma\'lumotlarini yuklashda xato'),
    });
  }

  onDelete(row: Record<string, any>): void {
    this.customerService.delete(row['id']).subscribe({
      next: (res) => {
        this.toast.success(res.message ?? 'Mijoz o\'chirildi');
        this.grid.load();
      },
      error: () => this.toast.error('Xato yuz berdi'),
    });
  }
}

