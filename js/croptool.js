var imgLayer = document.getElementById('imageLayer');
var imgCtx = imgLayer.getContext('2d');

var drawLayer = document.getElementById('drawLayer');
var drawCtx = drawLayer.getContext('2d');

var gridLayer = document.getElementById('gridLayer');
var gridCtx = gridLayer.getContext('2d');

var magnifyLayer = document.getElementById('magnifyLayer');
var magnifyCtx = magnifyLayer.getContext('2d');

var imgWidth, imgHeight;
var img = new Image();

var RED_COLOR = {R: 255, G:0, B:0, A:255};
var GREEN_COLOR = {R: 0, G:255, B:0, A:255};
var BLUE_COLOR = {R: 0, G:0, B:255, A:255};

var inputBtn = document.getElementById('imageFile');
function showGrid(ctx) {
    for (var i = 0; i < imgWidth; i+=50) {
        drawOnePixelLine({x1:i, y1:0, x2:i, y2: imgHeight}, ctx, BLUE_COLOR);
    }
    for (var i = 0; i < imgHeight; i+=50) {
        drawOnePixelLine({x1:0, y1:i, x2:imgWidth, y2: i}, ctx, BLUE_COLOR);
    }
}

inputBtn.onchange = function readFile() {
    var file = this.files[0];
    if(!/image\/\w+/.test(file.type)){
        alert("请确保文件为图像类型");
        return false;
    }
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function(e){
        img.src = reader.result;
        img.onload = function(){
            imgWidth = img.width;
            imgHeight = img.height;
            setCanvasSize(imgLayer, imgWidth, imgHeight);
            setCanvasSize(drawLayer, imgWidth, imgHeight);
            setCanvasSize(gridLayer, imgWidth, imgHeight);


            imgCtx.drawImage(img, 0, 0, imgWidth, imgHeight);

            magnifySize = (range*2+1)*scale;
            setCanvasSize(magnifyLayer, magnifySize, magnifySize);
        }
    }
}

function setCanvasSize(canvas, canvasWidth, canvasHeight) {
    canvas.setAttribute('width', canvasWidth);
    canvas.setAttribute('height', canvasHeight);
}


var imgCropArray, textCropArray;

var xImgArr = [100, 150, 200, 250, 300, 350];//6
var xTextArr = [100, 150, 250, 300, 350, 400];//6
var yImgArr = [120, 200, 280, 360, 440];//5
var yTextArr = [90, 170, 250, 330, 410];//5
var wTextArr = [30, 30, 20, 20, 20, 50];//6
var textX2 = 500, imgX2 = 500;
var imgH = 30, textH = 20;

// need to change
function generateImageCrop() {
    imgCropArray = [];
    var rect;
    for (var i = 0; i < 5; ++i) {
        for (var j = 0; j < 6; ++j) {
            rect = {x:0, y:0, w:0, h:0};
            rect.x = xImgArr[j];
            rect.y = yImgArr[i];
            rect.w = imgH;
            rect.h = imgH;
            imgCropArray.push({rect: rect, color:RED_COLOR});

            rect = {x:0, y:0, w:0, h:0}
            rect.x = imgX2 + xImgArr[j] - xImgArr[0];
            rect.y = yImgArr[i];
            rect.w = imgH;
            rect.h = imgH;
            imgCropArray.push({rect: rect, color:RED_COLOR});
        }
    }
}

function generateTextCrop() {
    textCropArray = [];
    var rect;
    for (var i = 0; i < 5; ++i) {
        for (var j = 0; j < 6; ++j) {
            rect = {x:0, y:0, w:0, h:0};
            rect.x = xTextArr[j];
            rect.y = yTextArr[i];
            rect.w = wTextArr[j];
            rect.h = textH;
            textCropArray.push({rect: rect, color:GREEN_COLOR});
            rect = {x:0, y:0, w:0, h:0};
            rect.x = textX2 + xTextArr[j] - xTextArr[0];
            rect.y = yTextArr[i];
            rect.w = wTextArr[j];
            rect.h = textH;
            textCropArray.push({rect: rect, color:GREEN_COLOR});
        }
    }
}

function drawCropArray(cropArray) {
    for (var i = cropArray.length-1; i >= 0; --i) {
        drawRect(cropArray[i].rect, cropArray[i].color);
    }
}

function drawRect(rect, color) {
    // TODO 合法性检查

    drawOnePixelLine({x1:rect.x, x2: rect.x+rect.w, y1:rect.y, y2:rect.y}, drawCtx, color);
    drawOnePixelLine({x1:rect.x, x2: rect.x+rect.w, y1:rect.y+rect.h, y2:rect.y+rect.h}, drawCtx, color);
    drawOnePixelLine({x1:rect.x, x2: rect.x, y1:rect.y, y2:rect.y+rect.h}, drawCtx, color);
    drawOnePixelLine({x1:rect.x+rect.w, x2: rect.x+rect.w, y1:rect.y, y2:rect.y+rect.h+1}, drawCtx, color);
}

// 1 pixel line, vertical or horizonal
function drawOnePixelLine(line, context, color) {
    var imageData;
    if (line.x1 == line.x2) {
        imageData = context.getImageData(line.x1, line.y1, 1, Math.abs(line.y2-line.y1));
    } else if (line.y1 == line.y2) {
        imageData = context.getImageData(line.x1, line.y1, Math.abs(line.x2-line.x1), 1);
    } else {
        alert('error');
    }
    var linedata = imageData.data;
    for (var i = 0; i < linedata.length; ++i) {
        linedata[i++] = color.R;
        linedata[i++] = color.G;
        linedata[i++] = color.B;
        linedata[i] = color.A;
    }
    context.putImageData(imageData, line.x1, line.y1);
}


var updateBtn = document.getElementById('update');
updateBtn.onclick = function (event) {
    var result = document.getElementsByName('info');
    text2number(result[0].value.split(','), xTextArr);
    text2number(result[1].value.split(','), yTextArr);
    text2number(result[2].value.split(','), wTextArr);
    text2number(result[3].value.split(','), xImgArr);
    text2number(result[4].value.split(','), yImgArr);
    result = result[5].value.split(',');
    textX2 = parseInt(result[0]);
    imgX2 = parseInt(result[1]);
    imgH = parseInt(result[2]);
    textH = parseInt(result[3]);

    generateImageCrop();
    generateTextCrop();
    drawCtx.clearRect(0, 0, imgWidth, imgHeight);
    drawCropArray(imgCropArray);
    drawCropArray(textCropArray);
}
function text2number(textArr, numberArr) {
    for (var i = 0; i < textArr.length; ++i) {
        numberArr[i] = parseInt(textArr[i]);
    }
}
window.onmousemove = function(event) {
    var loc = getCanvasLoc(event, imgLayer);
    mouseLoc.innerHTML= 'Loc:' + loc.x + '-' + loc.y;
    magnifyImage(loc.x, loc.y, range, scale, imgCtx, drawCtx, magnifyCtx);
}

var scale = 5;
var range = 10;
var magnifySize = (2*range+1)*5;
function magnifyImage(x, y, range, scale, imgCtx, drawCtx, magnifyCtx) {
    var data = imgCtx.getImageData(x-range, y-range, 2*range+1, 2*range+1).data;
    var coverdata = drawCtx.getImageData(x-range, y-range, 2*range+1, 2*range+1).data;

    //TODO 后期优化时这一句可以只执行一次，不必每次执行
    var magnifySize = (2*range+1)*scale;
    var magnifyImageData = magnifyCtx.getImageData(0, 0, magnifySize, magnifySize);

    var magnifyData = magnifyImageData.data;
    var count = 2*range + 1;

    // 根据RGBA的存储格式推倒而来
    for (var i = 0; i < magnifyData.length; i+=4) {
        var tmp1 = parseInt(i/4);
        var tmp2 = parseInt(tmp1/magnifySize);//x坐标
        var tmp3 = tmp1%magnifySize;//y坐标
        var tmp4 = parseInt(tmp2/scale);//x坐标<-原图
        var tmp5 = parseInt(tmp3/scale);//y坐标<-原图

        var target = (tmp4*count + tmp5)*4;
        magnifyData[i] = data[target];
        magnifyData[i+1] = data[target+1];
        magnifyData[i+2] = data[target+2];
        magnifyData[i+3] = data[target+3];
        // TODO 感觉这样做了很多无用判断，不知道后期是否可以优化
        if (255 == coverdata[target+3]) {
            magnifyData[i] = coverdata[target];
            magnifyData[i+1] = coverdata[target+1];
            magnifyData[i+2] = coverdata[target+2];
            magnifyData[i+3] = coverdata[target+3];
        }
        if ((tmp4 == range && Math.abs(tmp5-range)<range/2) || (tmp5 == range && Math.abs(tmp4-range)<range/2)) {
            magnifyData[i] = 0;
            magnifyData[i+1] = 255;
            magnifyData[i+2] = 0;
            magnifyData[i+3] = 255;
        }
    }
    magnifyCtx.putImageData(magnifyImageData, 0,0);
}

// get loction in canvas not window
function getCanvasLoc(event, canvas) {
        var x = event.clientX;
        var y = event.clientY;
        var rect = canvas.getBoundingClientRect();
        x -= rect.left;
        y -= rect.top;
        return {x: x, y: y};
}
var isShowGrid = false;
window.onkeydown = function(event) {
    if (71 == event.keyCode) {
        isShowGrid = !isShowGrid;
        if (isShowGrid) {
            showGrid(gridCtx);
        } else {
            gridCtx.clearRect(0, 0, imgWidth, imgHeight);
        }

    }
    switch (event.keyCode) {
        case 65://a
                range++
                break;
        case 66://b
            scale++;
            break;
        case 77://m
            range--;
            break;
        case 78://n
            scale--;
            break;
    }
    magnifySize = (range*2+1)*scale;
    setCanvasSize(magnifyLayer, magnifySize, magnifySize);
    var loc = getCanvasLoc(event, imgLayer);
    mouseLoc.innerHTML= 'Loc:' + loc.x + '-' + loc.y;
    magnifyImage(loc.x, loc.y, range, scale, imgCtx, drawCtx, magnifyCtx);
}
window.onclick = function (event) {
    var loc = getCanvasLoc(event, imgLayer);
    for (var i = 0; i < imgCropArray.length; ++i) {
        if (inRect(loc, imgCropArray[i].rect)) {
            document.getElementById('rectInfo').innerHTML = JSON.stringify(imgCropArray[i].rect);
            return;
        }
    }
    for (var i = 0; i < textCropArray.length; ++i) {
        if (inRect(loc, textCropArray[i].rect)) {
            document.getElementById('rectInfo').innerHTML = JSON.stringify(textCropArray[i].rect);
            return;
        }
    }
    document.getElementById('rectInfo').innerHTML = "";
}

function inRect(loc, rect) {
    if (loc.x > rect.x && loc.x < rect.x+rect.w && loc.y > rect.y && loc.y < rect.y+rect.h) {
        return rect;
    } else {
        return null;
    }
}
