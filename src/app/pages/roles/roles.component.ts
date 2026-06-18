import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RoleDto, RolesService } from '../../services/roles.service';
import { GridComponent } from '../../components/grid/grid.component';
import { GridPage } from '../../services/grid.service';
import { RoleFormComponent } from './role-form/role-form.component';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent {
  // core.grids jadvalidagi roles uchun grid_id qiymati bilan almashtirilsin
  readonly gridId = 7;

  @ViewChild(GridComponent) grid!: GridComponent;
  pageConfig: GridPage | null = null;

  get cfgSearch(): boolean { return this.pageConfig?.gridConfig.search ?? false; }
  get cfgFilter(): boolean { return this.pageConfig?.gridConfig.filter ?? false; }
  get cfgExcel(): boolean  { return !!this.pageConfig?.gridColumns?.some(c => c.exportable); }

  onSearch(text: string): void { this.grid?.applyFilter(text); }

  constructor(
    private rolesService: RolesService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
  ) {}

  onExcel(): void { this.grid?.exportToExcel(); }

  openAdd(): void {
    this.dialog.open(RoleFormComponent, {
      data: null, width: '500px', disableClose: true,
    }).afterClosed().subscribe((dto: RoleDto | undefined) => {
      if (!dto) return;
      this.rolesService.add(dto).subscribe({
        next: (res) => {
          this.snack.open(res.message ?? 'Rol qo\'shildi', 'OK', { duration: 3000 });
          this.grid.load();
        },
        error: () => this.snack.open('Xato yuz berdi', 'OK', { duration: 3000 }),
      });
    });
  }

  onEdit(row: Record<string, any>): void {
    this.rolesService.getById(row['id']).subscribe({
      next: (role) => {
        this.dialog.open(RoleFormComponent, {
          data: role, width: '500px', disableClose: true,
        }).afterClosed().subscribe((dto: RoleDto | undefined) => {
          if (!dto) return;
          this.rolesService.edit(role.id, dto).subscribe({
            next: (res) => {
              this.snack.open(res.message ?? 'Rol yangilandi', 'OK', { duration: 3000 });
              this.grid.load();
            },
            error: () => this.snack.open('Xato yuz berdi', 'OK', { duration: 3000 }),
          });
        });
      },
      error: () => this.snack.open('Rol ma\'lumotlarini yuklashda xato', 'OK', { duration: 3000 }),
    });
  }

  onDelete(row: Record<string, any>): void {
    this.rolesService.delete(row['id']).subscribe({
      next: (res) => {
        this.snack.open(res.message ?? 'Rol o\'chirildi', 'OK', { duration: 3000 });
        this.grid.load();
      },
      error: () => this.snack.open('Xato yuz berdi', 'OK', { duration: 3000 }),
    });
  }
}
