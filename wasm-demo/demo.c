/* wasm-demo.c — freestanding C → wasm32 (zig cc)
   export: buf()/render(t)/fib(n) — 无 libc, 无 entry */
static unsigned char fb[256 * 160 * 4];

unsigned char *buf(void) { return fb; }

unsigned fib(unsigned n) {
    unsigned a = 0, b = 1;
    while (n--) { unsigned t = a + b; a = b; b = t; }
    return a;
}

void render(unsigned t) {
    for (unsigned y = 0; y < 160; y++) {
        for (unsigned x = 0; x < 256; x++) {
            unsigned i = (y * 256 + x) * 4;
            unsigned v = ((x + t) ^ (y + t / 2)) + ((x * x + y * y) >> 6);
            fb[i]     = (unsigned char)v;
            fb[i + 1] = (unsigned char)(v >> 1);
            fb[i + 2] = (unsigned char)(128 + v / 2);
            fb[i + 3] = 255;
        }
    }
}
