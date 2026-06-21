import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GridComponent } from '../../components/grid/grid.component';
import { GridConfig, GridPage } from '../../services/grid.service';
import { EmployeeDto, EmployeeService } from '../../services/employee.service';
import { UserDto, UserResponse, UserService } from '../../services/user.service';
import { EmployeeFormComponent } from './employee-form/employee-form.component';
import { UserFormComponent } from './user-form/user-form.component';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit {

  // ── Xodimlar tab ────────────────────────────────────────
  readonly empGridId = 2;

  @ViewChild('empGrid') empGrid!: GridComponent;
  empPageConfig: GridPage | null = null;

  get empCfgSearch(): boolean { return this.empPageConfig?.gridConfig.search ?? false; }
  get empCfgFilter(): boolean { return this.empPageConfig?.gridConfig.filter ?? false; }
  get empCfgExcel(): boolean  { return !!this.empPageConfig?.gridColumns?.some(c => c.exportable); }

  // ── Foydalanuvchilar tab ─────────────────────────────────
  userGridConfig: GridConfig | null = null;
  usersLoading = false;
  private users: UserResponse[] = [];

  @ViewChild('userGrid') userGrid!: GridComponent;

  constructor(
    private dialog: MatDialog,
    private snack: MatSnackBar,
    private employeeService: EmployeeService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  // ── Xodimlar ────────────────────────────────────────────

  onEmpSearch(text: string): void { this.empGrid?.applyFilter(text); }
  onEmpExcel(): void { this.empGrid?.exportToExcel(); }

  openAddEmployee(): void {
    this.dialog.open(EmployeeFormComponent, {
      data: null, width: '600px', disableClose: true,
    }).afterClosed().subscribe((dto: EmployeeDto | undefined) => {
      if (!dto) return;
      this.employeeService.add(dto).subscribe({
        next: res => {
          this.snack.open(res.message ?? 'Xodim qo\'shildi', 'OK', { duration: 3000 });
          this.empGrid?.load();
        },
        error: () => this.snack.open('Xato yuz berdi', 'OK', { duration: 3000 }),
      });
    });
  }

  onEditEmployee(row: Record<string, any>): void {
    const id: number = row['emp_id'] ?? row['id'];
    if (!id) return;
    this.employeeService.getById(id).subscribe({
      next: employee => {
        this.dialog.open(EmployeeFormComponent, {
          data: employee, width: '600px', disableClose: true,
        }).afterClosed().subscribe((dto: EmployeeDto | undefined) => {
          if (!dto) return;
          this.employeeService.edit(id, dto).subscribe({
            next: res => {
              this.snack.open(res.message ?? 'Yangilandi', 'OK', { duration: 3000 });
              this.empGrid?.load();
            },
            error: () => this.snack.open('Xato yuz berdi', 'OK', { duration: 3000 }),
          });
        });
      },
      error: () => this.snack.open('Ma\'lumotlarni yuklashda xato', 'OK', { duration: 3000 }),
    });
  }

  onDeleteEmployee(row: Record<string, any>): void {
    const id: number = row['emp_id'] ?? row['id'];
    if (!id) return;
    this.employeeService.delete(id).subscribe({
      next: res => {
        this.snack.open(res.message ?? 'Xodim o\'chirildi', 'OK', { duration: 3000 });
        this.empGrid?.load();
      },
      error: () => this.snack.open('Xato yuz berdi', 'OK', { duration: 3000 }),
    });
  }

  // ── Foydalanuvchilar ────────────────────────────────────

  loadUsers(): void {
    this.usersLoading = true;
    this.userService.getAll().subscribe({
      next: users => {
        this.users = users;
        this.userGridConfig = this.buildUserGridConfig(users);
        this.usersLoading = false;
      },
      error: () => { this.usersLoading = false; },
    });
  }

  private buildUserGridConfig(users: UserResponse[]): GridConfig {
    return {
      title: 'Foydalanuvchilar',
      columns: [
        { key: 'id',       label: '#',          type: 'number'                                             },
        { key: 'fullname', label: 'To\'liq ismi', type: 'text'                                             },
        { key: 'login',    label: 'Login',       type: 'text'                                              },
        { key: 'roles',    label: 'Rollar',      type: 'text'                                              },
        { key: 'holati',   label: 'Holati',      type: 'badge',
          badgeMap: { 'Faol': 'green', 'Nofaol': 'red' }                                                   },
      ],
      data: users.map(u => ({
        id:       u.id,
        fullname: u.fullname,
        login:    u.login,
        roles:    u.roles?.map(r => r.name).join(', ') || '—',
        holati:   u.isActive === 'A' ? 'Faol' : 'Nofaol',
      })),
    };
  }

  openAddUser(): void {
    this.dialog.open(UserFormComponent, {
      data: null, width: '560px', disableClose: true,
    }).afterClosed().subscribe((dto: UserDto | undefined) => {
      if (!dto) return;
      this.userService.add(dto).subscribe({
        next: res => {
          this.snack.open(res.message ?? 'Foydalanuvchi qo\'shildi', 'OK', { duration: 3000 });
          this.loadUsers();
        },
        error: () => this.snack.open('Xato yuz berdi', 'OK', { duration: 3000 }),
      });
    });
  }

  onEditUser(row: Record<string, any>): void {
    const user = this.users.find(u => u.id === row['id']);
    if (!user) return;
    this.dialog.open(UserFormComponent, {
      data: user, width: '560px', disableClose: true,
    }).afterClosed().subscribe((dto: UserDto | undefined) => {
      if (!dto) return;
      this.userService.edit(user.id, dto).subscribe({
        next: res => {
          this.snack.open(res.message ?? 'Yangilandi', 'OK', { duration: 3000 });
          this.loadUsers();
        },
        error: () => this.snack.open('Xato yuz berdi', 'OK', { duration: 3000 }),
      });
    });
  }

  onDeleteUser(row: Record<string, any>): void {
    const id: number = row['id'];
    if (!id) return;
    this.userService.delete(id).subscribe({
      next: res => {
        this.snack.open(res.message ?? 'Foydalanuvchi o\'chirildi', 'OK', { duration: 3000 });
        this.loadUsers();
      },
      error: () => this.snack.open('Xato yuz berdi', 'OK', { duration: 3000 }),
    });
  }
}
