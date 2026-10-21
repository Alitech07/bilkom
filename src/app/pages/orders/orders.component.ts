import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GridComponent } from '../../components/grid/grid.component';
import { GridPage } from '../../services/grid.service';
import { Order, OrderService } from '../../services/order.service';
import { OrderFormComponent, OrderFormResult } from './order-form/order-form.component';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent {
  readonly gridId = 9;

  @ViewChild(GridComponent) grid!: GridComponent;
  pageConfig: GridPage | null = null;

  get cfgSearch(): boolean { return this.pageConfig?.gridConfig.search ?? false; }
  get cfgFilter(): boolean { return this.pageConfig?.gridConfig.filter ?? false; }
  get cfgExcel(): boolean  { return !!this.pageConfig?.gridColumns?.some(c => c.exportable); }

  onSearch(text: string): void { this.grid?.applyFilter(text); }
  onExcel(): void { this.grid?.exportToExcel(); }

  constructor(
    private dialog: MatDialog,
    private snack: MatSnackBar,
    private orderService: OrderService,
    private router: Router,
  ) {}

  onViewInvoice(row: Record<string, any>): void {
    const id = row['order_id'] ?? row['id'];
    if (id) this.router.navigate(['/invoice', id]);
  }

  private saveResult(result: OrderFormResult | undefined): void {
    if (!result) return;
    const req = result.id
      ? this.orderService.edit(result.id, result.dto)
      : this.orderService.add(result.dto);
    req.subscribe({
      next: (res) => {
        this.snack.open(res.message ?? 'Saqlandi', 'OK', { duration: 3000 });
        this.grid?.load();
      },
      error: (err) => {
        const message = err?.error?.message ?? 'Xato yuz berdi';
        this.snack.open(message, 'OK', { duration: 4000 });
      },
    });
  }

  openAdd(): void {
    this.dialog.open(OrderFormComponent, {
      data: null, width: '720px', disableClose: true,
    }).afterClosed().subscribe((result: OrderFormResult | undefined) => this.saveResult(result));
  }

  onEdit(row: Record<string, any>): void {
    const id = row['order_id'] ?? row['id'];
    if (!id) return;
    this.orderService.getById(id).subscribe({
      next: (order: Order) => {
        this.dialog.open(OrderFormComponent, {
          data: { order }, width: '720px', disableClose: true,
        }).afterClosed().subscribe((result: OrderFormResult | undefined) => this.saveResult(result));
      },
      error: () => this.snack.open('Buyurtma ma\'lumotlarini yuklashda xato', 'OK', { duration: 3000 }),
    });
  }

  onDelete(row: Record<string, any>): void {
    const id = row['order_id'] ?? row['id'];
    if (!id) return;
    this.orderService.delete(id).subscribe({
      next: (res) => {
        this.snack.open(res.message ?? 'O\'chirildi', 'OK', { duration: 3000 });
        this.grid?.load();
      },
      error: () => this.snack.open('Xato yuz berdi', 'OK', { duration: 3000 }),
    });
  }
}
