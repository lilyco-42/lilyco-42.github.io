/* tslint:disable */
/* eslint-disable */

/**
 * 完整一层 BitLinear 前向。
 * x: 行主序 (b × i) 激活；w: 行主序 (i × o) 全精度权重。返回 (b × o) 行主序。
 */
export function bitlinear_forward(x_flat: Float32Array, b: number, i: number, w_flat: Float32Array, o: number): Float32Array;

export function bitnet_meta(): string;

/**
 * 纯 LUT 矩阵乘（供 JS 端拿预量化权重直接调用）。
 * 返回 i32 累加结果，转成 f32 便于 JS 读取。
 */
export function lut_matmul_js(xq_flat: Int8Array, qw_flat: Uint8Array, b: number, i: number, ng: number, o: number): Float32Array;

/**
 * 只做权重打包：返回 (打包三值 u8 行主序, 每输出通道 scale)。
 */
export function pack_weights_js(w_flat: Float32Array, i: number, o: number): Float32Array;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly bitlinear_forward: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number];
    readonly bitnet_meta: () => [number, number];
    readonly lut_matmul_js: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number];
    readonly pack_weights_js: (a: number, b: number, c: number, d: number) => [number, number];
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
