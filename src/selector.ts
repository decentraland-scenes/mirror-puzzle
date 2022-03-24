// Selector
const selectorHand = new Entity()
selectorHand.addComponent(new GLTFShape('models/selectorHand.glb'))
selectorHand.addComponent(new Transform())
selectorHand.getComponent(Transform).scale.setAll(0)
engine.addEntity(selectorHand)

const selectorGlow = new Entity()
selectorGlow.addComponent(new GLTFShape('models/selectorGlow.glb'))
selectorGlow.addComponent(new Transform())
selectorGlow.getComponent(Transform).scale.setAll(0)
engine.addEntity(selectorGlow)

const MAX_DISTANCE = 3
const SELECTOR_HAND_Y_OFFSET = 1.5

// System that casts the rays to generate selector
class SelectorSystem implements ISystem {
  update() {
    // Ray from camera
    const rayFromCamera = PhysicsCast.instance.getRayFromCamera(MAX_DISTANCE)

    // For the camera ray, we cast a hit all
    PhysicsCast.instance.hitFirst(rayFromCamera, (raycastHitEntity) => {
      if (raycastHitEntity.entity.meshName === 'mirrorSelector_collider') {
        const entityID = raycastHitEntity.entity.entityId
        selectorFace(engine.entities[entityID], raycastHitEntity)
      } else {
        selectorHand.getComponent(Transform).scale.setAll(0)
        selectorGlow.getComponent(Transform).scale.setAll(0)
      }
    })
  }
}

// Adds systems to the engine
engine.addSystem(new SelectorSystem())

// Snaps the hand icon to discrete points on the mirror selector
function selectorFace(entity: IEntity, raycastHitEntity: RaycastHitEntity) {
  const transform = entity.getComponent(Transform).position.clone() // Clone position of the mirror
  selectorGlow.getComponent(Transform).position = transform.clone()
  selectorGlow.getComponent(Transform).position.y = transform.y + 0.05
  selectorGlow.getComponent(Transform).scale.setAll(1)

  selectorHand.getComponent(Transform).position = transform // Set selector transform to match the mirror
  selectorHand.getComponent(Transform).position.y =
    transform.y + SELECTOR_HAND_Y_OFFSET
  selectorHand.getComponent(Transform).scale.setAll(1)

  let selectorRotation = selectorHand.getComponent(Transform).rotation
  if (raycastHitEntity.hitNormal.x > 0) {
    selectorRotation = Quaternion.Euler(0, 90, 0)
    selectorHand.getComponent(Transform).position.x = transform.x + 1 / 1.99
  } else if (raycastHitEntity.hitNormal.x < 0) {
    selectorRotation = Quaternion.Euler(0, -90, 0)
    selectorHand.getComponent(Transform).position.x = transform.x - 1 / 1.99
  }
  if (raycastHitEntity.hitNormal.z > 0) {
    selectorRotation = Quaternion.Euler(0, 0, 0)
    selectorHand.getComponent(Transform).position.z = transform.z + 1 / 1.99
  } else if (raycastHitEntity.hitNormal.z < 0) {
    selectorRotation = Quaternion.Euler(0, 180, 0)
    selectorHand.getComponent(Transform).position.z = transform.z - 1 / 1.99
  }
  selectorHand.getComponent(Transform).rotation = selectorRotation
}
