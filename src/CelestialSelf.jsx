import React, { useState, useEffect, useMemo, useCallback } from 'react';

// ============================================================================
// CELESTIAL SELF - Personal Astrology Companion
// Integrating Western Astrology with Yoruba Cosmological Wisdom
// ============================================================================

// Ephemeris calculation utilities (simplified for browser)
const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libitha', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];
// Fix typo
ZODIAC_SIGNS[6] = 'Libra';

const PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

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

// Simplified ephemeris calculations
const calculateSunSign = (month, day) => {
  const dates = [
    [3, 21], [4, 20], [5, 21], [6, 21], [7, 23], [8, 23],
    [9, 23], [10, 23], [11, 22], [12, 22], [1, 20], [2, 19]
  ];
  for (let i = 0; i < 12; i++) {
    const [m, d] = dates[i];
    const [nm, nd] = dates[(i + 1) % 12];
    if ((month === m && day >= d) || (month === nm && day < nd)) {
      return ZODIAC_SIGNS[i];
    }
  }
  return ZODIAC_SIGNS[9]; // Capricorn default
};

const calculateMoonSign = (birthDate, birthTime) => {
  // Simplified moon calculation based on lunar cycle
  const date = new Date(birthDate + 'T' + (birthTime || '12:00'));
  const days = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  const moonCycle = days % 27.3; // Approximate moon sign cycle
  return ZODIAC_SIGNS[Math.floor((moonCycle / 27.3) * 12) % 12];
};

const calculateRising = (birthTime, birthDate) => {
  if (!birthTime) return 'Unknown';
  const [hours, minutes] = birthTime.split(':').map(Number);
  const date = new Date(birthDate);
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const risingIndex = Math.floor(((hours + minutes / 60 + dayOfYear * 0.0657) / 2) % 12);
  return ZODIAC_SIGNS[risingIndex];
};

const calculatePlanetPositions = (birthDate, birthTime) => {
  const date = new Date(birthDate + 'T' + (birthTime || '12:00'));
  const days = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  
  // Orbital periods in days (approximate)
  const periods = {
    Sun: 365.25, Moon: 27.3, Mercury: 88, Venus: 225, Mars: 687,
    Jupiter: 4333, Saturn: 10759, Uranus: 30687, Neptune: 60190, Pluto: 90560
  };
  
  return PLANETS.map(planet => {
    const cycle = (days / periods[planet]) % 1;
    const signIndex = Math.floor(cycle * 12);
    const degree = Math.floor((cycle * 360) % 30);
    const retrograde = planet !== 'Sun' && planet !== 'Moon' && Math.random() < 0.15;
    return {
      planet,
      sign: ZODIAC_SIGNS[signIndex],
      degree,
      house: (signIndex % 12) + 1,
      retrograde,
      longitude: signIndex * 30 + degree
    };
  });
};

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
  const interpretation = getInterpretation('sunSign', { sign: chartData.sunSign });
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

// Settings Screen
const SettingsScreen = ({ userData, setUserData, onLogout }) => {
  const [settings, setSettings] = useState({
    notifications: true,
    houseSystem: 'placidus',
    theme: 'dark'
  });

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

  // Calculate chart data
  const chartData = useMemo(() => {
    if (!userData?.birthDate) return null;
    
    const [year, month, day] = userData.birthDate.split('-').map(Number);
    const sunSign = calculateSunSign(month, day);
    const moonSign = calculateMoonSign(userData.birthDate, userData.birthTime);
    const rising = calculateRising(userData.birthTime, userData.birthDate);
    const positions = calculatePlanetPositions(userData.birthDate, userData.birthTime);
    const aspects = calculateAspects(positions);

    return { sunSign, moonSign, rising, positions, aspects };
  }, [userData]);

  const handleOnboardingComplete = (data) => {
    setUserData(data);
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
            />
          )}
        </main>
      </div>
    </>
  );
}
