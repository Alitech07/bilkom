import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Product, ProductService } from '../../../services/product.service';
import { Purchase, PurchaseService } from '../../../services/purchase.service';
import { WarehouseDto } from '../../../services/warehouse.service';

export interface WarehouseFormResult {
  id?: number;
  dto: WarehouseDto;
}

@Component({
  selector: 'app-warehouse-form',
  templateUrl: './warehouse-form.component.html',
  styleUrls: ['./warehouse-form.component.scss']
})
export class WarehouseFormComponent implements OnInit {
  purchaseMode: boolean;
  isEdit: boolean;
  form: FormGroup;

  products: Product[] = [];
  purchases: Purchase[] = [];
  selectedPurchase: Purchase | null = null;

  readonly measures = ['kg', 'g', 'tonna', 'litr', 'ml', 'dona', 'm³'];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private purchaseService: PurchaseService,
    private dialogRef: MatDialogRef<WarehouseFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Record<string, any> | null,
  ) {
    this.purchaseMode = !!data?.['purchaseMode'];
    this.isEdit = !!data && !data['purchaseMode'];

    this.form = this.fb.group({
      purchaseId:   [data?.['purchase_id'] ?? null],
      productId:    [data?.['product_id']  ?? null],
      residual:     [data?.['residual']    ?? null, [Validators.required, Validators.min(0)]],
      measure:      [data?.['measure']     ?? null, Validators.required],
      storageSpace: [data?.['storage_space'] ?? ''],
      state:        [data?.['state'] !== 'INACTIVE'],
    });

    if (this.purchaseMode) {
      this.form.get('purchaseId')!.setValidators(Validators.required);
    } else {
      this.form.get('productId')!.setValidators(Validators.required);
    }
  }

  ngOnInit(): void {
    if (this.purchaseMode) {
      this.purchaseService.getAll().subscribe({
        next: list => {
          this.purchases = list;
          const preselectedId = this.data?.['purchase_id'];
          if (preselectedId) {
            this.selectedPurchase = list.find(p => p.id === preselectedId) ?? null;
          }
        },
      });
    } else {
      this.productService.getAll().subscribe({
        next: products => this.products = products,
      });
    }
  }

  onPurchaseSelect(id: number): void {
    this.selectedPurchase = this.purchases.find(p => p.id === id) ?? null;
  }

  submit(): void {
    if (this.form.invalid || (this.purchaseMode && !this.selectedPurchase)) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    const result: WarehouseFormResult = {
      id: this.data?.['id'],
      dto: {
        residual:     v.residual,
        measure:      v.measure,
        storageSpace: v.storageSpace,
        state:        v.state ? 'ACTIVE' : 'INACTIVE',
        ...(this.purchaseMode
          ? { purchaseId: v.purchaseId }
          : { productId:  v.productId  }),
      },
    };
    this.dialogRef.close(result);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
