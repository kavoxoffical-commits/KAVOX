const {kvDetectLang}=require('/home/claude/langdetect.js');
const T={
 German:"Leitete die Logistik für zwei Lagerstandorte und senkte die Versandkosten durch neue Frachtverträge mit mehreren Partnern.",
 Spanish:"Gestioné una cartera de cuentas desde la incorporación hasta la renovación y creé una revisión para detectar riesgos antes.",
 French:"J'ai dirigé une équipe de six personnes et réduit les délais de livraison dans le cadre de projets pour des clients.",
 Portuguese:"Liderei uma equipe de seis pessoas e reduzi o prazo de entrega nos projetos para clientes com mais de cinco anos de experiência.",
 Italian:"Ho guidato un team di sei persone e ridotto i tempi di consegna dei progetti per i clienti con cinque anni di esperienza.",
 Dutch:"Ik leidde een team van zes mensen en verkortte de levertijd van projecten voor klanten met veel ervaring.",
 Swedish:"Jag ledde ett team på sex personer och minskade leveranstiden för projekt åt kunder med fem års erfarenhet.",
 Polish:"Kierowałem zespołem sześciu osób i skróciłem czas realizacji projektów dla klientów z pięcioletnim doświadczeniem.",
 Czech:"Vedl jsem tým šesti lidí a zkrátil dobu realizace projektů pro zákazníky s pětiletými zkušenostmi.",
 Romanian:"Am condus o echipă de șase persoane și am redus timpul de livrare pentru proiecte cu cinci ani de experiență.",
 Turkish:"Altı kişilik bir ekibi yönettim ve beş yıllık deneyimle müşteri projeleri için teslim süresini kısalttım.",
 Indonesian:"Saya memimpin tim yang terdiri dari enam orang dan mengurangi waktu pengiriman proyek untuk pelanggan dengan pengalaman lima tahun.",
 Arabic:"قادت استراتيجية العلامة لستة فنادق", Russian:"Руководила командой из шести специалистов", Chinese:"负责产品路线图", Japanese:"プロダクトマネージャー", Korean:"제품 관리자", Thai:"ผู้จัดการผลิตภัณฑ์", Hindi:"उत्पाद प्रबंधक", Ukrainian:"Керував командою із шести спеціалістів їх",
 Vietnamese:"Quản lý sản phẩm với sáu năm kinh nghiệm",
};
let ok=0,bad=[];
for(const [k,v] of Object.entries(T)){const r=kvDetectLang(v); if(r===k) ok++; else bad.push([k,r]);}
console.log('detected correctly:',ok,'/',Object.keys(T).length,'wrong:',JSON.stringify(bad));
const EN=["Led a team of six developers and reduced delivery time for client projects with five years of experience in the field.","Product manager with six years of experience coordinating cross-functional initiatives in technology and business operations.","John Smith","Senior Software Engineer at Acme Corp responsible for the platform team and its roadmap","Managed a portfolio of accounts and worked with the sales team to improve renewal rates over time"];
console.log('English stays English:',EN.every(x=>kvDetectLang(x)===null), EN.map(x=>kvDetectLang(x)));
