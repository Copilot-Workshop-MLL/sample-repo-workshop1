import { Injectable } from '@angular/core';
import { Permission, User } from '../models/models';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  /** Merged (union) permission map: module → action → boolean */
  private permMap: Record<string, Record<string, boolean>> = {};

  /**
   * Call this after login/user load.
   * Merges permissions from ALL roles (union — most permissive wins).
   */
  loadPermissions(user: User | null): void {
    this.permMap = {};
    if (!user || !user.roles) return;

    for (const role of user.roles) {
      for (const perm of role.permissions) {
        if (!this.permMap[perm.module]) {
          this.permMap[perm.module] = {};
        }
        const actions: (keyof Permission)[] = ['view', 'create', 'edit', 'delete', 'export', 'import', 'search'];
        for (const action of actions) {
          if (action === 'module') continue;
          const current = this.permMap[perm.module][action as string] ?? false;
          this.permMap[perm.module][action as string] = current || !!(perm as any)[action];
        }
      }
    }
  }

  can(module: string, action: string): boolean {
    return !!(this.permMap[module]?.[action]);
  }

  clear(): void {
    this.permMap = {};
  }
}
