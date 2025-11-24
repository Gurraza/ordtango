import json

def remove_words_with_non_swedish_letters(word_list):
    allowed_chars = set('abcdefghijklmnopqrstuvwxyzåäö')
    return [word for word in word_list if set(word.lower()) <= allowed_chars and 4 <= len(word) <= 4]

with open('allaSvenskaOrd.json', 'r') as f:
    word_list = json.load(f)

updated_word_list = remove_words_with_non_swedish_letters(word_list)

output_str = ',\n'.join(f'"{word}"' for word in updated_word_list)
output_str = f'[\n{output_str}\n]'

with open('formateradeOrd4.json', 'w') as f:
    f.write(output_str)
