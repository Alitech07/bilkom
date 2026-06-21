import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { ModuleGroup, PermissionService } from '../../services/permission.service';
import { Role, RolesService } from '../../services/roles.service';

@Component({
  selector: 'app-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.scss']
})
export class PermissionsComponent implements OnInit {
  roles: Role[] = [];
  selectedRoleId: number | null = null;
  moduleGroups: ModuleGroup[] = [];
  loading = false;
  saving = false;

  private selectedRole: Role | null = null;

  constructor(
    private permissionService: PermissionService,
    private rolesService: RolesService,
    private snack: MatSnackBar,
  ) {}

  ngOnInit() {
    this.loading = true;
    forkJoin({
      permissions: this.permissionService.getAll(),
      roles: this.rolesService.getAll(),
    }).subscribe({
      next: ({ permissions, roles }) => {
        this.roles = roles;
        this.moduleGroups = this.permissionService.groupByModule(permissions);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snack.open('Ma\'lumotlarni yuklashda xato', 'OK', { duration: 3000 });
      },
    });
  }

  onRoleChange(roleId: number) {
    this.selectedRole = this.roles.find(r => r.id === roleId) ?? null;
    const rolePermIds = new Set((this.selectedRole?.permissions ?? []).map(p => p.id));
    for (const group of this.moduleGroups) {
      for (const row of group.rows) {
        row.checked = rolePermIds.has(row.permission.id);
      }
    }
  }

  save() {
    if (!this.selectedRole) return;
    const permissionIds = this.moduleGroups
      .flatMap(g => g.rows)
      .filter(r => r.checked)
      .map(r => r.permission.id);

    this.saving = true;
    this.rolesService.edit(this.selectedRole.id, {
      name: this.selectedRole.name,
      description: this.selectedRole.description,
      permissionIds,
    }).subscribe({
      next: (res) => {
        this.saving = false;
        this.snack.open(res.message ?? 'Saqlandi', 'OK', { duration: 3000 });
        this.roles = this.roles.map(r =>
          r.id === this.selectedRole!.id
            ? { ...r, permissions: this.moduleGroups.flatMap(g => g.rows).filter(row => row.checked).map(row => row.permission) }
            : r
        );
        this.selectedRole = this.roles.find(r => r.id === this.selectedRole!.id) ?? null;
      },
      error: () => {
        this.saving = false;
        this.snack.open('Saqlashda xato', 'OK', { duration: 3000 });
      },
    });
  }
}
