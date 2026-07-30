import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { PurchaseService } from '../../services/purchase.service';
import { CustomerService } from '../../services/customer.service';
import { WarehouseService } from '../../services/warehouse.service';

interface StatCard {
  type: 'chemicals' | 'orders' | 'customers' | 'stock';
  label: string;
  value: string;
  color: string;
  bg: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  readonly gridId = 8;
  loading = true;

  stats: StatCard[] = [
    { type: 'chemicals', label: 'Kimyoviy moddalar', value: '—', color: '#1D9E75', bg: 'rgba(29,158,117,0.1)' },
    { type: 'orders',    label: 'Xaridlar',           value: '—', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
    { type: 'customers', label: 'Mijozlar',            value: '—', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
    { type: 'stock',     label: 'Ombor yozuvlari',    value: '—', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  ];

  constructor(
    private productService: ProductService,
    private purchaseService: PurchaseService,
    private customerService: CustomerService,
    private warehouseService: WarehouseService,
  ) {}

  ngOnInit(): void {
    forkJoin({
      products:   this.productService.getAll(),
      purchases:  this.purchaseService.getAll(),
      customers:  this.customerService.getAll(),
      warehouses: this.warehouseService.getAll(),
    }).subscribe({
      next: ({ products, purchases, customers, warehouses }) => {
        this.stats[0].value = String(products.length);
        this.stats[1].value = String(purchases.length);
        this.stats[2].value = String(customers.length);
        this.stats[3].value = String(warehouses.length);
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }
}
