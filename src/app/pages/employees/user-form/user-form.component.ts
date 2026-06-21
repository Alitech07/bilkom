import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Role, RolesService } from '../../../services/roles.service';
import { UserDto, UserResponse } from '../../../services/user.service';
import { Employee, EmployeeService } from '../../../services/employee.service';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  form: FormGroup;
  isEdit: boolean;
  roles: Role[] = [];
  employees: Employee[] = [];

  constructor(
    private fb: FormBuilder,
    private rolesService: RolesService,
    private employeeService: EmployeeService,
    public dialogRef: MatDialogRef<UserFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserResponse | null
  ) {
    this.isEdit = !!data;
    const existingRoleIds = data?.roles?.map(r => r.id) ?? [];
    this.form = this.fb.group({
      fullName: [data?.fullname  ?? '', Validators.required],
      login:    [data?.login     ?? '', Validators.required],
      password: ['', this.isEdit ? [] : [Validators.required, Validators.minLength(6)]],
      isActive: [data?.isActive !== 'P'],
      roleIds:  [existingRoleIds],
    });
  }

  ngOnInit(): void {
    this.rolesService.getAll().subscribe({ next: roles => this.roles = roles });
    this.employeeService.getAll().subscribe({
      next: employees => this.employees = employees.filter(e => e.state === 'ACTIVE'),
    });
  }

  employeeFullName(e: Employee): string {
    return [e.lastName, e.firstName, e.middleName].filter(Boolean).join(' ');
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    const dto: UserDto = {
      fullName: v.fullName,
      login:    v.login,
      password: v.password,
      isActive: v.isActive ? 'A' : 'P',
      roleIds:  v.roleIds ?? [],
    };
    this.dialogRef.close(dto);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
