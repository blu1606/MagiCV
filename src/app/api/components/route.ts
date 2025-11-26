import { NextRequest } from 'next/server';
import { getComponents, createComponent } from '@/services/data-service';
import { withValidation, withErrorHandling } from '@/lib/api-middleware';
import { componentCreateSchema } from '@/lib/validations/component';
import { successResponse, createdResponse } from '@/lib/api-response';
import { createValidationError } from '@/lib/errors';

/**
 * GET /api/components - List all components
 */
async function listComponents() {
  const components = await getComponents();
  return successResponse(components);
}

/**
 * POST /api/components - Create a new component
 */
async function createNewComponent(request: NextRequest) {
  const body = await request.json();
  const newComponent = await createComponent(body);

  if (!newComponent) {
    throw createValidationError(
      { name: 'ValidationError', message: 'Failed to create component' } as any
    );
  }

  return createdResponse(newComponent);
}

export const GET = withErrorHandling(listComponents);
export const POST = withValidation(createNewComponent, {
  body: componentCreateSchema
});



