import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProductsComponent } from './pages/products/products.component';
import { WarehouseComponent } from './pages/warehouse/warehouse.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { CustomersComponent } from './pages/customers/customers.component';
import { InvoiceComponent } from './pages/invoice/invoice.component';
import { EmployeesComponent } from './pages/employees/employees.component';
import { RolesComponent } from './pages/roles/roles.component';
import { ModulesComponent } from './pages/modules/modules.component';
import { SuppliersComponent } from './pages/suppliers/suppliers.component';
import { PurchasesComponent } from './pages/purchases/purchases.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'dashboard',      component: DashboardComponent },
      { path: 'products',        component: ProductsComponent },
      { path: 'warehouse',       component: WarehouseComponent },
      { path: 'orders',          component: OrdersComponent },
      { path: 'customers',       component: CustomersComponent },
      { path: 'invoice',         component: InvoiceComponent },
      { path: 'suppliers',       component: SuppliersComponent },
      { path: 'purchases',       component: PurchasesComponent },
      { path: 'employees', component: EmployeesComponent },
      { path: 'roles',     component: RolesComponent },
      { path: 'modules',   component: ModulesComponent },
    ]
  },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
