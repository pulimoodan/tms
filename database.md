# TMS

### Companies

- `id`: UUID / Primary Key
- `name`: String (e.g., "Acme Corp")
- `name_arabic`: String
- `building_no`: String (4 digits)
- `secondary_no`: String (4 digits)
- `street`: String
- `street_arabic`: String
- `district`: String
- `district_arabic`: String
- `postal_code`: Integer (6 digits)
- `country`: String
- `city`: String
- `cr_no`: String (Commercial Registration)
- `cr_expiry_date`: Date
- `vat_no`: String
- `national_address`: String (uploaded document url - optional)
- `cr_certificate`: String (uploaded document url - optional)
- `vat_certificate`: String (uploaded document url - optional)
- `created_at`: Timestamp
- `updated_at`: Timestamp
- `updated_by`: Foreign Key (Users)

### Customers

- `id`: UUID / Primary Key
- `company_id`: Foreign Key (Companies)
- `name`: String (e.g., "Acme Corp")
- `name_arabic`: String
- `building_no`: String (4 digits)
- `secondary_no`: String (4 digits)
- `street`: String
- `street_arabic`: String
- `district`: String
- `district_arabic`: String
- `postal_code`: Integer (6 digits)
- `country`: String
- `city`: String
- `cr_no`: String (Commercial Registration)
- `cr_expiry_date`: Date
- `vat_no`: String
- `national_address`: String (uploaded document url - optional)
- `cr_certificate`: String (uploaded document url - optional)
- `vat_certificate`: String (uploaded document url - optional)
- `created_at`: Timestamp
- `updated_at`: Timestamp
- `created_by`: Foreign Key (Users)
- `updated_by`: Foreign Key (Users)

### Contracts

- `id`: UUID / Primary Key
- `company_id`: Foreign Key (Companies)
- `customer_id`: Foreign Key (Customers)
- `contract_number`: String (Unique)
- `start_date`: Date
- `end_date`: Date
- `credit_term_id`: Foreign Key (Credit Terms)
- `material`: String
- `max_waiting_hours`: Integer
- `waiting_charge`: Integer
- `bank_guarantee`: Boolean
- `insurance`: Boolean
- `status`: Enum (Draft, Active, Expired, Terminated)
- `created_at`: Timestamp
- `updated_at`: Timestamp
- `created_by`: Foreign Key (Users)
- `updated_by`: Foreign Key (Users)

### Contract Routes

- `id`: UUID / Primary Key
- `company_id`: Foreign Key (Companies)
- `from_id`: Foreign Key (Locations)
- `to_id`: Foreign Key (Locations)
- `vehicle_type_id`: Foreign Key (Vehicle Types)
- `price`: Decimal
- `contract_id`: Foreign Key (Contracts)
- `created_at`: Timestamp
- `updated_at`: Timestamp
- `created_by`: Foreign Key (Users)
- `updated_by`: Foreign Key (Users)

### Vehicles

- `id`: UUID / Primary Key
- `company_id`: Foreign Key (Companies)
- `plate_number`: String
- `plate_number_arabic`: String
- `vehicle_type_id`: Foreign Key (Vehicle Types)
- `engine_model`: String
- `equipment_no`: String
- `equipment_type`: String
- `horse_power`: Integer
- `manufacturing_year`: Integer
- `make`: String (e.g., Mercedes, Volvo)
- `model`: String
- `engine_serial_no`: String
- `chassis_no`: String
- `status`: Enum (Active, In Maintenance, Inactive, On Trip)
- `created_at`: Timestamp
- `updated_at`: Timestamp
- `created_by`: Foreign Key (Users)
- `updated_by`: Foreign Key (Users)

### Drivers

- `id`: UUID / Primary Key
- `company_id`: Foreign Key (Companies)
- `name`: String
- `iqama_number`: String (10 digits)
- `nationality`: String
- `mobile`: String
- `preferred_language`: String
- `status`: Enum (Active, On Trip, Vacation, Inactive)
- `created_at`: Timestamp
- `updated_at`: Timestamp
- `created_by`: Foreign Key (Users)
- `updated_by`: Foreign Key (Users)

### Orders or Waybills

- `id`: UUID / Primary Key
- `company_id`: Foreign Key (Companies)
- `customer_id`: Foreign Key (Customers)
- `order_no`: String (Auto Generated)
- `contract_id`: Foreign Key (Contracts)
- `from_id`: Foreign Key (Locations)
- `to_id`: Foreign Key (Locations)
- `weight`: Decimal
- `volume`: Decimal
- `vehicle_id`: Foreign Key (Vehicles)
- `driver_id`: Foreign Key (Drivers)
- `status`: Enum (Pending, Dispatched, Delivered, Invoiced)
- `created_at`: Timestamp
- `updated_at`: Timestamp
- `created_by`: Foreign Key (Users)
- `updated_by`: Foreign Key (Users)

### Vehicle Types

- `id`: UUID / Primary Key
- `company_id`: Foreign Key (Companies)
- `name`: String (e.g., "4T Flat Bed")
- `capacity`: Decimal
- `type`: Enum (Flat Bed, Low Bed, Curtain Side, Reefer, Car Carrier, Dry Box)
- `created_at`: Timestamp
- `updated_at`: Timestamp
- `created_by`: Foreign Key (Users)
- `updated_by`: Foreign Key (Users)

### Locations

- `id`: UUID / Primary Key
- `company_id`: Foreign Key (Companies)
- `name`: String (e.g., "Riyadh Central Warehouse")
- `code`: String (Unique Code)
- `created_at`: Timestamp
- `updated_at`: Timestamp
- `created_by`: Foreign Key (Users)
- `updated_by`: Foreign Key (Users)

### Credit Terms

- `id`: UUID / Primary Key
- `company_id`: Foreign Key (Companies)
- `name`: String (e.g., "Net 30")
- `description`: String
- `payment_days`: Integer
- `created_at`: Timestamp
- `updated_at`: Timestamp
- `created_by`: Foreign Key (Users)
- `updated_by`: Foreign Key (Users)

### Users

- `id`: UUID / Primary Key
- `company_id`: Foreign Key (Companies)
- `name`: String
- `email`: String (Unique)
- `role_id`: Foreign Key (Roles)
- `status`: Enum (Active, Inactive, Suspended)
- `password_hash`: String
- `last_login_at`: Timestamp
- `created_at`: Timestamp
- `updated_at`: Timestamp
- `created_by`: Foreign Key (Users)
- `updated_by`: Foreign Key (Users)

### Roles

- `id`: UUID / Primary Key
- `company_id`: Foreign Key (Companies)
- `name`: String (e.g., "Admin", "Dispatcher")
- `created_at`: Timestamp
- `updated_at`: Timestamp
- `created_by`: Foreign Key (Users)
- `updated_by`: Foreign Key (Users)

### Role Permissions

- `id`: UUID / Primary Key
- `company_id`: Foreign Key (Companies)
- `role_id`: Foreign Key (Roles)
- `module`: String (e.g., "Customers", "Contracts", "Orders", "Vehicles", "Drivers", "Locations", "Credit Terms", "Vehicle Types", "Users", "Roles")
- `permissions`: Array of Enum (Read, Write, Update, Delete, Export)
- `created_at`: Timestamp
- `updated_at`: Timestamp
- `created_by`: Foreign Key (Users)
- `updated_by`: Foreign Key (Users)
