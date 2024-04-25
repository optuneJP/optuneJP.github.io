const uiWidthLimit = 1650;  //インターフェース幅上限

const urlWebExplain = 'https://www.hozan.co.jp/corp/supportservice/pg/1CamBrowser2/';   //ソフト説明ページのURL
const urlWebRequest = 'https://www.hozan.co.jp/corp/everyform/form.aspx?questionnaire=CamPlus';   //ソフトの不具合・ご要望フォーム

const urlCamBrowser = 'https://www.hozan.co.jp/corp/members/cambrowser_new.aspx'; //旧 CamBrowser の URL
const urlCamBrowserExplain = 'https://www.hozan.co.jp/corp/supportservice/pg/1CamBrowser2/'; //旧 CamBrowser の説明ページ URL

// ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
window.addEventListener('contextmenu', function (event) {
    event.preventDefault();
});
window.addEventListener('dragover', (event) => {
    event.preventDefault();
});
window.addEventListener('drop', (event) => {
    event.preventDefault();
});
window.addEventListener('dragstart', (event) => {
    event.preventDefault();
});
const windowTop = document.getElementById('top');
const workSpace = document.getElementById('work-space');
const windowMiddle = document.getElementById('ctrl-area');
const windowBottom = document.getElementById('bottom');
if (window.innerWidth < uiWidthLimit) {
    windowTop.style.zoom = window.innerWidth / uiWidthLimit;
    windowMiddle.style.zoom = window.innerWidth / uiWidthLimit;
    windowBottom.style.zoom = window.innerWidth / uiWidthLimit;
    workSpace.style.height = `${window.innerHeight - 147 * (window.innerWidth / uiWidthLimit)}px`;
} else {
    windowTop.style.zoom = 1;
    windowMiddle.style.zoom = 1;
    windowBottom.style.zoom = 1;
    workSpace.style.height = `${window.innerHeight - 147}px`;
}
let navigatorCtrl;
const videoMode = document.getElementById('video-mode');
let isVideoMode = 'realtime';
let connectedCamera = [];
videoMode.addEventListener('click', () => {
    if (isVideoMode != 'realtime') {
        isVideoMode = 'realtime';
        videoMode.innerHTML = '<img style="height: 12px; margin-right: 2px;" src="img/play.png" alt="描画">リアルタイム';
        videoMode.style.backgroundColor = null;
        cameraConnect(cameraList[parseInt(connectedCamera[0], 10)].deviceId, supportedResolution[parseInt(connectedCamera[1], 10)][0], supportedResolution[parseInt(connectedCamera[1], 10)][1]);
        cameraSelect.innerHTML = `<option value="0">${cameraList[0].name}</option>`;
        for (let i = 1; i < cameraList.length; i++) {
            cameraSelect.innerHTML += `<option value="${i}">${cameraList[i].name}</option>`;
        }
        cameraSelect.value = connectedCamera[0];
        cameraSelect.disabled = false;
        resolutionSelect.innerHTML = `<option value="0">${supportedResolution[0][0]}×${supportedResolution[0][1]}</option>`;
        for (let i = 1; i < supportedResolution.length; i++) {
            resolutionSelect.innerHTML += `<option value="${i}">${supportedResolution[i][0]}×${supportedResolution[i][1]}</option>`;
        }
        resolutionSelect.value = connectedCamera[1];
        resolutionSelect.disabled = false;
        pictureResSelect.innerHTML = `<option value="0">${supportedResolution[0][0]}×${supportedResolution[0][1]}</option>`;
        for (let i = 1; i < supportedResolution.length; i++) {
            pictureResSelect.innerHTML += `<option value="${i}">${supportedResolution[i][0]}×${supportedResolution[i][1]}</option>`;
        }
        pictureResSelect.value = connectedCamera[2];
        pictureResSelect.disabled = false;
        canvasResize(supportedResolution[connectedCamera[1]][0], supportedResolution[connectedCamera[1]][1]);
        video.style.display = 'block';
        videoCanvas.style.display = 'none';
        videoFitting();
        zoomSld.value = fitRate;
        if (isVideoMode === 'image') {
            drawObjects = [];
            deletedObjects = [];
            drawBackActive(false);
            drawRedoActive(false);
        }
        videoControl();
    } else {
        isVideoMode = 'pause';
        videoCtx.drawImage(video, 0, 0, videoCanvas.width, videoCanvas.height);
        connectedCamera = [cameraSelect.value, resolutionSelect.value, pictureResSelect.value];
        clearTimeout(navigatorCtrl);
        navigatorCtx.drawImage(videoCanvas, 0, 0, navigatorCanvas.width, navigatorCanvas.height);
        try {
            const tracks = mediaStream.getTracks();
            tracks.forEach(track => track.stop());
        } catch { }
        video.style.display = 'none';
        videoCanvas.style.display = 'block';
        videoMode.innerHTML = '<img style="height: 12px; margin-right: 2px;" src="img/pause.png" alt="描画">一時停止';
        videoMode.style.backgroundColor = '#a0e0ff';
        cameraSelect.innerHTML = `<option value="0">（画像編集中）</option>`;
        cameraSelect.disabled = true;
        resolutionSelect.innerHTML = `<option value="0">（画像編集中）</option>`;
        resolutionSelect.disabled = true;
        pictureResSelect.innerHTML = `<option value="0">画像の解像度に従う</option>`;
        pictureResSelect.disabled = true;
    }
});
const menuBar = document.getElementById('menu-bar');
let menuBarShow = false;
class MenuBar {
    constructor(id) {
        this.btn = document.getElementById(id);
        this.container = document.getElementById(`${id}-container`);
        this.btn.addEventListener('click', () => {
            menuBarShow = !menuBarShow;
            this.container.style.display = menuBarShow ? 'flex' : 'none';
            if (menuBarShow) this.btn.classList.add('menu-btn-active');
            else this.btn.classList.remove('menu-btn-active');
        });
        this.btn.addEventListener('mouseenter', () => {
            if (menuBarShow) {
                menuBarAllHide();
                this.container.style.display = 'flex';
                this.btn.classList.add('menu-btn-active');
            }
        });
    }
    hide() {
        this.container.style.display = 'none';
        this.btn.classList.remove('menu-btn-active');
    }
}
const menuBarCamera = new MenuBar('menu-bar-camera');
const menuBarSave = new MenuBar('menu-bar-save');
const menuBarMeasurement = new MenuBar('menu-bar-measurement');
const menuBarHelp = new MenuBar('menu-bar-help');
const menuBarCamBrowser = new MenuBar('menu-bar-cambrowser');
const menuBarContainerList = [menuBarCamera, menuBarSave, menuBarMeasurement, menuBarHelp, menuBarCamBrowser];
function menuBarAllHide() {
    for (let i = 0; i < menuBarContainerList.length; i++) {
        menuBarContainerList[i].hide();
    }
}
const cameraSelect = document.getElementById('camera-select');
const resolutionSelect = document.getElementById('resolution-select');
const cameraCtrlShow = document.getElementById('camera-ctrl-show');
const pictureResSelect = document.getElementById('picture-resolution');
pictureResSelect.addEventListener('change', (event) => {
    processCanvas.width = supportedResolution[event.target.value][0];
    processCanvas.height = supportedResolution[event.target.value][1];
});
const pictureFormat = document.getElementById('picture-format');
let pictureNameData;
const pictureName = document.getElementById('picture-name');
let nameRuleConvert = [['{年}', '{月}', '{日}', '{時}', '{分}', '{秒}', '{カウント}'], []];
function getTime() {
    const now = new Date();
    nameRuleConvert[1][0] = now.getFullYear();
    nameRuleConvert[1][1] = String(now.getMonth() + 1).padStart(2, '0');
    nameRuleConvert[1][2] = String(now.getDate()).padStart(2, '0');
    nameRuleConvert[1][3] = String(now.getHours()).padStart(2, '0');
    nameRuleConvert[1][4] = String(now.getMinutes()).padStart(2, '0');
    nameRuleConvert[1][5] = String(now.getSeconds()).padStart(2, '0');
    nameRuleConvert[1][6] = parseInt(saveNameCounter.value, 10);
}
class InsertNameRule {
    constructor(id, key) {
        this.btn = document.getElementById(id);
        this.btn.addEventListener('click', () => {
            pictureName.value = pictureName.value + key;
            pictureName.focus();
        });
    }
}
const insertYear = new InsertNameRule('insert-year', '{年}');
const insertMonth = new InsertNameRule('insert-month', '{月}');
const insertDay = new InsertNameRule('insert-day', '{日}');
const insertHour = new InsertNameRule('insert-hour', '{時}');
const insertMinute = new InsertNameRule('insert-minute', '{分}');
const insertSecond = new InsertNameRule('insert-second', '{秒}');
const insertCount = new InsertNameRule('insert-count', '{カウント}');
const saveNameCounter = document.getElementById('save-name-counter');
const calibrationStart = document.getElementById('calibration-start');
let calibrationData = 0;
const scaleStyle = document.getElementById('scale-style');
const scaleLength = document.getElementById('scale-length');
const scaleColor = document.getElementById('scale-color');
scaleLength.addEventListener('change', (event) => {
    scale.innerHTML = scaleSet(event.target.value);
});
function scaleSet(length) {
    if (calibrationData === 0 && scaleStyle.value != 'none') {
        popupMsgShow('スケールの表示には寸法校正が必要です');
        return '';
    }
    const scaleWidth = length / calibrationData * zoomParam.rate + 20;
    txt = `<svg width=${scaleWidth} height="20">
    <line x1="10" y1="0" x2="10" y2="20" stroke="${scaleColor.value}" stroke-width="2" />
    <line x1="${scaleWidth - 10}" y1="0" x2="${scaleWidth - 10}" y2="20" stroke="${scaleColor.value}" stroke-width="2" />
    <line x1="10" y1="10" x2="${scaleWidth - 10}" y2="10" stroke="${scaleColor.value}" stroke-width="2" />
    </svg>${length}mm
    `;
    return txt;
}
const scale = document.getElementById('scale');
scaleStyle.addEventListener('change', (event) => {
    const scalePos = { display: 'flex', top: '', left: '', bottom: '', right: '' };
    switch (event.target.value) {
        case 'none':
            scalePos.display = 'none';
            break;
        case 'left-top':
            scalePos.top = '20px';
            scalePos.left = '20px';
            break;
        case 'left-bottom':
            scalePos.bottom = '20px';
            scalePos.left = '20px';
            break;
        case 'right-top':
            scalePos.top = '20px';
            scalePos.right = '20px';
            break;
        case 'right-bottom':
            scalePos.bottom = '20px';
            scalePos.right = '20px';
            break;
    }
    scale.style.top = scalePos.top;
    scale.style.left = scalePos.left;
    scale.style.bottom = scalePos.bottom;
    scale.style.right = scalePos.right;
    scale.style.display = scalePos.display;
    scale.innerHTML = scaleSet(scaleLength.value);
});
scaleColor.addEventListener('input', (event) => {
    scale.innerHTML = scaleSet(scaleLength.value);
    scale.style.color = event.target.value;
})
document.getElementById('config-data-export').addEventListener('click', () => {
    let lineData = [];
    for (let i = 0; i < drawObjects.length; i++) {
        if (drawObjects[i].type === 'lineHor' || drawObjects[i].type === 'lineVer' || drawObjects[i].type === 'lineCircle') {
            lineData.push(drawObjects[i]);
        }
    }
    const configData = {
        camera: {
            brightness: configCameraBrightness.number.value,
            exposureMode: configExposureMode.isActive,
            gain: configCameraExposureCompensation.number.value,
            exposure: configCameraExposureTime.number.value,
            contrast: configCameraContrast.number.value,
            saturation: configCameraSaturation.number.value,
            sharpness: configCameraSharpness.number.value,
            whitebalanceMode: configWhitebalanceMode.isActive,
            colorTemp: configCameraColorTemp.number.value
        },
        calibration: calibrationData,
        line: lineData
    };
    const exportData = JSON.stringify(configData);
    const blob = new Blob([exportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.href = url;
    a.download = 'WebCamPlus_configData.json';
    a.click();
    window.URL.revokeObjectURL(url);
    menuBarAllHide();
});
document.getElementById('cambrowser').addEventListener('click', () => {
    let url = urlCamBrowser;
    const winSize = [window.parent.screen.width, window.parent.screen.height];
    let windowFeatures = `status=yes, width=${winSize[0] * 0.8}, height=${winSize[1] * 0.8}`;

    window.open(url, '_blank', windowFeatures);
});
document.getElementById('cambrowser-explain').href = urlCamBrowserExplain;
document.getElementById('open-web-explain').addEventListener('click', () => {
    window.open(urlWebExplain, '_blank');
});
document.getElementById('open-web-request').addEventListener('click', () => {
    window.open(urlWebRequest, '_blank');
});
const fullSize = document.getElementById('full');
let isFullSize = false;
fullSize.addEventListener('click', () => {
    isFullSize = !isFullSize;
    if (isFullSize) {
        windowTop.style.display = 'none';
        windowMiddle.style.display = 'none';
        windowBottom.style.display = 'none';
        workSpace.style.height = '100vh';
    } else {
        windowTop.style.display = 'block';
        windowMiddle.style.display = 'flex';
        windowBottom.style.display = 'flex';
        workSpace.style.height = 'calc(100vh - 147px);';
        windowResize()
    }
});
const cameraCtrl = document.getElementById('camera-ctrl');
cameraCtrlShow.addEventListener('click', () => {
    cameraCtrl.style.top = '100px';
    cameraCtrl.style.left = '30px';
    cameraCtrl.style.display = 'flex';
    menuBarShow = false;
    menuBarAllHide();
})
const cameraCtrlBar = document.getElementById('camera-ctrl-bar');
let isCameraCtrlMoving = false;
let cameraCtrlPosition = [0, 0, 0, 0];
cameraCtrlBar.addEventListener('mousedown', (event) => {
    isCameraCtrlMoving = true;
    const windowStyle = window.getComputedStyle(cameraCtrl);
    cameraCtrlPosition[0] = parseFloat(windowStyle.getPropertyValue('left'));
    cameraCtrlPosition[1] = parseFloat(windowStyle.getPropertyValue('top'));
    cameraCtrlPosition[2] = event.clientX;
    cameraCtrlPosition[3] = event.clientY;
});
document.addEventListener('mousemove', (event) => {
    if (isCameraCtrlMoving) {
        cameraCtrl.style.left = `${Math.max(cameraCtrlPosition[0] + event.clientX - cameraCtrlPosition[2], 0)}px`;
        cameraCtrl.style.top = `${Math.max(cameraCtrlPosition[1] + event.clientY - cameraCtrlPosition[3], 0)}px`;
    }
});
cameraCtrlBar.addEventListener('mouseup', () => {
    isCameraCtrlMoving = false;
});
const cameraCtrlClose = document.getElementById('camera-ctrl-close');
cameraCtrlClose.addEventListener('click', () => {
    cameraCtrl.style.display = 'none';
});
class SliderGenerater {
    constructor(id) {
        this.range = document.getElementById(id);
        this.number = document.getElementById(`${id}-value`);
        this.range.addEventListener('input', (event) => {
            this.cameraCtrl(parseInt(event.target.value));
            this.number.value = parseInt(event.target.value);
        });
        this.number.addEventListener('input', (event) => {
            this.cameraCtrl(parseInt(event.target.value));
            this.range.value = parseInt(event.target.value);
        });
    }
    setValue(param) {
        this.cameraCtrl(param);
        this.range.value = param;
        this.number.value = param;
    }
    cameraCtrl() { }
}
class ToggleBtnGenerater {
    constructor(id) {
        this.base = document.getElementById(id);
        this.switch = document.getElementById(`${id}-switch`);
        this.isActive = false;
        this.base.addEventListener('click', () => {
            this.toggle();
            this.clickEvent();
        });
    }
    toggle() {
        this.isActive = !this.isActive;
        if (this.isActive) {
            this.base.classList.add('toggle-base-active');
            this.switch.classList.add('toggle-switch-active');
        } else {
            this.base.classList.remove('toggle-base-active');
            this.switch.classList.remove('toggle-switch-active');
        }
    }
    clickEvent() { }
}
const configCameraBrightness = new SliderGenerater('config-camera-brightness');
configCameraBrightness.cameraCtrl = (param) => {
    ctrlBrightness(param);
}
const winCompoExposure = document.getElementById('window-component-exposure');
const winCompoGain = document.getElementById('window-component-gain');
const configExposureMode = new ToggleBtnGenerater('config-camera-exposure-mode');
configExposureMode.base.click();
configExposureMode.clickEvent = () => {
    if (configExposureMode.isActive) {
        ctrlExposureMode('continuous');
        winCompoGain.style.display = 'block';
        winCompoExposure.style.display = 'none';
        configCameraExposureTime.setValue(-8);
    } else {
        ctrlExposureMode('manual');
        winCompoGain.style.display = 'none';
        winCompoExposure.style.display = 'block';
    }
};
const configCameraExposureCompensation = new SliderGenerater('config-camera-exposure-compensation');
configCameraExposureCompensation.cameraCtrl = (param) => {
    ctrlExposureCompensation(param);
}
const configCameraExposureTime = new SliderGenerater('config-camera-exposure-time');
const exposureParameter = [
    1.220703125,
    2.44140625,
    3.662109375,
    6.103515625,
    10.98632813,
    20.75195313,
    40.28320313,
    79.34570313,
    158.6914063,
    313.7207031,
    627.4414063,
    1251.220703,
    2501.220703,
    5001.220703,
    20000,
    40000,
    80000
];
configCameraExposureTime.cameraCtrl = (param) => {
    ctrlExposureTime(exposureParameter[parseInt(param + 13, 10)]);
}
const configCameraContrast = new SliderGenerater('config-camera-contrast');
configCameraContrast.cameraCtrl = (param) => {
    ctrlContrast(param);
}
const configCameraSaturation = new SliderGenerater('config-camera-saturation');
configCameraSaturation.cameraCtrl = (param) => {
    ctrlSaturation(param);
}
const configCameraSharpness = new SliderGenerater('config-camera-sharpness');
configCameraSharpness.cameraCtrl = (param) => {
    ctrlSharpness(param);
}
const winCompoColorTemp = document.getElementById('window-component-colortemp');
const configWhitebalanceMode = new ToggleBtnGenerater('config-camera-whitebalance-mode');
configWhitebalanceMode.base.click();
configWhitebalanceMode.clickEvent = () => {
    if (configWhitebalanceMode.isActive) {
        ctrlWhitebalanceMode('continuous');
        winCompoColorTemp.style.display = 'none';
        configCameraColorTemp.setValue(128);
    } else {
        ctrlWhitebalanceMode('manual');
        winCompoColorTemp.style.display = 'block';
    }
};
const configCameraColorTemp = new SliderGenerater('config-camera-colorTemperature');
configCameraColorTemp.cameraCtrl = (param) => {
    ctrlColorTemperature(param);
}
const configCameraReset = document.getElementById('config-camera-reset');
configCameraReset.addEventListener('click', () => {
    configCameraBrightness.setValue(0);
    if (!configExposureMode.isActive) configExposureMode.base.click();
    configCameraExposureCompensation.setValue(32);
    configCameraContrast.setValue(40);
    configCameraSaturation.setValue(64);
    configCameraSharpness.setValue(80);
    if (!configWhitebalanceMode.isActive) configWhitebalanceMode.base.click();
});
const calibrationWindow = document.getElementById('calibration');
calibrationStart.addEventListener('click', () => {
    calibrationWindow.style.top = '100px';
    calibrationWindow.style.left = '30px';
    calibrationWindow.style.display = 'flex';
    calibrationClick.style.display = 'block';
    calibrationPitch.style.display = 'none';
    drawMode = 'calibration';
    eventCanvas.style.cursor = "crosshair";
    scaleTrace = [];
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.width);
    menuBarShow = false;
    menuBarAllHide();
})
const calibrationWindowBar = document.getElementById('calibratin-window-bar');
let isCalibrationWindowMoving = false;
let calibrationWindowPosition = [0, 0, 0, 0];
calibrationWindowBar.addEventListener('mousedown', (event) => {
    isCalibrationWindowMoving = true;
    const windowStyle = window.getComputedStyle(calibrationWindow);
    calibrationWindowPosition[0] = parseFloat(windowStyle.getPropertyValue('left'));
    calibrationWindowPosition[1] = parseFloat(windowStyle.getPropertyValue('top'));
    calibrationWindowPosition[2] = event.clientX;
    calibrationWindowPosition[3] = event.clientY;
});
document.addEventListener('mousemove', (event) => {
    if (isCalibrationWindowMoving) {
        calibrationWindow.style.left = `${Math.max(calibrationWindowPosition[0] + event.clientX - calibrationWindowPosition[2], 0)}px`;
        calibrationWindow.style.top = `${Math.max(calibrationWindowPosition[1] + event.clientY - calibrationWindowPosition[3], 0)}px`;
    }
});
calibrationWindowBar.addEventListener('mouseup', () => {
    isCalibrationWindowMoving = false;
});
const calibrationWindowClose = document.getElementById('calibratin-window-close');
calibrationWindowClose.addEventListener('click', () => {
    calibrationWindow.style.display = 'none';
    drawCancel.click();
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.width);
    for (let i = 0; i < drawObjects.length; i++) {
        if (drawObjects[i].show && drawObjects[i].type != 'lineHor' && drawObjects[i].type != 'lineVer' && drawObjects[i].type != 'lineCircle') {
            redrawObject(drawObjects[i], drawCtx);
        }
    }
});
const calibrationClick = document.getElementById('calibration-click');
const calibrationTraceEnd = document.getElementById('calibration-trace-end');
const calibrationTraceReset = document.getElementById('calibration-trace-reset');
const calibrationPitch = document.getElementById('calibration-pitch');
const calibrationPitchValue = document.getElementById('calibration-pitch-value');
const calibrationEnd = document.getElementById('calibration-end');
const calibrationBack = document.getElementById('calibration-back');
const calibrationDataInd = document.getElementById('calibration-data');
calibrationTraceReset.addEventListener('click', () => {
    scaleTrace = [];
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.width);
});
calibrationTraceEnd.addEventListener('click', () => {
    if (scaleTrace.length < 2) {
        popupMsgShow('定規の目盛やスケールの交点を2点以上選択してください');
        return;
    }
    calibrationClick.style.display = 'none';
    calibrationPitch.style.display = 'block';
});
calibrationBack.addEventListener('click', () => {
    calibrationClick.style.display = 'block';
    calibrationPitch.style.display = 'none';
});
calibrationEnd.addEventListener('click', () => {
    let dstData = [[], 0];
    for (let i = 0; i < scaleTrace.length; i++) {
        for (let j = i + 1; j < scaleTrace.length; j++) {
            const dst = Math.sqrt((scaleTrace[j][0] - scaleTrace[i][0]) ** 2 + (scaleTrace[j][1] - scaleTrace[i][1]) ** 2);
            dstData[0].push(dst);
            dstData[1] += dst;
        }
    }
    dstData[0].sort((a, b) => a - b);
    for (let i = 1; i < dstData[0].length; i++) {
        if (dstData[0][i] > dstData[0][0] * 1.1) {
            dstData[1] -= dstData[0][i];
            dstData[0].splice(i, 1);
            i--;
        }
    }
    dstData = dstData[1] / dstData[0].length;
    calibrationData = parseFloat(calibrationPitchValue.value) / dstData;
    calibrationDataInd.value = calibrationData.toFixed(5);
    if (scaleStyle.value != 'none') scale.innerHTML = scaleSet(scaleLength.value);
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.width);
    for (let i = 0; i < drawObjects.length; i++) {
        if (drawObjects[i].show && drawObjects[i].type != 'lineHor' && drawObjects[i].type != 'lineVer' && drawObjects[i].type != 'lineCircle') {
            redrawObject(drawObjects[i], drawCtx);
        }
    }
    drawCancel.click();
    calibrationWindowClose.click();
});
const autoTrace = document.getElementById('calibration-auto-trace');
autoTrace.addEventListener('click', () => {
    processCanvas.width = videoResolution.width;
    processCanvas.height = videoResolution.height;
    if (isVideoMode === 'realtime') {
        processCtx.drawImage(video, 0, 0, processCanvas.width, processCanvas.height);
    } else {
        processCtx.drawImage(videoCanvas, 0, 0, processCanvas.width, processCanvas.height);
    }
    let image = cv.imread('process-canvas');
    const grayImage = new cv.Mat();
    cv.cvtColor(image, grayImage, cv.COLOR_RGBA2GRAY, 0);
    const binaryImage = new cv.Mat();
    cv.threshold(grayImage, binaryImage, 127, 255, cv.THRESH_OTSU);
    let labels = new cv.Mat();
    let stats = new cv.Mat();
    let centroids = new cv.Mat();
    const connectivity = 8;
    let numLabels = cv.connectedComponentsWithStats(binaryImage, labels, stats, centroids, connectivity);
    let labelingObjects = [];
    let scalePitch = [];
    for (let i = 1; i < numLabels; i++) {
        let left = stats.data32S[i * stats.cols];
        let top = stats.data32S[i * stats.cols + 1];
        let width = stats.data32S[i * stats.cols + 2];
        let height = stats.data32S[i * stats.cols + 3];
        let area = stats.data32S[i * stats.cols + 4];
        if (area >= 1000) {
            labelingObjects.push({
                left: left,
                top: top,
                right: left + width,
                bottom: top + height
            });
            scalePitch.push(width);
        }
    }
    scalePitch.sort();
    scalePitch = scalePitch[Math.floor(scalePitch.length / 2)];
    for (let i = 0; i < labelingObjects.length; i++) {
        let object1; let object2; let object3;
        for (let j = 0; j < labelingObjects.length; j++) {
            const deltaX = labelingObjects[j].right - labelingObjects[i].right;
            const deltaY = labelingObjects[j].bottom - labelingObjects[i].bottom;
            if (((scalePitch / 2 < deltaX) && (deltaX < scalePitch * 3 / 2)) && ((-scalePitch / 2 < deltaY) && (deltaY < scalePitch / 2))) {
                object1 = j;
            }
            if (((-scalePitch / 2 < deltaX) && (deltaX < scalePitch / 2)) && ((scalePitch / 2 < deltaY) && (deltaY < scalePitch * 3 / 2))) {
                object2 = j;
            }
            if (((scalePitch / 2 < deltaX) && (deltaX < scalePitch * 3 / 2)) && ((scalePitch / 2 < deltaY) && (deltaY < scalePitch * 3 / 2))) {
                object3 = j;
            }
        }
        if (typeof object1 === 'undefined' || typeof object2 === 'undefined' || typeof object3 === 'undefined') continue;
        const crossX = (labelingObjects[i].right + labelingObjects[object2].right + labelingObjects[object1].left + labelingObjects[object3].left) / 4;
        const crossY = (labelingObjects[i].bottom + labelingObjects[object1].bottom + labelingObjects[object2].top + labelingObjects[object3].top) / 4;
        const crossWidth = 20 * (videoResolution.width / 2592);
        const startX = crossX - crossWidth / 2;
        const startY = crossY - crossWidth / 2;
        drawLine(startX, startY, startX + crossWidth, startY + crossWidth, 'solid', accentColor, lineGuideStyle.width, drawCtx);
        drawLine(startX + crossWidth, startY, startX, startY + crossWidth, 'solid', accentColor, lineGuideStyle.width, drawCtx);
        scaleTrace.push([crossX, crossY]);
    }
    grayImage.delete();
    binaryImage.delete();
    labels.delete();
    stats.delete();
    centroids.delete();
});
const drawCancel = document.getElementById('draw-cancel');
drawCancel.addEventListener('click', () => {
    drawActiveReset();
    drawMode = 'none';
    toolConfig.style.display = 'none';
    shadowMaskAdd.classList.remove('ctrl-menu-btn-active');
});
const toolBarDrawing = document.getElementById('drawing');
const toolBarMeasuring = document.getElementById('measuring');
const drawingTools = document.getElementById('drawing-tools');
const measuringTools = document.getElementById('measuring-tools');
const toolConfig = document.getElementById('tool-config');
const drawFunction = document.getElementById('draw-function');
toolBarDrawing.addEventListener('click', () => {
    if (toolBarDrawing.classList.contains('tool-bar-icon-active')) {
        toolBarDrawing.classList.remove('tool-bar-icon-active');
        drawingTools.style.display = 'none';
        measuringTools.style.display = 'none';
        drawCancel.click();
        drawFunction.style.display = 'none';
    } else {
        toolBarDrawing.classList.add('tool-bar-icon-active');
        toolBarMeasuring.classList.remove('tool-bar-icon-active');
        drawingTools.style.display = 'flex';
        measuringTools.style.display = 'none';
        drawCancel.click();
        drawFunction.style.display = 'flex';
    }
});
toolBarMeasuring.addEventListener('click', () => {
    if (toolBarMeasuring.classList.contains('tool-bar-icon-active')) {
        toolBarMeasuring.classList.remove('tool-bar-icon-active');
        drawingTools.style.display = 'none';
        measuringTools.style.display = 'none';
        drawCancel.click();
        drawFunction.style.display = 'none';
    } else {
        toolBarDrawing.classList.remove('tool-bar-icon-active');
        toolBarMeasuring.classList.add('tool-bar-icon-active');
        drawingTools.style.display = 'none';
        measuringTools.style.display = 'flex';
        drawCancel.click();
        drawFunction.style.display = 'flex';
    }
});
let drawStyle = {
    startLineStyle: 'none',
    lineStyle: 'solid',
    endLineStyle: 'arrow',
    lineWidth: 5,
    lineColor: 'rgb(255, 0, 0)',
    fillColor: 'none',
    fontSize: 40,
    digit: 2
};
class ToolConfigChanger {
    constructor(id, group, style) {
        this.icon = document.getElementById(id);
        this.icon.addEventListener('click', () => {
            switch (group) {
                case 'startLineStyle':
                    drawStyle.startLineStyle = style;
                    selectStyleStart.innerHTML = `<img class="style-start" src="img/start_${style}.png" alt="${style}">`;
                    styleStartSelector.style.display = 'none';
                    isStyleStartSelector = false;
                    break;
                case 'lineStyle':
                    drawStyle.lineStyle = style;
                    selectStyleLine.innerHTML = `<img class="style-line" src="img/line_${style}.png" alt="${style}">`;
                    styleLineSelector.style.display = 'none';
                    isStyleLineSelector = false;
                    break;
                case 'endLineStyle':
                    drawStyle.endLineStyle = style;
                    selectStyleEnd.innerHTML = `<img class="style-start" src="img/end_${style}.png" alt="${style}">`;
                    styleEndSelector.style.display = 'none';
                    isStyleEndSelector = false;
                    break;
                case 'drawColor':
                    drawStyle.lineColor = window.getComputedStyle(this.icon).backgroundColor;
                    drawColor.style.backgroundColor = window.getComputedStyle(this.icon).backgroundColor;
                    drawColorSelector.style.display = 'none';
                    isDrawColorSelector = false;
                    break;
                case 'fillColor':
                    if (style === 'none') {
                        drawStyle.fillColor = 'none';
                        fillColor.innerText = 'なし';
                    } else {
                        drawStyle.fillColor = window.getComputedStyle(this.icon).backgroundColor;
                        fillColor.innerText = '';
                    }
                    fillColor.style.backgroundColor = window.getComputedStyle(this.icon).backgroundColor;
                    fillColorSelector.style.display = 'none';
                    isFillColorSelector = false;
                    break;
                case 'lineColor':
                    lineGuideStyle.color = window.getComputedStyle(this.icon).backgroundColor;
                    lineColor.style.backgroundColor = window.getComputedStyle(this.icon).backgroundColor;
                    lineColorSelector.style.display = 'none';
                    isLineColorSelector = false;
                    break;
            }
        });
    }
}
const circle2point = document.getElementById('circle-2point');
const circle3point = document.getElementById('circle-3point');
document.getElementById('circle-mode-2point').addEventListener('click', () => {
    circle2point.style.display = "flex";
    circle3point.style.display = 'none';
    drawActiveReset();
})
document.getElementById('circle-mode-3point').addEventListener('click', () => {
    circle2point.style.display = "none";
    circle3point.style.display = 'flex';
    drawActiveReset();
})
const lineStyleLabel = document.getElementById('line-style-label');
const lineStyle = document.getElementById('line-style');
const selectStyleStart = document.getElementById('select-style-start');
selectStyleStart.addEventListener('click', () => {
    isStyleStartSelector = !isStyleStartSelector;
    if (isStyleStartSelector) {
        styleStartSelector.style.display = 'flex';
    } else {
        styleStartSelector.style.display = 'none';
    }
});
const styleStartSelector = document.getElementById('style-start-selector');
let isStyleStartSelector = false;
const startStyleNone = new ToolConfigChanger('start-line-style-none', 'startLineStyle', 'none');
const startStyleArrow = new ToolConfigChanger('start-line-style-arrow', 'startLineStyle', 'arrow');
const startStyleDot = new ToolConfigChanger('start-line-style-dot', 'startLineStyle', 'dot');
const startStyleLine = new ToolConfigChanger('start-line-style-line', 'startLineStyle', 'line');
const selectStyleLine = document.getElementById('select-style-line');
selectStyleLine.addEventListener('click', () => {
    isStyleLineSelector = !isStyleLineSelector;
    if (isStyleLineSelector) {
        styleLineSelector.style.display = 'flex';
    } else {
        styleLineSelector.style.display = 'none';
    }
});
const styleLineSelector = document.getElementById('style-line-selector');
let isStyleLineSelector = false;
const lineStyleSolid = new ToolConfigChanger('line-style-solid', 'lineStyle', 'solid');
const lineStyleDash = new ToolConfigChanger('line-style-dash', 'lineStyle', 'dash');
const selectStyleEnd = document.getElementById('select-style-end');
selectStyleEnd.addEventListener('click', () => {
    isStyleEndSelector = !isStyleEndSelector;
    if (isStyleEndSelector) {
        styleEndSelector.style.display = 'flex';
    } else {
        styleEndSelector.style.display = 'none';
    }
});
const styleEndSelector = document.getElementById('style-end-selector');
let isStyleEndSelector = false;
const endStyleNone = new ToolConfigChanger('end-line-style-none', 'endLineStyle', 'none');
const endStyleArrow = new ToolConfigChanger('end-line-style-arrow', 'endLineStyle', 'arrow');
const endStyleDot = new ToolConfigChanger('end-line-style-dot', 'endLineStyle', 'dot');
const endStyleLine = new ToolConfigChanger('end-line-style-line', 'endLineStyle', 'line');
const drawingLineWidth = document.getElementById('drawing-width');
const drawLineWidth = document.getElementById('draw-line-width');
drawLineWidth.addEventListener('wheel', (event) => {
    if (event.deltaY < 0) drawLineWidth.value = Math.min(parseInt(drawLineWidth.value, 10) + 1, drawLineWidth.max);
    else drawLineWidth.value = Math.max(parseInt(drawLineWidth.value, 10) - 1, drawLineWidth.min);
    drawStyle.lineWidth = parseInt(drawLineWidth.value, 10);
});
drawLineWidth.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') drawLineWidth.blur();
});
drawLineWidth.addEventListener('blur', () => {
    drawLineWidth.value = Math.min(Math.max(drawLineWidth.value, drawLineWidth.min), drawLineWidth.max);
    drawStyle.lineWidth = parseInt(drawLineWidth.value, 10);
});
const selectColor = document.getElementById('draw-color');
selectColor.addEventListener('click', () => {
    isDrawColorSelector = !isDrawColorSelector;
    if (isDrawColorSelector) {
        drawColorSelector.style.display = 'flex';
    } else {
        drawColorSelectordrawColorSelector.style.display = 'none';
    }
});
const drawColor = document.getElementById('select-draw-color');
const drawColorSelector = document.getElementById('draw-color-selector');
let isDrawColorSelector = false;
const drawColorRed = new ToolConfigChanger('draw-color-red', 'drawColor', 'red');
const drawColorYellow = new ToolConfigChanger('draw-color-yellow', 'drawColor', 'yellow');
const drawColorGreen = new ToolConfigChanger('draw-color-green', 'drawColor', 'green');
const drawColorLightblue = new ToolConfigChanger('draw-color-lightblue', 'drawColor', 'lightblue');
const drawColorBlue = new ToolConfigChanger('draw-color-blue', 'drawColor', 'blue');
const drawColorPink = new ToolConfigChanger('draw-color-pink', 'drawColor', 'pink');
const drawingFontSize = document.getElementById('drawing-font-size');
const fontSize = document.getElementById('font-size');
fontSize.addEventListener('wheel', (event) => {
    if (event.deltaY < 0) fontSize.value = Math.min(parseInt(fontSize.value, 10) + 5, fontSize.max);
    else fontSize.value = Math.max(parseInt(fontSize.value, 10) - 5, fontSize.min);
    drawStyle.fontSize = parseInt(fontSize.value, 10);
});
fontSize.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') fontSize.blur();
});
fontSize.addEventListener('blur', () => {
    fontSize.value = Math.min(Math.max(fontSize.value, fontSize.min), fontSize.max);
    drawStyle.fontSize = parseInt(fontSize.value, 10);
});
const drawingFillColor = document.getElementById('drawing-fill-color');
const selectFillColor = document.getElementById('fill-color');
selectFillColor.addEventListener('click', () => {
    isFillColorSelector = !isFillColorSelector;
    if (isFillColorSelector) {
        fillColorSelector.style.display = 'flex';
    } else {
        fillColorSelector.style.display = 'none';
    }
});
const fillColor = document.getElementById('select-fill-color');
const fillColorSelector = document.getElementById('fill-color-selector');
let isFillColorSelector = false;
const fillColorNone = new ToolConfigChanger('fill-color-none', 'fillColor', 'none');
const fillColorRed = new ToolConfigChanger('fill-color-red', 'fillColor', 'red');
const fillColorYellow = new ToolConfigChanger('fill-color-yellow', 'fillColor', 'yellow');
const fillColorGreen = new ToolConfigChanger('fill-color-green', 'fillColor', 'green');
const fillColorLightblue = new ToolConfigChanger('fill-color-lightblue', 'fillColor', 'lightblue');
const fillColorBlue = new ToolConfigChanger('fill-color-blue', 'fillColor', 'blue');
const fillColorPink = new ToolConfigChanger('fill-color-pink', 'fillColor', 'pink');
let drawMode = 'none';
class DrawTool {
    constructor(id, mode, configShow, labelName, lineStyleShow, lineWidthShow, fontSizeShow, fillColorShow) {
        this.btn = document.getElementById(id);
        this.type = id;
        this.btn.addEventListener('click', () => {
            drawModeChange(this.btn, mode, configShow, labelName, lineStyleShow, lineWidthShow, fontSizeShow, fillColorShow);
        });
    }
}
const drawLineTool = new DrawTool('draw-line', 'drawLine', true, '線のスタイル', [true, false], true, false, false);
const drawArrowTool = new DrawTool('draw-arrow', 'drawArrow', true, '線のスタイル', [true, true], true, false, false);
const drawRectTool = new DrawTool('draw-rect', 'drawRect', true, '線のスタイル', [true, false], true, false, true);
const drawPolygonTool = new DrawTool('draw-polygon', 'drawPolygon', true, '線のスタイル', [true, false], true, false, true);
const drawCircleTool = new DrawTool('draw-circle', 'drawCircle', true, '線のスタイル', [true, false], true, false, true);
const drawTextTool = new DrawTool('draw-text', 'drawText', true, '文字のスタイル', [false, false], false, true, false);
const measureTwoPointTool = new DrawTool('measure-two-point', 'measureTwoPoint', true, '線のスタイル', [false, false], true, true, false);
const measureMultiPointTool = new DrawTool('measure-multi-point', 'measureMultiPoint', true, '線のスタイル', [false, false], true, true, false);
const measureParallelTool = new DrawTool('measure-parallel', 'measureParallel', true, '線のスタイル', [false, false], true, true, false);
const measureCircleRadiusTool2 = new DrawTool('measure-circle2-radius', 'measureCircleRadius2', true, '線のスタイル', [false, false], true, true, false);
const measureCircleDiameterTool2 = new DrawTool('measure-circle2-diameter', 'measureCircleDiameter2', true, '線のスタイル', [false, false], true, true, false);
const measureCircleLengthTool2 = new DrawTool('measure-circle2-length', 'measureCircleLength2', true, '線のスタイル', [false, false], true, true, false);
const measureCircleAreaTool2 = new DrawTool('measure-circle2-area', 'measureCircleArea2', true, '線のスタイル', [false, false], true, true, false);
const measureCircleCenterTool2 = new DrawTool('measure-circle2-center', 'measureCircleCenter2', true, '線のスタイル', [false, false], true, true, false);
const measureCircleRadiusTool3 = new DrawTool('measure-circle3-radius', 'measureCircleRadius3', true, '線のスタイル', [false, false], true, true, false);
const measureCircleDiameterTool3 = new DrawTool('measure-circle3-diameter', 'measureCircleDiameter3', true, '線のスタイル', [false, false], true, true, false);
const measureCircleLengthTool3 = new DrawTool('measure-circle3-length', 'measureCircleLength3', true, '線のスタイル', [false, false], true, true, false);
const measureCircleAreaTool3 = new DrawTool('measure-circle3-area', 'measureCircleArea3', true, '線のスタイル', [false, false], true, true, false);
const measureCircleCenterTool3 = new DrawTool('measure-circle3-center', 'measureCircleCenter3', true, '線のスタイル', [false, false], true, true, false);
const measureArcRadiusTool = new DrawTool('measure-arc-radius', 'measureArcRadius', true, '線のスタイル', [false, false], true, true, false);
const measureArcLengthTool = new DrawTool('measure-arc-length', 'measureArcLength', true, '線のスタイル', [false, false], true, true, false);
const measurePointAngleTool = new DrawTool('measure-point-angle', 'measurePointAngle', true, '線のスタイル', [false, false], true, true, false);
const measureLineAngleTool = new DrawTool('measure-line-angle', 'measureLineAngle', true, '線のスタイル', [false, false], true, true, false);
const measureRectLengthTool = new DrawTool('measure-rect-length', 'measureRectLength', true, '線のスタイル', [false, false], true, true, false);
const measureRectAreaTool = new DrawTool('measure-rect-area', 'measureRectArea', true, '線のスタイル', [false, false], true, true, false);
const measurePolygonLengthTool = new DrawTool('measure-polygon-length', 'measurePolygonLength', true, '線のスタイル', [false, false], true, true, false);
const measurePolygonAreaTool = new DrawTool('measure-polygon-area', 'measurePolygonArea', true, '線のスタイル', [false, false], true, true, false);
const drawMove = new DrawTool('draw-move', 'drawMove', false, '線のスタイル', [true, false], true, false, false);
const drawDelete = new DrawTool('draw-delete', 'drawDelete', false, '線のスタイル', [false, false], false, false, false);
const lineHorTool = new DrawTool('line-horizontal', 'lineHor', false, '線のスタイル', [false, false], false, false, false);
const lineVerTool = new DrawTool('line-vertical', 'lineVer', false, '線のスタイル', [false, false], false, false, false);
const lineCircleTool = new DrawTool('line-circle', 'lineCircle', false, '線のスタイル', [false, false], false, false, false);
const lineMove = new DrawTool('line-move', 'lineMove', false, '線のスタイル', [false, false], false, false, false);
const lineDelete = new DrawTool('line-delete', 'lineDelete', false, '線のスタイル', [false, false], false, false, false);
const drawTools = [
    drawLineTool, drawArrowTool, drawRectTool, drawPolygonTool, drawCircleTool, drawTextTool,
    measureTwoPointTool, measureMultiPointTool, measureCircleRadiusTool2, measureCircleDiameterTool2, measureCircleLengthTool2, measureCircleAreaTool2, measureCircleCenterTool2, measureCircleRadiusTool3, measureCircleDiameterTool3, measureCircleLengthTool3, measureCircleAreaTool3, measureCircleCenterTool3, measureArcRadiusTool, measureArcLengthTool, measurePointAngleTool, measureLineAngleTool, measureRectLengthTool, measureRectAreaTool, measurePolygonLengthTool, measurePolygonAreaTool, measureParallelTool,
    drawMove, drawDelete,
    lineHorTool, lineVerTool, lineCircleTool, lineMove, lineDelete
];
function drawActiveReset() {
    for (let i = 0; i < drawTools.length; i++) {
        drawTools[i].btn.classList.remove('tool-bar-icon-active');
        drawTools[i].btn.classList.remove('tool-bar-icon-accent');
    }
    drawMode = 'none';
    drawModeOpt = ['none'];
    toolConfig.style.display = 'none';
    eventCanvas.style.cursor = "grab";
}
let drawModeOpt = ['none'];
function drawModeChange(element, mode, configShow, label, lineStyleShow, lineWidthShow, fontSizeShow, fillColorShow) {
    if (drawMode === 'calibration') {
        popupMsgShow('寸法校正を終了してください');
        return;
    }
    if (mode === 'measureTwoPoint') {
        if (drawMode === 'measureMultiPoint' && drawModeOpt[0] != 'eachLength') {
            element.classList.add('tool-bar-icon-active');
            drawModeOpt = ['eachLength'];
        } else if (drawMode === 'measureMultiPoint' && drawModeOpt[0] === 'eachLength') {
            element.classList.remove('tool-bar-icon-active');
            drawModeOpt = ['none'];
        } else if (mode != drawMode) {
            drawActiveReset();
            element.classList.add('tool-bar-icon-active');
            drawMode = 'measureTwoPoint';
            drawModeOpt = ['eachLength'];
        } else drawActiveReset();
    } else if (mode === 'measureMultiPoint') {
        if (drawMode === 'measureTwoPoint') {
            element.classList.add('tool-bar-icon-active');
            drawMode = 'measureMultiPoint'
        } else if (drawModeOpt[0] === 'eachLength') {
            element.classList.remove('tool-bar-icon-active');
            drawMode = 'measureTwoPoint';
        } else if (mode != drawMode) {
            drawActiveReset();
            element.classList.add('tool-bar-icon-active');
            drawMode = 'measureMultiPoint';
        } else drawActiveReset();
    } else if (mode === 'measureCircleRadius2') {
        if (drawMode === 'measureCircle2') {
            if (drawModeOpt[0] === 'none') {
                element.classList.add('tool-bar-icon-active');
                drawModeOpt[0] = 'radius';
            } else if (!(drawModeOpt[0] === 'radius' && drawModeOpt[1] === 'none' && drawModeOpt[2] === 'none' && drawModeOpt[3] === 'none' && drawModeOpt[4] === 'none')) {
                element.classList.remove('tool-bar-icon-active');
                drawModeOpt[0] = 'none';
            } else {
                drawActiveReset();
            }
        } else if (mode != drawMode) {
            drawActiveReset();
            element.classList.add('tool-bar-icon-active');
            drawMode = 'measureCircle2';
            drawModeOpt = ['radius', 'none', 'none', 'none', 'none'];
        } else drawActiveReset();
    } else if (mode === 'measureCircleDiameter2') {
        if (drawMode === 'measureCircle2') {
            if (drawModeOpt[1] === 'none') {
                element.classList.add('tool-bar-icon-active');
                drawModeOpt[1] = 'diameter';
            } else if (!(drawModeOpt[0] === 'none' && drawModeOpt[1] === 'diameter' && drawModeOpt[2] === 'none' && drawModeOpt[3] === 'none' && drawModeOpt[4] === 'none')) {
                element.classList.remove('tool-bar-icon-active');
                drawModeOpt[1] = 'none';
            } else drawActiveReset();
        } else if (mode != drawMode) {
            drawActiveReset();
            element.classList.add('tool-bar-icon-active');
            drawMode = 'measureCircle2';
            drawModeOpt = ['none', 'diameter', 'none', 'none', 'none'];
        } else drawActiveReset();
    } else if (mode === 'measureCircleLength2') {
        if (drawMode === 'measureCircle2') {
            if (drawModeOpt[2] === 'none') {
                element.classList.add('tool-bar-icon-active');
                drawModeOpt[2] = 'length';
            } else if (!(drawModeOpt[0] === 'none' && drawModeOpt[1] === 'none' && drawModeOpt[2] === 'length' && drawModeOpt[3] === 'none' && drawModeOpt[4] === 'none')) {
                element.classList.remove('tool-bar-icon-active');
                drawModeOpt[2] = 'none';
            } else drawActiveReset();
        } else if (mode != drawMode) {
            drawActiveReset();
            element.classList.add('tool-bar-icon-active');
            drawMode = 'measureCircle2';
            drawModeOpt = ['none', 'none', 'length', 'none', 'none'];
        } else drawActiveReset();
    } else if (mode === 'measureCircleArea2') {
        if (drawMode === 'measureCircle2') {
            if (drawModeOpt[3] === 'none') {
                element.classList.add('tool-bar-icon-active');
                drawModeOpt[3] = 'area';
            } else if (!(drawModeOpt[0] === 'none' && drawModeOpt[1] === 'none' && drawModeOpt[2] === 'none' && drawModeOpt[3] === 'area' && drawModeOpt[4] === 'none')) {
                element.classList.remove('tool-bar-icon-active');
                drawModeOpt[3] = 'none';
            } else drawActiveReset();
        } else if (mode != drawMode) {
            drawActiveReset();
            element.classList.add('tool-bar-icon-active');
            drawMode = 'measureCircle2';
            drawModeOpt = ['none', 'none', 'none', 'area', 'none'];
        } else drawActiveReset();
    } else if (mode === 'measureCircleCenter2') {
        if (drawMode === 'measureCircle2') {
            if (drawModeOpt[4] === 'none') {
                element.classList.add('tool-bar-icon-active');
                drawModeOpt[4] = 'center';
            } else if (!(drawModeOpt[0] === 'none' && drawModeOpt[1] === 'none' && drawModeOpt[2] === 'none' && drawModeOpt[3] === 'none' && drawModeOpt[4] === 'center')) {
                element.classList.remove('tool-bar-icon-active');
                drawModeOpt[4] = 'none';
            } else drawActiveReset();
        } else if (mode != drawMode) {
            drawActiveReset();
            element.classList.add('tool-bar-icon-active');
            drawMode = 'measureCircle2';
            drawModeOpt = ['none', 'none', 'none', 'none', 'center'];
        } else drawActiveReset();
    } else if (mode === 'measureCircleRadius3') {
        if (drawMode === 'measureCircle3') {
            if (drawModeOpt[0] === 'none') {
                element.classList.add('tool-bar-icon-active');
                drawModeOpt[0] = 'radius';
            } else if (!(drawModeOpt[0] === 'radius' && drawModeOpt[1] === 'none' && drawModeOpt[2] === 'none' && drawModeOpt[3] === 'none' && drawModeOpt[4] === 'none')) {
                element.classList.remove('tool-bar-icon-active');
                drawModeOpt[0] = 'none';
            } else {
                drawActiveReset();
            }
        } else if (mode != drawMode) {
            drawActiveReset();
            element.classList.add('tool-bar-icon-active');
            drawMode = 'measureCircle3';
            drawModeOpt = ['radius', 'none', 'none', 'none', 'none'];
        } else drawActiveReset();
    } else if (mode === 'measureCircleDiameter3') {
        if (drawMode === 'measureCircle3') {
            if (drawModeOpt[1] === 'none') {
                element.classList.add('tool-bar-icon-active');
                drawModeOpt[1] = 'diameter';
            } else if (!(drawModeOpt[0] === 'none' && drawModeOpt[1] === 'diameter' && drawModeOpt[2] === 'none' && drawModeOpt[3] === 'none' && drawModeOpt[4] === 'none')) {
                element.classList.remove('tool-bar-icon-active');
                drawModeOpt[1] = 'none';
            } else drawActiveReset();
        } else if (mode != drawMode) {
            drawActiveReset();
            element.classList.add('tool-bar-icon-active');
            drawMode = 'measureCircle3';
            drawModeOpt = ['none', 'diameter', 'none', 'none', 'none'];
        } else drawActiveReset();
    } else if (mode === 'measureCircleLength3') {
        if (drawMode === 'measureCircle3') {
            if (drawModeOpt[2] === 'none') {
                element.classList.add('tool-bar-icon-active');
                drawModeOpt[2] = 'length';
            } else if (!(drawModeOpt[0] === 'none' && drawModeOpt[1] === 'none' && drawModeOpt[2] === 'length' && drawModeOpt[3] === 'none' && drawModeOpt[4] === 'none')) {
                element.classList.remove('tool-bar-icon-active');
                drawModeOpt[2] = 'none';
            } else drawActiveReset();
        } else if (mode != drawMode) {
            drawActiveReset();
            element.classList.add('tool-bar-icon-active');
            drawMode = 'measureCircle3';
            drawModeOpt = ['none', 'none', 'length', 'none', 'none'];
        } else drawActiveReset();
    } else if (mode === 'measureCircleArea3') {
        if (drawMode === 'measureCircle3') {
            if (drawModeOpt[3] === 'none') {
                element.classList.add('tool-bar-icon-active');
                drawModeOpt[3] = 'area';
            } else if (!(drawModeOpt[0] === 'none' && drawModeOpt[1] === 'none' && drawModeOpt[2] === 'none' && drawModeOpt[3] === 'area' && drawModeOpt[4] === 'none')) {
                element.classList.remove('tool-bar-icon-active');
                drawModeOpt[3] = 'none';
            } else drawActiveReset();
        } else if (mode != drawMode) {
            drawActiveReset();
            element.classList.add('tool-bar-icon-active');
            drawMode = 'measureCircle3';
            drawModeOpt = ['none', 'none', 'none', 'area', 'none'];
        } else drawActiveReset();
    } else if (mode === 'measureCircleCenter3') {
        if (drawMode === 'measureCircle3') {
            if (drawModeOpt[4] === 'none') {
                element.classList.add('tool-bar-icon-active');
                drawModeOpt[4] = 'center';
            } else if (!(drawModeOpt[0] === 'none' && drawModeOpt[1] === 'none' && drawModeOpt[2] === 'none' && drawModeOpt[3] === 'none' && drawModeOpt[4] === 'center')) {
                element.classList.remove('tool-bar-icon-active');
                drawModeOpt[4] = 'none';
            } else drawActiveReset();
        } else if (mode != drawMode) {
            drawActiveReset();
            element.classList.add('tool-bar-icon-active');
            drawMode = 'measureCircle3';
            drawModeOpt = ['none', 'none', 'none', 'none', 'center'];
        } else drawActiveReset();
    } else if (mode === 'measureArcRadius') {
        if (drawMode === 'measureArc') {
            if (drawModeOpt[0] === 'none') {
                element.classList.add('tool-bar-icon-active');
                drawModeOpt = ['radius', 'length'];
            } else if (drawModeOpt[1] === 'length') {
                element.classList.remove('tool-bar-icon-active');
                drawModeOpt = ['none', 'length'];
            } else drawActiveReset();
        } else if (mode != drawMode) {
            drawActiveReset();
            element.classList.add('tool-bar-icon-active');
            drawMode = 'measureArc';
            drawModeOpt = ['radius', 'none'];
        } else drawActiveReset();
    } else if (mode === 'measureArcLength') {
        if (drawMode === 'measureArc') {
            if (drawModeOpt[1] === 'none') {
                element.classList.add('tool-bar-icon-active');
                drawModeOpt = ['radius', 'length'];
            } else if (drawModeOpt[0] === 'radius') {
                element.classList.remove('tool-bar-icon-active');
                drawModeOpt = ['radius', 'none'];
            } else drawActiveReset();
        } else if (mode != drawMode) {
            drawActiveReset();
            element.classList.add('tool-bar-icon-active');
            drawMode = 'measureArc';
            drawModeOpt = ['none', 'length'];
        } else drawActiveReset();
    } else if (mode === 'measureRectLength') {
        if (drawMode === 'measureRect') {
            if (drawModeOpt[0] === 'none') {
                element.classList.add('tool-bar-icon-active');
                drawModeOpt = ['length', 'area'];
            } else if (drawModeOpt[1] === 'area') {
                element.classList.remove('tool-bar-icon-active');
                drawModeOpt = ['none', 'area'];
            } else drawActiveReset();
        } else if (mode != drawMode) {
            drawActiveReset();
            element.classList.add('tool-bar-icon-active');
            drawMode = 'measureRect';
            drawModeOpt = ['length', 'none'];
        } else drawActiveReset();
    } else if (mode === 'measureRectArea') {
        if (drawMode === 'measureRect') {
            if (drawModeOpt[1] === 'none') {
                element.classList.add('tool-bar-icon-active');
                drawModeOpt = ['length', 'area'];
            } else if (drawModeOpt[0] === 'length') {
                element.classList.remove('tool-bar-icon-active');
                drawModeOpt = ['length', 'none'];
            } else drawActiveReset();
        } else if (mode != drawMode) {
            drawActiveReset();
            element.classList.add('tool-bar-icon-active');
            drawMode = 'measureRect';
            drawModeOpt = ['none', 'area'];
        } else drawActiveReset();
    } else if (mode === 'measurePolygonLength') {
        if (drawMode === 'measurePolygon') {
            if (drawModeOpt[0] === 'none') {
                element.classList.add('tool-bar-icon-active');
                drawModeOpt = ['length', 'area'];
            } else if (drawModeOpt[1] === 'area') {
                element.classList.remove('tool-bar-icon-active');
                drawModeOpt = ['none', 'area'];
            } else drawActiveReset();
        } else if (mode != drawMode) {
            drawActiveReset();
            element.classList.add('tool-bar-icon-active');
            drawMode = 'measurePolygon';
            drawModeOpt = ['length', 'none'];
        } else drawActiveReset();
    } else if (mode === 'measurePolygonArea') {
        if (drawMode === 'measurePolygon') {
            if (drawModeOpt[1] === 'none') {
                element.classList.add('tool-bar-icon-active');
                drawModeOpt = ['length', 'area'];
            } else if (drawModeOpt[0] === 'length') {
                element.classList.remove('tool-bar-icon-active');
                drawModeOpt = ['length', 'none'];
            } else drawActiveReset();
        } else if (mode != drawMode) {
            drawActiveReset();
            element.classList.add('tool-bar-icon-active');
            drawMode = 'measurePolygon';
            drawModeOpt = ['none', 'area'];
        } else drawActiveReset();
    } else if (mode === 'lineHor') {
        if (drawMode === 'addLine') {
            if (drawModeOpt[0] === 'none') {
                element.classList.add('tool-bar-icon-active');
                drawModeOpt = ['hor', 'ver'];
            } else if (drawModeOpt[1] === 'ver') {
                element.classList.remove('tool-bar-icon-active');
                drawModeOpt = ['none', 'ver'];
            } else drawActiveReset();
        } else if (mode != drawMode) {
            drawActiveReset();
            element.classList.add('tool-bar-icon-active');
            drawMode = 'addLine';
            drawModeOpt = ['hor', 'none'];
        } else drawActiveReset();
    } else if (mode === 'lineVer') {
        if (drawMode === 'addLine') {
            if (drawModeOpt[1] === 'none') {
                element.classList.add('tool-bar-icon-active');
                drawModeOpt = ['hor', 'ver'];
            } else if (drawModeOpt[0] === 'hor') {
                element.classList.remove('tool-bar-icon-active');
                drawModeOpt = ['hor', 'none'];
            } else drawActiveReset();
        } else if (mode != drawMode) {
            drawActiveReset();
            element.classList.add('tool-bar-icon-active');
            drawMode = 'addLine';
            drawModeOpt = ['none', 'ver'];
        } else drawActiveReset();
    } else if (mode != drawMode) {
        drawActiveReset();
        element.classList.add('tool-bar-icon-active');
        drawMode = mode;
    } else drawActiveReset();
    if ((mode === 'measureTwoPoint' || mode === 'measureMultiPoint') && drawMode != 'none') {
        measureTwoPointTool.btn.classList.add('tool-bar-icon-accent');
        measureMultiPointTool.btn.classList.add('tool-bar-icon-accent');
    } else if ((mode === 'measureCircleRadius2' || mode === 'measureCircleDiameter2' || mode === 'measureCircleLength2' || mode === 'measureCircleArea2' || mode === 'measureCircleCenter2') && drawMode != 'none') {
        measureCircleRadiusTool2.btn.classList.add('tool-bar-icon-accent');
        measureCircleDiameterTool2.btn.classList.add('tool-bar-icon-accent');
        measureCircleLengthTool2.btn.classList.add('tool-bar-icon-accent');
        measureCircleAreaTool2.btn.classList.add('tool-bar-icon-accent');
        measureCircleCenterTool2.btn.classList.add('tool-bar-icon-accent');
    } else if ((mode === 'measureCircleRadius3' || mode === 'measureCircleDiameter3' || mode === 'measureCircleLength3' || mode === 'measureCircleArea3' || mode === 'measureCircleCenter3') && drawMode != 'none') {
        measureCircleRadiusTool3.btn.classList.add('tool-bar-icon-accent');
        measureCircleDiameterTool3.btn.classList.add('tool-bar-icon-accent');
        measureCircleLengthTool3.btn.classList.add('tool-bar-icon-accent');
        measureCircleAreaTool3.btn.classList.add('tool-bar-icon-accent');
        measureCircleCenterTool3.btn.classList.add('tool-bar-icon-accent');
    } else if ((mode === 'measureArcRadius' || mode === 'measureArcLength') && drawMode != 'none') {
        measureArcRadiusTool.btn.classList.add('tool-bar-icon-accent');
        measureArcLengthTool.btn.classList.add('tool-bar-icon-accent');
    } else if ((mode === 'measureRectLength' || mode === 'measureRectArea') && drawMode != 'none') {
        measureRectLengthTool.btn.classList.add('tool-bar-icon-accent');
        measureRectAreaTool.btn.classList.add('tool-bar-icon-accent');
    } else if ((mode === 'measurePolygonLength' || mode === 'measurePolygonArea') && drawMode != 'none') {
        measurePolygonLengthTool.btn.classList.add('tool-bar-icon-accent');
        measurePolygonAreaTool.btn.classList.add('tool-bar-icon-accent');
    } else if ((mode === 'lineHor' || mode === 'lineVer') && drawMode != 'none') {
        lineHorTool.btn.classList.add('tool-bar-icon-accent');
        lineVerTool.btn.classList.add('tool-bar-icon-accent');
    }
    if (drawMode != 'none') {
        toolConfig.style.display = configShow ? 'flex' : 'none';
        lineStyleLabel.innerText = label;
        lineStyle.style.display = lineStyleShow[0] ? 'flex' : 'none';
        selectStyleStart.style.display = lineStyleShow[1] ? 'flex' : 'none';
        selectStyleEnd.style.display = lineStyleShow[1] ? 'flex' : 'none';
        drawingLineWidth.style.display = lineWidthShow ? 'flex' : 'none';
        drawingFontSize.style.display = fontSizeShow ? 'flex' : 'none';
        drawingFillColor.style.display = fillColorShow ? 'flex' : 'none';
        eventCanvas.style.cursor = "crosshair";
    }
}
const drawClear = document.getElementById('draw-clear');
drawClear.addEventListener('click', () => {
    drawObjects.push({
        type: 'delete',
        sync: []
    });
    for (let i = 0; i < drawObjects.length; i++) {
        if (drawObjects[i].type != 'lineHor' && drawObjects[i].type != 'lineVer' && drawObjects[i].type != 'lineCircle') {
            drawObjects[i].show = false;
            drawObjects[drawObjects.length - 1].sync.push(drawObjects[i].id);
        }
    }
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.width);
});
let drawObjects = [];
const drawBack = document.getElementById('draw-back');
function drawBackActive(isActive) {
    if (isActive) {
        drawBack.style.opacity = 1;
        drawBack.style.pointerEvents = 'auto';
    } else {
        drawBack.style.opacity = 0.4;
        drawBack.style.pointerEvents = 'none';
    }
}
drawBackActive(false);
drawBack.addEventListener('click', () => {
    if (drawObjects.length === 0) return;
    const deleteObject = drawObjects.pop();
    deletedObjects.push([deleteObject]);
    if (deleteObject.type === 'delete') {
        for (let i = 0; i < drawObjects.length; i++) {
            if (deleteObject.sync.includes(drawObjects[i].id)) {
                drawObjects[i].show = true;
            }
        }
    } else if (typeof deleteObject.origin != 'undefined') {
        for (let i = 0; i < drawObjects.length; i++) {
            if (drawObjects[i].id === deleteObject.origin) {
                drawObjects[i].show = true;
                if (typeof deleteObject.parent != 'undefined') {
                    let childReplace;
                    if (deleteObject.parent === null) {
                        childReplace = deleteObject.child.slice();
                    } else {
                        for (let j = 0; j < drawObjects.length; j++) {
                            if (drawObjects[j].id === deleteObject.parent) {
                                childReplace = drawObjects[j].child.slice();
                                break;
                            }
                        }
                    }
                    for (j = 0; j < childReplace.length; j++) {
                        if (childReplace[j] === deleteObject.id) {
                            childReplace.slice(j, 1);
                            break;
                        }
                    }
                    childReplace.push(deleteObject.origin);
                }
                break;
            }
        }
    } else if (typeof deleteObject.parent != 'undefined') {
        let deleteObjects = [];
        if (deleteObject.parent === null) {
            deleteObjects = deleteObject.child.slice();
            deleteObjects.push(deleteObject.id);
        } else {
            for (let j = 0; j < drawObjects.length; j++) {
                if (drawObjects[j].id === deleteObject.parent) {
                    deleteObjects = drawObjects[j].child.slice();
                    break;
                }
            }
            deleteObjects.push(deleteObject.parent);
        }
        for (let i = 0; i < drawObjects.length; i++) {
            if (deleteObjects.includes(drawObjects[i].id)) {
                deletedObjects[deletedObjects.length - 1].push(drawObjects[i]);
                drawObjects.splice(i, 1);
                i--;
            }
        }
    }
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.width);
    drawMemoryCtx.clearRect(0, 0, drawMemoryCanvas.width, drawMemoryCanvas.width);
    for (let i = 0; i < drawObjects.length; i++) {
        if (drawObjects[i].show) {
            if (drawObjects[i].type != 'lineHor' && drawObjects[i].type != 'lineVer' && drawObjects[i].type != 'lineCircle') {
                redrawObject(drawObjects[i], drawCtx);
            }
            redrawObject(drawObjects[i], drawMemoryCtx);
        }
    }
    if (drawObjects.length === 0) drawBackActive(false);
    drawRedoActive(true);
});
const drawRedo = document.getElementById('draw-redo');
function drawRedoActive(isActive) {
    if (isActive) {
        drawRedo.style.opacity = 1;
        drawRedo.style.pointerEvents = 'auto';
    } else {
        drawRedo.style.opacity = 0.4;
        drawRedo.style.pointerEvents = 'none';
    }
}
drawRedoActive(false);
let deletedObjects = [];
drawRedo.addEventListener('click', () => {
    if (deletedObjects.length === 0) return;
    const redoObjects = deletedObjects.pop();
    const redoObject = redoObjects[0];
    for (let i = 0; i < redoObjects.length; i++) {
        drawObjects.push(redoObjects[i]);
    }
    if (redoObject.type === 'delete' && typeof redoObject.sync != 'undefined') {
        for (let i = 0; i < drawObjects.length; i++) {
            if (redoObject.sync.includes(drawObjects[i].id)) {
                drawObjects[i].show = false;
            }
        }
    } else if (typeof redoObject.origin != 'undefined') {
        for (let i = 0; i < drawObjects.length; i++) {
            if (drawObjects[i].id === redoObject.origin) {
                drawObjects[i].show = false;

                if (typeof redoObject.parent != 'undefined') {
                    let childReplace;

                    if (redoObject.parent === null) {
                        childReplace = redoObject.child.slice();
                    } else {
                        for (let j = 0; j < drawObjects.length; j++) {
                            if (drawObjects[j].id === redoObject.parent) {
                                childReplace = drawObjects[j].child.slice();
                                break;
                            }
                        }
                    }

                    for (j = 0; j < childReplace.length; j++) {
                        if (childReplace[j] === redoObject.origin) {
                            childReplace.slice(j, 1);
                            break;
                        }
                    }

                    childReplace.push(deleteObject.id);
                }
                break;
            }
        }
    }
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.width);
    drawMemoryCtx.clearRect(0, 0, drawMemoryCanvas.width, drawMemoryCanvas.width);
    for (let i = 0; i < drawObjects.length; i++) {
        if (drawObjects[i].show) {
            if (drawObjects[i].type != 'lineHor' && drawObjects[i].type != 'lineVer' && drawObjects[i].type != 'lineCircle') {
                redrawObject(drawObjects[i], drawCtx);
            }
            redrawObject(drawObjects[i], drawMemoryCtx);
        }
    }
    if (deletedObjects.length === 0) drawRedoActive(false);
    drawBackActive(true);
});
const drawSave = document.getElementById('draw-save');
drawSave.addEventListener('click', () => {
    processCanvas.width = videoResolution.width;
    processCanvas.height = videoResolution.height;
    let captureWidth = processCanvas.width;
    let captureHeight = processCanvas.height;
    if (rotAngle === 90 || rotAngle === -90) {
        [processCanvas.width, processCanvas.height] = [processCanvas.height, processCanvas.width];
    }
    processCtx.save();
    if (horReverse.status) {
        processCtx.scale(-1, 1);
        processCtx.translate(-processCanvas.width, 0);
    }
    if (vertReverse.status) {
        processCtx.scale(1, -1);
        processCtx.translate(0, -processCanvas.height);
    }
    if (rotAngle === 90) {
        processCtx.translate(processCanvas.width / 2, processCanvas.height / 2);
        processCtx.rotate(Math.PI / 2);
        processCtx.translate(-processCanvas.height / 2, -processCanvas.width / 2);
    } else if (rotAngle === -90) {
        processCtx.translate(processCanvas.width / 2, processCanvas.height / 2);
        processCtx.rotate(-Math.PI / 2);
        processCtx.translate(-processCanvas.height / 2, -processCanvas.width / 2);
    } else if (rotAngle === 180) {
        processCtx.translate(processCanvas.width / 2, processCanvas.height / 2);
        processCtx.rotate(Math.PI);
        processCtx.translate(-processCanvas.width / 2, -processCanvas.height / 2);
    }
    if (isVideoMode === 'realtime') {
        processCtx.drawImage(video, 0, 0, captureWidth, captureHeight);
    } else {
        processCtx.drawImage(videoCanvas, 0, 0, captureWidth, captureHeight);
    }
    processCtx.restore();
    processCtx.save();
    if (rotAngle === 90) {
        processCtx.translate(processCanvas.width / 2, processCanvas.height / 2);
        processCtx.rotate(Math.PI / 2);
        processCtx.translate(-processCanvas.height / 2, -processCanvas.width / 2);
    } else if (rotAngle === -90) {
        processCtx.translate(processCanvas.width / 2, processCanvas.height / 2);
        processCtx.rotate(-Math.PI / 2);
        processCtx.translate(-processCanvas.height / 2, -processCanvas.width / 2);
    } else if (rotAngle === 180) {
        processCtx.translate(processCanvas.width / 2, processCanvas.height / 2);
        processCtx.rotate(Math.PI);
        processCtx.translate(-processCanvas.width / 2, -processCanvas.height / 2);
    }
    const rotAngleQs = rotAngle;
    rotAngle = 0;
    for (let i = 0; i < drawObjects.length; i++) {
        if (drawObjects[i].show && drawObjects[i].type != 'lineHor' && drawObjects[i].type != 'lineVer' && drawObjects[i].type != 'lineCircle') {
            redrawObject(drawObjects[i], processCtx);
        }
    }
    rotAngle = rotAngleQs;
    processCtx.restore();
    let fileName = pictureName.value;
    getTime();
    nameRuleConvert[0].forEach((element, index) => {
        fileName = fileName.replace(element, nameRuleConvert[1][index]);
    });
    saveNameCounter.value = parseInt(saveNameCounter.value, 10) + 1;
    if (fileNameStamp.checked) {
        processCtx.font = `${processCanvas.width / 70}px Arial`;
        processCtx.textAlign = 'right';
        processCtx.textBaseline = 'bottom'
        processCtx.fillStyle = fileNameStampColor.value;
        processCtx.fillText(fileName, processCanvas.width * 0.99, processCanvas.height * 0.99);
    }
    if (scaleStyle.value != 'none') {
        let startX; let startY; let endX; let endY;
        let textAlign; let textPosX;
        const textOffset = 40 + scaleLength.value.toString().length * 20;
        const lineLength = 30;
        if (scaleStyle.value === 'left-top') {
            startX = processCanvas.width * 0.02;
            startY = processCanvas.height * 0.02;
            endX = startX + parseFloat(scaleLength.value) / calibrationData;
            endY = startY
            textAlign = 'left';
            textPosX = endX + 20;
        } else if (scaleStyle.value === 'left-bottom') {
            startX = processCanvas.width * 0.02;
            startY = processCanvas.height * 0.98;
            endX = startX + parseFloat(scaleLength.value) / calibrationData;
            endY = startY;
            textAlign = 'left';
            textPosX = endX + 20;
        } else if (scaleStyle.value === 'right-top') {
            startX = processCanvas.width + 0.98 - parseFloat(scaleLength.value) / calibrationData - textOffset;
            startY = processCanvas.height * 0.02;
            endX = processCanvas.width * 0.98 - textOffset;
            endY = startY;
            textAlign = 'left';
            textPosX = endX + 20;
        } else {
            startX = processCanvas.width + 0.98 - parseFloat(scaleLength.value) / calibrationData - textOffset;
            startY = processCanvas.height * 0.98;
            endX = processCanvas.width * 0.98 - textOffset;
            endY = startY;
            if (fileNameStamp.checked) {
                startY -= 40;
                endY -= 40;
            }
            textAlign = 'left';
            textPosX = endX + 20;
        }
        drawLine(startX, startY, endX, endY, 'solid', scaleColor.value, 5, processCtx);
        drawLine(startX, startY - lineLength / 2, startX, endY + lineLength / 2, 'solid', scaleColor.value, 5, processCtx);
        drawLine(endX, startY - lineLength / 2, endX, endY + lineLength / 2, 'solid', scaleColor.value, 5, processCtx);
        processCtx.font = `${processCanvas.width / 70}px Arial`;
        processCtx.textAlign = textAlign;
        processCtx.textBaseline = 'middle';
        processCtx.fillStyle = `${scaleColor.value}`;
        processCtx.fillText(`${scaleLength.value}mm`, textPosX, endY);
    }
    const dataURL = processCanvas.toDataURL(`image/${pictureFormat.value}`);
    const downloadLink = document.createElement("a");
    downloadLink.href = dataURL;
    downloadLink.download = `${fileName}.${pictureFormat.value}`;
    downloadLink.click();
    popupMsgShow('描画を保存しました');
    processCanvas.width = supportedResolution[parseInt(pictureResSelect.value, 10)][0];
    processCanvas.height = supportedResolution[parseInt(pictureResSelect.value, 10)][1];
});
const textEdit = document.getElementById('text-edit');
const videoArea = document.getElementById('video-area');
let videoAreaSize = { width: videoArea.offsetWidth, height: videoArea.offsetHeight };
const videoCanvas = document.getElementById('video-canvas');
const videoCtx = videoCanvas.getContext('2d', { willReadFrequently: true });
const compCanvas = document.getElementById('comp-canvas');
const compCtx = compCanvas.getContext('2d', { willReadFrequently: true });
const shadowMaskCanvas = document.getElementById('shadow-mask-canvas');
const shadowMaskCtx = shadowMaskCanvas.getContext('2d', { willReadFrequently: true });
const drawCanvas = document.getElementById('draw-canvas');
const drawCtx = drawCanvas.getContext('2d', { willReadFrequently: true });
const preDrawCanvas = document.getElementById('pre-draw-canvas');
const preDrawCtx = preDrawCanvas.getContext('2d', { willReadFrequently: true });
const lineCanvas = document.getElementById('line-canvas');
const lineCtx = lineCanvas.getContext('2d', { willReadFrequently: true });
const eventCanvas = document.getElementById('event-canvas');
const eventCtx = eventCanvas.getContext('2d', { willReadFrequently: true });
const drawMemoryCanvas = document.getElementById('draw-memory-canvas');
const drawMemoryCtx = drawMemoryCanvas.getContext('2d', { willReadFrequently: true });
const processCanvas = document.getElementById('process-canvas');
const processCtx = processCanvas.getContext('2d', { willReadFrequently: true });
function canvasResize(width, height) {
    videoResolution.width = width;
    videoResolution.height = height;
    videoCanvas.width = width;
    videoCanvas.height = height;
    shadowMaskCanvas.width = width;
    shadowMaskCanvas.height = height;
    drawCanvas.width = width;
    drawCanvas.height = height;
    preDrawCanvas.width = width;
    preDrawCanvas.height = height;
    drawMemoryCanvas.width = width;
    drawMemoryCanvas.height = height;
    lineCanvas.width = width;
    lineCanvas.height = height;
    compCanvas.width = width;
    compCanvas.height = height;
    eventCanvas.width = width;
    eventCanvas.height = height;
    processCanvas.width = width;
    processCanvas.height = height;
}
function getImage(event) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (['image/jpeg', 'image/png'].includes(file.type)) {
        videoArea.style.backgroundColor = null;
        connectedCamera = [cameraSelect.value, resolutionSelect.value, pictureResSelect.value];
        if (typeof video != 'undefined') {
            clearTimeout(navigatorCtrl);
            drawObjects = [];
            deletedObjects = [];
            drawBackActive(false);
            drawRedoActive(false);
            try {
                const tracks = mediaStream.getTracks();
                tracks.forEach(track => track.stop());
            } catch { }
        }
        const reader = new FileReader();
        reader.onload = () => {
            const imageData = reader.result;
            const image = new Image();
            image.onload = () => {
                canvasResize(image.naturalWidth, image.naturalHeight);
                videoCtx.drawImage(image, 0, 0, videoCanvas.width, videoCanvas.height);
                navigatorCtx.drawImage(image, 0, 0, navigatorCanvas.width, navigatorCanvas.height);
                videoFitting();
                zoomSld.value = fitRate;
                popupMsgShow('画像を読み込みました');
            };
            image.src = imageData;
        };
        reader.readAsDataURL(file);
        if (typeof video != 'undefined') video.style.display = 'none';
        videoCanvas.style.display = 'block';
        drawObjects = [];
        deletedObjects = [];
        drawBackActive(false);
        drawRedoActive(false);
        isVideoMode = 'image';
        videoMode.innerHTML = '<img style="height: 12px; margin-right: 2px; transform: rotate(90deg);" src="img/play.png" alt="描画">画像編集';
        videoMode.style.backgroundColor = '#a0e0ff';
        cameraSelect.innerHTML = `<option value="0">（画像編集中）</option>`;
        cameraSelect.disabled = true;
        resolutionSelect.innerHTML = `<option value="0">（画像編集中）</option>`;
        resolutionSelect.disabled = true;
        pictureResSelect.innerHTML = `<option value="0">画像の解像度に従う</option>`;
        pictureResSelect.disabled = true;
    } else if (file.type.includes("json")) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const configData = JSON.parse(event.target.result);
            if (typeof configData === 'undefined') {
                popupMsgShow('設定データの読み込みに失敗しました');
                return;
            }
            configCameraBrightness.setValue(parseInt(configData.camera.brightness, 10));
            if (configExposureMode.isActive != configData.camera.exposureMode) configExposureMode.base.click();
            if (configData.camera.exposureMode) configCameraExposureCompensation.setValue(parseInt(configData.camera.gain, 10));
            else configCameraExposureTime.setValue(parseInt(configData.camera.exposure, 10));
            configCameraContrast.setValue(parseInt(configData.camera.contrast, 10));
            configCameraSaturation.setValue(parseInt(configData.camera.saturation, 10));
            configCameraSharpness.setValue(parseInt(configData.camera.sharpness, 10));
            if (configWhitebalanceMode.isActive != configData.camera.whitebalanceMode) configWhitebalanceMode.base.click();
            if (!configData.camera.whitebalanceMode) configCameraColorTemp.setValue(parseInt(configData.camera.colorTemp, 10));
            calibrationData = configData.calibration;
            calibrationDataInd.value = calibrationData.toFixed(5);
            if (configData.line != []) {
                configData.line.forEach((element) => {
                    drawObjects.push(element);
                });
                if (!lineShow.isActive) lineShow.base.click();
                lineCtx.clearRect(0, 0, lineCanvas.width, lineCanvas.width);
                for (let j = 0; j < drawObjects.length; j++) {
                    if (drawObjects[j].type === 'lineHor' || drawObjects[j].type === 'lineVer' || drawObjects[j].type === 'lineCircle') {
                        redrawObject(drawObjects[j], lineCtx);
                    }
                }
            }
        };
        reader.readAsText(file);
        popupMsgShow('設定データを読み込みました');
    } else {
        popupMsgShow('画像（JPEG/PNG）、設定データ以外は読み込みできません');
    }
}
videoArea.addEventListener('dragover', () => {
    videoArea.style.backgroundColor = '#a0e0ff';
});
videoArea.addEventListener('dragleave', () => {
    videoArea.style.backgroundColor = null;
});
videoArea.addEventListener('drop', getImage);
let zoomParam = { rate: 1, left: 0, top: 0, width: 0, height: 0 };
let zoomParamQs = { rate: 1, left: 0, top: 0, width: 0, height: 0 };
let isVideoMove = false;
let mouseDownPos = { x: 0, y: 0 };
let fitRate = 0;
function videoFitting() {
    if (rotAngle != 90 && rotAngle != -90) {
        fitRate = Math.min(videoAreaSize.width / videoResolution.width, videoAreaSize.height / videoResolution.height);
    } else {
        fitRate = Math.min(videoAreaSize.height / videoResolution.width, videoAreaSize.width / videoResolution.height);
    }
    if (typeof video != 'undefined') {
        video.style.width = `${videoResolution.width * fitRate}px`;
        video.style.height = `${videoResolution.height * fitRate}px`;
    }
    videoCanvas.style.width = `${videoCanvas.width * fitRate}px`;
    videoCanvas.style.height = `${videoCanvas.height * fitRate}px`;
    shadowMaskCanvas.style.width = `${shadowMaskCanvas.width * fitRate}px`;
    shadowMaskCanvas.style.height = `${shadowMaskCanvas.height * fitRate}px`;
    drawCanvas.style.width = `${drawCanvas.width * fitRate}px`;
    drawCanvas.style.height = `${drawCanvas.height * fitRate}px`;
    preDrawCanvas.style.width = `${preDrawCanvas.width * fitRate}px`;
    preDrawCanvas.style.height = `${preDrawCanvas.height * fitRate}px`;
    lineCanvas.style.width = `${lineCanvas.width * fitRate}px`;
    lineCanvas.style.height = `${lineCanvas.height * fitRate}px`;
    compCanvas.style.width = `${compCanvas.width * fitRate}px`;
    compCanvas.style.height = `${compCanvas.height * fitRate}px`;
    eventCanvas.style.width = `${eventCanvas.width * fitRate}px`;
    eventCanvas.style.height = `${eventCanvas.height * fitRate}px`;
    zoomParam.left = -(videoAreaSize.width - Math.min(videoAreaSize.width, videoResolution.width * fitRate)) / 2 / fitRate;
    zoomParam.top = -(videoAreaSize.height - Math.min(videoAreaSize.height, videoResolution.height * fitRate)) / 2 / fitRate;
    zoomParam.width = videoResolution.width + Math.abs(zoomParam.left) * 2;
    zoomParam.height = videoResolution.height + Math.abs(zoomParam.top) * 2;
    if (typeof video != 'undefined') {
        video.style.left = `${-zoomParam.left * fitRate}px`;
        video.style.top = `${-zoomParam.top * fitRate}px`;
    }
    videoCanvas.style.left = `${-zoomParam.left * fitRate}px`;
    videoCanvas.style.top = `${-zoomParam.top * fitRate}px`;
    shadowMaskCanvas.style.left = `${-zoomParam.left * fitRate}px`;
    shadowMaskCanvas.style.top = `${-zoomParam.top * fitRate}px`;
    drawCanvas.style.left = `${-zoomParam.left * fitRate}px`;
    drawCanvas.style.top = `${-zoomParam.top * fitRate}px`;
    preDrawCanvas.style.left = `${-zoomParam.left * fitRate}px`;
    preDrawCanvas.style.top = `${-zoomParam.top * fitRate}px`;
    lineCanvas.style.left = `${-zoomParam.left * fitRate}px`;
    lineCanvas.style.top = `${-zoomParam.top * fitRate}px`;
    compCanvas.style.left = `${-zoomParam.left * fitRate}px`;
    compCanvas.style.top = `${-zoomParam.top * fitRate}px`;
    eventCanvas.style.left = `${-zoomParam.left * fitRate}px`;
    eventCanvas.style.top = `${-zoomParam.top * fitRate}px`;
    zoomParam.rate = fitRate;
    navidatorCtrl();
}
function videoZoom(zoomRate, pointerX, pointerY) {
    let stdX;
    if (typeof pointerX != 'undefined') {
        stdX = pointerX / zoomParam.rate;
    } else {
        stdX = (zoomParam.left + (zoomParam.left + zoomParam.width)) / 2;
    }
    let stdY;
    if (typeof pointerY != 'undefined') {
        stdY = pointerY / zoomParam.rate;
    } else {
        stdY = (zoomParam.top + (zoomParam.top + zoomParam.height)) / 2;
    }
    if (typeof video != 'undefined') {
        video.style.width = `${videoResolution.width * zoomRate}px`;
        video.style.height = `${videoResolution.height * zoomRate}px`;
    }
    videoCanvas.style.width = `${videoCanvas.width * zoomRate}px`;
    videoCanvas.style.height = `${videoCanvas.height * zoomRate}px`;
    shadowMaskCanvas.style.width = `${shadowMaskCanvas.width * zoomRate}px`;
    shadowMaskCanvas.style.height = `${shadowMaskCanvas.height * zoomRate}px`;
    drawCanvas.style.width = `${drawCanvas.width * zoomRate}px`;
    drawCanvas.style.height = `${drawCanvas.height * zoomRate}px`;
    preDrawCanvas.style.width = `${preDrawCanvas.width * zoomRate}px`;
    preDrawCanvas.style.height = `${preDrawCanvas.height * zoomRate}px`;
    lineCanvas.style.width = `${lineCanvas.width * zoomRate}px`;
    lineCanvas.style.height = `${lineCanvas.height * zoomRate}px`;
    compCanvas.style.width = `${compCanvas.width * zoomRate}px`;
    compCanvas.style.height = `${compCanvas.height * zoomRate}px`;
    eventCanvas.style.width = `${eventCanvas.width * zoomRate}px`;
    eventCanvas.style.height = `${eventCanvas.height * zoomRate}px`;
    zoomParam.left = stdX - (stdX - zoomParam.left) * (zoomParam.rate / zoomRate);
    zoomParam.top = stdY - (stdY - zoomParam.top) * (zoomParam.rate / zoomRate);
    zoomParam.width = videoAreaSize.width / zoomRate;
    zoomParam.height = videoAreaSize.height / zoomRate;
    if (typeof video != 'undefined') {
        video.style.left = `${-zoomParam.left * zoomRate}px`;
        video.style.top = `${-zoomParam.top * zoomRate}px`;
    }
    videoCanvas.style.left = `${-zoomParam.left * zoomRate}px`;
    videoCanvas.style.top = `${-zoomParam.top * zoomRate}px`;
    shadowMaskCanvas.style.left = `${-zoomParam.left * zoomRate}px`;
    shadowMaskCanvas.style.top = `${-zoomParam.top * zoomRate}px`;
    drawCanvas.style.left = `${-zoomParam.left * zoomRate}px`;
    drawCanvas.style.top = `${-zoomParam.top * zoomRate}px`;
    preDrawCanvas.style.left = `${-zoomParam.left * zoomRate}px`;
    preDrawCanvas.style.top = `${-zoomParam.top * zoomRate}px`;
    lineCanvas.style.left = `${-zoomParam.left * zoomRate}px`;
    lineCanvas.style.top = `${-zoomParam.top * zoomRate}px`;
    compCanvas.style.left = `${-zoomParam.left * zoomRate}px`;
    compCanvas.style.top = `${-zoomParam.top * zoomRate}px`;
    eventCanvas.style.left = `${-zoomParam.left * zoomRate}px`;
    eventCanvas.style.top = `${-zoomParam.top * zoomRate}px`;
    zoomParam.rate = zoomRate;
    navidatorCtrl();
    popupMsgShow(`表示倍率：${Math.round(zoomRate * 100)}%`);
    if (scaleStyle.value != 'none') scale.innerHTML = scaleSet(scaleLength.value);
}
function videoMove(horMove, vertMove) {
    zoomParam.left = zoomParamQs.left + horMove / zoomParam.rate;
    zoomParam.top = zoomParamQs.top + vertMove / zoomParam.rate;
    if (typeof video != 'undefined') {
        video.style.left = `${-zoomParam.left * zoomParam.rate}px`;
        video.style.top = `${-zoomParam.top * zoomParam.rate}px`;
    }
    videoCanvas.style.left = `${-zoomParam.left * zoomParam.rate}px`;
    videoCanvas.style.top = `${-zoomParam.top * zoomParam.rate}px`;
    shadowMaskCanvas.style.left = `${-zoomParam.left * zoomParam.rate}px`;
    shadowMaskCanvas.style.top = `${-zoomParam.top * zoomParam.rate}px`;
    drawCanvas.style.left = `${-zoomParam.left * zoomParam.rate}px`;
    drawCanvas.style.top = `${-zoomParam.top * zoomParam.rate}px`;
    preDrawCanvas.style.left = `${-zoomParam.left * zoomParam.rate}px`;
    preDrawCanvas.style.top = `${-zoomParam.top * zoomParam.rate}px`;
    lineCanvas.style.left = `${-zoomParam.left * zoomParam.rate}px`;
    lineCanvas.style.top = `${-zoomParam.top * zoomParam.rate}px`;
    compCanvas.style.left = `${-zoomParam.left * zoomParam.rate}px`;
    compCanvas.style.top = `${-zoomParam.top * zoomParam.rate}px`;
    eventCanvas.style.left = `${-zoomParam.left * zoomParam.rate}px`;
    eventCanvas.style.top = `${-zoomParam.top * zoomParam.rate}px`;
    navidatorCtrl();
}
function windowResize() {
    windowTop.style.zoom = Math.min(window.innerWidth / uiWidthLimit, 1);
    windowMiddle.style.zoom = Math.min(window.innerWidth / uiWidthLimit, 1);
    windowBottom.style.zoom = Math.min(window.innerWidth / uiWidthLimit, 1);
    workSpace.style.height = `${window.innerHeight - 147 * Math.min(window.innerWidth / uiWidthLimit, 1)}px`;
    videoAreaSize = { width: videoArea.offsetWidth, height: videoArea.offsetHeight };

    naviPos = navigatorCanvas.getBoundingClientRect();
}
window.addEventListener('resize', () => {
    if (isFullSize) workSpace.style.height = '100vh';
    else windowResize();
});
eventCanvas.addEventListener('mousedown', (event) => {
    if (event.button === 0 && drawMode === 'none') {
        eventCanvas.style.cursor = "grabbing";
        isVideoMove = true;
        mouseDownPos = { x: event.clientX, y: event.clientY };
        zoomParamQs.left = zoomParam.left;
        zoomParamQs.top = zoomParam.top;
    } else if (event.button === 1) {
        eventCanvas.style.cursor = "grabbing";
        isVideoMove = true;
        mouseDownPos = { x: event.clientX, y: event.clientY };
        zoomParamQs.left = zoomParam.left;
        zoomParamQs.top = zoomParam.top;
    }
});
window.addEventListener('mousemove', (event) => {
    const shiftRate = isNavigatorMove ? (naviPos.width / videoCanvas.width) : 1;
    if (isVideoMove) {
        const horMove = mouseDownPos.x - event.clientX / shiftRate;
        const vertMove = mouseDownPos.y - event.clientY / shiftRate;
        if (isNavigatorMove) videoMove(-horMove * zoomParam.rate, -vertMove * zoomParam.rate);
        else videoMove(horMove, vertMove);
    }
});
window.addEventListener('mouseup', () => {
    if (isVideoMove) {
        isVideoMove = false;
        isNavigatorMove = false;
        eventCanvas.style.cursor = drawMode === 'none' ? 'grab' : 'crosshair';
    }
});
eventCanvas.addEventListener('wheel', (event) => {
    const deltaY = event.deltaY;
    const rect = eventCanvas.getBoundingClientRect();
    let pointerX = event.clientX - rect.left;
    let pointerY = event.clientY - rect.top;
    if (!loupe.status) {
        textEdit.blur();
        if (deltaY < 0) {
            zoomSld.value = parseFloat(zoomSld.value) * 1.5;
        } else {
            zoomSld.value = parseFloat(zoomSld.value) / 1.5;
        }
        if (rotAngle === -90 || rotAngle === 90) {
            const videoStyle = getComputedStyle(videoCanvas);
            pointerX += (parseFloat(videoStyle.width) - parseFloat(videoStyle.height)) / 2;
            pointerY -= (parseFloat(videoStyle.width) - parseFloat(videoStyle.height)) / 2;
        }
        videoZoom(parseFloat(zoomSld.value), pointerX, pointerY);
    } else {
        if (deltaY < 0) {
            loupeArea.rate = loupeArea.rate * 1.5;
        } else {
            loupeArea.rate = Math.max(loupeArea.rate / 1.5, 1);
        }
    }
});
let drawProcess = 0;
let clickPoint = [];
let drawId = 0x000001;
let movingObject = {};
let scaleTrace = [];
let isShiftKey = false;
let isAltKey = false;
let isCtrlKey = false;
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'Shift':
            isShiftKey = true;
            break;
        case 'Alt':
            isAltKey = true;
            break;
        case 'Control':
            isCtrlKey = true;
            break;
        case 'a':
            if (isAltKey) picture.click();
            break;
        case 'A':
            if (isAltKey) picture.click();
            break;
        case 'c':
            if (isAltKey) crossLine.icon.click();
            break;
        case 'C':
            if (isAltKey) crossLine.icon.click();
            break;
        case 'g':
            if (isAltKey) zoomOut.click();
            break;
        case 'G':
            if (isAltKey) zoomOut.click();
            break;
        case 'h':
            if (isAltKey) zoomIn.click();
            break;
        case 'H':
            if (isAltKey) zoomIn.click();
            break;
        case 'j':
            if (isAltKey) colorFilter.click();
            break;
        case 'J':
            if (isAltKey) colorFilter.click();
            break;
        case 'z':
            if (isCtrlKey) {
                if (isShiftKey) {
                    drawRedo.click();
                } else {
                    drawBack.click();
                }
            }
            break;
        case 'Z':
            if (isCtrlKey) {
                if (isShiftKey) {
                    drawRedo.click();
                } else {
                    drawBack.click();
                }
            }
            break;
    }
});
document.addEventListener('keyup', (event) => {
    if (event.key === 'Shift') {
        isShiftKey = false;
    } else if (event.key === 'Alt') {
        isAltKey = false;
    } else if (event.key === 'Control') {
        isCtrlKey = false;
    }
});
eventCanvas.addEventListener('contextmenu', () => {
    if (drawMode === 'calibration') return;
    else if (drawProcess != 0) drawBreak();
    else drawActiveReset();
});
document.addEventListener('click', (event) => {
    if (drawMode != 'none' && event.target.id != 'event-canvas') drawBreak();
});
function drawBreak() {
    if (drawProcess != 0) {
        drawProcess = 0;
        preDrawCtx.clearRect(0, 0, preDrawCanvas.width, preDrawCanvas.width);
        if (drawMode != 'lineHor' && drawMode != 'lineVer' && drawMode != 'lineCircle') {
            drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.width);
            for (let i = 0; i < drawObjects.length; i++) {
                if (drawObjects[i].show && drawObjects[i].type != 'lineHor' && drawObjects[i].type != 'lineVer' && drawObjects[i].type != 'lineCircle') {
                    redrawObject(drawObjects[i], drawCtx);
                }
            }
        } else {
            lineCtx.clearRect(0, 0, lineCanvas.width, lineCanvas.width);
            for (let j = 0; j < drawObjects.length; j++) {
                if (drawObjects[j].type === 'lineHor' || drawObjects[j].type === 'lineVer' || drawObjects[j].type === 'lineCircle') {
                    redrawObject(drawObjects[j], lineCtx);
                }
            }
        }
    }
}
let circlePoints = [];
eventCanvas.addEventListener('click', (event) => {
    if (menuBarShow) return;
    if (drawMode === 'none') return;
    const rect = eventCanvas.getBoundingClientRect();
    const clickX = (event.clientX - rect.left) / zoomParam.rate;
    const clickY = (event.clientY - rect.top) / zoomParam.rate;
    if (drawMode != 'lineHor' && drawMode != 'lineVer' && drawMode != 'lineCircle') {
        deletedObjects = [];
        drawRedoActive(false);
    }
    switch (drawMode) {
        case 'drawLine':
            switch (drawProcess) {
                case 0:
                    clickPoint = [[clickX, clickY]];
                    drawProcess++;
                    break;
                case 1:
                    let startX = clickPoint[0][0];
                    let startY = clickPoint[0][1];
                    let endX = clickX;
                    let endY = clickY;
                    if (isShiftKey == true) {
                        const delta = (endY - startY) / (endX - startX);
                        if (-1 < delta && delta <= 1) {
                            endY = startY;
                        } else {
                            endX = startX;
                        }
                    }
                    drawLine(startX, startY, endX, endY, drawStyle.lineStyle, drawStyle.lineColor, drawStyle.lineWidth, drawCtx);
                    drawLine(startX, startY, endX, endY, 'solid', `#${drawId.toString(16).padStart(6, '0')}`, drawStyle.lineWidth, drawMemoryCtx);
                    drawObjects.push({
                        id: drawId,
                        type: 'drawLine',
                        drawParam: [startX, startY, endX, endY, drawStyle.lineStyle, drawStyle.lineColor, drawStyle.lineWidth],
                        angle: rotAngle,
                        show: true
                    });
                    drawBackActive(true);
                    drawId++;
                    drawProcess = 0;
                    break;
            }
            break;
        case 'drawArrow':
            switch (drawProcess) {
                case 0:
                    clickPoint = [[clickX, clickY]];
                    drawProcess++;
                    break;
                case 1:
                    let startX = clickPoint[0][0];
                    let startY = clickPoint[0][1];
                    let endX = clickX;
                    let endY = clickY;
                    if (isShiftKey === true) {
                        const delta = (endY - startY) / (endX - startX);
                        if (-1 < delta && delta <= 1) {
                            endY = startY;
                        } else {
                            endX = startX;
                        }
                    }
                    drawArrow(startX, startY, endX, endY, drawStyle.startLineStyle, drawStyle.lineStyle, drawStyle.endLineStyle, drawStyle.lineColor, drawStyle.lineWidth, drawCtx);
                    drawArrow(startX, startY, endX, endY, drawStyle.startLineStyle, 'solid', drawStyle.endLineStyle, `#${drawId.toString(16).padStart(6, '0')}`, drawStyle.lineWidth, drawMemoryCtx);
                    drawObjects.push({
                        id: drawId,
                        type: 'drawArrow',
                        drawParam: [startX, startY, endX, endY, drawStyle.startLineStyle, drawStyle.lineStyle, drawStyle.endLineStyle, drawStyle.lineColor, drawStyle.lineWidth],
                        angle: rotAngle,
                        show: true
                    });
                    drawBackActive(true);
                    drawId++;
                    drawProcess = 0;
                    break;
            }
            break;
        case 'drawRect':
            switch (drawProcess) {
                case 0:
                    clickPoint = [[clickX, clickY]];
                    drawProcess++;
                    break;
                case 1:
                    let startX = clickPoint[0][0];
                    let startY = clickPoint[0][1];
                    let endX = clickX - startX;
                    let endY = clickY - startY;
                    const squareSide = Math.max(Math.abs(clickX - startX), Math.abs(clickY - startY));
                    if (isShiftKey === true) {
                        if (startX <= clickX && startY <= clickY) {
                            endX = squareSide;
                            endY = squareSide;
                        } else if (startX <= clickX && startY > clickY) {
                            startY = startY - squareSide;
                            endX = squareSide;
                            endY = squareSide;
                        } else if (startX > clickX && startY > clickY) {
                            startX = startX - squareSide;
                            startY = startY - squareSide;
                            endX = squareSide;
                            endY = squareSide;
                        } else if (startX > clickX && startY <= clickY) {
                            startX = startX - squareSide;
                            endX = squareSide;
                            endY = squareSide;
                        }
                    }
                    drawRect(startX, startY, endX, endY, drawStyle.lineStyle, drawStyle.lineColor, drawStyle.lineWidth, drawStyle.fillColor, drawCtx);
                    drawRect(startX, startY, endX, endY, 'solid', `#${drawId.toString(16).padStart(6, '0')}`, drawStyle.lineWidth, `#${drawId.toString(16).padStart(6, '0')}`, drawMemoryCtx);
                    drawObjects.push({
                        id: drawId,
                        type: 'drawRect',
                        drawParam: [startX, startY, endX, endY, drawStyle.lineStyle, drawStyle.lineColor, drawStyle.lineWidth, drawStyle.fillColor],
                        angle: rotAngle,
                        show: true
                    });
                    drawBackActive(true);
                    drawId++;
                    drawProcess = 0;
                    break;
            }
            break;
        case 'drawPolygon':
            switch (drawProcess) {
                case 0:
                    clickPoint = [[clickX, clickY]];
                    drawProcess++;
                    break;
                case 1:
                    if (clickPoint.length > 2) {
                        const range = 10;
                        if (
                            (Math.abs(clickPoint[clickPoint.length - 1][0] - clickX) < range / zoomParam.rate && Math.abs(clickPoint[clickPoint.length - 1][1] - clickY) < range / zoomParam.rate)
                            || (Math.abs(clickPoint[0][0] - clickX) < range / zoomParam.rate && Math.abs(clickPoint[0][1] - clickY) < range / zoomParam.rate)
                        ) {
                            clickPoint.push(clickPoint[0]);
                            drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.width);
                            for (let i = 0; i < drawObjects.length; i++) {
                                if (drawObjects[i].show && drawObjects[i].type != 'lineHor' && drawObjects[i].type != 'lineVer' && drawObjects[i].type != 'lineCircle') {
                                    redrawObject(drawObjects[i], drawCtx);
                                }
                            }
                            drawMultiLine(clickPoint, drawStyle.lineColor, drawStyle.lineWidth, drawStyle.fillColor, drawCtx);
                            drawMultiLine(clickPoint, `#${drawId.toString(16).padStart(6, '0')}`, drawStyle.lineWidth, `#${drawId.toString(16).padStart(6, '0')}`, drawMemoryCtx);
                            drawObjects.push({
                                id: drawId,
                                type: 'drawMultiLine',
                                drawParam: [clickPoint, drawStyle.lineColor, drawStyle.lineWidth, drawStyle.fillColor],
                                angle: rotAngle,
                                show: true
                            });
                            drawBackActive(true);
                            drawId++;
                            drawProcess = 0;
                            return;
                        }
                    }
                    clickPoint.push([clickX, clickY]);
                    const startX = clickPoint[clickPoint.length - 2][0];
                    const startY = clickPoint[clickPoint.length - 2][1];
                    const endX = clickPoint[clickPoint.length - 1][0];
                    const endY = clickPoint[clickPoint.length - 1][1];
                    drawLine(startX, startY, endX, endY, 'solid', drawStyle.lineColor, drawStyle.lineWidth, drawCtx);
                    break;
            }
            break;
        case 'drawCircle':
            switch (drawProcess) {
                case 0:
                    clickPoint = [[clickX, clickY]];
                    drawProcess++;
                    break;
                case 1:
                    let startX = clickPoint[0][0];
                    let startY = clickPoint[0][1];
                    let endX = clickX - startX;
                    let endY = clickY - startY;
                    const squareSide = Math.max(Math.abs(clickX - startX), Math.abs(clickY - startY));
                    if (isShiftKey === true) {
                        if (startX <= clickX && startY <= clickY) {
                            endX = squareSide;
                            endY = squareSide;
                        } else if (startX <= clickX && startY > clickY) {
                            startY = startY - squareSide;
                            endX = squareSide;
                            endY = squareSide;
                        } else if (startX > clickX && startY > clickY) {
                            startX = startX - squareSide;
                            startY = startY - squareSide;
                            endX = squareSide;
                            endY = squareSide;
                        } else if (startX > clickX && startY <= clickY) {
                            startX = startX - squareSide;
                            endX = squareSide;
                            endY = squareSide;
                        }
                    }
                    drawCircle(startX, startY, endX, endY, drawStyle.lineStyle, drawStyle.lineColor, drawStyle.lineWidth, drawStyle.fillColor, drawCtx);
                    drawCircle(startX, startY, endX, endY, 'solid', `#${drawId.toString(16).padStart(6, '0')}`, drawStyle.lineWidth, `#${drawId.toString(16).padStart(6, '0')}`, drawMemoryCtx);
                    drawObjects.push({
                        id: drawId,
                        type: 'drawCircle',
                        drawParam: [startX, startY, endX, endY, drawStyle.lineStyle, drawStyle.lineColor, drawStyle.lineWidth, drawStyle.fillColor],
                        angle: rotAngle,
                        show: true
                    });
                    drawBackActive(true);
                    drawId++;
                    drawProcess = 0;
                    break;
            }
            break;
        case 'drawText':
            switch (drawProcess) {
                case 0:
                    clickPoint = [[clickX, clickY]];
                    textEdit.style.left = `${event.clientX}px`;
                    textEdit.style.top = `${event.clientY}px`;
                    textEdit.style.width = `${videoAreaSize.width - event.clientX}px`;
                    textEdit.style.height = `${Math.min(videoAreaSize.height + windowTop.offsetHeight - event.clientY, drawStyle.fontSize * zoomParam.rate)}px`;
                    textEdit.style.display = 'block';
                    textEdit.style.fontSize = `${drawStyle.fontSize * zoomParam.rate}px`;
                    textEdit.style.color = drawStyle.lineColor;
                    textEdit.focus();
                    drawProcess++;
                    break
            }
            break;
        case 'drawMove':
            switch (drawProcess) {
                case 0:
                    clickPoint = [[clickX, clickY]];
                    const searchRange = Math.ceil(15 / zoomParam.rate);
                    const getId = objectSearch(clickX, clickY, searchRange);
                    if (getId === null) break;
                    for (let i = 0; i < drawObjects.length; i++) {
                        if (drawObjects[i].id === getId && (drawObjects[i].type != 'lineHor' && drawObjects[i].type != 'lineVer' && drawObjects[i].type != 'lineCircle')) {
                            if (typeof drawObjects[i].child != 'undefined') return;
                            movingObject = drawObjects[i];
                            drawObjects[i].show = false;
                            drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.width);
                            drawMemoryCtx.clearRect(0, 0, drawMemoryCanvas.width, drawMemoryCanvas.width);
                            for (let j = 0; j < drawObjects.length; j++) {
                                if (drawObjects[j].show) {
                                    if (drawObjects[j].type != 'lineHor' && drawObjects[j].type != 'lineVer' && drawObjects[j].type != 'lineCircle') {
                                        redrawObject(drawObjects[j], drawCtx);
                                    }
                                    redrawObject(drawObjects[j], drawMemoryCtx);
                                }
                            }
                        }
                    }
                    redrawObject(movingObject, preDrawCtx);
                    drawProcess++;
                    break;
                case 1:
                    let shiftX;
                    let shiftY;
                    if (movingObject.angle - rotAngle === 0) {
                        shiftX = clickX - clickPoint[0][0];
                        shiftY = clickY - clickPoint[0][1];
                    } else if (movingObject.angle - rotAngle === 90 || movingObject.angle - rotAngle === -270) {
                        shiftX = -(clickY - clickPoint[0][1]);
                        shiftY = clickX - clickPoint[0][0];
                    } else if (movingObject.angle - rotAngle === 180 || movingObject.angle - rotAngle === -180) {
                        shiftX = -(clickX - clickPoint[0][0]);
                        shiftY = -(clickY - clickPoint[0][1]);
                    } else if (movingObject.angle - rotAngle === 270 || movingObject.angle - rotAngle === -90) {
                        shiftX = clickY - clickPoint[0][1];
                        shiftY = -(clickX - clickPoint[0][0]);
                    }
                    let objectParam;
                    if (movingObject.type === 'drawLine' || movingObject.type === 'drawArrow') {
                        objectParam = movingObject.drawParam.slice();
                        objectParam[0] += shiftX;
                        objectParam[1] += shiftY;
                        objectParam[2] += shiftX;
                        objectParam[3] += shiftY;
                    } else if (movingObject.type === 'drawRect' || movingObject.type === 'drawCircle' || movingObject.type === 'drawText' || movingObject.type === 'drawSize') {
                        objectParam = movingObject.drawParam.slice();
                        objectParam[0] += shiftX;
                        objectParam[1] += shiftY;
                    } else if (movingObject.type === 'drawMultiLine') {
                        objectParam = [[], movingObject.drawParam[1], movingObject.drawParam[2], movingObject.drawParam[3]];
                        for (let i = 0; i < movingObject.drawParam[0].length; i++) {
                            const point = movingObject.drawParam[0][i].slice();
                            objectParam[0].push([point[0] + shiftX, point[1] + shiftY]);
                        }
                    }
                    redrawObject(movingObject, drawCtx, objectParam);
                    redrawObject(movingObject, drawMemoryCtx, objectParam, drawId);
                    drawObjects.push({
                        id: drawId,
                        type: movingObject.type,
                        drawParam: objectParam,
                        angle: movingObject.angle,
                        show: true,
                        origin: movingObject.id
                    });
                    if (typeof movingObject.parent != 'undefined') {
                        let childReplace;

                        if (movingObject.parent === null) {
                            childReplace = movingObject.child.slice();
                        } else {
                            for (let i = 0; i < drawObjects.length; i++) {
                                if (drawObjects[i].id === movingObject.parent) {
                                    childReplace = drawObjects[i].child.slice();
                                    childReplace.push(drawId);
                                    for (j = 0; j < childReplace.length; j++) {
                                        if (childReplace[j] === movingObject.id) {
                                            childReplace.splice(j, 1);
                                            break;
                                        }
                                    }
                                    drawObjects[i].child = childReplace;
                                    drawObjects[drawObjects.length - 1].parent = drawObjects[i].id;
                                    break;
                                }
                            }
                        }
                    }
                    drawBackActive(true);
                    drawId++;
                    drawProcess = 0;
                    break;
            }
            break;
        case 'drawDelete':
            switch (drawProcess) {
                case 1:
                    clickPoint.push([clickX, clickY]);
                    preDrawCtx.clearRect(0, 0, preDrawCanvas.width, preDrawCanvas.width);
                    if (clickPoint[0][0] === clickPoint[1][0] && clickPoint[0][1] === clickPoint[1][1]) {
                        const searchRange = Math.ceil(15 / zoomParam.rate);
                        const getId = objectSearch(clickX, clickY, searchRange);
                        if (getId != null) {

                            const deleteObjects = objectDelete(getId, 'draw');
                            drawObjects.push({
                                sync: deleteObjects,
                                type: 'delete'
                            });
                        }
                    } else {
                        const getId = objectGetAll(clickPoint);
                        if (getId != null) {
                            let deleteObjects = [];
                            for (let i = 0; i < getId.length; i++) {
                                deleteObjects.push(...objectDelete(getId[i], 'draw'));
                            }
                            drawObjects.push({
                                sync: deleteObjects,
                                type: 'delete'
                            });
                        }
                    }
                    drawBackActive(true);
                    drawProcess = 0;
                    break;
            }
            break;
        case 'addLine':
            switch (drawProcess) {
                case 0:
                    if (drawModeOpt[0] === 'hor') {
                        let startX = 0;
                        let startY = clickY;
                        let endX = (rotAngle === 0 || rotAngle === 180) ? lineCanvas.width : lineCanvas.height;
                        let endY = startY;

                        drawLine(startX, startY, endX, endY, 'solid', lineGuideStyle.color, lineGuideStyle.width, lineCtx);
                        drawLine(startX, startY, endX, endY, 'solid', `#${drawId.toString(16).padStart(6, '0')}`, lineGuideStyle.width, drawMemoryCtx);
                        drawObjects.push({
                            id: drawId,
                            type: 'lineHor',
                            drawParam: [startX, startY, endX, endY, 'solid', lineGuideStyle.color, lineGuideStyle.width],
                            angle: rotAngle,
                            show: true
                        });
                        drawId++;
                    }
                    if (drawModeOpt[1] === 'ver') {
                        let startX = clickX;
                        let startY = 0;
                        let endX = startX;
                        let endY = (rotAngle === 0 || rotAngle === 180) ? lineCanvas.height : lineCanvas.width;
                        drawLine(startX, startY, endX, endY, 'solid', lineGuideStyle.color, lineGuideStyle.width, lineCtx);
                        drawLine(startX, startY, endX, endY, 'solid', `#${drawId.toString(16).padStart(6, '0')}`, lineGuideStyle.width, drawMemoryCtx);
                        drawObjects.push({
                            id: drawId,
                            type: 'lineVer',
                            drawParam: [startX, startY, endX, endY, 'solid', lineGuideStyle.color, lineGuideStyle.width],
                            angle: rotAngle,
                            show: true
                        });
                        drawId++;
                    }
                    break;
            }
            break;
        case 'lineCircle':
            switch (drawProcess) {
                case 0:
                    clickPoint = [[clickX, clickY]];
                    drawProcess++;
                    break;
                case 1:
                    let radius = Math.sqrt((clickX - clickPoint[0][0]) ** 2 + (clickY - clickPoint[0][1]) ** 2);
                    let startX = clickPoint[0][0] - radius;
                    let startY = clickPoint[0][1] - radius;
                    let width = radius * 2;
                    let height = radius * 2;
                    drawCircle(startX, startY, width, height, 'solid', lineGuideStyle.color, lineGuideStyle.width, 'none', lineCtx);
                    drawCircle(startX, startY, width, height, 'solid', `#${drawId.toString(16).padStart(6, '0')}`, drawStyle.lineWidth, 'none', drawMemoryCtx);
                    drawObjects.push({
                        id: drawId,
                        type: 'lineCircle',
                        drawParam: [startX, startY, width, height, 'solid', lineGuideStyle.color, lineGuideStyle.width, drawStyle.fillColor],
                        angle: rotAngle,
                        show: true
                    });
                    drawId++;
                    drawProcess = 0;
                    break;
            }
            break;
        case 'lineMove':
            switch (drawProcess) {
                case 0:
                    clickPoint = [[clickX, clickY]];
                    const searchRange = Math.ceil(15 / zoomParam.rate);
                    const getId = objectSearch(clickX, clickY, searchRange);
                    if (getId === null) break;
                    objectDelete(getId, 'line');
                    redrawObject(movingObject, preDrawCtx);
                    drawProcess++;
                    break;
                case 1:
                    let shiftX;
                    let shiftY;
                    if (movingObject.angle - rotAngle === 0) {
                        shiftX = clickX - clickPoint[0][0];
                        shiftY = clickY - clickPoint[0][1];
                    } else if (movingObject.angle - rotAngle === 90 || movingObject.angle - rotAngle === -270) {
                        shiftX = -(clickY - clickPoint[0][1]);
                        shiftY = clickX - clickPoint[0][0];
                    } else if (movingObject.angle - rotAngle === 180 || movingObject.angle - rotAngle === -180) {
                        shiftX = -(clickX - clickPoint[0][0]);
                        shiftY = -(clickY - clickPoint[0][1]);
                    } else if (movingObject.angle - rotAngle === 270 || movingObject.angle - rotAngle === -90) {
                        shiftX = clickY - clickPoint[0][1];
                        shiftY = -(clickX - clickPoint[0][0]);
                    }
                    let objectParam = movingObject.drawParam.slice();
                    if (movingObject.type === 'lineHor') {
                        objectParam[1] += shiftY;
                        objectParam[3] += shiftY;
                    } else if (movingObject.type === 'lineVer') {
                        objectParam[0] += shiftX;
                        objectParam[2] += shiftX;
                    } else if (movingObject.type === 'lineCircle') {
                        objectParam[0] += shiftX;
                        objectParam[1] += shiftY;
                    }
                    redrawObject(movingObject, lineCtx, objectParam);
                    redrawObject(movingObject, drawMemoryCtx, objectParam, drawId);
                    drawObjects.push({
                        id: drawId,
                        type: movingObject.type,
                        drawParam: objectParam,
                        angle: movingObject.angle,
                        show: true
                    });
                    drawId++;
                    drawProcess = 0;
                    break;
            }
            break;
        case 'lineDelete':
            switch (drawProcess) {
                case 0:
                    preDrawCtx.clearRect(0, 0, preDrawCanvas.width, preDrawCanvas.width);
                    const searchRange = Math.ceil(15 / zoomParam.rate);
                    const getId = objectSearch(clickX, clickY, searchRange);
                    if (getId === null) break;
                    objectDelete(getId, 'line');
                    break;
            }
            break;
        case 'shadowMask':
            switch (drawProcess) {
                case 0:
                    clickPoint = [[clickX, clickY]];
                    drawProcess++;
                    break;
                case 1:
                    preDrawCtx.clearRect(0, 0, preDrawCanvas.width, preDrawCanvas.width);
                    let startX = clickPoint[0][0];
                    let startY = clickPoint[0][1];
                    let endX = clickX - startX;
                    let endY = clickY - startY;
                    const squareSide = Math.max(Math.abs(clickX - startX), Math.abs(clickY - startY));
                    if (isShiftKey === true) {
                        if (startX <= clickX && startY <= clickY) {
                            endX = squareSide;
                            endY = squareSide;
                        } else if (startX <= clickX && startY > clickY) {
                            startY = startY - squareSide;
                            endX = squareSide;
                            endY = squareSide;
                        } else if (startX > clickX && startY > clickY) {
                            startX = startX - squareSide;
                            startY = startY - squareSide;
                            endX = squareSide;
                            endY = squareSide;
                        } else if (startX > clickX && startY <= clickY) {
                            startX = startX - squareSide;
                            endX = squareSide;
                            endY = squareSide;
                        }
                    }
                    shadowMaskCtx.clearRect(startX, startY, endX, endY);
                    drawProcess = 0;
                    drawCancel.click();
                    break;
            }
            break;
        case 'calibration':
            switch (drawProcess) {
                case 0:
                    scaleTrace.push(
                        [(event.clientX - rect.left) / zoomParam.rate, (event.clientY - rect.top) / zoomParam.rate]
                    );
                    let crossWidth = 20 * (videoResolution.width / 2592);
                    let startX = scaleTrace[scaleTrace.length - 1][0] - crossWidth / 2;
                    let startY = scaleTrace[scaleTrace.length - 1][1] - crossWidth / 2;
                    drawLine(startX, startY, startX + crossWidth, startY + crossWidth, 'solid', accentColor, lineGuideStyle.width, drawCtx);
                    drawLine(startX + crossWidth, startY, startX, startY + crossWidth, 'solid', accentColor, lineGuideStyle.width, drawCtx);
                    break;
            }
            break;
        case 'measureTwoPoint':
            switch (drawProcess) {
                case 0:
                    if (calibrationData === 0) popupMsgShow('計測値の表示には寸法校正が必要です');
                    clickPoint = [[clickX, clickY]];
                    drawProcess++;
                    break;
                case 1:
                    let startX = clickPoint[0][0];
                    let startY = clickPoint[0][1];
                    let endX = clickX;
                    let endY = clickY;
                    drawLine(startX, startY, endX, endY, 'solid', drawStyle.lineColor, drawStyle.lineWidth, drawCtx);
                    drawLine(startX, startY, endX, endY, 'solid', `#${drawId.toString(16).padStart(6, '0')}`, drawStyle.lineWidth, drawMemoryCtx);
                    drawObjects.push({
                        id: drawId,
                        type: 'drawLine',
                        drawParam: [startX, startY, endX, endY, 'solid', drawStyle.lineColor, drawStyle.lineWidth],
                        angle: rotAngle,
                        show: true,
                        parent: null,
                        child: [drawId + 1]
                    });
                    drawId++;
                    const msr = measureTwoPoint(startX, startY, endX, endY, drawStyle.lineColor, drawStyle.fontSize, drawStyle.digit);
                    drawSize(msr[0], msr[1], msr[2], msr[3], msr[4], msr[5], drawCtx);
                    drawSize(msr[0], msr[1], msr[2], msr[3], `#${drawId.toString(16).padStart(6, '0')}`, msr[5], drawMemoryCtx);
                    drawObjects.push({
                        id: drawId,
                        type: 'drawSize',
                        drawParam: msr,
                        angle: rotAngle,
                        show: true,
                        parent: drawId - 1
                    });
                    drawBackActive(true);
                    drawId++;
                    drawProcess = 0;
                    break;
            }
            break;
        case 'measureMultiPoint':
            switch (drawProcess) {
                case 0:
                    if (calibrationData === 0) popupMsgShow('計測値の表示には寸法校正が必要です');
                    clickPoint = [[clickX, clickY]];
                    drawProcess++;
                    break;
                case 1:
                    if (clickPoint.length > 2) {
                        const range = 10;
                        if (Math.abs(clickPoint[clickPoint.length - 1][0] - clickX) < range / zoomParam.rate && Math.abs(clickPoint[clickPoint.length - 1][1] - clickY) < range / zoomParam.rate) {
                            drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.width);
                            for (let i = 0; i < drawObjects.length; i++) {
                                if (drawObjects[i].show && drawObjects[i].type != 'lineHor' && drawObjects[i].type != 'lineVer' && drawObjects[i].type != 'lineCircle') {
                                    redrawObject(drawObjects[i], drawCtx);
                                }
                            }
                            drawMultiLine(clickPoint, drawStyle.lineColor, drawStyle.lineWidth, 'none', drawCtx);
                            drawMultiLine(clickPoint, `#${drawId.toString(16).padStart(6, '0')}`, drawStyle.lineWidth, 'none', drawMemoryCtx);
                            drawObjects.push({
                                id: drawId,
                                type: 'drawMultiLine',
                                drawParam: [clickPoint, drawStyle.lineColor, drawStyle.lineWidth, 'none'],
                                angle: rotAngle,
                                show: true,
                                parent: null,
                                child: [drawId + 1]
                            });
                            const parentId = drawId;
                            const parentIdx = drawObjects.length - 1;
                            drawId++;
                            const msr = measureMultiPoint(clickPoint, drawStyle.lineColor, drawStyle.fontSize, drawStyle.digit);
                            drawSize(msr[0], msr[1], msr[2], msr[3], msr[4], msr[5], drawCtx);
                            drawSize(msr[0], msr[1], msr[2], msr[3], `#${drawId.toString(16).padStart(6, '0')}`, msr[5], drawMemoryCtx);
                            drawObjects.push({
                                id: drawId,
                                type: 'drawSize',
                                drawParam: msr,
                                angle: rotAngle,
                                show: true,
                                parent: parentId
                            });
                            drawId++;
                            if (drawModeOpt[0] === 'eachLength') {
                                for (let i = 1; i < clickPoint.length; i++) {
                                    const eachMsr = measureTwoPoint(clickPoint[i - 1][0], clickPoint[i - 1][1], clickPoint[i][0], clickPoint[i][1], drawStyle.lineColor, drawStyle.fontSize, drawStyle.digit);
                                    drawSize(eachMsr[0], eachMsr[1], eachMsr[2], eachMsr[3], eachMsr[4], eachMsr[5], drawCtx);
                                    drawSize(eachMsr[0], eachMsr[1], eachMsr[2], eachMsr[3], `#${drawId.toString(16).padStart(6, '0')}`, eachMsr[5], drawMemoryCtx);
                                    drawObjects.push({
                                        id: drawId,
                                        type: 'drawSize',
                                        drawParam: eachMsr,
                                        angle: rotAngle,
                                        show: true,
                                        parent: parentId
                                    });
                                    drawObjects[parentIdx].child.push(drawId);
                                    drawId++;
                                }
                            }
                            drawBackActive(true);
                            drawProcess = 0;
                            return;
                        }
                    }
                    clickPoint.push([clickX, clickY]);
                    const startX = clickPoint[clickPoint.length - 2][0];
                    const startY = clickPoint[clickPoint.length - 2][1];
                    const endX = clickPoint[clickPoint.length - 1][0];
                    const endY = clickPoint[clickPoint.length - 1][1];
                    drawLine(startX, startY, endX, endY, 'solid', drawStyle.lineColor, drawStyle.lineWidth, drawCtx);
                    break;
            }
            break;
        case 'measureParallel':
            switch (drawProcess) {
                case 0:
                    if (calibrationData === 0) popupMsgShow('計測値の表示には寸法校正が必要です');
                    clickPoint = [[clickX, clickY]];
                    drawProcess++;
                    break;
                case 1:
                    clickPoint.push([clickX, clickY]);
                    drawProcess++;
                    break;
                case 2:
                    clickPoint.push([clickX, clickY]);
                    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.width);
                    for (let i = 0; i < drawObjects.length; i++) {
                        if (drawObjects[i].show && drawObjects[i].type != 'lineHor' && drawObjects[i].type != 'lineVer' && drawObjects[i].type != 'lineCircle') {
                            redrawObject(drawObjects[i], drawCtx);
                        }
                    }
                    const center = drawParallel(clickPoint, drawStyle.lineColor, drawStyle.lineWidth, drawCtx);
                    drawParallel(clickPoint, `#${drawId.toString(16).padStart(6, '0')}`, drawStyle.lineWidth, drawMemoryCtx);
                    drawObjects.push({
                        id: drawId,
                        type: 'drawParallel',
                        drawParam: [clickPoint, drawStyle.lineColor, drawStyle.lineWidth],
                        angle: rotAngle,
                        show: true,
                        parent: null,
                        child: [drawId + 1]
                    });
                    drawId++;
                    const msr = measureTwoPoint(center[0][0], center[0][1], center[1][0], center[1][1], drawStyle.lineColor, drawStyle.fontSize, drawStyle.digit);
                    drawSize(msr[0], msr[1], msr[2], msr[3], msr[4], msr[5], drawCtx);
                    drawSize(msr[0], msr[1], msr[2], msr[3], `#${drawId.toString(16).padStart(6, '0')}`, msr[5], drawMemoryCtx);
                    drawObjects.push({
                        id: drawId,
                        type: 'drawSize',
                        drawParam: msr,
                        angle: rotAngle,
                        show: true,
                        parent: drawId - 1
                    });
                    drawId++;
                    drawBackActive(true);
                    drawProcess = 0;
                    break;
            }
            break;
        case 'measureRect':
            switch (drawProcess) {
                case 0:
                    if (calibrationData === 0) popupMsgShow('計測値の表示には寸法校正が必要です');
                    clickPoint = [[clickX, clickY]];
                    drawProcess++;
                    break;
                case 1:
                    clickPoint.push([clickX, clickY]);
                    let startX = clickPoint[0][0];
                    let startY = clickPoint[0][1];
                    let endX = clickPoint[1][0] - clickPoint[0][0];
                    let endY = clickPoint[1][1] - clickPoint[0][1];
                    drawRect(startX, startY, endX, endY, drawStyle.lineStyle, drawStyle.lineColor, drawStyle.lineWidth, drawStyle.fillColor, drawCtx);
                    drawRect(startX, startY, endX, endY, 'solid', `#${drawId.toString(16).padStart(6, '0')}`, drawStyle.lineWidth, `#${drawId.toString(16).padStart(6, '0')}`, drawMemoryCtx);
                    drawObjects.push({
                        id: drawId,
                        type: 'drawRect',
                        drawParam: [startX, startY, endX, endY, drawStyle.lineStyle, drawStyle.lineColor, drawStyle.lineWidth, drawStyle.fillColor],
                        angle: rotAngle,
                        show: true,
                        parent: null,
                        child: [drawId + 1]
                    });
                    drawId++;
                    msr = measureRect(clickPoint, drawStyle.lineColor, drawStyle.fontSize, drawStyle.digit);
                    let txt = [];
                    if (drawModeOpt[0] === 'length') txt.push(`周長：${((Math.abs(endX) * 2 + Math.abs(endY) * 2) * calibrationData).toFixed(drawStyle.digit)}㎜`);
                    if (drawModeOpt[1] === 'area') txt.push(msr[2]);
                    drawSize(msr[0], msr[1], txt, msr[3], msr[4], msr[5], drawCtx);
                    drawSize(msr[0], msr[1], txt, msr[3], `#${drawId.toString(16).padStart(6, '0')}`, msr[5], drawMemoryCtx);
                    drawObjects.push({
                        id: drawId,
                        type: 'drawSize',
                        drawParam: [msr[0], msr[1], txt, msr[3], msr[4], msr[5]],
                        angle: rotAngle,
                        show: true,
                        parent: drawId - 1
                    });
                    drawBackActive(true);
                    drawId++;
                    drawProcess = 0;
                    break;
            }
            break;
        case 'measurePolygon':
            switch (drawProcess) {
                case 0:
                    if (calibrationData === 0) popupMsgShow('計測値の表示には寸法校正が必要です');
                    clickPoint = [[clickX, clickY]];
                    drawProcess++;
                    break;
                case 1:
                    if (clickPoint.length > 2) {
                        const range = 10;
                        if (
                            (Math.abs(clickPoint[clickPoint.length - 1][0] - clickX) < range / zoomParam.rate && Math.abs(clickPoint[clickPoint.length - 1][1] - clickY) < range / zoomParam.rate)
                            || (Math.abs(clickPoint[0][0] - clickX) < range / zoomParam.rate && Math.abs(clickPoint[0][1] - clickY) < range / zoomParam.rate)
                        ) {
                            clickPoint.push(clickPoint[0]);
                            drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.width);
                            for (let i = 0; i < drawObjects.length; i++) {
                                if (drawObjects[i].show && drawObjects[i].type != 'lineHor' && drawObjects[i].type != 'lineVer' && drawObjects[i].type != 'lineCircle') {
                                    redrawObject(drawObjects[i], drawCtx);
                                }
                            }
                            drawMultiLine(clickPoint, drawStyle.lineColor, drawStyle.lineWidth, 'none', drawCtx);
                            drawMultiLine(clickPoint, `#${drawId.toString(16).padStart(6, '0')}`, drawStyle.lineWidth, 'none', drawMemoryCtx);
                            drawObjects.push({
                                id: drawId,
                                type: 'drawMultiLine',
                                drawParam: [clickPoint, drawStyle.lineColor, drawStyle.lineWidth, 'none'],
                                angle: rotAngle,
                                show: true,
                                parent: null,
                                child: [drawId + 1]
                            });
                            drawId++;
                            const msr = measureArea(clickPoint, drawStyle.lineColor, drawStyle.fontSize, drawStyle.digit);
                            let txt = [];
                            if (drawModeOpt[0] === 'length') {
                                let length = 0;
                                for (let i = 1; i < clickPoint.length; i++) {
                                    length += Math.sqrt((clickPoint[i][0] - clickPoint[i - 1][0]) ** 2 + (clickPoint[i][1] - clickPoint[i - 1][1]) ** 2);
                                }
                                txt.push(`周長：${(length * calibrationData).toFixed(drawStyle.digit)}㎜`);
                            }
                            if (drawModeOpt[1] === 'area') txt.push(msr[2]);
                            drawSize(msr[0], msr[1], txt, msr[3], msr[4], msr[5], drawCtx);
                            drawSize(msr[0], msr[1], txt, msr[3], `#${drawId.toString(16).padStart(6, '0')}`, msr[5], drawMemoryCtx);
                            drawObjects.push({
                                id: drawId,
                                type: 'drawSize',
                                drawParam: [msr[0], msr[1], txt, msr[3], msr[4], msr[5]],
                                angle: rotAngle,
                                show: true,
                                parent: drawId - 1
                            });
                            drawBackActive(true);
                            drawId++;
                            drawProcess = 0;
                            return;
                        }
                    }
                    clickPoint.push([clickX, clickY]);
                    const startX = clickPoint[clickPoint.length - 2][0];
                    const startY = clickPoint[clickPoint.length - 2][1];
                    const endX = clickPoint[clickPoint.length - 1][0];
                    const endY = clickPoint[clickPoint.length - 1][1];
                    drawLine(startX, startY, endX, endY, 'solid', drawStyle.lineColor, drawStyle.lineWidth, drawCtx);
                    break;
            }
            break;
        case 'measureCircle2':
            switch (drawProcess) {
                case 0:
                    if (calibrationData === 0) popupMsgShow('計測値の表示には寸法校正が必要です');
                    clickPoint = [[clickX, clickY]];
                    drawProcess++;
                    break;
                case 1:
                    if (drawModeOpt[4] != 'center') {
                        let x1 = clickPoint[0][0];
                        let y1 = clickPoint[0][1];
                        let x2 = clickX;
                        let y2 = clickY;
                        const centerX = (x1 + x2) / 2;
                        const centerY = (y1 + y2) / 2;
                        const radius = Math.sqrt((x2 - centerX) ** 2 + (y2 - centerY) ** 2);
                        drawArc(centerX, centerY, radius, 0, 2 * Math.PI, drawStyle.lineColor, drawStyle.lineWidth, drawCtx);
                        drawArc(centerX, centerY, radius, 0, 2 * Math.PI, `#${drawId.toString(16).padStart(6, '0')}`, drawStyle.lineWidth, drawMemoryCtx);
                        drawObjects.push({
                            id: drawId,
                            type: 'drawArc',
                            drawParam: [centerX, centerY, radius, 0, 2 * Math.PI, drawStyle.lineColor, drawStyle.lineWidth],
                            angle: rotAngle,
                            show: true,
                            parent: null,
                            child: [drawId + 1]
                        });
                        drawId++;
                        let txt = [];
                        if (drawModeOpt[0] === 'radius') txt.push(`半径：${(radius * calibrationData).toFixed(drawStyle.digit)}㎜`);
                        if (drawModeOpt[1] === 'diameter') txt.push(`直径：${(radius * 2 * calibrationData).toFixed(drawStyle.digit)}㎜`);
                        if (drawModeOpt[2] === 'length') txt.push(`周長：${(radius * 2 * Math.PI * calibrationData).toFixed(drawStyle.digit)}㎜`);
                        if (drawModeOpt[3] === 'area') txt.push(`面積：${(radius ** 2 * Math.PI * calibrationData ** 2).toFixed(drawStyle.digit)}㎟`);
                        drawSize(centerX + radius + 10, centerY, txt, 'left', drawStyle.lineColor, drawStyle.fontSize, drawCtx);
                        drawSize(centerX + radius + 10, centerY, txt, 'left', `#${drawId.toString(16).padStart(6, '0')}`, drawStyle.fontSize, drawMemoryCtx);
                        drawObjects.push({
                            id: drawId,
                            type: 'drawSize',
                            drawParam: [centerX + radius + 10, centerY, txt, 'left', drawStyle.lineColor, drawStyle.fontSize],
                            angle: rotAngle,
                            show: true,
                            parent: drawId - 1
                        });
                        drawBackActive(true);
                        drawId++;
                        drawProcess = 0;
                    } else {
                        clickPoint.push([clickX, clickY]);

                        const centerX = (clickPoint[0][0] + clickX) / 2;
                        const centerY = (clickPoint[0][1] + clickY) / 2;
                        const radius = Math.sqrt((clickX - clickPoint[0][0]) ** 2 + (clickY - clickPoint[0][1]) ** 2) / 2;
                        drawArc(centerX, centerY, radius, 0, 2 * Math.PI, drawStyle.lineColor, drawStyle.lineWidth, drawCtx);
                        drawProcess++;
                    }
                    break;
                case 2:
                    clickPoint.push([clickX, clickY]);
                    drawProcess++;
                    break;
                case 3:
                    clickPoint.push([clickX, clickY]);
                    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.width);
                    for (let i = 0; i < drawObjects.length; i++) {
                        if (drawObjects[i].show && drawObjects[i].type != 'lineHor' && drawObjects[i].type != 'lineVer' && drawObjects[i].type != 'lineCircle') {
                            redrawObject(drawObjects[i], drawCtx);
                        }
                    }
                    drawCircleCenter(clickPoint, drawStyle.lineColor, drawStyle.lineWidth, drawCtx);
                    drawCircleCenter(clickPoint, `#${drawId.toString(16).padStart(6, '0')}`, drawStyle.lineWidth, drawMemoryCtx);
                    drawObjects.push({
                        id: drawId,
                        type: 'drawCircleCenter',
                        drawParam: [clickPoint, drawStyle.lineColor, drawStyle.lineWidth],
                        angle: rotAngle,
                        show: true,
                        parent: null,
                        child: []
                    });
                    const parentId = drawId;
                    const parentIdx = drawObjects.length - 1;
                    drawId++;
                    const centerX1 = (clickPoint[0][0] + clickPoint[1][0]) / 2;
                    const centerY1 = (clickPoint[0][1] + clickPoint[1][1]) / 2;
                    const radius1 = Math.sqrt((clickPoint[1][0] - centerX1) ** 2 + (clickPoint[1][1] - centerY1) ** 2);
                    const centerX2 = (clickPoint[2][0] + clickPoint[3][0]) / 2;
                    const centerY2 = (clickPoint[2][1] + clickPoint[3][1]) / 2;
                    const radius2 = Math.sqrt((clickPoint[3][0] - centerX2) ** 2 + (clickPoint[3][1] - centerY2) ** 2);
                    let txt = [];
                    if (drawModeOpt[0] === 'radius' || drawModeOpt[1] === 'diameter' || drawModeOpt[2] === 'length' || drawModeOpt[3] === 'area') {
                        if (drawModeOpt[0] === 'radius') txt.push(`半径：${(radius1 * calibrationData).toFixed(drawStyle.digit)}㎜`);
                        if (drawModeOpt[1] === 'diameter') txt.push(`直径：${(radius1 * 2 * calibrationData).toFixed(drawStyle.digit)}㎜`);
                        if (drawModeOpt[2] === 'length') txt.push(`周長：${(radius1 * 2 * Math.PI * calibrationData).toFixed(drawStyle.digit)}㎜`);
                        if (drawModeOpt[3] === 'area') txt.push(`面積：${(radius1 ** 2 * Math.PI * calibrationData ** 2).toFixed(drawStyle.digit)}㎟`);
                        drawSize(centerX1 + radius1 + 10, centerY1, txt, 'left', drawStyle.lineColor, drawStyle.fontSize, drawCtx);
                        drawSize(centerX1 + radius1 + 10, centerY1, txt, 'left', `#${drawId.toString(16).padStart(6, '0')}`, drawStyle.fontSize, drawMemoryCtx);
                        drawObjects.push({
                            id: drawId,
                            type: 'drawSize',
                            drawParam: [centerX1 + radius1 + 10, centerY1, txt, 'left', drawStyle.lineColor, drawStyle.fontSize],
                            angle: rotAngle,
                            show: true,
                            parent: parentId
                        });
                        drawObjects[parentIdx].child.push(drawId);
                        drawId++;
                        txt = [];
                        if (drawModeOpt[0] === 'radius') txt.push(`半径：${(radius2 * calibrationData).toFixed(drawStyle.digit)}㎜`);
                        if (drawModeOpt[1] === 'diameter') txt.push(`直径：${(radius2 * 2 * calibrationData).toFixed(drawStyle.digit)}㎜`);
                        if (drawModeOpt[2] === 'length') txt.push(`周長：${(radius2 * 2 * Math.PI * calibrationData).toFixed(drawStyle.digit)}㎜`);
                        if (drawModeOpt[3] === 'area') txt.push(`面積：${(radius2 ** 2 * Math.PI * calibrationData ** 2).toFixed(drawStyle.digit)}㎟`);
                        drawSize(centerX2 + radius2 + 10, centerY2, txt, 'left', drawStyle.lineColor, drawStyle.fontSize, drawCtx);
                        drawSize(centerX2 + radius2 + 10, centerY2, txt, 'left', `#${drawId.toString(16).padStart(6, '0')}`, drawStyle.fontSize, drawMemoryCtx);
                        drawObjects.push({
                            id: drawId,
                            type: 'drawSize',
                            drawParam: [centerX2 + radius2 + 10, centerY2, txt, 'left', drawStyle.lineColor, drawStyle.fontSize],
                            angle: rotAngle,
                            show: true,
                            parent: parentId
                        });
                        drawObjects[parentIdx].child.push(drawId);
                        drawId++;
                    }
                    const msr = measureTwoPoint(centerX1, centerY1, centerX2, centerY2, drawStyle.lineColor, drawStyle.fontSize, drawStyle.digit);
                    drawSize(msr[0], msr[1], msr[2], msr[3], msr[4], msr[5], drawCtx);
                    drawSize(msr[0], msr[1], msr[2], msr[3], `#${drawId.toString(16).padStart(6, '0')}`, msr[5], drawMemoryCtx);
                    drawObjects.push({
                        id: drawId,
                        type: 'drawSize',
                        drawParam: msr,
                        angle: rotAngle,
                        show: true,
                        parent: parentId
                    });
                    drawObjects[parentIdx].child.push(drawId);
                    drawBackActive(true);
                    drawId++;
                    drawProcess = 0;
                    break;
            }
            break;
        case 'measureCircle3':
            switch (drawProcess) {
                case 0:
                    if (calibrationData === 0) popupMsgShow('計測値の表示には寸法校正が必要です');
                    clickPoint = [[clickX, clickY]];
                    circlePoints = [[clickX, clickY]];
                    drawProcess++;
                    break;
                case 1:
                    clickPoint.push([clickX, clickY]);
                    drawProcess++;
                    break;
                case 2:
                    if (drawModeOpt[4] != 'center') {
                        const x1 = clickPoint[0][0];
                        const y1 = clickPoint[0][1];
                        const x2 = clickPoint[1][0];
                        const y2 = clickPoint[1][1];
                        const x3 = clickX;
                        const y3 = clickY;
                        const arcData = culcArc(x1, y1, x2, y2, x3, y3);
                        const centerX = arcData.center[0];
                        const centerY = arcData.center[1];
                        const radius = Math.sqrt((x1 - centerX) ** 2 + (y1 - centerY) ** 2);
                        drawArc(centerX, centerY, radius, 0, 2 * Math.PI, drawStyle.lineColor, drawStyle.lineWidth, drawCtx);
                        drawArc(centerX, centerY, radius, 0, 2 * Math.PI, `#${drawId.toString(16).padStart(6, '0')}`, drawStyle.lineWidth, drawMemoryCtx);
                        drawObjects.push({
                            id: drawId,
                            type: 'drawArc',
                            drawParam: [centerX, centerY, radius, 0, 2 * Math.PI, drawStyle.lineColor, drawStyle.lineWidth],
                            angle: rotAngle,
                            show: true,
                            parent: null,
                            child: [drawId + 1]
                        });
                        drawId++;
                        let txt = [];
                        if (drawModeOpt[0] === 'radius') txt.push(`半径：${(radius * calibrationData).toFixed(drawStyle.digit)}㎜`);
                        if (drawModeOpt[1] === 'diameter') txt.push(`直径：${(radius * 2 * calibrationData).toFixed(drawStyle.digit)}㎜`);
                        if (drawModeOpt[2] === 'length') txt.push(`周長：${(radius * 2 * Math.PI * calibrationData).toFixed(drawStyle.digit)}㎜`);
                        if (drawModeOpt[3] === 'area') txt.push(`面積：${(radius ** 2 * Math.PI * calibrationData ** 2).toFixed(drawStyle.digit)}㎟`);
                        drawSize(centerX + radius + 10, centerY, txt, 'left', drawStyle.lineColor, drawStyle.fontSize, drawCtx);
                        drawSize(centerX + radius + 10, centerY, txt, 'left', `#${drawId.toString(16).padStart(6, '0')}`, drawStyle.fontSize, drawMemoryCtx);
                        drawObjects.push({
                            id: drawId,
                            type: 'drawSize',
                            drawParam: [centerX + radius + 10, centerY, txt, 'left', drawStyle.lineColor, drawStyle.fontSize],
                            angle: rotAngle,
                            show: true,
                            parent: drawId - 1
                        });
                        drawBackActive(true);
                        drawId++;
                        drawProcess = 0;
                    } else {
                        clickPoint.push([clickX, clickY]);
                        const x1 = clickPoint[0][0];
                        const y1 = clickPoint[0][1];
                        const x2 = clickPoint[1][0];
                        const y2 = clickPoint[1][1];
                        const x3 = clickX;
                        const y3 = clickY;
                        const arcData = culcArc(x1, y1, x2, y2, x3, y3);
                        const centerX = arcData.center[0];
                        const centerY = arcData.center[1];
                        const radius = Math.sqrt((x1 - centerX) ** 2 + (y1 - centerY) ** 2);
                        drawArc(centerX, centerY, radius, 0, 2 * Math.PI, drawStyle.lineColor, drawStyle.lineWidth, drawCtx);
                        circlePoints.push([-circlePoints[0][0] + 2 * centerX, -circlePoints[0][1] + 2 * centerY]);
                        drawProcess++;
                    }
                    break;
                case 3:
                    clickPoint.push([clickX, clickY]);
                    circlePoints.push([clickX, clickY]);
                    drawProcess++;
                    break;
                case 4:
                    clickPoint.push([clickX, clickY]);
                    drawProcess++;
                    break;
                case 5:
                    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.width);
                    for (let i = 0; i < drawObjects.length; i++) {
                        if (drawObjects[i].show && drawObjects[i].type != 'lineHor' && drawObjects[i].type != 'lineVer' && drawObjects[i].type != 'lineCircle') {
                            redrawObject(drawObjects[i], drawCtx);
                        }
                    }
                    const x1 = clickPoint[3][0];
                    const y1 = clickPoint[3][1];
                    const x2 = clickPoint[4][0];
                    const y2 = clickPoint[4][1];
                    const x3 = clickX;
                    const y3 = clickY;
                    const arcData = culcArc(x1, y1, x2, y2, x3, y3);
                    const centerX = arcData.center[0];
                    const centerY = arcData.center[1];
                    circlePoints.push([-circlePoints[2][0] + 2 * centerX, -circlePoints[2][1] + 2 * centerY]);
                    drawCircleCenter(circlePoints, drawStyle.lineColor, drawStyle.lineWidth, drawCtx);
                    drawCircleCenter(circlePoints, `#${drawId.toString(16).padStart(6, '0')}`, drawStyle.lineWidth, drawMemoryCtx);
                    drawObjects.push({
                        id: drawId,
                        type: 'drawCircleCenter',
                        drawParam: [circlePoints, drawStyle.lineColor, drawStyle.lineWidth],
                        angle: rotAngle,
                        show: true,
                        parent: null,
                        child: []
                    });
                    const parentId = drawId;
                    const parentIdx = drawObjects.length - 1;
                    drawId++;
                    const centerX1 = (circlePoints[0][0] + circlePoints[1][0]) / 2;
                    const centerY1 = (circlePoints[0][1] + circlePoints[1][1]) / 2;
                    const radius1 = Math.sqrt((circlePoints[1][0] - centerX1) ** 2 + (circlePoints[1][1] - centerY1) ** 2);
                    const centerX2 = (circlePoints[2][0] + circlePoints[3][0]) / 2;
                    const centerY2 = (circlePoints[2][1] + circlePoints[3][1]) / 2;
                    const radius2 = Math.sqrt((circlePoints[3][0] - centerX2) ** 2 + (circlePoints[3][1] - centerY2) ** 2);
                    let txt = [];
                    if (drawModeOpt[0] === 'radius' || drawModeOpt[1] === 'diameter' || drawModeOpt[2] === 'length' || drawModeOpt[3] === 'area') {
                        if (drawModeOpt[0] === 'radius') txt.push(`半径：${(radius1 * calibrationData).toFixed(drawStyle.digit)}㎜`);
                        if (drawModeOpt[1] === 'diameter') txt.push(`直径：${(radius1 * 2 * calibrationData).toFixed(drawStyle.digit)}㎜`);
                        if (drawModeOpt[2] === 'length') txt.push(`周長：${(radius1 * 2 * Math.PI * calibrationData).toFixed(drawStyle.digit)}㎜`);
                        if (drawModeOpt[3] === 'area') txt.push(`面積：${(radius1 ** 2 * Math.PI * calibrationData ** 2).toFixed(drawStyle.digit)}㎟`);
                        drawSize(centerX1 + radius1 + 10, centerY1, txt, 'left', drawStyle.lineColor, drawStyle.fontSize, drawCtx);
                        drawSize(centerX1 + radius1 + 10, centerY1, txt, 'left', `#${drawId.toString(16).padStart(6, '0')}`, drawStyle.fontSize, drawMemoryCtx);
                        drawObjects.push({
                            id: drawId,
                            type: 'drawSize',
                            drawParam: [centerX1 + radius1 + 10, centerY1, txt, 'left', drawStyle.lineColor, drawStyle.fontSize],
                            angle: rotAngle,
                            show: true,
                            parent: parentId
                        });
                        drawObjects[parentIdx].child.push(drawId);
                        drawId++;
                        txt = [];
                        if (drawModeOpt[0] === 'radius') txt.push(`半径：${(radius2 * calibrationData).toFixed(drawStyle.digit)}㎜`);
                        if (drawModeOpt[1] === 'diameter') txt.push(`直径：${(radius2 * 2 * calibrationData).toFixed(drawStyle.digit)}㎜`);
                        if (drawModeOpt[2] === 'length') txt.push(`周長：${(radius2 * 2 * Math.PI * calibrationData).toFixed(drawStyle.digit)}㎜`);
                        if (drawModeOpt[3] === 'area') txt.push(`面積：${(radius2 ** 2 * Math.PI * calibrationData ** 2).toFixed(drawStyle.digit)}㎟`);
                        drawSize(centerX2 + radius2 + 10, centerY2, txt, 'left', drawStyle.lineColor, drawStyle.fontSize, drawCtx);
                        drawSize(centerX2 + radius2 + 10, centerY2, txt, 'left', `#${drawId.toString(16).padStart(6, '0')}`, drawStyle.fontSize, drawMemoryCtx);
                        drawObjects.push({
                            id: drawId,
                            type: 'drawSize',
                            drawParam: [centerX2 + radius2 + 10, centerY2, txt, 'left', drawStyle.lineColor, drawStyle.fontSize],
                            angle: rotAngle,
                            show: true,
                            parent: parentId
                        });
                        drawObjects[parentIdx].child.push(drawId);
                        drawId++;
                    }
                    const msr = measureTwoPoint(centerX1, centerY1, centerX2, centerY2, drawStyle.lineColor, drawStyle.fontSize, drawStyle.digit);
                    drawSize(msr[0], msr[1], msr[2], msr[3], msr[4], msr[5], drawCtx);
                    drawSize(msr[0], msr[1], msr[2], msr[3], `#${drawId.toString(16).padStart(6, '0')}`, msr[5], drawMemoryCtx);
                    drawObjects.push({
                        id: drawId,
                        type: 'drawSize',
                        drawParam: msr,
                        angle: rotAngle,
                        show: true,
                        parent: parentId
                    });
                    drawObjects[parentIdx].child.push(drawId);
                    drawBackActive(true);
                    drawId++;
                    drawProcess = 0;
                    break;
            }
            break;
        case 'measureArc':
            switch (drawProcess) {
                case 0:
                    if (calibrationData === 0) popupMsgShow('計測値の表示には寸法校正が必要です');
                    clickPoint = [[clickX, clickY]];
                    drawProcess++;
                    break;
                case 1:
                    clickPoint.push([clickX, clickY]);
                    drawProcess++;
                    break;
                case 2:
                    clickPoint.push([clickX, clickY]);
                    let x1 = clickPoint[0][0];
                    let y1 = clickPoint[0][1];
                    let x2 = clickPoint[1][0];
                    let y2 = clickPoint[1][1];
                    const x3 = clickPoint[2][0];
                    const y3 = clickPoint[2][1];
                    const arcData = culcArc(x1, y1, x2, y2, x3, y3);
                    const centerX = arcData.center[0];
                    const centerY = arcData.center[1];
                    const startAngle = arcData.angle[0];
                    const endAngle = arcData.angle[1];
                    const radius = Math.sqrt((x1 - centerX) ** 2 + (y1 - centerY) ** 2);
                    drawArc(centerX, centerY, radius, startAngle, endAngle, drawStyle.lineColor, drawStyle.lineWidth, drawCtx);
                    drawArc(centerX, centerY, radius, startAngle, endAngle, `#${drawId.toString(16).padStart(6, '0')}`, drawStyle.lineWidth, drawMemoryCtx);
                    drawObjects.push({
                        id: drawId,
                        type: 'drawArc',
                        drawParam: [centerX, centerY, radius, startAngle, endAngle, drawStyle.lineColor, drawStyle.lineWidth],
                        angle: rotAngle,
                        show: true,
                        parent: null,
                        child: [drawId + 1]
                    });
                    drawId++;
                    let txt = [];
                    if (drawModeOpt[0] === 'radius') txt.push(`半径：${(radius * calibrationData).toFixed(drawStyle.digit)}㎜`);
                    if (drawModeOpt[1] === 'length') {
                        if (startAngle < endAngle) txt.push(`周長：${(radius * 2 * Math.PI * (endAngle - startAngle) / (2 * Math.PI) * calibrationData).toFixed(drawStyle.digit)}㎜`);
                        else txt.push(`周長：${(radius * 2 * Math.PI * ((endAngle + 2 * Math.PI) - startAngle) / (2 * Math.PI) * calibrationData).toFixed(drawStyle.digit)}㎜`);
                    }
                    drawSize(centerX + radius + 10, (y1 + y2) / 2, txt, 'left', drawStyle.lineColor, drawStyle.fontSize, drawCtx);
                    drawSize(centerX + radius + 10, (y1 + y2) / 2, txt, 'left', `#${drawId.toString(16).padStart(6, '0')}`, drawStyle.fontSize, drawMemoryCtx);
                    drawObjects.push({
                        id: drawId,
                        type: 'drawSize',
                        drawParam: [centerX + radius + 10, (y1 + y2) / 2, txt, 'left', drawStyle.lineColor, drawStyle.fontSize],
                        angle: rotAngle,
                        show: true,
                        parent: drawId - 1
                    });
                    drawBackActive(true);
                    drawId++;
                    drawProcess = 0;
                    break;
            }
            break;
        case 'measurePointAngle':
            switch (drawProcess) {
                case 0:
                    clickPoint = [[clickX, clickY]];
                    drawProcess++;
                    break;
                case 1:
                    clickPoint.push([clickX, clickY]);
                    drawLine(clickPoint[0][0], clickPoint[0][1], clickPoint[1][0], clickPoint[1][1], 'solid', drawStyle.lineColor, drawStyle.lineWidth, drawCtx);
                    drawProcess++;
                    break;
                case 2:
                    clickPoint.push([clickX, clickY]);
                    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.width);
                    for (let i = 0; i < drawObjects.length; i++) {
                        if (drawObjects[i].show && drawObjects[i].type != 'lineHor' && drawObjects[i].type != 'lineVer' && drawObjects[i].type != 'lineCircle') {
                            redrawObject(drawObjects[i], drawCtx);
                        }
                    }
                    msr = measurePointAngle(clickPoint, isShiftKey, drawStyle.lineColor, drawStyle.lineWidth, drawStyle.fontSize, drawStyle.digit - 1, drawCtx);
                    measurePointAngle(clickPoint, isShiftKey, `#${drawId.toString(16).padStart(6, '0')}`, drawStyle.lineWidth, drawStyle.fontSize, drawStyle.digit - 1, drawMemoryCtx);
                    drawObjects.push({
                        id: drawId,
                        type: 'drawAngle',
                        drawParam: [clickPoint, isShiftKey, drawStyle.lineColor, drawStyle.lineWidth, drawStyle.fontSize, drawStyle.digit - 1],
                        angle: rotAngle,
                        show: true,
                        parent: null,
                        child: [drawId + 1]
                    });
                    drawId++;
                    drawSize(msr[0], msr[1], msr[2], msr[3], msr[4], msr[5], drawCtx);
                    drawSize(msr[0], msr[1], msr[2], msr[3], `#${drawId.toString(16).padStart(6, '0')}`, msr[5], drawMemoryCtx);
                    drawObjects.push({
                        id: drawId,
                        type: 'drawSize',
                        drawParam: [msr[0], msr[1], msr[2], msr[3], msr[4], msr[5]],
                        angle: rotAngle,
                        show: true,
                        parent: drawId - 1
                    });
                    drawBackActive(true);
                    drawId++;
                    drawProcess = 0;
            }
            break;
        case 'measureLineAngle':
            switch (drawProcess) {
                case 0:
                    clickPoint = [[clickX, clickY]];
                    drawProcess++;
                    break;
                case 1:
                    clickPoint.push([clickX, clickY]);
                    drawLine(clickPoint[0][0], clickPoint[0][1], clickPoint[1][0], clickPoint[1][1], 'solid', drawStyle.lineColor, drawStyle.lineWidth, drawCtx);
                    drawProcess++;
                    break;
                case 2:
                    clickPoint.push([clickX, clickY]);
                    drawProcess++;
                    break;
                case 3:
                    clickPoint.push([clickX, clickY]);
                    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.width);
                    for (let i = 0; i < drawObjects.length; i++) {
                        if (drawObjects[i].show && drawObjects[i].type != 'lineHor' && drawObjects[i].type != 'lineVer' && drawObjects[i].type != 'lineCircle') {
                            redrawObject(drawObjects[i], drawCtx);
                        }
                    }
                    msr = measureLineAngle(clickPoint, drawStyle.lineColor, drawStyle.lineWidth, drawStyle.fontSize, drawStyle.digit - 1, drawCtx);
                    measureLineAngle(clickPoint, `#${drawId.toString(16).padStart(6, '0')}`, drawStyle.lineWidth, drawStyle.fontSize, drawStyle.digit - 1, drawMemoryCtx);
                    drawObjects.push({
                        id: drawId,
                        type: 'drawLineAngle',
                        drawParam: [clickPoint, drawStyle.lineColor, drawStyle.lineWidth, drawStyle.fontSize, drawStyle.digit - 1],
                        angle: rotAngle,
                        show: true,
                        parent: null,
                        child: [drawId + 1]
                    });
                    drawId++;
                    drawSize(msr[0], msr[1], msr[2], msr[3], msr[4], msr[5], drawCtx);
                    drawSize(msr[0], msr[1], msr[2], msr[3], `#${drawId.toString(16).padStart(6, '0')}`, msr[5], drawMemoryCtx);
                    drawObjects.push({
                        id: drawId,
                        type: 'drawSize',
                        drawParam: [msr[0], msr[1], msr[2], msr[3], msr[4], msr[5]],
                        angle: rotAngle,
                        show: true,
                        parent: drawId - 1
                    });
                    drawBackActive(true);
                    drawId++;
                    drawProcess = 0;
            }
            break;
    }
});
eventCanvas.addEventListener('mousedown', (event) => {
    if (drawMode != 'drawDelete' || event.button != 0 || drawProcess != 0) return;
    const rect = eventCanvas.getBoundingClientRect();
    const clickX = (event.clientX - rect.left) / zoomParam.rate;
    const clickY = (event.clientY - rect.top) / zoomParam.rate;
    clickPoint = [[clickX, clickY]];
    drawProcess++;
});
eventCanvas.addEventListener('mouseenter', () => {
    if (loupe.status) loupeCanvas.style.display = 'block';
});
eventCanvas.addEventListener('mouseleave', () => {
    loupeCanvas.style.display = 'none';
});
eventCanvas.addEventListener('mousemove', (event) => {
    preDrawCtx.clearRect(0, 0, preDrawCanvas.width, preDrawCanvas.width);
    if (drawMode === 'none' && !loupe.status) return;
    const rect = eventCanvas.getBoundingClientRect();
    const pointerX = (event.clientX - rect.left) / zoomParam.rate;
    const pointerY = (event.clientY - rect.top) / zoomParam.rate;
    if (loupe.status) {
        loupeCanvas.style.left = `${event.clientX - loupeSize / 2}px`;
        loupeCanvas.style.top = `${event.clientY - loupeSize / 2}px`;
        if (rotAngle === 0) {
            loupeArea.pointerX = pointerX;
            loupeArea.pointerY = pointerY;
        } else if (rotAngle === 90) {
            loupeArea.pointerX = pointerY;
            loupeArea.pointerY = videoCanvas.height - pointerX;
        } else if (rotAngle === 180) {
            loupeArea.pointerX = videoCanvas.width - pointerX;
            loupeArea.pointerY = videoCanvas.height - pointerY;
        } else if (rotAngle === -90) {
            loupeArea.pointerX = videoCanvas.width - pointerY;
            loupeArea.pointerY = pointerX;
        }
        return;
    }
    switch (drawMode) {
        case 'drawLine':
            switch (drawProcess) {
                case 1:
                    let endX = pointerX;
                    let endY = pointerY;

                    if (isShiftKey == true) {
                        const delta = (pointerY - clickPoint[0][1]) / (pointerX - clickPoint[0][0]);
                        if (-1 < delta && delta <= 1) {
                            endY = clickPoint[0][1];
                        } else {
                            endX = clickPoint[0][0];
                        }
                    }
                    drawLine(clickPoint[0][0], clickPoint[0][1], endX, endY, drawStyle.lineStyle, drawStyle.lineColor, drawStyle.lineWidth, preDrawCtx);
                    break;
            }
            break;
        case 'drawArrow':
            switch (drawProcess) {
                case 1:
                    let endX = pointerX;
                    let endY = pointerY;

                    if (isShiftKey == true) {
                        const delta = (pointerY - clickPoint[0][1]) / (pointerX - clickPoint[0][0]);
                        if (-1 < delta && delta <= 1) {
                            endY = clickPoint[0][1];
                        } else {
                            endX = clickPoint[0][0];
                        }
                    }
                    drawArrow(clickPoint[0][0], clickPoint[0][1], endX, endY, drawStyle.startLineStyle, drawStyle.lineStyle, drawStyle.endLineStyle, drawStyle.lineColor, drawStyle.lineWidth, preDrawCtx);
                    break;
            }
            break;
        case 'drawRect':
            switch (drawProcess) {
                case 1:
                    const squareSide = Math.max(Math.abs(pointerX - clickPoint[0][0]), Math.abs(pointerY - clickPoint[0][1]));
                    if (isShiftKey === true) {
                        if (clickPoint[0][0] <= pointerX && clickPoint[0][1] <= pointerY) {
                            drawRect(clickPoint[0][0], clickPoint[0][1], squareSide, squareSide, drawStyle.lineStyle, drawStyle.lineColor, drawStyle.lineWidth, drawStyle.fillColor, preDrawCtx);
                        } else if (clickPoint[0][0] <= pointerX && clickPoint[0][1] > pointerY) {
                            drawRect(clickPoint[0][0], clickPoint[0][1] - squareSide, squareSide, squareSide, drawStyle.lineStyle, drawStyle.lineColor, drawStyle.lineWidth, drawStyle.fillColor, preDrawCtx);
                        } else if (clickPoint[0][0] > pointerX && clickPoint[0][1] > pointerY) {
                            drawRect(clickPoint[0][0] - squareSide, clickPoint[0][1] - squareSide, squareSide, squareSide, drawStyle.lineStyle, drawStyle.lineColor, drawStyle.lineWidth, drawStyle.fillColor, preDrawCtx);
                        } else if (clickPoint[0][0] > pointerX && clickPoint[0][1] <= pointerY) {
                            drawRect(clickPoint[0][0] - squareSide, clickPoint[0][1], squareSide, squareSide, drawStyle.lineStyle, drawStyle.lineColor, drawStyle.lineWidth, drawStyle.fillColor, preDrawCtx);
                        }
                    } else {
                        drawRect(clickPoint[0][0], clickPoint[0][1], pointerX - clickPoint[0][0], pointerY - clickPoint[0][1], drawStyle.lineStyle, drawStyle.lineColor, drawStyle.lineWidth, drawStyle.fillColor, preDrawCtx);
                    }
                    break;
            }
            break;
        case 'drawPolygon':
            switch (drawProcess) {
                case 1:
                    drawLine(clickPoint[clickPoint.length - 1][0], clickPoint[clickPoint.length - 1][1], pointerX, pointerY, drawStyle.lineStyle, drawStyle.lineColor, drawStyle.lineWidth, preDrawCtx);
                    break;
            }
            break;
        case 'drawCircle':
            switch (drawProcess) {
                case 1:
                    const squareSide = Math.max(Math.abs(pointerX - clickPoint[0][0]), Math.abs(pointerY - clickPoint[0][1]));
                    if (isShiftKey === true) {
                        if (clickPoint[0][0] <= pointerX && clickPoint[0][1] <= pointerY) {
                            drawCircle(clickPoint[0][0], clickPoint[0][1], squareSide, squareSide, drawStyle.lineStyle, drawStyle.lineColor, drawStyle.lineWidth, drawStyle.fillColor, preDrawCtx);
                        } else if (clickPoint[0][0] <= pointerX && clickPoint[0][1] > pointerY) {
                            drawCircle(clickPoint[0][0], clickPoint[0][1] - squareSide, squareSide, squareSide, drawStyle.lineStyle, drawStyle.lineColor, drawStyle.lineWidth, drawStyle.fillColor, preDrawCtx);
                        } else if (clickPoint[0][0] > pointerX && clickPoint[0][1] > pointerY) {
                            drawCircle(clickPoint[0][0] - squareSide, clickPoint[0][1] - squareSide, squareSide, squareSide, drawStyle.lineStyle, drawStyle.lineColor, drawStyle.lineWidth, drawStyle.fillColor, preDrawCtx);
                        } else if (clickPoint[0][0] > pointerX && clickPoint[0][1] <= pointerY) {
                            drawCircle(clickPoint[0][0] - squareSide, clickPoint[0][1], squareSide, squareSide, drawStyle.lineStyle, drawStyle.lineColor, drawStyle.lineWidth, drawStyle.fillColor, preDrawCtx);
                        }
                    } else {
                        drawCircle(clickPoint[0][0], clickPoint[0][1], pointerX - clickPoint[0][0], pointerY - clickPoint[0][1], drawStyle.lineStyle, drawStyle.lineColor, drawStyle.lineWidth, drawStyle.fillColor, preDrawCtx);
                    }
                    break;
            }
            break;
        case 'drawMove':
            switch (drawProcess) {
                case 0:
                    const searchRange = Math.ceil(15 / zoomParam.rate);
                    let getId = objectSearch(pointerX, pointerY, searchRange);
                    if (getId === null) break;
                    for (let i = 0; i < drawObjects.length; i++) {
                        if (drawObjects[i].show && drawObjects[i].id === getId && (drawObjects[i].type != 'lineHor' && drawObjects[i].type != 'lineVer' && drawObjects[i].type != 'lineCircle')) {

                            if (typeof drawObjects[i].child != 'undefined') return;
                            redrawObject(drawObjects[i], preDrawCtx);
                            break;
                        }
                    }
                    break;
                case 1:
                    let shiftX;
                    let shiftY;
                    if (movingObject.angle - rotAngle === 0) {
                        shiftX = pointerX - clickPoint[0][0];
                        shiftY = pointerY - clickPoint[0][1];
                    } else if (movingObject.angle - rotAngle === 90 || movingObject.angle - rotAngle === -270) {
                        shiftX = -(pointerY - clickPoint[0][1]);
                        shiftY = pointerX - clickPoint[0][0];
                    } else if (movingObject.angle - rotAngle === 180 || movingObject.angle - rotAngle === -180) {
                        shiftX = -(pointerX - clickPoint[0][0]);
                        shiftY = -(pointerY - clickPoint[0][1]);
                    } else if (movingObject.angle - rotAngle === 270 || movingObject.angle - rotAngle === -90) {
                        shiftX = pointerY - clickPoint[0][1];
                        shiftY = -(pointerX - clickPoint[0][0]);
                    }
                    let objectParam;
                    if (movingObject.type === 'drawLine' || movingObject.type === 'drawArrow') {
                        objectParam = movingObject.drawParam.slice();
                        objectParam[0] = objectParam[0] + shiftX;
                        objectParam[1] = objectParam[1] + shiftY;
                        objectParam[2] = objectParam[2] + shiftX;
                        objectParam[3] = objectParam[3] + shiftY;
                    } else if (movingObject.type === 'drawRect' || movingObject.type === 'drawCircle' || movingObject.type === 'drawText' || movingObject.type === 'drawSize') {
                        objectParam = movingObject.drawParam.slice();
                        objectParam[0] += shiftX;
                        objectParam[1] += shiftY;
                    } else if (movingObject.type === 'drawMultiLine') {
                        objectParam = [[], movingObject.drawParam[1], movingObject.drawParam[2], movingObject.drawParam[3]];
                        for (let i = 0; i < movingObject.drawParam[0].length; i++) {
                            const point = movingObject.drawParam[0][i].slice();
                            objectParam[0].push([point[0] + shiftX, point[1] + shiftY]);
                        }
                    }

                    redrawObject(movingObject, preDrawCtx, objectParam);
                    break;
            }
            break;
        case 'drawDelete':
            switch (drawProcess) {
                case 0:
                    const searchRange = Math.ceil(15 / zoomParam.rate);
                    let getId = objectSearch(pointerX, pointerY, searchRange);
                    if (getId === null) break;
                    for (let i = 0; i < drawObjects.length; i++) {
                        if (drawObjects[i].show && drawObjects[i].id === getId && (drawObjects[i].type != 'lineHor' && drawObjects[i].type != 'lineVer' && drawObjects[i].type != 'lineCircle')) {
                            redrawObject(drawObjects[i], preDrawCtx);
                            break;
                        }
                    }
                    break;
                case 1:
                    const startX = clickPoint[0][0];
                    const startY = clickPoint[0][1];
                    const rectWidth = pointerX - startX;
                    const rectHeight = pointerY - startY;
                    drawRect(startX, startY, rectWidth, rectHeight, 'solid', accentColor, 5, accentColor, preDrawCtx);
                    break;
            }
            break;
        case 'addLine':
            switch (drawProcess) {
                case 0:

                    if (drawModeOpt[0] === 'hor') {
                        let endX = (rotAngle === 0 || rotAngle === 180) ? lineCanvas.width : lineCanvas.height;
                        drawLine(0, pointerY, endX, pointerY, 'solid', lineGuideStyle.color, lineGuideStyle.width, preDrawCtx);
                    }

                    if (drawModeOpt[1] === 'ver') {
                        let endY = (rotAngle === 0 || rotAngle === 180) ? lineCanvas.height : lineCanvas.width;
                        drawLine(pointerX, 0, pointerX, endY, 'solid', lineGuideStyle.color, lineGuideStyle.width, preDrawCtx);
                    }
                    break;
            }
            break;
        case 'lineCircle':
            switch (drawProcess) {
                case 1:
                    let radius = Math.sqrt((pointerX - clickPoint[0][0]) ** 2 + (pointerY - clickPoint[0][1]) ** 2);
                    let startX = clickPoint[0][0] - radius;
                    let startY = clickPoint[0][1] - radius;
                    let width = radius * 2;
                    let height = radius * 2;
                    drawCircle(startX, startY, width, height, 'solid', lineGuideStyle.color, lineGuideStyle.width, drawStyle.fillColor, preDrawCtx);
                    break;
            }
            break;
        case 'lineMove':
            switch (drawProcess) {
                case 0:
                    const searchRange = Math.ceil(15 / zoomParam.rate);
                    let getId = objectSearch(pointerX, pointerY, searchRange);
                    if (getId === null) break;
                    for (let i = 0; i < drawObjects.length; i++) {
                        if (drawObjects[i].id === getId && (drawObjects[i].type === 'lineHor' || drawObjects[i].type === 'lineVer' || drawObjects[i].type === 'lineCircle')) {
                            redrawObject(drawObjects[i], preDrawCtx);
                            break;
                        }
                    }
                    break;
                case 1:
                    let shiftX;
                    let shiftY;
                    if (movingObject.angle - rotAngle === 0) {
                        shiftX = pointerX - clickPoint[0][0];
                        shiftY = pointerY - clickPoint[0][1];
                    } else if (movingObject.angle - rotAngle === 90 || movingObject.angle - rotAngle === -270) {
                        shiftX = -(pointerY - clickPoint[0][1]);
                        shiftY = pointerX - clickPoint[0][0];
                    } else if (movingObject.angle - rotAngle === 180 || movingObject.angle - rotAngle === -180) {
                        shiftX = -(pointerX - clickPoint[0][0]);
                        shiftY = -(pointerY - clickPoint[0][1]);
                    } else if (movingObject.angle - rotAngle === 270 || movingObject.angle - rotAngle === -90) {
                        shiftX = pointerY - clickPoint[0][1];
                        shiftY = -(pointerX - clickPoint[0][0]);
                    }
                    let objectParam = movingObject.drawParam.slice();
                    if (movingObject.type === 'lineHor') {
                        objectParam[1] += shiftY;
                        objectParam[3] += shiftY;
                    } else if (movingObject.type === 'lineVer') {
                        objectParam[0] += shiftX;
                        objectParam[2] += shiftX;
                    } else if (movingObject.type === 'lineCircle') {
                        objectParam[0] += shiftX;
                        objectParam[1] += shiftY;
                    }
                    redrawObject(movingObject, preDrawCtx, objectParam);
                    break;
            }
            break;
        case 'lineDelete':
            switch (drawProcess) {
                case 0:
                    const searchRange = Math.ceil(15 / zoomParam.rate);
                    let getId = objectSearch(pointerX, pointerY, searchRange);
                    if (getId === null) break;
                    for (let i = 0; i < drawObjects.length; i++) {
                        if (drawObjects[i].id === getId && (drawObjects[i].type === 'lineHor' || drawObjects[i].type === 'lineVer' || drawObjects[i].type === 'lineCircle')) {
                            redrawObject(drawObjects[i], preDrawCtx);
                            break;
                        }
                    }
                    break;
            }
            break;
        case 'shadowMask':
            switch (drawProcess) {
                case 1:
                    const squareSide = Math.max(Math.abs(pointerX - clickPoint[0][0]), Math.abs(pointerY - clickPoint[0][1]));
                    if (isShiftKey === true) {
                        if (clickPoint[0][0] <= pointerX && clickPoint[0][1] <= pointerY) {
                            drawRect(clickPoint[0][0], clickPoint[0][1], squareSide, squareSide, 'solid', accentColor, drawStyle.lineWidth, 'none', preDrawCtx);
                        } else if (clickPoint[0][0] <= pointerX && clickPoint[0][1] > pointerY) {
                            drawRect(clickPoint[0][0], clickPoint[0][1] - squareSide, squareSide, squareSide, 'solid', accentColor, drawStyle.lineWidth, 'none', preDrawCtx);
                        } else if (clickPoint[0][0] > pointerX && clickPoint[0][1] > pointerY) {
                            drawRect(clickPoint[0][0] - squareSide, clickPoint[0][1] - squareSide, squareSide, squareSide, 'solid', accentColor, drawStyle.lineWidth, 'none', preDrawCtx);
                        } else if (clickPoint[0][0] > pointerX && clickPoint[0][1] <= pointerY) {
                            drawRect(clickPoint[0][0] - squareSide, clickPoint[0][1], squareSide, squareSide, 'solid', accentColor, drawStyle.lineWidth, 'none', preDrawCtx);
                        }
                    } else {
                        drawRect(clickPoint[0][0], clickPoint[0][1], pointerX - clickPoint[0][0], pointerY - clickPoint[0][1], 'solid', accentColor, 5, 'none', preDrawCtx);
                    }
                    break;
            }
            break;
        case 'measureTwoPoint':
            switch (drawProcess) {
                case 1:
                    drawLine(clickPoint[0][0], clickPoint[0][1], pointerX, pointerY, drawStyle.lineStyle, drawStyle.lineColor, drawStyle.lineWidth, preDrawCtx);
                    break;
            }
            break;
        case 'measureMultiPoint':
            switch (drawProcess) {
                case 1:
                    drawLine(clickPoint[clickPoint.length - 1][0], clickPoint[clickPoint.length - 1][1], pointerX, pointerY, drawStyle.lineStyle, drawStyle.lineColor, drawStyle.lineWidth, preDrawCtx);
                    break;
            }
            break;
        case 'measureParallel':
            switch (drawProcess) {
                case 1:
                    drawLine(clickPoint[clickPoint.length - 1][0], clickPoint[clickPoint.length - 1][1], pointerX, pointerY, drawStyle.lineStyle, drawStyle.lineColor, drawStyle.lineWidth, preDrawCtx);
                    break;
                case 2:
                    drawParallel([clickPoint[0], clickPoint[1], [pointerX, pointerY]], drawStyle.lineColor, drawStyle.lineWidth, preDrawCtx);
            }
            break;
        case 'measureRect':
            switch (drawProcess) {
                case 1:
                    drawRect(clickPoint[0][0], clickPoint[0][1], pointerX - clickPoint[0][0], pointerY - clickPoint[0][1], drawStyle.lineStyle, drawStyle.lineColor, drawStyle.lineWidth, drawStyle.fillColor, preDrawCtx);
                    break;
            }
            break;
        case 'measurePolygon':
            switch (drawProcess) {
                case 1:
                    drawLine(clickPoint[clickPoint.length - 1][0], clickPoint[clickPoint.length - 1][1], pointerX, pointerY, drawStyle.lineStyle, drawStyle.lineColor, drawStyle.lineWidth, preDrawCtx);
                    break;
            }
            break;
        case 'measureCircle2':
            switch (drawProcess) {
                case 1:
                    let x1 = clickPoint[0][0];
                    let y1 = clickPoint[0][1];
                    let x2 = pointerX;
                    let y2 = pointerY;
                    const centerX = (x1 + x2) / 2;
                    const centerY = (y1 + y2) / 2;
                    const radius = Math.sqrt((x2 - centerX) ** 2 + (y2 - centerY) ** 2);
                    drawArc(centerX, centerY, radius, 0, 2 * Math.PI, drawStyle.lineColor, drawStyle.lineWidth, preDrawCtx);
                    break;
                case 3:
                    const centerX1 = (clickPoint[0][0] + clickPoint[1][0]) / 2;
                    const centerY1 = (clickPoint[0][1] + clickPoint[1][1]) / 2;
                    const centerX2 = (clickPoint[2][0] + pointerX) / 2;
                    const centerY2 = (clickPoint[2][1] + pointerY) / 2;
                    const radius2 = Math.sqrt((pointerX - clickPoint[2][0]) ** 2 + (pointerY - clickPoint[2][1]) ** 2) / 2;
                    drawArc(centerX2, centerY2, radius2, 0, 2 * Math.PI, drawStyle.lineColor, drawStyle.lineWidth, preDrawCtx);
                    drawLine(centerX1, centerY1, centerX2, centerY2, 'solid', drawStyle.lineColor, drawStyle.lineWidth, preDrawCtx);
                    break;
            }
            break;
        case 'measureCircle3':
            switch (drawProcess) {
                case 2: {
                    const x1 = clickPoint[0][0];
                    const y1 = clickPoint[0][1];
                    const x2 = clickPoint[1][0];
                    const y2 = clickPoint[1][1];
                    const x3 = pointerX;
                    const y3 = pointerY;
                    const arcData = culcArc(x1, y1, x2, y2, x3, y3);
                    const centerX = arcData.center[0];
                    const centerY = arcData.center[1];
                    const radius = Math.sqrt((x1 - centerX) ** 2 + (y1 - centerY) ** 2);
                    drawArc(centerX, centerY, radius, 0, 2 * Math.PI, drawStyle.lineColor, drawStyle.lineWidth, preDrawCtx);
                    break;
                }
                case 5: {
                    const centerX1 = (circlePoints[0][0] + circlePoints[1][0]) / 2;
                    const centerY1 = (circlePoints[0][1] + circlePoints[1][1]) / 2;
                    const x1 = clickPoint[3][0];
                    const y1 = clickPoint[3][1];
                    const x2 = clickPoint[4][0];
                    const y2 = clickPoint[4][1];
                    const x3 = pointerX;
                    const y3 = pointerY;
                    const arcData = culcArc(x1, y1, x2, y2, x3, y3);
                    const centerX2 = arcData.center[0];
                    const centerY2 = arcData.center[1];
                    const radius2 = Math.sqrt((x1 - centerX2) ** 2 + (y1 - centerY2) ** 2);
                    drawArc(centerX2, centerY2, radius2, 0, 2 * Math.PI, drawStyle.lineColor, drawStyle.lineWidth, preDrawCtx);
                    drawLine(centerX1, centerY1, centerX2, centerY2, 'solid', drawStyle.lineColor, drawStyle.lineWidth, preDrawCtx);
                    break;
                }
            }
            break;
        case 'measureArc':
            switch (drawProcess) {
                case 2:
                    let x1 = clickPoint[0][0];
                    let y1 = clickPoint[0][1];
                    let x2 = clickPoint[1][0];
                    let y2 = clickPoint[1][1];
                    const x3 = pointerX;
                    const y3 = pointerY;
                    const arcData = culcArc(x1, y1, x2, y2, x3, y3);
                    const centerX = arcData.center[0];
                    const centerY = arcData.center[1];
                    const startAngle = arcData.angle[0];
                    const endAngle = arcData.angle[1];

                    const radius = Math.sqrt((x1 - centerX) ** 2 + (y1 - centerY) ** 2);
                    drawArc(centerX, centerY, radius, startAngle, endAngle, drawStyle.lineColor, drawStyle.lineWidth, preDrawCtx);
                    break;
            }
            break;
        case 'measurePointAngle':
            switch (drawProcess) {
                case 1: {
                    drawLine(clickPoint[0][0], clickPoint[0][1], pointerX, pointerY, drawStyle.lineStyle, drawStyle.lineColor, drawStyle.lineWidth, preDrawCtx);
                    break;
                }
                case 2: {
                    const points = [clickPoint[0], clickPoint[1], [pointerX, pointerY]];
                    measurePointAngle(points, isShiftKey, drawStyle.lineColor, drawStyle.lineWidth, drawStyle.fontSize, drawStyle.digit - 1, preDrawCtx);
                    break;
                }
            }
            break;
        case 'measureLineAngle':
            switch (drawProcess) {
                case 1: {
                    drawLine(clickPoint[0][0], clickPoint[0][1], pointerX, pointerY, drawStyle.lineStyle, drawStyle.lineColor, drawStyle.lineWidth, preDrawCtx);
                    break;
                }
                case 3: {
                    const points = [clickPoint[0], clickPoint[1], clickPoint[2], [pointerX, pointerY]];
                    measureLineAngle(points, drawStyle.lineColor, drawStyle.lineWidth, drawStyle.fontSize, drawStyle.digit - 1, preDrawCtx);
                }
            }
    }
});
textEdit.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        textEdit.blur();
    }
});
eventCanvas.addEventListener('mouseleave', () => {
    preDrawCtx.clearRect(0, 0, preDrawCanvas.width, preDrawCanvas.width);
});
textEdit.addEventListener('blur', () => {
    drawText(clickPoint[0][0] + 2 / zoomParam.rate, clickPoint[0][1] + 2 / zoomParam.rate, textEdit.value, drawStyle.lineColor, drawStyle.fontSize, drawCtx);
    drawText(clickPoint[0][0] + 2 / zoomParam.rate, clickPoint[0][1] + 2 / zoomParam.rate, textEdit.value, `#${drawId.toString(16).padStart(6, '0')}`, drawStyle.fontSize, drawMemoryCtx);
    drawObjects.push({
        id: drawId,
        type: 'drawText',
        drawParam: [clickPoint[0][0] + 2 / zoomParam.rate, clickPoint[0][1] + 2 / zoomParam.rate, textEdit.value, drawStyle.lineColor, drawStyle.fontSize],
        angle: rotAngle,
        show: true
    });
    drawId += 1;
    textEdit.style.display = 'none';
    textEdit.value = '';
    drawProcess = 0;
});
const accentColor = 'rgb(0, 255, 170)';
function redrawObject(obj, outputCtx, param, id) {
    let objectParam;
    if (typeof param != 'undefined') {
        objectParam = param;
    } else {

        objectParam = obj.drawParam.slice();
    }
    let color;
    let fillColor;
    if (outputCtx === preDrawCtx) {
        color = accentColor;
        fillColor = accentColor;
    } else if (outputCtx === drawMemoryCtx) {
        if (typeof id != 'undefined') {
            color = `#${id.toString(16).padStart(6, '0')}`;
            fillColor = `#${id.toString(16).padStart(6, '0')}`;
        }
        else {
            color = `#${obj.id.toString(16).padStart(6, '0')}`;
            fillColor = `#${obj.id.toString(16).padStart(6, '0')}`;
        }
    }
    outputCtx.save();
    if (obj.angle < rotAngle) {
        for (let rot = rotAngle; rot > obj.angle; rot -= 90) {
            if (rot % 180 != 0) {
                outputCtx.translate(drawCanvas.height, 0);
                outputCtx.rotate(Math.PI / 2);
            } else {
                outputCtx.translate(drawCanvas.width, 0);
                outputCtx.rotate(Math.PI / 2);
            }
        }
    } else if (obj.angle > rotAngle) {
        for (let rot = rotAngle; rot < obj.angle; rot += 90) {
            if (rot % 180 != 0) {
                outputCtx.translate(0, drawCanvas.width);
                outputCtx.rotate(-Math.PI / 2);
            } else {
                outputCtx.translate(0, drawCanvas.height);
                outputCtx.rotate(-Math.PI / 2);
            }
        }
    }
    switch (obj.type) {
        case 'drawLine':
            if (outputCtx != preDrawCtx && outputCtx != drawMemoryCtx) color = objectParam[5];
            drawLine(objectParam[0], objectParam[1], objectParam[2], objectParam[3], objectParam[4], color, objectParam[6], outputCtx);
            break;
        case 'drawArrow':
            if (outputCtx != preDrawCtx && outputCtx != drawMemoryCtx) color = objectParam[7];
            drawArrow(objectParam[0], objectParam[1], objectParam[2], objectParam[3], objectParam[4], objectParam[5], objectParam[6], color, objectParam[8], outputCtx);
            break;
        case 'drawRect':
            if (outputCtx != preDrawCtx && outputCtx != drawMemoryCtx) {
                color = objectParam[5];
                fillColor = objectParam[7];
            }
            drawRect(objectParam[0], objectParam[1], objectParam[2], objectParam[3], objectParam[4], color, objectParam[6], fillColor, outputCtx);
            break;
        case 'drawMultiLine':
            if (outputCtx != preDrawCtx && outputCtx != drawMemoryCtx) {
                color = objectParam[1];
                fillColor = objectParam[3];
            }
            drawMultiLine(objectParam[0], color, objectParam[2], fillColor, outputCtx);
            break;
        case 'drawCircle':
            if (outputCtx != preDrawCtx && outputCtx != drawMemoryCtx) {
                color = objectParam[5];
                fillColor = objectParam[7];
            }
            drawCircle(objectParam[0], objectParam[1], objectParam[2], objectParam[3], objectParam[4], color, objectParam[6], fillColor, outputCtx);
            break;
        case 'drawText':
            if (outputCtx != preDrawCtx && outputCtx != drawMemoryCtx) color = objectParam[3];
            drawText(objectParam[0], objectParam[1], objectParam[2], color, objectParam[4], outputCtx);
            break;
        case 'drawSize':
            if (outputCtx != preDrawCtx && outputCtx != drawMemoryCtx) color = objectParam[4];
            drawSize(objectParam[0], objectParam[1], objectParam[2], objectParam[3], color, objectParam[5], outputCtx);
            break;
        case 'drawParallel':
            if (outputCtx != preDrawCtx && outputCtx != drawMemoryCtx) color = objectParam[1];
            drawParallel(objectParam[0], color, objectParam[2], outputCtx);
            break;
        case 'drawCircleCenter':
            if (outputCtx != preDrawCtx && outputCtx != drawMemoryCtx) color = objectParam[1];
            drawCircleCenter(objectParam[0], color, objectParam[2], outputCtx);
            break;
        case 'drawArc':
            if (outputCtx != preDrawCtx && outputCtx != drawMemoryCtx) color = objectParam[5];
            drawArc(objectParam[0], objectParam[1], objectParam[2], objectParam[3], objectParam[4], color, objectParam[6], outputCtx);
            break;
        case 'drawAngle':
            if (outputCtx != preDrawCtx && outputCtx != drawMemoryCtx) color = objectParam[1];
            measurePointAngle(objectParam[0], objectParam[1], color, objectParam[2], objectParam[3], objectParam[4], outputCtx);
            break;
        case 'drawLineAngle':
            if (outputCtx != preDrawCtx && outputCtx != drawMemoryCtx) color = objectParam[1];
            measureLineAngle(objectParam[0], color, objectParam[2], objectParam[3], objectParam[4], outputCtx);
            break;
        case 'lineHor':
            if (outputCtx != preDrawCtx && outputCtx != drawMemoryCtx) color = objectParam[5];
            drawLine(objectParam[0], objectParam[1], objectParam[2], objectParam[3], objectParam[4], color, objectParam[6], outputCtx);
            break;
        case 'lineVer':
            if (outputCtx != preDrawCtx && outputCtx != drawMemoryCtx) color = objectParam[5];
            drawLine(objectParam[0], objectParam[1], objectParam[2], objectParam[3], objectParam[4], color, objectParam[6], outputCtx);
            break;
        case 'lineCircle':
            if (outputCtx != preDrawCtx && outputCtx != drawMemoryCtx) color = objectParam[5];
            drawCircle(objectParam[0], objectParam[1], objectParam[2], objectParam[3], objectParam[4], color, objectParam[6], objectParam[7], outputCtx);
            break;
    }
    outputCtx.restore();
}
const navigatorCanvas = document.getElementById('navigator');
const navigatorCtx = navigatorCanvas.getContext('2d', { willReadFrequently: true });
navigatorCtx.fillStyle = 'black';
navigatorCtx.fillRect(0, 0, navigatorCanvas.width, navigatorCanvas.height);
const navigatorArea = document.getElementById('navigator-area');
navigatorArea.style.cursor = 'grabbing';
let naviPos = navigatorCanvas.getBoundingClientRect();
function navidatorCtrl() {
    navigatorArea.style.left = `${zoomParam.left * (naviPos.width / videoCanvas.width)}px`;
    navigatorArea.style.top = `${zoomParam.top * (naviPos.width / videoCanvas.width)}px`;
    navigatorArea.style.width = `${zoomParam.width * (naviPos.width / videoCanvas.width)}px`;
    navigatorArea.style.height = `${zoomParam.height * (naviPos.width / videoCanvas.width)}px`;
}
let isNavigatorMove = false;
navigatorArea.addEventListener('mousedown', (event) => {
    if (event.button === 0) {
        isVideoMove = true;
        isNavigatorMove = true;
        mouseDownPos = { x: event.clientX / (naviPos.width / videoCanvas.width), y: event.clientY / (naviPos.width / videoCanvas.width) };
        zoomParamQs.left = zoomParam.left;
        zoomParamQs.top = zoomParam.top;
    }
});
navigatorArea.addEventListener('wheel', (event) => {
    const deltaY = event.deltaY;
    let pointerX = event.clientX - naviPos.left;
    let pointerY = event.clientY - naviPos.top;
    pointerX /= (naviPos.width / videoCanvas.width / zoomParam.rate);
    pointerY /= (naviPos.width / videoCanvas.width / zoomParam.rate);

    textEdit.blur();
    if (deltaY < 0) {
        zoomSld.value = parseFloat(zoomSld.value) * 1.5;
    } else {
        zoomSld.value = parseFloat(zoomSld.value) / 1.5;
    }
    videoZoom(parseFloat(zoomSld.value), pointerX, pointerY);
});
class CommandIcon {
    constructor(id) {
        this.icon = document.getElementById(id);
        this.status = false;
        this.icon.addEventListener('click', () => {
            this.status = !this.status;
            if (this.status) {
                this.icon.classList.add('command-bar-icon-active');
            } else {
                this.icon.classList.remove('command-bar-icon-active');
            }
            this.clickEvent();
        });
    }
    clickEvent() { }
}
let rotAngle = 0;
let reverse = [1, 1];
function canvasRotate(centerX, centerY, angle) {
    videoCtx.translate(centerX, centerY);
    videoCtx.rotate(angle);
    shadowMaskCtx.translate(centerX, centerY);
    shadowMaskCtx.rotate(angle);
    drawCtx.translate(centerX, centerY);
    drawCtx.rotate(angle);
    preDrawCtx.translate(centerX, centerY);
    preDrawCtx.rotate(angle);
    drawMemoryCtx.translate(centerX, centerY);
    drawMemoryCtx.rotate(angle);
    lineCtx.translate(centerX, centerY);
    lineCtx.rotate(angle);
    compCtx.translate(centerX, centerY);
    compCtx.rotate(angle);
}
const leftRotation = document.getElementById('rot-l');
leftRotation.addEventListener('click', () => {
    rotAngle -= 90;
    if (rotAngle === -180) rotAngle = 180;
    if ((vertReverse.status && !horReverse.status) || (!vertReverse.status && horReverse.status)) {
        vertReverse.icon.click();
        horReverse.icon.click();
    }
    if (typeof video != 'undefined') video.style.transform = `scaleX(${reverse[0]}) scaleY(${reverse[1]}) rotate(${rotAngle}deg)`;
    videoCanvas.style.transform = `rotate(${rotAngle}deg)`;
    shadowMaskCanvas.style.transform = `rotate(${rotAngle}deg)`;
    drawCanvas.style.transform = `rotate(${rotAngle}deg)`;
    preDrawCanvas.style.transform = `rotate(${rotAngle}deg)`;
    lineCanvas.style.transform = `rotate(${rotAngle}deg)`;
    compCanvas.style.transform = `rotate(${rotAngle}deg)`;
    loupeCanvas.style.transform = `rotate(${rotAngle}deg)`;
    if (rotAngle % 180 != 0) {
        canvasRotate(videoCanvas.width, 0, Math.PI / 2);
        fitRate = Math.min(videoAreaSize.width / videoResolution.width, videoAreaSize.height / videoResolution.height);
    } else {
        canvasRotate(videoCanvas.height, 0, Math.PI / 2);
        fitRate = Math.min(videoAreaSize.width / videoResolution.height, videoAreaSize.height / videoResolution.width);
    }
    eventCanvas.style.transform = `rotate(${rotAngle}deg)`;
    navigatorCanvas.style.transform = `scaleX(${reverse[0]}) scaleY(${reverse[1]}) rotate(${rotAngle}deg)`;
    popupMsgShow(`映像の回転：${rotAngle}°`);
});
const rightRotation = document.getElementById('rot-r');
rightRotation.addEventListener('click', () => {
    rotAngle += 90;
    if (rotAngle === 270) rotAngle = -90;
    if ((vertReverse.status && !horReverse.status) || (!vertReverse.status && horReverse.status)) {
        vertReverse.icon.click();
        horReverse.icon.click();
    }
    if (typeof video != 'undefined') video.style.transform = `scaleX(${reverse[0]}) scaleY(${reverse[1]}) rotate(${rotAngle}deg)`;
    videoCanvas.style.transform = `rotate(${rotAngle}deg)`;
    shadowMaskCanvas.style.transform = `rotate(${rotAngle}deg)`;
    drawCanvas.style.transform = `rotate(${rotAngle}deg)`;
    preDrawCanvas.style.transform = `rotate(${rotAngle}deg)`;
    lineCanvas.style.transform = `rotate(${rotAngle}deg)`;
    compCanvas.style.transform = `rotate(${rotAngle}deg)`;
    loupeCanvas.style.transform = `rotate(${rotAngle}deg)`;
    if (rotAngle % 180 != 0) {
        canvasRotate(0, videoCanvas.height, -Math.PI / 2);
        fitRate = Math.min(videoAreaSize.width / videoResolution.width, videoAreaSize.height / videoResolution.height);
    } else {
        canvasRotate(0, videoCanvas.width, -Math.PI / 2);
        fitRate = Math.min(videoAreaSize.width / videoResolution.height, videoAreaSize.height / videoResolution.width);
    }
    eventCanvas.style.transform = `rotate(${rotAngle}deg)`;
    navigatorCanvas.style.transform = `scaleX(${reverse[0]}) scaleY(${reverse[1]}) rotate(${rotAngle}deg)`;
    popupMsgShow(`映像の回転：${rotAngle}°`);
});
const vertReverse = new CommandIcon('flip-v');
vertReverse.clickEvent = () => {
    if (vertReverse.status && !horReverse.status) reverse = [1, -1];
    else if (vertReverse.status && horReverse.status) reverse = [-1, -1];
    else if (!vertReverse.status && horReverse.status) reverse = [-1, 1];
    else reverse = [1, 1];
    if (typeof video != 'undefined') video.style.transform = `scaleX(${reverse[0]}) scaleY(${reverse[1]}) rotate(${rotAngle}deg)`;
    videoCanvas.style.transform = `scaleX(${reverse[0]}) scaleY(${reverse[1]}) rotate(${rotAngle}deg)`;
    navigatorCanvas.style.transform = `scaleX(${reverse[0]}) scaleY(${reverse[1]}) rotate(${rotAngle}deg)`;
}
const horReverse = new CommandIcon('flip-h');
horReverse.clickEvent = () => {
    if (vertReverse.status && !horReverse.status) reverse = [1, -1];
    else if (vertReverse.status && horReverse.status) reverse = [-1, -1];
    else if (!vertReverse.status && horReverse.status) reverse = [-1, 1];
    else reverse = [1, 1];
    if (typeof video != 'undefined') video.style.transform = `scaleX(${reverse[0]}) scaleY(${reverse[1]}) rotate(${rotAngle}deg)`;
    videoCanvas.style.transform = `scaleX(${reverse[0]}) scaleY(${reverse[1]}) rotate(${rotAngle}deg)`;
    navigatorCanvas.style.transform = `scaleX(${reverse[0]}) scaleY(${reverse[1]}) rotate(${rotAngle}deg)`;
}
const zoomSld = document.getElementById('control-zoom');
zoomSld.addEventListener('wheel', (event) => {
    if (event.deltaY < 0) zoomSld.stepUp(); else zoomSld.stepDown();
    videoZoom(parseFloat(zoomSld.value));
});
zoomSld.addEventListener('input', (event) => {
    videoZoom(parseFloat(event.target.value));
});
const zoomOut = document.getElementById('zoom-out');
zoomOut.addEventListener('click', () => {
    zoomSld.stepDown();
    videoZoom(parseFloat(zoomSld.value));
});
const zoomIn = document.getElementById('zoom-in');
zoomIn.addEventListener('click', () => {
    zoomSld.stepUp();
    videoZoom(parseFloat(zoomSld.value));
});
const fitting = document.getElementById('fitting');
fitting.addEventListener('click', () => {
    videoFitting();
    zoomSld.value = fitRate;
    popupMsgShow(`表示倍率：${Math.round(fitRate * 100)}%`);
});
const actualSize = document.getElementById('actual-size');
actualSize.addEventListener('click', () => {
    videoZoom(1);
    zoomSld.value = 1;
});
const loupeCanvas = document.getElementById('loupe-canvas');
const loupeCtx = loupeCanvas.getContext('2d', { willReadFrequently: true });
let loupeArea = { pointerX: 0, pointerY: 0, rate: 2 };
const loupeSize = 300;
loupeCanvas.width = loupeSize;
loupeCanvas.height = loupeSize;
const loupe = new CommandIcon('loupe');
loupe.clickEvent = () => {
    if (!loupe.clickEvent) loupeCanvas.style.display = 'none';
}
const picture = document.getElementById('picture');
const fileNameStamp = document.getElementById('file-name-stamp');
const fileNameStampColor = document.getElementById('file-name-stamp-color');
const selfTimer = document.getElementById('self-timer');
const intervalTime = document.getElementById('interval-time');
const intervalNumber = document.getElementById('interval-number');
function capture() {
    let fileName;
    let captureWidth = processCanvas.width;
    let captureHeight = processCanvas.height;
    if (rotAngle === 90 || rotAngle === -90) {
        [processCanvas.width, processCanvas.height] = [processCanvas.height, processCanvas.width];
    }
    processCtx.save();
    if (horReverse.status) {
        processCtx.scale(-1, 1);
        processCtx.translate(-processCanvas.width, 0);
    }
    if (vertReverse.status) {
        processCtx.scale(1, -1);
        processCtx.translate(0, -processCanvas.height);
    }
    if (rotAngle === 90) {
        processCtx.translate(processCanvas.width / 2, processCanvas.height / 2);
        processCtx.rotate(Math.PI / 2);
        processCtx.translate(-processCanvas.height / 2, -processCanvas.width / 2);
    } else if (rotAngle === -90) {
        processCtx.translate(processCanvas.width / 2, processCanvas.height / 2);
        processCtx.rotate(-Math.PI / 2);
        processCtx.translate(-processCanvas.height / 2, -processCanvas.width / 2);
    } else if (rotAngle === 180) {
        processCtx.translate(processCanvas.width / 2, processCanvas.height / 2);
        processCtx.rotate(Math.PI);
        processCtx.translate(-processCanvas.width / 2, -processCanvas.height / 2);
    }
    if (isVideoMode === 'realtime') {
        processCtx.drawImage(video, 0, 0, captureWidth, captureHeight);
    } else {
        processCtx.drawImage(videoCanvas, 0, 0, captureWidth, captureHeight);
    }
    processCtx.restore();
    fileName = pictureName.value;
    getTime();
    nameRuleConvert[0].forEach((element, index) => {
        fileName = fileName.replace(element, nameRuleConvert[1][index]);
    });
    saveNameCounter.value = parseInt(saveNameCounter.value, 10) + 1;
    if (fileNameStamp.checked) {
        processCtx.font = `${processCanvas.width / 70}px Arial`;
        processCtx.textAlign = 'right';
        processCtx.textBaseline = 'bottom'
        processCtx.fillStyle = fileNameStampColor.value;
        processCtx.fillText(fileName, processCanvas.width * 0.99, processCanvas.height * 0.99);
    }
    const dataURL = processCanvas.toDataURL(`image/${pictureFormat.value}`);
    const downloadLink = document.createElement("a");
    downloadLink.href = dataURL;
    downloadLink.download = `${fileName}.${pictureFormat.value}`;
    downloadLink.click();
    [processCanvas.width, processCanvas.height] = [captureWidth, captureHeight];
}
picture.addEventListener('click', () => {
    let timeCounter = parseInt(selfTimer.value, 10);
    let counter = 1;

    if (parseInt(selfTimer.value, 10) != 0) {
        clearTimeout(popupMsgTimer);
        popupMsg.innerText = `セルフタイマー：${timeCounter}秒`;
        popupMsg.style.display = 'block';
        const popupSelfTimer = setInterval(() => {
            timeCounter--;
            popupMsg.innerText = `セルフタイマー：${timeCounter}秒`;
            if (timeCounter === 1) clearInterval(popupSelfTimer);
        }, 1000);
    }
    setTimeout(() => {
        if (parseInt(intervalNumber.value, 10) > 1) {
            clearTimeout(popupMsgTimer);
            popupMsg.innerText = `インターバル撮影中：残り${parseInt(intervalNumber.value) - counter}回`;
            popupMsg.style.display = 'block';
            const interval = setInterval(() => {
                capture();
                counter++;
                popupMsg.innerText = `インターバル撮影中：残り${parseInt(intervalNumber.value) - counter}回`;
                if (counter >= parseInt(intervalNumber.value)) {
                    clearInterval(interval);
                    popupMsgShow('インターバル撮影が終了しました');
                }
            }, parseInt(intervalTime.value) * 1000);
        }
        setTimeout(() => {
            capture();
            if (parseInt(intervalNumber.value, 10) === 1) popupMsgShow('静止画を撮影しました');
        }, 0);
    }, parseInt(selfTimer.value) * 1000);
});
`#${drawId.toString(16).padStart(6, '0')}`
const movie = document.getElementById('movie');
let isMovie;
let mediaRecorder;
let frames = [];
let timer;
movie.addEventListener('click', () => {
    if (isVideoMode === 'pause') {
        popupMsgShow('一時停止中は動画撮影できません');
        return;
    } else if (isVideoMode === 'image') {
        popupMsgShow('画像編集中は動画撮影できません');
        return;
    }
    isMovie = !isMovie;
    if (isMovie) {
        movie.classList.add('command-bar-icon-active');

        let counter = 0;
        clearTimeout(popupMsgTimer);
        popupMsg.innerText = `動画撮影中　0：00：00`;
        popupMsg.style.display = 'block';
        timer = setInterval(() => {
            counter++;
            popupMsg.innerText = `動画撮影中　${Math.floor(counter / 3600)}：${Math.floor((counter % 3600) / 60).toString(10).padStart(2, '0')}：${(counter % 60).toString(10).padStart(2, '0')}`;
        }, 1000);
        mediaRecorder = new MediaRecorder(video.srcObject, { Type: "video/webm" });
        mediaRecorder.start();
        mediaRecorder.ondataavailable = (e) => {
            const blob = new Blob([e.data], { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            document.body.appendChild(a);
            a.href = url;

            let fileName = pictureName.value;
            getTime();
            nameRuleConvert[0].forEach((element, index) => {
                fileName = fileName.replace(element, nameRuleConvert[1][index]);
            });
            saveNameCounter.value = parseInt(saveNameCounter.value, 10) + 1;
            a.download = `${fileName}.webm`;
            a.click();
            window.URL.revokeObjectURL(url);
        };
    } else {
        movie.classList.remove('command-bar-icon-active');
        mediaRecorder.stop();
        clearInterval(timer);
        popupMsgShow('動画撮影を終了しました');
    }
});
const crossLine = new CommandIcon('cross-line');
const crossLineColor = document.getElementById('cross-line-color');
crossLine.clickEvent = () => {
    if (crossLine.status) {
        if (rotAngle === 0 || rotAngle === 180) {
            drawLine(0, lineCanvas.height / 2, lineCanvas.width, lineCanvas.height / 2, 'solid', crossLineColor.value, 3, lineCtx);
            drawLine(lineCanvas.width / 2, 0, lineCanvas.width / 2, lineCanvas.height, 'solid', crossLineColor.value, 3, lineCtx);
        } else {
            drawLine(0, lineCanvas.width / 2, lineCanvas.height, lineCanvas.width / 2, 'solid', crossLineColor.value, 3, lineCtx);
            drawLine(lineCanvas.height / 2, 0, lineCanvas.height / 2, lineCanvas.width, 'solid', crossLineColor.value, 3, lineCtx);
        }
    } else {
        lineCtx.clearRect(0, 0, lineCanvas.width, lineCanvas.width);
        if (lineShow.isActive) {
            for (let i = 0; i < drawObjects.length; i++) {
                if (drawObjects[i].type === 'lineHor' || drawObjects[i].type === 'lineVer' || drawObjects[i].type === 'lineCircle') {
                    redrawObject(drawObjects[i], lineCtx);
                }
            }
        }
    }
};
crossLineColor.addEventListener('input', () => {
    lineCtx.clearRect(0, 0, lineCanvas.width, lineCanvas.width);
    if (lineShow.isActive) {
        for (let i = 0; i < drawObjects.length; i++) {
            if (drawObjects[i].type === 'lineHor' || drawObjects[i].type === 'lineVer' || drawObjects[i].type === 'lineCircle') {
                redrawObject(drawObjects[i], lineCtx);
            }
        }
    }
    if (rotAngle === 0 || rotAngle === 180) {
        drawLine(0, lineCanvas.height / 2, lineCanvas.width, lineCanvas.height / 2, 'solid', crossLineColor.value, 3, lineCtx);
        drawLine(lineCanvas.width / 2, 0, lineCanvas.width / 2, lineCanvas.height, 'solid', crossLineColor.value, 3, lineCtx);
    } else {
        drawLine(0, lineCanvas.width / 2, lineCanvas.height, lineCanvas.width / 2, 'solid', crossLineColor.value, 3, lineCtx);
        drawLine(lineCanvas.height / 2, 0, lineCanvas.height / 2, lineCanvas.width, 'solid', crossLineColor.value, 3, lineCtx);
    }
});
const colorFilter = document.getElementById('color-filter');
let isColorFilter = 'none';
colorFilter.addEventListener('click', () => {
    switch (isColorFilter) {
        case 'none':
            isColorFilter = 'mono';
            colorFilter.classList.add('command-bar-icon-active');
            if (typeof video != 'undefined') video.style.filter = 'grayscale(100%)';
            videoCanvas.style.filter = 'grayscale(100%)';
            loupeCanvas.style.filter = 'grayscale(100%)';
            popupMsgShow('映像の色：モノクロ');
            break;
        case 'mono':
            isColorFilter = 'invert';
            if (typeof video != 'undefined') video.style.filter = 'invert()';
            videoCanvas.style.filter = 'invert()';
            loupeCanvas.style.filter = 'invert()';
            popupMsgShow('映像の色：反転');
            break;
        case 'invert':
            isColorFilter = 'none';
            if (typeof video != 'undefined') video.style.filter = '';
            videoCanvas.style.filter = '';
            loupeCanvas.style.filter = '';
            colorFilter.classList.remove('command-bar-icon-active');
            popupMsgShow('映像の色：通常');
            break;
    }
});
class ctrlMenu {
    constructor(id) {
        this.btn = document.getElementById(id);
        this.btn.addEventListener('click', () => {
            if (this.btn.classList.contains('command-bar-icon-active')) {
                this.btn.classList.remove('command-bar-icon-active');
                this.hide();
            } else {
                const activeReset = document.querySelectorAll('.command-bar-icon-active');
                activeReset.forEach(element => {
                    element.classList.remove('command-bar-icon-active');
                });
                this.btn.classList.add('command-bar-icon-active');
                this.change();
            }
        });
    }
    change() {
        for (let i = 0; i < ctrlMenuContentsList.length; i++) {
            ctrlMenuContentsList[i].style.display = 'none';
        }
        for (let i = 0; i < this.contents.length; i++) {
            this.contents[i].style.display = 'block';
        }
    }
    hide() {
        for (let i = 0; i < ctrlMenuContentsList.length; i++) {
            ctrlMenuContentsList[i].style.display = 'none';
        }
    }
}
const menuLine = document.getElementById('ctrl-menu-line');
const menuLineConfig = document.getElementById('ctrl-menu-line-config');
const menuComp = document.getElementById('ctrl-menu-comp');
const ctrlMenuContentsList = [menuLine, menuLineConfig, menuComp];
const lineCtrl = new ctrlMenu('line');
lineCtrl.contents = [menuLine, menuLineConfig];
const lineShow = new ToggleBtnGenerater('line-show');
const lineConfig = document.getElementById('line-config');
lineShow.clickEvent = () => {
    if (lineShow.isActive) {
        lineConfig.style.display = 'block';
        for (let i = 0; i < drawObjects.length; i++) {
            if (drawObjects[i].type === 'lineHor' || drawObjects[i].type === 'lineVer' || drawObjects[i].type === 'lineCircle') {
                redrawObject(drawObjects[i], lineCtx);
            }
        }
    } else {
        lineConfig.style.display = 'none';
        lineCtx.clearRect(0, 0, lineCanvas.width, lineCanvas.width);
        if (crossLine.status) {
            if (rotAngle === 0 || rotAngle === 180) {
                drawLine(0, lineCanvas.height / 2, lineCanvas.width, lineCanvas.height / 2, 'solid', crossLineColor.value, 3, lineCtx);
                drawLine(lineCanvas.width / 2, 0, lineCanvas.width / 2, lineCanvas.height, 'solid', crossLineColor.value, 3, lineCtx);
            } else {
                drawLine(0, lineCanvas.width / 2, lineCanvas.height, lineCanvas.width / 2, 'solid', crossLineColor.value, 3, lineCtx);
                drawLine(lineCanvas.height / 2, 0, lineCanvas.height / 2, lineCanvas.width, 'solid', crossLineColor.value, 3, lineCtx);
            }
        }
        drawCancel.click();
    }
}
let lineGuideStyle = {
    width: 5,
    color: 'rgb(255, 0, 0)'
};
const lineGuideWidth = document.getElementById('line-guide-width');
lineGuideWidth.addEventListener('wheel', (event) => {
    if (event.deltaY < 0) lineGuideWidth.value = Math.min(parseInt(lineGuideWidth.value, 10) + 1, lineGuideWidth.max);
    else lineGuideWidth.value = Math.max(parseInt(lineGuideWidth.value, 10) - 1, lineGuideWidth.min);
    lineGuideStyle.width = parseInt(lineGuideWidth.value, 10);
});
lineGuideWidth.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') lineGuideWidth.blur();
});
lineGuideWidth.addEventListener('blur', () => {
    lineGuideWidth.value = Math.min(Math.max(lineGuideWidth.value, lineGuideWidth.min), lineGuideWidth.max);
    lineGuideStyle.width = parseInt(lineGuideWidth.value, 10);
});
const lineClear = document.getElementById('line-clear');
lineClear.addEventListener('click', () => {
    lineCtx.clearRect(0, 0, lineCanvas.width, lineCanvas.width);
    drawMemoryCtx.clearRect(0, 0, drawMemoryCanvas.width, drawMemoryCanvas.width);
    for (let i = 0; i < drawObjects.length; i++) {
        if (drawObjects[i].type === 'lineHor' || drawObjects[i].type === 'lineVer' || drawObjects[i].type === 'lineCircle') {
            drawObjects.splice(i, 1);
            i--;
        } else {
            redrawObject(drawObjects[i], drawMemoryCtx);
        }
    }
    if (crossLine.status) {
        drawLine(0, lineCanvas.height / 2, lineCanvas.width, lineCanvas.height / 2, 'solid', crossLineColor.value, 3, lineCtx);
        drawLine(lineCanvas.width / 2, 0, lineCanvas.width / 2, lineCanvas.height, 'solid', crossLineColor.value, 3, lineCtx);
    }
});
const selectLineColor = document.getElementById('line-color');
selectLineColor.addEventListener('click', () => {
    isLineColorSelector = !isLineColorSelector;
    if (isLineColorSelector) {
        lineColorSelector.style.display = 'flex';
    } else {
        lineColorSelector.style.display = 'none';
    }
});
const lineGuideColor = document.getElementById('line-guide-color');
const lineColor = document.getElementById('select-line-color');
const lineColorSelector = document.getElementById('line-color-selector');
let isLineColorSelector = false;
const lineColorRed = new ToolConfigChanger('line-color-red', 'lineColor', 'red');
const lineColorYellow = new ToolConfigChanger('line-color-yellow', 'lineColor', 'yellow');
const lineColorGreen = new ToolConfigChanger('line-color-green', 'lineColor', 'green');
const lineColorLightblue = new ToolConfigChanger('line-color-lightblue', 'lineColor', 'lightblue');
const lineColorBlue = new ToolConfigChanger('line-color-blue', 'lineColor', 'blue');
const lineColorPink = new ToolConfigChanger('line-color-pink', 'lineColor', 'pink');
const shadowMaskShow = new ToggleBtnGenerater('shadow-mask');
const shadowMaskConfig = document.getElementById('shadow-mask-show');
const shadowMaskAdd = document.getElementById('shadow-mask-add');
const shadowMaskReset = document.getElementById('shadow-mask-reset');
shadowMaskReset.addEventListener('click', () => {
    shadowMaskCtx.fillStyle = 'rgb(0, 0, 0)';
    shadowMaskCtx.fillRect(0, 0, shadowMaskCanvas.width, shadowMaskCanvas.width);
});
const shadowRate = document.getElementById('shadow-rate');
shadowRate.addEventListener('wheel', (event) => {
    if (event.deltaY < 0) shadowRate.stepUp(); else shadowRate.stepDown();
    shadowMaskCanvas.style.opacity = `${1 - parseFloat(shadowRate.value)}`;
});
shadowRate.addEventListener('input', () => {
    shadowMaskCanvas.style.opacity = `${1 - parseFloat(shadowRate.value)}`;
});
shadowMaskInt = false;
shadowMaskShow.clickEvent = () => {
    if (!shadowMaskInt) {
        shadowMaskReset.click();
        shadowMaskInt = !shadowMaskInt;
    }
    if (shadowMaskShow.isActive) {
        shadowMaskConfig.style.display = 'block';
        shadowMaskCanvas.style.display = 'block';
    } else {
        shadowMaskConfig.style.display = 'none';
        shadowMaskCanvas.style.display = 'none';
        drawActiveReset();
        shadowMaskAdd.classList.remove('ctrl-menu-btn-active');
    }
}
shadowMaskAdd.addEventListener('click', () => {
    if (drawMode != 'shadowMask') {
        drawActiveReset();
        drawMode = 'shadowMask';
        eventCanvas.style.cursor = "crosshair";
        shadowMaskAdd.classList.add('ctrl-menu-btn-active');
    } else {
        drawActiveReset();
        shadowMaskAdd.classList.remove('ctrl-menu-btn-active');
    }
});
const compCtrl = new ctrlMenu('comp');
compCtrl.contents = [menuComp];
const imageDrop = document.getElementById('image-drop');
imageDrop.addEventListener('dragover', () => {
    imageDrop.style.background = '#a0e0ff';
});
imageDrop.addEventListener('dragleave', () => {
    imageDrop.style.background = null;
});
imageDrop.addEventListener('drop', (event) => {
    event.preventDefault();
    imageDrop.style.background = null;
    const file = event.dataTransfer.files[0];
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
        popupMsgShow('JPEG / PNG 形式以外は読み込みできません');
        return;
    }
    const reader = new FileReader();
    reader.onload = function (event) {
        compImageData = new Image();
        compImageData.onload = function () {
            const img = compImageData;
            compCtx.drawImage(img, 0, 0, compCanvas.width, compCanvas.height);
            img.style.maxWidth = '100%';
            img.style.maxHeight = '100%';
            imageDrop.innerHTML = '';
            imageDrop.appendChild(img);
        };
        compImageData.src = event.target.result;
    };
    reader.readAsDataURL(file);
});
const compRate = document.getElementById('comp-rate');
compRate.addEventListener('wheel', (event) => {
    if (event.deltaY < 0) compRate.stepUp(); else compRate.stepDown();
    shadowMaskCanvas.style.opacity = `${1 - parseFloat(compRate.value)}`;
});
compRate.addEventListener('input', () => {
    compCanvas.style.opacity = `${1 - parseFloat(compRate.value)}`;
});
const composite = new ToggleBtnGenerater('composite');
composite.clickEvent = () => {
    if (composite.isActive) {
        compCanvas.style.display = 'block';
    } else {
        compCanvas.style.display = 'none';
    }
};
const tooltip = document.getElementById('tooltip');
const waitTime = 300;
let tooltipTimer;
function tooltipShow(element) {
    tooltipTimer = setTimeout(() => { tooltipCtrl(element) }, waitTime);
}
function tooltipCtrl(element) {
    let elmRect;
    const zoom = Math.min(window.innerWidth / uiWidthLimit, 1);
    switch (element) {
        case 'full':
            tooltip.innerText = '全面表示';
            elmRect = full.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 60)}px`;
            tooltip.style.top = `${(elmRect.bottom + 5)}px`;
            break;
        case 'videoMode':
            tooltip.innerText = isVideoMode === 'image' ? 'リアルタイム映像に戻る' : 'リアルタイム/一時停止';
            elmRect = videoMode.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 30) * zoom}px`;
            tooltip.style.top = `${(elmRect.bottom + 5) * zoom}px`;
            break;
        case 'drawLineTool':
            tooltip.innerText = '直線';
            elmRect = drawLineTool.btn.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top + 35) * zoom}px`;
            break;
        case 'drawArrowTool':
            tooltip.innerText = '矢印';
            elmRect = drawArrowTool.btn.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top + 35) * zoom}px`;
            break;
        case 'drawRectTool':
            tooltip.innerText = '四角形';
            elmRect = drawRectTool.btn.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top + 35) * zoom}px`;
            break;
        case 'drawPolygonTool':
            tooltip.innerText = '多角形';
            elmRect = drawPolygonTool.btn.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top + 35) * zoom}px`;
            break;
        case 'drawCircleTool':
            tooltip.innerText = '円';
            elmRect = drawCircleTool.btn.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top + 35) * zoom}px`;
            break;
        case 'drawTextTool':
            tooltip.innerText = 'テキスト';
            elmRect = drawTextTool.btn.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top + 35) * zoom}px`;
            break;
        case 'measureTwoPointTool':
            tooltip.innerText = '２点間距離';
            elmRect = measureTwoPointTool.btn.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top + 35) * zoom}px`;
            break;
        case 'measureMultiPointTool':
            tooltip.innerText = '複数点間距離';
            elmRect = measureMultiPointTool.btn.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top + 35) * zoom}px`;
            break;
        case 'measureParallelTool':
            tooltip.innerText = '平行線距離 / 直線-点間距離';
            elmRect = measureParallelTool.btn.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top + 35) * zoom}px`;
            break;
        case 'measureCircleRadiusTool2':
            tooltip.innerText = '円半径（２点指定）';
            elmRect = measureCircleRadiusTool2.btn.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top + 35) * zoom}px`;
            break;
        case 'measureCircleDiameterTool2':
            tooltip.innerText = '円直径（２点指定）';
            elmRect = measureCircleDiameterTool2.btn.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top + 35) * zoom}px`;
            break;
        case 'measureCircleLengthTool2':
            tooltip.innerText = '円周長（２点指定）';
            elmRect = measureCircleLengthTool2.btn.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top + 35) * zoom}px`;
            break;
        case 'measureCircleAreaTool2':
            tooltip.innerText = '円面積（２点指定）';
            elmRect = measureCircleAreaTool2.btn.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top + 35) * zoom}px`;
            break;
        case 'measureCircleCenterTool2':
            tooltip.innerText = '円心２点間距離（２点指定）';
            elmRect = measureCircleCenterTool2.btn.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top + 35) * zoom}px`;
            break;
        case 'measureCircleRadiusTool3':
            tooltip.innerText = '円半径（３点指定）';
            elmRect = measureCircleRadiusTool3.btn.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top + 35) * zoom}px`;
            break;
        case 'measureCircleDiameterTool3':
            tooltip.innerText = '円直径（３点指定）';
            elmRect = measureCircleDiameterTool3.btn.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top + 35) * zoom}px`;
            break;
        case 'measureCircleLengthTool3':
            tooltip.innerText = '円周長（３点指定）';
            elmRect = measureCircleLengthTool3.btn.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top + 35) * zoom}px`;
            break;
        case 'measureCircleAreaTool3':
            tooltip.innerText = '円面積（３点指定）';
            elmRect = measureCircleAreaTool3.btn.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top + 35) * zoom}px`;
            break;
        case 'measureCircleCenterTool3':
            tooltip.innerText = '円心２点間距離（３点指定）';
            elmRect = measureCircleCenterTool3.btn.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top + 35) * zoom}px`;
            break;
        case 'measureArcRadiusTool':
            tooltip.innerText = '円弧半径';
            elmRect = measureArcRadiusTool.btn.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top + 35) * zoom}px`;
            break;
        case 'measureArcLengthTool':
            tooltip.innerText = '円弧周長';
            elmRect = measureArcLengthTool.btn.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top + 35) * zoom}px`;
            break;
        case 'measurePointAngleTool':
            tooltip.innerText = '３点角度';
            elmRect = measurePointAngleTool.btn.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top + 35) * zoom}px`;
            break;
        case 'measureLineAngleTool':
            tooltip.innerText = '２直線角度';
            elmRect = measureLineAngleTool.btn.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top + 35) * zoom}px`;
            break;
        case 'measureRectLengthTool':
            tooltip.innerText = '長方形周長';
            elmRect = measureRectLengthTool.btn.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top + 35) * zoom}px`;
            break;
        case 'measureRectAreaTool':
            tooltip.innerText = '長方形面積';
            elmRect = measureRectAreaTool.btn.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top + 35) * zoom}px`;
            break;
        case 'measurePolygonLengthTool':
            tooltip.innerText = '多角形周長';
            elmRect = measurePolygonLengthTool.btn.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top + 35) * zoom}px`;
            break;
        case 'measurePolygonAreaTool':
            tooltip.innerText = '多角形面積';
            elmRect = measurePolygonAreaTool.btn.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top + 35) * zoom}px`;
            break;
        case 'drawCancel':
            tooltip.innerText = '映像の移動（描画解除）';
            elmRect = drawCancel.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top + 35) * zoom}px`;
            break;
        case 'drawMove':
            tooltip.innerText = '描画の移動';
            elmRect = drawMove.btn.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top + 35) * zoom}px`;
            break;
        case 'drawDelete':
            tooltip.innerText = '描画の選択削除';
            elmRect = drawDelete.btn.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top + 35) * zoom}px`;
            break;
        case 'drawClear':
            tooltip.innerText = '描画の全削除';
            elmRect = drawClear.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top + 35) * zoom}px`;
            break;
        case 'drawBack':
            tooltip.innerText = '元に戻す';
            elmRect = drawBack.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top + 35) * zoom}px`;
            break;
        case 'drawRedo':
            tooltip.innerText = 'やり直す';
            elmRect = drawRedo.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.left + 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top + 35) * zoom}px`;
            break;
        case 'drawSave':
            tooltip.innerText = '描画の保存';
            elmRect = drawSave.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.left - 30) * zoom}px`;
            tooltip.style.top = `${(elmRect.top + 35) * zoom}px`;
            break;
        case 'leftRotation':
            tooltip.innerText = '左回転';
            elmRect = leftRotation.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top - 25) * zoom}px`;
            break;
        case 'rightRotation':
            tooltip.innerText = '右回転';
            elmRect = rightRotation.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top - 25) * zoom}px`;
            break;
        case 'horReverse':
            tooltip.innerText = '左右反転';
            elmRect = horReverse.icon.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top - 25) * zoom}px`;
            break;
        case 'vertReverse':
            tooltip.innerText = '上下反転';
            elmRect = vertReverse.icon.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top - 25) * zoom}px`;
            break;
        case 'zoomOut':
            tooltip.innerText = '縮小【Alt + g】';
            elmRect = zoomOut.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top - 25) * zoom}px`;
            break;
        case 'zoomIn':
            tooltip.innerText = '拡大【Alt + h】';
            elmRect = zoomIn.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top - 25) * zoom}px`;
            break;
        case 'fitting':
            tooltip.innerText = '全体表示';
            elmRect = fitting.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top - 25) * zoom}px`;
            break;
        case 'actualSize':
            tooltip.innerText = '等倍表示';
            elmRect = actualSize.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top - 25) * zoom}px`;
            break;
        case 'loupe':
            tooltip.innerText = '部分拡大';
            elmRect = loupe.icon.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top - 25) * zoom}px`;
            break;
        case 'picture':
            tooltip.innerText = '静止画撮影【Alt + a】';
            elmRect = picture.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top - 25) * zoom}px`;
            break;
        case 'movie':
            tooltip.innerText = '動画撮影';
            elmRect = movie.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top - 25) * zoom}px`;
            break;
        case 'crossLine':
            tooltip.innerText = 'クロスライン【Alt + c】';
            elmRect = crossLine.icon.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top - 25) * zoom}px`;
            break;
        case 'colorFilter':
            tooltip.innerText = 'モノクロ/色反転【Alt + J】';
            elmRect = colorFilter.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top - 25) * zoom}px`;
            break;
        case 'lineHorTool':
            tooltip.innerText = '水平ラインを追加';
            elmRect = lineHorTool.btn.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top + 30) * zoom}px`;
            break;
        case 'lineVerTool':
            tooltip.innerText = '垂直ラインを追加';
            elmRect = lineVerTool.btn.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top + 30) * zoom}px`;
            break;
        case 'lineCircleTool':
            tooltip.innerText = '円形ラインを追加';
            elmRect = lineCircleTool.btn.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top + 30) * zoom}px`;
            break;
        case 'lineMove':
            tooltip.innerText = 'ラインの移動';
            elmRect = lineMove.btn.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 10) * zoom}px`;
            tooltip.style.top = `${(elmRect.top + 30) * zoom}px`;
            break;
        case 'lineDelete':
            tooltip.innerText = 'ラインの選択削除';
            elmRect = lineDelete.btn.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 30) * zoom}px`;
            tooltip.style.top = `${(elmRect.top + 30) * zoom}px`;
            break;
        case 'lineClear':
            tooltip.innerText = 'ラインの全削除';
            elmRect = lineClear.getBoundingClientRect();
            tooltip.style.left = `${(elmRect.right - 50) * zoom}px`;
            tooltip.style.top = `${(elmRect.top + 30) * zoom}px`;
            break;
    }
    tooltip.style.display = 'block';
}
function tooltipHide() {
    clearTimeout(tooltipTimer);
    tooltip.style.display = 'none';
}
const popupMsg = document.getElementById('popup-message');
let popupMsgTimer;
function popupMsgShow(msg) {
    clearTimeout(popupMsgTimer);
    popupMsg.innerText = `${msg}`;
    popupMsg.style.display = 'block';
    popupMsgTimer = setTimeout(() => {
        popupMsg.style.display = 'none'
    }, 1500);
}
const blackout = document.getElementById('blackout');
const dialog = document.getElementById('dialog-window');
const dialogTitle = document.getElementById('dialog-title');
const dialogMsg = document.getElementById('dialog-message');
const dialogBtn = document.getElementById('dialog-btn');
function dialogActive(isActive) {
    if (isActive) {
        blackout.style.display = 'block';
        dialog.style.display = 'flex';
    } else {
        blackout.style.display = 'none';
        dialog.style.display = 'none';
    }
}
function imageEditorMode() {
    dialogActive(false);
    if (videoResolution.width === 0) {
        clearTimeout(popupMsgTimer);
        popupMsgShow('画像編集のみ使用できます。ここにドロップしてください。');
        videoMode.innerHTML = '<img style="height: 12px; margin-right: 2px; transform: rotate(90deg);" src="img/play.png" alt="描画">画像編集';
        popupMsg.style.display = 'block';
        videoMode.style.pointerEvents = 'none';
        const path = 'img/sample.jpg';
        const image = new Image();
        image.src = path;
        image.onload = () => {
            canvasResize(image.naturalWidth, image.naturalHeight);
            videoCtx.drawImage(image, 0, 0, videoCanvas.width, videoCanvas.height);
            navigatorCtx.drawImage(image, 0, 0, navigatorCanvas.width, navigatorCanvas.height);
            videoFitting();
            zoomSld.value = fitRate;
        };
        videoCanvas.style.display = 'block';
        isVideoMode = 'image';
        videoMode.style.backgroundColor = '#a0e0ff';
        cameraSelect.innerHTML = `<option value="0">（画像編集中）</option>`;
        cameraSelect.disabled = true;
        resolutionSelect.innerHTML = `<option value="0">（画像編集中）</option>`;
        resolutionSelect.disabled = true;
        pictureResSelect.innerHTML = `<option value="0">画像の解像度に従う</option>`;
        pictureResSelect.disabled = true;
    } else {
        cameraSelect.selectedIndex = latestCamera;
    }
}
const dialogContents = {
    CameraAccessPrompt: {
        title: 'カメラへのアクセスを要求中です',
        msg: `本ソフトウェアにカメラの使用を許可してください。<br><br>
        詳細については
        <a href="https://faq.hozan.co.jp/support/faq/detail?site=ZAWBTM42&id=2663&search=true">
            こちら（当社Webサイト「よくあるご質問」）
        </a>
        をご覧ください。<br>`,
        btn: `<input type="button" class="dialog-btn-style" value="再読み込み" onclick="window.location.reload();"></input>
        <input type="button" class="dialog-btn-style" value="続ける" onclick="imageEditorMode();"></input>`
    },
    CameraAccessDenied: {
        title: 'カメラへのアクセスが禁止されています',
        msg: `本ソフトウェアにカメラの使用を許可し、再読み込みしてください。<br><br>
        詳細については
        <a href="https://faq.hozan.co.jp/support/faq/detail?site=ZAWBTM42&id=2663&search=true">
            こちら（当社Webサイト「よくあるご質問」）
        </a>
        をご覧ください。<br>`,
        btn: `<input type="button" class="dialog-btn-style" value="再読み込み" onclick="window.location.reload();"></input>
        <input type="button" class="dialog-btn-style" value="続ける" onclick="imageEditorMode();"></input>`
    },
    CameraNotFound: {
        title: 'カメラが認識できません',
        msg: `本ソフトウェアに対応したカメラ（当社L-837 / L-836 / L-834）が見つかりません。<br>
        接続状態をご確認の上、ソフトウェアを再読み込みしてください。<br><br>
        ご確認方法は
        <a href="https://faq.hozan.co.jp/support/faq/detail?site=ZAWBTM42&id=2663&search=true">
            こちら（当社Webサイト「よくあるご質問」）
        </a>
        をご覧ください。<br>`,
        btn: `<input type="button" class="dialog-btn-style" value="再読み込み" onclick="window.location.reload();"></input>
        <input type="button" class="dialog-btn-style" value="続ける" onclick="imageEditorMode();"></input>`
    },
    CameraNotRead: {
        title: 'カメラに接続できません',
        msg: `別のプログラムでカメラが使用されている可能性があります。<br>
        使用中のソフトウェアを終了し、再読み込みしてください。<br><br>
        詳細については
        <a href="https://faq.hozan.co.jp/support/faq/detail?site=ZAWBTM42&id=2663&search=true">
            こちら（当社Webサイト「よくあるご質問」）
        </a>
        をご覧ください。<br>`,
        btn: `<input type="button" class="dialog-btn-style" value="再読み込み" onclick="window.location.reload();"></input>
        <input type="button" class="dialog-btn-style" value="続ける" onclick="imageEditorMode();"></input>`
    }
}
document.addEventListener('mousedown', (event) => {
    if (!menuBar.contains(event.target)) {
        menuBarShow = false;
        menuBarAllHide();
    }
    if (!styleStartSelector.contains(event.target) && !selectStyleStart.contains(event.target)) {
        isStyleStartSelector = false;
        styleStartSelector.style.display = 'none';
    }
    if (!styleLineSelector.contains(event.target) && !selectStyleLine.contains(event.target)) {
        isStyleLineSelector = false;
        styleLineSelector.style.display = 'none';
    }
    if (!styleEndSelector.contains(event.target) && !selectStyleEnd.contains(event.target)) {
        isStyleEndSelector = false;
        styleEndSelector.style.display = 'none';
    }
    if (!drawColorSelector.contains(event.target) && !selectColor.contains(event.target)) {
        isDrawColorSelector = false;
        drawColorSelector.style.display = 'none';
    }
    if (!fillColorSelector.contains(event.target) && !selectFillColor.contains(event.target)) {
        isFillColorSelector = false;
        fillColorSelector.style.display = 'none';
    }
});
let cameraList = [];
let videoResolution = { width: 0, height: 0 };
let supportedResolution;
let isCameraChange = true;
function cameraAcquisition() {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
        devices.forEach((device) => {
            if (device.kind === 'videoinput') {
                if (
                    device.label === 'HOZAN USB Camera (04f2:a007)' ||
                    device.label === 'USB Camera L-836 (04f2:1601)' ||
                    device.label === 'USB Camera L-837 (04f2:1601)' ||
                    device.label === 'USB Camera L-834 (04f2:1601)'
                ) {
                    const cameraName = `カメラ_${cameraList.length + 1}`;
                    cameraList.push({ deviceId: device.deviceId, name: cameraName });

                    cameraSelect.innerHTML += `<option value="${cameraList.length - 1}">${cameraName}</option>`;
                }
            }
        });
        if (cameraSelect.options.length === 0) {
            dialogTitle.innerHTML = dialogContents.CameraNotFound.title;
            dialogMsg.innerHTML = dialogContents.CameraNotFound.msg;
            dialogBtn.innerHTML = dialogContents.CameraNotFound.btn;
            dialogActive(true);
        } else {
            cameraConnect(cameraList[0].deviceId, 2592, 1944, 1);
        }
    });
}
function cameraConnect(deviceId, resWidth, resHeight, retryParam) {
    navigator.mediaDevices.getUserMedia({
        video: {
            deviceId: { exact: deviceId },
            width: { ideal: resWidth },
            height: { ideal: resHeight }
        }
    }).then((stream) => {
        video = document.getElementById('video-element');
        mediaStream = stream;
        video.srcObject = stream;
        videoTrack = stream.getVideoTracks()[0];
        video.addEventListener('loadedmetadata', () => {
            canvasResize(video.videoWidth, video.videoHeight);
            videoFitting();
            zoomSld.value = fitRate;
            if (isCameraChange) {
                if (video.videoWidth === 2048) {
                    supportedResolution = [[2048, 1536], [1920, 1080], [1280, 960], [1280, 720], [1024, 768], [800, 600], [640, 480]];
                } else {
                    supportedResolution = [[2592, 1944], [1920, 1080], [1280, 960], [1280, 720], [1024, 768], [640, 480]];
                }
                resolutionSelect.innerHTML = `<option value="${0}">${supportedResolution[0][0]}×${supportedResolution[0][1]}</option>`;
                for (let i = 1; i < supportedResolution.length; i++) {
                    resolutionSelect.innerHTML += `<option value="${i}">${supportedResolution[i][0]}×${supportedResolution[i][1]}</option>`;
                }
                pictureResSelect.innerHTML = `<option value="${0}">${supportedResolution[0][0]}×${supportedResolution[0][1]}</option>`;
                for (let i = 1; i < supportedResolution.length; i++) {
                    pictureResSelect.innerHTML += `<option value="${i}">${supportedResolution[i][0]}×${supportedResolution[i][1]}</option>`;
                }
                isCameraChange = false;
            }
            clearTimeout(navigatorCtrl);
            videoControl();
        });
        if (typeof retryParam != 'undefined') cameraSelect.selectedIndex = retryParam - 1;
        latestCamera = cameraSelect.value;
    }).catch((err) => {
        if (typeof retryParam != 'undefined' && retryParam < cameraList.length) {
            isCameraChange = true;
            return cameraConnect(cameraList[retryParam].deviceId, 2592, 1944, retryParam + 1);
        } else {
            if (err.name === 'NotReadableError') {
                dialogTitle.innerHTML = dialogContents.CameraNotRead.title;
                dialogMsg.innerHTML = dialogContents.CameraNotRead.msg;
                dialogBtn.innerHTML = dialogContents.CameraNotRead.btn;
                dialogActive(true);
            }
        }
    });
}
let latestCamera;
cameraSelect.addEventListener('change', (event) => {
    isCameraChange = true;
    drawObjects = [];
    deletedObjects = [];
    drawBackActive(false);
    drawRedoActive(false);
    try {
        const tracks = mediaStream.getTracks();
        tracks.forEach(track => track.stop());
    } catch { }
    cameraConnect(cameraList[event.target.value].deviceId, 2592, 1944);
});
resolutionSelect.addEventListener('change', (event) => {
    isCameraChange = false;
    drawObjects = [];
    deletedObjects = [];
    drawBackActive(false);
    drawRedoActive(false);
    try {
        const tracks = mediaStream.getTracks();
        tracks.forEach(track => track.stop());
    } catch { }
    cameraConnect(cameraList[cameraSelect.value].deviceId, supportedResolution[event.target.value][0], supportedResolution[event.target.value][1]);
    pictureResSelect.value = event.target.value;
});
navigator.permissions.query({ name: 'camera' }).then((permissionStatus) => {
    if (permissionStatus.state === 'granted') {
        cameraAcquisition();
    } else if (permissionStatus.state === 'prompt') {
        dialogTitle.innerHTML = dialogContents.CameraAccessPrompt.title;
        dialogMsg.innerHTML = dialogContents.CameraAccessPrompt.msg;
        dialogBtn.innerHTML = dialogContents.CameraAccessPrompt.btn;
        dialogActive(true);
        navigator.mediaDevices.getUserMedia({ video: true }).then(() => {
            location.reload();
        }).catch((err) => {
            if (err.name === 'NotFoundError') {
                dialogTitle.innerHTML = dialogContents.CameraNotFound.title;
                dialogMsg.innerHTML = dialogContents.CameraNotFound.msg;
                dialogBtn.innerHTML = dialogContents.CameraNotFound.btn;
                dialogActive(true);
            }
        });
    } else if (permissionStatus.state === 'denied') {
        dialogTitle.innerHTML = dialogContents.CameraAccessDenied.title;
        dialogMsg.innerHTML = dialogContents.CameraAccessDenied.msg;
        dialogBtn.innerHTML = dialogContents.CameraAccessDenied.btn;
        dialogActive(true);
    }
});
function videoControl() {
    navigatorCtrl = setInterval(() => {
        navigatorCtx.drawImage(
            video,
            0,
            0,
            videoResolution.width,
            videoResolution.height,
            0,
            0,
            navigatorCanvas.width,
            navigatorCanvas.height
        );
        if (loupe.status) {
            loupeCtx.clearRect(0, 0, loupeCanvas.width, loupeCanvas.height);
            loupeCtx.drawImage(
                video,
                loupeArea.pointerX - loupeSize / 2 / loupeArea.rate / zoomParam.rate,
                loupeArea.pointerY - loupeSize / 2 / loupeArea.rate / zoomParam.rate,
                loupeSize / loupeArea.rate,
                loupeSize / loupeArea.rate,
                0,
                0,
                loupeCanvas.width,
                loupeCanvas.height
            );
        }
    }, 100);
}
function adjConvertGray(image) {
    for (let i = 0; i < image.data.length; i += 4) {
        const pixelData_red = image.data[i];
        const pixelData_green = image.data[i + 1];
        const pixelData_blue = image.data[i + 2];
        const pixcelData_average = (pixelData_red + pixelData_green + pixelData_blue) / 3;
        image.data[i] = pixcelData_average;
        image.data[i + 1] = pixcelData_average;
        image.data[i + 2] = pixcelData_average;
    }
    return image;
}
function adjColorInvert(image) {
    for (let i = 0; i < image.data.length; i += 4) {
        image.data[i] = 255 - image.data[i];
        image.data[i + 1] = 255 - image.data[i + 1];
        image.data[i + 2] = 255 - image.data[i + 2];
    }
    return image;
}
function drawLine(startX, startY, endX, endY, style, color, width, outputCtx) {
    switch (style) {
        case 'solid':
            outputCtx.setLineDash([]);
            break;
        case 'dash':
            outputCtx.setLineDash([width, width * 2]);
            break;
        case 'double':
            outputCtx.setLineDash([]);
            break;
    }
    outputCtx.strokeStyle = color;
    outputCtx.lineWidth = width;
    outputCtx.beginPath();
    outputCtx.moveTo(startX, startY);
    outputCtx.lineTo(endX, endY);
    outputCtx.stroke();
}
function drawArrow(startX, startY, endX, endY, startStyle, lineStyle, endStyle, color, width, outputCtx) {
    drawLine(startX, startY, endX, endY, lineStyle, color, width, outputCtx);
    if (startStyle === 'dot') {
        outputCtx.beginPath();
        outputCtx.arc(startX, startY, width * 2, 0, 2 * Math.PI);
        outputCtx.fillStyle = color;
        outputCtx.fill();
        outputCtx.closePath();
    }
    if (endStyle === 'dot') {
        outputCtx.beginPath();
        outputCtx.arc(endX, endY, width * 2, 0, 2 * Math.PI);
        outputCtx.fillStyle = color;
        outputCtx.fill();
        outputCtx.closePath();
    }
    if (startStyle === 'line' || endStyle === 'line') {
        const alpha = -(endX - startX) / (endY - startY);
        const r = width * 5 / 2;
        if (startStyle === 'line') {
            let position;
            if (Math.abs(alpha) != Infinity) {
                position = [
                    -Math.sqrt(r ** 2 / (1 + alpha ** 2)) + startX,
                    -alpha * Math.sqrt(r ** 2 / (1 + alpha ** 2)) + startY,
                    Math.sqrt(r ** 2 / (1 + alpha ** 2)) + startX,
                    alpha * Math.sqrt(r ** 2 / (1 + alpha ** 2)) + startY,
                ];
            } else {
                position = [startX, startY + r, startX, startY - r];
            }
            drawLine(position[0], position[1], position[2], position[3], 'solid', color, width, outputCtx);
        }
        if (endStyle === 'line') {
            let position;
            if (Math.abs(alpha) != Infinity) {
                position = [
                    -Math.sqrt(r ** 2 / (1 + alpha ** 2)) + endX,
                    -alpha * Math.sqrt(r ** 2 / (1 + alpha ** 2)) + endY,
                    Math.sqrt(r ** 2 / (1 + alpha ** 2)) + endX,
                    alpha * Math.sqrt(r ** 2 / (1 + alpha ** 2)) + endY,
                ];
            } else {
                position = [endX, endY + r, endX, endY - r];
            }
            drawLine(position[0], position[1], position[2], position[3], 'solid', color, width, outputCtx);
        }
    }
    if (startStyle === 'arrow' || endStyle === 'arrow') {
        let angle = Math.PI / 2;
        const arrowLength = width * 5;
        const alpha = -(endX - startX) / (endY - startY);
        const a = (endY - startY) / (endX - startX);
        if (Math.abs(alpha) === Infinity) angle = 0;
        if (Math.abs(a) != Infinity) angle = Math.atan(Math.abs(endY - startY) / Math.abs(endX - startX));
        if (a < 0) angle = -angle;
        const arrowL = startX <= endX ? [startX, startY] : [endX, endY];
        const arrowR = startX <= endX ? [endX, endY] : [startX, startY];
        if ((startStyle === 'arrow' && Math.abs(angle) != Math.PI / 2) || (endStyle === 'arrow' && Math.abs(angle) === Math.PI / 2)) {
            outputCtx.save();
            if (startX < endX) {
                outputCtx.translate(arrowL[0], arrowL[1]);
                outputCtx.rotate(angle + Math.PI / 6);
                drawLine(0, 0, arrowLength, 0, 'solid', color, width, outputCtx);
                outputCtx.rotate(-Math.PI / 3);
                drawLine(0, 0, arrowLength, 0, 'solid', color, width, outputCtx);
            } else {
                outputCtx.translate(arrowR[0], arrowR[1]);
                outputCtx.rotate(angle + Math.PI / 6);
                drawLine(0, 0, -arrowLength, 0, 'solid', color, width, outputCtx);
                outputCtx.rotate(-Math.PI / 3);
                drawLine(0, 0, -arrowLength, 0, 'solid', color, width, outputCtx);
            }
            outputCtx.restore();
        }
        if ((startStyle === 'arrow' && Math.abs(angle) === Math.PI / 2) || (endStyle === 'arrow' && Math.abs(angle) != Math.PI / 2)) {
            outputCtx.save();
            if (startX < endX) {
                outputCtx.translate(arrowR[0], arrowR[1]);
                outputCtx.rotate(angle + Math.PI / 6);
                drawLine(0, 0, -arrowLength, 0, 'solid', color, width, outputCtx);
                outputCtx.rotate(-Math.PI / 3);
                drawLine(0, 0, -arrowLength, 0, 'solid', color, width, outputCtx);
            } else {
                outputCtx.translate(arrowL[0], arrowL[1]);
                outputCtx.rotate(angle + Math.PI / 6);
                drawLine(0, 0, arrowLength, 0, 'solid', color, width, outputCtx);
                outputCtx.rotate(-Math.PI / 3);
                drawLine(0, 0, arrowLength, 0, 'solid', color, width, outputCtx);
            }
            outputCtx.restore();
        }
    }
}
function drawRect(startX, startY, rectWidth, rectHeight, style, lineColor, width, fillColor, outputCtx) {
    switch (style) {
        case 'solid':
            outputCtx.setLineDash([]);
            break;
        case 'dash':
            outputCtx.setLineDash([width, width * 2]);
            break;
        case 'double':
            outputCtx.setLineDash([]);
            break;
    }
    if (fillColor != 'none') {
        outputCtx.fillStyle = fillColor;
        outputCtx.fillRect(startX, startY, rectWidth, rectHeight);
    }
    outputCtx.strokeStyle = lineColor;
    outputCtx.lineWidth = width;
    outputCtx.strokeRect(startX, startY, rectWidth, rectHeight);
}
function drawCircle(startX, startY, circleWidth, circleHeight, style, lineColor, width, fillColor, outputCtx) {
    switch (style) {
        case 'solid':
            outputCtx.setLineDash([]);
            break;
        case 'dash':
            outputCtx.setLineDash([width, width * 2]);
            break;
        case 'double':
            outputCtx.setLineDash([]);
            break;
    }
    const centerX = (startX + (startX + circleWidth)) / 2;
    const centerY = (startY + (startY + circleHeight)) / 2;
    const radiusX = Math.abs(circleWidth / 2);
    const radiusY = Math.abs(circleHeight / 2);
    outputCtx.beginPath();
    outputCtx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    if (fillColor != 'none') {
        outputCtx.fillStyle = fillColor;
        outputCtx.fill();
    }
    outputCtx.strokeStyle = lineColor;
    outputCtx.lineWidth = width;
    outputCtx.stroke();
}
function drawArc(centerX, centerY, radius, startAngle, endAngle, color, width, outputCtx) {
    outputCtx.setLineDash([]);
    outputCtx.strokeStyle = color;
    outputCtx.lineWidth = width;
    outputCtx.beginPath();
    outputCtx.arc(centerX, centerY, radius, startAngle, endAngle);
    outputCtx.stroke();
}
function drawText(left, top, txt, color, size, outputCtx) {
    outputCtx.font = `${size}px Arial`;
    outputCtx.textAlign = 'left';
    outputCtx.textBaseline = 'top';
    outputCtx.fillStyle = color;
    outputCtx.fillText(txt, left, top);
}
function drawSize(x, y, txt, pos, color, size, outputCtx) {
    outputCtx.font = `${size}px Arial`;
    outputCtx.textAlign = pos;
    outputCtx.textBaseline = 'middle';
    outputCtx.fillStyle = color;
    if (!Array.isArray(txt)) {
        outputCtx.fillText(txt, x, y);
    } else {
        let offsetY = 0;
        if (txt.length % 2 === 0) {
            offsetY = - size * (txt.length / 2) / 2;
        } else {
            offsetY = - size * (txt.length - 1) / 2;
        }
        for (let i = 0; i < txt.length; i++) {
            outputCtx.fillText(txt[i], x, y + offsetY);
            offsetY += size;
        }
    }
}
function measureTwoPoint(startX, startY, endX, endY, color, size, digit) {
    const dst = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2) * calibrationData;
    const txt = `距離：${dst.toFixed(digit)}㎜`;
    let shift = size / 2;
    let x;
    let y;
    if (endY - startY != 0) {
        shift = Math.abs(shift / Math.sqrt(((endX - startX) / (endY - startY)) ** 2 + 1));
        x = (startX + endX) / 2 + shift;
        y = (startY + endY) / 2 - (endX - startX) / (endY - startY) * shift;
    } else {
        x = (startX + endX) / 2;
        y = (startY + endY) / 2 - 2 * shift;
    }
    return [x, y, txt, 'left', color, size];
}
function drawMultiLine(points, lineColor, width, fillColor, outputCtx) {
    outputCtx.beginPath();
    outputCtx.moveTo(points[0][0], points[0][1])
    for (let i = 1; i < points.length; i++) {
        outputCtx.lineTo(points[i][0], points[i][1]);
    }
    if (fillColor != 'none') {
        outputCtx.fillStyle = fillColor;
        outputCtx.fill();
    }
    outputCtx.strokeStyle = lineColor;
    outputCtx.lineWidth = width;
    outputCtx.stroke();
}
function measureMultiPoint(points, color, size, digit) {
    let dst = 0;
    for (let i = 1; i < points.length; i++) {
        dst += Math.sqrt((points[i][0] - points[i - 1][0]) ** 2 + (points[i][1] - points[i - 1][1]) ** 2) * calibrationData;
    }
    let shift = size / 2;
    let xMax = 0;
    let yMin = videoResolution.height;
    let yMax = 0;
    for (let i = 0; i < points.length; i++) {
        xMax = Math.max(xMax, points[i][0]);
        yMin = Math.min(yMin, points[i][1]);
        yMax = Math.max(yMax, points[i][1]);
    }
    const x = xMax + shift;
    const y = (yMin + yMax) / 2;
    const txt = `全長：${dst.toFixed(digit)}㎜`;
    return [x, y, txt, 'left', color, size];
}
function drawParallel(points, color, width, outputCtx) {
    const x1 = points[0][0];
    const y1 = points[0][1];
    const x2 = points[1][0];
    const y2 = points[1][1];
    const x3 = points[2][0];
    const y3 = points[2][1];
    drawLine(x1, y1, x2, y2, 'solid', color, width, outputCtx);
    const a = (y2 - y1) / (x2 - x1);
    const x4 = (a ** 2 * x3 - a * y3 + x1 + a * y1) / (a ** 2 + 1);
    const y4 = a * x4 - a * x3 + y3;
    const x5 = (a ** 2 * x3 - a * y3 + x2 + a * y2) / (a ** 2 + 1);
    const y5 = a * x5 - a * x3 + y3;
    let lineStart = [x3, y3];
    let lineEnd = [x5, y5];
    if (Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) > Math.sqrt((x3 - x4) ** 2 + (y3 - y4) ** 2) && Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) > Math.sqrt((x3 - x5) ** 2 + (y3 - y5) ** 2)) lineStart = [x4, y4];
    else if (Math.sqrt((x3 - x1) ** 2 + (y3 - y1) ** 2) > Math.sqrt((x3 - x2) ** 2 + (y3 - y2) ** 2)) lineEnd = [x4, y4];
    drawLine(lineStart[0], lineStart[1], lineEnd[0], lineEnd[1], 'solid', color, width, outputCtx);
    drawLine((x1 + x2) / 2, (y1 + y2) / 2, (x4 + x5) / 2, (y4 + y5) / 2, 'solid', color, width, outputCtx);
    return [[(x1 + x2) / 2, (y1 + y2) / 2], [(x4 + x5) / 2, (y4 + y5) / 2]];
}
function drawCircleCenter(points, color, width, outputCtx) {
    const centerX1 = (points[0][0] + points[1][0]) / 2;
    const centerY1 = (points[0][1] + points[1][1]) / 2;
    const radius1 = Math.sqrt((points[1][0] - points[0][0]) ** 2 + (points[1][1] - points[0][1]) ** 2) / 2;
    drawArc(centerX1, centerY1, radius1, 0, 2 * Math.PI, color, width, outputCtx);
    const centerX2 = (points[2][0] + points[3][0]) / 2;
    const centerY2 = (points[2][1] + points[3][1]) / 2;
    const radius2 = Math.sqrt((points[3][0] - points[2][0]) ** 2 + (points[3][1] - points[2][1]) ** 2) / 2;
    drawArc(centerX2, centerY2, radius2, 0, 2 * Math.PI, color, width, outputCtx);
    drawLine(centerX1, centerY1, centerX2, centerY2, 'solid', color, width, outputCtx);
}
function culcArc(x1, y1, x2, y2, x3, y3) {
    const a1 = - (x2 - x1) / (y2 - y1);
    const b1 = -a1 * (x1 + x2) / 2 + (y1 + y2) / 2;
    const a2 = -(x3 - x2) / (y3 - y2);
    const b2 = -a2 * (x2 + x3) / 2 + (y2 + y3) / 2;
    const centerX = (-b1 + b2) / (a1 - a2);
    const centerY = a1 * centerX + b1;
    const aLine = (y2 - y1) / (x2 - x1)
    const y3Line = aLine * x3 - aLine * x1 + y1;
    const terminal = [[x1, y1], [x2, y2]];
    if (x2 - x1 === 0) {
        if (x3 < x1) {
            if (y1 < y2) {
                x1 = terminal[1][0];
                y1 = terminal[1][1];
                x2 = terminal[0][0];
                y2 = terminal[0][1];
            }
        } else {
            if (y1 > y2) {
                x1 = terminal[1][0];
                y1 = terminal[1][1];
                x2 = terminal[0][0];
                y2 = terminal[0][1];
            }
        }
    } else if (y3Line > y3) {
        if (x1 > x2) {
            x1 = terminal[1][0];
            y1 = terminal[1][1];
            x2 = terminal[0][0];
            y2 = terminal[0][1];
        }
    } else {
        if (x1 < x2) {
            x1 = terminal[1][0];
            y1 = terminal[1][1];
            x2 = terminal[0][0];
            y2 = terminal[0][1];
        }
    }
    let startAngle;
    if (y1 < centerY) {
        if (x1 < centerX) {
            startAngle = - (Math.PI - Math.atan(Math.abs(centerY - y1) / Math.abs(centerX - x1)));
        } else if (x1 === centerX) {
            startAngle = - Math.PI / 2;
        } else if (x1 > centerX) {
            startAngle = - Math.atan(Math.abs(centerY - y1) / Math.abs(centerX - x1));
        }
    } else if (y1 === centerY) {
        if (x1 < centerX) {
            startAngle = - Math.PI;
        } else {
            startAngle = 0;
        }
    } else {
        if (x1 < centerX) {
            startAngle = Math.PI - Math.atan(Math.abs(centerY - y1) / Math.abs(centerX - x1));
        } else if (x1 === centerX) {
            startAngle = Math.PI / 2;
        } else if (x1 > centerX) {
            startAngle = Math.atan(Math.abs(centerY - y1) / Math.abs(centerX - x1));
        }
    }
    let endAngle;
    if (y2 < centerY) {
        if (x2 < centerX) {
            endAngle = - (Math.PI - Math.atan(Math.abs(centerY - y2) / Math.abs(centerX - x2)));
        } else if (x2 === centerX) {
            endAngle = - Math.PI / 2;
        } else if (x2 > centerX) {
            endAngle = - Math.atan(Math.abs(centerY - y2) / Math.abs(centerX - x2));
        }
    } else if (y2 === centerY) {
        if (x2 < centerX) {
            endAngle = - Math.PI;
        } else {
            endAngle = 0;
        }
    } else {
        if (x2 < centerX) {
            endAngle = Math.PI - Math.atan(Math.abs(centerY - y2) / Math.abs(centerX - x2));
        } else if (x2 === centerX) {
            endAngle = Math.PI / 2;
        } else if (x2 > centerX) {
            endAngle = Math.atan(Math.abs(centerY - y2) / Math.abs(centerX - x2));
        }
    }
    const result = {
        center: [centerX, centerY],
        angle: [startAngle, endAngle]
    };
    return result;
}
function measurePointAngle(points, reverse, color, width, size, digit, outputCtx) {
    const startX = points[0][0];
    const startY = points[0][1];
    const crossX = points[1][0];
    const crossY = points[1][1];
    const endX = points[2][0];
    const endY = points[2][1];
    const radius = 50;
    const fontDistance = 180;
    if (outputCtx != undefined) {
        drawLine(startX, startY, crossX, crossY, 'solid', color, width, outputCtx);
        drawLine(crossX, crossY, endX, endY, 'solid', color, width, outputCtx);
    }
    let startAngle;
    if (startX - crossX == 0) {
        startAngle = startY - crossY < 0 ? Math.PI / 2 : -Math.PI / 2;
    } else {
        startAngle = Math.atan((startY - crossY) / (startX - crossX));
        if (startX - crossX < 0) {
            startAngle += Math.PI;
        } else if (startAngle < 0) {
            startAngle = 2 * Math.PI + startAngle;
        }
    }
    let endAngle;
    if (crossX - endX == 0) {
        endAngle = endY - crossY > 0 ? Math.PI / 2 : -Math.PI / 2;
    } else {
        endAngle = Math.atan((crossY - endY) / (crossX - endX));
        if (endX - crossX < 0) {
            endAngle += Math.PI;
        } else if (endAngle < 0) {
            endAngle = 2 * Math.PI + endAngle;
        }
    }
    let angle = endAngle - startAngle;
    angle = angle < 0 ? angle + 2 * Math.PI : angle;
    angle = angle / (2 * Math.PI) * 360;
    if (!reverse) {
        if (angle >= 180) {
            [startAngle, endAngle] = [endAngle, startAngle];
            angle = endAngle - startAngle;
            angle = angle < 0 ? angle + 2 * Math.PI : angle;
            angle = angle / (2 * Math.PI) * 360;
        }
    } else {
        if (angle < 180) {
            [startAngle, endAngle] = [endAngle, startAngle];
            angle = endAngle - startAngle;
            angle = angle < 0 ? angle + 2 * Math.PI : angle;
            angle = angle / (2 * Math.PI) * 360;
        }
    }
    if (outputCtx != undefined) drawArc(crossX, crossY, radius, startAngle, endAngle, color, width, outputCtx);
    let fontAngle = angle / 360 * (2 * Math.PI) / 2 + startAngle;
    let dx = 0;
    let dy = 0;
    if (0 < fontAngle && fontAngle < 90) {
        dx = fontDistance * Math.cos(fontAngle);
        dy = dx * Math.tan(fontAngle);
    } else if (fontAngle == 90) {
        dy = fontDistance;
    } else if (90 < fontAngle && fontAngle < 270 && fontAngle != 180) {
        fontAngle -= 180;
        dx = -fontDistance * Math.cos(fontAngle);
        dy = dx * Math.tan(fontAngle);
    } else if (fontAngle == 180) {
        dx = -fontDistance;
    } else if (fontAngle == 270) {
        dy = -fontDistance;
    } else if (270 < fontAngle && fontAngle < 360) {
        fontAngle -= 360;
        dx = fontDistance * Math.cos(fontAngle);
        dy = dx * Math.tan(fontAngle);
    } else if (fontAngle == 0) {
        dx = fontDistance;
    }
    const txt = `角度：${angle.toFixed(digit)}°`;
    if (outputCtx != undefined) return [crossX + dx, crossY + dy, txt, 'center', color, size];
    else return [[crossX, crossY, txt, 'center', color, size], [startAngle, endAngle, angle / 360 * (2 * Math.PI) / 2 + startAngle]];
}
function measureLineAngle(points, color, width, size, digit, outputCtx) {
    const [x1, y1] = points[0];
    const [x2, y2] = points[1];
    const [x3, y3] = points[2];
    const [x4, y4] = points[3];
    const a1 = (y2 - y1) / (x2 - x1);
    const b1 = - a1 * x1 + y1;
    const a2 = (y4 - y3) / (x4 - x3);
    const b2 = - a2 * x3 + y3;
    const crossX = -(b1 - b2) / (a1 - a2);
    const crossY = a1 * crossX + b1;
    const msr = measurePointAngle([[x1, y1], [crossX, crossY], [x3, y3]], false, color, width, size, digit);
    drawLine(x1, y1, x2, y2, 'solid', color, width, outputCtx);
    drawLine(x3, y3, x4, y4, 'solid', color, width, outputCtx);
    const dst1 = (Math.sqrt((x1 - crossX) ** 2 + (y1 - crossY) ** 2) + Math.sqrt((x2 - crossX) ** 2 + (y2 - crossY) ** 2)) / 2;
    const dst2 = (Math.sqrt((x3 - crossX) ** 2 + (y3 - crossY) ** 2) + Math.sqrt((x4 - crossX) ** 2 + (y4 - crossY) ** 2)) / 2;
    const radius = (dst1 + dst2) / 2;
    drawArc(crossX, crossY, radius, msr[1][0], msr[1][1], color, width, outputCtx);
    let fontAngle = msr[1][2];
    const fontDistance = radius + 50;
    let dx = 0;
    let dy = 0;
    if (0 < fontAngle && fontAngle < 90) {
        dx = fontDistance * Math.cos(fontAngle);
        dy = dx * Math.tan(fontAngle);
    } else if (fontAngle == 90) {
        dy = fontDistance;
    } else if (90 < fontAngle && fontAngle < 270 && fontAngle != 180) {
        fontAngle -= 180;
        dx = -fontDistance * Math.cos(fontAngle);
        dy = dx * Math.tan(fontAngle);
    } else if (fontAngle == 180) {
        dx = -fontDistance;
    } else if (fontAngle == 270) {
        dy = -fontDistance;
    } else if (270 < fontAngle && fontAngle < 360) {
        fontAngle -= 360;
        dx = fontDistance * Math.cos(fontAngle);
        dy = dx * Math.tan(fontAngle);
    } else if (fontAngle == 0) {
        dx = fontDistance;
    }
    return [msr[0][0] + dx, msr[0][1] + dy, msr[0][2], msr[0][3], msr[0][4], msr[0][5]];
}
function measureRect(points, color, size, digit) {
    const area = Math.abs((points[1][0] - points[0][0]) * (points[1][1] - points[0][1])) * calibrationData ** 2;
    const txt = `面積：${area.toFixed(digit)}㎟`;
    let shift = size;
    const x = Math.max(points[0][0], points[1][0]) + shift;
    const y = (points[0][1] + points[1][1]) / 2;
    return [x, y, txt, 'left', color, size];
}
function measureArea(points, color, size, digit) {
    let area = 0;
    for (let i = 0; i < points.length - 1; i++) {
        const x1 = points[i][0];
        const y1 = points[i][1];
        const x2 = points[i + 1][0];
        const y2 = points[i + 1][1];
        area += (x1 * y2) - (x2 * y1);
    }
    area = Math.abs(area) / 2 * calibrationData ** 2;
    const txt = `面積：${area.toFixed(digit)}㎟`;
    let shift = size / 2;
    let x = 0;
    let y;
    for (let i = 0; i < points.length; i++) {
        if (x < points[i][0]) {
            x = points[i][0];
            y = points[i][1];
        }
    }
    x += shift;
    return [x, y, txt, 'left', color, size];
}
function objectSearch(pointerX0, pointerY0, searchRange) {
    let pointerX = pointerX0;
    let pointerY = pointerY0;
    if (rotAngle === 90) {
        pointerX = pointerY0;
        pointerY = drawMemoryCanvas.height - pointerX0;
    } else if (rotAngle === 180) {
        pointerX = drawMemoryCanvas.width - pointerX0;
        pointerY = drawMemoryCanvas.height - pointerY0;
    } else if (rotAngle === -90) {
        pointerX = drawMemoryCanvas.width - pointerY0;
        pointerY = pointerX0;
    }
    let getIds = [];
    for (let y = Math.max(pointerY - searchRange, 0); y < Math.min(pointerY + searchRange, drawMemoryCanvas.height); y++) {
        for (let x = Math.max(pointerX - searchRange, 0); x < Math.min(pointerX + searchRange, drawMemoryCanvas.width); x++) {
            const pixelData = drawMemoryCtx.getImageData(x, y, 1, 1);
            if (pixelData.data[3] === 255) {
                const id = pixelData.data[0] * (16 ** 4) + pixelData.data[1] * (16 ** 2) + pixelData.data[2];
                if (id != 0) getIds.push(id);
            }
        }
    }
    let idCounter = {};
    getIds.forEach((element) => {
        if (idCounter[element]) {
            idCounter[element]++;
        } else {
            idCounter[element] = 1;
        }
    });
    let maxCount = 0;
    let getId = null;
    Object.keys(idCounter).forEach((key) => {
        if (idCounter[key] > maxCount) {
            maxCount = idCounter[key];
            getId = parseInt(key);
        }
    });
    return getId;
}
function objectGetAll(points) {
    let pointerX0;
    let pointerY0;
    let pointerX1;
    let pointerY1;
    if (rotAngle === 0) {
        pointerX0 = points[0][0];
        pointerY0 = points[0][1];
        pointerX1 = points[1][0];
        pointerY1 = points[1][1];
    } else if (rotAngle === 90) {
        pointerX0 = points[0][1];
        pointerY0 = drawMemoryCanvas.height - points[0][0];
        pointerX1 = points[1][1];
        pointerY1 = drawMemoryCanvas.height - points[1][0];
    } else if (rotAngle === 180) {
        pointerX0 = drawMemoryCanvas.width - points[0][0];
        pointerY0 = drawMemoryCanvas.height - points[0][1];
        pointerX1 = drawMemoryCanvas.width - points[1][0];
        pointerY1 = drawMemoryCanvas.height - points[1][1];
    } else if (rotAngle === -90) {
        pointerX0 = drawMemoryCanvas.width - points[0][1];
        pointerY0 = points[0][0];
        pointerX1 = drawMemoryCanvas.width - points[1][1];
        pointerY1 = points[1][0];
    }
    let getIds = [];
    for (let y = Math.min(pointerY0, pointerY1); y < Math.max(pointerY0, pointerY1); y++) {
        for (let x = Math.min(pointerX0, pointerX1); x < Math.max(pointerX0, pointerX1); x++) {
            const pixelData = drawMemoryCtx.getImageData(x, y, 1, 1);
            if (pixelData.data[3] === 255) {
                const id = pixelData.data[0] * (16 ** 4) + pixelData.data[1] * (16 ** 2) + pixelData.data[2];
                if (id != 0) getIds.push(id);
            }
        }
    }
    let idCounter = {};
    getIds.forEach((element) => {
        if (idCounter[element]) {
            idCounter[element]++;
        } else {
            idCounter[element] = 1;
        }
    });
    let getId = [];
    Object.keys(idCounter).forEach((key) => {
        getId.push(parseInt(key, 10));
    });
    return getId;
}
function objectDelete(id, mode) {
    if (mode === 'draw') {
        for (let i = 0; i < drawObjects.length; i++) {
            if (drawObjects[i].id === id && (drawObjects[i].type != 'lineHor' && drawObjects[i].type != 'lineVer' && drawObjects[i].type != 'lineCircle')) {
                movingObject = drawObjects[i];
                let deleteObjects = [];
                if (typeof drawObjects[i].parent != 'undefined') {
                    if (drawObjects[i].parent === null) {
                        deleteObjects = drawObjects[i].child.slice();
                        deleteObjects.push(drawObjects[i].id);
                    } else {
                        for (let j = 0; j < drawObjects.length; j++) {
                            if (drawObjects[j].id === drawObjects[i].parent) {
                                deleteObjects = drawObjects[j].child.slice();
                                break;
                            }
                        }
                        deleteObjects.push(drawObjects[i].parent);
                    }
                    for (let i = 0; i < drawObjects.length; i++) {
                        if (deleteObjects.includes(drawObjects[i].id)) {
                            drawObjects[i].show = false;
                        }
                    }
                } else {
                    drawObjects[i].show = false;
                    deleteObjects.push(drawObjects[i].id);
                }
                drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.width);
                drawMemoryCtx.clearRect(0, 0, drawMemoryCanvas.width, drawMemoryCanvas.width);
                for (let j = 0; j < drawObjects.length; j++) {
                    if (drawObjects[j].show) {
                        if (drawObjects[j].type != 'lineHor' && drawObjects[j].type != 'lineVer' && drawObjects[j].type != 'lineCircle') {
                            redrawObject(drawObjects[j], drawCtx);
                        }
                        redrawObject(drawObjects[j], drawMemoryCtx);
                    }
                }
                return deleteObjects;
            }
        }
    } else if (mode === 'line') {
        for (let i = 0; i < drawObjects.length; i++) {
            if (drawObjects[i].id === id && (drawObjects[i].type === 'lineHor' || drawObjects[i].type === 'lineVer' || drawObjects[i].type === 'lineCircle')) {

                movingObject = drawObjects[i];

                drawObjects.splice(i, 1);
                lineCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.width);
                drawMemoryCtx.clearRect(0, 0, drawMemoryCanvas.width, drawMemoryCanvas.width);

                for (let j = 0; j < drawObjects.length; j++) {
                    if (drawObjects[j].type === 'lineHor' || drawObjects[j].type === 'lineVer' || drawObjects[j].type === 'lineCircle') {
                        redrawObject(drawObjects[j], lineCtx);
                    }
                    redrawObject(drawObjects[j], drawMemoryCtx);
                }
                if (crossLine.status) {
                    drawLine(0, lineCanvas.height / 2, lineCanvas.width, lineCanvas.height / 2, 'solid', crossLineColor.value, 3, lineCtx);
                    drawLine(lineCanvas.width / 2, 0, lineCanvas.width / 2, lineCanvas.height, 'solid', crossLineColor.value, 3, lineCtx);
                }
                break;
            }
        }
    }
}
function ctrlBrightness(value) {
    const changeBrightness = { advanced: [{ brightness: `${value}` }], };
    videoTrack.applyConstraints(changeBrightness);
}
function ctrlExposureMode(value) {
    const changeExposureMode = { advanced: [{ exposureMode: `${value}` }], };
    videoTrack.applyConstraints(changeExposureMode);
}
function ctrlExposureTime(value) {
    const changeExposureTime = { advanced: [{ exposureTime: `${value}` }], };
    videoTrack.applyConstraints(changeExposureTime);
}
function ctrlExposureCompensation(value) {
    const changeExposureCompensation = { advanced: [{ exposureCompensation: `${value}` }], };
    videoTrack.applyConstraints(changeExposureCompensation);
}
function ctrlContrast(value) {
    const changeContrast = { advanced: [{ contrast: `${value}` }], };
    videoTrack.applyConstraints(changeContrast);
}
function ctrlSaturation(value) {
    const changeSaturation = { advanced: [{ saturation: `${value}` }], };
    videoTrack.applyConstraints(changeSaturation);
}
function ctrlSharpness(value) {
    const changeSharpness = { advanced: [{ sharpness: `${value}` }], };
    videoTrack.applyConstraints(changeSharpness);
}
function ctrlWhitebalanceMode(value) {
    const changeWhitebalanceMode = { advanced: [{ whiteBalanceMode: `${value}` }], };
    videoTrack.applyConstraints(changeWhitebalanceMode);
}
function ctrlColorTemperature(value) {
    const changeColorTemperature = { advanced: [{ colorTemperature: `${value}` }], };
    videoTrack.applyConstraints(changeColorTemperature);
}
