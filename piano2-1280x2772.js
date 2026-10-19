auto("fast");
requestScreenCapture()
launchPackage("com.cmplay.tiles2");
var img;
sleep(1000);
for (;;) {
img = captureScreen();
if (images.detectsColor(img,"#000000", 160, 2350, threads = 15)) {
press(160, 2350, 1);
continue;
}
if (images.detectsColor(img,"#000000", 480, 2350, threads = 15)) {
press(480, 2350, 1);
continue;
}
if (images.detectsColor(img,"#000000", 800, 2350, threads = 15)) {
press(800, 2350, 1);
continue;
}
if (images.detectsColor(img,"#000000", 1120, 2350, threads = 15)) {
press(1120, 2350, 1);
continue;
}
sleep(1);
}
