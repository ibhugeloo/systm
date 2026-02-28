import { z } from 'zod';

const MvpBlockPositionSchema = z.object({
  row: z.number().int().min(0),
  col: z.number().int().min(0),
  width: z.number().int().min(1),
  height: z.number().int().min(1),
});

const MvpBlockStyleSchema = z.object({
  variant: z.string(),
  theme: z.string(),
});

const HeroBlockContentSchema = z.object({
  headline: z.string(),
  subheadline: z.string(),
  cta_text: z.string(),
  cta_link: z.string(),
  background_image_url: z.string().optional(),
});

const FeatureItemSchema = z.object({
  icon: z.string(),
  title: z.string(),
  description: z.string(),
});

const FeaturesBlockContentSchema = z.object({
  title: z.string(),
  description: z.string(),
  features: z.array(FeatureItemSchema).min(1).max(5),
});

const PricingPlanSchema = z.object({
  name: z.string(),
  price: z.string(),
  description: z.string(),
  features: z.array(z.string()),
});

const PricingBlockContentSchema = z.object({
  title: z.string(),
  plans: z.array(PricingPlanSchema).min(1).max(5),
});

const StatSchema = z.object({
  label: z.string(),
  value: z.string(),
  change: z.string().optional(),
});

const StatsBlockContentSchema = z.object({
  title: z.string(),
  stats: z.array(StatSchema).min(1),
});

const CtaBlockContentSchema = z.object({
  text: z.string(),
  button_text: z.string(),
  button_link: z.string(),
});

const DashboardWidgetSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  metric: z.string(),
});

const DashboardBlockContentSchema = z.object({
  title: z.string(),
  widgets: z.array(DashboardWidgetSchema),
});

const DataTableColumnSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(['string', 'number', 'date', 'boolean']),
});

const DataTableBlockContentSchema = z.object({
  title: z.string(),
  columns: z.array(DataTableColumnSchema),
  rows: z.array(z.record(z.unknown())),
});

const FormFieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(['text', 'email', 'textarea', 'select', 'checkbox']),
  required: z.boolean(),
  placeholder: z.string().optional(),
});

const FormBlockContentSchema = z.object({
  title: z.string(),
  description: z.string(),
  fields: z.array(FormFieldSchema),
  submit_button_text: z.string(),
});

const TestimonialSchema = z.object({
  author: z.string(),
  role: z.string(),
  content: z.string(),
  image_url: z.string().optional(),
});

const TestimonialsBlockContentSchema = z.object({
  title: z.string(),
  testimonials: z.array(TestimonialSchema),
});

const BlockContentSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('hero'), content: HeroBlockContentSchema }),
  z.object({ type: z.literal('features'), content: FeaturesBlockContentSchema }),
  z.object({ type: z.literal('pricing'), content: PricingBlockContentSchema }),
  z.object({ type: z.literal('stats'), content: StatsBlockContentSchema }),
  z.object({ type: z.literal('cta'), content: CtaBlockContentSchema }),
  z.object({ type: z.literal('dashboard'), content: DashboardBlockContentSchema }),
  z.object({ type: z.literal('data-table'), content: DataTableBlockContentSchema }),
  z.object({ type: z.literal('form'), content: FormBlockContentSchema }),
  z.object({ type: z.literal('testimonials'), content: TestimonialsBlockContentSchema }),
  z.object({ type: z.literal('custom'), content: z.record(z.unknown()) }),
]).transform(obj => obj as any);

export const MvpBlockSchema = z.object({
  id: z.string(),
  type: z.enum(['hero', 'features', 'pricing', 'testimonials', 'cta', 'dashboard', 'form', 'data-table', 'stats', 'custom']),
  position: MvpBlockPositionSchema,
  content: z.record(z.unknown()),
  style: MvpBlockStyleSchema.optional(),
});

const MvpCanvasMetadataSchema = z.object({
  title: z.string(),
  description: z.string(),
  generatedAt: z.string(),
  version: z.number().int().min(1),
});

export const MvpCanvasSchema = z.object({
  id: z.string(),
  blocks: z.array(MvpBlockSchema).min(1),
  metadata: MvpCanvasMetadataSchema,
});

export type ValidatedMvpBlock = z.infer<typeof MvpBlockSchema>;
export type ValidatedMvpCanvas = z.infer<typeof MvpCanvasSchema>;
