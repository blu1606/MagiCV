# 36 - OpenTelemetry Distributed Tracing

**Priority:** 🟢 Medium
**Effort:** High (2-3 weeks)
**Impact:** Medium
**Dependencies:** 10-structured-logging.md

## Problem
No distributed tracing. Cannot track requests across services. Difficult to identify bottlenecks in multi-service flows. Performance debugging is challenging.

## Requirements
1. Integrate OpenTelemetry SDK
2. Instrument API routes with traces
3. Create spans for major operations (embedding, search, PDF generation)
4. Track external API calls (Google AI, Supabase)
5. Add custom attributes to spans (user ID, operation type)
6. Implement context propagation across services
7. Export traces to observability backend (Jaeger, Honeycomb)
8. Set up trace sampling (100% errors, 10% success)
9. Create trace-based alerts for performance issues
10. Build dashboards showing request flows
11. Integrate with existing logging system

## Acceptance Criteria
- [ ] OpenTelemetry SDK integrated
- [ ] All API routes instrumented
- [ ] External calls traced
- [ ] Custom attributes added
- [ ] Traces exported to backend
- [ ] Sampling configured appropriately
- [ ] Dashboards showing trace data
- [ ] Performance bottlenecks identifiable
- [ ] Team trained on trace analysis
- [ ] Documentation complete

## Technical Considerations
- Use @opentelemetry/sdk-node
- Instrument Next.js carefully (client/server)
- Choose trace backend (Honeycomb recommended)
- Monitor trace volume and costs
- Use consistent span naming conventions
- Correlate traces with logs

## Files Affected
- `src/lib/telemetry.ts` (OpenTelemetry setup)
- API routes (add instrumentation)
- Services (add custom spans)
- `instrumentation.ts` (Next.js instrumentation)

## Testing Requirements
- Verify traces generated correctly
- Test trace sampling
- Verify context propagation
- Test performance impact minimal
