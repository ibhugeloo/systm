import { MvpCanvas } from '@/types/mvp';

export function getMvpModificationPrompt(
  currentCanvas: MvpCanvas,
  instruction: string
): string {
  return `You are an expert product designer modifying an existing MVP canvas design. Your task is to apply modifications to the current canvas based on the instruction provided.

Current Canvas:
${JSON.stringify(currentCanvas, null, 2)}

Modification Instruction:
${instruction}

Modify the canvas by:
1. Updating relevant blocks based on the instruction
2. Preserving the overall structure and IDs
3. Maintaining consistency with existing content
4. Updating the metadata version to ${(currentCanvas.metadata?.version || 0) + 1}

Return ONLY a valid JSON object with the modified canvas structure - same format as the input canvas.

CRITICAL: 
- Output ONLY valid JSON, no markdown, no explanations, no code blocks
- Preserve block IDs unless restructuring is needed
- Ensure all content maintains internal consistency
- Keep the metadata structure intact`;
}
