// 钢琴块2 v5 — 判定线定点版 (1280x2772 红米Turbo4Pro)
// 核心修正: 检测在上方(尽早发现块), 点击固定在判定线(时机稳定=Perfect)
// 手机AI版11轮迭代丢分的根因: press(point.y) 点击位置飘忽 => 判定时机随机
auto("fast");
requestScreenCapture(false);
sleep(500);

var cols = [160, 480, 800, 1120];  // 1280宽四轨真中心(152那组是按1220算的,偏了!)
var w = 10;
var Y_JUDGE = 2520;                 // 判定线:点击永远点这里(块走到这里的瞬间=Perfect)
var Y_SCAN_TOP = 1950;              // 扫描区起点(尽早发现)
var SCAN_H = 500;                   // 扫描区高度(1950-2450,判定线上方)
var img = null;
var pressed = [false, false, false, false];
var holdFrames = [0, 0, 0, 0];

events.on('exit', function() {
    if (img != null) { img.recycle(); img = null; }
});

while (true) {
    try {
        img = captureScreen();
        if (img == null) { sleep(20); continue; }

        for (var i = 0; i < 4; i++) {
            var point = images.findColor(img, "#000000", {
                region: [cols[i] - w, Y_SCAN_TOP, w * 2, SCAN_H],
                threshold: 60
            });
            if (pressed[i]) {
                if (point == null) {
                    pressed[i] = false;   // 块完全离开扫描区(过了判定线)
                    holdFrames[i] = 0;
                } else {
                    holdFrames[i]++;
                    if (holdFrames[i] < 150) press(cols[i], Y_JUDGE, 30); // 长按块续力
                }
            } else {
                if (point != null) {
                    press(cols[i], Y_JUDGE, 1);   // ★点击固定在判定线!
                    pressed[i] = true;
                    holdFrames[i] = 1;
                }
            }
        }
        img.recycle();
        img = null;
    } catch (e) {
        if (img != null) { img.recycle(); img = null; }
        sleep(100);
    }
}
