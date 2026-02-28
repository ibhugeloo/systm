import { MvpBlock, MvpCanvas } from '@/types/mvp';

/**
 * Normalize a block from Claude's response to match MvpBlock structure.
 * Handles both formats: position+content (old) and row/col+data (new).
 */
export function normalizeBlock(raw: Record<string, unknown>): MvpBlock {
  const position = raw.position as Record<string, number> | undefined;
  const content = raw.content as Record<string, unknown> | undefined;
  const data = raw.data as Record<string, unknown> | undefined;

  // Map old field names (headline/subheadline/cta_text) to new ones (title/subtitle/ctaText)
  const normalizedData = data || content || {};
  if (normalizedData.headline && !normalizedData.title) {
    normalizedData.title = normalizedData.headline;
    delete normalizedData.headline;
  }
  if (normalizedData.subheadline && !normalizedData.subtitle) {
    normalizedData.subtitle = normalizedData.subheadline;
    delete normalizedData.subheadline;
  }
  if (normalizedData.cta_text && !normalizedData.ctaText) {
    normalizedData.ctaText = normalizedData.cta_text;
    delete normalizedData.cta_text;
  }
  if (normalizedData.button_text && !normalizedData.ctaText) {
    normalizedData.ctaText = normalizedData.button_text;
    delete normalizedData.button_text;
  }
  // Map features array to items array
  if (normalizedData.features && !normalizedData.items && raw.type === 'features') {
    normalizedData.items = normalizedData.features;
    delete normalizedData.features;
  }

  return {
    id: (raw.id as string) || `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: (raw.type as MvpBlock['type']) || 'custom',
    row: (raw.row as number) ?? position?.row ?? 1,
    col: (raw.col as number) ?? position?.col ?? 1,
    width: (raw.width as number) ?? position?.width ?? 12,
    height: (raw.height as number) ?? position?.height ?? 3,
    data: normalizedData,
  };
}

export function normalizeCanvas(raw: Record<string, unknown>): MvpCanvas {
  const rawBlocks = (raw.blocks as Record<string, unknown>[]) || [];
  const blocks = rawBlocks.map(normalizeBlock);

  // Ensure blocks have sequential non-overlapping rows
  let currentRow = 1;
  for (const block of blocks) {
    block.row = currentRow;
    block.col = 1;
    block.width = 12;
    currentRow += block.height;
  }

  const metadata = raw.metadata as Record<string, unknown> | undefined;

  return {
    blocks,
    gridCols: 12,
    gridRowHeight: 60,
    gap: 8,
    padding: 16,
    metadata: metadata ? {
      title: (metadata.title as string) || '',
      description: (metadata.description as string) || '',
      generatedAt: new Date().toISOString(),
      version: 1,
    } : undefined,
  };
}
