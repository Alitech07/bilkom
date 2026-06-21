import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Supplier, SupplierDto } from '../../../services/supplier.service';

@Component({
  selector: 'app-supplier-form',
  templateUrl: './supplier-form.component.html',
  styleUrls: ['./supplier-form.component.scss']
})
export class SupplierFormComponent {
  form: FormGroup;
  isEdit: boolean;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<SupplierFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Supplier | null
  ) {
    this.isEdit = !!data;
    this.form = this.fb.group({
      freightForwarder: [data?.freightForwarder ?? ''],
      legalName:        [data?.legalName        ?? '', Validators.required],
      brandName:        [data?.brandName        ?? ''],
      typeOfActivity:   [data?.typeOfActivity   ?? ''],
      contactPerson:    [data?.contactPerson    ?? ''],
      phone:            [data?.phone            ?? '', Validators.required],
      email:            [data?.email            ?? '', Validators.email],
      address:          [data?.address          ?? ''],
      isActive:         [data?.isActive !== 'P'],
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const dto: SupplierDto = {
      ...this.form.value,
      isActive: this.form.value.isActive ? 'A' : 'P',
    };
    this.dialogRef.close(dto);
  }

  cancel() {
    this.dialogRef.close();
  }
}
