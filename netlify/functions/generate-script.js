// Netlify Serverless Function for generating storytelling scripts
// Integrates with Claude API (Anthropic) for AI-powered script generation

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  }

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const { input, systemPrompt } = JSON.parse(event.body)

    // Validate input
    if (!input) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required field: input' })
      }
    }

    // Check for API key
    const apiKey = process.env.CLAUDE_API_KEY
    if (!apiKey) {
      console.error('CLAUDE_API_KEY environment variable is not set')
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Server configuration error: Missing API key' })
      }
    }

    // Call Claude API
    console.log('Calling Claude API to generate script...')

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: `${systemPrompt || 'You are a storytelling scriptwriter. Create a compelling 30-60 second video script from the following ideas.'}\n\nRaw Input:\n${input}`
          }
        ]
      })
    })

    // Check if Claude API call was successful
    if (!claudeResponse.ok) {
      const errorData = await claudeResponse.json().catch(() => ({}))
      console.error('Claude API error:', claudeResponse.status, errorData)

      return {
        statusCode: claudeResponse.status,
        headers,
        body: JSON.stringify({
          error: `Claude API error: ${errorData.error?.message || 'Failed to generate script'}`
        })
      }
    }

    const data = await claudeResponse.json()

    // Extract the generated script from Claude's response
    const script = data.content?.[0]?.text

    if (!script) {
      console.error('No script text in Claude response:', data)
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to extract script from AI response' })
      }
    }

    console.log('Script generated successfully')

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        script,
        metadata: {
          generatedAt: new Date().toISOString(),
          model: 'claude-sonnet-4-5-20250929',
          tokensUsed: data.usage
        }
      })
    }
  } catch (error) {
    console.error('Error generating script:', error.message)
    console.error('Error stack:', error.stack)

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to generate script. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
}
