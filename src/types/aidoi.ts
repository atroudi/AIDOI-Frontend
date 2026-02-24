// AIDOI types matching backend Aidoi entity

export type AidoiStatus = "active" | "inactive" | "deleted";

// Backend uses #[serde(rename_all = "lowercase")] — all values must be lowercase
export type AidoiResourceType =
  | "dataset"
  | "journalarticle"
  | "software"
  | "report"
  | "image"
  | "audio"
  | "video";

// Backend: A=5pts, B=3pts, C=1pt, D=0pt
export type ResearchStage = "a" | "b" | "c" | "d";
// Backend: yes=5pts, partial=3pts, no=0pts
export type YesPartialNo = "yes" | "partial" | "no";
// Backend: fully=5pts, partial=3pts, not=0pts
export type FullyPartialNot = "fully" | "partial" | "not";

export interface AidoiAuthor {
  first_name: string;
  last_name: string;
  initials: string;
  affiliation?: string;
  orcid?: string;
}

// Field names match backend AIDOIMetadata struct exactly
export interface AidoiMetadata {
  // Basic metadata
  creators: AidoiAuthor[];
  title: string;
  publisher: string;
  publication_year: number;
  resource_type: AidoiResourceType;
  description?: string;
  license?: string;
  ai_model: string;

  // Section B — Research Stages (8 stages)
  stage_hypothesis: ResearchStage;
  stage_hypothesis_description: string;
  stage_literature: ResearchStage;
  stage_literature_description: string;
  stage_design: ResearchStage;
  stage_design_description: string;
  stage_data_generation: ResearchStage;
  stage_data_generation_description: string;
  stage_data_analysis: ResearchStage;
  stage_data_analysis_description: string;
  stage_writing: ResearchStage;
  stage_writing_description: string;
  stage_figures: ResearchStage;
  stage_figures_description: string;
  stage_references: ResearchStage;
  stage_references_description: string;

  // Section C — Provenance & Transparency (20 pts)
  provenance_text_generated: YesPartialNo;
  provenance_text_generated_description: string;
  provenance_figures_created: YesPartialNo;
  provenance_figures_created_description: string;
  provenance_log_available: YesPartialNo;
  provenance_log_available_description: string;
  provenance_review_assisted: YesPartialNo;
  provenance_review_assisted_description: string;

  // Section D — AI Limitations & Human Oversight (15 pts)
  limitations_errors_documented: FullyPartialNot;
  limitations_errors_documented_description: string;
  limitations_ethical_corrections: FullyPartialNot;
  limitations_ethical_corrections_description: string;
  limitations_misinterpretations: FullyPartialNot;
  limitations_misinterpretations_description: string;

  // Section E — Reproducibility & Ethical Compliance (15 pts)
  reproducibility_metadata: YesPartialNo;
  reproducibility_metadata_description: string;
  reproducibility_datasets: YesPartialNo;
  reproducibility_datasets_description: string;
  reproducibility_ethics: YesPartialNo;
  reproducibility_ethics_description: string;

  // Section F — Overall Originality & Compliance (15 pts)
  originality_no_copied_material: YesPartialNo;
  originality_no_copied_material_description: string;
  originality_authorship_declaration: YesPartialNo;
  originality_authorship_declaration_description: string;
  originality_novelty_introduced: YesPartialNo;
  originality_novelty_introduced_description: string;

  // Calculated scores
  score_section_b: number;
  score_section_c: number;
  score_section_d: number;
  score_section_e: number;
  score_section_f: number;
  total_score: number;
  is_eligible: boolean;
}

export interface Aidoi {
  id: string;
  organization_id: string;
  org_admin_id: string;
  suffix: string;
  target_url: string;
  metadata: AidoiMetadata;
  status: AidoiStatus;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface AidoiResponseDto {
  full_aidoi: string;
  resource_url: string;
}

export interface CreateAidoiDto {
  suffix: string;
  target_url: string;
  organization_id: string;
  org_admin_id?: string;
  metadata: AidoiMetadata;
}

export interface UpdateAidoiDto {
  id: string;
  suffix?: string;
  target_url?: string;
  metadata?: Partial<AidoiMetadata>;
}

export const RESOURCE_TYPE_LABELS: Record<AidoiResourceType, string> = {
  dataset: "Dataset",
  journalarticle: "Paper / Journal Article",
  software: "Model / Codebase",
  report: "Report",
  image: "Image",
  audio: "Audio",
  video: "Video",
};
