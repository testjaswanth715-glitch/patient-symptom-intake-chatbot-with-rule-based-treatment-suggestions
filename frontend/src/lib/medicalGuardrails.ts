const RED_FLAG_KEYWORDS = [
  'chest pain',
  'difficulty breathing',
  'shortness of breath',
  'severe allergic',
  'anaphylaxis',
  'stroke',
  'facial drooping',
  'slurred speech',
  'severe dehydration',
  'blood in stool',
  'blood in vomit',
  'vomiting blood',
  'suicidal',
  'suicide',
  'self harm',
  'unconscious',
  'seizure',
  'severe head injury',
  'broken bone',
  'severe burn'
];

const AGE_WEIGHT_KEYWORDS = [
  'dosage',
  'dose',
  'how much',
  'mg',
  'ml',
  'teaspoon',
  'tablespoon'
];

export function detectRedFlags(userInput: string): boolean {
  const lowerInput = userInput.toLowerCase();
  return RED_FLAG_KEYWORDS.some(keyword => lowerInput.includes(keyword));
}

export function needsDosingCaution(userInput: string, assistantReply: string): boolean {
  const lowerInput = userInput.toLowerCase();
  const lowerReply = assistantReply.toLowerCase();
  
  const mentionsDosing = AGE_WEIGHT_KEYWORDS.some(keyword => 
    lowerInput.includes(keyword) || lowerReply.includes(keyword)
  );
  
  const hasAgeWeight = /\b(age|years old|months old|weight|kg|lbs|pounds)\b/i.test(userInput);
  
  return mentionsDosing && !hasAgeWeight;
}

export function applyGuardrails(userInput: string, assistantReply: string): string {
  let enhancedReply = assistantReply;
  
  // Check if disclaimer is already present
  const hasDisclaimer = /medical disclaimer|not medical advice|not a substitute/i.test(assistantReply);
  
  // Add dosing caution if needed
  if (needsDosingCaution(userInput, assistantReply)) {
    const dosingCaution = '\n\n⚠️ **Dosing Information**: For accurate dosing, especially for children, please consult a healthcare provider or pharmacist. Dosing depends on age, weight, and other individual factors.';
    enhancedReply = enhancedReply + dosingCaution;
  }
  
  // Ensure disclaimer is present (backend already adds it, but we verify)
  if (!hasDisclaimer) {
    enhancedReply = enhancedReply + '\n\n**Medical Disclaimer**: This is not medical advice. For emergency symptoms, seek immediate medical care. Always consult your healthcare provider for any health concerns.';
  }
  
  return enhancedReply;
}

export function getRedFlagGuidance(): string {
  return `🚨 **URGENT**: Based on your symptoms, you should seek immediate medical attention. Please call emergency services (911) or go to the nearest emergency room right away.

These symptoms may indicate a serious or life-threatening condition that requires immediate professional evaluation and treatment.

**Do not wait** to seek medical care.`;
}
