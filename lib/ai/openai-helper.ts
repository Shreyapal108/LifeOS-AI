import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateInsights(userBehavior: {
  goalsData: unknown
  habitsData: unknown
  expensesData: unknown
  productivityData: unknown
}) {
  try {
    const message = await client.messages.create({
      model: 'gpt-4-turbo-preview',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Based on this user behavior data, provide 3 actionable insights for life optimization:
          
          ${JSON.stringify(userBehavior, null, 2)}
          
          Format the response as a JSON array with objects containing: title, content, actionType (recommendation|burnout_alert|prediction), and suggestedActions (array).`,
        },
      ],
    })

    if (message.content[0].type === 'text') {
      return JSON.parse(message.content[0].text)
    }
  } catch (error) {
    console.error('Error generating insights:', error)
    throw error
  }
}

export async function predictGoalCompletion(goalData: {
  title: string
  progress: number
  daysRemaining: number
  historicalData: unknown
}) {
  try {
    const message = await client.messages.create({
      model: 'gpt-4-turbo-preview',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `Based on this goal data, predict the likelihood of completion (0-100%) and provide a brief explanation:
          
          ${JSON.stringify(goalData, null, 2)}
          
          Format as JSON: { probability: number, explanation: string, suggestions: string[] }`,
        },
      ],
    })

    if (message.content[0].type === 'text') {
      return JSON.parse(message.content[0].text)
    }
  } catch (error) {
    console.error('Error predicting goal:', error)
    throw error
  }
}

export async function detectBurnoutRisk(userMetrics: {
  productivityTrend: number[]
  sleepPattern: number[]
  stressIndicators: number[]
  activityFrequency: number
}) {
  try {
    const message = await client.messages.create({
      model: 'gpt-4-turbo-preview',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `Analyze these metrics and determine burnout risk level (low|medium|high):
          
          ${JSON.stringify(userMetrics, null, 2)}
          
          Format as JSON: { riskLevel: string, score: number, warning: string, recommendations: string[] }`,
        },
      ],
    })

    if (message.content[0].type === 'text') {
      return JSON.parse(message.content[0].text)
    }
  } catch (error) {
    console.error('Error detecting burnout:', error)
    throw error
  }
}

export async function generatePersonalizedRecommendation(context: {
  userGoals: string[]
  failedPatterns: string[]
  successPatterns: string[]
  availableTime: number
}) {
  try {
    const message = await client.messages.create({
      model: 'gpt-4-turbo-preview',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `Based on this user context, provide a personalized recommendation for improving their life:
          
          ${JSON.stringify(context, null, 2)}
          
          Format as JSON: { title: string, description: string, actionItems: string[], expectedImpact: string }`,
        },
      ],
    })

    if (message.content[0].type === 'text') {
      return JSON.parse(message.content[0].text)
    }
  } catch (error) {
    console.error('Error generating recommendation:', error)
    throw error
  }
}
