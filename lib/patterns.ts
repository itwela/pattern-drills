export type Language = "javascript" | "python";

export type Pattern = {
  id: string;
  name: string;
  description: string;
  code: Record<Language, string>;
  category: string;
};

export const PATTERNS: Pattern[] = [
  {
    id: "for-classic",
    name: "Classic for loop",
    description: "Full control over the counter",
    category: "Loops",
    code: {
      javascript: `for (let i = 0; i < items.length; i++) {}`,
      python: `for i in range(len(items)):`,
    },
  },
  {
    id: "for-of",
    name: "for...of / for-in loop",
    description: "Loop over every item in a list",
    category: "Loops",
    code: {
      javascript: `for (const item of items) {}`,
      python: `for item in items:`,
    },
  },
  {
    id: "for-of-entries",
    name: "Loop with index",
    description: "Loop with both index and value",
    category: "Loops",
    code: {
      javascript: `for (const [index, item] of items.entries()) {}`,
      python: `for index, item in enumerate(items):`,
    },
  },
  {
    id: "while",
    name: "While loop",
    description: "Keep going while a condition is true",
    category: "Loops",
    code: {
      javascript: `while (condition) {}`,
      python: `while condition:`,
    },
  },
  {
    id: "arrow-fn",
    name: "Function definition",
    description: "Define a reusable function",
    category: "Functions",
    code: {
      javascript: `const greet = (name) => {\n  return \`Hello, \${name}\`;\n};`,
      python: `def greet(name):\n    return f"Hello, {name}"`,
    },
  },
  {
    id: "array-map",
    name: "Map / list comprehension",
    description: "Transform every item in a list",
    category: "Arrays",
    code: {
      javascript: `const result = items.map((item) => {\n  return item;\n});`,
      python: `result = [item for item in items]`,
    },
  },
  {
    id: "array-filter",
    name: "Filter",
    description: "Keep only items that pass a test",
    category: "Arrays",
    code: {
      javascript: `const result = items.filter((item) => {\n  return item > 0;\n});`,
      python: `result = [item for item in items if item > 0]`,
    },
  },
  {
    id: "if-else",
    name: "If / else",
    description: "Branch based on a condition",
    category: "Control Flow",
    code: {
      javascript: `if (condition) {} else {}`,
      python: `if condition:\nelse:`,
    },
  },
  {
    id: "destructure-obj",
    name: "Unpack / destructure",
    description: "Pull values out of an object or tuple",
    category: "Syntax",
    code: {
      javascript: `const { name, age } = person;`,
      python: `name, age = person`,
    },
  },
  {
    id: "spread",
    name: "Spread / unpack list",
    description: "Copy and merge arrays or lists",
    category: "Syntax",
    code: {
      javascript: `const merged = [...arr1, ...arr2];`,
      python: `merged = [*arr1, *arr2]`,
    },
  },
  {
    id: "ternary",
    name: "Ternary / inline if",
    description: "One-line if/else",
    category: "Syntax",
    code: {
      javascript: `const label = isActive ? "on" : "off";`,
      python: `label = "on" if is_active else "off"`,
    },
  },
];

export const CATEGORIES = [...new Set(PATTERNS.map((p) => p.category))];
