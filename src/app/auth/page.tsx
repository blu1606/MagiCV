import { LinkedInSignIn } from "@/components/linkedin-signin"

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Scattered pixelated elements */}
      <div className="pixel-scatter pixel-scatter-1">
        <div className="pixel-plus"></div>
      </div>
      <div className="pixel-scatter pixel-scatter-2">
        <div className="pixel-x"></div>
      </div>
      <div className="pixel-scatter pixel-scatter-3">
        <div className="pixel-arrow"></div>
      </div>

      <div className="max-w-md mx-auto p-8 text-center">
        <div className="mb-8">
          <div className="pixel-plus mx-auto mb-4"></div>
          <h1 className="text-3xl font-bold text-white mb-2 font-mono">Welcome to magiCV</h1>
          <p className="text-gray-300 font-mono">Sign in to create your AI-powered CV</p>
        </div>
        
        <div className="space-y-4">
          <LinkedInSignIn />
          <p className="text-sm text-gray-400 font-mono">
            By signing in, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  )
}