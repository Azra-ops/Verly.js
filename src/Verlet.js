class Verlet {
  constructor(iterations) {
    this.entities = [];
    this.iterations = iterations;
    this.draggedPoint = null;

    this.mouseDown = false;
    this.mouse = new Vector();
    canvas.addEventListener('mousedown', () => {
      this.mouseDown = true;
      this.draggedPoint = this.getNearestPoint();
      if (this.draggedPoint) {
        this.dragPoint();
      }
    })
    canvas.addEventListener('mouseup', () => {
      this.mouseDown = false;
      this.draggedPoint = null;
    })
    canvas.addEventListener('mousemove', (e) => {
      this.mouse.setXY(e.offsetX, e.offsetY);
    })
  }

  joinEntities(...args) {
    let mixEntity = new Entity();

    let points = [];
    let sticks = [];
    for (let i = 0; i < args.length; i++) {
      points.push(args[i].points);
      sticks.push(args[i].sticks);
      let index = this.entities.indexOf(args[i]);
      this.entities.splice(index, 1);
    }
    
    points = [].concat.apply([], points);
    sticks = [].concat.apply([], sticks);

    mixEntity.points = points;
    mixEntity.sticks = sticks;

    this.addEntity(mixEntity);
    console.log(this)
    return mixEntity;
  }

  addEntity(e) {
    this.entities.push(e);
  }

  getNearestPoint() {
    // if (!this.mouseDown) return false;
    let d = 20;
    let p = null;
    for (let k = 0; k < this.entities.length; k++) {
      for (let i = 0; i < this.entities[k].points.length; i++) {
        let dist = this.entities[k].points[i].pos.dist(this.mouse);
        if (dist < d) {
          p = this.entities[k].points[i];
        }
      }
    }
    return p;
  }

  dragPoint() {
    this.draggedPoint.pos.setXY(this.mouse.x, this.mouse.y)
  }

  renderDraggedPoint(point) {
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.arc(point.pos.x, point.pos.y, point.radius*1.5, 0, Math.PI*2);
    ctx.stroke();
    ctx.closePath();
  }


  renderPointIndex() {
    for (let i = 0; i < this.entities.length; i++) {
      this.entities[i].renderPointsIndex();      
    }
  }
  update() {
    for (let i = 0; i < this.entities.length; i++) {
      this.entities[i].update();
    }

    let nearp = this.getNearestPoint();
    nearp && this.renderDraggedPoint(nearp);
    if (this.draggedPoint) {
      this.renderDraggedPoint(this.draggedPoint);
      this.dragPoint();
    }
  }





  createBox(x, y, w, h) {
    const box = new Entity();
    box.addPoint(x, y, 0, 0);
    box.addPoint(x + w, y, 0, 0);
    box.addPoint(x + w, y + h, 0, 0);
    box.addPoint(x, y + h, 0, 0);
    box.addStick(new Stick(box.points[0], box.points[1]))
    box.addStick(new Stick(box.points[1], box.points[2]))
    box.addStick(new Stick(box.points[2], box.points[3]))
    box.addStick(new Stick(box.points[3], box.points[0]))
    box.addStick(new Stick(box.points[3], box.points[1]))

    this.addEntity(box);
    return box;
  }

  createHexagon(x, y, segments, stride1 = 1, stride2 = 5) {
    const hexagon = new Entity(5);

    var stride = (2 * Math.PI) / segments;
    let radius = 50;

    // points
    for (let i = 0; i < segments; ++i) {
      var theta = i * stride;
      hexagon.addPoint(
        x + Math.cos(theta) * radius,
        y + Math.sin(theta) * radius,
        0, 0
      );
    }

    let center = hexagon.addPoint(x, y, 0, 0);

    // sticks
    for (let i = 0; i < segments; ++i) {
      hexagon.addStick(new Stick(hexagon.points[i], hexagon.points[(i + stride1) % segments]));
      hexagon.addStick(new Stick(hexagon.points[i], center));
      hexagon.addStick(new Stick(hexagon.points[i], hexagon.points[(i + stride2) % segments]));
    }


    this.addEntity(hexagon);
    return hexagon;
  }


  createCloth(posx, posy, w, h, segments, pinOffset, iterations) {
    let cloth = new Entity(iterations);

    var xStride = w / segments;
    var yStride = h / segments;

    var x, y;
    for (y = 0; y < segments; ++y) {
      for (x = 0; x < segments; ++x) {
        var px = posx + x * xStride - w / 2 + xStride / 2;
        var py = posy + y * yStride - h / 2 + yStride / 2;
        cloth.addPoint(px, py, 0, 0);

        if (x > 0) {
          cloth.addStick(new Stick(cloth.points[y * segments + x], cloth.points[y * segments + x - 1]));
        }

        if (y > 0) {
          cloth.addStick(new Stick(cloth.points[y * segments + x], cloth.points[(y - 1) * segments + x]));
        }
      }
    }

    for (x = 0; x < segments; ++x) {
      if (x % pinOffset == 0) {
        cloth.pin(x);
      }
    }

    this.addEntity(cloth);
    return cloth;
  }


  createRope(x, y, segments = 10, gap = 15) {
    let rope = new Entity();

    for (let i = 0; i < segments; i++) {
      rope.addPoint(x + i * gap, y, 0, 0)
    }

    for (let i = 0; i < segments - 1; i++) {
      rope.addStick(new Stick(rope.points[i], rope.points[(i + 1) % segments]));
    }
    this.addEntity(rope);
    return rope;
  }
}