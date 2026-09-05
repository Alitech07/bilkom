import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Client, CustomerService } from '../../../services/customer.service';
import { Warehouse, WarehouseService, warehouseProductName } from '../../../services/warehouse.service';
import { Order, OrderDto, OrderItemDto } from '../../../services/order.service';

export interface OrderFormResult {
  id?: number;
  dto: OrderDto;
}

@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.scss']
})
export class OrderFormComponent implements OnInit {
  isEdit: boolean;
  form: FormGroup;
  clients: Client[] = [];
  warehouses: Warehouse[] = [];

  private heldByOrder = new Map<number, number>();

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private warehouseService: WarehouseService,
    private dialogRef: MatDialogRef<OrderFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { order?: Order } | null,
  ) {
    const order = data?.order;
    this.isEdit = !!order;

    this.form = this.fb.group({
      clientId: [order?.client?.id ?? null, Validators.required],
      orderDescription: [order?.orderDescription ?? ''],
      items: this.fb.array(
        order?.items?.length
          ? order.items.map(it => this.buildItemGroup(it.warehouse.id, it.quantity, it.price))
          : [this.buildItemGroup()]
      ),
    });
  }

  ngOnInit(): void {
    const order = this.data?.order;
    if (order) {
      for (const it of order.items) {
        this.heldByOrder.set(it.warehouse.id, (this.heldByOrder.get(it.warehouse.id) ?? 0) + it.quantity);
      }
    }

    this.customerService.getAll().subscribe({
      next: clients => this.clients = clients.filter(c => c.state === 'ACTIVE'),
    });

    this.warehouseService.getAvailableStock().subscribe({
      next: list => {
        const map = new Map<number, Warehouse>(list.map(w => [w.id, w]));
        if (order) {
          for (const it of order.items) {
            if (!map.has(it.warehouse.id)) map.set(it.warehouse.id, it.warehouse);
          }
        }
        this.warehouses = [...map.values()];
      },
    });
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  private buildItemGroup(warehouseId: number | null = null, quantity: number | null = null, price: number | null = null): FormGroup {
    return this.fb.group({
      warehouseId: [warehouseId, Validators.required],
      quantity: [quantity, [Validators.required, Validators.min(0.001)]],
      price: [price, [Validators.required, Validators.min(0)]],
    });
  }

  addItem(): void {
    this.items.push(this.buildItemGroup());
  }

  removeItem(index: number): void {
    if (this.items.length > 1) this.items.removeAt(index);
  }

  productName(warehouseId: number | null): string {
    const w = this.warehouses.find(x => x.id === warehouseId);
    return w ? warehouseProductName(w) : '';
  }

  measureFor(warehouseId: number | null): string {
    const w = this.warehouses.find(x => x.id === warehouseId);
    return w?.measure ?? '';
  }

  availableFor(warehouseId: number | null): number {
    if (warehouseId == null) return 0;
    const w = this.warehouses.find(x => x.id === warehouseId);
    const base = w?.residual ?? 0;
    return base + (this.heldByOrder.get(warehouseId) ?? 0);
  }

  exceedsStock(index: number): boolean {
    const group = this.items.at(index);
    const warehouseId = group.get('warehouseId')?.value;
    const quantity = group.get('quantity')?.value;
    if (warehouseId == null || quantity == null) return false;
    return quantity > this.availableFor(warehouseId);
  }

  subtotal(index: number): number {
    const group = this.items.at(index);
    const q = Number(group.get('quantity')?.value) || 0;
    const p = Number(group.get('price')?.value) || 0;
    return q * p;
  }

  get total(): number {
    return this.items.controls.reduce((sum, _g, i) => sum + this.subtotal(i), 0);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  submit(): void {
    const hasStockError = this.items.controls.some((_, i) => this.exceedsStock(i));
    if (this.form.invalid || hasStockError) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    const dto: OrderDto = {
      clientId: v.clientId,
      orderDescription: v.orderDescription,
      items: v.items as OrderItemDto[],
    };
    const result: OrderFormResult = { id: this.data?.order?.id, dto };
    this.dialogRef.close(result);
  }
}
