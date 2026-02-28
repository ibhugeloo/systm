/**
 * MVP block types and canvas data structures
 * Defines the structure for MVP canvas builder components
 */

export type MvpBlockType =
  | "hero"
  | "features"
  | "pricing"
  | "testimonials"
  | "cta"
  | "dashboard"
  | "form"
  | "data-table"
  | "stats"
  | "custom";

export interface MvpBlock {
  id: string;
  type: MvpBlockType;
  row: number;
  col: number;
  width: number;
  height: number;
  data: Record<string, unknown>;
  content?: Record<string, unknown>;
  position?: { row: number; col: number; width: number; height: number };
  style?: { variant: string; theme: string };
}

export interface MvpCanvasConfig {
  gridCols?: number;
  gridRowHeight?: number;
  gap?: number;
  padding?: number;
}

export interface MvpCanvas {
  id?: string;
  blocks: MvpBlock[];
  gridCols?: number;
  gridRowHeight?: number;
  gap?: number;
  padding?: number;
  metadata?: {
    title: string;
    description: string;
    generatedAt?: string;
    version?: number;
  };
}

// Helper types for block-specific content
export interface HeroBlockContent {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundImageUrl?: string;
}

export interface FeaturesBlockContent {
  title?: string;
  description?: string;
  items?: Array<{
    icon?: string;
    title: string;
    description: string;
  }>;
}

export interface PricingBlockContent {
  title?: string;
  plans?: Array<{
    name: string;
    price: string;
    description?: string;
    features: string[];
  }>;
}

export interface TestimonialsBlockContent {
  title?: string;
  testimonials?: Array<{
    author: string;
    role?: string;
    content: string;
    imageUrl?: string;
  }>;
}

export interface CtaBlockContent {
  title?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface DashboardBlockContent {
  title?: string;
  widgets?: Array<{
    id: string;
    type: string;
    title: string;
    metric: string;
  }>;
}

export interface FormBlockContent {
  title?: string;
  description?: string;
  fields?: Array<{
    id: string;
    label: string;
    type: "text" | "email" | "textarea" | "select" | "checkbox";
    required?: boolean;
    placeholder?: string;
  }>;
  submitButtonText?: string;
}

export interface DataTableBlockContent {
  title?: string;
  columns?: Array<{
    id: string;
    label: string;
    type: "string" | "number" | "date" | "boolean";
  }>;
  rows?: Array<Record<string, unknown>>;
}

export interface StatsBlockContent {
  title?: string;
  stats?: Array<{
    label: string;
    value: string;
    change?: string;
  }>;
}

export interface CustomBlockContent {
  content?: string;
}
