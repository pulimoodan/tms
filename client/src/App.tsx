import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/main-layout";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { BreadcrumbProvider } from "@/context/breadcrumb-context";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/auth/login";
import CustomersPage from "@/pages/sales/customers";
import CustomerFormPage from "@/pages/sales/customer-form-page";
import CustomerDetailsPage from "@/pages/sales/customer-details";
import ContractsPage from "@/pages/sales/contracts";
import ContractFormPage from "@/pages/sales/contract-form-page";
import ContractDetailsPage from "@/pages/sales/contract-details";
import OrdersPage from "@/pages/ops/orders";
import OrderFormPage from "@/pages/ops/order-form-page";
import OrderDetailsPage from "@/pages/ops/order-details";
import TripsPage from "@/pages/ops/trips";
import TripFormPage from "@/pages/ops/trip-form-page";
import TripDetailsPage from "@/pages/ops/trip-details";
import WaybillsPage from "@/pages/ops/waybills";
import WaybillFormPage from "@/pages/ops/waybill-form-page";
import PrintWaybillPage from "@/pages/ops/print-waybill";
import VehiclesPage from "@/pages/fleet/vehicles";
import VehicleFormPage from "@/pages/fleet/vehicle-form-page";
import VehicleDetailsPage from "@/pages/fleet/vehicle-details";
import DriversPage from "@/pages/drivers/list";
import DriverFormPage from "@/pages/drivers/driver-form-page";
import DriverDetailsPage from "@/pages/drivers/driver-details";
import LocationsPage from "@/pages/config/locations";
import LocationFormPage from "@/pages/config/location-form-page";
import CreditTermsPage from "@/pages/config/credit-terms";
import CreditTermFormPage from "@/pages/config/credit-term-form-page";
import RolesPage from "@/pages/admin/roles";
import RoleFormPage from "@/pages/admin/role-form-page";
import UsersPage from "@/pages/admin/users";
import UserFormPage from "@/pages/admin/user-form-page";
import CompanyPage from "@/pages/admin/company";

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
        <Route path="/login">
            {isAuthenticated ? <Redirect to="/ops/orders" /> : <LoginPage />}
        </Route>

      {/* Print Route - No Layout */}
      <Route path="/ops/orders/:id/print">
        <ProtectedRoute component={PrintWaybillPage} />
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
        <Route path="/ops/orders">
            <ProtectedRoute component={OrdersPage} />
        </Route>
        <Route path="/ops/orders/new">
            <ProtectedRoute component={OrderFormPage} />
        </Route>
        <Route path="/ops/orders/:id">
            <ProtectedRoute component={OrderDetailsPage} />
        </Route>
        <Route path="/ops/orders/:id/edit">
            <ProtectedRoute component={OrderFormPage} />
        </Route>
        <Route path="/ops/trips">
            <ProtectedRoute component={TripsPage} />
        </Route>
        <Route path="/ops/trips/new">
            <ProtectedRoute component={TripFormPage} />
        </Route>
        <Route path="/ops/trips/:id">
            <ProtectedRoute component={TripDetailsPage} />
        </Route>
        <Route path="/ops/trips/:id/edit">
            <ProtectedRoute component={TripFormPage} />
        </Route>
        <Route path="/ops/waybills">
            <ProtectedRoute component={WaybillsPage} />
        </Route>
        <Route path="/ops/waybills/new">
            <ProtectedRoute component={WaybillFormPage} />
        </Route>
        <Route path="/ops/waybills/:id">
            <ProtectedRoute component={WaybillsPage} />
        </Route>
        <Route path="/ops/waybills/:id/edit">
            <ProtectedRoute component={WaybillFormPage} />
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
