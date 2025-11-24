let wordLength = 4;
let writtenWord = "";
let startWord = "";
let endWord = "";
let latestWord = "";
let oldLatestWord = "";
let gamingTime = false;
let difficulty = 0;
let differentDifficulties = [7, 10, 30, 100];
let loadCookieOnce = true;
let tid = 0;
const phoneUser = window.innerWidth < 450;
let cheatOn = (new URLSearchParams(window.location.search).get('fusk') ? true : false);

const getWordsWithLength = async () => {
    return fetch("formateradeOrd.json")
        .then(response => response.json())
            .then(dataArr => {
                const words = dataArr.filter(word => word.length === wordLength);
                return words;
            })
    .catch(error => console.error(error));
}
let wordsArrayData = [];

const scriptStart = () => {
    if(loadCookieOnce){
        loadCookieOnce = true;
        loadSessionStorage();
    }
    
    getWordsWithLength().then((res) => {
        wordsArrayData = res;
    });
    
    if(wordsArrayData.length === 0){
        setTimeout(() => {
            scriptStart();
            return;
        }, 1);
    }
    else{
        if(sessionStorage.getItem("isDarkColour") != null){
            const savedState = JSON.parse(sessionStorage.getItem("isDarkColour"));
            const btn = document.getElementById("checkbox")
            if(savedState === true){
                btn.checked = true;
            }
            changeColourTheme();
        }
        loadGameboard();
        const allKeys = document.getElementsByClassName("key");
        Array.from(allKeys).forEach(element => {
            element.addEventListener("click", () => {
                keyAction(element.value)
            });
        });
        window.addEventListener("keydown", (event) => {
            keyAction(event.key);
        });
        //return;
        gameSetup();
    }
}
const keyAction = (key) => {
    let uiKey = null;
    if(key == "Enter" || key == '<i class="fa-solid fa-right-to-bracket"></i>'){
        uiKey = document.getElementById("KEY_ENTER");
        if(writtenWord.length > 0){
            enter();
        }
    }
    else if(key == "Backspace" || key == '<i class="fa-solid fa-delete-left"></i>'){
        uiKey = document.getElementById('KEY_<i class="fa-solid fa-delete-left"></i>');
        if(writtenWord.length > 0){
            writtenWord = writtenWord.slice(0, -1);
            updateGameboard();
        }
    }
    else if(/^[a-öA-Ö]$/.test(key) && writtenWord.length < wordLength){
        uiKey = document.getElementById("KEY_"+key.toUpperCase());
        
        writtenWord += key.toLowerCase();
        updateGameboard();
    }
    if(uiKey != null){
        uiKey.style.outlineColor = "var(--secondary)";
        setTimeout(() => {
            uiKey.style.outlineColor = "transparent";
        }, 100);
    }
}
async function gameSetup() {
    writtenWord = "";
    hideShareBtn();
    for(let i = 0; i < wordLength; i++){
        document.getElementById(idToString(1, i)).innerText = "";
    }
    const intervalID = setInterval(() => {
        for(let i = 0; i < wordLength; i++){
            document.getElementById(idToString(0, i)).innerText = letters[Math.floor(Math.random() * 26)]
            document.getElementById(idToString(2, i)).innerText = letters[Math.floor(Math.random() * 26)]
        }
    }, 30);
    let hittat = false;
    const validateWords = async () => {
        if(window.location.search && new URLSearchParams(window.location.search).get('startWord')){
            // Get the URLSearchParams object for the query string in the URL
            var params = new URLSearchParams(window.location.search);

            // Get the value of the 'startWord' parameter
            startWord = params.get('startWord');
            console.log('startWord: ' + startWord);

            // Get the value of the 'endWord' parameter
            endWord = params.get('endWord');
            console.log('endWord: ' + endWord);

            // Remove the 'startWord' parameter from the URL
            params.delete('startWord');

            // Remove the 'endWord' parameter from the URL
            params.delete('endWord');

            // Build the new URL without any parameters
            var url = window.location.href.split('?')[0];

            // Add the new URL to the browser history
            history.pushState({ path: url }, '', url);
        }  
        else{
            startWord = randomWord();
            endWord = randomWord();
            console.log(startWord);
        }
        while(startWord === endWord){
            endWord = randomWord(wordLength);
        }
        latestWord = startWord;
        oldLatestWord = latestWord;
        return new Promise(resolve => {
            cheatChain().then((res) => {
                if(!res || res.length > differentDifficulties[difficulty] || res.length < ((difficulty == 0) || difficulty == 3? 0 : differentDifficulties[difficulty-1])){
                    hittat = false;
                }
                else{
                    hittat = true;
                    for(let i = 0; i < wordLength; i++){
                        updateGameboardCell(2, i, endWord[i])
                        updateGameboardCell(1, i, "")
                        updateGameboardCell(0, i, startWord[i])
                    }
                }
                resolve();
            });
        });
    }
    while(hittat == false){
        await validateWords()
    }
    gamingTime = true;
    
    clearInterval(intervalID);


    writtenWord = "";
    updateGameboard();
    document.getElementById("whatisword1").innerText = latestWord + "?";
    document.getElementById("whatisword2").innerText = endWord + "?";
    tid = 0;
    timer = setInterval(() => {
        tid++;
    }, 1000);
}


const updateGameboard = () => {
    if(gamingTime){
        for(let i = 0; i < wordLength; i++){
            updateGameboardCell(2, i, endWord[i])
            updateGameboardCell(1, i, "")
            updateGameboardCell(0, i, startWord[i])
        }
    }
    for(let i = 0; i < wordLength; i++){
        if(i >= writtenWord.length){
            updateGameboardCell(1, i, "");
        }
        else{
            updateGameboardCell(1, i, writtenWord[i]);
        }
    }
    for(let i = 0; i < wordLength; i++){
        document.getElementById(idToString(1, i)).style.outlineColor = "var(--primary)";
        if(gamingTime){
            if(latestWord[i] != oldLatestWord[i]){
                updateGameboardCell(0, i, latestWord[i]);
                oldLatestWord = latestWord;
                changeWordTo(document.getElementById(idToString(0, i)), latestWord[i]);
            }
            else{
                updateGameboardCell(0, i, latestWord[i]);
            }
        }
    }
    if(writtenWord.length < wordLength && writtenWord.length >= 0){
        document.getElementById(idToString(1, writtenWord.length)).style.outlineColor = "var(--secondary)";
    }
    if(latestWord === endWord && gamingTime){
        WON();
    }
}
function updateGameboardCell(x, y, val){
    let square = document.getElementById(idToString(x, y));
    square.innerHTML = val;
}
const randomWord = () => {
    return wordsArrayData[Math.floor(Math.random() * wordsArrayData.length)];
}
function idToString(i, j){
    return i+"_"+j;
}
const enter = () => {
    if(gamingTime){
        let success = false;
        if(writtenWord.length == wordLength){
            if(checkIfWordExist(writtenWord)){
                if(isOneCharOff(writtenWord)){
                    //console.log("Okej ord")
                    success = true;
                }
                else{
                    //console.log("Ord finns, men inte en ifrån")
                }
            }
            else{
                //console.log("Ord finns inte")
            }
        }
        if(success){
            colorLetters("var(--green)");
            oldLatestWord = latestWord;
            latestWord = writtenWord;
            setTimeout(() => {
                writtenWord = "";
                updateGameboard();
            }, 300);        
        }
        else{
            colorLetters("var(--red)");
            setTimeout(() => {
                updateGameboard();
            }, 300);        
        }
    }
    else{
        if(writtenWord == "igen"){
            again();
        }
    }
}
const checkIfWordExist = (val) => {
    return wordsArrayData.includes(val);
}
const isOneCharOff = (word) => {
    let similarCharacters = 0;
    for (let i = 0; i < latestWord.length; i++) {
      if (latestWord[i] == word[i]) {
        similarCharacters++;
      }
    }
    return (similarCharacters === wordLength-1);
}
const cheat = async (type) => {
    if(!gamingTime)return;
    if(type === 0){
        words = wordsArrayData;
        word = latestWord;
        for (let i = 0; i < words.length; i++) {
          let count = 0;
          if (words[i].length !== word.length) {
            continue;
          }
          for (let j = 0; j < word.length; j++) {
            if (words[i][j] !== word[j]) {
              count++;
            }
            if (count > 1) {
              break;
            }
          }
          if (count === 1) {
            console.log(words[i]);
            return;
          }
        }
        console.log("hitta inga - SKA INTE HÄNDA");
    }
    else if(type == 1){
        writtenWord = endWord;
        latestWord = writtenWord;
        updateGameboard();
    }
    else if(type == 2){
        const chain = await cheatChain();
        if (chain) {
          console.log(chain.join(' -> '));
        } else {
          console.log(`SKA INTE HÄNDA. No chain found from ${latestWord} to ${endWord}`);
        }        
    }
}
const colorLetters = (colour) => {
    for(let i = 0; i < wordLength; i++){
        document.getElementById(idToString(1, i)).style.outlineColor = colour;
    }
}
const WON = () => {
    gamingTime = false;
    clearInterval(timer);
    displayShareBtn();
    setTimeout(() => {
        let winstring1 = "";
        let winstring2 = "";
        if(wordLength == 4){
            winstring1 = "EGEN";
            winstring2 = "IGEN";
        }
        else if(wordLength == 5){
            winstring1 = "SPILA";
            winstring2 = "SPELA";
        }
        for(let i = 0; i < wordLength; i++){
            changeWordTo(document.getElementById(idToString(0, i)), winstring1[i]);
            changeWordTo(document.getElementById(idToString(2, i)), winstring2[i]);

            updateGameboardCell(1, i, "")
        }
        writtenWord = "";
    }, 1000);
}
const again = () =>{
    merge();
    setTimeout(() => {
        merge();
        gameSetup();
    }, 800);
}
let merged = false;
const merge = () =>{
    merged = !merged;
    document.getElementById("gameboard").style.transform = "scaleX("+ (merged?0:1) +")";
}

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ";

let interval = null;
const changeWordTo = (element, newWord) => {
    let iteration = 0;

    const interval = setInterval(() => {
        element.innerText = letters[Math.floor(Math.random() * 26)]
        if(iteration > 9){
            element.innerText = newWord;
            clearInterval(interval);
        }
        iteration += 1;
    }, 30);
}

const changeColourTheme = () => {
    const btn = document.getElementById("checkbox");
    sessionStorage.setItem("isDarkColour", btn.checked);
    
    
    if(btn.checked){
        setThemeDark();
    }
    else{
        setThemeLight();
    }
}
const setThemeLight = () => {
    const r = document.querySelector(":root");
    r.style.setProperty("--background", "var(--light_background)");
    r.style.setProperty("--heading", "var(--light_heading)");
    r.style.setProperty("--text", "var(--light_text)");
    r.style.setProperty("--primary", "var(--light_primary)");
    r.style.setProperty("--primaryLighter", "var(--light_primaryLighter)");
    r.style.setProperty("--secondary", "var(--light_secondary)");
}
const setThemeDark = () => {
    const r = document.querySelector(":root");
    r.style.setProperty("--background", "var(--dark_background)");
    r.style.setProperty("--heading", "var(--dark_heading)");
    r.style.setProperty("--text", "var(--dark_text)");
    r.style.setProperty("--primary", "var(--dark_primary)");
    r.style.setProperty("--primaryLighter", "var(--dark_primaryLighter)");
    r.style.setProperty("--secondary", "var(--dark_secondary)");
}
function cheatChain() {
    return new Promise((resolve) => {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                if(this.responseText == ""){
                    resolve(null);
                }
                else{
                    let response = this.responseText;
                    let [first, relevant] = response.split(' ');
                    relevant = relevant.substring(1, relevant.length-2);
                    let parsed = JSON.parse(relevant);
                    
                    resolve(parsed);
                }
            }
        };
        xhttp.open("POST", "server.php", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send("latestWord="+latestWord+"&endWord="+endWord+"&wordsArrayData="+JSON.stringify(wordsArrayData)+"&differentDifficulties="+JSON.stringify(differentDifficulties)+"&difficulty="+difficulty+"");
    })
}
let lenToSave = 4;
let difficultyToSave = 0;
const loadSessionStorage = () => {
    Array.from(document.getElementsByClassName("letterAmountRadio")).forEach(element => {
        element.addEventListener("click", () => {
            lenToSave = element.value;
            sessionStorage.setItem("len", lenToSave);
        });
    });

    Array.from(document.getElementsByClassName("difficultyRadio")).forEach(element => {
        element.addEventListener("click", () => {
            difficultyToSave = element.value;
            sessionStorage.setItem("dif", difficultyToSave);
        });
    });

    let correctSession = sessionStorage.getItem("len") && sessionStorage.getItem("dif");
    let p1 = 4, p2 = 0;

    if(!correctSession){
        sessionStorage.setItem("len", 4);
        sessionStorage.setItem("dif", 0);
    }

    p1 = parseInt(sessionStorage.getItem("len"));
    p2 = parseInt(sessionStorage.getItem("dif"));

    lenToSave = p1;
    wordLength = p1;
    difficultyToSave = p2;
    difficulty = p2;

    Array.from(document.getElementsByClassName("letterAmountRadio")).forEach(element => {
        if(element.value == wordLength){
            element.checked = true;
        }
        else{
            element.checked = false;
        }
    });

    Array.from(document.getElementsByClassName("difficultyRadio")).forEach(element => {
        if(element.value == difficulty){
            element.checked = true;
        }
        else{
            element.checked = false;
        }
    });
}

const ledtråd = () => {
    if(!gamingTime)return;
    cheatChain().then(async (chain) => {
          let word = chain[1];
          writtenWord = "";
          for(let j = 0; j < word.length; j++) {
            setTimeout(() => {
                writtenWord += word[j];
                updateGameboard();
            }, 250 * j);
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
          enter();
          await new Promise(resolve => setTimeout(resolve, 1000));
        
        hasPressedGiveUp = false;
    });
}
let hasPressedGiveUp = false;
const geUpp = () => {
    if(!gamingTime || hasPressedGiveUp)return;
    hasPressedGiveUp = true;

    cheatChain().then(async (chain) => {
        for(let i = 1; i < chain.length; i++) {
          let word = chain[i];
          writtenWord = "";
          for(let j = 0; j < word.length; j++) {
            setTimeout(() => {
                writtenWord += word[j];
                updateGameboard();
            }, 250 * j);
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
          enter();
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        hasPressedGiveUp = false;
    });
}
const displayShareBtn = () => {
    document.getElementById("ord1").innerHTML = startWord;
    document.getElementById("ord2").innerHTML = endWord;
    document.getElementById("tid").innerHTML = tid;
    document.getElementById("shareBox").style.opacity = "1";
    document.getElementById("shareBox").style.visibility = "visible";
}
const hideShareBtn = () => {
    document.getElementById("shareBox").style.opacity = "0";
    document.getElementById("shareBox").style.visibility = "hidden";
}
const isiOS = () => {
    return navigator.userAgent.match(/iPhone|iPad|iPod/i);
}
const sendSMS = () => {
    let minUrl = "?startWord=" + startWord + "&endWord=" + endWord;
    if (navigator.share) {
        navigator.share({
            title: 'ORDTANGO',
            text: 'Försök att klå mig i Ordtango! Jag klarade den på: '+tid+"s.",
            url: minUrl,
        })
        .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing', error));
    }
    else{
        console.log("navigator.share is not working");
    }
}

async function getDef(word){
    return fetch("test/wordObjects.json")
        .then(response => response.json())
            .then(dataArr => {
                return dataArr[word];
            })
    .catch(error => console.log(error))
}
/*
const openWordInfoBox = async (ind) => {
    if(ind === 1){
        if(document.getElementById("firstInfoBox").style.opacity == "1"){
            document.getElementById("firstInfoBox").style.opacity = "0";
            document.getElementById("firstInfo").style.left = 0;
            document.getElementById("firstInfo").style.transform = "rotate(0)";
        }
        else{
            document.getElementById("firstInfoBox").style.opacity = "1";
            document.getElementById("firstInfo").style.left = -document.getElementById("firstInfoBox").clientWidth+"px";
            document.getElementById("firstInfo").style.transform = "rotate(-180deg)";
            document.getElementById("startWord").innerHTML = startWord;
            document.getElementById("defStartWord").innerHTML = await getDef("adla");
        }
    }
    else if(ind === 2){
        if(document.getElementById("secondInfoBox").style.opacity == "1"){
            document.getElementById("secondInfoBox").style.opacity = "0";
            document.getElementById("secondInfo").style.right = 0;
            document.getElementById("secondInfo").style.transform = "rotate(0)";
        }
        else{
            document.getElementById("secondInfoBox").style.opacity = "1";
            document.getElementById("secondInfo").style.right = -document.getElementById("secondInfoBox").clientWidth+"px";
            document.getElementById("secondInfo").style.transform = "rotate(-180deg)";
            document.getElementById("endWord").innerHTML = endWord;
            document.getElementById("defEndWord").innerHTML = await getDef(endWord);
        }
    }
}*/

const showDeff = async (ind) => {
    document.getElementById("whatisthiswordpopup").style.display = "flex";
    document.getElementById("actualdefinition").innerText = await getDef((ind == 0 ? latestWord : endWord));
}

const closeHowToPlayPopup = () => {
    document.getElementById("howToPlayPopup").style.top = "0px";
}