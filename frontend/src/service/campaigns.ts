export type Campaign = {
  id: string
  name: string
  description: string | null
  coverImage: string | null
  isActive: boolean
  nextSession: {
    scheduledAt: string
  } | null
}

export async function getCampaigns(): Promise<Campaign[]> {
  const token = localStorage.getItem("token") // ou onde você salva

  const response = await fetch("http://localhost:8081/campaigns", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Erro ao buscar campanhas")
  }

  const data = await response.json()

  return data.campaigns
}