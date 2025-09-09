document.addEventListener('DOMContentLoaded', async() => {
    console.log('DOMContentLoaded');

    var arrayBuffer,uInt8Array,_img,mediaObjHeight,mediaObjWidth;

    const mainWrapper = document.querySelector('#main-wrapper');
    const isCrossOriginIsolated=document.getElementById('isCrossOriginIsolated');
    if(crossOriginIsolated) {
      isCrossOriginIsolated.innerHTML='🟢'; // green
    } else {
      isCrossOriginIsolated.innerHTML='🔴'; // red
    }

    const byteToKBScale = 0.0009765625;
    const acceptedFileTypes = ['.mp4', '.webm', '.avi', '.mpeg', '.flv', '.mov', '.3gp'];

    const fileFormatErr = '⚠ 𝗨𝗽𝗹𝗼𝗮𝗱𝗲𝗱 𝗳𝗶𝗹𝗲 𝘁𝘆𝗽𝗲 𝗶𝘀 𝗻𝗼𝘁 𝘀𝘂𝗽𝗽𝗼𝗿𝘁𝗲𝗱. 𝗟𝗶𝘀𝘁 𝗼𝗳 𝘀𝘂𝗽𝗽𝗼𝗿𝘁𝗲𝗱 𝗳𝗶𝗹𝗲 𝗳𝗼𝗿𝗺𝗮𝘁𝘀 𝗮𝗿𝗲:' + '\n' +
        '◾ .𝗆𝗉𝟦' + '\n' +
        '◾ .𝗐𝖾𝖻𝗆' + '\n' +
        '◾ .𝖺𝗏𝗂' + '\n' +
        '◾ .𝗆𝗉𝖾𝗀' + '\n' +
        '◾ .𝖿𝗅𝗏' + '\n' +
        '◾ .𝗆𝗈𝗏' + '\n' +
        '◾ .𝟥𝗀𝗉' + '\n' +
        '𝘗𝘭𝘦𝘢𝘴𝘦 𝘵𝘳𝘺 𝘢𝘨𝘢𝘪𝘯.';

    const fileSizeErr = '⚠ 𝗨𝗽𝗹𝗼𝗮𝗱𝗲𝗱 𝗳𝗶𝗹𝗲 𝘀𝗵𝗼𝘂𝗹𝗱 𝗻𝗼𝘁 𝗲𝘅𝗰𝗲𝗲𝗱 𝟮𝗚𝗕.' + '\n' +
        '𝘗𝘭𝘦𝘢𝘴𝘦 𝘵𝘳𝘺 𝘢𝘨𝘢𝘪𝘯.';

    const vidDurationErr = '⚠ 𝗩𝗶𝗱𝗲𝗼 𝗹𝗲𝗻𝗴𝘁𝗵 𝘀𝗵𝗼𝘂𝗹𝗱 𝗻𝗼𝘁 𝗲𝘅𝗰𝗲𝗲𝗱 𝟯𝟬 𝘀𝗲𝗰𝗼𝗻𝗱𝘀.' + '\n' +
        '𝘗𝘭𝘦𝘢𝘴𝘦 𝘵𝘳𝘺 𝘢𝘨𝘢𝘪𝘯.';

    // Uint8Array to Base64
    const convertBitArrtoB64 = (bitArr) => (btoa(bitArr.reduce((data, byte) => data + String.fromCharCode(byte), '')));
    // Base64 to Uint8Array
    const convertB64ToBitArr = (b64Str) => (Uint8Array.from(atob((b64Str.includes(';base64,') ? (b64Str.split(','))[1] : b64Str)), (v) => v.charCodeAt(0)));

    const dropFileZone = document.querySelector('#dropFileZone');
    const dropFileInnerZone = dropFileZone.querySelector('.card-body');

    const clearCache = document.querySelector('#clearCache');
    clearCache.addEventListener('click', async() => {
        requestAnimationFrame(async() => {
            localStorage.clear();
            sessionStorage.clear();
            const response =await indexedDB.databases();
            console.log(response);
            for(let obj of response) {
                indexedDB.deleteDatabase(obj.name);
            }

            location.reload();
        });
    });

    const startVidPos = document.querySelector('#startVidPos');
	const endVidPos = document.querySelector('#endVidPos');
	
	const startUseCurrentTime = document.querySelector('.use-current-time[value="startVidPos"]');
	const endUseCurrentTime = document.querySelector('.use-current-time[value="endVidPos"]');

	const gifWidth = document.querySelector('#gifWidth'); // imgW
	const gifHeight = document.querySelector('#gifHeight'); // imgW

	gifWidth.disabled=true;
	gifHeight.disabled=true;

	gifWidth.addEventListener('input', (evt)=> {
		let currentGIFWidth = gifWidth.valueAsNumber;
		let scaleRatio=mediaObjHeight/mediaObjWidth;
		let currentGIFHeight = scaleRatio*currentGIFWidth;
		gifHeight.value=parseInt(currentGIFHeight);
	});
	gifHeight.addEventListener('input', (evt)=> {
		let currentGIFHeight = gifHeight.valueAsNumber;
		let scaleRatio=mediaObjWidth/mediaObjHeight;
		let currentGIFWidth = scaleRatio*currentGIFHeight;
		gifWidth.value=parseInt(currentGIFWidth);
	});

    // const copyrightYearDisplay = document.querySelector('#copyrightYearDisplay');
    // copyrightYearDisplay.innerHTML = new Date().getFullYear();
	startUseCurrentTime.addEventListener('click', (evt)=> {
		let loadedMediaObj = document.querySelector('#loadedMediaObj');
		if(loadedMediaObj) {
			startVidPos.value=loadedMediaObj.currentTime;
		}
	});
	endUseCurrentTime.addEventListener('click', (evt)=> {
		let loadedMediaObj = document.querySelector('#loadedMediaObj');
		if(loadedMediaObj) {
			endVidPos.value=loadedMediaObj.currentTime;
		}
	});

    
    const popoverTargets = document.querySelectorAll('[data-content]');
    Array.from(popoverTargets).map(
        popTarget => new BSN.Popover(popTarget, {
            placement: 'right',
            animation: 'show',
            delay: 100,
            dismissible: true,
            trigger: 'click'
        })
    );

    const elementsTooltip = document.querySelectorAll('[title]');
    Array.from(elementsTooltip).map(
        tip => new BSN.Tooltip(tip, {
            placement: 'top', //string
            animation: 'slideNfade', // CSS class
            delay: 150, // integer
        })
    );

    const tabTargets = document.querySelectorAll('#initTabs .nav-link');
    Array.from(tabTargets).map(
        tab => new BSN.Tab(tab, {
            height: true
        })
    );

    if (!window.FileReader) {
        errorDisplay.innerHTML = '<span class=\'emoji\'>⛔</span> WARNING: Your browser does not support HTML5 \'FileReader\' function required to open a file.';
        return;
    }
    if (!window.Blob) {
        errorDisplay.innerHTML = '<span class=\'emoji\'>⛔</span> WARNING: Your browser does not support HTML5 \'Blob\' function required to save a file.';
        return;
    }

    // IE8
    // IE9+ and other modern browsers
    function triggerEvent(el, type) {
        let e = (('createEvent' in document) ? document.createEvent('HTMLEvents') : document.createEventObject());
        if ('createEvent' in document) {
            e.initEvent(type, false, true);
            el.dispatchEvent(e);
        } else {
            e.eventType = type;
            el.fireEvent('on' + e.eventType, e);
        }
    }

    function htmlToElement(html) {
        let documentFragment = document.createDocumentFragment();
        let template = document.createElement('template');
        template.innerHTML = html.trim();
        for (let i = 0, e = template.content.childNodes.length; i < e; i++) {
            documentFragment.appendChild(template.content.childNodes[i].cloneNode(true));
        }
        return documentFragment;
    }

   	
    const infoModalBtn = document.querySelector('#infoModalBtn');
    const infoModalContent = `<div class="modal-header pb-0 border-0">
                                <h5 class="modal-title"><span class='mr-2 font-weight-bolder symbol text-center'>𝖎</span> About</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
                              </div>
                              <div class="modal-body pt-0 pb-0">
                                <div class="text-center">
                                    <img src='assets/img/logo.png' height='35' />
                                    <p class='lead pb-1'>Convert Video to GIF with FFmepg</p>
                                    <p class='text-custom-one mb-0'><strong>Transcode</strong> video files into animated GIFs using Ffmepg WebAssembly (<a href='https://webassembly.org/' target='_blank'>WASM</a>) which runs entirely in-browser.</p>
                                    <span class='symbol mr-1 font-weight-bold'>⇒</span><mark class='emoji'>🚫 No internet required.</mark>
                                </div>
                                <p class='small secondary mt-1'>Originally inspired by 🎞 📽 <a href="https://ezgif.com/video-to-gif" target="_blank">video to animated GIF converter</a> and an alternative approach to create a video-to-GIF converter (built with <a href="https://www.npmjs.com/package/gif-encoder-2" target="_blank">gif-encoder</a>) can be found at <a href="https://github.com/incubated-geek-cc/video-to-GIF" target="_blank">video-to-GIF</a> (refer to more details <a href='https://geek-cc.medium.com/video-to-gif-conversion-with-client-side-javascript-decoding-fps-for-gif-bf96b8bc4d7c' target='_blank'>here</a>).</p>
                               
                                <hr class="mt-1">
                                <div class="text-left">
                                    <h6><span class='emoji'>🏆</span> Credits & Acknowledgements</h6>
                                    <p>Application uses <cite title="A javascript library to transcode multimedia files in-browser."><a href="https://github.com/ffmpegwasm/ffmpeg.wasm" target="_blank">FFmpeg.Wasm</a></cite> plugin (<a href="LICENSE.txt" target="_blank">MIT licensed</a>) which transcodes multimedia files entirely in-browser. Sample use-cases include <a href="https://github.com/incubated-geek-cc/FFmpegWasmLocalServer" target="_blank">conversion of video/audio clips into other multimedia formats</a> such as <strong>.m4a <span class="symbol">⮂</span> .mp4</strong> (<a href="https://ffmpegwasm.glitch.me/" target="_blank">live demo</a>).</p>
                                </div>
                              </div>
                              <div class="modal-footer text-right">
                                <small><span class='symbol pl-1 pr-1'><a href='https://www.buymeacoffee.com/geekcc' target='_blank'><img src='assets/img/buy_me_a_taco.png' height='26' /></a> </span><a href="https://medium.com/@geek-cc" target="_blank" class="small"><span class="symbol">~ ξ(</span><span class="emoji">🎀</span><span class="symbol">˶❛◡❛) ᵀᴴᴱ ᴿᴵᴮᴮᴼᴺ ᴳᴵᴿᴸ</span></a> 
                                </small> <span class='symbol text-custom-one'>❘</span> <span class='symbol pl-1 pr-1'><a href='https://github.com/incubated-geek-cc/' target='_blank'><span data-profile='github' class='attribution-icon'></span></a>▪<a href='https://medium.com/@geek-cc' target='_blank'><span data-profile='medium' class='attribution-icon'></span></a>▪<a href='https://www.linkedin.com/in/charmaine-chui-15133282/' target='_blank'><span data-profile='linkedin' class='attribution-icon'></span></a>▪<a href='https://twitter.com/IncubatedGeekCC' target='_blank'><span data-profile='twitter' class='attribution-icon'></span></a> </span>
                              </div>`;

    async function showLoadingSignal(modalTitle) {
        let modalHeader = '<div class="modal-header"><h5 class="modal-title">' + modalTitle + '</h5></div>';
        const modalContent = `<div class="modal-body">
                                <div class="row">
                                    <div class="col-sm-12 text-center">
                                        <div class="spinner-border text-muted"></div>
                                        <div class="text-secondary symbol">Loading…</div>
                                    </div>
                                </div>
                              </div>`;

        siteModalInstance.setContent(modalHeader + modalContent);
        await new Promise((resolve, reject) => setTimeout(resolve, 100)); // wait 100 milliseconds
        siteModalInstance.show();
        return await Promise.resolve('Loading');
    }


    const siteModalInstance = new BSN.Modal(
        '#siteModal', {
            content: '',
            backdrop: false,
            keyboard: false
        }
    );
    infoModalBtn.addEventListener('click', async() => {
        siteModalInstance.setContent(infoModalContent);
        await new Promise((resolve, reject) => setTimeout(resolve, 100));
        siteModalInstance.toggle();
    });
    triggerEvent(infoModalBtn, 'click');

    const errorDisplay = document.querySelector('#errorDisplay');
    const mediaWrapper = document.getElementById('mediaWrapper');
    const renderGIFContainer = document.querySelector('#renderGIFContainer');
    
    const runBtn = document.querySelector('#runBtn');
    const saveOutputBtn = document.querySelector('#saveOutputBtn');
    
    const displayedLengthVal=300;
    const loadMedia = (url, type) => new Promise((resolve, reject) => {
        var mediaObj = document.createElement(type);
        mediaObj.addEventListener('canplay', () => resolve(mediaObj));
        mediaObj.addEventListener('error', (err) => reject(err));
        mediaObj.src = url;
    });
    const loadImage = (url) => new Promise((resolve, reject) => {
	  const img = new Image();
	  img.addEventListener('load', () => resolve(img));
	  img.addEventListener('error', (err) => reject(err));
	  img.src = url;
	});
    // =============== QUERY TAB =============================
    function removeAllChildNodes(parent) {
        try {
            while (parent.firstChild) {
                parent.removeChild(parent.firstChild);
            }
        } catch (err) {
            errorDisplay.innerHTML = `<span class='emoji'>⚠</span> ERROR: ${err.message}`;
            console.log(err);
        }
    }

    async function generateGIF(renderGIFEle) {
        try {
            let status = await showLoadingSignal('Rendering GIF');
            console.log(status);

            if(renderGIFEle.children.length > 1) {
            	renderGIFContainer.removeChild(renderGIFContainer.children[0]);
            	renderGIFContainer.removeChild(renderGIFContainer.children[0]);
            }
            errorDisplay.innerHTML = '';
            saveOutputBtn.setAttribute('hidden', '');
            /* TO DO */
            /* LOAD FFMPEG AND PREVIEW GIF */
            let fileName = document.querySelector('#FileName').innerHTML;
            let outputFileExt = '.gif';
            let outputFileMimeType = 'image/gif';
            let outputFileName = fileName.substr(0, fileName.lastIndexOf('.'));

            //appendDataLog('Initialising FFmpeg.');
			const ffmpeg = FFmpeg.createFFmpeg({
				corePath: new URL('js/ffmpeg/ffmpeg-core.js', document.location).href,
				workerPath: new URL('js/ffmpeg/ffmpeg-core.worker.js', document.location).href,
				wasmPath: new URL('js/ffmpeg/ffmpeg-core.wasm', document.location).href,
				log: true
			});
			await ffmpeg.load();
			
			ffmpeg.FS('writeFile', fileName, uInt8Array);

			await ffmpeg.run(
				'-i', 
				fileName, 
				'-s',
				`${gifWidth.valueAsNumber}x${gifHeight.valueAsNumber}`,
				'-ss', // -ss time_off set the start time offset 
				parseFloat(startVidPos.value).toString(),
				'-to', // -to time_stop record or transcode stop time 
				parseFloat(endVidPos.value).toString(), 
				'-f',
				'gif',
				`${outputFileName}${outputFileExt}`
			);

			//appendDataLog('Retrieving output file from virtual files system.');
			const data = ffmpeg.FS('readFile', `${outputFileName}${outputFileExt}`); // Uint8Array 
			let outputFileSize = data.length*byteToKBScale;
			let outputfileSizeInMB=(outputFileSize/1024).toFixed(2);

			let b64Str = convertBitArrtoB64(data);
			let encodedData=`data:${outputFileMimeType};base64,${b64Str}`;
			//appendDataLog('GIF file has been successfully generated.');

			saveOutputBtn.disabled=false;
			saveOutputBtn.value=encodedData;
            saveOutputBtn.removeAttribute('hidden');

			_img = await loadImage(encodedData);
			let imgH=_img.naturalHeight;
		    let imgW=_img.naturalWidth;
		    _img['style']['width']=`${imgW}px`;
		    _img['style']['height']=`${imgH}px`;

		    let gifDuration = (endVidPos.value - startVidPos.value).toFixed(2);
		    let gifDetailsStr = `<p class='col-sm-12 mb-0 mt-0 ml-1 mr-1 p-0 w-100 nowrap custom-scrollbar' style='height: 2.0rem;overflow-x: auto;overflow-y: hidden;'>` + [
				`<span class='emoji'>🖼️</span><span class='nowrap pl-1 pr-1 m-0'><small id='OutputFileName'>${outputFileName}${outputFileExt}</small></span>`,
				`<span class='nowrap pl-1 pr-1 m-0'><small id='OutputFileType'>${outputFileMimeType}</small></span>`,
				`<span class='nowrap pl-1 pr-1 m-0'><small id='OutputFileSize'>${outputfileSizeInMB} <strong class='symbol'>𝙼𝙱</strong></small></span>`,
				`<span class='emoji'>⏳</span><span class='nowrap pl-1 pr-1 m-0'><small id='GIFDuration'>${gifDuration} <strong class='symbol'>𝚜</strong></small></span>`,
				`<span class='emoji'>📐</span><span class='nowrap pl-1 pr-1 m-0'><small id='GIFDim'>${imgW}<span class='unicode'>ᵖˣ</span> × ${imgH}<span class='unicode'>ᵖˣ</span></small></span>`
			].join(' │ ') + `</p>`;
			const gifDetails = htmlToElement(gifDetailsStr);

			renderGIFEle.prepend(gifDetails);
		    renderGIFEle.prepend(_img);

		    ffmpeg.FS('unlink', `${fileName}`);
		    await new Promise((resolve, reject) => setTimeout(resolve, 50));
			ffmpeg.FS('unlink', `${outputFileName}${outputFileExt}`);
			await new Promise((resolve, reject) => setTimeout(resolve, 50));
			ffmpeg.exit();
            
            await new Promise((resolve, reject) => setTimeout(resolve, 100));
            siteModalInstance.hide();
            await new Promise((resolve, reject) => setTimeout(resolve, 100));
            return await Promise.resolve('success');
        } catch (err) {
            errorDisplay.innerHTML = `<span class='emoji'>⚠</span> ERROR: ${err.message}`;
            console.log(err);
        }
    }

    async function renderGIF() {
        try {
            await generateGIF(renderGIFContainer);
            setHeights();
        } catch (err) {
            errorDisplay.innerHTML = `<span class='emoji'>⚠</span> ERROR: ${err.message}`;
            console.log(err);
        }
    }

    function resizeMediaObj() {
    	let loadedMediaObj = document.querySelector('#loadedMediaObj');
    	let mediaWrapper = document.querySelector('#mediaWrapper');

		if(loadedMediaObj && mediaWrapper) {
	    	mediaObjHeight=loadedMediaObj.videoHeight;
			mediaObjWidth=loadedMediaObj.videoWidth;

			mediaObjHeight=loadedMediaObj.videoHeight;
			mediaObjWidth=loadedMediaObj.videoWidth;
			
			const wrapperWidth=mediaWrapper.clientWidth;
			mediaWrapper['style']['width'] = `calc(${wrapperWidth}px - 1rem)`;
			const tempWidth = mediaWrapper.clientWidth;
			mediaWrapper['style']['width'] = '';

			let scaleRatio=parseFloat(displayedLengthVal/mediaObjHeight);
			let displayedHeight=scaleRatio*mediaObjHeight;
			let displayedWidth=scaleRatio*mediaObjWidth;
			if(displayedWidth>tempWidth) {
				scaleRatio=parseFloat(tempWidth/mediaObjWidth);
				displayedHeight=scaleRatio*mediaObjHeight;
				displayedWidth=scaleRatio*mediaObjWidth;
			}
			loadedMediaObj['style']['height']=`${displayedHeight}px`;
			loadedMediaObj['style']['width']=`${displayedWidth}px`;

			let heightDiff=(displayedLengthVal-displayedHeight);
			mediaWrapper['style']['height']=`calc(${displayedLengthVal-heightDiff}px + 3.5rem)`; 

			if(_img) {
			    _img['style']['width']=`${displayedWidth}px`;
			    _img['style']['height']=`${displayedHeight}px`;
		    }
		}
    }

    function setHeights() {
        const mediaWrapper = document.querySelector('#mediaWrapper');
        const errorDisplay = document.querySelector('#errorDisplay');
        resizeMediaObj();

        const innerWrapper=document.querySelector('div.card-body.rounded-0.p-1.h-100');
        let cssHeight = innerWrapper.clientHeight - mediaWrapper.clientHeight - errorDisplay.clientHeight - 8;
        renderGIFContainer['style']['height'] = `calc(${cssHeight}px - 3.5rem - 2.5em)`;
    }

    runBtn.addEventListener('click', async(e) => {
        try {
        	renderGIF();
        } catch (err) {
            errorDisplay.innerHTML = `<span class='emoji'>⚠</span> ERROR: ${err.message}`;
            console.log(err);
        }
    });
	
	// let status = await showLoadingSignal('Exporting data resultset');
    // console.log(status);
	// errorDisplay.innerHTML = `<span class='emoji'>⚠</span> ERROR: ${err.message}`;
   	// console.log(err);
	// await new Promise((resolve, reject) => setTimeout(resolve, 100));
    // siteModalInstance.hide();
    
    function readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            let fileredr = new FileReader();
            fileredr.onload = () => resolve(fileredr.result);
            fileredr.onerror = () => reject(fileredr);
            fileredr.readAsArrayBuffer(file);
        });
    }

    const upload = document.querySelector('#upload');
    upload.addEventListener('click', (ev) => {
        ev.currentTarget.value = '';
    });
    dropFileZone.addEventListener('dragenter', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropFileInnerZone.classList.add('bg-custom-two-05');
    });
    dropFileZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropFileInnerZone.classList.remove('bg-custom-two-05');
    });
    dropFileZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropFileInnerZone.classList.add('bg-custom-two-05');
    });


    async function importDBFile(file) {
        try {
        	let fileName=file.name;
			let fileType=file.type;
			let fileSizeInKB=parseInt(file.size/1024);
			let fileSizeInMB=((file.size/1024)/1024).toFixed(2);

			if(fileSizeInMB>2000) {
				alert(fileSizeErr);
				return;
			}
	        let ext = fileName.substr(fileName.lastIndexOf('.')); 
	        if (!acceptedFileTypes.includes(ext)) {
	            alert(fileFormatErr);
	            return;
	        }
            arrayBuffer = await readFileAsArrayBuffer(file);
            uInt8Array = new Uint8Array(arrayBuffer);
            /* TO DO: Preview Video */
			let b64Str = convertBitArrtoB64(uInt8Array);
			let encodedData=`data:${file.type};base64,${b64Str}`;

			let loadedMediaObj=await loadMedia(encodedData,'video');
			let vidDuration=loadedMediaObj.duration;
			if(vidDuration>=31) { // One way to do this is by assigning a variable, that stores the object, null. 
				arrayBuffer = void 0; // = undefined;
				uInt8Array = void 0; // = undefined;
				alert(vidDurationErr);
				return;
			}

			startVidPos.value = 0.0;
			startVidPos.min = 0.0;
			startVidPos.max= vidDuration;

			endVidPos.value = vidDuration;
			endVidPos.min = 0.0;
			endVidPos.max= vidDuration;

			loadedMediaObj.setAttribute('controls','');
			loadedMediaObj.id='loadedMediaObj';
			await new Promise((resolve, reject) => setTimeout(resolve, 50));
			
			mediaObjHeight=loadedMediaObj.videoHeight;
			mediaObjWidth=loadedMediaObj.videoWidth;

			gifWidth.disabled=false;
			gifHeight.disabled=false;

			gifWidth.value = mediaObjWidth;
			gifWidth.max = mediaObjWidth;

			gifHeight.value = mediaObjHeight;
			gifHeight.max = mediaObjHeight;

			let scaleRatio=parseFloat(displayedLengthVal/mediaObjHeight);
			let displayedHeight=scaleRatio*mediaObjHeight;
			let displayedWidth=scaleRatio*mediaObjWidth;
			loadedMediaObj['style']['height']=`${displayedHeight}px`;
			loadedMediaObj['style']['width']=`${displayedWidth}px`;
			await new Promise((resolve, reject) => setTimeout(resolve, 50));

			let vidDetailsStr = `<p class='col-sm-12 mb-0 mt-0 ml-1 mr-1 p-0 w-100 nowrap custom-scrollbar' style='height: 2.0rem;overflow-x: auto;overflow-y: hidden;'>` + [
				`<span class='emoji'>🎞️</span><span class='nowrap pl-1 pr-1 m-0'><small id='FileName'>${fileName}</small></span>`,
				`<span class='nowrap pl-1 pr-1 m-0'><small id='FileType'>${fileType}</small></span>`,
				`<span class='nowrap pl-1 pr-1 m-0'><small id='FileSize'>${fileSizeInMB} <strong class='symbol'>𝙼𝙱</strong></small></span>`,
				`<span class='emoji'>⏳</span><span class='nowrap pl-1 pr-1 m-0'><small id='VidDuration'>${vidDuration} <strong class='symbol'>𝚜</strong></small></span>`,
				`<span class='emoji'>📐</span><span class='nowrap pl-1 pr-1 m-0'><small id='VidDim'>${mediaObjWidth}<span class='unicode'>ᵖˣ</span> × ${mediaObjHeight}<span class='unicode'>ᵖˣ</span></small></span>`
			].join(' │ ') + `</p>`;
			const vidDetails = htmlToElement(vidDetailsStr);
			
			mediaWrapper.appendChild(loadedMediaObj);
			mediaWrapper.appendChild(vidDetails);
            /* --- */
        } catch (err) {
            errorDisplay.innerHTML = `<span class='emoji'>⚠</span> ERROR: ${err.message}`;
            console.log(err);
        } finally {
            upload.setAttribute('disabled', '');
            upload.classList.add('no-touch');
            upload.classList.add('unselectable');

            dropFileZone.setAttribute('hidden', '');
            mainWrapper.removeAttribute('hidden');

            triggerEvent(window, 'resize');
        }
        return await Promise.resolve('success');
    }

    dropFileZone.addEventListener("drop", async(e) => {
        e.preventDefault();
        e.stopPropagation();
        dropFileInnerZone.classList.remove("bg-custom-two-05");
        upload.value = '';

        let draggedData = e.dataTransfer;
        let file = draggedData.files[0];
        if (!file) return;
		
        await importDBFile(file);
    }); // drop file change event

    upload.addEventListener('change', async(evt) => {
        const file=evt.currentTarget.files[0];
		if (!file) return;
        await importDBFile(file);
    }); // upload file change event

    saveOutputBtn.addEventListener('click', async()=> {
      let dwnlnk = document.createElement('a');

      let fileName = document.querySelector('#FileName').innerHTML;
      let outputFileExt = '.gif';
 
      let saveFilename = fileName.substr(0, fileName.lastIndexOf('.'));
      dwnlnk.download = `${gifWidth.valueAsNumber}x${gifHeight.valueAsNumber}_${saveFilename}${outputFileExt}`;
      dwnlnk.href = `${saveOutputBtn.value}`;
      dwnlnk.click();
    });

    // ================================== Query Editor Tab ===========================
    window.addEventListener('resize', (evt) => {
        setHeights();
    });
    triggerEvent(window, 'resize');

}); // DOMContentLoaded
