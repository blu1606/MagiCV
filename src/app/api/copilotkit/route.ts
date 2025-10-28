import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";

// Temporary fix: Disable Mastra integration to avoid vnext_getNetworks error
const serviceAdapter = new ExperimentalEmptyAdapter();

export const POST = async (req: NextRequest) => {
  try {
    // Create a simple runtime without Mastra agents for now
    const runtime = new CopilotRuntime({
      // agents: [], // Empty agents array to avoid Mastra issues
    });

    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
      runtime,
      serviceAdapter,
      endpoint: "/api/copilotkit",
    });

    return handleRequest(req);
  } catch (error) {
    console.error('CopilotKit error:', error);
    return new Response('CopilotKit service temporarily unavailable', { status: 503 });
  }
};