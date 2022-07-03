import HTMLReactParser from 'html-react-parser'
import badWordsListe from './badWordsListe'
let textCheck = text =>{
    badWordsListe.forEach(badWord => {
        if (text.split(' ').includes(badWord)){
            text = text.replaceAll(badWord,'****')
          }
    })
    let hashed = text.replace(/(^|\s)(#[a-zA-Z0-9\d_]+)/ig, '$1<a href="/hashtags/$2" class="hash-tag">$2</a>').replaceAll('https://','').replaceAll('http://','')
    hashed = hashed.replace(/(^|\s)(#[أ-ي\d_]+)/ig, '$1<a href="/hashtags/$2" class="hash-tag">$2</a>')
    hashed = hashed.replace(/(^|\s)([أ-ي\d_]#+)/ig, '$1<a href="/hashtags/$2" class="hash-tag">$2</a>')
    var urls = hashed.replaceAll(/(^|\s)(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[a-zA-Z]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[a-zA-Z]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[a-zA-Z]{2,}|www\.[a-zA-Z0-9]+\.[a-zA-Z]{2,})/gi, `$1<a href="http://$2" target="_blank" class="hash-tag"> $2</a>`)
    return text === urls ? text : HTMLReactParser(urls)
}
export default textCheck