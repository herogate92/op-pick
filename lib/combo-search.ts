const aliases: Record<string, string[]> = {
  cassidy: ["맥크리", "멕크리", "석양", "mccree"], lifeweaver: ["위버"],
  "jetpack-cat": ["냥", "고양이", "제트팩캣"], bastion: ["바스"],
  reinhardt: ["라인"], mercy: ["메르시", "파르시"], pharah: ["파르시"],
  dva: ["디바", "d.va"], "soldier-76": ["솔저", "솔져", "soldier76"],
};
export function heroSearchTerms(key: string, name: string) { return [key, name, ...(aliases[key] ?? [])].join(" "); }
export function matchesCombo(card: { searchText: string; heroes: string[]; category: string; modes?: string[] }, query: string, hero: string, category: string, mode?: string) {
  const normalize = (text: string) => text.toLocaleLowerCase("ko").replace(/[\s.\-:]/g, "");
  return (!mode || Boolean(card.modes?.includes(mode))) && (!hero || card.heroes.includes(hero)) && (!category || card.category === category) && query.trim().split(/\s+/).every(term => normalize(card.searchText).includes(normalize(term)));
}
