export function Inter(options?: { subsets?: string[]; variable?: string; display?: string }) {
  return {
    className: 'font-sans',
    variable: options?.variable || '--font-inter',
  };
}

export function Plus_Jakarta_Sans(options?: { subsets?: string[]; variable?: string; display?: string }) {
  return {
    className: 'font-sans',
    variable: options?.variable || '--font-jakarta',
  };
}
