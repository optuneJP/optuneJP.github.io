function LineCircleMove(k, element) {
  ['Line-Move-0', 'Line-Move-1', 'Circle-Move'].forEach((id, i) => {
    if(i != k) {
      const element = document.getElementById(id);
      element.src = element.src.replace('ON', 'OFF');
    }
  });
  let switchE = [document.getElementById('Line-switch-0'), document.getElementById('Line-switch-1'), document.getElementById('Circle-switch')][k];
  if(switchE.checked) {
    if(element.src.includes('ON')) {
      element.src = element.src.replace('ON', 'OFF');
    } else {
      element.src = element.src.replace('OFF', 'ON');
    } 
  }
}

/* Line */
class Line {
  constructor() {
    this.drawn = false;
    CanvasON();
    let center = [canvas.clientWidth/2, canvas.clientHeight/2];
    CanvasOFF();
    this.lines = [
      {
        position: [...center],
        color: 'red',
        width_index: 1,
        grabbed: false,
        dot: document.createElement('div'),
        switch: document.getElementById('Line-switch-0'),
      },
      {
        position: [...center],
        color: 'blue',
        width_index: 1,
        grabbed: false,
        dot: document.createElement('div'),
        switch: document.getElementById('Line-switch-1'),
      },
    ];
    this.circle = {
      position: [...center],
      radius: center[0],
      color: 'yellow',
      width_index: 1,
      switch: document.getElementById('Circle-switch'),
    };
    // ラインの基準点を追加
    this.lines.forEach((line, k) => {
      line.dot.classList.add('Line-dot');
      line.dot.style.background = line.color;
      line.dot.addEventListener('click', () => this.Grab(k));
      screen.appendChild(line.dot);
    });
    this.AdjustDot();
  }
  AdjustDot() {
    this.lines.forEach( line => {
      const [left, top] = line.position.map((p) => p - 5);
      line.dot.style.left = `${left}px`;
      line.dot.style.top = `${top}px`;
    });
  }
  Move(e, clicked=false) {
    let rect = canvas.getBoundingClientRect();
    let new_p = [
      e.pageX - (rect.left + window.pageXOffset),
      e.pageY - (rect.top + window.pageYOffset),
    ];
    // ライン
    this.lines.forEach((line, k) => {
      if( IsON('Line-Move-'+k) && (line.grabbed || clicked)) {
        line.position = [...new_p];
        const [left, top] = new_p.map((p) => p - line.dot.clientWidth / 2);
        line.dot.style.left = `${left}px`;
        line.dot.style.top = `${top}px`;
      }
    });
    // サークル
    if( IsON('Circle-Move') && clicked ) {
      this.circle.position = [...new_p];
    }
    this.Draw();
  }
  Wheel(e) {
    if(IsON('Circle-Move')) {
      if(e.deltaY < 0) {
        if(this.circle.radius + 2 < canvas.height) {
          this.circle.radius += 2;
        }
      } else {
        if(this.circle.radius - 2 > 0) {
          this.circle.radius -= 2;
        }
      }
    }
    this.Draw();
  }
  KeyDown(e) {
    // ライン
    this.lines.forEach((line, k) => {
      if(IsON('Line-Move-' +k)) {
        switch(e.key) {
          case 'ArrowLeft':
            this.lines[k].position[0] -= 1;
            break;
          case 'ArrowRight':
            this.lines[k].position[0] += 1;
            break;
          case 'ArrowUp':
            this.lines[k].position[1] -= 1;
            break;
          case 'ArrowDown':
            this.lines[k].position[1] += 1;
            break;
        }
        // 端から移動できなくする
        line.position.forEach((p, i) => {
          if(p < 0) {
            this.lines[k].position[i] = 0;
          } else if([canvas.clientWidth, canvas.clientHeight][i] < p) {
            this.lines[k].position[i] = [canvas.clientWidth, canvas.clientHeight][i];
          }
        });
        // 掴んでいた状態を解除
        if(line.grabbed) this.Grab(k);
      }
    });
    // サークル
    if(IsON('Circle-Move')) {
      switch(e.key) {
        case 'ArrowLeft':
          this.circle.position[0] -= 1;
          break;
        case 'ArrowRight':
          this.circle.position[0] += 1;
          break;
        case 'ArrowUp':
          this.circle.position[1] -= 1;
          break;
        case 'ArrowDown':
          this.circle.position[1] += 1;
          break;
      }
    }

    this.AdjustDot();
    this.Draw();
  }
  
  Grab(k) {
    const line = this.lines[k];
    const move = document.getElementById('Line-Move-'+k);
    if (move.src.includes('ON')) {
      line.grabbed = !line.grabbed;
      line.dot.style.cursor = line.grabbed ? 'grabbing' : 'grab';
      this.Draw();
    }
  }
  Switch(k=null) {
    if (k === null) {
      // サークル
      const circleSwitch = this.circle.switch;
      const circleElements = ['Move', 'Color', 'Width', 'Reset'].map(n =>
        document.getElementById(`Circle-${n}`)
      );
      if (!circleSwitch.checked) {
        circleElements.forEach(element => {
          element.src = element.src.replace('_ON', '')
            .replace('_OFF', '').replace('.png', '_None.png');
        });
      } else {
        circleElements.forEach(element => {
          const id = element.id;
          if (['Move', 'Reset'].includes(id.split('-')[1])) {
            element.src = element.src.replace('_None', '_OFF');
          } else {
            element.src = element.src.replace('_None', '');
          }
        });
      }
    } else {
      // クロスライン
      const lineDot = this.lines[k].dot;
      const lineElements = ['Move', 'Color', 'Width', 'Reset'].map(n =>
        document.getElementById(`Line-${n}-${k}`)
      );
      if (lineDot.style.display === 'inline-block') {
        lineDot.style.display = 'none';
        lineElements.forEach(element => {
          element.src = element.src.replace('_ON', '')
            .replace('_OFF', '').replace('.png', '_None.png');
        });
      } else {
        lineDot.style.display = 'inline-block';
        lineElements.forEach(element => {
          const id = element.id;
          if (['Move', 'Reset'].includes(id.split('-')[1])) {
            element.src = element.src.replace('_None', '_OFF');
          } else {
            element.src = element.src.replace('_None', '');
          }
        });
      }
    }
    
    // シャドウマスクの表示
    const shadowSwitch = document.getElementById('shadow-switch');
    const shadowArea = document.getElementById('shadow-area');
    const shadowRange = document.getElementById('shadow-range');
    const switch0 = this.lines[0].switch.checked;
    const switch1 = this.lines[1].switch.checked;
    if (!(switch0 && switch1)) {
      shadowSwitch.checked = false;
      shadowArea.style.opacity = 0.4;
      shadowSwitch.disabled = true;
      shadowRange.disabled = true;
    } else {
      shadowSwitch.disabled = false;
      shadowRange.disabled = false;
      shadowArea.style.opacity = 1;
    }
    
    this.Draw();
    
    // 全てOFFの時
    if ((!switch0 && !switch1) && !this.circle.switch.checked) {
      CanvasOFF();
    }
  }  
  Draw() {
    // 初回に位置修正 ウィンドウサイズ変更に対応
    if(!this.drawn) {
      this.drawn = true;
      CanvasON();
      const center = [canvas.clientWidth / 2, canvas.clientHeight / 2];
      this.lines.forEach(line => {
        line.position = [...center];
      });
      this.circle.position = [...center];
      this.circle.radius = center[0];
      CanvasOFF();
    }

    CanvasON();

    // 画面比率
    const a = [canvas.width/canvas.clientWidth, canvas.height/canvas.clientHeight];

    // シャドウマスク
    if(document.getElementById('shadow-switch').checked) {
      ctx.fillStyle = `rgba(0, 0, 0, ${document.getElementById('shadow-range').value})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const [x1, y1] = this.lines[0].position;
      const [x2, y2] = this.lines[1].position;
      const [left, top] = [Math.min(x1, x2), Math.min(y1, y2)];
      const [width, height] = [Math.abs(x1 - x2), Math.abs(y1 - y2)];

      ctx.clearRect(left * a[0], top * a[1], width * a[0], height * a[1]);
    }

    // ライン
    info.innerHTML = '';
    this.lines.forEach((line, k) => {
      if (line.switch.checked) {
        const lineWidth = [1, 3, 5][line.width_index] * (canvas.width / 2560);

        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = line.color;
        ctx.beginPath();

        const [x1, y1] = line.position;
        const [x2, y2] = [x1 * a[0], y1 * a[1]];

        ctx.moveTo(x2, 0);
        ctx.lineTo(x2, canvas.height);

        ctx.moveTo(0, y2);
        ctx.lineTo(canvas.width, y2);

        ctx.stroke();

        info.innerHTML += `クロスライン${['①', '②'][k]}<br>　水平：${Math.round(x1)}<br>　垂直：${Math.round(y1)}<br>`;
      }
    });

    // サークル
    if (this.circle.switch.checked) {
      const r = this.circle.radius;
      const [x, y] = [this.circle.position[0] * a[0], this.circle.position[1] * a[1]];

      ctx.beginPath();
      ctx.ellipse(x, y, r, r * a[1] / a[0], 0, 0, 2 * Math.PI);
      ctx.strokeStyle = this.circle.color;
      ctx.lineWidth = [1, 3, 5][this.circle.width_index] * (canvas.width / 2560);
      ctx.stroke();
    }
  }
  ChangeLine(mode, k=0) {
    if(!this.lines[k].switch.checked) {
      return;
    }
    
    const color = document.getElementById(`Line-Color-${k}`);
    const width = document.getElementById(`Line-Width-${k}`);
    const move = document.getElementById(`Line-Move-${k}`);
    
    switch(mode) {
      case 'Color':
        const COLORS = ['blue', 'lime', 'aqua', 'magenta', 'red', 'yellow'];
        const index = (COLORS.indexOf(this.lines[k].color) + 1) % COLORS.length;
        const new_color = COLORS[index];
        
        this.lines[k].color = new_color;
        this.lines[k].dot.style.background = new_color;
        
        color.src = `./icon/Color_${new_color.slice(0, 1).toUpperCase()}${new_color.slice(1)}.png`;
        break;
        
      case 'Width':
        const new_width_index = (this.lines[k].width_index + 1) % 3;

        width.src = width.src.replace(`Width_${this.lines[k].width_index}`, `Width_${new_width_index}`);
        this.lines[k].width_index = new_width_index;
        break;
        
      case 'Reset':
        const colors = ['red', 'blue'];
        
        this.lines[k].color = colors[k];
        this.lines[k].width_index = 1;
        this.lines[k].position = [canvas.clientWidth/2, canvas.clientHeight/2];
        move.src = './icon/Move_OFF.png';
        color.src = `./icon/Color_${colors[k].slice(0, 1).toUpperCase()}${colors[k].slice(1)}.png`;
        width.src = './icon/Width_1.png';
        break;
    }
    
    this.Draw();
  }
  
  ChangeCircle(mode) {
    if(!this.circle.switch.checked) {
      return;
    }
    
    const color = document.getElementById('Circle-Color');
    const width = document.getElementById('Circle-Width');
    const move = document.getElementById('Circle-Move');
    
    switch(mode) {
      case 'Color':
        const COLORS = ['blue', 'lime', 'aqua', 'magenta', 'red', 'yellow'];
        const index = (COLORS.indexOf(this.circle.color) + 1) % COLORS.length;
        const new_color = COLORS[index];
        
        this.circle.color = new_color;
        color.src = `./icon/Color_${new_color.slice(0, 1).toUpperCase()}${new_color.slice(1)}.png`;
        break;
        
      case 'Width':
        const new_width_index = (this.circle.width_index + 1) % 3;
        
        width.src = width.src.replace(`Width_${this.circle.width_index}`, `Width_${new_width_index}`);
        this.circle.width_index = new_width_index;
        break;
        
      case 'Reset':
        this.circle.color = 'yellow';
        this.circle.width_index = 1;
        this.circle.radius = canvas.clientWidth/2;
        this.circle.position = [canvas.clientWidth/2, canvas.clientHeight/2];
        move.src = './icon/Move_OFF.png';
        color.src = './icon/Color_Yellow.png';
        width.src = './icon/Width_1.png';
        break;
    }
    
    this.Draw();
  }
}