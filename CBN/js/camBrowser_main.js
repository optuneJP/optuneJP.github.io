'use strict';

const screen = document.getElementById('screen');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');
const lensOutput = document.getElementById('lensOutput');
const cameraSelect = document.getElementById('camera-select');

let track;
let cameraQuality;

// 一括変更できない要素
const CanNotIcons = ["Line-Move-0", "Line-Color-0", "Line-Width-0", "Line-Reset-0", "Line-Move-1", "Line-Color-1", "Line-Width-1", "Line-Reset-1", "Circle-Move", "Circle-Color", "Circle-Width", "Circle-Reset", "exposureMode", "whiteBalanceMode"];

function AllIconOFF() {
  Array.from(document.getElementsByClassName('icon')).forEach(element => {
    if(!CanNotIcons.includes(element.getAttribute('id'))) {
      element.src = element.src.replace('None', 'OFF').replace('ON', 'OFF');
    }
  });
  if(cam.videoStopped) {
    const stopElement = document.getElementById("Stop");
    stopElement.src = stopElement.src.replace('OFF', 'ON');
  }
  EnableToggles();
}
function AllIconNone() {
  Array.from(document.getElementsByClassName('icon')).forEach(element => {
    if(!CanNotIcons.includes(element.getAttribute('id'))) {
      element.src = element.src.replace('ON', 'None').replace('OFF', 'None');
    }
  });
  // クロスラインのアイコンをNoneに
  ['Line-switch-0', "Line-switch-1"].forEach((id, k) => {
    if(document.getElementById(id).checked) {
      document.getElementById(id).checked = false;
      lineObject.Switch(k);
    }
  });
  DisableToggles();
}

function IsON(id) {
  return document.getElementById(id).src.includes('ON')
} 

function EnableToggles() {
  // ON/OFFスイッチを全て利用できる状態に
  Array.from(document.getElementsByClassName('toggle_input')).forEach(e => {
    e.disabled = false;
  });
}
function DisableToggles() {
  // ON/OFFスイッチを全て利用できない状態に
  Array.from(document.getElementsByClassName('toggle_input')).forEach(e => {
    e.disabled = true;
  });
}

/* canvasの表示表示 */
function CanvasON() {
  if(canvas.style.display == 'none') {
    canvas.style.display = 'block';
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
function CanvasOFF() {
  canvas.style.display = 'none';
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function IconOver(type, k=0) {
  let NAME = [['クロスライン', '①'], ['クロスライン', '②'], []][k];

  const explanations = {
    'Help': ['ヘルプ（当社Webサイトを開く）', '詳しいご使用方法はこちらをご覧ください'],
    'FileName': ['保存ファイル名', '撮影した静止画・動画に反映されます<br>使用できない文字：\ / : * " < > |'],
    'Photo': ['静止画撮影（Alt + a）', '保存形式：jpg<br>保存解像度：'+canvas.width+'×'+canvas.height+'<br>※ 各機能は反映されません'],
    'Movie': ['動画撮影', '保存形式：webm<br>保存解像度：'+canvas.width+'×'+canvas.height+'<br>※ 各機能は反映されません'],
    'Stop': ['表示画面のロック', '映像を一時停止します'],
    'Flip_H': ['水平反転', '映像を左右に反転します'],
    'Flip_W': ['垂直反転', '映像を上下に反転します'],
    'Mono': ['モノクロ表示（Alt + j）', '映像をグレースケールで表示します'],
    'Convert': ['色反転', '映像の色を反転します'],
    'Line_Switch': [''+NAME[0]+NAME[1]+'【表示】'+ (k==0 ? '（Alt + c）': ''), 'クロスラインを表示します'],
    'Circle_Switch': ['サークル【表示】', '円を表示します'],
    'Shadow_Switch': ['シャドウマスク', 'クロスライン①とクロスライン②に囲まれた部分を強調します<br>※ クロスラインを両方とも ON にしてください'],
    'Shadow_Range': ['シャドウマスク【不透過率変更】', 'シャドウマスクの透明度を変更します'],
    'Move': 
      k <= 1 
      ?[NAME[0]+NAME[1]+'【移動】', '映像をクリック：その位置に移動<br>を交点をクリック：つかむ/離す<br>方向キー：微調整']
      :['サークル【移動・サイズ変更】', '映像をクリック：その位置に移動<br>方向キー：微調整<br>マウスホイール：サイズ変更'],
    'Color': 
      k != 2
      ?[NAME[0]+NAME[1]+'【色変更】']
      :['サークル【色変更】'],
    'Width': 
      k != 2
      ?[NAME[0]+NAME[1]+'【幅変更】']
      :['サークル【幅変更】'],
    'Reset':
      k != 2
      ?[NAME[0]+NAME[1]+'【リセット】', '位置・色・幅を初期状態に戻します']
      :['サークル【リセット】', '位置やサイズ・色・幅を初期状態に戻します'],
    'Down': ['デジタルズーム【縮小】（Alt + g）'],
    'Up': ['デジタルズーム【拡大】（Alt + h）', '映像をドラッグ：表示範囲の移動<br>※ ライン機能OFF時のみ'],
    'Bar': ['デジタルズーム', '映像をドラッグ：表示範囲の移動<br>※ ライン機能OFF時のみ'],
    'Lens': ['部分拡大', 'マウスポインタがある部分を拡大します<br>マウスホイール操作：拡大倍率を変更<br>※ 映像は一時停止します'],
    'WriteName': ['保存ファイル名の印字', '静止画の右下に保存ファイル名を印字します'],
    'MeiMei': ['命名ルール', '保存ファイル名に日時や連番を入れることができます'],
    'MeiMei_Input': ['命名ルールの入力', '撮影した静止画・動画に反映されます<br>キーを入力した箇所には日時やカウントが挿入されます<br>使用できない文字：\ / : * " < > |'],
    'MeiMei_Count': ['カウント', '{カウント}に挿入される数字です<br>静止画・動画を撮影するたびに 1 ずつ加算されます'],
    "brightness": ['カメラ調整【明るさ】', 'スライダー操作または設定値を入力<br>調整範囲：-128 〜 127'],
    "exposureTime": ['カメラ調整【露出】', 'スライダー操作または設定値を入力<br>調整範囲：-13 〜 3<br>※ 自動OFF時のみ'],
    "exposureCompensation": ['カメラ調整【ゲイン】', 'スライダー操作または設定値を入力<br>調整範囲：0 〜 255<br>※ 露出の自動ON時のみ'],
    "contrast": ['カメラ調整【コントラスト】', 'スライダー操作または設定値を入力<br>調整範囲：0 〜 255'],
    "saturation": ['カメラ調整【鮮やかさ】', 'スライダー操作または設定値を入力<br>調整範囲：0 〜 255'],
    "sharpness": ['カメラ調整【鮮明度】', 'スライダー操作または設定値を入力<br>調整範囲：0 〜 255'],
    "colorTemperature": ['カメラ調整【ホワイトバランス】', 'スライダー操作または設定値を入力<br>調整範囲：0 〜 255<br>※ 自動OFF時のみ'],
    "setting-Reset": ['カメラ調整【リセット】', '全てのカメラ調整を初期状態に戻します'],
  }

  info.innerHTML = '<u>'+explanations[type][0]+'</u>' + (explanations[type].length == 2 ? '<br>'+explanations[type][1] : '');
}

function IconOut() {
  if(cam) {
    info.innerHTML = '';
  } else {
    info.innerHTML = '<u>ヘルプウィンドウ</u><br>ここには使い方のヒントが表示されます';
  }
}

function IconClick(e, others=[]) { // others: 重複でオンにできない要素リスト 同じname値のradioボタンと同じ
  e.src = e.src.includes('ON') ? e.src.replace('ON', 'OFF') : e.src.replace('None', 'ON').replace('OFF', 'ON');
  others.forEach(e => {
    if(e.src.includes('ON')) e.src = e.src.replace('ON', 'OFF');
  });
}


let lineObject = new Line();
canvas.addEventListener('click', (e) => {
  lineObject.Move(e, true);
});
canvas.addEventListener('mousemove', (e) => {
  lineObject.Move(e);
});
canvas.addEventListener('wheel', (e) => {
  lineObject.Wheel(e);
  e.preventDefault();
});
window.addEventListener('keydown', (e) => {
  lineObject.KeyDown(e);
  if(e.altKey) {
    switch(e.keyCode) {
      case 65: // 静止画像撮影(a)
        const element = document.getElementById('Photo');
        cam.TakePicture(element);
        break;
      case 71: // 縮小(g)
        cam.Zoom('Down');
        break;
      case 72: // 拡大(h)
        cam.Zoom('Up');
        break;
      case 74: // モノクロ表示（j）
        cam.Gray();
        IconClick(document.getElementById('Mono-button'), [document.getElementById('Convert-button')]);
        break;
      case 67: // クロスライン① 表示・非表示(c)
        const lineSwitch = document.getElementById('Line-switch-0');
        if(lineSwitch.checked) {
          lineSwitch.checked = false;
          lineObject.Draw();
        } else {
          lineSwitch.checked = true;
          lineObject.Switch(0);
        }
        break;
    }
  }
});

let cam = null;
function StartUp() {
  cam = new CamBrowser();
  // ズーム機能での移動
  screen.addEventListener('mousedown', (e) => {
    cam.ZoomMove('down', e);
  });
  screen.addEventListener('mouseup', (e) => {
    cam.ZoomMove('up', e);
  });
  screen.addEventListener('mousemove', (e) => {
    cam.ZoomMove('move', e);
  });
  document.getElementById('camera-select').style.display = 'block';
}

window.onload = () => {
  DisableToggles();
  let d = new Date();
  let date = [d.getFullYear()]; // [year, month, date, hours, minutes, seconds] （year以外は２桁表示）
  [d.getMonth()+1, d.getDate()].forEach(v => {
    date.push(('0' + v).slice(-2));
  });
  document.getElementById('filename').value = 'CamBrowser_'+date[0]+date[1]+date[2];
}