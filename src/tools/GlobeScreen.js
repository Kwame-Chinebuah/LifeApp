import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList, TextInput, Modal, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '../data/theme';
import { useTheme } from '../data/ThemeContext';
import AdBanner from '../components/AdBanner';

const CONTINENTS = [
  { id: 'all',      label: 'All'       },
  { id: 'africa',   label: 'Africa'    },
  { id: 'asia',     label: 'Asia'      },
  { id: 'europe',   label: 'Europe'    },
  { id: 'namerica', label: 'N.America' },
  { id: 'samerica', label: 'S.America' },
  { id: 'oceania',  label: 'Oceania'   },
];

const COUNTRIES = [
  // Africa (54 countries)
  { name: 'Algeria',                  capital: 'Algiers',          flag: '🇩🇿', continent: 'africa',   pop: '44M',   currency: 'Dinar (DZD)',        lang: 'Arabic'          },
  { name: 'Angola',                   capital: 'Luanda',           flag: '🇦🇴', continent: 'africa',   pop: '34M',   currency: 'Kwanza (AOA)',       lang: 'Portuguese'      },
  { name: 'Benin',                    capital: 'Porto-Novo',       flag: '🇧🇯', continent: 'africa',   pop: '13M',   currency: 'CFA Franc (XOF)',    lang: 'French'          },
  { name: 'Botswana',                 capital: 'Gaborone',         flag: '🇧🇼', continent: 'africa',   pop: '2.6M',  currency: 'Pula (BWP)',         lang: 'English'         },
  { name: 'Burkina Faso',             capital: 'Ouagadougou',      flag: '🇧🇫', continent: 'africa',   pop: '22M',   currency: 'CFA Franc (XOF)',    lang: 'French'          },
  { name: 'Burundi',                  capital: 'Gitega',           flag: '🇧🇮', continent: 'africa',   pop: '12M',   currency: 'Franc (BIF)',        lang: 'Kirundi'         },
  { name: 'Cabo Verde',               capital: 'Praia',            flag: '🇨🇻', continent: 'africa',   pop: '560K',  currency: 'Escudo (CVE)',       lang: 'Portuguese'      },
  { name: 'Cameroon',                 capital: 'Yaoundé',          flag: '🇨🇲', continent: 'africa',   pop: '27M',   currency: 'CFA Franc (XAF)',    lang: 'French, English' },
  { name: 'Central African Republic', capital: 'Bangui',           flag: '🇨🇫', continent: 'africa',   pop: '5M',    currency: 'CFA Franc (XAF)',    lang: 'French'          },
  { name: 'Chad',                     capital: "N'Djamena",        flag: '🇹🇩', continent: 'africa',   pop: '17M',   currency: 'CFA Franc (XAF)',    lang: 'French, Arabic'  },
  { name: 'Comoros',                  capital: 'Moroni',           flag: '🇰🇲', continent: 'africa',   pop: '870K',  currency: 'Franc (KMF)',        lang: 'Comorian'        },
  { name: 'Congo (DRC)',              capital: 'Kinshasa',         flag: '🇨🇩', continent: 'africa',   pop: '100M',  currency: 'Franc (CDF)',        lang: 'French'          },
  { name: 'Congo (Republic)',         capital: 'Brazzaville',      flag: '🇨🇬', continent: 'africa',   pop: '6M',    currency: 'CFA Franc (XAF)',    lang: 'French'          },
  { name: 'Djibouti',                 capital: 'Djibouti',         flag: '🇩🇯', continent: 'africa',   pop: '1M',    currency: 'Franc (DJF)',        lang: 'French, Arabic'  },
  { name: 'Egypt',                    capital: 'Cairo',            flag: '🇪🇬', continent: 'africa',   pop: '105M',  currency: 'Pound (EGP)',        lang: 'Arabic'          },
  { name: 'Equatorial Guinea',        capital: 'Malabo',           flag: '🇬🇶', continent: 'africa',   pop: '1.5M',  currency: 'CFA Franc (XAF)',    lang: 'Spanish, French' },
  { name: 'Eritrea',                  capital: 'Asmara',           flag: '🇪🇷', continent: 'africa',   pop: '3.5M',  currency: 'Nakfa (ERN)',        lang: 'Tigrinya'        },
  { name: 'Eswatini',                 capital: 'Mbabane',          flag: '🇸🇿', continent: 'africa',   pop: '1.2M',  currency: 'Lilangeni (SZL)',    lang: 'Swati'           },
  { name: 'Ethiopia',                 capital: 'Addis Ababa',      flag: '🇪🇹', continent: 'africa',   pop: '120M',  currency: 'Birr (ETB)',         lang: 'Amharic'         },
  { name: 'Gabon',                    capital: 'Libreville',       flag: '🇬🇦', continent: 'africa',   pop: '2.3M',  currency: 'CFA Franc (XAF)',    lang: 'French'          },
  { name: 'Gambia',                   capital: 'Banjul',           flag: '🇬🇲', continent: 'africa',   pop: '2.5M',  currency: 'Dalasi (GMD)',       lang: 'English'         },
  { name: 'Ghana',                    capital: 'Accra',            flag: '🇬🇭', continent: 'africa',   pop: '33M',   currency: 'Cedi (GHS)',         lang: 'English'         },
  { name: 'Guinea',                   capital: 'Conakry',          flag: '🇬🇳', continent: 'africa',   pop: '13M',   currency: 'Franc (GNF)',        lang: 'French'          },
  { name: 'Guinea-Bissau',            capital: 'Bissau',           flag: '🇬🇼', continent: 'africa',   pop: '2M',    currency: 'CFA Franc (XOF)',    lang: 'Portuguese'      },
  { name: 'Ivory Coast',              capital: 'Yamoussoukro',     flag: '🇨🇮', continent: 'africa',   pop: '27M',   currency: 'CFA Franc (XOF)',    lang: 'French'          },
  { name: 'Kenya',                    capital: 'Nairobi',          flag: '🇰🇪', continent: 'africa',   pop: '55M',   currency: 'Shilling (KES)',     lang: 'Swahili'         },
  { name: 'Lesotho',                  capital: 'Maseru',           flag: '🇱🇸', continent: 'africa',   pop: '2.2M',  currency: 'Loti (LSL)',         lang: 'Sesotho'         },
  { name: 'Liberia',                  capital: 'Monrovia',         flag: '🇱🇷', continent: 'africa',   pop: '5M',    currency: 'Dollar (LRD)',       lang: 'English'         },
  { name: 'Libya',                    capital: 'Tripoli',          flag: '🇱🇾', continent: 'africa',   pop: '7M',    currency: 'Dinar (LYD)',        lang: 'Arabic'          },
  { name: 'Madagascar',               capital: 'Antananarivo',     flag: '🇲🇬', continent: 'africa',   pop: '28M',   currency: 'Ariary (MGA)',       lang: 'Malagasy'        },
  { name: 'Malawi',                   capital: 'Lilongwe',         flag: '🇲🇼', continent: 'africa',   pop: '20M',   currency: 'Kwacha (MWK)',       lang: 'English'         },
  { name: 'Mali',                     capital: 'Bamako',           flag: '🇲🇱', continent: 'africa',   pop: '22M',   currency: 'CFA Franc (XOF)',    lang: 'French'          },
  { name: 'Mauritania',               capital: 'Nouakchott',       flag: '🇲🇷', continent: 'africa',   pop: '4.5M',  currency: 'Ouguiya (MRU)',      lang: 'Arabic'          },
  { name: 'Mauritius',                capital: 'Port Louis',       flag: '🇲🇺', continent: 'africa',   pop: '1.3M',  currency: 'Rupee (MUR)',        lang: 'English'         },
  { name: 'Morocco',                  capital: 'Rabat',            flag: '🇲🇦', continent: 'africa',   pop: '37M',   currency: 'Dirham (MAD)',       lang: 'Arabic'          },
  { name: 'Mozambique',               capital: 'Maputo',           flag: '🇲🇿', continent: 'africa',   pop: '32M',   currency: 'Metical (MZN)',      lang: 'Portuguese'      },
  { name: 'Namibia',                  capital: 'Windhoek',         flag: '🇳🇦', continent: 'africa',   pop: '2.6M',  currency: 'Dollar (NAD)',       lang: 'English'         },
  { name: 'Niger',                    capital: 'Niamey',           flag: '🇳🇪', continent: 'africa',   pop: '25M',   currency: 'CFA Franc (XOF)',    lang: 'French'          },
  { name: 'Nigeria',                  capital: 'Abuja',            flag: '🇳🇬', continent: 'africa',   pop: '220M',  currency: 'Naira (NGN)',        lang: 'English'         },
  { name: 'Rwanda',                   capital: 'Kigali',           flag: '🇷🇼', continent: 'africa',   pop: '13M',   currency: 'Franc (RWF)',        lang: 'Kinyarwanda'     },
  { name: 'São Tomé & Príncipe',      capital: 'São Tomé',         flag: '🇸🇹', continent: 'africa',   pop: '220K',  currency: 'Dobra (STN)',        lang: 'Portuguese'      },
  { name: 'Senegal',                  capital: 'Dakar',            flag: '🇸🇳', continent: 'africa',   pop: '17M',   currency: 'CFA Franc (XOF)',    lang: 'French'          },
  { name: 'Seychelles',               capital: 'Victoria',         flag: '🇸🇨', continent: 'africa',   pop: '98K',   currency: 'Rupee (SCR)',        lang: 'English'         },
  { name: 'Sierra Leone',             capital: 'Freetown',         flag: '🇸🇱', continent: 'africa',   pop: '8M',    currency: 'Leone (SLE)',        lang: 'English'         },
  { name: 'Somalia',                  capital: 'Mogadishu',        flag: '🇸🇴', continent: 'africa',   pop: '17M',   currency: 'Shilling (SOS)',     lang: 'Somali'          },
  { name: 'South Africa',             capital: 'Pretoria',         flag: '🇿🇦', continent: 'africa',   pop: '60M',   currency: 'Rand (ZAR)',         lang: 'Zulu, English'   },
  { name: 'South Sudan',              capital: 'Juba',             flag: '🇸🇸', continent: 'africa',   pop: '11M',   currency: 'Pound (SSP)',        lang: 'English'         },
  { name: 'Sudan',                    capital: 'Khartoum',         flag: '🇸🇩', continent: 'africa',   pop: '45M',   currency: 'Pound (SDG)',        lang: 'Arabic'          },
  { name: 'Tanzania',                 capital: 'Dodoma',           flag: '🇹🇿', continent: 'africa',   pop: '63M',   currency: 'Shilling (TZS)',     lang: 'Swahili'         },
  { name: 'Togo',                     capital: 'Lomé',             flag: '🇹🇬', continent: 'africa',   pop: '8.5M',  currency: 'CFA Franc (XOF)',    lang: 'French'          },
  { name: 'Tunisia',                  capital: 'Tunis',            flag: '🇹🇳', continent: 'africa',   pop: '12M',   currency: 'Dinar (TND)',        lang: 'Arabic'          },
  { name: 'Uganda',                   capital: 'Kampala',          flag: '🇺🇬', continent: 'africa',   pop: '48M',   currency: 'Shilling (UGX)',     lang: 'English'         },
  { name: 'Zambia',                   capital: 'Lusaka',           flag: '🇿🇲', continent: 'africa',   pop: '19M',   currency: 'Kwacha (ZMW)',       lang: 'English'         },
  { name: 'Zimbabwe',                 capital: 'Harare',           flag: '🇿🇼', continent: 'africa',   pop: '16M',   currency: 'Dollar (ZWL)',       lang: 'English'         },
  // Asia (48 countries)
  { name: 'Afghanistan',              capital: 'Kabul',            flag: '🇦🇫', continent: 'asia',     pop: '40M',   currency: 'Afghani (AFN)',      lang: 'Pashto, Dari'    },
  { name: 'Armenia',                  capital: 'Yerevan',          flag: '🇦🇲', continent: 'asia',     pop: '3M',    currency: 'Dram (AMD)',         lang: 'Armenian'        },
  { name: 'Azerbaijan',               capital: 'Baku',             flag: '🇦🇿', continent: 'asia',     pop: '10M',   currency: 'Manat (AZN)',        lang: 'Azerbaijani'     },
  { name: 'Bahrain',                  capital: 'Manama',           flag: '🇧🇭', continent: 'asia',     pop: '1.7M',  currency: 'Dinar (BHD)',        lang: 'Arabic'          },
  { name: 'Bangladesh',               capital: 'Dhaka',            flag: '🇧🇩', continent: 'asia',     pop: '170M',  currency: 'Taka (BDT)',         lang: 'Bengali'         },
  { name: 'Bhutan',                   capital: 'Thimphu',          flag: '🇧🇹', continent: 'asia',     pop: '780K',  currency: 'Ngultrum (BTN)',     lang: 'Dzongkha'        },
  { name: 'Brunei',                   capital: 'Bandar Seri Begawan',flag:'🇧🇳', continent: 'asia',    pop: '440K',  currency: 'Dollar (BND)',       lang: 'Malay'           },
  { name: 'Cambodia',                 capital: 'Phnom Penh',       flag: '🇰🇭', continent: 'asia',     pop: '17M',   currency: 'Riel (KHR)',         lang: 'Khmer'           },
  { name: 'China',                    capital: 'Beijing',          flag: '🇨🇳', continent: 'asia',     pop: '1.4B',  currency: 'Yuan (CNY)',         lang: 'Mandarin'        },
  { name: 'Cyprus',                   capital: 'Nicosia',          flag: '🇨🇾', continent: 'asia',     pop: '1.2M',  currency: 'Euro (EUR)',         lang: 'Greek'           },
  { name: 'Georgia',                  capital: 'Tbilisi',          flag: '🇬🇪', continent: 'asia',     pop: '4M',    currency: 'Lari (GEL)',         lang: 'Georgian'        },
  { name: 'India',                    capital: 'New Delhi',        flag: '🇮🇳', continent: 'asia',     pop: '1.4B',  currency: 'Rupee (INR)',        lang: 'Hindi'           },
  { name: 'Indonesia',                capital: 'Jakarta',          flag: '🇮🇩', continent: 'asia',     pop: '277M',  currency: 'Rupiah (IDR)',       lang: 'Indonesian'      },
  { name: 'Iran',                     capital: 'Tehran',           flag: '🇮🇷', continent: 'asia',     pop: '87M',   currency: 'Rial (IRR)',         lang: 'Persian'         },
  { name: 'Iraq',                     capital: 'Baghdad',          flag: '🇮🇶', continent: 'asia',     pop: '41M',   currency: 'Dinar (IQD)',        lang: 'Arabic'          },
  { name: 'Israel',                   capital: 'Jerusalem',        flag: '🇮🇱', continent: 'asia',     pop: '9M',    currency: 'Shekel (ILS)',       lang: 'Hebrew'          },
  { name: 'Japan',                    capital: 'Tokyo',            flag: '🇯🇵', continent: 'asia',     pop: '125M',  currency: 'Yen (JPY)',          lang: 'Japanese'        },
  { name: 'Jordan',                   capital: 'Amman',            flag: '🇯🇴', continent: 'asia',     pop: '10M',   currency: 'Dinar (JOD)',        lang: 'Arabic'          },
  { name: 'Kazakhstan',               capital: 'Astana',           flag: '🇰🇿', continent: 'asia',     pop: '19M',   currency: 'Tenge (KZT)',        lang: 'Kazakh'          },
  { name: 'Kuwait',                   capital: 'Kuwait City',      flag: '🇰🇼', continent: 'asia',     pop: '4.3M',  currency: 'Dinar (KWD)',        lang: 'Arabic'          },
  { name: 'Kyrgyzstan',               capital: 'Bishkek',          flag: '🇰🇬', continent: 'asia',     pop: '6.6M',  currency: 'Som (KGS)',          lang: 'Kyrgyz'          },
  { name: 'Laos',                     capital: 'Vientiane',        flag: '🇱🇦', continent: 'asia',     pop: '7.3M',  currency: 'Kip (LAK)',          lang: 'Lao'             },
  { name: 'Lebanon',                  capital: 'Beirut',           flag: '🇱🇧', continent: 'asia',     pop: '6.8M',  currency: 'Pound (LBP)',        lang: 'Arabic'          },
  { name: 'Malaysia',                 capital: 'Kuala Lumpur',     flag: '🇲🇾', continent: 'asia',     pop: '33M',   currency: 'Ringgit (MYR)',      lang: 'Malay'           },
  { name: 'Maldives',                 capital: 'Malé',             flag: '🇲🇻', continent: 'asia',     pop: '540K',  currency: 'Rufiyaa (MVR)',      lang: 'Dhivehi'         },
  { name: 'Mongolia',                 capital: 'Ulaanbaatar',      flag: '🇲🇳', continent: 'asia',     pop: '3.3M',  currency: 'Tögrög (MNT)',       lang: 'Mongolian'       },
  { name: 'Myanmar',                  capital: 'Naypyidaw',        flag: '🇲🇲', continent: 'asia',     pop: '54M',   currency: 'Kyat (MMK)',         lang: 'Burmese'         },
  { name: 'Nepal',                    capital: 'Kathmandu',        flag: '🇳🇵', continent: 'asia',     pop: '30M',   currency: 'Rupee (NPR)',        lang: 'Nepali'          },
  { name: 'North Korea',              capital: 'Pyongyang',        flag: '🇰🇵', continent: 'asia',     pop: '26M',   currency: 'Won (KPW)',          lang: 'Korean'          },
  { name: 'Oman',                     capital: 'Muscat',           flag: '🇴🇲', continent: 'asia',     pop: '4.5M',  currency: 'Rial (OMR)',         lang: 'Arabic'          },
  { name: 'Pakistan',                 capital: 'Islamabad',        flag: '🇵🇰', continent: 'asia',     pop: '231M',  currency: 'Rupee (PKR)',        lang: 'Urdu'            },
  { name: 'Palestine',                capital: 'Ramallah',         flag: '🇵🇸', continent: 'asia',     pop: '5.4M',  currency: 'Shekel (ILS)',       lang: 'Arabic'          },
  { name: 'Philippines',              capital: 'Manila',           flag: '🇵🇭', continent: 'asia',     pop: '114M',  currency: 'Peso (PHP)',         lang: 'Filipino'        },
  { name: 'Qatar',                    capital: 'Doha',             flag: '🇶🇦', continent: 'asia',     pop: '2.9M',  currency: 'Riyal (QAR)',        lang: 'Arabic'          },
  { name: 'Saudi Arabia',             capital: 'Riyadh',           flag: '🇸🇦', continent: 'asia',     pop: '35M',   currency: 'Riyal (SAR)',        lang: 'Arabic'          },
  { name: 'Singapore',                capital: 'Singapore',        flag: '🇸🇬', continent: 'asia',     pop: '5.9M',  currency: 'Dollar (SGD)',       lang: 'English'         },
  { name: 'South Korea',              capital: 'Seoul',            flag: '🇰🇷', continent: 'asia',     pop: '52M',   currency: 'Won (KRW)',          lang: 'Korean'          },
  { name: 'Sri Lanka',                capital: 'Colombo',          flag: '🇱🇰', continent: 'asia',     pop: '22M',   currency: 'Rupee (LKR)',        lang: 'Sinhala'         },
  { name: 'Syria',                    capital: 'Damascus',         flag: '🇸🇾', continent: 'asia',     pop: '21M',   currency: 'Pound (SYP)',        lang: 'Arabic'          },
  { name: 'Taiwan',                   capital: 'Taipei',           flag: '🇹🇼', continent: 'asia',     pop: '23M',   currency: 'Dollar (TWD)',       lang: 'Mandarin'        },
  { name: 'Tajikistan',               capital: 'Dushanbe',         flag: '🇹🇯', continent: 'asia',     pop: '10M',   currency: 'Somoni (TJS)',       lang: 'Tajik'           },
  { name: 'Thailand',                 capital: 'Bangkok',          flag: '🇹🇭', continent: 'asia',     pop: '72M',   currency: 'Baht (THB)',         lang: 'Thai'            },
  { name: 'Timor-Leste',              capital: 'Dili',             flag: '🇹🇱', continent: 'asia',     pop: '1.3M',  currency: 'Dollar (USD)',       lang: 'Tetum'           },
  { name: 'Turkmenistan',             capital: 'Ashgabat',         flag: '🇹🇲', continent: 'asia',     pop: '6M',    currency: 'Manat (TMT)',        lang: 'Turkmen'         },
  { name: 'UAE',                      capital: 'Abu Dhabi',        flag: '🇦🇪', continent: 'asia',     pop: '10M',   currency: 'Dirham (AED)',       lang: 'Arabic'          },
  { name: 'Uzbekistan',               capital: 'Tashkent',         flag: '🇺🇿', continent: 'asia',     pop: '35M',   currency: 'Som (UZS)',          lang: 'Uzbek'           },
  { name: 'Vietnam',                  capital: 'Hanoi',            flag: '🇻🇳', continent: 'asia',     pop: '98M',   currency: 'Dong (VND)',         lang: 'Vietnamese'      },
  { name: 'Yemen',                    capital: "Sana'a",           flag: '🇾🇪', continent: 'asia',     pop: '34M',   currency: 'Rial (YER)',         lang: 'Arabic'          },
  // Europe (44 countries)
  { name: 'Albania',                  capital: 'Tirana',           flag: '🇦🇱', continent: 'europe',   pop: '2.8M',  currency: 'Lek (ALL)',          lang: 'Albanian'        },
  { name: 'Andorra',                  capital: 'Andorra la Vella', flag: '🇦🇩', continent: 'europe',   pop: '77K',   currency: 'Euro (EUR)',         lang: 'Catalan'         },
  { name: 'Austria',                  capital: 'Vienna',           flag: '🇦🇹', continent: 'europe',   pop: '9M',    currency: 'Euro (EUR)',         lang: 'German'          },
  { name: 'Belarus',                  capital: 'Minsk',            flag: '🇧🇾', continent: 'europe',   pop: '9.4M',  currency: 'Ruble (BYN)',        lang: 'Belarusian'      },
  { name: 'Belgium',                  capital: 'Brussels',         flag: '🇧🇪', continent: 'europe',   pop: '11.6M', currency: 'Euro (EUR)',         lang: 'Dutch, French'   },
  { name: 'Bosnia & Herzegovina',     capital: 'Sarajevo',         flag: '🇧🇦', continent: 'europe',   pop: '3.3M',  currency: 'Mark (BAM)',         lang: 'Bosnian'         },
  { name: 'Bulgaria',                 capital: 'Sofia',            flag: '🇧🇬', continent: 'europe',   pop: '6.5M',  currency: 'Lev (BGN)',          lang: 'Bulgarian'       },
  { name: 'Croatia',                  capital: 'Zagreb',           flag: '🇭🇷', continent: 'europe',   pop: '4M',    currency: 'Euro (EUR)',         lang: 'Croatian'        },
  { name: 'Czech Republic',           capital: 'Prague',           flag: '🇨🇿', continent: 'europe',   pop: '10.9M', currency: 'Koruna (CZK)',       lang: 'Czech'           },
  { name: 'Denmark',                  capital: 'Copenhagen',       flag: '🇩🇰', continent: 'europe',   pop: '5.9M',  currency: 'Krone (DKK)',        lang: 'Danish'          },
  { name: 'Estonia',                  capital: 'Tallinn',          flag: '🇪🇪', continent: 'europe',   pop: '1.3M',  currency: 'Euro (EUR)',         lang: 'Estonian'        },
  { name: 'Finland',                  capital: 'Helsinki',         flag: '🇫🇮', continent: 'europe',   pop: '5.5M',  currency: 'Euro (EUR)',         lang: 'Finnish'         },
  { name: 'France',                   capital: 'Paris',            flag: '🇫🇷', continent: 'europe',   pop: '68M',   currency: 'Euro (EUR)',         lang: 'French'          },
  { name: 'Germany',                  capital: 'Berlin',           flag: '🇩🇪', continent: 'europe',   pop: '84M',   currency: 'Euro (EUR)',         lang: 'German'          },
  { name: 'Greece',                   capital: 'Athens',           flag: '🇬🇷', continent: 'europe',   pop: '10.4M', currency: 'Euro (EUR)',         lang: 'Greek'           },
  { name: 'Hungary',                  capital: 'Budapest',         flag: '🇭🇺', continent: 'europe',   pop: '9.7M',  currency: 'Forint (HUF)',       lang: 'Hungarian'       },
  { name: 'Iceland',                  capital: 'Reykjavík',        flag: '🇮🇸', continent: 'europe',   pop: '370K',  currency: 'Króna (ISK)',        lang: 'Icelandic'       },
  { name: 'Ireland',                  capital: 'Dublin',           flag: '🇮🇪', continent: 'europe',   pop: '5.1M',  currency: 'Euro (EUR)',         lang: 'English, Irish'  },
  { name: 'Italy',                    capital: 'Rome',             flag: '🇮🇹', continent: 'europe',   pop: '60M',   currency: 'Euro (EUR)',         lang: 'Italian'         },
  { name: 'Kosovo',                   capital: 'Pristina',         flag: '🇽🇰', continent: 'europe',   pop: '1.8M',  currency: 'Euro (EUR)',         lang: 'Albanian'        },
  { name: 'Latvia',                   capital: 'Riga',             flag: '🇱🇻', continent: 'europe',   pop: '1.9M',  currency: 'Euro (EUR)',         lang: 'Latvian'         },
  { name: 'Liechtenstein',            capital: 'Vaduz',            flag: '🇱🇮', continent: 'europe',   pop: '38K',   currency: 'Franc (CHF)',        lang: 'German'          },
  { name: 'Lithuania',                capital: 'Vilnius',          flag: '🇱🇹', continent: 'europe',   pop: '2.8M',  currency: 'Euro (EUR)',         lang: 'Lithuanian'      },
  { name: 'Luxembourg',               capital: 'Luxembourg City',  flag: '🇱🇺', continent: 'europe',   pop: '660K',  currency: 'Euro (EUR)',         lang: 'Luxembourgish'   },
  { name: 'Malta',                    capital: 'Valletta',         flag: '🇲🇹', continent: 'europe',   pop: '520K',  currency: 'Euro (EUR)',         lang: 'Maltese'         },
  { name: 'Moldova',                  capital: 'Chișinău',         flag: '🇲🇩', continent: 'europe',   pop: '2.6M',  currency: 'Leu (MDL)',          lang: 'Romanian'        },
  { name: 'Monaco',                   capital: 'Monaco',           flag: '🇲🇨', continent: 'europe',   pop: '39K',   currency: 'Euro (EUR)',         lang: 'French'          },
  { name: 'Montenegro',               capital: 'Podgorica',        flag: '🇲🇪', continent: 'europe',   pop: '620K',  currency: 'Euro (EUR)',         lang: 'Montenegrin'     },
  { name: 'Netherlands',              capital: 'Amsterdam',        flag: '🇳🇱', continent: 'europe',   pop: '17.6M', currency: 'Euro (EUR)',         lang: 'Dutch'           },
  { name: 'North Macedonia',          capital: 'Skopje',           flag: '🇲🇰', continent: 'europe',   pop: '2.1M',  currency: 'Denar (MKD)',        lang: 'Macedonian'      },
  { name: 'Norway',                   capital: 'Oslo',             flag: '🇳🇴', continent: 'europe',   pop: '5.4M',  currency: 'Krone (NOK)',        lang: 'Norwegian'       },
  { name: 'Poland',                   capital: 'Warsaw',           flag: '🇵🇱', continent: 'europe',   pop: '38M',   currency: 'Zloty (PLN)',        lang: 'Polish'          },
  { name: 'Portugal',                 capital: 'Lisbon',           flag: '🇵🇹', continent: 'europe',   pop: '10.3M', currency: 'Euro (EUR)',         lang: 'Portuguese'      },
  { name: 'Romania',                  capital: 'Bucharest',        flag: '🇷🇴', continent: 'europe',   pop: '19M',   currency: 'Leu (RON)',          lang: 'Romanian'        },
  { name: 'Russia',                   capital: 'Moscow',           flag: '🇷🇺', continent: 'europe',   pop: '144M',  currency: 'Ruble (RUB)',        lang: 'Russian'         },
  { name: 'San Marino',               capital: 'San Marino',       flag: '🇸🇲', continent: 'europe',   pop: '34K',   currency: 'Euro (EUR)',         lang: 'Italian'         },
  { name: 'Serbia',                   capital: 'Belgrade',         flag: '🇷🇸', continent: 'europe',   pop: '6.8M',  currency: 'Dinar (RSD)',        lang: 'Serbian'         },
  { name: 'Slovakia',                 capital: 'Bratislava',       flag: '🇸🇰', continent: 'europe',   pop: '5.5M',  currency: 'Euro (EUR)',         lang: 'Slovak'          },
  { name: 'Slovenia',                 capital: 'Ljubljana',        flag: '🇸🇮', continent: 'europe',   pop: '2.1M',  currency: 'Euro (EUR)',         lang: 'Slovenian'       },
  { name: 'Spain',                    capital: 'Madrid',           flag: '🇪🇸', continent: 'europe',   pop: '47M',   currency: 'Euro (EUR)',         lang: 'Spanish'         },
  { name: 'Sweden',                   capital: 'Stockholm',        flag: '🇸🇪', continent: 'europe',   pop: '10.5M', currency: 'Krona (SEK)',        lang: 'Swedish'         },
  { name: 'Switzerland',              capital: 'Bern',             flag: '🇨🇭', continent: 'europe',   pop: '8.7M',  currency: 'Franc (CHF)',        lang: 'German, French'  },
  { name: 'Ukraine',                  capital: 'Kyiv',             flag: '🇺🇦', continent: 'europe',   pop: '44M',   currency: 'Hryvnia (UAH)',      lang: 'Ukrainian'       },
  { name: 'United Kingdom',           capital: 'London',           flag: '🇬🇧', continent: 'europe',   pop: '67M',   currency: 'Pound (GBP)',        lang: 'English'         },
  { name: 'Vatican City',             capital: 'Vatican City',     flag: '🇻🇦', continent: 'europe',   pop: '800',   currency: 'Euro (EUR)',         lang: 'Italian'         },
  // North America (23 countries)
  { name: 'Antigua & Barbuda',        capital: "Saint John's",     flag: '🇦🇬', continent: 'namerica', pop: '97K',   currency: 'Dollar (XCD)',       lang: 'English'         },
  { name: 'Bahamas',                  capital: 'Nassau',           flag: '🇧🇸', continent: 'namerica', pop: '400K',  currency: 'Dollar (BSD)',       lang: 'English'         },
  { name: 'Barbados',                 capital: 'Bridgetown',       flag: '🇧🇧', continent: 'namerica', pop: '290K',  currency: 'Dollar (BBD)',       lang: 'English'         },
  { name: 'Belize',                   capital: 'Belmopan',         flag: '🇧🇿', continent: 'namerica', pop: '400K',  currency: 'Dollar (BZD)',       lang: 'English'         },
  { name: 'Canada',                   capital: 'Ottawa',           flag: '🇨🇦', continent: 'namerica', pop: '38M',   currency: 'Dollar (CAD)',       lang: 'English, French' },
  { name: 'Costa Rica',               capital: 'San José',         flag: '🇨🇷', continent: 'namerica', pop: '5.2M',  currency: 'Colón (CRC)',        lang: 'Spanish'         },
  { name: 'Cuba',                     capital: 'Havana',           flag: '🇨🇺', continent: 'namerica', pop: '11M',   currency: 'Peso (CUP)',         lang: 'Spanish'         },
  { name: 'Dominica',                 capital: 'Roseau',           flag: '🇩🇲', continent: 'namerica', pop: '72K',   currency: 'Dollar (XCD)',       lang: 'English'         },
  { name: 'Dominican Republic',       capital: 'Santo Domingo',    flag: '🇩🇴', continent: 'namerica', pop: '11M',   currency: 'Peso (DOP)',         lang: 'Spanish'         },
  { name: 'El Salvador',              capital: 'San Salvador',     flag: '🇸🇻', continent: 'namerica', pop: '6.5M',  currency: 'Dollar (USD)',       lang: 'Spanish'         },
  { name: 'Grenada',                  capital: "Saint George's",   flag: '🇬🇩', continent: 'namerica', pop: '125K',  currency: 'Dollar (XCD)',       lang: 'English'         },
  { name: 'Guatemala',                capital: 'Guatemala City',   flag: '🇬🇹', continent: 'namerica', pop: '17M',   currency: 'Quetzal (GTQ)',      lang: 'Spanish'         },
  { name: 'Haiti',                    capital: 'Port-au-Prince',   flag: '🇭🇹', continent: 'namerica', pop: '11.5M', currency: 'Gourde (HTG)',       lang: 'Haitian Creole'  },
  { name: 'Honduras',                 capital: 'Tegucigalpa',      flag: '🇭🇳', continent: 'namerica', pop: '10M',   currency: 'Lempira (HNL)',      lang: 'Spanish'         },
  { name: 'Jamaica',                  capital: 'Kingston',         flag: '🇯🇲', continent: 'namerica', pop: '3M',    currency: 'Dollar (JMD)',       lang: 'English'         },
  { name: 'Mexico',                   capital: 'Mexico City',      flag: '🇲🇽', continent: 'namerica', pop: '130M',  currency: 'Peso (MXN)',         lang: 'Spanish'         },
  { name: 'Nicaragua',                capital: 'Managua',          flag: '🇳🇮', continent: 'namerica', pop: '6.9M',  currency: 'Córdoba (NIO)',      lang: 'Spanish'         },
  { name: 'Panama',                   capital: 'Panama City',      flag: '🇵🇦', continent: 'namerica', pop: '4.4M',  currency: 'Balboa (PAB)',       lang: 'Spanish'         },
  { name: 'Saint Kitts & Nevis',      capital: 'Basseterre',       flag: '🇰🇳', continent: 'namerica', pop: '53K',   currency: 'Dollar (XCD)',       lang: 'English'         },
  { name: 'Saint Lucia',              capital: 'Castries',         flag: '🇱🇨', continent: 'namerica', pop: '185K',  currency: 'Dollar (XCD)',       lang: 'English'         },
  { name: 'Saint Vincent',            capital: 'Kingstown',        flag: '🇻🇨', continent: 'namerica', pop: '110K',  currency: 'Dollar (XCD)',       lang: 'English'         },
  { name: 'Trinidad & Tobago',        capital: 'Port of Spain',    flag: '🇹🇹', continent: 'namerica', pop: '1.4M',  currency: 'Dollar (TTD)',       lang: 'English'         },
  { name: 'United States',            capital: 'Washington D.C.',  flag: '🇺🇸', continent: 'namerica', pop: '331M',  currency: 'Dollar (USD)',       lang: 'English'         },
  // South America (12 countries)
  { name: 'Argentina',                capital: 'Buenos Aires',     flag: '🇦🇷', continent: 'samerica', pop: '46M',   currency: 'Peso (ARS)',         lang: 'Spanish'         },
  { name: 'Bolivia',                  capital: 'Sucre',            flag: '🇧🇴', continent: 'samerica', pop: '12M',   currency: 'Boliviano (BOB)',    lang: 'Spanish'         },
  { name: 'Brazil',                   capital: 'Brasília',         flag: '🇧🇷', continent: 'samerica', pop: '215M',  currency: 'Real (BRL)',         lang: 'Portuguese'      },
  { name: 'Chile',                    capital: 'Santiago',         flag: '🇨🇱', continent: 'samerica', pop: '19M',   currency: 'Peso (CLP)',         lang: 'Spanish'         },
  { name: 'Colombia',                 capital: 'Bogotá',           flag: '🇨🇴', continent: 'samerica', pop: '51M',   currency: 'Peso (COP)',         lang: 'Spanish'         },
  { name: 'Ecuador',                  capital: 'Quito',            flag: '🇪🇨', continent: 'samerica', pop: '18M',   currency: 'Dollar (USD)',       lang: 'Spanish'         },
  { name: 'Guyana',                   capital: 'Georgetown',       flag: '🇬🇾', continent: 'samerica', pop: '790K',  currency: 'Dollar (GYD)',       lang: 'English'         },
  { name: 'Paraguay',                 capital: 'Asunción',         flag: '🇵🇾', continent: 'samerica', pop: '7.4M',  currency: 'Guaraní (PYG)',      lang: 'Spanish'         },
  { name: 'Peru',                     capital: 'Lima',             flag: '🇵🇪', continent: 'samerica', pop: '33M',   currency: 'Sol (PEN)',          lang: 'Spanish'         },
  { name: 'Suriname',                 capital: 'Paramaribo',       flag: '🇸🇷', continent: 'samerica', pop: '620K',  currency: 'Dollar (SRD)',       lang: 'Dutch'           },
  { name: 'Uruguay',                  capital: 'Montevideo',       flag: '🇺🇾', continent: 'samerica', pop: '3.5M',  currency: 'Peso (UYU)',         lang: 'Spanish'         },
  { name: 'Venezuela',                capital: 'Caracas',          flag: '🇻🇪', continent: 'samerica', pop: '28M',   currency: 'Bolívar (VES)',      lang: 'Spanish'         },
  // Oceania (14 countries)
  { name: 'Australia',                capital: 'Canberra',         flag: '🇦🇺', continent: 'oceania',  pop: '26M',   currency: 'Dollar (AUD)',       lang: 'English'         },
  { name: 'Fiji',                     capital: 'Suva',             flag: '🇫🇯', continent: 'oceania',  pop: '930K',  currency: 'Dollar (FJD)',       lang: 'English'         },
  { name: 'Kiribati',                 capital: 'South Tarawa',     flag: '🇰🇮', continent: 'oceania',  pop: '120K',  currency: 'Dollar (AUD)',       lang: 'English'         },
  { name: 'Marshall Islands',         capital: 'Majuro',           flag: '🇲🇭', continent: 'oceania',  pop: '42K',   currency: 'Dollar (USD)',       lang: 'Marshallese'     },
  { name: 'Micronesia',               capital: 'Palikir',          flag: '🇫🇲', continent: 'oceania',  pop: '115K',  currency: 'Dollar (USD)',       lang: 'English'         },
  { name: 'Nauru',                    capital: 'Yaren',            flag: '🇳🇷', continent: 'oceania',  pop: '10K',   currency: 'Dollar (AUD)',       lang: 'Nauruan'         },
  { name: 'New Zealand',              capital: 'Wellington',       flag: '🇳🇿', continent: 'oceania',  pop: '5M',    currency: 'Dollar (NZD)',       lang: 'English'         },
  { name: 'Palau',                    capital: 'Ngerulmud',        flag: '🇵🇼', continent: 'oceania',  pop: '18K',   currency: 'Dollar (USD)',       lang: 'Palauan'         },
  { name: 'Papua New Guinea',         capital: 'Port Moresby',     flag: '🇵🇬', continent: 'oceania',  pop: '10M',   currency: 'Kina (PGK)',         lang: 'English'         },
  { name: 'Samoa',                    capital: 'Apia',             flag: '🇼🇸', continent: 'oceania',  pop: '220K',  currency: 'Tala (WST)',         lang: 'Samoan'          },
  { name: 'Solomon Islands',          capital: 'Honiara',          flag: '🇸🇧', continent: 'oceania',  pop: '720K',  currency: 'Dollar (SBD)',       lang: 'English'         },
  { name: 'Tonga',                    capital: "Nuku'alofa",       flag: '🇹🇴', continent: 'oceania',  pop: '100K',  currency: 'Paanga (TOP)',       lang: 'Tongan'          },
  { name: 'Tuvalu',                   capital: 'Funafuti',         flag: '🇹🇻', continent: 'oceania',  pop: '11K',   currency: 'Dollar (AUD)',       lang: 'Tuvaluan'        },
  { name: 'Vanuatu',                  capital: 'Port Vila',        flag: '🇻🇺', continent: 'oceania',  pop: '320K',  currency: 'Vatu (VUV)',         lang: 'Bislama'         },
];

export default function GlobeScreen({ navigation }) {
  const { COLORS: dynCOLORS } = useTheme();
  const [search, setSearch]       = useState('');
  const [continent, setContinent] = useState('all');
  const [selected, setSelected]   = useState(null);

  const filtered = useMemo(() => COUNTRIES.filter(c => {
    const matchCont   = continent === 'all' || c.continent === continent;
    const matchSearch = !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.capital.toLowerCase().includes(search.toLowerCase());
    return matchCont && matchSearch;
  }).sort((a, b) => a.name.localeCompare(b.name)), [search, continent]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: dynCOLORS.bg }]}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Globe & Countries</Text>
      </View>

      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput style={styles.searchInput} value={search} onChangeText={setSearch}
          placeholder="Search country or capital..." placeholderTextColor={COLORS.textTertiary} />
        {search ? <TouchableOpacity onPress={() => setSearch('')}><Text style={styles.clearBtn}>✕</Text></TouchableOpacity> : null}
      </View>

      <View style={styles.contRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.contContent} bounces={false}>
          {CONTINENTS.map(c => (
            <TouchableOpacity key={c.id}
              style={[styles.contBtn, continent === c.id && styles.contBtnActive]}
              onPress={() => setContinent(c.id)} activeOpacity={0.7}>
              <Text style={[styles.contLabel, continent === c.id && styles.contLabelActive]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Text style={styles.count}>{filtered.length} countries</Text>

      <FlatList
        data={filtered}
        keyExtractor={c => c.name}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.countryCard} onPress={() => setSelected(item)} activeOpacity={0.7}>
            <Text style={styles.countryFlag}>{item.flag}</Text>
            <View style={styles.countryInfo}>
              <Text style={styles.countryName}>{item.name}</Text>
              <Text style={styles.countryCapital}>🏛 {item.capital}</Text>
            </View>
            <Text style={styles.countryPop}>{item.pop}</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>No countries found</Text></View>}
        ListFooterComponent={<View style={{ height: 20 }} />}
      />

      <Modal visible={!!selected} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {selected && (
              <>
                <TouchableOpacity style={styles.modalClose} onPress={() => setSelected(null)}>
                  <Text style={styles.modalCloseText}>✕  Close</Text>
                </TouchableOpacity>
                <Text style={styles.modalFlag}>{selected.flag}</Text>
                <Text style={styles.modalName}>{selected.name}</Text>
                <Text style={styles.modalContinent}>{CONTINENTS.find(c => c.id === selected.continent)?.label}</Text>
                <View style={styles.modalStats}>
                  {[
                    { icon: '🏛', label: 'Capital',    value: selected.capital  },
                    { icon: '👥', label: 'Population', value: selected.pop      },
                    { icon: '💰', label: 'Currency',   value: selected.currency },
                    { icon: '🗣', label: 'Language',   value: selected.lang     },
                  ].map(s => (
                    <View key={s.label} style={styles.modalStat}>
                      <Text style={styles.modalStatIcon}>{s.icon}</Text>
                      <View>
                        <Text style={styles.modalStatLabel}>{s.label}</Text>
                        <Text style={styles.modalStatValue}>{s.value}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  topbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: COLORS.border, gap: 12 },
  backBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.md, borderWidth: 0.5, borderColor: COLORS.border },
  backText: { fontSize: 13, color: COLORS.textSecondary },
  title: { fontSize: 16, fontWeight: '500', color: COLORS.textPrimary },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 12, marginTop: 10, marginBottom: 4, paddingHorizontal: 12, backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.lg, borderWidth: 0.5, borderColor: COLORS.border },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, paddingVertical: 11, fontSize: 14, color: COLORS.textPrimary },
  clearBtn: { fontSize: 13, color: COLORS.textTertiary, padding: 4 },
  contRow: { height: 46, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  contContent: { paddingHorizontal: 12, paddingVertical: 8, gap: 8, alignItems: 'center' },
  contBtn: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, borderWidth: 0.5, borderColor: COLORS.border, backgroundColor: COLORS.bg },
  contBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  contLabel: { fontSize: 12, color: COLORS.textSecondary },
  contLabelActive: { color: '#fff', fontWeight: '600' },
  count: { fontSize: 11, color: COLORS.textTertiary, paddingHorizontal: 16, paddingVertical: 5 },
  list: { paddingHorizontal: 12, gap: 8 },
  countryCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.lg, borderWidth: 0.5, borderColor: COLORS.border },
  countryFlag: { fontSize: 28 },
  countryInfo: { flex: 1 },
  countryName: { fontSize: 14, fontWeight: '500', color: COLORS.textPrimary },
  countryCapital: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  countryPop: { fontSize: 11, color: COLORS.textTertiary },
  arrow: { fontSize: 18, color: COLORS.textTertiary },
  empty: { paddingTop: 40, alignItems: 'center' },
  emptyText: { fontSize: 15, color: COLORS.textTertiary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: COLORS.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36, alignItems: 'center', gap: 6 },
  modalClose: { alignSelf: 'flex-end', padding: 4, marginBottom: 8 },
  modalCloseText: { fontSize: 14, color: COLORS.textSecondary },
  modalFlag: { fontSize: 64 },
  modalName: { fontSize: 22, fontWeight: '600', color: COLORS.textPrimary },
  modalContinent: { fontSize: 12, color: COLORS.textTertiary, marginBottom: 8 },
  modalStats: { width: '100%', gap: 8 },
  modalStat: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.md },
  modalStatIcon: { fontSize: 18, width: 26, textAlign: 'center' },
  modalStatLabel: { fontSize: 11, color: COLORS.textTertiary },
  modalStatValue: { fontSize: 14, fontWeight: '500', color: COLORS.textPrimary, marginTop: 1 },
});
