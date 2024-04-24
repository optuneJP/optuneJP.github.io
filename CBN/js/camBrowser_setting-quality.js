function switch_exposureCompensation(disabled) {
  const e = [document.getElementById("exposureCompensation"), document.getElementById("exposureCompensation-value")];
  e[0].value = "32";
  e[0].disabled = disabled;
  e[1].value = "32";
  cameraQuality.ApplyConstraints({"exposureCompensation": 32});
}

class CameraQuality {
  constructor() {
    // 設定可能範囲の取得
    const capabilities = track.getCapabilities();

    // デフォルト値の取得
    const settings = track.getSettings();
    
    for(const id in capabilities) {
      const e = document.getElementById(id);
      const valueE = document.getElementById(`${id}-value`);
      if(e) {
        const capa = capabilities[id];
        const defaultValue = settings[id];
        if("max" in capa) {
          // 設定可能な表示
          e.value = String(defaultValue);
          if(valueE) {
            valueE.value = String(defaultValue);
          }
          // 範囲指定
          if(id != "exposureTime") {
            e.min = capa.min;
            e.max = capa.max;
            if("step" in capa) {
              e.step = capa.step;
            }
          } else {
            // 例外的に設定
            e.min = -13;
            e.max = 3
            e.step = 1;
            e.value = 1;
            valueE.value = 1;
          }
        }
        // イベントリスナーの追加
        e.addEventListener("change", () => {
          cameraQuality.Change(id);
        });
      }
      if(valueE) {
        valueE.addEventListener("change", () => {
          cameraQuality.Change(id, true);
        });
      }
    }

    // 切り替え部分
    [["whiteBalanceMode", "colorTemperature"], ["exposureMode", "exposureTime"]].forEach(v => {
      const bar = document.getElementById(v[1]);
      const button = document.getElementById(v[0]);

      if(v[0] in capabilities) {
        if(settings[v[0]] == "continuous") {
          bar.disabled = true;
          button.src = button.src.replace("OFF", "ON");
        } else {
          button.src = button.src.replace("ON", "OFF");
        }
      }
    });
    
  }
  Change(id, byText=false) {
    const setting = {};
    let value; let e;
    if(byText) {
      e = document.getElementById(id);
      value = document.getElementById(`${id}-value`).value;
    } else {  
      value = document.getElementById(id).value;
      e = document.getElementById(`${id}-value`);
    }

    if(e) {
      e.value = value;
    }

    // 値の調整
    if(id == "exposureTime") {
      value = String([1.220703125, 2.44140625, 3.662109375, 6.103515625, 10.98632813, 20.75195313, 40.28320313, 79.34570313, 158.6914063, 313.7207031, 627.4414063, 1251.220703, 2501.220703, 5001.220703, 20000, 40000, 80000][parseInt(Number(value)+13)])
    }

    setting[id] = value;
    this.ApplyConstraints(setting);
  }
  ModeChange(v) {
    const bar = document.getElementById(v[1]);
    const button = document.getElementById(v[0]);

    if(button.src.includes("ON")) {
      button.src = button.src.replace("ON", "OFF");
    } else {
      button.src = button.src.replace("OFF", "ON");
    }

    
    const isAuto = button.src.includes("ON");
    
    if(v[0] == 'exposureMode') {
      switch_exposureCompensation(!isAuto);
    }

    bar.disabled = isAuto;

    const setting = {};
    setting[v[0]] = isAuto ? "continuous" : "manual";
    this.ApplyConstraints(setting);
  }
  ApplyConstraints(setting) {
    // console.log(setting)
    track.applyConstraints({ advanced: [setting] })
      .then(stream => {
        return navigator.mediaDevices.getUserMedia({video: true});
      })
      .then(stream => {
        const [newTrack] = stream.getVideoTracks();
        const constraints = track.getConstraints();
        // console.log("設定完了: ", constraints);
      })
      .catch(error => {
        console.error('applyConstraints error:', error);
      });
  }
  Reset() {
    const setting = {
      "brightness": 0,
      "exposureMode": "continuous",
      "exposureTime": 21000,
      "exposureCompensation": 32,
      "contrast": 40,
      "saturation": 64,
      "sharpness": 80,
      "whiteBalanceMode": "continuous",
      "colorTemperature": 128,
    }
    this.ApplyConstraints(setting);

    // 先に設定する
    [["whiteBalanceMode", "colorTemperature"], ["exposureMode", "exposureTime"]].forEach(v => {
      const bar = document.getElementById(v[1]);
      const button = document.getElementById(v[0]);
      if(setting[v[0]] == "continuous") {
        button.src = button.src.replace("OFF", "ON");
        bar.disabled = true;
      } else {
        button.src = button.src.replace("ON", "OFF");
        bar.disabled = false;
      }
    });

    if(setting["exposureMode"] == "continuous") {
      switch_exposureCompensation(false);
    }

    // 値の反映
    for(var id in setting) {
      if(!["whiteBalanceMode", "exposureMode"].includes(id)) {
        const e = document.getElementById(id);
        const valueE = document.getElementById(`${id}-value`);
        const v = setting[id];
        
        e.value = String(v);
        valueE.value = String(v);

        // 範囲指定
        if(id == "exposureTime") {

          // 例外的に設定
          e.min = -13;
          e.max = 3
          e.step = 1;
          e.value = 1;
          valueE.value = 1;
        }
      }
    }

  }
}
