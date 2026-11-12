/* KAVOX language detection for CV input.
 * Script-based (Arabic, Persian, Urdu, Chinese, Japanese, Korean, Russian, Ukrainian, Thai, Hindi, Vietnamese)
 * plus stop-word scoring for Latin-script languages. Returns null when unsure (caller falls back to English). */
var KV_STOP = {
  English: 'the and of to in for with on at from by as is are was were this that it be have has had not or an led managed built worked team years experience'.split(' '),
  German: 'der die das und ich mit für von bei zu im den dem nicht ein eine auf ist wurde mehr leitete verantwortlich erfahrung jahre jahren durch senkte neue mehreren zwei als auch sich aus nach über'.split(' '),
  Spanish: 'el la los las del y en con para por un una que se su al gestioné creé años experiencia hasta desde riesgos como más entre sobre fue ha he lideré'.split(' '),
  French: 'le la les des du et en pour avec dans un une que qui au aux est années expérience dirigé équipe réduit cadre sur par plus ont été je mon ma mes nous'.split(' '),
  Portuguese: 'o os as do da dos das e em com para por um uma que não anos experiência liderei equipe reduzi mais entre sobre foi tem fui meu minha também prazo'.split(' '),
  Italian: 'il lo gli le di del della e in con per un una che non anni esperienza guidato team ridotto più tra sono stato ho mio mia anche dei delle'.split(' '),
  Dutch: 'de het een en van met voor op in is niet bij ervaring jaren ik leidde mensen verkortte klanten ook zijn naar door over werd heb mijn'.split(' '),
  Swedish: 'och att det en som på är för med av har jag erfarenhet år ledde team minskade kunder åt inom till från mitt också'.split(' '),
  Polish: 'i w z na do nie że się jest oraz doświadczenie lat kierowałem zespołem skróciłem czas dla klientów przez jako moje również który która'.split(' '),
  Czech: 'a v se na je že s z pro do zkušenosti let vedl jsem tým lidí zkrátil dobu projektů zákazníky které který také mé'.split(' '),
  Romanian: 'și în cu de la pe un o pentru care experiență ani am condus echipă redus timpul proiecte din este fost mea sale'.split(' '),
  Turkish: 've bir bu ile için olarak de da deneyim yıl ekibi yönettim kısalttım müşteri projeleri teslim süresini daha çok ben benim'.split(' '),
  Indonesian: 'dan yang di untuk dengan pengalaman tahun saya memimpin tim proyek pelanggan waktu dari ini itu adalah telah juga'.split(' ')
};
var KV_CUES = {
  German: /[ßäöü]/g, Spanish: /[ñ¿¡áéíóú]/g, French: /[èêëàâçœùûîô]/g, Portuguese: /[ãõç]/g, Italian: /[àèìòù]/g,
  Swedish: /[åäö]/g, Polish: /[ąęłńśźż]/g, Czech: /[ěščřžýůď]/g, Romanian: /[ăâîșț]/g, Turkish: /[ıİşğ]/g
};
function kvDetectLang(text) {
  if (!text) return null;
  if (/[\u0600-\u06FF]/.test(text)) {
    if (/[\u067E\u0686\u0698\u06AF]/.test(text)) return 'Persian';
    if (/[\u0679\u0688\u0691\u06BA\u06BE\u06C1\u06CC\u06D2]/.test(text)) return 'Urdu';
    return 'Arabic';
  }
  if (/[\u4E00-\u9FFF\u3400-\u4DBF]/.test(text)) return 'Chinese';
  if (/[\u3040-\u30FF]/.test(text)) return 'Japanese';
  if (/[\uAC00-\uD7AF\u1100-\u11FF]/.test(text)) return 'Korean';
  if (/[\u0400-\u04FF]/.test(text)) { return /[\u0456\u0457\u0454\u0491]/.test(text) ? 'Ukrainian' : 'Russian'; }
  if (/[\u0E00-\u0E7F]/.test(text)) return 'Thai';
  if (/[\u0900-\u097F]/.test(text)) return 'Hindi';
  if (/[\u1EA0-\u1EF9]/.test(text)) return 'Vietnamese';
  // Latin-script languages: need enough text to be sure
  var lower = String(text).toLowerCase();
  var tokens = lower.match(/[\p{L}]+/gu) || [];
  if (tokens.length < 6) return null;
  var scores = {}, name;
  for (name in KV_STOP) {
    var set = {}; KV_STOP[name].forEach(function (w) { set[w] = 1; });
    var sc = 0; tokens.forEach(function (t) { if (set[t]) sc += 1; });
    if (KV_CUES[name]) { var m = lower.match(KV_CUES[name]); if (m) sc += Math.min(m.length, 6) * 0.5; }
    scores[name] = sc;
  }
  var ranked = Object.keys(scores).sort(function (a, b) { return scores[b] - scores[a]; });
  var best = ranked[0], second = ranked[1];
  if (best === 'English') return null;
  if (scores[best] >= 3 && scores[best] - scores[second] >= 1.5) return best;
  return null;
}
if (typeof module !== 'undefined') module.exports = { kvDetectLang: kvDetectLang };
