import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Order, OrderService } from '../../../services/order.service';
import { warehouseProductName } from '../../../services/warehouse.service';

@Component({
  selector: 'app-invoice-detail',
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.scss']
})
export class InvoiceDetailComponent implements OnInit {
  order: Order | null = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error = 'Buyurtma raqami noto\'g\'ri';
      this.loading = false;
      return;
    }
    this.orderService.getById(id).subscribe({
      next: (order) => {
        this.order = order;
        this.loading = false;
      },
      error: () => {
        this.error = 'Buyurtma topilmadi';
        this.loading = false;
      },
    });
  }

  productName = warehouseProductName;

  subtotal(quantity: number, price: number): number {
    return quantity * price;
  }

  print(): void {
    window.print();
  }
}
