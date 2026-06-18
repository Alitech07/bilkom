import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { Permission, PermissionService } from '../../services/permission.service';
import { Role, RolesService } from '../../services/roles.service';

interface ModuleCard {
  name: string;
  permissions: Permission[];
  checked: boolean;
  indeterminate: boolean;
}

@Component({
  selector: 'app-modules',
  templateUrl: './modules.component.html',
  styleUrls: ['./modules.component.scss']
})
export class ModulesComponent implements OnInit {
  roles: Role[] = [];
  selectedRoleId: number | null = null;
  moduleCards: ModuleCard[] = [];
  loading = false;
  saving = false;

  private allPermissions: Permission[] = [];
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
        this.allPermissions = permissions;
        this.roles = roles;
        this.moduleCards = this.buildCards(permissions);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snack.open('Yuklab bo\'lmadi', 'OK', { duration: 3000 });
      },
    });
  }

  private buildCards(permissions: Permission[]): ModuleCard[] {
    const map = new Map<string, Permission[]>();
    for (const p of permissions) {
      const mod = p.module ?? 'BOSHQA';
      if (!map.has(mod)) map.set(mod, []);
      map.get(mod)!.push(p);
    }
    return Array.from(map.entries()).map(([name, perms]) => ({
      name,
      permissions: perms,
      checked: false,
      indeterminate: false,
    }));
  }

  onRoleChange(roleId: number) {
    this.selectedRole = this.roles.find(r => r.id === roleId) ?? null;
    const rolePermIds = new Set((this.selectedRole?.permissions ?? []).map(p => p.id));

    for (const card of this.moduleCards) {
      const total   = card.permissions.length;
      const matched = card.permissions.filter(p => rolePermIds.has(p.id)).length;
      card.checked       = matched === total && total > 0;
      card.indeterminate = matched > 0 && matched < total;
    }
  }

  toggleCard(card: ModuleCard) {
    if (!this.selectedRoleId) return;
    const next = card.indeterminate || !card.checked;
    card.checked       = next;
    card.indeterminate = false;
  }

  save() {
    if (!this.selectedRole) return;

    const rolePermIds = new Set((this.selectedRole.permissions ?? []).map(p => p.id));

    const permissionIds: number[] = [];
    for (const card of this.moduleCards) {
      if (card.checked) {
        card.permissions.forEach(p => permissionIds.push(p.id));
      } else if (card.indeterminate) {
        card.permissions
          .filter(p => rolePermIds.has(p.id))
          .forEach(p => permissionIds.push(p.id));
      }
    }

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
            ? { ...r, permissions: this.allPermissions.filter(p => permissionIds.includes(p.id)) }
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
