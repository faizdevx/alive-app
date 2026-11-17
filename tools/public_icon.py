# Draws the public ALIVE? icon: a shaded pixel heart with a heartbeat line running through it.
# Built on a 32x32 pixel grid, scaled nearest-neighbour so it stays crisp. Writes editions/public/res + assets.
# Usage: python tools/public_icon.py
import os
from PIL import Image

N = 32
BG = (18, 20, 17, 255)
OUT = (5, 7, 5, 255)
RED, RED_D, RED_L, SHINE = (226, 70, 70, 255), (150, 32, 44, 255), (255, 128, 112, 255), (255, 226, 214, 255)
GRN, GRN_L = (155, 211, 90, 255), (214, 255, 150, 255)
ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'editions', 'public')


def heart(x, y):
    # classic heart curve (x^2 + y^2 - 1)^3 - x^2 y^3 <= 0, grid cell centre mapped to about [-1.3, 1.3]
    u, v = (x + .5 - N / 2) / 11.5, -(y + .5 - N / 2 - 1) / 11.5
    return (u * u + v * v - 1) ** 3 - u * u * v ** 3 <= 0


def line(g, a, b, c):
    (x0, y0), (x1, y1) = a, b; dx, dy = abs(x1 - x0), -abs(y1 - y0); sx, sy = (1 if x0 < x1 else -1), (1 if y0 < y1 else -1); e = dx + dy
    while True:
        g[(x0, y0)] = c; g[(x0, y0 + 1)] = c  # 2 px thick
        if (x0, y0) == (x1, y1): break
        e2 = 2 * e
        if e2 >= dy: e += dy; x0 += sx
        if e2 <= dx: e += dx; y0 += sy


def art():
    g = {}
    for y in range(N):
        for x in range(N):
            if not heart(x, y): continue
            edge = not all(heart(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
            if edge: g[(x, y)] = OUT
            elif x + y > 36 or not heart(x + 2, y + 2): g[(x, y)] = RED_D          # shadow, bottom right
            elif x + y < 22 and heart(x - 2, y - 2): g[(x, y)] = RED_L             # light, top left
            else: g[(x, y)] = RED
    for p in ((8, 8), (9, 8), (8, 9), (7, 10)): g[p] = SHINE                        # glint
    pulse = [(0, 16), (9, 16), (11, 12), (14, 22), (17, 7), (20, 19), (22, 16), (31, 16)]
    ln = {}
    for a, b in zip(pulse, pulse[1:]): line(ln, a, b, GRN)
    for (x, y) in list(ln):                                                           # dark outline round the pulse
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                if (x + dx, y + dy) not in ln and 0 <= x + dx < N: g[(x + dx, y + dy)] = OUT
    g.update(ln)
    g[(17, 7)] = g[(17, 8)] = GRN_L                                                   # bright peak
    return g


def draw(size, art_px, bg=BG):
    im = Image.new('RGBA', (size, size), bg); c = art_px // N; off = (size - c * N) // 2
    for (x, y), col in art().items():
        if 0 <= x < N and 0 <= y < N: im.paste(col, (off + x * c, off + y * c, off + (x + 1) * c, off + (y + 1) * c))
    return im


def save(im, *p):
    path = os.path.join(ROOT, *p); os.makedirs(os.path.dirname(path), exist_ok=True); im.save(path)


if __name__ == '__main__':
    save(draw(432, 288), 'res', 'drawable', 'icon_fg.png')      # adaptive: launchers show the middle 288px
    save(draw(192, 160), 'res', 'mipmap', 'icon.png')           # Android 7 (no adaptive icons)
    save(draw(384, 352, (0, 0, 0, 0)), 'res', 'drawable', 'splash_logo.png')
    save(draw(512, 448), 'assets', 'logo.png')
    save(draw(512, 448), 'store_icon_512.png')                  # for a future store listing
    print('public icon written')
