import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Scattered pixelated elements */}
      <div className="pixel-scatter pixel-scatter-1">
        <div className="pixel-x"></div>
      </div>
      <div className="pixel-scatter pixel-scatter-2">
        <div className="pixel-plus"></div>
      </div>

      <div className="max-w-md mx-auto p-8">
        <Card className="p-8 bg-black/60 backdrop-blur-sm border-2 border-white text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4 font-mono">Authentication Error</h1>
          <p className="text-gray-300 mb-6 font-mono">
            There was an issue with the authentication process. This could be due to:
          </p>
          <ul className="text-left text-gray-300 mb-6 font-mono space-y-2">
            <li>• The authentication code expired</li>
            <li>• You denied permission to the app</li>
            <li>• A network error occurred</li>
            <li>• The session was interrupted</li>
          </ul>
          <div className="space-y-4">
            <Link href="/auth">
              <Button className="w-full glitch-button text-black font-bold">
                Try Again
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="w-full text-gray-400 hover:text-white font-mono">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
