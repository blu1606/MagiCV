import { CVEditorPage } from "@/components/cv-editor-page"

export default async function EditorRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <CVEditorPage cvId={id} />
}
