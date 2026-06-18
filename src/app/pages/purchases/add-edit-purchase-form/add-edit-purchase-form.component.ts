import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SupplierService } from '../../../services/supplier.service';

export interface Purchase {
  id: number;
  name: string;
  description: string;
  price: number;
  amount: number;
  track: string;
}

@Component({
  selector: 'app-add-edit-purchase-form',
  templateUrl: './add-edit-purchase-form.component.html',
  styleUrls: ['./add-edit-purchase-form.component.scss']
})
export class AddEditPurchaseFormComponent implements OnInit {
  isEdit: boolean;
  form: FormGroup;
  supplierNames: string[] = [];

  constructor(
    private fb: FormBuilder,
    private supplierService: SupplierService,
    private dialogRef: MatDialogRef<AddEditPurchaseFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Purchase | null
  ) {
    this.isEdit = !!data;
    this.form = this.fb.group({
      name:        [data?.name        ?? '', Validators.required],
      description: [data?.description ?? ''],
      price:       [data?.price       ?? null, [Validators.required, Validators.min(0)]],
      amount:      [data?.amount      ?? null, [Validators.required, Validators.min(1)]],
      track:       [data?.track       ?? '',   Validators.required],
    });
  }

  ngOnInit() {
    this.supplierService.getAll().subscribe({
      next: (suppliers) => {
        this.supplierNames = suppliers.map(s => s.legalName);
      },
    });
  }

  cancel() {
    this.dialogRef.close();
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close({ ...this.data, ...this.form.value });
  }
}
