import utils from "../node_modules/decentraland-ecs-utils/index"
import { Sound } from "./sound"
import { Mirror } from "./mirror"
import { ReflectedRay } from "./reflectedRay"

// Sounds
const mirrorMoveSound = new Sound(new AudioClip("sounds/mirrorMove.mp3"), false)

// Base
const base = new Entity()
base.addComponent(new GLTFShape("models/baseCheckered.glb"))
engine.addEntity(base)

// Boundaries
const boundaries = new Entity()
boundaries.addComponent(new GLTFShape("models/boundaries.glb"))
engine.addEntity(boundaries)

// Blocked coordinates
const blocked: Vector3[] = [
  new Vector3(1.5, 0, 14.5),
  new Vector3(2.5, 0, 14.5),
  new Vector3(3.5, 0, 14.5),
  new Vector3(4.5, 0, 14.5),
  new Vector3(5.5, 0, 14.5),
  new Vector3(6.5, 0, 14.5),
  new Vector3(7.5, 0, 14.5),
  new Vector3(8.5, 0, 14.5),
  new Vector3(9.5, 0, 14.5),
  new Vector3(10.5, 0, 14.5),
  new Vector3(11.5, 0, 14.5),
  new Vector3(11.5, 0, 15.5),
  new Vector3(11.5, 0, 16.5),
  new Vector3(11.5, 0, 17.5),
  new Vector3(10.5, 0, 17.5),
  new Vector3(9.5, 0, 17.5),
  new Vector3(8.5, 0, 17.5),
  new Vector3(7.5, 0, 17.5),
  new Vector3(6.5, 0, 17.5),
  new Vector3(5.5, 0, 17.5),
  new Vector3(4.5, 0, 17.5),
  new Vector3(3.5, 0, 17.5),
  new Vector3(2.5, 0, 17.5),
  new Vector3(1.5, 0, 17.5),
]

// Mirrors
//#region
const mirrorSelectorShape = new GLTFShape("models/mirrorSelector.glb")
// Workaround: colliders have been scaled up as the raycasting is happening above the player's head
const mirrorShape = new GLTFShape("models/mirrorScaledColliders.glb")
const mirrors: Mirror[] = []

const mirrorA = new Mirror(mirrorSelectorShape, mirrorShape, new Transform({ position: new Vector3(2.5, 0, 7.5) }))
mirrors.push(mirrorA)

const mirrorB = new Mirror(mirrorSelectorShape, mirrorShape, new Transform({ position: new Vector3(8.5, 0, 11.5) }))
mirrors.push(mirrorB)

const mirrorC = new Mirror(mirrorSelectorShape, mirrorShape, new Transform({ position: new Vector3(8.5, 0, 20.5) }))
mirrors.push(mirrorC)

const mirrorD = new Mirror(mirrorSelectorShape, mirrorShape, new Transform({ position: new Vector3(2.5, 0, 24.5) }))
mirrors.push(mirrorD)
//#endregion

// Instance the input object
const input = Input.instance
const MAX_DISTANCE = 4

// Delay dummy entity for running mirror transform transitions
const delayDummyEntity = new Entity()
engine.addEntity(delayDummyEntity)

// Button down events
input.subscribe("BUTTON_DOWN", ActionButton.POINTER, true, (e) => {
  if (e.hit.meshName == "mirrorSelector_collider") {
    let mirrorStand = engine.entities[e.hit.entityId]
    let mirrorStandPos = mirrorStand.getComponent(Transform).position
    let distance = Vector3.Distance(mirrorStandPos, Camera.instance.position)

    if (distance < MAX_DISTANCE) {
      let currentPos = mirrorStand.getComponent(Transform).position
      let endPos = currentPos.subtract(e.hit.normal)

      // Checks if at least one mirror in the array is blocking its path
      let mirrorOverlap = mirrors.some((mirror) => {
        return endPos.equals(mirror.getComponent(Transform).position)
      })
      let isBlocked = blocked.some((block) => {
        return endPos.equals(block)
      })

      // Check boundaries
      if (endPos.x >= 1 && endPos.x <= 15 && endPos.z >= 1 && endPos.z <= 31 && !mirrorOverlap && !isBlocked) {
        // Slide the mirror to its endPos over half a second
        if (!mirrorStand.hasComponent(utils.MoveTransformComponent)) {
          mirrorMoveSound.getComponent(AudioSource).playOnce()
          mirrorStand.addComponent(
            new utils.MoveTransformComponent(currentPos, endPos, 0.5, () => {
              delayDummyEntity.addComponentOrReplace(
                new utils.Delay(100, () => {
                  redrawRays() // Redraw
                })
              )
            })
          )
        }
      }
    }
  }
})

input.subscribe("BUTTON_DOWN", ActionButton.PRIMARY, true, (e) => {
  if (e.hit.meshName == "mirrorSelector_collider") {
    let mirrorStand = engine.entities[e.hit.entityId] as Mirror
    let mirrorStandPos = mirrorStand.getComponent(Transform).position
    let distance = Vector3.Distance(mirrorStandPos, Camera.instance.position)

    if (distance < MAX_DISTANCE) {
      rotateMirror(mirrorStand, 45)
    }
  }
})

input.subscribe("BUTTON_DOWN", ActionButton.SECONDARY, true, (e) => {
  if (e.hit.meshName == "mirrorSelector_collider") {
    let mirrorStand = engine.entities[e.hit.entityId] as Mirror
    let mirrorStandPos = mirrorStand.getComponent(Transform).position
    let distance = Vector3.Distance(mirrorStandPos, Camera.instance.position)

    if (distance < MAX_DISTANCE) {
      rotateMirror(mirrorStand, -45)
    }
  }
})

function rotateMirror(mirrorStand: Mirror, rotateAngle: number) {
  let mirror = mirrorStand.getMirror()

  if (!mirror.hasComponent(utils.RotateTransformComponent)) {
    let currentRot = mirror.getComponent(Transform).rotation
    let endRot = Quaternion.Euler(0, (mirrorStand.rotation += rotateAngle), 0)
    mirrorMoveSound.getComponent(AudioSource).playOnce()
    mirror.addComponent(
      new utils.RotateTransformComponent(currentRot, endRot, 0.5, () => {
        delayDummyEntity.addComponentOrReplace(
          new utils.Delay(100, () => {
            redrawRays() // Redraw
          })
        )
      })
    )
  }
}

// Ray
const rayEmitter = new Entity()
rayEmitter.addComponent(new GLTFShape("models/rayEmitter.glb"))
rayEmitter.addComponent(new Transform({ position: new Vector3(2.5, 0, 2.5) }))
engine.addEntity(rayEmitter)

const rayTarget = new Entity()
rayTarget.addComponent(new GLTFShape("models/rayTarget.glb"))
rayTarget.addComponent(new Transform({ position: new Vector3(2.5, 0, 31.5) }))
engine.addEntity(rayTarget)

let physicsCast = PhysicsCast.instance
let reflectedRays: ReflectedRay[] = [] // Store reflected rays

// Ray emitter
let originPos = new Vector3(2.5, 4.5, 2.5)
let direction = Vector3.Forward()

let ray: Ray = {
  origin: originPos,
  direction: direction,
  distance: 100,
}
const rayShape = new GLTFShape("models/rayOffsetY.glb") // Workaround: offset in y to avoid affecting the raycasting hitting player
const sourceRay = new ReflectedRay(rayShape, originPos, direction)

function redrawRays(): void {
  physicsCast.hitFirst(ray, (e) => {
    // Delete previous ray models
    while (reflectedRays.length > 0) {
      let ray = reflectedRays.pop()
      engine.removeEntity(ray)
    }
    // Workaround: for when the ray hits a blank collider when the scene loads
    if (e.entity.meshName == "") {
      redrawRays()
      return
    }
    if (e.entity.meshName == "mirror_collider") {
      let reflectedVector: Vector3 = reflectVector(direction, new Vector3(e.hitNormal.x, e.hitNormal.y, e.hitNormal.z))
      reflectRay(new Vector3(e.hitPoint.x, e.hitPoint.y, e.hitPoint.z), reflectedVector)
    }
    let distance = Vector3.Distance(ray.origin, e.hitPoint)
    sourceRay.getComponent(Transform).scale.z = distance
  })
}

// Recursive function for reflecting a ray every time it hits a mirror
function reflectRay(hitPoint: Vector3, reflectedVector: Vector3): void {
  const reflectedRay = new ReflectedRay(rayShape, hitPoint, reflectedVector)
  reflectedRay.getComponent(Transform).position = hitPoint
  let reflectedTarget = hitPoint.clone().add(reflectedVector)
  reflectedRay.getComponent(Transform).lookAt(reflectedTarget)
  reflectedRays.push(reflectedRay)

  physicsCast.hitFirst(reflectedRay.ray, (event) => {
    let distance = Vector3.Distance(reflectedRay.ray.origin, event.hitPoint)
    reflectedRay.getComponent(Transform).scale.z = distance

    if (event.entity.meshName == "mirror_collider") {
      let reflectedVector: Vector3 = reflectVector(
        new Vector3(reflectedRay.ray.direction.x, reflectedRay.ray.direction.y, reflectedRay.ray.direction.z),
        new Vector3(event.hitNormal.x, event.hitNormal.y, event.hitNormal.z)
      )
      reflectRay(new Vector3(event.hitPoint.x, event.hitPoint.y, event.hitPoint.z), reflectedVector)
    } else if (event.entity.meshName == "rayTarget_collider") log("You win") // Win condition
  })
}

// Put in the direction of the previous ray and the normal of the raycast's hitpoint
function reflectVector(incident: Vector3, normal: Vector3): Vector3 {
  let dot = 2 * Vector3.Dot(incident, normal)
  let reflected = incident.subtract(normal.multiplyByFloats(dot, dot, dot))
  return reflected
}

redrawRays()
