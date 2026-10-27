const conversation = {
    askedCount: 0,
    userName: "",
};

const endings = [
    "The candle bends toward you.",
    "Something in the dark is listening.",
    "Do not ask what is standing behind you.",
    "The veil trembles as I speak.",
];

function hasWord(text, words) {
    return words.some((word) => new RegExp(`\\b${word}\\b`, "i").test(text));
}

function pick(items, question) {
    let hash = conversation.askedCount;
    for (const character of question) {
        hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
    }
    return items[hash % items.length];
}

function rememberName(question) {
    const nameMatch = question.match(/\b(?:my name is|call me|i am|i'm)\s+([a-z][a-z'-]*)/i);
    if (nameMatch) {
        conversation.userName = nameMatch[1];
    }
}

function createGhostReply(question) {
    const normalizedQuestion = question.trim().replace(/\s+/g, " ");
    const lowerQuestion = normalizedQuestion.toLowerCase();
    conversation.askedCount += 1;
    rememberName(normalizedQuestion);

    if (hasWord(lowerQuestion, ["hello", "hi", "hey", "greetings"])) {
        const name = conversation.userName ? `, ${conversation.userName}` : "";
        return pick([
            `Hello${name}... you have crossed into my house of whispers.`,
            `I heard you${name}. The dead were waiting for someone to speak.`,
            `At last, a living voice${name}... ask your question.`,
        ], normalizedQuestion);
    }

    if (hasWord(lowerQuestion, ["who", "what"]) && hasWord(lowerQuestion, ["you", "are", "name"])) {
        return "I am the voice between your world and the next... names have little meaning after death.";
    }

    if (hasWord(lowerQuestion, ["thank", "thanks"])) {
        return "Do not thank me yet... every answer leaves a little darkness inside you.";
    }

    if (hasWord(lowerQuestion, ["bye", "goodbye", "leave", "go"])) {
        return "You may leave the board... but I cannot promise that I will leave you.";
    }

    if (hasWord(lowerQuestion, ["love", "relationship", "crush", "marry", "marriage"])) {
        return pick([
            "There is love near you, but fear is standing between you and it.",
            "Your heart already knows the name... you are only afraid to say it aloud.",
            "That bond is real, but something from the past still has its fingers around it.",
        ], normalizedQuestion);
    }

    if (hasWord(lowerQuestion, ["future", "tomorrow", "destiny", "happen"])) {
        return pick([
            "I see a door opening soon; step through it before the light behind you dies.",
            "Your path is not fixed, but one choice will follow you like a shadow.",
            "The future is foggy... I see change approaching before the next moon.",
        ], normalizedQuestion);
    }

    if (hasWord(lowerQuestion, ["money", "job", "work", "career", "business"])) {
        return "A chance is coming, but it will demand courage instead of money... do not hide from it.";
    }

    if (hasWord(lowerQuestion, ["death", "die", "dead", "afterlife", "ghost", "spirit"])) {
        return "Death is not an ending here... it is a door, and something is holding it open.";
    }

    if (hasWord(lowerQuestion, ["scared", "afraid", "fear", "danger", "safe"])) {
        return "Your fear is useful; it noticed what your eyes refused to see. Stay where the light is.";
    }

    if (hasWord(lowerQuestion, ["help", "advice", "should", "can"])) {
        return "Trust the choice that brings you peace, not the one that merely makes the noise stop.";
    }

    if (/^(is|are|am|do|does|did|will|can|should|could|would)\b/i.test(lowerQuestion)) {
        return pick([
            "Yes... but not in the way you hope.",
            "No... the darkness has closed that path for now.",
            "The answer is hidden, but the first sign will arrive before you expect it.",
        ], normalizedQuestion);
    }

    if (hasWord(lowerQuestion, ["why", "how", "when", "where", "which", "who"])) {
        return pick([
            "Because something you cannot see has already set this in motion.",
            "Watch the small signs; the truth will reveal itself when you stop forcing it.",
            "I can show you the direction, but you must take the next step yourself.",
        ], normalizedQuestion);
    }

    return pick([
        "I feel a question beneath your question... speak the truth you are avoiding.",
        "The words are clear, but your intention is hidden from the dead.",
        "I cannot see every answer, but I can feel a warning gathering around you.",
        endings[conversation.askedCount % endings.length],
    ], normalizedQuestion);
}

self.addEventListener("message", (event) => {
    if (event.data.type === "load") {
        self.postMessage({ status: "ready" });
        return;
    }

    if (typeof event.data.text !== "string" || !event.data.text.trim()) {
        return;
    }

    self.postMessage({
        status: "complete",
        output: createGhostReply(event.data.text),
    });
});
