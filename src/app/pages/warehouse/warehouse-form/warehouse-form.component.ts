import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Product, ProductService } from '../../../services/product.service';
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
  isEdit: boolean;
  form: FormGroup;
  products: Product[] = [];

  readonly measures = ['kg', 'g', 'tonna', 'litr', 'ml', 'dona', 'm³'];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private dialogRef: MatDialogRef<WarehouseFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Record<string, any> | null,
  ) {
    this.isEdit = !!data;
    this.form = this.fb.group({
      productId:    [data?.['product_id']    ?? null, Validators.required],
      residual:     [data?.['residual']      ?? null, [Validators.required, Validators.min(0)]],
      measure:      [data?.['measure']       ?? null, Validators.required],
      storageSpace: [data?.['storage_space'] ?? ''],
      state:        [data?.['state'] !== 'INACTIVE'],
    });
  }

  ngOnInit(): void {
    this.productService.getAll().subscribe({
      next: products => this.products = products.filter(p => p.state === 'ACTIVE'),
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    const result: WarehouseFormResult = {
      id: this.data?.['id'],
      dto: {
        productId:    v.productId,
        residual:     v.residual,
        measure:      v.measure,
        storageSpace: v.storageSpace,
        state:        v.state ? 'ACTIVE' : 'INACTIVE',
      },
    };
    this.dialogRef.close(result);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
