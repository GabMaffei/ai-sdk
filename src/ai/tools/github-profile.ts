import { tool } from 'ai'
import z from 'zod'
import { github } from '@/lib/octokit'

export const githubProfile = tool({
  description: `
          Fetch detailed public information for a GitHub user by username, returning all main profile fields and API URLs.  
          - **Purpose:** Retrieve full profile details for a given GitHub username via GitHub's REST API.  
          - **Input Parameter:** \`username\` (string). Example: "diego3g".  
            The username must match the user's actual GitHub profile.  
          - **What to Look For:**  
            The response includes many fields—**the most important for further lookups is \`organizations_url\`**  
            (e.g., "https://api.github.com/users/diego3g/orgs").  
            This URL is needed to fetch all organizations the user belongs to.
          - **Expected Output:**  
            JSON object, with typical fields:  
              - \`login\`: Username (e.g. "diego3g")  
              - \`name\`: Display name (e.g. "Diego Fernandes")  
              - \`bio\`, \`location\`, \`public_repos\`, etc.  
              - **\`organizations_url\`**: API endpoint to query user's organizations  
              - others: \`avatar_url\`, \`followers\`, etc.
          - **Example Request:**  
              { "username": "diego3g" }
          - **Example Response:**  
              {
                "login": "diego3g",
                "public_repos": 74,
                "avatar_url": "...",
                "organizations_url": "https://api.github.com/users/diego3g/orgs",
                ... // all default GitHub user fields
              }
          - **Best Practices:**  
            - Always extract the exact value of \`organizations_url\` from the response;
              never manually build this URL.
            - Always extract the exact value of all urls from the response; never manually build these URLs.
            - Validate that 'username' is correctly spelled and exists on GitHub for best results.
          - **Response Format:**  
            Always a JSON object representing the user's profile (see [GitHub REST API docs](https://docs.github.com/en/rest/users/users?apiVersion=2022-11-28#get-a-user)).
        `.replace(/^\s+/gm, ''),
  inputSchema: z.object({
    username: z.string().describe(
      `
            The GitHub username to look up. 
            - Must be a non-empty string matching GitHub's username rules.
            - Example: "GabMaffei"
            - Usage:
                Input: { "username": "octocat" }
                Result: JSON object with fields like "login", "public_repos", etc.
            - Extract \`organizations_url\` from the result for organization lookups.
            - Tip: Double-check the username before submitting the request to avoid common errors.
          `.replace(/^\s+/gm, '')
    ),
  }),
  execute: async ({ username }: { username: string }) => {
    const response = await github.users.getByUsername({ username })
    const data = response.data

    return {
      login: data.login,
      name: data.name,
      bio: data.bio,
      avatar_url: data.avatar_url,
      public_repos: data.public_repos,
      followers: data.followers,
      following: data.following,
    }
  },
})
