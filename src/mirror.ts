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

  getMirror(): Entity {
    return this.mirror
  }
}
