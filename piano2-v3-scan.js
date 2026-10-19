// 钢琴块2 v3 增强版 — 1280x2772 适配
// 改进: ①四列竖带扫描,从上往下找"最前面"的黑块(双块不漏) ②支持长按块 ③减少延迟
auto("fast");
requestScreenCapture();
launchPackage("com.cmplay.tiles2");
sleep(1000);

var COLS = [160, 480, 800, 1120];   // 四轨中心
var Y_TOP = 1800;                    // 扫描起点(块刚出现的区域,越早越快,可调)
var Y_HIT = 2500;                    // 点击位置(块下半部,保证按住有效)
var SCAN_STEP = 10;                  // 竖向扫描步长
var HOLD_MIN = 3;                    // 连续命中次数>=此值判为长按块(约3帧)

var lastHit = [0,0,0,0];             // 各列连续命中计数

function isBlack(img, x, y) {
    try {
        var c = images.pixel(img, x, y);
        return (colors.red(c) < 60 && colors.green(c) < 60 && colors.blue(c) < 60);
    } catch (e) { return false; }
}

for (;;) {
    var img = captureScreen();
    if (!img) continue;

    for (var i = 0; i < 4; i++) {
        var x = COLS[i];
        var found = -1;
        // 竖向扫描: 从Y_TOP往下找第一个黑像素
        for (var y = Y_TOP; y < Y_HIT; y += SCAN_STEP) {
            if (isBlack(img, x, y)) {
                // 确认是块不是噪点:再查下方30px
                if (isBlack(img, x, Math.min(y+30, 2771))) { found = y; }
                break;
            }
        }
        if (found > 0) {
            lastHit[i]++;
            if (lastHit[i] >= HOLD_MIN) {
                // 长按块:持续按住
                press(x, Y_HIT, 400);
            } else {
                press(x, Y_HIT, 1);
            }
        } else {
            lastHit[i] = 0;
        }
    }
}
