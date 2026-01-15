const captionObserver = new MutationObserver(mutationsList => {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
                if (node.classList?.contains('allplay__caption')) {
                    const captionEl = document.querySelector('.allplay__caption');
                    var cleaned = cleanSubtitles(captionEl.innerHTML);


                    if (captionEl.innerHTML != cleaned) {
                        console.log("Cleaned subs");
                    }

                    captionEl.innerHTML = cleaned;

                    var timeout = cleaned.length * 80;
                    if (timeout < 3000) timeout = 3000;
                    setTimeout(() => removeStuckSubtitles(cleaned), timeout);
                }
            });
        }
    }
});

captionObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true
});

function removeStuckSubtitles(previous) {

    const captionEl = document.querySelector('.allplay__caption');

    const newCaption = cleanSubtitles(captionEl.innerHTML);

    if (!newCaption) return;

    if (newCaption == previous) {
        captionEl.style.display = "none";
        console.log("hid stuck subs");
    }

}

function cleanSubtitles(input) {
    let lines = input
        .split('\n')
        .map(line =>
            line
                .replace(/<(?!\/?b\b)[^>]*>/g, '')
                .replace(/&#x[0-9A-Fa-f]+;/g, '')
                .replace(/\\{1,2}h/g, '')
                .replace(/\{=.+\}/g, '')
                .replace(/<b>\s*m\s*-?\d+(?:\s+-?\d+)*(?:\s+[a-z]\s*-?\d+(?:\s+-?\d+)*)*\s*<\/b>/gi, '')
                .trim()
        )
        .filter(line =>
            line &&
            !/^\s*m\s*-?\d+(?:\.\d+)?[a-z]*/i.test(line)
        );


    // Deduplicate consecutive repeating patterns of any size (3+ repeats only)
    let changed = true;
    while (changed) {
        changed = false;
        for (let size = Math.floor(lines.length / 3); size >= 1; size--) { // only check sizes that can repeat 3+ times
            for (let i = 0; i + size * 3 <= lines.length;) {
                const block1 = lines.slice(i, i + size);
                const block2 = lines.slice(i + size, i + size * 2);
                const block3 = lines.slice(i + size * 2, i + size * 3);

                if (
                    block1.join('\n') === block2.join('\n') &&
                    block1.join('\n') === block3.join('\n')
                ) {
                    // Found 3+ identical consecutive blocks
                    let j = i + size * 3;
                    while (
                        j + size <= lines.length &&
                        lines.slice(j, j + size).join('\n') === block1.join('\n')
                    ) {
                        j += size;
                    }
                    // Keep only one copy
                    lines.splice(i, j - i, ...block1);
                    changed = true;
                } else {
                    i++;
                }
            }
        }
    }


    // Also remove 3+ identical lines in a row (just in case)
    const final = [];
    for (let i = 0; i < lines.length; i++) {
        const current = lines[i];
        const prev1 = lines[i - 1];
        const prev2 = lines[i - 2];
        if (!(current === prev1 && current === prev2)) {
            final.push(current);
        }
    }

    return final.join('\n').trim();
}




function setColorInIframe() {
    const element = document.querySelector('.allplay--video .allplay__progress__buffer');
    if (element) {
        const style = document.createElement('style');
        style.innerHTML = `
      .allplay--video .allplay__progress__buffer {
        color: #00b6ff5e !important;
      }
    `;
        document.head.appendChild(style);


        console.log("Found element, applied custom CSS");
    } else {
        setTimeout(setColorInIframe, 500);
        console.log("Didn't find element, retrying...");
    }
}


function createCheckbox(onByDefault = false) {

    const newCheckbox = document.createElement('input');
    newCheckbox.type = 'checkbox';
    newCheckbox.style.appearance = 'none';
    newCheckbox.style.width = '20px';
    newCheckbox.style.height = '20px';
    newCheckbox.style.borderRadius = '10px';
    newCheckbox.style.background = '#555';
    newCheckbox.style.position = 'relative';
    newCheckbox.style.cursor = 'pointer';
    newCheckbox.style.marginLeft = '5px';
    newCheckbox.style.transition = 'background 0.3s';

    if (onByDefault) {
        newCheckbox.style.background = '#0aaaf1';
        newCheckbox.checked = true;
    }


    return newCheckbox;
}

function createSubControl() {
    const container = document.querySelector('.selects.ui');
    if (container) {

        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.justifyContent = 'space-between';
        wrapper.style.background = '#23282f';
        wrapper.style.borderRadius = '5px';
        wrapper.style.padding = '8px 12px';
        wrapper.style.color = '#fff';
        wrapper.style.fontFamily = 'Verdana';
        wrapper.style.fontWeight = '700';
        wrapper.style.fontSize = '12px';
        wrapper.style.userSelect = 'none';
        wrapper.style.width = 'fit-content';
        wrapper.style.minWidth = '140px';
        wrapper.style.height = '34px';

        const label = document.createElement('span');
        label.textContent = 'Auto Subtitles';

        const label2 = document.createElement('span');
        label2.textContent = 'Auto Skip';
        label2.style.marginLeft = "10px";

        const label3 = document.createElement('span');
        label3.textContent = 'Auto Next';
        label3.style.marginLeft = "10px";

        const autoSubsCheckbox = createCheckbox(false);
        const skipIntroCheckbox = createCheckbox(true);
        const skipEndCheckbox = createCheckbox(false);

        autoSubsCheckbox.addEventListener('change', () => {
            if (autoSubsCheckbox.checked) {
                autoSubsCheckbox.style.background = '#0aaaf1';
                console.log("Auto subtitles ON");
                shouldEnableSubs = true;
            } else {
                autoSubsCheckbox.style.background = '#555';
                console.log("Auto subtitles OFF");
                shouldEnableSubs = false;
            }
        });

        skipIntroCheckbox.addEventListener('change', () => {
            if (skipIntroCheckbox.checked) {
                skipIntroCheckbox.style.background = '#0aaaf1';
                console.log("Auto skip ON");
                shouldSkipStart = true;
            } else {
                skipIntroCheckbox.style.background = '#555';
                console.log("Auto skip OFF");
                shouldSkipStart = false;
            }
        });

        skipEndCheckbox.addEventListener('change', () => {
            if (skipEndCheckbox.checked) {
                skipEndCheckbox.style.background = '#0aaaf1';
                console.log("Auto skip end ON");
                shouldSkipEnd = true;
            } else {
                skipEndCheckbox.style.background = '#555';
                console.log("Auto skip end OFF");
                shouldSkipEnd = false;
            }
        });


        wrapper.appendChild(label);
        wrapper.appendChild(autoSubsCheckbox);
        wrapper.appendChild(label2);
        wrapper.appendChild(skipIntroCheckbox);
        wrapper.appendChild(label3);
        wrapper.appendChild(skipEndCheckbox);

        container.appendChild(wrapper);
    }
    isSubsElemAdded = true;
}




function enableSubs() {

    if (!isSubsElemAdded) {
        createSubControl();
    }

    if (shouldEnableSubs) {
        const captionsButton = document.querySelector('button[type="button"][data-allplay="captions"]');


        if (captionsButton && captionsButton.getAttribute("aria-pressed") !== "true") {



            var text = document.querySelector("div.allplay__controls__item.allplay__time--current.allplay__time").innerText;

            if (text != "00:00" && !captionsButton.hasAttribute('hidden') && getComputedStyle(captionsButton).display !== 'none') {
                captionsButton.click();
                console.log("clicked");
            }
        }
    }

    if (shouldSkipStart) {
        var skiptIntroBtn = document.querySelector('.allplay__skip.allplay__skip--intro');

        if (skiptIntroBtn && !skiptIntroBtn.hasAttribute('hidden')) {
            skiptIntroBtn.click();
        }
    }

    if (shouldSkipEnd) {
        var skipEndBtn = document.querySelector('.allplay__skip.allplay__skip--credits');

        if (skipEndBtn && !skipEndBtn.hasAttribute('hidden')) {
            skipEndBtn.click();
        }
    }

    setTimeout(enableSubs, 500);
}


var isSubsElemAdded = false;
var shouldEnableSubs = false;
var shouldSkipStart = true;
var shouldSkipEnd = false;

console.log('Started script');
setColorInIframe();
enableSubs();


(() => {
    const agoData = {
        m3u8: null,
        token: null,
        origin: location.origin,
        referer: location.href
    };

    /* ===============================
       XHR HOOK → m3u8
    =============================== */

    const origSetHeader = XMLHttpRequest.prototype.setRequestHeader;
    XMLHttpRequest.prototype.setRequestHeader = function (name, value) {
        if (name.toLowerCase() === "authorizations" && value.startsWith("Bearer ")) {
            console.log("XHR Bearer:", value);
            if (!value.includes(" ")) return origSetHeader.apply(this, arguments);
            const token = value.slice(7);
            agoData.token = token;
            updateUI();
        }
        return origSetHeader.apply(this, arguments);
    };

    const OriginalXHR = window.XMLHttpRequest;

    window.XMLHttpRequest = function () {
        const xhr = new OriginalXHR();
        const originalOpen = xhr.open;

        xhr.open = function (method, url, ...rest) {
            if (
                typeof url === 'string' && url.includes('.m3u8') && url.includes('master')) {
                agoData.m3u8 = url;
                console.log('[XHR m3u8]', url);
                updateUI();
            }

            return originalOpen.call(this, method, url, ...rest);
        };

        return xhr;
    };





    /* --------------------
       Track element observer
    -------------------- */
    const trackObserver = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.tagName === 'TRACK') {
                    const src = node.src;
                    if (src) {
                        try {
                            const t = new URL(src).searchParams.get('t');
                            if (t) {
                                agoData.token = t;
                                console.log('[track token]', t);
                            }
                        } catch { }
                    }
                }
            }
        }
    });

    trackObserver.observe(document.body, { childList: true, subtree: true });



    const perfObserver = new PerformanceObserver(list => {
        for (const e of list.getEntries()) {
            const url = e.name;
            if (!url || typeof url !== 'string') continue;

            if (url.includes('.vtt')) {
                try {
                    const u = new URL(url);
                    const t = u.searchParams.get('t');
                    if (t) {
                        agoData.token = t;
                        console.log('[VTT token]', t);
                        updateUI();
                    }
                } catch { }
            }
        }
    });

    perfObserver.observe({ entryTypes: ['resource'] });




    /* ===============================
       BUILD MPV COMMAND
    =============================== */
    function buildMPV() {
        if (!agoData.m3u8 || !agoData.token) return '';

        return `mpvnet.exe --http-header-fields="Origin: ${agoData.origin},Authorizations: Bearer ${agoData.token},Referrer: ${agoData.referer}" ${agoData.m3u8}`;
    }

    /* ===============================
       UI
    =============================== */
    function updateUI() {
        const input = document.getElementById('direct-input');
        if (!input) return;


        var m3 = agoData.m3u8 ? '' : 'M3U8: waiting…\n';
        var tok = agoData.token ? '' : 'Token: waiting…\n';
        var mpv = buildMPV();

        var out = m3 + tok + mpv;

        input.value = out;
    }


    const interval = setInterval(() => {
        const container = document.querySelector('.selects.ui');
        if (!container || container.querySelector('.mpv-wrapper')) return;

        /* Wrapper – same style as your other sub controls */
        const wrapper = document.createElement('div');
        wrapper.className = 'mpv-wrapper';
        Object.assign(wrapper.style, {
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            background: '#23282f',
            borderRadius: '5px',
            padding: '0px 8px',
            color: '#fff',
            maxHeight: "34px",
            fontFamily: 'Verdana',
            fontWeight: '700',
            fontSize: '12px',
            userSelect: 'none',
            width: 'fit-content',
            marginLeft: '10px'
        });

        /* Header row */
        const header = document.createElement('div');
        Object.assign(header.style, {
            display: 'flex',
            alignItems: 'center',
            height: '34px'
        });

        const title = document.createElement('span');
        title.textContent = 'MPV';

        /* Button */
        const btn = document.createElement('button');
        btn.textContent = '↓';
        Object.assign(btn.style, {
            height: '25px',
            padding: '0 10px',
            marginLeft: "5px",
            fontSize: '12px',
            fontFamily: 'Verdana',
            fontWeight: '700',
            background: '#0aaaf1',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
        });

        /* Textarea */
        const input = document.createElement('textarea');
        input.id = 'direct-input';
        input.readOnly = true;

        Object.assign(input.style, {
            width: '100%',
            height: '150px',
            resize: 'none',
            background: '#0d1117',
            color: '#fff',
            border: '1px solid #333',
            borderRadius: '4px',
            padding: '6px',
            fontFamily: 'Consolas, monospace',
            fontSize: '12px',
            display: 'none',
            marginBottom: '10px'
        });

        btn.onclick = () => {
            const visible = input.style.display !== 'none';
            input.style.display = visible ? 'none' : 'block';
            input.style.height = "100px";
            wrapper.style.width = visible ? "auto" : "540px";
            wrapper.style.maxHeight = visible ? "34px" : "540px";
            btn.textContent = visible ? '↓' : '→';
            updateUI();
        };

        header.appendChild(title);
        header.appendChild(btn);

        wrapper.appendChild(header);
        wrapper.appendChild(input);

        container.appendChild(wrapper);
        clearInterval(interval);
    }, 500);
})();


