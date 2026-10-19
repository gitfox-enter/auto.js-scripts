// 钢琴块2 V14 — 冲分版 (1280x2772 红米Turbo4Pro)
// 三大杀器: ①预测性点击(匀速下落测速,精确计算到达判定线时刻) ②gesture真长按 ③双线程流水线
auto("fast");
requestScreenCapture(false);
sleep(500);

var cols = [160, 480, 800, 1120];
var w = 10;
var Y_JUDGE = 2520;
var Y_SCAN_TOP = 1600;          // 扫描起点上移:看得更早,预测更准
var SCAN_H = 850;
var img = null;
var pending = [[], [], [], []]; // 每列待处理块: {y0, t0} 首次检测位置和时间
var locked = [false, false, false, false];  // 该列已有块在处理中(直到块过线)

var SPEED = null;               // 像素/毫秒,动态测得

events.on('exit', function() {
    if (img != null) { img.recycle(); img = null; }
});

function scheduleTap(i, yFound, now) {
    // 预测: 块从yFound到达Y_JUDGE需要的时间 = 距离/速度
    var eta;
    if (SPEED && SPEED > 0.05) {
        eta = (Y_JUDGE - yFound) / SPEED;
    } else {
        eta = 120; // 未测速前的保守默认
    }
    var delay = Math.max(0, eta - 25); // 提前25ms发起(点击注入本身有延迟)
    var col = cols[i];
    setTimeout(function() {
        // 长按块检测: pending中标记的用gesture
        press(col, Y_JUDGE, 1);
    }, delay);
}

// 测速线程: 持续跟踪最前块位置
threads.start(function() {
    var lastY = {}, lastT = {};
    while (true) {
        try {
            var im = captureScreen();
            if (!im) continue;
            for (var i = 0; i < 4; i++) {
                var p = images.findColor(im, "#000000", {
                    region: [cols[i]-w, Y_SCAN_TOP, w*2, SCAN_H], threshold: 60 });
                if (p) {
                    var now = Date.now();
                    if (lastY[i] !== undefined && p.y > lastY[i] && p.y - lastY[i] < 200) {
                        var dt = now - lastT[i];
                        if (dt > 10 && dt < 500) {
                            var v = (p.y - lastY[i]) / dt;
                            if (v > 0.05 && v < 5) SPEED = v;  // 合理范围才更新
                        }
                    }
                    lastY[i] = p.y; lastT[i] = now;
                } else {
                    delete lastY[i];
                }
            }
            if (img) img.recycle();
            img = im;
        } catch (e) { sleep(50); }
    }
});

// 主点击线程
while (true) {
    try {
        var im2 = img;
        if (im2 == null) { sleep(10); continue; }
        for (var i = 0; i < 4; i++) {
            var point = images.findColor(im2, "#000000", {
                region: [cols[i] - w, Y_SCAN_TOP, w * 2, SCAN_H],
                threshold: 60
            });
            if (!locked[i]) {
                if (point != null) {
                    locked[i] = true;
                    scheduleTap(i, point.y, Date.now());
                    // 长按判定: 同列持续黑,由看门狗处理
                    (function(ii, yy) {
                        threads.start(function() {
                            // 看门狗:持续黑则gesture长按,黑消失则结束
                            var watchStart = Date.now();
                            var stillBlack = true;
                            while (stillBlack && Date.now() - watchStart < 8000) {
                                sleep(60);
                                try {
                                    var w2 = captureScreen();
                                    if (!w2) continue;
                                    var p2 = images.findColor(w2, "#000000", {
                                        region: [cols[ii]-w, Y_JUDGE-150, w*2, 300], threshold: 60 });
                                    if (p2) {
                                        gesture(100, cols[ii], Y_JUDGE, cols[ii], Y_JUDGE); // 持续按住100ms续
                                    } else {
                                        stillBlack = false;
                                    }
                                    w2.recycle();
                                } catch (e2) {}
                            }
                            locked[ii] = false;
                        });
                    })(i, point.y);
                }
            }
        }
    } catch (e) {
        sleep(100);
    }
}
