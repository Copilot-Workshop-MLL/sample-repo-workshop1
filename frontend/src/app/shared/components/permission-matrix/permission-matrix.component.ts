import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { Permission } from '../../../core/models/models';

export interface ModuleDef {
  key: string;
  label: string;
  children?: ModuleDef[];
}

export const ACTIONS = ['view', 'create', 'edit', 'delete', 'export', 'import', 'search'] as const;
export type Action = typeof ACTIONS[number];

@Component({
  selector: 'app-permission-matrix',
  templateUrl: './permission-matrix.component.html',
  styleUrls: ['./permission-matrix.component.scss'],
})
export class PermissionMatrixComponent implements OnChanges {
  @Input() modules: ModuleDef[] = [];
  @Input() permissions: Permission[] = [];
  @Output() permissionsChange = new EventEmitter<Permission[]>();

  readonly actions = ACTIONS;
  matrix: Permission[] = [];

  ngOnChanges(): void {
    // Build flat matrix from leaf-level modules only
    const leaves = this.flattenLeaves(this.modules);
    this.matrix = leaves.map((mod) => {
      const existing = this.permissions.find((p) => p.module === mod.key);
      return existing
        ? { ...existing }
        : { module: mod.key, view: false, create: false, edit: false, delete: false, export: false, import: false, search: false };
    });
  }

  /** Returns only leaf nodes (children if present, else the module itself) */
  private flattenLeaves(mods: ModuleDef[]): ModuleDef[] {
    return mods.flatMap((m) => (m.children && m.children.length ? m.children : [m]));
  }

  /** Get child module keys for a given parent key */
  private childKeys(parentKey: string): string[] {
    const parent = this.modules.find((m) => m.key === parentKey);
    return parent?.children?.map((c) => c.key) ?? [];
  }

  // ── Individual cell ──────────────────────────────────────────
  getCell(moduleKey: string, action: Action): boolean {
    const perm = this.matrix.find((p) => p.module === moduleKey);
    return perm ? !!(perm as any)[action] : false;
  }

  onCellChange(moduleKey: string, action: Action, value: boolean): void {
    const perm = this.matrix.find((p) => p.module === moduleKey);
    if (perm) {
      (perm as any)[action] = value;
      this.permissionsChange.emit([...this.matrix]);
    }
  }

  // ── Row "All" for a single module ────────────────────────────
  isRowAllChecked(moduleKey: string): boolean {
    const perm = this.matrix.find((p) => p.module === moduleKey);
    return !!perm && this.actions.every((a) => (perm as any)[a]);
  }

  onRowAllChange(moduleKey: string, checked: boolean): void {
    const perm = this.matrix.find((p) => p.module === moduleKey);
    if (perm) {
      this.actions.forEach((a) => ((perm as any)[a] = checked));
      this.permissionsChange.emit([...this.matrix]);
    }
  }

  // ── Column "All" for ALL leaf modules ────────────────────────
  isColumnAllChecked(action: Action): boolean {
    return this.matrix.every((p) => (p as any)[action]);
  }

  onColumnAllChange(action: Action, checked: boolean): void {
    this.matrix.forEach((perm) => ((perm as any)[action] = checked));
    this.permissionsChange.emit([...this.matrix]);
  }

  // ── Parent header: per-action column toggle ──────────────────
  isParentColChecked(parentKey: string, action: Action): boolean {
    const keys = this.childKeys(parentKey);
    return keys.length > 0 && keys.every((k) => this.getCell(k, action));
  }

  isParentColIndeterminate(parentKey: string, action: Action): boolean {
    const keys = this.childKeys(parentKey);
    const checkedCount = keys.filter((k) => this.getCell(k, action)).length;
    return checkedCount > 0 && checkedCount < keys.length;
  }

  onParentColChange(parentKey: string, action: Action, checked: boolean): void {
    const keys = this.childKeys(parentKey);
    keys.forEach((k) => {
      const perm = this.matrix.find((p) => p.module === k);
      if (perm) (perm as any)[action] = checked;
    });
    this.permissionsChange.emit([...this.matrix]);
  }

  // ── Parent header: "All" toggle (all actions, all children) ──
  isParentAllChecked(parentKey: string): boolean {
    const keys = this.childKeys(parentKey);
    return keys.length > 0 && keys.every((k) => this.isRowAllChecked(k));
  }

  isParentAllIndeterminate(parentKey: string): boolean {
    const keys = this.childKeys(parentKey);
    if (!keys.length) return false;
    const allChecked = keys.every((k) => this.isRowAllChecked(k));
    const noneChecked = keys.every((k) => this.actions.every((a) => !this.getCell(k, a)));
    return !allChecked && !noneChecked;
  }

  onParentAllChange(parentKey: string, checked: boolean): void {
    const keys = this.childKeys(parentKey);
    keys.forEach((k) => {
      const perm = this.matrix.find((p) => p.module === k);
      if (perm) this.actions.forEach((a) => ((perm as any)[a] = checked));
    });
    this.permissionsChange.emit([...this.matrix]);
  }
}
