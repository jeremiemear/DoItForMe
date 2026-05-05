import cheerio from "cheerio";

export async function getGenresFromEveryNoise(artist){

try{
const url = `https://everynoise.com/lookup.cgi?who=${encodeURIComponent(artist)}`;
const response = await fetch(url);
const html = await response.text();
const $ = cheerio.load(html);

let genres = [];

$("a").each((i,el)=>{
const text = $(el).text();
if(text && text.length < 40){
genres.push(text.toLowerCase());
}
});

return genres.slice(0,3);

}catch(e){
return [];
}

}