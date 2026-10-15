import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoryService } from '../../services/category.service';
import { GridComponent } from '../../components/grid/grid.component';
import { GridPage } from '../../services/grid.service';
import { CategoryFormComponent } from './category-form/category-form.component';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent {
  readonly gridId = 12;

  @ViewChild(GridComponent) grid!: GridComponent;
  pageConfig: GridPage | null = null;

  get cfgSearch(): boolean { return this.pageConfig?.gridConfig.search ?? false; }
  get cfgFilter(): boolean { return this.pageConfig?.gridConfig.filter ?? false; }
  get cfgExcel(): boolean  { return !!this.pageConfig?.gridColumns?.some(c => c.exportable); }

  onSearch(text: string): void { this.grid?.applyFilter(text); }
  onExcel(): void { this.grid?.exportToExcel(); }

  constructor(
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
  ) {}

  openAdd(): void {
    this.dialog.open(CategoryFormComponent, {
      data: null, width: '480px', disableClose: true,
    }).afterClosed().subscribe((dto) => {
      if (!dto) return;
      this.categoryService.add(dto).subscribe({
        next: (res) => {
          this.snack.open(res.message ?? 'Qo\'shildi', 'OK', { duration: 3000 });
          this.grid.load();
        },
        error: () => this.snack.open('Xato yuz berdi', 'OK', { duration: 3000 }),
      });
    });
  }

  onEdit(row: Record<string, any>): void {
    this.categoryService.getById(row['id']).subscribe({
      next: (category) => {
        this.dialog.open(CategoryFormComponent, {
          data: category, width: '480px', disableClose: true,
        }).afterClosed().subscribe((dto) => {
          if (!dto) return;
          this.categoryService.edit(category.id, dto).subscribe({
            next: (res) => {
              this.snack.open(res.message ?? 'Yangilandi', 'OK', { duration: 3000 });
              this.grid.load();
            },
            error: () => this.snack.open('Xato yuz berdi', 'OK', { duration: 3000 }),
          });
        });
      },
      error: () => this.snack.open('Ma\'lumotlarni yuklashda xato', 'OK', { duration: 3000 }),
    });
  }

  onDelete(row: Record<string, any>): void {
    this.categoryService.delete(row['id']).subscribe({
      next: (res) => {
        this.snack.open(res.message ?? 'O\'chirildi', 'OK', { duration: 3000 });
        this.grid.load();
      },
      error: () => this.snack.open('Xato yuz berdi', 'OK', { duration: 3000 }),
    });
  }
}
