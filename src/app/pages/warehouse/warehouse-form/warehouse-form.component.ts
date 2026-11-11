import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastService } from '../../../services/toast.service';
import { GridComponent } from '../../../components/grid/grid.component';
import { Product, ProductService } from '../../../services/product.service';
import { PurchaseService } from '../../../services/purchase.service';
import { SettingsItem, SettingsService } from '../../../services/settings.service';
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

  readonly purchaseGridId = 15;
  readonly itemsGridId    = 13;
  @ViewChild('purchaseGrid') purchaseGrid?: GridComponent;
  @ViewChild('itemsGrid')    itemsGrid?:    GridComponent;

  products: Product[] = [];
  currencies: SettingsItem[] = [];
  selectedRow:  Record<string, any> | null = null;
  selectedItem: Record<string, any> | null = null;
  rejecting = false;

  readonly measures = ['kg', 'g', 'tonna', 'litr', 'ml', 'dona', 'm³'];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private purchaseService: PurchaseService,
    private settingsService: SettingsService,
    private toast: ToastService,
    private dialogRef: MatDialogRef<WarehouseFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Record<string, any> | null,
  ) {
    this.purchaseMode = !!data?.['purchaseMode'];
    this.isEdit = !!data && !data['purchaseMode'];

    this.form = this.fb.group({
      purchaseId:   [data?.['purchase_id'] ?? null],
      productId:    [data?.['product_id']  ?? null],
      currencyId:   [data?.['currency']?.['id'] ?? null],
      residual:     [data?.['residual']    ?? null, [Validators.required, Validators.min(0)]],
      price:        [data?.['price']       ?? null, Validators.min(0)],
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
    this.settingsService.getCurrencies().subscribe({
      next: list => this.currencies = list,
    });
    if (!this.purchaseMode) {
      this.productService.getAll().subscribe({
        next: products => this.products = products,
      });
    }
  }

  onSelectPurchase(row: Record<string, any>): void {
    this.selectedRow  = row;
    this.selectedItem = null;
    this.form.get('purchaseId')!.setValue(row['purchase_id']);
  }

  onSelectItem(row: Record<string, any>): void {
    this.selectedItem = row;
    this.form.patchValue({
      residual:  row['quantity'] ?? null,
      price:     row['price']    ?? null,
      measure:   row['measure']  ?? 'kg',
    });
  }

  onRejectPurchase(row: Record<string, any>): void {
    this.rejecting = true;
    this.purchaseService.reject(row['purchase_id']).subscribe({
      next: res => {
        this.toast.success(res.message ?? 'Xarid qaytarildi');
        this.rejecting = false;
        if (this.selectedRow?.['purchase_id'] === row['purchase_id']) {
          this.selectedRow = null;
          this.form.get('purchaseId')!.setValue(null);
        }
        this.purchaseGrid?.load();
      },
      error: () => {
        this.toast.error('Xato yuz berdi');
        this.rejecting = false;
      },
    });
  }

  submit(): void {
    if (this.purchaseMode && !this.selectedItem) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    const result: WarehouseFormResult = {
      id: this.data?.['id'],
      dto: {
        residual:     v.residual,
        price:        v.price ?? undefined,
        measure:      v.measure,
        storageSpace: v.storageSpace,
        state:        v.state ? 'ACTIVE' : 'INACTIVE',
        currencyId:   v.currencyId ?? undefined,
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


