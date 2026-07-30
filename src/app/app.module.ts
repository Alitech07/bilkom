import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';

// Angular Material
import { MatToolbarModule }         from '@angular/material/toolbar';
import { MatButtonModule }          from '@angular/material/button';
import { MatIconModule }            from '@angular/material/icon';
import { MatBadgeModule }           from '@angular/material/badge';
import { MatCardModule }            from '@angular/material/card';
import { MatFormFieldModule }       from '@angular/material/form-field';
import { MatInputModule }           from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule }         from '@angular/material/divider';
import { MatRippleModule }          from '@angular/material/core';
import { MatListModule }            from '@angular/material/list';
import { MatTooltipModule }         from '@angular/material/tooltip';
import { MatDialogModule }          from '@angular/material/dialog';
import { MatSelectModule }          from '@angular/material/select';
import { MatSnackBarModule }        from '@angular/material/snack-bar';
import { MatCheckboxModule }        from '@angular/material/checkbox';
import { MatSlideToggleModule }    from '@angular/material/slide-toggle';
import { MatTabsModule }          from '@angular/material/tabs';
import { MatMenuModule }          from '@angular/material/menu';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProductsComponent } from './pages/products/products.component';
import { WarehouseComponent } from './pages/warehouse/warehouse.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { CustomersComponent } from './pages/customers/customers.component';
import { InvoiceComponent } from './pages/invoice/invoice.component';
import { GridComponent } from './components/grid/grid.component';
import { GridToolbarComponent } from './components/grid-toolbar/grid-toolbar.component';
import { EmployeesComponent } from './pages/employees/employees.component';
import { RolesComponent } from './pages/roles/roles.component';
import { ModulesComponent } from './pages/modules/modules.component';
import { SuppliersComponent } from './pages/suppliers/suppliers.component';
import { SupplierFormComponent } from './pages/suppliers/supplier-form/supplier-form.component';
import { PurchasesComponent } from './pages/purchases/purchases.component';
import { AddEditPurchaseFormComponent } from './pages/purchases/add-edit-purchase-form/add-edit-purchase-form.component';
import { RoleFormComponent } from './pages/roles/role-form/role-form.component';
import { PermissionsComponent } from './pages/permissions/permissions.component';
import { CustomerFormComponent } from './pages/customers/customer-form/customer-form.component';
import { ProductFormComponent } from './pages/products/product-form/product-form.component';
import { FileViewerComponent } from './components/file-viewer/file-viewer.component';
import { SafeUrlPipe } from './pipes/safe-url.pipe';
import { WarehouseFormComponent } from './pages/warehouse/warehouse-form/warehouse-form.component';
import { EmployeeFormComponent } from './pages/employees/employee-form/employee-form.component';
import { UserFormComponent } from './pages/employees/user-form/user-form.component';

const MATERIAL = [
  MatToolbarModule, MatButtonModule, MatIconModule, MatBadgeModule,
  MatCardModule, MatFormFieldModule, MatInputModule,
  MatProgressSpinnerModule, MatDividerModule, MatRippleModule,
  MatListModule, MatTooltipModule, MatDialogModule, MatSelectModule,
  MatSnackBarModule,
  MatCheckboxModule,
  MatSlideToggleModule,
  MatTabsModule,
  MatMenuModule,
];

@NgModule({
  declarations: [
    AppComponent,
    MainLayoutComponent, NavbarComponent, SidebarComponent,
    LoginComponent, DashboardComponent, ProductsComponent,
    WarehouseComponent, OrdersComponent, CustomersComponent,
    InvoiceComponent, GridComponent, GridToolbarComponent,
    EmployeesComponent, RolesComponent, ModulesComponent,
    SuppliersComponent, SupplierFormComponent, PurchasesComponent, AddEditPurchaseFormComponent,
    RoleFormComponent, PermissionsComponent, CustomerFormComponent, ProductFormComponent,
    FileViewerComponent, SafeUrlPipe,
    WarehouseFormComponent,
    EmployeeFormComponent, UserFormComponent,
  ],
  imports: [
    BrowserModule, BrowserAnimationsModule,
    CommonModule, FormsModule, ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    ...MATERIAL,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
