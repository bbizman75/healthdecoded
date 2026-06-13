import { useState, useMemo, useEffect } from "react";

const ANTHROPIC_MODEL = "claude-sonnet-4-6";
const SECTIONS = ["Profile","Symptoms","Vitals","Blood Tests","Medications","Timeline","Report"];
const TABS = ["🔬 Lab Results","🩺 Consultation","💊 Supplements"];
const BRAND = { name:"HealthDecoded", tagline:"Your health, finally explained.", url:"healthdecoded.com" };

// ── Multilanguage framework ───────────────────────────────────────────────
const TRANSLATIONS = {
  EN: {
    // Nav
    labResults: "Lab Results",
    consultation: "Consultation",
    supplements: "Supplements",
    // Header
    tagline: "Your health, finally explained.",
    subtitle: "AI-powered health analysis — education, not diagnosis",
    // Tab descriptions
    tab1Pitch: "Got your blood test back? Don't just file it away.",
    tab1Desc: "We read every single marker — what it means, what's optimal (not just \"normal\"), what you should eat, which OTC supplement to take, and exactly when to retest. The detailed analysis your doctor didn't have time to give you. Ready in 60 seconds.",
    tab1Tag: "Most popular",
    tab1Includes: ["Every biomarker explained in full","Optimal vs reference range — the real difference","Specific OTC & diet actions per finding","7-day meal plan targeted to your deficiencies","Retest roadmap — when and what to recheck","PDF report to keep and share"],
    tab2Pitch: "Something feels wrong but nobody's connecting the dots.",
    tab2Desc: "Tell us your symptoms, medications, allergies, and health history. Upload your blood tests if you have them. We cross-reference everything — patterns that would take 3 appointments to uncover — and give you a complete action plan with urgency scoring, OTC guidance checked against your allergies and drugs, and the exact questions to bring to your next appointment.",
    tab2Tag: "Most complete",
    tab2Includes: ["Urgency score 1–5 — know when to act NOW","OTC guidance with allergy & drug interaction check","Symptoms + blood tests + timeline — all cross-referenced","Specific action cards: medicine, diet, lifestyle, doctor","Questions pre-written for your pharmacist and doctor","Personalised supplement recommendations"],
    tab3Pitch: "Before you waste money on the wrong supplements.",
    tab3Desc: "Most people take what they see advertised. We show you what actually matters for your age, your sex, and your specific health goal — with the clinical evidence behind each one, the correct dose, and where to get it. No upselling. No brand deals. Just what works.",
    tab3Tag: "Always free",
    tab3Includes: ["Personalised by age group and sex","Filtered by goal: diet, weight loss, diabetes, stress","Clinical evidence behind every recommendation","Exact doses — not vague ranges","Direct links to buy at the right price","Always free — no payment required"],
    startFor: "Start for",
    browseGuide: "Browse the guide below →",
    // Hero
    heroTitle1: "You got your blood tests done.",
    heroTitle2: "Now find out what they really mean.",
    heroSub1: "Your doctor had 8 minutes. They checked the flagged values, said",
    heroSub2: "and moved on.",
    heroSub3: "We have time. We go deeper. Because this is your life.",
    heroHeart: "Your health is not a checkbox. It deserves a real explanation.",
    heroHeartText: "Every number in your blood test is a signal from your body. Some signals are quiet warnings that arrive years before a real problem. Others confirm you're on the right track. None of them should go unexplained — because",
    heroHeartBold: "the earlier you understand what's happening inside, the more you can do about it.",
    hero247Title: "Available 24 hours a day, 7 days a week",
    hero247Text: "Got your results at 11pm on a Sunday? Worried and can't sleep? We're here. No appointment. No waiting room. No €50 consultation fee. Instant analysis, any time, anywhere in the world.",
    heroReceive: "What you receive with every report:",
    heroNuanceTitle: "What your doctor knows but doesn't have time to explain",
    heroNuance: "A TSH of 3.5 is \"within range\" — but optimal thyroid function sits between 1.0 and 2.0. A ferritin of 18 is \"not anaemic\" — but fatigue, hair loss, and poor concentration typically start below 30. Your LDL is \"normal\" — but LDL particle size matters more than the number. Your Vitamin D is \"fine\" — but immune strength, mood, and bone protection require levels above 75 nmol/L, not just above 30.",
    heroNuanceBold: "These nuances are the difference between feeling okay and feeling well. We explain every one.",
    disclaimer: "Educational analysis only · Not a medical diagnosis · Always discuss results with your healthcare professional",
    // Upload
    uploadTitle: "Lab Results Interpreter",
    uploadSubtitle: "Upload your blood test report — every biomarker explained in plain language with full context.",
    uploadPDF: "Upload PDF",
    uploadPDFSub: "From your lab or doctor",
    takePhoto: "Take a Photo",
    takePhotoSub: "Photo of your paper results",
    dropHere: "Drop file here or click to browse",
    dropSub: "PDF, JPG, or PNG · Any lab worldwide",
    privacyNote: "Privacy: Your file goes directly to Claude AI for analysis. It is not stored on any server.",
    analyseBtn: "Analyse My Blood Test Report",
    uploadDifferent: "Upload a different file",
    readyToAnalyse: "Ready to analyse — Claude will extract all biomarker values",
    // Calendar
    calendarTitle: "What blood tests should you get — and when?",
    calendarSub: "Select your age group and sex for a personalised testing calendar.",
    ageGroup: "Age group",
    sex: "Sex",
    male: "Male",
    female: "Female",
    franceNote: "In France: Most of these tests can be requested directly at any laboratory without a GP referral. A full panel typically costs €30–80. Results are usually ready within 24–48 hours.",
    haveResults: "I have my results — upload now →",
    // Payment gate
    reportReady: "Your report is ready to generate",
    reportReadySub: "We have everything we need. Here's a preview of what we found.",
    previewTitle: "Preview — What we found",
    previewLocked: "Full report unlocked after payment",
    weWillAnalyse: "We'll analyse:",
    yourReportIncludes: "Your report includes:",
    whereToSend: "Where should we send your report?",
    emailPlaceholder: "your@email.com",
    emailNote: "Your full report PDF will be sent here immediately after payment.",
    payBtn: "Pay",
    andGetReport: "and get my full report",
    securePayment: "Secure payment via Mollie",
    goBack: "← Go back and edit my data",
    // Payment return
    paymentConfirmed: "Payment confirmed!",
    reportSentTo: "Your full report is being generated and will be sent to:",
    checkInbox: "Check your inbox in the next few minutes. Don't forget to check your spam folder.",
    paymentProcessing: "Payment processing...",
    reportPending: "Your report will be sent once confirmed.",
    paymentFailed: "Payment",
    noCharge: "No charge was made. Please try again.",
    tryAgain: "Try again",
    // Footer
    footerNote: "AI-generated educational content only · Not a medical device · Always consult a qualified healthcare professional",
  },
  FR: {
    // Nav
    labResults: "Bilan Sanguin",
    consultation: "Consultation",
    supplements: "Compléments",
    // Header
    tagline: "Votre santé, enfin expliquée.",
    subtitle: "Analyse de santé par IA — éducation, pas diagnostic",
    // Tab descriptions
    tab1Pitch: "Vous avez vos résultats d'analyses ? Ne les rangez pas dans un tiroir.",
    tab1Desc: "Nous lisons chaque marqueur — ce qu'il signifie, ce qui est optimal (pas juste \"normal\"), ce que vous devriez manger, quel complément prendre, et exactement quand refaire vos analyses. L'analyse détaillée que votre médecin n'a pas eu le temps de vous donner. Prêt en 60 secondes.",
    tab1Tag: "Le plus populaire",
    tab1Includes: ["Chaque biomarqueur expliqué en détail","Valeur optimale vs valeur de référence — la vraie différence","Actions OTC et diète spécifiques par résultat","Plan alimentaire 7 jours ciblé sur vos carences","Calendrier de retest — quand et quoi refaire","Rapport PDF à conserver et partager"],
    tab2Pitch: "Quelque chose ne va pas mais personne ne fait le lien.",
    tab2Desc: "Dites-nous vos symptômes, médicaments, allergies et antécédents. Importez vos analyses si vous en avez. Nous croisons tout — des patterns qui nécessiteraient 3 consultations — et vous donnons un plan d'action complet avec score d'urgence, conseils OTC vérifiés contre vos allergies et traitements, et les questions exactes à poser à votre prochain rendez-vous.",
    tab2Tag: "Le plus complet",
    tab2Includes: ["Score d'urgence 1–5 — savoir quand agir MAINTENANT","Conseils OTC avec vérification allergies et interactions","Symptômes + analyses + timeline — tout croisé","Fiches d'action : médicament, alimentation, style de vie, médecin","Questions pré-rédigées pour votre pharmacien et médecin","Recommandations de compléments personnalisées"],
    tab3Pitch: "Avant de dépenser de l'argent sur les mauvais compléments.",
    tab3Desc: "La plupart des gens prennent ce qu'ils voient en publicité. Nous vous montrons ce qui compte vraiment pour votre âge, votre sexe et votre objectif de santé — avec les preuves cliniques, la dose correcte, et où l'acheter. Pas de vente forcée. Pas de partenariats. Juste ce qui fonctionne.",
    tab3Tag: "Toujours gratuit",
    tab3Includes: ["Personnalisé par tranche d'âge et sexe","Filtré par objectif : régime, perte de poids, diabète, stress","Preuves cliniques derrière chaque recommandation","Doses exactes — pas de fourchettes vagues","Liens directs pour acheter au bon prix","Toujours gratuit — aucun paiement requis"],
    startFor: "Commencer pour",
    browseGuide: "Parcourir le guide ci-dessous →",
    // Hero
    heroTitle1: "Vous avez fait votre bilan sanguin.",
    heroTitle2: "Découvrez ce qu'il signifie vraiment.",
    heroSub1: "Votre médecin avait 8 minutes. Il a vérifié les valeurs signalées, dit",
    heroSub2: "et est passé à la suite.",
    heroSub3: "Nous avons le temps. Nous allons plus loin. Parce que c'est votre vie.",
    heroHeart: "Votre santé n'est pas une case à cocher. Elle mérite une vraie explication.",
    heroHeartText: "Chaque chiffre de votre bilan est un signal de votre corps. Certains signaux sont des avertissements silencieux qui arrivent des années avant un vrai problème. D'autres confirment que vous êtes sur la bonne voie. Aucun ne devrait rester inexpliqué — parce que",
    heroHeartBold: "plus tôt vous comprenez ce qui se passe en vous, plus vous pouvez agir.",
    hero247Title: "Disponible 24h/24, 7j/7",
    hero247Text: "Vos résultats sont arrivés à 23h un dimanche ? Inquiet et vous ne dormez pas ? Nous sommes là. Pas de rendez-vous. Pas de salle d'attente. Pas de consultation à 50€. Analyse instantanée, à tout moment, partout dans le monde.",
    heroReceive: "Ce que vous recevez avec chaque rapport :",
    heroNuanceTitle: "Ce que votre médecin sait mais n'a pas le temps d'expliquer",
    heroNuance: "Une TSH à 3,5 est \"dans la norme\" — mais une thyroïde optimale fonctionne entre 1,0 et 2,0. Une ferritine à 18 n'est \"pas anémique\" — mais la fatigue, la chute de cheveux et les troubles de concentration commencent généralement en dessous de 30. Votre LDL est \"normal\" — mais la taille des particules LDL compte plus que le chiffre. Votre Vitamine D est \"correcte\" — mais l'immunité, l'humeur et la protection osseuse nécessitent un taux supérieur à 75 nmol/L.",
    heroNuanceBold: "Ces nuances font la différence entre se sentir passable et se sentir bien. Nous les expliquons toutes.",
    disclaimer: "Analyse éducative uniquement · Pas un diagnostic médical · Consultez toujours un professionnel de santé",
    // Upload
    uploadTitle: "Interpréteur de Bilan Sanguin",
    uploadSubtitle: "Importez votre bilan — chaque marqueur expliqué en langage clair avec son contexte complet.",
    uploadPDF: "Importer un PDF",
    uploadPDFSub: "Depuis votre laboratoire ou médecin",
    takePhoto: "Prendre une photo",
    takePhotoSub: "Photo de vos résultats papier",
    dropHere: "Déposez le fichier ici ou cliquez pour parcourir",
    dropSub: "PDF, JPG ou PNG · Tout laboratoire mondial",
    privacyNote: "Confidentialité : Votre fichier est envoyé directement à Claude IA pour analyse. Il n'est stocké sur aucun serveur.",
    analyseBtn: "Analyser mon bilan sanguin",
    uploadDifferent: "Importer un autre fichier",
    readyToAnalyse: "Prêt à analyser — Claude extraira toutes les valeurs",
    // Calendar
    calendarTitle: "Quels bilans faire — et quand ?",
    calendarSub: "Sélectionnez votre tranche d'âge et votre sexe pour un calendrier personnalisé.",
    ageGroup: "Tranche d'âge",
    sex: "Sexe",
    male: "Homme",
    female: "Femme",
    franceNote: "En France : La plupart de ces analyses peuvent être prescrites directement en laboratoire sans ordonnance. Un bilan complet coûte généralement 30–80€. Les résultats sont disponibles sous 24–48h.",
    haveResults: "J'ai mes résultats — importer maintenant →",
    // Payment gate
    reportReady: "Votre rapport est prêt à être généré",
    reportReadySub: "Nous avons tout ce qu'il nous faut. Voici un aperçu de ce que nous avons trouvé.",
    previewTitle: "Aperçu — Ce que nous avons trouvé",
    previewLocked: "Rapport complet débloqué après paiement",
    weWillAnalyse: "Nous analyserons :",
    yourReportIncludes: "Votre rapport comprend :",
    whereToSend: "Où envoyer votre rapport ?",
    emailPlaceholder: "votre@email.com",
    emailNote: "Votre rapport PDF complet sera envoyé ici immédiatement après le paiement.",
    payBtn: "Payer",
    andGetReport: "et recevoir mon rapport complet",
    securePayment: "Paiement sécurisé via Mollie",
    goBack: "← Revenir et modifier mes données",
    // Payment return
    paymentConfirmed: "Paiement confirmé !",
    reportSentTo: "Votre rapport complet est en cours de génération et sera envoyé à :",
    checkInbox: "Vérifiez votre boîte de réception dans quelques minutes. N'oubliez pas de vérifier vos spams.",
    paymentProcessing: "Paiement en cours...",
    reportPending: "Votre rapport sera envoyé une fois confirmé.",
    paymentFailed: "Paiement",
    noCharge: "Aucun prélèvement effectué. Veuillez réessayer.",
    tryAgain: "Réessayer",
    // Footer
    footerNote: "Contenu éducatif généré par IA uniquement · Pas un dispositif médical · Consultez toujours un professionnel de santé qualifié",
  }
};

// Helper — get translation
const t = (lang, key) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.EN[key] ?? key;

const SYMPTOM_CATEGORIES = [
  { label:"🧠 Neurological & Mental", color:"#7c3aed", bg:"#f5f3ff",
    symptoms:["Headaches","Dizziness","Vertigo","Memory loss / Brain fog","Vision problems","Tingling / Numbness","Anxiety","Low mood / Depression","Difficulty concentrating"] },
  { label:"😴 Energy & Sleep", color:"#0369a1", bg:"#f0f9ff",
    symptoms:["Fatigue","Poor sleep","Excessive daytime sleepiness","Waking at night"] },
  { label:"🫁 Respiratory & Cardiac", color:"#dc2626", bg:"#fff1f2",
    symptoms:["Shortness of breath","Coughing","Chest tightness","Palpitations","Rapid heartbeat"] },
  { label:"🍽️ Digestive", color:"#16a34a", bg:"#f0fdf4",
    symptoms:["Nausea","Vomiting","Diarrhoea","Constipation","Bloating / Digestive issues","Acid reflux","Loss of appetite"] },
  { label:"⚖️ Weight & Metabolism", color:"#ea580c", bg:"#fff7ed",
    symptoms:["Weight gain","Weight loss","Excessive thirst","Frequent urination","Cold intolerance","Heat intolerance","Increased sweating"] },
  { label:"💪 Musculoskeletal", color:"#ca8a04", bg:"#fefce8",
    symptoms:["Joint pain","Muscle weakness","Muscle cramps","Back pain","Stiffness"] },
  { label:"🪞 Skin, Hair & Other", color:"#64748b", bg:"#f8fafc",
    symptoms:["Hair loss","Dry skin","Rashes / Itching","Nail changes","Swollen lymph nodes","Frequent infections"] }
];

const BLOOD_TESTS = [
  {key:"glucose",label:"Glucose"},{key:"hba1c",label:"HbA1c (%)"},
  {key:"cholTotal",label:"Total Cholesterol"},{key:"ldl",label:"LDL"},{key:"hdl",label:"HDL"},
  {key:"tsh",label:"TSH"},{key:"freeT4",label:"Free T4"},{key:"vitaminD",label:"Vitamin D"},
  {key:"ferritin",label:"Ferritin"},{key:"crp",label:"CRP"},{key:"testosterone",label:"Testosterone"},{key:"b12",label:"Vitamin B12"}
];

const DUR = ["3 days or less","1–2 weeks","1–3 months","3–12 months","Over 1 year"];
const SEV = ["Mild","Moderate","Severe"];
const TRN = ["Improving","Stable","Worsening"];

// ── Goals ─────────────────────────────────────────────────────────────
const GOALS = [
  { id:"all",           label:"All",                  emoji:"📋" },
  { id:"diet",          label:"Poor / unbalanced diet", emoji:"🥗" },
  { id:"weight",        label:"Weight loss",           emoji:"⚖️" },
  { id:"diabetes",      label:"Prevent diabetes",      emoji:"🩺" },
  { id:"stress",        label:"Stress & burnout",      emoji:"😤" },
];

// ── Supplement database ───────────────────────────────────────────────
// goals: which focus areas this supplement is relevant for
const SUPP_DB = [
  // Universal (all ages, all sexes)
  { name:"Vitamin D3 + K2", emoji:"☀️", priority:"Essential",
    ageScope:["18–30","30–50","50–65","65+"], sexScope:["Male","Female"],
    goals:["diet","weight","diabetes","stress"],
    why:"80%+ of people are deficient. Critical for immunity, bone density, mood, and hormone production. K2 directs calcium into bones not arteries.",
    dose:"2,000–4,000 IU D3 + 100mcg K2 daily", link:"https://www.iherb.com/c/vitamin-d" },
  { name:"Magnesium Glycinate", emoji:"🧘", priority:"Essential",
    ageScope:["18–30","30–50","50–65","65+"], sexScope:["Male","Female"],
    goals:["diet","weight","diabetes","stress"],
    why:"Used in 300+ body processes. Most people are deficient. Improves sleep, reduces anxiety, supports muscle recovery and blood sugar.",
    dose:"300–400mg glycinate form before bed", link:"https://www.iherb.com/c/magnesium" },
  { name:"Omega-3 (EPA/DHA)", emoji:"🐟", priority:"Essential",
    ageScope:["18–30","30–50","50–65","65+"], sexScope:["Male","Female"],
    goals:["diet","weight","diabetes","stress"],
    why:"Most diets are severely omega-3 deficient. Reduces inflammation, supports heart, brain, joints, and mood.",
    dose:"1,000–2,000mg EPA+DHA daily with food", link:"https://www.iherb.com/c/fish-oil-omega-3" },
  { name:"Zinc", emoji:"🛡️", priority:"Recommended",
    ageScope:["18–30","30–50","50–65","65+"], sexScope:["Male","Female"],
    goals:["diet","stress"],
    why:"Key for immunity, wound healing, skin and hormone health. Depleted by stress and poor diet.",
    dose:"15–25mg zinc picolinate with food", link:"https://www.iherb.com/c/zinc" },
  // Age-specific both sexes
  { name:"Vitamin B12", emoji:"⚡", priority:"Essential",
    ageScope:["30–50","50–65","65+"], sexScope:["Male","Female"],
    goals:["diet","stress"],
    why:"Deficiency is very common over 40. Required for nerves, red blood cells, DNA. Essential if on Metformin.",
    dose:"500–1,000mcg methylcobalamin daily", link:"https://www.iherb.com/c/vitamin-b12" },
  { name:"Creatine Monohydrate", emoji:"🏋️", priority:"Recommended",
    ageScope:["18–30"], sexScope:["Male","Female"],
    goals:["weight"],
    why:"Improves lean muscle mass and brain energy. Supports body recomposition — more muscle = higher resting metabolism. Safe long-term.",
    dose:"3–5g daily, no loading needed", link:"https://www.iherb.com/c/creatine" },
  { name:"Vitamin C", emoji:"🍊", priority:"Recommended",
    ageScope:["18–30","30–50"], sexScope:["Male","Female"],
    goals:["diet","stress"],
    why:"Antioxidant, immune support, collagen synthesis. Stress and urban living significantly increase requirements.",
    dose:"500–1,000mg ascorbic acid daily", link:"https://www.iherb.com/c/vitamin-c" },
  { name:"CoQ10 (Ubiquinol)", emoji:"❤️", priority:"Essential",
    ageScope:["50–65","65+"], sexScope:["Male","Female"],
    goals:["diet","stress"],
    why:"Declines after 40. Essential for cellular energy. Especially important for anyone on statins.",
    dose:"100–200mg ubiquinol form daily with fat", link:"https://www.iherb.com/c/coq10" },
  { name:"NMN (NAD+ precursor)", emoji:"🔋", priority:"Consider",
    ageScope:["50–65","65+"], sexScope:["Male","Female"],
    goals:["diet"],
    why:"NAD+ drops 50% between ages 40–60. Required for DNA repair and energy metabolism. Growing evidence.",
    dose:"250–500mg daily in the morning", link:"https://www.iherb.com/c/nmn" },
  { name:"Collagen Peptides", emoji:"🦷", priority:"Recommended",
    ageScope:["50–65","65+"], sexScope:["Male","Female"],
    goals:["diet","weight"],
    why:"Collagen drops sharply after 40. Supports joints, skin elasticity, bone strength, and gut lining. High protein content also supports satiety.",
    dose:"10–15g hydrolysed peptides daily", link:"https://www.iherb.com/c/collagen" },
  // Women-specific
  { name:"Iron + Vitamin C", emoji:"🩸", priority:"Essential",
    ageScope:["18–30","30–50"], sexScope:["Female"],
    goals:["diet","stress"],
    why:"Menstruating women frequently have low iron/ferritin causing fatigue and hair loss. Vitamin C boosts absorption.",
    dose:"18–27mg iron bisglycinate + 200mg Vitamin C", link:"https://www.iherb.com/c/iron" },
  { name:"Folate (Methylfolate)", emoji:"🌿", priority:"Essential",
    ageScope:["18–30","30–50"], sexScope:["Female"],
    goals:["diet"],
    why:"Critical for DNA repair and pregnancy. Methylfolate is better than folic acid for most people.",
    dose:"400–800mcg methylfolate daily", link:"https://www.iherb.com/c/folate-folic-acid" },
  { name:"Evening Primrose Oil", emoji:"🌸", priority:"Consider",
    ageScope:["18–30","30–50"], sexScope:["Female"],
    goals:["stress"],
    why:"GLA supports hormonal balance, PMS symptoms, skin health, and breast tenderness.",
    dose:"500–1,000mg daily", link:"https://www.iherb.com/c/evening-primrose-oil" },
  { name:"Calcium + D3", emoji:"🦴", priority:"Essential",
    ageScope:["50–65","65+"], sexScope:["Female"],
    goals:["diet"],
    why:"Post-menopausal women lose bone density rapidly. Calcium citrate with D3 reduces fracture risk.",
    dose:"500–1,000mg calcium citrate + 1,000 IU D3", link:"https://www.iherb.com/c/calcium" },
  // Men-specific
  { name:"Ashwagandha (KSM-66)", emoji:"💪", priority:"Recommended",
    ageScope:["18–30","30–50","50–65"], sexScope:["Male"],
    goals:["stress","weight"],
    why:"Reduces cortisol (the stress hormone that drives fat storage), supports testosterone, improves stress resilience and sleep quality.",
    dose:"300–600mg KSM-66 extract daily", link:"https://www.iherb.com/c/ashwagandha" },
  { name:"Selenium", emoji:"🔬", priority:"Recommended",
    ageScope:["30–50","50–65","65+"], sexScope:["Male"],
    goals:["diet"],
    why:"Essential for thyroid and testosterone. Antioxidant protecting prostate and sperm health.",
    dose:"100–200mcg selenomethionine daily", link:"https://www.iherb.com/c/selenium" },
  { name:"Saw Palmetto", emoji:"🌴", priority:"Consider",
    ageScope:["50–65","65+"], sexScope:["Male"],
    goals:["diet"],
    why:"Supports prostate health and helps with BPH. Recommended for men over 50 with urinary symptoms.",
    dose:"320mg standardised extract daily", link:"https://www.iherb.com/c/saw-palmetto" },
  // Both sexes — age-specific additions
  { name:"Berberine", emoji:"🫐", priority:"Recommended",
    ageScope:["30–50","50–65","65+"], sexScope:["Male","Female"],
    goals:["diabetes","weight"],
    why:"Clinically comparable to Metformin for blood sugar and insulin sensitivity. Strong evidence for glucose regulation, cholesterol reduction, and gut microbiome support.",
    dose:"500mg 2–3x daily with meals", link:"https://www.iherb.com/c/berberine" },
  { name:"Turmeric / Curcumin + Piperine", emoji:"🟡", priority:"Recommended",
    ageScope:["30–50","50–65","65+"], sexScope:["Male","Female"],
    goals:["diabetes","stress"],
    why:"Well-documented anti-inflammatory. Piperine increases curcumin absorption by up to 2,000%. Reduces insulin resistance markers. Supports cortisol regulation.",
    dose:"500–1,000mg curcumin + 5–10mg piperine daily with food", link:"https://www.iherb.com/c/turmeric-curcumin" },
  { name:"Melatonin (low dose)", emoji:"🌙", priority:"Recommended",
    ageScope:["50–65","65+"], sexScope:["Male","Female"],
    goals:["stress"],
    why:"Production measurably declines with age. Low doses (0.5–1mg) improve sleep onset. Poor sleep raises cortisol, disrupts blood sugar, and drives weight gain.",
    dose:"0.5–1mg 30 minutes before sleep only", link:"https://www.iherb.com/c/melatonin" },
  { name:"Lutein + Zeaxanthin", emoji:"👁️", priority:"Recommended",
    ageScope:["50–65","65+"], sexScope:["Male","Female"],
    goals:["diet"],
    why:"Strong evidence for slowing macular degeneration. Eyes accumulate oxidative damage over decades. Genuinely important after 50.",
    dose:"10mg lutein + 2mg zeaxanthin daily with fat", link:"https://www.iherb.com/c/lutein" },
  { name:"Probiotics (broad spectrum)", emoji:"🦠", priority:"Recommended",
    ageScope:["30–50","50–65","65+"], sexScope:["Male","Female"],
    goals:["diet","weight","diabetes"],
    why:"Gut microbiome diversity declines with age. Evidence for digestion, immunity, blood sugar regulation, and mood via gut-brain axis. Specific strains reduce visceral fat.",
    dose:"10–50 billion CFU multi-strain daily", link:"https://www.iherb.com/c/probiotics" },
  { name:"Electrolytes (Na/K/Mg)", emoji:"⚡", priority:"Consider",
    ageScope:["18–30"], sexScope:["Male","Female"],
    goals:["weight","stress"],
    why:"Active young adults deplete sodium, potassium, and magnesium through sweat and training. Low electrolytes impair performance, increase fatigue, and cause muscle cramps.",
    dose:"Daily electrolyte blend — especially around exercise", link:"https://www.iherb.com/c/electrolytes" },
  // Women-specific additions
  { name:"Vitex (Agnus-Castus)", emoji:"🌺", priority:"Consider",
    ageScope:["18–30","30–50"], sexScope:["Female"],
    goals:["stress"],
    why:"Regulates LH/FSH ratio via dopamine pathways. Evidence for PMS, irregular cycles, and hormonal imbalance driven by stress. Not for use with hormonal contraception or HRT.",
    dose:"20–40mg standardised extract daily in the morning", link:"https://www.iherb.com/c/vitex-chaste-tree" },
  { name:"DIM (Diindolylmethane)", emoji:"🥦", priority:"Consider",
    ageScope:["30–50","50–65"], sexScope:["Female"],
    goals:["weight","stress"],
    why:"Supports healthy oestrogen metabolism. Oestrogen dominance contributes to weight gain around hips and abdomen. Real mechanism — not wellness marketing.",
    dose:"100–200mg daily with food", link:"https://www.iherb.com/c/dim-diindolylmethane" },
  { name:"Maca Root", emoji:"🌰", priority:"Consider",
    ageScope:["30–50","50–65"], sexScope:["Female"],
    goals:["stress"],
    why:"Adaptogen with consistent evidence for perimenopause symptoms — mood stability, energy, and libido. Works through HPA axis rather than hormonal pathways directly.",
    dose:"1,500–3,000mg daily (gelatinised form)", link:"https://www.iherb.com/c/maca" },
];

const AGE_GROUPS = ["18–30","30–50","50–65","65+"];
const PRIORITY_ORDER = { "Essential":0, "Recommended":1, "Consider":2 };
const PRIORITY_COLORS = {
  "Essential":["#dcfce7","#16a34a"],
  "Recommended":["#dbeafe","#1d4ed8"],
  "Consider":["#f1f5f9","#64748b"]
};
const AGE_META = {
  "18–30":{ label:"18–30 years", emoji:"🌱", color:"#0369a1", bg:"#f0f9ff", border:"#bae6fd" },
  "30–50":{ label:"30–50 years", emoji:"⚡", color:"#16a34a", bg:"#f0fdf4", border:"#86efac" },
  "50–65":{ label:"50–65 years", emoji:"🔬", color:"#ea580c", bg:"#fff7ed", border:"#fed7aa" },
  "65+":  { label:"65+ years",   emoji:"🦋", color:"#7c3aed", bg:"#faf5ff", border:"#e9d5ff" },
};
const SEX_META = {
  Male:  { label:"♂ Male",   color:"#1d4ed8", bg:"#eff6ff", border:"#bfdbfe" },
  Female:{ label:"♀ Female", color:"#be185d", bg:"#fdf2f8", border:"#f9a8d4" },
};

function getUserAgeGroup(age) {
  const n = parseInt(age);
  if (!n) return "";
  if (n < 30) return "18–30";
  if (n < 50) return "30–50";
  if (n < 65) return "50–65";
  return "65+";
}

function calcBMI(w, h) {
  const wn = parseFloat(w), hn = parseFloat(h);
  if (!wn || !hn) return null;
  return (wn / ((hn / 100) ** 2)).toFixed(1);
}

function getBMIInfo(bmi) {
  const b = parseFloat(bmi);
  if (!b) return null;
  if (b < 18.5) return { label:"Underweight",     color:"#0369a1", bg:"#e0f2fe" };
  if (b < 25)   return { label:"Healthy weight",   color:"#16a34a", bg:"#dcfce7" };
  if (b < 30)   return { label:"Overweight",        color:"#ca8a04", bg:"#fef9c3" };
  if (b < 35)   return { label:"Obese (Class I)",   color:"#ea580c", bg:"#fff7ed" };
  return               { label:"Obese (Class II+)", color:"#dc2626", bg:"#fee2e2" };
}

// ── Shared UI components ──────────────────────────────────────────────
function Field({ label, value, onChange, type="text", placeholder, readOnly=false }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
      {label && <label style={{ fontSize:13, fontWeight:600, color:"#374151" }}>{label}</label>}
      <input type={type} value={value} readOnly={readOnly}
        onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ padding:"9px 12px", borderRadius:8, border:"1.5px solid #e2e8f0",
          fontSize:14, color: readOnly ? "#64748b" : "#1e293b",
          background: readOnly ? "#f8fafc" : "#fff", outline:"none" }}
        onFocus={e => { if (!readOnly) e.target.style.border = "1.5px solid #0ea5e9"; }}
        onBlur={e => { e.target.style.border = "1.5px solid #e2e8f0"; }}
      />
    </div>
  );
}

function Sel({ label, value, onChange, options }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
      {label && <label style={{ fontSize:13, fontWeight:600, color:"#374151" }}>{label}</label>}
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ padding:"9px 12px", borderRadius:8, border:"1.5px solid #e2e8f0",
          fontSize:14, color: value ? "#1e293b" : "#94a3b8", background:"#fff", outline:"none" }}>
        <option value="">Select...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Card({ children, style={} }) {
  return <div style={{ background:"#fff", borderRadius:14, border:"1.5px solid #e2e8f0", padding:"20px 22px", ...style }}>{children}</div>;
}

function SectionTitle({ title, color="#0ea5e9" }) {
  return <div style={{ fontSize:13, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color, marginBottom:10 }}>{title}</div>;
}

function ConfBadge({ level }) {
  const map = { High:["#dcfce7","#16a34a"], Medium:["#fef9c3","#ca8a04"], Low:["#fee2e2","#dc2626"] };
  const [bg, fg] = map[level] || ["#f1f5f9","#64748b"];
  return <span style={{ background:bg, color:fg, fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:10, marginLeft:8 }}>{level}</span>;
}

function ScoreCircle({ label, score }) {
  const col = score >= 70 ? "#16a34a" : score >= 40 ? "#ca8a04" : "#dc2626";
  const bg  = score >= 70 ? "#dcfce7" : score >= 40 ? "#fef9c3" : "#fee2e2";
  return (
    <div style={{ textAlign:"center" }}>
      <div style={{ width:56, height:56, borderRadius:"50%", margin:"0 auto 6px",
        background:bg, border:`3px solid ${col}`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:16, fontWeight:800, color:col }}>{score}</div>
      <div style={{ fontSize:11, color:"#64748b", fontWeight:600 }}>{label}</div>
    </div>
  );
}

function ProgressBar({ step }) {
  return (
    <div style={{ display:"flex", alignItems:"center", marginBottom:28 }}>
      {SECTIONS.slice(0,-1).map((s,i) => (
        <div key={s} style={{ display:"flex", alignItems:"center", flex: i < SECTIONS.length-2 ? 1 : "none" }}>
          <div style={{ width:26, height:26, borderRadius:"50%", flexShrink:0,
            background: i < step ? "#16a34a" : i === step ? "#0ea5e9" : "#e2e8f0",
            color: i <= step ? "#fff" : "#94a3b8",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:11, fontWeight:700,
            boxShadow: i === step ? "0 0 0 3px #bae6fd" : "none" }}>
            {i < step ? "✓" : i+1}
          </div>
          {i < SECTIONS.length-2 && <div style={{ flex:1, height:2, background: i < step ? "#16a34a" : "#e2e8f0" }} />}
        </div>
      ))}
    </div>
  );
}

// ── Fixed Home Health Kit ─────────────────────────────────────────────
const HOME_KIT_MEDICINES = [
  { name:"Paracetamol 500mg", emoji:"💊", use:"Fever, pain, headaches", dose:"500–1,000mg every 6h · max 4g/day", warning:"Max 4g/day · Avoid with liver disease or alcohol", link:"https://www.iherb.com/c/pain-relief" },
  { name:"Ibuprofen 400mg", emoji:"💊", use:"Inflammation, joint pain, fever", dose:"400mg with food every 6–8h · max 1,200mg/day", warning:"Avoid with kidney issues, anticoagulants, aspirin allergy, pregnancy, stomach ulcers", link:"https://www.iherb.com/c/pain-relief" },
  { name:"Oral Rehydration Salts", emoji:"💧", use:"Diarrhoea, vomiting, dehydration, fever", dose:"1 sachet in 200ml water · repeat after each loose stool", warning:"Safe for all ages · Dehydration is dangerous — act fast", link:"https://www.iherb.com/c/electrolytes" },
  { name:"Cetirizine 10mg", emoji:"🌿", use:"Allergies, hay fever, itching, mild reactions", dose:"10mg once daily · non-drowsy formula preferred", warning:"Avoid with MAOIs · May cause mild drowsiness in some", link:"https://www.iherb.com/c/antihistamines" },
  { name:"Antacid (e.g. Gaviscon)", emoji:"🫁", use:"Acid reflux, heartburn, indigestion", dose:"10–20ml after meals and at bedtime as needed", warning:"Avoid long-term use without medical advice", link:"https://www.iherb.com/c/antacids" },
];
const HOME_KIT_SUPPLEMENTS = [
  { name:"Vitamin D3 2,000 IU + K2", emoji:"☀️", use:"Immunity, bone health, mood, hormones", dose:"2,000 IU D3 + 100mcg K2 daily with your fattiest meal", why:"80%+ of people are deficient year-round in northern climates", link:"https://www.iherb.com/c/vitamin-d" },
  { name:"Magnesium Glycinate 300mg", emoji:"🧘", use:"Sleep, stress, muscle cramps, blood sugar", dose:"300–400mg before bed", why:"Most people are deficient — food alone is no longer enough", link:"https://www.iherb.com/c/magnesium" },
  { name:"Omega-3 EPA/DHA 1,000mg", emoji:"🐟", use:"Inflammation, heart, brain, joints", dose:"1,000–2,000mg EPA+DHA daily with food", why:"Western diets are severely omega-3 deficient — almost everyone benefits", link:"https://www.iherb.com/c/fish-oil-omega-3" },
  { name:"Vitamin C 500mg", emoji:"🍊", use:"Immunity, collagen, iron absorption", dose:"500–1,000mg daily", why:"Stress and illness significantly increase requirements", link:"https://www.iherb.com/c/vitamin-c" },
  { name:"Zinc 15mg", emoji:"🛡️", use:"Immunity, wound healing, skin health", dose:"15mg zinc picolinate with food", why:"First line of immune defence — depleted by stress and infection", link:"https://www.iherb.com/c/zinc" },
];

function HomeHealthKit() {
  const [open, setOpen] = React.useState(true);
  return (
    <div style={{ borderRadius:14, border:"1.5px solid #d1fae5", background:"#f0fdf4", marginBottom:16, overflow:"hidden" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"14px 18px", background:"#dcfce7", border:"none", cursor:"pointer", textAlign:"left", fontFamily:"inherit"
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:20 }}>🏠</span>
          <div>
            <div style={{ fontSize:15, fontWeight:800, color:"#166534" }}>Your Home Health Kit</div>
            <div style={{ fontSize:12, color:"#16a34a" }}>OTC medicines & supplements everyone should have</div>
          </div>
        </div>
        <span style={{ fontSize:13, color:"#16a34a" }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{ padding:"16px 18px" }}>
          <div style={{ fontSize:12, color:"#166534", background:"#dcfce7", padding:"8px 12px", borderRadius:8, marginBottom:16, lineHeight:1.6 }}>
            These are the basics every household should have — available at any pharmacy without a prescription.
            Having them ready means you can act immediately when symptoms appear, day or night, without a doctor's appointment.
          </div>
          {/* Medicines */}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#16a34a", marginBottom:10 }}>💊 OTC Medicines</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {HOME_KIT_MEDICINES.map((item, i) => (
                <div key={i} style={{ background:"#fff", borderRadius:10, border:"1px solid #bbf7d0", padding:"12px 14px" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:6 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:16 }}>{item.emoji}</span>
                      <div>
                        <div style={{ fontWeight:700, fontSize:13, color:"#0f172a" }}>{item.name}</div>
                        <div style={{ fontSize:11, color:"#64748b" }}>{item.use}</div>
                      </div>
                    </div>
                    <a href={item.link} target="_blank" rel="noopener noreferrer" style={{
                      fontSize:11, fontWeight:700, color:"#16a34a", textDecoration:"none",
                      padding:"2px 8px", border:"1px solid #86efac", borderRadius:6,
                      background:"#f0fdf4", whiteSpace:"nowrap", flexShrink:0, marginLeft:8 }}>Buy →</a>
                  </div>
                  <div style={{ fontSize:12, color:"#16a34a", fontWeight:600, background:"#f0fdf4", padding:"4px 8px", borderRadius:6, marginBottom:6 }}>
                    📏 {item.dose}
                  </div>
                  <div style={{ fontSize:11, color:"#dc2626", display:"flex", gap:4 }}>
                    <span style={{ flexShrink:0 }}>⚠</span><span>{item.warning}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Supplements */}
          <div>
            <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#0369a1", marginBottom:10 }}>🌿 Foundation Supplements</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {HOME_KIT_SUPPLEMENTS.map((item, i) => (
                <div key={i} style={{ background:"#fff", borderRadius:10, border:"1px solid #bae6fd", padding:"12px 14px" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:6 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:16 }}>{item.emoji}</span>
                      <div>
                        <div style={{ fontWeight:700, fontSize:13, color:"#0f172a" }}>{item.name}</div>
                        <div style={{ fontSize:11, color:"#64748b" }}>{item.use}</div>
                      </div>
                    </div>
                    <a href={item.link} target="_blank" rel="noopener noreferrer" style={{
                      fontSize:11, fontWeight:700, color:"#0369a1", textDecoration:"none",
                      padding:"2px 8px", border:"1px solid #bae6fd", borderRadius:6,
                      background:"#f0f9ff", whiteSpace:"nowrap", flexShrink:0, marginLeft:8 }}>Buy →</a>
                  </div>
                  <div style={{ fontSize:12, color:"#0369a1", fontWeight:600, background:"#f0f9ff", padding:"4px 8px", borderRadius:6, marginBottom:6 }}>
                    📏 {item.dose}
                  </div>
                  <div style={{ fontSize:11, color:"#64748b", fontStyle:"italic" }}>💡 {item.why}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop:14, fontSize:11, color:"#166534", textAlign:"center", lineHeight:1.6 }}>
            Always check with your pharmacist before starting any new supplement, especially if you take medications.
          </div>
        </div>
      )}
    </div>
  );
}

function SuppCard({ s }) {
  const [prBg, prFg] = PRIORITY_COLORS[s.priority];
  return (
    <div style={{ background:"#fff", borderRadius:10, border:"1.5px solid #e2e8f0", padding:"12px 14px" }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:6 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:18 }}>{s.emoji}</span>
          <div style={{ fontWeight:800, fontSize:13, color:"#0f172a" }}>{s.name}</div>
        </div>
        <span style={{ background:prBg, color:prFg, fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:8, flexShrink:0, marginLeft:8 }}>{s.priority}</span>
      </div>
      <p style={{ fontSize:12, color:"#475569", lineHeight:1.5, marginBottom:9 }}>{s.why}</p>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:6 }}>
        <div style={{ fontSize:11, background:"#f1f5f9", color:"#475569", padding:"3px 8px", borderRadius:6, fontWeight:600 }}>📏 {s.dose}</div>
        <a href={s.link} target="_blank" rel="noopener noreferrer" style={{
          fontSize:11, fontWeight:700, color:"#0ea5e9", textDecoration:"none",
          padding:"3px 10px", border:"1.5px solid #bae6fd", borderRadius:6, background:"#f0f9ff", whiteSpace:"nowrap"
        }}>Browse iHerb →</a>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep]         = useState(0);
  const [loading, setLoading]   = useState(false);
  const [report, setReport]     = useState(null);
  const [error, setError]       = useState(null);
  const [mainTab, setMainTab]   = useState(0);
  const [lang, setLang]         = useState(() => localStorage.getItem("hd_lang") || "EN");
  const toggleLang = () => setLang(l => { const n = l==="EN"?"FR":"EN"; localStorage.setItem("hd_lang",n); return n; });
  const tx = key => t(lang, key);
  const [ageFilter, setAgeFilter] = useState("All");
  const [goalFilters, setGoalFilters] = useState({ "18–30":"all", "30–50":"all", "50–65":"all", "65+":"all" });

  // ── Payment gate state ────────────────────────────────────────────────
  const [payGate, setPayGate] = useState({
    show: false,       // is payment gate visible
    preview: null,
    fullReport: null,     // teaser text from Claude
    blobKey: null,
    previewLoading: false,
    email: "",
    paid: false,
    tab: 0,            // which tab triggered it
  });
  const updatePayGate = p => setPayGate(prev => ({ ...prev, ...p }));

  const setGoal = (ageGroup, goal) => setGoalFilters(p => ({ ...p, [ageGroup]: goal }));

  // ── Tab 1: Lab Results (standalone, independent) ──────────────────────
  const [labTab, setLabTab] = useState({
    fileB64:"", fileType:"", fileName:"", inputMode:null,
    loading:false, report:null, error:null
  });
  const updateLabTab = (patch) => setLabTab(p => ({ ...p, ...patch }));

  // Profile
  const [age, setAge]     = useState("");
  const [sex, setSex]     = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [waist, setWaist]   = useState("");

  // Symptoms
  const [openCats, setOpenCats]   = useState({});
  const [selSyms, setSelSyms]     = useState([]);
  const [symDetails, setSymDetails] = useState({});

  // Vitals
  const [bpSys, setBpSys]   = useState("");
  const [bpDia, setBpDia]   = useState("");
  const [hr, setHr]         = useState("");
  const [temp, setTemp]     = useState("");
  const [wTrend, setWTrend] = useState("");

  // Blood tests
  const [bloods, setBloods] = useState({});
  const [labFile, setLabFile] = useState(null);       // raw File object
  const [labFileB64, setLabFileB64] = useState("");   // base64 for API
  const [labFileType, setLabFileType] = useState(""); // mime type
  const [labFileName, setLabFileName] = useState(""); // display name
  const [labInputMode, setLabInputMode] = useState("upload"); // "upload" | "manual"

  // Meds & supps
  const [meds, setMeds]   = useState([{ name:"", dosage:"", duration:"" }]);
  const [supps, setSupps] = useState([{ name:"", dosage:"" }]);

  // Allergies
  const [allergies, setAllergies] = useState([{ substance:"", reaction:"" }]);

  // Timeline
  const [timeline, setTimeline] = useState([{ date:"", event:"" }]);

  const bmi   = useMemo(() => calcBMI(weight, height), [weight, height]);
  const bInfo = useMemo(() => bmi ? getBMIInfo(bmi) : null, [bmi]);
  const userAgeGroup = useMemo(() => getUserAgeGroup(age), [age]);

  // ── Check payment return status on load ───────────────────────────────
  const [paymentReturn, setPaymentReturn] = useState(null);
  useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const email = params.get("email");
    const type = params.get("type");
    if (status) {
      setPaymentReturn({ status, email, type });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const toggleCat = l => setOpenCats(p => ({ ...p, [l]: !p[l] }));
  const toggleSym = s => setSelSyms(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  const updSym = (s, f, v) => setSymDetails(p => ({ ...p, [s]: { ...(p[s]||{}), [f]:v } }));

  const handleLabFile = (file) => {
    if (!file) return;
    setLabFile(file);
    setLabFileName(file.name);
    setLabFileType(file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      const b64 = e.target.result.split(",")[1];
      setLabFileB64(b64);
    };
    reader.readAsDataURL(file);
  };

  // ── API prompt ────────────────────────────────────────────────────────
  const buildPrompt = () => {
    const slist = selSyms.map(s => {
      const d = symDetails[s] || {};
      return `- ${s}: ${d.duration||"?"} duration, ${d.severity||"?"} severity, ${d.trend||"?"} trend`;
    }).join("\n");
    const blist = BLOOD_TESTS.filter(b => bloods[b.key]).map(b => `- ${b.label}: ${bloods[b.key]}`).join("\n");
    const mlist = meds.filter(m => m.name).map(m => `- ${m.name} ${m.dosage} for ${m.duration}`).join("\n");
    const slist2 = supps.filter(s => s.name).map(s => `- ${s.name} ${s.dosage}`).join("\n");
    const alist = allergies.filter(a => a.substance).map(a => `- ${a.substance}${a.reaction ? ` (reaction: ${a.reaction})` : ""}`).join("\n");
    const tlist = timeline.filter(e => e.date && e.event).map(e => `- ${e.date}: ${e.event}`).join("\n");

    return `You are an advanced AI health education assistant providing specific, actionable health education. Be direct and useful. The pharmacist is the final safety gate for OTC suggestions — give people the right information to bring to that conversation.

CRITICAL RULES:
- Never give a definitive diagnosis. Use "consistent with", "pattern suggests", "may indicate"
- Only recommend OTC substances — never prescription drugs
- ALWAYS cross-check allergies and medications before any OTC suggestion
- If urgency level is 4 or 5: NO action cards with OTC — only emergency instructions
- Be specific with doses: "Iron Bisglycinate 25mg each morning on empty stomach with vitamin C"
- Always state who should NOT take each OTC substance
- Each action card must be self-contained and actionable

Return ONLY this exact JSON, no markdown:
{
  "urgency": {
    "level": number (1-5),
    "label": string,
    "color": "green"|"yellow"|"orange"|"red"|"critical",
    "message": string,
    "emergencyNumber": string (e.g. "15 (SAMU) / 112" — only for level 4-5),
    "showActions": boolean (false if level 4-5)
  },
  "summary": string,
  "healthScore": { "metabolic": number, "weight": number, "sleep": number, "overall": number },
  "actionCards": [
    {
      "finding": string (e.g. "Low Ferritin — 14 µg/L"),
      "severity": "critical"|"concerning"|"borderline"|"informational",
      "explanation": string (what this means and why it matters — 2-3 sentences),
      "actions": [
        {
          "type": "otc"|"diet"|"lifestyle"|"doctor"|"pharmacy"|"emergency",
          "title": string,
          "detail": string (specific instructions),
          "dose": string (if OTC — exact dose, frequency, duration),
          "doNotUseIf": [string] (contraindications),
          "interactions": [string] (known drug interactions from patient's medication list),
          "duration": string (how long to follow this — e.g. "8 weeks then retest"),
          "pharmacistNote": string (what to ask the pharmacist)
        }
      ],
      "retestIn": string (e.g. "8 weeks" — when to recheck this specific marker)
    }
  ],
  "concerns": [{ "name": string, "confidence": "High"|"Medium"|"Low", "reasoning": string }],
  "redFlags": [string],
  "suggestedTests": [{ "test": string, "reason": string }],
  "doctorQuestions": [string],
  "homeEssentials": [{ "item": string, "reason": string }]
}

URGENCY LEVELS:
1 = Self-manageable — OTC + diet actions appropriate
2 = Book appointment 2–4 weeks — actions appropriate for symptom relief
3 = See doctor this week — limited actions, flag for professional review
4 = Seek care 24–48h — NO action cards, urgent referral only
5 = Emergency — call ${age && parseInt(age) > 0 ? "15 (SAMU) / 112" : "emergency services"} NOW

ACTION TYPE RULES:
- "otc": OTC substance with exact dose. Only if no allergy/interaction conflict. Always add pharmacistNote.
- "diet": Specific foods to eat/avoid with reason. Always mention how long and what to expect.
- "lifestyle": Sleep, exercise, stress — specific and measurable, not vague.
- "doctor": When professional evaluation is needed for this specific finding.
- "pharmacy": When pharmacist consultation is recommended before self-treating.
- "emergency": Immediate care required — include emergency number.

OTC CONTRAINDICATIONS:
- Ibuprofen/NSAIDs: contraindicated with anticoagulants, ACE inhibitors, high creatinine, aspirin allergy, pregnancy
- Paracetamol: contraindicated with liver disease, elevated ALT/AST, alcohol dependency
- Aspirin: contraindicated with anticoagulants, under 16, bleeding disorders
- Cross-check ALL listed allergies — exclude any matching substance completely

PATIENT DATA:
Age: ${age}, Sex: ${sex}, Height: ${height}cm, Weight: ${weight}kg, Waist: ${waist}cm, BMI: ${bmi||"?"} (${bInfo?.label||""})

${labFileB64 ? "LAB REPORT: Blood test document attached. Extract ALL biomarker values and use them." : "NO BLOOD TESTS: Note this limitation. Prioritise blood test recommendations in suggestedTests."}

BLOOD TEST VALUES (manual):
${blist||"None"}

SYMPTOMS:
${slist||"None reported"}

VITALS: BP ${bpSys}/${bpDia}, HR ${hr}, Temp ${temp}°C, Weight trend: ${wTrend}

MEDICATIONS (check interactions): ${mlist||"None"}
SUPPLEMENTS: ${slist2||"None"}
ALLERGIES (CRITICAL): ${alist||"None reported"}
TIMELINE: ${tlist||"None"}

Return ONLY valid JSON. No markdown.`;
  };

  const generate = async () => {
    setLoading(true); setError(null);
    try {
      // Build message content — include lab file if uploaded
      const userContent = [];

      // If lab file uploaded, add it first
      if (labFileB64 && labFileType) {
        if (labFileType === "application/pdf") {
          userContent.push({
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data: labFileB64 }
          });
        } else {
          // image (jpg, png, etc)
          userContent.push({
            type: "image",
            source: { type: "base64", media_type: labFileType, data: labFileB64 }
          });
        }
      }

      userContent.push({ type: "text", text: buildPrompt() });

      const res = await fetch("/.netlify/functions/claude", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model: ANTHROPIC_MODEL,
          max_tokens: 2000,
          messages:[{ role:"user", content: userContent }]
        })
      });
      const data = await res.json();
      const txt = data.content.map(i => i.text||"").join("");
      setReport(JSON.parse(txt.replace(/```json|```/g,"").trim()));
      setStep(6);
    } catch(e) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  // ── Step renderer ─────────────────────────────────────────────────────
  const renderStep = () => {
    if (step === 0) return (
      <div>
        <h2 style={{ fontSize:20, fontWeight:700, color:"#0f172a", marginBottom:6 }}>Basic Profile</h2>
        <p style={{ fontSize:14, color:"#64748b", marginBottom:18 }}>Calibrates all recommendations to your body.</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
          <Field label="Age" value={age} onChange={setAge} type="number" placeholder="e.g. 42" />
          <Sel label="Sex" value={sex} onChange={setSex} options={["Male","Female","Other"]} />
          <Field label="Height (cm)" value={height} onChange={setHeight} type="number" placeholder="e.g. 175" />
          <Field label="Weight (kg)" value={weight} onChange={setWeight} type="number" placeholder="e.g. 80" />
          <Field label="Waist (cm)" value={waist} onChange={setWaist} type="number" placeholder="e.g. 90" />
        </div>
        {bmi && bInfo && (
          <div style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", borderRadius:12,
            background:bInfo.bg, border:`1.5px solid ${bInfo.color}44` }}>
            <div style={{ textAlign:"center", minWidth:60 }}>
              <div style={{ fontSize:28, fontWeight:800, color:bInfo.color }}>{bmi}</div>
              <div style={{ fontSize:10, fontWeight:700, color:bInfo.color, textTransform:"uppercase" }}>BMI</div>
            </div>
            <div>
              <div style={{ fontWeight:700, fontSize:15, color:bInfo.color }}>{bInfo.label}</div>
              <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>Healthy range: 18.5–24.9 · {height}cm / {weight}kg</div>
            </div>
          </div>
        )}
      </div>
    );

    if (step === 1) return (
      <div>
        <h2 style={{ fontSize:20, fontWeight:700, color:"#0f172a", marginBottom:6 }}>Symptoms</h2>
        <p style={{ fontSize:14, color:"#64748b", marginBottom:14 }}>
          Open a category and tick what applies.
          {selSyms.length > 0 && <strong style={{ color:"#0369a1" }}> {selSyms.length} selected.</strong>}
        </p>
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:selSyms.length > 0 ? 20 : 0 }}>
          {SYMPTOM_CATEGORIES.map(cat => {
            const isOpen = openCats[cat.label];
            const inCat = cat.symptoms.filter(s => selSyms.includes(s));
            return (
              <div key={cat.label} style={{ borderRadius:10, border:`1.5px solid ${inCat.length > 0 ? cat.color+"66" : "#e2e8f0"}`, overflow:"hidden" }}>
                <button onClick={() => toggleCat(cat.label)} style={{
                  width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
                  padding:"11px 14px", background: inCat.length > 0 ? cat.bg : "#f8fafc", border:"none", cursor:"pointer" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:14, fontWeight:700, color:cat.color }}>{cat.label}</span>
                    {inCat.length > 0 && <span style={{ fontSize:11, background:cat.color, color:"#fff", borderRadius:10, padding:"1px 7px", fontWeight:700 }}>{inCat.length}</span>}
                  </div>
                  <span style={{ fontSize:13, color:"#94a3b8" }}>{isOpen ? "▲" : "▼"}</span>
                </button>
                {isOpen && (
                  <div style={{ padding:"10px 14px 14px", background:"#fff", display:"flex", flexWrap:"wrap", gap:8 }}>
                    {cat.symptoms.map(s => {
                      const sel = selSyms.includes(s);
                      return (
                        <button key={s} onClick={() => toggleSym(s)} style={{
                          padding:"6px 13px", borderRadius:20, fontSize:13, cursor:"pointer",
                          border:`2px solid ${sel ? cat.color : "#e2e8f0"}`,
                          background: sel ? cat.bg : "#f8fafc",
                          color: sel ? cat.color : "#64748b",
                          fontWeight: sel ? 700 : 400 }}>{s}</button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {selSyms.length > 0 && (
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:"#374151", marginBottom:10 }}>Describe each symptom:</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {selSyms.map(s => {
                const cat = SYMPTOM_CATEGORIES.find(c => c.symptoms.includes(s));
                return (
                  <div key={s} style={{ background:cat?.bg||"#f8fafc", borderRadius:10, padding:"14px 16px", border:`1.5px solid ${cat?.color||"#e2e8f0"}22` }}>
                    <div style={{ fontWeight:700, fontSize:13, color:cat?.color||"#374151", marginBottom:10 }}>{s}</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                      <Sel label="Duration" value={symDetails[s]?.duration||""} onChange={v => updSym(s,"duration",v)} options={DUR} />
                      <Sel label="Severity" value={symDetails[s]?.severity||""} onChange={v => updSym(s,"severity",v)} options={SEV} />
                      <Sel label="Trend"    value={symDetails[s]?.trend||""}    onChange={v => updSym(s,"trend",v)}    options={TRN} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );

    if (step === 2) return (
      <div>
        <h2 style={{ fontSize:20, fontWeight:700, color:"#0f172a", marginBottom:6 }}>Vital Signs</h2>
        <p style={{ fontSize:14, color:"#64748b", marginBottom:18 }}>Leave blank anything you haven't measured.</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <Field label="Systolic BP (mmHg)" value={bpSys} onChange={setBpSys} type="number" placeholder="e.g. 120" />
          <Field label="Diastolic BP (mmHg)" value={bpDia} onChange={setBpDia} type="number" placeholder="e.g. 80" />
          <Field label="Heart rate (bpm)" value={hr} onChange={setHr} type="number" placeholder="e.g. 68" />
          <Field label="Temperature (°C)" value={temp} onChange={setTemp} type="number" placeholder="e.g. 36.6" />
          <Sel label="Weight trend" value={wTrend} onChange={setWTrend} options={["Stable","Slowly gaining","Rapidly gaining","Slowly losing","Rapidly losing"]} />
        </div>
      </div>
    );

    if (step === 3) return (
      <div>
        <h2 style={{ fontSize:20, fontWeight:700, color:"#0f172a", marginBottom:6 }}>Blood Test Results</h2>
        <p style={{ fontSize:14, color:"#64748b", marginBottom:24 }}>
          Blood test values significantly improve the accuracy of your report — especially for detecting metabolic, thyroid, iron, and vitamin deficiencies.
        </p>

        {/* Yes/No gate */}
        {!labInputMode && (
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:"#0f172a", marginBottom:16, textAlign:"center" }}>
              Do you have recent blood test results available?
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <button onClick={() => setLabInputMode("upload")} style={{
                padding:"20px 16px", borderRadius:14, border:"2px solid #bae6fd",
                background:"#f0f9ff", cursor:"pointer", textAlign:"center"
              }}>
                <div style={{ fontSize:28, marginBottom:8 }}>✅</div>
                <div style={{ fontWeight:700, fontSize:14, color:"#0369a1", marginBottom:4 }}>Yes — I have them</div>
                <div style={{ fontSize:12, color:"#64748b" }}>Upload PDF or take a photo</div>
              </button>
              <button onClick={() => setLabInputMode("skip")} style={{
                padding:"20px 16px", borderRadius:14, border:"2px solid #e2e8f0",
                background:"#f8fafc", cursor:"pointer", textAlign:"center"
              }}>
                <div style={{ fontSize:28, marginBottom:8 }}>📅</div>
                <div style={{ fontWeight:700, fontSize:14, color:"#374151", marginBottom:4 }}>No — not right now</div>
                <div style={{ fontSize:12, color:"#64748b" }}>Continue without — we'll flag what to test</div>
              </button>
            </div>
          </div>
        )}

        {/* Upload zone */}
        {labInputMode === "upload" && (
          <div>
            <label style={{
              display:"block", border:`2px dashed ${labFileB64 ? "#16a34a" : "#bae6fd"}`,
              borderRadius:14, padding:"36px 20px", textAlign:"center", cursor:"pointer",
              background: labFileB64 ? "#f0fdf4" : "#f0f9ff", transition:"all 0.2s", marginBottom:14
            }}>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" style={{ display:"none" }}
                onChange={e => handleLabFile(e.target.files[0])} />
              {labFileB64 ? (
                <div>
                  <div style={{ fontSize:36, marginBottom:8 }}>✅</div>
                  <div style={{ fontWeight:700, fontSize:15, color:"#16a34a", marginBottom:4 }}>{labFileName}</div>
                  <div style={{ fontSize:13, color:"#64748b", marginBottom:12 }}>
                    File ready — Claude will extract all biomarker values automatically
                  </div>
                  <span onClick={e => { e.preventDefault(); setLabFile(null); setLabFileB64(""); setLabFileName(""); setLabFileType(""); }}
                    style={{ fontSize:12, color:"#0ea5e9", textDecoration:"underline", cursor:"pointer" }}>
                    Remove — upload a different file
                  </span>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize:44, marginBottom:10 }}>📋</div>
                  <div style={{ fontWeight:700, fontSize:16, color:"#0369a1", marginBottom:6 }}>
                    Drop your lab report here or click to browse
                  </div>
                  <div style={{ fontSize:13, color:"#64748b", marginBottom:12 }}>
                    PDF, JPG, or PNG · Any lab worldwide · All values extracted automatically
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6, justifyContent:"center" }}>
                    {["CBC","Metabolic Panel","Lipid Profile","Thyroid","Hormones","Liver & Kidney","Vitamins","HbA1c"].map(t => (
                      <span key={t} style={{ fontSize:11, background:"#e0f2fe", color:"#0369a1", padding:"3px 10px", borderRadius:10, fontWeight:600 }}>{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </label>
            <div style={{ padding:"10px 14px", background:"#fffbeb", border:"1px solid #fde68a", borderRadius:10, fontSize:12, color:"#92400e", marginBottom:12 }}>
              <strong>Privacy:</strong> Your file goes directly to Claude AI for analysis. It is not stored on any server.
            </div>
            <button onClick={() => { setLabInputMode(null); setLabFile(null); setLabFileB64(""); setLabFileName(""); setLabFileType(""); }}
              style={{ fontSize:12, color:"#94a3b8", background:"none", border:"none", cursor:"pointer", textDecoration:"underline", padding:0 }}>
              ← Go back
            </button>
          </div>
        )}

        {/* Skip — no blood tests */}
        {labInputMode === "skip" && (
          <div style={{ background:"#fff7ed", border:"1.5px solid #fed7aa", borderRadius:14, padding:"20px 22px" }}>
            <div style={{ fontSize:22, marginBottom:8 }}>📅</div>
            <div style={{ fontWeight:700, fontSize:15, color:"#9a3412", marginBottom:8 }}>
              No problem — we'll generate your report without blood data
            </div>
            <div style={{ fontSize:13, color:"#7c2d12", lineHeight:1.7, marginBottom:16 }}>
              Your report will be based on symptoms, vitals, medications, and timeline. However, blood tests are the single most valuable input — they can reveal thyroid issues, diabetes risk, vitamin deficiencies, inflammation, and iron problems that symptoms alone cannot confirm.
              <br/><br/>
              <strong>We recommend getting a basic blood panel as soon as possible.</strong> In France, you can request one directly from a laboratory (no GP referral required for most panels) for around €30–50.
            </div>
            <div style={{ fontSize:12, color:"#9a3412", background:"#fff", padding:"10px 14px", borderRadius:8, border:"1px solid #fed7aa" }}>
              💡 Tests worth requesting: Full blood count, glucose, HbA1c, TSH, Vitamin D, ferritin, CRP, cholesterol panel
            </div>
            <button onClick={() => setLabInputMode(null)}
              style={{ fontSize:12, color:"#94a3b8", background:"none", border:"none", cursor:"pointer", textDecoration:"underline", padding:0, marginTop:14 }}>
              ← Go back
            </button>
          </div>
        )}
      </div>
    );

    if (step === 4) return (
      <div>
        <h2 style={{ fontSize:20, fontWeight:700, color:"#0f172a", marginBottom:6 }}>Medications & Supplements</h2>
        <p style={{ fontSize:14, color:"#64748b", marginBottom:18 }}>Include everything you take regularly.</p>
        <div style={{ marginBottom:20 }}>
          <div style={{ fontWeight:700, fontSize:14, color:"#374151", marginBottom:10 }}>Medications</div>
          {meds.map((m,i) => (
            <div key={i} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:10, marginBottom:10 }}>
              <Field label={i===0?"Name":""} value={m.name} onChange={v => setMeds(p => p.map((x,j) => j===i ? {...x,name:v} : x))} placeholder="e.g. Metformin" />
              <Field label={i===0?"Dosage":""} value={m.dosage} onChange={v => setMeds(p => p.map((x,j) => j===i ? {...x,dosage:v} : x))} placeholder="500mg" />
              <Field label={i===0?"Since":""} value={m.duration} onChange={v => setMeds(p => p.map((x,j) => j===i ? {...x,duration:v} : x))} placeholder="6 months" />
            </div>
          ))}
          <button onClick={() => setMeds(p => [...p, {name:"",dosage:"",duration:""}])} style={{ fontSize:13, color:"#0ea5e9", background:"none", border:"none", cursor:"pointer", fontWeight:600 }}>+ Add medication</button>
        </div>
        <div>
          <div style={{ fontWeight:700, fontSize:14, color:"#374151", marginBottom:10 }}>Supplements</div>
          {supps.map((s,i) => (
            <div key={i} style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:10, marginBottom:10 }}>
              <Field label={i===0?"Name":""} value={s.name} onChange={v => setSupps(p => p.map((x,j) => j===i ? {...x,name:v} : x))} placeholder="e.g. Vitamin D3" />
              <Field label={i===0?"Dosage":""} value={s.dosage} onChange={v => setSupps(p => p.map((x,j) => j===i ? {...x,dosage:v} : x))} placeholder="2000 IU" />
            </div>
          ))}
          <button onClick={() => setSupps(p => [...p, {name:"",dosage:""}])} style={{ fontSize:13, color:"#0ea5e9", background:"none", border:"none", cursor:"pointer", fontWeight:600 }}>+ Add supplement</button>
        </div>

        {/* Allergies */}
        <div style={{ marginTop:20, padding:"14px 16px", background:"#fff1f2", borderRadius:10, border:"1.5px solid #fca5a5" }}>
          <div style={{ fontWeight:700, fontSize:14, color:"#dc2626", marginBottom:4 }}>⚠ Known Allergies</div>
          <p style={{ fontSize:12, color:"#991b1b", marginBottom:12 }}>Medications, substances, foods. This is critical — any allergy will be cross-checked before any OTC suggestion is made.</p>
          {allergies.map((a,i) => (
            <div key={i} style={{ display:"grid", gridTemplateColumns:"2fr 2fr", gap:10, marginBottom:10 }}>
              <Field label={i===0?"Substance / Medication":""} value={a.substance} onChange={v => setAllergies(p => p.map((x,j) => j===i ? {...x,substance:v} : x))} placeholder="e.g. Aspirin, Penicillin, Peanuts" />
              <Field label={i===0?"Reaction (optional)":""} value={a.reaction} onChange={v => setAllergies(p => p.map((x,j) => j===i ? {...x,reaction:v} : x))} placeholder="e.g. Rash, Anaphylaxis" />
            </div>
          ))}
          <button onClick={() => setAllergies(p => [...p, {substance:"",reaction:""}])} style={{ fontSize:13, color:"#dc2626", background:"none", border:"none", cursor:"pointer", fontWeight:600 }}>+ Add allergy</button>
        </div>
      </div>
    );

    if (step === 5) return (
      <div>
        <h2 style={{ fontSize:20, fontWeight:700, color:"#0f172a", marginBottom:6 }}>Health Timeline</h2>
        <p style={{ fontSize:14, color:"#64748b", marginBottom:6 }}>Log significant health events. AI spots temporal patterns across these.</p>
        <p style={{ fontSize:13, color:"#94a3b8", marginBottom:18 }}>e.g. when symptoms started, medication changes, weight shifts</p>
        {timeline.map((e,i) => (
          <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:10, marginBottom:10 }}>
            <Field label={i===0?"Date / Period":""} value={e.date} onChange={v => setTimeline(p => p.map((x,j) => j===i ? {...x,date:v} : x))} placeholder="e.g. March 2024" />
            <Field label={i===0?"Event":""} value={e.event} onChange={v => setTimeline(p => p.map((x,j) => j===i ? {...x,event:v} : x))} placeholder="e.g. Fatigue started" />
          </div>
        ))}
        <button onClick={() => setTimeline(p => [...p, {date:"",event:""}])} style={{ fontSize:13, color:"#0ea5e9", background:"none", border:"none", cursor:"pointer", fontWeight:600 }}>+ Add event</button>
        <div style={{ marginTop:24, padding:"14px 16px", background:"#f0f9ff", borderRadius:10, border:"1px solid #bae6fd" }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#0369a1", marginBottom:4 }}>Ready to generate your report</div>
          <div style={{ fontSize:13, color:"#0369a1" }}>Educational AI analysis — not a diagnosis.</div>
        </div>
      </div>
    );

    if (step === 6) {
      if (loading) return (
        <div style={{ textAlign:"center", padding:"60px 0" }}>
          <div style={{ fontSize:36, marginBottom:16 }}>🔬</div>
          <div style={{ fontSize:16, fontWeight:700, color:"#0f172a", marginBottom:8 }}>Analysing your health data...</div>
          <div style={{ fontSize:14, color:"#64748b" }}>Cross-referencing symptoms, blood values, medications and timeline</div>
        </div>
      );
      if (error) return (
        <div style={{ textAlign:"center", padding:"40px 0" }}>
          <div style={{ color:"#dc2626", fontSize:14, marginBottom:12 }}>{error}</div>
          <button onClick={generate} style={{ padding:"10px 20px", background:"#0ea5e9", color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600 }}>Try again</button>
        </div>
      );
      if (!report) return null;
      return (
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
            <div style={{ fontSize:22, fontWeight:800, color:"#0f172a" }}>Your Health Report</div>
            <div style={{ fontSize:12, background:"#dbeafe", color:"#1d4ed8", padding:"3px 10px", borderRadius:10, fontWeight:700 }}>EDUCATIONAL</div>
          </div>
          <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:10, padding:"10px 14px", marginBottom:20, fontSize:12, color:"#92400e" }}>
            <strong>Important:</strong> AI-generated for educational purposes only. Not a diagnosis. Always consult a healthcare professional.
          </div>

          {/* ── URGENCY SCORE — always first ── */}
          {report.urgency && (() => {
            const urgColors = {
              green:    { bg:"#dcfce7", border:"#16a34a", text:"#14532d", badge:"#16a34a" },
              yellow:   { bg:"#fef9c3", border:"#ca8a04", text:"#713f12", badge:"#ca8a04" },
              orange:   { bg:"#fff7ed", border:"#ea580c", text:"#7c2d12", badge:"#ea580c" },
              red:      { bg:"#fee2e2", border:"#dc2626", text:"#7f1d1d", badge:"#dc2626" },
              critical: { bg:"#fdf2f8", border:"#be185d", text:"#831843", badge:"#be185d" },
            };
            const uc = urgColors[report.urgency.color] || urgColors.green;
            const urgEmoji = { 1:"🟢", 2:"🟡", 3:"🟠", 4:"🔴", 5:"🚨" };
            return (
              <div style={{ background:uc.bg, border:`2px solid ${uc.border}`, borderRadius:14, padding:"16px 18px", marginBottom:20 }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
                  <span style={{ fontSize:28 }}>{urgEmoji[report.urgency.level]}</span>
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:uc.badge, marginBottom:2 }}>
                      Urgency Level {report.urgency.level} / 5
                    </div>
                    <div style={{ fontSize:17, fontWeight:800, color:uc.text }}>{report.urgency.label}</div>
                  </div>
                </div>
                <div style={{ fontSize:13, color:uc.text, lineHeight:1.6 }}>{report.urgency.message}</div>
                {report.urgency.level >= 4 && (
                  <div style={{ marginTop:12, padding:"10px 14px", background:"#fff", borderRadius:8, border:`1px solid ${uc.border}`, fontSize:13, fontWeight:700, color:uc.text }}>
                    ⛔ OTC self-treatment not appropriate at this urgency level. Seek professional care first.
                  </div>
                )}
              </div>
            );
          })()}
          {report.summary && (
            <div style={{ background:"#f0f9ff", border:"1.5px solid #bae6fd", borderRadius:14, padding:"16px 18px", marginBottom:16, fontSize:14, color:"#0369a1", lineHeight:1.6 }}>{report.summary}</div>
          )}
          {report.healthScore && (
            <Card style={{ marginBottom:16 }}>
              <SectionTitle title="Health Scores" color="#0ea5e9" />
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
                <ScoreCircle label="Metabolic" score={report.healthScore.metabolic} />
                <ScoreCircle label="Weight"    score={report.healthScore.weight} />
                <ScoreCircle label="Sleep"     score={report.healthScore.sleep} />
                <ScoreCircle label="Overall"   score={report.healthScore.overall} />
              </div>
            </Card>
          )}
          {report.redFlags?.length > 0 && (
            <Card style={{ marginBottom:16, border:"1.5px solid #fca5a5", background:"#fff1f2" }}>
              <SectionTitle title="⚠ Red Flags — Seek medical attention" color="#dc2626" />
              {report.redFlags.map((f,i) => <div key={i} style={{ fontSize:13, color:"#991b1b", marginBottom:6, display:"flex", gap:8 }}><span>•</span><span>{f}</span></div>)}
            </Card>
          )}

          {/* ── UNIFIED ACTION CARDS ── */}
          {report.urgency?.showActions !== false && report.actionCards?.length > 0 && (
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:13, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"#0f172a", marginBottom:14 }}>
                🎯 What To Do — Action Plan
              </div>
              <div style={{ fontSize:12, color:"#64748b", marginBottom:16, padding:"10px 14px", background:"#f8fafc", borderRadius:8, border:"1px solid #e2e8f0" }}>
                Each finding below has specific actions — OTC medicines, diet changes, lifestyle adjustments, or professional referrals. All OTC suggestions have been checked against your medications and allergies.
              </div>
              {report.actionCards.map((card, ci) => {
                const sevConfig = {
                  critical:     { color:"#dc2626", bg:"#fff1f2", border:"#fca5a5", icon:"🔴" },
                  concerning:   { color:"#ea580c", bg:"#fff7ed", border:"#fed7aa", icon:"🟠" },
                  borderline:   { color:"#ca8a04", bg:"#fefce8", border:"#fde68a", icon:"🟡" },
                  informational:{ color:"#0369a1", bg:"#f0f9ff", border:"#bae6fd", icon:"🔵" },
                };
                const sc = sevConfig[card.severity] || sevConfig.informational;
                const actionConfig = {
                  otc:       { color:"#16a34a", bg:"#f0fdf4", border:"#86efac", icon:"💊", label:"OTC Medicine" },
                  diet:      { color:"#ca8a04", bg:"#fefce8", border:"#fde68a", icon:"🥗", label:"Diet" },
                  lifestyle: { color:"#0369a1", bg:"#f0f9ff", border:"#bae6fd", icon:"🏃", label:"Lifestyle" },
                  doctor:    { color:"#7c3aed", bg:"#faf5ff", border:"#e9d5ff", icon:"👨‍⚕️", label:"See Doctor" },
                  pharmacy:  { color:"#ea580c", bg:"#fff7ed", border:"#fed7aa", icon:"🏪", label:"Pharmacy" },
                  emergency: { color:"#dc2626", bg:"#fff1f2", border:"#fca5a5", icon:"🚨", label:"Emergency" },
                };
                return (
                  <div key={ci} style={{ borderRadius:14, border:`2px solid ${sc.border}`, marginBottom:14, overflow:"hidden" }}>
                    {/* Card header */}
                    <div style={{ background:sc.bg, padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontSize:18 }}>{sc.icon}</span>
                        <div style={{ fontWeight:800, fontSize:14, color:sc.color }}>{card.finding}</div>
                      </div>
                      {card.retestIn && (
                        <div style={{ fontSize:11, background:"#fff", color:sc.color, padding:"3px 10px", borderRadius:10, fontWeight:700, border:`1px solid ${sc.border}`, flexShrink:0 }}>
                          🔁 Retest in {card.retestIn}
                        </div>
                      )}
                    </div>
                    {/* Explanation */}
                    <div style={{ padding:"12px 16px", background:"#fff", borderBottom:"1px solid #f1f5f9" }}>
                      <div style={{ fontSize:13, color:"#374151", lineHeight:1.6 }}>{card.explanation}</div>
                    </div>
                    {/* Action items */}
                    <div style={{ padding:"12px 16px", background:"#fff", display:"flex", flexDirection:"column", gap:10 }}>
                      {card.actions?.map((action, ai) => {
                        const ac = actionConfig[action.type] || actionConfig.lifestyle;
                        return (
                          <div key={ai} style={{ borderRadius:10, border:`1.5px solid ${ac.border}`, overflow:"hidden" }}>
                            {/* Action header */}
                            <div style={{ background:ac.bg, padding:"8px 12px", display:"flex", alignItems:"center", gap:8 }}>
                              <span style={{ fontSize:16 }}>{ac.icon}</span>
                              <div style={{ fontWeight:700, fontSize:13, color:ac.color }}>{action.title}</div>
                              <span style={{ fontSize:10, background:"#fff", color:ac.color, padding:"1px 7px", borderRadius:8, fontWeight:700, marginLeft:"auto", border:`1px solid ${ac.border}` }}>{ac.label}</span>
                            </div>
                            {/* Action body */}
                            <div style={{ padding:"10px 12px", background:"#fff" }}>
                              <div style={{ fontSize:13, color:"#374151", lineHeight:1.6, marginBottom: action.dose ? 8 : 0 }}>{action.detail}</div>
                              {action.dose && (
                                <div style={{ fontSize:12, fontWeight:700, color:ac.color, background:ac.bg, padding:"5px 10px", borderRadius:6, marginBottom:8 }}>
                                  📏 {action.dose}
                                  {action.duration && <span style={{ color:"#64748b", fontWeight:400 }}> · {action.duration}</span>}
                                </div>
                              )}
                              {action.doNotUseIf?.length > 0 && (
                                <div style={{ marginBottom:6 }}>
                                  <div style={{ fontSize:11, fontWeight:700, color:"#dc2626", marginBottom:3, textTransform:"uppercase" }}>⛔ Do NOT use if:</div>
                                  {action.doNotUseIf.map((d,k) => <div key={k} style={{ fontSize:12, color:"#991b1b", display:"flex", gap:5, marginBottom:2 }}><span>•</span><span>{d}</span></div>)}
                                </div>
                              )}
                              {action.interactions?.length > 0 && (
                                <div style={{ marginBottom:6 }}>
                                  <div style={{ fontSize:11, fontWeight:700, color:"#ea580c", marginBottom:3, textTransform:"uppercase" }}>⚠ Interaction with your medications:</div>
                                  {action.interactions.map((d,k) => <div key={k} style={{ fontSize:12, color:"#9a3412", display:"flex", gap:5, marginBottom:2 }}><span>•</span><span>{d}</span></div>)}
                                </div>
                              )}
                              {action.pharmacistNote && (
                                <div style={{ fontSize:12, color:"#ea580c", background:"#fff7ed", padding:"6px 10px", borderRadius:6, border:"1px solid #fed7aa", marginTop:4 }}>
                                  🏪 <strong>Ask your pharmacist:</strong> {action.pharmacistNote}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Concerns */}
          {report.concerns?.length > 0 && (
            <Card style={{ marginBottom:16 }}>
              <SectionTitle title="Possible Areas of Concern" />
              {report.concerns.map((c,i) => (
                <div key={i} style={{ marginBottom:12, paddingBottom:12, borderBottom: i < report.concerns.length-1 ? "1px solid #f1f5f9" : "none" }}>
                  <div style={{ display:"flex", alignItems:"center", marginBottom:4 }}>
                    <span style={{ fontWeight:700, fontSize:14, color:"#1e293b" }}>{c.name}</span>
                    <ConfBadge level={c.confidence} />
                  </div>
                  <div style={{ fontSize:13, color:"#64748b", lineHeight:1.5 }}>{c.reasoning}</div>
                </div>
              ))}
            </Card>
          )}
          {report.suggestedTests?.length > 0 && (
            <Card style={{ marginBottom:16 }}>
              <SectionTitle title="Suggested Tests to Discuss with Your Doctor" color="#7c3aed" />
              {report.suggestedTests.map((t,i) => (
                <div key={i} style={{ marginBottom:8, display:"flex", gap:8 }}>
                  <span style={{ color:"#7c3aed", fontWeight:700, fontSize:13, flexShrink:0 }}>→</span>
                  <div><span style={{ fontWeight:700, fontSize:13, color:"#1e293b" }}>{t.test}</span><span style={{ fontSize:13, color:"#64748b" }}> — {t.reason}</span></div>
                </div>
              ))}
            </Card>
          )}
          {report.doctorQuestions?.length > 0 && (
            <Card style={{ marginBottom:16 }}>
              <SectionTitle title="Questions to Ask Your Doctor" color="#0369a1" />
              {report.doctorQuestions.map((q,i) => (
                <div key={i} style={{ fontSize:13, color:"#374151", marginBottom:8, padding:"8px 12px", background:"#f0f9ff", borderRadius:6, borderLeft:"3px solid #0ea5e9" }}>{q}</div>
              ))}
            </Card>
          )}
          {report.homeEssentials?.length > 0 && (
            <Card style={{ marginBottom:16, border:"1.5px solid #d1fae5", background:"#f0fdf4" }}>
              <SectionTitle title="🏠 What You Should Have at Home" color="#16a34a" />
              {report.homeEssentials.map((h,i) => (
                <div key={i} style={{ marginBottom:8, display:"flex", gap:8 }}>
                  <span style={{ fontWeight:700, fontSize:13, color:"#166534", flexShrink:0 }}>{h.item}:</span>
                  <span style={{ fontSize:13, color:"#374151" }}>{h.reason}</span>
                </div>
              ))}
            </Card>
          )}
          <HomeHealthKit />
        </div>
      );
    }
    return null;
  };

  // ── Tab 1: Lab Results renderer ───────────────────────────────────────
  const handleLabTabFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      updateLabTab({ fileB64: e.target.result.split(",")[1], fileType: file.type, fileName: file.name, inputMode:"ready" });
    };
    reader.readAsDataURL(file);
  };

  const generateLabReport = async () => {
    updateLabTab({ loading:true, error:null });
    const langInstruction = lang === "FR" ? "Respond entirely in French." : "Respond entirely in English.";
    const prompt = `You are an expert clinical lab results interpreter and nutritionist. ${langInstruction} Analyse the attached blood test report and return a detailed, plain-language interpretation with a 7-day meal plan.

For EACH biomarker found in the report, provide a full analysis paragraph. Be specific, direct, and educational. Explain what the biomarker measures, what the patient's value means, whether it is optimal/normal/borderline/concerning, and what health implications this value has.

Return ONLY this JSON structure:
{
  "labSummary": string (2-3 sentence overall summary),
  "overallScore": number (0-100),
  "biomarkers": [
    {
      "name": string,
      "value": string (value + unit),
      "referenceRange": string,
      "optimalRange": string,
      "status": "optimal"|"normal"|"borderline"|"concerning"|"critical",
      "category": string (e.g. "Metabolic","Thyroid","Blood Count","Lipids","Vitamins","Inflammation","Hormones"),
      "interpretation": string (full paragraph — what this measures, what this value means, health implications, causes of high/low, what to watch for),
      "trend": "good"|"watch"|"act"
    }
  ],
  "keyFindings": [string],
  "recommendedTests": [string],
  "doctorTalkingPoints": [string],
  "retestPlan": {
    "timeframe": string (e.g. "6–8 weeks"),
    "reason": string (why this timeframe),
    "markersToRetest": [string] (specific markers most important to recheck),
    "expectedImprovements": string (what should improve with the meal plan)
  },
  "mealPlan": {
    "goal": string (what this meal plan targets based on the blood results — e.g. "Improve iron levels, reduce inflammation, support thyroid function"),
    "keyNutrients": [string] (nutrients prioritised and why — e.g. "Iron: your ferritin of 12 is low"),
    "generalGuidelines": [string] (3-4 key dietary principles for this profile),
    "days": [
      {
        "day": number (1-7),
        "dayName": string (e.g. "Monday"),
        "breakfast": { "meal": string, "why": string },
        "lunch": { "meal": string, "why": string },
        "dinner": { "meal": string, "why": string },
        "snack": { "meal": string, "why": string }
      }
    ]
  }
}

The attached document is a blood test report. Extract every biomarker value present.
Return ONLY valid JSON. No markdown.`;

    try {
      const content = [];
      if (labTab.fileType === "application/pdf") {
        content.push({ type:"document", source:{ type:"base64", media_type:"application/pdf", data:labTab.fileB64 } });
      } else {
        content.push({ type:"image", source:{ type:"base64", media_type:labTab.fileType, data:labTab.fileB64 } });
      }
      content.push({ type:"text", text:prompt });

      const res = await fetch("/.netlify/functions/claude", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ model:ANTHROPIC_MODEL, max_tokens:4000, messages:[{ role:"user", content }] })
      });
      const data = await res.json();
      const txt = data.content.map(i => i.text||"").join("");
      const parsed = JSON.parse(txt.replace(/```json|```/g,"").trim());
      updateLabTab({ report:parsed, loading:false });
    } catch(e) {
      updateLabTab({ error:"Could not analyse your lab report. Please try again.", loading:false });
    }
  };

  const exportToPDF = (r) => {
    const statusLabels = { optimal:"Optimal", normal:"Normal", borderline:"Borderline", concerning:"Concerning", critical:"Critical" };
    const date = new Date().toLocaleDateString("en-GB");

    let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
    <style>
      body { font-family: Arial, sans-serif; color: #1e293b; padding: 32px; max-width: 800px; margin: 0 auto; font-size: 13px; }
      h1 { font-size: 22px; color: #0f172a; margin-bottom: 4px; }
      h2 { font-size: 15px; color: #0369a1; margin: 24px 0 10px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; }
      h3 { font-size: 13px; margin: 0 0 6px; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
      .score { width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 800; border: 3px solid; }
      .disclaimer { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 10px 14px; font-size: 11px; color: #92400e; margin-bottom: 20px; }
      .biomarker { border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 10px; overflow: hidden; }
      .biomarker-header { padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; }
      .biomarker-body { padding: 10px 12px; font-size: 12px; color: #374151; line-height: 1.6; }
      .badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 8px; }
      .finding { margin-bottom: 6px; padding: 6px 10px; background: #f0f9ff; border-left: 3px solid #0ea5e9; border-radius: 4px; }
      .day-card { border: 1px solid #bbf7d0; border-radius: 8px; margin-bottom: 8px; overflow: hidden; }
      .day-header { background: #16a34a; color: #fff; padding: 6px 12px; font-weight: 700; font-size: 13px; }
      .meal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 10px 12px; }
      .meal-item { background: #f0fdf4; border-radius: 6px; padding: 6px 8px; }
      .meal-label { font-size: 10px; font-weight: 700; color: #16a34a; margin-bottom: 2px; }
      .meal-name { font-size: 12px; font-weight: 600; color: #1e293b; }
      .meal-why { font-size: 10px; color: #64748b; font-style: italic; }
      .retest-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; }
      .tag { display: inline-block; font-size: 11px; background: #fff; color: #92400e; padding: 3px 10px; border-radius: 8px; border: 1px solid #fde68a; margin: 3px; font-weight: 600; }
      .q-item { font-size: 12px; padding: 7px 10px; background: #f0f9ff; border-radius: 5px; border-left: 3px solid #0ea5e9; margin-bottom: 6px; }
      @media print { body { padding: 16px; } }
    </style></head><body>`;

    html += `<div class="header">
      <div>
        <div style="font-size:11px;color:#0ea5e9;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;">AI Health Optimizer</div>
        <h1>Blood Test Analysis Report</h1>
        <div style="font-size:12px;color:#64748b;">Generated: ${date} · Educational purposes only</div>
      </div>
      <div class="score" style="color:${r.overallScore>=70?"#16a34a":r.overallScore>=50?"#ca8a04":"#dc2626"};border-color:${r.overallScore>=70?"#16a34a":r.overallScore>=50?"#ca8a04":"#dc2626"};background:${r.overallScore>=70?"#dcfce7":r.overallScore>=50?"#fef9c3":"#fee2e2"};">
        ${r.overallScore}
      </div>
    </div>
    <div class="disclaimer"><strong>Important:</strong> This report is AI-generated for educational purposes only. It is not a medical diagnosis and does not replace consultation with a qualified healthcare professional. Always discuss your results with your doctor or pharmacist.</div>
    <div style="font-size:13px;color:#374151;line-height:1.6;margin-bottom:20px;">${r.labSummary}</div>`;

    if (r.keyFindings?.length > 0) {
      html += `<h2>🎯 Key Findings</h2>`;
      r.keyFindings.forEach((f,i) => { html += `<div class="finding">${i+1}. ${f}</div>`; });
    }

    const categories = [...new Set(r.biomarkers?.map(b => b.category) || [])];
    const statusColors = { optimal:"#dcfce7", normal:"#dbeafe", borderline:"#fef9c3", concerning:"#fff7ed", critical:"#fee2e2" };
    const statusTextColors = { optimal:"#16a34a", normal:"#1d4ed8", borderline:"#ca8a04", concerning:"#ea580c", critical:"#dc2626" };

    categories.forEach(cat => {
      html += `<h2>${cat}</h2>`;
      r.biomarkers.filter(b => b.category === cat).forEach(b => {
        const bg = statusColors[b.status] || "#f1f5f9";
        const fg = statusTextColors[b.status] || "#64748b";
        html += `<div class="biomarker">
          <div class="biomarker-header" style="background:${bg};">
            <div>
              <strong style="font-size:14px;">${b.name}</strong>
              <span style="font-size:12px;color:#64748b;margin-left:10px;">Your value: <strong style="color:${fg};">${b.value}</strong>${b.referenceRange?` · Ref: ${b.referenceRange}`:""}${b.optimalRange?` · Optimal: ${b.optimalRange}`:""}</span>
            </div>
            <span class="badge" style="background:#fff;color:${fg};border:1px solid ${fg}44;">${statusLabels[b.status]||b.status}</span>
          </div>
          <div class="biomarker-body">${b.interpretation}</div>
        </div>`;
      });
    });

    if (r.retestPlan) {
      html += `<h2>🔁 When to Retest</h2>
      <div class="retest-box">
        <div style="font-size:16px;font-weight:800;color:#ca8a04;margin-bottom:6px;">Recommended: ${r.retestPlan.timeframe}</div>
        <div style="margin-bottom:8px;">${r.retestPlan.reason}</div>
        <div style="margin-bottom:10px;"><strong>Expected improvements:</strong> ${r.retestPlan.expectedImprovements}</div>
        <div style="font-size:11px;font-weight:700;color:#92400e;margin-bottom:6px;text-transform:uppercase;">Priority markers to recheck:</div>
        ${r.retestPlan.markersToRetest?.map(m => `<span class="tag">${m}</span>`).join("")}
      </div>`;
    }

    if (r.mealPlan) {
      html += `<h2>🥗 7-Day Meal Plan</h2>
      <div style="background:#dcfce7;border-radius:8px;padding:10px 14px;margin-bottom:14px;font-size:13px;color:#166534;">
        <strong>Goal:</strong> ${r.mealPlan.goal}
      </div>`;
      r.mealPlan.days?.forEach(d => {
        html += `<div class="day-card">
          <div class="day-header">Day ${d.day} — ${d.dayName}</div>
          <div class="meal-grid">
            ${[["🌅 Breakfast",d.breakfast],["☀️ Lunch",d.lunch],["🌙 Dinner",d.dinner],["🍎 Snack",d.snack]].map(([lbl,data]) => data ? `
            <div class="meal-item">
              <div class="meal-label">${lbl}</div>
              <div class="meal-name">${data.meal}</div>
              <div class="meal-why">${data.why}</div>
            </div>` : "").join("")}
          </div>
        </div>`;
      });
      html += `<div style="background:#dcfce7;border-radius:8px;padding:10px 14px;margin-top:10px;font-size:12px;color:#166534;font-weight:600;">
        📅 Follow this plan for ${r.retestPlan?.timeframe||"6–8 weeks"}, then retest your markers. Consistent adherence compounds significantly over weeks.
      </div>`;
    }

    if (r.doctorTalkingPoints?.length > 0) {
      html += `<h2>💬 What to Discuss with Your Doctor</h2>`;
      r.doctorTalkingPoints.forEach(q => { html += `<div class="q-item">${q}</div>`; });
    }

    if (r.recommendedTests?.length > 0) {
      html += `<h2>🔬 Recommended Additional Tests</h2>`;
      r.recommendedTests.forEach(t => { html += `<div style="margin-bottom:6px;font-size:13px;">→ ${t}</div>`; });
    }

    html += `<div style="margin-top:32px;padding:12px 16px;background:#f1f5f9;border-radius:8px;font-size:11px;color:#64748b;text-align:center;">
      AI Health Optimizer · AI-generated educational content only · Not a medical device · Always consult a qualified healthcare professional
    </div></body></html>`;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  const renderLabResults = () => {
    const statusConfig = {
      optimal:    { color:"#16a34a", bg:"#dcfce7", label:"Optimal",    icon:"✅" },
      normal:     { color:"#0369a1", bg:"#dbeafe", label:"Normal",     icon:"🔵" },
      borderline: { color:"#ca8a04", bg:"#fef9c3", label:"Borderline", icon:"⚠️" },
      concerning: { color:"#ea580c", bg:"#fff7ed", label:"Concerning", icon:"🟠" },
      critical:   { color:"#dc2626", bg:"#fee2e2", label:"Critical",   icon:"🔴" },
    };

    // Loading state
    if (labTab.loading) return (
      <div style={{ textAlign:"center", padding:"60px 0" }}>
        <div style={{ fontSize:40, marginBottom:16 }}>🔬</div>
        <div style={{ fontSize:16, fontWeight:700, color:"#0f172a", marginBottom:8 }}>Analysing your blood test report...</div>
        <div style={{ fontSize:14, color:"#64748b" }}>Extracting and interpreting every biomarker</div>
      </div>
    );

    // Error state
    if (labTab.error) return (
      <div style={{ textAlign:"center", padding:"40px 0" }}>
        <div style={{ color:"#dc2626", fontSize:14, marginBottom:12 }}>{labTab.error}</div>
        <button onClick={() => updateLabTab({ error:null, inputMode:"ready" })}
          style={{ padding:"10px 20px", background:"#0ea5e9", color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600 }}>Try again</button>
      </div>
    );

    // Report state
    if (labTab.report) {
      const r = labTab.report;
      const categories = [...new Set(r.biomarkers?.map(b => b.category) || [])];
      const score = r.overallScore || 0;
      const scoreCol = score >= 70 ? "#16a34a" : score >= 50 ? "#ca8a04" : "#dc2626";
      const scoreBg  = score >= 70 ? "#dcfce7" : score >= 50 ? "#fef9c3" : "#fee2e2";

      return (
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
            <div style={{ fontSize:22, fontWeight:800, color:"#0f172a" }}>Lab Results Report</div>
            <div style={{ fontSize:12, background:"#dbeafe", color:"#1d4ed8", padding:"3px 10px", borderRadius:10, fontWeight:700 }}>EDUCATIONAL</div>
          </div>
          <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:10, padding:"10px 14px", marginBottom:20, fontSize:12, color:"#92400e" }}>
            <strong>Important:</strong> AI-generated for educational purposes only. Not a diagnosis. Always consult a qualified healthcare professional.
          </div>

          {/* Overall score + summary */}
          <Card style={{ marginBottom:16, display:"flex", gap:20, alignItems:"center" }}>
            <div style={{ textAlign:"center", flexShrink:0 }}>
              <div style={{ width:72, height:72, borderRadius:"50%", background:scoreBg, border:`3px solid ${scoreCol}`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:800, color:scoreCol }}>
                {score}
              </div>
              <div style={{ fontSize:11, color:"#64748b", fontWeight:600, marginTop:4 }}>Overall</div>
            </div>
            <div>
              <div style={{ fontWeight:700, fontSize:15, color:"#0f172a", marginBottom:6 }}>Lab Summary</div>
              <div style={{ fontSize:13, color:"#374151", lineHeight:1.6 }}>{r.labSummary}</div>
            </div>
          </Card>

          {/* Key findings */}
          {r.keyFindings?.length > 0 && (
            <Card style={{ marginBottom:16, background:"#f0f9ff", border:"1.5px solid #bae6fd" }}>
              <SectionTitle title="🎯 Key Findings" color="#0369a1" />
              {r.keyFindings.map((f,i) => (
                <div key={i} style={{ fontSize:13, color:"#1e293b", marginBottom:8, display:"flex", gap:8, lineHeight:1.5 }}>
                  <span style={{ color:"#0369a1", fontWeight:700, flexShrink:0 }}>{i+1}.</span><span>{f}</span>
                </div>
              ))}
            </Card>
          )}

          {/* Biomarkers by category */}
          {categories.map(cat => {
            const markers = r.biomarkers.filter(b => b.category === cat);
            return (
              <Card key={cat} style={{ marginBottom:16 }}>
                <SectionTitle title={cat} color="#7c3aed" />
                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                  {markers.map((b,i) => {
                    const sc = statusConfig[b.status] || statusConfig.normal;
                    return (
                      <div key={i} style={{ borderRadius:10, border:`1.5px solid ${sc.color}33`, overflow:"hidden" }}>
                        {/* Header */}
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                          padding:"10px 14px", background:sc.bg }}>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <span style={{ fontSize:16 }}>{sc.icon}</span>
                            <div>
                              <div style={{ fontWeight:800, fontSize:14, color:"#0f172a" }}>{b.name}</div>
                              <div style={{ fontSize:12, color:"#64748b" }}>
                                Your value: <strong style={{ color:sc.color }}>{b.value}</strong>
                                {b.referenceRange && <span> · Ref: {b.referenceRange}</span>}
                                {b.optimalRange && <span> · Optimal: {b.optimalRange}</span>}
                              </div>
                            </div>
                          </div>
                          <span style={{ background:"#fff", color:sc.color, fontSize:11, fontWeight:700,
                            padding:"3px 10px", borderRadius:10, border:`1px solid ${sc.color}44`, flexShrink:0 }}>
                            {sc.label}
                          </span>
                        </div>
                        {/* Interpretation */}
                        <div style={{ padding:"12px 14px", fontSize:13, color:"#374151", lineHeight:1.65 }}>
                          {b.interpretation}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}

          {/* Recommended tests */}
          {r.recommendedTests?.length > 0 && (
            <Card style={{ marginBottom:16 }}>
              <SectionTitle title="Recommended Additional Tests" color="#7c3aed" />
              {r.recommendedTests.map((t,i) => (
                <div key={i} style={{ fontSize:13, color:"#374151", marginBottom:6, display:"flex", gap:8 }}>
                  <span style={{ color:"#7c3aed", fontWeight:700 }}>→</span><span>{t}</span>
                </div>
              ))}
            </Card>
          )}

          {/* Doctor talking points */}
          {r.doctorTalkingPoints?.length > 0 && (
            <Card style={{ marginBottom:16 }}>
              <SectionTitle title="What to Discuss with Your Doctor" color="#0369a1" />
              {r.doctorTalkingPoints.map((q,i) => (
                <div key={i} style={{ fontSize:13, color:"#374151", marginBottom:8,
                  padding:"8px 12px", background:"#f0f9ff", borderRadius:6, borderLeft:"3px solid #0ea5e9" }}>{q}</div>
              ))}
            </Card>
          )}

          {/* Retest plan */}
          {r.retestPlan && (
            <Card style={{ marginBottom:16, border:"1.5px solid #fde68a", background:"#fffbeb" }}>
              <SectionTitle title="🔁 When to Retest" color="#ca8a04" />
              <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14 }}>
                <div style={{ textAlign:"center", background:"#fff", border:"2px solid #ca8a04", borderRadius:12,
                  padding:"12px 16px", flexShrink:0 }}>
                  <div style={{ fontSize:22, fontWeight:800, color:"#ca8a04" }}>{r.retestPlan.timeframe}</div>
                  <div style={{ fontSize:11, color:"#92400e", fontWeight:600 }}>recommended</div>
                </div>
                <div>
                  <div style={{ fontSize:13, color:"#92400e", lineHeight:1.6, marginBottom:8 }}>{r.retestPlan.reason}</div>
                  <div style={{ fontSize:13, color:"#92400e" }}><strong>Expected improvements:</strong> {r.retestPlan.expectedImprovements}</div>
                </div>
              </div>
              {r.retestPlan.markersToRetest?.length > 0 && (
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:"#92400e", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.06em" }}>
                    Priority markers to recheck:
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {r.retestPlan.markersToRetest.map((m,i) => (
                      <span key={i} style={{ fontSize:12, background:"#fff", color:"#92400e", padding:"4px 12px",
                        borderRadius:10, border:"1px solid #fde68a", fontWeight:600 }}>{m}</span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* 7-Day Meal Plan */}
          {r.mealPlan && (
            <Card style={{ marginBottom:16, border:"1.5px solid #86efac", background:"#f0fdf4" }}>
              <SectionTitle title="🥗 Your 7-Day Meal Plan" color="#16a34a" />
              <div style={{ fontSize:13, color:"#166534", background:"#dcfce7", padding:"10px 14px",
                borderRadius:8, marginBottom:16, lineHeight:1.6 }}>
                <strong>Goal:</strong> {r.mealPlan.goal}
              </div>

              {r.mealPlan.keyNutrients?.length > 0 && (
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:"#16a34a", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.06em" }}>
                    Key nutrients targeted:
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                    {r.mealPlan.keyNutrients.map((n,i) => (
                      <div key={i} style={{ fontSize:12, color:"#166534", display:"flex", gap:6 }}>
                        <span>🎯</span><span>{n}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {r.mealPlan.generalGuidelines?.length > 0 && (
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:"#16a34a", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.06em" }}>
                    Dietary principles:
                  </div>
                  {r.mealPlan.generalGuidelines.map((g,i) => (
                    <div key={i} style={{ fontSize:12, color:"#166534", display:"flex", gap:6, marginBottom:4 }}>
                      <span>✓</span><span>{g}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Day cards */}
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {r.mealPlan.days?.map((d,i) => (
                  <div key={i} style={{ background:"#fff", borderRadius:10, border:"1px solid #bbf7d0", overflow:"hidden" }}>
                    <div style={{ background:"#16a34a", padding:"8px 14px", display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:13, fontWeight:800, color:"#fff" }}>Day {d.day} — {d.dayName}</span>
                    </div>
                    <div style={{ padding:"12px 14px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                      {[
                        { label:"🌅 Breakfast", data:d.breakfast },
                        { label:"☀️ Lunch",     data:d.lunch },
                        { label:"🌙 Dinner",    data:d.dinner },
                        { label:"🍎 Snack",     data:d.snack },
                      ].map(({label, data}) => data && (
                        <div key={label} style={{ background:"#f0fdf4", borderRadius:8, padding:"8px 10px" }}>
                          <div style={{ fontSize:11, fontWeight:700, color:"#16a34a", marginBottom:4 }}>{label}</div>
                          <div style={{ fontSize:12, color:"#1e293b", fontWeight:600, marginBottom:3 }}>{data.meal}</div>
                          <div style={{ fontSize:11, color:"#64748b", fontStyle:"italic" }}>{data.why}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop:14, padding:"10px 14px", background:"#dcfce7", borderRadius:8,
                fontSize:12, color:"#166534", fontWeight:600 }}>
                📅 Follow this plan for <strong>{r.retestPlan?.timeframe || "6–8 weeks"}</strong>, then retest
                {r.retestPlan?.markersToRetest?.length > 0 && `: ${r.retestPlan.markersToRetest.join(", ")}`}.
                Consistent adherence is key — small daily improvements compound significantly over weeks.
              </div>
            </Card>
          )}

          {/* PDF Export + upsell */}
          <HomeHealthKit />
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:8, marginBottom:24 }}>
            <button onClick={() => exportToPDF(r)} style={{
              width:"100%", padding:"14px", borderRadius:10, border:"none",
              background:"#1e293b", color:"#fff", fontWeight:700, fontSize:15, cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              📄 Download Full Report as PDF
            </button>
            <div style={{ background:"#faf5ff", border:"1.5px solid #e9d5ff", borderRadius:12, padding:"16px 18px", textAlign:"center" }}>
              <div style={{ fontSize:14, fontWeight:700, color:"#7c3aed", marginBottom:6 }}>
                Want a deeper analysis?
              </div>
              <div style={{ fontSize:13, color:"#6b21a8", marginBottom:12, lineHeight:1.5 }}>
                Your blood results will be combined with your symptoms, medications, allergies and health history
                for a full AI health consultation — including urgency scoring and OTC guidance.
              </div>
              <button onClick={() => { setMainTab(1); }} style={{
                padding:"10px 24px", borderRadius:8, border:"none",
                background:"#7c3aed", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer" }}>
                🩺 Start Full Consultation →
              </button>
            </div>
          </div>

          <div style={{ textAlign:"center" }}>
            <button onClick={() => updateLabTab({ report:null, inputMode:null, fileB64:"", fileName:"", fileType:"" })}
              style={{ padding:"10px 20px", borderRadius:8, border:"1.5px solid #e2e8f0", background:"#fff",
                color:"#374151", cursor:"pointer", fontWeight:600, fontSize:14 }}>
              Analyse another report
            </button>
          </div>
        </div>
      );
    }

    // Upload state
    const TEST_CALENDAR = {
      "18–30": {
        emoji: "🌱", color: "#0369a1", bg: "#f0f9ff", border: "#bae6fd",
        Male: [
          { test: "Full Blood Count (CBC)", why: "Detects anaemia, infections, immune issues", frequency: "Every 2 years" },
          { test: "Vitamin D", why: "Deficiency is extremely common — affects mood, immunity, testosterone", frequency: "Every 2 years" },
          { test: "Iron + Ferritin", why: "Energy, concentration, athletic performance", frequency: "Every 2 years" },
          { test: "Glucose (fasting)", why: "Early insulin resistance can start in 20s with poor diet", frequency: "Every 2 years" },
          { test: "Testosterone (total)", why: "Baseline reference for future comparison", frequency: "Once, then if symptoms" },
          { test: "Thyroid (TSH)", why: "Thyroid issues can start young — fatigue, weight, mood", frequency: "Every 3 years" },
        ],
        Female: [
          { test: "Full Blood Count (CBC)", why: "Anaemia is very common in menstruating women", frequency: "Every year" },
          { test: "Iron + Ferritin", why: "Monthly blood loss depletes iron — major cause of fatigue in young women", frequency: "Every year" },
          { test: "Vitamin D", why: "Deficiency is extremely common — affects mood, immunity, bone health", frequency: "Every 2 years" },
          { test: "Folate + B12", why: "Critical for cell division, DNA, and pregnancy planning", frequency: "Every 2 years" },
          { test: "Thyroid (TSH)", why: "Women are 5–8x more likely to have thyroid issues", frequency: "Every 2 years" },
          { test: "Glucose (fasting)", why: "Polycystic ovary syndrome (PCOS) linked to insulin resistance", frequency: "Every 2 years" },
        ]
      },
      "30–50": {
        emoji: "⚡", color: "#16a34a", bg: "#f0fdf4", border: "#86efac",
        Male: [
          { test: "Full Blood Count (CBC)", why: "Annual baseline — catches infections, anaemia, immune changes", frequency: "Every year" },
          { test: "Lipid panel (cholesterol)", why: "Cardiovascular risk starts accumulating in 30s", frequency: "Every year" },
          { test: "Glucose + HbA1c", why: "Diabetes risk rises sharply — HbA1c shows 3-month average", frequency: "Every year" },
          { test: "Thyroid (TSH + Free T4)", why: "Thyroid issues increasingly common, affects weight and energy", frequency: "Every year" },
          { test: "Testosterone (total + free)", why: "Testosterone declines ~1% per year from 30 — track it", frequency: "Every year" },
          { test: "Vitamin D + Magnesium", why: "Stress and poor diet deplete both rapidly", frequency: "Every year" },
          { test: "CRP (inflammation)", why: "Silent inflammation predicts heart disease and diabetes", frequency: "Every year" },
          { test: "Liver enzymes (ALT/AST)", why: "Especially if drinking alcohol or taking medications", frequency: "Every year" },
        ],
        Female: [
          { test: "Full Blood Count + Iron + Ferritin", why: "Continued monitoring essential during menstruating years", frequency: "Every year" },
          { test: "Lipid panel (cholesterol)", why: "Cardiovascular risk builds through 30s and 40s", frequency: "Every year" },
          { test: "Glucose + HbA1c", why: "Insulin resistance risk increases, especially post-30", frequency: "Every year" },
          { test: "Thyroid (TSH + Free T4 + TPO antibodies)", why: "Women are 8x more likely to develop autoimmune thyroid disease", frequency: "Every year" },
          { test: "Oestrogen + Progesterone + LH/FSH", why: "Perimenopause can start in early 40s — track hormonal changes", frequency: "From age 40 annually" },
          { test: "Vitamin D + B12 + Folate", why: "Critical for energy, mood, and if planning pregnancy", frequency: "Every year" },
          { test: "CRP (inflammation)", why: "Hormonal changes affect inflammation levels", frequency: "Every year" },
        ]
      },
      "50–65": {
        emoji: "🔬", color: "#ea580c", bg: "#fff7ed", border: "#fed7aa",
        Male: [
          { test: "Full Blood Count", why: "Anaemia becomes more common, immune function changes", frequency: "Every year" },
          { test: "PSA (prostate)", why: "Prostate cancer screening — most cases are in men over 50", frequency: "Every year" },
          { test: "Testosterone (total + free + SHBG)", why: "Significant decline expected — affects energy, muscle, mood, libido", frequency: "Every year" },
          { test: "Lipid panel + ApoB", why: "Cardiovascular risk peaks — ApoB is more accurate than LDL alone", frequency: "Every year" },
          { test: "Glucose + HbA1c + Insulin", why: "Diabetes risk is highest in this age group", frequency: "Every year" },
          { test: "Thyroid (full panel)", why: "Thyroid dysfunction increases sharply after 50", frequency: "Every year" },
          { test: "Kidney function (creatinine + eGFR)", why: "Kidney function declines with age — catches issues early", frequency: "Every year" },
          { test: "Vitamin D + B12 + Folate", why: "Absorption decreases with age — supplementation often needed", frequency: "Every year" },
          { test: "CoQ10 (if on statins)", why: "Statins deplete CoQ10 — causes fatigue and muscle pain", frequency: "When starting statins" },
        ],
        Female: [
          { test: "Full Blood Count", why: "Post-menopause iron status changes completely", frequency: "Every year" },
          { test: "Full hormone panel (FSH, LH, Oestradiol)", why: "Menopause transition — track hormonal status", frequency: "Every year" },
          { test: "Bone density markers (CTX + P1NP)", why: "Bone loss accelerates rapidly post-menopause", frequency: "Every year" },
          { test: "Thyroid (full panel)", why: "Risk of hypothyroidism increases significantly post-menopause", frequency: "Every year" },
          { test: "Lipid panel + ApoB", why: "Oestrogen loss dramatically increases cardiovascular risk after menopause", frequency: "Every year" },
          { test: "Glucose + HbA1c", why: "Insulin resistance increases post-menopause", frequency: "Every year" },
          { test: "Vitamin D + Calcium + Magnesium", why: "Bone protection — osteoporosis prevention", frequency: "Every year" },
          { test: "B12 + Folate", why: "Absorption decreases with age", frequency: "Every year" },
        ]
      },
      "65+": {
        emoji: "🦋", color: "#7c3aed", bg: "#faf5ff", border: "#e9d5ff",
        Male: [
          { test: "Full Blood Count", why: "Anaemia is common and often missed in older adults", frequency: "Every 6 months" },
          { test: "Kidney function (creatinine + eGFR + urea)", why: "Kidney decline is common — affects medication dosing", frequency: "Every 6 months" },
          { test: "Liver function panel", why: "Multiple medications increase liver stress", frequency: "Every year" },
          { test: "PSA", why: "Continued prostate cancer monitoring", frequency: "Every year" },
          { test: "Thyroid (full panel)", why: "Hypothyroidism is very common in older men and often missed", frequency: "Every year" },
          { test: "Vitamin D + B12 + Folate", why: "Absorption drops significantly — deficiency causes cognitive decline and falls", frequency: "Every 6 months" },
          { test: "Glucose + HbA1c", why: "Diabetes management and prevention of complications", frequency: "Every 6 months" },
          { test: "Lipid panel", why: "Ongoing cardiovascular monitoring", frequency: "Every year" },
          { test: "Inflammatory markers (CRP + ESR)", why: "Chronic inflammation drives many age-related diseases", frequency: "Every year" },
        ],
        Female: [
          { test: "Full Blood Count", why: "Anaemia is very common and causes falls and cognitive issues", frequency: "Every 6 months" },
          { test: "Vitamin D + Calcium + Magnesium", why: "Bone fracture prevention — falls are a leading cause of mortality", frequency: "Every 6 months" },
          { test: "B12 + Folate", why: "Critical for cognitive function — deficiency causes dementia-like symptoms", frequency: "Every 6 months" },
          { test: "Thyroid (full panel)", why: "Hypothyroidism affects up to 20% of women over 65", frequency: "Every year" },
          { test: "Kidney function", why: "Affects all medication safety", frequency: "Every 6 months" },
          { test: "Glucose + HbA1c", why: "Diabetes management", frequency: "Every 6 months" },
          { test: "Lipid panel", why: "Cardiovascular risk remains high", frequency: "Every year" },
          { test: "Inflammatory markers (CRP + ESR)", why: "Monitors chronic inflammation and autoimmune conditions", frequency: "Every year" },
        ]
      }
    };

    const calAgeGroup = labTab.calAge || null;
    const calSex = labTab.calSex || null;

    return (
      <div>
        {/* ── Hero / Value Proposition ── */}
        <div style={{ background:"linear-gradient(135deg,#0f172a,#1e3a5f)", borderRadius:16, padding:"28px 24px", marginBottom:24, color:"#fff" }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"#7dd3fc", marginBottom:10 }}>
            HealthDecoded · Lab Results
          </div>
          <h2 style={{ fontSize:22, fontWeight:800, color:"#fff", marginBottom:10, lineHeight:1.3 }}>
            You got your blood tests done.<br/>
            <span style={{ color:"#7dd3fc" }}>Now find out what they really mean.</span>
          </h2>
          <p style={{ fontSize:14, color:"#94a3b8", lineHeight:1.7, marginBottom:16 }}>
            {tx("heroSub1")} <em style={{ color:"#e2e8f0" }}>"everything looks fine"</em>, {tx("heroSub2")}<br/>
            <strong style={{ color:"#fff" }}>{tx("heroSub3")}</strong>
          </p>

          <div style={{ background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:10, padding:"14px 16px", marginBottom:16 }}>
            <div style={{ fontSize:14, color:"#fca5a5", fontWeight:700, marginBottom:6 }}>
              ❤️ {tx("heroHeart")}
            </div>
            <div style={{ fontSize:13, color:"#94a3b8", lineHeight:1.7 }}>
              {tx("heroHeartText")} <strong style={{ color:"#e2e8f0" }}>{tx("heroHeartBold")}</strong>
            </div>
          </div>

          <div style={{ background:"rgba(125,211,252,0.08)", border:"1px solid rgba(125,211,252,0.2)", borderRadius:10, padding:"12px 16px", marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:28, flexShrink:0 }}>🕐</span>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:"#7dd3fc", marginBottom:3 }}>{tx("hero247Title")}</div>
              <div style={{ fontSize:12, color:"#64748b", lineHeight:1.6 }}>{tx("hero247Text")}</div>
            </div>
          </div>

          <div style={{ fontSize:12, fontWeight:700, color:"#7dd3fc", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>
            {tx("heroReceive")}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
            {[
              ["🔍", lang==="FR"?"Chaque marqueur expliqué":"Every marker explained in detail", lang==="FR"?"Analyse complète par biomarqueur — pas juste haut/bas.":"Full analysis per biomarker — not just high/low."],
              ["🎯", lang==="FR"?"Optimal vs 'normal'":"Optimal vs just 'normal'", lang==="FR"?"Les normes de référence détectent la maladie. Nous vous disons ce qu'est l'optimal.":"Lab reference ranges flag disease. We tell you what optimal looks like."],
              ["💊", lang==="FR"?"Quoi faire exactement":"Exactly what to do", lang==="FR"?"Changements alimentaires, compléments OTC, priorités de style de vie.":"Diet changes, OTC supplements, lifestyle priorities — specific and actionable."],
              ["❓", lang==="FR"?"Questions pour votre médecin":"Questions for your doctor", lang==="FR"?"Points de discussion pré-rédigés basés sur vos valeurs réelles.":"Pre-written, specific talking points based on your actual values."],
              ["🥗", lang==="FR"?"Plan alimentaire 7 jours":"7-day targeted meal plan", lang==="FR"?"Construit autour de vos carences spécifiques.":"Built around your specific deficiencies."],
              ["🔁", lang==="FR"?"Votre calendrier de retest":"Your retest roadmap", lang==="FR"?"Exactement quand retester et quels marqueurs prioriser.":"Exactly when to retest and which markers to prioritise."],
            ].map(([icon,title,desc]) => (
              <div key={title} style={{ background:"rgba(255,255,255,0.07)", borderRadius:10, padding:"12px 14px" }}>
                <div style={{ fontSize:20, marginBottom:6 }}>{icon}</div>
                <div style={{ fontSize:13, fontWeight:700, color:"#e2e8f0", marginBottom:4 }}>{title}</div>
                <div style={{ fontSize:11, color:"#94a3b8", lineHeight:1.5 }}>{desc}</div>
              </div>
            ))}
          </div>

          <div style={{ background:"rgba(125,211,252,0.1)", border:"1px solid rgba(125,211,252,0.3)", borderRadius:10, padding:"14px 16px", marginBottom:16 }}>
            <div style={{ fontSize:13, color:"#7dd3fc", fontWeight:700, marginBottom:6 }}>
              {tx("heroNuanceTitle")}
            </div>
            <div style={{ fontSize:12, color:"#94a3b8", lineHeight:1.8 }}>
              {tx("heroNuance")} <strong style={{ color:"#e2e8f0" }}>{tx("heroNuanceBold")}</strong>
            </div>
          </div>

          <div style={{ fontSize:11, color:"#475569", textAlign:"center" }}>
            {tx("disclaimer")}
          </div>
        </div>

        {!labTab.inputMode && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
            <button onClick={() => updateLabTab({ inputMode:"upload" })} style={{
              padding:"24px 16px", borderRadius:14, border:"2px solid #bae6fd",
              background:"#f0f9ff", cursor:"pointer", textAlign:"center" }}>
              <div style={{ fontSize:32, marginBottom:8 }}>📋</div>
              <div style={{ fontWeight:700, fontSize:14, color:"#0369a1", marginBottom:4 }}>{tx("uploadPDF")}</div>
              <div style={{ fontSize:12, color:"#64748b" }}>{tx("uploadPDFSub")}</div>
            </button>
            <button onClick={() => updateLabTab({ inputMode:"upload" })} style={{
              padding:"24px 16px", borderRadius:14, border:"2px solid #e9d5ff",
              background:"#faf5ff", cursor:"pointer", textAlign:"center" }}>
              <div style={{ fontSize:32, marginBottom:8 }}>📸</div>
              <div style={{ fontWeight:700, fontSize:14, color:"#7c3aed", marginBottom:4 }}>{tx("takePhoto")}</div>
              <div style={{ fontSize:12, color:"#64748b" }}>{tx("takePhotoSub")}</div>
            </button>
          </div>
        )}

        {labTab.inputMode === "upload" && !labTab.fileB64 && (
          <label style={{
            display:"block", border:"2px dashed #bae6fd", borderRadius:14,
            padding:"40px 20px", textAlign:"center", cursor:"pointer", background:"#f0f9ff", marginBottom:14 }}>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" style={{ display:"none" }}
              onChange={e => handleLabTabFile(e.target.files[0])} />
            <div style={{ fontSize:44, marginBottom:10 }}>📋</div>
            <div style={{ fontWeight:700, fontSize:16, color:"#0369a1", marginBottom:6 }}>Drop file here or click to browse</div>
            <div style={{ fontSize:13, color:"#64748b", marginBottom:12 }}>PDF, JPG, or PNG · Any lab worldwide</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, justifyContent:"center" }}>
              {["CBC","Metabolic Panel","Lipid Profile","Thyroid","Hormones","Liver & Kidney","Vitamins","HbA1c","Inflammation"].map(t => (
                <span key={t} style={{ fontSize:11, background:"#e0f2fe", color:"#0369a1", padding:"3px 10px", borderRadius:10, fontWeight:600 }}>{t}</span>
              ))}
            </div>
          </label>
        )}

        {labTab.fileB64 && !labTab.report && (
          <div style={{ background:"#f0fdf4", border:"1.5px solid #86efac", borderRadius:14, padding:"20px 22px", marginBottom:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
              <span style={{ fontSize:32 }}>✅</span>
              <div>
                <div style={{ fontWeight:700, fontSize:15, color:"#16a34a" }}>{labTab.fileName}</div>
                <div style={{ fontSize:12, color:"#64748b" }}>Ready to analyse — Claude will extract all biomarker values</div>
              </div>
            </div>
            <button onClick={() => generatePreview(0)} style={{
              width:"100%", padding:"14px", borderRadius:10, border:"none",
              background:"#16a34a", color:"#fff", fontWeight:700, fontSize:15, cursor:"pointer" }}>
              🔬 Analyse My Blood Test Report
            </button>
            <div style={{ textAlign:"center", marginTop:10 }}>
              <span onClick={() => updateLabTab({ fileB64:"", fileName:"", fileType:"", inputMode:null })}
                style={{ fontSize:12, color:"#94a3b8", textDecoration:"underline", cursor:"pointer" }}>
                Upload a different file
              </span>
            </div>
          </div>
        )}

        <div style={{ padding:"10px 14px", background:"#fffbeb", border:"1px solid #fde68a", borderRadius:10, fontSize:12, color:"#92400e", marginBottom:24 }}>
          <strong>{lang==="FR"?"Confidentialité":"Privacy"}:</strong> {tx("privacyNote")}
        </div>

        {/* ── Blood Test Calendar ── */}
        <div style={{ borderTop:"2px solid #e2e8f0", paddingTop:24 }}>
          <div style={{ textAlign:"center", marginBottom:20 }}>
            <div style={{ fontSize:18, fontWeight:800, color:"#0f172a", marginBottom:6 }}>
              📅 {tx("calendarTitle")}
            </div>
            <p style={{ fontSize:13, color:"#64748b" }}>{tx("calendarSub")}</p>
          </div>

          {/* Age group selector */}
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:12, fontWeight:700, color:"#374151", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.06em" }}>{tx("ageGroup")}</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {Object.entries(TEST_CALENDAR).map(([ag, meta]) => {
                const active = calAgeGroup === ag;
                return (
                  <button key={ag} onClick={() => updateLabTab({ calAge: ag })} style={{
                    padding:"8px 16px", borderRadius:20, fontSize:13, cursor:"pointer",
                    fontWeight: active ? 700 : 500,
                    border: active ? `2px solid ${meta.color}` : "2px solid #e2e8f0",
                    background: active ? meta.bg : "#f8fafc",
                    color: active ? meta.color : "#64748b"
                  }}>{meta.emoji} {ag}</button>
                );
              })}
            </div>
          </div>

          {/* Sex selector */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:12, fontWeight:700, color:"#374151", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.06em" }}>{tx("sex")}</div>
            <div style={{ display:"flex", gap:8 }}>
              {[["Male", `♂ ${tx("male")}`, "#1d4ed8","#eff6ff","#bfdbfe"],["Female", `♀ ${tx("female")}`, "#be185d","#fdf2f8","#f9a8d4"]].map(([val,lbl,col,bg,bdr]) => {
                const active = calSex === val;
                return (
                  <button key={val} onClick={() => updateLabTab({ calSex: val })} style={{
                    padding:"8px 20px", borderRadius:20, fontSize:13, cursor:"pointer",
                    fontWeight: active ? 700 : 500,
                    border: active ? `2px solid ${col}` : "2px solid #e2e8f0",
                    background: active ? bg : "#f8fafc",
                    color: active ? col : "#64748b"
                  }}>{lbl}</button>
                );
              })}
            </div>
          </div>

          {/* Calendar results */}
          {calAgeGroup && calSex && (() => {
            const meta = TEST_CALENDAR[calAgeGroup];
            const tests = meta[calSex] || [];
            const freqColors = {
              "Every 6 months": ["#fee2e2","#dc2626"],
              "Every year":     ["#fff7ed","#ea580c"],
              "Every 2 years":  ["#fef9c3","#ca8a04"],
              "Every 3 years":  ["#f0fdf4","#16a34a"],
            };
            return (
              <div style={{ borderRadius:14, border:`2px solid ${meta.border}`, overflow:"hidden" }}>
                <div style={{ background:meta.bg, padding:"14px 18px", display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:22 }}>{meta.emoji}</span>
                  <div>
                    <div style={{ fontSize:15, fontWeight:800, color:meta.color }}>
                      Recommended tests for {calSex === "Male" ? "men" : "women"} aged {calAgeGroup}
                    </div>
                    <div style={{ fontSize:12, color:meta.color, opacity:0.8 }}>
                      {tests.length} tests recommended · Based on clinical guidelines
                    </div>
                  </div>
                </div>
                <div style={{ background:"#fff", padding:"14px 16px" }}>
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {tests.map((t,i) => {
                      const [fbg, fcol] = freqColors[t.frequency] || ["#f1f5f9","#64748b"];
                      return (
                        <div key={i} style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between",
                          padding:"12px 14px", background:"#f8fafc", borderRadius:10,
                          border:"1px solid #e2e8f0", gap:12 }}>
                          <div style={{ flex:1 }}>
                            <div style={{ fontWeight:700, fontSize:13, color:"#0f172a", marginBottom:3 }}>{t.test}</div>
                            <div style={{ fontSize:12, color:"#64748b", lineHeight:1.5 }}>{t.why}</div>
                          </div>
                          <div style={{ textAlign:"center", flexShrink:0 }}>
                            <div style={{ fontSize:11, fontWeight:700, color:fcol, background:fbg,
                              padding:"3px 10px", borderRadius:10, border:`1px solid ${fcol}33`,
                              whiteSpace:"nowrap" }}>{t.frequency}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ marginTop:16, padding:"12px 14px", background:meta.bg,
                    borderRadius:10, fontSize:12, color:meta.color, lineHeight:1.6 }}>
                    💡 {tx("franceNote")}
                  </div>
                  <div style={{ marginTop:12, textAlign:"center" }}>
                    <button onClick={() => updateLabTab({ inputMode:"upload" })} style={{
                      padding:"10px 24px", borderRadius:8, border:"none",
                      background:meta.color, color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                      📋 {tx("haveResults")}
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    );
  };

  // ── Generate preview teaser (free, before payment) ───────────────────
 const generatePreview = async (tab) => {
    updatePayGate({ show:true, tab, previewLoading:true, preview:null });
    const isLab = tab === 0;

    try {
      const content = [];
      if (isLab && labTab.fileB64) {
        if (labTab.fileType === "application/pdf") {
          content.push({ type:"document", source:{ type:"base64", media_type:"application/pdf", data:labTab.fileB64 } });
        } else {
          content.push({ type:"image", source:{ type:"base64", media_type:labTab.fileType, data:labTab.fileB64 } });
        }
      }

      const teaserPrompt = isLab
        ? `Analyse this blood test. Return ONLY a 2-3 sentence teaser that mentions how many biomarkers you found, hints at 1-2 specific findings (create curiosity), and ends with "Unlock your full report to see everything." Return plain text only.`
        : `Based on this patient profile: Age ${age}, Sex ${sex}, Symptoms: ${selSyms.slice(0,3).join(", ")||"None"}. Write a 2-3 sentence teaser hinting at patterns detected. End with "Unlock your full report to see everything." Plain text only.`;

      content.push({ type:"text", text:teaserPrompt });

      const res = await fetch("/.netlify/functions/claude", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ model:ANTHROPIC_MODEL, max_tokens:150, messages:[{ role:"user", content }] })
      });
      const data = await res.json();
      const txt = data.content.map(i => i.text||"").join("");

      let blobKey = null;
      if (isLab && labTab.fileB64) {
        const storeRes = await fetch("/.netlify/functions/store-report-data", {
          method:"POST",
          headers:{ "Content-Type":"application/json" },
          body: JSON.stringify({
            fileB64: labTab.fileB64,
            fileType: labTab.fileType,
            fileName: labTab.fileName,
            reportType: "lab",
            email: "",
          })
        });
        const storeData = await storeRes.json();
        blobKey = storeData.key;
      }

      updatePayGate({ preview:txt, blobKey, previewLoading:false });
    } catch(e) {
      updatePayGate({
        preview:"Your data has been analysed and we've identified several areas worth examining in detail. Unlock your full report to see everything.",
        previewLoading:false
      });
    }
  };
  // ── Payment gate renderer ─────────────────────────────────────────────
  const renderPaymentGate = () => {
    const isLab = payGate.tab === 0;
    const price = isLab ? "€1.00" : "€1.00";
    const includes = isLab
      ? ["Every biomarker explained in full","Optimal vs reference range","Specific OTC & diet actions","7-day meal plan","Retest roadmap","PDF sent to your email"]
      : ["Urgency score 1–5","Action cards per finding","OTC guidance with allergy check","Suggested tests & doctor questions","Personalised supplement plan","PDF sent to your email"];

    const dataSummary = isLab
      ? [
          labTab.fileName ? `✓ Blood test uploaded: ${labTab.fileName}` : null,
        ].filter(Boolean)
      : [
          age && sex ? `✓ Profile: ${sex}, age ${age}${bmi ? `, BMI ${bmi}` : ""}` : null,
          selSyms.length > 0 ? `✓ ${selSyms.length} symptom${selSyms.length>1?"s":""} entered` : null,
          meds.filter(m=>m.name).length > 0 ? `✓ ${meds.filter(m=>m.name).length} medication${meds.filter(m=>m.name).length>1?"s":""} on file` : null,
          allergies.filter(a=>a.substance).length > 0 ? `✓ ${allergies.filter(a=>a.substance).length} known allerg${allergies.filter(a=>a.substance).length>1?"ies":"y"} checked` : null,
          labTab.fileB64 ? `✓ Blood test uploaded` : null,
          timeline.filter(e=>e.date&&e.event).length > 0 ? `✓ ${timeline.filter(e=>e.date&&e.event).length} timeline events` : null,
        ].filter(Boolean);

    return (
      <div style={{ maxWidth:480, margin:"0 auto" }}>
        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ fontSize:32, marginBottom:8 }}>🔬</div>
          <h2 style={{ fontSize:20, fontWeight:800, color:"#0f172a", marginBottom:6 }}>
            Your report is ready to generate
          </h2>
          <p style={{ fontSize:13, color:"#64748b" }}>
            We have everything we need. Here's a preview of what we found.
          </p>
        </div>

        {/* Preview teaser */}
        <div style={{ background:"#f0f9ff", border:"1.5px solid #bae6fd", borderRadius:14, padding:"18px 20px", marginBottom:16, position:"relative" }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#0369a1", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:10 }}>
            🔍 Preview — What we found
          </div>
          {payGate.previewLoading ? (
            <div style={{ fontSize:13, color:"#64748b" }}>Analysing your data...</div>
          ) : (
            <>
              <div style={{ fontSize:14, color:"#1e293b", lineHeight:1.7, marginBottom:12 }}>
                {payGate.preview}
              </div>
              {/* Blurred rest */}
              <div style={{ position:"relative", overflow:"hidden", height:60, borderRadius:8 }}>
                <div style={{ fontSize:13, color:"#374151", lineHeight:1.6, filter:"blur(5px)", userSelect:"none" }}>
                  Your ferritin levels at 14 µg/L suggest functional iron deficiency — well below the optimal threshold of 30 µg/L. TSH of 4.2 is within laboratory range but sits in the suboptimal zone. Vitamin D at 28 nmol/L requires immediate attention. Three specific action cards have been prepared with exact OTC doses...
                </div>
                <div style={{ position:"absolute", bottom:0, left:0, right:0, height:40,
                  background:"linear-gradient(transparent, #f0f9ff)" }} />
              </div>
              <div style={{ textAlign:"center", marginTop:8, fontSize:12, fontWeight:700, color:"#0369a1" }}>
                🔒 Full report unlocked after payment
              </div>
            </>
          )}
        </div>

        {/* Data summary */}
        <div style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:10, padding:"12px 16px", marginBottom:16 }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#374151", marginBottom:8 }}>We'll analyse:</div>
          {dataSummary.map((d,i) => (
            <div key={i} style={{ fontSize:12, color:"#374151", marginBottom:4 }}>{d}</div>
          ))}
        </div>

        {/* What's included */}
        <div style={{ background:"#fff", border:"1.5px solid #e2e8f0", borderRadius:10, padding:"12px 16px", marginBottom:20 }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#374151", marginBottom:8 }}>Your report includes:</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
            {includes.map((item,i) => (
              <div key={i} style={{ fontSize:12, color:"#374151", display:"flex", gap:6 }}>
                <span style={{ color:"#16a34a", fontWeight:700, flexShrink:0 }}>✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Email input */}
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:6 }}>
            📧 Where should we send your report?
          </label>
          <input
            type="email"
            value={payGate.email}
            onChange={e => updatePayGate({ email:e.target.value })}
            placeholder="your@email.com"
            style={{ width:"100%", padding:"12px 14px", borderRadius:10,
              border:"1.5px solid #e2e8f0", fontSize:14,
              color:"#1e293b", background:"#ffffff",
              outline:"none", fontFamily:"inherit",
              boxSizing:"border-box" }}
            onFocus={e => e.target.style.border = "1.5px solid #0ea5e9"}
            onBlur={e => e.target.style.border = "1.5px solid #e2e8f0"}
          />
          <div style={{ fontSize:11, color:"#94a3b8", marginTop:4 }}>
            Your full report PDF will be sent here immediately after payment.
          </div>
        </div>

        {/* Pay button */}
        <button
          onClick={async () => {
            if (!payGate.email || !payGate.email.includes("@")) {
              alert("Please enter a valid email address.");
              return;
            }
            updatePayGate({ previewLoading: true });
            try {
const res = await fetch("/.netlify/functions/create-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: payGate.email,
                amount: payGate.tab === 0 ? "1.00" : "1.00",
                reportType: payGate.tab === 0 ? "lab" : "consultation",
                description: payGate.tab === 0 ? "HealthDecoded — Lab Results Report" : "HealthDecoded — Health Consultation Report",
                description: payGate.tab === 0 ? "HealthDecoded — Lab Results Report" : "HealthDecoded — Health Consultation Report",
teaser: payGate.preview || "",
              })
            });
            const data = await res.json();
            if (data.checkoutUrl) {
              window.location.href = data.checkoutUrl;
            } else {
              alert("Payment setup failed. Please try again.");
              updatePayGate({ previewLoading: false });
            }
          } catch(e) {
            alert("Something went wrong. Please try again.");
            updatePayGate({ previewLoading: false });
          }
          }}
          disabled={payGate.previewLoading}
          style={{
            width:"100%", padding:"16px", borderRadius:12, border:"none",
            background: payGate.previewLoading ? "#94a3b8" : "linear-gradient(135deg,#16a34a,#15803d)",
            color:"#fff", fontWeight:800, fontSize:16, cursor: payGate.previewLoading ? "not-allowed" : "pointer",
            boxShadow:"0 4px 14px rgba(22,163,74,0.3)", marginBottom:12
          }}>
          {payGate.previewLoading ? "Setting up payment..." : `🔓 Pay ${payGate.tab === 0 ? "€1.00" : "€1.00"} and get my full report`}
        </button>

        {/* Payment methods */}
        <div style={{ textAlign:"center", marginBottom:16 }}>
          <div style={{ fontSize:11, color:"#94a3b8", marginBottom:6 }}>Secure payment via Mollie</div>
          <div style={{ display:"flex", justifyContent:"center", gap:8, flexWrap:"wrap" }}>
            {["💳 Visa","💳 Mastercard","🏦 iDEAL","📱 PayPal","🏦 Bancontact","💶 Virement"].map(m => (
              <span key={m} style={{ fontSize:11, background:"#f1f5f9", color:"#64748b", padding:"3px 8px", borderRadius:6 }}>{m}</span>
            ))}
          </div>
        </div>

        {/* Back link */}
        <div style={{ textAlign:"center" }}>
          <button onClick={() => updatePayGate({ show:false })}
            style={{ fontSize:12, color:"#94a3b8", background:"none", border:"none", cursor:"pointer", textDecoration:"underline" }}>
            ← Go back and edit my data
          </button>
        </div>
      </div>
    );
  };

  // ── Supplement Guide tab ──────────────────────────────────────────────
  const renderSuppGuide = () => {
    // Universal = in ALL 4 age groups + both sexes → shown once at top
    const universal = SUPP_DB.filter(s =>
      AGE_GROUPS.every(g => s.ageScope.includes(g)) &&
      s.sexScope.includes("Male") && s.sexScope.includes("Female")
    ).sort((a,b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

    // Age-specific = NOT in all 4 age groups
    const ageSpecific = SUPP_DB.filter(s => !AGE_GROUPS.every(g => s.ageScope.includes(g)));

    return (
      <div>
        <div style={{ marginBottom:20 }}>
          <h2 style={{ fontSize:20, fontWeight:700, color:"#0f172a", marginBottom:6 }}>💊 Supplement Guide</h2>
          <p style={{ fontSize:13, color:"#64748b", marginBottom:10 }}>
            Universal foundations first, then age-specific and sex-specific. Not a prescription — discuss with your pharmacist or doctor.
          </p>
          {age && sex && (
            <div style={{ fontSize:13, fontWeight:700, color:"#16a34a", background:"#f0fdf4", border:"1px solid #86efac", borderRadius:8, padding:"7px 12px", display:"inline-block" }}>
              ✓ Your profile: {sex}, age {age} — your section is highlighted
            </div>
          )}
        </div>

        {/* Age filter tabs */}
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:20 }}>
          {["All", ...AGE_GROUPS].map(g => {
            const active = ageFilter === g;
            const m = g !== "All" ? AGE_META[g] : null;
            return (
              <button key={g} onClick={() => setAgeFilter(g)} style={{
                padding:"7px 16px", borderRadius:20, fontSize:13, cursor:"pointer", fontWeight: active ? 700 : 500,
                border: active ? `2px solid ${m ? m.color : "#0f172a"}` : "2px solid #e2e8f0",
                background: active ? (m ? m.bg : "#0f172a") : "#f8fafc",
                color: active ? (m ? m.color : "#fff") : "#64748b"
              }}>{m ? `${m.emoji} ${g}` : "All ages"}</button>
            );
          })}
        </div>

        {/* Universal section — only when showing All */}
        {ageFilter === "All" && (
          <div style={{ marginBottom:24 }}>
            <div style={{ background:"#1e293b", borderRadius:12, padding:"12px 16px", marginBottom:12, display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:18 }}>🌍</span>
              <div>
                <div style={{ fontSize:15, fontWeight:800, color:"#fff" }}>Universal Foundations</div>
                <div style={{ fontSize:12, color:"#94a3b8" }}>All ages · All sexes · Recommended for virtually everyone</div>
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {universal.map((s,i) => <SuppCard key={i} s={s} />)}
            </div>
          </div>
        )}

        {/* Age-specific sections */}
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          {AGE_GROUPS.filter(g => ageFilter === "All" || ageFilter === g).map(ageGroup => {
            const am = AGE_META[ageGroup];
            const isUserGroup = ageGroup === userAgeGroup;

            const bothSexes = ageSpecific.filter(s =>
              s.ageScope.includes(ageGroup) &&
              s.sexScope.includes("Male") && s.sexScope.includes("Female") &&
              (goalFilters[ageGroup] === "all" || s.goals.includes(goalFilters[ageGroup]))
            ).sort((a,b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

            const maleOnly = ageSpecific.filter(s =>
              s.ageScope.includes(ageGroup) &&
              s.sexScope.includes("Male") && !s.sexScope.includes("Female") &&
              (goalFilters[ageGroup] === "all" || s.goals.includes(goalFilters[ageGroup]))
            ).sort((a,b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

            const femaleOnly = ageSpecific.filter(s =>
              s.ageScope.includes(ageGroup) &&
              s.sexScope.includes("Female") && !s.sexScope.includes("Male") &&
              (goalFilters[ageGroup] === "all" || s.goals.includes(goalFilters[ageGroup]))
            ).sort((a,b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

            if (!bothSexes.length && !maleOnly.length && !femaleOnly.length) return null;

            return (
              <div key={ageGroup} style={{
                borderRadius:14,
                border:`2px solid ${isUserGroup ? am.color : am.border}`,
                overflow:"hidden",
                boxShadow: isUserGroup ? `0 0 0 3px ${am.border}` : "none"
              }}>
                <div style={{ background:am.bg, padding:"13px 18px", display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:22 }}>{am.emoji}</span>
                  <div>
                    <div style={{ fontSize:15, fontWeight:800, color:am.color }}>{am.label} — specific recommendations</div>
                    {isUserGroup && <div style={{ fontSize:11, fontWeight:700, color:am.color, opacity:0.75 }}>← Your age group</div>}
                  </div>
                </div>

                {/* Goal selector for this age group */}
                <div style={{ padding:"12px 16px", background:am.bg, borderTop:`1px solid ${am.border}` }}>
                  <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:am.color, marginBottom:8 }}>
                    What's your main focus?
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {GOALS.map(g => {
                      const active = goalFilters[ageGroup] === g.id;
                      return (
                        <button key={g.id} onClick={() => setGoal(ageGroup, g.id)} style={{
                          padding:"5px 12px", borderRadius:16, fontSize:12, cursor:"pointer",
                          fontWeight: active ? 700 : 500,
                          border: active ? `2px solid ${am.color}` : "2px solid #e2e8f0",
                          background: active ? "#fff" : "#f8fafc",
                          color: active ? am.color : "#64748b",
                          boxShadow: active ? `0 1px 4px ${am.border}` : "none",
                          transition:"all 0.15s"
                        }}>{g.emoji} {g.label}</button>
                      );
                    })}
                  </div>
                </div>
                <div style={{ padding:"14px 16px", background:"#fff" }}>
                  {bothSexes.length === 0 && maleOnly.length === 0 && femaleOnly.length === 0 && (
                    <div style={{ fontSize:13, color:"#94a3b8", textAlign:"center", padding:"16px 0" }}>
                      No specific supplements for this focus in this age group.
                      <br /><span style={{ fontSize:12 }}>Try "All" to see everything.</span>
                    </div>
                  )}
                  {bothSexes.length > 0 && (
                    <div style={{ marginBottom:14 }}>
                      <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#64748b", marginBottom:8 }}>👥 Both sexes</div>
                      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                        {bothSexes.map((s,i) => <SuppCard key={i} s={s} />)}
                      </div>
                    </div>
                  )}
                  {(maleOnly.length > 0 || femaleOnly.length > 0) && (
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                      {[{sg:"Male",supps:maleOnly},{sg:"Female",supps:femaleOnly}].map(({sg,supps}) => {
                        if (!supps.length) return <div key={sg} />;
                        const sm = SEX_META[sg];
                        const highlight = sex === sg && isUserGroup;
                        return (
                          <div key={sg} style={{ borderRadius:10, border:`1.5px solid ${highlight ? sm.color : sm.border}`, overflow:"hidden", boxShadow: highlight ? `0 0 0 2px ${sm.border}` : "none" }}>
                            <div style={{ background:sm.bg, padding:"8px 12px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                              <span style={{ fontSize:13, fontWeight:800, color:sm.color }}>{sm.label}</span>
                              {highlight && <span style={{ fontSize:10, fontWeight:700, color:sm.color, background:"#fff", padding:"1px 7px", borderRadius:8 }}>You</span>}
                            </div>
                            <div style={{ padding:"10px", display:"flex", flexDirection:"column", gap:8 }}>
                              {supps.map((s,i) => <SuppCard key={i} s={s} />)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop:20, padding:"12px 14px", background:"#fffbeb", border:"1px solid #fde68a", borderRadius:10, fontSize:12, color:"#92400e" }}>
          <strong>Reminder:</strong> Always check with a pharmacist or doctor before starting supplements, especially if you take medications. This is not a prescription.
        </div>
      </div>
    );
  };

  // ── Shell ─────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#f0f9ff,#f8fafc)", fontFamily:"'Inter',system-ui,sans-serif" }}>

      {/* Sticky top nav — outside maxWidth wrapper so it spans full width */}
      <div style={{
        position:"sticky", top:0, zIndex:100,
        background:"rgba(248,250,252,0.97)", backdropFilter:"blur(8px)",
        borderBottom:"1px solid #e2e8f0",
        padding:"8px 16px"
      }}>
        <div style={{ maxWidth:680, margin:"0 auto", display:"flex", alignItems:"center", gap:10 }}>
<div style={{ fontSize:15, fontWeight:800, color:"#0f172a", flexShrink:0, marginRight:4, display:"flex", alignItems:"center", gap:6 }}>
  <svg width="28" height="28" viewBox="0 0 512 512" style={{ borderRadius:"6px", flexShrink:0 }}><rect width="512" height="512" rx="100" fill="#0a1628"/><rect x="80" y="80" width="90" height="260" rx="10" fill="#1a5fd4"/><rect x="80" y="185" width="270" height="70" rx="10" fill="#1a5fd4"/><rect x="260" y="255" width="90" height="85" rx="10" fill="#1a5fd4"/><rect x="260" y="80" width="28" height="28" rx="5" fill="#1ab8e8"/><rect x="294" y="80" width="28" height="28" rx="5" fill="#1ab8e8"/><rect x="328" y="80" width="28" height="28" rx="5" fill="#1ab8e8"/><rect x="362" y="80" width="28" height="28" rx="5" fill="#1ab8e8"/><rect x="260" y="114" width="28" height="28" rx="5" fill="#1ab8e8" opacity="0.85"/><rect x="294" y="114" width="28" height="28" rx="5" fill="#1ab8e8" opacity="0.7"/><rect x="328" y="114" width="28" height="28" rx="5" fill="#00d4ff" opacity="0.5"/><rect x="260" y="148" width="28" height="28" rx="5" fill="#1ab8e8" opacity="0.6"/><rect x="294" y="148" width="22" height="22" rx="4" fill="#00d4ff" opacity="0.35"/></svg>
  Health<span style={{ color:"#0ea5e9" }}>Decoded</span>
</div>        
          {[
            { icon:"🔬", label:tx("labResults"),  price:"€1.00", color:"#0369a1", bg:"#e0f2fe" },
            { icon:"🩺", label:tx("consultation"), price:"€9.90", color:"#7c3aed", bg:"#f3e8ff" },
            { icon:"💊", label:tx("supplements"),  price:lang==="FR"?"Gratuit":"Free", color:"#16a34a", bg:"#dcfce7" },
          ].map((tab, i) => {
            const active = mainTab === i;
            return (
              <button key={i} onClick={() => setMainTab(i)} style={{
                flex:1, display:"flex", alignItems:"center", justifyContent:"center",
                gap:6, padding:"8px 10px", borderRadius:10, cursor:"pointer",
                border: active ? `2px solid ${tab.color}` : "2px solid #e2e8f0",
                background: active ? tab.bg : "#fff",
                transition:"all 0.15s", fontFamily:"inherit"
              }}>
                <span style={{ fontSize:16 }}>{tab.icon}</span>
                <div style={{ textAlign:"left" }}>
                  <div style={{ fontSize:12, fontWeight:700, color: active ? tab.color : "#374151", lineHeight:1.2 }}>{tab.label}</div>
                  <div style={{ fontSize:10, fontWeight:600, color: active ? tab.color : "#94a3b8" }}>{tab.price}</div>
                </div>
              </button>
            );
          })}
          <button onClick={toggleLang} style={{
            padding:"6px 12px", borderRadius:20, border:"1.5px solid #e2e8f0",
            background:"#fff", cursor:"pointer", fontFamily:"inherit",
            fontSize:12, fontWeight:700, color:"#374151",
            display:"flex", alignItems:"center", gap:4, flexShrink:0
          }}>
            {lang === "EN" ? "🇫🇷 FR" : "🇬🇧 EN"}
          </button>
        </div>
      </div>

      <div style={{ padding:"24px 16px" }}>
      <div style={{ maxWidth:680, margin:"0 auto" }}>

        {/* Payment return status */}
        {paymentReturn && (
          <div style={{
            borderRadius:14, padding:"20px 24px", marginBottom:20, textAlign:"center",
            background: paymentReturn.status === "paid" ? "#f0fdf4" : "#fff1f2",
            border: `2px solid ${paymentReturn.status === "paid" ? "#16a34a" : "#fca5a5"}`
          }}>
            {paymentReturn.status === "paid" ? (
              <>
                <div style={{ fontSize:36, marginBottom:8 }}>✅</div>
                <div style={{ fontSize:18, fontWeight:800, color:"#16a34a", marginBottom:8 }}>{tx("paymentConfirmed")}</div>
                <div style={{ fontSize:14, color:"#166534", marginBottom:4 }}>{tx("reportSentTo")}</div>
                <div style={{ fontSize:15, fontWeight:700, color:"#16a34a", marginBottom:12 }}>{paymentReturn.email}</div>
                <div style={{ fontSize:13, color:"#166534" }}>{tx("checkInbox")}</div>
              </>
            ) : paymentReturn.status === "pending" ? (
              <>
                <div style={{ fontSize:36, marginBottom:8 }}>⏳</div>
                <div style={{ fontSize:16, fontWeight:700, color:"#ca8a04" }}>{tx("paymentProcessing")}</div>
                <div style={{ fontSize:13, color:"#92400e", marginTop:8 }}>{tx("reportPending")}</div>
              </>
            ) : (
              <>
                <div style={{ fontSize:36, marginBottom:8 }}>❌</div>
                <div style={{ fontSize:16, fontWeight:700, color:"#dc2626" }}>{tx("paymentFailed")} {paymentReturn.status}</div>
                <div style={{ fontSize:13, color:"#991b1b", marginTop:8 }}>{tx("noCharge")}</div>
                <button onClick={() => setPaymentReturn(null)} style={{ marginTop:12, padding:"8px 20px", borderRadius:8, border:"none", background:"#dc2626", color:"#fff", fontWeight:600, cursor:"pointer" }}>
                  {tx("tryAgain")}
                </button>
              </>
            )}
          </div>
        )}

        <div style={{ textAlign:"center", marginBottom:20 }}>
          <div style={{ fontSize:12, fontWeight:700, letterSpacing:"0.1em", color:"#0ea5e9", textTransform:"uppercase", marginBottom:4 }}>HealthDecoded</div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#0f172a", marginBottom:4 }}>{tx("tagline")}</h1>
          <p style={{ fontSize:14, color:"#64748b", margin:0 }}>{tx("subtitle")}</p>
        </div>

        {/* Tab switcher with full service descriptions */}
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
          {[
            {
              icon:"🔬",
              label:tx("labResults"),
              price:"€1.00",
              priceColor:"#0369a1",
              priceBg:"#e0f2fe",
              pitch:tx("tab1Pitch"),
              desc:tx("tab1Desc"),
              includes:tx("tab1Includes"),
              color:"#0369a1",
              activeBg:"#f0f9ff",
              activeBorder:"#0369a1",
              tag:tx("tab1Tag")
            },
            {
              icon:"🩺",
              label:lang==="FR"?"Consultation complète":"Full Health Consultation",
              price:"€9.90",
              priceColor:"#7c3aed",
              priceBg:"#f3e8ff",
              pitch:tx("tab2Pitch"),
              desc:tx("tab2Desc"),
              includes:tx("tab2Includes"),
              color:"#7c3aed",
              activeBg:"#faf5ff",
              activeBorder:"#7c3aed",
              tag:tx("tab2Tag")
            },
            {
              icon:"💊",
              label:lang==="FR"?"Guide compléments":"Supplement Guide",
              price:lang==="FR"?"Gratuit":"Free",
              priceColor:"#16a34a",
              priceBg:"#dcfce7",
              pitch:tx("tab3Pitch"),
              desc:tx("tab3Desc"),
              includes:tx("tab3Includes"),
              color:"#16a34a",
              activeBg:"#f0fdf4",
              activeBorder:"#16a34a",
              tag:tx("tab3Tag")
            }
          ].map((tab, i) => {
            const active = mainTab === i;
            return (
              <button key={i} onClick={() => setMainTab(i)} style={{
                width:"100%", textAlign:"left", padding:0, borderRadius:14, cursor:"pointer",
                border: active ? `2px solid ${tab.activeBorder}` : "2px solid #e2e8f0",
                background: active ? tab.activeBg : "#fff",
                boxShadow: active ? `0 4px 16px ${tab.color}18` : "none",
                transition:"all 0.2s", overflow:"hidden"
              }}>
                <div style={{ padding:"14px 18px", display:"flex", alignItems:"center", justifyContent:"space-between",
                  borderBottom: active ? `1px solid ${tab.color}22` : "1px solid #f1f5f9" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:22 }}>{tab.icon}</span>
                    <div>
                      <div style={{ fontSize:15, fontWeight:800, color: active ? tab.color : "#0f172a" }}>{tab.label}</div>
                      <div style={{ fontSize:12, color:"#64748b", marginTop:1 }}>{tab.pitch}</div>
                    </div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4, flexShrink:0, marginLeft:12 }}>
                    <div style={{ fontSize:16, fontWeight:800, color:tab.priceColor,
                      background:tab.priceBg, padding:"3px 12px", borderRadius:10 }}>{tab.price}</div>
                    <div style={{ fontSize:10, fontWeight:700, color:tab.color, opacity:0.8 }}>{tab.tag}</div>
                  </div>
                </div>
                {active && (
                  <div style={{ padding:"14px 18px" }}>
                    <p style={{ fontSize:13, color:"#374151", lineHeight:1.7, marginBottom:14 }}>{tab.desc}</p>
                    <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:tab.color, marginBottom:8 }}>
                      {lang==="FR"?"Ce qui est inclus :":"What's included:"}
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                      {tab.includes.map((item, j) => (
                        <div key={j} style={{ display:"flex", alignItems:"flex-start", gap:6, fontSize:12, color:"#374151" }}>
                          <span style={{ color:tab.color, fontWeight:700, flexShrink:0, marginTop:1 }}>✓</span>
                          <span style={{ lineHeight:1.4 }}>{item}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop:14, textAlign:"center" }}>
                      <button
                        onClick={() => {
                          if (i === 2) return;
                          const el = document.getElementById("action-zone");
                          if (el) el.scrollIntoView({ behavior:"smooth", block:"start" });
                        }}
                        style={{ fontSize:12, fontWeight:700, color:tab.color, background:tab.activeBg,
                          padding:"8px 20px", borderRadius:8, border:`1px solid ${tab.color}33`,
                          display:"inline-block", cursor: i === 2 ? "default" : "pointer" }}>
                        {i === 2 ? "Browse the guide below →" : `Start for ${tab.price} →`}
                      </button>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Payment gate overlay */}
        {payGate.show ? (
          <Card>{renderPaymentGate()}</Card>
        ) : mainTab === 0 ? (
          <Card><div id="action-zone">{renderLabResults()}</div></Card>
        ) : mainTab === 2 ? (
          <Card>{renderSuppGuide()}</Card>
        ) : (
          <>
            {step < 6 && <ProgressBar step={step} />}
            <Card>
              <div id="action-zone">
              {renderStep()}</div>
              {step < 6 && (
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:24, paddingTop:20, borderTop:"1px solid #f1f5f9" }}>
                  {step > 0
                    ? <button onClick={() => setStep(s => s-1)} style={{ padding:"10px 20px", borderRadius:8, border:"1.5px solid #e2e8f0", background:"#fff", color:"#374151", cursor:"pointer", fontWeight:600, fontSize:14 }}>← Back</button>
                    : <div />}
                  {step < 5
                    ? <button onClick={() => setStep(s => s+1)} style={{ padding:"10px 24px", borderRadius:8, border:"none", background:"#0ea5e9", color:"#fff", cursor:"pointer", fontWeight:700, fontSize:14 }}>Continue →</button>
                    : <button onClick={() => generatePreview(1)} disabled={loading} style={{ padding:"10px 24px", borderRadius:8, border:"none", background: loading ? "#94a3b8" : "#16a34a", color:"#fff", cursor: loading ? "not-allowed" : "pointer", fontWeight:700, fontSize:14 }}>
                        {loading ? "Analysing..." : "Generate My Report →"}
                      </button>
                  }
                </div>
              )}
              {step === 6 && !loading && report && (
                <div style={{ marginTop:24, paddingTop:20, borderTop:"1px solid #f1f5f9", textAlign:"center" }}>
                  <button onClick={() => { setStep(0); setReport(null); }} style={{ padding:"10px 20px", borderRadius:8, border:"1.5px solid #e2e8f0", background:"#fff", color:"#374151", cursor:"pointer", fontWeight:600, fontSize:14 }}>Start a new report</button>
                </div>
              )}
            </Card>
          </>
        )}

        <div style={{ textAlign:"center", marginTop:16, fontSize:11, color:"#94a3b8" }}>
          <strong style={{ color:"#0ea5e9" }}>HealthDecoded</strong> · healthdecoded.com · {tx("footerNote")}
        </div>
      </div>
      </div>
    </div>
  );
}
