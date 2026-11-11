import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProductService } from '../../services/product.service';
import { PurchaseService } from '../../services/purchase.service';
import { CustomerService } from '../../services/customer.service';
import { WarehouseService } from '../../services/warehouse.service';
import { OrderService } from '../../services/order.service';
// @ts-ignore
import * as _AC from 'apexcharts';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ApexCharts: any = (_AC as any).default ?? _AC;

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
export class DashboardComponent implements OnInit, AfterViewChecked {
  readonly gridId = 8;
  loading = true;
  chartsReady = false;

  @ViewChild('donutChart') donutChartRef!: ElementRef;
  @ViewChild('supplierChart') supplierChartRef!: ElementRef;
  @ViewChild('orderChart') orderChartRef!: ElementRef;

  private chartsRendered = false;
  private donutData: { series: number[]; labels: string[] } = { series: [], labels: [] };
  private supplierData: { categories: string[]; values: number[] } = { categories: [], values: [] };
  private orderData: number[] = [0, 0, 0, 0];

  stats: StatCard[] = [
    { type: 'chemicals', label: 'Kimyoviy moddalar', value: '—', color: '#1D9E75', bg: 'rgba(29,158,117,0.1)' },
    { type: 'orders',    label: 'Buyurtmalar',        value: '—', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
    { type: 'customers', label: 'Mijozlar',            value: '—', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
    { type: 'stock',     label: 'Ombor yozuvlari',    value: '—', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  ];

  constructor(
    private productService: ProductService,
    private purchaseService: PurchaseService,
    private customerService: CustomerService,
    private warehouseService: WarehouseService,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    forkJoin({
      products:   this.productService.getAll().pipe(catchError(() => of([]))),
      purchases:  this.purchaseService.getAll().pipe(catchError(() => of([]))),
      customers:  this.customerService.getAll().pipe(catchError(() => of([]))),
      warehouses: this.warehouseService.getAll().pipe(catchError(() => of([]))),
      orders:     this.orderService.getAll().pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ products, purchases, customers, warehouses, orders }) => {
        this.stats[0].value = String(products.length);
        this.stats[1].value = String(orders.length);
        this.stats[2].value = String(customers.length);
        this.stats[3].value = String(warehouses.length);
        this.loading = false;

        // Donut data
        const productCount: Record<string, number> = {};
        purchases.forEach((p: any) =>
          p.items?.forEach((item: any) => {
            const name = item.product?.productName ?? 'Noma\'lum';
            productCount[name] = (productCount[name] ?? 0) + 1;
          })
        );
        const sortedProducts = Object.entries(productCount).sort((a, b) => b[1] - a[1]).slice(0, 7);
        this.donutData = {
          series: sortedProducts.map(([, v]) => v),
          labels: sortedProducts.map(([k]) => k),
        };

        // Supplier bar data
        const supplierCount: Record<string, number> = {};
        purchases.forEach((p: any) => {
          const name = p.supplier?.brandName || p.supplier?.legalName || 'Noma\'lum';
          supplierCount[name] = (supplierCount[name] ?? 0) + 1;
        });
        const sortedSuppliers = Object.entries(supplierCount).sort((a, b) => b[1] - a[1]).slice(0, 8);
        this.supplierData = {
          categories: sortedSuppliers.map(([k]) => k),
          values: sortedSuppliers.map(([, v]) => v),
        };

        // Order status data
        const statusMap: Record<string, number> = { PENDING: 0, CONFIRMED: 0, DELIVERED: 0, CANCELLED: 0 };
        orders.forEach((o: any) => { if (statusMap[o.status] !== undefined) statusMap[o.status]++; });
        this.orderData = [statusMap['PENDING'], statusMap['CONFIRMED'], statusMap['DELIVERED'], statusMap['CANCELLED']];

        this.chartsReady = true;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; },
    });
  }

  ngAfterViewChecked(): void {
    if (this.chartsReady && !this.chartsRendered && this.donutChartRef?.nativeElement) {
      this.chartsRendered = true;
      this.renderCharts();
    }
  }

  private renderCharts(): void {
    if (this.donutChartRef?.nativeElement) {
      new ApexCharts(this.donutChartRef.nativeElement, {
        series: this.donutData.series,
        labels: this.donutData.labels,
        chart: { type: 'donut', height: 300, fontFamily: 'Inter, sans-serif', toolbar: { show: false } },
        fill: { colors: ['#1D9E75','#3B82F6','#8B5CF6','#F59E0B','#EF4444','#06B6D4','#84CC16'] },
        legend: { position: 'bottom', fontSize: '12px', fontFamily: 'Inter, sans-serif' },
        dataLabels: { enabled: true, style: { fontSize: '11px', fontFamily: 'Inter, sans-serif' } },
        tooltip: { y: { formatter: (v: number) => `${v} ta` } },
        plotOptions: { pie: { donut: { size: '60%' } } },
        noData: { text: 'Ma\'lumot yo\'q' },
      }).render();
    }

    if (this.supplierChartRef?.nativeElement) {
      new ApexCharts(this.supplierChartRef.nativeElement, {
        series: [{ name: 'Xaridlar', data: this.supplierData.values }],
        chart: { type: 'bar', height: 300, fontFamily: 'Inter, sans-serif', toolbar: { show: false } },
        xaxis: { categories: this.supplierData.categories, labels: { style: { fontSize: '11px', fontFamily: 'Inter, sans-serif' } } },
        plotOptions: { bar: { horizontal: true, barHeight: '60%', borderRadius: 4 } },
        fill: { colors: ['#1D9E75'] },
        dataLabels: { enabled: false },
        tooltip: { y: { formatter: (v: number) => `${v} ta xarid` } },
        noData: { text: 'Ma\'lumot yo\'q' },
      }).render();
    }

    if (this.orderChartRef?.nativeElement) {
      new ApexCharts(this.orderChartRef.nativeElement, {
        series: [{ name: 'Buyurtmalar', data: this.orderData }],
        chart: { type: 'bar', height: 300, fontFamily: 'Inter, sans-serif', toolbar: { show: false } },
        xaxis: { categories: ['Kutilmoqda', 'Tasdiqlangan', 'Yetkazilgan', 'Bekor qilingan'] },
        plotOptions: { bar: { horizontal: false, columnWidth: '45%', borderRadius: 6, distributed: true } },
        fill: { colors: ['#F59E0B', '#1D9E75', '#3B82F6', '#EF4444'] },
        dataLabels: { enabled: false },
        stroke: { show: true, width: 2, colors: ['transparent'] },
        tooltip: { y: { formatter: (v: number) => `${v} ta` } },
        legend: { show: false },
        noData: { text: 'Ma\'lumot yo\'q' },
      }).render();
    }
  }
}
