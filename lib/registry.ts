
/**
 * TRAINING_REGISTRY: The Single Source of Truth for the training pipeline.
 * Defines required modules, their order, and ID mappings for backward compatibility.
 */
export const TRAINING_REGISTRY = {
  learn: {
    required: ['product', 'kyc', 'website'],
    /** Business rule: Agent needs at least 1 module to unlock the Quiz phase */
    minToUnlockNext: 1,
  },
  quiz: {
    /** The 4 canonical keys used for logic/filtering */
    required: ['foundation', 'product', 'process', 'payment'] as const,
    
    /** 
     * Mapping of Canonical Key -> Descriptive ID (slug used in URLs/Firestore).
     * This matches the IDs defined in lib/quiz-data.ts and module_config/quizzes.
     */
    definitions: {
      foundation: { 
        id: 'foundation-knowledge', 
        icon: 'GraduationCap',
      },
      product: { 
        id: 'certification-quiz', 
        icon: 'BookOpen',
      },
      process: { 
        id: 'kyc-sales-training', 
        icon: 'Settings',
      },
      payment: { 
        id: 'payment-training', 
        icon: 'CreditCard',
      },
    },

    /** 
     * Backward compatibility & ID Normalization.
     * Maps various potential Firestore IDs to their canonical key.
     */
    aliases: {
      // Descriptive IDs
      'foundation-knowledge': 'foundation',
      'certification-quiz': 'product',
      'kyc-sales-training': 'process',
      'payment-training': 'payment',
      
      // Short aliases
      'certification': 'product',
      'kyc': 'process',
      'package': 'payment',
      'registration': 'process',
      'opener': 'product',
      'process-quiz': 'process',
      'foundation-quiz': 'foundation',
      'payment-quiz': 'payment',
    } as Record<string, string>
  },
  eval: {
    requiredLevel: 4
  }
};

export type CanonicalQuizKey = typeof TRAINING_REGISTRY.quiz.required[number];

/**
 * Normalizes any module/quiz ID into its canonical form.
 * Returns the original ID if no mapping is found.
 */
export function getCanonicalQuizKey(id: string): string {
  if (!id) return id;
  const lowerId = id.toLowerCase();
  
  // 1. Check direct aliases
  if (TRAINING_REGISTRY.quiz.aliases[lowerId]) {
    return TRAINING_REGISTRY.quiz.aliases[lowerId];
  }

  // 2. Check if it's already a canonical key
  if ((TRAINING_REGISTRY.quiz.required as readonly string[]).includes(lowerId)) {
    return lowerId;
  }

  // 3. Fuzzy matching for safety with unknown future descriptive IDs
  if (lowerId.includes('foundation')) return 'foundation';
  if (lowerId.includes('product') || lowerId.includes('cert')) return 'product';
  if (lowerId.includes('process') || lowerId.includes('kyc') || lowerId.includes('regis')) return 'process';
  if (lowerId.includes('payment') || lowerId.includes('package')) return 'payment';
  
  return lowerId;
}
