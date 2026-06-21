import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Employee, EmployeeDto } from '../../../services/employee.service';

@Component({
  selector: 'app-employee-form',
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.scss']
})
export class EmployeeFormComponent {
  form: FormGroup;
  isEdit: boolean;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EmployeeFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Employee | null
  ) {
    this.isEdit = !!data;
    this.form = this.fb.group({
      firstName:   [data?.firstName   ?? '', Validators.required],
      lastName:    [data?.lastName    ?? '', Validators.required],
      middleName:  [data?.middleName  ?? ''],
      phoneNumber: [data?.phoneNumber ?? '', Validators.required],
      email:       [data?.email       ?? '', Validators.email],
      address:     [data?.address     ?? ''],
      inps:        [data?.inps        ?? ''],
      pasportCode: [data?.pasportCode ?? ''],
      photo:       [data?.photo       ?? ''],
      state:       [data?.state !== 'INACTIVE'],
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    const dto: EmployeeDto = {
      firstName:   v.firstName,
      lastName:    v.lastName,
      middleName:  v.middleName,
      phoneNumber: v.phoneNumber,
      email:       v.email,
      address:     v.address,
      inps:        v.inps,
      pasportCode: v.pasportCode,
      photo:       v.photo,
      state:       v.state ? 'ACTIVE' : 'INACTIVE',
    };
    this.dialogRef.close(dto);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
