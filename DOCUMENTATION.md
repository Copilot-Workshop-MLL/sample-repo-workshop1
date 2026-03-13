# RBAC Admin — Application Documentation

## Overview

RBAC Admin is a full-stack **Role-Based Access Control** (RBAC) management system. It allows administrators to define roles with granular per-module permissions and assign those roles to users. All UI elements (buttons, actions, sidebar navigation) are dynamically shown or hidden based on the logged-in user's effective permissions.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 16, Angular Material, TypeScript |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (JSON Web Tokens) — 7-day expiry |
| Dev Tools | ng serve (port 4200), nodemon (port 5000) |

---

## Application Modules

| Module | Route | Description |
|---|---|---|
| Dashboard | `/dashboard` | Landing page after login |
| Users | `/users` | CRUD for application users |
| Roles | `/roles` | CRUD for roles + permission matrix |
| Products | `/products` | Product catalogue with RBAC-guarded actions |
| Orders | `/orders` | Order list with inline status updates |
| Reports | `/reports` | (Reserved — future use) |
| Settings | `/settings` | (Reserved — future use) |

---

## Permission Model

Each role has a **permission matrix**: one row per module, seven boolean columns.

| Action | Description |
|---|---|
| `view` | Can see the module in the sidebar and access the page |
| `create` | Can add new records (Add button visible) |
| `edit` | Can modify records (Edit button / status dropdown visible) |
| `delete` | Can remove records (Delete button visible) |
| `export` | Can download data as CSV (Export button visible) |
| `import` | Can upload data via CSV (Import button visible) |
| `search` | Can use the search bar (Search button visible) |

Permissions from multiple roles are **merged using union** — if any role grants access, it is granted.

---

## User Flow

```mermaid
flowchart TD
    A([User Opens App]) --> B{Has JWT token\nin localStorage?}

    B -- No --> C[Redirect to /login]
    B -- Yes --> D[fetchMe from backend\nRestore user session]
    D --> E{Token valid?}
    E -- No --> C
    E -- Yes --> F[Load Permissions\nBuild Sidebar Nav]
    F --> G[Redirect to /dashboard]

    C --> H[Login Page]
    H --> I{Form valid?}
    I -- No --> H
    I -- Yes --> J[POST /api/auth/login]
    J --> K{Credentials OK?}
    K -- No --> L[Show error message]
    L --> H
    K -- Yes --> M[Store JWT token\nLoad permissions\nBuild nav]
    M --> G

    G --> N[Dashboard]
    N --> O{User clicks\nSidebar item}
    O --> P{Has 'view'\npermission?}
    P -- No --> Q[Item not shown\nin sidebar]
    P -- Yes --> R[Navigate to Module Page]

    R --> S{Action buttons\ncheck permissions}
    S --> T[Show only allowed\nCreate / Edit / Delete\nExport / Import / Search]

    T --> U{User edits\na Role?}
    U -- Yes --> V[POST/PUT /api/roles]
    V --> W[fetchMe — reload user]
    W --> X[Reload permissions\nRebuild sidebar]
    X --> T

    N --> Y{User clicks Logout}
    Y --> Z[Clear JWT + permissions]
    Z --> C
```

---

## Sequence Diagram — Login & Permission Load

```mermaid
sequenceDiagram
    actor User
    participant Browser as Angular App
    participant AuthGuard
    participant Backend as Express API
    participant MongoDB

    User->>Browser: Opens http://localhost:4200
    Browser->>AuthGuard: canActivate() for /dashboard
    AuthGuard->>AuthGuard: isLoggedIn() — check localStorage token
    alt No token
        AuthGuard-->>Browser: redirect to /login
        User->>Browser: Enter email + password
        Browser->>Backend: POST /api/auth/login
        Backend->>MongoDB: findOne({ email }).populate('roles')
        MongoDB-->>Backend: User + roles + permissions
        Backend->>Backend: bcrypt.compare(password, hash)
        Backend->>Backend: jwt.sign({ id }) — 7d expiry
        Backend-->>Browser: { token, user: { roles: [...permissions] } }
        Browser->>Browser: localStorage.setItem('rbac_token', token)
        Browser->>Browser: permissionService.loadPermissions(user)
        Browser->>Browser: dynamicNavService.buildNav()
        Browser-->>User: Redirect to /dashboard
    else Token exists
        Browser->>Backend: GET /api/auth/me (Bearer token)
        Backend->>Backend: jwt.verify(token)
        Backend->>MongoDB: findById(id).populate('roles')
        MongoDB-->>Backend: User + roles + permissions
        Backend-->>Browser: { user }
        Browser->>Browser: permissionService.loadPermissions(user)
        Browser->>Browser: dynamicNavService.buildNav()
        Browser-->>User: Show dashboard
    end
```

---

## Sequence Diagram — RBAC Permission Check (Products Page)

```mermaid
sequenceDiagram
    actor User
    participant Browser as Angular App
    participant PermService as PermissionService
    participant Backend as Express API
    participant MongoDB

    User->>Browser: Click "Products" in sidebar
    note over Browser: Sidebar only shows items where\npermissionService.can(module,'view') = true

    Browser->>Backend: GET /api/products (Bearer token)
    Backend->>Backend: authMiddleware — jwt.verify()
    Backend->>Backend: checkPermission('products','view')
    alt No view permission
        Backend-->>Browser: 403 Access denied
        Browser-->>User: Error message
    else Has permission
        Backend->>MongoDB: Product.find()
        MongoDB-->>Backend: Product list
        Backend-->>Browser: [ ...products ]
        Browser->>PermService: can('products','create')?
        Browser->>PermService: can('products','edit')?
        Browser->>PermService: can('products','delete')?
        Browser->>PermService: can('products','export')?
        Browser->>PermService: can('products','import')?
        Browser->>PermService: can('products','search')?
        Browser-->>User: Render table with only\nallowed action buttons visible
    end
```

---

## Sequence Diagram — Edit Role & Live Permission Refresh

```mermaid
sequenceDiagram
    actor Admin
    participant Browser as Angular App
    participant PermService as PermissionService
    participant NavService as DynamicNavService
    participant Backend as Express API
    participant MongoDB

    Admin->>Browser: Navigate to /roles
    Browser->>Backend: GET /api/roles (Bearer token)
    Backend-->>Browser: [ ...roles ]
    Browser-->>Admin: Roles list

    Admin->>Browser: Click Edit on a role
    Browser->>Backend: GET /api/roles/:id
    Backend-->>Browser: Role with permissions matrix
    Browser-->>Admin: Permission matrix form (checkboxes)

    Admin->>Browser: Uncheck 'delete' & 'export' for Products
    Admin->>Browser: Click Update

    Browser->>Backend: PUT /api/roles/:id { permissions: [...] }
    Backend->>MongoDB: Role.findByIdAndUpdate()
    MongoDB-->>Backend: Updated role
    Backend-->>Browser: 200 OK

    Browser->>Backend: GET /api/auth/me (fetchMe)
    Backend->>MongoDB: User.findById().populate('roles')
    MongoDB-->>Backend: User with updated role permissions
    Backend-->>Browser: { user }

    Browser->>PermService: loadPermissions(user)
    note over PermService: Rebuilds permMap from\nupdated role permissions
    Browser->>NavService: buildNav()
    note over NavService: Filters nav items by\npermissionService.can(module,'view')

    Browser-->>Admin: Redirect to /roles
    Admin->>Browser: Navigate to /products
    Browser-->>Admin: Products page — Delete & Export buttons GONE
```

---

## Architecture Overview

```mermaid
flowchart LR
    subgraph Frontend["Angular 16 Frontend (port 4200)"]
        direction TB
        AppComp[AppComponent\nSidenav Layout]
        AuthG[AuthGuard\nJWT check]
        PermG[PermissionGuard\nmodule+action check]
        PermS[PermissionService\nIn-memory permMap]
        NavS[DynamicNavService\nFiltered nav items]
        AuthS[AuthService\nJWT storage + currentUser$]
        Interceptor[AuthInterceptor\nInjects Bearer token]

        subgraph Pages
            Login
            Dashboard
            Users
            Roles
            Products
            Orders
        end

        AppComp --> AuthG
        AppComp --> PermS
        AppComp --> NavS
        AuthG --> AuthS
        PermG --> PermS
        Pages --> PermS
        Interceptor --> AuthS
    end

    subgraph Backend["Express API (port 5000)"]
        direction TB
        AuthMW[authMiddleware\njwt.verify]
        PermMW[checkPermission\nUnion merge across roles]
        AuthCtrl[/api/auth]
        RoleCtrl[/api/roles]
        UserCtrl[/api/users]
        ProdCtrl[/api/products]
        OrdCtrl[/api/orders]
    end

    subgraph DB["MongoDB (port 27017)"]
        Users[(Users)]
        RolesDB[(Roles)]
        Products[(Products)]
        Orders[(Orders)]
    end

    Frontend -- "HTTP + Bearer JWT" --> Backend
    Backend --> DB
```

---

## Default Seed Data

### Users

| Name | Email | Password | Role |
|---|---|---|---|
| Admin | `admin@rbac.com` | `Admin@123` | Admin (full access) |
| User | `user@rbac.com` | `User@123` | Viewer (view-only) |

### Roles

| Role | Permissions |
|---|---|
| **Admin** | All 7 actions (`view`, `create`, `edit`, `delete`, `export`, `import`, `search`) on all 7 modules |
| **Viewer** | `view` only on all 7 modules |

### Sample Products
10 products across Electronics, Furniture, Accessories, and Stationery categories (SKU-001 to SKU-010).

### Sample Orders
7 orders with statuses: `pending`, `processing`, `shipped`, `delivered`, `cancelled`.

---

## Running the Application

```bash
# 1. Start MongoDB
sudo systemctl start mongod

# 2. Start Backend (from sample-repo-workshop/backend/)
node server.js
# → Server running on port 5000

# 3. Start Frontend (from sample-repo-workshop/frontend/)
ng serve --port 4200
# → Angular Live Development Server is listening on localhost:4200

# 4. Open browser
http://localhost:4200
```

Or from the monorepo root (`sample-repo-workshop/`):
```bash
npm run dev   # starts both concurrently
```

---

## API Reference

### Auth
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | None |
| POST | `/api/auth/login` | Login, returns JWT | None |
| GET | `/api/auth/me` | Get current user (with roles) | JWT |

### Roles
| Method | Endpoint | Permission Needed |
|---|---|---|
| GET | `/api/roles` | `roles.view` |
| GET | `/api/roles/:id` | `roles.view` |
| POST | `/api/roles` | `roles.create` |
| PUT | `/api/roles/:id` | `roles.edit` |
| DELETE | `/api/roles/:id` | `roles.delete` |

### Users
| Method | Endpoint | Permission Needed |
|---|---|---|
| GET | `/api/users` | `users.view` |
| POST | `/api/users` | `users.create` |
| PUT | `/api/users/:id` | `users.edit` |
| DELETE | `/api/users/:id` | `users.delete` |

### Products
| Method | Endpoint | Permission Needed |
|---|---|---|
| GET | `/api/products` | `products.view` |
| POST | `/api/products` | `products.create` |
| PUT | `/api/products/:id` | `products.edit` |
| DELETE | `/api/products/:id` | `products.delete` |

### Orders
| Method | Endpoint | Permission Needed |
|---|---|---|
| GET | `/api/orders` | `orders.view` |
| POST | `/api/orders` | `orders.create` |
| PUT | `/api/orders/:id` | `orders.edit` |
| DELETE | `/api/orders/:id` | `orders.delete` |
