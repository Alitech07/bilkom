import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GridComponent } from '../../components/grid/grid.component';
import { GridPage } from '../../services/grid.service';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent {
  // core.grids jadvalidagi order_list_v uchun grid_id qiymati (Orders sahifasi bilan bir xil)
  readonly gridId = 9;

  @ViewChild(GridComponent) grid!: GridComponent;
  pageConfig: GridPage | null = null;

  get cfgSearch(): boolean { return this.pageConfig?.gridConfig.search ?? false; }

  onSearch(text: string): void { this.grid?.applyFilter(text); }

  constructor(private router: Router) {}

  onOpenInvoice(row: Record<string, any>): void {
    const id = row['order_id'] ?? row['id'];
    if (id) this.router.navigate(['/invoice', id]);
  }
}
