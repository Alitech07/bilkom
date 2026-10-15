import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Product, ProductDto } from '../../../services/product.service';
import { CategoryService, Category } from '../../../services/category.service';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
})
export class ProductFormComponent implements OnInit {
  form: FormGroup;
  isEdit: boolean;
  categories: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    public dialogRef: MatDialogRef<ProductFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Product | null
  ) {
    this.isEdit = !!data;
    this.form = this.fb.group({
      productName:       [data?.productName         ?? '', Validators.required],
      categoryId:        [data?.category?.id        ?? null],
      composition:       [data?.composition         ?? ''],
      measure:           [data?.measure             ?? '', Validators.required],
      countryManufacture:[data?.countryManufacture  ?? ''],
      manufacturerName:  [data?.manufacturerName    ?? ''],
      state:             [data?.state               ?? 'ACTIVE', Validators.required],
    });
  }

  ngOnInit(): void {
    this.categoryService.getAll().subscribe({
      next: categories => this.categories = categories,
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
