import { Sound } from "./sound"
import { redrawRays } from "./reflectedRay"
import utils from "../node_modules/decentraland-ecs-utils/index"

// Sounds
const mirrorMoveSound = new Sound(new AudioClip("sounds/mirrorMove.mp3"), false)

export class Mirror extends Entity {
  public rotation: number = 0 // Workaround to rotation bug
  public mirror: Entity = new Entity()

  constructor(collider: GLTFShape, mirrorModel: GLTFShape, transform: Transform) {
    super()
    engine.addEntity(this)
    this.addComponent(collider)
    this.addComponent(transform)
    this.mirror.addComponent(mirrorModel)
    this.mirror.addComponent(new Transform())
    this.mirror.setParent(this)
  }

  rotateMirror(rotateAngle: number): void {
    // Rotate the mirror to its endPot over half a second
    if (!this.mirror.hasComponent(utils.RotateTransformComponent)) {
      let currentRot = this.mirror.getComponent(Transform).rotation
      let endRot = Quaternion.Euler(0, (this.rotation += rotateAngle), 0)
      mirrorMoveSound.getComponent(AudioSource).playOnce()
      this.mirror.addComponent(
        new utils.RotateTransformComponent(currentRot, endRot, 0.5, () => {
          this.addComponentOrReplace(
            new utils.Delay(100, () => {
              redrawRays() // Redraw
            })
          )
        })
      )
    }
  }

  moveMirror(currentPos: Vector3, endPos: Vector3): void {
    // Slide the mirror to its endPos over half a second
    if (!this.hasComponent(utils.MoveTransformComponent)) {
      mirrorMoveSound.getComponent(AudioSource).playOnce()
      this.addComponent(
        new utils.MoveTransformComponent(currentPos, endPos, 0.5, () => {
          this.addComponentOrReplace(
            new utils.Delay(100, () => {
              redrawRays() // Redraw
            })
          )
        })
      )
    }
  }
}
