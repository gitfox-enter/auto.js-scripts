// 钢琴块2 v4 终极版 — 1280x2772 (红米Turbo4Pro)
// = 手机AI版(区域扫描+防重复状态机+内存回收) + 牛马v3(长按块支持) 合体
auto("fast");
requestScreenCapture(false);
sleep(500);

var cols = [160, 480, 800, 1120];   // 1280宽四轨中心(修正版,原152/457/762/1068偏了)
var w = 8;
var HOLD_FRAMES = 3;                 // 连续N帧仍黑 => 长按块
var img = null;
var pressed = [false, false, false, false];
var hitCount = [0, 0, 0, 0];

events.on('exit', function() {
    if (img != null) { img.recycle(); img = null; }
});

while (true) {
    try {
        img = captureScreen();
        if (img == null) { sleep(20); continue; }

        for (var i = 0; i < 4; i++) {
            var point = images.findColor(img, "#000000", {
                region: [cols[i] - w, 1900, w * 2, 800],
                threshold: 60
            });
            if (pressed[i]) {
                if (point == null) {
                    pressed[i] = false;
                    hitCount[i] = 0;
                } else {
                    hitCount[i]++;          // 还黑着,块还没过完 => 长按持续
                    if (hitCount[i] < 200) press(cols[i], point.y, 30);  // 长按续力
                }
            } else {
                if (point != null) {
                    press(cols[i], point.y, 1);
                    pressed[i] = true;
                    hitCount[i] = 1;
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
