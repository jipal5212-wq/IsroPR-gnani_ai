import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const galleryDir = path.join(projectRoot, 'data', 'gallery');

if (!fs.existsSync(galleryDir)) {
  fs.mkdirSync(galleryDir, { recursive: true });
}

export const GALLERY_ITEMS = [
  // 1. HUMAN SPACEFLIGHT (GAGANYAAN)
  {
    id: 'gaganyaan-tvd1',
    title: 'Gaganyaan TV-D1 Test Vehicle Liftoff',
    category: 'human-flight',
    categoryLabel: 'Human Spaceflight',
    year: '2023',
    tag: 'Gaganyaan Flight Test',
    description: 'ISRO launched the Test Vehicle Abort Mission-1 (TV-D1) from Sriharikota, successfully demonstrating the supersonic Crew Escape System.',
    source: 'https://en.wikipedia.org/wiki/TV-D1',
    remoteUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Gaganyaan_vehicle_used_for_TVD1_mission.webp',
    localFile: 'gaganyaan-tvd1.webp'
  },
  {
    id: 'gaganyaan-recovery',
    title: 'Gaganyaan Crew Module Ocean Recovery',
    category: 'human-flight',
    categoryLabel: 'Human Spaceflight',
    year: '2023',
    tag: 'Navy Recovery Operations',
    description: 'Indian Navy divers and Eastern Fleet recovery team safely securing the Gaganyaan Crew Module in the Bay of Bengal following splashdown.',
    source: 'https://commons.wikimedia.org/wiki/File:First_batch_of_crew_recovery_team_for_Mission_Gaganyaan_completed_Phase-1_of_training_at_Indian_Navy%27s_Water_Survival_Training_Facility_(WSTF)_02.jpg',
    remoteUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/First_batch_of_crew_recovery_team_for_Mission_Gaganyaan_completed_Phase-1_of_training_at_Indian_Navy%27s_Water_Survival_Training_Facility_%28WSTF%29_02.jpg',
    localFile: 'gaganyaan-recovery.jpg'
  },
  {
    id: 'gaganyaan-suit',
    title: 'Gaganyaan Intravehicular Flight Suit',
    category: 'human-flight',
    categoryLabel: 'Human Spaceflight',
    year: '2021',
    tag: 'Astronaut Gear',
    description: 'Indigenous orange pressure suit engineered to protect Indian Vyomnauts during launch, orbital operations, and atmospheric re-entry.',
    source: 'https://commons.wikimedia.org/wiki/File:Gaganyaan_flight_suit_at_IAC_2021.jpg',
    remoteUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Gaganyaan_flight_suit_at_IAC_2021.jpg',
    localFile: 'gaganyaan-suit.jpg'
  },
  {
    id: 'gaganyaan-scm',
    title: 'Gaganyaan Simulated Crew Module Structure',
    category: 'human-flight',
    categoryLabel: 'Human Spaceflight',
    year: '2023',
    tag: 'Spacecraft Engineering',
    description: 'Full-scale unpressurized structure assembly of the Gaganyaan crew cabin utilized for aerodynamic testing and parachute deceleration trials.',
    source: 'https://commons.wikimedia.org/wiki/File:Simulated_Crew_Module_(SCM)_Structure_Assembly_for_the_Gaganyaan_project.jpg',
    remoteUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Simulated_Crew_Module_%28SCM%29_Structure_Assembly_for_the_Gaganyaan_project.jpg',
    localFile: 'gaganyaan-scm.jpg'
  },

  // 2. DEEP SPACE & LUNAR (MANGALYAAN & CHANDRAYAAN)
  {
    id: 'mangalyaan-mars',
    title: 'Mangalyaan: India Orbiting Mars',
    category: 'deep-space',
    categoryLabel: 'Deep Space',
    year: '2014',
    tag: 'Mars Exploration',
    description: 'India became the 1st nation in the world to reach Mars on its maiden attempt. The Mars Colour Camera captured historic global portraits of the Red Planet.',
    source: 'https://en.wikipedia.org/wiki/Mars_Orbiter_Mission',
    remoteUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Mars_Orbiter_Mission_Over_Mars_%2815237158879%29.jpg',
    localFile: 'mangalyaan-mars.jpg'
  },
  {
    id: 'mangalyaan-spacecraft',
    title: 'Mars Orbiter Spacecraft in Cleanroom',
    category: 'deep-space',
    categoryLabel: 'Deep Space',
    year: '2013',
    tag: 'Interplanetary Craft',
    description: 'Gold-foil thermal blanketed Mangalyaan orbiter carrying 5 scientific instruments before its historic launch on PSLV-C25.',
    source: 'https://commons.wikimedia.org/wiki/File:Mars_Orbiter_Mission_-_India_-_ArtistsConcept.jpg',
    remoteUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Mars_Orbiter_Mission_-_India_-_ArtistsConcept.jpg',
    localFile: 'mangalyaan-spacecraft.jpg'
  },
  {
    id: 'chandrayaan3-lander-moon',
    title: 'Vikram Lander on Moon’s South Pole',
    category: 'deep-space',
    categoryLabel: 'Deep Space',
    year: '2023',
    tag: 'Historic Touchdown',
    description: 'Authentic photograph of Vikram lander resting firmly at Shiv Shakti Point on the Moon, photographed 15 meters away by Pragyan rover’s Navcam.',
    source: 'https://www.isro.gov.in/Chandrayaan3_Details.html',
    remoteUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Chandrayaan-3_%E2%80%93_Image_of_Vikram_lander_on_lunar_surface_taken_by_Pragyan_rover_navcam_at_1104_IST%2C_30_August_2023_from_15_meters_away_%28with_text%29.webp',
    localFile: 'chandrayaan3-lander-moon.webp'
  },
  {
    id: 'chandrayaan3-pragyan-rover',
    title: 'Pragyan Lunar Rover Roll-Out',
    category: 'deep-space',
    categoryLabel: 'Deep Space',
    year: '2023',
    tag: 'Lunar Surface Exploration',
    description: 'The 6-wheeled Pragyan rover deployed its solar panel to explore elemental lunar soil, confirming sulfur, aluminum, and oxygen near the Moon’s South Pole.',
    source: 'https://commons.wikimedia.org/wiki/File:Pragyan_rover_deployed_on_the_moon.webp',
    remoteUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Pragyan_rover_deployed_on_the_moon.webp',
    localFile: 'chandrayaan3-pragyan-rover.webp'
  },
  {
    id: 'chandrayaan2-vikram-orbiter',
    title: 'Chandrayaan-2 Vikram & Orbiter Stacking',
    category: 'deep-space',
    categoryLabel: 'Deep Space',
    year: '2019',
    tag: 'Lunar Stacking Operations',
    description: 'Vikram lander mounted directly atop the Chandrayaan-2 lunar orbiter, which remains in active polar orbit returning ultra-high-resolution imagery.',
    source: 'https://commons.wikimedia.org/wiki/File:GSLV_Mk_III_M1,_Chandrayaan-2_-_Vikram_lander_mounted_on_top_of_orbiter.jpg',
    remoteUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/GSLV_Mk_III_M1%2C_Chandrayaan-2_-_Vikram_lander_mounted_on_top_of_orbiter.jpg',
    localFile: 'chandrayaan2-stacking.jpg'
  },
  {
    id: 'chandrayaan1-spacecraft',
    title: 'Chandrayaan-1: Discovery of Water on Moon',
    category: 'deep-space',
    categoryLabel: 'Deep Space',
    year: '2008',
    tag: 'Lunar Pioneer',
    description: 'India’s maiden Moon orbiter carrying the Moon Mineralogy Mapper and Moon Impact Probe, which made the historic global discovery of lunar hydroxyl and water molecules.',
    source: 'https://en.wikipedia.org/wiki/Chandrayaan-1',
    remoteUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/CY1_2007_%28cropped%29.jpg',
    localFile: 'chandrayaan1-spacecraft.jpg'
  },
  {
    id: 'aditya-l1-solar',
    title: 'Aditya-L1: India’s Solar Observatory',
    category: 'deep-space',
    categoryLabel: 'Deep Space',
    year: '2023',
    tag: 'Sun-Earth L1 Halo Orbit',
    description: 'Positioned 1.5 million km from Earth at the Sun-Earth L1 Lagrangian point, Aditya-L1 continuously observes the solar corona, solar wind, and coronal mass ejections.',
    source: 'https://en.wikipedia.org/wiki/Aditya-L1',
    remoteUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Aditya_L1.png',
    localFile: 'aditya-l1-solar.png'
  },

  // 3. ROCKETS & LAUNCH VEHICLES
  {
    id: 'lvm3-bahubali-liftoff',
    title: 'LVM3 "Bahubali" Heavy Liftoff',
    category: 'launchers',
    categoryLabel: 'Rockets & Launchers',
    year: '2023',
    tag: 'Heavy-Lift Launcher',
    description: 'Twin S200 solid rocket boosters ignite with 4,000 kg capacity to GTO. The backbone launcher of Chandrayaan-3 and India’s Gaganyaan human spaceflight.',
    source: 'https://en.wikipedia.org/wiki/LVM3',
    remoteUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/LVM3_M6_with_BlueBird-6_during_Liftoff_%283%29.webp',
    localFile: 'lvm3-bahubali-liftoff.webp'
  },
  {
    id: 'pslv-c62-workhorse',
    title: 'PSLV: The Legendary Workhorse',
    category: 'launchers',
    categoryLabel: 'Rockets & Launchers',
    year: '2024',
    tag: 'Polar Satellite Launch Vehicle',
    description: 'With over 60 launches, PSLV has placed more than 350 foreign and domestic satellites in orbit, celebrated for exceptional precision and multi-orbit deployment.',
    source: 'https://en.wikipedia.org/wiki/Polar_Satellite_Launch_Vehicle',
    remoteUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/16/PSLVC62.webp',
    localFile: 'pslv-c62-workhorse.webp'
  },
  {
    id: 'sslv-d1-liftoff',
    title: 'SSLV: Rapid-Response Small Rocket',
    category: 'launchers',
    categoryLabel: 'Rockets & Launchers',
    year: '2022',
    tag: 'Small Satellite Launch Vehicle',
    description: 'Engineered for low-cost, on-demand commercial launch capability to Low Earth Orbit with turnaround integration time of under 72 hours.',
    source: 'https://en.wikipedia.org/wiki/Small_Satellite_Launch_Vehicle',
    remoteUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/60/Mrm7669_Launch_of_SSLV-D1_from_Satish_Dhawan_FLP.jpg',
    localFile: 'sslv-d1-liftoff.jpg'
  },
  {
    id: 'rlv-td-spaceplane',
    title: 'RLV-TD: India’s Winged Spaceplane',
    category: 'launchers',
    categoryLabel: 'Rockets & Launchers',
    year: '2016',
    tag: 'Reusable Launch Vehicle',
    description: 'ISRO’s winged autonomous space shuttle technology demonstrator, paving the way for two-stage-to-orbit fully reusable launch vehicles.',
    source: 'https://en.wikipedia.org/wiki/RLV_Technology_Demonstration_Programme',
    remoteUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/RLV-TD_HEX01%2C_TDV_being_hoisted.jpg',
    localFile: 'rlv-td-spaceplane.jpg'
  },

  // 4. HISTORIC ORIGINS & PIONEERS
  {
    id: 'aryabhata-1975',
    title: 'Aryabhata: India’s 1st Satellite (1975)',
    category: 'isro-historic',
    categoryLabel: 'Historic Origins',
    year: '1975',
    tag: 'First Spacecraft',
    description: 'Named after the legendary 5th-century Indian astronomer, Aryabhata marked India’s entry into the space age, designed and built entirely by ISRO scientists in Bengaluru.',
    source: 'https://en.wikipedia.org/wiki/Aryabhata_(satellite)',
    remoteUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Aryabhata_Satellite.jpg',
    localFile: 'aryabhata-1975.jpg'
  },
  {
    id: 'thumba-sounding-rocket',
    title: 'Thumba: Birthplace of Indian Space (1963)',
    category: 'isro-historic',
    categoryLabel: 'Historic Origins',
    year: '1963',
    tag: 'Thumba Equatorial Rocket Station',
    description: 'Dr. Vikram Sarabhai and APJ Abdul Kalam launched the first Nike-Apache sounding rocket amidst fishing hamlets in Kerala, working out of St. Mary Magdalene church.',
    source: 'https://commons.wikimedia.org/wiki/File:TERLS-01.jpg',
    remoteUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/28/TERLS-01.jpg',
    localFile: 'thumba-sounding-rocket.jpg'
  },
  {
    id: 'astrosat-observatory',
    title: 'Astrosat: India’s Space Telescope',
    category: 'isro-historic',
    categoryLabel: 'Historic Origins',
    year: '2015',
    tag: 'Space Astronomy',
    description: 'India’s premier multi-wavelength space observatory studying black holes, neutron star binaries, and distant star-forming galaxies in X-ray and UV spectrums.',
    source: 'https://en.wikipedia.org/wiki/Astrosat',
    remoteUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Fueling_of_Astrosat-1_in_satellite_preparation_facility_at_SDSC_SHAR.jpg',
    localFile: 'astrosat-observatory.jpg'
  },
  {
    id: 'nisar-spacecraft',
    title: 'NISAR: NASA-ISRO Earth Radar',
    category: 'deep-space',
    categoryLabel: 'Deep Space',
    year: '2024',
    tag: 'Global Earth Observation',
    description: 'World’s most advanced dual-frequency synthetic aperture radar satellite jointly developed by NASA and ISRO to track planetary ecosystems and glacial movement.',
    source: 'https://en.wikipedia.org/wiki/NISAR_(satellite)',
    remoteUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Artist%27s_concept_of_NISAR_over_Earth.jpg',
    localFile: 'nisar-spacecraft.jpg'
  },

  // 5. PRIVATE SPACE TECH STARTUPS
  {
    id: 'skyroot-vikrams-launch',
    title: 'Skyroot Vikram-S: 1st Private Rocket Liftoff',
    category: 'space-startups',
    categoryLabel: 'Private Space Startups',
    year: '2022',
    tag: 'Mission Prarambh',
    description: 'Hyderabad-based Skyroot Aerospace became the 1st Indian private startup to build and launch a rocket into space from Sriharikota with Vikram-S.',
    source: 'https://en.wikipedia.org/wiki/Skyroot_Aerospace',
    remoteUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Vikram-S_rocket%27s_Mission_Prarambh_02.webp',
    localFile: 'skyroot-vikrams-launch.webp'
  },
  {
    id: 'skyroot-pad-integration',
    title: 'Vikram-S Pad Integration & Checkout',
    category: 'space-startups',
    categoryLabel: 'Private Space Startups',
    year: '2022',
    tag: 'Private Launch System',
    description: 'Skyroot engineers conducting final checkout of the composite-cased Kalam-80 solid propulsion rocket prior to ignition.',
    source: 'https://commons.wikimedia.org/wiki/File:Vikram-S_rocket%27s_Mission_Prarambh_04.webp',
    remoteUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Vikram-S_rocket%27s_Mission_Prarambh_04.webp',
    localFile: 'skyroot-pad-integration.webp'
  },
  {
    id: 'agnikul-agnibaan',
    title: 'Agnikul Cosmos: Agnibaan Rocket',
    category: 'space-startups',
    categoryLabel: 'Private Space Startups',
    year: '2024',
    tag: '3D-Printed Semi-Cryo Engine',
    description: 'IIT Madras incubated Agnikul launched Agnibaan SOrTeD powered by the world’s 1st single-piece 3D-printed semi-cryogenic Agnilet engine from their private launchpad.',
    source: 'https://en.wikipedia.org/wiki/Agnikul_Cosmos',
    remoteUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Agnibaan_Republic_Day_Parade_2025.jpg',
    localFile: 'agnikul-agnibaan.jpg'
  },
  {
    id: 'pixxel-satellite-facility',
    title: 'Pixxel Space: Hyperspectral Satellite Lab',
    category: 'space-startups',
    categoryLabel: 'Private Space Startups',
    year: '2023',
    tag: 'Hyperspectral Constellation',
    description: 'Bengaluru-based Pixxel assembling high-resolution hyperspectral satellites (Shakuntala & Anand) mapping mineral deposits, agriculture, and greenhouse gas emissions.',
    source: 'https://en.wikipedia.org/wiki/Pixxel',
    remoteUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7f/Pixxel_facility.jpg',
    localFile: 'pixxel-satellite-facility.jpg'
  },
  {
    id: 'bellatrix-met-thruster',
    title: 'Bellatrix Aerospace: Electric Propulsion',
    category: 'space-startups',
    categoryLabel: 'Private Space Startups',
    year: '2022',
    tag: 'Satellite Thruster Tech',
    description: 'Bellatrix Microwave Electrothermal Thruster (MET) and green monopropellant thrusters tested on ISRO’s PSLV orbital experimental platform (POEM).',
    source: 'https://commons.wikimedia.org/wiki/File:Microwave_Electrothermal_Thruster_(MET)_of_Bellatrix_Aerospace_613149-5fbcf416533fbdcab924846c42f1b1267f3dc9a7.jpg',
    remoteUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Microwave_Electrothermal_Thruster_%28MET%29_of_Bellatrix_Aerospace_613149-5fbcf416533fbdcab924846c42f1b1267f3dc9a7.jpg',
    localFile: 'bellatrix-met-thruster.jpg'
  },
  {
    id: 'digantara-space-surveillance',
    title: 'Digantara: Space Situational Awareness',
    category: 'space-startups',
    categoryLabel: 'Private Space Startups',
    year: '2024',
    tag: 'Orbital Debris Tracking',
    description: 'IISc incubated Digantara developing India’s commercial space debris monitoring and Space-MAP orbital intelligence platform.',
    source: 'https://en.wikipedia.org/wiki/Digantara',
    remoteUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/9th_Bengaluru_Space_Expo_2026%2C_Bangalore_International_Exhibition_Centre_27.jpg',
    localFile: 'digantara-space-surveillance.jpg'
  }
];

async function downloadFile(url, destPath) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'IsroPR/1.0 (https://isropr.in; spacebharat@isropr.in)'
      }
    });
    if (!res.ok) {
      console.warn(`Failed ${url}: HTTP ${res.status}`);
      return false;
    }
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.length < 500) {
      console.warn(`File too small (${buffer.length} bytes): ${url}`);
      return false;
    }
    fs.writeFileSync(destPath, buffer);
    console.log(`Saved: ${path.basename(destPath)} (${Math.round(buffer.length / 1024)} KB)`);
    return true;
  } catch (err) {
    console.warn(`Error downloading ${url}:`, err.message);
    return false;
  }
}

async function main() {
  console.log(`Starting download of ${GALLERY_ITEMS.length} historic & startup images...`);
  let successCount = 0;

  for (const item of GALLERY_ITEMS) {
    const dest = path.join(galleryDir, item.localFile);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      console.log(`Already exists: ${item.localFile}`);
      item.localAvailable = true;
      successCount++;
      continue;
    }

    const ok = await downloadFile(item.remoteUrl, dest);
    if (ok) {
      item.localAvailable = true;
      successCount++;
    } else {
      item.localAvailable = false;
    }
  }

  console.log(`Downloaded ${successCount} of ${GALLERY_ITEMS.length} images to ${galleryDir}`);

  // Write client-side JS file
  const clientDataFile = path.join(projectRoot, 'web', 'js', 'gallery-data.js');
  const fileContent = `// Curated Historical and Startup Gallery Dataset (25 items)
export const SPACE_GALLERY = ${JSON.stringify(GALLERY_ITEMS, null, 2)};
`;
  fs.writeFileSync(clientDataFile, fileContent, 'utf-8');
  console.log(`Generated client gallery dataset at ${clientDataFile}`);
}

main().catch(console.error);
