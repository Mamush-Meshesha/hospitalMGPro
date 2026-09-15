# OpenMRS Role-Based Access Control (RBAC) System

The OpenMRS system uses a highly granular, declarative Role-Based Access Control (RBAC) architecture. 

## The Core Design Paradigm
1. **Privileges**: These are extremely fine-grained, atomic permissions usually tied to a specific CRUD operation on a domain entity (e.g., `Add Encounters`, `Edit Encounters`, `Delete Encounters`, `View Encounters`). 
2. **Roles**: Roles group multiple Privileges together. Roles can also inherit from other Roles (e.g., a `Senior Doctor` role could inherit the `Doctor` role). 
3. **Users**: Individual human users are assigned one or more Roles. Users are never assigned Privileges directly.

*Note: While the system ships with 3 base roles, implementers are expected to create custom roles like `Doctor`, `Nurse`, `Pharmacist`, and `Clerk` and assign the granular privileges below to them.*

---

## Default Roles (3)
- **Anonymous**: Privileges for non-authenticated users.
- **Authenticated**: Privileges gained once authentication has been established.
- **System Developer**: Developers of the OpenMRS. Have additional access to change fundamental structure of the database model.

## Atomic Privileges (205)

### Core Clinical Operations
- **Encounters**: `Get Encounters`, `Add Encounters`, `Edit Encounters`, `Delete Encounters`, `View Encounters`
- **Observations/Vitals**: `Get Observations`, `Add Observations`, `Edit Observations`, `Delete Observations`, `View Observations`
- **Orders & Prescriptions**: `Get Orders`, `Add Orders`, `Edit Orders`, `Delete Orders`, `View Orders`
- **Allergies & Conditions**: `Get Allergies`, `Add Allergies`, `Edit Allergies`, `Remove Allergies`, `View Allergies`, `Get Conditions`, `Edit Conditions`, `Delete Conditions`

### Patient Management
- **Patients**: `Get Patients`, `Add Patients`, `Edit Patients`, `Delete Patients`, `View Patients`
- **People**: `Get People`, `Add People`, `Edit People`, `Delete People`, `View People`
- **Cohorts (Lists)**: `Get Patient Cohorts`, `Add Cohorts`, `Edit Cohorts`, `Delete Cohorts`, `View Patient Cohorts`
- **Relationships**: `Get Relationships`, `Add Relationships`, `Edit Relationships`, `Delete Relationships`, `View Relationships`
- **Visits**: `Get Visits`, `Add Visits`, `Edit Visits`, `Delete Visits`, `Configure Visits`

### Dictionary & Terminology (Concepts)
- **Concepts**: `Get Concepts`, `Manage Concepts`, `View Concepts`
- **Concept Classes & Datatypes**: `Get Concept Classes`, `Manage Concept Classes`, `Get Concept Datatypes`, `Manage Concept Datatypes`
- **Concept Proposals**: `Add Concept Proposals`, `Edit Concept Proposals`, `Delete Concept Proposals`, `View Concept Proposals`

### System Administration
- **Users**: `Get Users`, `Add Users`, `Edit Users`, `Delete Users`, `View Users`, `Edit User Passwords`
- **Roles & Privileges**: `Get Roles`, `Manage Roles`, `View Roles`, `Get Privileges`, `Manage Privileges`, `View Privileges`
- **Locations**: `Get Locations`, `Manage Locations`, `View Locations`
- **Forms**: `Get Forms`, `Manage Forms`, `View Forms`, `Form Entry`, `Upload XSN`

### Ancillary Systems
- **Medication Dispense**: `Get Medication Dispense`, `Edit Medication Dispense`, `Delete Medication Dispense`
- **Reports**: `Add Reports`, `Edit Reports`, `Delete Reports`, `View Reports`
- **HL7 Inbound Messaging**: `Add HL7 Inbound Queue`, `Get HL7 Inbound Queue`, `Update HL7 Inbound Queue`, `Delete HL7 Inbound Queue`

*(This covers the most critical groupings out of the 205 atomic privileges extracted from the backend schema).*
