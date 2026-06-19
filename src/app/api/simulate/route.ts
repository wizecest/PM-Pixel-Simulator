import { NextResponse } from "next/server";
import { normalizeShareableOutputs, normalizeWorkOutputs } from "@/services/caseAssetService";
import { normalizeCaseLibraryMeta } from "@/services/caseLibraryService";
import { buildSimulationPrompt } from "@/services/promptTemplate";
import type { GenerateSimulationParams, GenerateSimulationResponse, ShareableCaseOutput, SimulationRecord } from "@/types/simulation";

type LlmProvider = "openai" | "openai-compatible";

function extractJson(text: string) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  return "";
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function readOutputText(payload: unknown) {
  const data = payload as {
    output_text?: string;
    output?: Array<{
      content?: Array<{
        text?: string;
        type?: string;
      }>;
    }>;
  };

  if (typeof data.output_text === "string") {
    return data.output_text;
  }

  return (
    data.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text)
      .filter(Boolean)
      .join("\n") ?? ""
  );
}

function readChatCompletionText(payload: unknown) {
  const data = payload as {
    choices?: Array<{
      message?: {
        content?: string;
      };
      text?: string;
    }>;
  };

  return data.choices?.[0]?.message?.content ?? data.choices?.[0]?.text ?? "";
}

function isSimulationResponse(value: unknown): value is GenerateSimulationResponse {
  const result = value as Partial<GenerateSimulationResponse>;
  return Boolean(
    result &&
      typeof result.levelName === "string" &&
      typeof result.mainQuest === "string" &&
      Array.isArray(result.hiddenRisks) &&
      Array.isArray(result.roleResults) &&
      result.gapScan &&
      result.abilityScore &&
      result.actionPlan &&
      result.caseAsset,
  );
}

function getProvider(): LlmProvider {
  return process.env.LLM_PROVIDER === "openai-compatible" ? "openai-compatible" : "openai";
}

function uniqueOutputs(outputs: ShareableCaseOutput[]) {
  const usedTitles = new Set<string>();
  const usedTypes = new Set<string>();

  return outputs.filter((output) => {
    if (usedTitles.has(output.title)) {
      return false;
    }
    if (output.outputType && usedTypes.has(output.outputType)) {
      return false;
    }

    usedTitles.add(output.title);
    if (output.outputType) {
      usedTypes.add(output.outputType);
    }
    return true;
  });
}

function buildMetaRecord(
  result: GenerateSimulationResponse,
  params: GenerateSimulationParams,
  shareableOutputs: ShareableCaseOutput[],
): SimulationRecord {
  return {
    id: params.input.id || "preview",
    input: params.input,
    selectedSceneId: params.selectedScene.id,
    selectedRoleIds: params.selectedRoles.map((role) => role.id),
    simulationSource: result.simulationSource,
    levelName: result.levelName,
    riskLevel: result.riskLevel,
    mainQuest: result.mainQuest,
    hiddenRisks: result.hiddenRisks,
    roleResults: result.roleResults,
    gapScan: result.gapScan,
    abilityScore: result.abilityScore,
    actionPlan: result.actionPlan,
    caseAsset: {
      ...result.caseAsset,
      shareableOutputs,
    },
    createdAt: new Date().toISOString(),
  };
}

function normalizeSimulationResponse(result: GenerateSimulationResponse, params: GenerateSimulationParams): GenerateSimulationResponse {
  const outputSource = {
    projectName: params.input.projectName,
    currentProblem: params.input.currentProblem,
    proposedAction: params.input.proposedAction,
    involvedParties: params.input.involvedParties,
    caseName: result.caseAsset.caseName,
    exposedProblems: result.caseAsset.exposedProblems,
    reusableTemplates: result.caseAsset.reusableTemplates,
  };
  const shareableOutputs = normalizeShareableOutputs(result.caseAsset.shareableOutputs, outputSource);
  const workOutputs = normalizeWorkOutputs(result.caseAsset.shareableOutputs, outputSource);
  const mergedOutputs = uniqueOutputs([...shareableOutputs, ...workOutputs]);
  const metaRecord = buildMetaRecord(result, params, mergedOutputs);

  return {
    ...result,
    caseAsset: {
      ...result.caseAsset,
      libraryMeta: normalizeCaseLibraryMeta(metaRecord),
      shareableOutputs: mergedOutputs,
    },
  };
}

async function callOpenAiResponses(prompt: string, apiKey: string, model: string) {
  const baseUrl = trimTrailingSlash(process.env.LLM_BASE_URL || "https://api.openai.com/v1");

  const upstream = await fetch(`${baseUrl}/responses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content: "You output strict JSON only. Do not include markdown fences or explanatory text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4,
      max_output_tokens: 7000,
    }),
  });

  if (!upstream.ok) {
    const errorText = await upstream.text();
    throw new Error(errorText);
  }

  return readOutputText(await upstream.json());
}

async function callOpenAiCompatibleChat(prompt: string, apiKey: string, model: string) {
  if (!process.env.LLM_BASE_URL) {
    throw new Error("LLM_BASE_URL is required for openai-compatible provider.");
  }

  const baseUrl = trimTrailingSlash(process.env.LLM_BASE_URL);

  const upstream = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "You output strict JSON only. Do not include markdown fences or explanatory text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4,
      max_tokens: 7000,
    }),
  });

  if (!upstream.ok) {
    const errorText = await upstream.text();
    throw new Error(errorText);
  }

  return readChatCompletionText(await upstream.json());
}

export async function POST(request: Request) {
  const provider = getProvider();
  const apiKey = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY;
  const model = process.env.LLM_MODEL || process.env.OPENAI_MODEL;

  if (!apiKey || !model) {
    return NextResponse.json(
      {
        error: "LLM_NOT_CONFIGURED",
        message: "Set LLM_API_KEY and LLM_MODEL to enable live LLM simulation.",
      },
      { status: 501 },
    );
  }

  let params: GenerateSimulationParams;
  try {
    params = (await request.json()) as GenerateSimulationParams;
  } catch {
    return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }

  const prompt = buildSimulationPrompt(params);

  try {
    const outputText =
      provider === "openai-compatible"
        ? await callOpenAiCompatibleChat(prompt, apiKey, model)
        : await callOpenAiResponses(prompt, apiKey, model);
    const jsonText = extractJson(outputText);

    if (!jsonText) {
      console.error("LLM returned non JSON output", outputText);
      return NextResponse.json({ error: "LLM_NON_JSON" }, { status: 502 });
    }

    const result = JSON.parse(jsonText) as unknown;
    if (!isSimulationResponse(result)) {
      return NextResponse.json({ error: "LLM_SCHEMA_MISMATCH" }, { status: 502 });
    }

    return NextResponse.json(normalizeSimulationResponse(result, params));
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "LLM_REQUEST_ERROR", provider, detail: error instanceof Error ? error.message : String(error) },
      { status: 502 },
    );
  }
}
