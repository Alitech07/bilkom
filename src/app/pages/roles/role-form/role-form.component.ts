import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Role } from '../../../services/roles.service';
import { ModuleService, SysModule } from '../../../services/module.service';

@Component({
  selector: 'app-role-form',
  templateUrl: './role-form.component.html',
  styleUrls: ['./role-form.component.scss']
})
export class RoleFormComponent implements OnInit {
  form: FormGroup;
  isEdit: boolean;
  allModules: SysModule[] = [];

  constructor(
    private fb: FormBuilder,
    private moduleService: ModuleService,
    public dialogRef: MatDialogRef<RoleFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Role | null
  ) {
    this.isEdit = !!data;
    this.form = this.fb.group({
      name:        [data?.name        ?? '', Validators.required],
      description: [data?.description ?? ''],
      moduleIds:   [data?.modules?.map(m => m.id) ?? []],
    });
  }

  ngOnInit(): void {
    this.moduleService.getAll().subscribe(mods => {
      this.allModules = mods;
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.form.value);
  }

  cancel() {
    this.dialogRef.close();
  }
}
