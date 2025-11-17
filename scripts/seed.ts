/**
 * Script de seed pour insérer des données de test dans la base MySQL locale
 *
 * Usage:
 *   tsx scripts/seed.ts
 *   ou
 *   pnpm seed
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { getDataSource } from '../src/lib/db'
import {
  Arbitre,
  CritereDefinitionEntity,
  Journee,
  Match,
  Saison,
  Team,
} from '../src/lib/entities'

// Charger les variables d'environnement depuis .env.local
config({ path: resolve(process.cwd(), '.env.local') })

async function cleanupDatabase() {
  const dataSource = await getDataSource()
  await dataSource.query('SET FOREIGN_KEY_CHECKS = 0')
  await dataSource.query('TRUNCATE TABLE votes')
  await dataSource.query('TRUNCATE TABLE matches')
  await dataSource.query('TRUNCATE TABLE journees')
  await dataSource.query('TRUNCATE TABLE saisons')
  await dataSource.query('TRUNCATE TABLE critere_definitions')
  await dataSource.query('TRUNCATE TABLE teams')
  await dataSource.query('TRUNCATE TABLE arbitres')
  await dataSource.query('SET FOREIGN_KEY_CHECKS = 1')
}

async function seed() {
  console.log('🌱 Démarrage du seed MySQL...\n')

  try {
    const dataSource = await getDataSource()
    await cleanupDatabase()

    const arbitreRepo = dataSource.getRepository(Arbitre)
    const teamRepo = dataSource.getRepository(Team)
    const saisonRepo = dataSource.getRepository(Saison)
    const journeeRepo = dataSource.getRepository(Journee)
    const matchRepo = dataSource.getRepository(Match)
    const critereRepo = dataSource.getRepository(CritereDefinitionEntity)

    // 1. Insérer des arbitres
    console.log('📝 Insertion des arbitres...')
    const arbitresData = [
      { nom: 'Fradj Abdellaoui', nom_ar: 'فرج عبد اللاوي', date_naissance: '1980-03-14' },
      { nom: 'Khaled Gouider', nom_ar: 'خالد قويدر', date_naissance: '1978-11-02' },
      { nom: 'Mohamed Ali Karouia', nom_ar: 'محمد علي كروية', date_naissance: '1985-07-19' },
      { nom: 'Nidhal Letaif', nom_ar: 'نضال لطيف', date_naissance: '1983-01-27' },
      { nom: 'Walid Mansri', nom_ar: 'وليد منصري', date_naissance: '1984-09-05' },
      { nom: 'Haythem Trabelsi', nom_ar: 'هيثم الترابلسي', date_naissance: '1982-04-22' },
      { nom: 'Bassem Belaid', nom_ar: 'باسم بلعيد', date_naissance: '1981-12-10' },
      { nom: 'Montassar Belarbi', nom_ar: 'منتصر بالربي', date_naissance: '1986-06-03' },
      { nom: 'Houssem Ben Sassi', nom_ar: 'حسام بن ساسي', date_naissance: '1987-08-18' },
      { nom: 'Khalil Jery', nom_ar: 'خليل جري', date_naissance: '1988-05-12' },
      { nom: 'Amir Lousif', nom_ar: 'أمير اللّوصيف', date_naissance: '1989-02-08' },
      { nom: 'Mehrez Malki', nom_ar: 'محرز المالكي', date_naissance: '1984-10-30' },
      { nom: 'Amir Ayadi', nom_ar: 'أمير عيادي', date_naissance: '1985-01-09' },
      { nom: 'Naim Hosni', nom_ar: 'نعيم حسني', date_naissance: '1980-07-25' },
      { nom: 'Hamza Jeaied', nom_ar: 'حمزة الجعيد', date_naissance: '1990-03-16' },
      { nom: 'Hosni Naili', nom_ar: 'حسني نيلي', date_naissance: '1982-08-01' },
      { nom: 'Aymen Nasri', nom_ar: 'أيمن نصري', date_naissance: '1983-02-21' },
      { nom: 'Sofiene Ouertani', nom_ar: 'سفيان الورتاني', date_naissance: '1979-12-28' },
      { nom: 'Seifeddine Ouertani', nom_ar: 'سيف الدين الورتاني', date_naissance: '1981-04-07' },
      { nom: 'Bedis Ben Saleh', nom_ar: 'بديس بن صالح', date_naissance: '1986-11-13' },
      { nom: 'Achref Harakati', nom_ar: 'أشرف الحركاتي', date_naissance: '1987-09-29' },
      { nom: 'Abdelhamid Badreddine', nom_ar: 'عبد الحميد بدر الدين', date_naissance: '1978-05-19' },
      { nom: 'Houssem Belhadj Ali', nom_ar: 'حسام بالحاج علي', date_naissance: '1984-06-24' },
      { nom: 'Houssem Boulaaras', nom_ar: 'حسام بوالعراس', date_naissance: '1985-12-06' },
      { nom: 'Amine Fgair', nom_ar: 'أمين فغير', date_naissance: '1989-09-17' },
      { nom: 'Sadok Selmi', nom_ar: 'صادق سلمي', date_naissance: '1975-01-04' },
    ].map((arbitre) => ({
      ...arbitre,
      nationalite: 'Tunisie',
      nationalite_ar: 'تونس',
      photo_url: null,
    }))

    const arbitres = await arbitreRepo.save(arbitresData)
    console.log(`✅ ${arbitres.length} arbitres insérés\n`)

    // 2. Insérer les équipes
    console.log('📝 Insertion des équipes...')
    const teamsPayload = [
      {
        abbr: 'EST',
        nom: 'Espérance Sportive de Tunis',
        nom_ar: 'الترجي الرياضي التونسي',
        city: 'Tunis',
        city_ar: 'تونس',
        stadium: 'Hammadi Agrebi Stadium',
        stadium_ar: 'ملعب حمادي العقربي',
        logo_url: 'https://static.flashscore.com/res/image/data/MwJ5a4AN-4U9lphOS.png',
      },
      {
        abbr: 'CA',
        nom: 'Club Africain',
        nom_ar: 'النادي الإفريقي',
        city: 'Tunis',
        city_ar: 'تونس',
        stadium: 'Hammadi Agrebi Stadium',
        stadium_ar: 'ملعب حمادي العقربي',
        logo_url: 'https://static.flashscore.com/res/image/data/vRAKqa7k-bob4M53H.png',
      },
      {
        abbr: 'ST',
        nom: 'Stade Tunisien',
        nom_ar: 'الملعب التونسي',
        city: 'Tunis (Le Bardo)',
        city_ar: 'تونس (الباردو)',
        stadium: 'Hédi Enneifer Stadium',
        stadium_ar: 'ملعب الهادي النيفر',
        logo_url: 'https://static.flashscore.com/res/image/data/O4tnXRT0-GOX2DTa1.png',
      },
      {
        abbr: 'CSS',
        nom: 'Club Sportif Sfaxien',
        nom_ar: 'النادي الرياضي الصفاقسي',
        city: 'Sfax',
        city_ar: 'صفاقس',
        stadium: 'Taïeb Mhiri Stadium',
        stadium_ar: 'ملعب الطيب المهيري',
        logo_url: 'https://static.flashscore.com/res/image/data/IJO1iuWH-8QjOsK1t.png',
      },
      {
        abbr: 'USM',
        nom: 'Union Sportive Monastirienne',
        nom_ar: 'الاتحاد المنستيري',
        city: 'Monastir',
        city_ar: 'المنستير',
        stadium: 'Mustapha Ben Jannet Stadium',
        stadium_ar: 'ملعب مصطفى بن جنات',
        logo_url: 'https://static.flashscore.com/res/image/data/2qGoLPU0-OlRcOd3K.png',
      },
      {
        abbr: 'ESZ',
        nom: 'Espérance Sportive de Zarzis',
        nom_ar: 'الترجي الرياضي الجرجيسي',
        city: 'Zarzis',
        city_ar: 'جرجيس',
        stadium: 'Abdessalam Kazouz Stadium',
        stadium_ar: 'ملعب عبد السلام كازوز',
        logo_url: 'https://static.flashscore.com/res/image/data/CrYMZZ7k-Eua5PHRE.png',
      },
      {
        abbr: 'ESM',
        nom: 'Étoile Sportive de Métlaoui',
        nom_ar: 'النجم الرياضي بالمتلوّي',
        city: 'Métlaoui',
        city_ar: 'المتلوي',
        stadium: 'Métlaoui Municipal Stadium',
        stadium_ar: 'الملعب البلدي بالمتلوي',
        logo_url: 'https://static.flashscore.com/res/image/data/hjsxnmgT-xQxsaZ8c.png',
      },
      {
        abbr: 'ESS',
        nom: 'Étoile Sportive du Sahel',
        nom_ar: 'النجم الرياضي الساحلي',
        city: 'Sousse',
        city_ar: 'سوسة',
        stadium: 'Sousse Olympic Stadium',
        stadium_ar: 'الملعب الأولمبي بسوسة',
        logo_url: 'https://static.flashscore.com/res/image/data/bqiV7K7k-8flds5zI.png',
      },
      {
        abbr: 'USBG',
        nom: 'Union Sportive de Ben Guerdane',
        nom_ar: 'الاتحاد الرياضي ببنقردان',
        city: 'Ben Guerdane',
        city_ar: 'بنقردان',
        stadium: '7 Mars Stadium',
        stadium_ar: 'ملعب 7 مارس',
        logo_url: 'https://static.flashscore.com/res/image/data/xriYShU0-bNN2piW2.png',
      },
      {
        abbr: 'JSO',
        nom: 'Jeunesse Sportive d’El Omrane',
        nom_ar: 'الشبيبة الرياضية العمرانية',
        city: 'Tunis (El Omrane)',
        city_ar: 'تونس (العمران)',
        stadium: 'Chedly Zouiten Stadium',
        stadium_ar: 'ملعب الشاذلي زويتن',
        logo_url: 'https://static.flashscore.com/res/image/data/hIOWhuXH-n1oCCiBU.png',
      },
      {
        abbr: 'CAB',
        nom: 'Club Athlétique Bizertin',
        nom_ar: 'النادي الرياضي البنزرتي',
        city: 'Bizerte',
        city_ar: 'بنزرت',
        stadium: '15 Octobre Stadium',
        stadium_ar: 'ملعب 15 أكتوبر',
        logo_url: 'https://static.flashscore.com/res/image/data/xbeeIiT0-bwMs7FAf.png',
      },
      {
        abbr: 'JSK',
        nom: 'Jeunesse Sportive Kairouanaise',
        nom_ar: 'الشبيبة الرياضية القيروانية',
        city: 'Kairouan',
        city_ar: 'القيروان',
        stadium: 'Hamda Laaouani Stadium',
        stadium_ar: 'ملعب حمودة العويني',
        logo_url: 'https://static.flashscore.com/res/image/data/8Ah2sSPq-beBXmIt1.png',
      },
      {
        abbr: 'ASM',
        nom: 'Avenir Sportif de La Marsa',
        nom_ar: 'المستقبل الرياضي بالمرسى',
        city: 'La Marsa (Tunis)',
        city_ar: 'المرسى',
        stadium: 'Abdelaziz Chtioui Stadium',
        stadium_ar: 'ملعب عبد العزيز الشتيوي',
        logo_url: 'https://static.flashscore.com/res/image/data/fZvCLvAN-zgzLiH7t.png',
      },
      {
        abbr: 'ASS',
        nom: 'Association Sportive de Soliman',
        nom_ar: 'الجمعية الرياضية بسليمان',
        city: 'Soliman',
        city_ar: 'سليمان',
        stadium: 'Soliman Municipal Stadium',
        stadium_ar: 'الملعب البلدي بسليمان',
        logo_url: 'https://static.flashscore.com/res/image/data/EN7rETRq-fZGJDt4L.png',
      },
      {
        abbr: 'OB',
        nom: 'Olympique Béja',
        nom_ar: 'الأولمبي الباجي',
        city: 'Béja',
        city_ar: 'باجة',
        stadium: 'Boujemâa Kmiti Stadium',
        stadium_ar: 'ملعب بوجمعة الكميتي',
        logo_url: 'https://static.flashscore.com/res/image/data/fHCZTY7k-lhdmzxg9.png',
      },
      {
        abbr: 'ASG',
        nom: 'Avenir Sportif de Gabès',
        nom_ar: 'المستقبل الرياضي بقابس',
        city: 'Gabès',
        city_ar: 'قابس',
        stadium: 'Gabès Municipal Stadium',
        stadium_ar: 'الملعب البلدي بقابس',
        logo_url: 'https://static.flashscore.com/res/image/data/lfQj8Ole-EgOnwaeL.png',
      },
    ]

    const teams = await teamRepo.save(teamsPayload)
    console.log(`✅ ${teams.length} équipes insérées\n`)

    const teamByAbbr = Object.fromEntries(
      teams.map((team) => [(team.abbr || team.nom).toUpperCase(), team])
    )

    // 3. Insérer une saison
    console.log('🗓️  Insertion de la saison 2025-2026...')
    const saison = await saisonRepo.save({
      nom: '2025-2026',
      nom_ar: '2025-2026',
      date_debut: '2025-08-15',
      date_fin: '2026-05-20',
    })

    // 4. Insérer des journées
    console.log('📅 Insertion des journées...')
    const totalJournees = 30
    const journeeSeasonStart = new Date('2025-09-06T15:00:00Z')
    const winterBreakWeeks = 6

    const computeJourneeDate = (index: number) => {
      const date = new Date(journeeSeasonStart)
      const extraWeeks = index >= 15 ? winterBreakWeeks : 0
      const daysToAdd = (index + extraWeeks) * 7
      date.setDate(date.getDate() + daysToAdd)
      return date
    }
    const journees = await journeeRepo.save(
      Array.from({ length: totalJournees }, (_, index) => ({
        saison_id: saison.id,
        numero: index + 1,
        date_journee: computeJourneeDate(index),
      }))
    )

    const journeeByNumero = Object.fromEntries(
      journees.map((journee) => [journee.numero, journee])
    )

    // 5. Insérer des matchs
    console.log('📝 Insertion des matchs...')
    const allerSchedule: Record<number, string[]> = {
      1: ['USM / ST', 'CA / ASM', 'ASG / EST', 'USBG / OB', 'ESM / CAB', 'JSK / ASS', 'CSS / ESZ', 'JSO / ESS'],
      2: ['ESZ / JSO', 'ASS / ESM', 'CAB / CSS', 'OB / ASG', 'ASM / USBG', 'ST / JSK', 'EST / USM', 'ESS / CA'],
      3: ['USBG / ESS', 'ASG / ASM', 'ESM / CSS', 'JSO / CAB', 'USM / OB', 'JSK / EST', 'ASS / ST', 'CA / ESZ'],
      4: ['ASM / USM', 'EST / ASS', 'ESZ / USBG', 'CAB / CA', 'CSS / JSO', 'ESM / ASG', 'OB / JSK', 'ST / ESM'],
      5: ['ST / EST', 'ASG / ESZ', 'JSK / ASM', 'ESM / JSO', 'USBG / CAB', 'ASS / OB', 'CA / CSS', 'USM / ESS'],
      6: ['ESS / JSK', 'JSO / CA', 'EST / ESM', 'OB / ST', 'CAB / JSO', 'ESZ / USM', 'CSS / USBG', 'ASM / ASS'],
      7: ['ESM / CA', 'JSK / ESZ', 'ST / ASM', 'USM / CAB', 'EST / OB', 'JSO / ASM', 'ASG / CSS', 'ASS / ESS'],
      8: ['CAB / JSK', 'ASM / EST', 'OB / ESM', 'ESS / ST', 'JSO / ASG', 'CSS / USM', 'CA / USBG', 'ESZ / ASS'],
      9: ['ASG / CA', 'ST / ESZ', 'OB / ASM', 'USM / JSO', 'ASS / CAB', 'JSK / CSS', 'ESM / USBG', 'EST / ESS'],
      10: ['JSO / JSK', 'ESZ / EST', 'ASM / ESM', 'CAB / ST', 'USBG / ASG', 'CA / USM', 'ESS / OB', 'CSS / ASS'],
      11: ['JSK / CA', 'OB / ESZ', 'ASS / JSO', 'ESM / ASG', 'EST / CAB', 'ST / CSS', 'USM / USBG', 'ASM / ESS'],
      12: ['USBG / JSK', 'CSS / EST', 'ESS / USM', 'JSO / ST', 'ESZ / ASM', 'ASG / USM', 'CAB / OB', 'CA / ASS'],
      13: ['ST / CA', 'ESS / ESZ', 'EST / JSO', 'JSK / ASG', 'ESM / USM', 'ASM / CAB', 'OB / CSS', 'ASS / USBG'],
      14: ['USM / JSK', 'CA / EST', 'ESS / JSO', 'USBG / ST', 'CSS / ASM', 'JSO / OB', 'CAB / ESS', 'ASG / ASS'],
      15: ['OB / CA', 'JSK / ESM', 'ASM / JSO', 'ST / ASG', 'ASS / USM', 'ESZ / CAB', 'ESS / CSS', 'EST / USBG'],
    }

    const retourScheduleEntries = Object.entries(allerSchedule).map(([numero, matches]) => {
      const retourNumero = Number(numero) + 15
      const retourMatches = matches.map((entry) => {
        const [home, away] = entry.split('/').map((team) => team.trim())
        return `${away} / ${home}`
      })
      return [retourNumero, retourMatches] as const
    })

    const schedule: Record<number, string[]> = {
      ...allerSchedule,
      ...Object.fromEntries(retourScheduleEntries),
    }

    const scheduleCorrections: Record<string, string> = {
      ESB: 'ESM',
      JSG: 'JSO',
      USMO: 'USM',
    }


    const matchesEntities = Object.entries(schedule).flatMap(([numero, matchesList]) => {
      const journee = journeeByNumero[Number(numero)]
      if (!journee) {
        throw new Error(`Journee ${numero} introuvable`)
      }

      return matchesList.map((entry, index) => {
        const [rawHome, rawAway] = entry.split('/').map((part) => part.trim().toUpperCase())
        const homeAbbr = scheduleCorrections[rawHome] || rawHome
        const awayAbbr = scheduleCorrections[rawAway] || rawAway

        const home = teamByAbbr[homeAbbr]
        const away = teamByAbbr[awayAbbr]

        if (!home || !away) {
          throw new Error(`Équipe introuvable pour la confrontation ${entry}`)
        }

        const arbitreIndex = (Number(numero) + index) % arbitres.length
        const arbitre = arbitres[arbitreIndex]

        const journeeDate = journee.date_journee
          ? new Date(journee.date_journee)
          : computeJourneeDate(Number(numero) - 1)
        const matchDate = new Date(journeeDate)
        matchDate.setHours(16 + index, 0, 0, 0)

        return matchRepo.create({
          journee_id: journee.id,
          journee,
          equipe_home: home,
          equipe_home_id: home.id,
          equipe_away: away,
          equipe_away_id: away.id,
          date: matchDate,
          score_home: null,
          score_away: null,
          arbitre,
          arbitre_id: arbitre.id,
        })
      })
    })

    const matchs = await matchRepo.save(matchesEntities)
    console.log(`✅ ${matchs.length} matchs insérés\n`)

    // 6. Insérer les définitions de critères
    console.log('🧾 Insertion des critères d\'analyse...')
    const criteresDefinitions: Array<Omit<CritereDefinitionEntity, 'created_at'>> = [
      {
        id: 'sifflet',
        categorie: 'arbitre',
        label_fr: 'Sifflet (faute / hors-jeu)',
        label_ar: 'الصافرة (الأخطاء / التسلل)',
        description_fr:
          'Évalue la précision du sifflet dans les fautes et les hors-jeu, la clarté du son, le timing et la cohérence.',
        description_ar:
          'تقييم دقّة الصافرة في الأخطاء وحالات التسلل، وضوح الصوت، التوقيت، وانسجام التدخلات.',
      },
      {
        id: 'decisions',
        categorie: 'arbitre',
        label_fr: 'Décisions (cartons jaunes / rouges)',
        label_ar: 'القرارات (البطاقات الصفراء / الحمراء)',
        description_fr:
          'Analyse la justesse des cartons, la cohérence disciplinaire et la gestion des situations tendues.',
        description_ar:
          'تحليل صحة البطاقات، الانسجام في القرارات الانضباطية وقدرة الحكم على إدارة المواقف الصعبة.',
      },
      {
        id: 'communication',
        categorie: 'arbitre',
        label_fr: 'Communication (VAR, assistants, joueurs)',
        label_ar: 'التواصل (الفار، المساعدين، اللاعبين)',
        description_fr:
          'Mesure la qualité de la communication avec les joueurs, capitaines, VAR et assistants.',
        description_ar:
          'تقييم جودة التواصل مع اللاعبين، القادة، الفار، وحكام الخط.',
      },
      {
        id: 'deplacement',
        categorie: 'arbitre',
        label_fr: 'Déplacement et placement',
        label_ar: 'التحرك والتمركز',
        description_fr:
          'Évalue le placement, la posture, la lecture du jeu et la capacité à anticiper pour être bien positionné.',
        description_ar:
          'تقييم التمركز، الوضعية، قراءة اللعب، والاستباق للتموضع الصحيح.',
      },
      {
        id: 'var_qualite',
        categorie: 'var',
        label_fr: 'VAR',
        label_ar: 'استخدام تقنية الفار',
        description_fr:
          'Analyse la qualité des interventions VAR, la rapidité, la clarté et le respect du protocole.',
        description_ar:
          'تحليل جودة تدخلات الفار، السرعة، وضوح القرار، واحترام بروتوكول الفار.',
      },
      {
        id: 'assistant_collaboration',
        categorie: 'assistant',
        label_fr: 'Travail des ',
        label_ar: 'عمل الحكام المساعدين',
        description_fr:
          'Évalue la précision des hors-jeu, la cohérence avec l\'arbitre central et la qualité des signalisations.',
        description_ar:
          'تقييم دقّة التسلل، الانسجام مع الحكم الرئيسي، وجودة الإشارات.',
      },
    ]

    const criteres = await critereRepo.save(criteresDefinitions)
    console.log(`✅ ${criteres.length} critères insérés\n`)

    console.log('🎉 Seed MySQL terminé avec succès!')
    console.log(`\nRésumé:`)
    console.log(`- ${arbitres.length} arbitres`)
    console.log(`- ${teams.length} équipes`)
    console.log(`- 1 saison, ${journees.length} journées`)
    console.log(`- ${matchs.length} matchs`)
    console.log(`- ${criteres.length} critères d'analyse`)
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error)
    process.exit(1)
  }
}

seed()

