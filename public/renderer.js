// renderer.js

// Constants
const socket = io();

// Global variables
let currentAudioElement = null;
let activeAudioElements = [];

// Utility function to generate variations for the emoji map
function generateVariations(words, emoji) {
    return words.map(word => [word.toLowerCase(), emoji]);
}

// Main emoji categories and map
const emojiMap = new Map([
    // Animals
    ...generateVariations(['bear', 'bears', 'grizzly', 'teddy'], '🐻'),
    ...generateVariations(['dog', 'puppy', 'pup', 'hound', 'canine', 'pooch', 'mutt', 'doggy', 'doggie'], '🐕'),
    ...generateVariations(['cat', 'kitty', 'kitten', 'feline', 'tabby', 'tomcat'], '🐱'),
    ...generateVariations(['lion', 'lioness', 'cub', 'pride'], '🦁'),
    ...generateVariations(['tiger', 'tigress', 'bengal'], '🐯'),
    ...generateVariations(['monkey', 'ape', 'gorilla', 'chimp', 'chimpanzee', 'primate', 'orangutan'], '🐒'),
    ...generateVariations(['elephant', 'pachyderm', 'tusk', 'mammoth'], '🐘'),
    ...generateVariations(['giraffe', 'camelopard'], '🦒'),
    ...generateVariations(['zebra', 'equine'], '🦓'),
    ...generateVariations(['mouse', 'mice', 'rat', 'rodent', 'hamster', 'gerbil', 'vermin'], '🐁'),
    ...generateVariations(['fox', 'vixen', 'reynard'], '🦊'),
    ...generateVariations(['rabbit', 'bunny', 'hare', 'coney', 'lapin'], '🐇'),
    ...generateVariations(['horse', 'pony', 'stallion', 'mare', 'colt', 'filly', 'foal', 'steed'], '🐎'),
    ...generateVariations(['cow', 'cattle', 'bull', 'calf', 'bovine', 'heifer', 'steer'], '🐄'),
    ...generateVariations(['pig', 'hog', 'swine', 'boar', 'piglet', 'sow', 'porker'], '🐖'),
    ...generateVariations(['chicken', 'hen', 'rooster', 'cock', 'chick', 'fowl', 'poultry'], '🐓'),
    ...generateVariations(['fish', 'goldfish', 'trout', 'salmon', 'tuna', 'bass', 'cod', 'halibut'], '🐟'),
    ...generateVariations(['whale', 'orca', 'beluga', 'humpback', 'sperm whale', 'narwhal'], '🐋'),
    ...generateVariations(['dolphin', 'porpoise', 'bottlenose'], '🐬'),
    ...generateVariations(['frog', 'toad', 'tadpole', 'amphibian'], '🐸'),
    ...generateVariations(['snake', 'serpent', 'python', 'cobra', 'viper', 'boa', 'anaconda'], '🐍'),
    ...generateVariations(['turtle', 'tortoise', 'terrapin'], '🐢'),
    ...generateVariations(['bird', 'parrot', 'sparrow', 'finch', 'canary', 'parakeet', 'budgie', 'cardinal', 'dove', 'pigeon'], '🐦'),
    ...generateVariations(['penguin', 'emperor', 'adelie'], '🐧'),
    ...generateVariations(['octopus', 'squid', 'cephalopod'], '🐙'),
    ...generateVariations(['bee', 'bees', 'honeybee', 'bumblebee', 'wasp', 'hornet'], '🐝'),
    ...generateVariations(['ant', 'ants', 'insect', 'bug'], '🐜'),
    ...generateVariations(['butterfly', 'moth', 'caterpillar', 'chrysalis'], '🦋'),
    ...generateVariations(['panda', 'bamboo bear'], '🐼'),
    ...generateVariations(['koala', 'marsupial'], '🐨'),
    ...generateVariations(['dragon', 'drake', 'wyrm'], '🐲'),
    ...generateVariations(['wolf', 'wolves', 'werewolf'], '🐺'),
    ...generateVariations(['hamster', 'gerbil'], '🐹'),
    ...generateVariations(['unicorn', 'mythical horse'], '🦄'),
    ...generateVariations(['eagle', 'hawk', 'falcon', 'raptor'], '🦅'),
    ...generateVariations(['duck', 'duckling', 'mallard', 'waterfowl'], '🦆'),
    ...generateVariations(['owl', 'night bird'], '🦉'),
    ...generateVariations(['bat', 'flying fox'], '🦇'),
    ...generateVariations(['shark', 'great white', 'jaws'], '🦈'),
    ...generateVariations(['rhinoceros', 'rhino'], '🦏'),
    ...generateVariations(['hedgehog', 'porcupine'], '🦔'),
    
    // Countries and Nationalities
    ...generateVariations(['United States', 'USA', 'U.S.A.', 'U.S.', 'United States of America', 'America', 'american', 'americans'], '🇺🇸'),
    ...generateVariations(['United Kingdom', 'UK', 'U.K.', 'Britain', 'Great Britain', 'british', 'briton', 'britons', 'england', 'english', 'scotland', 'scottish', 'wales', 'welsh'], '🇬🇧'),
    ...generateVariations(['france', 'french', 'paris', 'Paris', 'frenchman', 'frenchwoman', 'parisian'], '🇫🇷'),
    ...generateVariations(['germany', 'german', 'berlin', 'germans', 'deutschland', 'bavarian', 'prussian'], '🇩🇪'),
    ...generateVariations(['japan', 'japanese', 'tokyo', 'nippon', 'nihon', 'kyoto', 'osaka'], '🇯🇵'),
    ...generateVariations(['india', 'indian', 'delhi', 'hindustan', 'hindustani', 'mumbai', 'bangalore', 'kolkata'], '🇮🇳'),
    ...generateVariations(['china', 'chinese', 'beijing', 'shanghai', 'mandarin', 'cantonese'], '🇨🇳'),
    ...generateVariations(['canada', 'canadian', 'ottawa', 'toronto', 'vancouver', 'montreal'], '🇨🇦'),
    ...generateVariations(['australia', 'australian', 'aussie', 'sydney', 'melbourne', 'canberra'], '🇦🇺'),
    ...generateVariations(['italy', 'italian', 'rome', 'roman', 'milan', 'florence', 'venetian'], '🇮🇹'),
    ...generateVariations(['spain', 'spanish', 'madrid', 'barcelona', 'castilian'], '🇪🇸'),
    ...generateVariations(['russia', 'russian', 'moscow', 'petersburg', 'muscovite'], '🇷🇺'),
    ...generateVariations(['brazil', 'brazilian', 'brasilia', 'rio', 'sao paulo'], '🇧🇷'),
    ...generateVariations(['mexico', 'mexican', 'mexicano', 'mexicana', 'ciudad de mexico'], '🇲🇽'),
    ...generateVariations(['ireland', 'irish', 'dublin', 'galway', 'cork'], '🇮🇪'),
    ...generateVariations(['netherlands', 'dutch', 'holland', 'amsterdam', 'rotterdam'], '🇳🇱'),
    ...generateVariations(['sweden', 'swedish', 'stockholm', 'gothenburg'], '🇸🇪'),
    ...generateVariations(['norway', 'norwegian', 'oslo', 'bergen'], '🇳🇴'),
    ...generateVariations(['denmark', 'danish', 'copenhagen', 'aarhus'], '🇩🇰'),
    ...generateVariations(['finland', 'finnish', 'helsinki', 'espoo'], '🇫🇮'),
    ...generateVariations(['poland', 'polish', 'warsaw', 'krakow'], '🇵🇱'),
    ...generateVariations(['greece', 'greek', 'athens', 'thessaloniki'], '🇬🇷'),
    ...generateVariations(['turkey', 'turkish', 'istanbul', 'ankara'], '🇹🇷'),
    ...generateVariations(['egypt', 'egyptian', 'cairo', 'alexandria'], '🇪🇬'),
    ...generateVariations(['south korea', 'korean', 'seoul', 'busan'], '🇰🇷'),
    ...generateVariations(['switzerland', 'swiss', 'zurich', 'geneva', 'bern'], '🇨🇭'),
    ...generateVariations(['portugal', 'portuguese', 'lisbon', 'porto'], '🇵🇹'),
    ...generateVariations(['austria', 'austrian', 'vienna', 'salzburg'], '🇦🇹'),
    ...generateVariations(['new zealand', 'kiwi', 'wellington', 'auckland'], '🇳🇿'),
    ...generateVariations(['singapore', 'singaporean'], '🇸🇬'),
    ...generateVariations(['south africa', 'south african', 'pretoria', 'johannesburg', 'cape town'], '🇿🇦'),
    ...generateVariations(['nigeria', 'nigerian', 'lagos', 'abuja'], '🇳🇬'),
    ...generateVariations(['kenya', 'kenyan', 'nairobi', 'mombasa'], '🇰🇪'),
    ...generateVariations(['ghana', 'ghanaian', 'accra', 'kumasi'], '🇬🇭'),
    ...generateVariations(['ethiopia', 'ethiopian', 'addis ababa'], '🇪🇹'),
    ...generateVariations(['morocco', 'moroccan', 'rabat', 'casablanca'], '🇲🇦'),
    ...generateVariations(['senegal', 'senegalese', 'dakar'], '🇸🇳'),
    ...generateVariations(['tanzania', 'tanzanian', 'dodoma', 'dar es salaam'], '🇹🇿'),
    ...generateVariations(['argentina', 'argentinian', 'buenos aires', 'cordoba'], '🇦🇷'),
    ...generateVariations(['colombia', 'colombian', 'bogota', 'medellin'], '🇨🇴'),
    ...generateVariations(['chile', 'chilean', 'santiago', 'valparaiso'], '🇨🇱'),
    ...generateVariations(['peru', 'peruvian', 'lima', 'cusco'], '🇵🇪'),
    ...generateVariations(['venezuela', 'venezuelan', 'caracas', 'maracaibo'], '🇻🇪'),
    ...generateVariations(['uruguay', 'uruguayan', 'montevideo'], '🇺🇾'),
    ...generateVariations(['ecuador', 'ecuadorian', 'quito', 'guayaquil'], '🇪🇨'),
    ...generateVariations(['bolivia', 'bolivian', 'la paz', 'santa cruz'], '🇧🇴'),
    ...generateVariations(['dominican republic', 'dominican', 'santo domingo', 'punta cana'], '🇩🇴'),
    ...generateVariations(['puerto rico', 'puerto rican', 'san juan', 'ponce'], '🇵🇷'),
    ...generateVariations(['haiti', 'haitian', 'port-au-prince', 'cap-haitien'], '🇭🇹'),
    ...generateVariations(['jamaica', 'jamaican', 'kingston', 'montego bay'], '🇯🇲'),
    ...generateVariations(['bahamas', 'bahamian', 'nassau', 'freeport'], '🇧🇸'),
    
    // Emotions and Expressions
    ...generateVariations(['happy', 'joy', 'joyful', 'glad', 'pleased', 'delighted', 'cheerful', 'content'], '😊'),
    ...generateVariations(['sad', 'unhappy', 'crying', 'weeping', 'tears', 'depressed', 'heartbroken', 'miserable'], '😢'),
    ...generateVariations(['laugh', 'laughing', 'lol', 'haha', 'hilarious', 'rofl', 'lmao', 'giggling'], '😂'),
    ...generateVariations(['love', 'loving', 'adore', 'adoring', 'smitten', 'infatuated', 'cherish'], '❤️'),
    ...generateVariations(['excited', 'yay', 'woot', 'thrilled', 'ecstatic', 'pumped', 'stoked'], '🤩'),
    ...generateVariations(['angry', 'mad', 'furious', 'enraged', 'irate', 'livid', 'outraged'], '😡'),
    ...generateVariations(['scared', 'fear', 'terrified', 'frightened', 'petrified', 'horrified', 'anxious'], '😱'),
    ...generateVariations(['sleepy', 'tired', 'yawn', 'exhausted', 'drowsy', 'fatigued'], '😴'),
    ...generateVariations(['surprised', 'shock', 'shocked', 'astonished', 'amazed', 'stunned', 'startled'], '😲'),
    ...generateVariations(['thinking', 'pondering', 'contemplating', 'wondering', 'musing', 'reflecting'], '🤔'),
    ...generateVariations(['confused', 'confusion', 'puzzled', 'perplexed', 'baffled', 'bewildered'], '😕'),
    ...generateVariations(['sick', 'ill', 'unwell', 'nauseous', 'queasy', 'diseased'], '🤢'),
    ...generateVariations(['proud', 'accomplished', 'triumphant', 'satisfied'], '😌'),
    ...generateVariations(['embarrassed', 'ashamed', 'mortified', 'humiliated'], '😳'),
    ...generateVariations(['nervous', 'worried', 'concerned', 'uneasy', 'apprehensive'], '😰'),
    ...generateVariations(['cool', 'awesome', 'amazing', 'fantastic', 'rad'], '😎'),
    ...generateVariations(['silly', 'goofy', 'playful', 'wacky', 'foolish'], '🤪'),
    ...generateVariations(['skeptical', 'doubtful', 'suspicious', 'disbelieving'], '🤨'),
    ...generateVariations(['annoyed', 'irritated', 'frustrated', 'exasperated'], '😤'),
    ...generateVariations(['peaceful', 'calm', 'relaxed', 'serene', 'tranquil'], '😌'),
    ...generateVariations(['flirty', 'playful', 'teasing', 'coy'], '😏'),
    ...generateVariations(['disappointed', 'let down', 'disheartened', 'crestfallen'], '😞'),
    ...generateVariations(['hopeful', 'optimistic', 'eager', 'anticipating'], '🤗'),
    ...generateVariations(['bored', 'uninterested', 'dull', 'tedious'], '😑'),
    
    // Weather and Nature
    ...generateVariations(['rain', 'raining', 'rainy', 'rainfall', 'drizzle', 'downpour'], '🌧️'),
    ...generateVariations(['snow', 'snowing', 'snowy', 'snowfall', 'blizzard', 'flurry'], '❄️'),
    ...generateVariations(['storm', 'lightning', 'thunder', 'thunderstorm', 'tempest'], '⛈️'),
    ...generateVariations(['cloudy', 'clouds', 'overcast', 'gloomy'], '☁️'),
    ...generateVariations(['sunny', 'sun', 'sunshine', 'sunlight', 'bright'], '☀️'),
    ...generateVariations(['rainbow', 'multicolored', 'spectrum'], '🌈'),
    ...generateVariations(['leaf', 'leaves', 'tree', 'forest', 'woods', 'woodland'], '🌳'),
    ...generateVariations(['flower', 'flowers', 'blossom', 'bloom', 'floral', 'bouquet'], '🌸'),
    ...generateVariations(['mountain', 'mountains', 'peak', 'summit', 'alps', 'highland'], '⛰️'),
    ...generateVariations(['fire', 'flame', 'burn', 'blaze', 'inferno'], '🔥'),
    ...generateVariations(['ocean', 'sea', 'waves', 'tide', 'surf', 'marine'], '🌊'),
    ...generateVariations(['moon', 'lunar', 'crescent', 'nightsky'], '🌙'),
    ...generateVariations(['star', 'stars', 'starry', 'constellation'], '⭐'),
    ...generateVariations(['tornado', 'cyclone', 'twister', 'windstorm'], '🌪️'),
    ...generateVariations(['fog', 'foggy', 'mist', 'misty', 'haze', 'hazy'], '🌫️'),
    ...generateVariations(['wind', 'windy', 'breeze', 'gust', 'draft'], '💨'),
    ...generateVariations(['comet', 'meteor', 'shooting star'], '☄️'),
    ...generateVariations(['sunrise', 'dawn', 'daybreak', 'morning'], '🌅'),
    ...generateVariations(['sunset', 'dusk', 'twilight', 'evening'], '🌇'),
    ...generateVariations(['desert', 'arid', 'sand', 'dune', 'cactus'], '🏜️'),
    ...generateVariations(['volcano', 'volcanic', 'eruption', 'lava'], '🌋'),
    ...generateVariations(['palm', 'palm tree', 'tropical', 'beach tree'], '🌴'),
    ...generateVariations(['seedling', 'sprout', 'sapling', 'growing plant'], '🌱'),
    ...generateVariations(['herb', 'herbs', 'plant', 'greenery'], '🌿'),
    ...generateVariations(['shamrock', 'clover', 'lucky', 'irish'], '☘️'),
    
    // Food and Drink
    ...generateVariations(['pizza', 'pizzas'], '🍕'),
    ...generateVariations(['hamburger', 'burger', 'cheeseburger', 'beef burger'], '🍔'),
    ...generateVariations(['ice cream', 'icecream', 'gelato', 'soft serve'], '🍦'),
    ...generateVariations(['coffee', 'latte', 'espresso', 'cappuccino', 'mocha'], '☕'),
    ...generateVariations(['tea', 'green tea', 'black tea', 'herbal tea', 'chai'], '🍵'),
    ...generateVariations(['apple', 'apples', 'red apple', 'green apple'], '🍎'),
    ...generateVariations(['banana', 'bananas', 'plantain'], '🍌'), 
    ...generateVariations(['grape', 'grapes', 'raisins', 'vineyard'], '🍇'),
    ...generateVariations(['bread', 'loaf', 'baguette', 'toast', 'roll'], '🍞'),
    ...generateVariations(['cake', 'dessert', 'pastry', 'sweet', 'birthday cake'], '🍰'),
    ...generateVariations(['donut', 'doughnut', 'cruller', 'pastry'], '🍩'),
    ...generateVariations(['beer', 'ale', 'brew', 'lager', 'stout', 'pilsner'], '🍺'),
    ...generateVariations(['wine', 'vine', 'merlot', 'champagne', 'prosecco', 'rosé'], '🍷'),
    ...generateVariations(['sushi', 'sashimi', 'rolls', 'maki', 'nigiri'], '🍣'),
    ...generateVariations(['ramen', 'noodles', 'soup', 'pho', 'udon', 'soba'], '🍜'),
    ...generateVariations(['taco', 'tacos', 'burrito', 'mexican', 'enchilada'], '🌮'),
    ...generateVariations(['sandwich', 'sub', 'hoagie', 'panini', 'grinder'], '🥪'),
    ...generateVariations(['salad', 'greens', 'vegetables', 'lettuce', 'garden salad'], '🥗'),
    ...generateVariations(['popcorn', 'movie snack', 'kernels', 'snack'], '🍿'),
    ...generateVariations(['cookie', 'cookies', 'biscuit', 'shortbread'], '🍪'),
    ...generateVariations(['chocolate', 'candy', 'sweets', 'truffle', 'bonbon'], '🍫'),
    ...generateVariations(['pancakes', 'waffles', 'flapjacks', 'syrup', 'crepes'], '🥞'),
    ...generateVariations(['egg', 'eggs', 'omelette', 'scrambled', 'poached'], '🥚'),
    ...generateVariations(['milk', 'dairy', 'cream', 'yogurt', 'kefir'], '🥛'),
    ...generateVariations(['orange', 'citrus', 'tangerine', 'mandarin', 'clementine'], '🍊'),
    ...generateVariations(['watermelon', 'melon', 'honeydew', 'cantaloupe'], '🍉'),
    ...generateVariations(['peach', 'nectarine', 'apricot'], '🍑'),
    ...generateVariations(['pear', 'fruit', 'asian pear'], '🍐'),
    ...generateVariations(['pineapple', 'tropical fruit', 'ananas'], '🍍'),
    ...generateVariations(['strawberry', 'berry', 'berries', 'raspberry', 'blackberry'], '🍓'),
    ...generateVariations(['corn', 'maize', 'cornstalk', 'sweetcorn'], '🌽'),
    ...generateVariations(['hot pepper', 'chili', 'spicy', 'jalapeno', 'habanero'], '🌶️'),
    ...generateVariations(['cocktail', 'mixed drink', 'martini', 'margarita'], '🍸'),
    ...generateVariations(['tropical drink', 'smoothie', 'juice', 'punch', 'mocktail'], '🍹'),
    ...generateVariations(['rice', 'bowl', 'grain', 'risotto', 'pilaf'], '🍚'),
    ...generateVariations(['curry', 'stew', 'sauce', 'gravy', 'broth'], '🍛'),
    ...generateVariations(['french fries', 'fries', 'chips', 'wedges', 'potato'], '🍟'),
    ...generateVariations(['meat', 'steak', 'beef', 'pork', 'lamb', 'veal'], '🥩'),
    ...generateVariations(['chicken', 'poultry', 'drumstick', 'turkey', 'fowl'], '🍗'),
    ...generateVariations(['shrimp', 'prawn', 'seafood', 'crab', 'lobster'], '🍤'),
    ...generateVariations(['avocado', 'guacamole', 'avo'], '🥑'),
    ...generateVariations(['broccoli', 'vegetable', 'greens'], '🥦'),
    ...generateVariations(['cucumber', 'pickle', 'gherkin'], '🥒'),
    ...generateVariations(['carrot', 'carrots', 'root vegetable'], '🥕'),
    ...generateVariations(['potato', 'spud', 'tater'], '🥔'),
    ...generateVariations(['tomato', 'tomatoes', 'cherry tomato'], '🍅'),
    ...generateVariations(['coconut', 'coco', 'tropical'], '🥥'),
    ...generateVariations(['kiwi', 'kiwifruit', 'chinese gooseberry'], '🥝'),
    ...generateVariations(['mango', 'tropical fruit', 'stone fruit'], '🥭'),
    ...generateVariations(['garlic', 'garlic bulb', 'allium'], '🧄'),
    ...generateVariations(['onion', 'shallot', 'scallion'], '🧅'),
    ...generateVariations(['mushroom', 'fungi', 'toadstool'], '🍄'),
    ...generateVariations(['olive', 'olives', 'mediterranean'], '🫒'),
    ...generateVariations(['bell pepper', 'capsicum', 'sweet pepper'], '🫑'),
    ...generateVariations(['blueberry', 'berry', 'berries'], '🫐'),
    ...generateVariations(['soda', 'pop', 'soft drink', 'cola'], '🥤'),
    ...generateVariations(['whiskey', 'bourbon', 'scotch'], '🥃'),
    ...generateVariations(['bagel', 'roll', 'bread roll'], '🥯'),
    ...generateVariations(['lemon', 'citrus', 'sour fruit'], '🍋'),
    ...generateVariations(['croissant', 'pastry', 'crescent'], '🥐'),
    ...generateVariations(['baguette', 'french bread', 'bread stick'], '🥖'),
    ...generateVariations(['pretzel', 'twisted bread', 'salty snack'], '🥨'),
    ...generateVariations(['cheese', 'cheddar', 'swiss', 'dairy'], '🧀'),
    ...generateVariations(['butter', 'margarine', 'spread'], '🧈'),
    ...generateVariations(['peanut', 'groundnut', 'legume'], '🥜'),
    ...generateVariations(['chestnut', 'nut', 'roasted nut'], '🌰'),
    ...generateVariations(['honey', 'honeypot', 'sweetener'], '🍯'),
    ...generateVariations(['milk bottle', 'dairy drink', 'beverage'], '🍼'),
    ...generateVariations(['baby bottle', 'formula', 'infant food'], '🍼'),
    ...generateVariations(['fish', 'seafood', 'marine food'], '🐟'),
    ...generateVariations(['oyster', 'shellfish', 'clam', 'mussel'], '🦪'),
    ...generateVariations(['dumpling', 'potsticker', 'gyoza', 'dim sum'], '🥟'),
    ...generateVariations(['fortune cookie', 'chinese cookie', 'luck cookie'], '🥠'),
    ...generateVariations(['takeout box', 'chinese food', 'to-go box'], '🥡'),
    ...generateVariations(['moon cake', 'chinese pastry', 'festival food'], '🥮'),
    ...generateVariations(['pie', 'tart', 'baked dessert'], '🥧'),
    ...generateVariations(['falafel', 'chickpea balls', 'middle eastern'], '🧆'),
    ...generateVariations(['waffle', 'belgian waffle', 'grid cake'], '🧇'),
    ...generateVariations(['fondue', 'melted cheese', 'chocolate pot'], '🫕'),
    ...generateVariations(['tamale', 'mexican food', 'corn dish'], '🫔'),
    ...generateVariations(['beans', 'legumes', 'pulses'], '🫘'),
    ...generateVariations(['ginger root', 'ginger', 'spice'], '🫚'),
    ...generateVariations(['pea pod', 'green peas', 'snap pea'], '🫛'),
    ...generateVariations(['steak', 'beef steak', 'meat'], '🥩'),
    
    // Objects
    ...generateVariations(['phone', 'telephone', 'mobile', 'smartphone'], '📱'),
    ...generateVariations(['computer', 'pc', 'laptop'], '💻'),
    ...generateVariations(['book', 'novel', 'textbook'], '📖'),
    ...generateVariations(['car', 'automobile'], '🚗'),
    ...generateVariations(['bicycle', 'bike'], '🚲'),
    ...generateVariations(['train', 'locomotive'], '🚂'),
    ...generateVariations(['rocket', 'spaceship'], '🚀'),
    ...generateVariations(['balloon'], '🎈'),
    ...generateVariations(['gift', 'present'], '🎁'),
    ...generateVariations(['camera', 'photo', 'photograph'], '📷'),
    ...generateVariations(['key', 'keys'], '🔑'),
    ...generateVariations(['clock', 'watch', 'time'], '⏰'),
    ...generateVariations(['television', 'tv', 'monitor', 'screen'], '📺'),
    ...generateVariations(['radio', 'stereo', 'boombox'], '📻'),
    ...generateVariations(['microphone', 'mic'], '🎤'),
    ...generateVariations(['headphones', 'earphones', 'headset'], '🎧'),
    ...generateVariations(['guitar', 'acoustic'], '🎸'),
    ...generateVariations(['piano', 'keyboard'], '🎹'),
    ...generateVariations(['drum', 'drums', 'percussion'], '🥁'),
    ...generateVariations(['violin', 'fiddle'], '🎻'),
    ...generateVariations(['umbrella', 'parasol'], '☔'),
    ...generateVariations(['briefcase', 'suitcase', 'bag'], '💼'),
    ...generateVariations(['backpack', 'rucksack'], '🎒'),
    ...generateVariations(['purse', 'handbag'], '👜'),
    ...generateVariations(['crown', 'tiara', 'diadem'], '👑'),
    ...generateVariations(['glasses', 'spectacles', 'eyewear'], '👓'),
    ...generateVariations(['sunglasses', 'shades'], '🕶️'),
    ...generateVariations(['hammer', 'tool'], '🔨'),
    ...generateVariations(['wrench', 'spanner'], '🔧'),
    ...generateVariations(['screwdriver', 'tool'], '🪛'),
    ...generateVariations(['scissors', 'shears'], '✂️'),
    ...generateVariations(['lock', 'padlock'], '🔒'),
    ...generateVariations(['bell', 'chime'], '🔔'),
    ...generateVariations(['candle', 'wax'], '🕯️'),
    ...generateVariations(['flashlight', 'torch'], '🔦'),
    ...generateVariations(['battery', 'batteries'], '🔋'),
    ...generateVariations(['plug', 'socket', 'outlet'], '🔌'),
    ...generateVariations(['magnet', 'magnetic'], '🧲'),
    ...generateVariations(['microscope', 'lens'], '🔬'),
    ...generateVariations(['telescope', 'scope'], '🔭'),
    ...generateVariations(['compass', 'direction'], '🧭'),
    ...generateVariations(['map', 'atlas'], '🗺️'),
    ...generateVariations(['calendar', 'schedule'], '📅'),
    ...generateVariations(['pencil', 'pen', 'writing'], '✏️'),
    ...generateVariations(['paintbrush', 'brush'], '🖌️'),
    ...generateVariations(['crayon', 'coloring'], '🖍️'),
    ...generateVariations(['paperclip', 'clip'], '📎'),
    ...generateVariations(['ruler', 'measure'], '📏'),
    ...generateVariations(['envelope', 'mail', 'letter'], '✉️'),
    ...generateVariations(['newspaper', 'news', 'paper'], '📰'),
    ...generateVariations(['trophy', 'award', 'prize'], '🏆'),
    ...generateVariations(['medal', 'medallion'], '🏅'),

    // Professions and Occupations
    ...generateVariations(['doctor', 'physician', 'nurse', 'medic'], '👩‍⚕️'),
    ...generateVariations(['teacher', 'professor', 'instructor', 'educator'], '👩‍🏫'),
    ...generateVariations(['police', 'cop', 'officer', 'detective'], '👮‍♂️'),
    ...generateVariations(['firefighter', 'fireman', 'fire fighter'], '👨‍🚒'),
    ...generateVariations(['artist', 'painter', 'illustrator'], '👩‍🎨'),
    ...generateVariations(['chef', 'cook', 'baker', 'culinary'], '👨‍🍳'),
    ...generateVariations(['scientist', 'researcher', 'chemist', 'biologist'], '👩‍🔬'),
    ...generateVariations(['pilot', 'aviator', 'captain'], '👩‍✈️'),
    ...generateVariations(['lawyer', 'attorney', 'judge', 'counsel'], '⚖️'),
    ...generateVariations(['engineer', 'developer', 'programmer'], '👩‍💻'),
    ...generateVariations(['mechanic', 'technician', 'repairman'], '👨‍🔧'),
    ...generateVariations(['farmer', 'gardener', 'agriculturist'], '👨‍🌾'),
    ...generateVariations(['astronaut', 'cosmonaut', 'spaceman'], '👨‍🚀'),
    ...generateVariations(['construction', 'builder', 'contractor'], '👷'),
    ...generateVariations(['dentist', 'orthodontist'], '🦷'),
    ...generateVariations(['journalist', 'reporter', 'writer'], '📰'),
    ...generateVariations(['musician', 'composer', 'conductor'], '👨‍🎤'),
    ...generateVariations(['photographer', 'cameraman'], '📸'),
    ...generateVariations(['electrician', 'electrical worker'], '⚡'),
    ...generateVariations(['plumber', 'pipe fitter'], '🔧'),
    ...generateVariations(['veterinarian', 'vet', 'animal doctor'], '🐾'),
    ...generateVariations(['architect', 'designer'], '📐'),
    ...generateVariations(['accountant', 'bookkeeper', 'auditor'], '📊'),
    ...generateVariations(['barber', 'hairdresser', 'stylist'], '💇'),
    ...generateVariations(['waiter', 'waitress', 'server'], '🍽️'),
    
    // Sports and Activities
    ...generateVariations(['football', 'soccer'], '⚽'),
    ...generateVariations(['basketball', 'hoops'], '🏀'),
    ...generateVariations(['baseball'], '⚾'),
    ...generateVariations(['tennis', 'racket'], '🎾'),
    ...generateVariations(['volleyball'], '🏐'),
    ...generateVariations(['rugby', 'football'], '🏉'),
    ...generateVariations(['badminton', 'shuttlecock'], '🏸'),
    ...generateVariations(['hockey', 'puck'], '🏒'),
    ...generateVariations(['cricket', 'wicket'], '🏏'),
    ...generateVariations(['ping pong', 'table tennis', 'paddle'], '🏓'),
    ...generateVariations(['boxing', 'fight', 'boxer'], '🥊'),
    ...generateVariations(['martial arts', 'karate', 'judo'], '🥋'),
    ...generateVariations(['skateboard', 'skating'], '🛹'),
    ...generateVariations(['surfing', 'surfer', 'surf'], '🏄'),
    ...generateVariations(['swimming', 'swimmer'], '🏊'),
    ...generateVariations(['skiing', 'ski'], '⛷️'),
    ...generateVariations(['snowboarding', 'snowboard'], '🏂'),
    ...generateVariations(['golfing', 'golf'], '⛳'),
    ...generateVariations(['wrestling', 'wrestler'], '🤼'),
    ...generateVariations(['gymnastics', 'gymnast'], '🤸'),
    ...generateVariations(['weightlifting', 'lifting'], '🏋️'),
    ...generateVariations(['cycling', 'biking', 'bicycle'], '🚴'),
    ...generateVariations(['running', 'jogging', 'sprint'], '🏃'),
    ...generateVariations(['hiking', 'trekking', 'hike'], '🥾'),
    ...generateVariations(['climbing', 'rock climbing'], '🧗'),
    ...generateVariations(['bowling', 'bowl'], '🎳'),
    ...generateVariations(['archery', 'bow and arrow'], '🏹'),
    ...generateVariations(['fishing', 'angling'], '🎣'),
    ...generateVariations(['horse riding', 'equestrian'], '🏇'),
    
    // Transportation
    ...generateVariations(['car', 'auto', 'automobile'], '🚗'),
    ...generateVariations(['taxi', 'cab'], '🚕'),
    ...generateVariations(['police car', 'cop car', 'patrol car'], '🚓'),
    ...generateVariations(['ambulance', 'emergency vehicle'], '🚑'),
    ...generateVariations(['fire truck', 'fire engine'], '🚒'),
    ...generateVariations(['bus', 'coach'], '🚌'),
    ...generateVariations(['trolleybus', 'trolley'], '🚎'),
    ...generateVariations(['minibus', 'shuttle'], '🚐'),
    ...generateVariations(['truck', 'lorry'], '🚛'),
    ...generateVariations(['delivery truck', 'delivery van'], '🚚'),
    ...generateVariations(['tractor', 'farm vehicle'], '🚜'),
    ...generateVariations(['motorcycle', 'motorbike', 'bike'], '🏍️'),
    ...generateVariations(['scooter', 'moped'], '🛵'),
    ...generateVariations(['bicycle', 'bike', 'pedal bike'], '🚲'),
    ...generateVariations(['plane', 'airplane', 'aircraft'], '✈️'),
    ...generateVariations(['small plane', 'private plane'], '🛩️'),
    ...generateVariations(['helicopter', 'chopper'], '🚁'),
    ...generateVariations(['rocket', 'spacecraft'], '🚀'),
    ...generateVariations(['satellite', 'space satellite'], '🛰️'),
    ...generateVariations(['boat', 'ship', 'vessel'], '🚢'),
    ...generateVariations(['speedboat', 'motorboat'], '🚤'),
    ...generateVariations(['sailboat', 'sailing ship'], '⛵'),
    ...generateVariations(['canoe', 'kayak'], '🛶'),
    ...generateVariations(['train', 'locomotive'], '🚂'),
    ...generateVariations(['bullet train', 'high speed train'], '🚅'),
    ...generateVariations(['metro', 'subway', 'underground'], '🚇'),
    ...generateVariations(['tram', 'streetcar'], '🚊'),
    ...generateVariations(['monorail', 'rail'], '🚝'),
    ...generateVariations(['cable car', 'aerial tramway'], '🚠'),
    ...generateVariations(['ski lift', 'chair lift'], '🚡'),
    
    // Time and Events
    ...generateVariations(['birthday', 'bday'], '🎂'),
    ...generateVariations(['christmas', 'xmas'], '🎄'),
    ...generateVariations(['new year', 'nye'], '🎆'),
    ...generateVariations(['halloween', 'spooky'], '🎃'),
    ...generateVariations(['valentine', 'valentines'], '💝'),
    ...generateVariations(['easter'], '🐰'),
    ...generateVariations(['graduation', 'grad'], '🎓'),
    ...generateVariations(['wedding', 'marriage'], '💒'),
    ...generateVariations(['anniversary'], '💑'),
    ...generateVariations(['party', 'celebration'], '🎉'),
    ...generateVariations(['festival', 'fest'], '🎪'),
    ...generateVariations(['concert', 'performance'], '🎭'),
    ...generateVariations(['vacation', 'holiday'], '🏖️'),
    ...generateVariations(['morning', 'sunrise', 'dawn'], '🌅'),
    ...generateVariations(['evening', 'sunset', 'dusk'], '🌇'),
    ...generateVariations(['night', 'nighttime'], '🌙'),
    ...generateVariations(['weekend', 'weekends'], '🎡'),
    ...generateVariations(['thanksgiving', 'turkey day'], '🦃'),
    ...generateVariations(['fireworks', 'celebration'], '🎇'),
    ...generateVariations(['parade', 'march'], '🎪'),
    
    // Gestures and Body Language
    ...generateVariations(['thumbs up', 'thumbsup'], '👍'),
    ...generateVariations(['thumbs down', 'thumbsdown'], '👎'),
    ...generateVariations(['clap', 'clapping', 'applause'], '👏'),
    ...generateVariations(['wave', 'waving', 'hello', 'hi', 'bye'], '👋'),
    ...generateVariations(['handshake', 'shake hands', 'deal'], '🤝'),
    ...generateVariations(['pray', 'praying', 'please', 'thanks'], '🙏'),
    ...generateVariations(['fist', 'fist bump', 'punch'], '👊'),
    ...generateVariations(['victory', 'peace'], '✌️'),
    ...generateVariations(['ok', 'okay', 'perfect'], '👌'),
    ...generateVariations(['point up', 'pointing up'], '☝️'),
    ...generateVariations(['point down', 'pointing down'], '👇'),
    ...generateVariations(['point left', 'pointing left'], '👈'),
    ...generateVariations(['point right', 'pointing right'], '👉'),
    ...generateVariations(['raised hand', 'high five'], '✋'),
    ...generateVariations(['flex', 'muscle', 'strong'], '💪'),
    ...generateVariations(['crossed fingers', 'luck', 'hopeful'], '🤞'),
    ...generateVariations(['pinching', 'small amount'], '🤏'),
    ...generateVariations(['shrug', 'dunno', 'whatever'], '🤷'),
    ...generateVariations(['facepalm', 'smh'], '🤦'),
    ...generateVariations(['raise hand', 'question', 'volunteer'], '🙋'),
    ...generateVariations(['bow', 'bowing', 'apologize'], '🙇'),
    ...generateVariations(['dance', 'dancing', 'celebration'], '💃'),
    ...generateVariations(['run', 'running', 'jog'], '🏃'),
    ...generateVariations(['walk', 'walking'], '🚶'),

    // Plants and Nature
    ...generateVariations(['plant', 'houseplant'], '🪴'),
    ...generateVariations(['tree', 'forest'], '🌲'),
    ...generateVariations(['palm tree', 'tropical'], '🌴'),
    ...generateVariations(['cactus', 'desert plant'], '🌵'),
    ...generateVariations(['flower', 'blossom'], '🌸'),
    ...generateVariations(['rose', 'roses'], '🌹'),
    ...generateVariations(['tulip', 'spring flower'], '🌷'),
    ...generateVariations(['sunflower', 'sun flower'], '🌻'),
    ...generateVariations(['herb', 'herbs'], '🌿'),
    ...generateVariations(['leaf', 'leaves'], '🍃'),
    ...generateVariations(['seedling', 'sprout'], '🌱'),
    ...generateVariations(['bamboo', 'zen'], '🎋'),
    ...generateVariations(['vine', 'vines'], '🌿'),
    ...generateVariations(['bouquet', 'flowers'], '💐'),
    ...generateVariations(['mushroom', 'toadstool'], '🍄'),

    // Eyes
    ...generateVariations(['eyes', 'looking'], '👀'),
    ...generateVariations(['eye', 'vision'], '👁️'),
    ...generateVariations(['rolling eyes', 'eye roll'], '🙄'),
    ...generateVariations(['winking', 'wink'], '😉'),
    ...generateVariations(['dizzy eyes', 'spiral eyes'], '😵‍💫'),
    ...generateVariations(['starry eyes', 'star struck'], '🤩'),
    ...generateVariations(['heart eyes', 'loving eyes'], '😍'),
    ...generateVariations(['smirking', 'smirk'], '😏'),
    ...generateVariations(['side eye', 'side glance'], '👁️'),
    ...generateVariations(['crying eyes', 'tears'], '😢'),

    // Family
    ...generateVariations(['family', 'relatives'], '👨‍👩‍👧‍👦'),
    ...generateVariations(['parents', 'mom and dad'], '👫'),
    ...generateVariations(['mother', 'mom'], '👩'),
    ...generateVariations(['father', 'dad'], '👨'),
    ...generateVariations(['baby', 'infant'], '👶'),
    ...generateVariations(['child', 'kid'], '🧒'),
    ...generateVariations(['grandmother', 'grandma'], '👵'),
    ...generateVariations(['grandfather', 'grandpa'], '👴'),
    ...generateVariations(['siblings', 'brother and sister'], '👧👦'),
    ...generateVariations(['pregnant', 'expecting'], '🤰'),

    // People
    ...generateVariations(['man', 'male', 'guy'], '👨'),
    ...generateVariations(['woman', 'female', 'lady'], '👩'),
    ...generateVariations(['husband', 'spouse'], '🤵'),
    ...generateVariations(['wife', 'bride'], '👰'),
    ...generateVariations(['boy', 'male child'], '👦'),
    ...generateVariations(['girl', 'female child'], '👧'),
    ...generateVariations(['adult', 'grown up'], '🧑'),
    ...generateVariations(['person', 'human'], '🧑'),
    ...generateVariations(['couple', 'pair'], '👫'),
    ...generateVariations(['partner', 'significant other'], '💑'),

    // Bathroom
    ...generateVariations(['bathroom', 'restroom', 'washroom'], '🚽'),
    ...generateVariations(['shower', 'showering'], '🚿'),
    ...generateVariations(['bathtub', 'bath'], '🛁'),
    ...generateVariations(['soap', 'wash'], '🧼'),
    ...generateVariations(['toilet paper', 'tp'], '🧻'),
    ...generateVariations(['poop', 'shit', 'crap'], '💩'),

    // Places
    ...generateVariations(['world', 'globe', 'earth'], '🌎'),
    ...generateVariations(['map', 'atlas'], '🗺️'),
    ...generateVariations(['japan', 'japanese'], '🗾'),
    ...generateVariations(['statue of liberty', 'new york'], '🗽'),
    ...generateVariations(['mount fuji', 'mountain'], '🗻'),
    ...generateVariations(['tokyo tower', 'tower'], '🗼'),
    ...generateVariations(['compass', 'direction'], '🧭'),
    ...generateVariations(['beach', 'seaside'], '🏖️'),
    ...generateVariations(['desert', 'sahara'], '🏜️'),
    ...generateVariations(['island', 'tropical island'], '🏝️'),
    ...generateVariations(['national park', 'park'], '🏞️'),
    ...generateVariations(['cityscape', 'city', 'skyline'], '🌆'),

    // Buildings and Structures
    ...generateVariations(['building', 'house', 'home', 'residence'], '🏠'),
    ...generateVariations(['office', 'workplace', 'corporate'], '🏢'),
    ...generateVariations(['school', 'university', 'college', 'campus', 'academy'], '🏫'),
    ...generateVariations(['hospital', 'healthcare', 'clinic', 'medical'], '🏥'),
    ...generateVariations(['castle', 'palace', 'fortress'], '🏰'),
    ...generateVariations(['church', 'chapel', 'cathedral'], '⛪'),
    ...generateVariations(['factory', 'industrial', 'plant'], '🏭'),
    ...generateVariations(['post office', 'postal'], '🏤'),
    ...generateVariations(['hotel', 'motel', 'inn'], '🏨'),
    ...generateVariations(['bank', 'atm', 'financial'], '🏦'),
    ...generateVariations(['store', 'shop', 'retail', 'market'], '🏪'),
    ...generateVariations(['apartment', 'condo', 'flat'], '🏢'),
    ...generateVariations(['stadium', 'arena', 'coliseum'], '🏟️'),
    ...generateVariations(['museum', 'gallery', 'exhibit'], '🏛️'),
    ...generateVariations(['temple', 'shrine', 'worship'], '🏛️'),
    ...generateVariations(['theater', 'cinema', 'movies'], '🎭'),
    ...generateVariations(['library', 'bookstore'], '📚'),
    ...generateVariations(['garage', 'parking', 'carport'], '🅿️'),
    ...generateVariations(['warehouse', 'storage', 'depot'], '🏭'),
    ...generateVariations(['mall', 'shopping center'], '🏬'),

    // Punctuations, Symbols and Special Characters
    ...generateVariations(['copyright', 'copyright symbol'], '©️'),
    ...generateVariations(['registered trademark', 'trademark'], '®️'),
    ...generateVariations(['trademark', 'tm'], '™️'),
    ...generateVariations(['number', 'pound', 'hash'], '#️⃣'),
    ...generateVariations(['asterisk', 'star symbol'], '*️⃣'),
    ...generateVariations(['hundred', '100'], '💯'),
    ...generateVariations(['plus', 'positive'], '➕'),
    ...generateVariations(['minus', 'negative'], '➖'),
    ...generateVariations(['multiply', 'times'], '✖️'),
    ...generateVariations(['divide', 'division'], '➗'),
    ...generateVariations(['infinity', 'forever'], '♾️'),
    ...generateVariations(['exclamation', 'exclamation mark'], '❗'),
    ...generateVariations(['question', 'question mark'], '❓'),
    ...generateVariations(['dollar', 'dollars', 'usd'], '💲'),
    ...generateVariations(['euro', 'eur'], '€'),
    ...generateVariations(['pound', 'gbp'], '£'),
    ...generateVariations(['yen', 'jpy'], '¥'),
    ...generateVariations(['percent', 'percentage'], '%'),
    ...generateVariations(['check', 'checkmark', 'tick'], '✔️'),
    ...generateVariations(['cross', 'x mark', 'wrong'], '❌'),
]);

// Emoji processing functions - these need to be defined AFTER emojiMap
function getEmoji(word) {
    return emojiMap.get(word.toLowerCase()) || word;
}

// Process text with emoji function
function processTextWithEmojis(text) {
    const words = text.split(' ');
    return words.map(word => {
        const emoji = getEmoji(word);
        return emoji === word ? word : `${word} ${emoji}`;
    }).join(' ');
}

// Safely add emojis function
function safelyAddEmojis(text, isForDisplay = true) {
    if (!isForDisplay) return text;
    if (!text) return text;
    try {
        return processTextWithEmojis(text);
    } catch (error) {
        console.error('[EMOJI] Error processing emojis:', error);
        return text;
    }
}

// Random color function for subtitles
function getRandomColor() {
    const colors = [
        '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FFA500', '#800080', '#00FFFF',
        '#FFC0CB', '#FF1493', '#00BFFF', '#FFD700', '#008080', '#9400D3', '#DC143C',
        '#00FF7F', '#FF69B4', '#4B0082', '#F0E68C', '#ADD8E6', '#800000', '#008000',
        '#000080', '#FF4500', '#DA70D6', '#87CEEB', '#4682B4', '#FA8072', '#40E0D0',
        '#EE82EE', '#7FFF00', '#1E90FF', '#6495ED'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Return to Menu function
function returnToMenu() {
    console.log('returnToMenu triggered');

    // Tell server to stop
    socket.emit('stop-feed');

    // Immediately stop all audio
    for (const audio of activeAudioElements) {
        audio.pause();
        audio.src = '';
        audio.load();
    }
    activeAudioElements = [];

    // Clear everything else
    subtitleProcessor.clear();
    commentNumberDisplay.hideImmediate();
    redditPostDisplay.hide();
    timer.stop();
    timer.reset();
    timestampManager.clear();

    if (videoManager && videoManager.videoElement) {
        videoManager.videoElement.pause();
        videoManager.videoElement.src = '';
        videoManager.videoElement.load();
    }

    const videoSection = document.getElementById('videoSection');
    const mainMenu = document.getElementById('mainMenu');
    if (videoSection) videoSection.style.display = 'none';
    if (mainMenu) {
        mainMenu.style.display = 'block';
        mainMenu.classList.remove('fade-out');
        mainMenu.style.opacity = '1';
    }

    // Force page reload to ensure complete reset
    window.location.reload();
}

// Attach the returnToMenu function to the return button
document.addEventListener('DOMContentLoaded', () => {
    const returnBtn = document.getElementById('returnButton');
    if (returnBtn) {
        console.log('returnButton found!');
        returnBtn.addEventListener('click', returnToMenu);
    } else {
        console.error('returnButton not found in DOM');
    }
});

// Convert TimeString MM:SS to Total Number of Seconds function
function timeStringToSeconds(str) {
    const [mm, ss] = str.split(':').map(Number);
    return mm * 60 + ss;
}

// Show Download Notification function
function showNotification(message, type = 'success') {
    const successNotification = document.getElementById('successNotification');
    const errorNotification = document.getElementById('errorNotification');

    // Hide both first
    successNotification.style.display = 'none';
    errorNotification.style.display = 'none';

    if (type === 'success') {
        successNotification.textContent = message;
        successNotification.style.display = 'block';
    } else {
        errorNotification.textContent = message;
        errorNotification.style.display = 'block';
    }
}

// Hide Download Notification function
function hideNotifications() {
    document.getElementById('successNotification').style.display = 'none';
    document.getElementById('errorNotification').style.display = 'none';
}

// Classes for UI handling
class RedditPostDisplay {
    constructor() {
        this.container = document.querySelector('.reddit-screengrab');
        this.titleElement = this.container?.querySelector('.reddit-title');
        this.contentElement = this.container?.querySelector('.reddit-content');
        this.authorElement = this.container?.querySelector('.post-author');
        this.timeElement = this.container?.querySelector('.post-time');
    }

    show(post) {
        if (!this.container) return;
        
        // Process title and content with emojis
        this.titleElement.innerHTML = safelyAddEmojis(post.title, true);
        
        // Only process content if it exists
        const content = post.selftext || '';
        this.contentElement.innerHTML = safelyAddEmojis(content, true);
        
        // Keep author and time as is
        this.authorElement.textContent = `u/${post.author.name}`;
        this.timeElement.textContent = new Date(post.created_utc * 1000).toLocaleDateString();
        
        this.container.style.display = 'block';
        this.container.style.opacity = '1';
    }

    hide() {
        if (!this.container) return;
        this.container.style.display = 'none';
        this.container.style.opacity = '0';
    }
}

// Display Comment Number class
class CommentNumberDisplay {
    constructor() {
        this.container = document.querySelector('.comment-number');
    }

    showImmediate(number) {
        if (!this.container) return;
        this.container.textContent = number;
        this.container.style.display = 'block';
        this.container.style.opacity = '1';
    }

    hideImmediate() {
        if (!this.container) return;
        this.container.style.opacity = '0';
        this.container.style.display = 'none';
    }
}

// Subtitle Processor Class
class SubtitleProcessor {
    constructor() {
        this.container = document.querySelector('.subtitles');
        this.maxWordsPerSubtitle = 10; 
        this.lastUsedColors = new Set();
        this.currentChunks = [];
        this.currentIndex = 0;
        this.timer = null;
        this.wordDurationMs = 275; // Subtitle timing approximation
    }

    clear() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        if (!this.container) return;
        this.container.textContent = '';
        this.container.style.opacity = '0';
        this.container.style.display = 'none';
        this.lastUsedColors.clear();
        this.currentChunks = [];
        this.currentIndex = 0;
    }

    getUniqueRandomColor() {
        let color = getRandomColor();
        while (this.lastUsedColors.has(color) && this.lastUsedColors.size < 30) {
            color = getRandomColor();
        }
        this.lastUsedColors.add(color);
        if (this.lastUsedColors.size > 5) {
            // Remove one of the oldest colors if we have too many
            const firstUsed = this.lastUsedColors.values().next().value;
            this.lastUsedColors.delete(firstUsed);
        }
        return color;
    }

    processChunk(chunk) {
        const words = chunk.trim().split(' ');
        const processedWords = [];
        let wordCount = 0;
        let wordInterval = Math.floor(Math.random() * 3) + 3;

        for (const word of words) {
            const withEmoji = safelyAddEmojis(word, true);
            wordCount++;

            if (wordCount === wordInterval) {
                processedWords.push(`<span style="color: ${this.getUniqueRandomColor()}">${withEmoji}</span>`);
                wordCount = 0;
                wordInterval = Math.floor(Math.random() * 3) + 3;
            } else {
                processedWords.push(withEmoji);
            }
        }

        return processedWords.join(' ');
    }

    // This method splits the text into small word chunks of maxWordsPerSubtitle words each
    splitIntoChunks(text) {
        if (!text) return [];
        const words = text.split(/\s+/).filter(Boolean);
        const chunks = [];
        for (let i = 0; i < words.length; i += this.maxWordsPerSubtitle) {
            const chunkWords = words.slice(i, i + this.maxWordsPerSubtitle);
            if (chunkWords.length > 0) {
                chunks.push(chunkWords.join(' '));
            }
        }
        return chunks;
    }

    showText(text) {
        if (!this.container || !text) return;
        this.clear(); // Clear any previous subtitles

        // Split text into chunks
        this.currentChunks = this.splitIntoChunks(text);
        this.currentIndex = 0;

        // Start showing the chunks
        this.showNextChunk();
    }

    showNextChunk() {
        if (this.currentIndex >= this.currentChunks.length) {
            // All chunks shown, they will be cleared eventually when comment-reading-done is emitted
            return;
        }

        const chunk = this.currentChunks[this.currentIndex];
        this.container.innerHTML = `<div class="subtitle-sentence">${this.processChunk(chunk)}</div>`;
        this.container.style.display = 'block';
        this.container.style.opacity = '1';

        // Calculate how long to display this chunk
        const chunkWordsCount = chunk.split(' ').length;
        const displayTime = chunkWordsCount * this.wordDurationMs;

        this.currentIndex++;

        // Schedule the next chunk after this display time
        this.timer = setTimeout(() => {
            // Instead of clearing immediately, we can either keep the previous chunk until replaced
            // or fade it out before showing the next chunk. Let's just replace it immediately for simplicity.
            this.showNextChunk();
        }, displayTime);
    }
}

// Timer class for managing current time
class Timer {
    constructor() {
        this.timeElement = document.querySelector('.time-value');
        this.startTime = 0;
        this.isRunning = false;
        this.timerInterval = null;
    }

    start() {
        this.startTime = Date.now();
        this.isRunning = true;
        this.timerInterval = setInterval(() => this.updateTime(), 1000);
    }

    stop() {
        this.isRunning = false;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }

    reset() {
        this.stop();
        this.startTime = 0;
        this.updateDisplay('00:00');
    }

    updateTime() {
        if (!this.isRunning) return;
        const currentTime = Math.floor((Date.now() - this.startTime) / 1000);
        this.updateDisplay(this.formatTime(currentTime));
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }

    updateDisplay(timeString) {
        if (this.timeElement) {
            this.timeElement.textContent = timeString;
        }
    }

    getCurrentTimestamp() {
        if (!this.isRunning) return '00:00';
        const currentTime = Math.floor((Date.now() - this.startTime) / 1000);
        return this.formatTime(currentTime);
    }
}

// Timestamps Manager class
class TimestampManager {
    constructor() {
        this.timestampsList = document.getElementById('timestampsList');
        this.timestamps = [];
    }

    // Modified to accept commentNumber as an optional parameter.
    addTimestamp(type, postNumber, timestamp, commentNumber = null) {
        const entry = {
            type,
            postNumber,
            timestamp,
            commentNumber
        };
        this.timestamps.push(entry);
        this.updateDisplay();
    }

    updateDisplay() {
        if (!this.timestampsList) return;
        
        this.timestampsList.innerHTML = this.timestamps
            .map(entry => {
                if (entry.type === 'post') {
                    return `<div class="timestamp-entry">Post ${entry.postNumber} @ ${entry.timestamp}</div>`;
                } else if (entry.type === 'comment') {
                    return `<div class="timestamp-entry">Post ${entry.postNumber} - Comment ${entry.commentNumber} @ ${entry.timestamp}</div>`;
                } else {
                    return `<div class="timestamp-entry">${entry.type} ${entry.postNumber} @ ${entry.timestamp}</div>`;
                }
            })
            .join('');
    }

    clear() {
        this.timestamps = [];
        if (this.timestampsList) {
            this.timestampsList.innerHTML = '';
        }
    }
}

// Video Manager class
class VideoManager {
    constructor() {
        this.videoElement = document.getElementById('videoBackground');
        if (!this.videoElement) {
            console.error('No element found with id="videoBackground". Please ensure it exists in the HTML.');
        }

        // Create an off-DOM video element for preloading
        this.preloader = document.createElement('video');
        this.preloader.muted = true;
        this.preloader.playsinline = true;
        this.preloader.autoplay = false;
        this.preloader.preload = 'auto';

        // Handle when the preloader can play the next video
        this.preloader.oncanplay = () => {
            // Once preloader can play, switch main video instantly
            this.videoElement.src = this.preloader.src;
            this.videoElement.load();
            this.videoElement.play().catch(err => console.error('[VideoManager] Video playback error:', err));
        };
    }

    handleVideo(url) {
        console.log('[VideoManager] Preloading video:', url);
        if (!this.videoElement) return;

        // Start loading next video in the preloader
        this.preloader.src = url;
        this.preloader.load(); 
    }
}

// Constants
const redditPostDisplay = new RedditPostDisplay();
const commentNumberDisplay = new CommentNumberDisplay();
const subtitleProcessor = new SubtitleProcessor();
const videoManager = new VideoManager();
const timer = new Timer();
const timestampManager = new TimestampManager();

// Global Variables
let currentPostNumber = 0;
let currentCommentNumber = 0;

// Socket Handlers
socket.on('background-video', (videoUrl) => {
    videoManager.handleVideo(videoUrl);
    if (currentPostNumber === 0 && currentCommentNumber === 0) {
        timer.start();
        timestampManager.clear();
    }
});

socket.on('show-post', ({ title, content, author, timestamp, audioUrl }) => {
    currentPostNumber++;
    currentCommentNumber = 0;

    timestampManager.addTimestamp('post', currentPostNumber, timer.getCurrentTimestamp());

    redditPostDisplay.show({ 
        title, 
        selftext: content, 
        author: { name: author }, 
        created_utc: timestamp 
    });

    // Play the received audio
    if (audioUrl) {
        const audioElement = new Audio(audioUrl);
        audioElement.play().catch(err => console.error('Play error:', err));
        activeAudioElements.push(audioElement);
    }
});

socket.on('post-reading-done', () => {
    redditPostDisplay.hide();
});

socket.on('show-comment-number', ({ number, audioUrl }) => {
    commentNumberDisplay.showImmediate(number);

    // Play comment number audio
    if (audioUrl) {
        const audioElement = new Audio(audioUrl);
        audioElement.play().catch(err => console.error('Play error:', err));
        activeAudioElements.push(audioElement);
    }
});

socket.on('hide-number', () => {
    commentNumberDisplay.hideImmediate();
});

socket.on('start-comment-reading', ({ commentText, audioUrl }) => {
    currentCommentNumber++;
    timestampManager.addTimestamp(
        'comment',
        currentPostNumber,
        timer.getCurrentTimestamp(),
        currentCommentNumber
    );

    subtitleProcessor.clear();
    subtitleProcessor.showText(commentText);

    if (audioUrl) {
        const audioElement = new Audio(audioUrl);
        audioElement.play().catch(err => console.error('Play error:', err));
        activeAudioElements.push(audioElement);
    }
});

socket.on('comment-reading-done', () => {
    subtitleProcessor.clear();
});

socket.on('feed-complete', () => {
    subtitleProcessor.clear();
    commentNumberDisplay.hideImmediate();
    redditPostDisplay.hide();
    timer.stop();
    console.log('[FEED] Complete');
});

socket.on('error', ({ message }) => {
    console.error('[ERROR]', message);
});

// Main Menu Logic
document.querySelectorAll('.menu-item').forEach(item => {
    console.log('Menu items found and handler attached'); 
    
    item.addEventListener('click', () => {
        console.log('Menu item clicked!'); 
        
        const category = item.getAttribute('data-feed-category');
        console.log('Category selected:', category); 
        
        const mainMenu = document.getElementById('mainMenu');
        console.log('Main menu element:', mainMenu); 
        
        const videoSection = document.getElementById('videoSection');
        console.log('Video section element:', videoSection);
        
        if (category === 'exit') {
            console.log('Exit category selected');
            return;
        }
        
        if (category === 'custom') {
            console.log('Custom category selected');
            console.log('Hiding main menu...');
            mainMenu.style.display = 'none';
            
            const customUrls = document.getElementById('customUrls');
            console.log('Custom URLs section element:', customUrls);
            console.log('Showing custom URLs section...');
            customUrls.style.display = 'block';
            return;
        }
        
        // For all other categories
        console.log('Standard category selected, hiding main menu...');
        mainMenu.style.display = 'none';
        
        console.log('Showing video section...');
        videoSection.style.display = 'block';
        
        console.log('Emitting start-feed event with category:', category);
        socket.emit('start-feed', { category });
    });
});

// Custom URLs logic
let urlList = [];

document.getElementById('addUrlButton')?.addEventListener('click', () => {
    const input = document.getElementById('urlInput');
    const url = input.value.trim();
    if (url && urlList.length < 10) {
        urlList.push(url);
        updateUrlsList();
        input.value = '';
    }
});

function updateUrlsList() {
    const listElement = document.getElementById('urlsList');
    if (urlList.length === 0) {
        // Create an empty but properly styled container
        listElement.innerHTML = `
            <div class="url-item">
                <span class="url-number">1</span>
                <span class="url-text"></span>
                <span class="url-remove" data-index="0">×</span>
            </div>
        `;
    } else {
        listElement.innerHTML = urlList.map((url, index) => `
            <div class="url-item">
                <span class="url-number">${index + 1}</span>
                <span class="url-text">${url}</span>
                <span class="url-remove" data-index="${index}">×</span>
            </div>
        `).join('');
    }

    document.querySelectorAll('.url-remove').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            urlList.splice(index, 1);
            updateUrlsList();
        });
    });
}

document.getElementById('backButton')?.addEventListener('click', () => {
    document.getElementById('customUrls').style.display = 'none';
    const mainMenu = document.getElementById('mainMenu');
    mainMenu.style.display = 'block';
    urlList = [];
    updateUrlsList();
});

document.getElementById('generateFromUrlsButton')?.addEventListener('click', () => {
    if (urlList.length > 0) {
        document.getElementById('customUrls').style.display = 'none';
        document.getElementById('videoSection').style.display = 'block';
        socket.emit('start-feed', { category: 'custom', customUrls: urlList });
        urlList = [];
        updateUrlsList();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const returnBtn = document.getElementById('returnButton');
    if (returnBtn) {
        returnBtn.addEventListener('click', returnToMenu);
    } else {
        console.error('returnButton not found in DOM');
    }
});

// Download Button Logic
document.getElementById('downloadButton').addEventListener('click', async () => {
    const startTimeValue = document.getElementById('startTime').value; 
    const durationValue = document.getElementById('duration').value; 

    const startSeconds = timeStringToSeconds(startTimeValue);
    const durationSeconds = timeStringToSeconds(durationValue);

    // Seek the video to the start time
    const video = document.getElementById('videoBackground');
    video.currentTime = startSeconds;

    // Wait for seeking to finish
    video.onseeked = async () => {
        // Play the video so it's visible on screen
        await video.play();

        showNotification('Please select your browser tab in the upcoming prompt to record the video.', 'success');

        try {
            // Prompt the user to select what to share
            const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });

            const recorder = new MediaRecorder(displayStream);
            let chunks = [];

            recorder.ondataavailable = e => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'recorded_video.webm';
                a.click();
                URL.revokeObjectURL(url);

                showNotification('Recording complete! Downloading now...', 'success');
                setTimeout(hideNotifications, 3000);
            };

            recorder.start();
            showNotification('Recording in progress... Please do not close this tab.', 'success');

            // Stop after durationSeconds
            setTimeout(() => {
                recorder.stop();
            }, durationSeconds * 1000);

        } catch (err) {
            console.error('Error capturing display:', err);
            showNotification('Failed to capture screen. Please try again.', 'error');
        }
    };
});
