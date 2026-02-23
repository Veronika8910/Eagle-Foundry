export type PageKind = 'auth' | 'workspace' | 'system' | 'role';

export interface PageLink {
  label: string;
  to: string;
}

export interface PageTable {
  columns: string[];
  rows: string[][];
}

export interface PageRail {
  title: string;
  lines: string[];
  actions?: PageLink[];
}

export interface PageConfig {
  kind: PageKind;
  eyebrow: string;
  title: string;
  subtitle: string;
  tags?: string[];
  tabs?: string[];
  filters?: string[];
  fields?: string[];
  metrics?: string[];
  table?: PageTable;
  rail?: PageRail;
  links?: PageLink[];
  ctaPrimary?: string;
  ctaPrimaryTo?: string;
  ctaSecondary?: string;
  ctaSecondaryTo?: string;
}
