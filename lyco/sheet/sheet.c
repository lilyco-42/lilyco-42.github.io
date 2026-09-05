/* sheet.c — 表格公式引擎 (wasm32-freestanding)
   通过导入 cellget(r,c) 读取单元格数值 (JS 提供, 可重入) */
__attribute__((import_module("env"), import_name("cellget"))) extern double cellget(int r, int c);

static char f[512];
static int fp, flen, ferr;

void fset(int len) { flen = len; fp = 0; ferr = 0; }
char *fbuf(void) { return f; }
int lasterr(void) { return ferr; }

static void skip(void){ while (fp < flen && (f[fp]==' '||f[fp]=='\t')) fp++; }
static int peek(void){ skip(); return fp < flen ? f[fp] : -1; }

static double expr(void);

/* col: 'A'->0, 'AB'->27; row 1-based -> 0-based */
static int parse_cellref(int *r, int *c) {
    int cc = 0, rr = 0, n = 0;
    while (fp < flen && f[fp] >= 'A' && f[fp] <= 'Z') { cc = cc*26 + (f[fp]-'A'+1); fp++; n++; }
    if (!n) return 0;
    while (fp < flen && f[fp] >= '0' && f[fp] <= '9') { rr = rr*10 + (f[fp]-'0'); fp++; }
    if (rr < 1) return 0;
    *r = rr - 1; *c = cc - 1;
    return 1;
}

static double range_sum(int r1,int c1,int r2,int c2,double *avg,int *cnt,double *mn,double *mx){
    double s = 0; int n = 0; *mn = 1e300; *mx = -1e300;
    if (r1 > r2) { int t=r1; r1=r2; r2=t; }
    if (c1 > c2) { int t=c1; c1=c2; c2=t; }
    for (int rr = r1; rr <= r2; rr++) for (int cc = c1; cc <= c2; cc++) {
        double v = cellget(rr, cc); s += v; n++;
        if (v < *mn) *mn = v; if (v > *mx) *mx = v;
    }
    *avg = n ? s/n : 0; *cnt = n;
    return s;
}

static double atom(void) {
    skip();
    if (fp >= flen) { ferr = 1; return 0; }
    if (f[fp] == '(') { fp++; double v = expr(); if (peek() == ')') fp++; else ferr = 1; return v; }
    if (f[fp] == '-' || f[fp] == '+') { int sgn = f[fp]=='-'?-1:1; fp++; return sgn * atom(); }
    if ((f[fp] >= 'A' && f[fp] <= 'Z')) {
        /* 函数或单元格引用 */
        int save = fp;
        char name[8]; int nn = 0;
        while (fp < flen && f[fp] >= 'A' && f[fp] <= 'Z' && nn < 7) name[nn++] = f[fp++];
        name[nn] = 0;
        if (fp < flen && f[fp] == '(') {
            fp++; skip();
            int r1,c1,r2,c2;
            if (!parse_cellref(&r1,&c1)) { ferr = 2; return 0; }
            skip();
            if (fp < flen && f[fp] == ':') { fp++; if (!parse_cellref(&r2,&c2)) { ferr=2; return 0; } }
            else { r2 = r1; c2 = c1; }
            if (peek() == ')') fp++; else ferr = 1;
            double avg, mn, mx; int cnt;
            double s = range_sum(r1,c1,r2,c2,&avg,&cnt,&mn,&mx);
            if (name[0]=='S' && name[1]=='U' && name[2]=='M' && !name[3]) return s;
            if (name[0]=='A' && name[1]=='V' && name[2]=='G' && !name[3]) return avg;
            if (name[0]=='M' && name[1]=='I' && name[2]=='N' && !name[3]) return mn;
            if (name[0]=='M' && name[1]=='A' && name[2]=='X' && !name[3]) return mx;
            if (name[0]=='C' && name[1]=='O' && name[2]=='U' && name[3]=='N' && name[4]=='T' && !name[5]) return cnt;
            ferr = 3; return 0;
        }
        fp = save;
        int r, c;
        if (parse_cellref(&r, &c)) return cellget(r, c);
        ferr = 2; return 0;
    }
    /* 数字 */
    double v = 0; int dot = 0; double scale = 1; int any = 0;
    while (fp < flen) {
        char ch = f[fp];
        if (ch >= '0' && ch <= '9') { if (!dot) v = v*10 + (ch-'0'); else { scale /= 10; v += (ch-'0')*scale; } any = 1; fp++; }
        else if (ch == '.' && !dot) { dot = 1; fp++; }
        else break;
    }
    if (!any) ferr = 1;
    return v;
}

static double term(void) {
    double v = atom();
    for (;;) {
        int op = peek();
        if (op == '*') { fp++; v *= atom(); }
        else if (op == '/') { fp++; double d = atom(); v = (d == 0 ? (ferr = 4, 0) : v / d); }
        else return v;
    }
}

static double expr(void) {
    double v = term();
    for (;;) {
        int op = peek();
        if (op == '+') { fp++; v += term(); }
        else if (op == '-') { fp++; v -= term(); }
        else return v;
    }
}

double evaluate(void) { fp = 0; ferr = 0; double v = expr(); if (fp < flen) ferr = 1; return v; }
