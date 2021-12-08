import { BoundaryBox } from "./types";

abstract class ObjectBase {
    abstract getBoundary(): BoundaryBox
}