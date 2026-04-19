import { Language } from "./patterns";

export type TestCase = {
  args: unknown[];
  expected: unknown;
  label?: string;
  normalize?: (r: unknown) => unknown; // optional result normalizer before comparison
};

export type Question = {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  scenario: string;
  prompt: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  testCases: TestCase[];
  functionName: string;
  starterCode: Record<Language, string>;
};

const sortArr = (r: unknown) => (Array.isArray(r) ? [...r].sort((a, b) => a - b) : r);

export const QUESTIONS: Question[] = [
  {
    id: "robot-charge-order",
    title: "Robot Charge Order",
    difficulty: "medium",
    category: "Sorting",
    scenario:
      "You're managing a fleet of robots at a charging station. Each robot has a different battery level, stored as a number in an array — but they're not in any order. The charging protocol requires robots be charged from lowest to highest battery. Return the order to charge them as their original positions (indices) in the array, not the sorted values themselves.",
    prompt:
      "Given an array of numbers, return an array of the original indices sorted by their values ascending.",
    examples: [
      {
        input: "chargeOrder([40, 10, 30, 20])",
        output: "[1, 3, 2, 0]",
        explanation:
          "10 is smallest (was at index 1), then 20 (index 3), then 30 (index 2), then 40 (index 0).",
      },
      {
        input: "chargeOrder([5, 3, 1, 4, 2])",
        output: "[2, 4, 1, 3, 0]",
        explanation:
          "1 was at index 2, 2 at index 4, 3 at index 1, 4 at index 3, 5 at index 0.",
      },
    ],
    testCases: [
      { args: [[40, 10, 30, 20]], expected: [1, 3, 2, 0] },
      { args: [[5, 3, 1, 4, 2]], expected: [2, 4, 1, 3, 0] },
      { args: [[1]], expected: [0], label: "single element" },
      { args: [[3, 1, 2]], expected: [1, 2, 0] },
      { args: [[100, 50, 75, 25]], expected: [3, 1, 2, 0] },
    ],
    functionName: "chargeOrder",
    starterCode: {
      javascript: `function chargeOrder(chargers) {\n  // your code here\n}`,
      python: `def chargeOrder(chargers):\n    # your code here\n    pass`,
    },
  },
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "easy",
    category: "Arrays",
    scenario:
      "Classic. You have a list of numbers and a target. Find the two numbers that add up to the target and return their indices. You may assume exactly one solution always exists.",
    prompt:
      "Given an array of integers and a target, return the indices of the two numbers that add up to the target.",
    examples: [
      {
        input: "twoSum([2, 7, 11, 15], 9)",
        output: "[0, 1]",
        explanation: "nums[0] + nums[1] = 2 + 7 = 9",
      },
      {
        input: "twoSum([3, 2, 4], 6)",
        output: "[1, 2]",
        explanation: "nums[1] + nums[2] = 2 + 4 = 6",
      },
    ],
    testCases: [
      { args: [[2, 7, 11, 15], 9], expected: [0, 1], normalize: sortArr },
      { args: [[3, 2, 4], 6], expected: [1, 2], normalize: sortArr },
      { args: [[3, 3], 6], expected: [0, 1], normalize: sortArr },
      { args: [[1, 8, 3, 6], 9], expected: [0, 1], normalize: sortArr, label: "1+8=9" },
      { args: [[4, 5, 2, 7], 9], expected: [0, 3], normalize: sortArr, label: "4+7=9" },
    ],
    functionName: "twoSum",
    starterCode: {
      javascript: `function twoSum(nums, target) {\n  // your code here\n}`,
      python: `def twoSum(nums, target):\n    # your code here\n    pass`,
    },
  },
  {
    id: "first-unique-char",
    title: "First Unique Character",
    difficulty: "easy",
    category: "Strings",
    scenario:
      "You're building a text validation tool. Given a string, find the first character that appears only once and return its index. If every character repeats, return -1.",
    prompt:
      "Given a string, return the index of the first non-repeating character, or -1 if none exists.",
    examples: [
      {
        input: `firstUniqueChar("leetcode")`,
        output: "0",
        explanation: '"l" appears once and is first.',
      },
      {
        input: `firstUniqueChar("loveleetcode")`,
        output: "2",
        explanation: '"v" is the first character that appears only once.',
      },
      {
        input: `firstUniqueChar("aabb")`,
        output: "-1",
        explanation: "Every character repeats.",
      },
    ],
    testCases: [
      { args: ["leetcode"], expected: 0 },
      { args: ["loveleetcode"], expected: 2 },
      { args: ["aabb"], expected: -1 },
      { args: ["z"], expected: 0, label: "single char" },
      { args: ["aabbcc"], expected: -1 },
      { args: ["abcabc"], expected: -1 },
      { args: ["abac"], expected: 1, label: "b is first unique" },
    ],
    functionName: "firstUniqueChar",
    starterCode: {
      javascript: `function firstUniqueChar(s) {\n  // your code here\n}`,
      python: `def firstUniqueChar(s):\n    # your code here\n    pass`,
    },
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "medium",
    category: "Stacks",
    scenario:
      "You're writing a code linter that checks bracket matching. Given a string containing only '(', ')', '{', '}', '[', ']', determine if the brackets are valid — every opening bracket must be closed by the same type, in the correct order.",
    prompt:
      "Given a string of brackets, return true if it is valid, false otherwise.",
    examples: [
      { input: `isValid("()")`, output: "true" },
      { input: `isValid("()[]{}")`, output: "true" },
      { input: `isValid("(]")`, output: "false" },
      {
        input: `isValid("{[]}")`,
        output: "true",
        explanation: "Nested brackets still valid.",
      },
    ],
    testCases: [
      { args: ["()"], expected: true },
      { args: ["()[]{}"], expected: true },
      { args: ["(]"], expected: false },
      { args: ["{[]}"], expected: true },
      { args: ["([)]"], expected: false },
      { args: ["{"], expected: false, label: "unclosed" },
      { args: [""], expected: true, label: "empty string" },
    ],
    functionName: "isValid",
    starterCode: {
      javascript: `function isValid(s) {\n  // your code here\n}`,
      python: `def isValid(s):\n    # your code here\n    pass`,
    },
  },
];

export const QUESTION_CATEGORIES = [...new Set(QUESTIONS.map((q) => q.category))];
