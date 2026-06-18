import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Client, ClientDto } from '../../../services/customer.service';

@Component({
  selector: 'app-customer-form',
  templateUrl: './customer-form.component.html',
})
export class CustomerFormComponent {
  form: FormGroup;
  isEdit: boolean;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CustomerFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Client | null
  ) {
    this.isEdit = !!data;
    this.form = this.fb.group({
      clientName: [data?.clientName ?? '', Validators.required],
      address:    [data?.address    ?? ''],
      phone:      [data?.phone      ?? '', Validators.required],
      inn:        [data?.inn        ?? ''],
      email:      [data?.email      ?? '', Validators.email],
      region:     [data?.region     ?? ''],
      state:      [data?.state      ?? 'ACTIVE', Validators.required],
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const dto: ClientDto = this.form.value;
    this.dialogRef.close(dto);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
