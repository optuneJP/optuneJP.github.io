document.addEventListener('DOMContentLoaded', () => {
    let currentDrag = null;
    let connections = {
        power: null,
        switch: null,
        bulb: null
    };

    document.querySelectorAll('.component').forEach(component => {
        component.addEventListener('dragstart', (e) => {
            currentDrag = e.target;
        });

        component.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        component.addEventListener('drop', (e) => {
            if (currentDrag && currentDrag !== e.target) {
                const from = currentDrag.getAttribute('data-component');
                const to = e.target.getAttribute('data-component');
                connections[from] = to;
                drawWire(currentDrag, e.target);
            }
        });
    });

    const switchElement = document.getElementById('switch');
    const bulbElement = document.getElementById('bulb');

    switchElement.addEventListener('click', () => {
        if (connections.power === 'switch' && connections.switch === 'bulb') {
            const currentColor = bulbElement.style.backgroundColor;
            bulbElement.style.backgroundColor = currentColor === 'yellow' ? '#ffffcc' : 'yellow';
        } else {
            alert('正しく結線されていません');
        }
    });

    function drawWire(fromElement, toElement) {
        const wiresSvg = document.getElementById('wires');
        const fromRect = fromElement.getBoundingClientRect();
        const toRect = toElement.getBoundingClientRect();
        const boardRect = document.querySelector('.board').getBoundingClientRect();

        const x1 = fromRect.left + fromRect.width / 2 - boardRect.left;
        const y1 = fromRect.top + fromRect.height / 2 - boardRect.top;
        const x2 = toRect.left + toRect.width / 2 - boardRect.left;
        const y2 = toRect.top + toRect.height / 2 - boardRect.top;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', 'black');
        line.setAttribute('stroke-width', '2');
        wiresSvg.appendChild(line);
    }
});
