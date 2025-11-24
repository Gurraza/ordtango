from requests_html import HTMLSession
import json
def getWordDef(word, overrideURL = False):
    session = HTMLSession()
    url = 'https://svenska.se/saol/?sok=' + word
    if overrideURL:
        url = overrideURL
    response = session.get(url)
    response.status_code
    response.html.render(sleep=1, keep_page=True, scrolldown=1)
    result = response.html.find('.article', first=True)
    if result:
        resultText = str(response.html.find(".article", first=True).text)
        return resultText
    else:
        newUrl = 'https://svenska.se' + response.html.find('.slank', first=True).attrs["href"]
        return getWordDef(word, newUrl)
        

word = "få"
item = {word: getWordDef(word)}

with open("test.json", "w", encoding="utf-8") as f:
    json.dump(item, f, indent=4)


def getDefsFromFile(antal):
    with open('../formateradeOrd4.json', 'r') as f:
        word_list = json.load(f)
    with open('wordObjects.json', 'r') as res:
        oldRes = json.load(res)
    startPos = len(oldRes)
    amount = startPos + antal
    for i in range(startPos, amount):
        word = word_list[i]
        definition = getWordDef(word)
        if definition is not None:
            keyValue = {word: definition}
        else :
            keyValue = {word: "-"}
        with open("wordObjects.json", 'r+') as f:
            file_data = json.load(f)
            file_data.update(keyValue)
            f.seek(0)
            json.dump(file_data, f, indent=4)
    
getDefsFromFile(10)