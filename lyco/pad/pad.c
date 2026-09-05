/* pad.c — 文本统计内核 (UTF-8 感知, wasm32-freestanding) */
static char tbuf[65536];
static unsigned out[4]; /* [字符数, 单词数, CJK 字数, 行数] */

char *tbufp(void) { return tbuf; }
unsigned *statp(void) { return out; }

void stats(int len) {
    unsigned chars = 0, words = 0, cjk = 0, lines = 1;
    int inword = 0;
    for (int i = 0; i < len; ) {
        unsigned char c = (unsigned char)tbuf[i];
        if (c == '\n') { lines++; inword = 0; i++; chars++; continue; }
        if (c < 0x80) {
            chars++;
            int alnum = (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c == '\'';
            if (alnum && !inword) { words++; inword = 1; }
            else if (!alnum) inword = 0;
            i++;
        } else {
            /* UTF-8 多字节: 计算 char 宽度 */
            int n = (c & 0xE0) == 0xC0 ? 2 : (c & 0xF0) == 0xE0 ? 3 : (c & 0xF8) == 0xF0 ? 4 : 1;
            /* CJK 统一字区 + 扩展A */
            if (n == 3) {
                unsigned cp = ((c & 0x0F) << 12) | ((tbuf[i+1] & 0x3F) << 6) | (tbuf[i+2] & 0x3F);
                if ((cp >= 0x4E00 && cp <= 0x9FFF) || (cp >= 0x3400 && cp <= 0x4DBF)) { cjk++; words++; inword = 0; }
                else { words++; inword = 0; } /* 其他非 ASCII 字符也算一个词 */
            } else { words++; inword = 0; }
            chars++; i += n;
        }
    }
    out[0] = chars; out[1] = words; out[2] = cjk; out[3] = lines;
}

/* 大小写/蛇形转换示例: mode 0=UPPER 1=lower 2=snake */
void transform(int len, int mode) {
    int j = 0;
    for (int i = 0; i < len; i++) {
        unsigned char c = (unsigned char)tbuf[i];
        if (mode == 0 && c >= 'a' && c <= 'z') c -= 32;
        else if (mode == 1 && c >= 'A' && c <= 'Z') c += 32;
        else if (mode == 2) { if (c == ' ') c = '_'; }
        tbuf[j++] = (char)c;
    }
}
