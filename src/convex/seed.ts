// ChooseYourPath — optional sample-content seeder.
// Creates sample stories only when a real writer account already exists.
// It never creates demo reader, writer, or admin accounts.
import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { STYLE_DESCRIPTIONS } from "./stories";

type SceneSpec = {
  t: string; // title
  n: string; // narration
  d: string; // illustration description
  ending?: string; // ending label
};

type ChoiceSpec = {
  from: number; // scene index (1-based) this choice belongs to
  text: string;
  to: number; // target scene index
  path: string; // path name
  cons: string; // consequence
};

type StorySpec = {
  title: string;
  description: string;
  genre: string;
  theme: string;
  writingStyle: string;
  narrative: string;
  coverStyle: string;
  styles: string[];
  scenes: SceneSpec[];
  choices: ChoiceSpec[];
};

export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    const results: string[] = [];

    // Do not create demo accounts. Seed sample stories only for an existing writer.
    const writer = await ctx.db
      .query("users")
      .collect()
      .then((users) => users.find((user) => user.role === "WRITER"));
    if (!writer) {
      return ["sample stories skipped: create a writer account first"];
    }
    const writerId = writer._id;

    // --- Story definitions ---------------------------------------------------
    const FOREST: StorySpec = {
      title: "The Whispering Forest",
      description:
        "A voice in the night calls Mira by name. Beyond the village fence, the ancient forest is waiting — and so is whatever has been whispering for her.",
      genre: "Fantasy / Mystery",
      theme: "Curiosity vs. Caution",
      writingStyle: "Dark but hopeful",
      narrative:
        "Mira, a young traveler, hears a mysterious voice calling her name from the ancient forest. Drawn past the safety of the village, she follows traces of a blue lantern light deeper into the trees, where a forgotten shrine, a talking fox, a hidden river and an abandoned watchtower each guard their own truth about the voice — and about Mira herself.",
      coverStyle: "Watercolor",
      styles: ["Classic Storybook", "Watercolor", "Dark Forest", "Dreamlike"],
      scenes: [
        {
          t: "The Edge of the Trees",
          n: "The last light of the village disappears behind Mira as she reaches the edge of the forest. Between the ancient trees, a single blue lantern flickers, impossibly far away and impossibly close at once. The voice that woke her — her own name, spoken softly — seems to come from everywhere now.",
          d: "A girl standing at the entrance of a vast glowing forest at night, a single blue lantern light flickering between enormous ancient trees, fireflies, mist",
        },
        {
          t: "The Blue Lantern",
          n: "The lantern hangs from a crooked branch, blue as deep water, and it hums like a held breath. When Mira steps closer, the whisper returns: 'You came.' The light bends toward a narrower path leading off the main trail.",
          d: "A glowing blue lantern hanging from a crooked tree branch at night, humming light, a narrow path leading deeper into dark forest",
        },
        {
          t: "The Fork of Whispers",
          n: "The path splits at a stone marker worn smooth by centuries of rain. To the left, the ground slopes down toward the sound of running water. To the right, the trees open around a fallen shrine gate. The lantern light trembles, as if it cannot decide which way to lean.",
          d: "A forest path splitting around an ancient moss-covered stone marker at night, one direction sloping toward a glowing river, the other toward a ruined shrine gate",
        },
        {
          t: "Down to the River",
          n: "The hidden river runs silver in the dark, faster than any river has a right to run. Floating lanterns drift on its surface — dozens of them, each carrying a small paper boat. As Mira watches, one lantern bumps the bank and comes to rest at her feet. Inside the boat: a strip of bark with her name carved into it.",
          d: "A silver moonlit river at night carrying dozens of floating blue lanterns, paper boats, a girl kneeling at the mossy bank",
        },
        {
          t: "The Ferryman's Question",
          n: "'The river remembers everyone who drinks from it,' says a voice. A lean fox sits on a flat stone, tail curled around its paws, eyes catching the lantern light. 'It sent boats for you. That is either a great honor, Mira — or a great debt.'",
          d: "A sleek fox with glowing eyes sitting on a flat stone beside a moonlit river at night, paper boats drifting past",
        },
        {
          t: "The River's Memory",
          n: "Mira asks the river why it called her. The water stills, and in its surface she sees not her reflection but a smaller girl, years younger, running through these same trees with a paper lantern of her own. The river has known her longer than she has known herself. The fox watches her remember.",
          d: "A girl gazing into still moonlit water that reflects a memory of a smaller child carrying a paper lantern through a forest",
        },
        {
          t: "The Fox's Bargain",
          n: "The fox's whiskers twitch. 'The voice you heard was the shrine's. It has been calling you since the night you first ran through these trees. I can carry you to it — my price is one true memory, given freely.' His eyes are ancient and kind and a little hungry, all at once.",
          d: "A mystical fox speaking with a girl at the edge of a glowing forest pool at night, floating embers, ancient kindly eyes",
        },
        {
          t: "The Shrine Gate",
          n: "The fallen gate is older than the village, older than the road. Moss has taken the carved names that once ringed its arch, but beneath Mira's palm the stone is warm, like something sleeping. Beyond it, shrine lanterns bloom one by one down a corridor of trees.",
          d: "A fallen ancient shrine gate covered in moss at night, warm glowing stone, a corridor of blooming lantern lights beyond it",
        },
        {
          t: "The Watchtower Path",
          n: "The watchtower rises black against the stars, its stairs collapsed halfway up. Someone has tied hundreds of small bells to the surviving railing, and though the night is windless, they are all ringing — softly, steadily, in unison, like an invitation.",
          d: "A tall ruined stone watchtower against a starry night sky, hundreds of small bells on its railing ringing in still air",
        },
        {
          t: "The Bells Speak",
          n: "Each bell, Mira realizes, carries a scratch-mark: a name. Hundreds of names. The ringing is not wind — it is the tower counting. And it has just stopped counting, the way a speaker pauses before saying something important.",
          d: "Close view of small ancient bells engraved with names ringing on a stone railing at night, moonlight, hanging moss",
        },
        {
          t: "The Keeper of the Tower",
          n: "At the top of the broken stairs sits a figure in a keeper's coat, lantern resting on one knee. 'Every keeper before me rang the bells to say: we are still here, the forest is still kind. I am very old now, and the bells need new hands.' The figure turns — and under the hood there is only gentle starlight.",
          d: "A hooded keeper figure with a lantern sitting at the top of ruined watchtower stairs at night, gentle starlight under the hood",
        },
        {
          t: "The Name in the Shrine",
          n: "Deep in the shrine, Mira finds a wall of carved names — and one fresh hollow, exactly the shape of her own. The whispering was never a stranger. It was the forest, learning her name the way you learn a song: by singing it over and over until someone answers. Mira opens her mouth to answer.",
          d: "A girl before an ancient shrine wall of carved names, one glowing hollow shaped like a name, candlelight and drifting petals",
        },
        {
          t: "Answering the Forest",
          n: "Mira speaks her own name aloud — not as a question, but as an answer. The lanterns flare blue, the river applauds in small silver waves, and the bells in the distant tower ring once, joyfully. The forest exhales. She is not lost. She is found.",
          d: "A girl speaking aloud in a forest erupting with blue lantern light, silver river waves, distant joyful bells, magical night",
          ending: "THE VOICE ANSWERED",
        },
        {
          t: "The Memory Given",
          n: "Mira gives the fox her smallest memory — the smell of rain on the village well. The fox closes its eyes, then leads her along secret paths no map has ever held, to the shrine, to the hollow with her name. 'The forest keeps what it loves,' he says. 'Now it keeps you gently.'",
          d: "A fox leading a girl through a secret forest tunnel of intertwined trees glowing with blue lantern light at night",
          ending: "THE FOX'S COMPANION",
        },
        {
          t: "The New Keeper",
          n: "Mira climbs the broken stairs, and they hold. She takes the lantern, and it is warm. The bells fall silent under her hands — then ring out, loud and bright, a new rhythm that is entirely hers. Somewhere below, the fox smiles. The forest has a keeper again.",
          d: "A girl standing atop a ruined watchtower ringing hundreds of bells at night, holding a bright blue lantern, stars wheeling above",
          ending: "THE NEW KEEPER",
        },
        {
          t: "The River's Daughter",
          n: "Mira steps into the silver river, and it does not feel like water — it feels like memory, holding her up. The lantern boats gather around her, and she understands at last: the river called its daughter home. Every boat was a year of waiting. Every lantern was her name, spoken softly.",
          d: "A girl standing on moonlit water surrounded by dozens of floating blue lanterns and paper boats, arms open, magical night",
          ending: "THE RIVER'S DAUGHTER",
        },
      ],
      choices: [
        { from: 1, text: "Follow the blue lantern", to: 2, path: "Path of the Lantern", cons: "Mira finds the humming lantern and the narrow path it guards." },
        { from: 1, text: "Call out into the dark", to: 3, path: "Path of the River", cons: "Her voice startles the forest; the whisper leads her toward water." },
        { from: 2, text: "Take the lantern from its branch", to: 8, path: "Path of the Watchtower", cons: "The lantern goes dark in her hands and points toward the tower." },
        { from: 2, text: "Bow to the lantern and ask permission", to: 3, path: "Path of the Shrine", cons: "The light steadies, approving; the way to the shrine opens." },
        { from: 3, text: "Follow the sound of running water", to: 4, path: "Path of the River", cons: "Mira descends to the hidden river and its drifting boats." },
        { from: 3, text: "Step through the fallen shrine gate", to: 8, path: "Path of the Shrine", cons: "The moss-covered gate is warm beneath her palm." },
        { from: 4, text: "Pick up the paper boat with her name", to: 5, path: "Path of the River", cons: "The carved bark inside confirms the river knows her." },
        { from: 4, text: "Wade into the silver water", to: 16, path: "Path of the River", cons: "The river rises gently to meet her — the water remembers." },
        { from: 5, text: "Ask the fox about the voice", to: 6, path: "Path of the Fox", cons: "The fox speaks plainly: the shrine has called her since childhood." },
        { from: 5, text: "Ask the fox the way to the shrine", to: 7, path: "Path of the Fox", cons: "The fox offers to guide her — for the price of one true memory." },
        { from: 6, text: "Share a childhood memory with the river", to: 13, path: "Path of the River", cons: "The memory offered, the river shows her the way home to itself." },
        { from: 6, text: "Ask the fox to guide her onward", to: 7, path: "Path of the Fox", cons: "The fox agrees, naming his price." },
        { from: 7, text: "Give the fox one true memory", to: 14, path: "Path of the Fox", cons: "The fox leads her by secret paths to the shrine of her name." },
        { from: 7, text: "Decline and seek the shrine alone", to: 8, path: "Path of the Shrine", cons: "The fox bows and vanishes; the gate is warm when she finds it." },
        { from: 8, text: "Speak her name at the carved hollow", to: 13, path: "Path of the Shrine", cons: "The forest has been learning her name; she answers at last." },
        { from: 8, text: "Follow the corridor of lanterns deeper", to: 9, path: "Path of the Watchtower", cons: "The lantern corridor ends at the ringing tower." },
        { from: 9, text: "Climb the broken stairs", to: 10, path: "Path of the Watchtower", cons: "The stairs hold; the bells ring louder as she ascends." },
        { from: 9, text: "Listen to what the bells are saying", to: 10, path: "Path of the Watchtower", cons: "The pattern is a count — a pause before words." },
        { from: 10, text: "Answer the bells with her own name", to: 11, path: "Path of the Watchtower", cons: "The ringing stops. The keeper expects her." },
        { from: 10, text: "Cut one bell free to keep", to: 11, path: "Path of the Watchtower", cons: "The tower permits it; the rest ring approval." },
        { from: 11, text: "Accept the keeper's lantern", to: 15, path: "Path of the Watchtower", cons: "Mira becomes the forest's new keeper." },
        { from: 11, text: "Ask the keeper about the voice first", to: 12, path: "Path of the Shrine", cons: "'The voice is the shrine,' says the keeper. 'It is waiting for you.'" },
        { from: 12, text: "Answer the forest aloud", to: 13, path: "Path of the Shrine", cons: "She speaks her name; the forest answers in blue light." },
        { from: 12, text: "Return to the keeper with the answer", to: 15, path: "Path of the Watchtower", cons: "Her answer completes the keeper's long vigil." },
      ],
    };

    const CLOCK: StorySpec = {
      title: "The Clockmaker's Last Hour",
      description:
        "The tower clock has stopped — one hour before midnight, and time itself seems to be holding its breath. Apprentice clockmaker Elsie climbs into the gears to find out why.",
      genre: "Mystery / Fantasy",
      theme: "Duty vs. Truth",
      writingStyle: "Precise, atmospheric, gently uncanny",
      narrative:
        "Elsie, a young apprentice clockmaker, discovers the town's clock tower frozen at eleven. Inside she finds a hidden mechanism, a mysterious letter, a locked room, a broken pocket watch and a secret passage. Her choices carry her through the gears toward the clockmaker's final secret — and several different midnights.",
      coverStyle: "Vintage Illustration",
      styles: ["Vintage Illustration", "Ink", "Gothic", "Paper Cut"],
      scenes: [
        {
          t: "Eleven O'Clock, Forever",
          n: "The whole town is holding its breath. Every clock in Elsie's workshop shows eleven — and has for an hour that refuses to end. From the square she looks up at the tower: the great hands are frozen, and behind the clock face, something is ticking out of rhythm.",
          d: "A young apprentice girl on a cobblestone square at night looking up at a huge clock tower frozen at eleven, gas lamps, moths circling lamps",
        },
        {
          t: "The Gear Room",
          n: "Inside, the gear room smells of oil and thunder. The great gears are stopped — all but one small brass wheel at the center, turning against every rule of clockwork, ticking out a pattern rather than a time. Elsie has read every manual her master owned. This pattern is not in any of them.",
          d: "A vast gear room of enormous stopped brass gears, one small wheel turning, lamplight and dust, a girl climbing among them",
        },
        {
          t: "The Crossroads of Gears",
          n: "The stopped mechanism splits the room in two. Upward, a spiral stair hugs the inner wall, rising toward the bell chamber. Along the back, a low door Elsie has never seen sits behind the pendulum — half hidden, its keyhole warm. The ticking comes from both directions now.",
          d: "A dark clocktower interior where a spiral stair rises and a low half-hidden door waits behind a giant pendulum, brass and shadow",
        },
        {
          t: "The Clockmaker's Letter",
          n: "The bell chamber is quiet as held breath. On the great bell's rim, weighted by a wrench, sits a letter in her master's unmistakable hand: 'If the clock has stopped at eleven, then I have failed, and you must choose what midnight means. I am sorry to leave this to you, Elsie.'",
          d: "A handwritten letter on aged paper resting on the rim of an enormous bronze bell in a dark tower chamber, moonlight through louvers",
        },
        {
          t: "The Locked Room",
          n: "The low door opens on a room the tower has kept secret for forty years: a clockmaker's workshop, untouched, everything in its place under a skin of dust. On the bench, a broken pocket watch lies with its case open — and inside, instead of a portrait, a tiny painted door.",
          d: "A secret dusty clockmaker workshop inside a tower, workbench with an open broken pocket watch whose face shows a tiny painted door, candlelight",
        },
        {
          t: "The Watchmaker's Bench",
          n: "The tools on the bench are arranged for a left-handed craftsman. Her master is right-handed. The dust says forty years; the oil on the whetstone says this morning. Someone has been keeping this room alive, patiently, all along.",
          d: "A watchmaker workbench with left-handed tools, oil-slick whetstone, dust and lamplight, tiny gears arranged in rows",
        },
        {
          t: "The Passage Behind the Weights",
          n: "Behind the driving weights, the stone is false — a door with no handle that swings at a touch. Beyond, stairs corkscrew down inside the tower's leg, toward the old tunnels that once linked the town's four clocks. The air that rises is warm and smells of metal and rain.",
          d: "A hidden stone passage door behind enormous clock weights, corkscrew stairs descending into warm darkness, faint lamplight below",
        },
        {
          t: "The Heart of the Clock",
          n: "At the tower's heart, behind the clock face, hangs the escapement — the soul of the machine. And wedged between its teeth, deliberate and impossible, is a single brass key. The clock has not broken. It has been stopped on purpose. Stopped, and locked.",
          d: "The enormous escapement mechanism behind a giant clock face, a single brass key wedged between its teeth, dramatic lamplight",
        },
        {
          t: "The Other Clockmaker",
          n: "The passage opens into the tunnels, and the tunnels into a second, smaller workshop — a mirror of the first. At its bench sits an old man with his left hand bandaged, winding a watch that ticks in the same pattern as the brass wheel above. 'You found the letter,' he says. 'Good. Then you know midnight needs choosing.'",
          d: "An old clockmaker with a bandaged hand at a bench in an underground workshop lit by oil lamps, gears and keys on every wall",
        },
        {
          t: "The Four Clocks",
          n: "A map on the wall shows the town's four clocks, linked beneath the streets like four moons around one planet. Three dials are drawn at eleven. The fourth is blank. 'Every clock needs a heart to keep,' says the old man. 'Mine is nearly wound out. The tower needs one that will not stop.'",
          d: "An old map of four linked clocks, three dials drawn at eleven and one blank, pinned above a workbench in lamplight",
        },
        {
          t: "The Winding Chair",
          n: "In the center of the tunnel workshop stands a chair of brass and leather, wired into the tower's mainspring with silver thread. Whoever sits in it becomes the winding — the heart that keeps the hour. The old man looks at it the way one looks at a beloved instrument about to be played for the last time.",
          d: "A strange brass winding chair wired with silver thread into a giant mainspring in an underground workshop, warm lamplight and shadow",
        },
        {
          t: "Midnight, Chosen",
          n: "Elsie sets the key in the escapement and turns. Above her the town hears one deep, clean stroke of the bell — and then the normal, patient tick of a clock that has decided to keep going. Time moves again. In the tower room, eleven becomes midnight at last, and midnight becomes tomorrow.",
          d: "A girl turning a brass key inside a giant clock escapement as golden light floods the gear room, gears beginning to move",
          ending: "MIDNIGHT, CHOSEN",
        },
        {
          t: "The Successor's Hands",
          n: "Elsie winds the watch that was her master's, then takes the left-handed tools from the secret bench and slides them into her apron. She climbs the spiral stair as the bell strikes twelve. The town wakes to a clock that runs, and a tower that has a new keeper of its hours.",
          d: "A girl climbing a spiral tower stair carrying small tools as the great bell strikes overhead, dawn light through the louvers",
          ending: "THE SUCCESSOR'S HANDS",
        },
        {
          t: "The Two Clockmakers",
          n: "Elsie pulls the bandage from the old man's hand — the scar of a master winder, earned in a tower like this one, long ago. 'Then we do it together,' she says. He laughs, and the sound is the best oiled click she has ever heard. Two clockmakers climb toward the escapement, and midnight waits politely.",
          d: "A young woman and an old clockmaker climbing tower stairs side by side with lanterns, gears turning around them, hopeful light",
          ending: "THE TWO CLOCKMAKERS",
        },
        {
          t: "The Hour That Was Kept",
          n: "Elsie sits in the winding chair and takes the silver thread in both hands. The mainspring hums, the tower shivers, and every clock in the town — all four, deep beneath the streets — strikes midnight together, a chord like a held breath released. Somewhere above, the town celebrates an hour that never noticed it was saved.",
          d: "A girl in a brass winding chair holding silver threads as light flows up through giant gears into a clock tower at midnight",
          ending: "THE HOUR THAT WAS KEPT",
        },
        {
          t: "The Door in the Watch",
          n: "The tiny painted door in the pocket watch opens when Elsie turns the crown. Inside is a staircase the size of her finger — and it is not a painting at all. The watch ticks. From somewhere very far below, very small, a bell rings midnight. Elsie smiles, and climbs down into the watch.",
          d: "A tiny glowing door open in the face of a pocket watch revealing a miniature staircase, magical blue light, a girl peering in wonder",
          ending: "THE DOOR IN THE WATCH",
        },
      ],
      choices: [
        { from: 1, text: "Climb the tower's outer stairs", to: 2, path: "The Mechanism Path", cons: "Elsie enters the gear room and finds the impossible wheel." },
        { from: 1, text: "Search the square for other stopped clocks", to: 3, path: "The Passage Path", cons: "Every clock is frozen at eleven; the tower hides a door." },
        { from: 2, text: "Climb toward the bell chamber", to: 4, path: "The Letter Path", cons: "A letter from her master waits on the bell's rim." },
        { from: 2, text: "Investigate the door behind the pendulum", to: 5, path: "The Locked Room Path", cons: "A secret workshop — and a pocket watch with a painted door." },
        { from: 3, text: "Enter the tower by the hidden door", to: 5, path: "The Locked Room Path", cons: "The keyhole is warm; the room beyond is untouched." },
        { from: 3, text: "Follow the ticking into the undercroft", to: 7, path: "The Passage Path", cons: "A false stone door swings open behind the weights." },
        { from: 4, text: "Read the letter aloud in the chamber", to: 8, path: "The Letter Path", cons: "The words unlock the tower's heart: a key in the escapement." },
        { from: 4, text: "Search the bell chamber for more of his hand", to: 6, path: "The Locked Room Path", cons: "A brass fitting points down — toward the locked room." },
        { from: 5, text: "Study the broken pocket watch", to: 6, path: "The Locked Room Path", cons: "The bench says the room has been kept alive for forty years." },
        { from: 5, text: "Wind the pocket watch", to: 16, path: "The Watch Path", cons: "The painted door opens onto a very small, very real staircase." },
        { from: 6, text: "Follow the fresh oil to the false stone", to: 7, path: "The Passage Path", cons: "Someone has been coming and going this very morning." },
        { from: 6, text: "Take the left-handed tools with her", to: 8, path: "The Letter Path", cons: "The tools fit her hand perfectly. The heart of the clock waits." },
        { from: 7, text: "Descend into the old tunnels", to: 9, path: "The Passage Path", cons: "The tunnels lead to a mirror workshop and its keeper." },
        { from: 7, text: "Rally and force the false door to the gears", to: 8, path: "The Mechanism Path", cons: "A shortcut to the heart of the stopped clock." },
        { from: 8, text: "Turn the brass key at once", to: 12, path: "The Mechanism Path", cons: "The clock chooses to keep going — midnight, at last." },
        { from: 8, text: "Search for whoever locked the clock", to: 9, path: "The Passage Path", cons: "The key fits the tunnels as well as the tower." },
        { from: 9, text: "Ask what midnight needs choosing", to: 10, path: "The Winding Path", cons: "Four clocks, three hearts wound out, one heart needed." },
        { from: 9, text: "Ask who he is", to: 13, path: "The Two Clockmakers Path", cons: "The other clockmaker — the first apprentice of the tower." },
        { from: 10, text: "Study the map of the four clocks", to: 11, path: "The Winding Path", cons: "The blank dial is the tower. The winding chair is the answer." },
        { from: 10, text: "Offer to find a heart that will not stop", to: 11, path: "The Winding Path", cons: "The old man leads her to the winding chair." },
        { from: 11, text: "Sit in the winding chair", to: 15, path: "The Winding Path", cons: "Elsie becomes the hour that was kept." },
        { from: 11, text: "Ask for another way", to: 12, path: "The Mechanism Path", cons: "'There is always the key,' says the old man. 'There always was.'" },
        { from: 8, text: "Climb back and take up the master's tools", to: 13, path: "The Letter Path", cons: "The tower will need hands again tomorrow." },
        { from: 11, text: "Refuse the chair and climb to the escapement", to: 12, path: "The Mechanism Path", cons: "Some midnights are chosen with a key, not a chair." },
        { from: 9, text: "Join the old clockmaker as his partner", to: 14, path: "The Two Clockmakers Path", cons: "Two hands are better than one — and two clocks, better than four." },
      ],
    };

    const STAR: StorySpec = {
      title: "The Last Star of Avalon",
      description:
        "The final star that guards the kingdom of Avalon is dying. A young explorer sets out across Moon Valley and the Crystal Bridge to learn why — and what it will cost to keep the sky alight.",
      genre: "Adventure / Fantasy",
      theme: "Hope vs. Sacrifice",
      writingStyle: "Sweeping, luminous, sincere",
      narrative:
        "When the last star of Avalon begins to fade, a young explorer journeys through Moon Valley, across the Crystal Bridge, into the Forgotten Temple and up to the Sky Ruins to discover who tends the stars — and what the sky asks in return. Every path reveals a different truth about the kingdom's light.",
      coverStyle: "Celestial",
      styles: ["Fairy Tale", "Comic Illustration", "Mystical", "Celestial"],
      scenes: [
        {
          t: "The Fading",
          n: "Every child of Avalon knows the sky has only one true star left. Tonight, for the first time in three hundred years, it flickers. From the observatory hill, Mira of the Avalon Survey watches it dim — and makes a promise to it she does not yet know how to keep.",
          d: "A young explorer on an observatory hill at night watching a single flickering star over a fantasy kingdom, telescope silhouette, deep blue sky",
        },
        {
          t: "Moon Valley",
          n: "Moon Valley earns its name only at night, when the pale flowers open and turn their faces upward like a crowd of small moons. The star's light falls across the valley in a silver road — and part of the road is moving. Something is walking the light toward her.",
          d: "A valley of glowing white moonflowers at night, a silver road of starlight across the flowers, a small distant figure walking the light",
        },
        {
          t: "The Valley Fork",
          n: "The silver road forks around a basin of black glass where the valley stores its rain of falling stars. To the left, the road climbs toward the Crystal Bridge, humming faintly. To the right, it descends toward the Forgotten Temple, where the moonflowers grow thick as snowdrifts.",
          d: "A silver starlit road forking around a basin of black glass, one branch rising toward a crystal bridge, the other descending to a buried temple",
        },
        {
          t: "The Crystal Bridge",
          n: "The Crystal Bridge spans the sky-ridge like a frozen waterfall, and it is singing. Each step raises a different note. Halfway across, Mira finds the note that does not belong — a dead crystal, dark as coal, and on its surface, clawed into it, one word: 'LISTEN.'",
          d: "A transparent crystal bridge across a mountain ridge at night under stars, one dark dead crystal among the glowing ones, wind-blurred hair",
        },
        {
          t: "The Song of the Bridge",
          n: "Mira listens the way the dead crystal asked. The bridge is not singing randomly — it is counting. The way a lighthouse counts, the way a heart counts. And it is counting down. The star's light overhead stutters, and the bridge's song drops an octave, as if grieving.",
          d: "A girl kneeling on a crystal bridge at night listening to glowing crystals, starlight overhead flickering, petals of light drifting",
        },
        {
          t: "The Bridge Keeper",
          n: "'It sings what the star tells it,' says a voice like struck glass. The bridge keeper is made of the same crystal as her bridge, transparent in the starlight, sorrowful and bright. 'It has sung for three hundred years. Soon it will sing a ending.' She smiles, and it is like frost forming. 'Unless someone changes the song.'",
          d: "A translucent crystalline woman standing on a glowing crystal bridge at night, sorrowful and luminous, stars behind",
        },
        {
          t: "The Forgotten Temple",
          n: "The temple was buried on purpose. Moonflowers crowd its collapsed roof, and inside, the dark is total — until Mira's lantern finds the wall of star-maps. Whoever made them mapped the sky of Avalon for a thousand years, and on the newest map, one star is drawn with a question mark beside it.",
          d: "An buried ancient temple interior covered in glowing star maps and moonflower vines, a lantern-lit explorer touching the newest map",
        },
        {
          t: "The Temple's Question",
          n: "The newest map is inked in a careful, living hand: the star, drawn fainter each year, with the question mark renewed annually like a prayer. Beneath it, a line of script: 'We asked the sky for a keeper. The sky asked who would keep the keeper.'",
          d: "A glowing star map with one faint star marked by a question mark, ancient script beneath, lantern light, drifting moonflower petals",
        },
        {
          t: "The Sky Ruins",
          n: "No road reaches the Sky Ruins; they float above the kingdom like the bones of a thought. Mira climbs the last of the moonflower stalks — grown towering and strong, fed by three hundred years of starlight — and steps off into thin air onto marble that remembers being a palace.",
          d: "Floating marble ruins above a moonlit kingdom at night, giant moonflower stalks reaching up to them, a tiny figure stepping onto pale stone",
        },
        {
          t: "The Star Garden",
          n: "At the heart of the ruins is a garden, and in the garden grows the last star — a tree of white fire, its roots in a well of night, its fruit small and impossibly bright. Kneeling at its trunk is the guardian, tending it with cupped hands, and the guardian is weeping.",
          d: "A tree of white fire growing in a marble garden in the sky at night, its fruit like small stars, a kneeling weeping guardian of starlight",
        },
        {
          t: "The Guardian's Confession",
          n: "'Stars are not born,' the guardian says. 'They are kept. I have kept this one alone since the kingdom forgot the tending songs.' The guardian's hands are cracked, leaking light like hourglass sand. 'I am almost empty, explorer. Tell me what Avalon remembers.'",
          d: "A guardian of starlight with cracked glowing hands kneeling before a tree of white fire in a sky garden at night",
        },
        {
          t: "The Tending",
          n: "Mira answers the only way she can: with the tending songs, the ones every Avalon child learns without knowing what they are for. The star-tree leans into the sound. Light climbs the guardian's cracked hands and knits them whole. The star, above and below, steadies.",
          d: "A girl singing a tending song before a tree of white fire as light knits a guardian's cracked hands whole, stars steadying overhead",
          ending: "THE STAR RESTORED",
        },
        {
          t: "The New Song",
          n: "Mira does not only sing the old songs — she adds her own verse, the one the bridge taught her, the one the valley hums. The star-tree takes the new song the way soil takes rain. When dawn comes, the star is still there, and it is not alone: two new sparks burn beside it.",
          d: "A girl singing a new song before a star-tree as two new sparks kindle beside it in a dawn-lit sky garden",
          ending: "THE NEW SONG",
        },
        {
          t: "The Second Keeper",
          n: "'Then keep it with me,' Mira says, and takes the guardian's cracked hands in hers. Light flows between them like a handshake across three hundred years. The well of night accepts them both, and the garden's tree burns brighter than it has since the first map was drawn.",
          d: "Two figures holding glowing hands beside a blazing star-tree in a sky garden, light flowing between them, dawn approaching",
          ending: "THE SECOND KEEPER",
        },
        {
          t: "The Fruit of the Star",
          n: "Mira picks one fruit of white fire, and it is warm as a heart in her palm. The guardian does not stop her. 'It will grow wherever you plant it,' the guardian says. 'Stars want to be many things. Mostly, they want to be needed.'",
          d: "A girl holding a fruit of white fire in her palm before a star-tree, a luminous guardian watching with hope, sky garden at night",
        },
        {
          t: "The Garden Below",
          n: "Mira carries the fruit down the moonflower stalks, through the valley of upturned flowers, and plants it on the observatory hill where every child of Avalon can see it grow. In time it becomes a small new star-tree, and the children learn the tending songs again — this time knowing why.",
          d: "A girl planting a glowing star fruit on an observatory hill as children gather around in a moonlit kingdom, a new small star-tree sprouting",
          ending: "THE GARDEN BELOW",
        },
      ],
      choices: [
        { from: 1, text: "Follow the silver road into Moon Valley", to: 2, path: "The Valley Path", cons: "The moonflowers open a road of starlight." },
        { from: 1, text: "Study the star from the observatory first", to: 2, path: "The Valley Path", cons: "The telescope confirms it: the star is counting down." },
        { from: 2, text: "Follow the figure walking the light", to: 3, path: "The Bridge Path", cons: "The road climbs toward the singing Crystal Bridge." },
        { from: 2, text: "Descend toward the buried temple", to: 7, path: "The Temple Path", cons: "The moonflowers part to reveal the Forgotten Temple." },
        { from: 3, text: "Cross the Crystal Bridge", to: 4, path: "The Bridge Path", cons: "Each step rings; one crystal is dark, clawed with 'LISTEN.'" },
        { from: 3, text: "Circle the black-glass basin", to: 7, path: "The Temple Path", cons: "Fallen-star glass points the way to the buried temple." },
        { from: 4, text: "Listen as the dead crystal asked", to: 5, path: "The Bridge Path", cons: "The bridge is counting down, and grieving." },
        { from: 4, text: "Press on toward the Sky Ruins", to: 9, path: "The Sky Path", cons: "The bridge ends at the foot of the floating ruins." },
        { from: 5, text: "Call out to whoever tends the song", to: 6, path: "The Bridge Path", cons: "The bridge keeper answers, sorrowful and bright." },
        { from: 5, text: "Record the song in her survey book", to: 9, path: "The Sky Path", cons: "The count will matter later; the ruins are next." },
        { from: 6, text: "Ask how to change the song", to: 10, path: "The Sky Path", cons: "'Ask the temple,' says the keeper. 'Then ask the sky.'" },
        { from: 6, text: "Offer to help tend the bridge", to: 9, path: "The Sky Path", cons: "The keeper teaches her the bridge's true name as a gift." },
        { from: 7, text: "Read the wall of star-maps", to: 8, path: "The Temple Path", cons: "A thousand years of maps, one question renewed like a prayer." },
        { from: 7, text: "Light the temple's dead lanterns", to: 8, path: "The Temple Path", cons: "The lanterns reveal the temple's question in full." },
        { from: 8, text: "Answer the temple's question aloud", to: 10, path: "The Sky Path", cons: "'I will keep the keeper,' she says — and the ruins hear." },
        { from: 8, text: "Copy the oldest map for the journey", to: 9, path: "The Sky Path", cons: "The first map shows the way up the moonflower stalks." },
        { from: 9, text: "Enter the star garden", to: 10, path: "The Sky Path", cons: "A tree of white fire — and a guardian weeping at its roots." },
        { from: 9, text: "Climb the highest ruined tower first", to: 10, path: "The Sky Path", cons: "From above, the garden is unmistakable: the heart of the sky." },
        { from: 10, text: "Share the tending songs of Avalon", to: 12, path: "The Valley Path", cons: "The star leans into songs it has not heard in centuries." },
        { from: 10, text: "Ask the guardian what the star needs", to: 11, path: "The Sky Path", cons: "The confession: stars are kept, and the keeper is empty." },
        { from: 11, text: "Take the guardian's hands and keep it together", to: 14, path: "The Sky Path", cons: "Two keepers, one light, three hundred years answered." },
        { from: 11, text: "Pick a fruit of the star-tree", to: 15, path: "The Garden Path", cons: "The guardian permits it; stars want to be needed." },
        { from: 10, text: "Add a new verse to the old songs", to: 13, path: "The New Song Path", cons: "The star accepts the new song — and kindles two sparks more." },
        { from: 11, text: "Promise to teach the songs to the kingdom", to: 13, path: "The New Song Path", cons: "A promise the whole sky seems to hear." },
        { from: 15, text: "Plant the fruit where all can see", to: 16, path: "The Garden Path", cons: "A garden begins below, and the children relearn the songs." },
      ],
    };

    const specs = [FOREST, CLOCK, STAR];
    for (const spec of specs) {
      const existing = await ctx.db
        .query("stories")
        .withIndex("by_status", (q) => q.eq("status", "PUBLISHED"))
        .collect()
        .then((all) => all.find((s) => s.title === spec.title));
      if (existing) {
        results.push(`story:${spec.title}:exists`);
        continue;
      }

      const now = Date.now();
      const storyId = await ctx.db.insert("stories", {
        title: spec.title,
        description: spec.description,
        genre: spec.genre,
        theme: spec.theme,
        writingStyle: spec.writingStyle,
        narrative: spec.narrative,
        coverStyle: spec.coverStyle,
        status: "PUBLISHED",
        authorId: writerId,
        authorName: writer.username,
        reads: 0,
        likesCount: 0,
        sceneCount: spec.scenes.length,
        endingCount: spec.scenes.filter((s) => s.ending).length,
        createdAt: now,
        updatedAt: now,
      });

      for (const name of spec.styles) {
        await ctx.db.insert("storyStyles", {
          storyId,
          styleName: name,
          styleDescription: STYLE_DESCRIPTIONS[name] ?? "",
        });
      }

      const sceneIds: any[] = [];
      for (let i = 0; i < spec.scenes.length; i++) {
        const sp = spec.scenes[i];
        const sceneId = await ctx.db.insert("scenes", {
          storyId,
          sceneOrder: i + 1,
          title: sp.t,
          narration: sp.n,
          sceneDescription: sp.d,
          isEnding: Boolean(sp.ending),
          endingLabel: sp.ending,
        });
        sceneIds.push(sceneId);
        for (const style of spec.styles) {
          await ctx.db.insert("sceneImages", {
            sceneId,
            storyId,
            styleName: style,
            seed: (i + 1) * 977 + style.length * 31 + (now % 1000),
            palette: style,
          });
        }
      }

      for (const c of spec.choices) {
        await ctx.db.insert("choices", {
          sceneId: sceneIds[c.from - 1],
          storyId,
          choiceText: c.text,
          nextSceneId: sceneIds[c.to - 1],
          pathName: c.path,
          consequence: c.cons,
        });
      }

      results.push(`story:${spec.title}:${spec.scenes.length} scenes`);
    }

    return results;
  },
});
