import React from 'react';
import "../styles/Canvas.css";


export default class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.state = {
      hexSize: 35,
      hexOrigin: { x: 800, y: 450 },
      currentHex: { q: 0, r: 0, s: 0, x: 0, y: 0 },
      playerPosition: { q: 0, r: 0, s: 0, x: 0, y: 0 }
    }
  }

  componentWillMount() {
    let hexParametres = this.getHexParametres();
    this.setState({
      canvasSize: { canvasWidth: 1616, canvasHeight: 919 },
      hexParametres: hexParametres
    })
  }

  componentDidMount() {
    const { canvasWidth, canvasHeight } = this.state.canvasSize;
    this.canvasHex.width = canvasWidth;
    this.canvasHex.height = canvasHeight;
    this.canvasCoordinates.width = canvasWidth;
    this.canvasCoordinates.height = canvasHeight;
    this.canvasCharacters.width = canvasWidth;
    this.canvasCharacters.height = canvasHeight;
    this.getCanvasPosition(this.canvasCoordinates);


    let img = new Image();
    //let mg = new Image();
    //let imgPess = new Image();
    //img.src = "battle background/CmBkLava.png";
    //img.src = "battle background/CmBkBch.png";
    img.src = "battle background/CmBkDes.png";
    //mg.src = "pess.png";
    //imgPess.src = "pess.png";
    img.onload = () => { this.drawBackground(img, this.canvasHex); this.drawHexes() };
    //mg.onload = () => { this.drawImage(mg, this.canvasCharacters, this.Point(50, 50))};
    //imgPess.onload = () => { this.drawImage(imgPess, this.canvasCoordinates)};
  }

  drawBackground(img, canvasID) {
    const ctx = canvasID.getContext("2d");
    ctx.drawImage(img, 0, 0, this.canvasHex.width, this.canvasHex.height);
  }
  drawImage(img, canvasID, center) {
    const ctx = canvasID.getContext("2d");
    ctx.clearRect(0, 0,  this.canvasCharacters.width, this.canvasCharacters.height);
    ctx.drawImage(img, center.x, center.y, 100, 150);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.currentHex !== this.state.currentHex) {
      const { q, r, s, x, y } = nextState.currentHex;
      const { canvasWidth, canvasHeight } = this.state.canvasSize;
      const ctx = this.canvasCoordinates.getContext("2d");
      const ctx2 = this.canvasHex.getContext("2d");


      let img = new Image();
      img.src = "pess.png";
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      //this.drawNeighbors(this.Hex(q, r, s));
      let currentDistanceLine = nextState.currentDistanceLine;
      for (let i = 0; i <= currentDistanceLine.length - 2; i++) {
        if (i == 0) {
          this.drawHex(this.canvasCoordinates, this.Point(currentDistanceLine[i].x, currentDistanceLine[i].y), "black", 1, "red");
          img.onload = () => { this.drawImage(img, this.canvasCharacters, this.Point(currentDistanceLine[i].x - 50, currentDistanceLine[i].y - 150))};
        } else {
          this.drawHex(this.canvasCoordinates, this.Point(currentDistanceLine[i].x, currentDistanceLine[i].y), "black", 1, "grey");
        }
      }
      this.drawHex(this.canvasCoordinates, this.Point(x, y), "black", 1, "lime");
      return true;
    }
    return false;
  }

  drawHexes() {
    const { canvasWidth, canvasHeight } = this.state.canvasSize;
    const { hexWidth, hexHeight, vertDist, horizDist } = this.state.hexParametres;
    const hexOrigin = this.state.hexOrigin;
    let qLeftSide = Math.round(hexOrigin.x / horizDist);
    let qRightSide = Math.round((canvasWidth - hexOrigin.x) / horizDist);
    let rTopSide = Math.round(hexOrigin.y / vertDist);
    let rBottomSide = Math.round((canvasHeight - hexOrigin.y) / vertDist);

    var p = 0;
    for (let r = 0; r <= rBottomSide; r++) {
      if (r % 2 == 0 && r !== 0) {
        p++;
      }
      for (let q = -qLeftSide; q <= qRightSide; q++) {
        const { x, y } = this.hexToPixel(this.Hex(q - p, r));
        if ((x > hexWidth / 2 && x < canvasWidth - hexWidth / 2) && (y > hexHeight / 2 && y < canvasHeight - hexHeight / 2)) {
          this.drawHex(this.canvasHex, this.Point(x, y), "black", 1, "grey");
          //this.drawHexCoordinates(this.canvasHex, this.Point(x,y), this.Hex(q-p, r, -(q - p) - r));
        }
      }
    }

    var n = 0;
    for (let r = -1; r >= -rTopSide; r--) {
      if (r % 2 !== 0) {
        n++;
      }
      for (let q = -qLeftSide; q <= qRightSide; q++) {
        const { x, y } = this.hexToPixel(this.Hex(q + n, r));
        if ((x > hexWidth / 2 && x < canvasWidth - hexWidth / 2) && (y > hexHeight / 2 && y < canvasHeight - hexHeight / 2)) {
          this.drawHex(this.canvasHex, this.Point(x, y), "black", 1, "grey");
          //this.drawHexCoordinates(this.canvasHex, this.Point(x,y), this.Hex(q+n, r, - (q + n) - r));
        }
      }
    }
  }

  cubeSubstract(hexA, hexB) {
    return this.Hex(hexA.q - hexB.q, hexA.r - hexB.r, hexA.s - hexB.s);
  }

  getDistanceLine(hexA, hexB) {
    let dist = this.cubeDistance(hexA, hexB);
    var arr = [];
    for (let i = 0; i <= dist; i++) {
      let center = this.hexToPixel(this.cubeRound(this.cubeLinearInt(hexA, hexB, 1.0 / dist * i)));
      arr = [].concat(arr, center);
    }
    this.setState({
      currentDistanceLine: arr
    })
  }

  cubeDistance(hexA, hexB) {
    const { q, r, s } = this.cubeSubstract(hexA, hexB);
    return (Math.abs(q) + Math.abs(r) + Math.abs(s)) / 2;
  }

  cubeLinearInt(hexA, hexB, t) {
    return this.Hex(this.linearInt(hexA.q, hexB.q, t), this.linearInt(hexA.r, hexB.r, t), this.linearInt(hexA.s, hexB.s, t));
  }

  linearInt(a, b, t) {
    return (a + (b - a) * t)
  }

  drawHex(canvasID, center, lineColor, width, fillColor) {
    for (let i = 0; i <= 5; i++) {
      let start = this.getHexCornerCoord(center, i);
      let end = this.getHexCornerCoord(center, i + 1);
      this.fillHex(canvasID, center, fillColor);
      this.drawLine(canvasID, start, end, lineColor, width);
    }
  }

  getHexCornerCoord(center, i) {
    let angle_deg = 60 * i + 30;
    let angle_rad = Math.PI / 180 * angle_deg;
    let x = center.x + this.state.hexSize * Math.cos(angle_rad);
    let y = center.y + this.state.hexSize * Math.sin(angle_rad);
    return this.Point(x, y);
  }

  getHexParametres() {
    let hexHeight = this.state.hexSize * 2;
    let hexWidth = Math.sqrt(3) / 2 * hexHeight;
    let vertDist = hexHeight * 3 / 4;
    let horizDist = hexWidth;
    return { hexWidth, hexHeight, vertDist, horizDist }
  }

  getCanvasPosition(canvasID) {
    let rect = canvasID.getBoundingClientRect();
    this.setState({
      canvasPosition: { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom }
    })
  }

  hexToPixel(h) {
    let hexOrigin = this.state.hexOrigin;
    let x = this.state.hexSize * Math.sqrt(3) * (h.q + h.r / 2) + hexOrigin.x;
    let y = this.state.hexSize * 3 / 2 * h.r + hexOrigin.y;
    return this.Point(x, y)
  }

  pixelToHex(p) {
    let size = this.state.hexSize;
    let origin = this.state.hexOrigin;
    let q = ((p.x - origin.x) * Math.sqrt(3) / 3 - (p.y - origin.y) / 3) / size
    let r = (p.y - origin.y) * 2 / 3 / size
    return this.Hex(q, r, - q - r);
  }

  cubeDirection(direction) {
    const cubeDirections = [this.Hex(1, 0, -1), this.Hex(1, -1, 0), this.Hex(0, -1, 1),
    this.Hex(-1, 0, 1), this.Hex(-1, 1, 0), this.Hex(0, 1, -1)];
    return cubeDirections[direction];
  }

  cubeAdd(a, b) {
    return this.Hex(a.q + b.q, a.r + b.r, a.s + b.s);
  }

  getCubeNeighbor(h, direction) {
    return this.cubeAdd(h, this.cubeDirection(direction));
  }

  fillHex(canvasID, center, fillColor) {
    let c0 = this.getHexCornerCoord(center, 0);
    let c1 = this.getHexCornerCoord(center, 1);
    let c2 = this.getHexCornerCoord(center, 2);
    let c3 = this.getHexCornerCoord(center, 3);
    let c4 = this.getHexCornerCoord(center, 4);
    let c5 = this.getHexCornerCoord(center, 5);
    const ctx = canvasID.getContext("2d");
    ctx.beginPath();
    ctx.fillStyle = fillColor;
    ctx.globalAlpha = 0.1;
    ctx.moveTo(c0.x, c0.y);
    ctx.lineTo(c1.x, c1.y);
    ctx.lineTo(c2.x, c2.y);
    ctx.lineTo(c3.x, c3.y);
    ctx.lineTo(c4.x, c4.y);
    ctx.lineTo(c5.x, c5.y);
    ctx.closePath();
    ctx.fill();
  }

  cubeRound(cube) {
    var rx = Math.round(cube.q)
    var ry = Math.round(cube.r)
    var rz = Math.round(cube.s)

    var x_diff = Math.abs(rx - cube.q)
    var y_diff = Math.abs(ry - cube.r)
    var z_diff = Math.abs(rz - cube.s)

    if (x_diff > y_diff && x_diff > z_diff) {
      rx = -ry - rz;
    } else if (y_diff > z_diff) {
      ry = -rx - rz
    } else {
      rz = -rx - ry
    }
    return this.Hex(rx, ry, rz)
  }


  Point(x, y) {
    return { x: x, y: y }
  }

  Hex(q, r, s) {
    return { q: q, r: r, s: s }
  }

  drawLine(canvasID, start, end, color, width) {
    const ctx = canvasID.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.closePath();
  }

  drawHexCoordinates(canvasID, center, h) {
    const ctx = canvasID.getContext("2d");
    ctx.fillText(h.q, center.x + 6, center.y);
    ctx.fillText(h.r, center.x - 3, center.y + 15);
    ctx.fillText(h.s, center.x - 12, center.y);
  }

  drawNeighbors(h) {
    for (let i = 0; i <= 5; i++) {
      const { q, r, s } = this.getCubeNeighbor(this.Hex(h.q, h.r, h.s), i);
      const { x, y } = this.hexToPixel(this.Hex(q, r, s));
      this.drawHex(this.canvasCoordinates, this.Point(x, y), "red", 2);
    }
  }

  handleMouseMove(e) {
    const { canvasWidth, canvasHeight } = this.state.canvasSize;
    const { hexWidth, hexHeight, vertDist, horizDist } = this.state.hexParametres;
    const { left, right, top, bottom } = this.state.canvasPosition;
    let offsetX = e.pageX - left;
    let offsetY = e.pageY - top;
    const { q, r, s } = this.cubeRound(this.pixelToHex(this.Point(offsetX, offsetY)));
    const { x, y } = this.hexToPixel(this.Hex(q, r, s));
    let playerPosition = this.state.playerPosition;
    this.getDistanceLine(this.Hex(playerPosition.q, playerPosition.r, playerPosition.s), this.Hex(q, r, s));
    if ((x > hexWidth / 2 && x < canvasWidth - hexWidth / 2) && (y > hexHeight / 2 && y < canvasHeight - hexHeight / 2)) {
      this.setState({ currentHex: { q, r, s, x, y } })
    }
  }

  handleClick() {
    this.setState({
      playerPosition: this.state.currentHex
    })
  }

  render() {
    return (
      <div>
        <canvas ref={canvasHex => this.canvasHex = canvasHex}> </canvas>
        <canvas ref={canvasCoordinates => this.canvasCoordinates = canvasCoordinates} onMouseMove={this.handleMouseMove} onClick={this.handleClick}> </canvas>
        <canvas ref={canvasCharacters => this.canvasCharacters = canvasCharacters}onMouseMove={this.handleMouseMove} onClick={this.handleClick}></canvas>
      </div>
    )
  }
}