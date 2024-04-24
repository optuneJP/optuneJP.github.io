class CamBrowser {
  constructor() {
    this.flip = [1, 1];
    this.recorder;
    this.stream = null;
    this.videoStopped = false;
    this.zoom = {
      from: [0, 0],
      delta: [0, 0],
      transformed: [0, 0], // すでに移動した距離
    }
    this.UpDateCamera(cameraSelect.value, true);
  }
  UpDateCamera(deviceId=cameraSelect.value, first=false) {
    if(this.stream) { // カメラを停止させる
      this.stream.getVideoTracks().forEach(camera => {
        camera.stop();
      });
    }

    // deviceの情報を取得する
    navigator.mediaDevices.getUserMedia({ audio: false, video: { deviceId: deviceId }, }).then(stream => {
      [track] = stream.getVideoTracks();
      const trackInfo = {
        constraints: track.getConstraints(), // 指定した内容
        capabilities: track.getCapabilities(), // デバイスで指定できる範囲
        settings: track.getSettings(), // 実際の結果
      };

      // 設定の変更
      const L835 = cameraSelect.options[cameraSelect.selectedIndex].innerText.includes('L-835');
      document.getElementById('info-framerate').innerText = L835 ? 30 : Math.round(trackInfo.capabilities.frameRate.max);

      track.applyConstraints({
        width: { exact: L835 ? 1280 : trackInfo.capabilities.width.max },
        height: { exact: L835 ? 960 : trackInfo.capabilities.height.max },
        frameRate: { ideal: L835 ? 30 : trackInfo.capabilities.frameRate.max },
        deviceId: { exact: trackInfo.settings.deviceId },
      })
      .then(() => {
        // 設定された情報を元に更新
        const settings = track.getSettings();
        canvas.width = settings.width; canvas.height = settings.height;

        document.getElementById('info-resolution').innerText = settings.width+' × '+settings.height;

        // カメラ一覧取得
        navigator.mediaDevices.enumerateDevices().then( devices => {
          cameraSelect.innerHTML = first ? '<option value="" selected>カメラを選択してください</option>' : '';
          devices.filter(device => device.kind === 'videoinput').forEach( device => {
            // デバイス名を取得する
            const deviceName = device.label.split(" (")[0];

            // ベンダーIDとプロダクトIDを取得する
            const match = device.label.match(/\((\w+):(\w+)\)/);
            const vendorId = match[1];
            const productId = match[2];

            if(['04f2'].includes(vendorId) && ['a007'].includes(productId)) { // 利用可能かをベンダーIDとプロダクトIDで指定
              let e = document.createElement('option');
              e.setAttribute('value', device.deviceId);
              e.innerText = deviceName;
              cameraSelect.appendChild(e);
              if(settings.deviceId == device.deviceId) {
                e.selected = true;
                document.getElementById('info-camera').innerText = deviceName;
              } else {
                e.selected = false;
              }
            }
          });
          if(cameraSelect.options[cameraSelect.selectedIndex].innerText=='カメラを選択してください' || first) { // 起動時もしくは後からカメラを選択してくださいの場合
            Array.from(cameraSelect.children).forEach(e => {
              if(e.innerText == "カメラを選択してください") {
                e.selected = true;
              }
              track.stop();
            });
          } else {
            EnableToggles();
          }
        }).catch(function(err) {
          console.log(err + ': ' + err.message);
        });
      });
      this.stream = stream;
      if(cameraSelect.value != ""　&&　!first) { // カメラ未選択 or 起動時 の時は自動的にカメラを表示させない
        screen.style.background = 'unset';
        video.srcObject = stream;
        setTimeout(() => {
          video.play();
          AllIconOFF();
        }, 30);

        /* カメラの設定値を反映 */
        cameraQuality = new CameraQuality();
      }
    }).catch( err => {
      // 接続が許可されなかった時
      document.getElementById('camera-connect').style.display = 'block';
      document.getElementById('camera-select').style.display = 'none';
    });
  }
  FileNameSwitch() {
    const filename = document.getElementById('filename');
    const meimei = document.getElementById('filename-Meimei');
    const flg = document.getElementById('FileName-switch').checked;
    filename.style.background = flg ? 'gray' : 'white';
    meimei.style.background = flg ? 'white' : 'gray';
  }
  // ファイル名の取得
  GetFileName() {
    const count = document.getElementById('count');
    const fileNameFlg = document.getElementById('FileName-switch').checked;
    let filename = fileNameFlg ? document.getElementById('filename-Meimei').value : document.getElementById('filename').value;

    var d = new Date();
    const date = [d.getFullYear()];
    const units = [
      d.getMonth() + 1,
      d.getDate(),
      d.getHours(),
      d.getMinutes(),
      d.getSeconds()
    ];
    units.forEach(unit => {
      date.push(
        ('0' + unit).slice(-2)
      );
    });

    // ファイル名に日付を挿入
    ['{年}', '{月}', '{日}', '{時}', '{分}', '{秒}'].forEach((key, i) => {
      filename = filename.split(key).join(date[i]);
    });
    filename = filename.replace('{日付}', date.slice(0, 3).join(''));

    // ファイル名にカウントを挿入
    if (fileNameFlg && document.getElementById('filename-Meimei').value.includes('{カウント}')) {
      filename = filename.replace('{カウント}', count.value);
      count.value = Number(count.value) + 1;
    }

    return filename;
  }
  TakePicture(e) { // 静止画像撮影
    if((e.src.includes('None') || e.src.includes('ON'))) {
      return;
    }

    e.src = e.src.replace('OFF', 'ON');

    // カメラ演出
    video.pause();
    CanvasON();
    const fileName = this.GetFileName();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 保存名の印字
    if(document.getElementById('WriteFileName-switch').checked) {
      ctx.fillStyle = 'orange';
      ctx.font = '34px sans-serif';
      ctx.fillText(
        fileName,
        canvas.width - ctx.measureText(fileName).width - 30,
        canvas.height - 30
      );
    }

    // ダウンロード
    let a = document.createElement('a');
    a.href = canvas.toDataURL('image/jpeg');
    a.download = fileName + '.jpg';
    a.click();

    // 撮影終了
    setTimeout(e => {
      e.src = e.src.replace('ON', 'OFF');
      video.play();
      CanvasOFF();
    }, 500, e);
  }
  Record(e) { // 録画
    if(e.src.includes('None')) {
      return;
    } else if(e.src.includes('OFF')) {
      // 録画開始
      AllIconNone();
      e.src = e.src.replace('None', 'ON');
      video.style = '';
      zoomBar.value = '1';

      this.recorder = new MediaRecorder(this.stream) // 映像の入力ソースをユーザーのデバイスから取得
      this.recorder.start();
      this.recorder.ondataavailable = (e) => {
        const blob = new Blob([e.data], { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.href = url;
        a.download = cam.GetFileName() + '.webm';
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } else {
      // 録画終了
      AllIconOFF();
      video.style = '';
      zoomBar.value = '1';
      this.recorder.stop();
      e.src = e.src.replace('ON', 'OFF');
    }
  }
  Stop(e) { // 表示画面ロック
    const recordElement = document.getElementById('Record');

    if(e.src.includes('None')) {
      return;
    } else if(e.src.includes('OFF')) {
      video.pause();
      this.videoStopped = true;

      recordElement.src = recordElement.src.replace('OFF', 'None');
      e.src = e.src.replace('OFF', 'ON');
    } else {
      video.play();
      this.videoStopped = false;

      recordElement.src = recordElement.src.replace('None', 'OFF');
      e.src = e.src.replace('ON', 'OFF');
    }
  }
  Flip(direction) { // 上下左右反転
    this.flip[direction] *= -1;
    this.Zoom();
  }
  Gray() {
    const isGrayscale = video.style.filter == 'grayscale(1)';
    video.style.filter = isGrayscale ? 'grayscale(0)' : 'grayscale(1)';
  }
  ColorInversion() {
    const isInverted = video.style.filter === 'invert()';
    video.style.filter = isInverted ? 'unset' : 'invert()';
  }
  Lens(e) {
    const lensOutput = document.getElementById('lensOutput');
    
    if (lensOutput.style.display === 'none') {
      e.style.color = 'white';
      e.style.background = 'rgb(86, 86, 255)';
      
      AllIconNone();
      const photo = document.getElementById('Photo');
      photo.src = photo.src.replace('None', 'OFF');
      
      CanvasON();
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      lensOutput.src = canvas.toDataURL('image/jpeg');
      lensOutput.style.display = 'block';
      
      $('#lensOutput').elevateZoom({
        scrollZoom: true,
        zoomType: 'lens',
        lensShape: 'square',
        lensSize: 250
      });
    } else {
      e.style.color = 'unset';
      e.style.background = 'unset';
      
      AllIconOFF();
      CanvasOFF();
      lensOutput.style.display = 'none';
      $('.zoomContainer').remove();
    }
  }
  Zoom(type = null, transform = this.zoom.transformed) {
    const zoomBar = document.getElementById('zoomBar');
    let v = Number(zoomBar.value);
    if(type == 'Up') {
      v += 0.1;
    } else if(type == 'Down') {
      v -= 0.1;
    }
    // 値の修正・表示リセット
    if(Number(zoomBar.max) <= v) {
      v = Number(zoomBar.max);
    } else if(v <= Number(zoomBar.min)) {
      v = Number(zoomBar.min);
      this.zoom.transformed = [0, 0];
      screen.style.cursor = 'unset';
    }
    zoomBar.value = String(v);
    video.style.transform = 'translate('+transform[0]+'px, '+transform[1]+'px)' +' scale('+v*this.flip[0]+', '+v*this.flip[1]+')';
  }
  ZoomMove(type, e) {
    if(zoomBar.value != "1" && ![lineObject.lines[0].switch.checked, lineObject.lines[1].switch.checked, lineObject.circle.switch.checked].includes(true)) {
      switch(type) {
        case 'down':
          screen.style.cursor = 'grabbing';
          this.zoom.from = [e.pageX, e.pageY];
          this.Zoom();
          break;
        case 'up':
          screen.style.cursor = 'grab';
          this.zoom.transformed[0] += this.zoom.delta[0];
          this.zoom.transformed[1] += this.zoom.delta[1];
          this.zoom.delta = [0, 0];
          this.Zoom();
          break;
        case 'move':
          if(screen.style.cursor == 'grabbing') {
            this.zoom.delta = [
              e.pageX - this.zoom.from[0],
              e.pageY - this.zoom.from[1]
            ];
            this.Zoom(null, [this.zoom.transformed[0]+this.zoom.delta[0], this.zoom.transformed[1]+this.zoom.delta[1]]);
            }
          break;
      }
    }
  }
  IsAvailable(label) {
    const availables = ['L-836', 'L-837'];
    return availables.some(avail => label.includes(avail));
  }
}
