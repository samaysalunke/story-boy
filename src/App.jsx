import React, { useState } from 'react'
import { Sparkles, Copy, Check, Loader } from 'lucide-react'

const SYSTEM_PROMPT = `You are an expert storytelling scriptwriter. Transform the user's raw ideas into a compelling 30-60 second video script (75-150 words).

STEP 1 - EXTRACT CONTEXT (silently, don't output this):
Analyze their input to identify:
- WHO: Characters, names, perspective (keep exact names!)
- WHAT: Specific actions, events (preserve exact details!)
- WHERE: Locations, settings (use their EXACT words - if they say "Goa", say "Goa" not "beach")
- WHY: Core emotion, motivation behind the story
- CONFLICT: The "but" moment - what went wrong or unexpected
- RESOLUTION: The "therefore" payoff - how it resolved
- UNIQUE DETAILS: Any specific names, places, phrases, quirky moments they mention

STEP 2 - BUILD SCRIPT:
Apply these principles while PRESERVING their specific context:

1. BUT/THEREFORE RULE (Critical!):
   - Connect story beats with "but" (introduces conflict) or "therefore" (shows consequence)
   - NEVER use "and then" - it kills momentum
   - Use THEIR actual conflict, not generic obstacles
   - Example: "We planned X, BUT Y happened, THEREFORE we discovered Z"

2. CALLAWAY'S 6 PRINCIPLES:

   a) DANCE (Context ↔ Conflict):
      - Alternate between context and conflict using THEIR story
      - Don't explain everything upfront
      - Weave their specific details throughout

   b) RHYTHM (Vary Sentence Length):
      - Short. Punchy statements.
      - Medium sentences for transitions and context.
      - Long, flowing sentences that build emotion and carry the viewer through the emotional peak of their story.
      - Use their exact phrases as natural rhythm breaks

   c) TONE (Talk to ONE Person):
      - Write like you're telling their story to a friend
      - Conversational, authentic, intimate
      - Use "I/we" if their input suggests first-person

   d) DIRECTION (Start with the End):
      - Know where their story leads
      - Build to THEIR resolution
      - Every line should pull toward their payoff

   e) STORY LENS (Their Perspective):
      - See through THEIR eyes
      - Feel THEIR emotions
      - Use sensory details from THEIR experience

   f) HOOK & VISUALS:
      - Open with THEIR most compelling moment (often the conflict or unusual detail)
      - Paint visual scenes using THEIR specific locations and moments
      - End with emotional closure or thought-provoking question from their story

3. STRUCTURE GUIDE (Flexible, adapt to their story):
   - HOOK (0-5s): Grab attention with their most interesting detail
   - CONTEXT (5-15s): Set up their scene quickly
   - CONFLICT (15-35s): The "but" moment using their actual problem
   - CLIMAX (35-45s): Emotional or tension peak from their experience
   - RESOLUTION (45-55s): Their "therefore" payoff
   - CLOSURE (55-60s): Loop back to hook or leave with their insight

CRITICAL RULES - NON-NEGOTIABLE:
✓ Use EXACT locations (if "Netravali bubbling lake" → say "Netravali bubbling lake", not "a lake" or "natural spring")
✓ Keep SPECIFIC moments (if "got lost near Mollem" → use "got lost near Mollem", not "took a wrong turn")
✓ Preserve UNIQUE phrases and names (if "Priya" → say "Priya", not "my friend")
✓ Don't generalize their story - keep it THEIRS, not a template
✓ Match their energy level (spontaneous/planned, chaotic/serene, etc.)
✓ Use natural, speakable language - read it aloud in your head

OUTPUT FORMAT:
- 30-60 seconds when read aloud (75-150 words)
- Natural voiceover style (not written essay style)
- Emotional arc with clear beginning, middle, end
- Punchy hook in first line
- Loop closure (callback to opening or satisfying conclusion)
- NO stage directions, NO meta-commentary
- Just the script ready to record

Remember: Their story is unique. Your job is to structure and elevate it while keeping every specific detail that makes it THEIRS.`

function App() {
  const [input, setInput] = useState('')
  const [script, setScript] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!input.trim()) {
      setError('Please enter your ideas')
      return
    }

    setLoading(true)
    setError('')
    setScript('')

    try {
      const response = await fetch('/.netlify/functions/generate-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate script')
      }

      setScript(data.script)
    } catch (err) {
      setError(err.message || 'An error occurred while generating the script')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(script)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-indigo-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Story Script Generator
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Transform your raw ideas into compelling video scripts
          </p>
        </div>

        {/* Two Column Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Left Column - Input */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Ideas</h2>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="• Spontaneous Goa trip with Priya&#10;• Planned Dudhsagar Falls&#10;• Got lost near Mollem&#10;• Found Netravali bubbling lake"
              className="w-full h-80 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors resize-none font-mono text-sm"
            />
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Script
                </>
              )}
            </button>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Right Column - Output */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Your Script</h2>
              {script && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="h-80 overflow-y-auto border-2 border-gray-200 rounded-lg">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <Loader className="w-12 h-12 animate-spin mb-4" />
                  <p>Crafting your script...</p>
                </div>
              ) : script ? (
                <div className="p-4 bg-gray-50">
                  <pre className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed font-sans">
                    {script}
                  </pre>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <Sparkles className="w-12 h-12 mb-4" />
                  <p>Your generated script will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Framework Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            The 6 Principles of Compelling Storytelling
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-indigo-50 rounded-lg">
              <h4 className="font-bold text-indigo-900 mb-2">1. Hook</h4>
              <p className="text-sm text-gray-700">
                Grab attention in the first 3 seconds with a compelling question or statement
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-bold text-purple-900 mb-2">2. Context</h4>
              <p className="text-sm text-gray-700">
                Set the scene and establish the 'why' behind your story
              </p>
            </div>
            <div className="p-4 bg-pink-50 rounded-lg">
              <h4 className="font-bold text-pink-900 mb-2">3. Conflict</h4>
              <p className="text-sm text-gray-700">
                Introduce the challenge, problem, or unexpected twist
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-bold text-blue-900 mb-2">4. Climax</h4>
              <p className="text-sm text-gray-700">
                Build to the turning point or most intense moment
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-bold text-green-900 mb-2">5. Resolution</h4>
              <p className="text-sm text-gray-700">
                Show how the conflict was resolved and lessons learned
              </p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <h4 className="font-bold text-amber-900 mb-2">6. Call-to-Action</h4>
              <p className="text-sm text-gray-700">
                End with a clear next step or thought-provoking message
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500 text-sm">
        <p>Powered by AI &amp; Built with React + Vite</p>
      </footer>
    </div>
  )
}

export default App
