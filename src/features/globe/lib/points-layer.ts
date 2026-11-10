import { BufferAttribute, BufferGeometry, Points, PointsMaterial } from 'three'
export function createPointsLayer(capacity: number) {
  const geometry = new BufferGeometry()
  const position = new BufferAttribute(new Float32Array(capacity * 3), 3)
  const color = new BufferAttribute(new Float32Array(capacity * 3), 3)
  geometry.setAttribute('position', position)
  geometry.setAttribute('color', color)
  geometry.setDrawRange(0, 0)
  return {
    position,
    color,
    points: new Points(
      geometry,
      new PointsMaterial({
        size: 0.8,
        transparent: true,
        opacity: 0.85,
        vertexColors: true,
        sizeAttenuation: true,
      }),
    ),
  }
}
export function fillPositions(
  position: BufferAttribute,
  input: Float32Array,
  coords: (
    lat: number,
    lng: number,
    alt: number,
  ) => { x: number; y: number; z: number },
  onValid?: (source: number, target: number) => void,
) {
  let count = 0
  for (let i = 0; i < input.length / 3 && count < position.count; i++) {
    const lat = input[i * 3],
      lng = input[i * 3 + 1],
      alt = input[i * 3 + 2]
    if (
      lat === undefined ||
      lng === undefined ||
      alt === undefined ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      !Number.isFinite(alt)
    )
      continue
    const p = coords(lat, lng, alt / 6371)
    position.setXYZ(count, p.x, p.y, p.z)
    onValid?.(i, count)
    count++
  }
  position.needsUpdate = true
  return count
}
