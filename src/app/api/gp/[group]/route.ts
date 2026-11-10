import { GROUP_ORDER } from '@/lib/propagation/types'
import { getGpGroup } from '@/features/satellites/api/provider'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ group: string }> },
) {
  const { group } = await params
  const allowed = GROUP_ORDER.find((item) => item === group)
  if (!allowed)
    return Response.json({ error: 'Unknown group' }, { status: 404 })
  try {
    return Response.json(await getGpGroup(allowed), {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch {
    return Response.json(
      { error: 'Catalog data is unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
