export async function runLocalAiDiagnosis({ plantName, symptoms }) {
  const issue = /yellow|chlorosis/i.test(symptoms)
    ? 'Possible nutrient deficiency or overwatering'
    : /brown|crispy/i.test(symptoms)
      ? 'Possible low humidity or underwatering'
      : 'Possible stress from watering/light changes';

  return {
    diagnosis: issue,
    confidence: 0.67,
    nextSteps: [
      'Check soil moisture 1-2 inches deep before watering.',
      'Move to bright, indirect light.',
      'Remove heavily damaged leaves and monitor for 7 days.',
    ],
    notes: `Local/mock generation used for ${plantName || 'unknown plant'} (no external AI key required).`,
  };
}
