"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useToast } from "@/components/ui/toast";
import { aidoiService, organizationService } from "@/services";
import type { Organization, AidoiResourceType, ResearchStage, YesPartialNo, FullyPartialNot } from "@/types";

/* ── Zod schema ────────────────────────────────────────────────────── */
const stageEnum = z.enum(["a", "b", "c", "d"]);
const ypnEnum = z.enum(["yes", "partial", "no"]);
const fpnEnum = z.enum(["fully", "partial", "not"]);

const aidoiSchema = z.object({
  // Basic
  title: z.string().min(1, "AI Object Name is required"),
  resource_type: z.enum(["dataset", "journalarticle", "software", "report", "image", "audio", "video"], {
    message: "Object type is required",
  }),
  suffix: z.string().min(1, "Suffix is required"),
  version: z.string().optional(),
  organization_id: z.string().min(1, "Issuing institution is required"),
  target_url: z.string().url("Please enter a valid URL"),
  publisher: z.string().min(1, "Publisher is required"),
  publication_year: z.coerce.number().int().min(1900).max(2100, "Enter a valid year"),
  ai_model: z.string().min(1, "AI model is required"),
  description: z.string().optional(),
  license: z.string().optional(),

  // Authors (at least one)
  creators: z.array(z.object({
    first_name: z.string().min(1, "First name required"),
    last_name: z.string().min(1, "Last name required"),
    initials: z.string().min(1, "Initials required"),
    affiliation: z.string().optional(),
    orcid: z.string().optional(),
  })).min(1, "At least one author/creator is required"),

  // Section B — Research Stages
  stage_hypothesis: stageEnum,
  stage_hypothesis_description: z.string().min(1, "Description required"),
  stage_literature: stageEnum,
  stage_literature_description: z.string().min(1, "Description required"),
  stage_design: stageEnum,
  stage_design_description: z.string().min(1, "Description required"),
  stage_data_generation: stageEnum,
  stage_data_generation_description: z.string().min(1, "Description required"),
  stage_data_analysis: stageEnum,
  stage_data_analysis_description: z.string().min(1, "Description required"),
  stage_writing: stageEnum,
  stage_writing_description: z.string().min(1, "Description required"),
  stage_figures: stageEnum,
  stage_figures_description: z.string().min(1, "Description required"),
  stage_references: stageEnum,
  stage_references_description: z.string().min(1, "Description required"),

  // Section C — Provenance
  provenance_text_generated: ypnEnum,
  provenance_text_generated_description: z.string().min(1, "Description required"),
  provenance_figures_created: ypnEnum,
  provenance_figures_created_description: z.string().min(1, "Description required"),
  provenance_log_available: ypnEnum,
  provenance_log_available_description: z.string().min(1, "Description required"),
  provenance_review_assisted: ypnEnum,
  provenance_review_assisted_description: z.string().min(1, "Description required"),

  // Section D — Limitations
  limitations_errors_documented: fpnEnum,
  limitations_errors_documented_description: z.string().min(1, "Description required"),
  limitations_ethical_corrections: fpnEnum,
  limitations_ethical_corrections_description: z.string().min(1, "Description required"),
  limitations_misinterpretations: fpnEnum,
  limitations_misinterpretations_description: z.string().min(1, "Description required"),

  // Section E — Reproducibility
  reproducibility_metadata: ypnEnum,
  reproducibility_metadata_description: z.string().min(1, "Description required"),
  reproducibility_datasets: ypnEnum,
  reproducibility_datasets_description: z.string().min(1, "Description required"),
  reproducibility_ethics: ypnEnum,
  reproducibility_ethics_description: z.string().min(1, "Description required"),

  // Section F — Originality
  originality_no_copied_material: ypnEnum,
  originality_no_copied_material_description: z.string().min(1, "Description required"),
  originality_authorship_declaration: ypnEnum,
  originality_authorship_declaration_description: z.string().min(1, "Description required"),
  originality_novelty_introduced: ypnEnum,
  originality_novelty_introduced_description: z.string().min(1, "Description required"),
});

type AidoiFormValues = z.infer<typeof aidoiSchema>;

/* ── Static options ────────────────────────────────────────────────── */
const resourceTypeOptions = [
  { value: "software", label: "Model / Codebase" },
  { value: "dataset", label: "Dataset" },
  { value: "journalarticle", label: "Paper / Journal Article" },
  { value: "report", label: "Report" },
  { value: "image", label: "Image" },
  { value: "audio", label: "Audio" },
  { value: "video", label: "Video" },
];

const stageOptions = [
  { value: "a", label: "A — Full AI  (5 pts)" },
  { value: "b", label: "B — Collaboration  (3 pts)" },
  { value: "c", label: "C — Human-led  (1 pt)" },
  { value: "d", label: "D — Not applicable  (0 pts)" },
];

const ypnOptions = [
  { value: "yes", label: "Yes  (5 pts)" },
  { value: "partial", label: "Partial  (3 pts)" },
  { value: "no", label: "No  (0 pts)" },
];

const fpnOptions = [
  { value: "fully", label: "Fully  (5 pts)" },
  { value: "partial", label: "Partial  (3 pts)" },
  { value: "not", label: "Not  (0 pts)" },
];

/* ── Scoring helpers ───────────────────────────────────────────────── */
const stageScore = (v: string) => ({ a: 5, b: 3, c: 1, d: 0 }[v] ?? 0);
const ypnScore = (v: string) => ({ yes: 5, partial: 3, no: 0 }[v] ?? 0);
const fpnScore = (v: string) => ({ fully: 5, partial: 3, not: 0 }[v] ?? 0);

/* ── Section toggle helper ─────────────────────────────────────────── */
function SectionHeader({ title, open, onToggle }: { title: string; open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center justify-between w-full text-left py-3 border-b border-gray-200 mb-4"
    >
      <span className="text-base font-semibold text-gray-900">{title}</span>
      {open ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
    </button>
  );
}

/* ── Page ──────────────────────────────────────────────────────────── */
export default function NewAidoiPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [orgs, setOrgs] = useState<Organization[]>([]);

  // Section open/closed state
  const [openSections, setOpenSections] = useState({
    basic: true, authors: true, sectionB: true,
    sectionC: false, sectionD: false, sectionE: false, sectionF: false,
  });
  const toggleSection = (key: keyof typeof openSections) =>
    setOpenSections((s) => ({ ...s, [key]: !s[key] }));

  const defaultStageValues = { stage_hypothesis: "d" as ResearchStage, stage_hypothesis_description: "", stage_literature: "d" as ResearchStage, stage_literature_description: "", stage_design: "d" as ResearchStage, stage_design_description: "", stage_data_generation: "d" as ResearchStage, stage_data_generation_description: "", stage_data_analysis: "d" as ResearchStage, stage_data_analysis_description: "", stage_writing: "d" as ResearchStage, stage_writing_description: "", stage_figures: "d" as ResearchStage, stage_figures_description: "", stage_references: "d" as ResearchStage, stage_references_description: "" };
  const defaultProvValues = { provenance_text_generated: "no" as YesPartialNo, provenance_text_generated_description: "", provenance_figures_created: "no" as YesPartialNo, provenance_figures_created_description: "", provenance_log_available: "no" as YesPartialNo, provenance_log_available_description: "", provenance_review_assisted: "no" as YesPartialNo, provenance_review_assisted_description: "" };
  const defaultLimValues = { limitations_errors_documented: "not" as FullyPartialNot, limitations_errors_documented_description: "", limitations_ethical_corrections: "not" as FullyPartialNot, limitations_ethical_corrections_description: "", limitations_misinterpretations: "not" as FullyPartialNot, limitations_misinterpretations_description: "" };
  const defaultRepValues = { reproducibility_metadata: "no" as YesPartialNo, reproducibility_metadata_description: "", reproducibility_datasets: "no" as YesPartialNo, reproducibility_datasets_description: "", reproducibility_ethics: "no" as YesPartialNo, reproducibility_ethics_description: "" };
  const defaultOrigValues = { originality_no_copied_material: "no" as YesPartialNo, originality_no_copied_material_description: "", originality_authorship_declaration: "no" as YesPartialNo, originality_authorship_declaration_description: "", originality_novelty_introduced: "no" as YesPartialNo, originality_novelty_introduced_description: "" };

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(aidoiSchema),
    defaultValues: {
      resource_type: "software",
      organization_id: "",
      publication_year: new Date().getFullYear(),
      creators: [{ first_name: "", last_name: "", initials: "", affiliation: "", orcid: "" }],
      suffix: "",
      ...defaultStageValues,
      ...defaultProvValues,
      ...defaultLimValues,
      ...defaultRepValues,
      ...defaultOrigValues,
    },
  });

  const { fields: creatorFields, append: appendCreator, remove: removeCreator } = useFieldArray({
    control,
    name: "creators",
  });

  // Auto-generate suffix from title
  const titleValue = watch("title");
  useEffect(() => {
    if (titleValue) {
      const slug = titleValue.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").substring(0, 50);
      setValue("suffix", slug, { shouldValidate: false });
    }
  }, [titleValue, setValue]);

  useEffect(() => {
    organizationService.getMany(0, 100).then((res) => setOrgs(res.data.records)).catch(() => {});
  }, []);

  const orgOptions = orgs.map((o) => ({ value: o.id, label: o.legal_name }));

  // Live scores
  const watched = watch();
  const scores = useMemo(() => {
    const b = [
      "stage_hypothesis", "stage_literature", "stage_design", "stage_data_generation",
      "stage_data_analysis", "stage_writing", "stage_figures", "stage_references",
    ].reduce((sum, k) => sum + stageScore(watched[k as keyof AidoiFormValues] as string ?? "d"), 0);

    const c = [
      "provenance_text_generated", "provenance_figures_created",
      "provenance_log_available", "provenance_review_assisted",
    ].reduce((sum, k) => sum + ypnScore(watched[k as keyof AidoiFormValues] as string ?? "no"), 0);

    const d = [
      "limitations_errors_documented", "limitations_ethical_corrections", "limitations_misinterpretations",
    ].reduce((sum, k) => sum + fpnScore(watched[k as keyof AidoiFormValues] as string ?? "not"), 0);

    const e = [
      "reproducibility_metadata", "reproducibility_datasets", "reproducibility_ethics",
    ].reduce((sum, k) => sum + ypnScore(watched[k as keyof AidoiFormValues] as string ?? "no"), 0);

    const f = [
      "originality_no_copied_material", "originality_authorship_declaration", "originality_novelty_introduced",
    ].reduce((sum, k) => sum + ypnScore(watched[k as keyof AidoiFormValues] as string ?? "no"), 0);

    const total = b + c + d + e + f;
    return { b, c, d, e, f, total, is_eligible: total >= 60 };
  }, [watched]);

  const onSubmit = async (data: AidoiFormValues) => {
    setIsLoading(true);
    try {
      const suffix = data.version
        ? `${data.suffix}/v${data.version.replace(/^v/, "")}`
        : data.suffix;

      await aidoiService.create({
        suffix,
        target_url: data.target_url,
        organization_id: data.organization_id,
        metadata: {
          creators: data.creators,
          title: data.title,
          publisher: data.publisher,
          publication_year: data.publication_year,
          resource_type: data.resource_type as AidoiResourceType,
          description: data.description || undefined,
          license: data.license || undefined,
          ai_model: data.ai_model,
          stage_hypothesis: data.stage_hypothesis,
          stage_hypothesis_description: data.stage_hypothesis_description,
          stage_literature: data.stage_literature,
          stage_literature_description: data.stage_literature_description,
          stage_design: data.stage_design,
          stage_design_description: data.stage_design_description,
          stage_data_generation: data.stage_data_generation,
          stage_data_generation_description: data.stage_data_generation_description,
          stage_data_analysis: data.stage_data_analysis,
          stage_data_analysis_description: data.stage_data_analysis_description,
          stage_writing: data.stage_writing,
          stage_writing_description: data.stage_writing_description,
          stage_figures: data.stage_figures,
          stage_figures_description: data.stage_figures_description,
          stage_references: data.stage_references,
          stage_references_description: data.stage_references_description,
          provenance_text_generated: data.provenance_text_generated,
          provenance_text_generated_description: data.provenance_text_generated_description,
          provenance_figures_created: data.provenance_figures_created,
          provenance_figures_created_description: data.provenance_figures_created_description,
          provenance_log_available: data.provenance_log_available,
          provenance_log_available_description: data.provenance_log_available_description,
          provenance_review_assisted: data.provenance_review_assisted,
          provenance_review_assisted_description: data.provenance_review_assisted_description,
          limitations_errors_documented: data.limitations_errors_documented,
          limitations_errors_documented_description: data.limitations_errors_documented_description,
          limitations_ethical_corrections: data.limitations_ethical_corrections,
          limitations_ethical_corrections_description: data.limitations_ethical_corrections_description,
          limitations_misinterpretations: data.limitations_misinterpretations,
          limitations_misinterpretations_description: data.limitations_misinterpretations_description,
          reproducibility_metadata: data.reproducibility_metadata,
          reproducibility_metadata_description: data.reproducibility_metadata_description,
          reproducibility_datasets: data.reproducibility_datasets,
          reproducibility_datasets_description: data.reproducibility_datasets_description,
          reproducibility_ethics: data.reproducibility_ethics,
          reproducibility_ethics_description: data.reproducibility_ethics_description,
          originality_no_copied_material: data.originality_no_copied_material,
          originality_no_copied_material_description: data.originality_no_copied_material_description,
          originality_authorship_declaration: data.originality_authorship_declaration,
          originality_authorship_declaration_description: data.originality_authorship_declaration_description,
          originality_novelty_introduced: data.originality_novelty_introduced,
          originality_novelty_introduced_description: data.originality_novelty_introduced_description,
          score_section_b: scores.b,
          score_section_c: scores.c,
          score_section_d: scores.d,
          score_section_e: scores.e,
          score_section_f: scores.f,
          total_score: scores.total,
          is_eligible: scores.is_eligible,
        },
      });

      showToast("AIDOI minted successfully!", "success");
      router.push("/aidois");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      showToast(axiosErr.response?.data?.message || "Failed to create AIDOI", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "AIDOIs", href: "/aidois" }, { label: "New" }]} />

      <div className="flex items-start justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New AIDOI</h1>
        {/* Live score badge */}
        <div className={`text-sm font-semibold px-3 py-1.5 rounded-full border ${scores.is_eligible ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-700 border-orange-200"}`}>
          Score: {scores.total}/105 {scores.is_eligible ? "✓ Eligible" : "— Not eligible yet"}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* ── Basic Information ─────────────────────────────────────── */}
        <Card>
          <CardContent className="py-5">
            <SectionHeader title="Basic Information" open={openSections.basic} onToggle={() => toggleSection("basic")} />
            {openSections.basic && (
              <div className="space-y-4">
                <Input id="title" label="AI Object Name *" placeholder="e.g. GPT-4 Model Card" error={errors.title?.message} {...register("title")} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller name="resource_type" control={control} render={({ field }) => (
                    <Select id="resource_type" label="Object Type *" options={resourceTypeOptions} error={errors.resource_type?.message} {...field} />
                  )} />
                  <Input id="version" label="Current Version" placeholder="e.g. 1.2.0" {...register("version")} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input id="suffix" label="AIDOI Suffix *" placeholder="auto-generated from title" error={errors.suffix?.message} {...register("suffix")} />
                  <Input id="target_url" label="Target URL *" type="url" placeholder="https://example.com/resource" error={errors.target_url?.message} {...register("target_url")} />
                </div>

                <Controller name="organization_id" control={control} render={({ field }) => (
                  <Select id="organization_id" label="Issuing Institution *" options={orgOptions} placeholder="Select from your registered institutions" error={errors.organization_id?.message} {...field} />
                )} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input id="publisher" label="Publisher *" placeholder="e.g. HBKU Press" error={errors.publisher?.message} {...register("publisher")} />
                  <Input id="publication_year" label="Publication Year *" type="number" placeholder={String(new Date().getFullYear())} error={errors.publication_year?.message} {...register("publication_year")} />
                </div>

                <Input id="ai_model" label="AI Model Used *" placeholder="e.g. GPT-4, Claude 3, Gemini Pro" error={errors.ai_model?.message} {...register("ai_model")} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Textarea id="description" label="Abstract / Description" placeholder="Describe the AI object, its purpose, and key characteristics..." {...register("description")} />
                  <Input id="license" label="License" placeholder="e.g. MIT, Apache 2.0, CC BY 4.0" {...register("license")} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Authors / Creators ────────────────────────────────────── */}
        <Card>
          <CardContent className="py-5">
            <SectionHeader title="Authors / Creators" open={openSections.authors} onToggle={() => toggleSection("authors")} />
            {openSections.authors && (
              <div className="space-y-4">
                {errors.creators?.root && <p className="text-xs text-red-500">{errors.creators.root.message}</p>}
                {creatorFields.map((field, idx) => (
                  <div key={field.id} className="p-4 border border-gray-100 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Author {idx + 1}</span>
                      {creatorFields.length > 1 && (
                        <button type="button" onClick={() => removeCreator(idx)} className="text-red-400 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input label="First Name *" error={errors.creators?.[idx]?.first_name?.message} {...register(`creators.${idx}.first_name`)} />
                      <Input label="Last Name *" error={errors.creators?.[idx]?.last_name?.message} {...register(`creators.${idx}.last_name`)} />
                      <Input label="Initials *" placeholder="e.g. J.D." error={errors.creators?.[idx]?.initials?.message} {...register(`creators.${idx}.initials`)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input label="Affiliation" placeholder="Institution / Organization" {...register(`creators.${idx}.affiliation`)} />
                      <Input label="ORCID" placeholder="0000-0000-0000-0000" {...register(`creators.${idx}.orcid`)} />
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => appendCreator({ first_name: "", last_name: "", initials: "", affiliation: "", orcid: "" })}>
                  <Plus className="h-4 w-4 mr-1.5" /> Add Author
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Section B: Research Stages ───────────────────────────── */}
        <Card>
          <CardContent className="py-5">
            <SectionHeader
              title={`Section B — Research Stages  (${scores.b}/40 pts)`}
              open={openSections.sectionB}
              onToggle={() => toggleSection("sectionB")}
            />
            {openSections.sectionB && (
              <div className="space-y-5">
                <p className="text-xs text-gray-500 -mt-2 mb-1">For each research phase, indicate the level of AI involvement and describe it briefly.</p>
                {([
                  ["stage_hypothesis", "Hypothesis Formulation"],
                  ["stage_literature", "Literature Review"],
                  ["stage_design", "Research Design"],
                  ["stage_data_generation", "Data Generation"],
                  ["stage_data_analysis", "Data Analysis"],
                  ["stage_writing", "Writing"],
                  ["stage_figures", "Figures & Visualisations"],
                  ["stage_references", "References & Citations"],
                ] as const).map(([key, label]) => (
                  <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
                    <Controller name={key} control={control} render={({ field }) => (
                      <Select label={label} options={stageOptions} error={errors[key]?.message} {...field} />
                    )} />
                    <div className="md:col-span-2">
                      <Textarea label="Description *" placeholder={`Describe AI use in ${label.toLowerCase()}...`} error={errors[`${key}_description` as keyof AidoiFormValues]?.message as string | undefined} {...register(`${key}_description` as keyof AidoiFormValues as never)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Section C: Provenance ────────────────────────────────── */}
        <Card>
          <CardContent className="py-5">
            <SectionHeader
              title={`Section C — Provenance & Transparency  (${scores.c}/20 pts)`}
              open={openSections.sectionC}
              onToggle={() => toggleSection("sectionC")}
            />
            {openSections.sectionC && (
              <div className="space-y-5">
                {([
                  ["provenance_text_generated", "Was text generated or substantially edited by AI?"],
                  ["provenance_figures_created", "Were figures or images created with AI assistance?"],
                  ["provenance_log_available", "Is an AI usage log available for this work?"],
                  ["provenance_review_assisted", "Was peer review assisted by AI tools?"],
                ] as const).map(([key, label]) => (
                  <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
                    <Controller name={key} control={control} render={({ field }) => (
                      <Select label={label} options={ypnOptions} error={errors[key]?.message} {...field} />
                    )} />
                    <div className="md:col-span-2">
                      <Textarea label="Description *" placeholder="Provide details..." error={errors[`${key}_description` as keyof AidoiFormValues]?.message as string | undefined} {...register(`${key}_description` as keyof AidoiFormValues as never)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Section D: Limitations ───────────────────────────────── */}
        <Card>
          <CardContent className="py-5">
            <SectionHeader
              title={`Section D — AI Limitations & Human Oversight  (${scores.d}/15 pts)`}
              open={openSections.sectionD}
              onToggle={() => toggleSection("sectionD")}
            />
            {openSections.sectionD && (
              <div className="space-y-5">
                {([
                  ["limitations_errors_documented", "AI errors or hallucinations are documented"],
                  ["limitations_ethical_corrections", "Ethical issues introduced by AI were corrected"],
                  ["limitations_misinterpretations", "AI misinterpretations were identified and addressed"],
                ] as const).map(([key, label]) => (
                  <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
                    <Controller name={key} control={control} render={({ field }) => (
                      <Select label={label} options={fpnOptions} error={errors[key]?.message} {...field} />
                    )} />
                    <div className="md:col-span-2">
                      <Textarea label="Description *" placeholder="Provide details..." error={errors[`${key}_description` as keyof AidoiFormValues]?.message as string | undefined} {...register(`${key}_description` as keyof AidoiFormValues as never)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Section E: Reproducibility ───────────────────────────── */}
        <Card>
          <CardContent className="py-5">
            <SectionHeader
              title={`Section E — Reproducibility & Ethical Compliance  (${scores.e}/15 pts)`}
              open={openSections.sectionE}
              onToggle={() => toggleSection("sectionE")}
            />
            {openSections.sectionE && (
              <div className="space-y-5">
                {([
                  ["reproducibility_metadata", "Is AI-usage metadata publicly available?"],
                  ["reproducibility_datasets", "Are datasets and model weights publicly accessible?"],
                  ["reproducibility_ethics", "Does the work comply with ethical AI guidelines?"],
                ] as const).map(([key, label]) => (
                  <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
                    <Controller name={key} control={control} render={({ field }) => (
                      <Select label={label} options={ypnOptions} error={errors[key]?.message} {...field} />
                    )} />
                    <div className="md:col-span-2">
                      <Textarea label="Description *" placeholder="Provide details..." error={errors[`${key}_description` as keyof AidoiFormValues]?.message as string | undefined} {...register(`${key}_description` as keyof AidoiFormValues as never)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Section F: Originality ───────────────────────────────── */}
        <Card>
          <CardContent className="py-5">
            <SectionHeader
              title={`Section F — Originality & Compliance  (${scores.f}/15 pts)`}
              open={openSections.sectionF}
              onToggle={() => toggleSection("sectionF")}
            />
            {openSections.sectionF && (
              <div className="space-y-5">
                {([
                  ["originality_no_copied_material", "No AI-generated material was copied from other works without attribution"],
                  ["originality_authorship_declaration", "An authorship declaration has been included"],
                  ["originality_novelty_introduced", "The work introduces original methods, data, or findings"],
                ] as const).map(([key, label]) => (
                  <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
                    <Controller name={key} control={control} render={({ field }) => (
                      <Select label={label} options={ypnOptions} error={errors[key]?.message} {...field} />
                    )} />
                    <div className="md:col-span-2">
                      <Textarea label="Description *" placeholder="Provide details..." error={errors[`${key}_description` as keyof AidoiFormValues]?.message as string | undefined} {...register(`${key}_description` as keyof AidoiFormValues as never)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Score summary + actions ───────────────────────────────── */}
        <Card>
          <CardContent className="py-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Score Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
              {[
                { label: "B — Research Stages", score: scores.b, max: 40 },
                { label: "C — Provenance", score: scores.c, max: 20 },
                { label: "D — Limitations", score: scores.d, max: 15 },
                { label: "E — Reproducibility", score: scores.e, max: 15 },
                { label: "F — Originality", score: scores.f, max: 15 },
              ].map(({ label, score, max }) => (
                <div key={label} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-900">{score}<span className="text-xs text-gray-400">/{max}</span></div>
                  <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
            <div className={`flex items-center justify-between p-4 rounded-lg ${scores.is_eligible ? "bg-green-50 border border-green-200" : "bg-orange-50 border border-orange-200"}`}>
              <div>
                <div className="text-xs text-gray-500">Total Score</div>
                <div className={`text-2xl font-bold ${scores.is_eligible ? "text-green-700" : "text-orange-700"}`}>{scores.total}<span className="text-sm font-normal">/105</span></div>
              </div>
              <div className={`text-sm font-semibold ${scores.is_eligible ? "text-green-700" : "text-orange-700"}`}>
                {scores.is_eligible ? "✓ Eligible for AIDOI" : "Score ≥ 60 required for eligibility"}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => router.push("/aidois")}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading}>
                Mint AIDOI
              </Button>
            </div>
          </CardContent>
        </Card>

      </form>
    </div>
  );
}
