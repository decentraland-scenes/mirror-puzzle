export class ReflectedRay extends Entity {

  public ray: Ray

  constructor(model: GLTFShape, origin: Vector3, direction: Vector3) {
    super()
    engine.addEntity(this)
    this.addComponent(model)
    this.addComponent(new Transform({ position: origin.clone()}))

    this.ray = {
      origin: origin,
      direction: direction,
      distance: 100,
    }
  }
}