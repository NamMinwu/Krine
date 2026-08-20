export type DecisionStatus = "DRAFT" | "ACTIVE";
export type FlowStep =
  | "DIARY"
  | "QUESTIONS"
  | "STRUCTURE"
  | "OBJECTION"
  | "REFLECTION"
  | "DONE";
export type Verdict = "INITIAL" | "MAINTAINED" | "REVISED" | "REVERSED";
export type ConditionType = "DATE" | "EVENT";
export type ConditionStatus = "PENDING" | "TRIGGERED" | "DISMISSED";
export type ObjectionResolution = "OPEN" | "DEFENDED" | "REVISED" | "DEFERRED";
export type QueueKind = "DUE_DATE" | "EVENT_CHECKIN" | "DEFERRED_OBJECTION";

export interface DecisionOption {
  id: number | null;
  label: string;
  gains: string[];
  sacrifices: string[];
  premises: string[];
}

export interface DecisionVersion {
  id: number;
  versionNo: number;
  conclusion: string;
  verdict: Verdict;
  reason: string | null;
  createdAt: string;
}

export interface Condition {
  id: number | null;
  text: string;
  type: ConditionType;
  dueDate: string | null;
  status: ConditionStatus;
}

export interface Objection {
  id: number;
  perspective: string;
  objection: string;
  userAnswer: string | null;
  reflectBack: string | null;
  resolution: ObjectionResolution;
}

export interface FlowMessage {
  id: number;
  role: "USER" | "ASSISTANT";
  content: string;
  choicesJson: string | null;
}

export interface Decision {
  id: number;
  title: string | null;
  situation: string | null;
  topicTag: string | null;
  rawDiary: string | null;
  firstExpression: string | null;
  status: DecisionStatus;
  flowStep: FlowStep;
  criteria: string[];
  options: DecisionOption[];
  versions: DecisionVersion[];
  conditions: Condition[];
  objections: Objection[];
  messages: FlowMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface DecisionSummary {
  id: number;
  title: string | null;
  topicTag: string | null;
  status: DecisionStatus;
  flowStep: FlowStep;
  lastVerdict: Verdict | null;
  lastConclusion: string | null;
  updatedAt: string;
}

export interface ReviewQueueItem {
  decisionId: number;
  decisionTitle: string;
  kind: QueueKind;
  refId: number;
  text: string;
  dueDate: string | null;
}

export interface DiscoverResult {
  title: string;
  optionA: string;
  optionB: string;
  message: string;
}

export interface NextQuestion {
  question: string | null;
  choices: string[];
  done: boolean;
  progress: number;
  total: number;
}

export interface ConditionInput {
  text: string;
  type: ConditionType;
  dueDate: string | null;
}

export interface OptionInput {
  label: string;
  gains: string[];
  sacrifices: string[];
  premises: string[];
}

export interface StructureInput {
  title: string;
  situation: string | null;
  topicTag: string | null;
  criteria: string[];
  options: OptionInput[];
  conditions: ConditionInput[];
}

export interface StructureDraft extends StructureInput {
  suggestedReviewDate: string | null;
}

export interface ObjectionResult {
  objectionId: number;
  perspective: string;
  objection: string;
  remaining: number;
}

export interface ReviewInput {
  verdict: Exclude<Verdict, "INITIAL">;
  reason: string;
  newConclusion: string | null;
  triggeredConditionId: number | null;
}
