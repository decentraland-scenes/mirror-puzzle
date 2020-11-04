import utils from "../node_modules/decentraland-ecs-utils/index"
import { Mirror } from "./mirror"
import { redrawRays } from "./reflectedRay"


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
    let mirrorStand = engine.entities[e.hit.entityId] as Mirror
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
          mirrorStand.moveMirror(currentPos, endPos)
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
      mirrorStand.rotateMirror(45)
    }
  }
})

input.subscribe("BUTTON_DOWN", ActionButton.SECONDARY, true, (e) => {
  if (e.hit.meshName == "mirrorSelector_collider") {
    let mirrorStand = engine.entities[e.hit.entityId] as Mirror
    let mirrorStandPos = mirrorStand.getComponent(Transform).position
    let distance = Vector3.Distance(mirrorStandPos, Camera.instance.position)

    if (distance < MAX_DISTANCE) {
      mirrorStand.rotateMirror(-45)
    }
  }
})

redrawRays()