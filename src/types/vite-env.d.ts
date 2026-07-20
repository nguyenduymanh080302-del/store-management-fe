// This file is an augmentation to the built-in ImportMeta interface
// Thus cannot contain any top-level imports
// <https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation>

interface ImportMetaEnv {
    [key: string]: any
    BASE_URL: string
    MODE: string
    DEV: boolean
    PROD: boolean
    SSR: boolean
}

interface ImportMeta {
    url: string
    readonly env: ImportMetaEnv
}

declare module '*.svg' {
    import * as React from 'react'
    const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>
    const src: string
    export default ReactComponent
    export { src }
}
