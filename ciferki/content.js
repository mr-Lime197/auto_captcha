table = {
  135:0,
  80:1, 40:1,
  114:2, 81:2,
  138:[3,4], 85:3,
  73:4,
  144:5, 92:5,
  95:6,
  84: [7,0], 64:7,
  150:8, 100:8,
  148:[9,6], 86:9
       }

async function filterImage(img){
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  ctx.imageSmoothingEnabled = false;
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  ctx.save();
  ctx.drawImage(img, 0, 0);
  ctx.restore();

  const COLOR_1 = [214, 191, 168]; 
  const COLOR_2 = [246, 243, 240]; 
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for(let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i+1];
    const b = data[i+2];

    if(r === COLOR_1[0] && g === COLOR_1[1] && b === COLOR_1[2]) {
      // Заменяем на черный
      data[i] = 0;
      data[i+1] = 0;
      data[i+2] = 0;
    }

    else if(r === COLOR_2[0] && g === COLOR_2[1] && b === COLOR_2[2]) {

      data[i] = 255;
      data[i+1] = 255;
      data[i+2] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);


  var imgs = [];
  const partWidth = 20; 
  const partHeight = 30;
  const borderSize = 10; 

  for(let j = 0; j < 6; j++) {

    const fragmentCanvas = document.createElement('canvas');
    const fragmentCtx = fragmentCanvas.getContext('2d');
    fragmentCanvas.width = partWidth + borderSize * 2;
    fragmentCanvas.height = partHeight + borderSize * 2;
    fragmentCtx.fillStyle = '#ffffff';
    fragmentCtx.fillRect(0, 0, fragmentCanvas.width, fragmentCanvas.height);

    const sx = j * partWidth;

    fragmentCtx.drawImage(
      canvas,
      sx, 0,     
      partWidth, partHeight,
      borderSize, borderSize, 
      partWidth, partHeight  
    );
    var imgElement2 = new Image();
    imgElement2.src = fragmentCanvas.toDataURL();

    var cnt = 0;
    var imageData2 = fragmentCtx.getImageData(0, 0, fragmentCanvas.width, fragmentCanvas.height);
    var data2 = imageData2.data;
    for(let i = 0; i < data2.length; i += 4) {
      const r = data2[i];
      const g = data2[i+1];
      const b = data2[i+2];
      if(Math.abs(r) <= 5 && 
         Math.abs(g) <= 5 &&
         Math.abs(b) <= 5) {
        cnt+=1;
        }
    }


    imgs.push([imgElement2, table[cnt], cnt]);
  }
  return imgs;
}

async function main(){
  const targetImage = document.getElementsByTagName("img")[0]; 
  await new Promise(resolve => {
    if (targetImage.complete) resolve();
    targetImage.onload = resolve;
  });
  const imgs = await filterImage(targetImage);


  const { createWorker } = Tesseract;
  const worker = await createWorker('eng');
  await worker.setParameters({
    tessedit_char_whitelist: '34790',
    tessedit_pageseg_mode: "10"
  });
  var code = "";
  for(const img of imgs) {
    if (typeof img[1] == "object"){
      await (async () => {
        const { data: { text } } = await worker.recognize(img[0]);
        if (img[2] == 148){
            if (text==""|| text=="6"){
              code+="6";
            }else{
              code += text;
            }
        }else if(img[2] == 84){
          if (text=="" || text=="1" || text=="7"){
              code+="7";
            }else{
              code += text;
            }
        }else{
            if (text==""){
              code+="4";
            }else{
              code += text;
            }
        }
      })();

    }else{
        code = code+img[1];
    }
  }
  document.getElementById("uCрt").value = code;
}

window.addEventListener('load', main)