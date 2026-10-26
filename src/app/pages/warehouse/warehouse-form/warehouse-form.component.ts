import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
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
  @ViewChild('purchaseGrid') purchaseGrid?: GridComponent;

  products: Product[] = [];
  currencies: SettingsItem[] = [];
  selectedRow: Record<string, any> | null = null;
  rejecting = false;

  readonly measures = ['kg', 'g', 'tonna', 'litr', 'ml', 'dona', 'm³'];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private purchaseService: PurchaseService,
    private settingsService: SettingsService,
    private snack: MatSnackBar,
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
    this.selectedRow = row;
    this.form.get('purchaseId')!.setValue(row['purchase_id']);
  }

  onRejectPurchase(row: Record<string, any>): void {
    this.rejecting = true;
    this.purchaseService.reject(row['purchase_id']).subscribe({
      next: res => {
        this.snack.open(res.message ?? 'Xarid qaytarildi', 'OK', { duration: 3000 });
        this.rejecting = false;
        if (this.selectedRow?.['purchase_id'] === row['purchase_id']) {
          this.selectedRow = null;
          this.form.get('purchaseId')!.setValue(null);
        }
        this.purchaseGrid?.load();
      },
      error: () => {
        this.snack.open('Xato yuz berdi', 'OK', { duration: 3000 });
        this.rejecting = false;
      },
    });
  }

  submit(): void {
    if (this.form.invalid || (this.purchaseMode && !this.selectedRow)) {
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
