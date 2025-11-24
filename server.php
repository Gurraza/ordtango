<?php
    returnChain();
    function returnChain() {
        $startWord = $_POST['latestWord'];
        $endWord = $_POST['endWord'];
        $allWordsArray = json_decode($_POST['wordsArrayData']);
        $differentDifficulties = json_decode($_POST['differentDifficulties']);
        $difficulty = intval($_POST['difficulty']);
        // Initialize a queue to hold the words to be visited
        $queue = array();
        // Enqueue the starting word
        array_push($queue, array($startWord, array($startWord)));
        
        // Loop until the queue is empty
        while (!empty($queue)) {
          // Dequeue the first element from the queue
          $word = array_shift($queue);
          // Get the last word in the current chain
          $currentWord = end($word[1]);
      
          // Check if the current word is the end word
          if ($currentWord === $endWord) {
            // Return the chain
            $response = $word[1];
            var_dump(json_encode($response));
            return json_encode($response);
          }
          
          // Loop through all the words in the allWordsArray
          foreach ($allWordsArray as $w) {
            // Check if the word is only one letter different from the current word
            if (levenshtein($currentWord, $w) === 1) {
                if(count($word[1]) > $differentDifficulties[$difficulty]){
                    return json_encode(null);
                }
                // Create a new chain with the current word and the new word
                $newChain = $word[1];
                array_push($newChain, $w);
                // Enqueue the new chain
                array_push($queue, array($w, $newChain));
                // Remove the word from the allWordsArray to prevent revisiting it
                $key = array_search($w, $allWordsArray);
                unset($allWordsArray[$key]);
            }
          }
        }
      
        // If we reach this point, it means there is no chain between the start and end words
        return json_encode(null);
    }
      
?>
