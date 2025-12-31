const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "exercises");
const OUTPUT = path.resolve(__dirname, "..", "src", "data", "exercises.json");

const CATEGORY_MAP = {
  strength: "Strength",
  powerlifting: "Strength",
  "olympic weightlifting": "Strength",
  strongman: "Strength",
  cardio: "Cardio",
  plyometrics: "Sports",
  stretching: "Mobility / Rehab",
};

const UPPER_BODY_MUSCLES = new Set([
  "chest",
  "biceps",
  "triceps",
  "shoulders",
  "lats",
  "middle back",
  "lower back",
  "traps",
  "forearms",
  "neck",
]);

const LOWER_BODY_MUSCLES = new Set([
  "quadriceps",
  "hamstrings",
  "glutes",
  "calves",
  "adductors",
  "abductors",
]);

const CORE_MUSCLES = new Set(["abdominals", "obliques", "lower back"]);

const normalizeName = (value = "") =>
  value
    .replace(/_/g, " ")
    .replace(/\s*-\s*/g, "-")
    .replace(/\s*,\s*/g, ", ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeAlias = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const buildAliases = (name, id) => {
  const aliases = new Set();
  const normalizedName = normalizeAlias(name);
  if (normalizedName) {
    aliases.add(normalizedName);
    aliases.add(normalizedName.replace(/\s+/g, ""));
  }
  if (id) {
    const normalizedId = normalizeAlias(id);
    if (normalizedId) {
      aliases.add(normalizedId);
      aliases.add(normalizedId.replace(/\s+/g, ""));
    }
  }
  return Array.from(aliases);
};

const mapCategory = ({ rawCategory, equipment, name }) => {
  const baseCategory = CATEGORY_MAP[rawCategory] || "Strength";
  if (baseCategory === "Strength" && equipment === "body only") {
    return "Bodyweight";
  }
  if (baseCategory === "Strength" && /bodyweight/i.test(name)) {
    return "Bodyweight";
  }
  return baseCategory;
};

const mapStrengthSubcategory = ({ rawCategory, equipment }) => {
  if (["powerlifting", "olympic weightlifting", "strongman"].includes(rawCategory)) {
    return "Strongman/Olympic";
  }
  if (equipment === "barbell") return "Barbell";
  if (equipment === "dumbbell") return "Dumbbell";
  if (equipment === "kettlebells") return "Kettlebell";
  if (equipment === "bands") return "Bands";
  if (["cable", "machine", "e-z curl bar"].includes(equipment)) return "Cable/Machine";
  return "Other";
};

const mapBodyweightSubcategory = ({ name, primaryMuscles }) => {
  const muscles = (primaryMuscles || []).map((muscle) => muscle.toLowerCase());
  const hasUpper = muscles.some((muscle) => UPPER_BODY_MUSCLES.has(muscle));
  const hasLower = muscles.some((muscle) => LOWER_BODY_MUSCLES.has(muscle));
  const hasCore = muscles.some((muscle) => CORE_MUSCLES.has(muscle));
  const lowered = name.toLowerCase();

  if (hasUpper && hasLower) return "Full Body";
  if (hasCore) return "Core";
  if (hasLower) return "Lower Body";
  if (hasUpper) return "Upper Body";
  if (/(burpee|mountain|bear crawl|inchworm)/.test(lowered)) return "Full Body";
  return "Full Body";
};

const mapCardioSubcategory = ({ name }) => {
  const lowered = name.toLowerCase();
  if (/(run|running|jog|treadmill|walk|trail)/.test(lowered)) return "Running/Walking";
  if (/(bike|bicycling|cycling)/.test(lowered)) return "Cycling";
  if (/(row|rowing)/.test(lowered)) return "Rowing";
  if (/(jump|skipping|rope|sprint|hop|agility|shuffle)/.test(lowered)) return "Jumps/Agility";
  return "Other";
};

const mapSportsSubcategory = ({ name }) => {
  const lowered = name.toLowerCase();
  if (/(throw|pass|slam|shot)/.test(lowered)) return "Throws";
  if (/(jump|hop|bound|leap|depth jump|box jump)/.test(lowered)) return "Jumps";
  if (/(sprint|shuffle|drill|agility|quick step|skating|carioca|cone)/.test(lowered)) {
    return "Agility/Speed";
  }
  if (/(carry|sled|prowler|yoke|farmer|walk)/.test(lowered)) return "Carries/Drills";
  return "Other";
};

const mapMobilitySubcategory = ({ name, equipment }) => {
  const lowered = name.toLowerCase();
  if (equipment === "foam roll" || lowered.includes("smr")) return "SMR/Foam Roll";
  if (lowered.includes("stretch")) return "Stretching";
  return "Activation/Corrective";
};

const mapMovementPattern = ({ name }) => {
  const lowered = name.toLowerCase();
  if (lowered.includes("squat")) return "squat";
  if (lowered.includes("deadlift")) return "hinge";
  if (lowered.includes("lunge")) return "lunge";
  if (/(press|push-up|pushups|bench)/.test(lowered)) return "push";
  if (/(row|pull|pulldown|chin)/.test(lowered)) return "pull";
  if (lowered.includes("curl")) return "curl";
  if (lowered.includes("extension")) return "extension";
  if (/(rotation|twist)/.test(lowered)) return "rotation";
  if (/(jump|hop|plyo)/.test(lowered)) return "plyometric";
  if (/(carry|walk)/.test(lowered)) return "carry";
  if (lowered.includes("stretch")) return "mobility";
  return "other";
};

const exercises = [];

for (const entry of fs.readdirSync(ROOT)) {
  const filePath = path.join(ROOT, entry, "exercise.json");
  if (!fs.existsSync(filePath)) continue;
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const name = normalizeName(data.name || entry);
  const rawCategory = data.category || "strength";
  const equipment = data.equipment || "other";
  const category = mapCategory({ rawCategory, equipment, name });
  let subcategory = "Other";

  if (category === "Strength") {
    subcategory = mapStrengthSubcategory({ rawCategory, equipment });
  } else if (category === "Bodyweight") {
    subcategory = mapBodyweightSubcategory({ name, primaryMuscles: data.primaryMuscles || [] });
  } else if (category === "Cardio") {
    subcategory = mapCardioSubcategory({ name });
  } else if (category === "Sports") {
    subcategory = mapSportsSubcategory({ name });
  } else if (category === "Mobility / Rehab") {
    subcategory = mapMobilitySubcategory({ name, equipment });
  }

  exercises.push({
    id: entry,
    name,
    aliases: buildAliases(name, entry),
    category,
    subcategory,
    movement_pattern: mapMovementPattern({ name }),
  });
}

exercises.sort((a, b) => a.name.localeCompare(b.name));

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, JSON.stringify(exercises, null, 2) + "\n");

console.log(`Wrote ${exercises.length} exercises to ${OUTPUT}`);
