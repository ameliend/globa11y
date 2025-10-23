export interface SpecialCase {
  type: string;
  title: string;
  description?: string;
}

export interface WCAGCriterion {
  ref_id: string;
  title: string;
  level: 'A' | 'AA';
  description: string;
  special_cases?: SpecialCase[];
}

// Import the full WCAG data
import wcagFullData from './wcag-full.json';

// Transform and filter the data
export const wcagCriteria: WCAGCriterion[] = wcagFullData
  .flatMap((principle: any) => 
    principle.guidelines.flatMap((guideline: any) => 
      guideline.success_criteria
        .filter((criterion: any) => 
          criterion.level !== 'AAA' && 
          criterion.ref_id !== '4.1.1' // Remove obsolete criterion
        )
        .map((criterion: any) => ({
          ref_id: criterion.ref_id,
          title: criterion.title,
          level: criterion.level as 'A' | 'AA',
          description: criterion.description,
          special_cases: criterion.special_cases || undefined
        }))
    )
  )
  .sort((a, b) => {
    const aParts = a.ref_id.split('.').map(Number);
    const bParts = b.ref_id.split('.').map(Number);
    
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aNum = aParts[i] || 0;
      const bNum = bParts[i] || 0;
      if (aNum !== bNum) return aNum - bNum;
    }
    return 0;
  });
