import { Rectangle, SpatialHash, SpatialHashObject } from "./spatial-hash";

function sfc32(a: number, b: number, c: number, d: number): () => number {
    return function() {
      a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
      var t = (a + b) | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = (c << 21 | c >>> 11);
      d = d + 1 | 0;
      t = t + d | 0;
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    }
}

class Sticker implements SpatialHashObject {
    hash: number
    level: number
    
    private bounds: Rectangle 
    constructor (public x: number, public y: number, 
        public width: number, public height: number,
        public color: any, private renderer: SpatialHashRenderer) {
        this.bounds = new Rectangle()
    }

    getBoundingBox(): Rectangle {
        this.bounds.x = this.x
        this.bounds.y = this.y
        this.bounds.width = this.width
        this.bounds.height = this.height

        if (this.bounds.width < 0) {
            this.bounds.width = -this.bounds.width
            this.bounds.x += this.bounds.width
        }

        if (this.bounds.height < 0) {
            this.bounds.height = -this.bounds.height
            this.bounds.y += this.bounds.height
        }

        return this.bounds
    }

    getColorStr(): string {
        const selected = this.renderer.selectedObjects.includes(this)
        return selected ? 'rgba(255, 0, 0, 0.5)' : `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.25)`
    }
}

interface SpatialHashRendererProps {
    canvas: HTMLCanvasElement
}

export class SpatialHashRenderer {
    private mouseX: number
    private mouseY: number

    private canvas: HTMLCanvasElement
    private context: CanvasRenderingContext2D

    public selectedObjects: SpatialHashObject[] = []
    private sh = new SpatialHash()
    private objects: Sticker[] = []
    private random = sfc32(0xDEADC0DE, 0xC3C3C3C3, 0xBEEFCAFE, 0xBAAAAAAD)

    private rafHandle: number

    private tickBind = this.tick.bind(this)

    constructor (props: SpatialHashRendererProps) {
        this.canvas = props.canvas
        this.context = this.canvas.getContext('2d')

        this.init()
    }

    private init() {
        const { canvas, objects, sh } = this

        canvas.width = canvas.clientWidth * devicePixelRatio
        canvas.height = canvas.clientHeight * devicePixelRatio

        // debugger

        for (let i = 0; i < 15000; i++) {
            this.addRandomObj()
        }

        this.canvas.onmousemove = e => {
            this.mouseX = e.clientX * devicePixelRatio
            this.mouseY = e.clientY * devicePixelRatio
        }

        this.rafHandle = requestAnimationFrame(this.tickBind)
    }

    private randomRange(min: number, max: number): number {
        return min + this.random() * (max - min)
    }

    private draw() {
        const { canvas, context, objects, sh } = this

        context.fillStyle = 'black'
        context.fillRect(0, 0, canvas.width, canvas.height)
    
        for (const obj of objects) {
            const bounds = obj.getBoundingBox()
            context.fillStyle = obj.getColorStr()
            context.fillRect(bounds.x, bounds.y, bounds.width, bounds.height)
        }
    }

    private changeObjects() {
        for (const obj of this.objects) {
            obj.x += this.randomRange(-30, 30)
            obj.y += this.randomRange(-30, 30)
            obj.width += this.randomRange(-30, 30)
            obj.height += this.randomRange(-30, 30)
        }
    }

    private updateSH() {
        console.time('update objects (15k)')
        for (const obj of this.objects) {
            this.sh.updateObject(obj)
        } 
        console.timeEnd('update objects (15k)')
    }

    private checkIntersections() {
        console.time('query')
        this.selectedObjects = this.sh.query(this.mouseX, this.mouseY)
        console.timeEnd('query')
    }

    private addRandomObj() {
        const canvas = this.canvas

        const width = this.randomRange(5, 100)
        const height = this.randomRange(5, 100)
    
        const x = this.randomRange(canvas.width * -15.02, canvas.width * 0.98 - width)
        const y = this.randomRange(canvas.height * -15.02, canvas.height * 0.98 - height)
    
        const color = {
            r: this.randomRange(0, 63),
            g: this.randomRange(127, 255),
            b: this.randomRange(127, 255)
        }
    
        const sticker = new Sticker(x, y, width, height, color, this)
        this.objects.push(sticker)

        console.time('add object')
        this.sh.addObject(sticker)
        console.timeEnd('add object')
    }
    
    private doRandomAddAndRemove() {
        for (let i = 0; i < 100; i++) {
            const index = Math.trunc(this.randomRange(0, this.objects.length - 1))
            const obj = this.objects[index]
            this.objects.splice(index, 1)

            console.time('remove object')
            this.sh.removeObject(obj)
            console.timeEnd('remove object')

            this.addRandomObj()
        }
    }

    timer = 0

    private tick() {
        if (this.timer < 300) {
            this.changeObjects()    
            this.timer++
        }
        this.updateSH()
        // this.doRandomAddAndRemove()
        this.checkIntersections()

        console.log('density: ' + Math.round(this.objects.length / this.sh.hashtable.size))
        console.log('levels count: ' + this.sh.levels.size)

        this.draw()

        this.rafHandle = requestAnimationFrame(this.tickBind)
    }

    destroy () {
        if (this.rafHandle) {
            cancelAnimationFrame(this.rafHandle)
            delete this.rafHandle
        }
        this.canvas.onmousemove = null
    }
}