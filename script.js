const observer = new MutationObserver(mutationsList => {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
                if (node.classList?.contains('allplay__caption')) {
                    const captionEl = document.querySelector('.allplay__caption');
                    var cleaned = cleanSubtitles(captionEl.innerHTML);
                    captionEl.innerHTML = cleaned;

                    var timeout = cleaned.length * 80;
                    if(timeout < 3000) timeout = 3000;
                    setTimeout(() => removeStuckSubtitles(cleaned), timeout);
                }
            });
        }
    }
});

observer.observe(document.documentElement, {
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
    .filter(line => line && !/^\s*m\s*-?\d+(?:\s+-?\d+)*(?:\s+[a-z]\s*-?\d+(?:\s+-?\d+)*)*\s*$/i.test(line));


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
