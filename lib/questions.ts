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
  solution: Record<Language, string>;
  solutionExplanation: string;
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
    solution: {
      javascript: `function chargeOrder(chargers) {\n  return chargers\n    .map((val, idx) => ({ val, idx }))\n    .sort((a, b) => a.val - b.val)\n    .map(({ idx }) => idx);\n}`,
      python: `def chargeOrder(chargers):\n    indexed = sorted(enumerate(chargers), key=lambda x: x[1])\n    return [i for i, v in indexed]`,
    },
    solutionExplanation: `The key insight: you need to sort by value but return the original indices, not the values themselves.\n\nStep 1 — pair each value with its index so you don't lose track of where it came from.\nStep 2 — sort those pairs by value (ascending).\nStep 3 — pull out just the indices in that sorted order.\n\nIn JS: .map() to pair, .sort() to order, .map() again to extract.\nIn Python: enumerate() gives you index+value pairs, sorted() with a key orders them, then a list comp extracts the indices.`,
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
    solution: {
      javascript: `function twoSum(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (seen.has(complement)) {\n      return [seen.get(complement), i];\n    }\n    seen.set(nums[i], i);\n  }\n}`,
      python: `def twoSum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        complement = target - n\n        if complement in seen:\n            return [seen[complement], i]\n        seen[n] = i`,
    },
    solutionExplanation: `The brute force is two nested loops (O(n²)) — check every pair. That works but is too slow for interviews.\n\nThe optimal approach uses a hash map (O(n)):\n\nAs you walk through the array, for each number ask: "have I already seen the number I need to pair with this?" That needed number is target - current.\n\nIf it's in the map, you found your pair — return both indices.\nIf not, store the current number and its index in the map for future lookups.\n\nYou only need one pass through the array. The map gives you O(1) lookups.`,
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
    solution: {
      javascript: `function firstUniqueChar(s) {\n  const count = {};\n  for (const c of s) {\n    count[c] = (count[c] || 0) + 1;\n  }\n  for (let i = 0; i < s.length; i++) {\n    if (count[s[i]] === 1) return i;\n  }\n  return -1;\n}`,
      python: `def firstUniqueChar(s):\n    from collections import Counter\n    count = Counter(s)\n    for i, c in enumerate(s):\n        if count[c] == 1:\n            return i\n    return -1`,
    },
    solutionExplanation: `Two passes, one hash map.\n\nPass 1 — count how many times each character appears. Store in an object/dict.\nPass 2 — walk the string again in order. The first character whose count is exactly 1 is your answer. Return its index.\n\nIf you finish pass 2 without finding one, return -1.\n\nThe order of pass 2 matters — it preserves the original left-to-right order so you always return the earliest unique character, not just any unique character.`,
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
    solution: {
      javascript: `function isValid(s) {\n  const stack = [];\n  const map = { ')': '(', ']': '[', '}': '{' };\n  for (const c of s) {\n    if ('([{'.includes(c)) {\n      stack.push(c);\n    } else {\n      if (stack.pop() !== map[c]) return false;\n    }\n  }\n  return stack.length === 0;\n}`,
      python: `def isValid(s):\n    stack = []\n    mapping = {')': '(', ']': '[', '}': '{'}\n    for c in s:\n        if c in '([{':\n            stack.append(c)\n        elif not stack or stack.pop() != mapping[c]:\n            return False\n    return not stack`,
    },
    solutionExplanation: `Classic stack problem.\n\nThe rule: every closing bracket must match the most recently opened bracket. That "most recently opened" part is exactly what a stack gives you.\n\nWalk the string:\n— If it's an opening bracket ( [ { → push it onto the stack.\n— If it's a closing bracket ) ] } → pop the top of the stack and check if it matches. If it doesn't, return false immediately.\n\nAt the end, the stack should be empty. If there's anything left, some bracket was never closed.\n\nThe map object is just a lookup: closing bracket → what its matching opener should be.`,
  },
];

export const QUESTION_CATEGORIES = [...new Set(QUESTIONS.map((q) => q.category))];
