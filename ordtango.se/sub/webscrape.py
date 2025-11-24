import json
from requests_html import HTMLSession

def printProgressBar (iteration, total, prefix = '', suffix = '', decimals = 1, length = 100, fill = '█', printEnd = "\r"):
    percent = ("{0:." + str(decimals) + "f}").format(100 * (iteration / float(total)))
    filledLength = int(length * iteration // total)
    bar = fill * filledLength + '-' * (length - filledLength)
    print(f'\r{prefix} |{bar}| {percent}% {suffix}', end = printEnd)
    if iteration == total: 
        print()

def getWordDef(word):
    session = HTMLSession()
    url = 'https://svenska.se/tre/?sok='+word
    response = session.get(url)
    response.status_code
    response.html.render(sleep=1, keep_page=True, scrolldown=1)
    result = response.html.xpath('//span[@class="def"]')
    if not result:
        return None
    else:
        return str(result[0].text)

def getDefsFromFile():
    with open('formateradeOrd.json', 'r') as f:
        word_list = json.load(f)
    with open('completeRes.json', 'r') as res:
        oldRes = json.load(res)
    startPos = len(oldRes)
    amount = startPos + 200
    for i in range(startPos, amount):
        word = word_list[i]
        definition = getWordDef(word)
        printProgressBar(i + 1 - startPos, amount - startPos, prefix = 'Progress:', suffix = 'Complete', length = 50)
        if definition is not None:
            keyValue = {word: definition}
        else :
            keyValue = {word: "-"}
        with open("completeRes.json", 'r+') as f:
            file_data = json.load(f)
            file_data.update(keyValue)
            f.seek(0)
            json.dump(file_data, f, indent=4)
    
getDefsFromFile()