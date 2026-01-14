import { Switch, Route, Redirect } from 'wouter';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Layout } from '@/components/layout/main-layout';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { BreadcrumbProvider } from '@/context/breadcrumb-context';
import NotFound from '@/pages/not-found';
import LoginPage from '@/pages/auth/login';
import CustomersPage from '@/pages/sales/customers';
import CustomerFormPage from '@/pages/sales/customer-form-page';
import CustomerDetailsPage from '@/pages/sales/customer-details';
import ContractsPage from '@/pages/sales/contracts';
import ContractFormPage from '@/pages/sales/contract-form-page';
import ContractDetailsPage from '@/pages/sales/contract-details';
import OrdersPage from '@/pages/ops/orders';
import OrderFormPage from '@/pages/ops/order-form-page';
import OrderDetailsPage from '@/pages/ops/order-details';
import TripsPage from '@/pages/ops/trips';
import TripFormPage from '@/pages/ops/trip-form-page';
import TripDetailsPage from '@/pages/ops/trip-details';
import OrderReportPage from '@/pages/ops/order-report';
import PrintWaybillPage from '@/pages/ops/print-waybill';
import WaybillClosingPage from '@/pages/ops/waybill-closing-page';
import VehiclesPage from '@/pages/fleet/vehicles';
import VehicleFormPage from '@/pages/fleet/vehicle-form-page';
import VehicleDetailsPage from '@/pages/fleet/vehicle-details';
import DriversPage from '@/pages/drivers/list';
import DriverFormPage from '@/pages/drivers/driver-form-page';
import DriverDetailsPage from '@/pages/drivers/driver-details';
import LocationsPage from '@/pages/config/locations';
import LocationFormPage from '@/pages/config/location-form-page';
import CreditTermsPage from '@/pages/config/credit-terms';
import CreditTermFormPage from '@/pages/config/credit-term-form-page';
import RolesPage from '@/pages/admin/roles';
import RoleFormPage from '@/pages/admin/role-form-page';
import UsersPage from '@/pages/admin/users';
import UserFormPage from '@/pages/admin/user-form-page';
import CompanyPage from '@/pages/admin/company';
import ProfilePage from '@/pages/account/profile';
import ProductsPage from '@/pages/purchase/products';
import ProductFormPage from '@/pages/purchase/product-form-page';
import TaxesPage from '@/pages/purchase/taxes';
import TaxFormPage from '@/pages/purchase/tax-form-page';
import PurchaseRequestsPage from '@/pages/purchase/purchase-requests';
import PurchaseRequestFormPage from '@/pages/purchase/purchase-request-form-page';
import PurchaseRequestDetailsPage from '@/pages/purchase/purchase-request-details';
import PrintPurchaseRequestPage from '@/pages/purchase/print-purchase-request';
import RFQsPage from '@/pages/purchase/rfqs';
import RFQDetailsPage from '@/pages/purchase/rfq-details';
import PrintRFQPage from '@/pages/purchase/print-rfq';
import PurchaseOrdersPage from '@/pages/purchase/purchase-orders';
import PurchaseOrderFormPage from '@/pages/purchase/purchase-order-form-page';
import PurchaseOrderDetailsPage from '@/pages/purchase/purchase-order-details';
import PrintPurchaseOrderPage from '@/pages/purchase/print-purchase-order';
import ReceiptsPage from '@/pages/purchase/receipts';
import VendorsPage from '@/pages/purchase/vendors';
import VendorFormPage from '@/pages/purchase/vendor-form-page';

// Protected Route Component
function ProtectedRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <Component {...rest} />;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/login">{isAuthenticated ? <Redirect to="/ops/orders" /> : <LoginPage />}</Route>

      {/* Print Routes - No Layout */}
      <Route path="/ops/orders/:id/print">
        <ProtectedRoute component={PrintWaybillPage} />
      </Route>
      <Route path="/purchase/purchase-requests/:id/print">
        <ProtectedRoute component={PrintPurchaseRequestPage} />
      </Route>
      <Route path="/purchase/rfqs/:id/print">
        <ProtectedRoute component={PrintRFQPage} />
      </Route>
      <Route path="/purchase/purchase-orders/:id/print">
        <ProtectedRoute component={PrintPurchaseOrderPage} />
      </Route>

      {/* Protected Routes - Wrapped in Layout */}
      <Route>
        <Layout>
          <Switch>
            <Route path="/">
              <Redirect to="/ops/orders" />
            </Route>

            {/* Customer Routes */}
            <Route path="/sales/customers">
              <ProtectedRoute component={CustomersPage} />
            </Route>
            <Route path="/sales/customers/new">
              <ProtectedRoute component={CustomerFormPage} />
            </Route>
            <Route path="/sales/customers/:id">
              <ProtectedRoute component={CustomerDetailsPage} />
            </Route>
            <Route path="/sales/customers/:id/edit">
              <ProtectedRoute component={CustomerFormPage} />
            </Route>

            {/* Contract Routes */}
            <Route path="/sales/contracts">
              <ProtectedRoute component={ContractsPage} />
            </Route>
            <Route path="/sales/contracts/new">
              <ProtectedRoute component={ContractFormPage} />
            </Route>
            <Route path="/sales/contracts/:id">
              <ProtectedRoute component={ContractDetailsPage} />
            </Route>
            <Route path="/sales/contracts/:id/edit">
              <ProtectedRoute component={ContractFormPage} />
            </Route>

            {/* Operations Routes */}
            <Route path="/ops/orders/report">
              <ProtectedRoute component={OrderReportPage} />
            </Route>
            <Route path="/ops/orders/new">
              <ProtectedRoute component={OrderFormPage} />
            </Route>
            <Route path="/ops/orders/:id/waybill-closing">
              <ProtectedRoute component={WaybillClosingPage} />
            </Route>
            <Route path="/ops/orders/:id/edit">
              <ProtectedRoute component={OrderFormPage} />
            </Route>
            <Route path="/ops/orders/:id">
              <ProtectedRoute component={OrderDetailsPage} />
            </Route>
            <Route path="/ops/orders">
              <ProtectedRoute component={OrdersPage} />
            </Route>
            <Route path="/ops/trips/new">
              <ProtectedRoute component={TripFormPage} />
            </Route>
            <Route path="/ops/trips/:id/edit">
              <ProtectedRoute component={TripFormPage} />
            </Route>
            <Route path="/ops/trips/:id">
              <ProtectedRoute component={TripDetailsPage} />
            </Route>
            <Route path="/ops/trips">
              <ProtectedRoute component={TripsPage} />
            </Route>

            {/* Fleet Routes */}
            <Route path="/fleet/vehicles">
              <ProtectedRoute component={VehiclesPage} />
            </Route>
            <Route path="/fleet/vehicles/new">
              <ProtectedRoute component={VehicleFormPage} />
            </Route>
            <Route path="/fleet/vehicles/:id/edit">
              <ProtectedRoute component={VehicleFormPage} />
            </Route>
            <Route path="/fleet/vehicles/:id">
              <ProtectedRoute component={VehicleDetailsPage} />
            </Route>

            {/* Driver Routes */}
            <Route path="/drivers/list">
              <ProtectedRoute component={DriversPage} />
            </Route>
            <Route path="/drivers/list/new">
              <ProtectedRoute component={DriverFormPage} />
            </Route>
            <Route path="/drivers/list/:id">
              <ProtectedRoute component={DriverDetailsPage} />
            </Route>
            <Route path="/drivers/list/:id/edit">
              <ProtectedRoute component={DriverFormPage} />
            </Route>

            {/* Config Routes */}
            <Route path="/config/locations">
              <ProtectedRoute component={LocationsPage} />
            </Route>
            <Route path="/config/locations/new">
              <ProtectedRoute component={LocationFormPage} />
            </Route>
            <Route path="/config/locations/:id/edit">
              <ProtectedRoute component={LocationFormPage} />
            </Route>
            <Route path="/config/credit-terms">
              <ProtectedRoute component={CreditTermsPage} />
            </Route>
            <Route path="/config/credit-terms/new">
              <ProtectedRoute component={CreditTermFormPage} />
            </Route>
            <Route path="/config/credit-terms/:id/edit">
              <ProtectedRoute component={CreditTermFormPage} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/company">
              <ProtectedRoute component={CompanyPage} />
            </Route>
            <Route path="/admin/roles">
              <ProtectedRoute component={RolesPage} />
            </Route>
            <Route path="/admin/roles/new">
              <ProtectedRoute component={RoleFormPage} />
            </Route>
            <Route path="/admin/roles/:id/edit">
              <ProtectedRoute component={RoleFormPage} />
            </Route>
            <Route path="/admin/users">
              <ProtectedRoute component={UsersPage} />
            </Route>
            <Route path="/admin/users/new">
              <ProtectedRoute component={UserFormPage} />
            </Route>
            <Route path="/admin/users/:id/edit">
              <ProtectedRoute component={UserFormPage} />
            </Route>

            {/* Account Routes */}
            <Route path="/account/profile">
              <ProtectedRoute component={ProfilePage} />
            </Route>

            {/* Purchase Routes */}
            <Route path="/purchase/products/new">
              <ProtectedRoute component={ProductFormPage} />
            </Route>
            <Route path="/purchase/products/:id/edit">
              <ProtectedRoute component={ProductFormPage} />
            </Route>
            <Route path="/purchase/products">
              <ProtectedRoute component={ProductsPage} />
            </Route>
            <Route path="/purchase/taxes/new">
              <ProtectedRoute component={TaxFormPage} />
            </Route>
            <Route path="/purchase/taxes/:id/edit">
              <ProtectedRoute component={TaxFormPage} />
            </Route>
            <Route path="/purchase/taxes">
              <ProtectedRoute component={TaxesPage} />
            </Route>
            <Route path="/purchase/purchase-requests/new">
              <ProtectedRoute component={PurchaseRequestFormPage} />
            </Route>
            <Route path="/purchase/purchase-requests/:id/edit">
              <ProtectedRoute component={PurchaseRequestFormPage} />
            </Route>
            <Route path="/purchase/purchase-requests/:id">
              <ProtectedRoute component={PurchaseRequestDetailsPage} />
            </Route>
            <Route path="/purchase/purchase-requests">
              <ProtectedRoute component={PurchaseRequestsPage} />
            </Route>
            <Route path="/purchase/rfqs/:id">
              <ProtectedRoute component={RFQDetailsPage} />
            </Route>
            <Route path="/purchase/rfqs">
              <ProtectedRoute component={RFQsPage} />
            </Route>
            <Route path="/purchase/purchase-orders/new/:rfqId">
              <ProtectedRoute component={PurchaseOrderFormPage} />
            </Route>
            <Route path="/purchase/purchase-orders/:id/edit">
              <ProtectedRoute component={PurchaseOrderFormPage} />
            </Route>
            <Route path="/purchase/purchase-orders/:id">
              <ProtectedRoute component={PurchaseOrderDetailsPage} />
            </Route>
            <Route path="/purchase/purchase-orders">
              <ProtectedRoute component={PurchaseOrdersPage} />
            </Route>
            <Route path="/purchase/receipts">
              <ProtectedRoute component={ReceiptsPage} />
            </Route>
            <Route path="/purchase/vendors/new">
              <ProtectedRoute component={VendorFormPage} />
            </Route>
            <Route path="/purchase/vendors/:id/edit">
              <ProtectedRoute component={VendorFormPage} />
            </Route>
            <Route path="/purchase/vendors">
              <ProtectedRoute component={VendorsPage} />
            </Route>

            {/* Fallback */}
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BreadcrumbProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </BreadcrumbProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
