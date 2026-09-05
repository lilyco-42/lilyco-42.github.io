/* photo.c — 图像滤波内核 (wasm32-freestanding, zig cc) */
#define MAXW 1024
#define MAXH 1024
#define NPIX (MAXW*MAXH)
static unsigned char pix[NPIX*4];
static unsigned char tmp[NPIX*4];

unsigned char *pbuf(void) { return pix; }

static unsigned char clamp255(int v){ return v<0?0:(v>255?255:(unsigned char)v); }

void apply(int w, int h, int mode, int arg) {
    long n = (long)w*h;
    long i;
    /* 备份原图到 tmp (供邻域类滤镜) */
    for (i = 0; i < n*4; i++) tmp[i] = pix[i];
    if (mode == 0) {            /* 灰度 */
        for (i = 0; i < n; i++) {
            unsigned char *p = &pix[i*4];
            unsigned char g = (unsigned char)((p[0]*299 + p[1]*587 + p[2]*114) / 1000);
            p[0]=p[1]=p[2]=g;
        }
    } else if (mode == 1) {     /* 反相 */
        for (i = 0; i < n*4; i++) if (i%4!=3) pix[i] = (unsigned char)(255 - pix[i]);
    } else if (mode == 2) {     /* 亮度 arg∈[-255,255] */
        for (i = 0; i < n*4; i++) if (i%4!=3) pix[i] = clamp255(pix[i] + arg);
    } else if (mode == 3) {     /* 对比度 arg∈[1,300] (%) */
        for (i = 0; i < n*4; i++) if (i%4!=3)
            pix[i] = clamp255(128 + (pix[i] - 128) * arg / 100);
    } else if (mode == 4) {     /* 像素化 arg=cell */
        int c = arg<2?2:arg, x, y, bx, by;
        for (y = 0; y < h; y += c) for (x = 0; x < w; x += c) {
            long r=0,g=0,b=0,cnt=0;
            for (by = y; by < y+c && by < h; by++) for (bx = x; bx < x+c && bx < w; bx++) {
                long j = ((long)by*w+bx)*4; r+=pix[j]; g+=pix[j+1]; b+=pix[j+2]; cnt++;
            }
            for (by = y; by < y+c && by < h; by++) for (bx = x; bx < x+c && bx < w; bx++) {
                long j = ((long)by*w+bx)*4;
                pix[j]=(unsigned char)(r/cnt); pix[j+1]=(unsigned char)(g/cnt); pix[j+2]=(unsigned char)(b/cnt);
            }
        }
    } else if (mode == 5) {     /* Sobel 边缘 */
        int x, y;
        for (y = 1; y < h-1; y++) for (x = 1; x < w-1; x++) {
            long j00=((long)(y-1)*w+(x-1))*4, j01=((long)(y-1)*w+x)*4, j02=((long)(y-1)*w+(x+1))*4;
            long j10=((long)y*w+(x-1))*4,                       j12=((long)y*w+(x+1))*4;
            long j20=((long)(y+1)*w+(x-1))*4, j21=((long)(y+1)*w+x)*4, j22=((long)(y+1)*w+(x+1))*4;
            int gx = (int)(-(tmp[j00]*299+tmp[j00+1]*587+tmp[j00+2]*114)/1000
                           -2*(tmp[j10]*299+tmp[j10+1]*587+tmp[j10+2]*114)/1000
                           -(tmp[j20]*299+tmp[j20+1]*587+tmp[j20+2]*114)/1000
                           +(tmp[j02]*299+tmp[j02+1]*587+tmp[j02+2]*114)/1000
                           +2*(tmp[j12]*299+tmp[j12+1]*587+tmp[j12+2]*114)/1000
                           +(tmp[j22]*299+tmp[j22+1]*587+tmp[j22+2]*114)/1000);
            int gy = (int)(-(tmp[j00]*299+tmp[j00+1]*587+tmp[j00+2]*114)/1000
                           -2*(tmp[j01]*299+tmp[j01+1]*587+tmp[j01+2]*114)/1000
                           -(tmp[j02]*299+tmp[j02+1]*587+tmp[j02+2]*114)/1000
                           +(tmp[j20]*299+tmp[j20+1]*587+tmp[j20+2]*114)/1000
                           +2*(tmp[j21]*299+tmp[j21+1]*587+tmp[j21+2]*114)/1000
                           +(tmp[j22]*299+tmp[j22+1]*587+tmp[j22+2]*114)/1000);
            long m = (long)gx*gx + (long)gy*gy; if (m > 65025) m = 65025;
            long j = ((long)y*w+x)*4;
            unsigned char v = (unsigned char)(m / 255);
            pix[j]=pix[j+1]=pix[j+2]=v;
        }
    } else if (mode == 6) {     /* 盒模糊 arg=radius ≤5 */
        int r = arg<1?1:(arg>5?5:arg), x, y, k;
        for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
            long s0=0,s1=0,s2=0,cnt=0;
            for (int dy=-r; dy<=r; dy++) { int yy=y+dy; if(yy<0||yy>=h) continue;
                for (int dx=-r; dx<=r; dx++) { int xx=x+dx; if(xx<0||xx>=w) continue;
                    long j=((long)yy*w+xx)*4; s0+=tmp[j]; s1+=tmp[j+1]; s2+=tmp[j+2]; cnt++; } }
            long j=((long)y*w+x)*4; pix[j]=(unsigned char)(s0/cnt); pix[j+1]=(unsigned char)(s1/cnt); pix[j+2]=(unsigned char)(s2/cnt);
        }
        (void)k;
    }
}
