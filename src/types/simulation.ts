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
  createdAt: string;
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

export interface CaseAsset {
  caseName: string;
  caseType: string;
  exposedProblems: string[];
  reusableTemplates: string[];
  aiWorkflows: string[];
  shareableOutputs?: ShareableCaseOutput[];
  suitableForTraining: boolean;
  suitableForContent: boolean;
  desensitizationNotes?: string;
}

export interface ShareableCaseOutput {
  title: string;
  usage: string;
  content: string;
}

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
