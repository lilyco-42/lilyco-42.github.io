/* ps.c — 图像滤镜内核 (RGBA in-place), zig cc → wasm32
   JS: 拷贝像素到 buf(), 调 process(op,param,w,h), 拷回 */
static unsigned char heap[24 * 1024 * 1024];
static unsigned int hpos = 0;

unsigned char *alloc(unsigned n) {
    if (hpos + n > sizeof(heap)) return 0;
    unsigned char *p = heap + hpos;
    hpos += n;
    return p;
}

void reset(void) { hpos = 0; }

/* op: 0=亮度 1=对比度 2=饱和度 3=灰度 4=反相 5=盒模糊 6=Sobel边缘 */
void process(int op, int param, unsigned char *px, int w, int h) {
    long n = (long)w * h;
    if (op == 0) {                       /* 亮度 -255..255 */
        for (long i = 0; i < n * 4; i += 4) {
            for (int k = 0; k < 3; k++) {
                int v = px[i + k] + param;
                px[i + k] = v < 0 ? 0 : v > 255 ? 255 : v;
            }
        }
    } else if (op == 1) {                /* 对比度 -100..100 */
        float f = (259.f * (param + 255)) / (255.f * (259 - param));
        for (long i = 0; i < n * 4; i += 4) {
            for (int k = 0; k < 3; k++) {
                int v = (int)(f * (px[i + k] - 128) + 128);
                px[i + k] = v < 0 ? 0 : v > 255 ? 255 : v;
            }
        }
    } else if (op == 2) {                /* 饱和度 -100..100 */
        float s = 1.f + param / 100.f;
        for (long i = 0; i < n * 4; i += 4) {
            float g = 0.299f * px[i] + 0.587f * px[i + 1] + 0.114f * px[i + 2];
            for (int k = 0; k < 3; k++) {
                int v = (int)(g + (px[i + k] - g) * s);
                px[i + k] = v < 0 ? 0 : v > 255 ? 255 : v;
            }
        }
    } else if (op == 3) {                /* 灰度 */
        for (long i = 0; i < n * 4; i += 4) {
            unsigned char g = (unsigned char)(0.299f * px[i] + 0.587f * px[i + 1] + 0.114f * px[i + 2]);
            px[i] = px[i + 1] = px[i + 2] = g;
        }
    } else if (op == 4) {                /* 反相 */
        for (long i = 0; i < n * 4; i += 4)
            for (int k = 0; k < 3; k++) px[i + k] = 255 - px[i + k];
    } else if (op == 5) {                /* 盒模糊 param=半径1..10, 水平+垂直两趟 */
        int r = param < 1 ? 1 : param;
        unsigned char *tmp = alloc((unsigned)n * 4);
        if (!tmp) return;
        for (int y = 0; y < h; y++)
            for (int x = 0; x < w; x++)
                for (int k = 0; k < 4; k++) {
                    int s = 0, c = 0;
                    for (int d = -r; d <= r; d++) {
                        int xx = x + d; if (xx < 0 || xx >= w) continue;
                        s += px[((long)y * w + xx) * 4 + k]; c++;
                    }
                    tmp[((long)y * w + x) * 4 + k] = (unsigned char)(s / c);
                }
        for (int y = 0; y < h; y++)
            for (int x = 0; x < w; x++)
                for (int k = 0; k < 4; k++) {
                    int s = 0, c = 0;
                    for (int d = -r; d <= r; d++) {
                        int yy = y + d; if (yy < 0 || yy >= h) continue;
                        s += tmp[((long)yy * w + x) * 4 + k]; c++;
                    }
                    px[((long)y * w + x) * 4 + k] = (unsigned char)(s / c);
                }
        hpos -= (unsigned)n * 4;         /* 还回临时缓冲 */
    } else if (op == 6) {                /* Sobel 边缘 → 灰度描边 */
        unsigned char *out = alloc((unsigned)n * 4);
        if (!out) return;
        for (int y = 0; y < h; y++)
            for (int x = 0; x < w; x++) {
                int gx = 0, gy = 0;
                for (int dy = -1; dy <= 1; dy++)
                    for (int dx = -1; dx <= 1; dx++) {
                        int yy = y + dy, xx = x + dx;
                        if (yy < 0 || yy >= h || xx < 0 || xx >= w) continue;
                        unsigned char *p = px + ((long)yy * w + xx) * 4;
                        int g = (p[0] * 3 + p[1] * 6 + p[2]) / 10;
                        static const int kx[3][3] = {{-1,0,1},{-2,0,2},{-1,0,1}};
                        static const int ky[3][3] = {{-1,-2,-1},{0,0,0},{1,2,1}};
                        gx += kx[dy+1][dx+1] * g; gy += ky[dy+1][dx+1] * g;
                    }
                int m = (gx > 0 ? gx : -gx) + (gy > 0 ? gy : -gy);
                if (m > 255) m = 255;
                long i = ((long)y * w + x) * 4;
                out[i] = out[i+1] = out[i+2] = (unsigned char)(255 - m);
                out[i+3] = 255;
            }
        for (long i = 0; i < n * 4; i++) px[i] = out[i];
        hpos -= (unsigned)n * 4;
    }
}
