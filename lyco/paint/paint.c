/* paint.c — 扫描线油漆桶填充 (wasm32-freestanding) */
#define MAXW 1024
#define MAXH 1024
static unsigned char pix[MAXW*MAXH*4];
static int stack[MAXW*MAXH]; /* 扫描线段栈 */

unsigned char *kbuf(void) { return pix; }

/* tol: 0-255 颜色容差; 返回填充像素数 */
int flood(int w, int h, int sx, int sy, unsigned char nr, unsigned char ng, unsigned char nb, int tol) {
    if (sx < 0 || sy < 0 || sx >= w || sy >= h) return 0;
    long si = ((long)sy*w+sx)*4;
    unsigned char or = pix[si], og = pix[si+1], ob = pix[si+2];
    if (or == nr && og == ng && ob == nb) return 0;
    int top = 0; long filled = 0;
    stack[top++] = sx; stack[top++] = sy;
    while (top > 0) {
        int y = stack[--top], x0 = stack[--top];
        int x = x0;
        long j;
        /* 向左 */
        while (x >= 0) { j = ((long)y*w+x)*4;
            int d = pix[j]-or; d = d<0?-d:d; int d2 = pix[j+1]-og; d2 = d2<0?-d2:d2; int d3 = pix[j+2]-ob; d3 = d3<0?-d3:d3;
            if (d > tol || d2 > tol || d3 > tol) break; x--; }
        x++;
        int spanUp = 0, spanDn = 0;
        while (x < w) { j = ((long)y*w+x)*4;
            int d = pix[j]-or; d = d<0?-d:d; int d2 = pix[j+1]-og; d2 = d2<0?-d2:d2; int d3 = pix[j+2]-ob; d3 = d3<0?-d3:d3;
            if (d > tol || d2 > tol || d3 > tol) break;
            pix[j] = nr; pix[j+1] = ng; pix[j+2] = nb; filled++;
            if (y > 0) { long u = ((long)(y-1)*w+x)*4;
                int du = pix[u]-or; du = du<0?-du:du; int du2 = pix[u+1]-og; du2 = du2<0?-du2:du2; int du3 = pix[u+2]-ob; du3 = du3<0?-du3:du3;
                if (du <= tol && du2 <= tol && du3 <= tol) { if (!spanUp) { stack[top++] = x; stack[top++] = y-1; spanUp = 1; } } else spanUp = 0; }
            if (y < h-1) { long dn = ((long)(y+1)*w+x)*4;
                int dd = pix[dn]-or; dd = dd<0?-dd:dd; int dd2 = pix[dn+1]-og; dd2 = dd2<0?-dd2:dd2; int dd3 = pix[dn+2]-ob; dd3 = dd3<0?-dd3:dd3;
                if (dd <= tol && dd2 <= tol && dd3 <= tol) { if (!spanDn) { stack[top++] = x; stack[top++] = y+1; spanDn = 1; } } else spanDn = 0; }
            x++;
        }
    }
    return (int)filled;
}
