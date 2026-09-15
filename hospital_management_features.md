# Hospital Management System - Features & Functionalities Plan

This document tracks the capabilities extracted from the reference OpenMRS repositories. We will use this to plan the architecture and features for our custom, production-ready hospital management system.

## 1. Frontend Architecture & Scaffolding (`create-o3-app`)

This repository serves as the foundation for the frontend development workflow. It sets up the project as a scalable, maintainable **Micro-Frontend** architecture.

### Key Functionalities to Implement/Adopt:
*   **Micro-Frontend (MFE) Structure**: The frontend should be split into modular applications (e.g., patient-chart, billing, pharmacy) that run together seamlessly.
*   **Dynamic Routing & Extensibility (`routes.json`)**:
    *   **Pages**: Full-screen dedicated routes (e.g., `/patient-list`).
    *   **Extensions**: Widgets or UI parts that can be dynamically injected into other pages without hardcoding dependencies (e.g., injecting an "Allergies" widget into the generic Patient Dashboard).
    *   **Modals**: Global dialog popups that can be triggered from anywhere.
    *   **Workspaces**: Side-panels or complex multi-pane layouts.
*   **Configuration Management (`config-schema.ts`)**: Each module should define its own runtime configurations that can be tweaked by administrators without rebuilding the code.
*   **Robust Tooling Pipeline**: Fast build systems, full TypeScript integration, testing (Jest/Vitest), code quality enforcement (ESLint/Prettier), and internationalization (i18n).
*   **Monorepo Support**: Developing multiple modules in a single repository with Yarn Workspaces for easier dependency management.

---

## 2. System Orchestration & Application Modules (`openmrs-distro-referenceapplication`)

This repository handles the infrastructure orchestration and defines the exact suite of frontend micro-modules that make up the full, worldwide reference application. 

### Infrastructure & Deployment Capabilities:
*   **Containerized Architecture**: Everything is orchestrated via Docker Compose.
*   **Reverse Proxy Gateway**: Nginx is used as an API Gateway to handle routing between the UI, the Backend API, and external services, completely mitigating CORS issues.
*   **Production SSL/HTTPS**: Built-in `certbot` for automated Let's Encrypt SSL certificate generation and renewal.
*   **Monitoring**: Built-in support for Grafana monitoring.

### Core Functional Modules (The Hospital Features):
By inspecting the frontend assembly configuration, we have extracted the comprehensive list of features that our production hospital management system needs to implement:

**Patient Management & Clinical Care:**
*   **Patient Registration**: Registering new patients into the system.
*   **Patient Search**: Global search for patient records.
*   **Patient Dashboard/Chart**: The central, unified view of a patient's medical history.
*   **Active Visits**: Tracking patients currently in the facility.
*   **Appointments**: Scheduling patient visits and managing calendars.
*   **Service Queues**: Managing the flow of patients at different service points (e.g., Triage, Doctor's Queue).
*   **Bed & Ward Management**: Managing inpatient hospital beds, admissions, discharges, and transfers.
*   **Patient Lists**: Creating and managing cohorts of patients (e.g., "Patients needing review").

**Clinical Documentation & Records:**
*   **Vitals**: Recording and viewing vital signs (Blood pressure, HR, Temperature, etc.).
*   **Conditions/Problems**: Managing the patient's active and historical medical problems.
*   **Allergies**: Tracking patient allergies and intolerances.
*   **Clinical Notes**: Doctors and nurses inputting encounter notes.
*   **Attachments/Documents**: Uploading external documents, X-Rays, or physical charts.
*   **Forms Engine & Builder**: Custom medical data entry forms.
*   **Procedures**: Tracking surgical and medical procedures performed.
*   **Immunizations**: Tracking vaccines administered.
*   **Growth Charts**: Pediatric growth tracking.
*   **Patient Flags**: Critical medical alerts on patient charts (e.g., "High Fall Risk").
*   **Care Programs**: Enrolling patients in specialized chronic care programs (e.g., HIV, Oncology, TB).

**Ancillary Services:**
*   **Laboratory**: Managing lab test orders and result entry.
*   **Pharmacy & Dispensing**: Dispensing medications to patients.
*   **Medications/Prescriptions**: Doctors prescribing medications.
*   **Stock/Inventory Management**: Managing hospital supplies and pharmacy stock.
*   **Patient Orders**: Ordering diagnostic tests (Labs, Radiology).

**Administration & Operations:**
*   **Billing**: Invoicing, pricing, and managing payments.
*   **System Administration**: Backend configuration and user management.
*   **User Onboarding**: Provisioning accounts for new hospital staff.
*   **Reports**: Generating clinical and administrative reports.
*   **Implementer Tools**: Advanced configuration tools for deploying hospitals.
*   **Metadata Export & Concept Dictionary**: Managing standard medical terminologies and system metadata.
*   **Label Printing**: Printing patient wristbands and lab barcodes.

---

## 3. Backend Architecture & API Domain Model (`openmrs-core`)

This repository defines the foundational backend services, the database schema, and the fundamental API endpoints for the hospital management system.

### Core Domain Services (Backend Architecture):
Our custom backend will need to replicate these service domains to be robust enough for production hospital use:

*   **Concept Data Dictionary (`ConceptService`)**: The absolute core of a robust EMR. All medical terms, diagnoses, drugs, and vital signs must be mapped to centralized "Concepts" rather than raw text. This allows for internationalization, reporting, and structured data.
*   **Entity Management**:
    *   **Persons (`PersonService`)**: The base entity representing any human being in the system.
    *   **Patients (`PatientService`)**: Extends Person, adding medical identifiers and hospital-specific patient data.
    *   **Providers (`ProviderService`)**: Extends Person, representing healthcare professionals (doctors, nurses, etc.) providing care.
    *   **Users (`UserService`)**: The authentication/RBAC layer, managing system logins, roles, and privileges.
*   **Clinical Data Engine**:
    *   **Encounters (`EncounterService`)**: A single interaction between a patient and a provider (e.g., a "Triage Check" or "Doctor Consultation").
    *   **Visits (`VisitService`)**: A grouping of encounters that occur during a single trip to the facility (e.g., a 3-day inpatient stay or a 2-hour outpatient visit).
    *   **Observations (`ObsService`)**: The atomic unit of clinical data. Every blood pressure reading, lab result, or symptom recorded is an "Observation" linked to an Encounter and a Concept.
    *   **Orders (`OrderService` & `OrderSetService`)**: Medical orders including prescriptions, lab tests, and imaging requests.
*   **Care Management**:
    *   **Programs (`ProgramWorkflowService`)**: Managing patient enrollment in specialized longitudinal care programs.
    *   **Conditions & Diagnoses (`ConditionService`, `DiagnosisService`)**: Dedicated services for tracking the medical problems a patient suffers from.
    *   **Medication Dispensing (`MedicationDispenseService`)**: Handling the actual handoff of drugs from pharmacy to patient.
    *   **Cohorts (`CohortService`)**: Logic for grouping patients dynamically based on specific criteria for reporting or bulk actions.
*   **Infrastructure Services**:
    *   **Forms (`FormService`)**: Managing XML/JSON representations of dynamic data entry forms.
    *   **Locations (`LocationService`)**: Hierarchical management of hospital facilities, wards, beds, and departments.
    *   **Administration (`AdministrationService`)**: Global settings, cron jobs, and database management.
    *   **Storage (`StorageService`)**: Managing attachments, images, and binary files.

---

## 4. REST API Layer (`openmrs-module-webservices.rest`)

This repository acts as the bridge between the backend core and the frontend micro-modules. It exposes the Java services as a robust, versioned JSON REST API. 

### Essential API Resource Endpoints:
To support the frontend, we must build out RESTful CRUD endpoints for the following resources:
*   **Identity & Access**: `/user`, `/role`, `/privilege`, `/provider`, `/providerrole`, `/person`
*   **Patient & Cohort Management**: `/patient`, `/patientidentifiertype`, `/cohort`, `/relationship`
*   **Clinical Workflow**: `/visit`, `/visittype`, `/encounter`, `/encountertype`, `/encounterrole`
*   **Clinical Data**: `/obs` (Observations/Vitals), `/condition`, `/diagnosis`, `/allergy`
*   **Orders & Pharmacy**: `/order`, `/ordertype`, `/orderfrequency`, `/drug`, `/medicationdispense`, `/orderset`
*   **Programs**: `/program`, `/programenrollment`, `/programworkflow`
*   **Dictionary & Terminology**: `/concept`, `/conceptclass`, `/conceptdatatype`
*   **Facility**: `/location`, `/locationtag`, `/caresetting`
*   **UI Configuration**: `/form`, `/field`

**Design Principles Derived**:
*   The API heavily utilizes hypermedia links (HATEOAS) for navigation between resources.
*   It supports different "representations" (e.g., `?v=default`, `?v=full`, `?v=custom:(uuid,name)`) to prevent over-fetching or under-fetching of data, functioning similarly to GraphQL but in a RESTful manner.

---

## 5. Global Interoperability & Data Exchange (`openmrs-module-fhir2`)

This repository adds a translation layer on top of the backend, allowing the hospital management system to interoperate with external systems using the global **FHIR (Fast Healthcare Interoperability Resources)** standard (specifically R4).

### Key Functionalities to Implement/Adopt:
To ensure our system can communicate with national health registries, insurance providers, and other hospital systems worldwide, we must implement FHIR endpoints mapping to our core models:

*   **Clinical Data Exchange**:
    *   `Observation` -> Mapped from our internal Vitals/Lab Results
    *   `Condition` -> Mapped from our active Diagnoses and patient problems
    *   `AllergyIntolerance` -> Mapped from our Allergy records
    *   `Immunization` -> Mapped from patient vaccine records
    *   `DiagnosticReport` -> Bundling lab and imaging results
*   **Workflow Exchange**:
    *   `Encounter` -> Mapped from our clinical visits
    *   `EpisodeOfCare` -> Mapped from longer-term hospital Visits
    *   `Task` / `ServiceRequest` -> Mapped from test orders
*   **Medication Exchange**:
    *   `MedicationRequest` -> Mapped from prescriptions (e-prescribing)
    *   `MedicationDispense` -> Mapped from pharmacy dispense records
    *   `Medication` -> Our internal drug dictionary
*   **Administrative Exchange**:
    *   `Patient`, `RelatedPerson`, `Practitioner` (Provider), `Location`, `Group` (Cohort)
*   **Terminology**:
    *   `ValueSet` -> Mapped from our core Concept Dictionary

**Architecture Principle**: FHIR endpoints should not hold business logic. They should purely act as a translation layer (Translators) that maps incoming FHIR JSON/XML to our internal backend services, ensuring that custom business logic only lives in one place.

---

## 6. UI Core: The Patient Chart (`openmrs-esm-patient-chart`)

The Patient Chart represents the single most important frontend surface area for clinicians. This repository defines the layout paradigm and the precise micro-frontend "widgets" that populate the medical dashboard.

### Core Dashboard Layout Paradigm:
Our UI needs to adopt this structural layout to handle complex medical workflows without overwhelming the user:
*   **Patient Header/Banner**: Persistent top bar showing the patient's critical info (Name, Age, ID, Blood Type).
*   **Navigation / Side Menu**: For switching between clinical views (Summary, Forms, Orders).
*   **Chart Review (Dashboards)**: The main center area where specialized widgets render.
*   **Workspace Sidebar**: A slide-out panel used for active data entry (e.g., filling out a form or prescribing medication) without losing context of the underlying chart review area.

### Patient Dashboard Widgets (Micro-Frontends):
We must build these specific, focused UI components:
*   **Allergies & Conditions**: To view and add patient problems.
*   **Vitals, Biometrics, and Growth Charts**: Tracking measurements over time (with graphical charts).
*   **Medications & Orders**: Viewing active prescriptions and lab/radiology orders.
*   **Immunizations**: Vaccine tracking.
*   **Clinical Notes**: Free-text or templated doctor's notes.
*   **Attachments**: Viewing uploaded documents/images.
*   **Task List**: Showing pending clinical actions for this patient.
*   **Patient Flags**: Critical alerts (e.g., "Fall Risk", "Diabetic").
*   **Forms Entry Engine**: A dynamic UI that renders JSON/XML schemas into fillable HTML forms.
*   **Procedures & Programs**: Tracking surgeries and long-term care plans.
*   **Label Printing**: Wristband/Barcode generation.

---

## 7. Exhaustive System Schema & Integrations

During our deep dive into the `openmrs-core` and `openmrs-module-webservices.rest` codebases, we uncovered the exact, concrete database schema, REST endpoints, and security architecture required to support the features above:

### 7.1 Database Schema (116 Tables, 440 Relations)
The backend requires a robust relational database (MariaDB/MySQL) comprising 116 core tables. These tables meticulously track every clinical aspect:
*   **Identity**: `users`, `person`, `patient`, `provider`.
*   **Terminology (The Concept Engine)**: `concept`, `concept_name`, `concept_class`, `concept_datatype`, `concept_answer`.
*   **Clinical Engine**: `encounter`, `visit`, `obs`, `conditions`, `allergy`.
*   **Orders/Pharmacy**: `orders`, `drug_order`, `test_order`, `drug`, `medication_dispense`.
*   **Programs**: `program`, `patient_program`, `cohort`.

### 7.2 REST API Surface (143 Endpoints)
The backend exposes 143 explicit REST endpoints that map directly to the schema. The UI modules will depend entirely on these API surfaces to render data:
*   **Examples:** `/ws/rest/v1/patient`, `/ws/rest/v1/encounter`, `/ws/rest/v1/obs`, `/ws/rest/v1/drug`, `/ws/rest/v1/order`.

### 7.3 Role-Based Access Control (RBAC) Architecture
Security is handled through a highly granular, declarative 5-table setup:
1.  **`privilege`**: Defines the 205 atomic permissions (e.g., `Add Encounters`, `Edit Diagnoses`, `View Allergies`).
2.  **`role`**: Defines the hospital roles (e.g., `Doctor`, `System Developer`).
3.  **`role_privilege`**: Connects multiple privileges to a specific role.
4.  **`role_role`**: Allows roles to inherit from other roles (e.g., `Senior Nurse` inherits `Nurse`).
5.  **`user_role`**: Connects physical users to roles. Users are *never* granted raw privileges directly. 
