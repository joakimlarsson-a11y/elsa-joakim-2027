import { firstNames, soloFirstName } from "./site";

type HeroCopyInput = {
  guestNames: string[];
  groupName: string;
  responded: boolean;
  thankYou: boolean;
};

/** Texterna i startsidans hero för en inbjudan. Delas med förhandsvisningen i admin. */
export function heroCopy({ guestNames, groupName, responded, thankYou }: HeroCopyInput) {
  const solo = Boolean(soloFirstName(guestNames));
  const names = firstNames(guestNames) ?? (groupName.trim() || null);
  const youAll = solo ? "du" : "ni";
  const salutation = thankYou ? (names ? `Tack, ${names}!` : "Tack för att ni firade med oss!") : names ? `Kära ${names},` : null;
  const intro = `Vi förnyar våra löften i Ölmevalla Kyrka och firar sedan vid havet på Långedrags Värdshus. ${names ? `Vi vill så gärna att ${youAll} är med.` : "Varmt välkomna!"}`;
  const ctaLabel = responded ? `${solo ? "Du" : "Ni"} har svarat. Ändra svaret` : solo ? "Svara på inbjudan" : names ? `Svara för ${names}` : "OSA här";
  return { solo, names, youAll, salutation, intro, ctaLabel };
}
