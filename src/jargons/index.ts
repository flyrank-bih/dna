
// A vocabulary is a self-contained visual language (tokens + CSS system)
// that reshapes an extracted page into a coherent aesthetic identity.
//
// Example output:
// "what would stripe.com look like if it was cyberpunk, brutalist, or editorial?"

import { ArtDecoJargon } from "./art-deco.jargon";
import { BrutalistJargon } from "./brutalist.jargon";
import { CorporateJargon } from "./corporate.jargon";
import { CyberpunkJargon } from "./cyberpunk.jargon";
import { EcommerceJargon } from "./ecommerce.jargon";
import { EditorialJargon } from "./editorial.jargon";
import { HealthcareJargon } from "./healthcare.jargon";
import { ShopifyJargon } from "./shopify.jargon";
import { SoftUiJargon } from "./soft-ui.jargon";
import { SwissJargon } from "./swiss.jargon";


//Add Jargon suffix to all vocabulary IDs
export type VocabularyId =
  | "brutalist-jargon"
  | "swiss-jargon"
  | "art-deco-jargon"
  | "cyberpunk-jargon"
  | "soft-ui-jargon"
  | "editorial-jargon"
  | "corporate-jargon"
  | "ecommerce-jargon"
  | "healthcare-jargon"
  | "shopify-jargon";

export const VOCABULARIES = {
  "brutalist-jargon": BrutalistJargon,
  "swiss-jargon": SwissJargon,
  "art-deco-jargon": ArtDecoJargon,
  "cyberpunk-jargon": CyberpunkJargon,
  "soft-ui-jargon": SoftUiJargon,
  "editorial-jargon": EditorialJargon,
  "corporate-jargon": CorporateJargon,
  "ecommerce-jargon": EcommerceJargon,
  "healthcare-jargon": HealthcareJargon,
  "shopify-jargon": ShopifyJargon,
} as const;

export type Vocabulary = (typeof VOCABULARIES)[keyof typeof VOCABULARIES];

export function listVocabularies() {
  return Object.entries(VOCABULARIES).map(([id, v]) => ({
    id,
    name: v.name,
    blurb: v.blurb,
  }));
}

export function getVocabulary(id: VocabularyId): Vocabulary {
  const v = VOCABULARIES[id];

  if (!v) {
    const available = Object.keys(VOCABULARIES).join(", ");
    throw new Error(
      `Unknown vocabulary: "${id}". Available vocabularies: ${available}`,
    );
  }

  return v;
}

export function hasVocabulary(id: string): id is VocabularyId {
  return id in VOCABULARIES;
}

export function vocabularyCount() {
  return Object.keys(VOCABULARIES).length;
}
