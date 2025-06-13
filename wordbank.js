// Year 5/6 National Curriculum Spelling Word Bank
// Organized by categories for easy management

const wordBank = {
    // Words with silent letters
    silentLetters: [
        'island', 'castle', 'listen', 'fasten', 'whistle', 
        'muscle', 'knight', 'write', 'knee', 'lamb', 
        'thumb', 'comb', 'debt', 'doubt', 'climb'
    ],

    // Words ending in -cious or -tious
    ciousTious: [
        'vicious', 'precious', 'conscious', 'delicious', 'spacious',
        'gracious', 'cautious', 'ambitious', 'nutritious', 'infectious',
        'suspicious', 'fictitious', 'superstitious'
    ],

    // Words ending in -cial or -tial
    cialTial: [
        'official', 'special', 'social', 'crucial', 'commercial',
        'essential', 'potential', 'partial', 'initial', 'martial',
        'spatial', 'substantial', 'residential'
    ],

    // Words with the /i:/ sound spelt 'ei' after 'c'
    eiAfterC: [
        'receive', 'deceive', 'conceive', 'perceive', 'ceiling',
        'receipt', 'deceit', 'conceit'
    ],

    // Words ending in -ant, -ance/-ancy, -ent, -ence/-ency
    antEnt: [
        'relevant', 'tolerant', 'observant', 'expectant', 'hesitant',
        'confident', 'incident', 'accident', 'excellent', 'frequent',
        'independence', 'correspondence', 'existence', 'persistence',
        'assistance', 'resistance', 'acceptance', 'appearance',
        'performance', 'ignorance', 'significance', 'tolerance',
        'audience', 'evidence', 'violence', 'silence'
    ],

    // Words ending in -able and -ible
    ableIble: [
        'adorable', 'applicable', 'considerable', 'tolerable', 'changeable',
        'noticeable', 'forcible', 'legible', 'credible', 'incredible',
        'edible', 'visible', 'terrible', 'horrible', 'possible',
        'responsible', 'sensible', 'defensible'
    ],

    // Words ending in -ably and -ibly
    ablyIbly: [
        'probably', 'adorably', 'considerably', 'changeably', 'noticeably',
        'forcibly', 'legibly', 'incredibly', 'possibly', 'terribly',
        'horribly', 'sensibly', 'responsibly'
    ],

    // Adding suffixes beginning with vowel letters to words ending in -fer
    fer: [
        'referring', 'referred', 'referral', 'preferring', 'preferred',
        'transferring', 'transferred', 'reference', 'preference',
        'transference', 'conference', 'interference'
    ],

    // Use of the hyphen
    hyphenated: [
        'co-ordinate', 're-enter', 're-examine', 'co-operate', 
        'co-own', 'ex-teacher', 'ex-president'
    ],

    // Dictation words
    dictation: [
        'achieve', 'aggressive', 'amateur', 'ancient', 'apparent',
        'appreciate', 'attached', 'available', 'average', 'awkward',
        'bargain', 'bruise', 'category', 'cemetery', 'committee',
        'communicate', 'community', 'competition', 'conscience', 'conscious',
        'controversy', 'convenience', 'correspond', 'criticise', 'curiosity',
        'definite', 'desperate', 'determined', 'develop', 'dictionary',
        'disastrous', 'embarrass', 'environment', 'equip', 'especially',
        'exaggerate', 'excellent', 'existence', 'explanation', 'familiar',
        'foreign', 'forty', 'frequently', 'government', 'guarantee',
        'harass', 'hindrance', 'identity', 'immediately', 'individual',
        'interfere', 'interrupt', 'language', 'leisure', 'lightning',
        'marvellous', 'mischievous', 'muscle', 'necessary', 'neighbour',
        'nuisance', 'occupy', 'occur', 'opportunity', 'parliament',
        'persuade', 'physical', 'prejudice', 'privilege', 'profession',
        'programme', 'pronunciation', 'queue', 'recognise', 'recommend',
        'relevant', 'restaurant', 'rhyme', 'rhythm', 'sacrifice',
        'secretary', 'shoulder', 'signature', 'sincere', 'soldier',
        'stomach', 'sufficient', 'suggest', 'symbol', 'system',
        'temperature', 'thorough', 'twelfth', 'variety', 'vegetable',
        'vehicle', 'yacht'
    ]
};

// Flatten all words into a single array for easy access
const allWords = [
    ...wordBank.silentLetters,
    ...wordBank.ciousTious,
    ...wordBank.cialTial,
    ...wordBank.eiAfterC,
    ...wordBank.antEnt,
    ...wordBank.ableIble,
    ...wordBank.ablyIbly,
    ...wordBank.fer,
    ...wordBank.hyphenated,
    ...wordBank.dictation
];

// Remove duplicates and create final word list
const finalWordBank = [...new Set(allWords)];

// Paragraph templates that can accommodate any 15 spelling words
const paragraphTemplates = [
    {
        id: 1,
        title: "The School Adventure",
        template: `Last week, our class went on an exciting trip to the museum. The {0} guide explained how {1} civilizations lived thousands of years ago. We learned about their {2} customs and the {3} artifacts they left behind. 

        The most {4} part was seeing the Egyptian mummies. Our teacher told us it was {5} to learn about different cultures. We had to be very {6} while walking through the exhibits because some items were extremely {7}.

        In the afternoon, we visited the science section where we discovered {8} facts about space exploration. The guide showed us how astronauts {9} with mission control. We also learned about the {10} of different planets and their {11} atmospheres.

        Before leaving, we wrote in our journals about the {12} experience. Everyone agreed it was much more {13} than we had expected. We felt very {14} to have such an amazing opportunity to learn outside the classroom.`
    },
    {
        id: 2,
        title: "The Sports Day Challenge",
        template: `The annual sports day was approaching, and everyone was feeling quite {0} about the upcoming events. Our PE teacher had been {1} us for weeks about the importance of fair play and good sportsmanship.

        Sarah was particularly {2} about the long jump competition. She had been {3} every day after school to improve her technique. Her {4} was to break the school record that had stood for five years.

        Meanwhile, Tom was feeling {5} about the relay race. He worried he might {6} his teammates if he dropped the baton. The coach reminded him that it was {7} to stay calm under pressure.

        On the day of the competition, the weather was {8}, with clear skies and a gentle breeze. The atmosphere was {9} as students cheered for their classmates. Teachers moved {10} between different events, ensuring everything ran smoothly.

        By the end of the day, everyone felt {11} with their efforts. The event had been a {12} success, bringing the whole school community together. Winners and participants alike showed {13} behavior, and many students discovered {14} talents they never knew they had.`
    },
    {
        id: 3,
        title: "The Science Project",
        template: `For our science project, we had to investigate how plants grow under different conditions. This required {0} observation and careful recording of data over several weeks.

        First, we had to {1} our hypothesis about what factors might affect plant growth. We decided to test the effects of light, water, and soil type. Our teacher emphasized the importance of keeping {2} records of our observations.

        We planted seeds in {3} containers and placed them in different environments around the classroom. Some plants were given {4} amounts of water, while others received varying levels of sunlight. We measured their growth {5} and noted any changes in their appearance.

        After two weeks, the results were quite {6}. The plants that received {7} light and water grew much taller than those kept in darker conditions. We learned that plants need these {8} elements to survive and thrive.

        Writing up our conclusions was {9} because we had to explain our findings clearly. We included graphs and charts to make our data more {10} to understand. Our teacher was {11} with our thoroughness and attention to detail.

        This project taught us the importance of {12} investigation and how scientists work to understand the natural world. We felt {13} of our achievement and looked forward to sharing our results with other classes. The experience gave us a {14} appreciation for the scientific method.`
    },
    {
        id: 4,
        title: "The Community Garden",
        template: `Our neighborhood decided to create a community garden to bring people together and provide fresh vegetables for local families. The project required {0} planning and cooperation from many volunteers.

        Mrs. Johnson, who had {1} experience in gardening, agreed to lead the project. She explained that we needed to be {2} about which vegetables to plant in our climate. The soil had to be tested to ensure it contained {3} nutrients for healthy plant growth.

        The first challenge was clearing the overgrown plot of land. Everyone worked {4} to remove weeds and prepare the soil. Some community members brought their own tools, while others contributed by providing {5} supplies like seeds and fertilizer.

        Children from the local school were particularly {6} about helping with the project. They learned how to plant seeds at the {7} depth and spacing. Their teacher explained how this hands-on experience would {8} their understanding of biology and environmental science.

        As weeks passed, the garden began to flourish. The {9} growth of the plants amazed everyone involved. Neighbors who had never spoken before found themselves working side by side, sharing {10} and gardening tips.

        The harvest celebration was a {11} event that brought the entire community together. Families shared recipes and cooking tips for the vegetables they had grown. Everyone agreed that the garden had been a {12} investment in bringing people together.

        The success of the project inspired plans for {13} expansion next year. The community had discovered that working together could create something truly {14} for everyone to enjoy.`
    },
    {
        id: 5,
        title: "The Library Mystery",
        template: `The old town library held many secrets, and Emma was {0} to uncover them all. She spent her afternoons exploring the {1} sections, discovering books that hadn't been opened for decades.

        One particularly {2} afternoon, Emma noticed something unusual about one of the old wooden shelves. There appeared to be a {3} compartment hidden behind some dusty volumes. Her curiosity was immediately {4}, and she decided to investigate further.

        Carefully removing the books, she discovered a small wooden box containing {5} letters and photographs from the 1920s. The handwriting was {6}, but Emma managed to read several passages that described life in the town during that era.

        The letters revealed {7} stories about the library's founder, who had been a {8} supporter of education for all children. Emma learned that this person had donated their entire {9} collection to establish the public library.

        Excited by her discovery, Emma approached the head librarian, Mrs. Patterson, who was {10} amazed by the find. Together, they carefully examined each document, treating them with the {11} care they deserved.

        The library decided to create a special {12} to showcase Emma's discovery. The exhibition would help visitors understand the {13} heritage of their community and the importance of preserving local history.

        Emma felt {14} proud of her contribution to uncovering this piece of local history, and her discovery inspired other young people to explore and appreciate their cultural heritage.`
    }
];

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { finalWordBank, paragraphTemplates, wordBank };
} 