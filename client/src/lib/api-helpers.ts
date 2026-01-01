import { api } from './api';

export async function fetchCustomers() {
  const response = await api.get('/customers?page=1&limit=100');
  return response.data.success && Array.isArray(response.data.results) ? response.data.results : [];
}

export async function fetchCustomerRoutes(customerId: string) {
  const response = await api.get(`/customers/${customerId}/routes`);
  return response.data.success && Array.isArray(response.data.results) ? response.data.results : [];
}

export async function createCustomerRoute(customerId: string, data: { fromId: string; toId: string }) {
  const response = await api.post(`/customers/${customerId}/routes`, data);
  if (response.data.success && response.data.result) {
    return response.data.result;
  }
  throw new Error(response.data.message || 'Failed to create customer route');
}

export async function deleteCustomerRoute(customerId: string, routeId: string) {
  const response = await api.delete(`/customers/${customerId}/routes/${routeId}`);
  if (response.data.success !== false) {
    return true;
  }
  throw new Error(response.data.message || 'Failed to delete customer route');
}

export async function fetchCreditTerms() {
  const response = await api.get('/credit-terms?page=1&limit=100');
  return response.data.success && Array.isArray(response.data.results) ? response.data.results : [];
}

export async function fetchLocations() {
  const response = await api.get('/locations?page=1&limit=100');
  return response.data.success && Array.isArray(response.data.results) ? response.data.results : [];
}


export async function fetchVehicles() {
  const response = await api.get('/vehicles?page=1&limit=100');
  return response.data.success && Array.isArray(response.data.results) ? response.data.results : [];
}

export async function fetchDrivers() {
  const response = await api.get('/drivers?page=1&limit=100');
  return response.data.success && Array.isArray(response.data.results) ? response.data.results : [];
}

export async function fetchRoles() {
  const response = await api.get('/roles?page=1&limit=100');
  return response.data.success && Array.isArray(response.data.results) ? response.data.results : [];
}

export async function fetchContract(id: string) {
  const response = await api.get(`/contracts/${id}`);
  if (response.data.success && response.data.result) {
    const contract = response.data.result;
    return {
      contractNumber: contract.contractNumber || '',
      customerId: contract.customerId || '',
      startDate: contract.startDate ? contract.startDate.split('T')[0] : '',
      endDate: contract.endDate ? contract.endDate.split('T')[0] : '',
      creditTermId: contract.creditTermId || '',
      material: contract.material || '',
      bankGuarantee: contract.bankGuarantee || false,
      insurance: contract.insurance || false,
      maxWaitingHours: contract.maxWaitingHours?.toString() || '',
      waitingCharge: contract.waitingCharge?.toString() || '',
      status: contract.status || 'Draft',
    };
  }
  return null;
}

export async function fetchContractRoutes(contractId: string) {
  const response = await api.get(`/contracts/${contractId}/routes`);
  if (response.data.success && Array.isArray(response.data.results)) {
    return response.data.results.map((route: any) => ({
      id: route.id,
      fromId: route.fromId || '',
      toId: route.toId || '',
      vehicleCategory: route.vehicleCategory || '',
      price: route.price?.toString() || '',
    }));
  }
  return [];
}

export async function fetchCustomer(id: string) {
  const response = await api.get(`/customers/${id}`);
  if (!response.data.success || !response.data.result) return null;
  const customer = response.data.result;
  return {
    name: customer.name || '',
    nameArabic: customer.nameArabic || '',
    buildingNo: customer.buildingNo || '',
    secondaryNo: customer.secondaryNo || '',
    street: customer.street || '',
    streetArabic: customer.streetArabic || '',
    district: customer.district || '',
    districtArabic: customer.districtArabic || '',
    postalCode: customer.postalCode?.toString() || '',
    city: customer.city || '',
    country: customer.country || '',
    crNo: customer.crNo || '',
    crExpiryDate: customer.crExpiryDate ? customer.crExpiryDate.split('T')[0] : '',
    vatNo: customer.vatNo || '',
    nationalAddress: customer.nationalAddress || '',
    crCertificate: customer.crCertificate || '',
    vatCertificate: customer.vatCertificate || '',
  };
}

export async function createContract(data: any) {
  const response = await api.post('/contracts', data);
  if (response.data.success && response.data.result) {
    return response.data.result;
  }
  throw new Error(response.data.message || 'Failed to create contract');
}

export async function updateContract(id: string, data: any) {
  const response = await api.patch(`/contracts/${id}`, data);
  if (response.data.success && response.data.result) {
    return response.data.result;
  }
  throw new Error(response.data.message || 'Failed to update contract');
}

export async function createContractRoute(contractId: string, route: any) {
  const response = await api.post(`/contracts/${contractId}/routes`, route);
  if (response.data.success && response.data.result) {
    return response.data.result;
  }
  throw new Error(response.data.message || 'Failed to create route');
}

export async function deleteContractRoute(contractId: string, routeId: string) {
  const response = await api.delete(`/contracts/${contractId}/routes/${routeId}`);
  if (response.data.success) {
    return response.data.result;
  }
  throw new Error(response.data.message || 'Failed to delete route');
}

export async function createCustomer(data: any) {
  const response = await api.post('/customers', data);
  return response.data;
}

export async function updateCustomer(id: string, data: any) {
  const response = await api.patch(`/customers/${id}`, data);
  return response.data;
}

export async function uploadDocument(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/upload/document', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  if (response.data.success && response.data.result) {
    return response.data.result.url;
  }
  throw new Error(response.data.message || 'Failed to upload file');
}

export async function fetchContracts() {
  const response = await api.get('/contracts?page=1&limit=100');
  return response.data.success && Array.isArray(response.data.results) ? response.data.results : [];
}

export async function fetchOrder(id: string) {
  const response = await api.get(`/orders/${id}`);
  if (response.data.success && response.data.result) {
    const order = response.data.result;
    return {
      customerId: order.customerId || '',
      contractId: order.contractId || '',
      fromId: order.fromId || '',
      toId: order.toId || '',
      weight: order.weight?.toString() || '',
      volume: order.volume?.toString() || '',
      vehicleId: order.vehicleId || '',
      driverId: order.driverId || '',
      status: order.status || 'Pending',
      orderNo: order.orderNo || '',
    };
  }
  return null;
}

export async function createOrder(data: any) {
  const response = await api.post('/orders', data);
  if (response.data.success && response.data.result) {
    return response.data.result;
  }
  throw new Error(response.data.message || 'Failed to create order');
}

export async function updateOrder(id: string, data: any) {
  const response = await api.patch(`/orders/${id}`, data);
  if (response.data.success && response.data.result) {
    return response.data.result;
  }
  throw new Error(response.data.message || 'Failed to update order');
}

export async function fetchVehicle(id: string) {
  const response = await api.get(`/vehicles/${id}`);
  if (response.data.success && response.data.result) {
    const vehicle = response.data.result;
    return {
      name: vehicle.name || '',
      type: vehicle.type || 'Vehicle',
      category: vehicle.category || 'TractorHead',
      asset: vehicle.asset || '',
      doorNo: vehicle.doorNo || '',
      plateNumber: vehicle.plateNumber || '',
      plateNumberArabic: vehicle.plateNumberArabic || '',
      chassisNo: vehicle.chassisNo || '',
      sequenceNo: vehicle.sequenceNo || '',
      engineModel: vehicle.engineModel || '',
      equipmentNo: vehicle.equipmentNo || '',
      equipmentType: vehicle.equipmentType || '',
      horsePower: vehicle.horsePower?.toString() || '',
      manufacturingYear: vehicle.manufacturingYear?.toString() || '',
      make: vehicle.make || '',
      model: vehicle.model || '',
      engineSerialNo: vehicle.engineSerialNo || '',
      status: vehicle.status || 'Active',
    };
  }
  return null;
}

export async function createVehicle(data: any) {
  const response = await api.post('/vehicles', data);
  if (response.data.success && response.data.result) {
    return response.data.result;
  }
  throw new Error(response.data.message || 'Failed to create vehicle');
}

export async function updateVehicle(id: string, data: any) {
  const response = await api.patch(`/vehicles/${id}`, data);
  if (response.data.success && response.data.result) {
    return response.data.result;
  }
  throw new Error(response.data.message || 'Failed to update vehicle');
}

export async function fetchDriver(id: string) {
  const response = await api.get(`/drivers/${id}`);
  if (response.data.success && response.data.result) {
    const driver = response.data.result;
    return {
      badgeNo: driver.badgeNo || '',
      name: driver.name || '',
      iqamaNumber: driver.iqamaNumber || '',
      position: driver.position || undefined,
      sponsorship: driver.sponsorship || '',
      nationality: driver.nationality || '',
      driverCardExpiry: driver.driverCardExpiry ? new Date(driver.driverCardExpiry).toISOString().split('T')[0] : '',
      mobile: driver.mobile || '',
      preferredLanguage: driver.preferredLanguage || '',
      status: driver.status || 'Active',
    };
  }
  return null;
}

export async function createDriver(data: any) {
  const response = await api.post('/drivers', data);
  if (response.data.success && response.data.result) {
    return response.data.result;
  }
  throw new Error(response.data.message || 'Failed to create driver');
}

export async function updateDriver(id: string, data: any) {
  const response = await api.patch(`/drivers/${id}`, data);
  if (response.data.success && response.data.result) {
    return response.data.result;
  }
  throw new Error(response.data.message || 'Failed to update driver');
}

export async function fetchCreditTerm(id: string) {
  const response = await api.get(`/credit-terms/${id}`);
  if (response.data.success && response.data.result) {
    const creditTerm = response.data.result;
    return {
      name: creditTerm.name || '',
      description: creditTerm.description || '',
      paymentDays: creditTerm.paymentDays?.toString() || '',
    };
  }
  return null;
}

export async function createCreditTerm(data: any) {
  const response = await api.post('/credit-terms', data);
  if (response.data.success && response.data.result) {
    return response.data.result;
  }
  throw new Error(response.data.message || 'Failed to create credit term');
}

export async function updateCreditTerm(id: string, data: any) {
  const response = await api.patch(`/credit-terms/${id}`, data);
  if (response.data.success && response.data.result) {
    return response.data.result;
  }
  throw new Error(response.data.message || 'Failed to update credit term');
}

export async function fetchVehicleType(id: string) {
  const response = await api.get(`/vehicle-types/${id}`);
  if (response.data.success && response.data.result) {
    const vehicleType = response.data.result;
    return {
      name: vehicleType.name || '',
      capacity: vehicleType.capacity?.toString() || '',
      type: vehicleType.type || 'FlatBed',
    };
  }
  return null;
}

export async function createVehicleType(data: any) {
  const response = await api.post('/vehicle-types', data);
  if (response.data.success && response.data.result) {
    return response.data.result;
  }
  throw new Error(response.data.message || 'Failed to create vehicle type');
}

export async function updateVehicleType(id: string, data: any) {
  const response = await api.patch(`/vehicle-types/${id}`, data);
  if (response.data.success && response.data.result) {
    return response.data.result;
  }
  throw new Error(response.data.message || 'Failed to update vehicle type');
}

export async function fetchLocation(id: string) {
  const response = await api.get(`/locations/${id}`);
  if (response.data.success && response.data.result) {
    const location = response.data.result;
    return {
      name: location.name || '',
      code: location.code || '',
    };
  }
  return null;
}

export async function createLocation(data: any) {
  const response = await api.post('/locations', data);
  if (response.data.success && response.data.result) {
    return response.data.result;
  }
  throw new Error(response.data.message || 'Failed to create location');
}

export async function updateLocation(id: string, data: any) {
  const response = await api.patch(`/locations/${id}`, data);
  if (response.data.success && response.data.result) {
    return response.data.result;
  }
  throw new Error(response.data.message || 'Failed to update location');
}

export async function fetchUser(id: string) {
  const response = await api.get(`/users/${id}`);
  if (response.data.success && response.data.result) {
    const user = response.data.result;
    return {
      name: user.name || '',
      email: user.email || '',
      roleId: user.roleId || '',
      status: user.status || 'Active',
    };
  }
  return null;
}

export async function createUser(data: any) {
  const response = await api.post('/users', data);
  if (response.data.success && response.data.result) {
    return response.data.result;
  }
  throw new Error(response.data.message || 'Failed to create user');
}

export async function updateUser(id: string, data: any) {
  const response = await api.patch(`/users/${id}`, data);
  if (response.data.success && response.data.result) {
    return response.data.result;
  }
  throw new Error(response.data.message || 'Failed to update user');
}

export async function fetchRole(id: string) {
  const response = await api.get(`/roles/${id}`);
  if (response.data.success && response.data.result) {
    const role = response.data.result;
    const defaultPermissions: Record<string, Record<string, boolean>> = {};

    const MODULES = [
      'Customers',
      'Contracts',
      'Orders',
      'Vehicles',
      'Drivers',
      'Locations',
      'CreditTerms',
      'VehicleTypes',
      'Users',
      'Roles',
    ];

    MODULES.forEach((module) => {
      defaultPermissions[module] = {
        Read: false,
        Write: false,
        Update: false,
        Delete: false,
        Export: false,
      };
    });

    if (role.permissions && Array.isArray(role.permissions)) {
      role.permissions.forEach((perm: any) => {
        if (perm.module && perm.permissions) {
          defaultPermissions[perm.module] = {
            Read: perm.permissions.includes('Read'),
            Write: perm.permissions.includes('Write'),
            Update: perm.permissions.includes('Update'),
            Delete: perm.permissions.includes('Delete'),
            Export: perm.permissions.includes('Export'),
          };
        }
      });
    }

    return {
      name: role.name || '',
      permissions: defaultPermissions,
    };
  }
  return null;
}

export async function createRole(data: any) {
  const response = await api.post('/roles', { name: data.name });
  if (response.data.success && response.data.result) {
    return response.data.result;
  }
  throw new Error(response.data.message || 'Failed to create role');
}

export async function updateRole(id: string, data: any) {
  const response = await api.patch(`/roles/${id}`, { name: data.name });
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to update role');
  }
  return response.data.result;
}

export async function updateRolePermissions(roleId: string, module: string, permissions: string[]) {
  const response = await api.patch(`/roles/${roleId}/permissions/${module}`, { permissions });
  if (response.data.success) {
    return response.data.result;
  }
  throw new Error(response.data.message || 'Failed to update permissions');
}

export async function createRolePermissions(roleId: string, module: string, permissions: string[]) {
  const response = await api.post(`/roles/${roleId}/permissions`, { module, permissions });
  if (response.data.success) {
    return response.data.result;
  }
  throw new Error(response.data.message || 'Failed to create permissions');
}

export async function deleteRolePermissions(roleId: string, module: string) {
  const response = await api.delete(`/roles/${roleId}/permissions/${module}`);
  if (response.data.success) {
    return response.data.result;
  }
  throw new Error(response.data.message || 'Failed to delete permissions');
}

export async function fetchCurrentUser(id: string) {
  const response = await api.get(`/users/${id}`);
  if (response.data.success && response.data.result) {
    return response.data.result;
  }
  return null;
}

export async function fetchCompany(id: string) {
  const response = await api.get(`/companies/${id}`);
  if (response.data.success && response.data.result) {
    const comp = response.data.result;
    return {
      name: comp.name || '',
      nameArabic: comp.nameArabic || '',
      buildingNo: comp.buildingNo || '',
      secondaryNo: comp.secondaryNo || '',
      street: comp.street || '',
      streetArabic: comp.streetArabic || '',
      district: comp.district || '',
      districtArabic: comp.districtArabic || '',
      postalCode: comp.postalCode || '',
      country: comp.country || '',
      city: comp.city || '',
      crNo: comp.crNo || '',
      crExpiryDate: comp.crExpiryDate ? comp.crExpiryDate.split('T')[0] : '',
      vatNo: comp.vatNo || '',
      nationalAddress: comp.nationalAddress || '',
      crCertificate: comp.crCertificate || '',
      vatCertificate: comp.vatCertificate || '',
    };
  }
  return null;
}

export async function updateCompany(id: string, data: any) {
  const response = await api.patch(`/companies/${id}`, data);
  if (response.data.success && response.data.result) {
    return response.data.result;
  }
  throw new Error(response.data.message || 'Failed to update company');
}
