const {kvDetectLang}=require('/home/claude/langdetect.js');
const EN=[
 "Maria Garcia Project Manager at Banco de España managed the budget for the Barcelona office and led a team of ten engineers",
 "Jean-Pierre Dubois Operations Manager at Société Générale responsible for the Paris and Lyon branches with a team of 20",
 "Hans Müller Senior Developer at Siemens built the internal platform used by the engineering teams across Munich and Berlin",
 "Software engineer with experience in Python and TypeScript. Built APIs for payments. Education: BSc in Computer Science from the University of Toronto.",
 "Sales manager. Achievements: increased revenue, trained new hires, opened two regional offices. Industry: SaaS. Education: MBA from Kellogg School of Management"
];
console.log(EN.map(x=>kvDetectLang(x)));
// mixed: German form where only achievements are long
console.log(kvDetectLang("Anna Schmidt Projektleiterin Logistik Ich habe ein Team von zehn Mitarbeitern geleitet und die Lieferzeiten um dreißig Prozent gesenkt Studium Betriebswirtschaft Universität Hamburg"));
console.log(kvDetectLang("Carlos Ruiz Ingeniero Gestioné un equipo de diez personas y reduje los plazos de entrega en proyectos de construcción en Madrid Educación Ingeniería Civil"));
