import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Product, ProductDto } from '../../../services/product.service';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
})
export class ProductFormComponent {
  form: FormGroup;
  isEdit: boolean;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ProductFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Product | null
  ) {
    this.isEdit = !!data;
    this.form = this.fb.group({
      productName:       [data?.productName       ?? '', Validators.required],
      composition:       [data?.composition       ?? ''],
      measure:           [data?.measure           ?? '', Validators.required],
      countryManufacture:[data?.countryManufacture ?? ''],
      manufacturerName:  [data?.manufacturerName  ?? ''],
      state:             [data?.state             ?? 'ACTIVE', Validators.required],
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const dto: ProductDto = this.form.value;
    this.dialogRef.close(dto);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
