export class ReflectedRay extends Entity {
  public ray: Ray

  constructor(model: GLTFShape, origin: Vector3, direction: Vector3) {
    super()
    engine.addEntity(this)
    this.addComponent(model)
    this.addComponent(new Transform({ position: origin.clone() }))

    this.ray = {
      origin: origin,
      direction: direction,
      distance: 100
    }
  }
}

// Ray
const rayEmitter = new Entity()
rayEmitter.addComponent(new GLTFShape('models/rayEmitter.glb'))
rayEmitter.addComponent(new Transform({ position: new Vector3(2.5, 0, 2.5) }))
engine.addEntity(rayEmitter)

const rayTarget = new Entity()
rayTarget.addComponent(new GLTFShape('models/rayTarget.glb'))
rayTarget.addComponent(new Transform({ position: new Vector3(2.5, 0, 31.5) }))
engine.addEntity(rayTarget)

// Ray emitter
const originPos = new Vector3(2.5, 4.5, 2.5)
const direction = Vector3.Forward()

const ray: Ray = {
  origin: originPos,
  direction: direction,
  distance: 100
}
const rayShape = new GLTFShape('models/rayOffsetY.glb') // Workaround: offset in y to avoid affecting the raycasting hitting player
const sourceRay = new ReflectedRay(rayShape, originPos, direction)

const physicsCast = PhysicsCast.instance
const reflectedRays: ReflectedRay[] = [] // Store reflected rays

export function redrawRays(): void {
  physicsCast.hitFirst(ray, (e) => {
    // Delete previous ray models
    while (reflectedRays.length > 0) {
      const ray = reflectedRays.pop()
      engine.removeEntity(ray)
    }
    // Workaround: for when the ray hits a blank collider when the scene loads
    if (e.entity.meshName === '') {
      redrawRays()
      return
    }
    if (e.entity.meshName === 'mirror_collider') {
      const reflectedVector: Vector3 = reflectVector(
        direction,
        new Vector3(e.hitNormal.x, e.hitNormal.y, e.hitNormal.z)
      )
      reflectRay(
        new Vector3(e.hitPoint.x, e.hitPoint.y, e.hitPoint.z),
        reflectedVector
      )
    }
    const distance = Vector3.Distance(ray.origin, e.hitPoint)
    sourceRay.getComponent(Transform).scale.z = distance
  })
}

// Recursive function for reflecting a ray every time it hits a mirror
function reflectRay(hitPoint: Vector3, reflectedVector: Vector3): void {
  const reflectedRay = new ReflectedRay(rayShape, hitPoint, reflectedVector)
  reflectedRay.getComponent(Transform).position = hitPoint
  const reflectedTarget = hitPoint.clone().add(reflectedVector)
  reflectedRay.getComponent(Transform).lookAt(reflectedTarget)
  reflectedRays.push(reflectedRay)

  physicsCast.hitFirst(reflectedRay.ray, (event) => {
    const distance = Vector3.Distance(reflectedRay.ray.origin, event.hitPoint)
    reflectedRay.getComponent(Transform).scale.z = distance

    if (event.entity.meshName === 'mirror_collider') {
      const reflectedVector: Vector3 = reflectVector(
        new Vector3(
          reflectedRay.ray.direction.x,
          reflectedRay.ray.direction.y,
          reflectedRay.ray.direction.z
        ),
        new Vector3(event.hitNormal.x, event.hitNormal.y, event.hitNormal.z)
      )
      reflectRay(
        new Vector3(event.hitPoint.x, event.hitPoint.y, event.hitPoint.z),
        reflectedVector
      )
    } else if (event.entity.meshName === 'rayTarget_collider') log('You win') // Win condition
  })
}

// Put in the direction of the previous ray and the normal of the raycast's hitpoint
function reflectVector(incident: Vector3, normal: Vector3): Vector3 {
  const dot = 2 * Vector3.Dot(incident, normal)
  const reflected = incident.subtract(normal.multiplyByFloats(dot, dot, dot))
  return reflected
}
