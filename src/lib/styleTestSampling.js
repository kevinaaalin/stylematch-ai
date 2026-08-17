export function createStyleTestQuestionSet(manifest, random = Math.random) {
  const smallestVariantCount = Math.min(...manifest.map((item) => item.variants?.length || 1));
  const variantSlots = Array.from({ length: smallestVariantCount }, (_, index) => index);
  for (let index = variantSlots.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.min(index, Math.floor(random() * (index + 1)));
    [variantSlots[index], variantSlots[swapIndex]] = [variantSlots[swapIndex], variantSlots[index]];
  }

  const questions = manifest.map((item, itemIndex) => {
    const variants = item.variants?.length ? item.variants : [item.src];
    const variantBlockCount = Math.max(1, Math.ceil(variants.length / smallestVariantCount));
    const variantBlock = Math.min(variantBlockCount - 1, Math.floor(random() * variantBlockCount));
    const selectedIndex = (variantSlots[itemIndex % variantSlots.length] + (variantBlock * smallestVariantCount)) % variants.length;
    return { ...item, fallback_src: item.src, src: variants[selectedIndex], selected_variant_index: selectedIndex };
  });

  for (let index = questions.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.min(index, Math.floor(random() * (index + 1)));
    [questions[index], questions[swapIndex]] = [questions[swapIndex], questions[index]];
  }

  return questions;
}
