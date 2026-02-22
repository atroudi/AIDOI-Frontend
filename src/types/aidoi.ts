// AIDOI types matching backend Aidoi entity

export type AidoiStatus = "active" | "inactive" | "deleted";

export type AidoiResourceType =
  | "Dataset"
  | "JournalArticle"
  | "Software"
  | "Report"
  | "Image"
  | "Audio"
  | "Video"
  | "Other";

export type ResearchStage = "A" | "B" | "C" | "D";
export type YesPartialNo = "Yes" | "Partial" | "No";
export type FullyPartialNot = "Fully" | "Partial" | "Not";

export interface AidoiAuthor {
  first_name: string;
  last_name: string;
  initials: string;
  affiliation?: string;
  orcid?: string;
}

export interface AidoiMetadata {
  creators?: AidoiAuthor[];
  title?: string;
  publisher?: string;
  publication_year?: number;
  resource_type?: AidoiResourceType;
  description?: string;
  license?: string;
  ai_model?: string;

  // Section B — Research Stages
  hypothesis_stage?: ResearchStage;
  hypothesis_description?: string;
  literature_stage?: ResearchStage;
  literature_description?: string;
  design_stage?: ResearchStage;
  design_description?: string;
  data_generation_stage?: ResearchStage;
  data_generation_description?: string;
  data_analysis_stage?: ResearchStage;
  data_analysis_description?: string;
  writing_stage?: ResearchStage;
  writing_description?: string;
  figures_stage?: ResearchStage;
  figures_description?: string;
  references_stage?: ResearchStage;
  references_description?: string;

  // Section C — Provenance
  text_generated?: YesPartialNo;
  figures_created?: YesPartialNo;
  log_available?: YesPartialNo;
  review_assisted?: YesPartialNo;

  // Section D — Limitations
  errors_documented?: FullyPartialNot;
  ethical_corrections?: FullyPartialNot;
  misinterpretations?: FullyPartialNot;

  // Section E — Reproducibility
  metadata_available?: YesPartialNo;
  datasets?: YesPartialNo;
  ethics?: YesPartialNo;

  // Section F — Originality
  no_copied_material?: YesPartialNo;
  authorship_declaration?: YesPartialNo;
  novelty_introduced?: YesPartialNo;

  // Scores
  score_section_b?: number;
  score_section_c?: number;
  score_section_d?: number;
  score_section_e?: number;
  score_section_f?: number;
  total_score?: number;
  is_eligible?: boolean;
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
  metadata?: AidoiMetadata;
}

export const RESOURCE_TYPE_LABELS: Record<AidoiResourceType, string> = {
  Dataset: "Dataset",
  JournalArticle: "Paper",
  Software: "Model / Codebase",
  Report: "Report",
  Image: "Image",
  Audio: "Audio",
  Video: "Video",
  Other: "Other",
};
