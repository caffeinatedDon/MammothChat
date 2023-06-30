//load about 10 FAQ into the chat as elements that can be selected to reveal answer or something
//have search functionality at the top which integrates into the other FAQ search stuff
import { outputFAQ } from "./outputFAQ.js"

window.addEventListener('DOMContentLoaded', () => {
    pullFaq();
});

document.getElementById('search-button').addEventListener('click', (e) => {
    e.preventDefault();
    searchFaq();
});

async function pullFaq(){
    const result = await fetch('/faq');
    const jsonData = await result.json();

    displayFaq(jsonData);
}

async function searchFaq(){
    const searchInput = document.getElementById('search-input');
    const inputString = searchInput.value;

    if(inputString == '' || inputString.trim() == ''){
        return;
    }
    searchInput.value = '';

    const result =  await fetch(`/searchfaq`, {
        body: JSON.stringify({value: searchInput})
    });
    const jsonData = await result.json();

    displayFaq(result);
}

function displayFaq(data){
    //todo
    //take json, split it and load <li>Accordion</li>(s)
}