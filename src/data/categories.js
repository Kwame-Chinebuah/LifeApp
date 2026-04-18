export const CATEGORIES = [
  { id: 'favourites',   label: 'Favourites',         icon: '⭐', special: true },
  { id: 'essentials',   label: 'Everyday Essentials', icon: '⚡' },
  { id: 'health',       label: 'Health & Body',       icon: '🏥' },
  { id: 'practical',    label: 'Practical Tools',     icon: '🔧' },
  { id: 'travel',       label: 'Travel',              icon: '✈️' },
  { id: 'encyclopedia', label: 'Encyclopedia',        icon: '📚' },
  { id: 'fun',          label: 'Fun & Games',         icon: '🎮' },
];

export const TOOLS = {
  essentials: [
    { id: 'Calculator',    icon: '🧮', label: 'Calculator',      desc: 'Standard & brackets'  },
    { id: 'UnitConverter', icon: '📐', label: 'Unit Converter',  desc: 'Length, weight, temp'  },
    { id: 'DiscountCalc',  icon: '🏷️', label: 'Discount',        desc: 'Sale price saver'      },
    { id: 'AgeCalculator', icon: '🎂', label: 'Age Calc',        desc: 'Days, months, years'   },
    { id: 'Stopwatch',     icon: '⏱️', label: 'Stopwatch',       desc: 'Timer & laps'          },
    { id: 'TipCalculator', icon: '🍽️', label: 'Tip & Split',     desc: 'Split any bill'        },
    { id: 'RandomPicker',  icon: '🎰', label: 'Random Picker',   desc: 'Pick random numbers'   },
    { id: 'Checklist',     icon: '✅', label: 'Daily Checklist', desc: 'Daily tasks tracker'   },
  ],
  health: [
    { id: 'BMI',         icon: '⚖️', label: 'BMI Calculator', desc: 'Body mass index'   },
    { id: 'WaterIntake', icon: '💧', label: 'Water Tracker',  desc: 'Daily hydration'  },
  ],
  practical: [
    { id: 'QRGenerator',     icon: '📱', label: 'QR Generator',     desc: 'Create QR codes'   },
    { id: 'PasswordManager', icon: '🔐', label: 'Password Manager', desc: 'Store & generate'  },
    { id: 'Ruler',           icon: '📏', label: 'Ruler',            desc: 'On-screen ruler'   },
  ],
  travel: [
    { id: 'TimeZones', icon: '🌍', label: 'Time Zones',  desc: 'World clock'         },
    { id: 'FuelCost',  icon: '⛽', label: 'Fuel Cost',   desc: 'Trip cost estimator' },
  ],
  encyclopedia: [
    { id: 'Globe', icon: '🌐', label: 'Globe & Countries', desc: 'Countries, capitals, flags' },
  ],
  fun: [
    { id: 'DiceRoller', icon: '🎲', label: 'Dice Roller', desc: 'Roll any dice'    },
    { id: 'CoinFlip',   icon: '🪙', label: 'Coin Flip',   desc: 'Heads or tails'   },
  ],
};

export const ALL_TOOLS = Object.values(TOOLS).flat();
