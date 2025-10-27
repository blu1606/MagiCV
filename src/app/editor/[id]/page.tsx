import { CVEditorPage } from "@/components/cv-editor-page"

export default function EditorRoute({ params }: { params: { id: string } }) {
  return <CVEditorPage cvId={params.id} />
}
