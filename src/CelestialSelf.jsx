import React, { useState, useEffect, useMemo,  } from 'react';
import { getNatalChart } from './utils/ephemeris.js';
import { geocodeCity } from './utils/geocode.js';
import { fetchNatalChartFromApi } from './utils/ephemerisApi.js';

// ============================================================================
// CELESTIAL SELF - Personal Astrology Companion
// Integrating Western Astrology with Yoruba Cosmological Wisdom
// ============================================================================

// Ephemeris calculation utilities (simplified for browser)
const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Planet list is provided by ephemeris utilities when needed.

const ASPECTS = {
  conjunction: { angle: 0, orb: 8, symbol: '☌', nature: 'major' },
  sextile: { angle: 60, orb: 6, symbol: '⚹', nature: 'soft' },
  square: { angle: 90, orb: 8, symbol: '□', nature: 'hard' },
  trine: { angle: 120, orb: 8, symbol: '△', nature: 'soft' },
  opposition: { angle: 180, orb: 8, symbol: '☍', nature: 'hard' }
};

const PLANET_GLYPHS = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇'
};

const SIGN_GLYPHS = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓'
};

const ELEMENTS = {
  Aries: 'fire', Taurus: 'earth', Gemini: 'air', Cancer: 'water',
  Leo: 'fire', Virgo: 'earth', Libra: 'air', Scorpio: 'water',
  Sagittarius: 'fire', Capricorn: 'earth', Aquarius: 'air', Pisces: 'water'
};

// Orisha correspondences for planets
const ORISHA_CORRESPONDENCES = {
  Sun: { orisha: 'Shango', domain: 'Thunder King', traits: 'vitality, charisma, leadership, the danger of hubris' },
  Moon: { orisha: 'Yemaya', domain: 'Ocean Mother', traits: 'subconscious, protection, emotional depth, nurturing' },
  Mercury: { orisha: 'Eshu', domain: 'The Trickster', traits: 'communication, crossroads, languages, karma enforcement' },
  Venus: { orisha: 'Oshun', domain: 'River Sorceress', traits: 'attraction, beauty, diplomacy, sweet persuasion' },
  Mars: { orisha: 'Ogun', domain: 'Iron & War', traits: 'raw drive, pioneer spirit, productive friction, tools' },
  Jupiter: { orisha: 'Obatala', domain: 'White Cloth', traits: 'wisdom, ethics, purity, expansion, cool judgment' },
  Saturn: { orisha: 'Obatala', domain: 'White Cloth', traits: 'structure, discipline, karma, the Senex archetype' },
  Uranus: { orisha: 'Oya', domain: 'Wind of Change', traits: 'transformation, sudden shifts, liberation, storms' },
  Neptune: { orisha: 'Olokun', domain: 'Ocean Depths', traits: 'mystery, dreams, the unconscious, dissolution' },
  Pluto: { orisha: 'Iku', domain: 'Transformation', traits: 'death/rebirth, deep change, power, regeneration' }
};

// Extended Orisha Profiles - Deeper wisdom beyond planetary correspondences
// Educational content honoring living Yoruba traditions
const EXTENDED_ORISHA_PROFILES = {
  'Nana Buruku': {
    name: 'Nana Buruku',
    title: 'The Primordial Mother',
    domain: 'Ancestral Wisdom, Ancient Waters, Creation Before Form',
    planetaryLink: 'Moon (deeper octave), Saturn, ancestral connections',
    colors: ['Purple', 'Deep Blue', 'White'],
    element: 'Primal Water and Earth',
    symbols: ['Ancient clay pot', 'Purple cloth', 'Cowrie shells', 'Egúngún mask'],

    mythology: "Nana Buruku is the grandmother of the Orishas, older even than Obatala. She exists in the liminal space between chaos and creation, where form has not yet crystallized from the cosmic waters. In some traditions, she is the mother of Babalú-Ayé and Oshumare, and her wisdom predates the iron age—she refuses Ogun's metal tools, working only with wood and clay. She represents the wisdom that lives in ancestral memory, the knowing that comes before words.",

    sacred: "Nana's energy is especially present in swamps, marshes, and places where water meets earth in ambiguous ways. She governs transitions between life and death, holding the souls of the departed before they journey to Orun. Her wisdom is the wisdom of elders who have seen civilizations rise and fall.",

    offerings: ['Purple yams', 'White flowers', 'Coconut', 'Clear water', 'Clay vessels', 'Lavender'],

    astrological: "Nana Buruku resonates with deep Moon placements (especially Moon in Scorpio or 8th house), strong Saturn (wisdom through time), and emphasized ancestral houses (4th, 8th, 12th). She walks with those who carry ancestral gifts, psychic mediums, and anyone whose wisdom seems older than their years.",

    signsOfConnection: [
      'Deep connection to ancestors and lineage',
      'Comfort with death, endings, and transitions',
      'Preference for ancient, traditional ways over modern innovations',
      'Psychic or mediumistic abilities',
      'Wisdom that seems to come from beyond this lifetime',
      'Attraction to purple, deep waters, and sacred spaces'
    ],

    workingWith: "To work with Nana Buruku is to honor the ancestors and accept that some wisdom cannot be rushed. She teaches patience, reverence, and the understanding that you are not the first to walk your path. Light purple candles, tend ancestral altars, and listen to the voices that speak through your bones.",

    shadow: "Nana's shadow appears as excessive attachment to the past, inability to embrace necessary change, or using age/tradition as an excuse for stagnation. She reminds us that even ancient wisdom must be applied to present circumstances.",

    integration: "Integrate Nana's wisdom by honoring your lineage while living your unique destiny. The ancestors guide, but you must walk. Respect tradition while remaining present to what this moment requires."
  },

  'Babalú-Ayé': {
    name: 'Babalú-Ayé',
    title: 'The Wounded Healer',
    domain: 'Disease and Healing, Earth, Humility, Compassion',
    planetaryLink: 'Saturn (suffering and medicine), Pluto (death and healing), Chiron (wounded healer)',
    colors: ['Purple', 'Brown', 'Burlap', 'Earth tones'],
    element: 'Earth',
    symbols: ['Crutches', 'Broom', 'Sackcloth', 'Dogs', 'Cowrie shells'],

    mythology: "Babalú-Ayé, also known as Shopona or Omolu, is the Orisha of infectious disease, leprosy, and healing. His myths speak of illness endured and overcome—cast out by his father, rejected for his afflictions, he learned compassion through suffering. Dressed in sackcloth to hide his scars, accompanied by dogs who licked his wounds, he embodies the sacred truth that those who have suffered most deeply often heal most profoundly. He both brings and cures disease, teaching that illness carries medicine.",

    sacred: "Babalú-Ayé governs hospitals, quarantine spaces, and anywhere the sick are isolated. He understands the loneliness of suffering and the power of compassion to heal what medicine cannot touch. His energy is especially present during plagues and pandemics—collective illness that humbles humanity.",

    offerings: ['Popcorn (a symbol of transformation)', 'Toasted corn', 'Black-eyed peas', 'Purple onions', 'Cigars', 'Palm oil', 'Humble foods'],

    astrological: "Babalú-Ayé walks with those who have strong Saturn-Pluto contacts, emphasized 6th or 12th houses, or Chiron prominently placed. He is the patron of healers who have been wounded, those who work with chronic illness, and anyone whose suffering has become their medicine for others.",

    signsOfConnection: [
      'Personal experience with illness or disability',
      'Deep compassion for the suffering of others',
      'Work in healing, medicine, or caregiving',
      'Understanding that wounds can become wisdom',
      'Humility born from hardship',
      'Ability to be present with pain without flinching'
    ],

    workingWith: "To work with Babalú-Ayé is to accept suffering as a teacher without becoming its victim. He asks: What has your pain taught you? How can your scars serve others? Honor him by tending to the sick, feeding the hungry, and never looking away from suffering.",

    shadow: "Babalú's shadow manifests as identifying so deeply with woundedness that healing becomes impossible, or using past suffering to justify present cruelty. He reminds us that the wounded healer must heal, not merely wound.",

    integration: "Integrate Babalú's medicine by transforming your deepest wounds into your greatest gifts. Let what broke you become what allows you to hold broken things with care."
  },

  'Oshumare': {
    name: 'Oshumare',
    title: 'The Rainbow Serpent',
    domain: 'Cycles, Continuity, Duality, Transformation, Rain and Rainbow',
    planetaryLink: 'Lunar Nodes (karmic axis), Mercury (movement between worlds), Neptune (transcendence)',
    colors: ['All colors of the rainbow', 'Iridescent', 'Green and Yellow'],
    element: 'Water and Air (rain becoming rainbow)',
    symbols: ['Rainbow', 'Serpent', 'Belt', 'Chain', 'Umbilical cord'],

    mythology: "Oshumare is the rainbow serpent, the divine force that connects heaven and earth, Orun and Aiye. In Yoruba cosmology, the rainbow is not just beauty—it is Oshumare's body stretched between realms, carrying water from earth to sky and back again. Oshumare governs all cycles: day and night, wet season and dry, life and death. Some traditions describe Oshumare as both male and female, embodying the truth that apparent opposites are phases of one continuous whole. The serpent sheds its skin—death and rebirth in one eternal motion.",

    sacred: "Oshumare's presence is most visible in rainbows, especially those that appear during rain and sunshine simultaneously. He governs the umbilical cord (the first serpent we all knew), the cycles of the moon, and the eternal return of seasons. His energy teaches that endings are beginnings, that what seems separate is connected.",

    offerings: ['Rainbow-colored foods', 'Fruits', 'Honey', 'Coconut', 'Colorful beads', 'Fresh water during rainfall'],

    astrological: "Oshumare resonates with the Lunar Nodes (karmic axis, eternal return), mutable signs (Gemini, Virgo, Sagittarius, Pisces), and planets changing houses or signs. He walks with those experiencing major life transitions, anyone working with cycles and patterns, and those who embody apparent contradictions.",

    signsOfConnection: [
      'Comfort with contradiction and paradox',
      'Recognition of cyclical patterns in life',
      'Ability to bridge seemingly opposite worlds',
      'Fascination with transformation and metamorphosis',
      'Attraction to rainbows, serpents, and symbols of continuity',
      'Understanding that endings seed new beginnings'
    ],

    workingWith: "To work with Oshumare is to surrender to life's rhythms rather than resisting them. Honor him during transitions, life passages, and moments when opposites meet. Meditate on the rainbow's lesson: all colors exist within white light, all experiences within one consciousness.",

    shadow: "Oshumare's shadow appears as getting trapped in endless cycles without learning their lessons, or using 'both/and' thinking to avoid necessary choices. He reminds us that while all is connected, sometimes we must choose a direction.",

    integration: "Integrate Oshumare's wisdom by seeing the connections between apparent opposites in your life. What cycle is completing? What is being born from what is dying? Trust that the serpent sheds its skin because it has grown."
  },

  'Ibeji': {
    name: 'Ibeji',
    title: 'The Divine Twins',
    domain: 'Sacred Duality, Inner Child, Joy, Playfulness, Balance',
    planetaryLink: 'Gemini, 3rd House, Mercury (communication and duality), Moon (inner child)',
    colors: ['Red and White', 'Blue and Yellow', 'Bright playful colors'],
    element: 'Air',
    symbols: ['Twin dolls', 'Marbles', 'Candy', 'Toys', 'Paired objects'],

    mythology: "The Ibeji are the divine twins, representing the sacred bond between siblings, the duality of existence, and the eternal innocence of the child-spirit. In Yoruba tradition, twins are considered especially blessed by the divine—double portions of Ori. When one twin dies, a sacred doll is created to house their spirit. The Ibeji teach that separation is an illusion; what appears as two is always connected at the root. They embody joy, playfulness, curiosity, and the wisdom that only children possess—the wisdom of being fully present.",

    sacred: "The Ibeji govern childhood, sibling relationships, and the inner child that lives in every adult. They remind us that play is sacred, that joy is a form of worship, and that curiosity is a spiritual practice. Their energy is present in laughter, games, and moments of pure delight.",

    offerings: ['Candy', 'Toys', 'Sweet treats', 'Paired fruits (two bananas, two apples)', 'Flowers', 'Anything that brings joy'],

    astrological: "The Ibeji resonate with strong Gemini placements, emphasized 3rd house, multiple planets in pairs or aspects, and those with actual twin siblings. They walk with anyone seeking to reconnect with their inner child, playfulness, or lost sense of wonder.",

    signsOfConnection: [
      'Deep bond with siblings or chosen family',
      'Youthful energy regardless of chronological age',
      'Natural playfulness and sense of fun',
      'Ability to see both sides of situations',
      'Inner child work or healing childhood wounds',
      'Attraction to bright colors, games, and simple joys'
    ],

    workingWith: "To work with the Ibeji is to remember how to play, how to laugh without reason, how to be curious without agenda. Honor them by feeding your inner child—literally and metaphorically. Do something purely for joy. Let their medicine remind you that seriousness is not the same as depth.",

    shadow: "The Ibeji's shadow manifests as perpetual immaturity, refusal to grow up, or using childishness to avoid responsibility. They remind us that honoring the inner child is different from being childish—one is integration, the other is avoidance.",

    integration: "Integrate the Ibeji's gifts by bringing more play into your spiritual practice. What if prayer could be joyful? What if growth could be fun? Let yourself laugh at the cosmic joke: you are both ancient soul and eternal child."
  },

  'Orunmila': {
    name: 'Orunmila',
    title: 'Witness to Destiny',
    domain: 'Divination, Destiny, Wisdom, Ifá, Divine Knowledge',
    planetaryLink: 'Mercury (knowledge and communication), Jupiter (wisdom and teaching), 9th House (higher learning)',
    colors: ['Green and Yellow', 'Brown and Ivory'],
    element: 'Air (wisdom and intellect)',
    symbols: ['Ifá divination tray', 'Palm nuts', 'Opele chain', 'Cowrie shells', 'Books'],

    mythology: "Orunmila, also called Ifá, is the Orisha of wisdom and divination. According to mythology, Orunmila was present when each soul chose their destiny before birth—he witnessed every Ori selecting its path. He is the grand archivist of fate, the keeper of the Odu (the 256 sacred chapters of cosmic wisdom). Orunmila does not control destiny; he reveals it. His priests, the Babalawos, study for decades to interpret the patterns he shows. His wisdom is not abstract but practical—Ifá divination provides specific guidance for specific circumstances.",

    sacred: "Orunmila's energy is present in all forms of divination, in the study of sacred texts, and in the moment of clarity when truth reveals itself. He governs not just mystical knowledge but practical wisdom—the kind that helps you navigate life skillfully. To consult Ifá is to ask: What did my Ori agree to before birth, and how can I fulfill it?",

    offerings: ['Palm oil', 'Yams', 'Kola nuts', 'Honey', 'White cloth', 'Books and study materials'],

    astrological: "Orunmila walks with those who have strong Mercury-Jupiter aspects, emphasized 9th or 3rd houses, or a gift for pattern recognition and divination. He is the patron of astrologers, tarot readers, counselors, and anyone who helps others see their path more clearly.",

    signsOfConnection: [
      'Natural gift for divination or pattern recognition',
      'Deep respect for wisdom and learning',
      'Ability to see the bigger picture in situations',
      'Drawn to study sacred texts or esoteric knowledge',
      'Serve as a counselor or guide for others',
      'Understanding that knowledge must serve life'
    ],

    workingWith: "To work with Orunmila is to commit to the path of wisdom—not just accumulating knowledge, but embodying it. Study divination systems, whether Ifá, astrology, tarot, or any tool that reveals pattern. Ask yourself: What did I come here to learn? What did I come here to teach?",

    shadow: "Orunmila's shadow appears as using knowledge to feel superior, becoming trapped in the intellectual understanding of life rather than living it, or claiming to know another's path better than they do. He reminds us that true wisdom is humble and serves others.",

    integration: "Integrate Orunmila's medicine by seeking to understand your destiny while honoring your free will. Destiny is not a prison but a seed—it must be watered by choice. Let wisdom inform action, but never replace it."
  }
};

// Cultural disclaimer for Orisha content
const YORUBA_CULTURAL_DISCLAIMER = "The Orisha wisdom shared in Celestial Self is educational and inspirational, honoring the living Yoruba religious traditions of West Africa and the African diaspora. This content is not a substitute for traditional Ifá divination or initiated religious practice. We encourage those drawn to these teachings to seek out legitimate teachers and communities. Our intention is to introduce these profound spiritual concepts with reverence, not to appropriate or oversimplify a complex, sacred tradition.";

// Ephemeris calculations are handled by `src/utils/ephemeris.js` (`getNatalChart`).
// Legacy simplified helper functions removed to avoid duplication and unused-vars warnings.

const calculateAspects = (positions) => {
  const aspects = [];
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const diff = Math.abs(positions[i].longitude - positions[j].longitude);
      const angle = Math.min(diff, 360 - diff);

      for (const [name, aspect] of Object.entries(ASPECTS)) {
        if (Math.abs(angle - aspect.angle) <= aspect.orb) {
          aspects.push({
            planet1: positions[i].planet,
            planet2: positions[j].planet,
            aspect: name,
            symbol: aspect.symbol,
            nature: aspect.nature,
            orb: Math.abs(angle - aspect.angle).toFixed(1)
          });
        }
      }
    }
  }
  return aspects;
};

// Which Orisha Walks With You? - Quiz Logic
// Analyzes natal chart to determine strongest Orisha connections
const calculateOrishaAffinities = (positions, birthData) => {
  const scores = {
    'Nana Buruku': { score: 0, reasons: [] },
    'Babalú-Ayé': { score: 0, reasons: [] },
    'Oshumare': { score: 0, reasons: [] },
    'Ibeji': { score: 0, reasons: [] },
    'Orunmila': { score: 0, reasons: [] },
    'Shango': { score: 0, reasons: [] },
    'Yemaya': { score: 0, reasons: [] },
    'Eshu': { score: 0, reasons: [] },
    'Oshun': { score: 0, reasons: [] },
    'Ogun': { score: 0, reasons: [] },
    'Obatala': { score: 0, reasons: [] },
    'Oya': { score: 0, reasons: [] },
    'Olokun': { score: 0, reasons: [] },
    'Iku': { score: 0, reasons: [] }
  };

  if (!positions || positions.length === 0) return [];

  // Count planets in each house
  const houseCounts = {};
  positions.forEach(p => {
    houseCounts[p.house] = (houseCounts[p.house] || 0) + 1;
  });

  // Calculate elemental balance
  const elementCounts = { fire: 0, earth: 0, air: 0, water: 0 };
  positions.forEach(p => {
    const element = ELEMENTS[p.sign];
    if (element) elementCounts[element]++;
  });

  // Score based on planetary placements (primary Orishas)
  positions.forEach(p => {
    const orisha = ORISHA_CORRESPONDENCES[p.planet]?.orisha;
    if (orisha && scores[orisha]) {
      scores[orisha].score += 10;
      scores[orisha].reasons.push(`${p.planet} in ${p.sign} connects you to ${orisha}'s energy`);
    }
  });

  // Nana Buruku - Ancestral houses (4th, 8th, 12th), Moon in Scorpio, strong Saturn
  const moon = positions.find(p => p.planet === 'Moon');
  const saturn = positions.find(p => p.planet === 'Saturn');

  if (moon && moon.sign === 'Scorpio') {
    scores['Nana Buruku'].score += 15;
    scores['Nana Buruku'].reasons.push('Moon in Scorpio - deep ancestral connection');
  }
  if (moon && moon.house === 8) {
    scores['Nana Buruku'].score += 12;
    scores['Nana Buruku'].reasons.push('Moon in 8th house - psychic and transformative gifts');
  }
  if ((houseCounts[4] || 0) >= 2) {
    scores['Nana Buruku'].score += 8;
    scores['Nana Buruku'].reasons.push('Strong 4th house - ancestral wisdom keeper');
  }
  if ((houseCounts[12] || 0) >= 2) {
    scores['Nana Buruku'].score += 10;
    scores['Nana Buruku'].reasons.push('Strong 12th house - connection to spirit realm');
  }
  if (saturn && (houseCounts[saturn.house] || 0) >= 2) {
    scores['Nana Buruku'].score += 7;
    scores['Nana Buruku'].reasons.push('Strong Saturn placement - wisdom through time');
  }

  // Babalú-Ayé - 6th house, 12th house, Saturn-Pluto contacts, Chiron
  if ((houseCounts[6] || 0) >= 2) {
    scores['Babalú-Ayé'].score += 12;
    scores['Babalú-Ayé'].reasons.push('Strong 6th house - healer and servant');
  }
  if ((houseCounts[12] || 0) >= 2) {
    scores['Babalú-Ayé'].score += 10;
    scores['Babalú-Ayé'].reasons.push('Strong 12th house - compassion for suffering');
  }
  const pluto = positions.find(p => p.planet === 'Pluto');
  if (saturn && pluto && Math.abs(saturn.house - pluto.house) <= 1) {
    scores['Babalú-Ayé'].score += 15;
    scores['Babalú-Ayé'].reasons.push('Saturn-Pluto connection - wounded healer archetype');
  }

  // Oshumare - Mutable signs, Nodes, transitions
  const mutableSigns = ['Gemini', 'Virgo', 'Sagittarius', 'Pisces'];
  const mutableCount = positions.filter(p => mutableSigns.includes(p.sign)).length;
  if (mutableCount >= 4) {
    scores['Oshumare'].score += 12;
    scores['Oshumare'].reasons.push('Strong mutable energy - master of transitions and cycles');
  }
  const mercury = positions.find(p => p.planet === 'Mercury');
  const neptune = positions.find(p => p.planet === 'Neptune');
  if (mercury && neptune && Math.abs(mercury.longitude - neptune.longitude) < 10) {
    scores['Oshumare'].score += 13;
    scores['Oshumare'].reasons.push('Mercury-Neptune - bridge between worlds');
  }

  // Ibeji - Gemini placements, 3rd house, paired aspects
  const geminiPlanets = positions.filter(p => p.sign === 'Gemini').length;
  if (geminiPlanets >= 2) {
    scores['Ibeji'].score += 15;
    scores['Ibeji'].reasons.push('Multiple planets in Gemini - twin energy and duality');
  }
  if ((houseCounts[3] || 0) >= 2) {
    scores['Ibeji'].score += 12;
    scores['Ibeji'].reasons.push('Strong 3rd house - communication and sibling bonds');
  }
  if (moon && moon.sign === 'Gemini') {
    scores['Ibeji'].score += 10;
    scores['Ibeji'].reasons.push('Moon in Gemini - inner child seeks play and curiosity');
  }

  // Orunmila - 9th house, 3rd house, Mercury-Jupiter, wisdom seekers
  if ((houseCounts[9] || 0) >= 2) {
    scores['Orunmila'].score += 15;
    scores['Orunmila'].reasons.push('Strong 9th house - seeker of higher wisdom');
  }
  const jupiter = positions.find(p => p.planet === 'Jupiter');
  if (mercury && jupiter && Math.abs(mercury.longitude - jupiter.longitude) < 12) {
    scores['Orunmila'].score += 14;
    scores['Orunmila'].reasons.push('Mercury-Jupiter aspect - wisdom communicator');
  }
  if (mercury && mercury.sign === 'Sagittarius') {
    scores['Orunmila'].score += 10;
    scores['Orunmila'].reasons.push('Mercury in Sagittarius - philosophical mind');
  }

  // Boost scores for primary planet Orishas (Sun, Moon prominence)
  const sun = positions.find(p => p.planet === 'Sun');
  if (sun) {
    scores['Shango'].score += 5; // Everyone has Sun, but it's their core
  }
  if (moon) {
    scores['Yemaya'].score += 5; // Everyone has Moon, emotional core
  }

  // Convert to array and sort by score
  const results = Object.entries(scores)
    .map(([name, data]) => ({
      orisha: name,
      score: data.score,
      reasons: data.reasons
    }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3); // Top 3 Orishas

  return results;
};

// Moon phase calculation
const getMoonPhase = (date = new Date()) => {
  const lunarCycle = 29.53;
  const knownNewMoon = new Date('2000-01-06');
  const days = (date - knownNewMoon) / (1000 * 60 * 60 * 24);
  const phase = ((days % lunarCycle) / lunarCycle) * 100;
  
  if (phase < 3.7) return { name: 'New Moon', emoji: '🌑', illumination: phase * 2 };
  if (phase < 25) return { name: 'Waxing Crescent', emoji: '🌒', illumination: phase * 2 };
  if (phase < 28.7) return { name: 'First Quarter', emoji: '🌓', illumination: 50 };
  if (phase < 50) return { name: 'Waxing Gibbous', emoji: '🌔', illumination: 50 + (phase - 25) * 2 };
  if (phase < 53.7) return { name: 'Full Moon', emoji: '🌕', illumination: 100 };
  if (phase < 75) return { name: 'Waning Gibbous', emoji: '🌖', illumination: 100 - (phase - 50) * 2 };
  if (phase < 78.7) return { name: 'Last Quarter', emoji: '🌗', illumination: 50 };
  return { name: 'Waning Crescent', emoji: '🌘', illumination: (100 - phase) * 2 };
};

// RAG-style interpretation system
const getInterpretation = (type, data) => {
  const interpretations = {
    sunSign: {
      Aries: {
        western: "Your Sun in Aries marks you as the cosmic pioneer, the Hero archetype initiating new cycles. Your core identity burns with cardinal fire—you are here to begin, to lead, to courageously step where others hesitate.",
        yoruba: "Shango's thunder echoes in your spirit. Like the Fourth Alafin of Oyo, you carry the axe of leadership and the fire of direct action. Your Ori chose a destiny of visibility—remember that true kingship serves the people.",
        synthesis: "The Primal Triad begins with your solar fire. Channel Ogun's productive friction into meaningful battles. Your Iwa-Pele (good character) lies in tempering impulsiveness with the patience that transforms raw drive into lasting achievement."
      },
      Taurus: {
        western: "Your Sun in Taurus grounds you in the Earth element's stabilizing wisdom. You are the Builder, the one who transforms vision into tangible form through patience and persistent effort.",
        yoruba: "Ile (Earth) itself speaks through you. Like Oshun's patient river that carves canyons over centuries, your power lies in steady accumulation rather than sudden storms.",
        synthesis: "Your Ori chose the path of material mastery. The Yoruba understanding of Ayanmo (destiny) reminds you that wealth without character crumbles. Build your empire on the foundation of Iwa-Pele."
      },
      Gemini: {
        western: "Your Sun in Gemini gifts you with Mercury's quicksilver mind—the eternal student, the messenger between worlds, the one who sees the sacred in duality.",
        yoruba: "Eshu walks beside you at every crossroads. The Trickster's energy teaches that communication is sacred technology, and words create worlds. Your Odu speaks of gathering wisdom.",
        synthesis: "Your mind is the bridge between realms. Like Eshu who carries messages between Orun and Aiye, you translate the ineffable into the speakable. Ground your mercurial gifts in service."
      },
      Cancer: {
        western: "Your Sun in Cancer bathes in lunar light—you are the Guardian of emotional memory, the keeper of the ancestral hearth, the one who nurtures life into being.",
        yoruba: "Yemaya's oceanic embrace defines your path. Mother of Waters, she who holds the secret of the womb. Your Ori chose to protect, to feel, to remember what others forget.",
        synthesis: "The Great Mother archetype flows through you. In Yoruba thought, the mother's blessing (Iwa) shapes destiny more than stars. Your sensitivity is not weakness—it is ancient wisdom in emotional form."
      },
      Leo: {
        western: "Your Sun in Leo places you at the center of your own solar system—the radiant one, the creative heart, the divine child who plays life as sacred theater.",
        yoruba: "Shango's royal fire burns in your Ori. You are meant for the throne, but remember: Yoruba kings kneel before Obatala. True sovereignty serves something greater than self.",
        synthesis: "Your light is meant to be seen. The danger lies in hubris—Shango's cautionary tale. Let your creativity flow as Oshun's golden honey, generous and life-giving, not as conquest."
      },
      Virgo: {
        western: "Your Sun in Virgo attunes you to the sacred pattern within apparent chaos. You are the Healer, the one who serves through precise attention to what others overlook.",
        yoruba: "Osanyin's knowledge of herbs and hidden things lives in you. The healer-priest who knows that every leaf holds medicine, every detail carries meaning.",
        synthesis: "Your Ori chose the path of sacred service. Perfection is not the goal—wholeness is. Let your analytical gifts serve Iwa-Pele, the good character that heals community."
      },
      Libra: {
        western: "Your Sun in Libra balances on the scales of cosmic justice—you are the Diplomat, the one who sees beauty in balance and seeks harmony in all relations.",
        yoruba: "Oshun's mirror reflects your path. She who negotiates between forces, who uses beauty as sacred technology, who knows that relationships are the true measure of a life.",
        synthesis: "Your Ori chose partnership as path. But the Yoruba remind us: even Oshun has depths that can drown. Balance must include your own needs, not just others'."
      },
      Scorpio: {
        western: "Your Sun in Scorpio plunges into the depths where others fear to swim. You are the Transformer, the one who dies and is reborn, who finds gold in shadow.",
        yoruba: "Oya's winds of change blow through your Ori. She who guards the gates between worlds, who transforms destruction into liberation, who loves fiercely and without illusion.",
        synthesis: "Your path is death and rebirth—not once, but cyclically. The Yoruba understand that Ebo (sacrifice) transforms destiny. What you release becomes fertilizer for what you become."
      },
      Sagittarius: {
        western: "Your Sun in Sagittarius draws the bow toward distant horizons—you are the Seeker, the philosophical archer aiming at truths that transcend cultural boundaries.",
        yoruba: "Orunmila's wisdom calls to you. The Sage who traveled to witness creation, who compiled the Odu Ifa, who knows that truth is a path, not a destination.",
        synthesis: "Your Ori thirsts for meaning beyond the visible. But remember: Orunmila's wisdom required patience, not just travel. Let your seeking include the wisdom already within."
      },
      Capricorn: {
        western: "Your Sun in Capricorn climbs the mountain of manifestation—you are the Builder of lasting structures, the Elder in training, the one who plays the long game.",
        yoruba: "Obatala's cool patience guides your climb. He who shapes humans from clay knows that creation takes time, that ethics matter more than speed, that the summit serves the village.",
        synthesis: "Your Ori chose mastery through time. Saturn's lessons are Obatala's lessons: authority earned through character, power that heals rather than harms. Build wisely."
      },
      Aquarius: {
        western: "Your Sun in Aquarius broadcasts from the future—you are the Visionary, the one who sees the patterns that will become tomorrow's common sense.",
        yoruba: "Shango's lightning and Oya's revolutionary wind combine in you. You carry the medicine the collective needs but may not want. Your difference is your offering.",
        synthesis: "Your Ori chose to serve the many, not the few. The Yoruba commune with ancestors for collective healing; you commune with descendants. Ground your vision in present action."
      },
      Pisces: {
        western: "Your Sun in Pisces dissolves into the cosmic ocean—you are the Mystic, the one who remembers the unity beneath apparent separation, who dreams the world awake.",
        yoruba: "Olokun's unfathomable depths call to you. The Ocean floor where treasures and terrors intermingle, where the boundary between self and cosmos grows thin.",
        synthesis: "Your Ori chose immersion in the All. The danger is losing yourself; the gift is finding the Self that includes everything. Let Iwa-Pele anchor your oceanic soul."
      }
    },
    moonSign: {
      Aries: {
        western: "Your Moon in Aries brings emotional fire to your inner world. You feel deeply and react quickly, with instincts that demand immediate action. Your emotional security comes from independence and the freedom to pursue what sets your heart ablaze. When hurt, you may lash out before processing, but your emotional honesty is a gift that cuts through pretense.",
        yoruba: "Shango's warrior spirit lives in your emotional core. Like the thunder god who acts decisively, your feelings demand expression. Yemaya's nurturing waters temper this fire, teaching you that emotional strength includes vulnerability. Your Ori chose this placement to learn that true courage includes feeling deeply.",
        synthesis: "Your emotional nature is a sacred fire that illuminates truth. The challenge is balancing Aries' directness with emotional intelligence. When you honor your feelings as valid messengers, you become a beacon for others learning to express their authentic emotional fire.",
        shadowWork: "The shadow of Aries Moon lies in emotional impulsivity. Practice pausing before reacting—your feelings are valid, but timing matters. Learn to distinguish between emotional fire that destroys and that which purifies and transforms."
      },
      Taurus: {
        western: "Your Moon in Taurus creates an emotional foundation of stability and sensuality. You need tangible security and comfort to feel emotionally safe. Your feelings develop slowly but deeply, like roots growing into rich soil. You express love through physical presence and creating beauty in your environment.",
        yoruba: "The Earth's patient wisdom flows through your emotional veins. Like Oshun who appreciates life's sensual pleasures, you find emotional security in the material world. Yemaya's waters remind you that true wealth includes emotional generosity. Your Ori chose this placement to teach that emotional stability creates space for others to feel safe.",
        synthesis: "Your emotional world is a garden that requires consistent nurturing. The Taurus Moon teaches that emotional security is built through steady attention to what truly nourishes your soul. When you honor your need for comfort, you create sanctuary for yourself and others.",
        shadowWork: "The shadow of Taurus Moon manifests as emotional stubbornness or possessiveness. Practice releasing what no longer serves your growth. Remember that true security comes from within, not from external possessions or people."
      },
      Gemini: {
        western: "Your Moon in Gemini dances through a kaleidoscope of emotions, bringing curiosity and adaptability to your inner world. You process feelings through conversation and mental exploration. Emotional security comes from intellectual connection and the freedom to explore multiple perspectives. You may feel emotionally restless if confined to one emotional state.",
        yoruba: "Eshu's trickster energy plays in your emotional landscape. Like the messenger who carries words between worlds, your feelings find expression through communication. Yemaya's depths remind you that some emotions require silence. Your Ori chose this placement to learn that emotional intelligence includes listening as well as speaking.",
        synthesis: "Your emotional nature is a bridge between heart and mind. The Gemini Moon teaches that feelings are information, not just experiences. When you honor your need for mental-emotional flexibility, you become a translator of complex emotional experiences for others.",
        shadowWork: "The shadow of Gemini Moon appears as emotional superficiality or avoidance of deep feeling. Practice sitting with uncomfortable emotions without immediately analyzing or verbalizing them. Learn that some feelings deepen through quiet contemplation."
      },
      Cancer: {
        western: "Your Moon in Cancer dives deep into the ocean of emotions, making you the natural caretaker of feelings. Your emotional world is rich and intuitive, with instincts that protect and nurture. You feel most secure in environments that feel like home, with people who honor emotional vulnerability. Your empathy can feel like a superpower and a burden.",
        yoruba: "Yemaya's maternal waters are your emotional home. Like the Great Mother who holds all emotions in her embrace, you carry the wisdom of emotional memory. Your Ori chose this placement to be the emotional anchor for your community. Remember that your sensitivity is sacred medicine.",
        synthesis: "Your emotional nature is a healing sanctuary. The Cancer Moon teaches that vulnerability is strength, not weakness. When you honor your emotional depth, you create safe spaces for authentic emotional expression in your relationships and community.",
        shadowWork: "The shadow of Cancer Moon manifests as emotional manipulation or retreat into victimhood. Practice setting boundaries while maintaining empathy. Learn to distinguish between your emotions and others', remembering that you are not responsible for healing everyone."
      },
      Leo: {
        western: "Your Moon in Leo brings dramatic warmth and generosity to your emotional world. You feel emotions vividly and express them with creative flair. Emotional security comes from being seen, appreciated, and celebrated. You may struggle when your emotional needs feel overlooked, but your capacity for joy and loyalty is a gift to those you love.",
        yoruba: "Shango's royal fire illuminates your emotional core. Like the king who rules with both authority and generosity, your feelings demand recognition. Yemaya's nurturing waters balance this fire, teaching that true leadership includes emotional intelligence. Your Ori chose this placement to learn that emotional warmth creates community.",
        synthesis: "Your emotional nature is a radiant sun that warms others. The Leo Moon teaches that healthy emotional expression includes both strength and vulnerability. When you honor your need for appreciation, you inspire others to express their emotional light.",
        shadowWork: "The shadow of Leo Moon appears as emotional drama or need for constant validation. Practice finding internal sources of emotional security. Learn that your worth is not dependent on others' recognition, though appreciation when genuine is nourishing."
      },
      Virgo: {
        western: "Your Moon in Virgo brings analytical precision to your emotional world. You process feelings through service and practical problem-solving. Emotional security comes from order, health, and being useful. You may intellectualize emotions to maintain control, but your capacity for empathetic service creates healing spaces.",
        yoruba: "Osanyin's herbal wisdom flows through your emotional responses. Like the healer who sees patterns in illness, you intuitively understand emotional imbalances. Yemaya's waters remind you that healing includes emotional acceptance. Your Ori chose this placement to serve through emotional intelligence.",
        synthesis: "Your emotional nature is a healing garden. The Virgo Moon teaches that emotions are information requiring appropriate response. When you honor your need for emotional order, you create systems for emotional well-being that benefit your community.",
        shadowWork: "The shadow of Virgo Moon manifests as emotional perfectionism or critical self-judgment. Practice accepting emotions as they are, without immediately trying to fix or analyze them. Learn that emotional health includes imperfection."
      },
      Libra: {
        western: "Your Moon in Libra seeks emotional harmony and balance in all relationships. You feel most secure in partnerships that honor equality and beauty. Your emotions flow through diplomatic expression, and you may avoid conflict to maintain peace. Your capacity for empathy and fairness creates bridges between differing emotional needs.",
        yoruba: "Oshun's balancing wisdom dances in your emotional core. Like the river goddess who negotiates between banks, you intuitively seek harmony. Yemaya's depths remind you that true balance includes your own needs. Your Ori chose this placement to mediate emotional conflicts with grace.",
        synthesis: "Your emotional nature is a balancing scale. The Libra Moon teaches that healthy relationships require both giving and receiving. When you honor your need for emotional equity, you create partnerships based on mutual respect and understanding.",
        shadowWork: "The shadow of Libra Moon appears as emotional codependency or avoidance of necessary conflict. Practice expressing your needs directly while maintaining compassion. Learn that true harmony includes honest emotional expression."
      },
      Scorpio: {
        western: "Your Moon in Scorpio plunges into emotional depths where others fear to swim. You feel emotions with intense power and seek profound intimacy. Emotional security comes from trust and transformative experiences. Your emotional intensity can be overwhelming, but it carries the gift of deep healing and regeneration.",
        yoruba: "Oya's transformative winds sweep through your emotional landscape. Like the guardian of transitions, you navigate emotional deaths and rebirths. Yemaya's waters hold space for your depths. Your Ori chose this placement to transform emotional pain into wisdom.",
        synthesis: "Your emotional nature is a phoenix fire. The Scorpio Moon teaches that emotional intensity is a path to profound healing. When you honor your need for emotional depth, you become a guide for others through their own transformative journeys.",
        shadowWork: "The shadow of Scorpio Moon manifests as emotional manipulation or fear of vulnerability. Practice trusting gradual emotional intimacy. Learn that true power comes from emotional authenticity, not control."
      },
      Sagittarius: {
        western: "Your Moon in Sagittarius brings philosophical freedom to your emotional world. You process feelings through meaning-making and exploration. Emotional security comes from purpose and the ability to learn from experiences. You may intellectualize emotions to maintain optimism, but your capacity for emotional generosity inspires others.",
        yoruba: "Orunmila's questing wisdom lives in your emotional responses. Like the sage who seeks truth beyond horizons, you find emotional freedom through understanding. Yemaya's waters ground your explorations. Your Ori chose this placement to expand emotional horizons.",
        synthesis: "Your emotional nature is a compass pointing toward meaning. The Sagittarius Moon teaches that emotions are teachers guiding your soul's journey. When you honor your need for emotional purpose, you inspire others to find meaning in their experiences.",
        shadowWork: "The shadow of Sagittarius Moon appears as emotional restlessness or avoidance of painful feelings. Practice staying present with discomfort long enough to learn from it. Learn that true freedom includes emotional depth, not just breadth."
      },
      Capricorn: {
        western: "Your Moon in Capricorn brings disciplined structure to your emotional world. You process feelings through responsible action and long-term planning. Emotional security comes from achievement and the ability to provide. Your emotional reserve may seem cold, but it protects a deep capacity for loyal love and practical care.",
        yoruba: "Obatala's patient wisdom shapes your emotional responses. Like the creator who builds with care, you approach emotions with responsibility. Yemaya's waters soften your structures. Your Ori chose this placement to build emotional foundations that endure.",
        synthesis: "Your emotional nature is a mountain peak. The Capricorn Moon teaches that emotional maturity develops through time and experience. When you honor your need for emotional structure, you create lasting emotional security for yourself and loved ones.",
        shadowWork: "The shadow of Capricorn Moon manifests as emotional repression or workaholism. Practice allowing emotions to exist without immediate action. Learn that vulnerability is not weakness, but the foundation of true strength."
      },
      Aquarius: {
        western: "Your Moon in Aquarius brings innovative detachment to your emotional world. You process feelings through intellectual analysis and humanitarian concern. Emotional security comes from community and shared ideals. Your emotional style may seem unconventional, but your capacity for objective empathy serves collective healing.",
        yoruba: "Shango's revolutionary fire and Oya's winds combine in your emotional core. Like the reformer who serves the collective, you feel for humanity's wounds. Yemaya's waters remind you of individual emotional needs. Your Ori chose this placement to heal through innovation.",
        synthesis: "Your emotional nature is a collective heartbeat. The Aquarius Moon teaches that personal emotions connect to larger human experiences. When you honor your need for emotional community, you contribute to collective emotional healing.",
        shadowWork: "The shadow of Aquarius Moon appears as emotional detachment or intellectualization. Practice feeling emotions in your body, not just analyzing them. Learn that true innovation includes emotional presence."
      },
      Pisces: {
        western: "Your Moon in Pisces dissolves into the cosmic ocean of emotions. You feel everything deeply and intuitively, with boundaries that blur between self and other. Emotional security comes from spiritual connection and creative expression. Your empathy can feel boundless, carrying both the gift of compassion and the challenge of boundaries.",
        yoruba: "Olokun's fathomless depths mirror your emotional world. Like the ocean deity who holds ancient wisdom, you navigate emotional currents beyond words. Yemaya's maternal waters are your emotional home. Your Ori chose this placement to experience emotional unity.",
        synthesis: "Your emotional nature is a cosmic ocean. The Pisces Moon teaches that emotions connect us to the divine. When you honor your need for emotional-spiritual connection, you become a channel for universal compassion and healing.",
        shadowWork: "The shadow of Pisces Moon manifests as emotional overwhelm or escapism. Practice setting boundaries while maintaining empathy. Learn to distinguish between your emotions and others', remembering that you are a vessel, not a bottomless container."
      }
    },
    risingSign: {
      Aries: {
        western: "Your Aries Rising presents a bold, pioneering facade to the world. You appear confident and action-oriented, with a physical presence that commands attention. Others see you as courageous and independent, often underestimating your sensitivity beneath the warrior exterior. Your first impressions are memorable and energetic.",
        yoruba: "Shango's thunder announces your arrival. Your Ori chose this mask to teach leadership through action. The world sees your fire, but your inner waters run deep. Remember that true warriors protect the vulnerable.",
        synthesis: "Your rising sign is the Hero's mask. Aries Rising teaches that true courage includes vulnerability. When you balance your bold presentation with authentic emotional expression, you become a leader who inspires through both strength and heart.",
        lifeThemes: "Learning to initiate without aggression, balancing independence with interdependence, channeling your natural leadership into service rather than conquest."
      },
      Taurus: {
        western: "Your Taurus Rising presents a grounded, sensual presence that conveys stability and reliability. You appear patient and practical, with a physical beauty that suggests both strength and comfort. Others trust you instinctively, seeing you as someone who can be counted on. Your movements are deliberate and your voice carries calm authority.",
        yoruba: "The Earth's steady wisdom shapes your worldly presentation. Like Oshun who appreciates life's pleasures, you appear as someone who knows how to enjoy and preserve beauty. Your Ori chose this mask to teach that true stability includes generosity.",
        synthesis: "Your rising sign is the Builder's foundation. Taurus Rising teaches that reliability creates safety for growth. When you honor both your need for security and your capacity for generosity, you become a steady anchor in others' lives.",
        lifeThemes: "Building lasting structures, appreciating sensual pleasures without attachment, learning that patience is power, creating beauty that serves others."
      },
      Gemini: {
        western: "Your Gemini Rising presents a curious, communicative facade that suggests intelligence and adaptability. You appear youthful and engaging, with quick movements and expressive features. Others see you as witty and approachable, often underestimating your depth beneath the social exterior. Your curiosity draws people in and keeps conversations flowing.",
        yoruba: "Eshu's clever energy dances in your presentation. Like the trickster who knows many paths, you appear as someone who can navigate any situation. Your Ori chose this mask to teach that communication is sacred technology.",
        synthesis: "Your rising sign is the Messenger's bridge. Gemini Rising teaches that curiosity opens doors. When you balance your mental agility with emotional presence, you become a translator between different worlds and perspectives.",
        lifeThemes: "Communicating with clarity and compassion, learning when to speak and when to listen, synthesizing diverse ideas, using your adaptability to serve connection rather than manipulation."
      },
      Cancer: {
        western: "Your Cancer Rising presents a nurturing, intuitive presence that suggests emotional depth and care. You appear approachable and sensitive, with soft features and protective energy. Others feel safe around you, sensing your capacity for empathy. Your intuition guides your interactions, creating warm and welcoming first impressions.",
        yoruba: "Yemaya's maternal waters shape your worldly face. Like the Great Mother who holds all in embrace, you appear as someone who can nurture and protect. Your Ori chose this mask to teach that vulnerability is strength.",
        synthesis: "Your rising sign is the Caretaker's sanctuary. Cancer Rising teaches that emotional intelligence is magnetic. When you honor your sensitivity as wisdom rather than weakness, you create safe spaces for authentic human connection.",
        lifeThemes: "Setting boundaries while maintaining empathy, trusting intuition in practical matters, balancing nurturing others with self-care, learning that emotional availability creates community."
      },
      Leo: {
        western: "Your Leo Rising presents a radiant, charismatic presence that commands attention and admiration. You appear confident and creative, with a physical presence that suggests leadership and warmth. Others are drawn to your light, seeing you as someone special and worthy of celebration. Your generosity and loyalty shine through in first interactions.",
        yoruba: "Shango's royal fire illuminates your worldly presentation. Like the king who rules with generosity, you appear as someone destined for recognition. Your Ori chose this mask to teach that true leadership serves the people.",
        synthesis: "Your rising sign is the Performer's stage. Leo Rising teaches that your light is meant to be seen. When you balance personal radiance with genuine care for others, you become a leader who inspires through warmth and creativity.",
        lifeThemes: "Using your charisma for service rather than ego, learning to receive appreciation gracefully, balancing self-expression with consideration for others, remembering that true royalty serves."
      },
      Virgo: {
        western: "Your Virgo Rising presents a competent, helpful presence that suggests reliability and attention to detail. You appear practical and service-oriented, with a physical presence that conveys quiet strength and capability. Others trust your judgment and appreciate your willingness to assist. Your humility and efficiency create lasting positive impressions.",
        yoruba: "Osanyin's healing wisdom shapes your worldly face. Like the herbalist who knows every leaf's medicine, you appear as someone who can organize and heal. Your Ori chose this mask to teach that service is sacred work.",
        synthesis: "Your rising sign is the Healer's quiet strength. Virgo Rising teaches that competence creates trust. When you balance your helpful nature with self-respect, you become a reliable force for practical healing in your community.",
        lifeThemes: "Serving without losing yourself, setting appropriate boundaries in helping others, using your analytical gifts for collective benefit, learning that perfection is less important than wholeness."
      },
      Libra: {
        western: "Your Libra Rising presents a harmonious, diplomatic presence that suggests fairness and beauty. You appear balanced and approachable, with a physical presence that conveys grace and consideration. Others feel at ease around you, sensing your commitment to equity. Your ability to see multiple perspectives creates bridges in social situations.",
        yoruba: "Oshun's balancing beauty shapes your worldly presentation. Like the river goddess who negotiates harmony, you appear as someone who can bring people together. Your Ori chose this mask to teach that relationships are sacred work.",
        synthesis: "Your rising sign is the Diplomat's scales. Libra Rising teaches that balance creates peace. When you honor both justice and mercy, you become a mediator who weaves harmony from conflict.",
        lifeThemes: "Maintaining balance without losing yourself, speaking up for justice while honoring others' perspectives, creating beauty that serves harmony, learning that true diplomacy includes your own needs."
      },
      Scorpio: {
        western: "Your Scorpio Rising presents an intense, mysterious presence that suggests depth and power. You appear magnetic and perceptive, with a physical presence that conveys both vulnerability and strength. Others sense your capacity for transformation, feeling both drawn to and intimidated by your intensity. Your eyes seem to see beneath surfaces.",
        yoruba: "Oya's transformative winds shape your worldly face. Like the guardian of transitions, you appear as someone who can navigate life's depths. Your Ori chose this mask to teach that power includes compassion.",
        synthesis: "Your rising sign is the Transformer's gaze. Scorpio Rising teaches that intensity is magnetic. When you balance your perceptive power with gentle presence, you become a guide for others through their own transformations.",
        lifeThemes: "Using your intensity for healing rather than control, balancing vulnerability with boundaries, trusting your intuition about others, learning that true power serves transformation."
      },
      Sagittarius: {
        western: "Your Sagittarius Rising presents an optimistic, philosophical presence that suggests adventure and wisdom. You appear open-minded and enthusiastic, with a physical presence that conveys freedom and exploration. Others are inspired by your positive outlook and sense of possibility. Your curiosity and generosity create welcoming first impressions.",
        yoruba: "Orunmila's questing wisdom shapes your worldly presentation. Like the sage who travels for truth, you appear as someone who can expand horizons. Your Ori chose this mask to teach that wisdom includes joy.",
        synthesis: "Your rising sign is the Seeker's horizon. Sagittarius Rising teaches that optimism opens doors. When you balance your expansive vision with present-moment awareness, you become a guide who inspires others toward their own growth.",
        lifeThemes: "Seeking wisdom without losing grounding, balancing optimism with realism, using your enthusiasm to serve others' growth, learning that true freedom includes responsibility."
      },
      Capricorn: {
        western: "Your Capricorn Rising presents a responsible, authoritative presence that suggests maturity and capability. You appear competent and composed, with a physical presence that conveys dignity and reliability. Others respect your judgment and sense your commitment to excellence. Your quiet confidence creates lasting impressions of trustworthiness.",
        yoruba: "Obatala's patient wisdom shapes your worldly face. Like the creator who builds with care, you appear as someone who can be relied upon. Your Ori chose this mask to teach that authority serves the community.",
        synthesis: "Your rising sign is the Elder's steady gaze. Capricorn Rising teaches that responsibility creates trust. When you balance your serious nature with warmth, you become a reliable leader who builds lasting foundations for others.",
        lifeThemes: "Using authority for service rather than control, balancing achievement with relationships, learning to receive support as well as give it, remembering that true leadership includes humility."
      },
      Aquarius: {
        western: "Your Aquarius Rising presents an innovative, humanitarian presence that suggests vision and community. You appear unique and forward-thinking, with a physical presence that conveys both detachment and care. Others sense your commitment to larger causes and appreciate your objective perspective. Your unconventional approach creates memorable first impressions.",
        yoruba: "Shango's revolutionary fire and Oya's winds combine in your presentation. Like the reformer who serves the collective, you appear as someone who can envision change. Your Ori chose this mask to teach that innovation serves humanity.",
        synthesis: "Your rising sign is the Visionary's light. Aquarius Rising teaches that uniqueness is a gift. When you balance your innovative spirit with human connection, you become a catalyst for positive collective change.",
        lifeThemes: "Using your vision for collective benefit, balancing detachment with empathy, learning to collaborate while maintaining individuality, remembering that true innovation serves human needs."
      },
      Pisces: {
        western: "Your Pisces Rising presents a compassionate, dreamy presence that suggests spirituality and empathy. You appear gentle and intuitive, with a physical presence that conveys both vulnerability and wisdom. Others feel understood around you, sensing your capacity for unconditional love. Your kindness and imagination create deeply moving first impressions.",
        yoruba: "Olokun's oceanic depths shape your worldly face. Like the deep ocean holding ancient wisdom, you appear as someone who can hold space for mystery. Your Ori chose this mask to teach that compassion is revolutionary.",
        synthesis: "Your rising sign is the Mystic's embrace. Pisces Rising teaches that gentleness is strength. When you balance your compassionate nature with healthy boundaries, you become a healer who holds space for others' spiritual journeys.",
        lifeThemes: "Maintaining boundaries while staying compassionate, using your intuition for practical guidance, balancing imagination with grounding, learning that true spirituality includes everyday life."
      }
    },
    transit: {
      saturnReturn: "The Saturn Return marks your true entry into astrological adulthood. Saturn 'audits' the structures you've built—career, relationships, identity. In Yoruba terms, this is when your Ori demands alignment between your chosen destiny and your lived character. What was built on Iwa-Pele (good character) solidifies; what lacks integrity crumbles. This is not punishment but pruning.",
      uranusOpposition: "The Uranus Opposition at midlife is the cosmic wake-up call. Whatever has become stagnant, whatever authentic self you've buried beneath expectations—Uranus demands liberation. Oya's transformative winds blow through your life. The question is not whether change comes, but whether you ride the storm or are swept away.",
      plutoSquare: "Pluto's Square to its natal position initiates the soul's pruning season. Like Oya guarding the cemetery gates, Pluto demands you release what has died but not yet been buried. Careers, relationships, identities that lack soul-depth will be composted. This is Ebo on the deepest level—sacrifice that transforms.",
      neptuneSquare: "Neptune's Square dissolves the boundaries between dream and reality. What seemed solid may shimmer and fade. In Yoruba cosmology, the veil between Orun (heaven) and Aiye (earth) thins. This is not psychosis but invitation—to see beyond material achievement to spiritual purpose."
    },
    moonPhase: {
      'New Moon': "The New Moon is cosmic planting time. In darkness, seeds germinate. This is the moment for intention-setting, for consulting your Ori about what you truly wish to manifest. The Yoruba begin important endeavors in darkness, trusting that light will reveal what is planted in faith.",
      'Full Moon': "The Full Moon illuminates what was hidden. Emotions crest like ocean tides—Yemaya's domain. This is harvest time, revelation time, when the fruit of your intentions becomes visible. What you planted at the New Moon now shows its true nature.",
      'Waxing Crescent': "The first sliver of light after darkness. Your intentions begin to take form. In Yoruba tradition, this is when Eshu opens the first roads. Take initial action, but remain flexible—the path reveals itself through walking.",
      'Waning Crescent': "The final dissolution before rebirth. Release what no longer serves. This is Ebo time—sacrifice that creates space for the new. The wise ones know that emptiness precedes fullness."
    }
  };

  if (type === 'sunSign' && data.sign) {
    return interpretations.sunSign[data.sign] || interpretations.sunSign.Aries;
  }
  if (type === 'moonSign' && data.sign) {
    return interpretations.moonSign[data.sign] || interpretations.moonSign.Aries;
  }
  if (type === 'risingSign' && data.sign) {
    return interpretations.risingSign[data.sign] || interpretations.risingSign.Aries;
  }
  if (type === 'transit' && data.transitType) {
    return interpretations.transit[data.transitType];
  }
  if (type === 'moonPhase' && data.phase) {
    return interpretations.moonPhase[data.phase] || interpretations.moonPhase['New Moon'];
  }
  return null;
};

// Daily affirmations based on transits and signs
const getAffirmation = (sunSign, moonPhase) => {
  const affirmations = {
    fire: [
      "My courage opens paths that fear keeps closed.",
      "I channel Shango's fire into creation, not destruction.",
      "My passion serves purposes greater than my ego.",
      "I lead by igniting the light in others."
    ],
    earth: [
      "I build foundations that will outlast my doubts.",
      "Patience is my power; time is my ally.",
      "I honor the sacred in the material world.",
      "My steadiness creates safety for others to grow."
    ],
    air: [
      "My mind is a bridge between worlds.",
      "I speak truth that connects rather than divides.",
      "Like Eshu, I find wisdom at every crossroads.",
      "My ideas have the power to shift consciousness."
    ],
    water: [
      "My sensitivity is ancient wisdom in emotional form.",
      "I trust the depths I cannot see.",
      "Like Yemaya's ocean, I hold space for transformation.",
      "My feelings are valid messengers from my Ori."
    ]
  };
  
  const element = ELEMENTS[sunSign] || 'fire';
  const options = affirmations[element];
  const index = Math.floor((moonPhase?.illumination || 50) / 25) % options.length;
  return options[index];
};

// Styles object
const styles = {
  app: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #0d0d12 0%, #1a1520 50%, #252030 100%)',
    color: '#e8e6ed',
    fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, sans-serif',
    display: 'flex'
  },
  sidebar: {
    width: '280px',
    background: 'rgba(19, 17, 26, 0.95)',
    borderRight: '1px solid #5c4d7a',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 0',
    flexShrink: 0
  },
  sidebarCollapsed: {
    width: '80px'
  },
  logo: {
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    fontSize: '28px',
    fontWeight: '600',
    color: '#c9a0dc',
    textAlign: 'center',
    padding: '0 24px 32px',
    borderBottom: '1px solid #5c4d7a',
    letterSpacing: '0.05em'
  },
  logoSmall: {
    fontSize: '24px',
    padding: '0 0 32px'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 24px',
    color: '#c0b8cf',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    borderLeft: '3px solid transparent'
  },
  navItemActive: {
    background: 'rgba(157, 142, 194, 0.15)',
    color: '#c9a0dc',
    borderLeftColor: '#9d8ec2'
  },
  navIcon: {
    fontSize: '20px',
    width: '24px',
    textAlign: 'center'
  },
  main: {
    flex: 1,
    overflow: 'auto',
    padding: '40px'
  },
  card: {
    background: '#1a1520',
    borderRadius: '16px',
    padding: '28px',
    marginBottom: '24px',
    border: '1px solid #5c4d7a',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)'
  },
  cardTitle: {
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    fontSize: '22px',
    fontWeight: '600',
    color: '#c9a0dc',
    marginBottom: '16px'
  },
  greeting: {
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    fontSize: '36px',
    fontWeight: '400',
    marginBottom: '8px'
  },
  subtext: {
    color: '#8a8694',
    fontSize: '15px',
    marginBottom: '32px'
  },
  button: {
    background: 'linear-gradient(135deg, #9d8ec2 0%, #7b6b9e 100%)',
    border: 'none',
    borderRadius: '12px',
    padding: '14px 28px',
    color: '#0d0d12',
    fontFamily: '"Nunito Sans", sans-serif',
    fontWeight: '600',
    fontSize: '15px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 16px rgba(157, 142, 194, 0.3)'
  },
  buttonSecondary: {
    background: 'transparent',
    border: '1px solid #5c4d7a',
    color: '#c0b8cf'
  },
  input: {
    width: '100%',
    background: '#13111a',
    border: '1px solid #5c4d7a',
    borderRadius: '12px',
    padding: '14px 18px',
    color: '#e8e6ed',
    fontFamily: '"Nunito Sans", sans-serif',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.3s ease',
    boxSizing: 'border-box'
  },
  label: {
    display: 'block',
    color: '#c0b8cf',
    fontSize: '14px',
    marginBottom: '8px',
    fontWeight: '500'
  },
  formGroup: {
    marginBottom: '20px'
  },
  bigThree: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    marginBottom: '24px'
  },
  bigThreeItem: {
    background: '#13111a',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    border: '1px solid #5c4d7a'
  },
  glyph: {
    fontSize: '48px',
    marginBottom: '12px',
    display: 'block'
  },
  signName: {
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    fontSize: '20px',
    color: '#c9a0dc',
    marginBottom: '4px'
  },
  signLabel: {
    fontSize: '13px',
    color: '#8a8694',
    textTransform: 'uppercase',
    letterSpacing: '0.1em'
  },
  chart: {
    width: '100%',
    maxWidth: '500px',
    aspectRatio: '1',
    margin: '0 auto',
    position: 'relative'
  },
  transitItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '16px 0',
    borderBottom: '1px solid rgba(92, 77, 122, 0.3)'
  },
  transitIntensity: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    marginTop: '8px',
    flexShrink: 0
  },
  moonCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px'
  },
  moonEmoji: {
    fontSize: '64px'
  },
  tabs: {
    display: 'flex',
    gap: '4px',
    marginBottom: '24px',
    background: '#13111a',
    padding: '4px',
    borderRadius: '12px'
  },
  tab: {
    flex: 1,
    padding: '12px 20px',
    border: 'none',
    background: 'transparent',
    color: '#8a8694',
    fontFamily: '"Nunito Sans", sans-serif',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.3s ease'
  },
  tabActive: {
    background: '#5c4d7a',
    color: '#e8e6ed'
  },
  journalEntry: {
    background: '#13111a',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
    border: '1px solid #5c4d7a',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  journalDate: {
    fontSize: '13px',
    color: '#8a8694',
    marginBottom: '8px'
  },
  journalTitle: {
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    fontSize: '18px',
    color: '#c9a0dc',
    marginBottom: '8px'
  },
  journalExcerpt: {
    color: '#c0b8cf',
    fontSize: '14px',
    lineHeight: '1.6'
  },
  tags: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginTop: '12px'
  },
  tag: {
    background: 'rgba(157, 142, 194, 0.2)',
    color: '#c9a0dc',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px'
  },
  moodSelector: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  moodOption: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    border: '2px solid #5c4d7a',
    background: '#13111a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  moodSelected: {
    borderColor: '#c9a0dc',
    background: 'rgba(201, 160, 220, 0.2)'
  },
  affirmation: {
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    fontSize: '24px',
    fontStyle: 'italic',
    color: '#c9a0dc',
    textAlign: 'center',
    lineHeight: '1.6',
    padding: '20px'
  },
  fab: {
    position: 'fixed',
    bottom: '32px',
    right: '32px',
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #9d8ec2 0%, #7b6b9e 100%)',
    border: 'none',
    color: '#0d0d12',
    fontSize: '32px',
    cursor: 'pointer',
    boxShadow: '0 8px 32px rgba(157, 142, 194, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modal: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(13, 13, 18, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modalContent: {
    background: '#1a1520',
    borderRadius: '20px',
    padding: '32px',
    width: '100%',
    maxWidth: '560px',
    maxHeight: '90vh',
    overflow: 'auto',
    border: '1px solid #5c4d7a'
  },
  modalTitle: {
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    fontSize: '28px',
    color: '#c9a0dc',
    marginBottom: '24px'
  },
  interpretation: {
    lineHeight: '1.8',
    color: '#c0b8cf',
    fontSize: '15px'
  },
  interpretationSection: {
    marginBottom: '20px'
  },
  interpretationLabel: {
    fontFamily: '"Cinzel", Georgia, serif',
    fontSize: '12px',
    color: '#9d8ec2',
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    marginBottom: '8px'
  },
  orishaCard: {
    background: 'rgba(157, 142, 194, 0.1)',
    borderRadius: '12px',
    padding: '16px',
    marginTop: '16px',
    borderLeft: '3px solid #c9a0dc'
  },
  orishaName: {
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    fontSize: '18px',
    color: '#c9a0dc',
    marginBottom: '4px'
  },
  orishaDomain: {
    fontSize: '13px',
    color: '#8a8694',
    marginBottom: '8px'
  },
  settingsSection: {
    marginBottom: '32px'
  },
  settingsTitle: {
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    fontSize: '20px',
    color: '#c9a0dc',
    marginBottom: '16px'
  },
  toggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 0',
    borderBottom: '1px solid rgba(92, 77, 122, 0.3)'
  },
  toggleSwitch: {
    width: '52px',
    height: '28px',
    background: '#13111a',
    borderRadius: '14px',
    position: 'relative',
    cursor: 'pointer',
    transition: 'background 0.3s ease'
  },
  toggleActive: {
    background: '#9d8ec2'
  },
  toggleKnob: {
    width: '22px',
    height: '22px',
    background: '#e8e6ed',
    borderRadius: '50%',
    position: 'absolute',
    top: '3px',
    left: '3px',
    transition: 'left 0.3s ease'
  },
  toggleKnobActive: {
    left: '27px'
  },
  starfield: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
    zIndex: 0
  },
  star: {
    position: 'absolute',
    width: '2px',
    height: '2px',
    background: 'white',
    borderRadius: '50%',
    opacity: 0.5,
    animation: 'twinkle 3s infinite'
  }
};

// Add keyframes via style tag
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Nunito+Sans:wght@400;500;600;700&family=Cinzel:wght@400;500;600&display=swap');
    
    * {
      box-sizing: border-box;
    }
    
    body {
      margin: 0;
      padding: 0;
      background: #0d0d12;
    }
    
    @keyframes twinkle {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.8; }
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    
    .fade-in {
      animation: fadeInUp 0.5s ease forwards;
    }
    
    .card-hover:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 32px rgba(157, 142, 194, 0.2);
    }
    
    input:focus, textarea:focus {
      border-color: #9d8ec2 !important;
    }
    
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(157, 142, 194, 0.4);
    }
    
    ::-webkit-scrollbar {
      width: 8px;
    }
    
    ::-webkit-scrollbar-track {
      background: #13111a;
    }
    
    ::-webkit-scrollbar-thumb {
      background: #5c4d7a;
      border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: #7b6b9e;
    }
  `}</style>
);

// Starfield background component
const Starfield = () => {
  const stars = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 3}s`,
      size: Math.random() * 2 + 1
    }));
  }, []);

  return (
    <div style={styles.starfield}>
      {stars.map(star => (
        <div
          key={star.id}
          style={{
            ...styles.star,
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDelay: star.delay
          }}
        />
      ))}
    </div>
  );
};

// Onboarding component
const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    birthTime: '',
    birthCity: '',
    birthCountry: ''
  });

  const handleSubmit = () => {
    if (step === 1 && formData.name.length >= 2) {
      setStep(2);
    } else if (step === 2 && formData.birthDate && formData.birthCity) {
      onComplete(formData);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
      <Starfield />
      <div style={{ maxWidth: '480px', width: '100%', position: 'relative', zIndex: 1 }} className="fade-in">
        {step === 1 ? (
          <>
            <h1 style={{ ...styles.greeting, fontSize: '42px', textAlign: 'center', marginBottom: '16px' }}>
              Welcome to Your Cosmic Journey
            </h1>
            <p style={{ ...styles.subtext, textAlign: 'center', fontSize: '17px', marginBottom: '48px' }}>
              Let's unlock the secrets written in your stars
            </p>
            <div style={styles.formGroup}>
              <label style={styles.label}>What shall we call you?</label>
              <input
                type="text"
                style={styles.input}
                placeholder="Enter your name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <button
              style={{ ...styles.button, width: '100%', marginTop: '16px' }}
              onClick={handleSubmit}
              disabled={formData.name.length < 2}
            >
              Continue
            </button>
          </>
        ) : (
          <>
            <h1 style={{ ...styles.greeting, fontSize: '36px', textAlign: 'center', marginBottom: '16px' }}>
              Your Celestial Coordinates
            </h1>
            <p style={{ ...styles.subtext, textAlign: 'center', marginBottom: '40px' }}>
              The moment you arrived in this universe matters
            </p>
            <div style={styles.formGroup}>
              <label style={styles.label}>Birth Date</label>
              <input
                type="date"
                style={styles.input}
                value={formData.birthDate}
                onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Birth Time (optional)</label>
              <input
                type="time"
                style={styles.input}
                value={formData.birthTime}
                onChange={e => setFormData({ ...formData, birthTime: e.target.value })}
              />
              <p style={{ fontSize: '13px', color: '#6b6574', marginTop: '8px' }}>
                If unknown, we'll use noon as default
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Birth City</label>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="City"
                  value={formData.birthCity}
                  onChange={e => setFormData({ ...formData, birthCity: e.target.value })}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Country</label>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="Country"
                  value={formData.birthCountry}
                  onChange={e => setFormData({ ...formData, birthCountry: e.target.value })}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
              <button
                style={{ ...styles.button, ...styles.buttonSecondary, flex: 1 }}
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button
                style={{ ...styles.button, flex: 2 }}
                onClick={handleSubmit}
                disabled={!formData.birthDate || !formData.birthCity}
              >
                Reveal My Stars ✨
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Natal Chart SVG visualization
const NatalChartWheel = ({ positions, aspects }) => {
  const size = 400;
  const center = size / 2;
  const outerRadius = size / 2 - 20;
  const signRadius = outerRadius - 30;
  const planetRadius = signRadius - 50;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: '100%', maxWidth: '450px' }}>
      <defs>
        <radialGradient id="chartBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#252030" />
          <stop offset="100%" stopColor="#13111a" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Background */}
      <circle cx={center} cy={center} r={outerRadius} fill="url(#chartBg)" stroke="#5c4d7a" strokeWidth="2" />
      
      {/* Sign divisions */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const x1 = center + Math.cos(angle) * signRadius;
        const y1 = center + Math.sin(angle) * signRadius;
        const x2 = center + Math.cos(angle) * outerRadius;
        const y2 = center + Math.sin(angle) * outerRadius;
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#5c4d7a" strokeWidth="1" />
        );
      })}
      
      {/* Inner circle */}
      <circle cx={center} cy={center} r={signRadius} fill="none" stroke="#5c4d7a" strokeWidth="1" />
      <circle cx={center} cy={center} r={planetRadius} fill="none" stroke="#5c4d7a" strokeWidth="1" strokeDasharray="4,4" />
      
      {/* Sign glyphs */}
      {ZODIAC_SIGNS.map((sign, i) => {
        const angle = ((i * 30 + 15) - 90) * (Math.PI / 180);
        const x = center + Math.cos(angle) * (signRadius + 18);
        const y = center + Math.sin(angle) * (signRadius + 18);
        const elementColors = { fire: '#d4a574', earth: '#8b9a82', air: '#a8b5c4', water: '#7a9bb5' };
        return (
          <text
            key={sign}
            x={x}
            y={y}
            fill={elementColors[ELEMENTS[sign]]}
            fontSize="18"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {SIGN_GLYPHS[sign]}
          </text>
        );
      })}
      
      {/* Aspect lines */}
      {aspects.slice(0, 8).map((aspect, i) => {
        const p1 = positions.find(p => p.planet === aspect.planet1);
        const p2 = positions.find(p => p.planet === aspect.planet2);
        if (!p1 || !p2) return null;
        
        const angle1 = (p1.longitude - 90) * (Math.PI / 180);
        const angle2 = (p2.longitude - 90) * (Math.PI / 180);
        const x1 = center + Math.cos(angle1) * (planetRadius - 20);
        const y1 = center + Math.sin(angle1) * (planetRadius - 20);
        const x2 = center + Math.cos(angle2) * (planetRadius - 20);
        const y2 = center + Math.sin(angle2) * (planetRadius - 20);
        
        const color = aspect.nature === 'soft' ? '#8b9a82' : aspect.nature === 'hard' ? '#d4a574' : '#7a9bb5';
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth="1"
            strokeOpacity="0.5"
            strokeDasharray={aspect.nature === 'soft' ? 'none' : '4,4'}
          />
        );
      })}
      
      {/* Planet glyphs */}
      {positions.map((pos, i) => {
        const angle = (pos.longitude - 90) * (Math.PI / 180);
        const x = center + Math.cos(angle) * (planetRadius - 20);
        const y = center + Math.sin(angle) * (planetRadius - 20);
        return (
          <g key={pos.planet} filter="url(#glow)">
            <circle cx={x} cy={y} r="14" fill="#1a1520" stroke="#9d8ec2" strokeWidth="1" />
            <text
              x={x}
              y={y}
              fill="#c9a0dc"
              fontSize="14"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {PLANET_GLYPHS[pos.planet]}
            </text>
          </g>
        );
      })}
      
      {/* Center decoration */}
      <circle cx={center} cy={center} r="30" fill="#1a1520" stroke="#9d8ec2" strokeWidth="2" />
      <text x={center} y={center} fill="#c9a0dc" fontSize="24" textAnchor="middle" dominantBaseline="middle">✧</text>
    </svg>
  );
};

// Daily Screen
const DailyScreen = ({ userData, chartData }) => {
  const moonPhase = getMoonPhase();
  const affirmation = getAffirmation(chartData.sunSign, moonPhase);
  
  const timeOfDay = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // Simulated current transits
  const currentTransits = [
    { planet: 'Saturn', aspect: 'trine', natalPlanet: 'Sun', sign: 'Pisces', intensity: 7, interpretation: 'A period of structured growth. Saturn harmonizes with your solar identity, offering opportunities to build lasting foundations.' },
    { planet: 'Jupiter', aspect: 'conjunction', natalPlanet: 'Mercury', sign: 'Gemini', intensity: 8, interpretation: 'Mental expansion and fortunate communications. Ideas flow abundantly—capture them before they scatter.' },
    { planet: 'Mars', aspect: 'square', natalPlanet: 'Moon', sign: 'Leo', intensity: 6, interpretation: 'Emotional friction catalyzes action. Channel restlessness into creative expression rather than conflict.' }
  ];

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '40px' }}>
        <h1 style={styles.greeting}>Good {timeOfDay}, {userData.name}</h1>
        <p style={styles.subtext}>{today} • {chartData.sunSign} Season</p>
      </div>

      {/* Daily Overview */}
      <div style={styles.card} className="card-hover">
        <h2 style={styles.cardTitle}>Daily Overview</h2>
        <div style={styles.interpretation}>
          <p>The cosmos speaks through geometry today, {userData.name}. With the Moon in {chartData.moonSign} and your {chartData.sunSign} Sun receiving harmonious aspects, this is a day for aligned action.</p>
          <p style={{ marginTop: '12px' }}>In Yoruba wisdom, this is a day when your Ori (inner head) and your actions can move as one. Pay attention to crossroads moments—Eshu opens paths for those who honor their destiny.</p>
        </div>
        <div style={{ display: 'flex', gap: '24px', marginTop: '20px', flexWrap: 'wrap' }}>
          <div>
            <span style={{ color: '#8a8694', fontSize: '13px' }}>Lucky Number</span>
            <p style={{ color: '#c9a0dc', fontSize: '24px', fontFamily: '"Cormorant Garamond", serif' }}>7</p>
          </div>
          <div>
            <span style={{ color: '#8a8694', fontSize: '13px' }}>Lucky Color</span>
            <p style={{ color: '#c9a0dc', fontSize: '18px' }}>Deep Violet</p>
          </div>
          <div>
            <span style={{ color: '#8a8694', fontSize: '13px' }}>Power Hour</span>
            <p style={{ color: '#c9a0dc', fontSize: '18px' }}>3:00 - 4:00 PM</p>
          </div>
        </div>
      </div>

      {/* Moon Phase */}
      <div style={styles.card} className="card-hover">
        <h2 style={styles.cardTitle}>Lunar Energy</h2>
        <div style={styles.moonCard}>
          <span style={styles.moonEmoji}>{moonPhase.emoji}</span>
          <div>
            <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '24px', marginBottom: '8px' }}>{moonPhase.name}</h3>
            <p style={{ color: '#8a8694', marginBottom: '12px' }}>{Math.round(moonPhase.illumination)}% Illuminated</p>
            <p style={styles.interpretation}>
              {getInterpretation('moonPhase', { phase: moonPhase.name })}
            </p>
          </div>
        </div>
      </div>

      {/* Active Transits */}
      <div style={styles.card} className="card-hover">
        <h2 style={styles.cardTitle}>Active Transits</h2>
        {currentTransits.map((transit, i) => (
          <div key={i} style={styles.transitItem}>
            <div style={{
              ...styles.transitIntensity,
              background: transit.intensity > 7 ? '#d4a574' : transit.intensity > 5 ? '#c9a0dc' : '#8b9a82'
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ color: '#c9a0dc', fontWeight: '600' }}>
                  {PLANET_GLYPHS[transit.planet]} {transit.planet}
                </span>
                <span style={{ color: '#8a8694' }}>{ASPECTS[transit.aspect]?.symbol}</span>
                <span style={{ color: '#c0b8cf' }}>
                  {PLANET_GLYPHS[transit.natalPlanet]} Natal {transit.natalPlanet}
                </span>
              </div>
              <p style={{ ...styles.interpretation, fontSize: '14px' }}>{transit.interpretation}</p>
              <div style={styles.orishaCard}>
                <p style={{ fontSize: '13px', color: '#8a8694' }}>
                  <strong style={{ color: '#c9a0dc' }}>{ORISHA_CORRESPONDENCES[transit.planet].orisha}</strong> energy is active. 
                  {' '}{ORISHA_CORRESPONDENCES[transit.planet].traits}.
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Daily Affirmation */}
      <div style={{ ...styles.card, background: 'linear-gradient(135deg, #1a1520 0%, #2d2440 50%, #1a1520 100%)' }} className="card-hover">
        <h2 style={{ ...styles.cardTitle, textAlign: 'center' }}>Daily Affirmation</h2>
        <p style={styles.affirmation}>"{affirmation}"</p>
        <p style={{ textAlign: 'center', color: '#8a8694', fontSize: '13px' }}>
          Based on your {chartData.sunSign} Sun & {moonPhase.name}
        </p>
      </div>
    </div>
  );
};

// Natal Chart Screen
const NatalScreen = ({ userData, chartData }) => {
  const [activeTab, setActiveTab] = useState('chart');
  const interpretation = getInterpretation('sunSign', { sign: chartData.sunSign });
  const moonInterpretation = getInterpretation('moonSign', { sign: chartData.moonSign });
  const risingInterpretation = getInterpretation('risingSign', { sign: chartData.rising });

  return (
    <div className="fade-in">
      <h1 style={{ ...styles.greeting, marginBottom: '8px' }}>Your Cosmic Blueprint</h1>
      <p style={{ ...styles.subtext, marginBottom: '32px' }}>
        Born {new Date(userData.birthDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        {userData.birthTime && ` at ${userData.birthTime}`}
        {userData.birthCity && ` in ${userData.birthCity}`}
      </p>

      {/* Big Three */}
      <div style={styles.bigThree}>
        <div style={styles.bigThreeItem}>
          <span style={{ ...styles.glyph, color: '#d4a574' }}>{SIGN_GLYPHS[chartData.sunSign]}</span>
          <p style={styles.signName}>{chartData.sunSign}</p>
          <p style={styles.signLabel}>Sun Sign</p>
        </div>
        <div style={styles.bigThreeItem}>
          <span style={{ ...styles.glyph, color: '#7a9bb5' }}>{SIGN_GLYPHS[chartData.moonSign]}</span>
          <p style={styles.signName}>{chartData.moonSign}</p>
          <p style={styles.signLabel}>Moon Sign</p>
        </div>
        <div style={styles.bigThreeItem}>
          <span style={{ ...styles.glyph, color: '#a8b5c4' }}>{SIGN_GLYPHS[chartData.rising] || '?'}</span>
          <p style={styles.signName}>{chartData.rising}</p>
          <p style={styles.signLabel}>Rising Sign</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {['chart', 'placements', 'interpretations'].map(tab => (
          <button
            key={tab}
            style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'chart' && (
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <NatalChartWheel positions={chartData.positions} aspects={chartData.aspects} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '20px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '2px', background: '#8b9a82' }} />
              <span style={{ fontSize: '13px', color: '#8a8694' }}>Soft Aspects</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '2px', background: '#d4a574', borderStyle: 'dashed' }} />
              <span style={{ fontSize: '13px', color: '#8a8694' }}>Hard Aspects</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'placements' && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Planetary Positions</h3>
          {chartData.positions.map((pos, i) => (
            <div key={i} style={{ ...styles.transitItem, borderColor: 'rgba(92, 77, 122, 0.2)' }}>
              <span style={{ fontSize: '24px', color: '#c9a0dc', width: '32px' }}>{PLANET_GLYPHS[pos.planet]}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <strong style={{ color: '#e8e6ed' }}>{pos.planet}</strong>
                  <span style={{ color: '#8a8694' }}>in</span>
                  <span style={{ color: ELEMENTS[pos.sign] === 'fire' ? '#d4a574' : ELEMENTS[pos.sign] === 'water' ? '#7a9bb5' : ELEMENTS[pos.sign] === 'earth' ? '#8b9a82' : '#a8b5c4' }}>
                    {SIGN_GLYPHS[pos.sign]} {pos.sign}
                  </span>
                  <span style={{ color: '#6b6574', fontSize: '14px' }}>{pos.degree}°</span>
                  {pos.retrograde && <span style={{ color: '#d4a574', fontSize: '12px' }}>℞</span>}
                </div>
                <p style={{ fontSize: '13px', color: '#6b6574', marginTop: '4px' }}>House {pos.house}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'interpretations' && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Your {chartData.sunSign} Sun</h3>
          {interpretation && (
            <>
              <div style={styles.interpretationSection}>
                <p style={styles.interpretationLabel}>Western Perspective</p>
                <p style={styles.interpretation}>{interpretation.western}</p>
              </div>
              <div style={styles.interpretationSection}>
                <p style={styles.interpretationLabel}>Yoruba Wisdom</p>
                <p style={styles.interpretation}>{interpretation.yoruba}</p>
              </div>
              <div style={styles.interpretationSection}>
                <p style={styles.interpretationLabel}>Synthesis</p>
                <p style={styles.interpretation}>{interpretation.synthesis}</p>
              </div>
              <div style={styles.orishaCard}>
                <p style={styles.orishaName}>{ORISHA_CORRESPONDENCES.Sun.orisha}</p>
                <p style={styles.orishaDomain}>{ORISHA_CORRESPONDENCES.Sun.domain}</p>
                <p style={{ fontSize: '14px', color: '#c0b8cf' }}>
                  Your Sun sign connects you to {ORISHA_CORRESPONDENCES.Sun.orisha}'s energy: {ORISHA_CORRESPONDENCES.Sun.traits}.
                </p>
              </div>
            </>
          )}

          {/* Moon Interpretation */}
          <h3 style={{ ...styles.cardTitle, marginTop: '24px' }}>Your {chartData.moonSign} Moon</h3>
          {moonInterpretation && (
            <>
              <div style={styles.interpretationSection}>
                <p style={styles.interpretationLabel}>Western Perspective</p>
                <p style={styles.interpretation}>{moonInterpretation.western}</p>
              </div>
              <div style={styles.interpretationSection}>
                <p style={styles.interpretationLabel}>Yoruba Wisdom</p>
                <p style={styles.interpretation}>{moonInterpretation.yoruba}</p>
              </div>
              <div style={styles.interpretationSection}>
                <p style={styles.interpretationLabel}>Shadow Work</p>
                <p style={styles.interpretation}>{moonInterpretation.shadowWork}</p>
              </div>
            </>
          )}

          {/* Rising Interpretation */}
          <h3 style={{ ...styles.cardTitle, marginTop: '24px' }}>Your {chartData.rising} Rising</h3>
          {risingInterpretation && (
            <>
              <div style={styles.interpretationSection}>
                <p style={styles.interpretationLabel}>Western Perspective</p>
                <p style={styles.interpretation}>{risingInterpretation.western}</p>
              </div>
              <div style={styles.interpretationSection}>
                <p style={styles.interpretationLabel}>Yoruba Wisdom</p>
                <p style={styles.interpretation}>{risingInterpretation.yoruba}</p>
              </div>
              <div style={styles.interpretationSection}>
                <p style={styles.interpretationLabel}>Life Themes</p>
                <p style={styles.interpretation}>{risingInterpretation.lifeThemes}</p>
              </div>
            </>
          )}

          <h3 style={{ ...styles.cardTitle, marginTop: '32px' }}>Major Aspects</h3>
          {chartData.aspects.slice(0, 6).map((aspect, i) => (
            <div key={i} style={{ ...styles.transitItem, borderColor: 'rgba(92, 77, 122, 0.2)' }}>
              <span style={{ fontSize: '20px', color: aspect.nature === 'soft' ? '#8b9a82' : '#d4a574' }}>
                {aspect.symbol}
              </span>
              <div>
                <p style={{ color: '#e8e6ed' }}>
                  {PLANET_GLYPHS[aspect.planet1]} {aspect.planet1} {aspect.symbol} {PLANET_GLYPHS[aspect.planet2]} {aspect.planet2}
                </p>
                <p style={{ fontSize: '13px', color: '#6b6574' }}>Orb: {aspect.orb}° • {aspect.nature.charAt(0).toUpperCase() + aspect.nature.slice(1)} aspect</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Journal Screen
const JournalScreen = ({ userData, chartData, entries, setEntries }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '',
    title: '',
    content: '',
    mood: '',
    tags: []
  });

  const moods = [
    { value: 'radiant', icon: '☀️', color: '#ffd700' },
    { value: 'peaceful', icon: '🌙', color: '#a8dadc' },
    { value: 'energized', icon: '⚡', color: '#ff6b35' },
    { value: 'reflective', icon: '👁️', color: '#457b9d' },
    { value: 'challenged', icon: '☁️', color: '#6b6b7b' },
    { value: 'transforming', icon: '🔄', color: '#e94560' }
  ];

  const handleSave = () => {
    const entry = {
      id: Date.now(),
      ...newEntry,
      createdAt: new Date().toISOString(),
      moonPhase: getMoonPhase().name,
      sunSign: chartData.sunSign
    };
    setEntries([entry, ...entries]);
    setShowModal(false);
    setNewEntry({ date: new Date().toISOString().split('T')[0], time: '', title: '', content: '', mood: '', tags: [] });
  };

  return (
    <div className="fade-in">
      <h1 style={{ ...styles.greeting, marginBottom: '8px' }}>Cosmic Journal</h1>
      <p style={{ ...styles.subtext, marginBottom: '32px' }}>
        Track your journey through the stars • {entries.length} entries
      </p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div style={styles.bigThreeItem}>
          <span style={{ fontSize: '32px', color: '#c9a0dc', fontFamily: '"Cormorant Garamond", serif' }}>{entries.length}</span>
          <p style={styles.signLabel}>Total Entries</p>
        </div>
        <div style={styles.bigThreeItem}>
          <span style={{ fontSize: '32px', color: '#c9a0dc', fontFamily: '"Cormorant Garamond", serif' }}>
            {entries.filter(e => {
              const entryDate = new Date(e.date);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return entryDate >= weekAgo;
            }).length}
          </span>
          <p style={styles.signLabel}>This Week</p>
        </div>
        <div style={styles.bigThreeItem}>
          <span style={{ fontSize: '32px', color: '#c9a0dc', fontFamily: '"Cormorant Garamond", serif' }}>
            {[...new Set(entries.map(e => e.mood).filter(Boolean))].length}
          </span>
          <p style={styles.signLabel}>Moods Tracked</p>
        </div>
      </div>

      {/* Entries List */}
      {entries.length === 0 ? (
        <div style={{ ...styles.card, textAlign: 'center', padding: '60px 40px' }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '20px' }}>📔</span>
          <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '24px', marginBottom: '12px' }}>Begin Your Cosmic Chronicle</h3>
          <p style={{ color: '#8a8694', marginBottom: '24px' }}>
            Your journal is where transits become wisdom and moments become medicine.
          </p>
          <button style={styles.button} onClick={() => setShowModal(true)}>
            Write Your First Entry
          </button>
        </div>
      ) : (
        entries.map(entry => (
          <div
            key={entry.id}
            style={styles.journalEntry}
            className="card-hover"
            onClick={() => setSelectedEntry(entry)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={styles.journalDate}>
                  {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  {entry.moonPhase && ` • ${entry.moonPhase}`}
                </p>
                {entry.title && <h3 style={styles.journalTitle}>{entry.title}</h3>}
                <p style={styles.journalExcerpt}>
                  {entry.content.substring(0, 150)}{entry.content.length > 150 ? '...' : ''}
                </p>
              </div>
              {entry.mood && (
                <span style={{ fontSize: '24px' }}>
                  {moods.find(m => m.value === entry.mood)?.icon}
                </span>
              )}
            </div>
            {entry.tags && entry.tags.length > 0 && (
              <div style={styles.tags}>
                {entry.tags.map((tag, i) => (
                  <span key={i} style={styles.tag}>{tag}</span>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      {/* FAB */}
      <button style={styles.fab} onClick={() => setShowModal(true)}>+</button>

      {/* New Entry Modal */}
      {showModal && (
        <div style={styles.modal} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>New Journal Entry</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Date</label>
                <input
                  type="date"
                  style={styles.input}
                  value={newEntry.date}
                  onChange={e => setNewEntry({ ...newEntry, date: e.target.value })}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Time (optional)</label>
                <input
                  type="time"
                  style={styles.input}
                  value={newEntry.time}
                  onChange={e => setNewEntry({ ...newEntry, time: e.target.value })}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Title (optional)</label>
              <input
                type="text"
                style={styles.input}
                placeholder="Give this entry a title..."
                value={newEntry.title}
                onChange={e => setNewEntry({ ...newEntry, title: e.target.value })}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>What's on your mind?</label>
              <textarea
                style={{ ...styles.input, minHeight: '150px', resize: 'vertical' }}
                placeholder="How are the stars affecting you today? What synchronicities have you noticed?"
                value={newEntry.content}
                onChange={e => setNewEntry({ ...newEntry, content: e.target.value })}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Current Mood</label>
              <div style={styles.moodSelector}>
                {moods.map(mood => (
                  <div
                    key={mood.value}
                    style={{
                      ...styles.moodOption,
                      ...(newEntry.mood === mood.value ? styles.moodSelected : {}),
                      borderColor: newEntry.mood === mood.value ? mood.color : '#5c4d7a'
                    }}
                    onClick={() => setNewEntry({ ...newEntry, mood: mood.value })}
                  >
                    {mood.icon}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
              <button
                style={{ ...styles.button, ...styles.buttonSecondary, flex: 1 }}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                style={{ ...styles.button, flex: 2 }}
                onClick={handleSave}
                disabled={!newEntry.content.trim()}
              >
                Save Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Entry Detail Modal */}
      {selectedEntry && (
        <div style={styles.modal} onClick={() => setSelectedEntry(null)}>
          <div style={{ ...styles.modalContent, maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <p style={{ color: '#8a8694', marginBottom: '8px' }}>
              {new Date(selectedEntry.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              {selectedEntry.time && ` at ${selectedEntry.time}`}
            </p>
            {selectedEntry.title && <h2 style={styles.modalTitle}>{selectedEntry.title}</h2>}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              {selectedEntry.mood && (
                <span style={styles.tag}>
                  {moods.find(m => m.value === selectedEntry.mood)?.icon} {selectedEntry.mood}
                </span>
              )}
              {selectedEntry.moonPhase && (
                <span style={styles.tag}>🌙 {selectedEntry.moonPhase}</span>
              )}
            </div>
            <p style={{ ...styles.interpretation, whiteSpace: 'pre-wrap' }}>{selectedEntry.content}</p>
            
            {selectedEntry.tags && selectedEntry.tags.length > 0 && (
              <div style={{ ...styles.tags, marginTop: '24px' }}>
                {selectedEntry.tags.map((tag, i) => (
                  <span key={i} style={styles.tag}>{tag}</span>
                ))}
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
              <button
                style={{ ...styles.button, ...styles.buttonSecondary, flex: 1 }}
                onClick={() => {
                  setEntries(entries.filter(e => e.id !== selectedEntry.id));
                  setSelectedEntry(null);
                }}
              >
                Delete
              </button>
              <button
                style={{ ...styles.button, flex: 1 }}
                onClick={() => setSelectedEntry(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Orisha Wisdom Screen - Extended Orisha profiles and quiz
const OrishaWisdomScreen = ({ userData, chartData }) => {
  const [selectedOrisha, setSelectedOrisha] = useState(null);
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [orishaAffinities, setOrishaAffinities] = useState([]);

  useEffect(() => {
    if (chartData && chartData.positions) {
      const affinities = calculateOrishaAffinities(chartData.positions, userData);
      setOrishaAffinities(affinities);
    }
  }, [chartData, userData]);

  const handleTakeQuiz = () => {
    setShowQuizResults(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const extendedOrishasList = Object.keys(EXTENDED_ORISHA_PROFILES);

  return (
    <div className="fade-in">
      <h1 style={{ ...styles.greeting, marginBottom: '16px' }}>Orisha Wisdom</h1>
      <p style={{ ...styles.text, fontSize: '16px', marginBottom: '32px', fontStyle: 'italic' }}>
        Beyond the Planetary Correspondences
      </p>

      {/* Cultural Disclaimer */}
      <div style={{
        ...styles.card,
        backgroundColor: '#252030',
        borderLeft: '4px solid #c9a0dc',
        marginBottom: '32px'
      }}>
        <p style={{ ...styles.text, fontSize: '14px', lineHeight: 1.7 }}>
          {YORUBA_CULTURAL_DISCLAIMER}
        </p>
      </div>

      {/* Which Orisha Walks With You? Quiz */}
      {!showQuizResults && chartData && (
        <div style={{ ...styles.card, textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ ...styles.sectionTitle, marginBottom: '16px' }}>
            Which Orisha Walks With You?
          </h2>
          <p style={{ ...styles.text, marginBottom: '24px' }}>
            Based on your natal chart, discover which Orishas resonate most deeply with your spiritual path.
          </p>
          <button
            style={{
              ...styles.button,
              padding: '16px 32px',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
            onClick={handleTakeQuiz}
          >
            Reveal Your Orisha Connections
          </button>
        </div>
      )}

      {/* Quiz Results */}
      {showQuizResults && orishaAffinities.length > 0 && (
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{ ...styles.sectionTitle, marginBottom: '24px', textAlign: 'center' }}>
            Your Orisha Connections
          </h2>
          {orishaAffinities.map((affinity, index) => {
            const profile = EXTENDED_ORISHA_PROFILES[affinity.orisha] || {};
            return (
              <div
                key={affinity.orisha}
                style={{
                  ...styles.card,
                  marginBottom: '24px',
                  backgroundColor: index === 0 ? '#2d2438' : '#1a1520',
                  borderLeft: index === 0 ? '4px solid #c9a0dc' : '4px solid #7b6b9e'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{
                    fontSize: '32px',
                    marginRight: '16px',
                    color: '#c9a0dc'
                  }}>
                    {index === 0 ? '👑' : index === 1 ? '✨' : '🌟'}
                  </span>
                  <div>
                    <h3 style={{ ...styles.cardTitle, margin: 0 }}>
                      {affinity.orisha}
                    </h3>
                    <p style={{ ...styles.text, fontSize: '14px', fontStyle: 'italic', margin: '4px 0 0 0', opacity: 0.8 }}>
                      {profile.title || ''}
                    </p>
                  </div>
                </div>
                <p style={{ ...styles.text, marginBottom: '12px' }}>
                  <strong style={{ color: '#c9a0dc' }}>Connection Strength:</strong> {affinity.score} points
                </p>
                <p style={{ ...styles.text, marginBottom: '8px' }}>
                  <strong style={{ color: '#c9a0dc' }}>Why {affinity.orisha} walks with you:</strong>
                </p>
                <ul style={{ ...styles.text, paddingLeft: '20px', margin: 0 }}>
                  {affinity.reasons.map((reason, idx) => (
                    <li key={idx} style={{ marginBottom: '6px' }}>{reason}</li>
                  ))}
                </ul>
                {profile.domain && (
                  <p style={{ ...styles.text, marginTop: '16px', fontStyle: 'italic', opacity: 0.9 }}>
                    Domain: {profile.domain}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Extended Orisha Profiles */}
      <h2 style={{ ...styles.sectionTitle, marginBottom: '24px', textAlign: 'center' }}>
        The Extended Pantheon
      </h2>
      <p style={{ ...styles.text, textAlign: 'center', marginBottom: '32px' }}>
        Five Orishas beyond the primary planetary correspondences, each offering unique wisdom for your journey.
      </p>

      {extendedOrishasList.map(orishaName => {
        const profile = EXTENDED_ORISHA_PROFILES[orishaName];
        const isSelected = selectedOrisha === orishaName;

        return (
          <div
            key={orishaName}
            style={{
              ...styles.card,
              marginBottom: '20px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={() => setSelectedOrisha(isSelected ? null : orishaName)}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h3 style={{ ...styles.cardTitle, margin: 0 }}>
                  {profile.name}
                </h3>
                <p style={{ ...styles.text, fontSize: '14px', fontStyle: 'italic', margin: '4px 0 0 0', opacity: 0.8 }}>
                  {profile.title}
                </p>
              </div>
              <span style={{ fontSize: '24px', color: '#c9a0dc' }}>
                {isSelected ? '▼' : '▶'}
              </span>
            </div>

            {/* Always visible summary */}
            <p style={{ ...styles.text, marginBottom: '8px' }}>
              <strong style={{ color: '#c9a0dc' }}>Domain:</strong> {profile.domain}
            </p>
            <p style={{ ...styles.text, marginBottom: '8px' }}>
              <strong style={{ color: '#c9a0dc' }}>Planetary Link:</strong> {profile.planetaryLink}
            </p>

            {/* Expandable detailed content */}
            {isSelected && (
              <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #5c4d7a' }}>
                {/* Colors & Element */}
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ ...styles.text, marginBottom: '8px' }}>
                    <strong style={{ color: '#c9a0dc' }}>Colors:</strong> {profile.colors.join(', ')}
                  </p>
                  <p style={{ ...styles.text, marginBottom: '8px' }}>
                    <strong style={{ color: '#c9a0dc' }}>Element:</strong> {profile.element}
                  </p>
                  <p style={{ ...styles.text }}>
                    <strong style={{ color: '#c9a0dc' }}>Symbols:</strong> {profile.symbols.join(', ')}
                  </p>
                </div>

                {/* Mythology */}
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ ...styles.text, fontWeight: 'bold', color: '#c9a0dc', marginBottom: '12px' }}>
                    Sacred Mythology
                  </h4>
                  <p style={{ ...styles.text, lineHeight: 1.7 }}>
                    {profile.mythology}
                  </p>
                </div>

                {/* Sacred Teachings */}
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ ...styles.text, fontWeight: 'bold', color: '#c9a0dc', marginBottom: '12px' }}>
                    Sacred Teachings
                  </h4>
                  <p style={{ ...styles.text, lineHeight: 1.7 }}>
                    {profile.sacred}
                  </p>
                </div>

                {/* Astrological Connections */}
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ ...styles.text, fontWeight: 'bold', color: '#c9a0dc', marginBottom: '12px' }}>
                    Astrological Resonance
                  </h4>
                  <p style={{ ...styles.text, lineHeight: 1.7 }}>
                    {profile.astrological}
                  </p>
                </div>

                {/* Signs of Connection */}
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ ...styles.text, fontWeight: 'bold', color: '#c9a0dc', marginBottom: '12px' }}>
                    Signs {profile.name} Walks With You
                  </h4>
                  <ul style={{ ...styles.text, paddingLeft: '20px', lineHeight: 1.7 }}>
                    {profile.signsOfConnection.map((sign, idx) => (
                      <li key={idx} style={{ marginBottom: '8px' }}>{sign}</li>
                    ))}
                  </ul>
                </div>

                {/* Offerings */}
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ ...styles.text, fontWeight: 'bold', color: '#c9a0dc', marginBottom: '12px' }}>
                    Sacred Offerings
                  </h4>
                  <p style={{ ...styles.text }}>
                    {profile.offerings.join(' • ')}
                  </p>
                </div>

                {/* Working With */}
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ ...styles.text, fontWeight: 'bold', color: '#c9a0dc', marginBottom: '12px' }}>
                    Working With {profile.name}
                  </h4>
                  <p style={{ ...styles.text, lineHeight: 1.7 }}>
                    {profile.workingWith}
                  </p>
                </div>

                {/* Shadow */}
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ ...styles.text, fontWeight: 'bold', color: '#c9a0dc', marginBottom: '12px' }}>
                    Shadow Work
                  </h4>
                  <p style={{ ...styles.text, lineHeight: 1.7 }}>
                    {profile.shadow}
                  </p>
                </div>

                {/* Integration */}
                <div>
                  <h4 style={{ ...styles.text, fontWeight: 'bold', color: '#c9a0dc', marginBottom: '12px' }}>
                    Integration Practice
                  </h4>
                  <p style={{ ...styles.text, lineHeight: 1.7 }}>
                    {profile.integration}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Settings Screen
const SettingsScreen = ({ userData, setUserData, onLogout, settings, setSettings }) => {

  return (
    <div className="fade-in">
      <h1 style={{ ...styles.greeting, marginBottom: '32px' }}>Settings</h1>

      {/* Profile */}
      <div style={styles.card}>
        <h3 style={styles.settingsTitle}>Profile</h3>
        <div style={styles.formGroup}>
          <label style={styles.label}>Name</label>
          <input
            type="text"
            style={styles.input}
            value={userData.name}
            onChange={e => setUserData({ ...userData, name: e.target.value })}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Ephemeris API URL (optional)</label>
          <input
            type="url"
            style={styles.input}
            value={settings.ephemerisApiUrl || ''}
            onChange={e => setSettings({ ...settings, ephemerisApiUrl: e.target.value })}
            placeholder="https://api.example.com/natal"
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Ephemeris API Key (optional)</label>
          <input
            type="text"
            style={styles.input}
            value={settings.ephemerisApiKey || ''}
            onChange={e => setSettings({ ...settings, ephemerisApiKey: e.target.value })}
            placeholder="Paste API key here"
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Birth Date</label>
          <input
            type="date"
            style={styles.input}
            value={userData.birthDate}
            onChange={e => setUserData({ ...userData, birthDate: e.target.value })}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Birth Time</label>
          <input
            type="time"
            style={styles.input}
            value={userData.birthTime || ''}
            onChange={e => setUserData({ ...userData, birthTime: e.target.value })}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Birth City</label>
          <input
            type="text"
            style={styles.input}
            value={userData.birthCity || ''}
            onChange={e => setUserData({ ...userData, birthCity: e.target.value })}
          />
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
          <button
            style={{ ...styles.button, ...styles.buttonSecondary }}
            onClick={async () => {
              const query = userData.birthCountry ? `${userData.birthCity}, ${userData.birthCountry}` : (userData.birthCity || '');
              const geo = await geocodeCity(query);
              if (geo) {
                setUserData({ ...userData, birthLat: geo.latitude, birthLng: geo.longitude });
                alert('Coordinates resolved and saved.');
              } else {
                alert('Could not resolve coordinates. Try a more specific city name.');
              }
            }}
          >
            Resolve Coordinates
          </button>
        </div>
      </div>

      {/* Preferences */}
      <div style={styles.card}>
        <h3 style={styles.settingsTitle}>Preferences</h3>
        
        <div style={styles.toggle}>
          <div>
            <p style={{ color: '#e8e6ed', marginBottom: '4px' }}>Daily Notifications</p>
            <p style={{ color: '#6b6574', fontSize: '13px' }}>Receive daily cosmic insights</p>
          </div>
          <div
            style={{ ...styles.toggleSwitch, ...(settings.notifications ? styles.toggleActive : {}) }}
            onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
          >
            <div style={{ ...styles.toggleKnob, ...(settings.notifications ? styles.toggleKnobActive : {}) }} />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>House System</label>
          <select
            style={styles.input}
            value={settings.houseSystem}
            onChange={e => setSettings({ ...settings, houseSystem: e.target.value })}
          >
            <option value="placidus">Placidus</option>
            <option value="whole-sign">Whole Sign</option>
            <option value="koch">Koch</option>
            <option value="equal">Equal House</option>
          </select>
        </div>
      </div>

      {/* About */}
      <div style={styles.card}>
        <h3 style={styles.settingsTitle}>About Celestial Self</h3>
        <p style={{ color: '#8a8694', marginBottom: '12px' }}>Version 1.0.0</p>
        <p style={styles.interpretation}>
          Celestial Self integrates Western Astrological wisdom with Yoruba cosmological perspectives, 
          offering a unique lens through which to understand your cosmic blueprint and daily journey.
        </p>
        <p style={{ ...styles.interpretation, marginTop: '12px' }}>
          This app honors both the "geometry of time" found in planetary movements and the 
          "mythology of agency" embedded in Yoruba traditions of Ori, Iwa-Pele, and the Orishas.
        </p>
      </div>

      {/* Logout */}
      <button
        style={{ ...styles.button, ...styles.buttonSecondary, width: '100%', marginTop: '16px' }}
        onClick={onLogout}
      >
        Start Fresh (Clear Data)
      </button>
    </div>
  );
};

// Navigation icons
const NavIcon = ({ icon }) => {
  const icons = {
    sun: '☀️',
    'star-chart': '✧',
    'book-open': '📔',
    settings: '⚙️'
  };
  return <span style={styles.navIcon}>{icons[icon] || '•'}</span>;
};

// Main App Component
export default function CelestialSelf() {
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [userData, setUserData] = useState(null);
  const [activeScreen, setActiveScreen] = useState('daily');
  const [journalEntries, setJournalEntries] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    houseSystem: 'placidus',
    theme: 'dark'
  });

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('celestialSelfUser');
    const storedEntries = localStorage.getItem('celestialSelfJournal');
    if (stored) {
      setUserData(JSON.parse(stored));
      setIsOnboarded(true);
    }
    if (storedEntries) {
      setJournalEntries(JSON.parse(storedEntries));
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    if (userData) {
      localStorage.setItem('celestialSelfUser', JSON.stringify(userData));
    }
  }, [userData]);

  useEffect(() => {
    localStorage.setItem('celestialSelfJournal', JSON.stringify(journalEntries));
  }, [journalEntries]);

  // Calculate chart data using ephemeris utils (async to support selectable house systems)
  const [chartData, setChartData] = useState(null);
  useEffect(() => {
    let cancelled = false;
    const compute = async () => {
      if (!userData?.birthDate) {
        setChartData(null);
        return;
      }
      const birthTime = userData.birthTime || '12:00';
      const latitude = userData.birthLat || 0;
      const longitude = userData.birthLng || 0;
      const houseSystem = (settings && settings.houseSystem) ? settings.houseSystem : 'equal';

      let natal = null;
      if (settings?.ephemerisApiUrl) {
        try {
          natal = await fetchNatalChartFromApi(settings.ephemerisApiUrl, settings.ephemerisApiKey, {
            birthDate: userData.birthDate,
            birthTime: birthTime,
            latitude,
            longitude,
            houseSystem
          });
        } catch (e) {
          console.warn('Ephemeris API failed, falling back to local ephemeris:', e.message);
          natal = await getNatalChart(userData.birthDate, birthTime, latitude, longitude, houseSystem);
        }
      } else {
        natal = await getNatalChart(userData.birthDate, birthTime, latitude, longitude, houseSystem);
      }

      const positions = Object.keys(natal.positions).map(planet => {
        const p = natal.positions[planet];
        const lonDeg = typeof p === 'number' ? p : (p?.longitude ?? 0);
        const retro = typeof p === 'object' ? !!p.retrograde : false;
        const norm = ((lonDeg % 360) + 360) % 360;
        const signIndex = Math.floor(norm / 30);
        const sign = ZODIAC_SIGNS[signIndex];
        const degree = +(norm % 30).toFixed(2);
        const houseIndex = Math.floor((((norm - natal.ascendant) + 360) % 360) / 30) + 1;
        return { planet, sign, degree, house: houseIndex, degreeRaw: norm, retrograde: retro };
      });

      const sunP = natal.positions['Sun'];
      const moonP = natal.positions['Moon'];
      const sunLon = typeof sunP === 'number' ? sunP : (sunP?.longitude ?? 0);
      const moonLon = typeof moonP === 'number' ? moonP : (moonP?.longitude ?? 0);

      const sunSign = ZODIAC_SIGNS[Math.floor((((sunLon % 360) + 360) % 360) / 30)];
      const moonSign = ZODIAC_SIGNS[Math.floor((((moonLon % 360) + 360) % 360) / 30)];
      const rising = ZODIAC_SIGNS[Math.floor((((natal.ascendant % 360) + 360) % 360) / 30)];

      const aspects = calculateAspects(positions);

      const result = { sunSign, moonSign, rising, positions, aspects, ascendant: natal.ascendant, houses: natal.houses };
      if (!cancelled) setChartData(result);
    };
    compute();
    return () => { cancelled = true; };
  }, [userData, settings]);

  const handleOnboardingComplete = async (data) => {
    const cityQuery = data.birthCountry ? `${data.birthCity}, ${data.birthCountry}` : data.birthCity;
    const geo = await geocodeCity(cityQuery);
    const enriched = { ...data };
    if (geo) {
      enriched.birthLat = geo.latitude;
      enriched.birthLng = geo.longitude;
    }
    setUserData(enriched);
    setIsOnboarded(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('celestialSelfUser');
    localStorage.removeItem('celestialSelfJournal');
    setUserData(null);
    setJournalEntries([]);
    setIsOnboarded(false);
  };

  const navItems = [
    { id: 'daily', label: 'Daily Insights', icon: 'sun' },
    { id: 'natal', label: 'Natal Chart', icon: 'star-chart' },
    { id: 'orisha', label: 'Orisha Wisdom', icon: 'crown' },
    { id: 'journal', label: 'Cosmic Journal', icon: 'book-open' },
    { id: 'settings', label: 'Settings', icon: 'settings' }
  ];

  if (!isOnboarded) {
    return (
      <>
        <GlobalStyles />
        <div style={styles.app}>
          <Onboarding onComplete={handleOnboardingComplete} />
        </div>
      </>
    );
  }

  return (
    <>
      <GlobalStyles />
      <div style={styles.app}>
        <Starfield />
        
        {/* Sidebar */}
        <aside style={{ ...styles.sidebar, ...(sidebarCollapsed ? styles.sidebarCollapsed : {}), position: 'relative', zIndex: 10 }}>
          <div 
            style={{ ...styles.logo, ...(sidebarCollapsed ? styles.logoSmall : {}), cursor: 'pointer' }}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? '✧' : 'Celestial Self'}
          </div>
          <nav style={{ flex: 1, paddingTop: '24px' }}>
            {navItems.map(item => (
              <div
                key={item.id}
                style={{
                  ...styles.navItem,
                  ...(activeScreen === item.id ? styles.navItemActive : {}),
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  padding: sidebarCollapsed ? '16px' : '16px 24px'
                }}
                onClick={() => setActiveScreen(item.id)}
              >
                <NavIcon icon={item.icon} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main style={{ ...styles.main, position: 'relative', zIndex: 1 }}>
          {activeScreen === 'daily' && chartData && (
            <DailyScreen userData={userData} chartData={chartData} />
          )}
          {activeScreen === 'natal' && chartData && (
            <NatalScreen userData={userData} chartData={chartData} />
          )}
          {activeScreen === 'orisha' && chartData && (
            <OrishaWisdomScreen userData={userData} chartData={chartData} />
          )}
          {activeScreen === 'journal' && chartData && (
            <JournalScreen
              userData={userData}
              chartData={chartData}
              entries={journalEntries}
              setEntries={setJournalEntries}
            />
          )}
          {activeScreen === 'settings' && (
            <SettingsScreen
              userData={userData}
              setUserData={setUserData}
              onLogout={handleLogout}
              settings={settings}
              setSettings={setSettings}
            />
          )}
        </main>
      </div>
    </>
  );
}
