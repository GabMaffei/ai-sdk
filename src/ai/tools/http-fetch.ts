import { tool } from 'ai'
import z from 'zod'

export const fetchHTTP = tool({
  description: `
          Makes a GET request to a provided URL and returns the JSON response.  
          - **Purpose:** Fetch data from a specified API endpoint.  
          - **Input Parameter:** \`URL\` (string). A valid URL to send the GET request to.
        `.replace(/^\s+/gm, ''),
  inputSchema: z.object({
    URL: z.url().describe(
      `
            A valid API URL to fetch data from.
            Example: "https://api.github.com/users/diego3g/orgs"
            `.replace(/^\s+/gm, '')
    ),
  }),
  execute: async ({ URL }: { URL: string }) => {
    const response = await fetch(URL)
    const data = await response.json()
    return JSON.stringify(data) || null
  },
})
