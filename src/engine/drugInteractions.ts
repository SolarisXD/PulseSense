export interface InteractionResult {
  drugA: string;
  drugB: string;
  severity: 'major' | 'moderate' | 'minor';
  effect: string;
  recommendation: string;
}

interface InteractionEntry {
  drug1: string;
  drug2: string;
  severity: 'major' | 'moderate' | 'minor';
  effect: string;
  recommendation: string;
}

const DB: InteractionEntry[] = [
  // ACE Inhibitors + Potassium-sparing Diuretics
  { drug1: 'lisinopril', drug2: 'spironolactone', severity: 'major', effect: 'Increased risk of hyperkalemia (dangerously high potassium)', recommendation: 'Monitor serum potassium regularly; consider alternative diuretic' },
  { drug1: 'enalapril', drug2: 'spironolactone', severity: 'major', effect: 'Increased risk of hyperkalemia (dangerously high potassium)', recommendation: 'Monitor serum potassium regularly; consider alternative diuretic' },
  { drug1: 'ramipril', drug2: 'spironolactone', severity: 'major', effect: 'Increased risk of hyperkalemia', recommendation: 'Monitor potassium levels closely' },
  { drug1: 'captopril', drug2: 'spironolactone', severity: 'major', effect: 'Increased risk of hyperkalemia', recommendation: 'Monitor potassium levels closely' },

  // ACE Inhibitors + ARBs
  { drug1: 'lisinopril', drug2: 'losartan', severity: 'moderate', effect: 'Additive hypotensive effect; increased risk of renal impairment and hyperkalemia', recommendation: 'Avoid combination unless essential; monitor BP, renal function, and potassium' },
  { drug1: 'enalapril', drug2: 'losartan', severity: 'moderate', effect: 'Additive hypotensive effect; increased risk of renal impairment', recommendation: 'Avoid combination unless essential; monitor renal function' },
  { drug1: 'lisinopril', drug2: 'valsartan', severity: 'moderate', effect: 'Additive hypotensive effect; increased renal risk', recommendation: 'Avoid combination unless essential' },
  { drug1: 'enalapril', drug2: 'valsartan', severity: 'moderate', effect: 'Additive hypotensive effect; increased renal risk', recommendation: 'Avoid combination unless essential' },
  { drug1: 'lisinopril', drug2: 'irbesartan', severity: 'moderate', effect: 'Additive hypotensive effect; increased renal risk', recommendation: 'Avoid combination unless essential' },
  { drug1: 'enalapril', drug2: 'irbesartan', severity: 'moderate', effect: 'Additive hypotensive effect; increased renal risk', recommendation: 'Avoid combination unless essential' },

  // NSAIDs + Anticoagulants
  { drug1: 'ibuprofen', drug2: 'warfarin', severity: 'major', effect: 'Significantly increased risk of gastrointestinal bleeding', recommendation: 'Avoid NSAIDs; use acetaminophen for pain instead' },
  { drug1: 'naproxen', drug2: 'warfarin', severity: 'major', effect: 'Significantly increased risk of gastrointestinal bleeding', recommendation: 'Avoid NSAIDs; use acetaminophen for pain instead' },
  { drug1: 'diclofenac', drug2: 'warfarin', severity: 'major', effect: 'Increased risk of bleeding', recommendation: 'Avoid combination; monitor INR closely if unavoidable' },
  { drug1: 'ibuprofen', drug2: 'apixaban', severity: 'major', effect: 'Increased risk of bleeding', recommendation: 'Avoid NSAIDs while on anticoagulants' },
  { drug1: 'naproxen', drug2: 'apixaban', severity: 'major', effect: 'Increased risk of bleeding', recommendation: 'Avoid NSAIDs while on anticoagulants' },
  { drug1: 'ibuprofen', drug2: 'rivaroxaban', severity: 'major', effect: 'Increased risk of bleeding', recommendation: 'Avoid NSAIDs while on anticoagulants' },
  { drug1: 'naproxen', drug2: 'rivaroxaban', severity: 'major', effect: 'Increased risk of bleeding', recommendation: 'Avoid NSAIDs while on anticoagulants' },

  // NSAIDs + ACE Inhibitors
  { drug1: 'ibuprofen', drug2: 'lisinopril', severity: 'moderate', effect: 'Reduced antihypertensive effect; increased risk of renal impairment', recommendation: 'Monitor BP and renal function; limit NSAID use' },
  { drug1: 'naproxen', drug2: 'lisinopril', severity: 'moderate', effect: 'Reduced antihypertensive effect; increased renal risk', recommendation: 'Monitor BP and renal function; limit NSAID use' },
  { drug1: 'ibuprofen', drug2: 'enalapril', severity: 'moderate', effect: 'Reduced antihypertensive effect', recommendation: 'Monitor BP; limit NSAID use' },
  { drug1: 'naproxen', drug2: 'enalapril', severity: 'moderate', effect: 'Reduced antihypertensive effect', recommendation: 'Monitor BP; limit NSAID use' },

  // NSAIDs + Aspirin
  { drug1: 'ibuprofen', drug2: 'aspirin', severity: 'moderate', effect: 'Increased risk of gastrointestinal bleeding; ibuprofen may reduce aspirin\'s cardioprotective effect', recommendation: 'Take aspirin at least 30 minutes before ibuprofen; consider alternatives' },
  { drug1: 'naproxen', drug2: 'aspirin', severity: 'moderate', effect: 'Increased risk of gastrointestinal bleeding', recommendation: 'Consider alternatives or add GI protection' },
  { drug1: 'diclofenac', drug2: 'aspirin', severity: 'moderate', effect: 'Increased risk of GI bleeding', recommendation: 'Consider alternatives or add GI protection' },

  // Metformin + Contrast
  { drug1: 'metformin', drug2: 'contrast', severity: 'moderate', effect: 'Risk of lactic acidosis during contrast procedures', recommendation: 'Hold metformin 48 hours before contrast procedures and for 48 hours after' },

  // Statins + Macrolide Antibiotics
  { drug1: 'atorvastatin', drug2: 'clarithromycin', severity: 'major', effect: 'Increased statin levels — risk of myopathy and rhabdomyolysis', recommendation: 'Consider alternative antibiotic or hold statin during treatment' },
  { drug1: 'simvastatin', drug2: 'clarithromycin', severity: 'major', effect: 'Significantly increased statin levels — high risk of rhabdomyolysis', recommendation: 'Avoid combination; hold simvastatin during clarithromycin course' },
  { drug1: 'rosuvastatin', drug2: 'clarithromycin', severity: 'moderate', effect: 'Increased statin levels', recommendation: 'Monitor for muscle pain; reduce statin dose if needed' },
  { drug1: 'atorvastatin', drug2: 'erythromycin', severity: 'major', effect: 'Increased statin levels — risk of myopathy', recommendation: 'Consider alternative antibiotic' },
  { drug1: 'simvastatin', drug2: 'erythromycin', severity: 'major', effect: 'Significantly increased statin levels', recommendation: 'Avoid combination' },

  // Statins + Azole Antifungals
  { drug1: 'atorvastatin', drug2: 'fluconazole', severity: 'moderate', effect: 'Increased statin levels — risk of myopathy', recommendation: 'Monitor for muscle pain; reduce statin dose if needed' },
  { drug1: 'simvastatin', drug2: 'fluconazole', severity: 'major', effect: 'Significantly increased statin levels', recommendation: 'Avoid combination or hold statin during treatment' },
  { drug1: 'atorvastatin', drug2: 'itraconazole', severity: 'major', effect: 'Increased statin levels — risk of myopathy', recommendation: 'Hold statin during itraconazole treatment' },

  // Warfarin + Antibiotics
  { drug1: 'warfarin', drug2: 'ciprofloxacin', severity: 'major', effect: 'Increased INR — risk of bleeding', recommendation: 'Monitor INR closely; adjust warfarin dose as needed' },
  { drug1: 'warfarin', drug2: 'clarithromycin', severity: 'major', effect: 'Increased INR — risk of bleeding', recommendation: 'Monitor INR closely during and after antibiotic course' },
  { drug1: 'warfarin', drug2: 'fluconazole', severity: 'major', effect: 'Significantly increased INR — bleeding risk', recommendation: 'Monitor INR frequently; reduce warfarin dose' },
  { drug1: 'warfarin', drug2: 'metronidazole', severity: 'major', effect: 'Increased INR — risk of bleeding', recommendation: 'Monitor INR closely; adjust warfarin dose' },

  // SSRIs + NSAIDs
  { drug1: 'fluoxetine', drug2: 'ibuprofen', severity: 'moderate', effect: 'Increased risk of gastrointestinal bleeding', recommendation: 'Consider acetaminophen instead of NSAIDs; monitor for signs of bleeding' },
  { drug1: 'sertraline', drug2: 'ibuprofen', severity: 'moderate', effect: 'Increased risk of GI bleeding', recommendation: 'Consider acetaminophen instead of NSAIDs' },
  { drug1: 'citalopram', drug2: 'ibuprofen', severity: 'moderate', effect: 'Increased risk of GI bleeding', recommendation: 'Consider acetaminophen instead of NSAIDs' },
  { drug1: 'fluoxetine', drug2: 'naproxen', severity: 'moderate', effect: 'Increased risk of GI bleeding', recommendation: 'Consider acetaminophen instead of NSAIDs' },
  { drug1: 'sertraline', drug2: 'naproxen', severity: 'moderate', effect: 'Increased risk of GI bleeding', recommendation: 'Consider acetaminophen instead of NSAIDs' },
  { drug1: 'fluoxetine', drug2: 'warfarin', severity: 'major', effect: 'Increased bleeding risk — SSRIs inhibit platelet function', recommendation: 'Monitor INR and signs of bleeding closely' },
  { drug1: 'sertraline', drug2: 'warfarin', severity: 'major', effect: 'Increased bleeding risk', recommendation: 'Monitor INR and signs of bleeding closely' },

  // Beta-blockers + Calcium Channel Blockers
  { drug1: 'metoprolol', drug2: 'verapamil', severity: 'major', effect: 'Risk of bradycardia, heart block, and hypotension', recommendation: 'Avoid combination; if essential, monitor heart rate and BP closely' },
  { drug1: 'atenolol', drug2: 'verapamil', severity: 'major', effect: 'Risk of bradycardia and heart block', recommendation: 'Avoid combination; monitor cardiac function' },
  { drug1: 'propranolol', drug2: 'verapamil', severity: 'major', effect: 'Risk of bradycardia and heart block', recommendation: 'Avoid combination' },
  { drug1: 'metoprolol', drug2: 'diltiazem', severity: 'moderate', effect: 'Increased risk of bradycardia', recommendation: 'Monitor heart rate; adjust doses if needed' },
  { drug1: 'atenolol', drug2: 'diltiazem', severity: 'moderate', effect: 'Increased risk of bradycardia', recommendation: 'Monitor heart rate' },

  // SSRIs + MAOIs
  { drug1: 'fluoxetine', drug2: 'phenelzine', severity: 'major', effect: 'Life-threatening serotonin syndrome risk', recommendation: 'Contraindicated — allow at least 5 weeks between stopping fluoxetine and starting MAOI' },
  { drug1: 'sertraline', drug2: 'phenelzine', severity: 'major', effect: 'Life-threatening serotonin syndrome risk', recommendation: 'Contraindicated — allow washout period between treatments' },
  { drug1: 'citalopram', drug2: 'phenelzine', severity: 'major', effect: 'Life-threatening serotonin syndrome risk', recommendation: 'Contraindicated — allow washout period' },
  { drug1: 'fluoxetine', drug2: 'tranylcypromine', severity: 'major', effect: 'Life-threatening serotonin syndrome risk', recommendation: 'Contraindicated' },
  { drug1: 'sertraline', drug2: 'tranylcypromine', severity: 'major', effect: 'Life-threatening serotonin syndrome risk', recommendation: 'Contraindicated' },
  { drug1: 'citalopram', drug2: 'tranylcypromine', severity: 'major', effect: 'Life-threatening serotonin syndrome risk', recommendation: 'Contraindicated' },

  // Digoxin + Diuretics
  { drug1: 'digoxin', drug2: 'furosemide', severity: 'moderate', effect: 'Hypokalemia from diuretic increases digoxin toxicity risk', recommendation: 'Monitor potassium levels; maintain normal potassium' },
  { drug1: 'digoxin', drug2: 'hydrochlorothiazide', severity: 'moderate', effect: 'Hypokalemia increases digoxin toxicity risk', recommendation: 'Monitor potassium levels; potassium supplementation may be needed' },

  // Methotrexate + NSAIDs
  { drug1: 'methotrexate', drug2: 'ibuprofen', severity: 'major', effect: 'NSAIDs reduce methotrexate clearance — risk of severe toxicity', recommendation: 'Avoid NSAIDs; use acetaminophen for pain' },
  { drug1: 'methotrexate', drug2: 'naproxen', severity: 'major', effect: 'NSAIDs reduce methotrexate clearance — risk of severe toxicity', recommendation: 'Avoid NSAIDs; use acetaminophen for pain' },
  { drug1: 'methotrexate', drug2: 'aspirin', severity: 'major', effect: 'Increased methotrexate levels — risk of toxicity', recommendation: 'Avoid high-dose aspirin; monitor methotrexate levels' },

  // Lithium + NSAIDs
  { drug1: 'lithium', drug2: 'ibuprofen', severity: 'moderate', effect: 'NSAIDs increase lithium levels — risk of toxicity', recommendation: 'Monitor lithium levels; limit NSAID use; stay hydrated' },
  { drug1: 'lithium', drug2: 'naproxen', severity: 'moderate', effect: 'NSAIDs increase lithium levels — risk of toxicity', recommendation: 'Monitor lithium levels; limit NSAID use' },

  // Clopidogrel + Omeprazole
  { drug1: 'clopidogrel', drug2: 'omeprazole', severity: 'moderate', effect: 'Omeprazole reduces clopidogrel\'s antiplatelet effect', recommendation: 'Use pantoprazole or famotidine instead of omeprazole' },
  { drug1: 'clopidogrel', drug2: 'esomeprazole', severity: 'moderate', effect: 'Reduced antiplatelet effect', recommendation: 'Use pantoprazole or famotidine instead' },

  // Levothyroxine + Calcium/Iron
  { drug1: 'levothyroxine', drug2: 'calcium', severity: 'moderate', effect: 'Calcium reduces levothyroxine absorption', recommendation: 'Separate doses by at least 4 hours' },
  { drug1: 'levothyroxine', drug2: 'iron', severity: 'moderate', effect: 'Iron reduces levothyroxine absorption', recommendation: 'Separate doses by at least 4 hours' },

  // Aspirin + Anticoagulants
  { drug1: 'aspirin', drug2: 'warfarin', severity: 'major', effect: 'Significantly increased risk of major bleeding', recommendation: 'Avoid combination unless specifically indicated (e.g., mechanical heart valve); monitor INR closely' },
  { drug1: 'aspirin', drug2: 'apixaban', severity: 'major', effect: 'Increased risk of major bleeding', recommendation: 'Avoid combination unless specifically indicated' },
  { drug1: 'aspirin', drug2: 'rivaroxaban', severity: 'major', effect: 'Increased risk of major bleeding', recommendation: 'Avoid combination unless specifically indicated' },
];

export function checkDrugInteractions(medicationNames: string[]): InteractionResult[] {
  const results: InteractionResult[] = [];
  const seen = new Set<string>();

  const lowerNames = medicationNames.map((n) => n.toLowerCase().trim());

  for (const entry of DB) {
    const matchA = lowerNames.findIndex((n) => n.includes(entry.drug1) || entry.drug1.includes(n));
    const matchB = lowerNames.findIndex((n) => n.includes(entry.drug2) || entry.drug2.includes(n));

    if (matchA !== -1 && matchB !== -1 && matchA !== matchB) {
      const key = [Math.min(matchA, matchB), Math.max(matchA, matchB)].join('-');
      if (!seen.has(key)) {
        seen.add(key);
        results.push({
          drugA: medicationNames[matchA],
          drugB: medicationNames[matchB],
          severity: entry.severity,
          effect: entry.effect,
          recommendation: entry.recommendation,
        });
      }
    }
  }

  return results;
}
