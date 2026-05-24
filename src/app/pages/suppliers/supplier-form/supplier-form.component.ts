import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface Supplier {
  id: number;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  status: 'Faol' | 'Nofaol';
}

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
      name:          [data?.name          ?? '', Validators.required],
      contactPerson: [data?.contactPerson ?? '', Validators.required],
      phone:         [data?.phone         ?? '', Validators.required],
      email:         [data?.email         ?? '', Validators.email],
      address:       [data?.address       ?? ''],
      status:        [data?.status        ?? 'Faol', Validators.required],
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close({ ...this.data, ...this.form.value });
  }

  cancel() {
    this.dialogRef.close();
  }
}
