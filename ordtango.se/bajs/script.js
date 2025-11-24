
let difficulty = 0;
let differentDifficulties = [7, 10, 30, 100];

const openHowToPlay = () => {
    document.getElementById("topTwo").style.top = "2000px";
}

const closeHowToPlay = () => {
    sessionStorage.setItem("howtoplay", "true");
    document.getElementById("topTwo").style.top = "-2000px";
}

let latestWord = "graf"
let endWord = "utan"

const getWordsWithLength = async () => {
    return fetch("formateradeOrd.json")
        .then(response => response.json())
            .then(dataArr => {
                const words = dataArr.filter(word => word.length === 4);
                return words;
            })
    .catch(error => console.error(error));
}
let wordsArrayData = [];

const LoadStart = async () => {
    //Load how to play cookie popup
    if(sessionStorage.getItem("howtoplay") == "true"){
        closeHowToPlay();
    }
    
    //let words = getTwoWordsThatConnects();
    //setWord(0, words[0]);
    //setWord(2, words[1]);

    getWordsWithLength().then((res) => {
        wordsArrayData = res;
    });
    console.log(await getTwoWordsThatConnects());

}

const setLetter = (x, y, value) => {
    document.getElementById("letter-" + y + "-" + x).innerText = value;
}

const setWord = (row, word) => {
    for(let i = 0; i < 4; i++){
        if(i < word.length){
            setLetter(i, row, word[i]);
        }
        else{
            setLetter(i, row, "");
        }
    }
}

const getTwoWordsThatConnects = () => {
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