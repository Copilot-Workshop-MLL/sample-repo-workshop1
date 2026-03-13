export interface Permission {
  module: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
  import: boolean;
  search: boolean;
}

export interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  roles: Role[];
  isActive: boolean;
  createdAt: string;
}

export interface NavItem {
  label: string;
  route?: string;        // optional – parent items may not have a direct route
  module: string;
  icon: string;
  children?: NavItem[];  // sub-menu items
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ModulesConfig {
  modules: { key: string; label: string }[];
  actions: string[];
}
