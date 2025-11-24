<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Document</title>
    <script src="../script.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.4/jquery.min.js"></script>
</head>
<body>
    <h1 id="ans">Gustav</h1>
    <button onclick="testAll()">gatherAPI</button>
</body>
</html>
<script>
    const testAll = async () => {
        const data = await getWordsWithLength();
        for (let i = 0; i < 4; i++){
            const word = data[i];
            let txt = word;
            const ex = await getDef(word)
            txt += " betyder: " + ex;

            console.log(txt);
            
        }
    };
</script>