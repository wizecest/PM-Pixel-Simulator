export type ProjectStage =
  | "planning"
  | "feasibility"
  | "scheme_design"
  | "preliminary_design"
  | "construction_drawing"
  | "procurement"
  | "construction"
  | "acceptance"
  | "settlement"
  | "other";

export interface ScenarioInput {
  id: string;
  projectName: string;
  projectStage: ProjectStage;
  currentProblem: string;
  involvedParties?: string;
  proposedAction: string;
  trainingGoals?: string[];
  sourceSnapshot?: ProjectSnapshotContext;
  createdAt: string;
}

export interface ProjectIssueSnapshot {
  source: "pm-obsidian";
  schema_version: "pm-pixel-snapshot/v1";
  generated_at: string;
  project_id: string;
  project_name: string;
  current_node: string;
  node_status: string;
  risk_note: string;
  latest_events: string[];
  pending_actions: string[];
  evidence_links: string[];
  user_question: string;
}

export interface ProjectSnapshotContext {
  source: "pm-obsidian";
  schemaVersion: "pm-pixel-snapshot/v1";
  generatedAt: string;
  projectId: string;
  currentNode: string;
  nodeStatus: string;
  riskNote: string;
  latestEvents: string[];
  pendingActions: string[];
  evidenceLinks: string[];
  userQuestion: string;
}

export interface ProjectActionPack {
  source: "pm-pixel-simulator";
  schema_version: "pm-pixel-action-pack/v1";
  project_id: string;
  project_name: string;
  management_gaps: string[];
  role_challenges: string[];
  recommended_actions: string[];
  owner_suggestions: string[];
  deadline_suggestions: string[];
  evidence_needed: string[];
  writeback_candidates: string[];
}

export type DecisionFlightStepKey =
  | "input_problem"
  | "ai_simulation"
  | "human_adoption"
  | "real_execution"
  | "reality_feedback"
  | "judgment_upgrade"
  | "case_asset";

export type DecisionFlightStepStatus = "pending" | "in_progress" | "completed";

export interface DecisionFlightRecordStep {
  key: DecisionFlightStepKey;
  label: string;
  status: DecisionFlightStepStatus;
  content: string;
  evidence: string[];
  updatedAt: string;
}

export interface DecisionFlightRecord {
  schemaVersion: "pm-pixel-decision-flight-record/v1";
  createdAt: string;
  updatedAt: string;
  steps: DecisionFlightRecordStep[];
  nextReviewNote: string;
}

export interface ProjectDatabase {
  source: "pm-obsidian";
  schema_version: "pm-pixel-project-database/v1";
  generated_at: string;
  state_policy: {
    truth_source: string;
    writeback: string;
    simulator_role: string;
  };
  source_layers: Array<{
    name: string;
    role: string;
  }>;
  project_count: number;
  projects: ProjectDatabaseProject[];
}

export interface ProjectDatabaseProject {
  project_id: string;
  project_name: string;
  project_type: string;
  source_paths: Record<string, string>;
  source_coverage: {
    present: string[];
    missing: string[];
    status: string;
  };
  simulator_snapshot: ProjectIssueSnapshot;
  current_state: {
    current_node: string;
    node_status: string;
    risk_note: string;
    assistant_state: string;
    waiting_on: string;
    next_action: string;
    attention_level: string;
  };
  context: {
    homepage_overview: string;
    homepage_timeline: unknown[];
    project_log_recent: string[];
    event_ledger_recent: unknown[];
    review_queue: unknown[];
    readiness_gates: unknown[];
    action_cards: unknown[];
    commitment_cards: unknown[];
  };
}

export interface Role {
  id: string;
  name: string;
  title: string;
  avatar: string;
  focus: string[];
  defaultQuestions: string[];
  decisionCriteria: string[];
}

export interface Scene {
  id: string;
  name: string;
  description: string;
  suitableStages: ProjectStage[];
  recommendedRoles: string[];
}

export interface RoleSimulationResult {
  roleId: string;
  roleName: string;
  npcLine: string;
  concerns: string[];
  challenges: string[];
  missingItems: string[];
  recommendedActions: string[];
  consequences: string[];
}

export type GapStatus = "pass" | "partial" | "fail";

export interface GapScanItem {
  key: string;
  label: string;
  status: GapStatus;
  problem: string;
  improvementAction: string;
}

export interface GapScanResult {
  items: GapScanItem[];
}

export interface AbilityScore {
  globalView: number;
  scheduleControl: number;
  responsibilityJudgment: number;
  coordination: number;
  closure: number;
  riskIdentification: number;
  evidenceAwareness: number;
  reviewAndAssetization: number;
  total: number;
  deductions: string[];
  trainingFocus: string;
}

export interface ActionItem {
  owner: string;
  action: string;
  deadline: string;
  output: string;
  checker: string;
}

export interface ActionPlan {
  todayActions: ActionItem[];
  tomorrowActions: ActionItem[];
  weeklyActions: ActionItem[];
  participants: string[];
  requiredForms: string[];
  deliverables: string[];
  reportingRequirement: string;
  closureMethod: string;
}

export type LibraryValueLevel = "high" | "medium" | "low";

export interface CaseLibraryMeta {
  normalizedCaseType: string;
  problemTags: string[];
  abilityTags: string[];
  materialTags: string[];
  trainingValue: LibraryValueLevel;
  contentValue: LibraryValueLevel;
}

export interface CaseAsset {
  caseName: string;
  caseType: string;
  exposedProblems: string[];
  reusableTemplates: string[];
  aiWorkflows: string[];
  shareableOutputs?: ShareableCaseOutput[];
  libraryMeta?: CaseLibraryMeta;
  suitableForTraining: boolean;
  suitableForContent: boolean;
  desensitizationNotes?: string;
}

export interface ShareableCaseOutput {
  title: string;
  usage: string;
  content: string;
  outputType?: ShareableOutputType;
  copyLabel?: string;
  workScenario?: string;
}

export type ShareableOutputType =
  | "meeting_notice"
  | "meeting_minutes"
  | "responsibility_table"
  | "reminder_record"
  | "reporting_brief"
  | "archive_checklist"
  | "review_checklist";

export type CaseQualityStatus = "pass" | "warning" | "fail";

export interface CaseQualityCheck {
  key: string;
  label: string;
  status: CaseQualityStatus;
  score: number;
  summary: string;
  details: string[];
}

export interface CaseQualityReport {
  overallStatus: CaseQualityStatus;
  score: number;
  checks: CaseQualityCheck[];
  warnings: string[];
}

export type CaseReviewStatus = "unreviewed" | "approved" | "needs_edit";

export interface SimulationRecord {
  id: string;
  input: ScenarioInput;
  selectedSceneId: string;
  selectedRoleIds: string[];
  simulationSource?: SimulationSource;
  levelName: string;
  riskLevel: RiskLevel;
  mainQuest: string;
  hiddenRisks: string[];
  roleResults: RoleSimulationResult[];
  gapScan: GapScanResult;
  abilityScore: AbilityScore;
  actionPlan: ActionPlan;
  caseAsset: CaseAsset;
  flightRecord?: DecisionFlightRecord;
  reviewStatus?: CaseReviewStatus;
  createdAt: string;
}

export type RiskLevel = "low" | "medium" | "medium_high" | "high";

export type SimulationSource = "local_rules" | "live_llm";

export interface GenerateSimulationParams {
  input: ScenarioInput;
  selectedScene: Scene;
  selectedRoles: Role[];
}

export interface GenerateSimulationResponse {
  simulationSource?: SimulationSource;
  levelName: string;
  riskLevel: RiskLevel;
  mainQuest: string;
  hiddenRisks: string[];
  roleResults: RoleSimulationResult[];
  gapScan: GapScanResult;
  abilityScore: AbilityScore;
  actionPlan: ActionPlan;
  caseAsset: CaseAsset;
}
