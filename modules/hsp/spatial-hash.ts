// basically this is gridSize but it's the same for every subdivision level for now
// it affects how condensed cell will become
// it is maximum amount of hashtable entries that can be taken by all objects
// e.g. if we have 100 objects and M = 10 then AT BEST each cell will contain 10 objects
// in reality density of the cell depends on how much collision hash function have
// as well as if objects are overlapping in space
const M = 100000

export class Rectangle {
    x: number
    y: number
    width: number
    height: number
}

export interface SpatialHashObject {
    level: number
    hash: number
    getBoundingBox(): Rectangle
}

function testPointInBounds(x: number, y: number, b: Rectangle): boolean {
    return x < b.x + b.width && y < b.y + b.height && x >= b.x && y >= b.y
}

function djb2Hash(x: number, y: number, l: number): number {
    let hash = 5381

    hash = hash * 33 + x
    hash = hash * 33 + y
    hash = hash * 33 + l

    return hash % M
}

function getHash(x: number, y: number, level: number, dx: number = 0, dy: number = 0): number {
    // k 
    // Equation 3
    const invCellSize = 1 / (2 ** level)

    // here we converting world to grid space
    // Equation 1
    const cellX = Math.floor(x * invCellSize) + dx
    const cellY = Math.floor(y * invCellSize) + dy

    return djb2Hash(cellX, cellY, level)
}

function getSubdivisonLevel(width: number, height: number): number {
    const longestEdge = Math.max(width, height)
    // Equation 2
    return Math.ceil(Math.log2(longestEdge))
}

export class SpatialHash {
    hashtable = new Map<number, SpatialHashObject[]>()
    // we need to check every subdivision level so we better keep it
    levels = new Map<number, number>()

    addObject(obj: SpatialHashObject): void {
        const bounds = obj.getBoundingBox()
        const subdivisionLevel = getSubdivisonLevel(bounds.width, bounds.height)

        const hash = getHash(bounds.x, bounds.y, subdivisionLevel)
        let objects = this.hashtable.get(hash)
        if (!objects) {
            objects = []
            this.hashtable.set(hash, objects)
        }

        obj.level = subdivisionLevel
        obj.hash = hash
        objects.push(obj)

        const levelRefcount = this.levels.get(subdivisionLevel) || 0
        this.levels.set(subdivisionLevel, levelRefcount + 1)
    }

    removeObject(obj: SpatialHashObject): void {
        const hash = obj.hash

        const objects = this.hashtable.get(hash)
        
        if (objects.length === 1) {
            this.hashtable.delete(hash)
        } else {
            const index = objects.indexOf(obj)
            objects.splice(index, 1)
        }

        const subdivisionLevel = obj.level
        const levelRefcount = this.levels.get(subdivisionLevel)
        if (levelRefcount > 1) {
            this.levels.set(subdivisionLevel, levelRefcount - 1)
        } else {
            this.levels.delete(subdivisionLevel)
        }

        obj.level = undefined
        obj.hash = undefined
    }

    updateObject(obj: SpatialHashObject): void {
        const bounds = obj.getBoundingBox()

        const level = obj.level
        const newLevel = getSubdivisonLevel(bounds.width, bounds.height)

        let shouldRefresh = newLevel !== level
        if (!shouldRefresh) {
            const hash = obj.hash
            const newHash = getHash(bounds.x, bounds.y, newLevel)
            shouldRefresh = hash !== newHash
        }

        if (shouldRefresh) {
            this.removeObject(obj)
            this.addObject(obj)
        }
    }

    query(x: number, y: number): SpatialHashObject[] {
        const result: SpatialHashObject[] = []

        // since every object can only occupy 2x2 cells
        // and every object is stored in top left cell out of those 2x2
        // we must at most check 2x2 area going up and left
        const offsets = [
            -1, -1,
            -1,  0,
             0, -1,
             0,  0,
        ]

        // for every subdivision level
        for (const level of Array.from(this.levels.keys())) {
            // we check current cell and 3 of top left neighboring cells (top, left, and diagonal top-left)
            for (let i = 0; i < offsets.length; i += 2) {
                const dx = offsets[i]
                const dy = offsets[i + 1]

                // board phase
                const hash = getHash(x, y, level, dx, dy)
                const objects = this.hashtable.get(hash)

                // narrow phase
                if (objects) {
                    for (const obj of objects) {
                        if (testPointInBounds(x, y, obj.getBoundingBox())) {
                            result.push(obj)
                        }
                    }
                }
            }
        }

        return result
    }
}