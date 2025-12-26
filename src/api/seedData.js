const createIsoDate = (daysFromNow, hour = 18, minute = 0) => {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString();
};

export const createSeedData = () => ({
  fitnessProfessionals: [
    {
      id: 'pro_emma_johnson',
      full_name: 'Emma Johnson',
      specialties: ['personal_training', 'strength_training', 'nutrition'],
      hourly_rate: 85,
      rating: 4.9,
      reviews_count: 128,
      experience_years: 8,
      profile_image: 'https://images.unsplash.com/photo-1517832207067-4db24a2ae47c?auto=format&fit=crop&w=800&q=80',
      bio: 'Certified strength and conditioning specialist helping busy professionals build sustainable routines through evidence-based training and balanced nutrition.',
      certifications: [
        'NASM Certified Personal Trainer',
        'Precision Nutrition Level 1 Coach',
        'CrossFit Level 1 Trainer'
      ],
      phone: '512-555-0198',
      email: 'emma.johnson@example.com',
      website: 'https://coach-emmafit.com',
      availability: ['monday', 'tuesday', 'wednesday', 'thursday', 'saturday'],
      location: {
        address: '123 Congress Ave',
        city: 'Austin',
        state: 'TX',
        zip_code: '78701',
        latitude: 30.2672,
        longitude: -97.7431
      }
    },
    {
      id: 'pro_carlos_martinez',
      full_name: 'Carlos Martinez',
      specialties: ['soccer', 'cardio', 'group_fitness'],
      hourly_rate: 65,
      rating: 4.7,
      reviews_count: 94,
      experience_years: 6,
      profile_image: 'https://images.unsplash.com/photo-1546484959-fcc74af8c3f0?auto=format&fit=crop&w=800&q=80',
      bio: 'Former semi-professional soccer player offering high-energy conditioning sessions and tactical skills development for all ages.',
      certifications: [
        'USSF C Coaching License',
        'ISSA Strength & Conditioning Specialist'
      ],
      phone: '214-555-0134',
      email: 'coach.carlos@example.com',
      website: 'https://martinez-soccer.com',
      availability: ['tuesday', 'wednesday', 'thursday', 'friday', 'sunday'],
      location: {
        address: '456 Bishop Ave',
        city: 'Dallas',
        state: 'TX',
        zip_code: '75204',
        latitude: 32.7767,
        longitude: -96.797,
      }
    },
    {
      id: 'pro_sophia_patel',
      full_name: 'Sophia Patel',
      specialties: ['yoga', 'pilates', 'rehabilitation'],
      hourly_rate: 95,
      rating: 4.95,
      reviews_count: 162,
      experience_years: 10,
      profile_image: 'https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?auto=format&fit=crop&w=800&q=80',
      bio: 'Mindful movement specialist blending yoga therapy, reformer pilates, and corrective exercise to restore balance and mobility.',
      certifications: [
        'Yoga Alliance E-RYT 500',
        'Balanced Body Pilates Instructor',
        'Corrective Exercise Specialist'
      ],
      phone: '713-555-0142',
      email: 'sophia.patel@example.com',
      website: 'https://alignedwellness.co',
      availability: ['monday', 'wednesday', 'friday', 'saturday'],
      location: {
        address: '789 Heights Blvd',
        city: 'Houston',
        state: 'TX',
        zip_code: '77007',
        latitude: 29.7604,
        longitude: -95.3698
      }
    },
    {
      id: 'pro_jordan_williams',
      full_name: 'Jordan Williams',
      specialties: ['crossfit', 'weight_loss', 'strength_training'],
      hourly_rate: 75,
      rating: 4.8,
      reviews_count: 87,
      experience_years: 7,
      profile_image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80',
      bio: 'Functional fitness coach delivering varied, challenging CrossFit-inspired programming focused on longevity and injury prevention.',
      certifications: ['CrossFit Level 2 Trainer', 'USA Weightlifting Level 1 Coach'],
      phone: '512-555-0187',
      email: 'jordan@forgefitness.io',
      website: 'https://forgefitness.io',
      availability: ['monday', 'tuesday', 'thursday', 'friday'],
      location: {
        address: '2200 E 7th St',
        city: 'Austin',
        state: 'TX',
        zip_code: '78702',
        latitude: 30.2587,
        longitude: -97.7236
      }
    },
    {
      id: 'pro_ava_chen',
      full_name: 'Ava Chen',
      specialties: ['martial_arts', 'strength_training', 'cardio'],
      hourly_rate: 70,
      rating: 4.6,
      reviews_count: 58,
      experience_years: 5,
      profile_image: 'https://images.unsplash.com/photo-1541535650810-10d26f5c2ab3?auto=format&fit=crop&w=800&q=80',
      bio: 'Black belt instructor blending Muay Thai striking, functional conditioning, and mindset coaching for competitive and recreational athletes.',
      certifications: ['ACE Personal Trainer', 'Muay Thai Kru Certification'],
      phone: '817-555-0112',
      email: 'ava.chen@example.com',
      website: 'https://flowcombattraining.com',
      availability: ['tuesday', 'wednesday', 'thursday', 'saturday'],
      location: {
        address: '640 W Magnolia Ave',
        city: 'Fort Worth',
        state: 'TX',
        zip_code: '76104',
        latitude: 32.7486,
        longitude: -97.3295
      }
    },
    {
      id: 'pro_marcus_reed',
      full_name: 'Marcus Reed',
      specialties: ['nutrition', 'weight_loss', 'group_fitness'],
      hourly_rate: 60,
      rating: 4.5,
      reviews_count: 73,
      experience_years: 9,
      profile_image: 'https://images.unsplash.com/photo-1594737625785-c66858a24b47?auto=format&fit=crop&w=800&q=80',
      bio: 'Certified nutrition coach and bootcamp instructor providing structured accountability programs that blend meal planning and metabolic conditioning.',
      certifications: ['NASM Nutrition Coach', 'Certified Functional Strength Coach'],
      phone: '210-555-0177',
      email: 'marcus.reed@example.com',
      website: 'https://reedperformance.co',
      availability: ['monday', 'wednesday', 'thursday', 'saturday'],
      location: {
        address: '1500 S Alamo St',
        city: 'San Antonio',
        state: 'TX',
        zip_code: '78204',
        latitude: 29.4099,
        longitude: -98.4951
      }
    }
  ],
  pickupGames: [
    {
      id: 'game_basketball_friday',
      title: 'Friday Night Basketball Run',
      sport: 'basketball',
      date_time: createIsoDate(2, 19, 30),
      duration_minutes: 90,
      max_players: 12,
      current_players: 9,
      cost_per_person: 8,
      skill_level: 'intermediate',
      description: 'High-tempo full court run focused on teamwork and ball movement. All positions welcome.',
      equipment_provided: ['Indoor basketballs', 'Scoreboard access'],
      equipment_needed: ['Indoor shoes', 'Water bottle'],
      organizer_name: 'Austin Hoops Club',
      organizer_contact: 'events@austinhoops.club',
      location: {
        venue_name: 'Downtown Recreation Center',
        address: '800 W 11th St',
        city: 'Austin',
        state: 'TX',
        zip_code: '78701',
        latitude: 30.2747,
        longitude: -97.7426
      }
    },
    {
      id: 'game_pickup_soccer',
      title: 'Zilker Park 7v7 Soccer',
      sport: 'soccer',
      date_time: createIsoDate(4, 18, 0),
      duration_minutes: 75,
      max_players: 14,
      current_players: 10,
      cost_per_person: 0,
      skill_level: 'all_levels',
      description: 'Casual co-ed match with rotating teams and small-sided drills before kickoff.',
      equipment_provided: ['Pop-up goals', 'Training cones'],
      equipment_needed: ['Cleats', 'Shin guards'],
      organizer_name: 'ATX Footy',
      organizer_contact: '512-555-4455',
      location: {
        venue_name: 'Zilker Metropolitan Park',
        address: '2100 Barton Springs Rd',
        city: 'Austin',
        state: 'TX',
        zip_code: '78746',
        latitude: 30.2662,
        longitude: -97.7729
      }
    },
    {
      id: 'game_tennis_morning',
      title: 'Saturday Morning Doubles',
      sport: 'tennis',
      date_time: createIsoDate(3, 9, 0),
      duration_minutes: 120,
      max_players: 8,
      current_players: 6,
      cost_per_person: 12,
      skill_level: 'advanced',
      description: 'USTA 4.0-4.5 level doubles ladder with rotating partners and match play.',
      equipment_provided: ['New balls each round'],
      equipment_needed: ['Tennis racquet', 'Non-marking shoes'],
      organizer_name: 'Capital City Tennis League',
      organizer_contact: 'league@cctennis.org',
      location: {
        venue_name: 'Capital City Tennis Center',
        address: '2901 Manor Rd',
        city: 'Austin',
        state: 'TX',
        zip_code: '78722',
        latitude: 30.283,
        longitude: -97.7117
      }
    },
    {
      id: 'game_volleyball_sunset',
      title: 'Sunset Sand Volleyball',
      sport: 'volleyball',
      date_time: createIsoDate(5, 20, 0),
      duration_minutes: 120,
      max_players: 16,
      current_players: 14,
      cost_per_person: 6,
      skill_level: 'all_levels',
      description: 'Drop-in beach volleyball with playlists, lights, and rotating courts for all skill levels.',
      equipment_provided: ['Outdoor nets', 'Score flip cards'],
      equipment_needed: ['Sand socks (optional)', 'Water'],
      organizer_name: 'South Austin Sand Crew',
      organizer_contact: 'hello@sandsquad.com',
      location: {
        venue_name: 'Moontower Beach Courts',
        address: '500 E Riverside Dr',
        city: 'Austin',
        state: 'TX',
        zip_code: '78704',
        latitude: 30.2553,
        longitude: -97.7444
      }
    },
    {
      id: 'game_pickup_pickleball',
      title: 'Community Pickleball Mixer',
      sport: 'pickleball',
      date_time: createIsoDate(6, 17, 30),
      duration_minutes: 90,
      max_players: 20,
      current_players: 16,
      cost_per_person: 5,
      skill_level: 'beginner',
      description: 'Beginner-friendly round robin with on-site coaching to help you level up quickly.',
      equipment_provided: ['Loaner paddles', 'Outdoor balls'],
      equipment_needed: ['Comfortable court shoes'],
      organizer_name: 'Austin Pickleball Collective',
      organizer_contact: 'events@apc.club',
      location: {
        venue_name: 'South Lamar Courts',
        address: '3000 S Lamar Blvd',
        city: 'Austin',
        state: 'TX',
        zip_code: '78704',
        latitude: 30.2495,
        longitude: -97.7684
      }
    },
    {
      id: 'game_flag_football',
      title: 'Sunday Flag Football League',
      sport: 'football',
      date_time: createIsoDate(7, 15, 0),
      duration_minutes: 120,
      max_players: 18,
      current_players: 12,
      cost_per_person: 10,
      skill_level: 'intermediate',
      description: 'Seven-on-seven co-ed flag football league with referees, stats, and weekly highlights.',
      equipment_provided: ['Flag belts', 'Referees'],
      equipment_needed: ['Cleats', 'Gloves (optional)'],
      organizer_name: 'ATX Flag League',
      organizer_contact: 'info@atxflagleague.com',
      location: {
        venue_name: 'Onion Creek Sports Complex',
        address: '5600 E William Cannon Dr',
        city: 'Austin',
        state: 'TX',
        zip_code: '78744',
        latitude: 30.1763,
        longitude: -97.7399
      }
    }
  ],
  courts: [
    {
      id: 'court_downtown_rec',
      name: 'Downtown Rec Center Gym',
      venue_name: 'Downtown Recreation Center',
      rating: 4.8,
      hourly_rate: 45,
      indoor: true,
      court_surface: 'hardwood',
      amenities: ['Locker rooms', 'Scoreboards', 'Water refill station'],
      sports_supported: ['basketball', 'volleyball', 'pickleball'],
      contact_info: {
        phone: '512-555-2200',
        website: 'https://austintexas.gov/department/downtown-rec-center'
      },
      location: {
        address: '800 W 11th St',
        city: 'Austin',
        state: 'TX',
        zip_code: '78701',
        latitude: 30.2747,
        longitude: -97.7426
      }
    },
    {
      id: 'court_capital_city_tennis',
      name: 'Capital City Tennis Center',
      venue_name: 'Capital City Tennis Center',
      rating: 4.6,
      hourly_rate: 28,
      indoor: false,
      court_surface: 'hard',
      amenities: ['Pro shop', 'Ball machine rental', 'Night lighting'],
      sports_supported: ['tennis', 'pickleball'],
      contact_info: {
        phone: '512-555-3311',
        website: 'https://capitalcitytennis.com'
      },
      location: {
        address: '2901 Manor Rd',
        city: 'Austin',
        state: 'TX',
        zip_code: '78722',
        latitude: 30.283,
        longitude: -97.7117
      }
    },
    {
      id: 'court_moontower_beach',
      name: 'Moontower Beach Courts',
      venue_name: 'Moontower Beach Sports',
      rating: 4.7,
      hourly_rate: 32,
      indoor: false,
      court_surface: 'sand',
      amenities: ['Cafe & bar', 'Locker rentals', 'Lighting for night play'],
      sports_supported: ['volleyball', 'multi_sport'],
      contact_info: {
        phone: '512-555-8899',
        website: 'https://moontowerbeach.com'
      },
      location: {
        address: '500 E Riverside Dr',
        city: 'Austin',
        state: 'TX',
        zip_code: '78704',
        latitude: 30.2553,
        longitude: -97.7444
      }
    },
    {
      id: 'court_zilker_fields',
      name: 'Zilker Soccer Fields',
      venue_name: 'Zilker Metropolitan Park',
      rating: 4.5,
      hourly_rate: 20,
      indoor: false,
      court_surface: 'grass',
      amenities: ['Restrooms', 'Free parking', 'Water fountains'],
      sports_supported: ['soccer', 'football', 'multi_sport'],
      contact_info: {
        phone: '512-555-7766',
        website: 'https://austintexas.gov/parks'
      },
      location: {
        address: '2100 Barton Springs Rd',
        city: 'Austin',
        state: 'TX',
        zip_code: '78746',
        latitude: 30.2662,
        longitude: -97.7729
      }
    },
    {
      id: 'court_south_lamar',
      name: 'South Lamar Courts',
      venue_name: 'South Lamar Community Courts',
      rating: 4.4,
      hourly_rate: 18,
      indoor: false,
      court_surface: 'hard',
      amenities: ['Shaded seating', 'Lighting', 'Equipment rental'],
      sports_supported: ['pickleball', 'tennis', 'basketball'],
      contact_info: {
        phone: '512-555-6622',
        website: 'https://southlamarcourts.org'
      },
      location: {
        address: '3000 S Lamar Blvd',
        city: 'Austin',
        state: 'TX',
        zip_code: '78704',
        latitude: 30.2495,
        longitude: -97.7684
      }
    }
  ],
  players: [
    {
      id: 'player_maya_lee',
      player_name: 'Maya Lee',
      avatar_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80',
      location: { city: 'Austin', state: 'TX' },
      overall_rating: 9.1,
      total_games: 112,
      sports: ['basketball', 'tennis', 'pickleball'],
      stats_by_sport: {
        basketball: { skill_rating: 9.4, games_played: 64, games_won: 42, win_streak: 5 },
        tennis: { skill_rating: 8.7, games_played: 28, games_won: 18, win_streak: 3 },
        pickleball: { skill_rating: 8.9, games_played: 20, games_won: 15, win_streak: 4 }
      }
    },
    {
      id: 'player_ryan_cooper',
      player_name: 'Ryan Cooper',
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      location: { city: 'Round Rock', state: 'TX' },
      overall_rating: 8.6,
      total_games: 89,
      sports: ['football', 'basketball'],
      stats_by_sport: {
        football: { skill_rating: 8.9, games_played: 48, games_won: 30, win_streak: 2 },
        basketball: { skill_rating: 8.1, games_played: 41, games_won: 24, win_streak: 1 }
      }
    },
    {
      id: 'player_sofia_garcia',
      player_name: 'Sofia Garcia',
      avatar_url: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=400&q=80',
      location: { city: 'San Marcos', state: 'TX' },
      overall_rating: 8.8,
      total_games: 76,
      sports: ['volleyball', 'soccer'],
      stats_by_sport: {
        volleyball: { skill_rating: 9.0, games_played: 44, games_won: 30, win_streak: 4 },
        soccer: { skill_rating: 8.4, games_played: 32, games_won: 19, win_streak: 2 }
      }
    },
    {
      id: 'player_jamal_adams',
      player_name: 'Jamal Adams',
      avatar_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
      location: { city: 'Cedar Park', state: 'TX' },
      overall_rating: 8.2,
      total_games: 68,
      sports: ['basketball', 'pickleball'],
      stats_by_sport: {
        basketball: { skill_rating: 8.4, games_played: 42, games_won: 25, win_streak: 1 },
        pickleball: { skill_rating: 8.0, games_played: 26, games_won: 16, win_streak: 2 }
      }
    },
    {
      id: 'player_elena_ross',
      player_name: 'Elena Ross',
      avatar_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
      location: { city: 'Austin', state: 'TX' },
      overall_rating: 8.4,
      total_games: 95,
      sports: ['tennis', 'pickleball', 'badminton'],
      stats_by_sport: {
        tennis: { skill_rating: 8.6, games_played: 40, games_won: 26, win_streak: 3 },
        pickleball: { skill_rating: 8.3, games_played: 38, games_won: 24, win_streak: 2 },
        badminton: { skill_rating: 8.2, games_played: 17, games_won: 11, win_streak: 1 }
      }
    }
  ],
  gameParticipations: []
});
