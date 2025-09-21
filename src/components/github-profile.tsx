/** biome-ignore-all lint/performance/noImgElement: as-is */
import type { GetResponseTypeFromEndpointMethod } from '@octokit/types'
import type { github } from '@/lib/octokit'

export type GithubUser = GetResponseTypeFromEndpointMethod<
  typeof github.users.getByUsername
>['data']

interface GithubProfileProps {
  user: GithubUser
}

export function GithubProfile({ user }: GithubProfileProps) {
  return (
    <div className="bg-zinc-950 rounded-lg flex gap-3 p-6">
      <img
        src={user.avatar_url}
        alt={user.name ?? ''}
        className="size-10 rounded-full"
      />

      <div className="flex flex-col gap-1">
        <span className="text-lg font-medium">{user.name || user.login}</span>
        <p className="text-sm text-zinc-400 leading-relaxed">
          {user.bio || 'Sem bio disponível'}
        </p>
      </div>
    </div>
  )
}
